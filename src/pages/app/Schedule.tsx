import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../../db/db";
import { useSession } from "../../state/session";
import { usePatientMap, userName, USER_MAP } from "../../db/hooks";
import { Chip, Dialog, statusKind } from "../../components/ui";
import { ageFromDob, fmtTime, patientName, isoNow } from "../../lib/format";
import { audit, journal } from "../../lib/audit";
import type { Appointment } from "../../db/types";

export default function Schedule() {
  const s = useSession();
  const pm = usePatientMap();
  const [provider, setProvider] = useState("all");
  const [day, setDay] = useState(new Date().toISOString().slice(0, 10));
  const [book, setBook] = useState(false);
  const appts = useLiveQuery(() => db.appointments.filter((a) => a.start.slice(0, 10) === day).toArray(), [day]) ?? [];
  const rows = appts.filter((a) => provider === "all" || a.providerId === provider).sort((a, b) => a.start.localeCompare(b.start));
  const providers = [...USER_MAP.values()].filter((u) => u.role === "physician" || u.role === "ed");
  const nowIso = isoNow();

  async function setStatus(a: Appointment, status: Appointment["status"]) {
    const patch: Partial<Appointment> = { status };
    if (status === "roomed") patch.room = `Exam ${1 + (a.id.charCodeAt(a.id.length - 1) % 6)}`;
    await db.appointments.update(a.id, patch);
    await audit("APPT_" + status.toUpperCase().replace("-", "_"), { patientId: a.patientId, resource: "appointment", resourceId: a.id, detail: `${a.type} ${fmtTime(a.start)} → ${status}` });
    await journal("update", "appointment", a.id, patch, a.patientId);
    if (status === "checked-in") {
      const existing = await db.encounters.where("patientId").equals(a.patientId).and((e) => e.start.slice(0, 10) === day && e.type === "outpatient").first();
      if (!existing) await db.encounters.add({ id: uid("enc"), patientId: a.patientId, type: "outpatient", status: "arrived", start: nowIso, department: a.department, attendingId: a.providerId, reason: a.reason, diagnosisCodes: [] });
    }
    if (status === "in-visit") {
      await db.encounters.where("patientId").equals(a.patientId).and((e) => e.start.slice(0, 10) === day && e.type === "outpatient").modify({ status: "in-progress" });
      s.openPatient(a.patientId);
    }
    if (status === "completed") await db.encounters.where("patientId").equals(a.patientId).and((e) => e.start.slice(0, 10) === day && e.type === "outpatient").modify({ status: "discharged", end: nowIso });
    s.toast(`Appointment marked ${status}`, "success");
  }

  return (
    <div className="page">
      <div className="page-head"><h1>Schedule</h1>
        <input type="date" className="input" style={{ width: 160 }} value={day} onChange={(e) => setDay(e.target.value)} aria-label="Date" />
        <select className="select" style={{ width: 240 }} value={provider} onChange={(e) => setProvider(e.target.value)} aria-label="Provider"><option value="all">All providers</option>{providers.map((u) => <option key={u.id} value={u.id}>{userName(u.id)}</option>)}</select>
        <span className="spacer" />
        {(s.role === "registrar" || s.role === "admin" || s.role === "physician") && <button className="btn primary" onClick={() => setBook(true)}>Book appointment</button>}
      </div>
      <div className="card"><div className="table-wrap"><table className="grid">
        <thead><tr><th>Time</th><th>Patient</th><th>Age/Sex</th><th>MRN</th><th>Type</th><th>Reason</th><th>Provider</th><th>Room</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          {rows.map((a) => { const p = pm.get(a.patientId); if (!p) return null; const isNow = Math.abs(new Date(a.start).getTime() - Date.now()) < 15 * 60000; return (
            <tr key={a.id} className={"schedule-row" + (isNow ? " now" : "")}>
              <td className="num">{fmtTime(a.start)} <span className="muted small">{a.durationMin}m</span></td>
              <td><button className="btn ghost sm" style={{ fontWeight: 700 }} onClick={() => s.openPatient(p.id)}>{patientName(p)}</button></td>
              <td>{ageFromDob(p.dob)} {p.sex}</td><td className="mono">{p.mrn}</td><td>{a.type}</td><td>{a.reason}</td><td>{userName(a.providerId)}</td><td>{a.room ?? ""}</td>
              <td><Chip kind={statusKind(a.status)}>{a.status}</Chip></td>
              <td className="row" style={{ gap: 4 }}>
                {a.status === "scheduled" && <><button className="btn sm" onClick={() => setStatus(a, "checked-in")}>Check in</button><button className="btn sm ghost" onClick={() => setStatus(a, "no-show")}>No-show</button></>}
                {a.status === "checked-in" && <button className="btn sm" onClick={() => setStatus(a, "roomed")}>Room</button>}
                {(a.status === "roomed" || a.status === "checked-in") && (s.role === "physician" || s.role === "admin") && <button className="btn sm primary" onClick={() => setStatus(a, "in-visit")}>Start visit</button>}
                {a.status === "in-visit" && <button className="btn sm primary" onClick={() => setStatus(a, "completed")}>Complete</button>}
              </td>
            </tr>); })}
          {rows.length === 0 && <tr><td colSpan={10} className="empty">No appointments for this day and provider.</td></tr>}
        </tbody></table></div></div>
      {book && <BookDialog onClose={() => setBook(false)} providers={providers.map((u) => u.id)} day={day} />}
    </div>
  );
}

