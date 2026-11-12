// Magic EHR edge worker: serves the static app and a small API.
// Everything clinical runs in the browser; this worker only provides
// health checks, an optional sync journal (D1) and a FHIR CapabilityStatement.

export interface Env {
  ASSETS: Fetcher;
  SYNC_DB?: D1Database;
  APP_NAME: string;
  APP_VERSION: string;
}

interface JournalEntry {
  id: string; seq: number; authorId: string; device: string; patientId?: string;
  resource: string; resourceId: string; op: string; baseRevision: number;
  payloadDigest: string; effective: string; recorded: string; state: string;
}

const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra } });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/api/")) {
      if (path === "/api/health") {
        return json({ ok: true, app: env.APP_NAME, version: env.APP_VERSION, time: new Date().toISOString(), syncConfigured: !!env.SYNC_DB, region: (request.cf as { colo?: string } | undefined)?.colo ?? null });
      }
      if (path === "/api/fhir/metadata") {
        return json({
          resourceType: "CapabilityStatement", status: "draft", date: "2026-11-12", kind: "instance",
          software: { name: env.APP_NAME, version: env.APP_VERSION }, fhirVersion: "4.0.1", format: ["json"],
          rest: [{ mode: "server", documentation: "Magic EHR demo exports FHIR R4 Bundles from the browser; this endpoint documents the export shape only.",
            resource: ["Patient", "Encounter", "Condition", "AllergyIntolerance", "MedicationRequest", "Observation", "Immunization", "DocumentReference"].map((type) => ({ type, interaction: [{ code: "read" }] })) }],
        }, 200, { "content-type": "application/fhir+json" });
      }
      if (path === "/api/sync") {
        if (!env.SYNC_DB) return json({ error: "sync-not-configured", message: "No D1 binding. The demo runs as a standalone local authority." }, 503);
        if (request.method === "POST") {
          const body = (await request.json()) as { entries: JournalEntry[] };
          const accepted: string[] = [];
          const rejected: { id: string; reason: string }[] = [];
          for (const e of (body.entries ?? []).slice(0, 500)) {
            if (!e.id || !e.resource || !e.resourceId) { rejected.push({ id: e.id ?? "?", reason: "malformed" }); continue; }
            try {
              await env.SYNC_DB.prepare(
                "INSERT OR IGNORE INTO journal (id, seq, author_id, device, patient_id, resource, resource_id, op, base_revision, payload_digest, effective, recorded, received) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)"
              ).bind(e.id, e.seq, e.authorId, e.device, e.patientId ?? null, e.resource, e.resourceId, e.op, e.baseRevision, e.payloadDigest, e.effective, e.recorded, new Date().toISOString()).run();
              accepted.push(e.id); // idempotent: re-delivery of the same id is accepted again, never duplicated
            } catch (err) {
              rejected.push({ id: e.id, reason: String(err) });
            }
          }
          return json({ accepted, rejected });
        }
        if (request.method === "GET") {
          const since = url.searchParams.get("since") ?? "1970-01-01T00:00:00Z";
          const rows = await env.SYNC_DB.prepare("SELECT * FROM journal WHERE received > ? ORDER BY received LIMIT 500").bind(since).all();
          return json({ entries: rows.results ?? [] });
        }
        return json({ error: "method" }, 405);
      }
      return json({ error: "not-found" }, 404);
    }

    // Static assets are served directly by Cloudflare (run_worker_first is limited to /api/*);
    // security headers for them live in public/_headers. This branch only runs for unmatched routes.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
