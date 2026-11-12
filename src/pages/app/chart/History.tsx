import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../../../db/db";
import { useSession } from "../../../state/session";
import { Card } from "../../../components/ui";
import { audit } from "../../../lib/audit";
import type { HistoryItem, Patient } from "../../../db/types";

export default function History({ patient: p }: { patient: Patient }) {
  const s = useSession();
  const items = useLiveQuery(() => db.history.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const encs = useLiveQuery(() => db.encounters.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const [draft, setDraft] = useState<{ category: HistoryItem["category"]; item: string; detail: string }>({ category: "medical", item: "", detail: "" });
  const canEdit = ["physician", "ed", "nurse", "admin"].includes(s.role);
  async function add() { if (!draft.item.trim()) return; const h: HistoryItem = { id: uid("hx"), patientId: p.id, ...draft }; await db.history.add(h); await audit("HISTORY_ADD", { patientId: p.id, resource: "history", resourceId: h.id, detail: `${h.category}: ${h.item}` }); setDraft({ ...draft, item: "", detail: "" }); }
  const cats: HistoryItem["category"][] = ["medical", "surgical", "family", "social"];
  return (
    <div className="stack">
      <h2 style={{ margin: 0, fontSize: 18 }}>History</h2>
      <div className="cards">
        {cats.map((c) => <Card key={c} title={c[0]!.toUpperCase() + c.slice(1) + " history"} tight><table className="grid compact"><tbody>{items.filter((i) => i.category === c).map((i) => <tr key={i.id}><td><b>{i.item}</b></td><td className="muted">{i.detail}</td><td className="muted small">{i.date ?? ""}</td></tr>)}{items.filter((i) => i.category === c).length === 0 && <tr><td className="empty">None documented</td></tr>}</tbody></table></Card>)}
        <Card title="Encounter history" tight><table className="grid compact"><tbody>{encs.sort((a, b) => b.start.localeCompare(a.start)).map((e) => <tr key={e.id}><td>{e.start.slice(0, 10)}</td><td><b>{e.type}</b> · {e.department}</td><td>{e.reason}</td><td className="muted">{e.status}{e.dischargeDisposition ? " · " + e.dischargeDisposition : ""}</td></tr>)}</tbody></table></Card>
        {canEdit && <Card title="Add history item"><div className="stack"><select className="select" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as HistoryItem["category"] })}>{cats.map((c) => <option key={c} value={c}>{c}</option>)}</select><input className="input" placeholder="Item (e.g. Appendectomy)" value={draft.item} onChange={(e) => setDraft({ ...draft, item: e.target.value })} /><input className="input" placeholder="Detail" value={draft.detail} onChange={(e) => setDraft({ ...draft, detail: e.target.value })} /><button className="btn primary" onClick={add} disabled={!draft.item.trim()}>Add</button></div></Card>}
      </div>
    </div>
  );
}
