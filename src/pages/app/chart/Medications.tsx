import React from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db/db";
import { useSession } from "../../../state/session";
import { userName } from "../../../db/hooks";
import { Card, Chip, statusKind } from "../../../components/ui";
import { fmtDate, isoNow } from "../../../lib/format";
import { audit, journal } from "../../../lib/audit";
import type { Medication, Patient } from "../../../db/types";

export default function Medications({ patient: p }: { patient: Patient }) {
  const s = useSession();
  const meds = useLiveQuery(() => db.medications.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const canEdit = ["physician", "ed", "admin", "pharmacist"].includes(s.role);
  async function setStatus(m: Medication, status: Medication["status"]) {
    const reason = status === "active" ? "resumed" : prompt(`Reason to ${status === "held" ? "hold" : "discontinue"} ${m.name}:`);
    if (!reason) return;
    await db.medications.update(m.id, { status, end: status === "discontinued" ? isoNow() : undefined });
    if (status === "discontinued") await db.administrations.where("medicationId").equals(m.id).and((a) => a.status === "due").delete();
    await audit("MED_" + status.toUpperCase(), { patientId: p.id, resource: "medication", resourceId: m.id, detail: `${m.name} — ${reason}` });
    await journal("update", "medication", m.id, { status, reason }, p.id);
    s.toast(`${m.name}: ${status}`, status === "active" ? "success" : "warning");
  }
  const Table = ({ rows, title }: { rows: Medication[]; title: string }) => (
    <Card title={`${title} (${rows.length})`} tight>
      <table className="grid compact"><thead><tr><th>Medication</th><th>Dose / route / frequency</th><th>Indication</th><th>Started</th><th>Prescriber</th><th>Status</th><th></th></tr></thead><tbody>
        {rows.map((m) => <tr key={m.id}><td><b>{m.name}</b><div className="small muted">{m.generic}</div></td><td>{m.dose} {m.route} {m.frequency}{m.prn ? " PRN" : ""}</td><td className="small">{m.indication}</td><td>{fmtDate(m.start)}</td><td>{userName(m.prescriberId)}</td><td><Chip kind={statusKind(m.status)}>{m.status}</Chip></td><td className="row" style={{ gap: 4 }}>{canEdit && m.status === "active" && <><button className="btn sm" onClick={() => setStatus(m, "held")}>Hold</button><button className="btn sm ghost" onClick={() => setStatus(m, "discontinued")}>Discontinue</button></>}{canEdit && m.status === "held" && <button className="btn sm" onClick={() => setStatus(m, "active")}>Resume</button>}</td></tr>)}
        {rows.length === 0 && <tr><td colSpan={7} className="empty">None</td></tr>}
      </tbody></table>
    </Card>
  );
  const inpt = meds.filter((m) => m.isInpatient && m.status !== "discontinued" && m.status !== "completed");
  const home = meds.filter((m) => !m.isInpatient && m.status !== "discontinued");
  const past = meds.filter((m) => m.status === "discontinued" || m.status === "completed");
  const recon = home.filter((h) => !inpt.some((i) => i.generic === h.generic));
  return (
    <div className="stack">
      <div className="row"><h2 style={{ margin: 0, fontSize: 18 }}>Medications</h2><span className="spacer" />{canEdit && <Link to={`/app/chart/${p.id}/orders`} className="btn primary">Order medication</Link>}</div>
      {inpt.length > 0 && recon.length > 0 && <div className="alert warning"><div><div className="t">Medication reconciliation: {recon.length} home medication(s) not continued as inpatient</div><div className="r">{recon.map((m) => m.generic).join(", ")}. Document a decision (continue, hold, substitute) for each; reconciliation is required at admission, transfer and discharge.</div></div></div>}
      <Table rows={inpt} title="Inpatient medications" />
      <Table rows={home} title="Home medications (prior to admission)" />
      {past.length > 0 && <Table rows={past} title="Discontinued / completed" />}
    </div>
  );
}
