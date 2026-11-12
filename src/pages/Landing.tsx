import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ISparkle, IBolt, IWifiOff, IShield, IPill, IFlask, IScan, IBed, IInbox, IHeart, IGlobe, ICheck, IActivity, IFile, ISettings, IGrid } from "../components/Icons";

const FEATURES: { icon: React.ReactNode; title: string; text: string; tag?: string; soon?: boolean }[] = [
  { icon: <IGrid />, title: "Longitudinal chart", text: "Storyboard, problem list, histories, allergies, medications, immunizations, documents and a full chart-review timeline across every encounter.", tag: "In demo" },
  { icon: <IFile />, title: "Notes with MagicLinks", text: "Templated H&P, progress, ED and discharge notes. Smart links pull live vitals, labs and meds into the note. Autosave, sign, addend, cosign.", tag: "In demo" },
  { icon: <IActivity />, title: "Orders & order sets", text: "Catalog search, sepsis / chest pain / stroke / admission order sets, a review basket and a signing confirmation that shows the patient and every alert.", tag: "In demo" },
  { icon: <IShield />, title: "Decision support", text: "Allergy, cross-reactivity, interaction, duplicate therapy, renal dosing and duplicate-lab rules. Interruptive only when critical. Override needs a reason and is audited.", tag: "In demo" },
  { icon: <IPill />, title: "eMAR with barcode", text: "Scan patient and medication, five-rights check, document given / held / refused, overdue highlighting and pharmacist verification queue.", tag: "In demo" },
  { icon: <IFlask />, title: "Lab, imaging, results", text: "Specimen queue, accession and result entry, radiology worklist and reporting, results review with reference ranges, flags, trends and acknowledgement.", tag: "In demo" },
  { icon: <IBolt />, title: "ED track board", text: "Acuity, arrival and waiting age, location, team, pending actions and disposition. Sepsis screen and NEWS2 at a glance.", tag: "In demo" },
  { icon: <IBed />, title: "Bed board & census", text: "Units, isolation, cleaning status, assign / transfer / discharge with server-style reservation rules.", tag: "In demo" },
  { icon: <IInbox />, title: "In Basket", text: "Results, cosign, refills, referrals, deficiencies, messages and reminders with owner, age and closure that is more than reading.", tag: "In demo" },
  { icon: <IHeart />, title: "Patient portal", text: "Appointments, results with plain-language context, medication list, messaging and e-check-in for the patient and proxies.", tag: "In demo" },
  { icon: <IWifiOff />, title: "Offline by design", text: "Everything runs in the browser from an installable PWA. Durable local journal with explicit states; nothing queued is ever shown as completed.", tag: "In demo" },
  { icon: <IGlobe />, title: "FHIR R4 export", text: "One click exports a FHIR R4 Bundle: Patient, Encounter, Condition, AllergyIntolerance, MedicationRequest, Observation, Immunization, DocumentReference.", tag: "In demo" },
  { icon: <ISparkle />, title: "Magic Assist (AI)", text: "Source-linked chart summaries and draft notes, labeled as drafts, with citations back to the chart. Local-only in the demo; bring your own model in production.", tag: "In demo (rule-based)" },
  { icon: <ISettings />, title: "Admin, audit & roles", text: "Tamper-evident audit log for views, edits, signs, orders and administrations. Users, roles, themes, Arabic / English and high contrast.", tag: "In demo" },
  { icon: <IScan />, title: "Specialty packs", text: "Oncology, obstetrics, surgery/anesthesia, dialysis, ophthalmology, dental, behavioral health and more, built on the same chart and order engine.", tag: "Roadmap", soon: true },
  { icon: <IActivity />, title: "Revenue cycle & population health", text: "Eligibility, estimates, coding, claims, registries, care gaps and quality measures with versioned definitions.", tag: "Roadmap", soon: true },
];

const ROLES = [
  ["u-phys1", "Physician"], ["u-nurse1", "Nurse"], ["u-ed1", "ED physician"], ["u-pharm1", "Pharmacist"],
  ["u-lab1", "Lab technologist"], ["u-rad1", "Radiologist"], ["u-reg1", "Registrar"], ["u-admin", "Administrator"], ["u-patient", "Patient portal"],
];

