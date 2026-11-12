import type { OrderCategory } from "../db/types";

export interface CatalogEntry {
  id: string;
  category: OrderCategory;
  display: string;
  generic?: string;
  classKey?: string; // used for allergy/interaction checking
  defaultDose?: string;
  route?: string;
  frequency?: string;
  schedule?: string[];
  details?: string;
  loinc?: string;
  modality?: string;
  container?: string;
  tests?: LabTestDef[];
  keywords?: string;
}

export interface LabTestDef {
  code: string;
  name: string;
  unit: string;
  low?: number;
  high?: number;
  typical: [number, number];
  decimals?: number;
}

const cbc: LabTestDef[] = [
  { code: "6690-2", name: "WBC", unit: "10*3/uL", low: 4.0, high: 11.0, typical: [4.5, 10.5], decimals: 1 },
  { code: "718-7", name: "Hemoglobin", unit: "g/dL", low: 12.0, high: 17.0, typical: [12.5, 16], decimals: 1 },
  { code: "4544-3", name: "Hematocrit", unit: "%", low: 36, high: 50, typical: [37, 48], decimals: 1 },
  { code: "777-3", name: "Platelets", unit: "10*3/uL", low: 150, high: 400, typical: [160, 380], decimals: 0 },
];
const bmp: LabTestDef[] = [
  { code: "2951-2", name: "Sodium", unit: "mmol/L", low: 135, high: 145, typical: [136, 144], decimals: 0 },
  { code: "2823-3", name: "Potassium", unit: "mmol/L", low: 3.5, high: 5.1, typical: [3.6, 4.9], decimals: 1 },
  { code: "2075-0", name: "Chloride", unit: "mmol/L", low: 98, high: 107, typical: [99, 106], decimals: 0 },
  { code: "1963-8", name: "Bicarbonate", unit: "mmol/L", low: 22, high: 29, typical: [22, 28], decimals: 0 },
  { code: "3094-0", name: "BUN", unit: "mg/dL", low: 7, high: 20, typical: [8, 19], decimals: 0 },
  { code: "2160-0", name: "Creatinine", unit: "mg/dL", low: 0.6, high: 1.2, typical: [0.7, 1.1], decimals: 2 },
  { code: "2345-7", name: "Glucose", unit: "mg/dL", low: 70, high: 99, typical: [78, 115], decimals: 0 },
  { code: "17861-6", name: "Calcium", unit: "mg/dL", low: 8.5, high: 10.2, typical: [8.7, 10.0], decimals: 1 },
];
const lft: LabTestDef[] = [
  { code: "1742-6", name: "ALT", unit: "U/L", low: 7, high: 45, typical: [10, 42], decimals: 0 },
  { code: "1920-8", name: "AST", unit: "U/L", low: 8, high: 40, typical: [12, 38], decimals: 0 },
  { code: "6768-6", name: "Alk Phos", unit: "U/L", low: 40, high: 120, typical: [45, 115], decimals: 0 },
  { code: "1975-2", name: "Total Bilirubin", unit: "mg/dL", low: 0.1, high: 1.2, typical: [0.2, 1.1], decimals: 1 },
  { code: "1751-7", name: "Albumin", unit: "g/dL", low: 3.5, high: 5.0, typical: [3.6, 4.8], decimals: 1 },
];

