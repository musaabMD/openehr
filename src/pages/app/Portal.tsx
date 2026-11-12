import React, { useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../../db/db";
import { useSession } from "../../state/session";
import { userName } from "../../db/hooks";
import { Card, Chip, statusKind } from "../../components/ui";
import { fmtDate, fmtDateTime, fmtTime, isoNow, download, ageFromDob } from "../../lib/format";
import { audit } from "../../lib/audit";
import { patientBundle } from "../../lib/fhir";

const PID = "pt-jordan";

export default function Portal() {
  const p = useLiveQuery(() => db.patients.get(PID), []);
  if (!p) return <div className="page"><div className="empty">Loading your record…</div></div>;
  return (
    <div className="page full" style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ background: "linear-gradient(135deg, #0F2432, #12303A)", color: "#EEF3F7", padding: "18px 24px" }}>
        <div style={{ fontSize: 22, fontWeight: 800 }}>Welcome back, {p.firstName}</div>
        <div style={{ color: "#B8C5D1", fontSize: 13 }}>Magic General Hospital · MyMagic patient portal · Primary care: {userName(p.pcpId)}</div>
      </div>
      <nav className="tabs" aria-label="Portal sections"><NavLink to="/app/portal" end>Home</NavLink><NavLink to="/app/portal/appointments">Appointments</NavLink><NavLink to="/app/portal/results">Test results</NavLink><NavLink to="/app/portal/medications">Medications</NavLink><NavLink to="/app/portal/messages">Messages</NavLink><NavLink to="/app/portal/record">Health summary</NavLink></nav>
      <div className="page">
        <Routes>
          <Route index element={<PHome />} />
          <Route path="appointments" element={<PAppts />} />
          <Route path="results" element={<PResults />} />
          <Route path="medications" element={<PMeds />} />
          <Route path="messages" element={<PMessages />} />
          <Route path="record" element={<PRecord />} />
        </Routes>
      </div>
    </div>
  );
}

