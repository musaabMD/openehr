import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../../db/db";
import { useSession } from "../../state/session";
import { usePatientMap, userName } from "../../db/hooks";
import { Chip, Dialog, Seg, statusKind } from "../../components/ui";
import { fmtDateTime, patientName, relTime, isoNow } from "../../lib/format";
import { audit, journal } from "../../lib/audit";
import { CATALOG_BY_ID, LAB_PANELS } from "../../lib/catalog";
import { flagFor } from "../../lib/cds";
import type { LabResult, Specimen } from "../../db/types";

export default function Lab() {
  const s = useSession();
  const pm = usePatientMap();
  const [tab, setTab] = useState<"queue" | "resulted" | "rejected">("queue");
  const [resultFor, setResultFor] = useState<Specimen | null>(null);
  const [rejectFor, setRejectFor] = useState<Specimen | null>(null);
  const specs = useLiveQuery(() => db.specimens.toArray(), []) ?? [];
  const list = specs.filter((x) => tab === "queue" ? !["resulted", "rejected"].includes(x.status) : x.status === tab).sort((a, b) => (a.priority === "stat" ? 0 : 1) - (b.priority === "stat" ? 0 : 1) || (a.collectedAt ?? "9").localeCompare(b.collectedAt ?? "9"));

  async function advance(sp: Specimen) {
    const next: Specimen["status"] = sp.status === "ordered" ? "collected" : sp.status === "collected" ? "received" : "in-process";
    const patch: Partial<Specimen> = { status: next };
    if (next === "collected") patch.collectedAt = isoNow();
    if (next === "received") patch.receivedAt = isoNow();
    await db.specimens.update(sp.id, patch);
    if (next === "collected") await db.orders.update(sp.orderId, { status: "collected" });
    await audit("SPECIMEN_" + next.toUpperCase().replace("-", "_"), { patientId: sp.patientId, resource: "specimen", resourceId: sp.id, detail: `${sp.tests} ${sp.barcode}` });
    await journal("update", "specimen", sp.id, patch, sp.patientId);
  }

  return (
    <div className="page">
      <div className="page-head"><h1>Laboratory Bench</h1><Seg value={tab} onChange={setTab} options={[{ v: "queue", l: `Queue (${specs.filter((x) => !["resulted", "rejected"].includes(x.status)).length})` }, { v: "resulted", l: "Resulted" }, { v: "rejected", l: "Rejected" }]} /><span className="spacer" /><span className="small muted">Scanner input is isolated: barcode fields accept only specimen IDs.</span></div>
      <div className="card"><div className="table-wrap"><table className="grid">
        <thead><tr><th>Priority</th><th>Barcode</th><th>Patient</th><th>MRN</th><th>Tests</th><th>Container</th><th>Status</th><th>Collected</th><th>Age</th><th>Actions</th></tr></thead>
        <tbody>
          {list.map((sp) => { const p = pm.get(sp.patientId); return (
            <tr key={sp.id}>
              <td><Chip kind={statusKind(sp.priority)}>{sp.priority.toUpperCase()}</Chip></td><td className="mono">{sp.barcode}</td><td><b>{p ? patientName(p) : sp.patientId}</b></td><td className="mono">{p?.mrn}</td><td>{sp.tests}</td><td className="small">{sp.container}</td><td><Chip kind={statusKind(sp.status)}>{sp.status}</Chip></td><td className="num">{sp.collectedAt ? fmtDateTime(sp.collectedAt) : "—"}</td><td className="num">{sp.collectedAt ? relTime(sp.collectedAt).replace(" ago", "") : ""}</td>
              <td className="row" style={{ gap: 4 }}>
                {sp.status === "ordered" && <button className="btn sm" onClick={() => advance(sp)}>Collect</button>}
                {sp.status === "collected" && <button className="btn sm" onClick={() => advance(sp)}>Receive</button>}
                {sp.status === "received" && <button className="btn sm" onClick={() => advance(sp)}>Start</button>}
                {(sp.status === "in-process" || sp.status === "received") && <button className="btn sm primary" onClick={() => setResultFor(sp)}>Result</button>}
                {!["resulted", "rejected"].includes(sp.status) && <button className="btn sm ghost" onClick={() => setRejectFor(sp)}>Reject</button>}
                {sp.status === "rejected" && <span className="small muted">{sp.rejectReason}</span>}
              </td>
            </tr>); })}
          {list.length === 0 && <tr><td colSpan={10} className="empty">No specimens.</td></tr>}
        </tbody></table></div></div>
      {resultFor && <ResultDialog sp={resultFor} onClose={() => setResultFor(null)} />}
      {rejectFor && <RejectDialog sp={rejectFor} onClose={() => setRejectFor(null)} />}
    </div>
  );
}

