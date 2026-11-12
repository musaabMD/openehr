import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../../db/db";
import { useSession } from "../../state/session";
import { usePatientMap, userName } from "../../db/hooks";
import { Chip, Empty, statusKind } from "../../components/ui";
import { fmtDateTime, patientName, relTime, isoNow } from "../../lib/format";
import { audit, journal } from "../../lib/audit";
import type { InboxItem } from "../../db/types";

const FOLDERS: { key: InboxItem["type"] | "all"; label: string }[] = [
  { key: "all", label: "All" }, { key: "result", label: "Results" }, { key: "cosign", label: "Cosign" }, { key: "message", label: "Messages" },
  { key: "refill", label: "Refill requests" }, { key: "referral", label: "Referrals" }, { key: "deficiency", label: "Deficiencies" }, { key: "reminder", label: "Reminders" },
];

export default function InBasket() {
  const s = useSession();
  const pm = usePatientMap();
  const [sp, setSp] = useSearchParams();
  const [folder, setFolder] = useState<InboxItem["type"] | "all">("all");
  const [showDone, setShowDone] = useState(false);
  const [reply, setReply] = useState("");
  const items = useLiveQuery(() => db.inbox.where("ownerId").equals(s.user.id).toArray(), [s.user.id]) ?? [];
  const selectedId = sp.get("item");
  const sel = items.find((i) => i.id === selectedId);
  const list = items.filter((i) => (folder === "all" || i.type === folder) && (showDone || i.status !== "done")).sort((a, b) => (a.priority === "high" ? 0 : 1) - (b.priority === "high" ? 0 : 1) || b.created.localeCompare(a.created));
  const counts = new Map<string, number>();
  for (const i of items.filter((x) => x.status === "new")) { counts.set(i.type, (counts.get(i.type) ?? 0) + 1); counts.set("all", (counts.get("all") ?? 0) + 1); }
  const labs = useLiveQuery(() => (sel?.refId ? db.labs.where("orderId").equals(sel.refId).toArray() : []), [sel?.refId]) ?? [];
  const note = useLiveQuery(() => (sel?.type === "cosign" && sel.refId ? db.notes.get(sel.refId) : undefined), [sel?.refId, sel?.type]);

  useEffect(() => { if (sel && sel.status === "new") void db.inbox.update(sel.id, { status: "read" }); }, [sel?.id]);

  const select = (id: string) => { setSp({ item: id }); setReply(""); };
  async function done(i: InboxItem, detail: string) {
    await db.inbox.update(i.id, { status: "done" });
    await audit("INBOX_DONE", { patientId: i.patientId, resource: "inbox", resourceId: i.id, detail });
    s.toast("Done", "success");
  }
  async function acknowledge(i: InboxItem) {
    if (i.refId) await db.labs.where("orderId").equals(i.refId).modify({ acknowledged: true });
    await audit("RESULT_ACK", { patientId: i.patientId, resource: "lab", resourceId: i.refId, detail: i.subject });
    await journal("update", "lab", i.refId ?? i.id, { acknowledged: true }, i.patientId);
    await done(i, "Result acknowledged");
  }
  async function cosign(i: InboxItem) {
    if (!note) return;
    await db.notes.update(note.id, { status: "signed", cosignedBy: s.user.id, signedAt: isoNow(), localState: "local-committed", addenda: [...note.addenda, { authorId: s.user.id, time: isoNow(), text: "Attestation: I have seen and examined the patient, reviewed the resident's documentation, and agree with the assessment and plan." }] });
    await audit("NOTE_COSIGN", { patientId: i.patientId, resource: "note", resourceId: note.id, detail: note.title });
    await journal("sign", "note", note.id, { cosignedBy: s.user.id }, i.patientId);
    await done(i, "Note cosigned");
  }
  async function sendReply(i: InboxItem) {
    if (!reply.trim() || !i.patientId) return;
    const p = pm.get(i.patientId);
    await db.portalMessages.add({ id: uid("pm"), patientId: i.patientId, fromName: userName(s.user.id), toName: p ? `${p.firstName} ${p.lastName}` : "Patient", subject: "Re: " + i.subject, body: reply, time: isoNow(), direction: "to-patient", read: false });
    await audit("MESSAGE_SEND", { patientId: i.patientId, resource: "message", detail: "Reply to " + i.subject });
    await done(i, "Replied");
  }
  async function refill(i: InboxItem, approve: boolean) {
    await audit(approve ? "REFILL_APPROVE" : "REFILL_DENY", { patientId: i.patientId, resource: "medication", resourceId: i.refId, detail: i.subject });
    await journal("update", "refill", i.id, { approve }, i.patientId);
    await done(i, approve ? "Refill approved (queued for eRx when configured)" : "Refill denied");
  }

  return (
    <div className="page full">
      <div className="inbox-layout">
        <aside className="inbox-folders">
          <div style={{ fontWeight: 700, padding: "6px 10px 10px", fontSize: 15 }}>In Basket</div>
          {FOLDERS.map((f) => <button key={f.key} className={folder === f.key ? "active" : ""} onClick={() => setFolder(f.key)}>{f.label}{counts.get(f.key) ? <span className="count">{counts.get(f.key)}</span> : null}</button>)}
          <label className="row small" style={{ padding: "12px 10px" }}><input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} /> Show completed</label>
        </aside>
        <div className="inbox-list">
          {list.length === 0 && <Empty>Nothing here. Your work is caught up.</Empty>}
          {list.map((i) => <div key={i.id} className={"inbox-item " + i.status + (sel?.id === i.id ? " active" : "")} onClick={() => select(i.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && select(i.id)}>
            <div className="row" style={{ gap: 6 }}><Chip kind={i.priority === "high" ? "danger" : "neutral"}>{i.type}</Chip><span className="subj" style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.subject}</span>{i.status === "done" && <Chip kind="success">done</Chip>}</div>
            <div className="meta"><span>{i.patientId && pm.get(i.patientId) ? patientName(pm.get(i.patientId)!) : i.fromName ?? "System"}</span><span>·</span><span>{relTime(i.created)}</span></div>
          </div>)}
        </div>
        <div className="inbox-detail">
          {!sel && <Empty>Select an item. Reading an item does not close it; take an action to complete it.</Empty>}
          {sel && (
            <div className="stack">
              <div className="row"><Chip kind={sel.priority === "high" ? "danger" : "neutral"}>{sel.type}</Chip><Chip kind={statusKind(sel.status)}>{sel.status}</Chip><span className="spacer" /><span className="small muted">{fmtDateTime(sel.created)} · from {sel.fromName ?? "System"}</span></div>
              <h2 style={{ margin: 0 }}>{sel.subject}</h2>
              {sel.patientId && pm.get(sel.patientId) && <div className="row"><b>{patientName(pm.get(sel.patientId)!)}</b><span className="muted">MRN {pm.get(sel.patientId)!.mrn}</span><button className="btn sm" onClick={() => s.openPatient(sel.patientId!, sel.type === "result" ? "results" : sel.type === "cosign" ? "notes" : "summary")}>Open chart</button></div>}
              <p style={{ margin: 0 }}>{sel.body}</p>
              {sel.type === "result" && labs.length > 0 && (
                <div className="card"><div className="table-wrap"><table className="grid compact"><thead><tr><th>Test</th><th className="right">Value</th><th>Flag</th><th>Reference</th><th>Collected</th></tr></thead><tbody>
                  {labs.map((l) => <tr key={l.id}><td>{l.name}</td><td className={"right num" + (l.flag ? " abn" : "")}>{l.value} {l.unit}</td><td>{l.flag && <span className={"flag " + l.flag}>{l.flag}</span>}</td><td className="muted">{l.refLow ?? ""}{l.refLow !== undefined || l.refHigh !== undefined ? "–" : ""}{l.refHigh ?? ""}</td><td className="muted">{fmtDateTime(l.collected)}</td></tr>)}
                </tbody></table></div></div>
              )}
              {sel.type === "cosign" && note && <div className="card"><div className="card-h">{note.title} · {userName(note.authorId)} · <Chip kind={statusKind(note.status)}>{note.status}</Chip></div><div className="card-b note-body">{note.body}</div></div>}
              {sel.status !== "done" && (
                <div className="row" style={{ paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                  {sel.type === "result" && <button className="btn primary" onClick={() => acknowledge(sel)}>Acknowledge result</button>}
                  {sel.type === "cosign" && note && note.status === "pending-cosign" && <button className="btn primary" onClick={() => cosign(sel)}>Cosign & attest</button>}
                  {sel.type === "refill" && <><button className="btn primary" onClick={() => refill(sel, true)}>Approve refill</button><button className="btn" onClick={() => refill(sel, false)}>Deny</button></>}
                  {(sel.type === "referral" || sel.type === "deficiency" || sel.type === "reminder") && <button className="btn primary" onClick={() => done(sel, "Completed")}>Mark complete</button>}
                  {sel.type === "message" && sel.patientId && <div className="stack" style={{ flex: 1 }}><textarea className="textarea" style={{ minHeight: 80 }} placeholder="Reply to patient…" value={reply} onChange={(e) => setReply(e.target.value)} /><div className="row"><button className="btn primary" disabled={!reply.trim()} onClick={() => sendReply(sel)}>Send reply</button><button className="btn" onClick={() => done(sel, "Closed without reply")}>Close</button></div></div>}
                  {sel.type === "message" && !sel.patientId && <button className="btn primary" onClick={() => done(sel, "Closed")}>Mark complete</button>}
                  <span className="spacer" /><button className="btn ghost" onClick={() => db.inbox.update(sel.id, { status: "new" })}>Mark unread</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
