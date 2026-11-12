import React, { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, isSeeded } from "../db/db";
import { seedDatabase } from "../db/seed";
import { useSession } from "../state/session";
import { t } from "../lib/i18n";
import { useConnectivity } from "../lib/connectivity";
import { patientName, ageFromDob } from "../lib/format";
import { IHome, IList, ICalendar, IInbox, IBolt, IBed, IPill, IFlask, IScan, ISettings, ISearch, IWifi, IWifiOff, IX, ISparkle, IChevronDown, ILogout, IGlobe, IMoon, IUser, IHeart } from "./Icons";
import type { Role } from "../db/types";

interface Tool { to: string; key: string; icon: React.ReactNode; roles: Role[] }
const TOOLS: Tool[] = [
  { to: "/app", key: "home", icon: <IHome />, roles: ["physician", "nurse", "pharmacist", "registrar", "lab", "radiology", "ed", "admin"] },
  { to: "/app/lists", key: "patientLists", icon: <IList />, roles: ["physician", "nurse", "pharmacist", "lab", "radiology", "ed", "admin", "registrar"] },
  { to: "/app/schedule", key: "schedule", icon: <ICalendar />, roles: ["physician", "registrar", "nurse", "admin"] },
  { to: "/app/inbox", key: "inBasket", icon: <IInbox />, roles: ["physician", "nurse", "pharmacist", "ed", "admin"] },
  { to: "/app/ed", key: "edBoard", icon: <IBolt />, roles: ["physician", "nurse", "ed", "registrar", "admin"] },
  { to: "/app/beds", key: "bedBoard", icon: <IBed />, roles: ["physician", "nurse", "registrar", "ed", "admin"] },
  { to: "/app/pharmacy", key: "pharmacy", icon: <IPill />, roles: ["pharmacist", "admin"] },
  { to: "/app/lab", key: "laboratory", icon: <IFlask />, roles: ["lab", "admin"] },
  { to: "/app/imaging", key: "imaging", icon: <IScan />, roles: ["radiology", "admin"] },
  { to: "/app/admin", key: "admin", icon: <ISettings />, roles: ["admin"] },
  { to: "/app/portal", key: "portal", icon: <IHeart />, roles: ["patient"] },
];

export default function AppShell() {
  const [ready, setReady] = useState<"checking" | "seeding" | "ready">("checking");
  const [msg, setMsg] = useState("Checking local database…");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (await isSeeded()) { if (!cancelled) setReady("ready"); return; }
      setReady("seeding");
      await seedDatabase((m) => !cancelled && setMsg(m));
      if (!cancelled) setReady("ready");
    })();
    return () => { cancelled = true; };
  }, []);
  if (ready !== "ready") {
    return (
      <div className="shell" style={{ alignItems: "center", justifyContent: "center", gap: 14 }}>
        <div className="appbar" style={{ width: "100%", position: "absolute", top: 0 }}><div className="brand"><span className="logo"><ISparkle width={16} height={16} /></span>Magic EHR</div></div>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Preparing your demo hospital</div>
        <div className="muted">{msg}</div>
        <div style={{ width: 240, height: 6, background: "var(--surface-3)", borderRadius: 3, overflow: "hidden" }}><div style={{ width: "60%", height: "100%", background: "var(--primary)", animation: "pulse 1s infinite" }} /></div>
        <div className="small muted">48 synthetic patients · 4 units · fully offline · nothing leaves this browser</div>
      </div>
    );
  }
  return <Shell />;
}

