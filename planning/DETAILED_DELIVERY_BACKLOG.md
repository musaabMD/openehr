# Detailed delivery backlog
Updated: 2026-11-12. Status: proposed requirements; all tasks unimplemented.

Read alongside [the master blueprint](EPIC_INSPIRED_EHR_MASTER_BACKLOG.md). This document adds independently designed delivery specifications, not Epic's proprietary specifications. No public source provides every Epic feature or customer configuration. Epic names are comparison references only. The repository name does not imply affiliation with Epic or conformance to the openEHR specifications.

## Delivery contract
Every task below requires an accountable engineering owner and clinical/operational reviewer before implementation. Status progression: proposed → specified → implemented → verified → approved for the named deployment. A checked box requires linked evidence; documentation alone never means a capability is clinically ready.

Every clinical transaction records tenant, facility, patient, encounter where relevant, actor, delegated authority, effective time, recorded time, provenance, revision and correlation ID. Use explicit units, timezone-aware timestamps, terminology versions and immutable signed records. Distinguish unknown, absent, declined and not assessed. Correct signed records by amendment. APIs enforce permissions independently of the interface.

All tasks inherit: synthetic positive/negative scenarios, cross-tenant denial tests, accessible English/Arabic UI, failure recovery, audit checks, migration/rollback documentation and clinician review. External services, drug knowledge, coding systems, hardware, hosting and certification may incur costs even when installation software is free.

## 1. Foundation and first releasable slice

- [ ] **FND-01 — License and contribution governance | P0 | dependencies: none.** Record an OSI license decision, copyright ownership, contributor terms, dependency/license inventory and trademark/name review. Acceptance: license text and contribution guide are committed; a clean install has no mandatory proprietary runtime dependency; restricted dictionaries are optional adapters with documented terms.
- [ ] **FND-02 — Reproducible installation | P0 | FND-01.** Specify supported OS/CPU, minimum resources and a reference single-facility topology. Provide synthetic demo and production profiles, TLS, secret generation, migration preflight and health diagnostics. Acceptance: a new machine can install from documented commands; demo data cannot silently enter production; restarting preserves committed records.
- [ ] **FND-03 — Organization and authorization model | P0 | FND-02.** Model organizations, facilities, departments, locations, care teams, employment and privileges separately. Acceptance: two facilities with overlapping patient names and different policies remain isolated; a role change revokes access within a documented session-revocation target.
- [ ] **FND-04 — Safety and operational baseline | P0 | FND-01.** Create hazard register, incident owner, release checklist, backup/restore runbook and downtime packet. Proposed initial targets: RPO ≤15 minutes and RTO ≤4 hours, subject to facility approval and measured drills. Acceptance: restore into an isolated environment and reconcile record counts, signatures and audit continuity.
- [ ] **FND-05 — Synthetic encounter vertical slice | P0 | FND-02–04, REC-01–04, ORD-01–03.** Register → schedule → arrive → room → document → order → receive result → acknowledge → discharge instructions → follow-up task. Acceptance: an authorized clinician completes the flow; retries create no duplicate order; result ownership persists when the clinician is unavailable.
- [ ] **FND-06 — Architectural decisions | P0 | FND-01.** Decide transactional model, attachment storage, audit durability, event delivery, terminology service and optional openEHR persistence strategy. Acceptance: decision records explain alternatives, failure modes and migration paths; do not claim openEHR compatibility without specifying and testing the applicable models/APIs.

## 2. Patient record, documentation and results

