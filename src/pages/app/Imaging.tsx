import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../../db/db";
import { useSession } from "../../state/session";
import { usePatientMap, userName } from "../../db/hooks";
import { Chip, Dialog, Seg, statusKind } from "../../components/ui";
import { fmtDateTime, patientName, isoNow, addMinutes } from "../../lib/format";
import { audit, journal } from "../../lib/audit";
import type { ImagingStudy } from "../../db/types";

export default function Imaging() {
  const s = useSession();
  const pm = usePatientMap();
  const [tab, setTab] = useState<"worklist" | "read" | "final">("worklist");
  const [report, setReport] = useState<ImagingStudy | null>(null);
  const studies = useLiveQuery(() => db.imaging.toArray(), []) ?? [];
  const list = studies.filter((x) => tab === "worklist" ? ["ordered", "scheduled", "in-progress"].includes(x.status) : tab === "read" ? ["acquired", "prelim"].includes(x.status) : x.status === "final").sort((a, b) => (a.priority === "stat" ? 0 : 1) - (b.priority === "stat" ? 0 : 1));
  async function step(st: ImagingStudy, status: ImagingStudy["status"]) {
    const patch: Partial<ImagingStudy> = { status };
    if (status === "scheduled") patch.scheduledAt = addMinutes(new Date(), 60);
    await db.imaging.update(st.id, patch);
    await audit("IMAGING_" + status.toUpperCase().replace("-", "_"), { patientId: st.patientId, resource: "imaging", resourceId: st.id, detail: `${st.description} ${st.accession}` });
    await journal("update", "imaging", st.id, patch, st.patientId);
  }
  return (
    <div className="page">
      <div className="page-head"><h1>Imaging Worklist</h1><Seg value={tab} onChange={setTab} options={[{ v: "worklist", l: `Technologist (${studies.filter((x) => ["ordered", "scheduled", "in-progress"].includes(x.status)).length})` }, { v: "read", l: `To read (${studies.filter((x) => ["acquired", "prelim"].includes(x.status)).length})` }, { v: "final", l: "Final" }]} /></div>
      <div className="card"><div className="table-wrap"><table className="grid">
        <thead><tr><th>Priority</th><th>Accession</th><th>Patient</th><th>MRN</th><th>Modality</th><th>Study</th><th>Status</th><th>Scheduled</th><th>Actions</th></tr></thead>
        <tbody>
          {list.map((st) => { const p = pm.get(st.patientId); return (
            <tr key={st.id}>
              <td><Chip kind={statusKind(st.priority)}>{st.priority.toUpperCase()}</Chip></td><td className="mono">{st.accession}</td><td><button className="btn ghost sm" style={{ fontWeight: 700 }} onClick={() => s.openPatient(st.patientId, "results")}>{p ? patientName(p) : st.patientId}</button></td><td className="mono">{p?.mrn}</td><td>{st.modality}</td><td>{st.description}{st.criticalFinding && <Chip kind="danger">Critical finding</Chip>}</td><td><Chip kind={statusKind(st.status)}>{st.status}</Chip></td><td className="num">{st.scheduledAt ? fmtDateTime(st.scheduledAt) : "—"}</td>
              <td className="row" style={{ gap: 4 }}>
                {st.status === "ordered" && <button className="btn sm" onClick={() => step(st, "scheduled")}>Schedule</button>}
                {st.status === "scheduled" && <button className="btn sm" onClick={() => step(st, "in-progress")}>Begin exam</button>}
                {st.status === "in-progress" && <button className="btn sm" onClick={() => step(st, "acquired")}>Acquired</button>}
                {(st.status === "acquired" || st.status === "prelim") && (s.role === "radiology" || s.role === "admin") && <button className="btn sm primary" onClick={() => setReport(st)}>Report</button>}
                {st.status === "final" && <button className="btn sm" onClick={() => setReport(st)}>View report</button>}
              </td>
            </tr>); })}
          {list.length === 0 && <tr><td colSpan={9} className="empty">Nothing in this worklist.</td></tr>}
        </tbody></table></div></div>
      {report && <ReportDialog st={report} onClose={() => setReport(null)} />}
    </div>
  );
}

function ReportDialog({ st, onClose }: { st: ImagingStudy; onClose: () => void }) {
  const s = useSession();
  const p = useLiveQuery(() => db.patients.get(st.patientId), [st.patientId]);
  const order = useLiveQuery(() => db.orders.get(st.orderId), [st.orderId]);
  const [text, setText] = useState(st.reportText ?? `TECHNIQUE: ${st.description}.\n\nCOMPARISON: None available.\n\nFINDINGS: \n\nIMPRESSION: `);
  const [critical, setCritical] = useState(!!st.criticalFinding);
  const readOnly = st.status === "final";
  async function sign(final: boolean) {
    const patch: Partial<ImagingStudy> = { reportText: text, radiologistId: s.user.id, status: final ? "final" : "prelim", criticalFinding: critical };
    await db.imaging.update(st.id, patch);
    if (final) await db.orders.update(st.orderId, { status: "resulted" });
    if (order) await db.inbox.add({ id: uid("ib"), ownerId: order.orderedBy, type: "result", patientId: st.patientId, subject: `${st.description} — ${final ? "final" : "preliminary"} report${critical ? " — CRITICAL" : ""}`, body: text.split("IMPRESSION:")[1]?.trim() || text.slice(0, 200), priority: critical ? "high" : "normal", created: isoNow(), status: "new", refId: st.orderId, fromName: userName(s.user.id) });
    await audit(final ? "IMAGING_FINAL" : "IMAGING_PRELIM", { patientId: st.patientId, resource: "imaging", resourceId: st.id, detail: `${st.description}${critical ? " critical" : ""}` });
    await journal("sign", "imaging", st.id, patch, st.patientId);
    s.toast(final ? "Final report signed" : "Preliminary report saved", "success"); onClose();
  }
  return (
    <Dialog title={`${st.description} · ${st.accession}`} onClose={onClose} size="wide" footer={readOnly ? <button className="btn" onClick={onClose}>Close</button> : <><button className="btn" onClick={onClose}>Cancel</button><button className="btn" onClick={() => sign(false)}>Save preliminary</button><button className="btn primary" onClick={() => sign(true)}>Sign final</button></>}>
      <div className="stack">
        <div className="row"><b>{p ? patientName(p) : ""}</b><span className="muted">MRN {p?.mrn} · Indication: {order?.indication} · Ordered by {userName(order?.orderedBy)}</span></div>
        <div className="card" style={{ background: "#111", color: "#ccc", padding: 16, textAlign: "center", fontFamily: "var(--mono)", fontSize: 12 }}>[ Image viewer placeholder — DICOMweb viewer integration is on the roadmap. Patient and accession identity are reconciled with the order above. ]</div>
        <textarea className="textarea" style={{ minHeight: 200, fontFamily: "var(--mono)" }} value={text} onChange={(e) => setText(e.target.value)} readOnly={readOnly} />
        {!readOnly && <label className="row"><input type="checkbox" checked={critical} onChange={(e) => setCritical(e.target.checked)} /> Critical / actionable finding — notify ordering clinician with high priority</label>}
        {readOnly && <div className="small muted">Final report by {userName(st.radiologistId)}.</div>}
      </div>
    </Dialog>
  );
}
