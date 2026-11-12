import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../../db/db";
import { useSession } from "../../state/session";
import { Chip, Dialog } from "../../components/ui";
import { ageFromDob, patientName, isoNow } from "../../lib/format";
import { audit, journal } from "../../lib/audit";
import type { Patient } from "../../db/types";

export default function PatientSearch() {
  const s = useSession();
  const [sp] = useSearchParams();
  const [name, setName] = useState(sp.get("q") ?? "");
  const [mrn, setMrn] = useState("");
  const [dob, setDob] = useState("");
  const [reg, setReg] = useState(false);
  const encs = useLiveQuery(() => db.encounters.filter((e) => e.status !== "discharged" && e.status !== "canceled").toArray(), []) ?? [];
  const results = useLiveQuery(async () => {
    const n = name.trim().toLowerCase(); const m = mrn.trim();
    if (n.length < 2 && !m && !dob) return [];
    const all = await db.patients.toArray();
    return all.filter((p) => (!m || p.mrn.startsWith(m)) && (!dob || p.dob === dob) && (!n || `${p.lastName} ${p.firstName}`.toLowerCase().includes(n) || `${p.firstName} ${p.lastName}`.toLowerCase().includes(n))).slice(0, 50);
  }, [name, mrn, dob]) ?? [];
  const dupNames = new Set<string>();
  const seen = new Set<string>();
  for (const p of results) { const k = `${p.lastName}|${p.firstName}`.toLowerCase(); if (seen.has(k)) dupNames.add(k); seen.add(k); }

  return (
    <div className="page">
      <div className="page-head"><h1>Patient Lookup</h1><span className="spacer" />{(s.role === "registrar" || s.role === "admin" || s.role === "ed") && <button className="btn primary" onClick={() => setReg(true)}>Register new patient</button>}</div>
      <div className="card" style={{ marginBottom: 14 }}><div className="card-b grid3">
        <div className="field"><label>Name (Last, First)</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="e.g. Khan" /></div>
        <div className="field"><label>MRN (exact or prefix)</label><input className="input" value={mrn} onChange={(e) => setMrn(e.target.value)} placeholder="8000…" /></div>
        <div className="field"><label>Date of birth</label><input type="date" className="input" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
      </div></div>
      <div className="card"><div className="table-wrap"><table className="grid">
        <thead><tr><th>Patient</th><th>Sex</th><th>DOB / Age</th><th>MRN</th><th>Phone</th><th>Insurance</th><th>Active encounter</th><th></th></tr></thead>
        <tbody>
          {results.map((p) => { const e = encs.find((x) => x.patientId === p.id); const dup = dupNames.has(`${p.lastName}|${p.firstName}`.toLowerCase()); return (
            <tr key={p.id}>
              <td><b>{patientName(p)}</b> {dup && <Chip kind="warning">Same name — verify DOB/MRN</Chip>}</td><td>{p.sex}</td><td>{p.dob} ({ageFromDob(p.dob)})</td><td className="mono">{p.mrn}</td><td>{p.phone}</td><td>{p.insurance}</td>
              <td>{e ? <Chip kind="info">{e.type} · {e.unit ? `${e.unit} ${e.room}` : e.department}</Chip> : <span className="muted">None</span>}</td>
              <td><button className="btn sm primary" onClick={() => s.openPatient(p.id)}>Open chart</button></td>
            </tr>); })}
          {results.length === 0 && <tr><td colSpan={8} className="empty">{name.length < 2 && !mrn && !dob ? "Enter at least two letters of a name, an MRN or a date of birth." : "No authorized match."}</td></tr>}
        </tbody></table></div></div>
      {reg && <RegisterDialog onClose={() => setReg(false)} />}
    </div>
  );
}

function RegisterDialog({ onClose }: { onClose: () => void }) {
  const s = useSession();
  const [f, setF] = useState({ firstName: "", lastName: "", dob: "", sex: "F" as Patient["sex"], phone: "", insurance: "Self-pay", language: "English", address: "" });
  const dups = useLiveQuery(async () => { if (!f.lastName || !f.dob) return []; return (await db.patients.toArray()).filter((p) => p.lastName.toLowerCase() === f.lastName.toLowerCase() && p.dob === f.dob); }, [f.lastName, f.dob]) ?? [];
  async function save() {
    if (!f.firstName || !f.lastName || !f.dob) { s.toast("First name, last name and DOB are required", "warning"); return; }
    const count = await db.patients.count();
    const p: Patient = { id: uid("pt"), mrn: String(800000 + count * 37 + 11 + 1000), firstName: f.firstName, lastName: f.lastName, dob: f.dob, sex: f.sex, phone: f.phone, address: f.address, language: f.language, insurance: f.insurance, memberId: "", codeStatus: "Full Code", flags: [], hue: Math.floor(Math.random() * 360), heightCm: 170, weightKg: 70, createdAt: isoNow(), archetype: "registered" };
    await db.patients.add(p);
    await audit("PATIENT_REGISTER", { patientId: p.id, resource: "patient", resourceId: p.id, detail: `Registered ${patientName(p)} MRN ${p.mrn}` });
    await journal("create", "patient", p.id, p, p.id);
    s.toast(`Registered ${patientName(p)} · MRN ${p.mrn}`, "success");
    onClose(); s.openPatient(p.id);
  }
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <Dialog title="Register new patient" onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" onClick={save}>Register</button></>}>
      <div className="stack">
        {dups.length > 0 && <div className="alert warning"><div><div className="t">Possible duplicate</div><div className="r">{dups.map((d) => `${patientName(d)} (MRN ${d.mrn}, DOB ${d.dob})`).join("; ")}. Review before creating a new record; merging requires audit.</div></div></div>}
        <div className="grid2"><div className="field"><label>Last name</label><input className="input" value={f.lastName} onChange={set("lastName")} autoFocus /></div><div className="field"><label>First name</label><input className="input" value={f.firstName} onChange={set("firstName")} /></div></div>
        <div className="grid3"><div className="field"><label>Date of birth</label><input type="date" className="input" value={f.dob} onChange={set("dob")} /></div><div className="field"><label>Sex</label><select className="select" value={f.sex} onChange={set("sex")}><option value="F">Female</option><option value="M">Male</option><option value="X">Other / unknown</option></select></div><div className="field"><label>Language</label><select className="select" value={f.language} onChange={set("language")}>{["English", "Arabic", "Spanish", "Mandarin", "Urdu", "French"].map((l) => <option key={l}>{l}</option>)}</select></div></div>
        <div className="grid2"><div className="field"><label>Phone</label><input className="input" value={f.phone} onChange={set("phone")} /></div><div className="field"><label>Coverage</label><select className="select" value={f.insurance} onChange={set("insurance")}>{["Self-pay", "Blue Shield PPO", "Medicare Part A/B", "Aetna HMO", "Bupa Gold", "Medicaid", "Tawuniya Premium"].map((l) => <option key={l}>{l}</option>)}</select></div></div>
        <div className="field"><label>Address</label><input className="input" value={f.address} onChange={set("address")} /></div>
      </div>
    </Dialog>
  );
}