- [ ] **REC-01 — Master patient identity | P0 | FND-03.** Support temporary unidentified patients, multiple identifiers with assigning authority, aliases, contact preferences and duplicate review. Merge only through authorized review; preserve identifier history and support controlled unmerge. Acceptance: newborn, trauma unknown, twins and two similarly named patients remain distinguishable; merge never erases source provenance.
- [ ] **REC-02 — Patient and encounter context | P0 | REC-01.** Persistent identity banner with two identifiers, encounter location/status, allergy status and visible sensitive-record controls. Acceptance: switching patients with an unsaved note prompts save/discard; a delayed response from the previous patient cannot populate the new chart.
- [ ] **REC-03 — Longitudinal clinical lists | P0 | REC-01.** Problems with onset/resolution and verification; allergies with substance, reaction, severity and source; medication history; immunizations; medical, surgical, family and social history. Acceptance: “no known allergy” differs from “not assessed”; outside information remains attributable until reconciled.
- [ ] **REC-04 — Notes and signatures | P0 | REC-02.** Draft, pend, sign, cosign, amend and entered-in-error states; autosave, concurrent editing, template version and copied-text attribution. Acceptance: two users editing cannot silently overwrite; signed text remains immutable; amendments show author/time and link to the original.
- [ ] **REC-05 — Observations and trends | P1 | REC-03.** Structured values, units, reference intervals, collection time, device/source and quality flags; graph vitals and labs without silently mixing incompatible units. Acceptance: corrected results are marked; pediatric reference ranges use the applicable age at collection; absent values never render as zero.
- [ ] **REC-06 — Inbox ownership and coverage | P0 | FND-03.** Personal/pool queues, assignment, acceptance, escalation, vacation coverage and unresolved work after staff departure. Acceptance: reassigning does not reset clinical deadlines; read, reviewed and action-completed are separate events.
- [ ] **REC-07 — Release of information | P1 | REC-03.** Record requests, authorized scope, redaction review, signed export, delivery receipt and release audit. Acceptance: exported documents exclude unauthorized segmented records and disclose amendments/provenance appropriately.

- [ ] **ORD-01 — Order lifecycle | P0 | REC-02.** Draft → signed → accepted → scheduled/collected → performed → resulted → reviewed; canceled, rejected and corrected branches with reasons. Use idempotency keys and optimistic revision checks. Acceptance: cancellation after collection triggers a reconciliation task; repeated submit does not duplicate a clinical action.
- [ ] **ORD-02 — Catalog and decision support | P0 | ORD-01.** Versioned catalog, indication, priority, specimen, route and local availability; governed order sets and interaction alerts. Acceptance: unavailable services cannot appear orderable without an explicit external route; overrides record reason; only validated rules can generate clinical warnings.
- [ ] **ORD-03 — Result closure | P0 | ORD-01, REC-06.** Distinguish preliminary/final/corrected results; ordering clinician, covering pool and escalation owner. Acceptance: critical-result workflow requires documented acknowledgement and action; a patient opening a portal result does not close clinician follow-up.
- [ ] **ORD-04 — Referrals | P1 | ORD-01.** Referral indication, urgency, documents, authorization, acceptance, appointment, consultation report and referring-team review. Acceptance: rejected or unbooked referrals return to an owned queue with aging alerts.

## 3. Department workflow packs
Each pack must specify staff roles, screen inventory, catalog, data fields, state transitions, permissions, interfaces, downtime procedure and at least one normal plus two failure simulations. Clinical thresholds and protocols require specialist approval; this document supplies no dosing or treatment rules.

