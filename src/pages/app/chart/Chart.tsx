import React, { Suspense, lazy, useEffect } from "react";
import { NavLink, useParams } from "react-router-dom";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db/db";
import { useSession } from "../../../state/session";
import { t } from "../../../lib/i18n";
import Storyboard from "./Storyboard";

const Summary = lazy(() => import("./Summary"));
const ChartReview = lazy(() => import("./ChartReview"));
const Problems = lazy(() => import("./Problems"));
const History = lazy(() => import("./History"));
const Allergies = lazy(() => import("./Allergies"));
const Medications = lazy(() => import("./Medications"));
const Orders = lazy(() => import("./Orders"));
const Notes = lazy(() => import("./Notes"));
const Results = lazy(() => import("./Results"));
const Flowsheets = lazy(() => import("./Flowsheets"));
const MAR = lazy(() => import("./MAR"));
const CarePlan = lazy(() => import("./CarePlan"));
const Immunizations = lazy(() => import("./Immunizations"));
const Documents = lazy(() => import("./Documents"));
const Discharge = lazy(() => import("./Discharge"));

const ACTIVITIES: { key: string; label: string; roles?: string[] }[] = [
  { key: "summary", label: "summary" }, { key: "review", label: "chartReview" }, { key: "problems", label: "problems" }, { key: "history", label: "history" },
  { key: "allergies", label: "allergies" }, { key: "medications", label: "medications" }, { key: "orders", label: "orders" }, { key: "notes", label: "notes" },
  { key: "results", label: "results" }, { key: "flowsheets", label: "flowsheets" }, { key: "mar", label: "mar" }, { key: "careplan", label: "carePlan" },
  { key: "immunizations", label: "immunizations" }, { key: "documents", label: "documents" }, { key: "discharge", label: "discharge", roles: ["physician", "ed", "admin", "nurse"] },
];

export default function Chart() {
  const { id, activity = "summary" } = useParams();
  const s = useSession();
  const p = useLiveQuery(() => (id ? db.patients.get(id) : undefined), [id]);
  useEffect(() => { if (id) { s.setActivePatient(id); if (!s.openPatients.includes(id)) s.openPatient(id, activity); } }, [id]);
  if (!id) return null;
  if (p === undefined) return <div className="page"><div className="empty">Loading chart…</div></div>;
  if (p === null) return <div className="page"><div className="empty">No authorized patient found.</div></div>;
  const Body = { summary: Summary, review: ChartReview, problems: Problems, history: History, allergies: Allergies, medications: Medications, orders: Orders, notes: Notes, results: Results, flowsheets: Flowsheets, mar: MAR, careplan: CarePlan, immunizations: Immunizations, documents: Documents, discharge: Discharge }[activity] ?? Summary;
  return (
    <div className="chart">
      <Storyboard patient={p} />
      <div className="chart-body">
        <nav className="tabs" aria-label="Chart activities">
          {ACTIVITIES.filter((a) => !a.roles || a.roles.includes(s.role)).map((a) => <NavLink key={a.key} to={`/app/chart/${id}/${a.key}`} className={({ isActive }) => (isActive ? "active" : "")}>{t(a.label)}</NavLink>)}
        </nav>
        <div className="chart-content" key={activity}>
          <Suspense fallback={<div className="empty">Loading…</div>}><Body patient={p} /></Suspense>
        </div>
      </div>
    </div>
  );
}