export default function Landing() {
  const nav = useNavigate();
  const launch = (userId?: string) => {
    if (userId) { try { localStorage.setItem("magic-user", userId); } catch { /* ignore */ } }
    nav(userId === "u-patient" ? "/app/portal" : "/app");
  };
  return (
    <div className="landing">
      <nav className="l-nav">
        <Link to="/" className="brand"><span className="logo"><ISparkle width={18} height={18} /></span>Magic EHR</Link>
        <div className="links">
          <a href="#features">Features</a>
          <a href="#compare">Compare</a>
          <a href="#deploy">Deploy</a>
          <a href="https://github.com/musaabMD/openehr" target="_blank" rel="noreferrer">GitHub</a>
          <button className="l-btn primary" onClick={() => launch()}>Launch demo</button>
        </div>
      </nav>

      <section className="hero">
        <div>
          <span className="eyebrow"><ISparkle width={14} height={14} /> Free · Open source · AGPL-3.0</span>
          <h1>The <span className="hl">open-source EHR</span> that feels like the one your hospital already knows.</h1>
          <p className="lead">Magic EHR is a modern electronic health record for clinics and hospitals: one longitudinal chart, role-based workspaces, closed-loop orders, eMAR, lab, imaging, ED, beds, In Basket and a patient portal. It runs offline, installs as an app, and deploys to Cloudflare in one command.</p>
          <div className="cta">
            <button className="l-btn primary xl" onClick={() => launch()}><IBolt /> Launch the demo hospital</button>
            <a className="l-btn ghost" href="https://github.com/musaabMD/openehr" target="_blank" rel="noreferrer">View source</a>
          </div>
          <div className="fine">One click. No sign-up. 48 synthetic patients across medicine, ICU, emergency and clinic. Nothing leaves your browser.</div>
          <div className="trust">
            <span><ICheck /> Works offline (PWA)</span>
            <span><ICheck /> No cloud lock-in</span>
            <span><ICheck /> FHIR R4 export</span>
            <span><ICheck /> Arabic & English, RTL</span>
            <span><ICheck /> Dark & high-contrast</span>
          </div>
        </div>
        <div className="mock" aria-hidden="true">
          <div className="m-bar"><span>✦ Magic EHR</span><div className="m-tools"><span>Home</span><span>Patient Lists</span><span>Schedule</span><span>In Basket</span><span className="on">Chart</span><span>ED Board</span></div></div>
          <div className="m-tabs"><span>ABDULLAH, Maria 74F</span><span className="dim">KHAN, Omar 58M</span><span className="dim">ROSSI, Elena 66F</span></div>
          <div className="m-body">
            <div className="m-story">
              <div className="pv"><i /><div><b>ABDULLAH, Maria</b>74 y · F · MRN 800048</div></div>
              <div className="al">⚠ PENICILLIN — anaphylaxis</div>
              <div className="al">⚠ Iodinated contrast</div>
              <div className="kv"><span>Code</span><b>Full Code</b></div>
              <div className="kv"><span>Unit</span><b>3 North 301A</b></div>
              <div className="kv"><span>LOS</span><b>3 days</b></div>
              <div className="kv"><span>Attending</span><b>Rashid, A</b></div>
              <div className="kv"><span>Isolation</span><b>None</b></div>
              <div className="kv"><span>Wt / BMI</span><b>72 kg / 27.1</b></div>
              <div className="kv"><span>NEWS2</span><b style={{ color: "#9B6500" }}>4</b></div>
            </div>
            <div className="m-main">
              <div className="m-acts"><span>Summary</span><span>Chart Review</span><span>Problems</span><span>Meds</span><span>Orders</span><span>Notes</span><span className="on">Results</span><span>Flowsheets</span><span>MAR</span></div>
              <table><thead><tr><th>Test</th><th>05:12 today</th><th>05:30 yest.</th><th>Ref</th></tr></thead><tbody>
                <tr><td>Sodium</td><td className="hi">131 L</td><td className="hi">129 L</td><td>135–145</td></tr>
                <tr><td>Potassium</td><td>3.8</td><td className="hi">3.3 L</td><td>3.5–5.1</td></tr>
                <tr><td>Creatinine</td><td className="hi">1.62 H</td><td className="hi">1.81 H</td><td>0.6–1.2</td></tr>
                <tr><td>BNP</td><td className="hi">812 H</td><td className="hi">1,430 H</td><td>&lt;100</td></tr>
                <tr><td>INR</td><td className="hi">2.6 H</td><td className="hi">3.1 H</td><td>0.9–1.1</td></tr>
              </tbody></table>
              <div className="m-cards">
                <div className="m-card"><h5>Vitals trend — SpO2</h5><svg className="spark" viewBox="0 0 200 28" width="100%"><polyline fill="none" stroke="#235EA7" strokeWidth="2" points="0,22 25,20 50,21 75,16 100,14 125,12 150,9 175,8 200,6" /></svg></div>
                <div className="m-card"><h5>Active orders</h5><div>furosemide 40 mg IV BID · warfarin 5 mg · KCl 20 mEq · Cardiac diet · Strict I&amp;O</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="roles">
        <h2>Try it as any role</h2>
        <p className="sub">Each workspace opens with the right lists, queues and chart activities. Switch roles any time from the user menu.</p>
        <div className="roles">
          {ROLES.map(([id, label]) => <button key={id} className="role" onClick={() => launch(id)}><i /> {label}</button>)}
        </div>
      </section>

      <section className="section" id="features">
        <h2>What's built</h2>
        <p className="sub">The demo runs the complete clinical core in your browser. Every item marked "In demo" is working now; roadmap items are tracked feature by feature in the repository against the Epic-inspired backlog.</p>
        <div className="features">
          {FEATURES.map((f) => (
            <div className="feature" key={f.title}>
              <div className="ic">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
              {f.tag && <span className={"tag" + (f.soon ? " soon" : "")}>{f.tag}</span>}
            </div>
          ))}
        </div>
      </section>

      <section className="section" id="compare">
        <h2>How it compares</h2>
        <p className="sub">Enterprise EHRs are excellent and expensive. Magic EHR is an independent design that borrows the workflow ideas clinicians already know, keeps the code open, and runs anywhere.</p>
        <div style={{ overflowX: "auto" }}>
          <table className="cmp">
            <thead><tr><th>Capability</th><th>Magic EHR</th><th>Enterprise EHR</th><th>Typical open-source EHR</th></tr></thead>
            <tbody>
              <tr><td>License cost</td><td className="y">Free, AGPL-3.0</td><td className="n">Multi-million, multi-year</td><td className="y">Free</td></tr>
              <tr><td>Role-based workspaces (physician, nurse, pharmacy, lab, ED, registrar, admin, patient)</td><td className="y">Yes</td><td className="y">Yes</td><td className="p">Partial</td></tr>
              <tr><td>Closed-loop orders → pharmacy verification → eMAR barcode administration</td><td className="y">Yes</td><td className="y">Yes</td><td className="p">Partial</td></tr>
              <tr><td>Works with the internet down</td><td className="y">Yes, offline-first with explicit states</td><td className="p">Downtime read-only</td><td className="n">Usually not</td></tr>
              <tr><td>One-click demo</td><td className="y">Yes</td><td className="n">No</td><td className="p">Docker setup</td></tr>
              <tr><td>Deploy on Cloudflare free tier</td><td className="y">One command</td><td className="n">No</td><td className="n">No</td></tr>
              <tr><td>FHIR R4</td><td className="y">Export now; API on roadmap</td><td className="y">Yes</td><td className="p">Varies</td></tr>
              <tr><td>Arabic / RTL, dark, high contrast</td><td className="y">Yes</td><td className="p">Varies</td><td className="p">Varies</td></tr>
              <tr><td>Specialty packs, revenue cycle, population health</td><td className="p">Roadmap</td><td className="y">Yes</td><td className="p">Partial</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="section" id="deploy">
        <h2>Deploy on Cloudflare in a minute</h2>
        <p className="sub">The app is static assets plus a tiny Worker for health, FHIR metadata and an optional D1 sync journal. It fits the free tier.</p>
        <div className="steps">
          <div className="step"><div className="n">1</div><b>Clone and install</b><pre>git clone https://github.com/musaabMD/openehr
cd openehr && npm install</pre></div>
          <div className="step"><div className="n">2</div><b>Run locally</b><pre>npm run dev
# http://localhost:5173</pre></div>
          <div className="step"><div className="n">3</div><b>Deploy to Workers</b><pre>npx wrangler login
npm run deploy</pre></div>
          <div className="step"><div className="n">4</div><b>Optional: server sync journal</b><pre>npx wrangler d1 create magic-ehr-sync
npx wrangler d1 execute magic-ehr-sync \
  --file=worker/schema.sql --remote</pre></div>
        </div>
      </section>

      <section className="section">
        <div className="callout">
          <h2>Open the demo hospital</h2>
          <p className="sub" style={{ margin: "0 auto 20px" }}>Physician rounds, nurse MAR, pharmacy verification, lab bench, ED board, bed management, patient portal. All of it, right now.</p>
          <button className="l-btn primary xl" onClick={() => launch()}><IBolt /> Launch demo</button>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="disclaimer">
          <b>Not for clinical use yet.</b> Magic EHR is under active development. All demo data is synthetic. Clinical rules are illustrative, not a validated drug-knowledge base. No regulatory certification is claimed. "Epic" and product names of other vendors are trademarks of their owners, used only as public comparison references; Magic EHR is an independent design and shares no code, screens or assets with them.
        </div>
      </section>

      <footer className="footer">
        <div>Magic EHR · AGPL-3.0 · <a href="https://github.com/musaabMD/openehr">github.com/musaabMD/openehr</a></div>
        <div>Built with React, Dexie (IndexedDB), Workbox and Cloudflare Workers. No trackers, no external fonts, no PHI ever leaves the browser.</div>
      </footer>
    </div>
  );
}
