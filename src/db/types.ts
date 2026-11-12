// Magic EHR domain types. All data in the demo is synthetic.

export type Role =
  | "physician"
  | "nurse"
  | "pharmacist"
  | "registrar"
  | "lab"
  | "radiology"
  | "ed"
  | "admin"
  | "patient";

export interface User {
  id: string;
  name: string;
  role: Role;
  credentials: string;
  department: string;
  initials: string;
}

export interface Patient {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  dob: string; // ISO date
  sex: "F" | "M" | "X";
  phone: string;
  email?: string;
  address: string;
  language: string;
  pcpId?: string;
  insurance: string;
  memberId: string;
  codeStatus: "Full Code" | "DNR" | "DNR/DNI" | "Comfort";
  isolation?: string;
  flags: string[];
  hue: number;
  bloodType?: string;
  heightCm: number;
  weightKg: number;
  createdAt: string;
  archetype: string;
}

export type EncounterType = "inpatient" | "outpatient" | "ed" | "telehealth";
export type EncounterStatus =
  | "planned"
  | "arrived"
  | "triaged"
  | "in-progress"
  | "admitted"
  | "discharged"
  | "canceled";

export interface Encounter {
  id: string;
  patientId: string;
  type: EncounterType;
  status: EncounterStatus;
  start: string;
  end?: string;
  department: string;
  unit?: string;
  room?: string;
  bed?: string;
  attendingId: string;
  reason: string;
  acuity?: 1 | 2 | 3 | 4 | 5;
  dischargeDisposition?: string;
  diagnosisCodes: string[];
}

export interface Problem {
  id: string;
  patientId: string;
  code: string;
  display: string;
  status: "active" | "resolved" | "chronic";
  onset: string;
  noted: string;
  priority: "high" | "medium" | "low";
  notedBy: string;
}

export interface Allergy {
  id: string;
  patientId: string;
  substance: string;
  category: "medication" | "food" | "environment";
  reaction: string;
  severity: "mild" | "moderate" | "severe";
  type: "allergy" | "intolerance";
  noted: string;
  verified: boolean;
  classKey?: string;
}

export interface Medication {
  id: string;
  patientId: string;
  encounterId?: string;
  name: string;
  generic: string;
  dose: string;
  route: string;
  frequency: string;
  indication: string;
  status: "active" | "held" | "discontinued" | "completed";
  start: string;
  end?: string;
  prescriberId: string;
  isInpatient: boolean;
  schedule: string[]; // HH:MM times for inpatient administration
  prn?: boolean;
}

export type OrderCategory =
  | "lab"
  | "imaging"
  | "medication"
  | "nursing"
  | "consult"
  | "procedure"
  | "diet";

export type OrderStatus =
  | "draft"
  | "signed"
  | "in-progress"
  | "collected"
  | "resulted"
  | "completed"
  | "canceled";

export type LocalState =
  | "local-draft"
  | "local-committed"
  | "queued"
  | "syncing"
  | "server-accepted"
  | "conflict"
  | "rejected";

export interface OrderAlertOverride {
  rule: string;
  severity: string;
  reason: string;
}

export interface Order {
  id: string;
  patientId: string;
  encounterId: string;
  catalogId: string;
  category: OrderCategory;
  display: string;
  priority: "routine" | "urgent" | "stat";
  status: OrderStatus;
  orderedBy: string;
  orderedAt: string;
  signedAt?: string;
  indication: string;
  details?: string;
  frequency?: string;
  overrides: OrderAlertOverride[];
  localState: LocalState;
  orderSet?: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  orderId?: string;
  panel: string;
  code: string;
  name: string;
  value: number | string;
  unit: string;
  refLow?: number;
  refHigh?: number;
  flag: "H" | "L" | "HH" | "LL" | "A" | null;
  collected: string;
  reported: string;
  status: "final" | "prelim" | "corrected";
  acknowledged: boolean;
  specimen: string;
}

export interface Vital {
  id: string;
  patientId: string;
  encounterId?: string;
  time: string;
  hr?: number;
  sbp?: number;
  dbp?: number;
  rr?: number;
  temp?: number;
  spo2?: number;
  pain?: number;
  weightKg?: number;
  source: "manual" | "device";
  authorId: string;
  corrected?: boolean;
}

export interface NoteAddendum {
  authorId: string;
  time: string;
  text: string;
}