function PHome() {
  const appts = useLiveQuery(() => db.appointments.where("patientId").equals(PID).and((a) => a.status === "scheduled" || a.status === "checked-in").toArray(), []) ?? [];
  const msgs = useLiveQuery(() => db.portalMessages.where("patientId").equals(PID).and((m) => m.direction === "to-patient" && !m.read).count(), []) ?? 0;
  const labs = useLiveQuery(() => db.labs.where("patientId").equals(PID).toArray(), []) ?? [];
  const recent = labs.filter((l) => Date.now() - new Date(l.reported).getTime() < 30 * 86400000).length;
  return (
    <div className="cards">
      <Card title="Next appointment">{appts.length ? <div><b>{fmtDateTime(appts[0]!.start)}</b> with {userName(appts[0]!.providerId)}<div className="muted small">{appts[0]!.reason} · {appts[0]!.department}</div></div> : <span className="muted">No upcoming appointments.</span>}</Card>
      <Card title="Messages">{msgs ? <b>{msgs} unread message{msgs > 1 ? "s" : ""} from your care team</b> : <span className="muted">You're all caught up.</span>}</Card>
      <Card title="Test results"><b>{recent} result{recent === 1 ? "" : "s"}</b> released in the last 30 days. Results appear here after your clinician reviews them or after the release window.</Card>
      <Card title="Care reminders"><ul className="list-plain small"><li>Hemoglobin A1c is due — a lab order is ready; visit any lab without an appointment.</li><li>Annual diabetic eye exam: overdue</li><li>Influenza vaccine: up to date</li></ul></Card>
    </div>
  );
}

function PAppts() {
  const s = useSession();
  const appts = useLiveQuery(() => db.appointments.where("patientId").equals(PID).toArray(), []) ?? [];
  async function checkin(id: string) { await db.appointments.update(id, { status: "checked-in" }); await audit("PORTAL_ECHECKIN", { patientId: PID, resource: "appointment", resourceId: id, detail: "e-check-in" }); s.toast("You're checked in. Please take a seat; we'll call you.", "success"); }
  return (
    <Card title="Your appointments" tight><table className="grid"><thead><tr><th>When</th><th>Provider</th><th>Reason</th><th>Status</th><th></th></tr></thead><tbody>
      {appts.sort((a, b) => b.start.localeCompare(a.start)).map((a) => <tr key={a.id}><td>{fmtDate(a.start)} {fmtTime(a.start)}</td><td>{userName(a.providerId)}</td><td>{a.reason}</td><td><Chip kind={statusKind(a.status)}>{a.status}</Chip></td><td>{a.status === "scheduled" && Math.abs(new Date(a.start).getTime() - Date.now()) < 86400000 && <button className="btn sm primary" onClick={() => checkin(a.id)}>e-Check-in</button>}</td></tr>)}
    </tbody></table></Card>
  );
}

function PResults() {
  const labs = useLiveQuery(() => db.labs.where("patientId").equals(PID).toArray(), []) ?? [];
  const groups = new Map<string, typeof labs>();
  for (const l of labs.sort((a, b) => b.collected.localeCompare(a.collected))) { const k = `${l.panel}|${l.collected}`; groups.set(k, [...(groups.get(k) ?? []), l]); }
  return (
    <div className="stack">
      {[...groups.entries()].map(([k, rows]) => <Card key={k} title={`${rows[0]!.panel} · ${fmtDate(rows[0]!.collected)}`} tight><table className="grid compact"><thead><tr><th>Test</th><th className="right">Your value</th><th>Standard range</th><th>What this means</th></tr></thead><tbody>
        {rows.map((l) => <tr key={l.id}><td>{l.name}</td><td className={"right num" + (l.flag ? " abn" : "")}>{l.value} {l.unit}</td><td className="muted">{l.refLow ?? ""}{l.refLow !== undefined || l.refHigh !== undefined ? "–" : ""}{l.refHigh ?? ""} {l.unit}</td><td className="small">{l.flag ? (l.flag.startsWith("H") ? "Higher than the standard range. Your care team reviews every result; message them with questions." : "Lower than the standard range. Your care team reviews every result.") : "Within the standard range."}</td></tr>)}
      </tbody></table></Card>)}
    </div>
  );
}

function PMeds() {
  const s = useSession();
  const meds = useLiveQuery(() => db.medications.where("patientId").equals(PID).and((m) => m.status === "active" && !m.isInpatient).toArray(), []) ?? [];
  async function refill(name: string) {
    await db.inbox.add({ id: uid("ib"), ownerId: "u-phys3", type: "refill", patientId: PID, subject: `Refill: ${name}`, body: "Patient requested a refill through the portal.", priority: "normal", created: isoNow(), status: "new", fromName: "Jordan Ellis (portal)" });
    await audit("PORTAL_REFILL_REQUEST", { patientId: PID, resource: "medication", detail: name });
    s.toast("Refill request sent to your clinic.", "success");
  }
  return <Card title="Current medications" tight><table className="grid"><thead><tr><th>Medication</th><th>How to take</th><th>Prescriber</th><th></th></tr></thead><tbody>{meds.map((m) => <tr key={m.id}><td><b>{m.name}</b></td><td>{m.dose} {m.route}, {m.frequency}</td><td>{userName(m.prescriberId)}</td><td><button className="btn sm" onClick={() => refill(m.name)}>Request refill</button></td></tr>)}</tbody></table></Card>;
}

function PMessages() {
  const s = useSession();
  const msgs = useLiveQuery(() => db.portalMessages.where("patientId").equals(PID).toArray(), []) ?? [];
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  async function send() {
    if (!subject.trim() || !body.trim()) return;
    await db.portalMessages.add({ id: uid("pm"), patientId: PID, fromName: "Jordan Ellis", toName: "Dr. Sofia Marin", subject, body, time: isoNow(), direction: "to-clinic", read: true });
    await db.inbox.add({ id: uid("ib"), ownerId: "u-phys3", type: "message", patientId: PID, subject, body, priority: "normal", created: isoNow(), status: "new", fromName: "Jordan Ellis (portal)" });
    await audit("PORTAL_MESSAGE", { patientId: PID, resource: "message", detail: subject });
    setSubject(""); setBody(""); s.toast("Message sent. Expect a reply within 2 business days.", "success");
  }
  return (
    <div className="split">
      <Card title="Conversations" tight><ul className="list-plain">{msgs.sort((a, b) => b.time.localeCompare(a.time)).map((m) => <li key={m.id} style={{ padding: 12 }} onClick={() => !m.read && db.portalMessages.update(m.id, { read: true })}><div className="row"><b>{m.subject}</b>{!m.read && m.direction === "to-patient" && <Chip kind="info">new</Chip>}<span className="spacer" /><span className="small muted">{fmtDateTime(m.time)}</span></div><div className="small muted">{m.direction === "to-patient" ? "From " + m.fromName : "To " + m.toName}</div><div style={{ marginTop: 4 }}>{m.body}</div></li>)}</ul></Card>
      <Card title="New message to your care team"><div className="stack"><input className="input" placeholder="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} /><textarea className="textarea" placeholder="Non-urgent questions only. If this is an emergency, call your local emergency number." value={body} onChange={(e) => setBody(e.target.value)} /><div className="row"><button className="btn primary" onClick={send} disabled={!subject.trim() || !body.trim()}>Send</button></div></div></Card>
    </div>
  );
}

function PRecord() {
  const s = useSession();
  const p = useLiveQuery(() => db.patients.get(PID), []);
  const problems = useLiveQuery(() => db.problems.where("patientId").equals(PID).toArray(), []) ?? [];
  const allergies = useLiveQuery(() => db.allergies.where("patientId").equals(PID).toArray(), []) ?? [];
  const imms = useLiveQuery(() => db.immunizations.where("patientId").equals(PID).toArray(), []) ?? [];
  async function exportFhir() { const b = await patientBundle(PID); download(`magic-ehr-${p?.mrn}-fhir-r4.json`, JSON.stringify(b, null, 2)); await audit("PORTAL_EXPORT", { patientId: PID, resource: "fhir", detail: "Patient-initiated FHIR R4 export" }); s.toast("Your record was downloaded as a FHIR R4 Bundle.", "success"); }
  if (!p) return null;
  return (
    <div className="cards">
      <Card title="About you"><div className="small">{p.firstName} {p.lastName} · {ageFromDob(p.dob)} years · DOB {p.dob}<br />{p.address} · {p.phone}<br />Coverage: {p.insurance}</div></Card>
      <Card title="Health issues"><ul className="list-plain small">{problems.map((x) => <li key={x.id}>{x.display} <span className="muted">({x.status})</span></li>)}{problems.length === 0 && <li className="muted">None listed</li>}</ul></Card>
      <Card title="Allergies"><ul className="list-plain small">{allergies.map((a) => <li key={a.id}>{a.substance} — {a.reaction}</li>)}{allergies.length === 0 && <li className="muted">No known allergies</li>}</ul></Card>
      <Card title="Immunizations"><ul className="list-plain small">{imms.map((i) => <li key={i.id}>{i.vaccine} · {i.date}</li>)}</ul></Card>
      <Card title="Download your record"><p className="small">Get a portable copy of your record in HL7 FHIR R4 format to share with another provider or app.</p><button className="btn primary" onClick={exportFhir}>Download FHIR Bundle</button></Card>
    </div>
  );
}
