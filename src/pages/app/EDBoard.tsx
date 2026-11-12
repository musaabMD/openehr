import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../../db/db";
import { useSession } from "../../state/session";
import { usePatientMap, userShort } from "../../db/hooks";
import { Chip, Dialog, statusKind } from "../../components/ui";
import { ageFromDob, fmtTime, patientName, relTime, isoNow } from "../../lib/format";
import { news2, sepsisScreen } from "../../lib/cds";
import { audit, journal } from "../../lib/audit";
import type { Encounter } from "../../db/types";

export default function EDBoard() {
  const s = useSession();
  const pm = usePatientMap();
  const [dispo, setDispo] = useState<Encounter | null>(null);
  const [arrive, setArrive] = useState(false);
  const encs = useLiveQuery(() => db.encounters.where("type").equals("ed").and((e) => e.status !== "discharged" && e.status !== "canceled" && e.status !== "admitted").toArray(), []) ?? [];
  const vitals = useLiveQuery(() => db.vitals.toArray(), []) ?? [];
  const orders = useLiveQuery(() => db.orders.toArray(), []) ?? [];
  const beds = useLiveQuery(() => db.beds.toArray(), []) ?? [];
  const latest = new Map<string, (typeof vitals)[number]>();
  for (const v of vitals) { const c = latest.get(v.patientId); if (!c || c.time < v.time) latest.set(v.patientId, v); }
  const rows = encs.sort((a, b) => (a.acuity ?? 5) - (b.acuity ?? 5) || a.start.localeCompare(b.start));

  async function assignBed(e: Encounter, bedId: string) {
    const bed = await db.beds.get(bedId);
    if (!bed || bed.status !== "available") { s.toast("That bay is no longer available; board refreshed.", "danger"); return; }
    await db.beds.update(bedId, { status: "occupied", patientId: e.patientId });
    await db.encounters.update(e.id, { room: bed.room, bed: bed.bed, unit: "Emergency", status: "in-progress" });
    await audit("ED_ROOM", { patientId: e.patientId, resource: "encounter", resourceId: e.id, detail: `Roomed in ${bed.room}` });
    await journal("update", "encounter", e.id, { room: bed.room }, e.patientId);
    s.toast(`Roomed in ${bed.room}`, "success");
  }

  return (
    <div className="page">
      <div className="page-head"><h1>ED Track Board</h1><span className="sub">{rows.length} patients · {beds.filter((b) => b.unit === "Emergency" && b.status === "available").length} bays open</span><span className="spacer" />{(s.role === "ed" || s.role === "registrar" || s.role === "nurse" || s.role === "admin") && <button className="btn primary" onClick={() => setArrive(true)}>Arrive patient</button>}</div>
      <div className="card"><div className="table-wrap"><table className="grid">
        <thead><tr><th>ESI</th><th>Location</th><th>Patient</th><th>Age/Sex</th><th>Chief complaint</th><th>Arrived</th><th>Waiting</th><th>Team</th><th>NEWS2</th><th>Sepsis</th><th>Pending</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {rows.map((e) => { const p = pm.get(e.patientId); if (!p) return null; const v = latest.get(p.id); const n = v ? news2(v) : null; const sep = v ? sepsisScreen(v) : null; const pend = orders.filter((o) => o.encounterId === e.id && (o.status === "signed" || o.status === "in-progress" || o.status === "collected")).length; return (
            <tr key={e.id}>
              <td><span className={`acuity a${e.acuity ?? 5}`}>{e.acuity ?? "–"}</span></td>
              <td className="num">{e.room ?? <Chip kind="warning">Waiting</Chip>}</td>
              <td><button className="btn ghost sm" style={{ fontWeight: 700 }} onClick={() => s.openPatient(p.id)}>{patientName(p)}</button></td>
              <td>{ageFromDob(p.dob)} {p.sex}</td><td>{e.reason}</td><td className="num">{fmtTime(e.start)}</td><td className="num">{relTime(e.start).replace(" ago", "")}</td><td>{userShort(e.attendingId)}</td>
              <td>{n !== null ? <Chip kind={n >= 7 ? "danger" : n >= 5 ? "warning" : "success"}>{n}</Chip> : "—"}</td>
              <td>{sep?.positive ? <Chip kind="danger">Positive</Chip> : <span className="muted">—</span>}</td>
              <td>{pend ? <Chip kind="info">{pend} open</Chip> : <span className="muted">0</span>}</td>
              <td><Chip kind={statusKind(e.status)}>{e.status}</Chip></td>
              <td className="row" style={{ gap: 4 }}>
                {!e.room && <select className="select" style={{ width: 120, minHeight: 26, padding: "2px 6px" }} defaultValue="" onChange={(ev) => ev.target.value && assignBed(e, ev.target.value)} aria-label="Assign bay"><option value="">Assign bay…</option>{beds.filter((b) => b.unit === "Emergency" && b.status === "available").map((b) => <option key={b.id} value={b.id}>{b.room}</option>)}</select>}
                {(s.role === "ed" || s.role === "physician" || s.role === "admin") && <button className="btn sm" onClick={() => setDispo(e)}>Disposition</button>}
              </td>
            </tr>); })}
          {rows.length === 0 && <tr><td colSpan={13} className="empty">No active ED patients.</td></tr>}
        </tbody></table></div></div>
      {dispo && <DispoDialog e={dispo} onClose={() => setDispo(null)} />}
      {arrive && <ArriveDialog onClose={() => setArrive(false)} />}
    </div>
  );
}

