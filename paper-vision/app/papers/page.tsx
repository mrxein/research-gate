"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useWorkspace } from "@/lib/workspace";
import { Page, StatusBadge, Tag, STATUSES } from "@/components/ui";
export default function Papers() {
  const { papers, statusOf, ws } = useWorkspace();
  const [q, setQ] = useState(""),
    [st, setSt] = useState(""),
    [tag, setTag] = useState(""),
    [sort, setSort] = useState("year-desc");
  const allTags = [
    ...new Set(papers.flatMap((p) => [...p.tags, ...(ws.tags[p.id] ?? [])])),
  ].sort();
  const list = useMemo(
    () =>
      papers
        .filter((p) => {
          const tags = [...p.tags, ...(ws.tags[p.id] ?? [])];
          const hay = [
            p.title,
            p.authors.join(" "),
            p.problem,
            p.methodology,
            ...p.datasets,
            ...p.flAlgorithms,
            ...p.xaiMethods,
          ]
            .join(" ")
            .toLowerCase();
          return (
            hay.includes(q.toLowerCase()) &&
            (!st || statusOf(p.id) === st) &&
            (!tag || tags.includes(tag))
          );
        })
        .sort((a, b) =>
          sort === "title"
            ? a.title.localeCompare(b.title)
            : sort === "year-asc"
              ? a.year - b.year
              : b.year - a.year,
        ),
    [papers, q, st, tag, sort, ws, statusOf],
  );
  return (
    <Page title="Papers" sub={`${list.length} of ${papers.length} papers`}>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          className="input min-w-[12rem] flex-1"
          placeholder="Search title, authors, methods, datasets"
          aria-label="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="input"
          aria-label="Status"
          value={st}
          onChange={(e) => setSt(e.target.value)}
        >
          <option value="">Any status</option>
          {STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select
          className="input"
          aria-label="Tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        >
          <option value="">Any tag</option>
          {allTags.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <select
          className="input"
          aria-label="Sort"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="year-desc">Newest first</option>
          <option value="year-asc">Oldest first</option>
          <option value="title">Title A–Z</option>
        </select>
      </div>
      <div className="grid gap-3">
        {list.map((p) => (
          <Link
            key={p.id}
            href={`/papers/${encodeURIComponent(String(p.id))}`}
            className="card transition hover:border-tide"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-serif text-lg font-semibold">{p.title}</h3>
              <StatusBadge s={statusOf(p.id)} />
            </div>
            <p className="text-sm text-slate-500">
              {p.authors.join(", ")} ({p.year}), {p.venue}
            </p>
            <p className="mt-2 text-sm">{p.problem}</p>
            <div className="mt-3 flex flex-wrap gap-1">
              {[...p.tags, ...(ws.tags[p.id] ?? [])].map((t) => (
                <Tag key={t} t={t} />
              ))}
            </div>
          </Link>
        ))}
        {!list.length && (
          <p className="card text-sm">
            No papers match. Clear a filter or search term.
          </p>
        )}
      </div>
    </Page>
  );
}
