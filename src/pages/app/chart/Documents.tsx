import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../../../db/db";
import { Card, Chip } from "../../../components/ui";
import type { Patient } from "../../../db/types";

export default function Documents({ patient: p }: { patient: Patient }) {
  const docs = useLiveQuery(() => db.documents.where("patientId").equals(p.id).toArray(), [p.id]) ?? [];
  return (
    <div className="stack">
      <h2 style={{ margin: 0, fontSize: 18 }}>Documents & outside records</h2>
      <Card tight><table className="grid"><thead><tr><th>Title</th><th>Type</th><th>Date</th><th>Source</th><th>Pages</th><th>Summary</th></tr></thead><tbody>
        {docs.map((d) => <tr key={d.id}><td><b>{d.title}</b></td><td><Chip kind="neutral">{d.type}</Chip></td><td>{d.date}</td><td>{d.source}</td><td className="num">{d.pages}</td><td className="small muted">{d.summary}</td></tr>)}
        {docs.length === 0 && <tr><td colSpan={6} className="empty">No scanned or external documents. Outside records arrive through HIE/FHIR exchange (roadmap) or scanning.</td></tr>}
      </tbody></table></Card>
    </div>
  );
}
