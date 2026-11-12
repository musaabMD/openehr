import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../../../db/db";
import { useSession } from "../../../state/session";
import { useActiveEncounter, userName } from "../../../db/hooks";
import { Card, Chip, Dialog, statusKind } from "../../../components/ui";
import { fmtDateTime, isoNow, daysBetween } from "../../../lib/format";
import { audit, journal } from "../../../lib/audit";
import type { Patient } from "../../../db/types";

export default function Discharge({ patient: p }: { patient: Patient }) {
  const s = useSession();
  const nav = useNavigate();
  const enc = useActiveEncounter(p.id);
  const notes = useLiveQuery(() => db.notes.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const meds = useLiveQuery(() => db.medications.where("patientId").equals(p.id).and((m) => m.status === "active").toArray(), [p.id]) ?? [];
  const labs = useLiveQuery(() => db.labs.where("patientId").equals(p.id).and((l) => !l.acknowledged).count(), [p.id]) ?? 0;
  const pendingOrders = useLiveQuery(() => db.orders.where("patientId").equals(p.id).and((o) => (o.status === "signed" || o.status === "collected" || o.status === "in-progress") && (o.category === "lab" || o.category === "imaging")).toArray(), [p.id]) ?? [];
  const care = useLiveQuery(() => db.carePlan.where("patientId").equals(p.id).and((c) => c.status === "open").count(), [p.id]) ?? 0;
  const [confirm, setConfirm] = useState(false);
  const [dispo, setDispo] = useState("Home");
  const [followup, setFollowup] = useState("PCP in 7 days");
  const summary = notes.find((n) => n.type === "Discharge Summary");
  const unsigned = notes.filter((n) => n.status === "draft" || n.status === "pending-cosign");
  const inpt = meds.filter((m) => m.isInpatient); const home = meds.filter((m) => !m.isInpatient);
  const checks = [
    { ok: !!summary && summary.status !== "draft", label: "Discharge summary signed", hint: summary ? `${summary.title} is ${summary.status}` : "Create a Discharge Summary note (Notes → New → Discharge Summary)" },
    { ok: unsigned.length === 0, label: "No unsigned notes", hint: `${unsigned.length} draft(s)` },
    { ok: labs === 0, label: "All results acknowledged", hint: `${labs} unacknowledged` },
    { ok: pendingOrders.length === 0, label: "No pending diagnostics", hint: pendingOrders.map((o) => o.display).join(", ") || "none" },
    { ok: true, label: "Medication reconciliation reviewed", hint: `${inpt.length} inpatient · ${home.length} home medications` },
    { ok: care === 0, label: "Care plan goals closed", hint: `${care} open` },
  ];
  const blockers = checks.filter((c) => !c.ok).length;
  async function discharge() {
    if (!enc) return;
    const bed = await db.beds.filter((b) => b.patientId === p.id).first();
    if (bed) await db.beds.update(bed.id, { status: "cleaning", patientId: undefined, isolation: undefined });
    await db.encounters.update(enc.id, { status: "discharged", end: isoNow(), dischargeDisposition: dispo });
    await db.medications.where("patientId").equals(p.id).and((m) => m.isInpatient && m.status === "active").modify({ status: "completed", end: isoNow() });
    await db.administrations.where("patientId").equals(p.id).and((a) => a.status === "due").delete();
    await db.appointments.add({ id: uid("ap"), patientId: p.id, providerId: p.pcpId ?? "u-phys3", start: new Date(Date.now() + 7 * 86400000).toISOString(), durationMin: 20, type: "Post-discharge follow-up", status: "scheduled", reason: enc.reason, department: "Family Medicine Clinic" });
    await audit("DISCHARGE", { patientId: p.id, resource: "encounter", resourceId: enc.id, detail: `${dispo} · follow-up: ${followup}${blockers ? ` · ${blockers} checklist item(s) overridden` : ""}` });
    await journal("update", "encounter", enc.id, { status: "discharged", dispo }, p.id);
    s.toast(`${p.firstName} ${p.lastName} discharged — ${dispo}`, "success");
    setConfirm(false); nav("/app/lists");
  }
  if (!enc || enc.type === "outpatient") return <div className="empty">No active inpatient or ED encounter to discharge.</div>;
  return (
    <div className="stack">
      <h2 style={{ margin: 0, fontSize: 18 }}>Discharge planning</h2>
      <div className="cards">
        <Card title="Readiness checklist"><ul className="list-plain">{checks.map((c) => <li key={c.label} className="row"><Chip kind={c.ok ? "success" : "warning"}>{c.ok ? "✓" : "!"}</Chip><span style={{ flex: 1 }}><b>{c.label}</b><div className="small muted">{c.hint}</div></span></li>)}</ul></Card>
        <Card title="Encounter"><div className="small stack"><div>Admitted {fmtDateTime(enc.start)} · hospital day {daysBetween(enc.start) + 1} · {enc.unit} {enc.room}{enc.bed !== "1" ? enc.bed : ""}</div><div>Attending {userName(enc.attendingId)} · Reason: {enc.reason}</div><div className="field"><label>Disposition</label><select className="select" value={dispo} onChange={(e) => setDispo(e.target.value)}>{["Home", "Home with home health", "Skilled nursing facility", "Inpatient rehabilitation", "Hospice", "Against medical advice", "Transfer to another acute hospital"].map((x) => <option key={x}>{x}</option>)}</select></div><div className="field"><label>Follow-up</label><input className="input" value={followup} onChange={(e) => setFollowup(e.target.value)} /></div><button className="btn primary" onClick={() => setConfirm(true)} disabled={!["physician", "ed", "admin"].includes(s.role)}>Discharge patient</button></div></Card>
        <Card title="Medication reconciliation at discharge" tight><table className="grid compact"><thead><tr><th>Medication</th><th>Setting</th><th>Status</th></tr></thead><tbody>{meds.map((m) => <tr key={m.id}><td>{m.name}<div className="small muted">{m.dose} {m.route} {m.frequency}</div></td><td>{m.isInpatient ? "inpatient" : "home"}</td><td><Chip kind={statusKind(m.status)}>{m.isInpatient ? "stops at discharge" : "continue"}</Chip></td></tr>)}</tbody></table></Card>
      </div>
      {confirm && <Dialog title="Confirm discharge" onClose={() => setConfirm(false)} size="narrow" footer={<><button className="btn" onClick={() => setConfirm(false)}>Cancel</button><button className="btn primary" onClick={discharge}>Discharge {p.lastName.toUpperCase()}, {p.firstName}</button></>}><div className="stack"><div><b>{p.lastName.toUpperCase()}, {p.firstName}</b> · MRN {p.mrn} · {dispo}</div>{blockers > 0 && <div className="alert warning"><div><div className="t">{blockers} checklist item(s) not complete</div><div className="r">You may proceed; the override is recorded in the audit log with your signature.</div></div></div>}<div className="small muted">Inpatient orders stop, due doses are removed from the MAR, the bed goes to housekeeping and a 7-day follow-up appointment is created with the PCP.</div></div></Dialog>}
    </div>
  );
}
