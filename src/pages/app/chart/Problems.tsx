import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../../../db/db";
import { useSession } from "../../../state/session";
import { userName } from "../../../db/hooks";
import { Card, Chip, Dialog, statusKind } from "../../../components/ui";
import { fmtDate, isoNow } from "../../../lib/format";
import { audit, journal } from "../../../lib/audit";
import { IPlus } from "../../../components/Icons";
import type { Patient, Problem } from "../../../db/types";

const ICD = [["I10", "Essential hypertension"], ["E11.9", "Type 2 diabetes mellitus"], ["E78.5", "Hyperlipidemia"], ["J44.9", "COPD"], ["J45.909", "Asthma, unspecified"], ["I50.9", "Heart failure, unspecified"], ["I48.91", "Atrial fibrillation"], ["N18.3", "Chronic kidney disease stage 3"], ["E03.9", "Hypothyroidism"], ["F32.9", "Major depressive disorder"], ["F41.9", "Anxiety disorder"], ["K21.9", "GERD"], ["M54.5", "Low back pain"], ["G47.33", "Obstructive sleep apnea"], ["E66.9", "Obesity"], ["N39.0", "Urinary tract infection"], ["J18.9", "Pneumonia"], ["A41.9", "Sepsis"], ["R07.9", "Chest pain"], ["K92.2", "GI hemorrhage"], ["D64.9", "Anemia"], ["N17.9", "Acute kidney injury"], ["I63.9", "Cerebral infarction"], ["Z87.891", "History of nicotine dependence"]];

export default function Problems({ patient: p }: { patient: Patient }) {
  const s = useSession();
  const list = useLiveQuery(() => db.problems.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const [add, setAdd] = useState(false);
  const canEdit = ["physician", "ed", "admin"].includes(s.role);
  async function resolve(pr: Problem) { await db.problems.update(pr.id, { status: "resolved" }); await audit("PROBLEM_RESOLVE", { patientId: p.id, resource: "problem", resourceId: pr.id, detail: pr.display }); await journal("update", "problem", pr.id, { status: "resolved" }, p.id); }
  async function setPriority(pr: Problem, priority: Problem["priority"]) { await db.problems.update(pr.id, { priority }); }
  const active = list.filter((x) => x.status !== "resolved").sort((a, b) => ["high", "medium", "low"].indexOf(a.priority) - ["high", "medium", "low"].indexOf(b.priority));
  const resolved = list.filter((x) => x.status === "resolved");
  return (
    <div className="stack">
      <div className="row"><h2 style={{ margin: 0, fontSize: 18 }}>Problem List</h2><span className="spacer" />{canEdit && <button className="btn primary" onClick={() => setAdd(true)}><IPlus /> Add problem</button>}</div>
      <Card title={`Active (${active.length})`} tight>
        <table className="grid"><thead><tr><th>Problem</th><th>ICD-10</th><th>Status</th><th>Priority</th><th>Onset</th><th>Noted by</th><th></th></tr></thead><tbody>
          {active.map((x) => <tr key={x.id}><td><b>{x.display}</b></td><td className="mono">{x.code}</td><td><Chip kind={statusKind(x.status)}>{x.status}</Chip></td><td>{canEdit ? <select className="select" style={{ width: 110, minHeight: 26, padding: "2px 6px" }} value={x.priority} onChange={(e) => setPriority(x, e.target.value as Problem["priority"])}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select> : x.priority}</td><td>{fmtDate(x.onset)}</td><td>{userName(x.notedBy)}</td><td>{canEdit && <button className="btn sm ghost" onClick={() => resolve(x)}>Resolve</button>}</td></tr>)}
          {active.length === 0 && <tr><td colSpan={7} className="empty">No active problems</td></tr>}
        </tbody></table>
      </Card>
      {resolved.length > 0 && <Card title={`Resolved (${resolved.length})`} tight><table className="grid compact"><tbody>{resolved.map((x) => <tr key={x.id}><td>{x.display}</td><td className="mono">{x.code}</td><td className="muted">{fmtDate(x.onset)}</td></tr>)}</tbody></table></Card>}
      {add && <Dialog title="Add problem" onClose={() => setAdd(false)}><AddForm patient={p} onDone={() => setAdd(false)} /></Dialog>}
    </div>
  );
}

function AddForm({ patient: p, onDone }: { patient: Patient; onDone: () => void }) {
  const s = useSession();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<[string, string] | null>(null);
  const [status, setStatus] = useState<Problem["status"]>("active");
  const [priority, setPriority] = useState<Problem["priority"]>("medium");
  const matches = ICD.filter(([c, d]) => !q || c.toLowerCase().includes(q.toLowerCase()) || d.toLowerCase().includes(q.toLowerCase())).slice(0, 10);
  async function save() {
    if (!sel) return;
    const pr: Problem = { id: uid("pr"), patientId: p.id, code: sel[0], display: sel[1], status, priority, onset: isoNow(), noted: isoNow(), notedBy: s.user.id };
    await db.problems.add(pr);
    await audit("PROBLEM_ADD", { patientId: p.id, resource: "problem", resourceId: pr.id, detail: `${pr.display} (${pr.code})` });
    await journal("create", "problem", pr.id, pr, p.id);
    s.toast("Problem added", "success"); onDone();
  }
  return (
    <div className="stack">
      <input className="input" placeholder="Search ICD-10 code or description" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
      <div className="card" style={{ maxHeight: 220, overflow: "auto" }}>{matches.map(([c, d]) => <button key={c} className={"mi" + (sel?.[0] === c ? " active" : "")} style={{ display: "flex", width: "100%", padding: "6px 10px", border: 0, background: sel?.[0] === c ? "var(--row-selected)" : "transparent", cursor: "pointer", textAlign: "start" }} onClick={() => setSel([c, d])}><span className="mono" style={{ width: 80 }}>{c}</span>{d}</button>)}</div>
      <div className="grid2"><div className="field"><label>Status</label><select className="select" value={status} onChange={(e) => setStatus(e.target.value as Problem["status"])}><option value="active">Active</option><option value="chronic">Chronic</option></select></div><div className="field"><label>Priority</label><select className="select" value={priority} onChange={(e) => setPriority(e.target.value as Problem["priority"])}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div></div>
      <div className="row"><button className="btn primary" disabled={!sel} onClick={save}>Add {sel ? sel[1] : ""}</button></div>
    </div>
  );
}
