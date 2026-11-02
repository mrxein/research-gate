import type { Paper } from "./types";
export const DIMS: { key: string; label: string; get: (p: Paper) => string[] }[] = [
  { key: "problem", label: "Research problem", get: p => [p.problem] },
  { key: "methodology", label: "Methodology", get: p => [p.methodology] },
  { key: "datasets", label: "Datasets", get: p => p.datasets },
  { key: "partition", label: "IID / Non-IID", get: p => p.partition },
  { key: "flAlgorithms", label: "FL algorithms", get: p => p.flAlgorithms },
  { key: "xaiMethods", label: "XAI methods", get: p => p.xaiMethods },
  { key: "metrics", label: "Evaluation metrics", get: p => p.metrics },
  { key: "results", label: "Results", get: p => [p.results] },
  { key: "limitations", label: "Limitations", get: p => p.limitations.map(l => l.text) },
  { key: "futureWork", label: "Future work", get: p => p.futureWork },
];
// Items present in some, but not all, of the given papers are "differences".
export function differing(rows: string[][]): Set<string> {
  const all = new Set(rows.flat());
  return new Set([...all].filter(v => !rows.every(r => r.includes(v))));
}