export const LAB_PANELS: Record<string, LabTestDef[]> = {
  CBC: cbc,
  BMP: bmp,
  CMP: [...bmp, ...lft],
  "Lipid Panel": [
    { code: "2093-3", name: "Total Cholesterol", unit: "mg/dL", high: 200, typical: [150, 240], decimals: 0 },
    { code: "2085-9", name: "HDL", unit: "mg/dL", low: 40, typical: [35, 70], decimals: 0 },
    { code: "13457-7", name: "LDL (calc)", unit: "mg/dL", high: 130, typical: [70, 170], decimals: 0 },
    { code: "2571-8", name: "Triglycerides", unit: "mg/dL", high: 150, typical: [80, 220], decimals: 0 },
  ],
  "Hemoglobin A1c": [{ code: "4548-4", name: "Hemoglobin A1c", unit: "%", high: 5.7, typical: [5.2, 9.0], decimals: 1 }],
  TSH: [{ code: "3016-3", name: "TSH", unit: "mIU/L", low: 0.4, high: 4.5, typical: [0.5, 4.2], decimals: 2 }],
  "Troponin I (hs)": [{ code: "89579-7", name: "Troponin I, high sensitivity", unit: "ng/L", high: 14, typical: [2, 12], decimals: 0 }],
  Lactate: [{ code: "2524-7", name: "Lactate", unit: "mmol/L", low: 0.5, high: 2.0, typical: [0.6, 1.9], decimals: 1 }],
  "PT/INR": [
    { code: "5902-2", name: "Prothrombin time", unit: "s", low: 11, high: 13.5, typical: [11, 13.5], decimals: 1 },
    { code: "6301-6", name: "INR", unit: "", low: 0.9, high: 1.1, typical: [0.9, 1.1], decimals: 1 },
  ],
  Magnesium: [{ code: "19123-9", name: "Magnesium", unit: "mg/dL", low: 1.7, high: 2.3, typical: [1.7, 2.3], decimals: 1 }],
  "Urinalysis": [
    { code: "5811-5", name: "Specific gravity", unit: "", low: 1.005, high: 1.03, typical: [1.008, 1.025], decimals: 3 },
    { code: "5803-2", name: "pH", unit: "", low: 5, high: 8, typical: [5.5, 7.5], decimals: 1 },
  ],
  "Blood Cultures x2": [],
  "Type and Screen": [],
  "BNP": [{ code: "30934-4", name: "BNP", unit: "pg/mL", high: 100, typical: [20, 90], decimals: 0 }],
  "CRP": [{ code: "1988-5", name: "C-reactive protein", unit: "mg/L", high: 10, typical: [1, 8], decimals: 1 }],
};

const labEntries: CatalogEntry[] = Object.keys(LAB_PANELS).map((panel) => ({
  id: "lab-" + panel.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  category: "lab",
  display: panel,
  tests: LAB_PANELS[panel],
  container: panel === "CBC" ? "Lavender top" : panel.includes("Culture") ? "Blood culture bottles" : panel === "Urinalysis" ? "Urine cup" : panel === "PT/INR" ? "Light blue top" : "Gold top SST",
  keywords: panel.toLowerCase(),
}));

const imagingEntries: CatalogEntry[] = [
  { id: "img-cxr", category: "imaging", display: "X-ray Chest 2 Views", modality: "XR", keywords: "chest xray cxr" },
  { id: "img-ct-head", category: "imaging", display: "CT Head without contrast", modality: "CT", keywords: "ct head brain stroke" },
  { id: "img-ct-abd", category: "imaging", display: "CT Abdomen/Pelvis with IV contrast", modality: "CT", classKey: "contrast", keywords: "ct abdomen pelvis contrast" },
  { id: "img-cta-chest", category: "imaging", display: "CT Angiogram Chest (PE protocol)", modality: "CT", classKey: "contrast", keywords: "cta pe pulmonary embolism contrast" },
  { id: "img-mri-brain", category: "imaging", display: "MRI Brain with and without contrast", modality: "MR", classKey: "contrast", keywords: "mri brain" },
  { id: "img-us-abd", category: "imaging", display: "Ultrasound Abdomen Complete", modality: "US", keywords: "ultrasound abdomen gallbladder" },
  { id: "img-us-dvt", category: "imaging", display: "Ultrasound Venous Doppler Lower Extremity", modality: "US", keywords: "dvt doppler leg" },
  { id: "img-echo", category: "imaging", display: "Echocardiogram Transthoracic", modality: "US", keywords: "echo heart" },
  { id: "img-ecg", category: "imaging", display: "ECG 12-lead", modality: "ECG", keywords: "ekg ecg electrocardiogram" },
  { id: "img-xr-hip", category: "imaging", display: "X-ray Hip 2 Views", modality: "XR", keywords: "hip fracture xray" },
];

const med = (
  id: string, display: string, generic: string, classKey: string,
  defaultDose: string, route: string, frequency: string, schedule: string[], keywords = ""
): CatalogEntry => ({
  id, category: "medication", display, generic, classKey, defaultDose, route, frequency, schedule, keywords,
});

