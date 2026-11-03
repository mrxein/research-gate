import fs from "fs";
import path from "path";
import type { Paper } from "./types";
// Server-only loader. To add a paper, drop a new JSON file into /data/papers.
export function loadPapers(): Paper[] {
  const dir = path.join(process.cwd(), "data", "papers");
  return fs.readdirSync(dir).filter(f => f.endsWith(".json"))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), "utf8")) as Paper)
    .sort((a, b) => a.id.localeCompare(b.id));
}