function DispoDialog({ e, onClose }: { e: Encounter; onClose: () => void }) {
  const s = useSession();
  const p = useLiveQuery(() => db.patients.get(e.patientId), [e.patientId]);
  const beds = useLiveQuery(() => db.beds.filter((b) => b.status === "available" && b.unit !== "Emergency").toArray(), []) ?? [];
  const [choice, setChoice] = useState<"admit" | "discharge" | "transfer">("admit");
  const [bedId, setBedId] = useState("");
  async function go() {
    const bay = e.room ? await db.beds.filter((b) => b.unit === "Emergency" && b.room === e.room).first() : undefined;
    if (choice === "admit") {
      const bed = await db.beds.get(bedId);
      if (!bed || bed.status !== "available") { s.toast("Bed is no longer available. Current availability has been refreshed.", "danger"); return; }
      await db.beds.update(bed.id, { status: "occupied", patientId: e.patientId, isolation: p?.isolation });
      if (bay) await db.beds.update(bay.id, { status: "cleaning", patientId: undefined });
      await db.encounters.update(e.id, { status: "admitted", dischargeDisposition: `Admitted to ${bed.unit}`, end: isoNow() });
      const admit: Encounter = { id: uid("enc"), patientId: e.patientId, type: "inpatient", status: "admitted", start: isoNow(), department: bed.unit === "4 ICU" ? "Critical Care" : "Medicine", unit: bed.unit, room: bed.room, bed: bed.bed, attendingId: bed.unit === "4 ICU" ? "u-phys2" : "u-phys1", reason: e.reason, diagnosisCodes: e.diagnosisCodes };
      await db.encounters.add(admit);
      await audit("ED_ADMIT", { patientId: e.patientId, resource: "encounter", resourceId: admit.id, detail: `Admitted to ${bed.unit} ${bed.room}${bed.bed !== "1" ? bed.bed : ""}` });
      await journal("create", "encounter", admit.id, admit, e.patientId);
      s.toast(`Admitted to ${bed.unit} ${bed.room}`, "success");
    } else {
      await db.encounters.update(e.id, { status: "discharged", end: isoNow(), dischargeDisposition: choice === "discharge" ? "Discharged home" : "Transferred to outside facility" });
      if (bay) await db.beds.update(bay.id, { status: "cleaning", patientId: undefined });
      await audit("ED_DISCHARGE", { patientId: e.patientId, resource: "encounter", resourceId: e.id, detail: choice });
      await journal("update", "encounter", e.id, { status: "discharged" }, e.patientId);
      s.toast("Disposition recorded", "success");
    }
    onClose();
  }
  return (
    <Dialog title={`Disposition — ${p ? patientName(p) : ""}`} onClose={onClose} size="narrow" footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={choice === "admit" && !bedId} onClick={go}>Confirm</button></>}>
      <div className="stack">
        <div className="row"><label className="row"><input type="radio" checked={choice === "admit"} onChange={() => setChoice("admit")} /> Admit</label><label className="row"><input type="radio" checked={choice === "discharge"} onChange={() => setChoice("discharge")} /> Discharge</label><label className="row"><input type="radio" checked={choice === "transfer"} onChange={() => setChoice("transfer")} /> Transfer out</label></div>
        {choice === "admit" && <div className="field"><label>Reserve bed (server-side reservation; conflicts return current availability)</label><select className="select" value={bedId} onChange={(ev) => setBedId(ev.target.value)}><option value="">Select bed…</option>{beds.map((b) => <option key={b.id} value={b.id}>{b.unit} · {b.room}{b.bed !== "1" ? b.bed : ""}</option>)}</select></div>}
        <div className="small muted">Confirming records the disposition for <b>{p ? patientName(p) : ""}</b> (MRN {p?.mrn}). Unsigned ED notes remain in the author's draft list.</div>
      </div>
    </Dialog>
  );
}