const medEntries: CatalogEntry[] = [
  med("med-acetaminophen", "acetaminophen (TYLENOL) tablet 650 mg", "acetaminophen", "analgesic", "650 mg", "oral", "every 6 hours PRN", [], "tylenol pain fever"),
  med("med-ibuprofen", "ibuprofen (MOTRIN) tablet 400 mg", "ibuprofen", "nsaid", "400 mg", "oral", "every 8 hours PRN", [], "motrin nsaid pain"),
  med("med-ketorolac", "ketorolac (TORADOL) injection 15 mg", "ketorolac", "nsaid", "15 mg", "IV", "every 6 hours PRN", [], "toradol nsaid"),
  med("med-aspirin", "aspirin chewable tablet 81 mg", "aspirin", "nsaid-antiplatelet", "81 mg", "oral", "daily", ["09:00"], "asa antiplatelet"),
  med("med-amoxicillin", "amoxicillin (AMOXIL) capsule 500 mg", "amoxicillin", "penicillin", "500 mg", "oral", "every 8 hours", ["06:00", "14:00", "22:00"], "amoxil antibiotic"),
  med("med-ampicillin", "ampicillin-sulbactam (UNASYN) 3 g IV", "ampicillin-sulbactam", "penicillin", "3 g", "IV", "every 6 hours", ["00:00", "06:00", "12:00", "18:00"], "unasyn antibiotic"),
  med("med-piptazo", "piperacillin-tazobactam (ZOSYN) 4.5 g IV", "piperacillin-tazobactam", "penicillin", "4.5 g", "IV", "every 8 hours", ["06:00", "14:00", "22:00"], "zosyn antibiotic sepsis"),
  med("med-ceftriaxone", "cefTRIAXone (ROCEPHIN) 1 g IV", "ceftriaxone", "cephalosporin", "1 g", "IV", "every 24 hours", ["10:00"], "rocephin antibiotic"),
  med("med-cephalexin", "cephALEXin (KEFLEX) capsule 500 mg", "cephalexin", "cephalosporin", "500 mg", "oral", "every 6 hours", ["06:00", "12:00", "18:00", "00:00"], "keflex antibiotic"),
  med("med-azithromycin", "azithromycin (ZITHROMAX) tablet 500 mg", "azithromycin", "macrolide", "500 mg", "oral", "daily", ["10:00"], "zpak antibiotic"),
  med("med-vancomycin", "vancomycin 1 g IV", "vancomycin", "glycopeptide", "1 g", "IV", "every 12 hours", ["10:00", "22:00"], "vanc antibiotic mrsa"),
  med("med-smx-tmp", "sulfamethoxazole-trimethoprim (BACTRIM DS) tablet", "sulfamethoxazole-trimethoprim", "sulfonamide", "1 tablet", "oral", "every 12 hours", ["10:00", "22:00"], "bactrim antibiotic uti"),
  med("med-metformin", "metFORMIN (GLUCOPHAGE) tablet 500 mg", "metformin", "biguanide", "500 mg", "oral", "twice daily with meals", ["08:00", "18:00"], "diabetes glucophage"),
  med("med-insulin-lispro", "insulin lispro (HUMALOG) sliding scale", "insulin lispro", "insulin", "per scale", "subcutaneous", "AC & HS", ["08:00", "12:00", "17:00", "21:00"], "humalog insulin diabetes"),
  med("med-insulin-glargine", "insulin glargine (LANTUS) 20 units", "insulin glargine", "insulin", "20 units", "subcutaneous", "nightly", ["21:00"], "lantus insulin diabetes"),
  med("med-lisinopril", "lisinopril (PRINIVIL) tablet 10 mg", "lisinopril", "ace-inhibitor", "10 mg", "oral", "daily", ["09:00"], "hypertension ace"),
  med("med-amlodipine", "amLODIPine (NORVASC) tablet 5 mg", "amlodipine", "ccb", "5 mg", "oral", "daily", ["09:00"], "norvasc hypertension"),
  med("med-metoprolol", "metoprolol tartrate (LOPRESSOR) tablet 25 mg", "metoprolol", "beta-blocker", "25 mg", "oral", "twice daily", ["09:00", "21:00"], "lopressor heart"),
  med("med-atorvastatin", "atorvastatin (LIPITOR) tablet 40 mg", "atorvastatin", "statin", "40 mg", "oral", "nightly", ["21:00"], "lipitor cholesterol"),
  med("med-warfarin", "warfarin (COUMADIN) tablet 5 mg", "warfarin", "anticoagulant", "5 mg", "oral", "daily at 18:00", ["18:00"], "coumadin anticoagulant inr"),
  med("med-heparin-sq", "heparin 5,000 units subcutaneous", "heparin", "anticoagulant", "5,000 units", "subcutaneous", "every 8 hours", ["06:00", "14:00", "22:00"], "dvt prophylaxis"),
  med("med-enoxaparin", "enoxaparin (LOVENOX) 40 mg subcutaneous", "enoxaparin", "anticoagulant", "40 mg", "subcutaneous", "daily", ["10:00"], "lovenox dvt prophylaxis"),
  med("med-furosemide", "furosemide (LASIX) 40 mg IV", "furosemide", "loop-diuretic", "40 mg", "IV", "twice daily", ["09:00", "15:00"], "lasix heart failure fluid"),
  med("med-potassium", "potassium chloride (K-DUR) 20 mEq", "potassium chloride", "potassium", "20 mEq", "oral", "twice daily", ["09:00", "17:00"], "kcl kdur"),
  med("med-morphine", "morphine injection 2 mg", "morphine", "opioid", "2 mg", "IV", "every 4 hours PRN severe pain", [], "pain opioid"),
  med("med-oxycodone", "oxyCODONE (ROXICODONE) tablet 5 mg", "oxycodone", "opioid", "5 mg", "oral", "every 4 hours PRN", [], "pain opioid"),
  med("med-ondansetron", "ondansetron (ZOFRAN) 4 mg IV", "ondansetron", "antiemetic", "4 mg", "IV", "every 8 hours PRN nausea", [], "zofran nausea"),
  med("med-pantoprazole", "pantoprazole (PROTONIX) tablet 40 mg", "pantoprazole", "ppi", "40 mg", "oral", "daily before breakfast", ["07:00"], "protonix gerd"),
  med("med-sertraline", "sertraline (ZOLOFT) tablet 50 mg", "sertraline", "ssri", "50 mg", "oral", "daily", ["09:00"], "zoloft depression"),
  med("med-tramadol", "traMADol (ULTRAM) tablet 50 mg", "tramadol", "opioid-serotonergic", "50 mg", "oral", "every 6 hours PRN", [], "ultram pain"),
  med("med-albuterol", "albuterol (PROVENTIL) nebulizer 2.5 mg", "albuterol", "beta-agonist", "2.5 mg", "inhalation", "every 4 hours PRN wheeze", [], "neb asthma copd"),
  med("med-prednisone", "predniSONE tablet 40 mg", "prednisone", "steroid", "40 mg", "oral", "daily", ["09:00"], "steroid asthma copd"),
  med("med-ns-bolus", "sodium chloride 0.9% bolus 1,000 mL", "sodium chloride 0.9%", "iv-fluid", "1,000 mL", "IV", "once over 1 hour", [], "ns bolus fluids sepsis"),
  med("med-ns-maint", "sodium chloride 0.9% infusion 75 mL/hr", "sodium chloride 0.9%", "iv-fluid", "75 mL/hr", "IV", "continuous", [], "maintenance fluids"),
  med("med-levothyroxine", "levothyroxine (SYNTHROID) tablet 75 mcg", "levothyroxine", "thyroid", "75 mcg", "oral", "daily before breakfast", ["06:30"], "synthroid thyroid"),
  med("med-clarithromycin", "clarithromycin (BIAXIN) tablet 500 mg", "clarithromycin", "macrolide", "500 mg", "oral", "twice daily", ["09:00", "21:00"], "biaxin antibiotic"),
  med("med-simvastatin", "simvastatin (ZOCOR) tablet 20 mg", "simvastatin", "statin", "20 mg", "oral", "nightly", ["21:00"], "zocor cholesterol"),
];