| Task | Priority / dependencies | Required workflow and completion evidence |
|---|---|---|
| DEP-01 Ambulatory / primary care | P1 / FND-05 | Previsit screening → rooming → history/exam → orders → visit summary → recall. Demonstrate chronic-condition follow-up, immunization lot recording and unresolved referral tracking. |
| DEP-02 Inpatient / ADT | P1 / FND-05 | Admission → bed allocation → transfer → discharge. Handle leave, isolation, cleaning, transport and discharge cancellation; concurrent allocation cannot double-book a bed. |
| DEP-03 Nursing / eMAR | P1 / DEP-02, MED-01 | Assignment, assessments, care plans, handoff, administration and reassessment. Barcode patient/medication mismatch blocks completion; override, refusal, held dose and downtime reconciliation are attributable. |
| DEP-04 Emergency / trauma | P1 / FND-05 | Prearrival → triage → tracking board → reassessment → orders → admit/transfer/discharge. Unknown identity, boarded patient, resuscitation timeline and disposition reversal preserve timestamps and ownership. |
| DEP-05 ICU / NICU | P2 / DEP-02–03 | Device observations, ventilation documentation, lines/drains, fluids, titration records and handoff. Handle disconnected devices, late data and neonatal weight units without silent data substitution. |
| DEP-06 Surgery / anesthesia | P2 / DEP-02, MED-01 | Case request → scheduling → consent/checklist → intraoperative events → specimens/implants → PACU. Demonstrate site verification, count discrepancy, device outage and implant recall traceability. |
| DEP-07 Laboratory / microbiology | P1 / ORD-03 | Accession → collect → receive → analyze/QC → verify → report. Rejected specimen, contamination, analyzer resend and amended susceptibility retain provenance and avoid duplicate final results. |
| DEP-08 Pathology | P2 / DEP-07 | Container/cassette/slide tracking, grossing, interpretations, second review and amended report. Demonstrate specimen mismatch prevention and linkage of report to originating procedure. |
| DEP-09 Transfusion | P2 / DEP-02, DEP-07 | Specialist-validated component compatibility, inventory, issue, bedside verification, administration and reaction investigation. Quarantine/recall traces every affected unit and recipient; emergency issue is separately governed. |
| DEP-10 Radiology | P1 / ORD-03 | Protocol → schedule → acquisition → interpretation → report → follow-up. DICOM patient identity, contrast screening, critical communication, amended reports and incidental-finding ownership are verified. |
| DEP-11 Cardiology | P2 / DEP-10 | ECG/echo/stress/cath/EP worklists, structured reports, images, device data and implant follow-up. Reconcile accession and patient identity across systems. |
| DEP-12 Oncology | P2 / MED-01, DEP-07 | Diagnosis/stage → multidisciplinary plan → versioned regimen → cycle verification → preparation → infusion → toxicity follow-up. Protocol change or missing prerequisite blocks the affected workflow pending authorized review. |
| DEP-13 Obstetrics / newborn | P2 / DEP-02–03 | Prenatal episode, gestational dating, labor, delivery, postpartum and newborn record linkage. Multiple gestations, maternal/newborn identity and restricted proxy access are tested. |
| DEP-14 Pediatrics | P2 / REC-05, MED-01 | Growth/development, immunizations, age-specific forms, guardianship and transition to adolescent privacy. Validate measurement units, growth-reference version and proxy changes. |
| DEP-15 Behavioral health | P2 / SEC-02 | Therapy, assessment, safety planning, multidisciplinary treatment and jurisdiction-specific sensitive-note segmentation. Test routine care, emergency access and denied proxy disclosure. |
| DEP-16 Ophthalmology | P2 / DEP-10 | Laterality-specific acuity, refraction, pressure, imaging, diagrams, procedure and serial comparison. Wrong-eye context is visibly prevented. |
| DEP-17 Dentistry | P2 / REC-03 | Odontogram, periodontal chart, imaging, treatment plan, procedures and medical history reconciliation. Tooth/surface numbering is explicit and configurable. |
| DEP-18 Orthopedics / rehabilitation | P2 / DEP-06 | Body/laterality, injury, implants, surgery, PT/OT/speech goals and functional outcomes. Device lot recall links back to surgery and follow-up. |
| DEP-19 Dialysis / nephrology | P2 / MED-01, DEP-07 | Prescription version, access assessment, session, observations, fluid balance and follow-up. Treatment changes retain prescriber authorization and prior session context. |
| DEP-20 Transplant | P3 / DEP-02, DEP-07 | Evaluation, committee decision, waitlist interfaces, donor/recipient separation, surgery and longitudinal follow-up. Access and matching data provenance are specialist reviewed. |
| DEP-21 Endoscopy / gastroenterology | P2 / DEP-06, DEP-08 | Preparation, procedure findings/images, specimens, pathology and surveillance recall. An unreconciled pathology finding remains in a responsible clinician's queue. |
| DEP-22 Dermatology / wound care | P2 / REC-03 | Consented photography, body map, lesion/wound measurements, pathology, serial review and referrals. Media permissions match chart permissions; laterality and dates persist on export. |
| DEP-23 Neurology / sleep / pulmonary | P2 / DEP-10 | EEG/EMG/sleep/PFT workflows, device reports, structured interpretation and longitudinal measures. Version and provenance of imported interpretations remain visible. |
| DEP-24 Home health / hospice / palliative | P3 / ORD-04 | Referral, eligibility, home plan, visits, symptom documentation, equipment and transitions. Offline notes reconcile conflicts and consent; visits cannot silently close unfinished care tasks. |
| DEP-25 Other specialist packs | P3 / FND-05 | ENT, urology, rheumatology, endocrinology, infectious disease, pain, genetics, nutrition and occupational medicine each receive an independently reviewed pack with forms, terminology, orders, outcomes and failure simulations. One generic template does not count as department completion. |

