"use client";
import Link from "next/link";
import { useState } from "react";
import { useWorkspace } from "@/lib/workspace";
import { clusterPapers, defaultWeights } from "@/lib/similarity";
import { download } from "@/lib/export";
import { StatusBadge } from "@/components/ui";

const NONE = "__none";

export default function GroupBoard() {
  const { papers, ws, update, statusOf } = useWorkspace();
  const [over, setOver] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);

  const groupOf = (pid: string) =>
    ws.assign[pid] && ws.groups.some(g => g.id === ws.assign[pid]) ? ws.assign[pid] : NONE;

  const move = (pid: string, gid: string) =>
    update(w => {
      const assign = { ...w.assign };
      if (gid === NONE) delete assign[pid]; else assign[pid] = gid;
      return { ...w, assign };
    });

  const addGroup = () =>
    update(w => ({ ...w, groups: [...w.groups, { id: crypto.randomUUID(), name: `New group ${w.groups.length + 1}` }] }));

  const rename = (id: string, name: string) =>
    update(w => ({ ...w, groups: w.groups.map(g => (g.id === id ? { ...g, name: name.trim() || "Untitled group" } : g)) }));

  const remove = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? Its papers move back to Unassigned.`)) return;
    update(w => ({
      ...w,
      groups: w.groups.filter(g => g.id !== id),
      assign: Object.fromEntries(Object.entries(w.assign).filter(([, g]) => g !== id)),
    }));
  };

  // Optional: pre-fill groups from the automatic similarity clusters (only unassigned papers)
  const suggest = () =>
    update(w => {
      const groups = [...w.groups], assign = { ...w.assign };
      clusterPapers(papers, defaultWeights, 0.25).forEach((c, i) => {
        const ids = c.ids.filter(p => !assign[p]);
        if (ids.length < 2) return;
        const id = crypto.randomUUID();
        groups.push({ id, name: `Suggested group ${i + 1}` });
        ids.forEach(p => (assign[p] = id));
      });
      return { ...w, groups, assign };
    });

  const exportMd = () =>
    download("my-groups.md", [
      "# Paper groups", "",
      ...[...ws.groups, { id: NONE, name: "Unassigned" }].flatMap(g => {
        const items = papers.filter(p => groupOf(p.id) === g.id);
        return items.length ? [`## ${g.name}`, ...items.map(p => `- ${p.title} (${p.year})`), ""] : [];
      }),
    ].join("\n"), "text/markdown");

  const columns = [{ id: NONE, name: "Unassigned" }, ...ws.groups];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button className="btn-primary" onClick={addGroup}>New group</button>
        <button className="btn" onClick={suggest}>Suggest groups</button>
        <button className="btn" onClick={exportMd}>Export Markdown</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {columns.map(col => {
          const items = papers.filter(p => groupOf(p.id) === col.id);
          const isNone = col.id === NONE;
          return (
            <section
              key={col.id}
              onDragOver={e => { e.preventDefault(); setOver(col.id); }}
              onDragLeave={() => setOver(o => (o === col.id ? null : o))}
              onDrop={e => {
                e.preventDefault();
                const pid = e.dataTransfer.getData("text/plain") || dragging;
                if (pid) move(pid, col.id);
                setOver(null); setDragging(null);
              }}
              className={`card min-h-[10rem] transition ${over === col.id ? "border-tide ring-2 ring-tide/40" : ""}`}
              aria-label={col.name}
            >
              <header className="mb-3 flex items-center justify-between gap-2">
                {isNone ? (
                  <h3 className="font-serif text-lg font-semibold">{col.name}</h3>
                ) : (
                  <input
                    key={col.name}
                    defaultValue={col.name}
                    aria-label="Group name"
                    className="input min-w-0 flex-1 font-serif text-base font-semibold"
                    onBlur={e => e.target.value !== col.name && rename(col.id, e.target.value)}
                    onKeyDown={e => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                  />
                )}
                <span className="text-xs text-slate-500">{items.length}</span>
                {!isNone && <button className="text-xs text-red-600" onClick={() => remove(col.id, col.name)}>Delete</button>}
              </header>

              <ul className="space-y-2">
                {items.map(p => (
                  <li
                    key={p.id}
                    draggable
                    onDragStart={e => { e.dataTransfer.setData("text/plain", p.id); e.dataTransfer.effectAllowed = "move"; setDragging(p.id); }}
                    onDragEnd={() => { setDragging(null); setOver(null); }}
                    className={`cursor-grab rounded-md border border-slate-200 bg-white p-2 text-sm active:cursor-grabbing dark:border-slate-700 dark:bg-deep ${dragging === p.id ? "opacity-40" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/papers/${p.id}`} className="font-medium hover:underline">{p.title}</Link>
                      <StatusBadge s={statusOf(p.id)} />
                    </div>
                    <select
                      aria-label={`Move ${p.title} to`}
                      className="input mt-2 w-full py-1 text-xs"
                      value={col.id}
                      onChange={e => move(p.id, e.target.value)}
                    >
                      {columns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </li>
                ))}
              </ul>
              {!items.length && <p className="rounded border border-dashed border-slate-300 p-3 text-center text-xs text-slate-500 dark:border-slate-600">Drag papers here</p>}
            </section>
          );
        })}
      </div>
    </div>
  );
}