const nursingEntries: CatalogEntry[] = [
  { id: "nur-vitals-q4", category: "nursing", display: "Vital signs every 4 hours", frequency: "every 4 hours", keywords: "vitals" },
  { id: "nur-vitals-q1", category: "nursing", display: "Vital signs every 1 hour", frequency: "every 1 hour", keywords: "vitals" },
  { id: "nur-io", category: "nursing", display: "Strict intake and output", keywords: "i&o" },
  { id: "nur-fall", category: "nursing", display: "Fall precautions", keywords: "fall" },
  { id: "nur-tele", category: "nursing", display: "Continuous cardiac telemetry", keywords: "telemetry monitor" },
  { id: "nur-seizure", category: "nursing", display: "Seizure precautions", keywords: "seizure" },
  { id: "nur-npo", category: "nursing", display: "NPO after midnight", keywords: "npo" },
  { id: "nur-o2", category: "nursing", display: "Oxygen titrate to SpO2 ≥ 92%", keywords: "oxygen o2" },
  { id: "nur-glucose", category: "nursing", display: "Point-of-care glucose AC & HS", keywords: "fingerstick glucose" },
  { id: "nur-isolation-contact", category: "nursing", display: "Contact isolation", keywords: "isolation" },
  { id: "nur-ambulate", category: "nursing", display: "Ambulate 3 times daily with assistance", keywords: "ambulate activity" },
];