- [ ] **MED-01 — Closed medication loop | P1 | ORD-01, REC-03.** Prescribe → verify → prepare/dispense → administer → monitor → reconcile. Preserve formulary version, dose units, route, timing, indication and stop reason. Acceptance: discontinued orders stop future scheduled administrations through an explicit reconciliation path; duplicates, stale weight and unit mismatch are tested.
- [ ] **MED-02 — Inventory and controlled medications | P2 | MED-01.** Lot/expiry, stock movement, cold-chain exceptions, returns, recall, compounding and witnessed waste. Acceptance: quarantine blocks dispensing; every adjustment is attributable; recall finds stock and exposed patients.
- [ ] **MED-03 — External prescriptions and devices | P2 | MED-01.** Pluggable eRx, dispensing cabinets and pump integrations with acknowledgement/reconciliation. Acceptance: a timeout never appears as success; retransmission preserves the originating order identity.

## 4. Patient access and hospital operations

- [ ] **OPS-01 — Scheduling | P1 | REC-01.** Appointment types, provider/resource calendars, duration, referral requirements, waitlist offers and cancellation. Acceptance: concurrent bookings cannot reserve the same exclusive slot; offers expire; patients receive timezone-correct confirmations.
- [ ] **OPS-02 — Portal and proxies | P1 | SEC-02, REC-03.** Identity enrollment, results, summaries, refills, messages, appointments, questionnaires, video visits and export. Acceptance: proxy revocation applies to cached sessions and downloads requiring new authorization; results release follows facility policy and retains clinician ownership.
- [ ] **OPS-03 — Billing | P2 | OPS-01, ORD-01.** Coverage → estimate → charge → coding review → claim → remittance → denial/appeal → payment/reconciliation. Acceptance: amended charges remain traceable; refunds and duplicate remittances reconcile; external payment adapters use tokens and signed events.
- [ ] **OPS-04 — Country adapters | P2 | OPS-03.** Separate eligibility, eRx, claims, public health and consent policy packages by jurisdiction. Acceptance: each adapter identifies authority/source version, certification prerequisites, licensing and test environment; a country pack is never enabled by an unsupported compliance checkbox.
- [ ] **OPS-05 — Health information management | P2 | REC-04, REC-07.** Deficiency queues, coding queries, document indexing, chart completion, retention/legal hold and disclosure review. Acceptance: queries preserve clinician authorship; retention cannot delete records on active legal hold.
- [ ] **OPS-06 — Population health and outreach | P2 | ORD-03.** Versioned cohorts, care gaps, outreach preferences, assigned interventions and outcomes. Acceptance: cohort membership is reproducible for a stated date; consent and contact suppression apply before sending.
- [ ] **OPS-07 — Analytics and research | P2 | SEC-02.** Role-scoped operational dashboards, warehouse export, research authorization, de-identification review and reproducible measures. Acceptance: small-cell disclosure and row-level access controls are tested; no patient-level research export bypasses approval.
- [ ] **OPS-08 — Enterprise support | P2 | DEP-02.** Transfer center, transport, environmental services, dietary, supply procurement, staffing, asset maintenance and infection prevention queues. Acceptance: every request has status, owner, escalation and closure evidence; dietary actions reconcile allergy/diet restrictions.
- [ ] **OPS-09 — Mobile and community access | P2 | SEC-01.** Role-specific clinician/nurse mobile flows, community-provider portal, external referral/status and scoped record sharing. Acceptance: device loss revokes access; push notifications contain no unnecessary sensitive data.
- [ ] **OPS-10 — Training and adoption | P1 | FND-05.** Role-based sandbox, guided exercises, competency records, super-user support and release notes. Acceptance: users practice on synthetic patients; help content links to the exact deployed workflow version.

