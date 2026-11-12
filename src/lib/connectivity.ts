// Connectivity is determined by server reachability checks, not navigator.onLine alone.
import { useSyncExternalStore } from "react";

export type ConnMode = "online" | "offline" | "checking";

export interface ConnState {
  mode: ConnMode;
  lastCheck?: string;
  lastOnline?: string;
  serverVersion?: string;
  latencyMs?: number;
  syncConfigured: boolean;
  forcedOffline: boolean;
}

let state: ConnState = { mode: "checking", syncConfigured: false, forcedOffline: false };
const listeners = new Set<() => void>();
function emit() { listeners.forEach((l) => l()); }
function set(patch: Partial<ConnState>) { state = { ...state, ...patch }; emit(); }

export async function checkServer(): Promise<ConnMode> {
  if (state.forcedOffline) { set({ mode: "offline", lastCheck: new Date().toISOString() }); return "offline"; }
  const t0 = performance.now();
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 4000);
    const res = await fetch("/api/health", { cache: "no-store", signal: ctrl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error("bad status");
    const j = (await res.json()) as { version?: string; syncConfigured?: boolean };
    set({ mode: "online", lastCheck: new Date().toISOString(), lastOnline: new Date().toISOString(), serverVersion: j.version, syncConfigured: !!j.syncConfigured, latencyMs: Math.round(performance.now() - t0) });
    return "online";
  } catch {
    set({ mode: "offline", lastCheck: new Date().toISOString() });
    return "offline";
  }
}

export function setForcedOffline(v: boolean) {
  set({ forcedOffline: v });
  void checkServer();
}

let started = false;
export function startConnectivityMonitor() {
  if (started) return;
  started = true;
  void checkServer();
  setInterval(() => void checkServer(), 20000);
  window.addEventListener("online", () => void checkServer());
  window.addEventListener("offline", () => void checkServer());
}

export function useConnectivity(): ConnState {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    () => state,
    () => state
  );
}
