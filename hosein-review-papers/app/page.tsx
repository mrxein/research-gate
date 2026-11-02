"use client";
import Link from "next/link";
import { useWorkspace } from "@/lib/workspace";
import { detectGaps } from "@/lib/gaps";
import { Page, StatusBadge } from "@/components/ui";
export default function Dashboard() {
  const { papers, statusOf, ws } = useWorkspace();
  const gaps = detectGaps(papers);
  const reviewed = papers.filter((p) => statusOf(p.id) === "Reviewed").length;
  const stats = [
    ["Total papers", papers.length],
    ["Reviewed", reviewed],
    ["Candidate gaps", gaps.length],
    ["Pending reviews", papers.length - reviewed],
  ];
  return (
    <Page
      title="Dashboard"
      sub="Your reading progress and candidate research gaps at a glance."
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(([l, v]) => (
          <div key={l} className="card">
            <div className="text-3xl font-semibold">{v}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {l}
            </div>
          </div>
        ))}
      </div>
      <h2 className="h2 mb-3 mt-8">Continue reading</h2>
      <div className="card divide-y divide-slate-200 p-0 dark:divide-slate-700/60">
        {papers
          .filter((p) => statusOf(p.id) !== "Reviewed")
          .map((p) => (
            <Link
              key={p.id}
              href={`/papers/${p.id}`}
              className="flex items-center justify-between gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30"
            >
              <span className="text-sm">{p.title}</span>
              <StatusBadge s={statusOf(p.id)} />
            </Link>
          ))}
        {papers.length === reviewed && (
          <p className="p-4 text-sm">
            All papers reviewed. Add more JSON files to /data/papers.
          </p>
        )}
      </div>
      <p className="mt-6 text-sm text-slate-500">
        {ws.questions.length} saved research question(s).{" "}
        <Link className="text-tide underline" href="/research-gaps">
          Open research gaps
        </Link>
      </p>
    </Page>
  );
}