## 5. Roles and permission specification
Roles are permission bundles, not a hierarchy where administrators inherit clinical powers. Scope each permission by facility, patient relationship, purpose and consent. Privileged technical access is time-bound and separately audited.

| Role | Default scope and actions | Explicit boundary to verify |
|---|---|---|
| Patient / proxy | Own permitted records, scheduling, messages, requests | No other patient access; proxy consent/age restrictions |
| Registrar / scheduler | Identity, coverage, appointments | No routine sensitive clinical note access |
| Nurse / charge nurse | Assigned care, assessments, eMAR, handoff | No prescribing unless separately credentialed |
| Physician / consultant | Related charts, notes, diagnoses, approved ordering/signing | Privileges constrained by credential and facility |
| Student / resident | Draft and locally approved supervised actions | Required cosign cannot be bypassed |
| Pharmacist / technician | Verification, preparation, dispensing as credentialed | Technician cannot inherit pharmacist clinical approval |
| Laboratory / imaging staff | Relevant worklists and results/report functions | Final verification requires the relevant credential |
| Therapist / social worker / dietitian | Assigned plans, assessments and permitted orders | Sensitive notes and prescribing separately scoped |
| Billing / coder | Necessary coding, charges, claims and queries | Cannot alter signed clinician documentation |
| Researcher / analyst | Approved cohort and purpose-limited data | No unrestricted production chart browsing |
| Facility administrator | Configuration, staffing and approved assignments | No automatic chart access or clinical signature |
| IT / security auditor | Operations or audit investigation | PHI access requires explicit approved scope |
| Integration / AI service | Machine scopes with expiry and provenance | Cannot assume a user's privileges from supplied text |

- [ ] **SEC-01 — Authentication and session control | P0 | FND-03.** MFA/passkeys, SSO, emergency accounts, session/device revocation, credential recovery and service identity rotation. Acceptance: revoke and reauthenticate on privilege elevation; emergency access does not disable audit.
- [ ] **SEC-02 — Policy engine and consent | P0 | SEC-01.** Deny by default, server-side object-level checks, segmented notes, proxy rules and time-bound break-glass with review. Acceptance: identical authorization applies to search snippets, attachments, exports, notifications and AI retrieval.
- [ ] **SEC-03 — Audit, encryption and recovery | P0 | FND-04.** Append-only audit with integrity verification, encryption/key management, secret rotation and isolated backup access. Acceptance: audit pipeline outage follows documented fail-safe behavior; tampering is detected; restoration does not restore revoked credentials as active.
- [ ] **SEC-04 — Secure delivery | P0 | FND-02.** Threat model, dependency checks, secret scanning, signed release artifacts and vulnerability reporting. Acceptance: release manifests identify all components; a critical vulnerability has a documented owner, mitigation and disclosure path.

## 6. Original GUI and interaction specification

