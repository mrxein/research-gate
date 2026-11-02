import type { Gap, Paper } from "./types";
const uniq = (a: string[]) => [...new Set(a)];
/** Heuristic pattern detection only. Output is a candidate list, NOT a validated finding. */
export function detectGaps(papers: Paper[]): Gap[] {
  const byTheme = new Map<string, Gap>();
  for (const p of papers) for (const l of p.limitations) {
    const g = byTheme.get(l.theme) ?? { id: "lim-" + l.theme.toLowerCase().replace(/\W+/g, "-"), kind: "Recurring limitation" as const, title: l.theme, papers: [], evidence: [] };
    if (!g.papers.includes(p.id)) g.papers.push(p.id);
    g.evidence.push(`${p.id}: ${l.text}`);
    byTheme.set(l.theme, g);
  }
  const gaps = [...byTheme.values()].filter(g => g.papers.length >= 2);
  const xs = uniq(papers.flatMap(p => p.xaiMethods)), ps = uniq(papers.flatMap(p => p.partition));
  for (const x of xs) for (const part of ps) {
    if (papers.some(p => p.xaiMethods.includes(x) && p.partition.includes(part))) continue;
    const sup = papers.filter(p => p.xaiMethods.includes(x) || p.partition.includes(part)).map(p => p.id);
    gaps.push({ id: `un-${x}-${part}`.toLowerCase().replace(/\W+/g, "-"), kind: "Unexplored combination", title: `${x} under ${part}`, papers: sup, evidence: [`No paper in this collection combines ${x} with ${part}.`] });
  }
  return gaps;
}