const consultEntries: CatalogEntry[] = [
  { id: "con-cards", category: "consult", display: "Consult: Cardiology", keywords: "cardiology heart" },
  { id: "con-pharm", category: "consult", display: "Consult: Pharmacy (medication reconciliation)", keywords: "pharmacy" },
  { id: "con-pt", category: "consult", display: "Consult: Physical Therapy", keywords: "pt physio" },
  { id: "con-ot", category: "consult", display: "Consult: Occupational Therapy", keywords: "ot" },
  { id: "con-sw", category: "consult", display: "Consult: Social Work / Case Management", keywords: "social work discharge" },
  { id: "con-nutrition", category: "consult", display: "Consult: Nutrition", keywords: "dietitian" },
  { id: "con-id", category: "consult", display: "Consult: Infectious Disease", keywords: "id infection" },
  { id: "con-surgery", category: "consult", display: "Consult: General Surgery", keywords: "surgery" },
];

const dietEntries: CatalogEntry[] = [
  { id: "diet-regular", category: "diet", display: "Diet: Regular", keywords: "diet" },
  { id: "diet-cardiac", category: "diet", display: "Diet: Cardiac (2 g sodium)", keywords: "diet heart" },
  { id: "diet-diabetic", category: "diet", display: "Diet: Consistent carbohydrate", keywords: "diet diabetic" },
  { id: "diet-npo", category: "diet", display: "Diet: NPO", keywords: "npo" },
  { id: "diet-clear", category: "diet", display: "Diet: Clear liquids", keywords: "diet" },
];

const procedureEntries: CatalogEntry[] = [
  { id: "proc-iv", category: "procedure", display: "Peripheral IV insertion", keywords: "iv line" },
  { id: "proc-foley", category: "procedure", display: "Urinary catheter insertion", keywords: "foley catheter" },
  { id: "proc-lp", category: "procedure", display: "Lumbar puncture", keywords: "lp" },
  { id: "proc-wound", category: "procedure", display: "Wound care daily", keywords: "wound dressing" },
];

export const CATALOG: CatalogEntry[] = [
  ...labEntries, ...imagingEntries, ...medEntries, ...nursingEntries,
  ...consultEntries, ...dietEntries, ...procedureEntries,
];

export const CATALOG_BY_ID: Record<string, CatalogEntry> = Object.fromEntries(CATALOG.map((c) => [c.id, c]));

export interface OrderSet {
  id: string;
  name: string;
  description: string;
  items: { catalogId: string; priority?: "routine" | "urgent" | "stat"; preselected: boolean }[];
}

