import React, { useEffect } from "react";
import { IX, IAlert, IInfo } from "./Icons";
import type { CdsAlert } from "../lib/cds";

export function Chip({ kind = "neutral", children, outline }: { kind?: "neutral" | "info" | "success" | "warning" | "danger"; children: React.ReactNode; outline?: boolean }) {
  return <span className={`chip ${kind} ${outline ? "outline" : ""}`}>{children}</span>;
}

export function statusKind(s: string): "neutral" | "info" | "success" | "warning" | "danger" {
  const m: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
    active: "success", signed: "success", given: "success", final: "success", completed: "success", resulted: "success", verified: "success", met: "success", "server-accepted": "success", "local-committed": "success", available: "success", discharged: "neutral", admitted: "info", "in-progress": "info", "in-visit": "info", roomed: "info", scheduled: "neutral", "checked-in": "info", arrived: "info", collected: "info", received: "info", "in-process": "info", acquired: "info", triaged: "warning", due: "info", draft: "warning", "local-draft": "warning", queued: "warning", syncing: "info", "pending-cosign": "warning", pending: "warning", held: "warning", prelim: "warning", cleaning: "warning", clarify: "warning", missed: "danger", refused: "danger", rejected: "danger", conflict: "danger", canceled: "neutral", discontinued: "neutral", blocked: "danger", "no-show": "danger", occupied: "info", new: "info", read: "neutral", done: "success", open: "info", "not-met": "danger", stat: "danger", urgent: "warning", routine: "neutral", high: "danger", normal: "neutral", low: "neutral", chronic: "neutral", resolved: "neutral", severe: "danger", moderate: "warning", mild: "neutral", corrected: "warning", ordered: "neutral",
  };
  return m[s] ?? "neutral";
}

export function StateChip({ s }: { s: string }) {
  const label = s === "local-committed" ? "Committed (local authority)" : s === "server-accepted" ? "Server accepted" : s === "local-draft" ? "Local draft" : s === "pending-cosign" ? "Pending cosign" : s.replace(/-/g, " ");
  return <Chip kind={statusKind(s)}>{label}</Chip>;
}

export function Dialog({ title, onClose, children, footer, size }: { title: React.ReactNode; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; size?: "wide" | "narrow" }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`dialog ${size ?? ""}`} role="dialog" aria-modal="true" aria-label={typeof title === "string" ? title : "Dialog"}>
        <div className="dialog-h">{title}<button className="btn ghost sm x" onClick={onClose} aria-label="Close"><IX /></button></div>
        <div className="dialog-b">{children}</div>
        {footer && <div className="dialog-f">{footer}</div>}
      </div>
    </div>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="empty">{children}</div>;
}

export function Card({ title, children, actions, tight, style }: { title?: React.ReactNode; children: React.ReactNode; actions?: React.ReactNode; tight?: boolean; style?: React.CSSProperties }) {
  return (
    <section className="card" style={style}>
      {title && <div className="card-h">{title}<span className="spacer" />{actions}</div>}
      <div className={`card-b ${tight ? "tight" : ""}`}>{children}</div>
    </section>
  );
}

export function Stat({ v, l, kind }: { v: React.ReactNode; l: string; kind?: "danger" | "warning" | "success" | "info" }) {
  return (
    <div className="card stat">
      <div className="v num" style={kind ? { color: `var(--${kind})` } : undefined}>{v}</div>
      <div className="l">{l}</div>
    </div>
  );
}

export function AlertBox({ a, children }: { a: CdsAlert; children?: React.ReactNode }) {
  return (
    <div className={`alert ${a.severity}`} role={a.severity === "critical" ? "alert" : "status"}>
      {a.severity === "info" ? <IInfo /> : <IAlert />}
      <div style={{ flex: 1 }}>
        <div className="t">{a.severity === "critical" ? "CRITICAL — " : a.severity === "warning" ? "Warning — " : ""}{a.title}</div>
        <div className="r">{a.rationale}</div>
        <div className="s">Source: {a.source} · Rule {a.rule}</div>
        {children}
      </div>
    </div>
  );
}

export function Sparkline({ values, width = 90, height = 22, low, high }: { values: number[]; width?: number; height?: number; low?: number; high?: number }) {
  if (values.length < 2) return null;
  const min = Math.min(...values, low ?? Infinity);
  const max = Math.max(...values, high ?? -Infinity);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * (width - 4) + 2},${height - 2 - ((v - min) / span) * (height - 4)}`).join(" ");
  const band = low !== undefined && high !== undefined ? { y: height - 2 - ((high - min) / span) * (height - 4), h: ((high - low) / span) * (height - 4) } : null;
  return (
    <svg className="sparkline" width={width} height={height} aria-label="trend">
      {band && <rect x="0" y={band.y} width={width} height={Math.max(1, band.h)} fill="var(--success-bg)" />}
      <polyline points={pts} fill="none" stroke="var(--info)" strokeWidth="1.5" />
      <circle cx={pts.split(" ").at(-1)!.split(",")[0]} cy={pts.split(" ").at(-1)!.split(",")[1]} r="2" fill="var(--info)" />
    </svg>
  );
}

export function Seg<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { v: T; l: string }[] }) {
  return (
    <div className="seg" role="tablist">
      {options.map((o) => <button key={o.v} role="tab" aria-selected={o.v === value} className={o.v === value ? "active" : ""} onClick={() => onChange(o.v)}>{o.l}</button>)}
    </div>
  );
}

export function Avatar({ name, hue, size = 28 }: { name: string; hue?: number; size?: number }) {
  const ini = name.split(/\s+|,\s*/).filter(Boolean).slice(0, 2).map((s) => s[0]!.toUpperCase()).join("");
  return <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.38, background: hue !== undefined ? `hsl(${hue} 40% 45%)` : undefined }}>{ini}</span>;
}
