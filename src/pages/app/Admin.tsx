import React, { useState } from "react";
import { NavLink, Route, Routes, useNavigate } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, resetDatabase } from "../../db/db";
import { useSession } from "../../state/session";
import { usePatientMap } from "../../db/hooks";
import { Card, Chip, Stat, StateChip, Seg } from "../../components/ui";
import { fmtDateTime, patientName, relTime } from "../../lib/format";
import { useConnectivity, checkServer, setForcedOffline } from "../../lib/connectivity";
import { syncNow } from "../../lib/sync";
import { audit } from "../../lib/audit";
import { USERS } from "../../db/seed";

export default function Admin() {
  return (
    <div className="page full" style={{ display: "flex", flexDirection: "column" }}>
      <nav className="tabs" aria-label="Admin sections">
        <NavLink to="/app/admin" end>Overview</NavLink><NavLink to="/app/admin/connectivity">Connectivity & Sync</NavLink><NavLink to="/app/admin/audit">Audit Log</NavLink><NavLink to="/app/admin/users">Users & Roles</NavLink><NavLink to="/app/admin/reports">Reports</NavLink><NavLink to="/app/admin/settings">Settings</NavLink>
      </nav>
      <div className="page">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="connectivity" element={<Connectivity />} />
          <Route path="audit" element={<AuditLog />} />
          <Route path="users" element={<Users />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}

function Overview() {
  const counts = useLiveQuery(async () => ({ patients: await db.patients.count(), encounters: await db.encounters.count(), orders: await db.orders.count(), labs: await db.labs.count(), notes: await db.notes.count(), audit: await db.audit.count(), journal: await db.journal.count(), seededAt: (await db.settings.get("seededAt"))?.value }), []);
  const conn = useConnectivity();
  return (
    <div className="stack">
      <div className="stats"><Stat v={counts?.patients ?? "…"} l="Patients" /><Stat v={counts?.encounters ?? "…"} l="Encounters" /><Stat v={counts?.orders ?? "…"} l="Orders" /><Stat v={counts?.labs ?? "…"} l="Lab results" /><Stat v={counts?.notes ?? "…"} l="Notes" /><Stat v={counts?.audit ?? "…"} l="Audit events" /><Stat v={counts?.journal ?? "…"} l="Journal entries" /></div>
      <div className="cards">
        <Card title="Deployment"><ul className="list-plain small"><li>Authority mode: <b>Local (this browser is the facility authority)</b></li><li>Edge: {conn.mode === "online" ? <Chip kind="success">reachable · {conn.latencyMs} ms · v{conn.serverVersion}</Chip> : <Chip kind="danger">unreachable</Chip>}</li><li>Server sync journal: {conn.syncConfigured ? <Chip kind="success">D1 configured</Chip> : <Chip kind="neutral">not configured (optional)</Chip>}</li><li>Data store: IndexedDB (Dexie) · app shell cached by service worker</li><li>Demo seeded: {counts?.seededAt ? fmtDateTime(counts.seededAt) : "…"}</li></ul></Card>
        <Card title="Security posture (demo)"><ul className="list-plain small"><li><Chip kind="success">Audit</Chip> Every chart view, sign, order, administration and admin change is logged with user, role, device and mode.</li><li><Chip kind="warning">Identity</Chip> Demo uses role switching; production requires OIDC/SAML + MFA (backlog SEC-01).</li><li><Chip kind="warning">Encryption</Chip> Browser storage is not encrypted at rest in the demo; OFF-04 specifies device-bound keys for downtime caches.</li><li><Chip kind="success">No external calls</Chip> No fonts, trackers or model providers are contacted.</li></ul></Card>
      </div>
    </div>
  );
}

function Connectivity() {
  const conn = useConnectivity();
  const s = useSession();
  const journal = useLiveQuery(() => db.journal.orderBy("seq").reverse().limit(50).toArray(), []) ?? [];
  const counts = useLiveQuery(async () => { const all = await db.journal.toArray(); const c: Record<string, number> = {}; for (const j of all) c[j.state] = (c[j.state] ?? 0) + 1; return c; }, []) ?? {};
  const drafts = useLiveQuery(() => db.notes.where("status").equals("draft").count(), []) ?? 0;
  const authority = useLiveQuery(async () => (await db.settings.get("authorityMode"))?.value ?? "local", []) ?? "local";
  const [busy, setBusy] = useState(false);
  async function doSync() { setBusy(true); const r = await syncNow(); setBusy(false); s.toast(r.skipped ? `Sync: ${r.skipped}` : `Sync: ${r.accepted} accepted, ${r.rejected} rejected`, r.accepted ? "success" : "warning"); }
  async function setAuthority(v: string) { await db.settings.put({ key: "authorityMode", value: v }); await audit("CONFIG_CHANGE", { resource: "settings", detail: `authorityMode=${v}` }); }
  return (
    <div className="stack">
      <div className="cards">
        <Card title="Connectivity (HUI-25 / OFF-03)">
          <div className="stack small">
            <div className="row"><span style={{ width: 160 }}>Mode</span>{conn.mode === "online" ? <Chip kind="success">Online — edge reachable</Chip> : conn.mode === "offline" ? <Chip kind="danger">Offline — local authority continues</Chip> : <Chip kind="neutral">Checking…</Chip>}</div>
            <div className="row"><span style={{ width: 160 }}>Browser flag</span><span>navigator.onLine = {String(navigator.onLine)} (not used alone)</span></div>
            <div className="row"><span style={{ width: 160 }}>Last reachability check</span><span>{conn.lastCheck ? relTime(conn.lastCheck) : "—"}{conn.latencyMs ? ` · ${conn.latencyMs} ms` : ""}</span></div>
            <div className="row"><span style={{ width: 160 }}>Last online</span><span>{conn.lastOnline ? fmtDateTime(conn.lastOnline) : "never this session"}</span></div>
            <div className="row"><span style={{ width: 160 }}>Local chart data</span><span>Authoritative on this device · never expires in local-authority mode</span></div>
            <div className="row"><span style={{ width: 160 }}>Unsigned drafts</span><span>{drafts} note(s)</span></div>
            <div className="row" style={{ marginTop: 8 }}><button className="btn" onClick={() => checkServer()}>Check now</button><button className={"btn " + (conn.forcedOffline ? "primary" : "")} onClick={() => setForcedOffline(!conn.forcedOffline)}>{conn.forcedOffline ? "Simulated outage ON — restore" : "Simulate internet outage"}</button></div>
            <div className="muted">Tip: open DevTools → Network → Offline, or turn off Wi-Fi. The whole app keeps working; the status chip changes and every write stays attributable.</div>
          </div>
        </Card>
        <Card title="Durable journal (OFF-05 / OFF-06)">
          <div className="stack small">
            <div className="row"><span style={{ width: 160 }}>Authority mode</span><Seg value={authority} onChange={setAuthority} options={[{ v: "local", l: "Local authority" }, { v: "server", l: "Server authority (queue → sync)" }]} /></div>
            <div className="row" style={{ flexWrap: "wrap" }}>{["local-draft", "local-committed", "queued", "syncing", "server-accepted", "conflict", "rejected"].map((st) => <span key={st} className="row" style={{ gap: 4 }}><StateChip s={st} /><b className="num">{counts[st] ?? 0}</b></span>)}</div>
            <div className="row"><button className="btn primary" disabled={busy} onClick={doSync}>Sync now</button><span className="muted">{conn.syncConfigured ? "Server D1 journal is configured." : "Server journal not configured: entries stay queued and are never shown as completed. Deploy with a D1 binding to enable."}</span></div>
          </div>
        </Card>
      </div>
      <Card title="Recent journal entries" tight>
        <div className="table-wrap"><table className="grid compact"><thead><tr><th>Seq</th><th>Recorded</th><th>Author</th><th>Device</th><th>Resource</th><th>Op</th><th>Digest</th><th>State</th><th>Error</th></tr></thead><tbody>
          {journal.map((j) => <tr key={j.id}><td className="num">{j.seq}</td><td className="num">{fmtDateTime(j.recorded)}</td><td>{j.authorId}</td><td className="mono">{j.device}</td><td>{j.resource} <span className="muted mono">{j.resourceId.slice(0, 12)}</span></td><td>{j.op}</td><td className="mono">{j.payloadDigest}</td><td><StateChip s={j.state} /></td><td className="small muted">{j.error ?? ""}</td></tr>)}
          {journal.length === 0 && <tr><td colSpan={9} className="empty">No journal entries yet. Sign a note or an order to create one.</td></tr>}
        </tbody></table></div>
      </Card>
    </div>
  );
}

function AuditLog() {
  const pm = usePatientMap();
  const [q, setQ] = useState("");
  const [action, setAction] = useState("");
  const rows = useLiveQuery(() => db.audit.orderBy("time").reverse().limit(400).toArray(), []) ?? [];
  const actions = Array.from(new Set(rows.map((r) => r.action))).sort();
  const list = rows.filter((r) => (!action || r.action === action) && (!q || `${r.userName} ${r.detail} ${r.patientId ?? ""} ${pm.get(r.patientId ?? "")?.mrn ?? ""}`.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="stack">
      <div className="row"><input className="input" style={{ width: 280 }} placeholder="Filter by user, MRN or detail" value={q} onChange={(e) => setQ(e.target.value)} /><select className="select" style={{ width: 220 }} value={action} onChange={(e) => setAction(e.target.value)}><option value="">All actions</option>{actions.map((a) => <option key={a}>{a}</option>)}</select><span className="muted small">{list.length} events (tamper-evident chain on roadmap SEC-05)</span></div>
      <div className="card"><div className="table-wrap"><table className="grid compact"><thead><tr><th>Time</th><th>User</th><th>Role</th><th>Action</th><th>Patient</th><th>Resource</th><th>Detail</th><th>Device</th><th>Mode</th></tr></thead><tbody>
        {list.map((r) => { const p = r.patientId ? pm.get(r.patientId) : undefined; return <tr key={r.id}><td className="num">{fmtDateTime(r.time)}</td><td>{r.userName}</td><td>{r.role}</td><td className="mono">{r.action}</td><td>{p ? `${patientName(p)} (${p.mrn})` : ""}</td><td>{r.resource}</td><td>{r.detail}</td><td className="mono">{r.device}</td><td><Chip kind={r.mode === "online" ? "success" : "warning"}>{r.mode}</Chip></td></tr>; })}
      </tbody></table></div></div>
    </div>
  );
}

function Users() {
  const s = useSession();
  const rights: Record<string, string[]> = {
    physician: ["read chart", "write notes", "sign", "cosign", "order", "discharge"], nurse: ["read chart", "document flowsheets", "administer (eMAR)", "assign beds"], pharmacist: ["read chart", "verify / reject orders"], lab: ["accession", "result", "reject specimens"], radiology: ["protocol", "acquire", "report"], registrar: ["register", "schedule", "check-in", "bed board"], ed: ["read chart", "triage", "order", "disposition"], admin: ["users", "audit", "configuration", "no clinical chart write"], patient: ["own record", "messages", "appointments"],
  };
  return (
    <div className="card"><div className="table-wrap"><table className="grid"><thead><tr><th>User</th><th>Credentials</th><th>Role</th><th>Department</th><th>Rights (RBAC, demo)</th><th></th></tr></thead><tbody>
      {USERS.map((u) => <tr key={u.id}><td><b>{u.name}</b></td><td>{u.credentials}</td><td><Chip kind="info">{u.role}</Chip></td><td>{u.department}</td><td className="small">{(rights[u.role] ?? []).join(" · ")}</td><td><button className="btn sm" onClick={() => s.switchUser(u.id)} disabled={u.id === s.user.id}>{u.id === s.user.id ? "Current" : "Switch"}</button></td></tr>)}
    </tbody></table></div></div>
  );
}

function Reports() {
  const data = useLiveQuery(async () => {
    const [encs, beds, orders, labs, adm, inbox] = await Promise.all([db.encounters.toArray(), db.beds.toArray(), db.orders.toArray(), db.labs.toArray(), db.administrations.toArray(), db.inbox.toArray()]);
    const byUnit: Record<string, number> = {};
    for (const b of beds.filter((x) => x.status === "occupied")) byUnit[b.unit] = (byUnit[b.unit] ?? 0) + 1;
    const occ = Object.entries(byUnit).map(([u, n]) => ({ unit: u, occ: n, total: beds.filter((b) => b.unit === u).length }));
    const today = new Date().toISOString().slice(0, 10);
    return {
      occ, edToday: encs.filter((e) => e.type === "ed" && e.start.slice(0, 10) === today).length, ordersToday: orders.filter((o) => o.orderedAt.slice(0, 10) === today).length,
      abnormal: labs.filter((l) => l.flag).length, critical: labs.filter((l) => l.flag === "HH" || l.flag === "LL").length, unack: labs.filter((l) => !l.acknowledged && l.flag).length,
      onTime: adm.filter((a) => a.status === "given").length, held: adm.filter((a) => a.status === "held").length, missed: adm.filter((a) => a.status === "missed").length,
      inboxOpen: inbox.filter((i) => i.status !== "done").length, los: encs.filter((e) => e.type === "inpatient" && e.status === "admitted").map((e) => (Date.now() - new Date(e.start).getTime()) / 86400000),
    };
  }, []);
  if (!data) return <div className="empty">Computing…</div>;
  const avgLos = data.los.length ? (data.los.reduce((a, b) => a + b, 0) / data.los.length).toFixed(1) : "0";
  return (
    <div className="stack">
      <div className="stats"><Stat v={data.edToday} l="ED arrivals today" /><Stat v={data.ordersToday} l="Orders placed today" /><Stat v={avgLos + " d"} l="Average inpatient LOS" /><Stat v={data.unack} l="Abnormal results unacknowledged" kind={data.unack ? "warning" : "success"} /><Stat v={data.critical} l="Critical values (all time)" kind="danger" /><Stat v={data.inboxOpen} l="Open In Basket items" /></div>
      <div className="cards">
        <Card title="Occupancy by unit" tight><table className="grid compact"><thead><tr><th>Unit</th><th className="right">Occupied</th><th className="right">Beds</th><th className="right">Rate</th></tr></thead><tbody>{data.occ.map((o) => <tr key={o.unit}><td>{o.unit}</td><td className="right num">{o.occ}</td><td className="right num">{o.total}</td><td className="right num">{Math.round((o.occ / o.total) * 100)}%</td></tr>)}</tbody></table></Card>
        <Card title="Medication administration (48 h)" tight><table className="grid compact"><tbody><tr><td>Given</td><td className="right num">{data.onTime}</td></tr><tr><td>Held</td><td className="right num">{data.held}</td></tr><tr><td>Missed</td><td className="right num" style={{ color: data.missed ? "var(--danger)" : undefined }}>{data.missed}</td></tr><tr><td>Completion rate</td><td className="right num">{Math.round((data.onTime / Math.max(1, data.onTime + data.held + data.missed)) * 100)}%</td></tr></tbody></table></Card>
      </div>
      <p className="small muted">Operational dashboards are computed live from the local record. Quality measures with versioned definitions and warehouse export are on the roadmap (§14).</p>
    </div>
  );
}

function Settings() {
  const s = useSession();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  async function reset() {
    if (!confirm("Reset the demo hospital? All local changes will be discarded and the synthetic dataset regenerated.")) return;
    setBusy(true);
    await resetDatabase();
    nav("/app"); window.location.reload();
  }
  return (
    <div className="cards">
      <Card title="Appearance"><div className="stack"><div className="row"><span style={{ width: 120 }}>Theme</span><Seg value={s.theme} onChange={s.setTheme} options={[{ v: "light", l: "Light" }, { v: "dark", l: "Dark" }, { v: "contrast", l: "High contrast" }]} /></div><div className="row"><span style={{ width: 120 }}>Language</span><Seg value={s.lang} onChange={s.setLang} options={[{ v: "en", l: "English" }, { v: "ar", l: "العربية (RTL)" }]} /></div><div className="small muted">Tokens are defined in one stylesheet; dark and high-contrast pairs follow the hospital interface specification.</div></div></Card>
      <Card title="Demo data"><div className="stack"><p className="small">The hospital is generated from a fixed seed, so every reset produces the same 48 patients, beds, orders and results. Your edits are stored locally in this browser only.</p><button className="btn danger" disabled={busy} onClick={reset}>Reset demo hospital</button></div></Card>
      <Card title="Install as an app"><p className="small">Magic EHR is a Progressive Web App. Use your browser's "Install" / "Add to Home Screen" option to run it in its own window with full offline support. Deploy your own copy with <span className="kbd">npm run deploy</span>.</p></Card>
      <Card title="Interoperability"><p className="small">FHIR R4 CapabilityStatement: <a href="/api/fhir/metadata" target="_blank" rel="noreferrer">/api/fhir/metadata</a>. Per-patient FHIR Bundles can be exported from any chart (Summary → Export FHIR).</p></Card>
    </div>
  );
}
