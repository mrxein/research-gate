"use client";
import Link from "next/link";
import { useState } from "react";
import { useWorkspace } from "@/lib/workspace";
import { detectGaps } from "@/lib/gaps";
import { download, toCSV } from "@/lib/export";
import { Page } from "@/components/ui";
export default function Gaps() {
  const { papers, ws, update } = useWorkspace();
  const gaps = detectGaps(papers);
  const validated = (id: string) => id in ws.validated;
  const [gid, setGid] = useState("");
  const [ctx, setCtx] = useState("");
  const [fx, setFx] = useState("");
  const [out, setOut] = useState("");
  const gap = gaps.find((g) => g.id === gid);
  const draft = gap
    ? `How does ${fx || "[approach]"} address "${gap.title}" in ${ctx || "[context]"}, measured by ${out || "[outcome]"}?`
    : "";
  const status = (id: string) =>
    validated(id) ? "Manually validated" : "Auto-detected (unvalidated)";
  const md = () =>
    [
      "# Research gap report",
      "",
      "> Auto-detected items are heuristic patterns over the local paper set, not literature-confirmed gaps.",
      "",
      ...gaps.flatMap((g) => [
        `## ${g.title}`,
        `- Type: ${g.kind}`,
        `- Status: ${status(g.id)}`,
        `- Supporting papers: ${g.papers.join(", ")}`,
        ...(validated(g.id)
          ? [`- Validation note: ${ws.validated[g.id]}`]
          : []),
        "",
      ]),
      "## Research questions",
      ...ws.questions.map((q) => `- ${q}`),
    ].join("\n");
  return (
    <Page
      title="Research Gaps"
      sub="Candidate gaps found by pattern matching across your papers."
      actions={
        <>
          <button
            className="btn"
            onClick={() =>
              download(
                "gaps.csv",
                toCSV([
                  ["Gap", "Type", "Status", "Papers", "Validation note"],
                  ...gaps.map((g) => [
                    g.title,
                    g.kind,
                    status(g.id),
                    g.papers.join("; "),
                    ws.validated[g.id] ?? "",
                  ]),
                ]),
                "text/csv",
              )
            }
          >
            Export CSV
          </button>
          <button
            className="btn"
            onClick={() => download("gaps.md", md(), "text/markdown")}
          >
            Export Markdown
          </button>
        </>
      }
    >
      <div
        role="note"
        className="mb-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-100"
      >
        These are automatically detected patterns in {papers.length} local
        papers. None is a confirmed gap until you check the wider literature and
        record a validation note.
      </div>
      <div className="grid gap-3">
        {gaps.map((g) => (
          <article key={g.id} className="card">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="font-serif text-lg font-semibold">{g.title}</h3>
                <p className="text-xs text-slate-500">{g.kind}</p>
              </div>
              <span
                className={`rounded px-2 py-0.5 text-xs ${validated(g.id) ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200" : "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"}`}
              >
                {status(g.id)}
              </span>
            </div>
            <ul className="mt-2 list-disc pl-5 text-sm">
              {g.evidence.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              Supporting papers:{" "}
              {g.papers.map((id) => (
                <Link
                  key={id}
                  className="text-tide underline"
                  href={`/papers/${id}`}
                >
                  {id}
                </Link>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                className="input min-w-[12rem] flex-1"
                placeholder="Validation note (search queries, sources checked)"
                defaultValue={ws.validated[g.id] ?? ""}
                onBlur={(e) =>
                  update((w) => {
                    const v = { ...w.validated };
                    e.target.value.trim()
                      ? (v[g.id] = e.target.value.trim())
                      : delete v[g.id];
                    return { ...w, validated: v };
                  })
                }
              />
              <button className="btn" onClick={() => setGid(g.id)}>
                Use in question builder
              </button>
            </div>
          </article>
        ))}
      </div>
      <section className="card mt-8">
        <h2 className="h2 mb-3">Research question builder</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <select
            className="input sm:col-span-2"
            aria-label="Gap"
            value={gid}
            onChange={(e) => setGid(e.target.value)}
          >
            <option value="">Choose a gap</option>
            {gaps.map((g) => (
              <option key={g.id} value={g.id}>
                {g.title}
              </option>
            ))}
          </select>
          <input
            className="input"
            placeholder="Context (e.g. cross-silo healthcare FL)"
            value={ctx}
            onChange={(e) => setCtx(e.target.value)}
          />
          <input
            className="input"
            placeholder="Proposed approach"
            value={fx}
            onChange={(e) => setFx(e.target.value)}
          />
          <input
            className="input sm:col-span-2"
            placeholder="Outcome / metric"
            value={out}
            onChange={(e) => setOut(e.target.value)}
          />
        </div>
        {gap && (
          <p className="mt-3 rounded bg-slate-100 p-3 text-sm dark:bg-slate-800/60">
            {draft}
            {!validated(gap.id) && (
              <span className="block text-xs text-amber-700 dark:text-amber-300">
                Based on an unvalidated gap.
              </span>
            )}
          </p>
        )}
        <button
          className="btn-primary mt-3"
          disabled={!gap}
          onClick={() => {
            update((w) => ({ ...w, questions: [...w.questions, draft] }));
          }}
        >
          Save question
        </button>
        <ul className="mt-3 space-y-1 text-sm">
          {ws.questions.map((q, i) => (
            <li key={i}>
              {q}{" "}
              <button
                className="text-xs text-red-600"
                onClick={() =>
                  update((w) => ({
                    ...w,
                    questions: w.questions.filter((_, j) => j !== i),
                  }))
                }
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  );
}
