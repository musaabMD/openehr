import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../../../db/db";
import { useSession } from "../../../state/session";
import { useActiveEncounter, userName } from "../../../db/hooks";
import { Chip, Dialog } from "../../../components/ui";
import { fmtDate, fmtTime, isoNow } from "../../../lib/format";
import { audit, journal } from "../../../lib/audit";
import { news2, sepsisScreen } from "../../../lib/cds";
import { IPlus } from "../../../components/Icons";
import type { Patient, Vital } from "../../../db/types";

const ROWS: { key: keyof Vital; label: string; unit: string; lo?: number; hi?: number; crit?: [number, number] }[] = [
  { key: "sbp", label: "BP systolic", unit: "mmHg", lo: 90, hi: 140, crit: [80, 180] }, { key: "dbp", label: "BP diastolic", unit: "mmHg", lo: 60, hi: 90, crit: [40, 110] },
  { key: "hr", label: "Heart rate", unit: "/min", lo: 50, hi: 100, crit: [40, 130] }, { key: "rr", label: "Resp rate", unit: "/min", lo: 12, hi: 20, crit: [8, 30] },
  { key: "temp", label: "Temperature", unit: "°C", lo: 36, hi: 38, crit: [35, 39.5] }, { key: "spo2", label: "SpO₂", unit: "%", lo: 94, hi: 101, crit: [88, 101] },
  { key: "pain", label: "Pain (0–10)", unit: "", hi: 3, crit: [0, 8] }, { key: "weightKg", label: "Weight", unit: "kg" },
];

export default function Flowsheets({ patient: p }: { patient: Patient }) {
  const s = useSession();
  const enc = useActiveEncounter(p.id);
  const vitals = useLiveQuery(() => db.vitals.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const [add, setAdd] = useState(false);
  const cols = vitals.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 14);
  const canDoc = ["nurse", "physician", "ed", "admin"].includes(s.role);
  return (
    <div className="stack">
      <div className="row"><h2 style={{ margin: 0, fontSize: 18 }}>Flowsheets — Vital signs</h2><span className="spacer" />{canDoc && <button className="btn primary" onClick={() => setAdd(true)}><IPlus /> Document vitals</button>}</div>
      <div className="card"><div className="table-wrap"><table className="grid compact flow">
        <thead><tr><th className="rowh">Measurement</th>{cols.map((c) => <th key={c.id} style={{ textAlign: "center" }}>{fmtDate(c.time)}<br /><span className="muted">{fmtTime(c.time)}</span></th>)}</tr></thead>
        <tbody>
          {ROWS.map((r) => <tr key={r.key as string}><th className="rowh">{r.label} <span className="muted" style={{ fontWeight: 400 }}>{r.unit}</span></th>{cols.map((c) => { const v = c[r.key] as number | undefined; const abn = v !== undefined && ((r.lo !== undefined && v < r.lo) || (r.hi !== undefined && v > r.hi)); const crit = v !== undefined && r.crit && (v < r.crit[0] || v > r.crit[1]); return <td key={c.id} className={"cell num" + (crit ? " crit" : abn ? " abn" : "")} title={v !== undefined ? `${r.label} ${v} ${r.unit} · ${fmtTime(c.time)} · ${c.source} · ${userName(c.authorId)}${c.corrected ? " · corrected" : ""}` : "not measured"}>{v ?? <span className="muted">—</span>}{c.corrected && v !== undefined && <span className="flag A">C</span>}</td>; })}</tr>)}
          <tr><th className="rowh">NEWS2</th>{cols.map((c) => { const n = news2(c); return <td key={c.id} className="cell"><Chip kind={n >= 7 ? "danger" : n >= 5 ? "warning" : "success"}>{n}</Chip></td>; })}</tr>
          <tr><th className="rowh">Sepsis screen</th>{cols.map((c) => { const sp = sepsisScreen(c); return <td key={c.id} className="cell small">{sp.positive ? <span style={{ color: "var(--danger)", fontWeight: 700 }}>POS</span> : <span className="muted">neg</span>}</td>; })}</tr>
          <tr><th className="rowh">Source / author</th>{cols.map((c) => <td key={c.id} className="cell small muted">{c.source}<br />{userName(c.authorId).split(",")[0]}</td>)}</tr>
        </tbody></table></div>
        <div className="card-b small muted">Sticky measurement headings and explicit date/time columns. Shaded cells are outside the reference band (amber) or critical (red). Scanner/device input is isolated from free text.</div>
      </div>
      {add && <VitalsDialog patient={p} encounterId={enc?.id} onClose={() => setAdd(false)} />}
    </div>
  );
}