function ArriveDialog({ onClose }: { onClose: () => void }) {
  const s = useSession();
  const [q, setQ] = useState("");
  const [patientId, setPatientId] = useState("");
  const [reason, setReason] = useState("");
  const [acuity, setAcuity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const results = useLiveQuery(async () => { const t = q.toLowerCase().trim(); if (t.length < 2) return []; return (await db.patients.toArray()).filter((p) => `${p.lastName} ${p.firstName}`.toLowerCase().includes(t) || p.mrn.includes(t)).slice(0, 6); }, [q]) ?? [];
  const pat = useLiveQuery(() => (patientId ? db.patients.get(patientId) : undefined), [patientId]);
  async function save() {
    if (!patientId || !reason) return;
    const e: Encounter = { id: uid("enc"), patientId, type: "ed", status: "triaged", start: isoNow(), department: "Emergency", unit: "Emergency", attendingId: "u-ed1", reason, acuity, diagnosisCodes: [] };
    await db.encounters.add(e);
    await audit("ED_ARRIVE", { patientId, resource: "encounter", resourceId: e.id, detail: `ESI ${acuity}: ${reason}` });
    await journal("create", "encounter", e.id, e, patientId);
    s.toast("Patient arrived and triaged", "success"); onClose();
  }
  return (
    <Dialog title="Arrive & triage" onClose={onClose} size="narrow" footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!patientId || !reason} onClick={save}>Arrive</button></>}>
      <div className="stack">
        <div className="field"><label>Patient</label>{pat ? <div className="row"><b>{patientName(pat)}</b><span className="muted">MRN {pat.mrn}</span><button className="btn sm ghost" onClick={() => setPatientId("")}>Change</button></div> : <><input className="input" placeholder="Search name or MRN" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />{results.map((p) => <button key={p.id} className="btn ghost sm" style={{ justifyContent: "flex-start" }} onClick={() => setPatientId(p.id)}>{patientName(p)} · {p.mrn}</button>)}</>}</div>
        <div className="field"><label>Chief complaint</label><input className="input" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
        <div className="field"><label>Triage acuity (ESI)</label><div className="seg">{[1, 2, 3, 4, 5].map((a) => <button key={a} className={acuity === a ? "active" : ""} onClick={() => setAcuity(a as 1)}>{a}</button>)}</div></div>
      </div>
    </Dialog>
  );
}
