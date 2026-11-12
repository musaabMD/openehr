// Magic Assist: local, deterministic chart summarization with citations.
// Design contract: every sentence cites a record id/time; abstain when evidence is missing;
// output is always labeled as a draft. A production deployment can swap in a
// self-hosted model behind the same function signature.
import { db } from "../db/db";
import { fmtDate, fmtDateTime, ageFromDob, daysBetween } from "./format";
import { news2, sepsisScreen } from "./cds";

export async function buildSummary(patientId: string): Promise<string> {
  const p = await db.patients.get(patientId);
  if (!p) return "No patient.";
  const [encs, problems, meds, allergies, labs, vitals, notes, orders] = await Promise.all([
    db.encounters.where("patientId").equals(patientId).toArray(), db.problems.where("patientId").equals(patientId).toArray(),
    db.medications.where("patientId").equals(patientId).and((m) => m.status === "active").toArray(), db.allergies.where("patientId").equals(patientId).toArray(),
    db.labs.where("patientId").equals(patientId).toArray(), db.vitals.where("patientId").equals(patientId).toArray(), db.notes.where("patientId").equals(patientId).toArray(),
    db.orders.where("patientId").equals(patientId).toArray(),
  ]);
  const enc = encs.filter((e) => e.status !== "discharged").sort((a, b) => b.start.localeCompare(a.start))[0];
  const lines: string[] = [];
  lines.push(`DRAFT — Magic Assist summary for ${p.firstName} ${p.lastName}, ${ageFromDob(p.dob)}-year-old ${p.sex === "F" ? "woman" : p.sex === "M" ? "man" : "person"} (MRN ${p.mrn}). Generated ${fmtDateTime(new Date().toISOString())} from local chart data.`);
  lines.push("");
  if (enc) lines.push(`CURRENT ENCOUNTER: ${enc.type === "ed" ? "Emergency visit" : enc.type} for ${enc.reason}, started ${fmtDateTime(enc.start)}${enc.unit ? ` in ${enc.unit} ${enc.room ?? ""}` : ""}${enc.type === "inpatient" ? ` (hospital day ${daysBetween(enc.start) + 1})` : ""}. [Encounter ${enc.id}]`);
  else lines.push("CURRENT ENCOUNTER: none active. [Encounter list]");
  const active = problems.filter((x) => x.status !== "resolved");
  lines.push(`PROBLEMS (${active.length}): ` + (active.length ? active.map((x) => `${x.display} (${x.code}, ${x.status}) [Problem ${x.id}]`).join("; ") : "none documented."));
  lines.push(`ALLERGIES: ` + (allergies.length ? allergies.map((a) => `${a.substance} — ${a.reaction}, ${a.severity}${a.verified ? "" : ", unverified"} [Allergy ${a.id}]`).join("; ") : "no known allergies documented [Allergy list]."));
  lines.push(`ACTIVE MEDICATIONS (${meds.length}): ` + (meds.length ? meds.map((m) => `${m.generic} ${m.dose} ${m.route} ${m.frequency}${m.isInpatient ? "" : " (home)"} [Med ${m.id}]`).join("; ") : "none."));
  const latestV = vitals.sort((a, b) => b.time.localeCompare(a.time))[0];
  if (latestV) {
    const n = news2(latestV); const sep = sepsisScreen(latestV);
    lines.push(`LATEST VITALS (${fmtDateTime(latestV.time)}): BP ${latestV.sbp}/${latestV.dbp}, HR ${latestV.hr}, RR ${latestV.rr}, T ${latestV.temp} °C, SpO₂ ${latestV.spo2}%. NEWS2 ${n}${n >= 5 ? " — meets escalation threshold" : ""}. Sepsis screen ${sep.positive ? "POSITIVE (" + sep.criteria.join(", ") + ")" : "negative"}. [Vitals ${latestV.id}]`);
  } else lines.push("LATEST VITALS: none recorded. [Flowsheet]");
  const abn = labs.filter((l) => l.flag).sort((a, b) => b.collected.localeCompare(a.collected));
  const seen = new Set<string>(); const abnLatest = abn.filter((l) => { if (seen.has(l.name)) return false; seen.add(l.name); return true; }).slice(0, 10);
  lines.push(`ABNORMAL RESULTS (most recent per test): ` + (abnLatest.length ? abnLatest.map((l) => `${l.name} ${l.value} ${l.unit} (${l.flag}, ${fmtDate(l.collected)}) [Lab ${l.id}]`).join("; ") : "none flagged."));
  const unack = labs.filter((l) => !l.acknowledged).length;
  if (unack) lines.push(`${unack} result(s) have not yet been acknowledged by a clinician. [Results review]`);
  const pending = orders.filter((o) => ["signed", "in-progress", "collected"].includes(o.status) && o.category !== "medication" && o.category !== "nursing" && o.category !== "diet");
  lines.push(`PENDING DIAGNOSTICS: ` + (pending.length ? pending.map((o) => `${o.display} (${o.status}) [Order ${o.id}]`).join("; ") : "none."));
  const lastNote = notes.filter((n) => n.status !== "draft").sort((a, b) => b.updated.localeCompare(a.updated))[0];
  if (lastNote) {
    const plan = lastNote.body.split(/ASSESSMENT[^\n]*\n/i)[1]?.split("\n").filter(Boolean).slice(0, 4).join(" ") ?? "";
    lines.push(`LAST SIGNED NOTE: ${lastNote.title} (${fmtDateTime(lastNote.signedAt ?? lastNote.updated)}). Plan excerpt: "${plan.slice(0, 300)}" [Note ${lastNote.id}]`);
  } else lines.push("LAST SIGNED NOTE: none; evidence for the plan is unavailable. [Notes]");
  lines.push("");
  lines.push("LIMITATIONS: This draft is assembled from structured data and note text in this chart only. It does not infer diagnoses, does not include information from outside records, and must be reviewed by a clinician before any use.");
  return lines.join("\n");
}

export function draftNoteFromChart(kind: "progress" | "discharge", summary: string): string {
  if (kind === "discharge") return `DISCHARGE SUMMARY (AI DRAFT — review and edit before signing)\n\n${summary}\n\nHOSPITAL COURSE:\n[Clinician to complete]\n\nDISCHARGE MEDICATIONS:\n[Reconcile against active medication list]\n\nFOLLOW-UP:\n[Clinician to complete]`;
  return `PROGRESS NOTE (AI DRAFT — review and edit before signing)\n\nSUBJECTIVE:\n[Clinician to complete]\n\nOBJECTIVE:\n${summary.split("\n").filter((l) => l.startsWith("LATEST VITALS") || l.startsWith("ABNORMAL RESULTS")).join("\n")}\n\nASSESSMENT / PLAN:\n${summary.split("\n").find((l) => l.startsWith("PROBLEMS")) ?? ""}\n[Clinician to complete]`;
}
