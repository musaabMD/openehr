// Deterministic synthetic demo dataset. No real patients. Seeded PRNG so
// every demo launch produces the same hospital.
import { db } from "./db";
import type {
  Administration, Allergy, Appointment, AuditEvent, Bed, CarePlanItem,
  ClinicalDocument, Encounter, HistoryItem, ImagingStudy, Immunization,
  InboxItem, LabResult, Medication, Note, Order, Patient, PharmacyVerification,
  PortalMessage, Problem, Specimen, User, Vital,
} from "./types";
import { CATALOG_BY_ID, LAB_PANELS } from "../lib/catalog";
import { flagFor } from "../lib/cds";
import { addDays, addMinutes, startOfDay } from "../lib/format";

function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20261112);
const rnd = (a: number, b: number) => a + rand() * (b - a);
const rint = (a: number, b: number) => Math.floor(rnd(a, b + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]!;
const chance = (p: number) => rand() < p;
const round = (v: number, d = 0) => Math.round(v * 10 ** d) / 10 ** d;
let seq = 0;
const id = (p: string) => `${p}-${(++seq).toString(36).padStart(5, "0")}`;

export const FACILITY = { name: "Magic General Hospital", short: "MGH", org: "Magic Health" };

export const USERS: User[] = [
  { id: "u-phys1", name: "Amina Rashid", credentials: "MD", role: "physician", department: "Internal Medicine", initials: "AR" },
  { id: "u-phys2", name: "Daniel Okafor", credentials: "MD", role: "physician", department: "Hospital Medicine", initials: "DO" },
  { id: "u-phys3", name: "Sofia Marin", credentials: "MD", role: "physician", department: "Family Medicine", initials: "SM" },
  { id: "u-phys4", name: "Yusuf Haddad", credentials: "MD", role: "physician", department: "Cardiology", initials: "YH" },
  { id: "u-res1", name: "Omar Siddiqui", credentials: "MD, PGY-2", role: "physician", department: "Internal Medicine", initials: "OS" },
  { id: "u-ed1", name: "Lena Park", credentials: "MD", role: "ed", department: "Emergency Medicine", initials: "LP" },
  { id: "u-nurse1", name: "Grace Mwangi", credentials: "RN", role: "nurse", department: "3 North", initials: "GM" },
  { id: "u-nurse2", name: "Carlos Reyes", credentials: "RN", role: "nurse", department: "4 ICU", initials: "CR" },
  { id: "u-nurse3", name: "Priya Nair", credentials: "RN", role: "nurse", department: "Emergency", initials: "PN" },
  { id: "u-pharm1", name: "Hana Kobayashi", credentials: "PharmD", role: "pharmacist", department: "Pharmacy", initials: "HK" },
  { id: "u-lab1", name: "Tomás Silva", credentials: "MLS", role: "lab", department: "Laboratory", initials: "TS" },
  { id: "u-rad1", name: "Ingrid Larsen", credentials: "MD", role: "radiology", department: "Radiology", initials: "IL" },
  { id: "u-reg1", name: "Fatima Al-Sayed", credentials: "", role: "registrar", department: "Patient Access", initials: "FA" },
  { id: "u-admin", name: "Alex Chen", credentials: "", role: "admin", department: "Information Services", initials: "AC" },
  { id: "u-patient", name: "Jordan Ellis", credentials: "", role: "patient", department: "Portal", initials: "JE" },
];

const FIRST_F = ["Maria", "Aisha", "Elena", "Fatima", "Grace", "Hannah", "Layla", "Mei", "Nour", "Olivia", "Priya", "Rosa", "Sara", "Yasmin", "Zara", "Amara", "Chloe", "Ingrid", "Leila", "Noor"];
const FIRST_M = ["Ahmed", "Carlos", "David", "Ethan", "Hassan", "Ibrahim", "James", "Khalid", "Liam", "Mohammed", "Noah", "Omar", "Rafael", "Samuel", "Tariq", "Victor", "Wei", "Yusuf", "Zain", "Jordan"];
const LAST = ["Abdullah", "Alvarez", "Brown", "Chen", "Dubois", "Farah", "Garcia", "Hussain", "Ivanov", "Johnson", "Khan", "Lee", "Martinez", "Nakamura", "Okafor", "Patel", "Qureshi", "Rossi", "Singh", "Tanaka", "Usman", "Verma", "Williams", "Yilmaz", "Zahra", "Ellis", "Novak", "Haddad", "Mensah", "Costa"];
const STREETS = ["Oak St", "Cedar Ave", "Harbor Rd", "Maple Ln", "King Fahd Rd", "Riverside Dr", "Elm St", "Palm Blvd"];
const INSURERS = ["Blue Shield PPO", "Medicare Part A/B", "Aetna HMO", "Bupa Gold", "Medicaid", "Self-pay", "Cigna Open Access", "Tawuniya Premium"];
const LANGS = ["English", "English", "English", "Arabic", "Spanish", "English", "Mandarin", "Urdu"];

interface Archetype {
  key: string;
  setting: "inpatient" | "icu" | "ed" | "outpatient";
  reason: string;
  ageRange: [number, number];
  problems: { code: string; display: string; status: "active" | "chronic" | "resolved"; priority: "high" | "medium" | "low" }[];
  homeMeds: string[];
  inptMeds: string[];
  panels: string[];
  labOverride: Record<string, [number, number]>;
  vitals: { hr: [number, number]; sbp: [number, number]; rr: [number, number]; temp: [number, number]; spo2: [number, number] };
  acuity?: 1 | 2 | 3 | 4 | 5;
  flags?: string[];
  isolation?: string;
}

const A: Archetype[] = [
  { key: "inpt-chf", setting: "inpatient", reason: "Acute decompensated heart failure", ageRange: [62, 88],
    problems: [{ code: "I50.23", display: "Acute on chronic systolic heart failure", status: "active", priority: "high" }, { code: "I10", display: "Essential hypertension", status: "chronic", priority: "medium" }, { code: "N18.3", display: "Chronic kidney disease stage 3", status: "chronic", priority: "medium" }, { code: "I48.91", display: "Atrial fibrillation", status: "chronic", priority: "high" }],
    homeMeds: ["med-lisinopril", "med-metoprolol", "med-atorvastatin", "med-warfarin"], inptMeds: ["med-furosemide", "med-metoprolol", "med-warfarin", "med-potassium", "med-atorvastatin"],
    panels: ["CBC", "BMP", "BNP", "PT/INR", "Magnesium"], labOverride: { BNP: [600, 1900], Creatinine: [1.3, 2.1], Sodium: [128, 135], Potassium: [3.1, 3.6], INR: [1.8, 3.4] },
    vitals: { hr: [84, 112], sbp: [98, 138], rr: [18, 26], temp: [36.4, 37.2], spo2: [89, 95] }, flags: ["Fall risk"] },
  { key: "inpt-pna", setting: "inpatient", reason: "Community-acquired pneumonia", ageRange: [35, 80],
    problems: [{ code: "J18.9", display: "Pneumonia, unspecified organism", status: "active", priority: "high" }, { code: "J44.9", display: "COPD", status: "chronic", priority: "medium" }],
    homeMeds: ["med-albuterol"], inptMeds: ["med-ceftriaxone", "med-azithromycin", "med-albuterol", "med-heparin-sq", "med-acetaminophen"],
    panels: ["CBC", "BMP", "CRP", "Blood Cultures x2"], labOverride: { WBC: [12, 19], "C-reactive protein": [40, 160] },
    vitals: { hr: [88, 118], sbp: [104, 140], rr: [20, 28], temp: [37.6, 39.1], spo2: [90, 95] }, isolation: "Droplet" },
  { key: "inpt-sepsis", setting: "inpatient", reason: "Sepsis secondary to urinary tract infection", ageRange: [55, 90],
    problems: [{ code: "A41.9", display: "Sepsis, unspecified organism", status: "active", priority: "high" }, { code: "N39.0", display: "Urinary tract infection", status: "active", priority: "high" }, { code: "E11.9", display: "Type 2 diabetes mellitus", status: "chronic", priority: "medium" }],
    homeMeds: ["med-metformin", "med-lisinopril"], inptMeds: ["med-piptazo", "med-ns-maint", "med-insulin-lispro", "med-heparin-sq", "med-acetaminophen"],
    panels: ["CBC", "CMP", "Lactate", "Blood Cultures x2", "Urinalysis"], labOverride: { WBC: [14, 23], Lactate: [2.2, 4.8], Creatinine: [1.5, 2.4], Glucose: [170, 290] },
    vitals: { hr: [96, 126], sbp: [88, 118], rr: [20, 28], temp: [38.0, 39.4], spo2: [92, 97] }, flags: ["Sepsis pathway"] },
  { key: "inpt-dm", setting: "inpatient", reason: "Diabetic ketoacidosis, resolving", ageRange: [19, 55],
    problems: [{ code: "E10.10", display: "Type 1 diabetes with ketoacidosis", status: "active", priority: "high" }, { code: "E10.9", display: "Type 1 diabetes mellitus", status: "chronic", priority: "high" }],
    homeMeds: ["med-insulin-glargine", "med-insulin-lispro"], inptMeds: ["med-insulin-lispro", "med-insulin-glargine", "med-potassium", "med-ns-maint"],
    panels: ["BMP", "CBC", "Hemoglobin A1c", "Magnesium"], labOverride: { Glucose: [180, 340], Potassium: [3.0, 3.6], Bicarbonate: [15, 21], "Hemoglobin A1c": [9.0, 12.5] },
    vitals: { hr: [80, 108], sbp: [108, 136], rr: [16, 24], temp: [36.5, 37.3], spo2: [96, 99] } },
  { key: "inpt-copd", setting: "inpatient", reason: "COPD exacerbation", ageRange: [58, 84],
    problems: [{ code: "J44.1", display: "COPD with acute exacerbation", status: "active", priority: "high" }, { code: "F17.210", display: "Nicotine dependence, cigarettes", status: "chronic", priority: "low" }, { code: "I10", display: "Essential hypertension", status: "chronic", priority: "medium" }],
    homeMeds: ["med-albuterol", "med-amlodipine"], inptMeds: ["med-albuterol", "med-prednisone", "med-azithromycin", "med-amlodipine", "med-heparin-sq"],
    panels: ["CBC", "BMP"], labOverride: { Bicarbonate: [29, 35], WBC: [10, 15] },
    vitals: { hr: [86, 110], sbp: [118, 156], rr: [22, 30], temp: [36.6, 37.6], spo2: [87, 93] } },
  { key: "inpt-stroke", setting: "inpatient", reason: "Acute ischemic stroke, left MCA", ageRange: [60, 89],
    problems: [{ code: "I63.512", display: "Cerebral infarction, left middle cerebral artery", status: "active", priority: "high" }, { code: "I48.91", display: "Atrial fibrillation", status: "chronic", priority: "high" }, { code: "E78.5", display: "Hyperlipidemia", status: "chronic", priority: "low" }],
    homeMeds: ["med-metoprolol", "med-atorvastatin"], inptMeds: ["med-aspirin", "med-atorvastatin", "med-metoprolol", "med-heparin-sq"],
    panels: ["CBC", "BMP", "PT/INR", "Lipid Panel"], labOverride: { "LDL (calc)": [130, 190] },
    vitals: { hr: [70, 98], sbp: [140, 178], rr: [14, 20], temp: [36.5, 37.4], spo2: [94, 98] }, flags: ["Aspiration risk", "Fall risk"] },
  { key: "inpt-hip", setting: "inpatient", reason: "Post-op day 2, right total hip arthroplasty", ageRange: [64, 86],
    problems: [{ code: "S72.001A", display: "Fracture of right femoral neck", status: "active", priority: "high" }, { code: "M81.0", display: "Osteoporosis", status: "chronic", priority: "medium" }],
    homeMeds: ["med-levothyroxine"], inptMeds: ["med-enoxaparin", "med-oxycodone", "med-acetaminophen", "med-ondansetron", "med-levothyroxine"],
    panels: ["CBC", "BMP"], labOverride: { Hemoglobin: [8.4, 10.5] },
    vitals: { hr: [72, 96], sbp: [110, 146], rr: [14, 20], temp: [36.6, 37.8], spo2: [93, 97] }, flags: ["Fall risk", "Weight-bearing as tolerated"] },
  { key: "inpt-gib", setting: "inpatient", reason: "Upper GI bleed", ageRange: [45, 78],
    problems: [{ code: "K92.2", display: "Gastrointestinal hemorrhage", status: "active", priority: "high" }, { code: "K25.4", display: "Chronic gastric ulcer with hemorrhage", status: "active", priority: "high" }],
    homeMeds: ["med-ibuprofen"], inptMeds: ["med-pantoprazole", "med-ns-maint", "med-ondansetron"],
    panels: ["CBC", "BMP", "PT/INR", "Type and Screen"], labOverride: { Hemoglobin: [6.9, 9.2], BUN: [32, 58], Hematocrit: [21, 29] },
    vitals: { hr: [92, 118], sbp: [92, 120], rr: [16, 22], temp: [36.4, 37.2], spo2: [95, 99] }, flags: ["Transfusion consent on file"] },
  { key: "icu-sepsis", setting: "icu", reason: "Septic shock, pneumonia", ageRange: [50, 85],
    problems: [{ code: "R65.21", display: "Severe sepsis with septic shock", status: "active", priority: "high" }, { code: "J18.9", display: "Pneumonia", status: "active", priority: "high" }, { code: "N17.9", display: "Acute kidney injury", status: "active", priority: "high" }],
    homeMeds: ["med-lisinopril", "med-atorvastatin"], inptMeds: ["med-vancomycin", "med-piptazo", "med-ns-maint", "med-insulin-lispro", "med-pantoprazole"],
    panels: ["CBC", "CMP", "Lactate", "Blood Cultures x2", "Magnesium"], labOverride: { WBC: [18, 28], Lactate: [2.8, 6.5], Creatinine: [2.0, 3.6], Platelets: [70, 140] },
    vitals: { hr: [104, 134], sbp: [78, 104], rr: [22, 32], temp: [38.2, 39.8], spo2: [88, 94] }, flags: ["Central line", "Arterial line"], isolation: "Contact" },
  { key: "icu-resp", setting: "icu", reason: "Acute hypoxic respiratory failure", ageRange: [40, 80],
    problems: [{ code: "J96.01", display: "Acute respiratory failure with hypoxia", status: "active", priority: "high" }, { code: "J80", display: "Acute respiratory distress syndrome", status: "active", priority: "high" }],
    homeMeds: [], inptMeds: ["med-heparin-sq", "med-pantoprazole", "med-ns-maint", "med-ceftriaxone"],
    panels: ["CBC", "CMP", "Lactate"], labOverride: { WBC: [11, 17] },
    vitals: { hr: [90, 120], sbp: [96, 126], rr: [24, 34], temp: [37.2, 38.6], spo2: [86, 93] }, flags: ["Ventilator", "Prone positioning"] },
  { key: "ed-chest", setting: "ed", reason: "Chest pain", ageRange: [42, 76], acuity: 2,
    problems: [{ code: "R07.9", display: "Chest pain, unspecified", status: "active", priority: "high" }, { code: "I10", display: "Essential hypertension", status: "chronic", priority: "medium" }, { code: "E78.5", display: "Hyperlipidemia", status: "chronic", priority: "low" }],
    homeMeds: ["med-amlodipine", "med-atorvastatin", "med-aspirin"], inptMeds: ["med-aspirin"],
    panels: ["Troponin I (hs)", "CBC", "BMP"], labOverride: {},
    vitals: { hr: [78, 104], sbp: [132, 168], rr: [16, 22], temp: [36.5, 37.2], spo2: [95, 99] } },
  { key: "ed-abd", setting: "ed", reason: "Right lower quadrant abdominal pain", ageRange: [18, 45], acuity: 3,
    problems: [{ code: "R10.31", display: "Right lower quadrant pain", status: "active", priority: "high" }],
    homeMeds: [], inptMeds: ["med-ondansetron", "med-morphine", "med-ns-bolus"],
    panels: ["CBC", "CMP", "Urinalysis"], labOverride: { WBC: [11, 16] },
    vitals: { hr: [84, 108], sbp: [112, 138], rr: [16, 22], temp: [37.2, 38.3], spo2: [97, 100] } },
  { key: "ed-fracture", setting: "ed", reason: "Fall, right wrist deformity", ageRange: [8, 70], acuity: 3,
    problems: [{ code: "S52.501A", display: "Fracture of distal end of right radius", status: "active", priority: "medium" }],
    homeMeds: [], inptMeds: ["med-ibuprofen", "med-acetaminophen"],
    panels: [], labOverride: {},
    vitals: { hr: [70, 96], sbp: [110, 140], rr: [14, 20], temp: [36.4, 37.0], spo2: [97, 100] } },
  { key: "ed-asthma", setting: "ed", reason: "Shortness of breath, wheezing", ageRange: [6, 40], acuity: 2,
    problems: [{ code: "J45.41", display: "Moderate persistent asthma with exacerbation", status: "active", priority: "high" }],
    homeMeds: ["med-albuterol"], inptMeds: ["med-albuterol", "med-prednisone"],
    panels: ["CBC"], labOverride: {},
    vitals: { hr: [96, 124], sbp: [104, 132], rr: [24, 32], temp: [36.6, 37.4], spo2: [89, 94] } },
  { key: "ed-sepsis", setting: "ed", reason: "Fever, confusion, hypotension", ageRange: [66, 92], acuity: 1,
    problems: [{ code: "A41.9", display: "Sepsis, unspecified organism", status: "active", priority: "high" }, { code: "F03.90", display: "Dementia", status: "chronic", priority: "medium" }],
    homeMeds: ["med-sertraline", "med-amlodipine"], inptMeds: ["med-ns-bolus"],
    panels: ["Lactate", "CBC", "CMP", "Blood Cultures x2", "Urinalysis"], labOverride: { Lactate: [3.0, 5.5], WBC: [15, 24] },
    vitals: { hr: [108, 132], sbp: [80, 98], rr: [22, 30], temp: [38.6, 39.9], spo2: [90, 95] }, flags: ["Sepsis pathway"] },
  { key: "ed-lac", setting: "ed", reason: "Laceration left hand", ageRange: [16, 60], acuity: 4,
    problems: [{ code: "S61.412A", display: "Laceration without foreign body of left hand", status: "active", priority: "low" }],
    homeMeds: [], inptMeds: [],
    panels: [], labOverride: {},
    vitals: { hr: [66, 90], sbp: [112, 136], rr: [12, 18], temp: [36.4, 37.0], spo2: [98, 100] } },
  { key: "out-htn", setting: "outpatient", reason: "Hypertension follow-up", ageRange: [40, 75],
    problems: [{ code: "I10", display: "Essential hypertension", status: "chronic", priority: "medium" }, { code: "E78.5", display: "Hyperlipidemia", status: "chronic", priority: "low" }],
    homeMeds: ["med-lisinopril", "med-atorvastatin"], inptMeds: [],
    panels: ["BMP", "Lipid Panel"], labOverride: { "LDL (calc)": [110, 165] },
    vitals: { hr: [64, 84], sbp: [128, 158], rr: [12, 18], temp: [36.4, 37.0], spo2: [96, 99] } },
  { key: "out-dm", setting: "outpatient", reason: "Diabetes follow-up", ageRange: [35, 72],
    problems: [{ code: "E11.65", display: "Type 2 diabetes with hyperglycemia", status: "chronic", priority: "high" }, { code: "E66.9", display: "Obesity", status: "chronic", priority: "low" }, { code: "I10", display: "Essential hypertension", status: "chronic", priority: "medium" }],
    homeMeds: ["med-metformin", "med-lisinopril", "med-atorvastatin"], inptMeds: [],
    panels: ["Hemoglobin A1c", "BMP", "Lipid Panel"], labOverride: { "Hemoglobin A1c": [7.2, 9.8], Glucose: [130, 210] },
    vitals: { hr: [68, 88], sbp: [124, 148], rr: [12, 18], temp: [36.4, 37.0], spo2: [96, 99] } },
  { key: "out-well", setting: "outpatient", reason: "Annual wellness visit", ageRange: [20, 65],
    problems: [], homeMeds: [], inptMeds: [],
    panels: ["CBC", "Lipid Panel"], labOverride: {},
    vitals: { hr: [58, 80], sbp: [108, 128], rr: [12, 16], temp: [36.4, 37.0], spo2: [97, 100] } },
  { key: "out-asthma", setting: "outpatient", reason: "Asthma control check", ageRange: [7, 45],
    problems: [{ code: "J45.30", display: "Mild persistent asthma", status: "chronic", priority: "medium" }, { code: "J30.9", display: "Allergic rhinitis", status: "chronic", priority: "low" }],
    homeMeds: ["med-albuterol"], inptMeds: [],
    panels: [], labOverride: {},
    vitals: { hr: [64, 92], sbp: [104, 126], rr: [14, 20], temp: [36.4, 37.0], spo2: [96, 99] } },
  { key: "out-dep", setting: "outpatient", reason: "Depression follow-up, medication review", ageRange: [22, 60],
    problems: [{ code: "F32.1", display: "Major depressive disorder, moderate", status: "chronic", priority: "medium" }, { code: "G47.00", display: "Insomnia", status: "active", priority: "low" }],
    homeMeds: ["med-sertraline"], inptMeds: [],
    panels: ["TSH", "CBC"], labOverride: {},
    vitals: { hr: [60, 86], sbp: [108, 132], rr: [12, 18], temp: [36.4, 37.0], spo2: [97, 100] } },
  { key: "out-thy", setting: "outpatient", reason: "Hypothyroidism, dose check", ageRange: [30, 70],
    problems: [{ code: "E03.9", display: "Hypothyroidism", status: "chronic", priority: "medium" }],
    homeMeds: ["med-levothyroxine"], inptMeds: [],
    panels: ["TSH"], labOverride: { TSH: [4.8, 9.5] },
    vitals: { hr: [58, 80], sbp: [110, 134], rr: [12, 18], temp: [36.2, 36.9], spo2: [97, 100] } },
  { key: "out-afib", setting: "outpatient", reason: "Atrial fibrillation, anticoagulation review", ageRange: [60, 85],
    problems: [{ code: "I48.91", display: "Atrial fibrillation", status: "chronic", priority: "high" }, { code: "I10", display: "Essential hypertension", status: "chronic", priority: "medium" }],
    homeMeds: ["med-warfarin", "med-metoprolol"], inptMeds: [],
    panels: ["PT/INR", "CBC"], labOverride: { INR: [1.6, 3.6] },
    vitals: { hr: [66, 98], sbp: [118, 150], rr: [12, 18], temp: [36.4, 37.0], spo2: [95, 99] } },
  { key: "out-peds", setting: "outpatient", reason: "Well-child visit", ageRange: [2, 12],
    problems: [], homeMeds: [], inptMeds: [], panels: [], labOverride: {},
    vitals: { hr: [80, 110], sbp: [92, 110], rr: [18, 24], temp: [36.4, 37.1], spo2: [98, 100] } },
];

const ALLERGY_POOL: Omit<Allergy, "id" | "patientId" | "noted">[] = [
  { substance: "Penicillin", category: "medication", reaction: "Hives", severity: "moderate", type: "allergy", verified: true, classKey: "penicillin" },
  { substance: "Penicillin", category: "medication", reaction: "Anaphylaxis", severity: "severe", type: "allergy", verified: true, classKey: "penicillin" },
  { substance: "Sulfa (sulfonamide antibiotics)", category: "medication", reaction: "Rash", severity: "mild", type: "allergy", verified: true, classKey: "sulfonamide" },
  { substance: "Iodinated contrast", category: "medication", reaction: "Bronchospasm", severity: "severe", type: "allergy", verified: false, classKey: "contrast" },
  { substance: "Morphine", category: "medication", reaction: "Nausea, itching", severity: "mild", type: "intolerance", verified: true, classKey: "opioid" },
  { substance: "NSAIDs (ibuprofen)", category: "medication", reaction: "GI bleeding", severity: "moderate", type: "intolerance", verified: true, classKey: "nsaid" },
  { substance: "Peanuts", category: "food", reaction: "Anaphylaxis", severity: "severe", type: "allergy", verified: true },
  { substance: "Shellfish", category: "food", reaction: "Hives", severity: "moderate", type: "allergy", verified: true },
  { substance: "Latex", category: "environment", reaction: "Contact dermatitis", severity: "mild", type: "allergy", verified: true },
  { substance: "Codeine", category: "medication", reaction: "Severe nausea", severity: "mild", type: "intolerance", verified: true, classKey: "opioid" },
];

function vitalsFor(a: Archetype, progress: number) {
  // progress 0 = sickest (admission), 1 = now (improving)
  const v = a.vitals;
  const improve = (lo: number, hi: number, towardLow: boolean) => {
    const raw = rnd(lo, hi);
    const target = towardLow ? lo : hi;
    return raw + (target - raw) * progress * 0.6;
  };
  return {
    hr: Math.round(improve(v.hr[0], v.hr[1], true)),
    sbp: Math.round(improve(v.sbp[0], v.sbp[1], v.sbp[0] > 110)),
    rr: Math.round(improve(v.rr[0], v.rr[1], true)),
    temp: round(improve(v.temp[0], v.temp[1], true), 1),
    spo2: Math.round(improve(v.spo2[0], v.spo2[1], false)),
  };
}

export async function seedDatabase(onProgress?: (msg: string) => void) {
  const now = new Date();
  const today0 = startOfDay(now);
  onProgress?.("Building synthetic hospital…");

  const patients: Patient[] = [];
  const encounters: Encounter[] = [];
  const problems: Problem[] = [];
  const allergies: Allergy[] = [];
  const medications: Medication[] = [];
  const orders: Order[] = [];
  const labs: LabResult[] = [];
  const vitals: Vital[] = [];
  const notes: Note[] = [];
  const administrations: Administration[] = [];
  const immunizations: Immunization[] = [];
  const appointments: Appointment[] = [];
  const inbox: InboxItem[] = [];
  const beds: Bed[] = [];
  const specimens: Specimen[] = [];
  const imaging: ImagingStudy[] = [];
  const pharmacy: PharmacyVerification[] = [];
  const carePlan: CarePlanItem[] = [];
  const audit: AuditEvent[] = [];
  const portalMessages: PortalMessage[] = [];
  const documents: ClinicalDocument[] = [];
  const history: HistoryItem[] = [];

  // Beds
  for (let r = 301; r <= 310; r++) for (const b of ["A", "B"]) beds.push({ id: `bed-3N-${r}${b}`, unit: "3 North", room: String(r), bed: b, status: "available" });
  for (let r = 401; r <= 410; r++) beds.push({ id: `bed-ICU-${r}`, unit: "4 ICU", room: String(r), bed: "1", status: "available" });
  for (let r = 1; r <= 12; r++) beds.push({ id: `bed-ED-${r}`, unit: "Emergency", room: `Bay ${r}`, bed: "1", status: "available" });
  for (let r = 501; r <= 506; r++) beds.push({ id: `bed-5S-${r}`, unit: "5 South", room: String(r), bed: "1", status: r % 3 === 0 ? "cleaning" : "available" });

  const plan: { arch: Archetype; count: number }[] = [
    { arch: A[0]!, count: 2 }, { arch: A[1]!, count: 2 }, { arch: A[2]!, count: 2 }, { arch: A[3]!, count: 1 },
    { arch: A[4]!, count: 2 }, { arch: A[5]!, count: 2 }, { arch: A[6]!, count: 2 }, { arch: A[7]!, count: 1 },
    { arch: A[8]!, count: 3 }, { arch: A[9]!, count: 3 },
    { arch: A[10]!, count: 2 }, { arch: A[11]!, count: 1 }, { arch: A[12]!, count: 1 }, { arch: A[13]!, count: 1 }, { arch: A[14]!, count: 1 }, { arch: A[15]!, count: 2 },
    { arch: A[16]!, count: 3 }, { arch: A[17]!, count: 4 }, { arch: A[18]!, count: 3 }, { arch: A[19]!, count: 2 }, { arch: A[20]!, count: 2 }, { arch: A[21]!, count: 2 }, { arch: A[22]!, count: 2 }, { arch: A[23]!, count: 2 },
  ];

  let bed3N = 0, bedICU = 0, bedED = 0;
  const med3N = beds.filter((b) => b.unit === "3 North");
  const medICU = beds.filter((b) => b.unit === "4 ICU");
  const medED = beds.filter((b) => b.unit === "Emergency");
  let apptSlotMarin = 0, apptSlotHaddad = 0;
  let pIndex = 0;

  for (const { arch, count } of plan) {
    for (let i = 0; i < count; i++) {
      pIndex++;
      const sex = chance(0.5) ? "F" : "M";
      const first = pIndex === 48 ? "Jordan" : sex === "F" ? pick(FIRST_F) : pick(FIRST_M);
      const last = pIndex === 48 ? "Ellis" : pick(LAST);
      const age = rint(arch.ageRange[0], arch.ageRange[1]);
      const dob = new Date(now.getFullYear() - age, rint(0, 11), rint(1, 28)).toISOString().slice(0, 10);
      const heightCm = sex === "F" ? rint(150, 172) : rint(162, 188);
      const bmiTarget = arch.key === "out-dm" ? rnd(29, 38) : rnd(20, 31);
      const weightKg = age < 14 ? rint(14, 45) : round(bmiTarget * (heightCm / 100) ** 2, 1);
      const pid = pIndex === 48 ? "pt-jordan" : `pt-${String(pIndex).padStart(3, "0")}`;
      const p: Patient = {
        id: pid,
        mrn: String(800000 + pIndex * 37 + 11),
        firstName: first, lastName: last, dob, sex,
        phone: `(555) ${rint(200, 999)}-${rint(1000, 9999)}`,
        email: `${first.toLowerCase()}.${last.toLowerCase()}@example.org`,
        address: `${rint(10, 9800)} ${pick(STREETS)}`,
        language: pick(LANGS),
        pcpId: pick(["u-phys3", "u-phys3", "u-phys1", "u-phys4"]),
        insurance: pick(INSURERS), memberId: `MB${rint(100000, 999999)}`,
        codeStatus: age > 80 && chance(0.4) ? "DNR" : "Full Code",
        isolation: arch.isolation,
        flags: [...(arch.flags ?? [])],
        hue: rint(0, 360),
        bloodType: pick(["O+", "O+", "A+", "B+", "AB+", "O-", "A-"]),
        heightCm, weightKg,
        createdAt: addDays(now, -rint(200, 3000)),
        archetype: arch.key,
      };
      if (pIndex === 48) { p.archetype = "out-dm"; }
      patients.push(p);

      // allergies
      const nAll = chance(0.45) ? rint(1, 2) : 0;
      const used = new Set<string>();
      for (let k = 0; k < nAll; k++) {
        const al = pick(ALLERGY_POOL);
        if (used.has(al.substance)) continue;
        used.add(al.substance);
        allergies.push({ ...al, id: id("al"), patientId: pid, noted: addDays(now, -rint(30, 2000)) });
      }
      // Guarantee teaching cases: first CHF patient has penicillin allergy + warfarin (CDS demo)
      if (pIndex === 1) {
        allergies.length = allergies.filter((a) => a.patientId !== pid).length;
        allergies.push({ ...ALLERGY_POOL[1]!, id: id("al"), patientId: pid, noted: addDays(now, -900) });
        allergies.push({ ...ALLERGY_POOL[3]!, id: id("al"), patientId: pid, noted: addDays(now, -400) });
      }

      // problems
      for (const pr of arch.problems) {
        problems.push({ id: id("pr"), patientId: pid, code: pr.code, display: pr.display, status: pr.status, priority: pr.priority, onset: addDays(now, -(pr.status === "chronic" ? rint(365, 4000) : rint(0, 6))), noted: addDays(now, -rint(0, 6)), notedBy: "u-phys1" });
      }
      // history
      history.push({ id: id("hx"), patientId: pid, category: "social", item: "Tobacco", detail: pick(["Never smoker", "Former smoker, quit 2015", "Current every day smoker, 1 ppd", "Never smoker"]) });
      history.push({ id: id("hx"), patientId: pid, category: "social", item: "Alcohol", detail: pick(["None", "Social, 1–2 drinks/week", "None", "Former heavy use"]) });
      history.push({ id: id("hx"), patientId: pid, category: "family", item: pick(["Coronary artery disease", "Type 2 diabetes", "Breast cancer", "Hypertension", "Colon cancer"]), detail: pick(["Mother", "Father", "Sibling", "Maternal grandmother"]) });
      if (chance(0.5)) history.push({ id: id("hx"), patientId: pid, category: "surgical", item: pick(["Appendectomy", "Cholecystectomy", "Cesarean section", "Knee arthroscopy", "Tonsillectomy", "Hernia repair"]), detail: "No complications", date: addDays(now, -rint(400, 9000)).slice(0, 10) });
      for (const pr of arch.problems.filter((x) => x.status === "chronic")) history.push({ id: id("hx"), patientId: pid, category: "medical", item: pr.display, detail: `ICD-10 ${pr.code}` });

      // immunizations
      if (age >= 18) immunizations.push({ id: id("im"), patientId: pid, vaccine: "Influenza, seasonal", cvx: "150", date: addDays(now, -rint(20, 300)).slice(0, 10), lot: `FLU${rint(1000, 9999)}`, site: "Left deltoid", doseNumber: 1 });
      immunizations.push({ id: id("im"), patientId: pid, vaccine: "COVID-19 mRNA", cvx: "308", date: addDays(now, -rint(100, 700)).slice(0, 10), lot: `CV${rint(1000, 9999)}`, site: "Left deltoid", doseNumber: rint(2, 4) });
      if (chance(0.7)) immunizations.push({ id: id("im"), patientId: pid, vaccine: "Tdap", cvx: "115", date: addDays(now, -rint(400, 3000)).slice(0, 10), lot: `TD${rint(1000, 9999)}`, site: "Right deltoid", doseNumber: 1 });
      if (age >= 65) immunizations.push({ id: id("im"), patientId: pid, vaccine: "Pneumococcal conjugate (PCV20)", cvx: "216", date: addDays(now, -rint(100, 1500)).slice(0, 10), lot: `PC${rint(1000, 9999)}`, site: "Left deltoid", doseNumber: 1 });

      // home meds
      for (const cid of arch.homeMeds) {
        const c = CATALOG_BY_ID[cid]!;
        medications.push({ id: id("md"), patientId: pid, name: c.display, generic: c.generic!, dose: c.defaultDose!, route: c.route!, frequency: c.frequency!, indication: arch.problems[0]?.display ?? "Maintenance", status: "active", start: addDays(now, -rint(60, 1500)), prescriberId: p.pcpId!, isInpatient: false, schedule: c.schedule ?? [] });
      }

      // settings & encounter
      const attending = arch.setting === "icu" ? "u-phys2" : arch.setting === "ed" ? "u-ed1" : arch.key === "out-afib" || arch.key === "out-htn" ? "u-phys4" : arch.setting === "outpatient" ? "u-phys3" : pick(["u-phys1", "u-phys1", "u-phys2"]);
      if (arch.setting === "inpatient" || arch.setting === "icu") {
        const bedList = arch.setting === "icu" ? medICU : med3N;
        const bed = bedList[arch.setting === "icu" ? bedICU++ : bed3N++]!;
        bed.status = "occupied"; bed.patientId = pid; bed.isolation = arch.isolation;
        const losDays = arch.setting === "icu" ? rint(1, 5) : rint(1, 6);
        const start = addMinutes(now, -(losDays * 1440 + rint(0, 600)));
        const enc: Encounter = { id: id("enc"), patientId: pid, type: "inpatient", status: "admitted", start, department: arch.setting === "icu" ? "Critical Care" : "Medicine", unit: bed.unit, room: bed.room, bed: bed.bed, attendingId: attending, reason: arch.reason, diagnosisCodes: arch.problems.map((x) => x.code) };
        encounters.push(enc);
        // inpatient meds
        for (const cid of arch.inptMeds) {
          const c = CATALOG_BY_ID[cid]!;
          const m: Medication = { id: id("md"), patientId: pid, encounterId: enc.id, name: c.display, generic: c.generic!, dose: c.defaultDose!, route: c.route!, frequency: c.frequency!, indication: arch.reason, status: "active", start: addMinutes(start, rint(30, 240)), prescriberId: attending, isInpatient: true, schedule: c.schedule ?? [], prn: (c.schedule ?? []).length === 0 && !c.frequency!.includes("continuous") && !c.frequency!.includes("once") };
          medications.push(m);
          // administrations for today and yesterday
          for (const dayOff of [-1, 0]) {
            for (const hhmm of m.schedule) {
              const [hh, mm] = hhmm.split(":").map(Number);
              const sched = new Date(today0); sched.setDate(sched.getDate() + dayOff); sched.setHours(hh!, mm!, 0, 0);
              if (sched.getTime() < new Date(start).getTime()) continue;
              const isPast = sched.getTime() < now.getTime() - 30 * 60000;
              const status: Administration["status"] = !isPast ? "due" : chance(0.9) ? "given" : chance(0.5) ? "held" : "missed";
              administrations.push({ id: id("adm"), patientId: pid, medicationId: m.id, scheduled: sched.toISOString(), actionTime: status === "due" ? undefined : addMinutes(sched, rint(-10, 25)), status, nurseId: status === "due" ? undefined : bed.unit === "4 ICU" ? "u-nurse2" : "u-nurse1", barcodeVerified: status === "given", note: status === "held" ? "Held: SBP 88, notified provider" : undefined });
            }
          }
          // standing orders behind the meds
          orders.push({ id: id("ord"), patientId: pid, encounterId: enc.id, catalogId: cid, category: "medication", display: c.display, priority: "routine", status: "in-progress", orderedBy: attending, orderedAt: m.start, signedAt: m.start, indication: arch.reason, details: `${c.defaultDose} ${c.route} ${c.frequency}`, frequency: c.frequency, overrides: [], localState: "local-committed" });
        }
        // nursing orders
        for (const cid of ["nur-vitals-q4", "nur-fall", arch.setting === "icu" ? "nur-tele" : "nur-ambulate", "diet-" + (arch.key.includes("dm") || arch.key.includes("sepsis") ? "diabetic" : arch.key.includes("chf") ? "cardiac" : "regular")]) {
          const c = CATALOG_BY_ID[cid]!;
          orders.push({ id: id("ord"), patientId: pid, encounterId: enc.id, catalogId: cid, category: c.category, display: c.display, priority: "routine", status: "in-progress", orderedBy: attending, orderedAt: addMinutes(start, 60), signedAt: addMinutes(start, 60), indication: arch.reason, overrides: [], localState: "local-committed" });
        }
        // vitals q4h for last 48h or since admission
        const vStart = Math.max(new Date(start).getTime(), now.getTime() - 48 * 3600e3);
        for (let t = vStart; t <= now.getTime() - 20 * 60000; t += 4 * 3600e3) {
          const prog = (t - new Date(start).getTime()) / (now.getTime() - new Date(start).getTime());
          const v = vitalsFor(arch, Math.min(1, Math.max(0, prog)));
          vitals.push({ id: id("vt"), patientId: pid, encounterId: enc.id, time: new Date(t).toISOString(), ...v, dbp: Math.round(v.sbp * rnd(0.58, 0.68)), pain: chance(0.4) ? rint(0, 7) : 0, source: chance(0.7) ? "device" : "manual", authorId: bed.unit === "4 ICU" ? "u-nurse2" : "u-nurse1" });
        }
        // labs: daily AM draw since admission
        for (let d = 0; d <= losDays; d++) {
          const coll = new Date(today0); coll.setDate(coll.getDate() - (losDays - d)); coll.setHours(5, rint(10, 50), 0, 0);
          if (coll.getTime() < new Date(start).getTime()) coll.setTime(new Date(start).getTime() + 40 * 60000);
          if (coll.getTime() > now.getTime()) continue;
          const panelsToday = d === 0 ? arch.panels : ["CBC", "BMP", ...(arch.panels.includes("Lactate") && d < 2 ? ["Lactate"] : []), ...(arch.panels.includes("PT/INR") ? ["PT/INR"] : [])];
          const progress = losDays === 0 ? 1 : d / losDays;
          for (const panel of panelsToday) {
            const tests = LAB_PANELS[panel] ?? [];
            const ordId = id("ord");
            const resulted = !(d === losDays && coll.getHours() >= 5 && now.getHours() < 8 && chance(0.5));
            orders.push({ id: ordId, patientId: pid, encounterId: enc.id, catalogId: "lab-" + panel.toLowerCase().replace(/[^a-z0-9]+/g, "-"), category: "lab", display: panel, priority: "routine", status: resulted ? "resulted" : "collected", orderedBy: attending, orderedAt: addMinutes(coll, -300), signedAt: addMinutes(coll, -300), indication: arch.reason, overrides: [], localState: "local-committed" });
            if (tests.length === 0) {
              if (panel.includes("Culture")) labs.push({ id: id("lab"), patientId: pid, orderId: ordId, panel, code: "600-7", name: "Blood culture", value: d < 1 ? "No growth at 24h" : chance(0.5) ? "No growth at 48h" : "Gram-negative rods — E. coli, identification final", unit: "", flag: null, collected: coll.toISOString(), reported: addMinutes(coll, 1500), status: d < 1 ? "prelim" : "final", acknowledged: d < losDays, specimen: "Blood" });
              if (panel.includes("Type")) labs.push({ id: id("lab"), patientId: pid, orderId: ordId, panel, code: "882-1", name: "ABO/Rh", value: p.bloodType!, unit: "", flag: null, collected: coll.toISOString(), reported: addMinutes(coll, 90), status: "final", acknowledged: true, specimen: "Blood" });
              continue;
            }
            if (!resulted) { specimens.push({ id: id("sp"), orderId: ordId, patientId: pid, tests: panel, status: chance(0.5) ? "in-process" : "received", collectedAt: coll.toISOString(), receivedAt: addMinutes(coll, 25), barcode: `SP${rint(1000000, 9999999)}`, priority: "routine", container: CATALOG_BY_ID["lab-" + panel.toLowerCase().replace(/[^a-z0-9]+/g, "-")]?.container ?? "Gold top SST" }); continue; }
            for (const tdef of tests) {
              const ov = arch.labOverride[tdef.name];
              let value: number;
              if (ov) {
                // abnormal early, trending toward normal with progress
                const sick = rnd(ov[0], ov[1]);
                const normal = rnd(tdef.typical[0], tdef.typical[1]);
                value = sick + (normal - sick) * progress * 0.7;
              } else value = rnd(tdef.typical[0], tdef.typical[1]);
              value = round(value, tdef.decimals ?? 1);
              labs.push({ id: id("lab"), patientId: pid, orderId: ordId, panel, code: tdef.code, name: tdef.name, value, unit: tdef.unit, refLow: tdef.low, refHigh: tdef.high, flag: flagFor(value, tdef.low, tdef.high), collected: coll.toISOString(), reported: addMinutes(coll, rint(35, 120)), status: "final", acknowledged: d < losDays, specimen: panel === "Urinalysis" ? "Urine" : "Blood" });
            }
          }
        }
        // notes
        const hpBody = `CHIEF COMPLAINT\n${arch.reason}\n\nHISTORY OF PRESENT ILLNESS\n${first} ${last} is a ${age}-year-old ${sex === "F" ? "woman" : "man"} with ${arch.problems.filter((x) => x.status === "chronic").map((x) => x.display.toLowerCase()).join(", ") || "no significant past history"} presenting with ${arch.reason.toLowerCase()}. Symptoms began ${rint(1, 4)} days before admission and progressed despite home management.\n\nPAST MEDICAL HISTORY\n${arch.problems.map((x) => "- " + x.display).join("\n")}\n\nMEDICATIONS (HOME)\n${arch.homeMeds.map((c) => "- " + CATALOG_BY_ID[c]!.display).join("\n") || "- None"}\n\nALLERGIES\n${allergies.filter((a) => a.patientId === pid).map((a) => "- " + a.substance + " (" + a.reaction + ")").join("\n") || "- No known allergies"}\n\nPHYSICAL EXAM\nVitals reviewed. General: ${arch.setting === "icu" ? "critically ill" : "ill-appearing but non-toxic"}. Exam otherwise documented in flowsheet.\n\nASSESSMENT AND PLAN\n${arch.problems.map((x, i) => `${i + 1}. ${x.display} — ${x.status === "active" ? "admit, treat per pathway, reassess daily" : "continue home regimen"}`).join("\n")}\n\nCode status: ${p.codeStatus}. DVT prophylaxis ordered. Disposition: ${arch.setting === "icu" ? "ICU" : "medical floor"}.`;
        notes.push({ id: id("nt"), patientId: pid, encounterId: enc.id, type: "H&P", title: "History and Physical", authorId: attending, created: addMinutes(start, 90), updated: addMinutes(start, 150), signedAt: addMinutes(start, 150), status: "signed", body: hpBody, version: 1, cosignRequired: false, addenda: [], localState: "local-committed" });
        for (let d = 1; d <= losDays; d++) {
          const t = new Date(today0); t.setDate(t.getDate() - (losDays - d)); t.setHours(7, rint(5, 55), 0, 0);
          if (t.getTime() > now.getTime()) continue;
          const isToday = d === losDays;
          const author = isToday ? "u-res1" : attending;
          const body = `SUBJECTIVE\nPatient reports ${pick(["feeling improved", "less shortness of breath", "pain controlled with current regimen", "poor sleep overnight", "no new complaints"])}. Tolerating diet.\n\nOBJECTIVE\nVitals: see flowsheet (last 24h reviewed). Labs reviewed this morning.\nExam: ${pick(["lungs with scattered crackles at bases", "regular rate and rhythm, no edema", "abdomen soft, non-tender", "alert and oriented x3"])}.\n\nASSESSMENT / PLAN\n${arch.problems.map((x, i) => `${i + 1}. ${x.display}: ${pick(["improving, continue current therapy", "stable, continue monitoring", "trend labs, adjust as needed"])}`).join("\n")}\n\nHospital day ${d}. ${isToday ? "Anticipate discharge in 1–2 days pending clinical progress." : ""}`;
          notes.push({ id: id("nt"), patientId: pid, encounterId: enc.id, type: "Progress Note", title: `Progress Note — Hospital Day ${d}`, authorId: author, created: t.toISOString(), updated: addMinutes(t, 20), signedAt: isToday ? undefined : addMinutes(t, 25), status: isToday ? (chance(0.5) ? "draft" : "pending-cosign") : "signed", body, version: 1, cosignRequired: author === "u-res1", addenda: [], localState: isToday ? "local-draft" : "local-committed" });
        }
        // care plan
        carePlan.push({ id: id("cp"), patientId: pid, goal: pick(["Maintain SpO2 ≥ 92% on room air", "Ambulate 100 m three times daily", "Pain ≤ 3/10 with oral regimen", "Euvolemic with weight within 1 kg of dry weight", "Afebrile for 48 hours"]), intervention: pick(["Incentive spirometry hourly while awake", "PT evaluation and daily sessions", "Scheduled acetaminophen, PRN oxycodone", "Daily weights and strict I&O", "Antibiotics per ID recommendation"]), ownerRole: pick(["Nurse", "Physician", "Physical Therapy"]), due: addDays(now, rint(0, 2)), status: "open" });
        carePlan.push({ id: id("cp"), patientId: pid, goal: "Discharge plan confirmed with patient and family", intervention: "Case management to arrange follow-up within 7 days", ownerRole: "Case Manager", due: addDays(now, 1), status: chance(0.3) ? "met" : "open" });
        // imaging for some
        if (chance(0.6)) {
          const ic = pick(["img-cxr", "img-cxr", "img-ct-head", "img-echo", "img-us-dvt"]);
          const c = CATALOG_BY_ID[ic]!;
          const ordId = id("ord");
          const st: ImagingStudy["status"] = pick(["final", "final", "acquired", "scheduled"]);
          orders.push({ id: ordId, patientId: pid, encounterId: enc.id, catalogId: ic, category: "imaging", display: c.display, priority: "routine", status: st === "final" ? "resulted" : "in-progress", orderedBy: attending, orderedAt: addMinutes(start, 200), signedAt: addMinutes(start, 200), indication: arch.reason, overrides: [], localState: "local-committed" });
          imaging.push({ id: id("im"), orderId: ordId, patientId: pid, modality: c.modality!, description: c.display, status: st, accession: `ACC${rint(100000, 999999)}`, scheduledAt: st === "scheduled" ? addMinutes(now, rint(30, 300)) : addMinutes(start, 300), reportText: st === "final" ? `FINDINGS: ${pick(["Bibasilar atelectasis without focal consolidation.", "Mild cardiomegaly with pulmonary vascular congestion and small bilateral effusions.", "No acute intracranial hemorrhage or mass effect.", "Left ventricular ejection fraction estimated 30–35% with global hypokinesis.", "No evidence of deep venous thrombosis in the right lower extremity."])}\n\nIMPRESSION: ${pick(["No acute cardiopulmonary process.", "Findings consistent with pulmonary edema.", "No acute abnormality.", "Reduced systolic function; clinical correlation recommended."])}` : undefined, radiologistId: st === "final" ? "u-rad1" : undefined, criticalFinding: false, priority: "routine" });
        }
        // documents
        if (chance(0.5)) documents.push({ id: id("doc"), patientId: pid, title: pick(["Outside hospital discharge summary", "Cardiology clinic letter", "Advance directive", "Outside ECG", "Medication list from pharmacy"]), type: "Scanned", date: addDays(now, -rint(5, 400)).slice(0, 10), source: pick(["Riverside Medical Center", "Community Clinic", "Patient-provided"]), pages: rint(1, 6), summary: "Scanned external record attached to chart by Health Information Management." });
      } else if (arch.setting === "ed") {
        const arrivalMin = rint(20, 320);
        const start = addMinutes(now, -arrivalMin);
        const hasBed = bedED < 9;
        const bed = hasBed ? medED[bedED++] : undefined;
        if (bed) { bed.status = "occupied"; bed.patientId = pid; }
        const status: Encounter["status"] = !hasBed ? "triaged" : arrivalMin > 60 ? "in-progress" : "triaged";
        const enc: Encounter = { id: id("enc"), patientId: pid, type: "ed", status, start, department: "Emergency", unit: "Emergency", room: bed?.room, bed: bed?.bed, attendingId: "u-ed1", reason: arch.reason, acuity: arch.acuity, diagnosisCodes: arch.problems.map((x) => x.code) };
        encounters.push(enc);
        const v = vitalsFor(arch, 0);
        vitals.push({ id: id("vt"), patientId: pid, encounterId: enc.id, time: addMinutes(start, 8), ...v, dbp: Math.round(v.sbp * 0.62), pain: rint(2, 9), source: "manual", authorId: "u-nurse3" });
        if (arrivalMin > 120) { const v2 = vitalsFor(arch, 0.5); vitals.push({ id: id("vt"), patientId: pid, encounterId: enc.id, time: addMinutes(start, 120), ...v2, dbp: Math.round(v2.sbp * 0.62), pain: rint(1, 6), source: "device", authorId: "u-nurse3" }); }
        for (const panel of arch.panels) {
          const tests = LAB_PANELS[panel] ?? [];
          const ordId = id("ord");
          const coll = addMinutes(start, 25);
          const resulted = arrivalMin > 90 && !panel.includes("Culture");
          orders.push({ id: ordId, patientId: pid, encounterId: enc.id, catalogId: "lab-" + panel.toLowerCase().replace(/[^a-z0-9]+/g, "-"), category: "lab", display: panel, priority: "stat", status: resulted ? "resulted" : arrivalMin > 30 ? "collected" : "signed", orderedBy: "u-ed1", orderedAt: addMinutes(start, 15), signedAt: addMinutes(start, 15), indication: arch.reason, overrides: [], localState: "local-committed" });
          if (!resulted) { specimens.push({ id: id("sp"), orderId: ordId, patientId: pid, tests: panel, status: arrivalMin > 30 ? (arrivalMin > 60 ? "in-process" : "collected") : "ordered", collectedAt: arrivalMin > 30 ? coll : undefined, barcode: `SP${rint(1000000, 9999999)}`, priority: "stat", container: CATALOG_BY_ID["lab-" + panel.toLowerCase().replace(/[^a-z0-9]+/g, "-")]?.container ?? "Gold top SST" }); continue; }
          for (const tdef of tests) {
            const ov = arch.labOverride[tdef.name];
            let value = ov ? rnd(ov[0], ov[1]) : rnd(tdef.typical[0], tdef.typical[1]);
            if (tdef.name.startsWith("Troponin")) value = i === 0 ? rnd(85, 420) : rnd(2, 11);
            value = round(value, tdef.decimals ?? 1);
            labs.push({ id: id("lab"), patientId: pid, orderId: ordId, panel, code: tdef.code, name: tdef.name, value, unit: tdef.unit, refLow: tdef.low, refHigh: tdef.high, flag: flagFor(value, tdef.low, tdef.high), collected: coll, reported: addMinutes(coll, rint(30, 70)), status: "final", acknowledged: false, specimen: "Blood" });
          }
        }
        for (const cid of arch.inptMeds) {
          const c = CATALOG_BY_ID[cid]!;
          const t = addMinutes(start, rint(20, 60));
          const ordId = id("ord");
          orders.push({ id: ordId, patientId: pid, encounterId: enc.id, catalogId: cid, category: "medication", display: c.display, priority: "stat", status: "in-progress", orderedBy: "u-ed1", orderedAt: t, signedAt: t, indication: arch.reason, details: `${c.defaultDose} ${c.route} ${c.frequency}`, overrides: [], localState: "local-committed" });
          const m: Medication = { id: id("md"), patientId: pid, encounterId: enc.id, name: c.display, generic: c.generic!, dose: c.defaultDose!, route: c.route!, frequency: c.frequency!, indication: arch.reason, status: "active", start: t, prescriberId: "u-ed1", isInpatient: true, schedule: [], prn: true };
          medications.push(m);
          administrations.push({ id: id("adm"), patientId: pid, medicationId: m.id, scheduled: addMinutes(t, 10), actionTime: arrivalMin > 60 ? addMinutes(t, 18) : undefined, status: arrivalMin > 60 ? "given" : "due", nurseId: arrivalMin > 60 ? "u-nurse3" : undefined, barcodeVerified: arrivalMin > 60 });
          if (arrivalMin < 90) pharmacy.push({ id: id("pv"), orderId: ordId, patientId: pid, medName: c.display, details: `${c.defaultDose} ${c.route} ${c.frequency}`, status: "pending", created: t });
        }
        if (arch.key === "ed-chest" || arch.key === "ed-fracture" || arch.key === "ed-abd") {
          const ic = arch.key === "ed-chest" ? "img-cxr" : arch.key === "ed-fracture" ? "img-xr-hip" : "img-ct-abd";
          const c = CATALOG_BY_ID[ic]!;
          const ordId = id("ord");
          const st: ImagingStudy["status"] = arrivalMin > 150 ? "final" : arrivalMin > 70 ? "acquired" : "ordered";
          orders.push({ id: ordId, patientId: pid, encounterId: enc.id, catalogId: ic, category: "imaging", display: c.display, priority: "stat", status: st === "final" ? "resulted" : "in-progress", orderedBy: "u-ed1", orderedAt: addMinutes(start, 20), signedAt: addMinutes(start, 20), indication: arch.reason, overrides: [], localState: "local-committed" });
          imaging.push({ id: id("im"), orderId: ordId, patientId: pid, modality: c.modality!, description: c.display, status: st, accession: `ACC${rint(100000, 999999)}`, priority: "stat", reportText: st === "final" ? "FINDINGS: " + (arch.key === "ed-chest" ? "Heart size normal. Lungs clear. No pneumothorax.\n\nIMPRESSION: No acute cardiopulmonary process." : arch.key === "ed-fracture" ? "Displaced distal radius fracture with dorsal angulation.\n\nIMPRESSION: Distal radius fracture; orthopedic consultation recommended." : "Dilated appendix 11 mm with periappendiceal fat stranding.\n\nIMPRESSION: Acute uncomplicated appendicitis.") : undefined, radiologistId: st === "final" ? "u-rad1" : undefined, criticalFinding: st === "final" && arch.key === "ed-abd" });
        }
        notes.push({ id: id("nt"), patientId: pid, encounterId: enc.id, type: "ED Provider Note", title: "ED Provider Note", authorId: "u-ed1", created: addMinutes(start, 30), updated: addMinutes(start, 45), status: "draft", body: `CHIEF COMPLAINT: ${arch.reason}\n\nHPI: ${age}-year-old ${sex === "F" ? "female" : "male"} presenting with ${arch.reason.toLowerCase()}, onset ${rint(1, 12)} hours prior to arrival.\n\nED COURSE: Triage ESI ${arch.acuity}. Workup initiated.\n\nMDM: Differential includes ${pick(["ACS, PE, aortic dissection", "appendicitis, ovarian pathology, UTI", "fracture, sprain", "asthma exacerbation, pneumonia", "sepsis, UTI, pneumonia", "simple laceration"])}.\n\nDISPOSITION: Pending results.`, version: 1, cosignRequired: false, addenda: [], localState: "local-draft" });
      } else {
        // outpatient: previous visit + today's appointment
        const prevStart = addDays(now, -rint(80, 200));
        const prevEnc: Encounter = { id: id("enc"), patientId: pid, type: "outpatient", status: "discharged", start: prevStart, end: addMinutes(prevStart, 25), department: attending === "u-phys4" ? "Cardiology Clinic" : "Family Medicine Clinic", attendingId: attending, reason: arch.reason, diagnosisCodes: arch.problems.map((x) => x.code) };
        encounters.push(prevEnc);
        const v = vitalsFor(arch, 0.5);
        vitals.push({ id: id("vt"), patientId: pid, encounterId: prevEnc.id, time: addMinutes(prevStart, 5), ...v, dbp: Math.round(v.sbp * 0.63), weightKg, pain: 0, source: "manual", authorId: "u-nurse1" });
        for (const panel of arch.panels) {
          const tests = LAB_PANELS[panel] ?? [];
          for (const offs of [-380, -200, -5]) {
            const coll = addDays(now, offs + rint(0, 3));
            const ordId = id("ord");
            orders.push({ id: ordId, patientId: pid, encounterId: prevEnc.id, catalogId: "lab-" + panel.toLowerCase().replace(/[^a-z0-9]+/g, "-"), category: "lab", display: panel, priority: "routine", status: "resulted", orderedBy: attending, orderedAt: addMinutes(coll, -1440), signedAt: addMinutes(coll, -1440), indication: arch.reason, overrides: [], localState: "local-committed" });
            for (const tdef of tests) {
              const ov = arch.labOverride[tdef.name];
              const value = round(ov ? rnd(ov[0], ov[1]) : rnd(tdef.typical[0], tdef.typical[1]), tdef.decimals ?? 1);
              labs.push({ id: id("lab"), patientId: pid, orderId: ordId, panel, code: tdef.code, name: tdef.name, value, unit: tdef.unit, refLow: tdef.low, refHigh: tdef.high, flag: flagFor(value, tdef.low, tdef.high), collected: coll, reported: addMinutes(coll, 240), status: "final", acknowledged: offs !== -5, specimen: panel === "Urinalysis" ? "Urine" : "Blood" });
            }
          }
        }
        notes.push({ id: id("nt"), patientId: pid, encounterId: prevEnc.id, type: "Progress Note", title: "Office Visit Note", authorId: attending, created: prevStart, updated: addMinutes(prevStart, 30), signedAt: addMinutes(prevStart, 30), status: "signed", body: `SUBJECTIVE\n${first} presents for ${arch.reason.toLowerCase()}. ${pick(["Reports good adherence.", "Missed several doses last month.", "No new symptoms.", "Reports occasional dizziness."])}\n\nOBJECTIVE\nBP ${v.sbp}/${Math.round(v.sbp * 0.63)}, HR ${v.hr}, weight ${weightKg} kg.\n\nASSESSMENT / PLAN\n${arch.problems.map((x, i) => `${i + 1}. ${x.display}: continue current regimen; labs today.`).join("\n") || "1. Health maintenance: up to date."}\n\nFollow up in 3 months.`, version: 1, cosignRequired: false, addenda: [], localState: "local-committed" });
        const slotIdx = attending === "u-phys4" ? apptSlotHaddad++ : apptSlotMarin++;
        const slot = new Date(today0); slot.setHours(8 + Math.floor(slotIdx / 2), (slotIdx % 2) * 30, 0, 0);
        if (slot.getHours() >= 12) slot.setHours(slot.getHours() + 1);
        const past = slot.getTime() < now.getTime() - 25 * 60000;
        const near = Math.abs(slot.getTime() - now.getTime()) < 40 * 60000;
        const apptStatus: Appointment["status"] = past ? (chance(0.85) ? "completed" : "no-show") : near ? pick(["checked-in", "roomed", "in-visit"]) : "scheduled";
        appointments.push({ id: id("ap"), patientId: pid, providerId: attending, start: slot.toISOString(), durationMin: arch.key === "out-well" ? 30 : 20, type: arch.key === "out-well" || arch.key === "out-peds" ? "Wellness" : "Follow-up", status: apptStatus, room: apptStatus === "roomed" || apptStatus === "in-visit" ? `Exam ${rint(1, 6)}` : undefined, reason: arch.reason, department: prevEnc.department });
        if (apptStatus !== "scheduled" && apptStatus !== "no-show") {
          encounters.push({ id: id("enc"), patientId: pid, type: "outpatient", status: apptStatus === "completed" ? "discharged" : apptStatus === "checked-in" ? "arrived" : "in-progress", start: slot.toISOString(), end: apptStatus === "completed" ? addMinutes(slot, 22) : undefined, department: prevEnc.department, attendingId: attending, reason: arch.reason, diagnosisCodes: arch.problems.map((x) => x.code) });
        }
        if (chance(0.3)) appointments.push({ id: id("ap"), patientId: pid, providerId: attending, start: addDays(slot, rint(30, 120)), durationMin: 20, type: "Follow-up", status: "scheduled", reason: arch.reason, department: prevEnc.department });
      }
    }
  }

  // Patient portal demo patient (Jordan Ellis) extras
  const jordan = patients.find((p) => p.id === "pt-jordan")!;
  jordan.pcpId = "u-phys3";
  jordan.email = "jordan.ellis@example.org";
  portalMessages.push(
    { id: id("pm"), patientId: jordan.id, fromName: "Jordan Ellis", toName: "Dr. Sofia Marin", subject: "Refill request — metformin", body: "Hi Dr. Marin, I have about 5 days of metformin left. Could you send a refill to my usual pharmacy? Thanks.", time: addDays(now, -2), direction: "to-clinic", read: true },
    { id: id("pm"), patientId: jordan.id, fromName: "Dr. Sofia Marin", toName: "Jordan Ellis", subject: "Re: Refill request — metformin", body: "Refill sent for 90 days. Your A1c is due; I have added the lab order so you can stop by any time before your visit.", time: addDays(now, -1), direction: "to-patient", read: false },
    { id: id("pm"), patientId: jordan.id, fromName: "Magic General Hospital", toName: "Jordan Ellis", subject: "Appointment reminder", body: "You have an appointment today with Dr. Sofia Marin. Use e-check-in to save time at the front desk.", time: addMinutes(now, -300), direction: "to-patient", read: false },
  );

  // In Basket for physicians
  const abnormal = labs.filter((l) => l.flag && !l.acknowledged);
  const seen = new Set<string>();
  for (const l of abnormal) {
    const key = l.orderId ?? l.id;
    if (seen.has(key)) continue;
    seen.add(key);
    const enc = encounters.find((e) => e.patientId === l.patientId && e.status !== "discharged");
    const owner = enc?.attendingId ?? patients.find((p) => p.id === l.patientId)?.pcpId ?? "u-phys1";
    inbox.push({ id: id("ib"), ownerId: owner, type: "result", patientId: l.patientId, subject: `${l.panel} resulted — abnormal`, body: `${l.name} ${l.value} ${l.unit} (${l.flag})`, priority: l.flag === "HH" || l.flag === "LL" ? "high" : "normal", created: l.reported, status: "new", refId: l.orderId });
  }
  for (const n of notes.filter((x) => x.status === "pending-cosign")) {
    const enc = encounters.find((e) => e.id === n.encounterId);
    inbox.push({ id: id("ib"), ownerId: enc?.attendingId ?? "u-phys1", type: "cosign", patientId: n.patientId, subject: `Cosign: ${n.title}`, body: `Resident note by Dr. Omar Siddiqui awaiting attestation.`, priority: "normal", created: n.updated, status: "new", refId: n.id, fromName: "Omar Siddiqui, MD" });
  }
  inbox.push(
    { id: id("ib"), ownerId: "u-phys3", type: "message", patientId: jordan.id, subject: "Refill request — metformin", body: "Patient requests metformin refill via portal.", priority: "normal", created: addDays(now, -2), status: "read", fromName: "Jordan Ellis" },
    { id: id("ib"), ownerId: "u-phys1", type: "refill", patientId: patients[16]?.id, subject: "Refill: lisinopril 10 mg", body: "Pharmacy requests authorization for 90-day refill. Last BMP 4 months ago.", priority: "normal", created: addMinutes(now, -400), status: "new", fromName: "Riverside Pharmacy" },
    { id: id("ib"), ownerId: "u-phys1", type: "referral", patientId: patients[2]?.id, subject: "Referral: Nephrology", body: "Please review and accept referral for CKD stage 3 with declining eGFR.", priority: "normal", created: addMinutes(now, -900), status: "new", fromName: "Dr. Sofia Marin" },
    { id: id("ib"), ownerId: "u-phys1", type: "deficiency", patientId: patients[5]?.id, subject: "Chart deficiency: discharge summary unsigned", body: "Health Information Management: discharge summary from prior encounter is 7 days overdue.", priority: "high", created: addDays(now, -1), status: "new", fromName: "HIM" },
    { id: id("ib"), ownerId: "u-phys1", type: "reminder", subject: "Quality: 3 patients overdue for diabetic eye exam", body: "Panel management reminder from the diabetes registry.", priority: "low", created: addDays(now, -3), status: "new", fromName: "Population Health" },
    { id: id("ib"), ownerId: "u-phys1", type: "message", patientId: patients[0]?.id, subject: "Family question about discharge timing", body: "Daughter is asking whether discharge is likely tomorrow so she can arrange transport.", priority: "normal", created: addMinutes(now, -70), status: "new", fromName: "Grace Mwangi, RN" },
    { id: id("ib"), ownerId: "u-ed1", type: "result", patientId: patients.find((p) => p.archetype === "ed-chest")?.id, subject: "Critical: Troponin I elevated", body: "High-sensitivity troponin above 99th percentile. Critical value called to ED at bedside.", priority: "high", created: addMinutes(now, -40), status: "new", fromName: "Laboratory" },
  );

  // pharmacy queue: fresh medication orders placed in the last two hours (not yet verified, no doses given)
  const freshPool = ["med-ondansetron", "med-acetaminophen", "med-pantoprazole", "med-enoxaparin", "med-ceftriaxone", "med-metoprolol", "med-furosemide", "med-insulin-lispro"];
  const inptEncs = encounters.filter((e) => e.type === "inpatient" && e.status === "admitted");
  for (let k = 0; k < 7 && k < inptEncs.length; k++) {
    const enc = inptEncs[(k * 3) % inptEncs.length]!;
    const activeGenerics = new Set(medications.filter((m) => m.patientId === enc.patientId && m.status === "active").map((m) => m.generic));
    const cid = freshPool.find((c) => !activeGenerics.has(CATALOG_BY_ID[c]!.generic!));
    if (!cid) continue;
    const c = CATALOG_BY_ID[cid]!;
    const t = addMinutes(now, -rint(5, 120));
    const ordId = id("ord");
    orders.push({ id: ordId, patientId: enc.patientId, encounterId: enc.id, catalogId: cid, category: "medication", display: c.display, priority: chance(0.3) ? "urgent" : "routine", status: "in-progress", orderedBy: enc.attendingId, orderedAt: t, signedAt: t, indication: enc.reason, details: `${c.defaultDose} ${c.route} ${c.frequency}`, frequency: c.frequency, overrides: [], localState: "local-committed" });
    const m: Medication = { id: id("md"), patientId: enc.patientId, encounterId: enc.id, name: c.display, generic: c.generic!, dose: c.defaultDose!, route: c.route!, frequency: c.frequency!, indication: enc.reason, status: "active", start: t, prescriberId: enc.attendingId, isInpatient: true, schedule: c.schedule ?? [], prn: (c.schedule ?? []).length === 0 };
    medications.push(m);
    const nextSlots = m.schedule.length === 0 ? [addMinutes(t, 15)] : m.schedule.map((hhmm) => { const [hh, mm] = hhmm.split(":").map(Number); const d = new Date(today0); d.setHours(hh!, mm!, 0, 0); if (d.getTime() < now.getTime()) d.setDate(d.getDate() + 1); return d.toISOString(); });
    administrations.push(...nextSlots.map((sc) => ({ id: id("adm"), patientId: enc.patientId, medicationId: m.id, scheduled: sc, status: "due" as const, barcodeVerified: false })));
    pharmacy.push({ id: id("pv"), orderId: ordId, patientId: enc.patientId, medName: c.display, details: `${c.defaultDose} ${c.route} ${c.frequency}`, status: "pending", created: t });
  }

  // audit seed
  const actionsByRole: Record<string, string[]> = {
    physician: ["LOGIN", "CHART_VIEW", "CHART_VIEW", "NOTE_SIGN", "ORDER_SIGN", "RESULT_VIEW"], ed: ["LOGIN", "CHART_VIEW", "ORDER_SIGN", "NOTE_SIGN"],
    nurse: ["LOGIN", "CHART_VIEW", "MAR_ADMINISTER", "MAR_ADMINISTER", "VITALS_DOCUMENT"], pharmacist: ["LOGIN", "CHART_VIEW", "PHARM_VERIFIED"],
    lab: ["LOGIN", "SPECIMEN_COLLECTED", "RESULT_RELEASE"], radiology: ["LOGIN", "IMAGING_FINAL", "CHART_VIEW"], registrar: ["LOGIN", "PATIENT_REGISTER", "APPT_CHECKED_IN"], admin: ["LOGIN", "CONFIG_CHANGE"],
  };
  for (let k = 0; k < 40; k++) {
    const u = pick(USERS.filter((x) => x.role !== "patient"));
    const p = pick(patients);
    const act = pick(actionsByRole[u.role] ?? ["LOGIN"]);
    audit.push({ id: id("au"), time: addMinutes(now, -rint(5, 1400)), userId: u.id, userName: u.name, role: u.role, action: act, patientId: act === "LOGIN" ? undefined : p.id, resource: act === "LOGIN" ? "session" : act.split("_")[0]!.toLowerCase(), detail: act === "LOGIN" ? "Workstation sign-in" : `${act.replace(/_/g, " ").toLowerCase()} by ${u.role}`, device: "WS-" + rint(100, 999), mode: "online" });
  }
  audit.sort((a, b) => a.time.localeCompare(b.time));

  onProgress?.("Writing to local database…");
  await db.transaction("rw", db.tables, async () => {
    await Promise.all(db.tables.map((t) => t.clear()));
    await db.users.bulkAdd(USERS);
    await db.patients.bulkAdd(patients);
    await db.encounters.bulkAdd(encounters);
    await db.problems.bulkAdd(problems);
    await db.allergies.bulkAdd(allergies);
    await db.medications.bulkAdd(medications);
    await db.orders.bulkAdd(orders);
    await db.labs.bulkAdd(labs);
    await db.vitals.bulkAdd(vitals);
    await db.notes.bulkAdd(notes);
    await db.administrations.bulkAdd(administrations);
    await db.immunizations.bulkAdd(immunizations);
    await db.appointments.bulkAdd(appointments);
    await db.inbox.bulkAdd(inbox);
    await db.beds.bulkAdd(beds);
    await db.specimens.bulkAdd(specimens);
    await db.imaging.bulkAdd(imaging);
    await db.pharmacy.bulkAdd(pharmacy);
    await db.carePlan.bulkAdd(carePlan);
    await db.audit.bulkAdd(audit);
    await db.portalMessages.bulkAdd(portalMessages);
    await db.documents.bulkAdd(documents);
    await db.history.bulkAdd(history);
    await db.settings.bulkPut([
      { key: "seeded", value: "1" },
      { key: "seededAt", value: now.toISOString() },
      { key: "facility", value: FACILITY.name },
      { key: "authorityMode", value: "local" },
    ]);
  });
  onProgress?.("Ready.");
  return { patients: patients.length, encounters: encounters.length, labs: labs.length, orders: orders.length };
}