- [ ] **UX-01 — Design tokens | P0 | none.** Start with navy #17324D, teal #087F8C, background #F6F8FA, surface #FFFFFF, text #17212B, border #D6DEE5, success #237A57, warning #9B6500 and danger #B42318. These are original proposed colors, not Epic's palette. Define semantic tokens for every theme; measure contrast per actual foreground/background pairing before approval.
- [ ] **UX-02 — Workspace shell | P0 | REC-02.** Role landing page, patient search, persistent identity banner, chart navigation, main workspace and collapsible task/results panel. Acceptance: changing panel state never hides active patient identity; keyboard traversal is predictable and supports screen readers.
- [ ] **UX-03 — Screen inventory | P1 | UX-02.** Specify appointment calendar, check-in, rooming, chart summary, note editor, order composer, result viewer, inbox, bed/ED boards, eMAR, pharmacy queue, lab accession, imaging worklist, portal and administration. Each screen needs empty/loading/error/stale/offline/forbidden states.
- [ ] **UX-04 — Clinical density and accessibility | P1 | UX-01.** Desktop/tablet layouts, adjustable text and density, light/dark/high contrast, keyboard shortcuts, focus visibility and WCAG 2.2 AA verification. Acceptance: 200% zoom supports core tasks; status uses text/icon as well as color; critical controls remain understandable in grayscale.
- [ ] **UX-05 — Localization | P1 | UX-02.** English/Arabic RTL, explicit calendar/timezone, units, translated education and local identifiers. Acceptance: medication numerals/units and identifiers remain unambiguous in RTL; translations have clinical review and version history.
- [ ] **UX-06 — Alert and signature design | P0 | ORD-02.** Separate blocking safety constraints, interruptive alerts, inline notices and informational banners. Acceptance: users can see alert rationale, evidence/version and permitted override; sign/submit confirms patient, encounter and final content.
- [ ] **UX-07 — Measured usability | P1 | FND-05.** Establish baseline time, clicks, error/recovery and workload for registration, medication review, note signing and result closure. Acceptance: representative staff and patients complete synthetic tasks; release records show unresolved usability hazards.

## 7. AI delivery specifications
The following are our requirements. Public Epic names describe comparison categories, not copied internals or a promise of equivalent performance.

- [ ] **AI-01 — Source-grounded chart summary | P2 | SEC-02, REC-03.** Retrieve only authorized content; every clinical statement links to source/date and distinguishes uncertainty or conflicting records. Acceptance: evaluation includes stale medication lists, negation, wrong-patient traps and missing evidence; unsupported answers abstain.
- [ ] **AI-02 — Ambient draft documentation | P2 | REC-04, SEC-02.** Consent/recording indicator, pause/delete controls, speaker attribution, draft note and proposed orders. Acceptance: clinician edits and signs; no generated action bypasses normal validation; audio retention/deletion is configurable and audited.
- [ ] **AI-03 — Nursing and inbox drafts | P2 | REC-06, DEP-03.** Draft handoffs, flowsheet suggestions and patient-message responses with source context. Acceptance: generated entries remain uncommitted until approved; urgent messages route under approved escalation policy; unsupported suggestions are visibly rejected.
- [ ] **AI-04 — Patient assistant | P2 | OPS-02.** Navigation, appointment options, billing explanation, approved education and human escalation. Acceptance: tool actions recheck identity, consent and current slot/balance; medical concerns use approved escalation; no open-ended diagnostic automation.
- [ ] **AI-05 — Revenue assistance | P2 | OPS-03.** Suggested codes, documentation queries and denial/appeal drafts. Acceptance: every suggestion references source documentation and code-set version; authorized staff approve submissions; no fabricated justification.
- [ ] **AI-06 — Governed agent tools and connectors | P3 | SEC-04.** Typed tool registry, scoped credentials, expiry, dry-run, human approval for consequential actions, idempotency, audit and kill switch. Acceptance: malicious text inside a chart cannot grant privileges; retries do not duplicate orders/payments; connector failure exposes a recoverable pending state.
- [ ] **AI-07 — Deployment and evaluation | P2 | AI-01.** Optional local inference, provider adapter, approved data-use contract, model/prompt versions, cost budgets and fallback without AI. Acceptance: measure omissions, hallucinations, language/group performance, privacy leakage and prompt injection on a held-out synthetic/approved dataset; deployment-specific thresholds must be approved before rollout.

## 8. Interoperability and verification

