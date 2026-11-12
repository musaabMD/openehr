import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../db/db";
import type { Role, User } from "../db/types";
import { USERS, FACILITY } from "../db/seed";
import { setAuditContext, audit } from "../lib/audit";
import { getLang, setLang as setLangGlobal, type Lang } from "../lib/i18n";
import { startConnectivityMonitor, useConnectivity } from "../lib/connectivity";

export type Theme = "light" | "dark" | "contrast";

interface Toast { id: number; text: string; kind: "info" | "success" | "warning" | "danger" }

interface SessionCtx {
  user: User;
  users: User[];
  switchUser: (id: string) => void;
  role: Role;
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  openPatients: string[];
  activePatient: string | null;
  openPatient: (id: string, activity?: string) => void;
  closePatient: (id: string) => void;
  setActivePatient: (id: string | null) => void;
  toast: (text: string, kind?: Toast["kind"]) => void;
  toasts: Toast[];
  facility: typeof FACILITY;
  rightPanel: boolean;
  setRightPanel: (v: boolean) => void;
}

const Ctx = createContext<SessionCtx | null>(null);

function readPref<T extends string>(key: string, fallback: T): T {
  try { return (localStorage.getItem(key) as T) || fallback; } catch { return fallback; }
}
function writePref(key: string, v: string) { try { localStorage.setItem(key, v); } catch { /* ignore */ } }

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>(() => readPref("magic-user", "u-phys1"));
  const user = useMemo(() => USERS.find((u) => u.id === userId) ?? USERS[0]!, [userId]);
  const [theme, setThemeState] = useState<Theme>(() => readPref("magic-theme", "light"));
  const [lang, setLangState] = useState<Lang>(() => readPref("magic-lang", "en"));
  const [openPatients, setOpenPatients] = useState<string[]>(() => {
    try { return JSON.parse(sessionStorage.getItem("magic-open") ?? "[]"); } catch { return []; }
  });
  const [activePatient, setActivePatientState] = useState<string | null>(() => {
    try { return sessionStorage.getItem("magic-active"); } catch { return null; }
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [rightPanel, setRightPanel] = useState(false);
  const conn = useConnectivity();
  const toastId = useRef(0);

  useEffect(() => { startConnectivityMonitor(); }, []);
  useEffect(() => { setAuditContext(user, conn.mode === "online" ? "online" : "offline"); }, [user, conn.mode]);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    writePref("magic-theme", theme);
  }, [theme]);
  useEffect(() => {
    setLangGlobal(lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    writePref("magic-lang", lang);
  }, [lang]);
  useEffect(() => { try { sessionStorage.setItem("magic-open", JSON.stringify(openPatients)); } catch { /* ignore */ } }, [openPatients]);
  useEffect(() => { try { if (activePatient) sessionStorage.setItem("magic-active", activePatient); else sessionStorage.removeItem("magic-active"); } catch { /* ignore */ } }, [activePatient]);

  const toast = useCallback((text: string, kind: Toast["kind"] = "info") => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const switchUser = useCallback((id: string) => {
    const u = USERS.find((x) => x.id === id);
    if (!u) return;
    setUserId(id);
    writePref("magic-user", id);
    void audit("LOGIN", { resource: "session", detail: `Switched workspace to ${u.name} (${u.role})` });
    if (u.role === "patient") navigate("/app/portal");
    else navigate("/app");
  }, [navigate]);

  const openPatient = useCallback((id: string, activity = "summary") => {
    setOpenPatients((list) => (list.includes(id) ? list : [...list, id].slice(-8)));
    setActivePatientState(id);
    void db.patients.get(id).then((p) => { if (p) void audit("CHART_VIEW", { patientId: id, resource: "chart", resourceId: id, detail: `Opened chart ${p.mrn}` }); });
    navigate(`/app/chart/${id}/${activity}`);
  }, [navigate]);

  const closePatient = useCallback((id: string) => {
    setOpenPatients((list) => {
      const next = list.filter((x) => x !== id);
      if (activePatient === id) {
        const fallback = next[next.length - 1] ?? null;
        setActivePatientState(fallback);
        navigate(fallback ? `/app/chart/${fallback}/summary` : "/app");
      }
      return next;
    });
  }, [activePatient, navigate]);

  const value: SessionCtx = useMemo(() => ({
    user, users: USERS, switchUser, role: user.role,
    theme, setTheme: setThemeState, lang, setLang: setLangState,
    openPatients, activePatient, openPatient, closePatient, setActivePatient: setActivePatientState,
    toast, toasts, facility: FACILITY, rightPanel, setRightPanel,
  }), [user, switchUser, theme, lang, openPatients, activePatient, openPatient, closePatient, toast, toasts, rightPanel]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useSession outside provider");
  return c;
}

export function useLangTick(): Lang { return useSession().lang ?? getLang(); }
