export type Lang = "en" | "ar";

const dict: Record<string, { en: string; ar: string }> = {
  home: { en: "Home", ar: "الرئيسية" },
  patientLists: { en: "Patient Lists", ar: "قوائم المرضى" },
  schedule: { en: "Schedule", ar: "الجدول" },
  inBasket: { en: "In Basket", ar: "صندوق الوارد" },
  edBoard: { en: "ED Track Board", ar: "لوحة الطوارئ" },
  bedBoard: { en: "Bed Board", ar: "لوحة الأسرّة" },
  pharmacy: { en: "Pharmacy", ar: "الصيدلية" },
  laboratory: { en: "Laboratory", ar: "المختبر" },
  imaging: { en: "Imaging", ar: "الأشعة" },
  admin: { en: "Admin", ar: "الإدارة" },
  portal: { en: "Patient Portal", ar: "بوابة المريض" },
  patientLookup: { en: "Patient Lookup", ar: "بحث عن مريض" },
  search: { en: "Search", ar: "بحث" },
  summary: { en: "Summary", ar: "الملخص" },
  chartReview: { en: "Chart Review", ar: "مراجعة الملف" },
  problems: { en: "Problem List", ar: "قائمة المشاكل" },
  history: { en: "History", ar: "التاريخ المرضي" },
  allergies: { en: "Allergies", ar: "الحساسية" },
  medications: { en: "Medications", ar: "الأدوية" },
  orders: { en: "Orders", ar: "الطلبات" },
  notes: { en: "Notes", ar: "الملاحظات" },
  results: { en: "Results", ar: "النتائج" },
  flowsheets: { en: "Flowsheets", ar: "جداول القياس" },
  mar: { en: "MAR", ar: "سجل إعطاء الدواء" },
  carePlan: { en: "Care Plan", ar: "خطة الرعاية" },
  immunizations: { en: "Immunizations", ar: "التطعيمات" },
  documents: { en: "Documents", ar: "المستندات" },
  discharge: { en: "Discharge", ar: "الخروج" },
  sign: { en: "Sign", ar: "توقيع" },
  save: { en: "Save", ar: "حفظ" },
  cancel: { en: "Cancel", ar: "إلغاء" },
  close: { en: "Close", ar: "إغلاق" },
  online: { en: "Online", ar: "متصل" },
  offline: { en: "Offline", ar: "غير متصل" },
  draft: { en: "Draft", ar: "مسودة" },
  signed: { en: "Signed", ar: "موقّع" },
  queued: { en: "Queued", ar: "في الانتظار" },
  age: { en: "Age", ar: "العمر" },
  dob: { en: "DOB", ar: "تاريخ الميلاد" },
  mrn: { en: "MRN", ar: "رقم الملف" },
  allergiesNone: { en: "No known allergies", ar: "لا توجد حساسية معروفة" },
  codeStatus: { en: "Code Status", ar: "حالة الإنعاش" },
  pcp: { en: "PCP", ar: "طبيب الرعاية الأولية" },
  encounter: { en: "Encounter", ar: "الزيارة" },
  language: { en: "Language", ar: "اللغة" },
  theme: { en: "Theme", ar: "المظهر" },
  role: { en: "Role", ar: "الدور" },
  signOut: { en: "Exit demo", ar: "إنهاء العرض" },
  openChart: { en: "Open Chart", ar: "فتح الملف" },
  newOrder: { en: "New Order", ar: "طلب جديد" },
  newNote: { en: "New Note", ar: "ملاحظة جديدة" },
  offlineStatus: { en: "Connectivity & Sync", ar: "الاتصال والمزامنة" },
  audit: { en: "Audit Log", ar: "سجل التدقيق" },
  users: { en: "Users & Roles", ar: "المستخدمون والأدوار" },
  settings: { en: "Settings", ar: "الإعدادات" },
  reports: { en: "Reports", ar: "التقارير" },
};

let current: Lang = "en";
export function setLang(l: Lang) {
  current = l;
}
export function getLang(): Lang {
  return current;
}
export function t(key: string): string {
  const e = dict[key];
  if (!e) return key;
  return e[current] ?? e.en;
}
