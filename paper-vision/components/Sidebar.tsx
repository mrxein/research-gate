"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AuthPanel from "@/components/AuthPanel";
const nav = [
  ["/", "Dashboard"],
  ["/papers", "Papers"],
  ["/clusters", "Groups"],
  ["/compare", "Compare"],
  ["/research-gaps", "Research Gaps"],
  ["/matrix", "Research Matrix"],
  ["/groups", "My Groups"],
];
export default function Sidebar() {
  const path = usePathname();
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const d = localStorage.getItem("theme") === "dark";
    setDark(d);
    document.documentElement.classList.toggle("dark", d);
  }, []);
  const toggle = () => {
    const d = !dark;
    setDark(d);
    localStorage.setItem("theme", d ? "dark" : "light");
    document.documentElement.classList.toggle("dark", d);
  };
  return (
    <aside className="flex shrink-0 flex-row items-center gap-1 overflow-x-auto border-b border-slate-200 bg-white p-2 dark:border-slate-700/60 dark:bg-panel md:sticky md:top-0 md:h-screen md:w-56 md:flex-col md:items-stretch md:overflow-visible md:border-b-0 md:border-r md:p-4">
      <div className="hidden px-2 pb-4 font-serif text-lg font-semibold md:block">
        Paper Vision
      </div>
      {nav.map(([h, l]) => {
        const on = h === "/" ? path === "/" : path.startsWith(h);
        return (
          <Link
            key={h}
            href={h}
            className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition ${on ? "bg-tide text-white" : "hover:bg-slate-100 dark:hover:bg-slate-700/50"}`}
          >
            {l}
          </Link>
        );
      })}
      <div className="flex flex-row gap-2 md:mt-auto md:flex-col">
        <div className="hidden md:mt-auto md:block md:pb-2">
          <AuthPanel />
        </div>
        <button
          onClick={toggle}
          className="btn ml-auto whitespace-nowrap md:ml-0 md:mt-auto"
        >
          {dark ? "Light theme" : "Dark theme"}
        </button>
      </div>
    </aside>
  );
}
