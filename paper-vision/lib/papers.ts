import type { Paper } from "./types";
import raw from "../data/papers.generated";

export function loadPapers(): Paper[] {
  return (raw as Paper[])
    .map((p) => ({
      ...p,
      authors: p.authors ?? [],
      tags: p.tags ?? [],
      limitations: p.limitations ?? [],
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}