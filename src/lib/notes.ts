// Note templates and MagicLinks (@TOKEN@) expansion from live chart data.
import { db } from "../db/db";
import { fmtDateTime, fmtDate } from "./format";
import { userName } from "../db/hooks";

export const NOTE_TEMPLATES: { type: string; title: string; body: string; cosign?: boolean }[] = [
  { type: "Progress Note", title: "Progress Note", body: "SUBJECTIVE\n\n\nOBJECTIVE\nVitals: @VITALS@\nLabs: @LABS@\nExam:\n\nASSESSMENT / PLAN\n@PROBLEMS@\n\n" },
  { type: "H&P", title: "History and Physical", body: "CHIEF COMPLAINT\n\n\nHISTORY OF PRESENT ILLNESS\n@AGESEX@ presenting with \n\nPAST MEDICAL HISTORY\n@PROBLEMS@\n\nMEDICATIONS\n@MEDS@\n\nALLERGIES\n@ALLERGIES@\n\nSOCIAL / FAMILY HISTORY\n\n\nPHYSICAL EXAM\nVitals: @VITALS@\n\nDATA\n@LABS@\n\nASSESSMENT / PLAN\n\n" },
  { type: "Nursing Assessment", title: "Nursing Shift Assessment", body: "SHIFT: \nNEURO: alert and oriented ×\nCARDIAC: \nRESP: \nGI/GU: \nSKIN: \nPAIN: \nLINES/DRAINS: \nSAFETY: fall precautions \nVITALS: @VITALS@\nMEDS DUE: see MAR\nPLAN / HANDOFF (SBAR):\nS: \nB: \nA: \nR: \n" },
  { type: "ED Provider Note", title: "ED Provider Note", body: "CHIEF COMPLAINT\n\n\nHPI\n@AGESEX@ presents with \n\nROS\n\n\nPHYSICAL EXAM\nVitals: @VITALS@\n\nED COURSE / MDM\n@LABS@\n\nDISPOSITION\n\n" },
  { type: "Discharge Summary", title: "Discharge Summary", body: "ADMISSION DATE: \nDISCHARGE DATE: @TODAY@\nATTENDING: \n\nDISCHARGE DIAGNOSES\n@PROBLEMS@\n\nHOSPITAL COURSE\n\n\nDISCHARGE MEDICATIONS\n@MEDS@\n\nALLERGIES\n@ALLERGIES@\n\nPENDING RESULTS AT DISCHARGE\n\n\nFOLLOW-UP\n\n\nPATIENT INSTRUCTIONS\n\n" },
  { type: "Consult Note", title: "Consult Note", body: "REASON FOR CONSULT\n\n\nHISTORY\n@AGESEX@. @PROBLEMS@\n\nMEDICATIONS\n@MEDS@\n\nDATA\n@LABS@\n\nIMPRESSION\n\n\nRECOMMENDATIONS\n1. \n2. \n\nThank you for this consult.\n" },
  { type: "Procedure Note", title: "Procedure Note", body: "PROCEDURE: \nINDICATION: \nCONSENT: obtained, risks/benefits/alternatives discussed\nTIME-OUT: performed — patient @NAME@, procedure and site confirmed\nANESTHESIA: \nTECHNIQUE: \nFINDINGS: \nEBL: \nCOMPLICATIONS: none\nDISPOSITION: \n" },
];

export async function expandMagicLinks(body: string, patientId: string): Promise<string> {
  if (!body.includes("@")) return body;
  const p = await db.patients.get(patientId);
  if (!p) return body;
  const [vitals, labs, meds, problems, allergies] = await Promise.all([
    db.vitals.where("patientId").equals(patientId).toArray(), db.labs.where("patientId").equals(patientId).toArray(),
    db.medications.where("patientId").equals(patientId).and((m) => m.status === "active").toArray(), db.problems.where("patientId").equals(patientId).and((x) => x.status !== "resolved").toArray(),
    db.allergies.where("patientId").equals(patientId).toArray(),
  ]);
  const v = vitals.sort((a, b) => b.time.localeCompare(a.time))[0];
  const age = Math.floor((Date.now() - new Date(p.dob).getTime()) / (365.25 * 86400000));
  const latest = new Map<string, (typeof labs)[number]>();
  for (const l of labs.sort((a, b) => a.collected.localeCompare(b.collected))) latest.set(l.name, l);
  const keyLabs = ["WBC", "Hemoglobin", "Platelets", "Sodium", "Potassium", "Creatinine", "Glucose", "Lactate", "INR", "BNP", "Troponin I, high sensitivity"].map((k) => latest.get(k)).filter(Boolean) as (typeof labs)[number][];
  const map: Record<string, string> = {
    "@VITALS@": v ? `BP ${v.sbp}/${v.dbp}, HR ${v.hr}, RR ${v.rr}, T ${v.temp} °C, SpO₂ ${v.spo2}% (${fmtDateTime(v.time)}) [source: flowsheet]` : "[no vitals recorded]",
    "@LABS@": keyLabs.length ? keyLabs.map((l) => `${l.name} ${l.value}${l.unit ? " " + l.unit : ""}${l.flag ? " (" + l.flag + ")" : ""}`).join(", ") + ` [source: results, latest ${fmtDate(keyLabs[0]!.collected)}]` : "[no results]",
    "@MEDS@": meds.length ? meds.map((m) => `- ${m.name} ${m.dose} ${m.route} ${m.frequency}`).join("\n") : "- None",
    "@PROBLEMS@": problems.length ? problems.map((x, i) => `${i + 1}. ${x.display} (${x.code})`).join("\n") : "- No active problems",
    "@ALLERGIES@": allergies.length ? allergies.map((a) => `- ${a.substance}: ${a.reaction} (${a.severity})`).join("\n") : "- No known allergies",
    "@AGESEX@": `${age}-year-old ${p.sex === "F" ? "woman" : p.sex === "M" ? "man" : "person"}`,
    "@NAME@": `${p.firstName} ${p.lastName}`,
    "@MRN@": p.mrn,
    "@TODAY@": fmtDate(new Date().toISOString()),
    "@PCP@": userName(p.pcpId),
  };
  let out = body;
  for (const [k, val] of Object.entries(map)) out = out.split(k).join(val);
  return out;
}
