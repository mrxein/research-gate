"use client";
import Link from "next/link";
import { useState } from "react";
import { useWorkspace } from "@/lib/workspace";
import { DIMS } from "@/lib/dimensions";
import { download, toCSV, toMarkdownTable } from "@/lib/export";
import DimPicker from "@/components/DimPicker";
import { Page, StatusBadge } from "@/components/ui";
export default function Matrix() {
  const { papers, statusOf } = useWorkspace();
  const [dims, setDims] = useState([
    "datasets",
    "partition",
    "flAlgorithms",
    "xaiMethods",
    "metrics",
  ]);
  const cols = DIMS.filter((d) => dims.includes(d.key));
  const table = [
    ["Paper", "Year", "Status", ...cols.map((c) => c.label)],
    ...papers.map((p) => [
      p.title,
      String(p.year),
      statusOf(p.id),
      ...cols.map((c) => c.get(p).join("; ")),
    ]),
  ];
  return (
    <Page
      title="Research Matrix"
      sub="All papers across the dimensions you choose."
      actions={
        <>
          <button
            className="btn"
            onClick={() => download("matrix.csv", toCSV(table), "text/csv")}
          >
            Export CSV
          </button>
          <button
            className="btn"
            onClick={() =>
              download("matrix.md", toMarkdownTable(table), "text/markdown")
            }
          >
            Export Markdown
          </button>
        </>
      }
    >
      <div className="mb-4">
        <DimPicker value={dims} onChange={setDims} />
      </div>
      <div className="card overflow-x-auto p-0">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/40">
            <tr>
              <th className="p-2">Paper</th>
              <th className="p-2">Status</th>
              {cols.map((c) => (
                <th key={c.key} className="p-2">
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {papers.map((p) => (
              <tr
                key={p.id}
                className="border-t border-slate-200 align-top dark:border-slate-700/60"
              >
                <td className="p-2">
                  <Link
                    className="text-tide underline"
                    href={`/papers/${p.id}`}
                  >
                    {p.title}
                  </Link>
                </td>
                <td className="p-2">
                  <StatusBadge s={statusOf(p.id)} />
                </td>
                {cols.map((c) => (
                  <td key={c.key} className="p-2">
                    {c.get(p).join("; ")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );
}
