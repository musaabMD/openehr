import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../../../db/db";
import { useSession } from "../../../state/session";
import { Card, Chip, statusKind } from "../../../components/ui";
import { fmtDate, addDays } from "../../../lib/format";
import { audit, journal } from "../../../lib/audit";
import type { CarePlanItem, Patient } from "../../../db/types";

export default function CarePlan({ patient: p }: { patient: Patient }) {
  const s = useSession();
  const items = useLiveQuery(() => db.carePlan.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const [d, setD] = useState({ goal: "", intervention: "", ownerRole: "Nurse", days: 1 });
  const canEdit = ["physician", "nurse", "ed", "admin"].includes(s.role);
  async function add() { if (!d.goal.trim()) return; const c: CarePlanItem = { id: uid("cp"), patientId: p.id, goal: d.goal, intervention: d.intervention, ownerRole: d.ownerRole, due: addDays(new Date(), d.days), status: "open" }; await db.carePlan.add(c); await audit("CAREPLAN_ADD", { patientId: p.id, resource: "careplan", resourceId: c.id, detail: c.goal }); await journal("create", "careplan", c.id, c, p.id); setD({ ...d, goal: "", intervention: "" }); }
  async function setStatus(c: CarePlanItem, status: CarePlanItem["status"]) { await db.carePlan.update(c.id, { status }); await audit("CAREPLAN_" + status.toUpperCase(), { patientId: p.id, resource: "careplan", resourceId: c.id, detail: c.goal }); }
  return (
    <div className="stack">
      <h2 style={{ margin: 0, fontSize: 18 }}>Care Plan & multidisciplinary tasks</h2>
      <Card tight><table className="grid"><thead><tr><th>Goal</th><th>Intervention</th><th>Owner</th><th>Due</th><th>Status</th><th></th></tr></thead><tbody>
        {items.sort((a, b) => a.due.localeCompare(b.due)).map((c) => <tr key={c.id}><td><b>{c.goal}</b></td><td>{c.intervention}</td><td>{c.ownerRole}</td><td className={new Date(c.due).getTime() < Date.now() && c.status === "open" ? "abn" : ""}>{fmtDate(c.due)}</td><td><Chip kind={statusKind(c.status)}>{c.status}</Chip></td><td className="row" style={{ gap: 4 }}>{canEdit && c.status === "open" && <><button className="btn sm" onClick={() => setStatus(c, "met")}>Met</button><button className="btn sm ghost" onClick={() => setStatus(c, "not-met")}>Not met</button></>}</td></tr>)}
        {items.length === 0 && <tr><td colSpan={6} className="empty">No care plan items</td></tr>}
      </tbody></table></Card>
      {canEdit && <Card title="Add goal"><div className="grid2"><input className="input" placeholder="Goal" value={d.goal} onChange={(e) => setD({ ...d, goal: e.target.value })} /><input className="input" placeholder="Intervention" value={d.intervention} onChange={(e) => setD({ ...d, intervention: e.target.value })} /><select className="select" value={d.ownerRole} onChange={(e) => setD({ ...d, ownerRole: e.target.value })}>{["Nurse", "Physician", "Physical Therapy", "Occupational Therapy", "Pharmacist", "Dietitian", "Case Manager", "Social Work"].map((r) => <option key={r}>{r}</option>)}</select><div className="row"><span className="small">Due in</span><input className="input" type="number" min={0} style={{ width: 80 }} value={d.days} onChange={(e) => setD({ ...d, days: Number(e.target.value) })} /><span className="small">days</span><button className="btn primary" onClick={add} disabled={!d.goal.trim()}>Add</button></div></div></Card>}
    </div>
  );
}
