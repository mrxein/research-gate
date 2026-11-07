import type { Paper } from "./types";

export const FEATURES = [
  { key: "datasets", label: "Datasets", w: 2 },
  { key: "partition", label: "IID / Non-IID", w: 1 },
  { key: "flAlgorithms", label: "FL algorithms", w: 2 },
  { key: "xaiMethods", label: "XAI methods", w: 2 },
  { key: "metrics", label: "Metrics", w: 1 },
  { key: "tags", label: "Tags", w: 1 },
  { key: "text", label: "Topic words", w: 1 },
] as const;
export type FeatureKey = (typeof FEATURES)[number]["key"];
export type Weights = Record<FeatureKey, number>;
export const defaultWeights = Object.fromEntries(
  FEATURES.map((f) => [f.key, f.w]),
) as Weights;

const STOP = new Set(
  "with that this from have been into over than then their which under using used also such these those they will each both only more most other some very were what when where while across between within without based paper study approach method methods model models data".split(
    " ",
  ),
);
const norm = (xs: string[]) => new Set(xs.map((x) => x.toLowerCase().trim()));

export function featureSet(p: Paper, k: FeatureKey): Set<string> {
  switch (k) {
    case "datasets":
      return norm(p.datasets);
    case "partition":
      return norm(p.partition);
    case "flAlgorithms":
      return norm(p.flAlgorithms);
    case "xaiMethods":
      return norm(p.xaiMethods);
    case "metrics":
      return norm(p.metrics);
    case "tags":
      return norm(p.tags);
    case "text":
      return new Set(
        (
          `${p.problem} ${p.motivation} ${p.methodology}`
            .toLowerCase()
            .match(/[a-z]{4,}/g) ?? []
        ).filter((w) => !STOP.has(w)),
      );
  }
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0;
  let inter = 0;
  a.forEach((x) => {
    if (b.has(x)) inter++;
  });
  return inter / (a.size + b.size - inter);
}

/** Weighted average of per-feature Jaccard similarity, 0..1. */
export function similarity(a: Paper, b: Paper, w: Weights) {
  let num = 0,
    den = 0;
  for (const f of FEATURES) {
    if (!w[f.key]) continue;
    num += w[f.key] * jaccard(featureSet(a, f.key), featureSet(b, f.key));
    den += w[f.key];
  }
  return den ? num / den : 0;
}

export interface Cluster {
  ids: string[];
  avg: number;
  shared: { label: string; items: string[] }[];
}

/** Average-linkage agglomerative clustering; stops merging below `threshold`. */
export function clusterPapers(
  papers: Paper[],
  w: Weights,
  threshold: number,
): Cluster[] {
  const n = papers.length;
  const S = papers.map((a) => papers.map((b) => similarity(a, b, w)));
  let groups: number[][] = papers.map((_, i) => [i]);
  const link = (x: number[], y: number[]) => {
    let s = 0;
    for (const i of x) for (const j of y) s += S[i][j];
    return s / (x.length * y.length);
  };
  while (groups.length > 1) {
    let best = -1,
      bi = 0,
      bj = 0;
    for (let i = 0; i < groups.length; i++)
      for (let j = i + 1; j < groups.length; j++) {
        const s = link(groups[i], groups[j]);
        if (s > best) {
          best = s;
          bi = i;
          bj = j;
        }
      }
    if (best < threshold) break;
    groups = [
      ...groups.filter((_, k) => k !== bi && k !== bj),
      [...groups[bi], ...groups[bj]],
    ];
  }
  return groups
    .map((g) => {
      const ps = g.map((i) => papers[i]);
      let s = 0,
        c = 0;
      for (let a = 0; a < g.length; a++)
        for (let b = a + 1; b < g.length; b++) {
          s += S[g[a]][g[b]];
          c++;
        }
      const shared =
        ps.length < 2
          ? []
          : FEATURES.filter((f) => f.key !== "text")
              .map((f) => {
                const sets = ps.map((p) => featureSet(p, f.key));
                return {
                  label: f.label,
                  items: [...sets[0]].filter((x) =>
                    sets.every((s2) => s2.has(x)),
                  ),
                };
              })
              .filter((x) => x.items.length);
      return { ids: ps.map((p) => p.id), avg: c ? s / c : 1, shared };
    })
    .sort((a, b) => b.ids.length - a.ids.length || b.avg - a.avg);
}

/** Closest papers to one paper. */
export function nearest(p: Paper, papers: Paper[], w: Weights, k = 3) {
  return papers
    .filter((o) => o.id !== p.id)
    .map((o) => ({ paper: o, score: similarity(p, o, w) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}
