import React, { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../../../db/db";
import { useSession } from "../../../state/session";
import { useActiveEncounter, userName } from "../../../db/hooks";
import { AlertBox, Chip, Dialog, Seg, StateChip, statusKind } from "../../../components/ui";
import { fmtDateTime, isoNow, patientName, addMinutes } from "../../../lib/format";
import { audit, journal } from "../../../lib/audit";
import { CATALOG, CATALOG_BY_ID, ORDER_SETS, searchCatalog, type CatalogEntry } from "../../../lib/catalog";
import { evaluateOrder, type CdsAlert } from "../../../lib/cds";
import { IPlus, IX, ISearch } from "../../../components/Icons";
import type { Order, OrderCategory, Patient } from "../../../db/types";

export default function Orders({ patient: p }: { patient: Patient }) {
  const s = useSession();
  const enc = useActiveEncounter(p.id);
  const [filter, setFilter] = useState<"active" | "all">("active");
  const [composer, setComposer] = useState(false);
  const orders = useLiveQuery(() => db.orders.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const list = orders.filter((o) => filter === "all" || ["signed", "in-progress", "collected", "draft"].includes(o.status)).sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
  const canOrder = ["physician", "ed", "admin"].includes(s.role);
  async function cancel(o: Order) {
    const reason = prompt("Reason for discontinuing " + o.display + ":");
    if (!reason) return;
    await db.orders.update(o.id, { status: "canceled" });
    if (o.category === "medication") await db.medications.where("patientId").equals(p.id).and((m) => m.name === o.display && m.status === "active").modify({ status: "discontinued", end: isoNow() });
    await audit("ORDER_CANCEL", { patientId: p.id, resource: "order", resourceId: o.id, detail: `${o.display} — ${reason}` });
    await journal("update", "order", o.id, { status: "canceled", reason }, p.id);
    s.toast("Order discontinued", "warning");
  }
  return (
    <div className="stack">
      <div className="row"><h2 style={{ margin: 0, fontSize: 18 }}>Orders</h2><Seg value={filter} onChange={setFilter} options={[{ v: "active", l: "Active" }, { v: "all", l: "All" }]} /><span className="spacer" />{canOrder && <button className="btn primary" onClick={() => setComposer(true)} disabled={!enc}><IPlus /> New orders</button>}{!enc && <span className="small muted">No active encounter: open an encounter before ordering.</span>}</div>
      <div className="card"><div className="table-wrap"><table className="grid">
        <thead><tr><th>Ordered</th><th>Order</th><th>Category</th><th>Priority</th><th>Details</th><th>Ordered by</th><th>Status</th><th>Record state</th><th></th></tr></thead>
        <tbody>
          {list.map((o) => <tr key={o.id}><td className="num">{fmtDateTime(o.orderedAt)}</td><td><b>{o.display}</b>{o.orderSet && <div className="small muted">Order set: {o.orderSet}</div>}{o.overrides.length > 0 && <div className="small" style={{ color: "var(--warning)" }}>Alert override: {o.overrides.map((x) => x.reason).join("; ")}</div>}</td><td>{o.category}</td><td><Chip kind={statusKind(o.priority)}>{o.priority}</Chip></td><td className="small">{o.details ?? o.indication}</td><td>{userName(o.orderedBy)}</td><td><Chip kind={statusKind(o.status)}>{o.status}</Chip></td><td><StateChip s={o.localState} /></td><td>{canOrder && !["canceled", "completed", "resulted"].includes(o.status) && <button className="btn sm ghost" onClick={() => cancel(o)}>Discontinue</button>}</td></tr>)}
          {list.length === 0 && <tr><td colSpan={9} className="empty">No orders</td></tr>}
        </tbody></table></div></div>
      {composer && enc && <Composer patient={p} encounterId={enc.id} onClose={() => setComposer(false)} />}
    </div>
  );
}

interface BasketItem { key: string; entry: CatalogEntry; priority: "routine" | "urgent" | "stat"; indication: string; details: string; alerts: CdsAlert[]; overrides: Record<string, string>; orderSet?: string }

function Composer({ patient: p, encounterId, onClose }: { patient: Patient; encounterId: string; onClose: () => void }) {
  const s = useSession();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<OrderCategory | "all" | "sets">("all");
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [signing, setSigning] = useState(false);
  const ctx = useLiveQuery(async () => ({
    allergies: await db.allergies.where("patientId").equals(p.id).toArray(),
    activeMeds: await db.medications.where("patientId").equals(p.id).and((m) => m.status === "active").toArray(),
    recentLabs: await db.labs.where("patientId").equals(p.id).toArray(),
    existingOrders: await db.orders.where("patientId").equals(p.id).toArray(),
  }), [p.id]);
  const results = useMemo(() => (cat === "sets" ? [] : searchCatalog(q, cat === "all" ? undefined : cat)), [q, cat]);
  const problems = useLiveQuery(() => db.problems.where("patientId").equals(p.id).and((x) => x.status !== "resolved").toArray(), [p.id]) ?? [];

  function add(entry: CatalogEntry, priority: BasketItem["priority"] = "routine", orderSet?: string) {
    if (!ctx) return;
    if (basket.some((b) => b.entry.id === entry.id)) { s.toast(`${entry.display} is already in the basket`, "warning"); return; }
    const alerts = evaluateOrder(entry, ctx);
    setBasket((b) => [...b, { key: uid("b"), entry, priority, indication: problems[0]?.display ?? "", details: entry.category === "medication" ? `${entry.defaultDose} ${entry.route} ${entry.frequency}` : entry.frequency ?? "", alerts, overrides: {}, orderSet }]);
  }
  function addSet(id: string) { const os = ORDER_SETS.find((x) => x.id === id)!; for (const it of os.items.filter((x) => x.preselected)) add(CATALOG_BY_ID[it.catalogId]!, it.priority ?? "routine", os.name); s.toast(`${os.name} added — review each order before signing`, "info"); }
  const blocking = basket.filter((b) => b.alerts.some((a) => a.requiresOverride && !b.overrides[a.rule]?.trim()));
  const criticalCount = basket.reduce((n, b) => n + b.alerts.filter((a) => a.severity === "critical").length, 0);

  async function sign() {
    if (signing) return; setSigning(true);
    const now = isoNow();
    for (const b of basket) {
      const o: Order = { id: uid("ord"), patientId: p.id, encounterId, catalogId: b.entry.id, category: b.entry.category, display: b.entry.display, priority: b.priority, status: "signed", orderedBy: s.user.id, orderedAt: now, signedAt: now, indication: b.indication, details: b.details, frequency: b.entry.frequency, overrides: b.alerts.filter((a) => a.requiresOverride).map((a) => ({ rule: a.rule, severity: a.severity, reason: b.overrides[a.rule] ?? "" })), localState: "local-committed", orderSet: b.orderSet };
      await db.orders.add(o);
      if (b.entry.category === "medication") {
        const m = { id: uid("md"), patientId: p.id, encounterId, name: b.entry.display, generic: b.entry.generic!, dose: b.entry.defaultDose!, route: b.entry.route!, frequency: b.entry.frequency!, indication: b.indication, status: "active" as const, start: now, prescriberId: s.user.id, isInpatient: true, schedule: b.entry.schedule ?? [], prn: (b.entry.schedule ?? []).length === 0 };
        await db.medications.add(m);
        await db.pharmacy.add({ id: uid("pv"), orderId: o.id, patientId: p.id, medName: b.entry.display, details: b.details, status: "pending", created: now });
        // schedule today's remaining doses (and a first dose now for STAT)
        const t0 = new Date();
        const slots = b.priority === "stat" || m.schedule.length === 0 ? [addMinutes(now, 10)] : m.schedule.map((hhmm) => { const [hh, mm] = hhmm.split(":").map(Number); const d = new Date(t0); d.setHours(hh!, mm!, 0, 0); if (d.getTime() < t0.getTime()) d.setDate(d.getDate() + 1); return d.toISOString(); });
        await db.administrations.bulkAdd(slots.map((sc) => ({ id: uid("adm"), patientId: p.id, medicationId: m.id, scheduled: sc, status: "due" as const, barcodeVerified: false })));
        await db.orders.update(o.id, { status: "in-progress" });
      }
      if (b.entry.category === "lab") await db.specimens.add({ id: uid("sp"), orderId: o.id, patientId: p.id, tests: b.entry.display, status: "ordered", barcode: `SP${Math.floor(1000000 + Math.random() * 9000000)}`, priority: b.priority, container: b.entry.container ?? "Gold top SST" });
      if (b.entry.category === "imaging") await db.imaging.add({ id: uid("im"), orderId: o.id, patientId: p.id, modality: b.entry.modality ?? "XR", description: b.entry.display, status: "ordered", accession: `ACC${Math.floor(100000 + Math.random() * 900000)}`, priority: b.priority });
      await audit("ORDER_SIGN", { patientId: p.id, resource: "order", resourceId: o.id, detail: `${o.display} ${o.priority}${o.overrides.length ? " with override" : ""}` });
      await journal("sign", "order", o.id, o, p.id);
    }
    s.toast(`${basket.length} order(s) signed for ${patientName(p)}`, "success");
    setSigning(false); onClose();
  }

  return (
    <Dialog title={`Order composer — ${patientName(p)} · MRN ${p.mrn}`} onClose={onClose} size="wide" footer={<><span className="small muted" style={{ marginInlineEnd: "auto" }}>{basket.length} in basket{criticalCount ? ` · ${criticalCount} critical alert(s)` : ""}</span><button className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={basket.length === 0 || blocking.length > 0} onClick={() => setConfirm(true)}>Review & sign ({basket.length})</button></>}>
      <div className="split" style={{ gridTemplateColumns: "1fr 1.2fr" }}>
        <div className="stack">
          <div className="row"><div style={{ position: "relative", flex: 1 }}><ISearch style={{ position: "absolute", left: 8, top: 8, width: 16, color: "var(--text-3)" }} /><input className="input" style={{ paddingInlineStart: 30 }} placeholder="Search orders (e.g. CBC, ceftriaxone, chest x-ray)" value={q} onChange={(e) => setQ(e.target.value)} autoFocus /></div></div>
          <div className="row" style={{ gap: 4 }}>{(["all", "sets", "lab", "imaging", "medication", "nursing", "consult", "diet", "procedure"] as const).map((c) => <button key={c} className={"btn sm" + (cat === c ? " primary" : "")} onClick={() => setCat(c)}>{c === "sets" ? "Order sets" : c}</button>)}</div>
          <div className="card" style={{ maxHeight: 420, overflow: "auto" }}>
            {cat === "sets" ? ORDER_SETS.map((os) => <div key={os.id} className="inbox-item"><div className="row"><b>{os.name}</b><span className="spacer" /><button className="btn sm primary" onClick={() => addSet(os.id)}>Add set</button></div><div className="small muted">{os.description}</div><div className="small">{os.items.map((it) => CATALOG_BY_ID[it.catalogId]?.display.split(" (")[0]).join(" · ")}</div></div>)
              : results.map((e) => <div key={e.id} className="inbox-item row" style={{ gap: 8 }}><Chip kind="neutral">{e.category}</Chip><span style={{ flex: 1 }}><b>{e.display}</b>{e.category === "medication" && <div className="small muted">{e.defaultDose} {e.route} {e.frequency}</div>}</span><button className="btn sm" onClick={() => add(e)}><IPlus /> Add</button></div>)}
            {cat !== "sets" && results.length === 0 && <div className="empty">No catalog entries match.</div>}
          </div>
          <div className="small muted">{CATALOG.length} orderable items · {ORDER_SETS.length} order sets · fully qualified entries only, no preselected doses outside catalog defaults.</div>
        </div>
        <div className="stack">
          <b>Review basket</b>
          {basket.length === 0 && <div className="empty">Add orders from the catalog or an order set. Each order is checked against allergies, active medications, recent labs and existing orders.</div>}
          <div style={{ maxHeight: 480, overflow: "auto" }} className="stack">
            {basket.map((b) => (
              <div key={b.key} className="card"><div className="card-b stack" style={{ gap: 6 }}>
                <div className="row"><Chip kind="neutral">{b.entry.category}</Chip><b style={{ flex: 1 }}>{b.entry.display}</b><button className="btn ghost sm" aria-label="Remove" onClick={() => setBasket((x) => x.filter((y) => y.key !== b.key))}><IX /></button></div>
                <div className="row"><Seg value={b.priority} onChange={(v) => setBasket((x) => x.map((y) => y.key === b.key ? { ...y, priority: v } : y))} options={[{ v: "routine", l: "Routine" }, { v: "urgent", l: "Urgent" }, { v: "stat", l: "STAT" }]} /><input className="input" style={{ flex: 1 }} placeholder="Indication (required)" value={b.indication} onChange={(e) => setBasket((x) => x.map((y) => y.key === b.key ? { ...y, indication: e.target.value } : y))} /></div>
                {b.entry.category === "medication" && <input className="input" value={b.details} onChange={(e) => setBasket((x) => x.map((y) => y.key === b.key ? { ...y, details: e.target.value } : y))} aria-label="Dose, route, frequency" />}
                {b.alerts.map((a) => <AlertBox key={a.rule} a={a}>{a.requiresOverride && <input className="input" style={{ marginTop: 6 }} placeholder="Override reason (required to sign)" value={b.overrides[a.rule] ?? ""} onChange={(e) => setBasket((x) => x.map((y) => y.key === b.key ? { ...y, overrides: { ...y.overrides, [a.rule]: e.target.value } } : y))} />}</AlertBox>)}
              </div></div>
            ))}
          </div>
        </div>
      </div>
      {confirm && (
        <Dialog title="Confirm and sign orders" onClose={() => setConfirm(false)} size="narrow" footer={<><button className="btn" onClick={() => setConfirm(false)}>Back</button><button className="btn primary" disabled={signing || basket.some((b) => !b.indication.trim())} onClick={sign}>{signing ? "Signing…" : `Sign ${basket.length} order(s)`}</button></>}>
          <div className="stack">
            <div className="alert info"><div><div className="t">Patient: {patientName(p)} · MRN {p.mrn} · DOB {p.dob}</div><div className="r">Confirm this is the intended patient. Signing commits durably on this device and is attributable to {userName(s.user.id)}.</div></div></div>
            <ul className="list-plain small">{basket.map((b) => <li key={b.key}><b>{b.entry.display}</b> — {b.priority.toUpperCase()} · {b.details || b.entry.category} · {b.indication || <span style={{ color: "var(--danger)" }}>indication missing</span>}{b.alerts.length > 0 && <div style={{ color: b.alerts.some((a) => a.severity === "critical") ? "var(--danger)" : "var(--warning)" }}>{b.alerts.length} alert(s){b.alerts.some((a) => a.requiresOverride) ? ` · override: ${b.alerts.filter((a) => a.requiresOverride).map((a) => b.overrides[a.rule]).join("; ")}` : ""}</div>}</li>)}</ul>
            <div className="small muted">Medication orders route to pharmacy verification and appear on the MAR. Lab orders create specimens; imaging orders enter the radiology worklist. Double submission is prevented.</div>
          </div>
        </Dialog>
      )}
    </Dialog>
  );
}
