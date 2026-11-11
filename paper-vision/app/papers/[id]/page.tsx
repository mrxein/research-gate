"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useWorkspace } from "@/lib/workspace";
import { Page, StatusBadge, Tag, STATUSES } from "@/components/ui";
import type { Status } from "@/lib/types";

const Sec = ({ t, children }: { t: string; children: React.ReactNode }) => (
  <section className="card">
    <h2 className="h2 mb-2">{t}</h2>
    {children}
  </section>
);

const List = ({
  items,
  empty = "None reported",
}: {
  items?: string[];
  empty?: string;
}) =>
  items && items.length > 0 ? (
    <ul className="list-disc space-y-1 pl-5 text-sm">
      {items.map((i, idx) => (
        <li key={idx}>{i}</li>
      ))}
    </ul>
  ) : (
    <p className="text-sm text-slate-500">{empty}</p>
  );

export default function PaperPage() {
  const { id } = useParams<{ id: string }>();
  const { papers, ws, update, statusOf } = useWorkspace();
  const p = papers.find((x) => String(x.id) === decodeURIComponent(id));
  const [tag, setTag] = useState("");
  const [ev, setEv] = useState({ page: "", section: "", ref: "", quote: "" });

  const authors = p?.authors ?? [];
  const builtinTags = p?.tags ?? [];
  const limitations = p?.limitations ?? [];

  console.log("papers:", papers.length, "id:", id, papers.map(x => x.id));

  if (!p)
    return (
      <Page
        title="Paper not found"
        sub="Check the link or return to the Papers list."
        children={null}
      />
    );
  const tags = ws.tags[p.id] ?? [],
    evs = ws.evidence[p.id] ?? [];
  return (
    <Page
      title={p.title}
      sub={`${authors.join(", ")} (${p.year}), ${p.venue}`}
      actions={<StatusBadge s={statusOf(p.id)} />}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Sec t="Research problem">
            <p className="text-sm">{p.problem}</p>
          </Sec>
          <Sec t="Motivation">
            <p className="text-sm">{p.motivation}</p>
          </Sec>
          <Sec t="Novelty and contributions">
            <List items={p.noveltyAndContributions} />
          </Sec>
          <Sec t="Methodology">
            <List items={p.methodology} />
          </Sec>
          <Sec t="Key assumptions">
            <List items={p.keyAssumptions} />
          </Sec>
          <div className="grid gap-4 sm:grid-cols-2">
            <Sec t="Datasets">
              <List items={p.datasets} />
            </Sec>
            <Sec t="Data partition">
              <List items={p.partition} />
            </Sec>
            <Sec t="FL algorithms">
              <List items={p.flAlgorithms} />
            </Sec>
            <Sec t="XAI methods">
              <List items={p.xaiMethods} empty="None (no XAI used)" />
              {p.xaiEvaluation && (
                <p className="mt-2 text-xs text-slate-500">
                  {p.xaiEvaluation}
                </p>
              )}
            </Sec>
            <Sec t="Evaluation metrics">
              <List items={p.metrics} />
            </Sec>
            {p.numClients && p.numClients.length > 0 && (
              <Sec t="Number of clients">
                <p className="text-sm">
                  K = {p.numClients.join(", ")}
                </p>
              </Sec>
            )}
          </div>
          {p.experimentalSetup && p.experimentalSetup.length > 0 && (
            <Sec t="Experimental setup">
              <List items={p.experimentalSetup} />
            </Sec>
          )}
          {p.baselines && p.baselines.length > 0 && (
            <Sec t="Baselines">
              <List items={p.baselines} />
            </Sec>
          )}
          <Sec t="Results">
            <p className="text-sm">{p.results}</p>
          </Sec>
          {p.failureConditions && p.failureConditions.length > 0 && (
            <Sec t="Failure conditions">
              <List items={p.failureConditions} />
            </Sec>
          )}
          {p.costEvaluation && (
            <Sec t="Communication / computation cost">
              <p className="text-sm">{p.costEvaluation}</p>
            </Sec>
          )}
          <Sec t="Limitations">
            {(limitations ?? []).length > 0 ? (
              <ul className="space-y-2 text-sm">
                {limitations.map((l, idx) => (
                  <li key={idx} className="flex flex-col gap-1">
                    <span>{l.text}</span>
                    <span>
                      <Tag t={l.theme} />
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">None reported</p>
            )}
          </Sec>
          <Sec t="Future work">
            <List items={p.futureWork} />
          </Sec>
          {p.relevance && (
            <Sec t="Relevance to my thesis">
              <p className="text-sm">{p.relevance}</p>
            </Sec>
          )}
          {p.newIdeas && p.newIdeas.length > 0 && (
            <Sec t="New research ideas">
              <List items={p.newIdeas} />
            </Sec>
          )}
        </div>
        <div className="space-y-4">
          <section className="card">
            <h2 className="h2 mb-2">Paper info</h2>
            <dl className="space-y-1 text-sm">
              {p.doi && (
                <div>
                  <dt className="text-xs text-slate-500">DOI</dt>
                  <dd>
                    <a
                      className="text-blue-600 underline break-all"
                      href={`https://doi.org/${p.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {p.doi}
                    </a>
                  </dd>
                </div>
              )}
              {p.researchArea && (
                <div>
                  <dt className="text-xs text-slate-500">Research area</dt>
                  <dd>{p.researchArea}</dd>
                </div>
              )}
              {p.priority && (
                <div>
                  <dt className="text-xs text-slate-500">Follow-up priority</dt>
                  <dd>{p.priority}</dd>
                </div>
              )}
              {p.reviewStatus && (
                <div>
                  <dt className="text-xs text-slate-500">Extraction status</dt>
                  <dd>{p.reviewStatus}</dd>
                </div>
              )}
            </dl>
          </section>
          <section className="card">
            <h2 className="h2 mb-2">Workspace</h2>
            <label className="text-sm">
              Reading status
              <select
                className="input mt-1 w-full"
                value={statusOf(p.id)}
                onChange={(e) =>
                  update((w) => ({
                    ...w,
                    status: { ...w.status, [p.id]: e.target.value as Status },
                  }))
                }
              >
                {STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-sm">
              Personal notes
              <textarea
                className="input mt-1 h-28 w-full"
                value={ws.notes[p.id] ?? ""}
                onChange={(e) =>
                  update((w) => ({
                    ...w,
                    notes: { ...w.notes, [p.id]: e.target.value },
                  }))
                }
              />
            </label>
            <div className="mt-3 flex flex-wrap gap-1">
              {[
                ...builtinTags.map((t) => [t, false] as const),
                ...tags.map((t) => [t, true] as const),
              ].map(([t, mine]) => (
                <button
                  key={t}
                  disabled={!mine}
                  title={mine ? "Remove tag" : "Built-in tag"}
                  onClick={() =>
                    update((w) => ({
                      ...w,
                      tags: { ...w.tags, [p.id]: tags.filter((x) => x !== t) },
                    }))
                  }
                >
                  <Tag t={mine ? t + " ×" : t} />
                </button>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input
                className="input min-w-0 flex-1"
                placeholder="Add tag"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
              <button
                className="btn"
                onClick={() => {
                  const t = tag.trim();
                  if (t && !tags.includes(t))
                    update((w) => ({
                      ...w,
                      tags: { ...w.tags, [p.id]: [...tags, t] },
                    }));
                  setTag("");
                }}
              >
                Add tag
              </button>
            </div>
          </section>
          {p.evidence && p.evidence.length > 0 && (
            <section className="card">
              <h2 className="h2 mb-2">Where to find it in the paper</h2>
              <ul className="space-y-2 text-sm">
                {p.evidence.map((e, idx) => (
                  <li key={idx}>
                    <div>{e.item}</div>
                    <div className="text-xs text-slate-500">
                      p. {e.page}
                      {e.section ? ` · Sec. ${e.section}` : ""}
                      {e.ref ? ` · ${e.ref}` : ""}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
          <section className="card">
            <h2 className="h2 mb-2">Evidence & annotations</h2>
            <div className="grid grid-cols-2 gap-2">
              {(["page", "section", "ref"] as const).map((k) => (
                <input
                  key={k}
                  className="input"
                  placeholder={
                    k === "ref"
                      ? "Figure / table"
                      : k === "page"
                        ? "Page"
                        : "Section"
                  }
                  value={ev[k]}
                  onChange={(e) => setEv({ ...ev, [k]: e.target.value })}
                />
              ))}
            </div>
            <textarea
              className="input mt-2 w-full"
              placeholder="Annotation or quoted evidence"
              value={ev.quote}
              onChange={(e) => setEv({ ...ev, quote: e.target.value })}
            />
            <button
              className="btn-primary mt-2"
              onClick={() => {
                if (!ev.quote.trim()) return;
                update((w) => ({
                  ...w,
                  evidence: {
                    ...w.evidence,
                    [p.id]: [...evs, { id: crypto.randomUUID(), ...ev }],
                  },
                }));
                setEv({ page: "", section: "", ref: "", quote: "" });
              }}
            >
              Save evidence
            </button>
            <ul className="mt-3 space-y-2 text-sm">
              {evs.map((e) => (
                <li
                  key={e.id}
                  className="rounded border border-slate-200 p-2 dark:border-slate-700"
                >
                  <div className="text-xs text-slate-500">
                    p. {e.page || "?"} · {e.section || "no section"} ·{" "}
                    {e.ref || "no figure/table"}
                  </div>
                  {e.quote}
                  <button
                    className="ml-2 text-xs text-red-600"
                    onClick={() =>
                      update((w) => ({
                        ...w,
                        evidence: {
                          ...w.evidence,
                          [p.id]: evs.filter((x) => x.id !== e.id),
                        },
                      }))
                    }
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </Page>
  );
}