function ResultDialog({ sp, onClose }: { sp: Specimen; onClose: () => void }) {
  const s = useSession();
  const p = useLiveQuery(() => db.patients.get(sp.patientId), [sp.patientId]);
  const order = useLiveQuery(() => db.orders.get(sp.orderId), [sp.orderId]);
  const tests = LAB_PANELS[sp.tests] ?? [];
  const [vals, setVals] = useState<Record<string, string>>(() => Object.fromEntries(tests.map((t) => [t.code, String(Math.round(((t.typical[0] + t.typical[1]) / 2) * 10 ** (t.decimals ?? 1)) / 10 ** (t.decimals ?? 1))])));
  const [text, setText] = useState(tests.length === 0 ? "No growth at 48 hours" : "");
  const [confirmMrn, setConfirmMrn] = useState("");
  async function release() {
    if (!p) return;
    if (confirmMrn.trim() !== p.mrn) { s.toast("Specimen identity check failed: MRN does not match. Not released.", "danger"); return; }
    const now = isoNow();
    const rows: LabResult[] = tests.length === 0
      ? [{ id: uid("lab"), patientId: sp.patientId, orderId: sp.orderId, panel: sp.tests, code: "600-7", name: sp.tests, value: text, unit: "", flag: null, collected: sp.collectedAt ?? now, reported: now, status: "final", acknowledged: false, specimen: "Blood" }]
      : tests.map((t) => { const v = parseFloat(vals[t.code] ?? ""); return { id: uid("lab"), patientId: sp.patientId, orderId: sp.orderId, panel: sp.tests, code: t.code, name: t.name, value: isNaN(v) ? vals[t.code] ?? "" : v, unit: t.unit, refLow: t.low, refHigh: t.high, flag: isNaN(v) ? null : flagFor(v, t.low, t.high), collected: sp.collectedAt ?? now, reported: now, status: "final" as const, acknowledged: false, specimen: sp.tests === "Urinalysis" ? "Urine" : "Blood" }; });
    await db.labs.bulkAdd(rows);
    await db.specimens.update(sp.id, { status: "resulted" });
    await db.orders.update(sp.orderId, { status: "resulted" });
    const abn = rows.filter((r) => r.flag);
    if (order) await db.inbox.add({ id: uid("ib"), ownerId: order.orderedBy, type: "result", patientId: sp.patientId, subject: `${sp.tests} resulted${abn.length ? " — abnormal" : ""}`, body: abn.length ? abn.map((a) => `${a.name} ${a.value} ${a.unit} (${a.flag})`).join("; ") : "All values within reference range.", priority: abn.some((a) => a.flag === "HH" || a.flag === "LL") ? "high" : "normal", created: now, status: "new", refId: sp.orderId, fromName: "Laboratory" });
    await audit("RESULT_RELEASE", { patientId: sp.patientId, resource: "lab", resourceId: sp.orderId, detail: `${sp.tests}: ${rows.length} results, ${abn.length} abnormal` });
    await journal("create", "lab", sp.orderId, rows, sp.patientId);
    s.toast(`${sp.tests} released${abn.length ? ` with ${abn.length} abnormal value(s)` : ""}`, "success");
    onClose();
  }
  return (
    <Dialog title={`Result entry — ${sp.tests}`} onClose={onClose} footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" onClick={release}>Verify & release</button></>}>
      <div className="stack">
        <div className="row"><b>{p ? patientName(p) : ""}</b><span className="muted">MRN {p?.mrn} · Barcode {sp.barcode} · Ordered by {userName(order?.orderedBy)}</span></div>
        {tests.length > 0 ? (
          <table className="grid compact"><thead><tr><th>Test</th><th>Value</th><th>Unit</th><th>Reference</th><th>Flag</th></tr></thead><tbody>
            {tests.map((t) => { const v = parseFloat(vals[t.code] ?? ""); const f = isNaN(v) ? null : flagFor(v, t.low, t.high); return <tr key={t.code}><td>{t.name} <span className="small muted">{t.code}</span></td><td><input className="input" style={{ width: 110 }} value={vals[t.code]} onChange={(e) => setVals({ ...vals, [t.code]: e.target.value })} inputMode="decimal" /></td><td>{t.unit}</td><td className="muted">{t.low ?? ""}{t.low !== undefined || t.high !== undefined ? "–" : ""}{t.high ?? ""}</td><td>{f && <span className={"flag " + f}>{f}</span>}</td></tr>; })}
          </tbody></table>
        ) : <div className="field"><label>Result text</label><textarea className="textarea" value={text} onChange={(e) => setText(e.target.value)} /></div>}
        <div className="field"><label>Identity check — type the patient's MRN to release</label><input className="input" value={confirmMrn} onChange={(e) => setConfirmMrn(e.target.value)} placeholder="MRN" /></div>
        <div className="small muted">Container: {sp.container ?? CATALOG_BY_ID[`lab-${sp.tests.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`]?.container}. Verified by {userName(s.user.id)}. Critical values create a high-priority In Basket item for the ordering clinician.</div>
      </div>
    </Dialog>
  );
}

function RejectDialog({ sp, onClose }: { sp: Specimen; onClose: () => void }) {
  const s = useSession();
  const [reason, setReason] = useState("Hemolyzed");
  async function reject() {
    await db.specimens.update(sp.id, { status: "rejected", rejectReason: reason });
    await db.orders.update(sp.orderId, { status: "signed" });
    const order = await db.orders.get(sp.orderId);
    if (order) await db.inbox.add({ id: uid("ib"), ownerId: order.orderedBy, type: "message", patientId: sp.patientId, subject: `Specimen rejected: ${sp.tests}`, body: `${reason}. Recollection required; the order remains active.`, priority: "normal", created: isoNow(), status: "new", fromName: "Laboratory", refId: sp.orderId });
    await audit("SPECIMEN_REJECT", { patientId: sp.patientId, resource: "specimen", resourceId: sp.id, detail: reason });
    await journal("update", "specimen", sp.id, { status: "rejected", reason }, sp.patientId);
    s.toast("Specimen rejected; clinician notified", "warning"); onClose();
  }
  return (
    <Dialog title="Reject specimen" onClose={onClose} size="narrow" footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn danger" onClick={reject}>Reject</button></>}>
      <div className="field"><label>Reason</label><select className="select" value={reason} onChange={(e) => setReason(e.target.value)}>{["Hemolyzed", "Clotted", "Insufficient volume", "Unlabeled / mislabeled", "Wrong container", "Delayed transport"].map((r) => <option key={r}>{r}</option>)}</select></div>
      <p className="small muted">Mismatched identity is never silently repaired; the order stays open for recollection.</p>
    </Dialog>
  );
}
