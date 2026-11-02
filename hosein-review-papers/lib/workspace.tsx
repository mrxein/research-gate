"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Evidence, Paper, Status } from "./types";
export interface WS {
  status: Record<string, Status>; notes: Record<string, string>; tags: Record<string, string[]>;
  evidence: Record<string, Evidence[]>; validated: Record<string, string>; questions: string[];
}
const empty: WS = { status: {}, notes: {}, tags: {}, evidence: {}, validated: {}, questions: [] };
interface Ctx { papers: Paper[]; ws: WS; update: (f: (w: WS) => WS) => void; statusOf: (id: string) => Status }
const C = createContext<Ctx | null>(null);
export const useWorkspace = () => useContext(C)!;
// Mock persistence: localStorage only. Swap `update` for an API call to persist server-side.
export function WorkspaceProvider({ papers, children }: { papers: Paper[]; children: ReactNode }) {
  const [ws, setWs] = useState<WS>(empty); const [ready, setReady] = useState(false);
  useEffect(() => { try { const s = localStorage.getItem("ws"); if (s) setWs({ ...empty, ...JSON.parse(s) }); } catch {} setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem("ws", JSON.stringify(ws)); } catch {} }, [ws, ready]);
  return <C.Provider value={{ papers, ws, update: f => setWs(f), statusOf: id => ws.status[id] ?? "Unread" }}>{children}</C.Provider>;
}
