// Minimal HL7 FHIR R4 export for one patient. Resource shapes follow the
// published R4 specification; this is an export, not a full FHIR server.
import { db } from "../db/db";

export async function patientBundle(patientId: string): Promise<object> {
  const p = await db.patients.get(patientId);
  if (!p) throw new Error("patient not found");
  const [problems, allergies, meds, labs, vitals, encs, imms, notes] = await Promise.all([
    db.problems.where("patientId").equals(patientId).toArray(),
    db.allergies.where("patientId").equals(patientId).toArray(),
    db.medications.where("patientId").equals(patientId).toArray(),
    db.labs.where("patientId").equals(patientId).toArray(),
    db.vitals.where("patientId").equals(patientId).toArray(),
    db.encounters.where("patientId").equals(patientId).toArray(),
    db.immunizations.where("patientId").equals(patientId).toArray(),
    db.notes.where("patientId").equals(patientId).toArray(),
  ]);
  const ref = (t: string, id: string) => ({ reference: `${t}/${id}` });
  const entries: object[] = [];
  entries.push({ resource: { resourceType: "Patient", id: p.id, identifier: [{ system: "urn:magic-ehr:mrn", value: p.mrn }], name: [{ family: p.lastName, given: [p.firstName] }], gender: p.sex === "F" ? "female" : p.sex === "M" ? "male" : "other", birthDate: p.dob, telecom: [{ system: "phone", value: p.phone }], address: [{ text: p.address }], communication: [{ language: { text: p.language } }] } });
  for (const e of encs) entries.push({ resource: { resourceType: "Encounter", id: e.id, status: e.status === "discharged" ? "finished" : e.status === "planned" ? "planned" : "in-progress", class: { system: "http://terminology.hl7.org/CodeSystem/v3-ActCode", code: e.type === "inpatient" ? "IMP" : e.type === "ed" ? "EMER" : e.type === "telehealth" ? "VR" : "AMB" }, subject: ref("Patient", p.id), period: { start: e.start, end: e.end }, reasonCode: [{ text: e.reason }], location: e.unit ? [{ location: { display: `${e.unit} ${e.room ?? ""}${e.bed ?? ""}` } }] : undefined } });
  for (const c of problems) entries.push({ resource: { resourceType: "Condition", id: c.id, clinicalStatus: { coding: [{ system: "http://terminology.hl7.org/CodeSystem/condition-clinical", code: c.status === "resolved" ? "resolved" : "active" }] }, code: { coding: [{ system: "http://hl7.org/fhir/sid/icd-10-cm", code: c.code, display: c.display }], text: c.display }, subject: ref("Patient", p.id), onsetDateTime: c.onset, recordedDate: c.noted } });
  for (const a of allergies) entries.push({ resource: { resourceType: "AllergyIntolerance", id: a.id, clinicalStatus: { coding: [{ code: "active" }] }, verificationStatus: { coding: [{ code: a.verified ? "confirmed" : "unconfirmed" }] }, type: a.type, category: [a.category], criticality: a.severity === "severe" ? "high" : "low", code: { text: a.substance }, patient: ref("Patient", p.id), recordedDate: a.noted, reaction: [{ manifestation: [{ text: a.reaction }], severity: a.severity }] } });
  for (const m of meds) entries.push({ resource: { resourceType: "MedicationRequest", id: m.id, status: m.status === "active" ? "active" : m.status === "held" ? "on-hold" : m.status === "discontinued" ? "stopped" : "completed", intent: "order", medicationCodeableConcept: { text: m.name }, subject: ref("Patient", p.id), authoredOn: m.start, requester: { display: m.prescriberId }, dosageInstruction: [{ text: `${m.dose} ${m.route} ${m.frequency}`, route: { text: m.route } }], reasonCode: [{ text: m.indication }] } });
  for (const l of labs) entries.push({ resource: { resourceType: "Observation", id: l.id, status: l.status === "corrected" ? "corrected" : l.status === "prelim" ? "preliminary" : "final", category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "laboratory" }] }], code: { coding: [{ system: "http://loinc.org", code: l.code, display: l.name }], text: l.name }, subject: ref("Patient", p.id), effectiveDateTime: l.collected, issued: l.reported, ...(typeof l.value === "number" ? { valueQuantity: { value: l.value, unit: l.unit, system: "http://unitsofmeasure.org", code: l.unit } } : { valueString: l.value }), interpretation: l.flag ? [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation", code: l.flag }] }] : undefined, referenceRange: l.refLow !== undefined || l.refHigh !== undefined ? [{ low: l.refLow !== undefined ? { value: l.refLow, unit: l.unit } : undefined, high: l.refHigh !== undefined ? { value: l.refHigh, unit: l.unit } : undefined }] : undefined } });
  for (const v of vitals) {
    const comp: object[] = [];
    if (v.hr) comp.push({ code: { coding: [{ system: "http://loinc.org", code: "8867-4", display: "Heart rate" }] }, valueQuantity: { value: v.hr, unit: "/min" } });
    if (v.sbp) comp.push({ code: { coding: [{ system: "http://loinc.org", code: "8480-6", display: "Systolic blood pressure" }] }, valueQuantity: { value: v.sbp, unit: "mm[Hg]" } });
    if (v.dbp) comp.push({ code: { coding: [{ system: "http://loinc.org", code: "8462-4", display: "Diastolic blood pressure" }] }, valueQuantity: { value: v.dbp, unit: "mm[Hg]" } });
    if (v.rr) comp.push({ code: { coding: [{ system: "http://loinc.org", code: "9279-1", display: "Respiratory rate" }] }, valueQuantity: { value: v.rr, unit: "/min" } });
    if (v.temp) comp.push({ code: { coding: [{ system: "http://loinc.org", code: "8310-5", display: "Body temperature" }] }, valueQuantity: { value: v.temp, unit: "Cel" } });
    if (v.spo2) comp.push({ code: { coding: [{ system: "http://loinc.org", code: "2708-6", display: "Oxygen saturation" }] }, valueQuantity: { value: v.spo2, unit: "%" } });
    entries.push({ resource: { resourceType: "Observation", id: v.id, status: "final", category: [{ coding: [{ system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs" }] }], code: { coding: [{ system: "http://loinc.org", code: "85353-1", display: "Vital signs panel" }] }, subject: ref("Patient", p.id), effectiveDateTime: v.time, component: comp } });
  }
  for (const i of imms) entries.push({ resource: { resourceType: "Immunization", id: i.id, status: "completed", vaccineCode: { coding: [{ system: "http://hl7.org/fhir/sid/cvx", code: i.cvx, display: i.vaccine }] }, patient: ref("Patient", p.id), occurrenceDateTime: i.date, lotNumber: i.lot, site: { text: i.site }, protocolApplied: [{ doseNumberPositiveInt: i.doseNumber }] } });
  for (const n of notes.filter((x) => x.status !== "draft")) entries.push({ resource: { resourceType: "DocumentReference", id: n.id, status: "current", docStatus: n.status === "signed" || n.status === "addended" ? "final" : "preliminary", type: { text: n.type }, subject: ref("Patient", p.id), date: n.signedAt ?? n.updated, author: [{ display: n.authorId }], description: n.title, content: [{ attachment: { contentType: "text/plain", data: btoa(unescape(encodeURIComponent(n.body))) } }] } });
  return { resourceType: "Bundle", type: "collection", timestamp: new Date().toISOString(), meta: { source: "Magic EHR demo export", tag: [{ code: "SYNTHETIC" }] }, total: entries.length, entry: entries };
}
