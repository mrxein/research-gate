import fs from "fs";
import path from "path";
import type { Paper } from "./types";

export function loadPapers(): Paper[] {
  const dir = path.join(process.cwd(), "data", "papers");
  let files: string[] = [];
  try {
    files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"));
  } catch (e) {
    console.error("Cannot read papers dir:", dir, e);
    return [];
  }

  const papers: Paper[] = [];
  for (const f of files) {
    try {
      const raw = fs
        .readFileSync(path.join(dir, f), "utf8")
        .replace(/^\uFEFF/, "");
      const p = JSON.parse(raw) as Paper;
      if (!p.id) throw new Error("missing id");
      papers.push({
        ...p,
        authors: p.authors ?? [],
        tags: p.tags ?? [],
        limitations: p.limitations ?? [],
      });
    } catch (e) {
      console.error(`Bad paper file ${f}:`, e);
    }
  }
  return papers.sort((a, b) => a.id.localeCompare(b.id));
}
