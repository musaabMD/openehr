// Clinical decision support rules for the demo. Every rule is explicit,
// shows its rationale and source, and is governed in one place.
// These are illustrative rules, not a validated drug-knowledge base.

import type { Allergy, LabResult, Medication, Order } from "../db/types";
import { CATALOG_BY_ID, type CatalogEntry } from "./catalog";

export type AlertSeverity = "critical" | "warning" | "info";

export interface CdsAlert {
  rule: string;
  severity: AlertSeverity;
  title: string;
  rationale: string;
  source: string;
  requiresOverride: boolean;
}

const ALLERGY_CLASS_MAP: Record<string, string[]> = {
  penicillin: ["penicillin"],
  cephalosporin: ["cephalosporin"],
  sulfonamide: ["sulfonamide"],
  nsaid: ["nsaid", "nsaid-antiplatelet"],
  opioid: ["opioid", "opioid-serotonergic"],
  contrast: ["contrast"],
  macrolide: ["macrolide"],
  statin: ["statin"],
  "ace-inhibitor": ["ace-inhibitor"],
};

// Cross-reactivity: a penicillin allergy produces a lower-severity warning for cephalosporins.
const CROSS_REACTIVITY: Record<string, string[]> = { penicillin: ["cephalosporin"] };

interface InteractionRule {
  a: string; // classKey or generic
  b: string;
  severity: AlertSeverity;
  title: string;
  rationale: string;
}

const INTERACTIONS: InteractionRule[] = [
  { a: "warfarin", b: "nsaid", severity: "critical", title: "Warfarin + NSAID: bleeding risk", rationale: "NSAIDs increase bleeding risk with warfarin through platelet inhibition and GI injury." },
  { a: "warfarin", b: "nsaid-antiplatelet", severity: "critical", title: "Warfarin + aspirin: bleeding risk", rationale: "Combined anticoagulant and antiplatelet therapy raises major bleeding risk; confirm indication." },
  { a: "warfarin", b: "macrolide", severity: "warning", title: "Warfarin + macrolide: INR elevation", rationale: "Macrolides inhibit warfarin metabolism; monitor INR within 3–5 days." },
  { a: "warfarin", b: "sulfonamide", severity: "warning", title: "Warfarin + sulfamethoxazole: INR elevation", rationale: "CYP2C9 inhibition increases INR; consider dose reduction and INR check." },
  { a: "anticoagulant", b: "anticoagulant", severity: "critical", title: "Duplicate anticoagulation", rationale: "Two anticoagulants are active; verify this is intentional bridging." },
  { a: "ace-inhibitor", b: "potassium", severity: "warning", title: "ACE inhibitor + potassium: hyperkalemia", rationale: "ACE inhibitors reduce potassium excretion; check serum potassium." },
  { a: "biguanide", b: "contrast", severity: "warning", title: "Metformin + IV contrast", rationale: "Hold metformin around iodinated contrast when kidney function is reduced; reassess at 48 hours." },
  { a: "statin", b: "macrolide", severity: "warning", title: "Statin + clarithromycin: myopathy", rationale: "CYP3A4 inhibition raises statin exposure; consider holding statin during therapy." },
  { a: "ssri", b: "opioid-serotonergic", severity: "warning", title: "SSRI + tramadol: serotonin syndrome", rationale: "Additive serotonergic activity and lowered seizure threshold." },
  { a: "opioid", b: "opioid", severity: "warning", title: "Multiple opioids active", rationale: "Confirm that concurrent opioid orders are intended and that monitoring is in place." },
  { a: "loop-diuretic", b: "nsaid", severity: "info", title: "Diuretic + NSAID: reduced effect", rationale: "NSAIDs can blunt diuretic response and worsen renal function." },
];

const RENAL_SENSITIVE = ["metformin", "enoxaparin", "vancomycin", "gabapentin", "lisinopril"];

export interface CdsContext {
  allergies: Allergy[];
  activeMeds: Medication[];
  recentLabs: LabResult[];
  existingOrders: Order[];
}

