import { supabase as sb } from "./supabase";
import type { WS } from "./types";

export async function loadWorkspace(): Promise<WS> {
  const [up, ev, gv, rq] = await Promise.all([
    sb.from("user_papers").select("*"),
    sb.from("evidence").select("*").order("created_at"),
    sb.from("gap_validations").select("*"),
    sb.from("research_questions").select("*").order("position"),
  ]);
  const [gr, gm] = await Promise.all([
    sb.from("paper_groups").select("*").order("position"),
    sb.from("paper_group_members").select("*"),
  ]);
  const ws: WS = {
    status: {},
    notes: {},
    tags: {},
    evidence: {},
    validated: {},
    questions: [],
    groups: [],
    assign: {},
  };
  up.data?.forEach((r) => {
    ws.status[r.paper_id] = r.status;
    ws.notes[r.paper_id] = r.notes;
    ws.tags[r.paper_id] = r.tags;
  });
  ev.data?.forEach((r) =>
    (ws.evidence[r.paper_id] ??= []).push({
      id: r.id,
      page: r.page,
      section: r.section,
      ref: r.fig_ref,
      quote: r.quote,
    }),
  );
  gv.data?.forEach((r) => {
    ws.validated[r.gap_id] = r.note;
  });
  rq.data?.forEach((r) => ws.questions.push(r.text));
  gr.data?.forEach((r) => ws.groups.push({ id: r.id, name: r.name }));
  gm.data?.forEach((r) => {
    ws.assign[r.paper_id] = r.group_id;
  });
  return ws;
}

export async function syncWorkspace(uid: string, a: WS, b: WS) {
  const ids = new Set([
    ...Object.keys(b.status),
    ...Object.keys(b.notes),
    ...Object.keys(b.tags),
  ]);
  const rows = [...ids]
    .filter(
      (id) =>
        a.status[id] !== b.status[id] ||
        a.notes[id] !== b.notes[id] ||
        a.tags[id] !== b.tags[id],
    )
    .map((id) => ({
      user_id: uid,
      paper_id: id,
      status: b.status[id] ?? "Unread",
      notes: b.notes[id] ?? "",
      tags: b.tags[id] ?? [],
      updated_at: new Date().toISOString(),
    }));
  if (rows.length) ok(await sb.from("user_papers").upsert(rows));

  const flat = (w: WS) =>
    Object.entries(w.evidence).flatMap(([pid, l]) =>
      l.map((e) => ({ ...e, paper_id: pid })),
    );
  const A = new Map(flat(a).map((e) => [e.id, e])),
    B = new Map(flat(b).map((e) => [e.id, e]));
  const added = [...B.values()]
    .filter((e) => !A.has(e.id))
    .map((e) => ({
      id: e.id,
      user_id: uid,
      paper_id: e.paper_id,
      page: e.page,
      section: e.section,
      fig_ref: e.ref,
      quote: e.quote,
    }));
  const removed = [...A.keys()].filter((id) => !B.has(id));
  if (added.length) ok(await sb.from("evidence").insert(added));
  if (removed.length) ok(await sb.from("evidence").delete().in("id", removed));

  for (const [g, note] of Object.entries(b.validated))
    if (a.validated[g] !== note)
      ok(
        await sb
          .from("gap_validations")
          .upsert({ user_id: uid, gap_id: g, note }),
      );
  for (const g of Object.keys(a.validated))
    if (!(g in b.validated))
      ok(await sb.from("gap_validations").delete().eq("gap_id", g));

  if (JSON.stringify(a.questions) !== JSON.stringify(b.questions)) {
    ok(await sb.from("research_questions").delete().eq("user_id", uid));
    if (b.questions.length)
      ok(
        await sb.from("research_questions").insert(
          b.questions.map((text, position) => ({
            user_id: uid,
            position,
            text,
          })),
        ),
      );
  }
  // groups: create/rename/reorder, then delete removed ones
  const sig = (w: WS) =>
    new Map(w.groups.map((g, i) => [g.id, `${i}|${g.name}`]));
  const ga = sig(a),
    gb = sig(b);
  const gUp = b.groups
    .map((g, i) => ({ id: g.id, user_id: uid, name: g.name, position: i }))
    .filter((r) => ga.get(r.id) !== gb.get(r.id));
  if (gUp.length) ok(await sb.from("paper_groups").upsert(gUp));

  // memberships: add or move, then remove
  const mUp = Object.entries(b.assign)
    .filter(([p, g]) => a.assign[p] !== g)
    .map(([paper_id, group_id]) => ({ user_id: uid, paper_id, group_id }));
  if (mUp.length) ok(await sb.from("paper_group_members").upsert(mUp));

  const mDel = Object.keys(a.assign).filter((p) => !(p in b.assign));
  if (mDel.length)
    ok(await sb.from("paper_group_members").delete().in("paper_id", mDel));

  const gDel = a.groups.filter((g) => !gb.has(g.id)).map((g) => g.id);
  if (gDel.length) ok(await sb.from("paper_groups").delete().in("id", gDel));
}

function ok<T extends { error: { message: string } | null }>(r: T): T {
  if (r.error) throw new Error(r.error.message);
  return r;
}
