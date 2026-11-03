"use client";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { Paper, Status, WS } from "./types";
import { supabase } from "./supabase";
import { loadWorkspace, syncWorkspace } from "./workspace-db";

export const empty: WS = {
  status: {}, notes: {}, tags: {}, evidence: {}, validated: {}, questions: [],
};

interface Ctx {
  papers: Paper[];
  ws: WS;
  update: (f: (w: WS) => WS) => void;
  statusOf: (id: string) => Status;
}

const C = createContext<Ctx | null>(null);
export const useWorkspace = () => useContext(C)!;

export function WorkspaceProvider({ papers, children }: { papers: Paper[]; children: ReactNode }) {
  const [ws, setWs] = useState<WS>(empty);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const prev = useRef<WS>(empty);

  // 1. Track the signed-in user
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  // 2. Load from Supabase when signed in, otherwise from localStorage
  useEffect(() => {
    if (!user) {
      try {
        const s = localStorage.getItem("ws");
        setWs(s ? { ...empty, ...JSON.parse(s) } : empty);
      } catch {}
      setReady(false);
      return;
    }
    loadWorkspace().then(w => { prev.current = w; setWs(w); setReady(true); });
  }, [user]);

  // 3. Save: debounced diff to Supabase (signed in) or localStorage (signed out)
  useEffect(() => {
    const t = setTimeout(() => {
      if (user && ready) {
        syncWorkspace(user.id, prev.current, ws).catch(console.error);
        prev.current = ws;
      } else if (!user) {
        try { localStorage.setItem("ws", JSON.stringify(ws)); } catch {}
      }
    }, 600);
    return () => clearTimeout(t);
  }, [ws, user, ready]);

  return (
    <C.Provider value={{ papers, ws, update: f => setWs(f), statusOf: id => ws.status[id] ?? "Unread" }}>
      {children}
    </C.Provider>
  );
}