"use client";
import { useState } from "react";
import { useWorkspace } from "@/lib/workspace";
import { DIMS, differing } from "@/lib/dimensions";
import { download, toCSV, toMarkdownTable } from "@/lib/export";
import DimPicker from "@/components/DimPicker";
import { Page } from "@/components/ui";

const STOP = new Set(["and", "the", "for", "with", "via", "based"]);

const tokenize = (s: string) =>
  new Set(
    s
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((t) => t.length > 2 && !STOP.has(t)),
  );

// For each paper's cell: item -> the words it shares with other papers' items.
function sharedWords(vals: string[][], diff: Set<string>) {
  const toks = vals.map((cell) => cell.map((x) => [x, tokenize(x)] as const));
  return vals.map((cell, i) => {
    const out = new Map<string, Set<string>>();
    for (const [x, tx] of toks[i]) {
      if (!diff.has(x)) continue;
      const shared = new Set<string>();
      toks.forEach((other, j) => {
        if (j === i) return;
        other.forEach(([, ty]) =>
          tx.forEach((t) => ty.has(t) && shared.add(t)),
        );
      });
      if (shared.size) out.set(x, shared);
    }
    return out;
  });
}

function Highlighted({ text, words }: { text: string; words?: Set<string> }) {
  if (!words) return <>{text}</>;
  return (
    <>
      {text.split(/([a-z0-9]+)/i).map((part, k) =>
        words.has(part.toLowerCase()) ? (
          <mark
            key={k}
            className="rounded bg-amber-100 px-0.5 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

export default function Compare() {
  const { papers } = useWorkspace();
  const [sel, setSel] = useState<string[]>([]);
  const [dims, setDims] = useState([
    "datasets",
    "partition",
    "flAlgorithms",
    "xaiMethods",
    "metrics",
    "results",
  ]);
  const chosen = papers.filter((p) => sel.includes(p.id));
  const rows = DIMS.filter((d) => dims.includes(d.key));
  const table = [
    ["Dimension", ...chosen.map((p) => p.title)],
    ...rows.map((d) => [d.label, ...chosen.map((p) => d.get(p).join("; "))]),
  ];
  return (
    <Page
      title="Compare"
      sub="Select two or more papers. Amber words are shared with an item in another selected paper."
      actions={
        chosen.length > 1 && (
          <>
            <button
              className="btn"
              onClick={() =>
                download("comparison.csv", toCSV(table), "text/csv")
              }
            >
              Export CSV
            </button>
            <button
              className="btn"
              onClick={() =>
                download(
                  "comparison.md",
                  toMarkdownTable(table),
                  "text/markdown",
                )
              }
            >
              Export Markdown
            </button>
          </>
        )
      }
    >
      <div className="card mb-4 space-y-3">
        <div>
          <div className="mb-2 text-sm font-medium">Papers</div>
          <div className="flex flex-wrap gap-2">
            {papers.map((p) => (
              <label key={p.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={sel.includes(p.id)}
                  onChange={() =>
                    setSel(
                      sel.includes(p.id)
                        ? sel.filter((x) => x !== p.id)
                        : [...sel, p.id],
                    )
                  }
                />
                {p.title}
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-medium">Dimensions</div>
          <DimPicker value={dims} onChange={setDims} />
        </div>
      </div>
      {chosen.length < 2 ? (
        <p className="card text-sm">
          Select at least two papers to see the comparison.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr>
                <th className="w-36 p-2" />
                {chosen.map((p) => (
                  <th key={p.id} className="p-2 font-serif">
                    {p.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const vals = chosen.map((p) => d.get(p));
                const diff = differing(vals);
                const marks = sharedWords(vals, diff);
                return (
                  <tr
                    key={d.key}
                    className="border-t border-slate-200 align-top dark:border-slate-700/60"
                  >
                    <th className="p-2 font-medium">{d.label}</th>
                    {vals.map((v, i) => (
                      <td key={i} className="p-2">
                        <div className="flex flex-wrap gap-1">
                          {v.map((x) => (
                            <span key={x}>
                              <Highlighted text={x} words={marks[i].get(x)} />
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Page>
  );
}