# Implementation status — Magic EHR demo build

Updated: 2026-11-12. This file maps the planning backlog to what the **Magic EHR** application in this repository actually does today. "Demo" means the workflow runs end to end in the browser against synthetic data. It is not clinical validation; the comparison register's implementation/validation scores stay at zero until evidence is reviewed per [CAPABILITY_COMPARISON_MATRIX.md](CAPABILITY_COMPARISON_MATRIX.md).

The CSV [EPIC_FEATURE_BY_FEATURE.csv](EPIC_FEATURE_BY_FEATURE.csv) gained a `demo_status` column (`demo` / `partial` / `none`). Counts: 14 demo, 23 partial, 153 none.

## Master backlog sections

| Section | Status | Notes |
|---|---|---|
| 0 Governance & safety | partial | AGPL-3.0 chosen; synthetic dataset; disclaimers; hazard log and clinical safety officer still open |
| 1 Architecture & installation | partial | Browser-local modular app, one-click demo, Cloudflare Worker deploy; PostgreSQL/Helm production topology not started |
| 2 Identity, roles, security | partial | RBAC per role in the UI, audit log for every clinical action; SSO/MFA, encryption at rest, break-glass not started |
| 3 Core record & clinical workspace | demo | Registration, encounters, problems, histories, allergies, meds, immunizations, vitals, notes, orders, results, In Basket, CDS, care plans, discharge |
| 4 Ambulatory | partial | Schedule, rooming, visit notes, portal; health maintenance rules limited to immunizations |
| 5 Inpatient & nursing | demo | Bed board, census, rounds, nursing assessment template, flowsheets, eMAR with barcode, NEWS2/sepsis watch |
| 6 Emergency | demo | Track board, triage, bay assignment, order sets, disposition with bed reservation |
| 7 Surgery & anesthesia | none | |
| 8 Pharmacy | partial | Catalog, prescribing, verification queue, CDS; inventory, controlled substances, dispensing devices not started |
| 9 Laboratory | partial | Order → specimen → result → acknowledge; micro/path/blood bank minimal |
| 10 Imaging | partial | Worklist and reporting; DICOM viewer placeholder |
| 11 Specialty packs | none | |
| 12 Patient experience | partial | Portal: appointments, e-check-in, results, meds, refills, messages, FHIR download |
| 13 Revenue cycle & operations | none | Scheduling only |
| 14 Population health & analytics | partial | Live operational reports; registries and measures not started |
| 15 Interoperability | partial | FHIR R4 export + CapabilityStatement; no FHIR API, HL7 v2, DICOM |
| 16 GUI & accessibility | demo | Token system, light/dark/high contrast, RTL Arabic, keyboard lookup, visible focus, state vocabulary |
| 17 AI | partial | Local rule-based Magic Assist with citations and draft labelling; model integration pending |
| 18 Release gates | none | No formal gates passed |

## Hospital GUI spec (HUI) and offline (OFF) tasks

| ID | Status | Where |
|---|---|---|
| HUI-01 tokens | demo | `src/styles/app.css` |
| HUI-02 components | demo | `src/components/ui.tsx` |
| HUI-03 state vocabulary | demo | `StateChip`, journal states |
| HUI-04 registrar | demo | Patient Lookup + Register |
| HUI-05 physician rounds | demo | Home, Patient Lists |
| HUI-06 nurse assignment | demo | Home (nurse), Patient Lists |
| HUI-07 eMAR | demo | Chart → MAR |
| HUI-08 emergency board | demo | ED Track Board |
| HUI-09 bed management | demo | Bed Board |
| HUI-10 pharmacy | demo | Pharmacy |
| HUI-11 laboratory | demo | Laboratory |
| HUI-12 imaging | partial | Imaging (no viewer) |
| HUI-13 surgery/anesthesia | none | |
| HUI-14 results/inbox | demo | In Basket |
| HUI-15 scheduling | demo | Schedule |
| HUI-16 patient/proxy | partial | Portal (no proxy) |
| HUI-17 operations/security | partial | Admin |
| HUI-18 patient search | demo | Lookup with duplicate-name indicator |
| HUI-19 note editor | demo | Notes |
| HUI-20 order composer | demo | Orders |
| HUI-21 results display | demo | Results Review |
| HUI-22 alerts | demo | CDS alerts with rationale, source, override |
| HUI-23 flowsheet | demo | Flowsheets |
| HUI-24 handoff | partial | Nursing SBAR template |
| HUI-25 offline status panel | demo | Admin → Connectivity |
| HUI-26 Arabic/English | partial | Navigation and chrome translated, RTL layout; clinical content English |
| HUI-27 shared displays | none | |
| HUI-28 configurability | none | |
| HUI-29 printing | partial | Browser print of chart summary |
| HUI-30–33 testing & evidence | none | |
| OFF-01 dependency independence | demo | No external assets at runtime |
| OFF-02 durable local commits | partial | IndexedDB transactions + journal; no server outbox |
| OFF-03 connectivity UI | demo | Reachability-based status chip and panel |
| OFF-05 draft journal | demo | `src/lib/audit.ts` journal |
| OFF-06 sync protocol | partial | Idempotent batch push to optional D1 |
| OFF-07 conflict rules | none | Single-device demo |
| OFF-09 external action queue | partial | Queued states only |
| OFF-04, 08, 10–14 | none | |
| PERF-02 UI payload | demo | ~124 KB gzipped core bundle, lazy chunks per activity |

## Next milestones

1. Server authority: PostgreSQL + FHIR R4 API behind the same journal contract; OIDC/SAML login; encryption at rest.
2. Validated clinical content: licensed drug knowledge base, terminology services (SNOMED CT, LOINC, RxNorm) with provenance.
3. Multi-device conflict handling (OFF-07/08) and downtime caches (OFF-04).
4. Specialty packs on the shared chart and order engine; perioperative; blood bank.
5. Clinical safety case, accessibility audit and usability testing per HUI-30–33.
