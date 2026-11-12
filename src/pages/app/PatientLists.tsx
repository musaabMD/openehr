import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";
import { useSession } from "../../state/session";
import { usePatientMap, userShort } from "../../db/hooks";
import { Chip, Seg } from "../../components/ui";
import { ageFromDob, daysBetween, patientName, relTime } from "../../lib/format";
import { news2 } from "../../lib/cds";

type ListKey = "mine" | "3 North" | "4 ICU" | "Emergency" | "all" | "clinic";

export default function PatientLists() {
  const s = useSession();
  const pm = usePatientMap();
  const [list, setList] = useState<ListKey>(s.role === "nurse" ? (s.user.department as ListKey) : s.role === "ed" ? "Emergency" : "mine");
  const encs = useLiveQuery(() => db.encounters.filter((e) => e.status !== "discharged" && e.status !== "canceled").toArray(), []) ?? [];
  const vitals = useLiveQuery(() => db.vitals.toArray(), []) ?? [];
  const labs = useLiveQuery(() => db.labs.filter((l) => !l.acknowledged).toArray(), []) ?? [];
  const latest = new Map<string, (typeof vitals)[number]>();
  for (const v of vitals) { const c = latest.get(v.patientId); if (!c || c.time < v.time) latest.set(v.patientId, v); }
  const newResults = new Map<string, number>();
  for (const l of labs) newResults.set(l.patientId, (newResults.get(l.patientId) ?? 0) + 1);

  const rows = encs.filter((e) => {
    if (list === "mine") return e.type === "inpatient" && (e.attendingId === s.user.id || (s.user.id === "u-res1" && e.attendingId === "u-phys1") || s.role === "pharmacist" || s.role === "lab" || s.role === "radiology" || s.role === "admin" || s.role === "registrar");
    if (list === "all") return e.type === "inpatient";
    if (list === "clinic") return e.type === "outpatient";
    return e.unit === list;
  }).sort((a, b) => (a.unit ?? "").localeCompare(b.unit ?? "") || (a.room ?? "").localeCompare(b.room ?? ""));

  return (
    <div className="page">
      <div className="page-head"><h1>Patient Lists</h1>
        <Seg value={list} onChange={setList} options={[{ v: "mine", l: "My Patients" }, { v: "3 North", l: "3 North" }, { v: "4 ICU", l: "4 ICU" }, { v: "Emergency", l: "Emergency" }, { v: "all", l: "All inpatients" }, { v: "clinic", l: "Clinic today" }]} />
        <span className="spacer" /><span className="muted small">{rows.length} patients</span>
      </div>
      <div className="card"><div className="table-wrap"><table className="grid">
        <thead><tr><th>Unit / Bed</th><th>Patient</th><th>Age/Sex</th><th>MRN</th><th>Attending</th><th>Reason for visit</th><th>LOS</th><th>NEWS2</th><th>New results</th><th>Isolation</th><th>Code</th><th>Last vitals</th></tr></thead>
        <tbody>
          {rows.map((e) => { const p = pm.get(e.patientId); if (!p) return null; const v = latest.get(p.id); const n = v ? news2(v) : null; return (
            <tr key={e.id} className="clickable" onClick={() => s.openPatient(p.id)} tabIndex={0} onKeyDown={(ev) => ev.key === "Enter" && s.openPatient(p.id)}>
              <td className="num">{e.unit ? `${e.unit} · ${e.room}${e.bed && e.bed !== "1" ? e.bed : ""}` : e.type === "outpatient" ? e.department : "Waiting room"}</td>
              <td><b>{patientName(p)}</b></td><td>{ageFromDob(p.dob)} {p.sex}</td><td className="mono">{p.mrn}</td><td>{userShort(e.attendingId)}</td><td>{e.reason}</td><td className="num">{daysBetween(e.start)}d</td>
              <td>{n !== null ? <Chip kind={n >= 7 ? "danger" : n >= 5 ? "warning" : "success"}>{n}</Chip> : "—"}</td>
              <td>{newResults.get(p.id) ? <Chip kind="info">{newResults.get(p.id)}</Chip> : ""}</td>
              <td>{p.isolation ? <Chip kind="warning">{p.isolation}</Chip> : ""}</td><td>{p.codeStatus !== "Full Code" ? <Chip kind="danger">{p.codeStatus}</Chip> : <span className="muted">Full</span>}</td><td className="muted small">{v ? relTime(v.time) : "—"}</td>
            </tr>); })}
          {rows.length === 0 && <tr><td colSpan={12} className="empty">No patients in this list.</td></tr>}
        </tbody></table></div></div>
    </div>
  );
}
