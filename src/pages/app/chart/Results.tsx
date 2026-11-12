import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db/db";
import { useSession } from "../../../state/session";
import { userName } from "../../../db/hooks";
import { Card, Chip, Dialog, Seg, Sparkline, statusKind } from "../../../components/ui";
import { fmtDate, fmtDateTime, fmtTime } from "../../../lib/format";
import { audit } from "../../../lib/audit";
import type { LabResult, Patient } from "../../../db/types";

export default function Results({ patient: p }: { patient: Patient }) {
  const s = useSession();
  const labs = useLiveQuery(() => db.labs.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const imaging = useLiveQuery(() => db.imaging.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const [view, setView] = useState<"table" | "list" | "imaging">("table");
  const [trend, setTrend] = useState<string | null>(null);
  const cols = Array.from(new Set(labs.map((l) => l.collected))).sort((a, b) => b.localeCompare(a)).slice(0, 8);
  const tests = Array.from(new Set(labs.map((l) => `${l.panel}|${l.name}`))).sort();
  const cell = new Map<string, LabResult>();
  for (const l of labs) cell.set(`${l.name}|${l.collected}`, l);
  const unack = labs.filter((l) => !l.acknowledged).length;
  async function ackAll() { await db.labs.where("patientId").equals(p.id).modify({ acknowledged: true }); await db.inbox.where("patientId").equals(p.id).and((i) => i.type === "result" && i.status !== "done").modify({ status: "done" }); await audit("RESULT_ACK", { patientId: p.id, resource: "lab", detail: `Acknowledged ${unack} results` }); s.toast("All results acknowledged", "success"); }
  const series = trend ? labs.filter((l) => l.name === trend && typeof l.value === "number").sort((a, b) => a.collected.localeCompare(b.collected)) : [];

  return (
    <div className="stack">
      <div className="row"><h2 style={{ margin: 0, fontSize: 18 }}>Results Review</h2><Seg value={view} onChange={setView} options={[{ v: "table", l: "Table" }, { v: "list", l: "By panel" }, { v: "imaging", l: `Imaging (${imaging.length})` }]} /><span className="spacer" />{unack > 0 && <Chip kind="info">{unack} not acknowledged</Chip>}{unack > 0 && (s.role === "physician" || s.role === "ed") && <button className="btn primary sm" onClick={ackAll}>Acknowledge all</button>}</div>
      {view === "table" && (
        <div className="card"><div className="table-wrap"><table className="grid compact flow">
          <thead><tr><th className="rowh">Test</th><th>Trend</th>{cols.map((c) => <th key={c} className="num" style={{ textAlign: "center" }}>{fmtDate(c)}<br /><span className="muted">{fmtTime(c)}</span></th>)}<th>Reference</th></tr></thead>
          <tbody>
            {tests.map((t) => { const [panel, name] = t.split("|"); const any = labs.find((l) => l.name === name)!; const vals = labs.filter((l) => l.name === name && typeof l.value === "number").sort((a, b) => a.collected.localeCompare(b.collected)).map((l) => l.value as number); return (
              <tr key={t}><th className="rowh"><button className="btn ghost sm" style={{ fontWeight: 600 }} onClick={() => setTrend(name!)}>{name}</button><div className="small muted" style={{ fontWeight: 400 }}>{panel}</div></th><td><Sparkline values={vals} low={any.refLow} high={any.refHigh} /></td>
                {cols.map((c) => { const l = cell.get(`${name}|${c}`); return <td key={c} className={"cell num" + (l?.flag ? (l.flag.length === 2 ? " crit" : " abn") : "")} title={l ? `Collected ${fmtDateTime(l.collected)} · reported ${fmtDateTime(l.reported)} · ${l.status}${l.acknowledged ? "" : " · not acknowledged"}` : "not measured"}>{l ? <>{l.value}{l.flag && <span className={"flag " + l.flag} style={{ marginInlineStart: 3 }}>{l.flag}</span>}{l.status === "corrected" && <span className="flag A">C</span>}{!l.acknowledged && <span style={{ color: "var(--info)" }}>•</span>}</> : <span className="muted">—</span>}</td>; })}
                <td className="muted small">{any.refLow ?? ""}{any.refLow !== undefined || any.refHigh !== undefined ? "–" : ""}{any.refHigh ?? ""} {any.unit}</td></tr>); })}
            {tests.length === 0 && <tr><td colSpan={cols.length + 3} className="empty">No results</td></tr>}
          </tbody></table></div>
          <div className="card-b small muted">Columns are collection times. “—” means not measured; no line is drawn through unmeasured values. • = not yet acknowledged. Hover a cell for collection and report times.</div>
        </div>
      )}
      {view === "list" && (
        <div className="stack">{Array.from(new Set(labs.map((l) => `${l.panel}|${l.collected}`))).sort((a, b) => b.split("|")[1]!.localeCompare(a.split("|")[1]!)).map((k) => { const [panel, coll] = k.split("|"); const rows = labs.filter((l) => l.panel === panel && l.collected === coll); return (
          <Card key={k} title={<>{panel} <span className="muted" style={{ fontWeight: 400 }}>collected {fmtDateTime(coll)} · reported {fmtDateTime(rows[0]!.reported)} · {rows[0]!.specimen}</span>{rows.some((r) => !r.acknowledged) && <Chip kind="info">new</Chip>}</>} tight>
            <table className="grid compact"><tbody>{rows.map((l) => <tr key={l.id}><td style={{ width: 240 }}>{l.name} <span className="muted mono small">{l.code}</span></td><td className={"num" + (l.flag ? " abn" : "")}>{l.value} {l.unit} {l.flag && <span className={"flag " + l.flag}>{l.flag}</span>}</td><td className="muted small">{l.refLow ?? ""}{l.refLow !== undefined || l.refHigh !== undefined ? "–" : ""}{l.refHigh ?? ""}</td><td><Chip kind={statusKind(l.status)}>{l.status}</Chip></td></tr>)}</tbody></table>
          </Card>); })}</div>
      )}
      {view === "imaging" && (
        <div className="stack">{imaging.sort((a, b) => (b.scheduledAt ?? "").localeCompare(a.scheduledAt ?? "")).map((st) => <Card key={st.id} title={<>{st.description} <Chip kind={statusKind(st.status)}>{st.status}</Chip>{st.criticalFinding && <Chip kind="danger">Critical finding</Chip>}</>}><div className="small muted">Accession {st.accession} · {st.modality} · {st.radiologistId ? "Read by " + userName(st.radiologistId) : "Report pending"}</div>{st.reportText ? <div className="note-body" style={{ marginTop: 8 }}>{st.reportText}</div> : <div className="muted" style={{ marginTop: 8 }}>No report yet.</div>}</Card>)}{imaging.length === 0 && <div className="empty">No imaging studies</div>}</div>
      )}
      {trend && (
        <Dialog title={`Trend — ${trend}`} onClose={() => setTrend(null)}>
          {series.length > 1 ? <TrendChart series={series} /> : <div className="empty">Only one value; no trend.</div>}
          <table className="grid compact" style={{ marginTop: 10 }}><thead><tr><th>Collected</th><th className="right">Value</th><th>Flag</th><th>Status</th></tr></thead><tbody>{series.slice().reverse().map((l) => <tr key={l.id}><td>{fmtDateTime(l.collected)}</td><td className="right num">{l.value} {l.unit}</td><td>{l.flag && <span className={"flag " + l.flag}>{l.flag}</span>}</td><td>{l.status}</td></tr>)}</tbody></table>
        </Dialog>
      )}
    </div>
  );
}

function TrendChart({ series }: { series: LabResult[] }) {
  const w = 640, h = 220, pad = 40;
  const vals = series.map((l) => l.value as number);
  const lo = Math.min(...vals, series[0]!.refLow ?? Infinity), hi = Math.max(...vals, series[0]!.refHigh ?? -Infinity);
  const span = hi - lo || 1;
  const t0 = new Date(series[0]!.collected).getTime(), t1 = new Date(series[series.length - 1]!.collected).getTime() || t0 + 1;
  const x = (iso: string) => pad + ((new Date(iso).getTime() - t0) / (t1 - t0 || 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - lo) / span) * (h - pad * 2);
  const rl = series[0]!.refLow, rh = series[0]!.refHigh;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} role="img" aria-label="trend chart">
      {rl !== undefined && rh !== undefined && <rect x={pad} y={y(rh)} width={w - pad * 2} height={y(rl) - y(rh)} fill="var(--success-bg)" />}
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="var(--border-2)" /><line x1={pad} y1={pad} x2={pad} y2={h - pad} stroke="var(--border-2)" />
      <polyline fill="none" stroke="var(--info)" strokeWidth="2" points={series.map((l) => `${x(l.collected)},${y(l.value as number)}`).join(" ")} />
      {series.map((l) => <g key={l.id}><circle cx={x(l.collected)} cy={y(l.value as number)} r="4" fill={l.flag ? "var(--danger)" : "var(--info)"} /><text x={x(l.collected)} y={y(l.value as number) - 8} fontSize="11" textAnchor="middle" fill="var(--text)">{l.value}</text><text x={x(l.collected)} y={h - pad + 14} fontSize="10" textAnchor="middle" fill="var(--text-2)">{fmtDate(l.collected).slice(0, 6)}</text></g>)}
      <text x={pad - 6} y={y(hi) + 4} fontSize="10" textAnchor="end" fill="var(--text-2)">{hi}</text><text x={pad - 6} y={y(lo) + 4} fontSize="10" textAnchor="end" fill="var(--text-2)">{lo}</text>
    </svg>
  );
}
