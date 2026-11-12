import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db/db";
import { useActiveEncounter, useLatestVitals, userShort } from "../../../db/hooks";
import { ageFromDob, bmi, daysBetween, patientName, relTime } from "../../../lib/format";
import { news2 } from "../../../lib/cds";
import { t } from "../../../lib/i18n";
import { IAlert } from "../../../components/Icons";
import { Chip } from "../../../components/ui";
import type { Patient } from "../../../db/types";

export default function Storyboard({ patient: p }: { patient: Patient }) {
  const enc = useActiveEncounter(p.id);
  const v = useLatestVitals(p.id);
  const allergies = useLiveQuery(() => db.allergies.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const problems = useLiveQuery(() => db.problems.where("patientId").equals(p.id).and((x) => x.status !== "resolved").toArray(), [p.id]) ?? [];
  const newLabs = useLiveQuery(() => db.labs.where("patientId").equals(p.id).and((l) => !l.acknowledged).count(), [p.id]) ?? 0;
  const meds = useLiveQuery(() => db.medications.where("patientId").equals(p.id).and((m) => m.status === "active").count(), [p.id]) ?? 0;
  const n = v ? news2(v) : null;
  return (
    <aside className="storyboard" aria-label="Patient storyboard">
      <div className="ph">
        <div className="pavatar" style={{ background: `hsl(${p.hue} 40% 45%)` }}>{p.firstName[0]}{p.lastName[0]}</div>
        <div><div className="pname">{patientName(p)}</div><div className="psub">{ageFromDob(p.dob)} y · {p.sex === "F" ? "Female" : p.sex === "M" ? "Male" : "Other"} · {p.dob}</div><div className="psub num">{t("mrn")} {p.mrn}</div></div>
      </div>
      {p.preferredName && <div className="small muted">Preferred: {p.preferredName}</div>}
      <div className="sec">
        <h4>{t("allergies")}</h4>
        <div className="alert-list">
          {allergies.length === 0 && <div className="small" style={{ color: "var(--success)" }}>✓ {t("allergiesNone")} (reviewed)</div>}
          {allergies.map((a) => <div key={a.id} className={"alert-item" + (a.severity === "severe" ? "" : " warn")}><IAlert /><span>{a.substance}<div style={{ fontWeight: 400, fontSize: 11.5 }}>{a.reaction} · {a.severity}{!a.verified ? " · unverified" : ""}</div></span></div>)}
        </div>
      </div>
      {(p.flags.length > 0 || p.isolation || p.codeStatus !== "Full Code") && (
        <div className="sec"><h4>Alerts & flags</h4><div className="row" style={{ gap: 4 }}>
          {p.codeStatus !== "Full Code" && <Chip kind="danger">{p.codeStatus}</Chip>}
          {p.isolation && <Chip kind="warning">{p.isolation} isolation</Chip>}
          {p.flags.map((f) => <Chip key={f} kind="info">{f}</Chip>)}
        </div></div>
      )}
      <div className="sec">
        <h4>{t("encounter")}</h4>
        {enc ? <>
          <div className="kv"><span>Type</span><b>{enc.type === "ed" ? "Emergency" : enc.type[0]!.toUpperCase() + enc.type.slice(1)}</b></div>
          {enc.unit && <div className="kv"><span>Location</span><b>{enc.unit} {enc.room}{enc.bed && enc.bed !== "1" ? enc.bed : ""}</b></div>}
          <div className="kv"><span>{enc.type === "inpatient" ? "LOS" : "Arrived"}</span><b>{enc.type === "inpatient" ? `${daysBetween(enc.start)} days` : relTime(enc.start)}</b></div>
          <div className="kv"><span>Attending</span><b>{userShort(enc.attendingId)}</b></div>
          <div className="kv"><span>Reason</span><b style={{ textAlign: "end" }}>{enc.reason}</b></div>
          {enc.acuity && <div className="kv"><span>ESI</span><b>{enc.acuity}</b></div>}
        </> : <div className="muted">No active encounter</div>}
        <div className="kv"><span>{t("codeStatus")}</span><b style={{ color: p.codeStatus !== "Full Code" ? "var(--danger)" : undefined }}>{p.codeStatus}</b></div>
        <div className="kv"><span>{t("pcp")}</span><b>{userShort(p.pcpId)}</b></div>
        <div className="kv"><span>Language</span><b>{p.language}</b></div>
      </div>
      <div className="sec">
        <h4>Last vitals {v && <span className="muted" style={{ textTransform: "none", letterSpacing: 0 }}>· {relTime(v.time)}</span>}</h4>
        {v ? <div className="vit num">
          <span>BP <b>{v.sbp}/{v.dbp}</b></span><span>HR <b>{v.hr}</b></span><span>RR <b>{v.rr}</b></span><span>T <b>{v.temp}</b> °C</span><span>SpO₂ <b style={{ color: (v.spo2 ?? 99) < 92 ? "var(--danger)" : undefined }}>{v.spo2}%</b></span><span>Pain <b>{v.pain ?? "—"}</b></span>
        </div> : <div className="muted">None recorded</div>}
        {n !== null && <div className="kv" style={{ marginTop: 4 }}><span>NEWS2</span><Chip kind={n >= 7 ? "danger" : n >= 5 ? "warning" : "success"}>{n}</Chip></div>}
      </div>
      <div className="sec">
        <h4>At a glance</h4>
        <div className="kv"><span>Active problems</span><b>{problems.length}</b></div>
        <div className="kv"><span>Active meds</span><b>{meds}</b></div>
        <div className="kv"><span>New results</span><b style={{ color: newLabs ? "var(--info)" : undefined }}>{newLabs}</b></div>
        <div className="kv"><span>Weight / BMI</span><b>{p.weightKg} kg / {bmi(p.heightCm, p.weightKg)}</b></div>
        <div className="kv"><span>Height</span><b>{p.heightCm} cm</b></div>
        {p.bloodType && <div className="kv"><span>Blood type</span><b>{p.bloodType}</b></div>}
        <div className="kv"><span>Coverage</span><b style={{ textAlign: "end" }}>{p.insurance}</b></div>
      </div>
    </aside>
  );
}
