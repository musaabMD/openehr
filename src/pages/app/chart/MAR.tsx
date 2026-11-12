import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db/db";
import { useSession } from "../../../state/session";
import { userName } from "../../../db/hooks";
import { Chip, Dialog } from "../../../components/ui";
import { fmtDate, fmtTime, isoNow, patientName } from "../../../lib/format";
import { audit, journal } from "../../../lib/audit";
import { IBarcode, ICheck } from "../../../components/Icons";
import type { Administration, Medication, Patient } from "../../../db/types";

export default function MAR({ patient: p }: { patient: Patient }) {
  const s = useSession();
  const meds = useLiveQuery(() => db.medications.where("patientId").equals(p.id).and((m) => m.isInpatient).toArray(), [p.id]) ?? [];
  const admins = useLiveQuery(() => db.administrations.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const verif = useLiveQuery(() => db.pharmacy.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const [sel, setSel] = useState<{ a: Administration; m: Medication } | null>(null);
  const [day, setDay] = useState(new Date().toISOString().slice(0, 10));
  const slots = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
  const dayAdmins = admins.filter((a) => a.scheduled.slice(0, 10) === day);
  const canAdmin = s.role === "nurse" || s.role === "admin";
  const now = Date.now();
  const verifiedFor = (m: Medication) => { const v = verif.filter((x) => x.medName === m.name).sort((a, b) => b.created.localeCompare(a.created))[0]; return v ? v.status : "verified"; };
  const active = meds.filter((m) => m.status !== "discontinued" && m.status !== "completed");

  return (
    <div className="stack">
      <div className="row"><h2 style={{ margin: 0, fontSize: 18 }}>MAR — Medication Administration Record</h2><input type="date" className="input" style={{ width: 160 }} value={day} onChange={(e) => setDay(e.target.value)} aria-label="Day" /><span className="spacer" /><span className="small muted">Scan → verify → document. Five rights: patient, drug, dose, route, time.</span></div>
      <div className="card"><div className="table-wrap"><table className="grid compact mar-grid">
        <thead><tr><th style={{ minWidth: 260 }}>Medication</th>{slots.map((t) => <th key={t} className="slot">{t}</th>)}<th>PRN / other</th></tr></thead>
        <tbody>
          {active.map((m) => { const v = verifiedFor(m); const rows = dayAdmins.filter((a) => a.medicationId === m.id); return (
            <tr key={m.id}>
              <td><b>{m.name}</b><div className="small muted">{m.dose} {m.route} {m.frequency}{m.prn ? " · PRN" : ""} · {userName(m.prescriberId).split(",")[0]}</div><div className="row" style={{ gap: 4 }}>{m.status === "held" && <Chip kind="warning">held</Chip>}{v === "pending" && <Chip kind="warning">pharmacy verification pending</Chip>}{v === "rejected" && <Chip kind="danger">rejected by pharmacy</Chip>}{v === "clarify" && <Chip kind="warning">clarification requested</Chip>}</div></td>
              {slots.map((t) => { const [hh] = t.split(":").map(Number); const inSlot = rows.filter((a) => { const h = new Date(a.scheduled).getHours(); return h >= hh! && h < hh! + 2 && !m.prn; }); return <td key={t} className="slot">{inSlot.map((a) => { const overdue = a.status === "due" && new Date(a.scheduled).getTime() < now - 60 * 60000; return <button key={a.id} className={"mar-pill " + (overdue ? "overdue" : a.status)} title={`${a.status} · scheduled ${fmtTime(a.scheduled)}${a.actionTime ? " · " + fmtTime(a.actionTime) : ""}${a.nurseId ? " · " + userName(a.nurseId) : ""}${a.note ? " · " + a.note : ""}`} onClick={() => setSel({ a, m })}>{fmtTime(a.scheduled)}<br /><span style={{ fontSize: 10.5 }}>{overdue ? "OVERDUE" : a.status}</span></button>; })}</td>; })}
              <td>{rows.filter((a) => m.prn).map((a) => <button key={a.id} className={"mar-pill " + a.status} onClick={() => setSel({ a, m })}>{fmtTime(a.scheduled)} {a.status}</button>)}{m.prn && canAdmin && <button className="btn sm ghost" onClick={async () => { const a: Administration = { id: "adm_" + Math.random().toString(36).slice(2), patientId: p.id, medicationId: m.id, scheduled: isoNow(), status: "due", barcodeVerified: false }; await db.administrations.add(a); setSel({ a, m }); }}>+ PRN dose</button>}</td>
            </tr>); })}
          {active.length === 0 && <tr><td colSpan={14} className="empty">No inpatient medications ordered.</td></tr>}
        </tbody></table></div>
        <div className="card-b row small"><span className="mar-pill due">due</span><span className="mar-pill given">given</span><span className="mar-pill held">held</span><span className="mar-pill missed">missed</span><span className="mar-pill overdue">overdue</span><span className="muted">Showing {fmtDate(day + "T00:00:00")}. Stale data, discontinued orders and mismatches get explicit handling in the administration dialog.</span></div>
      </div>
      {sel && <AdminDialog patient={p} a={sel.a} m={sel.m} verification={verifiedFor(sel.m)} onClose={() => setSel(null)} canAdmin={canAdmin} />}
    </div>
  );
}

function AdminDialog({ patient: p, a, m, verification, onClose, canAdmin }: { patient: Patient; a: Administration; m: Medication; verification: string; onClose: () => void; canAdmin: boolean }) {
  const s = useSession();
  const [ptScan, setPtScan] = useState("");
  const [medScan, setMedScan] = useState("");
  const [note, setNote] = useState("");
  const ptOk = ptScan.trim() === p.mrn;
  const medCode = "MED-" + m.generic.toUpperCase().replace(/[^A-Z0-9]+/g, "-").slice(0, 18);
  const medOk = medScan.trim().toUpperCase() === medCode;
  const blocked = m.status === "held" || m.status === "discontinued" || verification === "rejected" || verification === "pending";
  const stale = Date.now() - new Date(a.scheduled).getTime() > 2 * 3600e3 && a.status === "due";
  async function document(status: Administration["status"]) {
    if (status === "given" && !(ptOk && medOk)) return;
    const patch: Partial<Administration> = { status, actionTime: isoNow(), nurseId: s.user.id, barcodeVerified: status === "given", note: note || undefined };
    await db.administrations.update(a.id, patch);
    await audit("MAR_" + status.toUpperCase(), { patientId: p.id, resource: "administration", resourceId: a.id, detail: `${m.name} ${m.dose} ${m.route}${note ? " — " + note : ""}` });
    await journal("update", "administration", a.id, patch, p.id);
    s.toast(status === "given" ? `Documented: ${m.name} given` : `Documented: ${status}`, status === "given" ? "success" : "warning"); onClose();
  }
  return (
    <Dialog title={<><IBarcode width={18} height={18} /> Administer — {m.name}</>} onClose={onClose} size="narrow" footer={canAdmin && a.status === "due" ? <><button className="btn" onClick={onClose}>Cancel</button><button className="btn" onClick={() => document("held")} disabled={!note.trim()}>Hold</button><button className="btn" onClick={() => document("refused")} disabled={!note.trim()}>Refused</button><button className="btn primary" disabled={!ptOk || !medOk || blocked} onClick={() => document("given")}><ICheck /> Document given</button></> : <button className="btn" onClick={onClose}>Close</button>}>
      <div className="stack">
        <div className="card"><div className="card-b small"><div className="row" style={{ justifyContent: "space-between" }}><span>Patient</span><b>{patientName(p)} · MRN {p.mrn}</b></div><div className="row" style={{ justifyContent: "space-between" }}><span>Drug</span><b>{m.name}</b></div><div className="row" style={{ justifyContent: "space-between" }}><span>Dose / route</span><b>{m.dose} {m.route}</b></div><div className="row" style={{ justifyContent: "space-between" }}><span>Scheduled</span><b>{fmtDate(a.scheduled)} {fmtTime(a.scheduled)}</b></div><div className="row" style={{ justifyContent: "space-between" }}><span>Last given</span><b>{a.actionTime ? fmtTime(a.actionTime) : "—"}</b></div></div></div>
        {a.status !== "due" && <div className="alert info"><div><div className="t">Already documented: {a.status}</div><div className="r">{a.actionTime ? fmtDate(a.actionTime) + " " + fmtTime(a.actionTime) : ""} by {userName(a.nurseId)}{a.note ? " — " + a.note : ""}</div></div></div>}
        {blocked && <div className="alert critical"><div><div className="t">{m.status === "held" ? "Order is on hold" : m.status === "discontinued" ? "Order discontinued" : verification === "rejected" ? "Pharmacy rejected this order" : "Pharmacy verification pending"}</div><div className="r">Administration is blocked until the order state is resolved.</div></div></div>}
        {stale && <div className="alert warning"><div><div className="t">Scheduled time is more than 2 hours ago</div><div className="r">Confirm the dose is still appropriate before giving; document the reason if late.</div></div></div>}
        {canAdmin && a.status === "due" && (<>
          <div className="field"><label>Scan patient wristband (demo: type MRN)</label><input className="input mono" value={ptScan} onChange={(e) => setPtScan(e.target.value.replace(/[^0-9A-Za-z-]/g, ""))} placeholder="MRN barcode" autoFocus />{ptScan && (ptOk ? <span className="small" style={{ color: "var(--success)" }}>✓ Patient match</span> : <span className="small" style={{ color: "var(--danger)" }}>✗ Mismatch — wrong patient. Do not administer.</span>)}</div>
          <div className="field"><label>Scan medication (demo barcode: <span className="kbd">{medCode}</span>)</label><input className="input mono" value={medScan} onChange={(e) => setMedScan(e.target.value.replace(/[^0-9A-Za-z-]/g, ""))} placeholder="Medication barcode" />{medScan && (medOk ? <span className="small" style={{ color: "var(--success)" }}>✓ Drug, dose and route match the active order</span> : <span className="small" style={{ color: "var(--danger)" }}>✗ Barcode does not match this order</span>)}</div>
          <div className="field"><label>Note (required for hold / refused)</label><input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. SBP 88, provider notified" /></div>
        </>)}
        {!canAdmin && <div className="small muted">Only nursing can document administration. Your role can view the MAR.</div>}
      </div>
    </Dialog>
  );
}
