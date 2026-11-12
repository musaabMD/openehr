<p align="center">
  <img src="public/icon-192.png" width="72" alt="Magic EHR" />
</p>
<h1 align="center">Magic EHR</h1>
<p align="center"><b>Free, open-source, offline-first electronic health record.</b><br/>
One longitudinal chart · role-based workspaces · closed-loop orders → pharmacy → eMAR · lab · imaging · ED · beds · In Basket · patient portal.<br/>
Runs in the browser, installs as an app, deploys to Cloudflare in one command.</p>

<p align="center">
  <a href="#one-click-demo">One-click demo</a> ·
  <a href="#whats-built">What's built</a> ·
  <a href="#deploy-to-cloudflare">Deploy</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="planning/README.md">Roadmap & Epic feature comparison</a>
</p>

---

## One-click demo

```bash
git clone https://github.com/musaabMD/openehr
cd openehr
npm install
npm run dev
```

Open <http://localhost:5173> and press **Launch the demo hospital**. That is the whole setup.

The first launch generates **Magic General Hospital** from a fixed seed: 48 synthetic patients across 3 North (medicine), 4 ICU, the emergency department and two clinics, with encounters, problems, allergies, home and inpatient medications, orders, 1,600+ lab results with trends, 48 hours of vitals, signed and draft notes, immunizations, appointments, In Basket work, a pharmacy verification queue, a lab specimen queue, an imaging worklist and an audit trail. Everything lives in your browser (IndexedDB). Nothing is sent anywhere.

Switch roles from the user menu: physician, resident, nurse, ED physician, pharmacist, lab technologist, radiologist, registrar, administrator and the patient portal.

## What's built

| Area | In the demo today |
|---|---|
| **Landing page** | Marketing page with one-click demo, role shortcuts, feature grid, comparison table and deploy steps |
| **App shell** | Epic-style workspace toolbar, open-chart tabs, global patient lookup (`Ctrl/⌘ K`), connectivity chip, role switcher, light / dark / high-contrast themes, English and Arabic (RTL) |
| **Home** | Role dashboards: census, schedule, deterioration watch (NEWS2 + sepsis screen), In Basket preview, queues |
| **Patient chart** | Storyboard (identity, allergies, flags, code status, encounter, last vitals, NEWS2) and activities: Summary, Chart Review timeline, Problem List (ICD-10), History, Allergies, Medications (with reconciliation gaps), Orders, Notes, Results Review, Flowsheets, MAR, Care Plan, Immunizations, Documents, Discharge |
| **Orders** | Catalog of 90 orderables, 6 order sets (sepsis, chest pain, admission, diabetes, COPD, stroke), review basket, priorities, indication, signing confirmation that shows the patient and every alert, double-submit protection |
| **Decision support** | Allergy class matching, cross-reactivity, drug–drug interactions, duplicate therapy, renal dosing, duplicate labs. Critical alerts require an override reason that is stored on the order and audited |
| **Notes** | 7 templates, **MagicLinks** (`@VITALS@ @LABS@ @MEDS@ @PROBLEMS@ @ALLERGIES@ …`) that pull live chart data, autosave to a durable local draft, sign, addenda on signed notes, resident → attending cosign routing |
| **Magic Assist** | Local, deterministic chart summary with a citation on every statement, AI-labelled draft notes that must be edited and attested before signing. Swap in a self-hosted model later behind the same function |
| **Results** | Table by collection time with flags, reference ranges, sparklines, trend chart, acknowledgement; imaging reports |
| **Flowsheets** | Vital-sign grid with validation, abnormal/critical shading, NEWS2 and sepsis screen per column, sticky headings |
| **eMAR** | Time-slot grid, barcode scan workflow (patient + medication), five-rights check, given / held / refused / missed, overdue highlighting, blocked when pharmacy verification is pending |
| **Pharmacy** | Verification queue with allergies, relevant labs, active meds and the same CDS evaluation; verify / clarify / reject |
| **Laboratory** | Specimen queue: collect → receive → in process → result entry with reference ranges and an identity check → release; rejections notify the clinician |
| **Imaging** | Technologist worklist and radiologist reporting with preliminary / final and critical-finding routing |
| **ED Track Board** | ESI acuity, arrival and waiting age, bay assignment, team, NEWS2, sepsis, pending work, disposition (admit with bed reservation / discharge / transfer), arrive-and-triage |
| **Bed Board** | Four units, occupied / available / cleaning / blocked, assign, transfer, discharge, housekeeping |
| **Schedule** | Provider day view, check-in → room → start visit → complete, no-show, booking with slot conflict check |
| **In Basket** | Results, cosign, messages, refills, referrals, deficiencies, reminders with closure actions (acknowledge, cosign & attest, approve/deny, reply) |
| **Patient portal** | Appointments with e-check-in, plain-language results, medications with refill requests, messaging, health summary, FHIR R4 download |
| **Admin** | Overview, connectivity & sync panel (reachability-based status, simulated outage, durable journal states, sync), audit log, users & roles, operational reports, settings |
| **Offline** | Installable PWA; app shell precached by a service worker; all data in IndexedDB; a journal records every clinical write with author, device, sequence, digest and an explicit state (`local-draft`, `local-committed`, `queued`, `syncing`, `server-accepted`, `conflict`, `rejected`). Queued work is never shown as completed |
| **Interoperability** | FHIR R4 Bundle export per patient (Patient, Encounter, Condition, AllergyIntolerance, MedicationRequest, Observation, Immunization, DocumentReference); `/api/fhir/metadata` CapabilityStatement |
| **Cloudflare** | Worker serves static assets with SPA fallback and security headers, `/api/health`, `/api/sync` (optional D1 journal) |

