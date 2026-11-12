import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";
import { useSession } from "../../state/session";
import { usePatientMap, userName } from "../../db/hooks";
import { Chip, Empty, Seg, statusKind, AlertBox } from "../../components/ui";
import { ageFromDob, fmtDateTime, patientName, relTime, isoNow, bmi } from "../../lib/format";
import { audit, journal } from "../../lib/audit";
import { CATALOG_BY_ID } from "../../lib/catalog";
import { evaluateOrder } from "../../lib/cds";
import type { PharmacyVerification } from "../../db/types";

export default function Pharmacy() {
  const s = useSession();
  const pm = usePatientMap();
  const [tab, setTab] = useState<"pending" | "clarify" | "done">("pending");
  const [selId, setSelId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const q = useLiveQuery(() => db.pharmacy.toArray(), []) ?? [];
  const list = q.filter((x) => tab === "pending" ? x.status === "pending" : tab === "clarify" ? x.status === "clarify" : x.status === "verified" || x.status === "rejected").sort((a, b) => a.created.localeCompare(b.created));
  const sel = q.find((x) => x.id === selId) ?? null;
  const pat = sel ? pm.get(sel.patientId) : undefined;
  const ctx = useLiveQuery(async () => {
    if (!sel) return null;
    const [allergies, meds, labs, orders, order] = await Promise.all([
      db.allergies.where("patientId").equals(sel.patientId).toArray(),
      db.medications.where("patientId").equals(sel.patientId).and((m) => m.status === "active").toArray(),
      db.labs.where("patientId").equals(sel.patientId).toArray(),
      db.orders.where("patientId").equals(sel.patientId).toArray(),
      db.orders.get(sel.orderId),
    ]);
    const entry = order ? CATALOG_BY_ID[order.catalogId] : undefined;
    const alerts = entry ? evaluateOrder(entry, { allergies, activeMeds: meds.filter((m) => m.generic !== entry.generic), recentLabs: labs, existingOrders: orders.filter((o) => o.id !== order?.id) }) : [];
    const key = (n: string) => labs.filter((l) => l.name === n).sort((a, b) => b.collected.localeCompare(a.collected))[0];
    return { allergies, meds, order, alerts, cr: key("Creatinine"), k: key("Potassium"), inr: key("INR"), wbc: key("WBC") };
  }, [sel?.id]);

  async function decide(status: PharmacyVerification["status"]) {
    if (!sel) return;
    if ((status === "rejected" || status === "clarify") && !reason.trim()) { s.toast("A reason is required", "warning"); return; }
    await db.pharmacy.update(sel.id, { status, pharmacistId: s.user.id, decidedAt: isoNow(), reason: reason || undefined });
    if (status === "rejected") { await db.orders.update(sel.orderId, { status: "canceled" }); await db.medications.where("patientId").equals(sel.patientId).and((m) => m.name === sel.medName && m.status === "active").modify({ status: "discontinued", end: isoNow() }); }
    if (status === "clarify") await db.inbox.add({ id: "ib_" + sel.id, ownerId: ctx?.order?.orderedBy ?? "u-phys1", type: "message", patientId: sel.patientId, subject: `Pharmacy clarification: ${sel.medName}`, body: reason, priority: "high", created: isoNow(), status: "new", fromName: userName(s.user.id), refId: sel.orderId });
    await audit("PHARM_" + status.toUpperCase(), { patientId: sel.patientId, resource: "order", resourceId: sel.orderId, detail: `${sel.medName}${reason ? " — " + reason : ""}` });
    await journal("update", "pharmacy", sel.id, { status, reason }, sel.patientId);
    s.toast(`Order ${status}`, status === "verified" ? "success" : "warning");
    setSelId(null); setReason("");
  }

  return (
    <div className="page">
      <div className="page-head"><h1>Pharmacy Verification</h1><Seg value={tab} onChange={setTab} options={[{ v: "pending", l: `Pending (${q.filter((x) => x.status === "pending").length})` }, { v: "clarify", l: "Awaiting clarification" }, { v: "done", l: "Completed" }]} /></div>
      <div className="split" style={{ gridTemplateColumns: "1fr 1.3fr" }}>
        <div className="card"><div className="table-wrap"><table className="grid compact">
          <thead><tr><th>Waiting</th><th>Patient</th><th>Medication</th><th>Prescriber</th><th>Status</th></tr></thead>
          <tbody>
            {list.map((x) => { const p = pm.get(x.patientId); return (
              <tr key={x.id} className={"clickable" + (sel?.id === x.id ? " selected" : "")} onClick={() => { setSelId(x.id); setReason(""); }}>
                <td className="num">{relTime(x.created).replace(" ago", "")}</td><td><b>{p ? patientName(p) : x.patientId}</b></td><td>{x.medName}<div className="small muted">{x.details}</div></td><td className="small">{ctx && sel?.id === x.id && ctx.order ? userName(ctx.order.orderedBy) : ""}</td><td><Chip kind={statusKind(x.status)}>{x.status}</Chip></td>
              </tr>); })}
            {list.length === 0 && <tr><td colSpan={5} className="empty">Queue is empty.</td></tr>}
          </tbody></table></div></div>
        <div className="card">
          {!sel || !pat || !ctx ? <Empty>Select an order to verify. Prerequisites, allergies, relevant labs and the active medication list are shown beside the order.</Empty> : (
            <div className="card-b stack">
              <div className="row"><b style={{ fontSize: 16 }}>{patientName(pat)}</b><span className="muted">{ageFromDob(pat.dob)} {pat.sex} · MRN {pat.mrn} · {pat.weightKg} kg · BMI {bmi(pat.heightCm, pat.weightKg)}</span><span className="spacer" /><button className="btn sm" onClick={() => s.openPatient(pat.id, "medications")}>Open chart</button></div>
              <div className="card"><div className="card-h">Order</div><div className="card-b"><b>{sel.medName}</b><div>{sel.details}</div><div className="small muted">Ordered {ctx.order ? fmtDateTime(ctx.order.orderedAt) : ""} by {userName(ctx.order?.orderedBy)} · Indication: {ctx.order?.indication}</div>{ctx.order?.overrides.length ? <div className="small" style={{ color: "var(--warning)" }}>Prescriber overrode {ctx.order.overrides.length} alert(s): {ctx.order.overrides.map((o) => `${o.rule} — ${o.reason}`).join("; ")}</div> : null}</div></div>
              {ctx.alerts.length > 0 ? ctx.alerts.map((a, i) => <AlertBox key={i} a={a} />) : <div className="alert info"><div><div className="t">No alerts fired for this order</div><div className="r">Allergy, interaction, duplicate and renal rules evaluated against the current chart.</div></div></div>}
              <div className="grid2">
                <div className="card"><div className="card-h">Allergies</div><div className="card-b">{ctx.allergies.length === 0 ? <span className="muted">No known allergies</span> : ctx.allergies.map((a) => <div key={a.id}><Chip kind={a.severity === "severe" ? "danger" : "warning"}>{a.substance}</Chip> <span className="small muted">{a.reaction}</span></div>)}</div></div>
                <div className="card"><div className="card-h">Relevant labs</div><div className="card-b small">
                  {[["Creatinine", ctx.cr], ["Potassium", ctx.k], ["INR", ctx.inr], ["WBC", ctx.wbc]].map(([n, l]) => { const lab = l as typeof ctx.cr; return <div key={n as string} className="row" style={{ justifyContent: "space-between" }}><span>{n as string}</span><span className={"num" + (lab?.flag ? " abn" : "")}>{lab ? `${lab.value} ${lab.unit} ${lab.flag ?? ""}` : "—"}</span></div>; })}
                </div></div>
              </div>
              <div className="card"><div className="card-h">Active medications ({ctx.meds.length})</div><div className="card-b small">{ctx.meds.map((m) => <div key={m.id}>{m.name} — {m.dose} {m.route} {m.frequency}</div>)}</div></div>
              {sel.status === "pending" && (
                <div className="stack" style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                  <div className="field"><label>Reason (required for reject / clarify)</label><input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Dose exceeds renal maximum; suggest 1 g q24h" /></div>
                  <div className="row"><button className="btn primary" onClick={() => decide("verified")}>Verify</button><button className="btn" onClick={() => decide("clarify")}>Request clarification</button><button className="btn danger" onClick={() => decide("rejected")}>Reject</button><span className="spacer" /><span className="small muted">Verifier: {userName(s.user.id)}</span></div>
                </div>
              )}
              {sel.status !== "pending" && <div className="small muted">Decided {fmtDateTime(sel.decidedAt)} by {userName(sel.pharmacistId)}{sel.reason ? ` — ${sel.reason}` : ""}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
