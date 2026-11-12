import { db, uid } from "../db/db";
import type { AuditEvent, JournalEntry, Role, User } from "../db/types";
import { digest, isoNow } from "./format";

export function deviceId(): string {
  try {
    let d = localStorage.getItem("magic-device");
    if (!d) { d = "WS-" + Math.floor(100 + Math.random() * 900); localStorage.setItem("magic-device", d); }
    return d;
  } catch { return "WS-000"; }
}

let currentUser: User | null = null;
let currentMode: "online" | "offline" = "online";
export function setAuditContext(user: User | null, mode: "online" | "offline") {
  currentUser = user; currentMode = mode;
}

export async function audit(action: string, opts: { patientId?: string; resource: string; resourceId?: string; detail?: string } ): Promise<void> {
  const u = currentUser;
  const ev: AuditEvent = {
    id: uid("au"), time: isoNow(),
    userId: u?.id ?? "anonymous", userName: u?.name ?? "Anonymous", role: (u?.role ?? "admin") as Role,
    action, patientId: opts.patientId, resource: opts.resource, resourceId: opts.resourceId,
    detail: opts.detail ?? "", device: deviceId(), mode: currentMode,
  };
  await db.audit.add(ev);
}

// Durable draft journal (OFF-05): every clinical write gets a journal entry with a
// stable id, author, device, base revision, digest and explicit state.
export async function journal(op: JournalEntry["op"], resource: string, resourceId: string, payload: unknown, patientId?: string, baseRevision = 0): Promise<JournalEntry> {
  const last = await db.journal.orderBy("seq").last();
  const authority = (await db.settings.get("authorityMode"))?.value ?? "local";
  const entry: JournalEntry = {
    id: uid("jr"), seq: (last?.seq ?? 0) + 1,
    authorId: currentUser?.id ?? "anonymous", device: deviceId(), patientId,
    resource, resourceId, op, baseRevision,
    payloadDigest: await digest(payload),
    effective: isoNow(), recorded: isoNow(),
    state: authority === "local" ? "local-committed" : "queued",
  };
  await db.journal.add(entry);
  return entry;
}
