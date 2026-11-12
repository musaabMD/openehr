import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db/db";
import { userName } from "../../../db/hooks";
import { Chip, Seg, statusKind } from "../../../components/ui";
import { fmtDateTime } from "../../../lib/format";
import type { Patient } from "../../../db/types";

type Tab = "all" | "encounters" | "notes" | "labs" | "imaging" | "meds" | "orders";

export default function ChartReview({ patient: p }: { patient: Patient }) {
  const [tab, setTab] = useState<Tab>("all");
  const encs = useLiveQuery(() => db.encounters.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const notes = useLiveQuery(() => db.notes.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const labs = useLiveQuery(() => db.labs.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const imaging = useLiveQuery(() => db.imaging.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const meds = useLiveQuery(() => db.medications.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const orders = useLiveQuery(() => db.orders.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const panels = new Map<string, typeof labs>();
  for (const l of labs) { const k = `${l.panel}|${l.collected}|${l.orderId}`; panels.set(k, [...(panels.get(k) ?? []), l]); }
  type Ev = { t: string; kind: Tab; title: string; detail: string; status?: string; who?: string };
  const events: Ev[] = [
    ...encs.map((e) => ({ t: e.start, kind: "encounters" as Tab, title: `${e.type === "ed" ? "Emergency" : e.type[0]!.toUpperCase() + e.type.slice(1)} encounter — ${e.department}`, detail: `${e.reason}${e.dischargeDisposition ? " · " + e.dischargeDisposition : ""}`, status: e.status, who: userName(e.attendingId) })),
    ...notes.map((n) => ({ t: n.signedAt ?? n.updated, kind: "notes" as Tab, title: n.title, detail: n.body.replace(/\n+/g, " ").slice(0, 160) + "…", status: n.status, who: userName(n.authorId) })),
    ...[...panels.values()].map((rows) => ({ t: rows[0]!.collected, kind: "labs" as Tab, title: rows[0]!.panel, detail: rows.map((r) => `${r.name} ${r.value}${r.flag ? " (" + r.flag + ")" : ""}`).join(", "), status: rows.some((r) => r.flag) ? "abnormal" : "normal" })),
    ...imaging.map((i) => ({ t: i.scheduledAt ?? "", kind: "imaging" as Tab, title: i.description, detail: i.reportText?.split("IMPRESSION:")[1]?.trim() ?? "Report pending", status: i.status, who: i.radiologistId ? userName(i.radiologistId) : undefined })),
    ...meds.map((m) => ({ t: m.start, kind: "meds" as Tab, title: m.name, detail: `${m.dose} ${m.route} ${m.frequency} · ${m.isInpatient ? "inpatient" : "home"}`, status: m.status, who: userName(m.prescriberId) })),
    ...orders.filter((o) => o.category !== "medication" && o.category !== "lab").map((o) => ({ t: o.orderedAt, kind: "orders" as Tab, title: o.display, detail: `${o.category} · ${o.priority}`, status: o.status, who: userName(o.orderedBy) })),
  ].filter((e) => e.t).sort((a, b) => b.t.localeCompare(a.t));
  const shown = events.filter((e) => tab === "all" || e.kind === tab);
  return (
    <div className="stack">
      <div className="row"><h2 style={{ margin: 0, fontSize: 18 }}>Chart Review</h2><Seg value={tab} onChange={setTab} options={[{ v: "all", l: `All (${events.length})` }, { v: "encounters", l: "Encounters" }, { v: "notes", l: "Notes" }, { v: "labs", l: "Labs" }, { v: "imaging", l: "Imaging" }, { v: "meds", l: "Meds" }, { v: "orders", l: "Other orders" }]} /></div>
      <div className="card"><ul className="timeline" style={{ padding: "0 14px" }}>
        {shown.slice(0, 200).map((e, i) => <li key={i}><span className="when num">{fmtDateTime(e.t)}</span><span><div className="row" style={{ gap: 6 }}><Chip kind="neutral">{e.kind}</Chip><b>{e.title}</b>{e.status && <Chip kind={e.status === "abnormal" ? "warning" : statusKind(e.status)}>{e.status}</Chip>}{e.who && <span className="small muted">· {e.who}</span>}</div><div className="small muted">{e.detail}</div></span></li>)}
        {shown.length === 0 && <li className="empty">Nothing to review</li>}
      </ul></div>
    </div>
  );
}
