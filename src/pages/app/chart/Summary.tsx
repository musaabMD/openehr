import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db/db";
import { useSession } from "../../../state/session";
import { useActiveEncounter, userName } from "../../../db/hooks";
import { Card, Chip, Dialog, Sparkline, statusKind } from "../../../components/ui";
import { fmtDate, fmtDateTime, download, relTime } from "../../../lib/format";
import { patientBundle } from "../../../lib/fhir";
import { audit } from "../../../lib/audit";
import { buildSummary } from "../../../lib/assist";
import { IDownload, IPrint, ISparkle } from "../../../components/Icons";
import type { Patient } from "../../../db/types";

export default function Summary({ patient: p }: { patient: Patient }) {
  const s = useSession();
  const enc = useActiveEncounter(p.id);
  const problems = useLiveQuery(() => db.problems.where("patientId").equals(p.id).and((x) => x.status !== "resolved").toArray(), [p.id]) ?? [];
  const meds = useLiveQuery(() => db.medications.where("patientId").equals(p.id).and((m) => m.status === "active").toArray(), [p.id]) ?? [];
  const labs = useLiveQuery(() => db.labs.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const orders = useLiveQuery(() => db.orders.where("patientId").equals(p.id).and((o) => ["signed", "in-progress", "collected"].includes(o.status) && o.category !== "medication").toArray(), [p.id]) ?? [];
  const notes = useLiveQuery(() => db.notes.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const vitals = useLiveQuery(() => db.vitals.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const careplan = useLiveQuery(() => db.carePlan.where("patientId").equals(p.id).and((c) => c.status === "open").toArray(), [p.id]) ?? [];
  const [assist, setAssist] = useState<string | null>(null);

  const latestByTest = new Map<string, typeof labs>();
  for (const l of labs.sort((a, b) => a.collected.localeCompare(b.collected))) latestByTest.set(l.name, [...(latestByTest.get(l.name) ?? []), l]);
  const keyTests = ["WBC", "Hemoglobin", "Platelets", "Sodium", "Potassium", "Creatinine", "Glucose", "Lactate", "BNP", "INR", "Troponin I, high sensitivity", "Hemoglobin A1c", "LDL (calc)", "TSH"].filter((k) => latestByTest.has(k));
  const vs = vitals.sort((a, b) => a.time.localeCompare(b.time)).slice(-12);

  async function exportFhir() { const b = await patientBundle(p.id); download(`magic-ehr-${p.mrn}-fhir-r4.json`, JSON.stringify(b, null, 2)); await audit("EXPORT_FHIR", { patientId: p.id, resource: "fhir", detail: "FHIR R4 Bundle export" }); s.toast("FHIR R4 Bundle downloaded", "success"); }
  async function runAssist() { const text = await buildSummary(p.id); setAssist(text); await audit("AI_SUMMARY_VIEW", { patientId: p.id, resource: "assist", detail: "Magic Assist chart summary generated (local, rule-based)" }); }

  return (
    <div className="stack">
      <div className="row">
        <h2 style={{ margin: 0, fontSize: 18 }}>Summary</h2><span className="spacer" />
        <button className="btn" onClick={runAssist}><ISparkle /> Magic Assist summary</button>
        <button className="btn" onClick={exportFhir}><IDownload /> Export FHIR</button>
        <button className="btn" onClick={() => window.print()}><IPrint /> Print</button>
      </div>
      <div className="cards">
        <Card title="Active problems" actions={<Link className="btn sm" to={`/app/chart/${p.id}/problems`}>Manage</Link>} tight>
          <table className="grid compact"><tbody>{problems.sort((a, b) => (a.priority === "high" ? 0 : 1) - (b.priority === "high" ? 0 : 1)).map((x) => <tr key={x.id}><td><b>{x.display}</b> <span className="muted mono small">{x.code}</span></td><td><Chip kind={x.status === "active" ? "info" : "neutral"}>{x.status}</Chip></td><td className="muted small">since {fmtDate(x.onset)}</td></tr>)}{problems.length === 0 && <tr><td className="empty">No active problems</td></tr>}</tbody></table>
        </Card>
        <Card title={`Active medications (${meds.length})`} actions={<Link className="btn sm" to={`/app/chart/${p.id}/medications`}>Manage</Link>} tight>
          <table className="grid compact"><tbody>{meds.map((m) => <tr key={m.id}><td><b>{m.name}</b><div className="small muted">{m.dose} {m.route} {m.frequency}{m.prn ? " PRN" : ""}</div></td><td><Chip kind={m.isInpatient ? "info" : "neutral"}>{m.isInpatient ? "inpatient" : "home"}</Chip></td></tr>)}{meds.length === 0 && <tr><td className="empty">No active medications</td></tr>}</tbody></table>
        </Card>
        <Card title="Key results" actions={<Link className="btn sm" to={`/app/chart/${p.id}/results`}>Results review</Link>} tight>
          <table className="grid compact"><thead><tr><th>Test</th><th className="right">Latest</th><th>Flag</th><th>Trend</th><th>When</th></tr></thead><tbody>
            {keyTests.map((k) => { const series = latestByTest.get(k)!; const last = series[series.length - 1]!; return <tr key={k}><td>{k}</td><td className={"right num" + (last.flag ? " abn" : "")}>{last.value} {last.unit}</td><td>{last.flag && <span className={"flag " + last.flag}>{last.flag}</span>}</td><td><Sparkline values={series.filter((x) => typeof x.value === "number").map((x) => x.value as number)} low={last.refLow} high={last.refHigh} /></td><td className="muted small">{relTime(last.collected)}</td></tr>; })}
            {keyTests.length === 0 && <tr><td className="empty" colSpan={5}>No results</td></tr>}
          </tbody></table>
        </Card>
        <Card title="Vital sign trends" actions={<Link className="btn sm" to={`/app/chart/${p.id}/flowsheets`}>Flowsheets</Link>}>
          {vs.length > 1 ? <div className="grid2 small">
            {[["HR", vs.map((v) => v.hr ?? 0), 50, 100], ["SBP", vs.map((v) => v.sbp ?? 0), 90, 140], ["RR", vs.map((v) => v.rr ?? 0), 12, 20], ["SpO₂", vs.map((v) => v.spo2 ?? 0), 94, 100], ["Temp", vs.map((v) => v.temp ?? 0), 36, 38]].map(([l, vals, lo, hi]) => <div key={l as string} className="row"><span style={{ width: 44 }}>{l as string}</span><Sparkline values={vals as number[]} width={150} height={28} low={lo as number} high={hi as number} /><b className="num">{(vals as number[]).at(-1)}</b></div>)}
          </div> : <div className="muted small">Not enough vitals to trend.</div>}
        </Card>
        <Card title="Open orders (non-medication)" actions={<Link className="btn sm" to={`/app/chart/${p.id}/orders`}>Orders</Link>} tight>
          <table className="grid compact"><tbody>{orders.slice(0, 10).map((o) => <tr key={o.id}><td><b>{o.display}</b><div className="small muted">{o.category} · {fmtDateTime(o.orderedAt)} · {userName(o.orderedBy)}</div></td><td><Chip kind={statusKind(o.priority)}>{o.priority}</Chip></td><td><Chip kind={statusKind(o.status)}>{o.status}</Chip></td></tr>)}{orders.length === 0 && <tr><td className="empty">No open orders</td></tr>}</tbody></table>
        </Card>
        <Card title="Recent notes" actions={<Link className="btn sm" to={`/app/chart/${p.id}/notes`}>Notes</Link>} tight>
          <table className="grid compact"><tbody>{notes.sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, 6).map((n) => <tr key={n.id}><td><Link to={`/app/chart/${p.id}/notes?note=${n.id}`}><b>{n.title}</b></Link><div className="small muted">{userName(n.authorId)} · {fmtDateTime(n.updated)}</div></td><td><Chip kind={statusKind(n.status)}>{n.status}</Chip></td></tr>)}</tbody></table>
        </Card>
        {careplan.length > 0 && <Card title="Care plan goals" actions={<Link className="btn sm" to={`/app/chart/${p.id}/careplan`}>Care plan</Link>}><ul className="list-plain small">{careplan.map((c) => <li key={c.id}><b>{c.goal}</b><div className="muted">{c.intervention} · {c.ownerRole} · due {fmtDate(c.due)}</div></li>)}</ul></Card>}
        {enc && <Card title="Care team"><ul className="list-plain small"><li>Attending: {userName(enc.attendingId)}</li><li>Primary care: {userName(p.pcpId)}</li>{enc.unit === "3 North" && <li>Primary nurse: Grace Mwangi, RN</li>}{enc.unit === "4 ICU" && <li>Primary nurse: Carlos Reyes, RN</li>}{enc.type === "ed" && <li>ED nurse: Priya Nair, RN</li>}<li>Pharmacist: Hana Kobayashi, PharmD</li></ul></Card>}
      </div>
      {assist && (
        <Dialog title={<><ISparkle width={18} height={18} /> Magic Assist — chart summary (DRAFT)</>} onClose={() => setAssist(null)} size="wide" footer={<><button className="btn" onClick={() => { navigator.clipboard?.writeText(assist); s.toast("Copied", "success"); }}>Copy</button><button className="btn primary" onClick={() => setAssist(null)}>Close</button></>}>
          <div className="alert info" style={{ marginBottom: 10 }}><div><div className="t">AI-labeled draft, generated locally from the chart with citations</div><div className="r">Every statement cites its source record. Nothing here is a clinical decision; review before use. The demo uses deterministic rules, not a language model; in production you can plug in a self-hosted model with the same contract.</div></div></div>
          <div className="note-body">{assist}</div>
        </Dialog>
      )}
    </div>
  );
}