function classesOf(entry: CatalogEntry): string[] {
  return entry.classKey ? [entry.classKey] : [];
}

function allergyClassKeys(a: Allergy): string[] {
  const s = a.substance.toLowerCase();
  const keys: string[] = [];
  for (const key of Object.keys(ALLERGY_CLASS_MAP)) {
    if (s.includes(key) || (a.classKey && a.classKey === key)) keys.push(key);
  }
  if (s.includes("amoxicillin") || s.includes("ampicillin")) keys.push("penicillin");
  if (s.includes("aspirin") || s.includes("ibuprofen")) keys.push("nsaid");
  if (s.includes("morphine") || s.includes("codeine")) keys.push("opioid");
  if (s.includes("sulfa") || s.includes("bactrim")) keys.push("sulfonamide");
  if (s.includes("iodine") || s.includes("contrast")) keys.push("contrast");
  return Array.from(new Set(keys));
}

export function evaluateOrder(entry: CatalogEntry, ctx: CdsContext): CdsAlert[] {
  const alerts: CdsAlert[] = [];
  const entryClasses = classesOf(entry);
  const generic = entry.generic ?? "";

  // Allergy checks
  for (const a of ctx.allergies) {
    const keys = allergyClassKeys(a);
    for (const k of keys) {
      const target = ALLERGY_CLASS_MAP[k] ?? [];
      if (entryClasses.some((c) => target.includes(c)) || (generic && a.substance.toLowerCase().includes(generic))) {
        alerts.push({
          rule: `ALLERGY:${k}`,
          severity: a.severity === "severe" ? "critical" : "warning",
          title: `Documented ${a.type}: ${a.substance} (${a.reaction})`,
          rationale: `Patient has a ${a.severity} ${a.type} to ${a.substance}, which matches this order's ${k} class.`,
          source: "Allergy list, verified " + (a.verified ? "yes" : "no"),
          requiresOverride: true,
        });
      }
      const cross = CROSS_REACTIVITY[k] ?? [];
      if (entryClasses.some((c) => cross.includes(c))) {
        alerts.push({
          rule: `CROSS:${k}`,
          severity: "warning",
          title: `Possible cross-reactivity with ${a.substance} allergy`,
          rationale: "Cephalosporins carry a low cross-reactivity rate with penicillin allergy; review reaction history.",
          source: "Allergy list",
          requiresOverride: false,
        });
      }
    }
  }

  // Interaction and duplicate checks against active meds
  const activeKeys = ctx.activeMeds.map((m) => {
    const c = Object.values(CATALOG_BY_ID).find((e) => e.generic === m.generic);
    return { med: m, classKey: c?.classKey ?? "", generic: m.generic };
  });

  if (entry.category === "medication") {
    for (const am of activeKeys) {
      if (am.generic === generic) {
        alerts.push({
          rule: "DUPLICATE_THERAPY",
          severity: "warning",
          title: `Duplicate therapy: ${generic} already active`,
          rationale: `An active order for ${am.med.name} (${am.med.dose} ${am.med.frequency}) exists.`,
          source: "Medication list",
          requiresOverride: true,
        });
      }
    }
  }

  for (const rule of INTERACTIONS) {
    const match = (x: string, keyA: string, genA: string) => x === keyA || x === genA;
    for (const am of activeKeys) {
      const newSide = entryClasses.concat(generic ? [generic] : []);
      const hit =
        (newSide.some((x) => match(x, rule.a, rule.a)) && (match(rule.b, am.classKey, am.generic))) ||
        (newSide.some((x) => match(x, rule.b, rule.b)) && (match(rule.a, am.classKey, am.generic)));
      if (hit) {
        if (rule.a === rule.b && am.generic === generic) continue; // handled by duplicate rule
        alerts.push({
          rule: `INTERACTION:${rule.a}+${rule.b}`,
          severity: rule.severity,
          title: rule.title,
          rationale: `${rule.rationale} Active: ${am.med.name}.`,
          source: "Magic EHR interaction rule set v1 (illustrative)",
          requiresOverride: rule.severity === "critical",
        });
      }
    }
  }

  // Renal function
  if (RENAL_SENSITIVE.includes(generic)) {
    const cr = ctx.recentLabs
      .filter((l) => l.name === "Creatinine")
      .sort((a, b) => b.collected.localeCompare(a.collected))[0];
    if (cr && typeof cr.value === "number" && cr.value >= 1.5) {
      alerts.push({
        rule: "RENAL_DOSING",
        severity: "warning",
        title: `Renal dose review: creatinine ${cr.value} mg/dL`,
        rationale: `${generic} requires dose adjustment or avoidance with reduced kidney function.`,
        source: `Most recent creatinine (${cr.collected.slice(0, 10)})`,
        requiresOverride: false,
      });
    }
  }

  // Duplicate lab within 24h
  if (entry.category === "lab") {
    const dup = ctx.existingOrders.find(
      (o) => o.catalogId === entry.id && o.status !== "canceled" &&
        Date.now() - new Date(o.orderedAt).getTime() < 24 * 3600 * 1000
    );
    if (dup) {
      alerts.push({
        rule: "DUPLICATE_LAB",
        severity: "info",
        title: `${entry.display} already ordered in the last 24 hours`,
        rationale: "Consider whether a repeat is clinically needed.",
        source: "Order history",
        requiresOverride: false,
      });
    }
  }

  // Deduplicate: the same rule can match several active entries (e.g. home + inpatient warfarin).
  const seen = new Set<string>();
  return alerts.filter((a) => { const k = a.rule + "|" + a.title; if (seen.has(k)) return false; seen.add(k); return true; });
}