function BookDialog({ onClose, providers, day }: { onClose: () => void; providers: string[]; day: string }) {
  const s = useSession();
  const [q, setQ] = useState("");
  const [patientId, setPatientId] = useState("");
  const [provider, setProvider] = useState(providers[0] ?? "");
  const [time, setTime] = useState("14:00");
  const [reason, setReason] = useState("Follow-up");
  const results = useLiveQuery(async () => { const t = q.toLowerCase().trim(); if (t.length < 2) return []; return (await db.patients.toArray()).filter((p) => `${p.lastName} ${p.firstName}`.toLowerCase().includes(t) || p.mrn.includes(t)).slice(0, 6); }, [q]) ?? [];
  const pat = useLiveQuery(() => (patientId ? db.patients.get(patientId) : undefined), [patientId]);
  async function save() {
    if (!patientId) return;
    const start = new Date(`${day}T${time}:00`).toISOString();
    const clash = await db.appointments.where("providerId").equals(provider).and((a) => a.start === start && a.status !== "canceled").first();
    if (clash) { s.toast("That slot is already reserved for this provider. Pick another time.", "danger"); return; }
    const a = { id: uid("ap"), patientId, providerId: provider, start, durationMin: 20, type: "Follow-up", status: "scheduled" as const, reason, department: USER_MAP.get(provider)?.department ?? "Clinic" };
    await db.appointments.add(a);
    await audit("APPT_BOOK", { patientId, resource: "appointment", resourceId: a.id, detail: `${fmtTime(start)} with ${userName(provider)}` });
    await journal("create", "appointment", a.id, a, patientId);
    s.toast("Appointment booked", "success"); onClose();
  }
  return (
    <Dialog title="Book appointment" onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!patientId} onClick={save}>Book</button></>}>
      <div className="stack">
        <div className="field"><label>Patient</label>{pat ? <div className="row"><b>{patientName(pat)}</b> <span className="muted">MRN {pat.mrn}</span><button className="btn sm ghost" onClick={() => setPatientId("")}>Change</button></div> : <><input className="input" placeholder="Search name or MRN" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />{results.map((p) => <button key={p.id} className="btn ghost sm" style={{ justifyContent: "flex-start" }} onClick={() => setPatientId(p.id)}>{patientName(p)} · {p.mrn}</button>)}</>}</div>
        <div className="grid2"><div className="field"><label>Provider</label><select className="select" value={provider} onChange={(e) => setProvider(e.target.value)}>{providers.map((id) => <option key={id} value={id}>{userName(id)}</option>)}</select></div><div className="field"><label>Time ({day})</label><input type="time" className="input" value={time} onChange={(e) => setTime(e.target.value)} /></div></div>
        <div className="field"><label>Reason</label><input className="input" value={reason} onChange={(e) => setReason(e.target.value)} /></div>
      </div>
    </Dialog>
  );
}