export const ORDER_SETS: OrderSet[] = [
  {
    id: "os-sepsis", name: "Sepsis Bundle (Hour-1)", description: "Lactate, cultures before antibiotics, broad-spectrum antibiotics and 30 mL/kg crystalloid.",
    items: [
      { catalogId: "lab-lactate", priority: "stat", preselected: true },
      { catalogId: "lab-blood-cultures-x2", priority: "stat", preselected: true },
      { catalogId: "lab-cbc", priority: "stat", preselected: true },
      { catalogId: "lab-cmp", priority: "stat", preselected: true },
      { catalogId: "med-piptazo", priority: "stat", preselected: true },
      { catalogId: "med-vancomycin", priority: "stat", preselected: false },
      { catalogId: "med-ns-bolus", priority: "stat", preselected: true },
      { catalogId: "nur-vitals-q1", preselected: true },
      { catalogId: "nur-io", preselected: true },
    ],
  },
  {
    id: "os-chest-pain", name: "Chest Pain / ACS Rule-out", description: "Serial troponin, ECG, aspirin and telemetry.",
    items: [
      { catalogId: "img-ecg", priority: "stat", preselected: true },
      { catalogId: "lab-troponin-i-hs", priority: "stat", preselected: true },
      { catalogId: "lab-cbc", preselected: true },
      { catalogId: "lab-bmp", preselected: true },
      { catalogId: "lab-lipid-panel", preselected: false },
      { catalogId: "img-cxr", priority: "urgent", preselected: true },
      { catalogId: "med-aspirin", priority: "stat", preselected: true },
      { catalogId: "nur-tele", preselected: true },
    ],
  },
  {
    id: "os-admission", name: "General Medicine Admission", description: "Standard admission orders with DVT prophylaxis and diet.",
    items: [
      { catalogId: "nur-vitals-q4", preselected: true },
      { catalogId: "diet-regular", preselected: true },
      { catalogId: "med-heparin-sq", preselected: true },
      { catalogId: "med-acetaminophen", preselected: true },
      { catalogId: "med-ondansetron", preselected: true },
      { catalogId: "nur-fall", preselected: false },
      { catalogId: "nur-ambulate", preselected: true },
      { catalogId: "lab-cbc", preselected: true },
      { catalogId: "lab-bmp", preselected: true },
    ],
  },
  {
    id: "os-diabetes", name: "Inpatient Diabetes Management", description: "Basal-bolus insulin with point-of-care glucose.",
    items: [
      { catalogId: "nur-glucose", preselected: true },
      { catalogId: "med-insulin-lispro", preselected: true },
      { catalogId: "med-insulin-glargine", preselected: true },
      { catalogId: "diet-diabetic", preselected: true },
      { catalogId: "lab-hemoglobin-a1c", preselected: true },
    ],
  },
  {
    id: "os-copd", name: "COPD / Asthma Exacerbation", description: "Bronchodilators, steroids and oxygen titration.",
    items: [
      { catalogId: "med-albuterol", preselected: true },
      { catalogId: "med-prednisone", preselected: true },
      { catalogId: "nur-o2", preselected: true },
      { catalogId: "img-cxr", preselected: true },
      { catalogId: "med-azithromycin", preselected: false },
    ],
  },
  {
    id: "os-stroke", name: "Acute Stroke Pathway", description: "Time-critical imaging and neuro checks.",
    items: [
      { catalogId: "img-ct-head", priority: "stat", preselected: true },
      { catalogId: "lab-cbc", priority: "stat", preselected: true },
      { catalogId: "lab-pt-inr", priority: "stat", preselected: true },
      { catalogId: "lab-bmp", priority: "stat", preselected: true },
      { catalogId: "nur-vitals-q1", preselected: true },
      { catalogId: "diet-npo", preselected: true },
      { catalogId: "nur-seizure", preselected: false },
    ],
  },
];

export function searchCatalog(q: string, category?: OrderCategory): CatalogEntry[] {
  const s = q.trim().toLowerCase();
  return CATALOG.filter((c) => {
    if (category && c.category !== category) return false;
    if (!s) return true;
    return (
      c.display.toLowerCase().includes(s) ||
      (c.generic ?? "").includes(s) ||
      (c.keywords ?? "").includes(s)
    );
  }).slice(0, 40);
}
