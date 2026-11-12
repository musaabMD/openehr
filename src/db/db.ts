import Dexie, { type Table } from "dexie";
import type {
  Administration, Allergy, Appointment, AuditEvent, Bed, CarePlanItem,
  ClinicalDocument, Encounter, HistoryItem, ImagingStudy, Immunization,
  InboxItem, JournalEntry, LabResult, Medication, Note, Order, Patient,
  PharmacyVerification, PortalMessage, Problem, Setting, Specimen, User, Vital,
} from "./types";

export class MagicDB extends Dexie {
  users!: Table<User, string>;
  patients!: Table<Patient, string>;
  encounters!: Table<Encounter, string>;
  problems!: Table<Problem, string>;
  allergies!: Table<Allergy, string>;
  medications!: Table<Medication, string>;
  orders!: Table<Order, string>;
  labs!: Table<LabResult, string>;
  vitals!: Table<Vital, string>;
  notes!: Table<Note, string>;
  administrations!: Table<Administration, string>;
  immunizations!: Table<Immunization, string>;
  appointments!: Table<Appointment, string>;
  inbox!: Table<InboxItem, string>;
  beds!: Table<Bed, string>;
  specimens!: Table<Specimen, string>;
  imaging!: Table<ImagingStudy, string>;
  pharmacy!: Table<PharmacyVerification, string>;
  carePlan!: Table<CarePlanItem, string>;
  audit!: Table<AuditEvent, string>;
  journal!: Table<JournalEntry, string>;
  portalMessages!: Table<PortalMessage, string>;
  documents!: Table<ClinicalDocument, string>;
  history!: Table<HistoryItem, string>;
  settings!: Table<Setting, string>;

  constructor() {
    super("magic-ehr");
    this.version(1).stores({
      users: "id, role",
      patients: "id, mrn, lastName, firstName, archetype",
      encounters: "id, patientId, type, status, unit, attendingId, start",
      problems: "id, patientId, status",
      allergies: "id, patientId",
      medications: "id, patientId, status, isInpatient",
      orders: "id, patientId, encounterId, category, status, orderedAt, localState",
      labs: "id, patientId, orderId, panel, code, collected, acknowledged",
      vitals: "id, patientId, encounterId, time",
      notes: "id, patientId, encounterId, status, authorId, updated",
      administrations: "id, patientId, medicationId, scheduled, status",
      immunizations: "id, patientId",
      appointments: "id, patientId, providerId, start, status",
      inbox: "id, ownerId, type, status, created, patientId",
      beds: "id, unit, status, patientId",
      specimens: "id, orderId, patientId, status, barcode",
      imaging: "id, orderId, patientId, status, modality",
      pharmacy: "id, orderId, patientId, status",
      carePlan: "id, patientId, status",
      audit: "id, time, userId, patientId, action",
      journal: "id, seq, state, patientId",
      portalMessages: "id, patientId, time",
      documents: "id, patientId, date",
      history: "id, patientId, category",
      settings: "key",
    });
  }
}

export const db = new MagicDB();

export async function isSeeded(): Promise<boolean> {
  const s = await db.settings.get("seeded");
  return !!s && s.value === "1";
}

export async function resetDatabase(): Promise<void> {
  await db.delete();
  await db.open();
}

export function uid(prefix = ""): string {
  const u =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36);
  return prefix ? `${prefix}_${u}` : u;
}