export interface Note {
  id: string;
  patientId: string;
  encounterId?: string;
  type: string;
  title: string;
  authorId: string;
  created: string;
  updated: string;
  signedAt?: string;
  status: "draft" | "signed" | "addended" | "pending-cosign";
  body: string;
  version: number;
  cosignRequired: boolean;
  cosignedBy?: string;
  addenda: NoteAddendum[];
  localState: LocalState;
  aiDraft?: boolean;
}

export interface Administration {
  id: string;
  patientId: string;
  medicationId: string;
  scheduled: string;
  actionTime?: string;
  status: "due" | "given" | "held" | "refused" | "missed";
  nurseId?: string;
  barcodeVerified: boolean;
  note?: string;
}

export interface Immunization {
  id: string;
  patientId: string;
  vaccine: string;
  cvx: string;
  date: string;
  lot: string;
  site: string;
  doseNumber: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  start: string;
  durationMin: number;
  type: string;
  status:
    | "scheduled"
    | "checked-in"
    | "roomed"
    | "in-visit"
    | "completed"
    | "no-show"
    | "canceled";
  room?: string;
  reason: string;
  department: string;
}

export interface InboxItem {
  id: string;
  ownerId: string;
  type:
    | "result"
    | "message"
    | "cosign"
    | "refill"
    | "referral"
    | "deficiency"
    | "reminder";
  patientId?: string;
  subject: string;
  body: string;
  priority: "high" | "normal" | "low";
  created: string;
  status: "new" | "read" | "done";
  refId?: string;
  fromName?: string;
}

export interface Bed {
  id: string;
  unit: string;
  room: string;
  bed: string;
  status: "occupied" | "available" | "cleaning" | "blocked";
  patientId?: string;
  isolation?: string;
  reservedBy?: string;
}

export interface Specimen {
  id: string;
  orderId: string;
  patientId: string;
  tests: string;
  status:
    | "ordered"
    | "collected"
    | "received"
    | "in-process"
    | "resulted"
    | "rejected";
  collectedAt?: string;
  receivedAt?: string;
  barcode: string;
  priority: "routine" | "urgent" | "stat";
  container: string;
  rejectReason?: string;
}

export interface ImagingStudy {
  id: string;
  orderId: string;
  patientId: string;
  modality: string;
  description: string;
  status: "ordered" | "scheduled" | "in-progress" | "acquired" | "prelim" | "final";
  accession: string;
  scheduledAt?: string;
  reportText?: string;
  radiologistId?: string;
  criticalFinding?: boolean;
  priority: "routine" | "urgent" | "stat";
}

export interface PharmacyVerification {
  id: string;
  orderId: string;
  patientId: string;
  medName: string;
  details: string;
  status: "pending" | "verified" | "rejected" | "clarify";
  pharmacistId?: string;
  decidedAt?: string;
  reason?: string;
  created: string;
}

export interface CarePlanItem {
  id: string;
  patientId: string;
  goal: string;
  intervention: string;
  ownerRole: string;
  due: string;
  status: "open" | "met" | "not-met";
}

export interface AuditEvent {
  id: string;
  time: string;
  userId: string;
  userName: string;
  role: Role;
  action: string;
  patientId?: string;
  resource: string;
  resourceId?: string;
  detail: string;
  device: string;
  mode: "online" | "offline";
}

export interface JournalEntry {
  id: string;
  seq: number;
  authorId: string;
  device: string;
  patientId?: string;
  resource: string;
  resourceId: string;
  op: "create" | "update" | "sign" | "delete";
  baseRevision: number;
  payloadDigest: string;
  effective: string;
  recorded: string;
  state: LocalState;
  error?: string;
}

export interface PortalMessage {
  id: string;
  patientId: string;
  fromName: string;
  toName: string;
  subject: string;
  body: string;
  time: string;
  direction: "to-clinic" | "to-patient";
  read: boolean;
}

export interface ClinicalDocument {
  id: string;
  patientId: string;
  title: string;
  type: string;
  date: string;
  source: string;
  pages: number;
  summary: string;
}

export interface HistoryItem {
  id: string;
  patientId: string;
  category: "medical" | "surgical" | "family" | "social";
  item: string;
  detail: string;
  date?: string;
}

export interface Setting {
  key: string;
  value: string;
}
