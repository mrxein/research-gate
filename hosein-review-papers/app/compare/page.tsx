"use client";
import { useState } from "react";
import { useWorkspace } from "@/lib/workspace";
import { DIMS, differing } from "@/lib/dimensions";
import { download, toCSV, toMarkdownTable } from "@/lib/export";
import DimPicker from "@/components/DimPicker";
import { Page } from "@/components/ui";
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
      sub="Select two or more papers. Amber items appear in some selected papers but not all."
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
                            <span
                              key={x}
                              className={
                                diff.has(x)
                                  ? "rounded bg-amber-100 px-1.5 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
                                  : ""
                              }
                            >
                              {x}
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
