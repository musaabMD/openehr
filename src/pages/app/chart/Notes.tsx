import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db, uid } from "../../../db/db";
import { useSession } from "../../../state/session";
import { useActiveEncounter, userName } from "../../../db/hooks";
import { Chip, Dialog, Empty, StateChip, statusKind } from "../../../components/ui";
import { fmtDateTime, isoNow } from "../../../lib/format";
import { audit, journal } from "../../../lib/audit";
import { NOTE_TEMPLATES, expandMagicLinks } from "../../../lib/notes";
import { buildSummary, draftNoteFromChart } from "../../../lib/assist";
import { IPlus, ISparkle, IPen } from "../../../components/Icons";
import type { Note, Patient } from "../../../db/types";

export default function Notes({ patient: p }: { patient: Patient }) {
  const s = useSession();
  const enc = useActiveEncounter(p.id);
  const [sp, setSp] = useSearchParams();
  const notes = useLiveQuery(() => db.notes.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  const selId = sp.get("note");
  const sel = notes.find((n) => n.id === selId) ?? null;
  const [newDlg, setNewDlg] = useState(false);
  const [addendum, setAddendum] = useState("");
  const canWrite = ["physician", "ed", "nurse", "admin"].includes(s.role);

  async function createNote(tpl: (typeof NOTE_TEMPLATES)[number], ai = false) {
    let body = await expandMagicLinks(tpl.body, p.id);
    if (ai) { const sum = await buildSummary(p.id); body = draftNoteFromChart(tpl.type === "Discharge Summary" ? "discharge" : "progress", sum); }
    const n: Note = { id: uid("nt"), patientId: p.id, encounterId: enc?.id, type: tpl.type, title: tpl.title, authorId: s.user.id, created: isoNow(), updated: isoNow(), status: "draft", body, version: 1, cosignRequired: s.user.id === "u-res1" || (tpl.cosign ?? false), addenda: [], localState: "local-draft", aiDraft: ai };
    await db.notes.add(n);
    await audit("NOTE_CREATE", { patientId: p.id, resource: "note", resourceId: n.id, detail: `${n.title}${ai ? " (AI draft)" : ""}` });
    setNewDlg(false); setSp({ note: n.id });
  }

  return (
    <div className="split" style={{ gridTemplateColumns: "300px 1fr", height: "100%" }}>
      <div className="stack">
        <div className="row">{canWrite && <button className="btn primary" onClick={() => setNewDlg(true)}><IPlus /> New note</button>}</div>
        <div className="card" style={{ overflow: "auto" }}>
          {notes.length === 0 && <Empty>No notes</Empty>}
          {notes.sort((a, b) => b.updated.localeCompare(a.updated)).map((n) => (
            <div key={n.id} className={"inbox-item" + (sel?.id === n.id ? " active" : "")} onClick={() => setSp({ note: n.id })} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSp({ note: n.id })}>
              <div className="row" style={{ gap: 6 }}><b style={{ flex: 1 }}>{n.title}</b><Chip kind={statusKind(n.status)}>{n.status}</Chip></div>
              <div className="meta"><span>{userName(n.authorId)}</span><span>·</span><span>{fmtDateTime(n.updated)}</span>{n.aiDraft && <Chip kind="info">AI draft</Chip>}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        {!sel && <Empty>Select a note or create one. Templates pull live data through MagicLinks such as @VITALS@, @LABS@, @MEDS@ and @PROBLEMS@.</Empty>}
        {sel && (sel.status === "draft" && (sel.authorId === s.user.id || s.role === "admin") ? <Editor note={sel} patient={p} /> : (
          <div className="card">
            <div className="card-h">{sel.title}<span className="muted" style={{ fontWeight: 400 }}>{sel.type} · v{sel.version}</span><span className="spacer" /><StateChip s={sel.status} /></div>
            <div className="card-b">
              <div className="small muted" style={{ marginBottom: 10 }}>Author: {userName(sel.authorId)} · Encounter: {sel.encounterId ?? "—"} · Created {fmtDateTime(sel.created)}{sel.signedAt ? ` · Signed ${fmtDateTime(sel.signedAt)}` : ""}{sel.cosignedBy ? ` · Cosigned by ${userName(sel.cosignedBy)}` : ""}{sel.cosignRequired && !sel.cosignedBy ? " · Cosign required" : ""}</div>
              <div className="note-body">{sel.body}</div>
              {sel.addenda.map((a, i) => <div key={i} className="card" style={{ marginTop: 10, background: "var(--surface-2)" }}><div className="card-b"><div className="small muted">Addendum · {userName(a.authorId)} · {fmtDateTime(a.time)}</div><div className="note-body">{a.text}</div></div></div>)}
              {sel.status === "draft" && sel.authorId !== s.user.id && <div className="alert warning" style={{ marginTop: 10 }}><div><div className="t">Draft owned by {userName(sel.authorId)}</div><div className="r">Only the author can edit an unsigned draft; a signed note cannot be rewritten, only addended.</div></div></div>}
              {(sel.status === "signed" || sel.status === "addended") && canWrite && (
                <div className="stack" style={{ marginTop: 14, borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                  <label className="small muted"><IPen width={12} height={12} /> Add addendum (signed content is immutable)</label>
                  <textarea className="textarea" style={{ minHeight: 70 }} value={addendum} onChange={(e) => setAddendum(e.target.value)} />
                  <div className="row"><button className="btn primary" disabled={!addendum.trim()} onClick={async () => { await db.notes.update(sel.id, { status: "addended", addenda: [...sel.addenda, { authorId: s.user.id, time: isoNow(), text: addendum }], version: sel.version + 1, updated: isoNow() }); await audit("NOTE_ADDEND", { patientId: p.id, resource: "note", resourceId: sel.id, detail: sel.title }); await journal("update", "note", sel.id, { addendum }, p.id, sel.version); setAddendum(""); s.toast("Addendum signed", "success"); }}>Sign addendum</button></div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {newDlg && (
        <Dialog title="New note" onClose={() => setNewDlg(false)}>
          <div className="stack">
            <div className="small muted">Templates insert live chart data through MagicLinks. Author: {userName(s.user.id)}{s.user.id === "u-res1" ? " · attending cosign will be required" : ""}.</div>
            <div className="grid2">{NOTE_TEMPLATES.filter((t) => s.role !== "nurse" || t.type === "Nursing Assessment" || t.type === "Progress Note").map((t) => <button key={t.type} className="btn" style={{ justifyContent: "flex-start", minHeight: 40 }} onClick={() => createNote(t)}>{t.title}</button>)}</div>
            {s.role !== "nurse" && <div className="card" style={{ background: "var(--info-bg)" }}><div className="card-b row"><ISparkle width={22} height={22} style={{ color: "var(--info)", flexShrink: 0 }} /><div style={{ flex: 1 }}><b>Magic Assist draft</b><div className="small muted">Pre-fills from the chart with citations; labeled as an AI draft until you edit and sign.</div></div><button className="btn" onClick={() => createNote(NOTE_TEMPLATES[0]!, true)}>Progress note draft</button><button className="btn" onClick={() => createNote(NOTE_TEMPLATES[4]!, true)}>Discharge draft</button></div></div>}
          </div>
        </Dialog>
      )}
    </div>
  );
}

function Editor({ note, patient: p }: { note: Note; patient: Patient }) {
  const s = useSession();
  const [body, setBody] = useState(note.body);
  const [title, setTitle] = useState(note.title);
  const [saved, setSaved] = useState<"saved" | "saving" | "dirty">("saved");
  const [confirm, setConfirm] = useState(false);
  const timer = useRef<number | null>(null);
  useEffect(() => { setBody(note.body); setTitle(note.title); setSaved("saved"); }, [note.id]);
  useEffect(() => {
    if (body === note.body && title === note.title) return;
    setSaved("dirty");
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => { setSaved("saving"); await db.notes.update(note.id, { body, title, updated: isoNow() }); setSaved("saved"); }, 700);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [body, title]);

  async function insertLink(tok: string) {
    const ta = document.getElementById("note-editor") as HTMLTextAreaElement | null;
    const expanded = await expandMagicLinks(tok, p.id);
    if (!ta) { setBody(body + "\n" + expanded); return; }
    const start = ta.selectionStart, end = ta.selectionEnd;
    setBody(body.slice(0, start) + expanded + body.slice(end));
  }
  async function sign() {
    const now = isoNow();
    const status: Note["status"] = note.cosignRequired ? "pending-cosign" : "signed";
    await db.notes.update(note.id, { body, title, status, signedAt: now, updated: now, localState: "local-committed", aiDraft: false });
    await audit("NOTE_SIGN", { patientId: p.id, resource: "note", resourceId: note.id, detail: `${title}${note.cosignRequired ? " (pending cosign)" : ""}` });
    await journal("sign", "note", note.id, { body, title }, p.id, note.version);
    if (note.cosignRequired) { const enc = note.encounterId ? await db.encounters.get(note.encounterId) : undefined; await db.inbox.add({ id: uid("ib"), ownerId: enc?.attendingId ?? "u-phys1", type: "cosign", patientId: p.id, subject: `Cosign: ${title}`, body: `Note by ${userName(note.authorId)} awaiting attestation.`, priority: "normal", created: now, status: "new", refId: note.id, fromName: userName(note.authorId) }); }
    s.toast(note.cosignRequired ? "Signed; routed to attending for cosign" : "Note signed", "success");
    setConfirm(false);
  }
  async function del() { if (!window.confirm("Delete this draft?")) return; await db.notes.delete(note.id); await audit("NOTE_DELETE_DRAFT", { patientId: p.id, resource: "note", resourceId: note.id, detail: title }); }
  return (
    <div className="card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div className="card-h"><input className="input" style={{ maxWidth: 360, fontWeight: 700 }} value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Note title" /><span className="muted small" style={{ fontWeight: 400 }}>{note.type} · {userName(note.authorId)} · v{note.version}</span><span className="spacer" /><Chip kind={saved === "saved" ? "success" : "warning"}>{saved === "saved" ? "Autosaved locally" : saved === "saving" ? "Saving…" : "Unsaved changes"}</Chip>{note.aiDraft && <Chip kind="info">AI draft</Chip>}</div>
      <div className="card-b" style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        <div className="row small"><span className="muted">MagicLinks:</span>{["@VITALS@", "@LABS@", "@MEDS@", "@PROBLEMS@", "@ALLERGIES@", "@AGESEX@", "@TODAY@"].map((tk) => <button key={tk} className="btn sm" onClick={() => insertLink(tk)}>{tk.replace(/@/g, "")}</button>)}</div>
        <textarea id="note-editor" className="textarea" style={{ flex: 1, minHeight: 380, fontFamily: "var(--font)", fontSize: 13.5 }} value={body} onChange={(e) => setBody(e.target.value)} spellCheck />
        <div className="row"><button className="btn primary" onClick={() => setConfirm(true)} disabled={saved !== "saved"}>Sign note{note.cosignRequired ? " (route for cosign)" : ""}</button><button className="btn" onClick={del}>Delete draft</button><span className="spacer" /><span className="small muted">Drafts are durable on this device; signing is the clinical commit.</span></div>
      </div>
      {confirm && (
        <Dialog title="Sign note" onClose={() => setConfirm(false)} size="narrow" footer={<><button className="btn" onClick={() => setConfirm(false)}>Cancel</button><button className="btn primary" onClick={sign}>Sign as {userName(s.user.id)}</button></>}>
          <div className="stack">
            <div><b>{p.lastName.toUpperCase()}, {p.firstName}</b> · MRN {p.mrn}</div>
            <div>{title} · {body.length} characters · encounter {note.encounterId ?? "none"}</div>
            {note.aiDraft && <div className="alert warning"><div><div className="t">This note started as an AI draft</div><div className="r">By signing you attest that you reviewed and edited the content and that it reflects your clinical judgment.</div></div></div>}
            <div className="small muted">Signing is attributable and immutable; later changes become addenda with their own signature. {note.cosignRequired ? "The attending will receive a cosign request." : ""}</div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