The roadmap (specialty packs, revenue cycle, population health, HL7 v2, identity/SSO, encryption at rest, real drug knowledge base, clinical validation) is tracked feature by feature against the Epic-inspired backlog in [`planning/`](planning/README.md).

## Deploy to Cloudflare

```bash
npx wrangler login
npm run deploy
```

That builds the app and publishes it to `https://magic-ehr.<your-subdomain>.workers.dev`. Custom domains work the usual way in the Cloudflare dashboard or `wrangler.jsonc`.

Optional server-side journal (free tier D1), used when a facility wants a server authority instead of standalone devices:

```bash
npx wrangler d1 create magic-ehr-sync
npx wrangler d1 execute magic-ehr-sync --file=worker/schema.sql --remote
```

Then uncomment the `d1_databases` block in `wrangler.jsonc`, paste the database id and deploy again. The journal stores metadata and payload digests only, never clinical content.

## Architecture

```
┌─────────────────────────── Browser (PWA) ───────────────────────────┐
│ React 18 · React Router · Dexie (IndexedDB) · Workbox service worker │
│                                                                      │
│  src/db        types, schema, deterministic seed, live-query hooks   │
│  src/lib       catalog & order sets, CDS rules, notes/MagicLinks,    │
│                Magic Assist, FHIR export, audit + journal, sync,     │
│                connectivity (server reachability, not navigator.onLine) │
│  src/pages     landing, workspaces, chart activities, portal          │
│  src/styles    design tokens (light / dark / high contrast, RTL)     │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ /api/*
┌──────────────────────────────▼───────────────────────────────────────┐
│ Cloudflare Worker (worker/index.ts)                                   │
│  static assets + SPA fallback · /api/health · /api/fhir/metadata      │
│  /api/sync → optional D1 journal (idempotent by entry id)             │
└───────────────────────────────────────────────────────────────────────┘
```

Design decisions that matter:

- **Local authority by default.** The device running the demo is the facility's authority. Writes commit durably to IndexedDB and get a journal entry. Switching to *server authority* in Admin → Connectivity queues entries for sync instead; without a configured D1 they stay queued and say so.
- **Explicit state vocabulary.** Draft, committed, queued, syncing, accepted, conflict and rejected are distinct chips everywhere. Reading an In Basket item never closes it.
- **Safety at the point of action.** Signing orders, notes, administrations, results and discharges each re-shows the patient identity. Barcode mismatches block administration. Lab release requires the MRN. Critical CDS alerts need a reason.
- **No external dependencies at runtime.** System fonts, inline icons, no analytics, no model providers. The app works with the network cable pulled.
- **Original design.** Workflow ideas are familiar on purpose; the code, screens, icons, tokens and names are original.

## Development

```bash
npm run dev        # Vite dev server with a stub /api
npm run typecheck  # strict TypeScript
npm run build      # production build + service worker
npm run cf:dev     # run the real Worker locally against dist/
npm run deploy     # build + wrangler deploy
```

Reset the demo at any time from Admin → Settings → *Reset demo hospital*.

## Status and disclaimer

Magic EHR is **not ready for clinical use**. All data is synthetic. Decision-support rules are illustrative and are not a validated drug knowledge base. No regulatory certification, HIPAA/GDPR/PDPL compliance or openEHR conformance is claimed. Identity, encryption at rest, HL7 v2 interfaces and clinical validation are open backlog items. "Epic" and other vendor product names are trademarks of their owners used only as public comparison references; Magic EHR is an independent design and shares no code, screens or assets with them.

## License

[AGPL-3.0-only](LICENSE). Run it, change it, deploy it; if you offer a modified version as a service, share your changes.
