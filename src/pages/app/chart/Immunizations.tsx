import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../../../db/db";
import { useSession } from "../../../state/session";
import { Card, Chip } from "../../../components/ui";
import { ageFromDob } from "../../../lib/format";
import { audit, journal } from "../../../lib/audit";
import type { Immunization, Patient } from "../../../db/types";

const VACCINES = [["150", "Influenza, seasonal"], ["308", "COVID-19 mRNA"], ["115", "Tdap"], ["216", "Pneumococcal conjugate (PCV20)"], ["121", "Zoster recombinant"], ["43", "Hepatitis B"], ["03", "MMR"], ["21", "Varicella"]];

export default function Immunizations({ patient: p }: { patient: Patient }) {
  const s = useSession();
  const list = useLiveQuery(() => db.immunizations.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const [f, setF] = useState({ cvx: "150", lot: "", site: "Left deltoid" });
  const canEdit = ["nurse", "physician", "admin"].includes(s.role);
  const age = ageFromDob(p.dob);
  const due: string[] = [];
  const has = (name: string, days: number) => list.some((i) => i.vaccine.startsWith(name) && Date.now() - new Date(i.date).getTime() < days * 86400000);
  if (age >= 6 && !has("Influenza", 365)) due.push("Influenza (annual)");
  if (age >= 65 && !has("Pneumococcal", 36500)) due.push("Pneumococcal conjugate");
  if (age >= 50 && !has("Zoster", 36500)) due.push("Zoster recombinant (2 doses)");
  if (age >= 19 && !has("Tdap", 3650)) due.push("Tdap (every 10 years)");
  async function add() { const v = VACCINES.find((x) => x[0] === f.cvx)!; const i: Immunization = { id: uid("im"), patientId: p.id, vaccine: v[1]!, cvx: v[0]!, date: new Date().toISOString().slice(0, 10), lot: f.lot || "N/A", site: f.site, doseNumber: list.filter((x) => x.cvx === v[0]).length + 1 }; await db.immunizations.add(i); await audit("IMMUNIZATION_ADMINISTER", { patientId: p.id, resource: "immunization", resourceId: i.id, detail: `${i.vaccine} lot ${i.lot}` }); await journal("create", "immunization", i.id, i, p.id); s.toast("Immunization documented", "success"); }
  return (
    <div className="stack">
      <h2 style={{ margin: 0, fontSize: 18 }}>Immunizations</h2>
      {due.length > 0 && <div className="alert info"><div><div className="t">Health maintenance: {due.length} vaccine(s) due</div><div className="r">{due.join(" · ")} — based on age-based schedule rules in this demo; local schedules and contraindications govern in production.</div></div></div>}
      <Card tight><table className="grid"><thead><tr><th>Vaccine</th><th>CVX</th><th>Date</th><th>Dose #</th><th>Lot</th><th>Site</th></tr></thead><tbody>{list.sort((a, b) => b.date.localeCompare(a.date)).map((i) => <tr key={i.id}><td><b>{i.vaccine}</b></td><td className="mono">{i.cvx}</td><td>{i.date}</td><td className="num">{i.doseNumber}</td><td className="mono">{i.lot}</td><td>{i.site}</td></tr>)}{list.length === 0 && <tr><td colSpan={6} className="empty">None recorded</td></tr>}</tbody></table></Card>
      {canEdit && <Card title="Document administration"><div className="row"><select className="select" style={{ width: 260 }} value={f.cvx} onChange={(e) => setF({ ...f, cvx: e.target.value })}>{VACCINES.map((v) => <option key={v[0]} value={v[0]}>{v[1]}</option>)}</select><input className="input" style={{ width: 140 }} placeholder="Lot number" value={f.lot} onChange={(e) => setF({ ...f, lot: e.target.value })} /><select className="select" style={{ width: 160 }} value={f.site} onChange={(e) => setF({ ...f, site: e.target.value })}>{["Left deltoid", "Right deltoid", "Left thigh", "Right thigh"].map((x) => <option key={x}>{x}</option>)}</select><button className="btn primary" onClick={add}>Document</button></div></Card>}
      <p className="small muted"><Chip kind="neutral">Registry</Chip> Immunization registry interfaces (IIS) are on the roadmap.</p>
    </div>
  );
}