function Shell() {
  const s = useSession();
  const conn = useConnectivity();
  const loc = useLocation();
  const nav = useNavigate();
  const [menu, setMenu] = useState(false);
  const [q, setQ] = useState("");
  const [showResults, setShowResults] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inboxNew = useLiveQuery(() => db.inbox.where("ownerId").equals(s.user.id).and((i) => i.status === "new").count(), [s.user.id]) ?? 0;
  const openPts = useLiveQuery(() => db.patients.where("id").anyOf(s.openPatients).toArray(), [s.openPatients.join(",")]) ?? [];
  const results = useLiveQuery(async () => {
    const term = q.trim().toLowerCase();
    if (term.length < 2) return [];
    const all = await db.patients.toArray();
    return all.filter((p) => p.mrn.includes(term) || `${p.lastName} ${p.firstName}`.toLowerCase().includes(term) || `${p.firstName} ${p.lastName}`.toLowerCase().includes(term) || p.lastName.toLowerCase().startsWith(term)).slice(0, 8);
  }, [q]) ?? [];

  useEffect(() => {
    const h = (e: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenu(false); };
    window.addEventListener("mousedown", h);
    return () => window.removeEventListener("mousedown", h);
  }, []);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); (document.getElementById("lookup") as HTMLInputElement | null)?.focus(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const tools = TOOLS.filter((x) => x.roles.includes(s.role));
  const activeChart = loc.pathname.match(/\/app\/chart\/([^/]+)/)?.[1] ?? null;

  return (
    <div className="shell">
      <header className="appbar" role="banner">
        <div className="brand"><span className="logo"><ISparkle width={16} height={16} /></span>Magic EHR<span className="fac">{s.facility.name}</span></div>
        <nav className="tools" aria-label="Workspaces">
          {tools.map((x) => (
            <NavLink key={x.key} to={x.to} end={x.to === "/app"} className={({ isActive }) => "tool" + (isActive ? " active" : "")}>
              {x.icon}<span>{t(x.key)}</span>
              {x.key === "inBasket" && inboxNew > 0 && <span className="badge" aria-label={`${inboxNew} new`}>{inboxNew}</span>}
            </NavLink>
          ))}
        </nav>
        {s.role !== "patient" && (
          <div className="lookup" style={{ position: "relative" }}>
            <ISearch />
            <input id="lookup" value={q} onChange={(e) => { setQ(e.target.value); setShowResults(true); }} onFocus={() => setShowResults(true)} onBlur={() => setTimeout(() => setShowResults(false), 150)}
              placeholder={t("patientLookup") + "  (Ctrl+K)"} aria-label="Patient lookup"
              onKeyDown={(e) => { if (e.key === "Enter") { if (results[0]) { s.openPatient(results[0].id); setQ(""); } else nav("/app/search?q=" + encodeURIComponent(q)); } if (e.key === "Escape") setShowResults(false); }} />
            {showResults && q.trim().length >= 2 && (
              <div className="menu" style={{ left: 0, right: "auto", minWidth: 360, top: "100%" }}>
                {results.length === 0 && <div className="mh">No authorized match. <button className="btn sm" onMouseDown={() => nav("/app/search?q=" + encodeURIComponent(q))}>Advanced search</button></div>}
                {results.map((p) => (
                  <button key={p.id} className="mi" onMouseDown={() => { s.openPatient(p.id); setQ(""); }}>
                    <span className="avatar" style={{ background: `hsl(${p.hue} 40% 45%)` }}>{p.firstName[0]}{p.lastName[0]}</span>
                    <span><b>{patientName(p)}</b> <span className="muted small">{p.sex} · {ageFromDob(p.dob)} y</span><br /><span className="small muted">MRN {p.mrn} · DOB {p.dob}</span></span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="right">
          <button className={`conn ${conn.mode}`} onClick={() => nav("/app/admin/connectivity")} title="Connectivity and sync status">
            <span className="dot" />{conn.mode === "online" ? <IWifi /> : <IWifiOff />}
            <span>{conn.mode === "online" ? t("online") : conn.mode === "offline" ? t("offline") + " · local authority" : "…"}</span>
          </button>
          <div ref={menuRef} style={{ position: "relative" }}>
            <button className="userbtn" onClick={() => setMenu((m) => !m)} aria-haspopup="menu" aria-expanded={menu}>
              <span className="avatar">{s.user.initials}</span>
              <span style={{ textAlign: "start", lineHeight: 1.1 }}><div style={{ fontSize: 13, fontWeight: 600 }}>{s.user.name}{s.user.credentials ? `, ${s.user.credentials}` : ""}</div><div style={{ fontSize: 11, color: "var(--nav-muted)" }}>{s.user.department} · {s.role}</div></span>
              <IChevronDown width={14} height={14} />
            </button>
            {menu && (
              <div className="menu" role="menu">
                <div className="mh">Switch workspace (demo)</div>
                {s.users.map((u) => (
                  <button key={u.id} className={"mi" + (u.id === s.user.id ? " active" : "")} role="menuitem" onClick={() => { s.switchUser(u.id); setMenu(false); }}>
                    <span className="avatar">{u.initials}</span>
                    <span style={{ flex: 1 }}>{u.name}{u.credentials ? `, ${u.credentials}` : ""}<div className="small muted">{u.department} · {u.role}</div></span>
                  </button>
                ))}
                <div className="mh">{t("theme")} / {t("language")}</div>
                <div className="row" style={{ padding: "4px 10px 8px" }}>
                  <div className="seg"><button className={s.theme === "light" ? "active" : ""} onClick={() => s.setTheme("light")}>Light</button><button className={s.theme === "dark" ? "active" : ""} onClick={() => s.setTheme("dark")}><IMoon width={12} height={12} /> Dark</button><button className={s.theme === "contrast" ? "active" : ""} onClick={() => s.setTheme("contrast")}>High contrast</button></div>
                  <div className="seg"><button className={s.lang === "en" ? "active" : ""} onClick={() => s.setLang("en")}><IGlobe width={12} height={12} /> EN</button><button className={s.lang === "ar" ? "active" : ""} onClick={() => s.setLang("ar")}>عربي</button></div>
                </div>
                <button className="mi" onClick={() => { setMenu(false); nav("/app/admin"); }}><ISettings width={16} height={16} /> {t("admin")}</button>
                <button className="mi" onClick={() => { setMenu(false); nav("/"); }}><ILogout width={16} height={16} /> {t("signOut")}</button>
              </div>
            )}
          </div>
        </div>
      </header>
      {s.role !== "patient" && (
        <div className="patient-tabs" role="tablist" aria-label="Open charts">
          {openPts.length === 0 && <span className="small muted" style={{ padding: "6px 4px" }}><IUser width={12} height={12} /> No charts open — search a patient or pick one from a list.</span>}
          {s.openPatients.map((id) => {
            const p = openPts.find((x) => x.id === id);
            if (!p) return null;
            const active = activeChart === id;
            return (
              <div key={id} role="tab" aria-selected={active} tabIndex={0} className={"patient-tab" + (active ? " active" : "")} onClick={() => s.openPatient(id, loc.pathname.includes(`/chart/${id}/`) ? loc.pathname.split("/").pop()! : "summary")} onKeyDown={(e) => e.key === "Enter" && s.openPatient(id)}>
                <span className="avatar" style={{ width: 18, height: 18, fontSize: 8, background: `hsl(${p.hue} 40% 45%)` }}>{p.firstName[0]}{p.lastName[0]}</span>
                <span className="name">{patientName(p)} <span className="muted small">{ageFromDob(p.dob)}{p.sex}</span></span>
                <button className="x" aria-label={`Close ${patientName(p)}`} onClick={(e) => { e.stopPropagation(); s.closePatient(id); }}><IX width={12} height={12} /></button>
              </div>
            );
          })}
        </div>
      )}
      <div className="main">
        <Outlet />
      </div>
      <div className="toasts" aria-live="polite">
        {s.toasts.map((x) => <div key={x.id} className={`toast ${x.kind}`}>{x.text}</div>)}
      </div>
    </div>
  );
}
