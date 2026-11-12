// Sync protocol (OFF-06): bounded batches, idempotent by journal id, explicit states.
import { db } from "../db/db";
import type { JournalEntry } from "../db/types";

export interface SyncResult { pushed: number; accepted: number; rejected: number; skipped: string }

export async function syncNow(): Promise<SyncResult> {
  const queued = await db.journal.where("state").anyOf(["queued", "syncing"]).limit(200).toArray();
  if (queued.length === 0) return { pushed: 0, accepted: 0, rejected: 0, skipped: "nothing queued" };
  await db.journal.bulkPut(queued.map((q) => ({ ...q, state: "syncing" as const })));
  try {
    const res = await fetch("/api/sync", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ entries: queued }) });
    if (res.status === 503) {
      await db.journal.bulkPut(queued.map((q) => ({ ...q, state: "queued" as const, error: "Server sync not configured (no D1 binding)" })));
      return { pushed: queued.length, accepted: 0, rejected: 0, skipped: "server sync not configured" };
    }
    if (!res.ok) throw new Error("HTTP " + res.status);
    const j = (await res.json()) as { accepted: string[]; rejected: { id: string; reason: string }[] };
    const updates: JournalEntry[] = [];
    for (const q of queued) {
      if (j.accepted.includes(q.id)) updates.push({ ...q, state: "server-accepted", error: undefined });
      else { const r = j.rejected.find((x) => x.id === q.id); updates.push({ ...q, state: r ? "rejected" : "queued", error: r?.reason }); }
    }
    await db.journal.bulkPut(updates);
    return { pushed: queued.length, accepted: j.accepted.length, rejected: j.rejected.length, skipped: "" };
  } catch (e) {
    await db.journal.bulkPut(queued.map((q) => ({ ...q, state: "queued" as const, error: String(e) })));
    return { pushed: queued.length, accepted: 0, rejected: 0, skipped: "server unreachable; entries remain queued" };
  }
}
