import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";
import { useSession } from "../../state/session";
import { usePatientMap } from "../../db/hooks";
import { Chip, Dialog } from "../../components/ui";
import { ageFromDob, patientName, isoNow } from "../../lib/format";
import { audit, journal } from "../../lib/audit";
import type { Bed } from "../../db/types";

export default function BedBoard() {
  const s = useSession();
  const pm = usePatientMap();
  const beds = useLiveQuery(() => db.beds.toArray(), []) ?? [];
  const [sel, setSel] = useState<Bed | null>(null);
  const units = ["3 North", "4 ICU", "5 South", "Emergency"];
  const counts = (u: string) => { const b = beds.filter((x) => x.unit === u); return { occ: b.filter((x) => x.status === "occupied").length, avail: b.filter((x) => x.status === "available").length, clean: b.filter((x) => x.status === "cleaning").length, total: b.length }; };
  return (
    <div className="page">
      <div className="page-head"><h1>Bed Board</h1><span className="sub">{beds.filter((b) => b.status === "occupied").length} occupied · {beds.filter((b) => b.status === "available").length} available · {beds.filter((b) => b.status === "cleaning").length} cleaning</span></div>
      <div className="stack">
        {units.map((u) => { const c = counts(u); return (
          <section className="card" key={u}>
            <div className="card-h">{u}<span className="muted" style={{ fontWeight: 400 }}>{c.occ}/{c.total} occupied</span><span className="spacer" /><Chip kind="success">{c.avail} open</Chip>{c.clean > 0 && <Chip kind="warning">{c.clean} cleaning</Chip>}</div>
            <div className="card-b board">
              {beds.filter((b) => b.unit === u).sort((a, b) => a.room.localeCompare(b.room) || a.bed.localeCompare(b.bed)).map((b) => { const p = b.patientId ? pm.get(b.patientId) : undefined; return (
                <div key={b.id} className={`bedcard ${b.status}`} onClick={() => setSel(b)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSel(b)}>
                  <div className="row" style={{ justifyContent: "space-between" }}><span className="bid">{b.room}{b.bed !== "1" ? b.bed : ""}</span><Chip kind={b.status === "occupied" ? "info" : b.status === "available" ? "success" : b.status === "cleaning" ? "warning" : "danger"}>{b.status}</Chip></div>
                  {p ? <div style={{ marginTop: 4 }}><b>{patientName(p)}</b><div className="muted">{ageFromDob(p.dob)} {p.sex} · {p.mrn}</div>{p.isolation && <Chip kind="warning">{p.isolation}</Chip>}</div> : <div className="muted" style={{ marginTop: 6 }}>{b.status === "available" ? "Ready for assignment" : b.status === "cleaning" ? "Housekeeping in progress" : "Blocked"}</div>}
                </div>); })}
            </div>
          </section>); })}
      </div>
      {sel && <BedDialog bed={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function BedDialog({ bed, onClose }: { bed: Bed; onClose: () => void }) {
  const s = useSession();
  const p = useLiveQuery(() => (bed.patientId ? db.patients.get(bed.patientId) : undefined), [bed.patientId]);
  const waiting = useLiveQuery(async () => { const encs = await db.encounters.filter((e) => (e.status === "admitted" || e.status === "in-progress" || e.status === "triaged") && e.type !== "outpatient").toArray(); const beds = await db.beds.toArray(); return encs.filter((e) => !beds.some((b) => b.patientId === e.patientId && b.unit === e.unit)).slice(0, 30); }, []) ?? [];
  const pm = usePatientMap();
  const [target, setTarget] = useState("");
  const [assignPid, setAssignPid] = useState("");
  const avail = useLiveQuery(() => db.beds.filter((b) => b.status === "available" && b.unit !== "Emergency" && b.id !== bed.id).toArray(), [bed.id]) ?? [];
  const canManage = s.role === "nurse" || s.role === "registrar" || s.role === "admin" || s.role === "physician" || s.role === "ed";

  async function markClean() { await db.beds.update(bed.id, { status: "available" }); await audit("BED_CLEAN", { resource: "bed", resourceId: bed.id, detail: `${bed.unit} ${bed.room} ready` }); s.toast("Bed ready", "success"); onClose(); }
  async function block(v: boolean) { await db.beds.update(bed.id, { status: v ? "blocked" : "available" }); await audit(v ? "BED_BLOCK" : "BED_UNBLOCK", { resource: "bed", resourceId: bed.id, detail: bed.room }); onClose(); }
  async function discharge() {
    if (!bed.patientId) return;
    await db.beds.update(bed.id, { status: "cleaning", patientId: undefined, isolation: undefined });
    await db.encounters.where("patientId").equals(bed.patientId).and((e) => e.status === "admitted" || e.status === "in-progress").modify({ status: "discharged", end: isoNow(), dischargeDisposition: "Discharged home" });
    await audit("DISCHARGE", { patientId: bed.patientId, resource: "encounter", detail: `Discharged from ${bed.unit} ${bed.room}` });
    await journal("update", "encounter", bed.patientId, { status: "discharged" }, bed.patientId);
    s.toast("Patient discharged; bed sent to housekeeping", "success"); onClose();
  }
  async function transfer() {
    const t = await db.beds.get(target);
    if (!t || t.status !== "available" || !bed.patientId) { s.toast("Target bed no longer available", "danger"); return; }
    await db.beds.update(t.id, { status: "occupied", patientId: bed.patientId, isolation: bed.isolation });
    await db.beds.update(bed.id, { status: "cleaning", patientId: undefined, isolation: undefined });
    await db.encounters.where("patientId").equals(bed.patientId).and((e) => e.status === "admitted").modify({ unit: t.unit, room: t.room, bed: t.bed, department: t.unit === "4 ICU" ? "Critical Care" : "Medicine" });
    await audit("TRANSFER", { patientId: bed.patientId, resource: "encounter", detail: `${bed.unit} ${bed.room} → ${t.unit} ${t.room}` });
    await journal("update", "encounter", bed.patientId, { unit: t.unit, room: t.room }, bed.patientId);
    s.toast(`Transferred to ${t.unit} ${t.room}`, "success"); onClose();
  }
  async function assign() {
    const cur = await db.beds.get(bed.id);
    if (!cur || cur.status !== "available") { s.toast("Bed was taken by another workstation; board refreshed.", "danger"); onClose(); return; }
    const enc = waiting.find((e) => e.patientId === assignPid);
    const pat = pm.get(assignPid);
    await db.beds.update(bed.id, { status: "occupied", patientId: assignPid, isolation: pat?.isolation });
    if (enc) await db.encounters.update(enc.id, { unit: bed.unit, room: bed.room, bed: bed.bed, status: enc.type === "ed" ? "in-progress" : "admitted" });
    await audit("BED_ASSIGN", { patientId: assignPid, resource: "bed", resourceId: bed.id, detail: `${bed.unit} ${bed.room}` });
    await journal("update", "bed", bed.id, { patientId: assignPid }, assignPid);
    s.toast("Bed assigned", "success"); onClose();
  }
  return (
    <Dialog title={`${bed.unit} · ${bed.room}${bed.bed !== "1" ? bed.bed : ""}`} onClose={onClose} size="narrow">
      <div className="stack">
        {p && <div className="card"><div className="card-b"><b>{patientName(p)}</b> · {ageFromDob(p.dob)} {p.sex} · MRN {p.mrn}<div className="row" style={{ marginTop: 6 }}><button className="btn sm" onClick={() => { onClose(); s.openPatient(p.id); }}>Open chart</button>{p.isolation && <Chip kind="warning">{p.isolation}</Chip>}<Chip kind={p.codeStatus === "Full Code" ? "neutral" : "danger"}>{p.codeStatus}</Chip></div></div></div>}
        {bed.status === "occupied" && canManage && <>
          <div className="field"><label>Transfer to</label><div className="row"><select className="select" value={target} onChange={(e) => setTarget(e.target.value)}><option value="">Select bed…</option>{avail.map((b) => <option key={b.id} value={b.id}>{b.unit} · {b.room}{b.bed !== "1" ? b.bed : ""}</option>)}</select><button className="btn" disabled={!target} onClick={transfer}>Transfer</button></div></div>
          <button className="btn danger" onClick={discharge}>Discharge patient from this bed</button>
        </>}
        {bed.status === "available" && canManage && <div className="field"><label>Assign a patient waiting for a bed</label><div className="row"><select className="select" value={assignPid} onChange={(e) => setAssignPid(e.target.value)}><option value="">Select patient…</option>{waiting.map((e) => { const pt = pm.get(e.patientId); return pt ? <option key={e.id} value={e.patientId}>{patientName(pt)} · {e.type} · {e.reason}</option> : null; })}</select><button className="btn primary" disabled={!assignPid} onClick={assign}>Assign</button></div></div>}
        {bed.status === "cleaning" && canManage && <button className="btn primary" onClick={markClean}>Mark cleaned and ready</button>}
        {bed.status === "available" && canManage && <button className="btn" onClick={() => block(true)}>Block bed (maintenance)</button>}
        {bed.status === "blocked" && canManage && <button className="btn" onClick={() => block(false)}>Unblock</button>}
        {!canManage && <div className="muted">Your role can view the board but not change assignments.</div>}
      </div>
    </Dialog>
  );
}