- [ ] **INT-01 — FHIR/SMART contract | P0 | FND-03, REC-03.** Specify supported FHIR version, profiles, search parameters, CapabilityStatement and SMART scopes/launch contexts. Acceptance: run contract tests for supported resources, pagination, consent filtering and rejected writes; do not label unsupported resources conformant.
- [ ] **INT-02 — Interface engine | P1 | ORD-01.** HL7 v2, DICOM/DICOMweb and regional adapters with mapping versions, acknowledgements, retry/backoff, quarantine and operator reconciliation. Acceptance: duplicate, out-of-order and malformed messages cannot corrupt a signed record.
- [ ] **INT-03 — Terminology | P0 | ORD-02.** Versioned clinical coding, UCUM units, local aliases, licensed/open terminology packages and retired concept handling. Acceptance: the record preserves the code system/version as entered; mappings expose uncertainty and never silently replace clinical meaning.
- [ ] **INT-04 — Migration | P1 | INT-01–03.** Field mapping, identity matching, trial import, clinician reconciliation, cutover freeze and rollback. Acceptance: reconcile counts and sampled meaning, preserve provenance/attachments, and place unresolved mappings into an owned queue.

| Gate | Required evidence before marking complete |
|---|---|
| G0 Foundation | License decision; synthetic install; tenant denial tests; durable audit; successful isolated restore |
| G1 Outpatient pilot candidate | FND-05 scenario; concurrent edits; duplicate order retry; abnormal/corrected result closure; clinician usability review |
| G2 Hospital pilot candidate | Medication/barcode mismatch; ADT conflict; downtime reconciliation; critical result coverage; department specialist sign-off |
| G3 Specialty deployment | Pack-specific hazards, interfaces, training, migration and operational owner verified at the actual facility |
| G4 AI pilot | Approved task scope and data use; held-out evaluations; permission/injection tests; human review; rollback/kill switch exercised |

A gate is evidence for review, not certification or permission for unsupervised clinical deployment. Production use requires the relevant facility's clinical, security, privacy, operational and jurisdiction-specific approvals.

## 9. Public capability evidence register
Checked on 2026-11-12. Only concise comparison claims below are sourced to Epic; the detailed tasks above are independent product requirements. Marketing announcements do not establish universal availability, exact entitlements, independent effectiveness or complete specifications.

| Source | Public comparison claim and status |
|---|---|
| [Epic software overview](https://www.epic.com/software/) | Public navigation identifies major clinical, patient, enterprise and specialty domains; use as category discovery rather than a complete feature catalog. |
| [AI Charting announcement, 2026-02-04](https://www.epic.com/epic/post/epic-ai-charting-rolls-out-alongside-an-expanding-set-of-built-in-ai-capabilities/) | Epic reports release of AI Charting under Art, with documentation drafts and proposed orders; describes Emmie patient assistance and Penny operational/billing work. Vendor-reported availability and outcomes require local verification. |
| [Agent Factory Connectors announcement, 2026-10-21](https://www.epic.com/epic/post/introducing-connectors-a-new-way-for-apps-to-communicate-with-epic/) | Epic describes developer-built external connections for information retrieval and actions. Announcement uses prospective examples; it does not prove every described integration is generally available. |
| [Agent Factory build-a-thon](https://www.epic.com/epic/post/at-agent-factory-build-a-thon-health-systems-create-their-own-ai-agents/) | Public example of customer agent creation; not an open implementation specification or general release guarantee. |

- [ ] **RES-01 — Expand verified comparison inventory | P1.** For each named module in the master backlog, capture direct primary-source URL, publication/access date, exact supported capability, availability qualifier and independent task IDs. Mark unverified names/claims explicitly; absence of public evidence does not imply absence of a feature.
- [ ] **RES-02 — Maintain current scope | P1.** Review new public announcements at each planning revision, separate announced/pilot/released/customer-specific claims, and record changes. “Everything through today” remains a research goal, not a claim of exhaustive proprietary knowledge.

## 10. First implementation sequence
1. Assign FND-01–04 and SEC-01–04 with accountable reviewers; resolve license and architecture decisions.
2. Build REC-01–04, REC-06, ORD-01–03, INT-01/03 and UX-01/02/06 as the outpatient vertical slice.
3. Demonstrate FND-05 using synthetic patients and collect G0/G1 evidence.
4. Add OPS-01/02, clinician training and the first ambulatory pack.
5. Expand medication, hospital and diagnostics workflows only after the shared core has passed its gates.
6. Add specialties and optional AI under their own verification gates; keep core installation usable without AI or paid external services.
