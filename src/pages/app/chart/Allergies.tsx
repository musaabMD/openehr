import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../../../db/db";
import { useSession } from "../../../state/session";
import { Card, Chip, Dialog, statusKind } from "../../../components/ui";
import { fmtDate, isoNow } from "../../../lib/format";
import { audit, journal } from "../../../lib/audit";
import { IPlus } from "../../../components/Icons";
import type { Allergy, Patient } from "../../../db/types";

export default function Allergies({ patient: p }: { patient: Patient }) {
  const s = useSession();
  const list = useLiveQuery(() => db.allergies.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const [add, setAdd] = useState(false);
  const canEdit = ["physician", "ed", "nurse", "pharmacist", "admin"].includes(s.role);
  async function verify(a: Allergy) { await db.allergies.update(a.id, { verified: true }); await audit("ALLERGY_VERIFY", { patientId: p.id, resource: "allergy", resourceId: a.id, detail: a.substance }); }
  async function remove(a: Allergy) { const r = prompt(`Reason for removing ${a.substance} (entered in error / tolerated since):`); if (!r) return; await db.allergies.delete(a.id); await audit("ALLERGY_REMOVE", { patientId: p.id, resource: "allergy", resourceId: a.id, detail: `${a.substance} — ${r}` }); await journal("delete", "allergy", a.id, { reason: r }, p.id); }
  return (
    <div className="stack">
      <div className="row"><h2 style={{ margin: 0, fontSize: 18 }}>Allergies & intolerances</h2><span className="spacer" />{canEdit && <button className="btn primary" onClick={() => setAdd(true)}><IPlus /> Add</button>}</div>
      <Card tight>
        <table className="grid"><thead><tr><th>Substance</th><th>Category</th><th>Type</th><th>Reaction</th><th>Severity</th><th>Noted</th><th>Verified</th><th></th></tr></thead><tbody>
          {list.map((a) => <tr key={a.id}><td><b>{a.substance}</b></td><td>{a.category}</td><td>{a.type}</td><td>{a.reaction}</td><td><Chip kind={statusKind(a.severity)}>{a.severity}</Chip></td><td>{fmtDate(a.noted)}</td><td>{a.verified ? <Chip kind="success">verified</Chip> : canEdit ? <button className="btn sm" onClick={() => verify(a)}>Verify</button> : <Chip kind="warning">unverified</Chip>}</td><td>{canEdit && <button className="btn sm ghost" onClick={() => remove(a)}>Remove</button>}</td></tr>)}
          {list.length === 0 && <tr><td colSpan={8} className="empty">No known allergies. Allergy assessment state: <b>reviewed, none</b>.</td></tr>}
        </tbody></table>
      </Card>
      <p className="small muted">Allergy entries drive decision support at order entry: class matching (penicillins, cephalosporins, sulfonamides, NSAIDs, opioids, contrast) with cross-reactivity warnings.</p>
      {add && <AddDialog patient={p} onClose={() => setAdd(false)} />}
    </div>
  );
}

function AddDialog({ patient: p, onClose }: { patient: Patient; onClose: () => void }) {
  const s = useSession();
  const [f, setF] = useState({ substance: "", category: "medication" as Allergy["category"], type: "allergy" as Allergy["type"], reaction: "", severity: "moderate" as Allergy["severity"] });
  async function save() {
    if (!f.substance.trim() || !f.reaction.trim()) return;
    const a: Allergy = { id: uid("al"), patientId: p.id, ...f, noted: isoNow(), verified: s.role !== "nurse" };
    await db.allergies.add(a);
    await audit("ALLERGY_ADD", { patientId: p.id, resource: "allergy", resourceId: a.id, detail: `${a.substance} (${a.reaction}, ${a.severity})` });
    await journal("create", "allergy", a.id, a, p.id);
    s.toast("Allergy added; order checking updated", "success"); onClose();
  }
  return (
    <Dialog title="Add allergy / intolerance" onClose={onClose} size="narrow" footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" onClick={save} disabled={!f.substance.trim() || !f.reaction.trim()}>Add</button></>}>
      <div className="stack">
        <div className="field"><label>Substance</label><input className="input" list="subs" value={f.substance} onChange={(e) => setF({ ...f, substance: e.target.value })} autoFocus /><datalist id="subs">{["Penicillin", "Amoxicillin", "Cephalexin", "Sulfa (sulfonamide antibiotics)", "Iodinated contrast", "Aspirin", "Ibuprofen", "Morphine", "Codeine", "Latex", "Peanuts", "Shellfish", "Eggs"].map((x) => <option key={x} value={x} />)}</datalist></div>
        <div className="grid2"><div className="field"><label>Category</label><select className="select" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as Allergy["category"] })}><option value="medication">Medication</option><option value="food">Food</option><option value="environment">Environment</option></select></div><div className="field"><label>Type</label><select className="select" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as Allergy["type"] })}><option value="allergy">Allergy</option><option value="intolerance">Intolerance</option></select></div></div>
        <div className="grid2"><div className="field"><label>Reaction</label><input className="input" value={f.reaction} onChange={(e) => setF({ ...f, reaction: e.target.value })} placeholder="e.g. Hives" /></div><div className="field"><label>Severity</label><select className="select" value={f.severity} onChange={(e) => setF({ ...f, severity: e.target.value as Allergy["severity"] })}><option value="mild">Mild</option><option value="moderate">Moderate</option><option value="severe">Severe</option></select></div></div>
      </div>
    </Dialog>
  );
}