export function flagFor(value: number, low?: number, high?: number): "H" | "L" | "HH" | "LL" | null {
  if (high !== undefined && value > high) return value > high * 1.5 ? "HH" : "H";
  if (low !== undefined && value < low) return value < low * 0.7 ? "LL" : "L";
  return null;
}

export function sepsisScreen(v: { hr?: number; rr?: number; temp?: number; sbp?: number }, wbc?: number): { positive: boolean; criteria: string[] } {
  const c: string[] = [];
  if (v.hr && v.hr > 90) c.push(`HR ${v.hr} > 90`);
  if (v.rr && v.rr > 20) c.push(`RR ${v.rr} > 20`);
  if (v.temp && (v.temp > 38 || v.temp < 36)) c.push(`Temp ${v.temp} °C`);
  if (wbc && (wbc > 12 || wbc < 4)) c.push(`WBC ${wbc}`);
  if (v.sbp && v.sbp < 100) c.push(`SBP ${v.sbp} < 100`);
  return { positive: c.length >= 2, criteria: c };
}

export function news2(v: { hr?: number; rr?: number; temp?: number; sbp?: number; spo2?: number }): number {
  let s = 0;
  const rr = v.rr ?? 16;
  s += rr <= 8 ? 3 : rr <= 11 ? 1 : rr <= 20 ? 0 : rr <= 24 ? 2 : 3;
  const sp = v.spo2 ?? 97;
  s += sp <= 91 ? 3 : sp <= 93 ? 2 : sp <= 95 ? 1 : 0;
  const sbp = v.sbp ?? 120;
  s += sbp <= 90 ? 3 : sbp <= 100 ? 2 : sbp <= 110 ? 1 : sbp <= 219 ? 0 : 3;
  const hr = v.hr ?? 75;
  s += hr <= 40 ? 3 : hr <= 50 ? 1 : hr <= 90 ? 0 : hr <= 110 ? 1 : hr <= 130 ? 2 : 3;
  const t = v.temp ?? 37;
  s += t <= 35 ? 3 : t <= 36 ? 1 : t <= 38 ? 0 : t <= 39 ? 1 : 2;
  return s;
}
