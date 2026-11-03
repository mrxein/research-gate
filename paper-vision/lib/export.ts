const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
export const toCSV = (rows: string[][]) => rows.map(r => r.map(q).join(",")).join("\n");
export const toMarkdownTable = (rows: string[][]) => {
  const [h, ...b] = rows; const esc = (s: string) => s.replace(/\|/g, "\\|").replace(/\n/g, " ");
  return [h, h.map(() => "---"), ...b].map(r => `| ${r.map(esc).join(" | ")} |`).join("\n");
};
export function download(name: string, content: string, type = "text/plain") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type })); a.download = name; a.click(); URL.revokeObjectURL(a.href);
}