function VitalsDialog({ patient: p, encounterId, onClose }: { patient: Patient; encounterId?: string; onClose: () => void }) {
  const s = useSession();
  const [f, setF] = useState<Record<string, string>>({ sbp: "", dbp: "", hr: "", rr: "", temp: "", spo2: "", pain: "0", weightKg: "" });
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const num = (k: string) => (f[k]?.trim() ? Number(f[k]) : undefined);
  const errors: string[] = [];
  const chk = (k: string, lo: number, hi: number) => { const v = num(k); if (v !== undefined && (isNaN(v) || v < lo || v > hi)) errors.push(`${k} must be ${lo}–${hi}`); };
  chk("sbp", 40, 300); chk("dbp", 20, 200); chk("hr", 20, 250); chk("rr", 4, 70); chk("temp", 30, 43); chk("spo2", 50, 100); chk("pain", 0, 10); chk("weightKg", 1, 400);
  const any = Object.values(f).some((v) => v.trim() !== "" && v !== "0");
  async function save() {
    const v: Vital = { id: uid("vt"), patientId: p.id, encounterId, time: isoNow(), sbp: num("sbp"), dbp: num("dbp"), hr: num("hr"), rr: num("rr"), temp: num("temp"), spo2: num("spo2"), pain: num("pain"), weightKg: num("weightKg"), source: "manual", authorId: s.user.id };
    await db.vitals.add(v);
    if (v.weightKg) await db.patients.update(p.id, { weightKg: v.weightKg });
    await audit("VITALS_DOCUMENT", { patientId: p.id, resource: "vitals", resourceId: v.id, detail: `BP ${v.sbp ?? "-"}/${v.dbp ?? "-"} HR ${v.hr ?? "-"} RR ${v.rr ?? "-"} T ${v.temp ?? "-"} SpO2 ${v.spo2 ?? "-"}` });
    await journal("create", "vitals", v.id, v, p.id);
    const n = news2(v);
    s.toast(n >= 5 ? `Vitals saved — NEWS2 ${n}: escalation threshold met, notify provider` : "Vitals saved", n >= 5 ? "danger" : "success");
    onClose();
  }
  return (
    <Dialog title={`Document vitals — ${p.lastName.toUpperCase()}, ${p.firstName}`} onClose={onClose} size="narrow" footer={<><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={!any || errors.length > 0} onClick={save}>Save</button></>}>
      <div className="grid2">
        {[["sbp", "Systolic (mmHg)"], ["dbp", "Diastolic (mmHg)"], ["hr", "Heart rate (/min)"], ["rr", "Resp rate (/min)"], ["temp", "Temp (°C)"], ["spo2", "SpO₂ (%)"], ["pain", "Pain (0–10)"], ["weightKg", "Weight (kg)"]].map(([k, l]) => <div key={k} className="field"><label>{l}</label><input className="input num" inputMode="decimal" value={f[k!]} onChange={set(k!)} autoFocus={k === "sbp"} /></div>)}
      </div>
      {errors.length > 0 && <div className="alert warning" style={{ marginTop: 10 }}><div><div className="t">Check values</div><div className="r">{errors.join("; ")}</div></div></div>}
      <div className="small muted" style={{ marginTop: 8 }}>Units are explicit and validated. Author: {userName(s.user.id)}. Time: now.</div>
    </Dialog>
  );
}
