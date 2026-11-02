"use client";
import type { Status } from "@/lib/types";
const col: Record<Status, string> = {
  Unread: "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
  Reading:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200",
  Reviewed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200",
};
export const StatusBadge = ({ s }: { s: Status }) => (
  <span className={`rounded px-2 py-0.5 text-xs font-medium ${col[s]}`}>
    {s}
  </span>
);
export const Tag = ({ t }: { t: string }) => (
  <span className="rounded bg-tide/10 px-2 py-0.5 text-xs text-tide dark:bg-tide/25 dark:text-teal-200">
    {t}
  </span>
);
export const Page = ({
  title,
  sub,
  actions,
  children,
}: {
  title: string;
  sub?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="rise mx-auto max-w-6xl p-4 sm:p-8">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-serif text-3xl font-semibold">{title}</h1>
        {sub && (
          <p className="mt-1 max-w-prose text-sm text-slate-500 dark:text-slate-400">
            {sub}
          </p>
        )}
      </div>
      <div className="flex gap-2">{actions}</div>
    </div>
    {children}
  </div>
);
export const STATUSES: Status[] = ["Unread", "Reading", "Reviewed"];
