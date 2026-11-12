import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../db/db";
import { useSession } from "../../state/session";
import { usePatientMap, userShort } from "../../db/hooks";
import { Card, Chip, Stat, statusKind } from "../../components/ui";
import { ageFromDob, daysBetween, fmtTime, patientName, relTime } from "../../lib/format";
import { news2, sepsisScreen } from "../../lib/cds";
import { IAlert, IChevron } from "../../components/Icons";

export default function Home() {
  const s = useSession();
  const nav = useNavigate();
  const pm = usePatientMap();
  const encs = useLiveQuery(() => db.encounters.filter((e) => e.status !== "discharged" && e.status !== "canceled").toArray(), []) ?? [];
  const inbox = useLiveQuery(() => db.inbox.where("ownerId").equals(s.user.id).and((i) => i.status !== "done").toArray(), [s.user.id]) ?? [];
  const appts = useLiveQuery(() => db.appointments.filter((a) => a.start.slice(0, 10) === new Date().toISOString().slice(0, 10)).toArray(), []) ?? [];
  const vitals = useLiveQuery(() => db.vitals.toArray(), []) ?? [];
  const adminsDue = useLiveQuery(() => db.administrations.where("status").equals("due").toArray(), []) ?? [];
  const pharmQ = useLiveQuery(() => db.pharmacy.where("status").equals("pending").count(), []) ?? 0;
  const specQ = useLiveQuery(() => db.specimens.filter((x) => x.status !== "resulted" && x.status !== "rejected").count(), []) ?? 0;
  const imgQ = useLiveQuery(() => db.imaging.filter((x) => x.status !== "final").count(), []) ?? 0;
  const beds = useLiveQuery(() => db.beds.toArray(), []) ?? [];
  const notesPending = useLiveQuery(() => db.notes.filter((n) => n.status === "draft" || n.status === "pending-cosign").toArray(), []) ?? [];
  const journal = useLiveQuery(() => db.journal.toArray(), []) ?? [];

  const latestVitalsByPatient = new Map<string, (typeof vitals)[number]>();
  for (const v of vitals) { const cur = latestVitalsByPatient.get(v.patientId); if (!cur || cur.time < v.time) latestVitalsByPatient.set(v.patientId, v); }

  const inpt = encs.filter((e) => e.type === "inpatient");
  const mine = s.role === "physician" ? inpt.filter((e) => e.attendingId === s.user.id || (s.user.id === "u-res1" && e.attendingId === "u-phys1")) : s.role === "nurse" ? inpt.filter((e) => e.unit === s.user.department) : s.role === "ed" ? encs.filter((e) => e.type === "ed") : inpt;
  const watch = inpt.map((e) => ({ e, v: latestVitalsByPatient.get(e.patientId) })).filter((x) => x.v).map((x) => ({ ...x, n: news2(x.v!), sep: sepsisScreen(x.v!) })).filter((x) => x.n >= 5 || x.sep.positive).sort((a, b) => b.n - a.n);
  const overdue = adminsDue.filter((a) => new Date(a.scheduled).getTime() < Date.now() - 60 * 60000);
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 18 ? "Good afternoon" : "Good evening";
  const myAppts = appts.filter((a) => s.role === "registrar" || s.role === "admin" || s.role === "nurse" ? true : a.providerId === s.user.id).sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="page">
      <div className="page-head">
        <h1>{greeting}, {s.user.name.split(" ")[0]}</h1>
        <span className="sub">{s.user.department} · {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</span>
      </div>

      <div className="stats" style={{ marginBottom: 16 }}>
        {(s.role === "physician" || s.role === "ed" || s.role === "nurse") && <Stat v={mine.length} l={s.role === "nurse" ? `Patients on ${s.user.department}` : s.role === "ed" ? "Patients in ED" : "My inpatients"} />}
        {(s.role === "physician" || s.role === "ed" || s.role === "nurse" || s.role === "pharmacist") && <Stat v={inbox.filter((i) => i.status === "new").length} l="New In Basket items" kind={inbox.some((i) => i.priority === "high" && i.status === "new") ? "danger" : undefined} />}
        {s.role === "physician" && <Stat v={notesPending.filter((n) => n.authorId === s.user.id || (n.cosignRequired && mine.some((e) => e.id === n.encounterId))).length} l="Notes to sign / cosign" kind="warning" />}
        {s.role === "nurse" && <Stat v={overdue.length} l="Overdue medications" kind={overdue.length ? "danger" : "success"} />}
        {s.role === "nurse" && <Stat v={adminsDue.length} l="Doses due today" />}
        {s.role === "pharmacist" && <Stat v={pharmQ} l="Orders awaiting verification" kind="warning" />}
        {s.role === "lab" && <Stat v={specQ} l="Specimens in queue" kind="info" />}
        {s.role === "radiology" && <Stat v={imgQ} l="Studies in worklist" kind="info" />}
        {(s.role === "registrar" || s.role === "admin") && <Stat v={myAppts.filter((a) => a.status === "scheduled").length} l="Arrivals expected today" />}
        {(s.role === "registrar" || s.role === "admin" || s.role === "ed") && <Stat v={beds.filter((b) => b.status === "available" && b.unit !== "Emergency").length} l="Inpatient beds available" kind="success" />}
        <Stat v={watch.length} l="Deterioration watch (NEWS2 ≥ 5 or sepsis screen)" kind={watch.length ? "danger" : "success"} />
        {s.role === "admin" && <Stat v={journal.filter((j) => j.state === "queued" || j.state === "conflict").length} l="Journal entries awaiting sync" />}
      </div>

      <div className="cards">
        {(s.role === "physician" || s.role === "nurse" || s.role === "ed") && (
          <Card title={s.role === "ed" ? "Emergency department" : s.role === "nurse" ? `${s.user.department} assignment` : "My patients"} actions={<Link to={s.role === "ed" ? "/app/ed" : "/app/lists"} className="btn sm">Open list <IChevron /></Link>} tight>
            <div className="table-wrap"><table className="grid compact"><thead><tr><th>Location</th><th>Patient</th><th>Reason</th><th>NEWS2</th><th>LOS</th></tr></thead><tbody>
              {mine.slice(0, 10).map((e) => { const p = pm.get(e.patientId); if (!p) return null; const v = latestVitalsByPatient.get(e.patientId); const n = v ? news2(v) : null; return (
                <tr key={e.id} className="clickable" onClick={() => s.openPatient(p.id)}><td className="num">{e.unit ? `${e.room}${e.bed && e.bed !== "1" ? e.bed : ""}` : "Waiting"}</td><td><b>{patientName(p)}</b> <span className="muted">{ageFromDob(p.dob)}{p.sex}</span></td><td>{e.reason}</td><td>{n !== null ? <Chip kind={n >= 7 ? "danger" : n >= 5 ? "warning" : "success"}>{n}</Chip> : "—"}</td><td className="num">{daysBetween(e.start)}d</td></tr>); })}
              {mine.length === 0 && <tr><td colSpan={5} className="empty">No patients assigned.</td></tr>}
            </tbody></table></div>
          </Card>
        )}
        {(s.role === "physician" || s.role === "registrar" || s.role === "nurse" || s.role === "admin") && myAppts.length > 0 && (
          <Card title="Today's schedule" actions={<Link to="/app/schedule" className="btn sm">Open schedule <IChevron /></Link>} tight>
            <div className="table-wrap"><table className="grid compact"><thead><tr><th>Time</th><th>Patient</th><th>Type</th><th>Provider</th><th>Status</th></tr></thead><tbody>
              {myAppts.slice(0, 10).map((a) => { const p = pm.get(a.patientId); if (!p) return null; return (
                <tr key={a.id} className="clickable" onClick={() => s.openPatient(p.id)}><td className="num">{fmtTime(a.start)}</td><td><b>{patientName(p)}</b></td><td>{a.type} · {a.reason}</td><td>{userShort(a.providerId)}</td><td><Chip kind={statusKind(a.status)}>{a.status}</Chip></td></tr>); })}
            </tbody></table></div>
          </Card>
        )}
        {watch.length > 0 && (
          <Card title={<><IAlert width={16} height={16} style={{ color: "var(--danger)" }} /> Deterioration watch</>} tight>
            <div className="table-wrap"><table className="grid compact"><thead><tr><th>Patient</th><th>Location</th><th>NEWS2</th><th>Sepsis screen</th><th>Last vitals</th></tr></thead><tbody>
              {watch.slice(0, 8).map(({ e, v, n, sep }) => { const p = pm.get(e.patientId)!; return (
                <tr key={e.id} className="clickable" onClick={() => s.openPatient(p.id, "flowsheets")}><td><b>{patientName(p)}</b></td><td>{e.unit} {e.room}{e.bed !== "1" ? e.bed : ""}</td><td><Chip kind={n >= 7 ? "danger" : "warning"}>{n}</Chip></td><td>{sep.positive ? <span style={{ color: "var(--danger)", fontWeight: 600 }}>Positive: {sep.criteria.join(", ")}</span> : "Negative"}</td><td className="muted">{relTime(v!.time)}</td></tr>); })}
            </tbody></table></div>
          </Card>
        )}
        {inbox.length > 0 && (s.role === "physician" || s.role === "ed" || s.role === "nurse" || s.role === "pharmacist") && (
          <Card title="In Basket" actions={<Link to="/app/inbox" className="btn sm">Open In Basket <IChevron /></Link>} tight>
            <ul className="list-plain" style={{ padding: "0 12px" }}>
              {inbox.sort((a, b) => (a.priority === "high" ? -1 : 1) - (b.priority === "high" ? -1 : 1) || b.created.localeCompare(a.created)).slice(0, 7).map((i) => (
                <li key={i.id} style={{ cursor: "pointer" }} onClick={() => nav("/app/inbox?item=" + i.id)}>
                  <div className="row"><Chip kind={i.priority === "high" ? "danger" : "neutral"}>{i.type}</Chip><b style={{ fontWeight: i.status === "new" ? 700 : 500 }}>{i.subject}</b><span className="spacer" /><span className="small muted">{relTime(i.created)}</span></div>
                  <div className="small muted">{i.patientId && pm.get(i.patientId) ? patientName(pm.get(i.patientId)!) + " · " : ""}{i.body.slice(0, 90)}</div>
                </li>
              ))}
            </ul>
          </Card>
        )}
        {s.role === "pharmacist" && <Card title="Verification queue" actions={<Link to="/app/pharmacy" className="btn primary sm">Open queue</Link>}><p>{pharmQ} medication orders are waiting for clinical verification. Allergies, renal function and interactions are shown beside each order.</p></Card>}
        {s.role === "lab" && <Card title="Specimen queue" actions={<Link to="/app/lab" className="btn primary sm">Open bench</Link>}><p>{specQ} specimens are ordered, collected or in process. STAT specimens sort to the top.</p></Card>}
        {s.role === "radiology" && <Card title="Imaging worklist" actions={<Link to="/app/imaging" className="btn primary sm">Open worklist</Link>}><p>{imgQ} studies need scheduling, acquisition or a report.</p></Card>}
        {s.role === "admin" && <Card title="System" actions={<Link to="/app/admin" className="btn primary sm">Open admin</Link>}><p>Local authority mode. {journal.length} journal entries, {beds.length} beds, {encs.length} active encounters. Review audit, connectivity and users.</p></Card>}
      </div>
    </div>
  );
}
