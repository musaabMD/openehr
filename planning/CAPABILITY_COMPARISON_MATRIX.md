# Capability comparison and gap register
Snapshot: 2026-11-12. All implementation and validation scores are zero: this repository contains specifications only.

## Honest scoring
This is a bounded comparison set, not a complete Epic feature inventory. A row with category evidence confirms only the stated category or short capability, not the detailed acceptance requirement we independently propose. Private features, exact entitlements and customer configurations are unknown.

For every row: specification status = PARTIAL (a linked task exists; detailed contracts, mockups and clinician sign-off are pending); implementation = 0; clinical validation = 0; owner = UNASSIGNED; evidence artifact = NONE. These defaults apply explicitly to every row below. Source publication date is undated unless supplied below; access date is 2026-11-12.

Evidence codes:
- S: [Epic specialties](https://www.epic.com/software/specialties/), public overview, capability-level evidence only.
- H: [Epic health systems](https://www.epic.com/software/health-systems-and-clinics/), broad domain evidence.
- P: [Epic patient experience](https://www.epic.com/software/patient-experience/), public capability description.
- I: [Epic interoperability](https://www.epic.com/software/interoperability/), public capability description.
- A: [AI announcement, 2026-02-04](https://www.epic.com/epic/post/epic-ai-charting-rolls-out-alongside-an-expanding-set-of-built-in-ai-capabilities/), vendor-reported release/offerings; local availability unverified.
- C: [Connectors announcement, 2026-10-21](https://www.epic.com/epic/post/introducing-connectors-a-new-way-for-apps-to-communicate-with-epic/), announced capability with prospective examples; universal availability not established.
- U: no granular Epic evidence verified for this row in this revision. Requirement comes from our backlog; not counted in verified comparison denominator.
- N: independent project objective; excluded from Epic comparison denominator.

Rows link by task ID to [delivery backlog](DETAILED_DELIVERY_BACKLOG.md), [offline/performance](OFFLINE_AND_PERFORMANCE.md), [hospital GUI](HOSPITAL_GUI_SPEC.md), or the gap tasks below. Resolve a task by its unique ID, not a guessed feature equivalence.

Weight is 3 for P0, 2 for P1, 1 for P2/P3; these are initial planning weights, not clinical risk scores. Before implementation starts, freeze a versioned baseline with clinician-approved atomic criteria and weights. Split broad rows as needed and record denominator changes; never inflate completion by adding trivial rows.

Calculate independently:
- Verified evidence coverage = source-supported comparison rows / all candidate comparison rows (exclude N). This measures research completeness, not product parity.
- Implementation coverage = sum(weight × implemented pass fraction) / sum(weight) over the frozen source-supported set.
- Validation coverage = sum(weight × deployment-validated pass fraction) / the same denominator.
- Specification completion requires approved detailed contract and test scenarios; a task mention is not completion.
- A pass fraction requires predeclared atomic acceptance tests and linked results. Do not blend documentation, implementation and validation into one “matches Epic” percentage.
- Unknown/private features stay visible as unknown and never silently count as passed. Publish per-department scores, denominator/version, excluded rows and evidence date beside any overall number.

## Record and clinical foundation

| ID | Capability / our requirement | Evidence | Task | Priority | Required demonstration |
|---|---|---|---|---|---|
| CMP-001 | Patient identity and duplicate reconciliation | U | REC-01 | P0 | Merge/unmerge and assigning authority scenarios |
| CMP-002 | Persistent patient/encounter context | U | REC-02 | P0 | Delayed response cannot cross patient context |
| CMP-003 | Problems and history | U | REC-03 | P0 | Temporal states and source reconciliation |
| CMP-004 | Allergies and intolerance | U | REC-03 | P0 | Unknown versus negative and corrected history |
| CMP-005 | Medication history reconciliation | U | MED-01 | P0 | External/current/stopped list reconciliation |
| CMP-006 | Clinical notes and amendments | U | REC-04 | P0 | Concurrent edit and immutable signature |
| CMP-007 | Order lifecycle | U | ORD-01 | P0 | Retry, cancel-after-collection and stale revision |
| CMP-008 | Results follow-up | U | ORD-03 | P0 | Critical/corrected result escalation |
| CMP-009 | Coverage and inbox ownership | U | REC-06 | P0 | Vacation/departure never abandons task |
| CMP-010 | Observations and trends | U | REC-05 | P1 | Unit conversion and missing-value scenarios |
| CMP-011 | Immunizations and clinical content | U | DEP-01 | P1 | Lot, schedule provenance and recall |
| CMP-012 | Clinical decision-support rules | U | ORD-02 | P0 | Validated rule/version and override audit |
| CMP-013 | Release of information | U | REC-07 | P1 | Segmented-record export denial |
| CMP-014 | Referral closure | U | ORD-04 | P1 | Rejected/unbooked referral ownership |

## Care settings

| ID | Capability / our requirement | Evidence | Task | Priority | Required demonstration |
|---|---|---|---|---|---|
| CMP-015 | Primary care domain | H | DEP-01 | P1 | End-to-end ambulatory scenario |
| CMP-016 | Inpatient care domain | H | DEP-02 | P1 | ADT and discharge reversal |
| CMP-017 | Post-acute care domain | H | DEP-24 | P3 | Transition and home episode |
| CMP-018 | Access/revenue domain | H | OPS-03 | P2 | Claim/remittance reconciliation |
| CMP-019 | Research domain | H | OPS-07 | P2 | Approved reproducible cohort export |

## Specialties

| ID | Capability / our requirement | Evidence | Task | Priority | Required demonstration |
|---|---|---|---|---|---|
| CMP-020 | Cardiology structured reporting | S | DEP-11 | P2 | Accession, report and imaging linkage |
| CMP-021 | Dental treatment workflows | S | DEP-17 | P2 | Tooth/surface and medical context |
| CMP-022 | Dermatology longitudinal findings | S | DEP-22 | P2 | Consent and lesion provenance |
| CMP-023 | Emergency care workspace | S | DEP-04 | P1 | Unknown patient and reassessment |
| CMP-024 | Endoscopy procedure reporting | S | DEP-21 | P2 | Finding/image/specimen linkage |
| CMP-025 | Genomic care information | S | DEP-25 | P3 | Variant provenance and access controls |
| CMP-026 | Clinical laboratory workflow | S | DEP-07 | P1 | Specimen rejection and analyzer retry |
| CMP-027 | Anatomic pathology workflow | S | DEP-08 | P2 | Container/slide and amended report |
| CMP-028 | Dialysis care planning | S | DEP-19 | P2 | Prescription/session reconciliation |
| CMP-029 | Obstetric documentation | S | DEP-13 | P2 | Multiple gestation and newborn identity |
| CMP-030 | Oncology treatment planning | S | DEP-12 | P2 | Protocol version and prerequisites |
| CMP-031 | Ophthalmology diagnostics | S | DEP-16 | P2 | Laterality and serial testing |
| CMP-032 | Orthopedic documentation | S | DEP-18 | P2 | Body location and implant traceability |
| CMP-033 | Radiology exam workflow | S | DEP-10 | P1 | Critical/incident finding closure |
| CMP-034 | Perioperative documentation | S | DEP-06 | P2 | Pre/intra/post continuity |
| CMP-035 | Transplant longitudinal workflow | S | DEP-20 | P3 | Evaluation through follow-up |

## Patient experience

| ID | Capability / our requirement | Evidence | Task | Priority | Required demonstration |
|---|---|---|---|---|---|
| CMP-036 | Cross-organization patient account hub | P | GAP-01 | P2 | Account linking with revocation |
| CMP-037 | Digital access to care | P | OPS-02 | P1 | Authorized scheduling and requests |
| CMP-038 | Patient CRM | P | GAP-02 | P2 | Purpose-scoped contact workflow |
| CMP-039 | Home care-plan support | P | GAP-03 | P2 | Assigned alerts and response ownership |
| CMP-040 | Wearable data ingestion | P | GAP-03 | P2 | Device provenance and missing data |
| CMP-041 | Remote monitoring | P | GAP-03 | P2 | Threshold ownership and downtime |
| CMP-042 | Time-limited record sharing | P | GAP-04 | P2 | Expiry and sensitive-record filtering |
| CMP-043 | Patient financial access | P | OPS-03 | P2 | Estimates and reconciled payment |

## Exchange

| ID | Capability / our requirement | Evidence | Task | Priority | Required demonstration |
|---|---|---|---|---|---|
| CMP-044 | Cross-EHR record exchange | I | INT-02 | P1 | Identity/consent and correction reconciliation |
| CMP-045 | Community deployment model | I | GAP-05 | P3 | Organization boundary and operating agreement |
| CMP-046 | Patient-directed FHIR exchange | I | INT-01 | P1 | Scoped export and revocation |
| CMP-047 | Community-provider chart access | I | OPS-09 | P2 | Referral-related access restrictions |
| CMP-048 | Payer/provider data exchange | I | GAP-06 | P2 | Purpose/contract and freshness |
| CMP-049 | Electronic interorganization referral | I | ORD-04 | P1 | Receipt and response ownership |

## AI

| ID | Capability / our requirement | Evidence | Task | Priority | Required demonstration |
|---|---|---|---|---|---|
| CMP-050 | Ambient note drafts and proposed orders | A | AI-02 | P2 | Clinician approval and evidence links |
| CMP-051 | Patient conversational assistance | A | AI-04 | P2 | Scoped actions and escalation |
| CMP-052 | Billing/operations assistance | A | AI-05 | P2 | Source-grounded human-reviewed output |

## Agent connections

| ID | Capability / our requirement | Evidence | Task | Priority | Required demonstration |
|---|---|---|---|---|---|
| CMP-053 | External agent retrieval/action connectors | C | AI-06 | P3 | Tool scopes, idempotency and kill switch |

## Additional requirements requiring granular Epic evidence

| ID | Capability / our requirement | Evidence | Task | Priority | Required demonstration |
|---|---|---|---|---|---|
| CMP-054 | Nursing assignments and handoff | U | DEP-03 | P1 | Receiver acceptance and overdue work |
| CMP-055 | Barcode medication administration | U | MED-01 | P1 | Mismatch, stopped dose and refusal |
| CMP-056 | Pharmacy verification and compounding | U | MED-02 | P2 | Verifier privileges and lot traceability |
| CMP-057 | ICU/NICU device charting | U | DEP-05 | P2 | Disconnected device and time skew |
| CMP-058 | Blood bank and transfusion | U | DEP-09 | P2 | Specialist-approved compatibility scenario |
| CMP-059 | Pediatric growth and proxy privacy | U | DEP-14 | P2 | Reference version and adolescent rules |
| CMP-060 | Behavioral health segmentation | U | DEP-15 | P2 | Sensitive notes and emergency access |
| CMP-061 | PT/OT/speech functional outcomes | U | DEP-18 | P2 | Versioned instruments and goals |
| CMP-062 | Fertility and embryology depth | U | GAP-07 | P3 | Chain of identity and cycle record |
| CMP-063 | Radiation oncology depth | U | GAP-08 | P3 | Plan provenance and treatment reconciliation |
| CMP-064 | Home health/hospice depth | U | DEP-24 | P3 | Offline visits and clinical handover |
| CMP-065 | Health plan administration | U | GAP-06 | P3 | Enrollment, benefits and adjudication |
| CMP-066 | Supply/transport/dietary/cleaning | U | OPS-08 | P2 | Owned queue and closure |
| CMP-067 | Quality measures/registries | U | OPS-06 | P2 | Versioned reproducible denominator |
| CMP-068 | Research trials and biobanking | U | GAP-09 | P3 | Consent, specimen and study version |
| CMP-069 | Coding and documentation queries | U | OPS-05 | P2 | No altered signed clinical authorship |
| CMP-070 | Migration and historical provenance | U | INT-04 | P1 | Count and semantic reconciliation |
| CMP-071 | Training and implementation tools | U | OPS-10 | P1 | Role competency and versioned guide |
| CMP-072 | Mobile clinician/nurse workflows | U | OPS-09 | P2 | Device revocation and scoped display |
| CMP-073 | Occupational/rehab/long-term care | U | GAP-10 | P3 | Distinct episode and transitions |
| CMP-074 | MFA, roles and consent | U | SEC-01/02 | P0 | Server-side object authorization |
| CMP-075 | Audit and encryption | U | SEC-03 | P0 | Integrity and recovery test |
| CMP-076 | Disaster recovery and availability | U | OFF-11 | P0 | Restore and partition fencing |
| CMP-077 | Terminology/licensed content | U | INT-03 | P0 | Code version and package licensing |

## Project-specific quality objectives; no Epic equivalence claimed

| ID | Capability / our requirement | Evidence | Task | Priority | Required demonstration |
|---|---|---|---|---|---|
| CMP-078 | Internet-independent local hospital | N | OFF-01/12 | P0 | 72-hour blackout scenario |
| CMP-079 | Disconnected workstation downtime | N | OFF-04/05 | P1 | Cache expiry and durable draft |
| CMP-080 | Conflict-safe synchronization | N | OFF-06/07 | P0 | Duplicate/reordered/stale events |
| CMP-081 | Measured hospital performance | N | PERF-01–06 | P1 | Seeded p95/p99 report |
| CMP-082 | Original accessible hospital GUI | N | HUI-01–33 | P1 | Usability and safety validation |
| CMP-083 | English/Arabic and RTL | N | HUI-26 | P1 | Clinical language review |
| CMP-084 | Optional self-hosted AI | N | OFF-13 | P2 | No cloud dependency for manual care |
| CMP-085 | Free install and open-source license | N | FND-01/02 | P0 | OSI license and independent install |

## Newly explicit gap tasks
Each is unchecked and inherits the delivery contract: data model, API, permissions, versioned UI, hazards, localization, offline behavior, failure recovery and specialist verification. These are independent designs, not inferred proprietary internals.

- [ ] **GAP-01 P2 — Patient federation.** Opt-in organization account links, identity proofing, scoped consent and unlink/recovery. Acceptance: unlink revokes future shared access; similarly named patients cannot be linked without verification.
- [ ] **GAP-02 P2 — CRM/contact center.** Contact history, consent/preferences, identity verification, script versions, case ownership and escalation. Acceptance: billing agent sees minimum necessary context; mistaken contact and proxy identity are tested.
- [ ] **GAP-03 P2 — Remote monitoring and home plans.** Enroll devices, validate units/time, track source quality, assign alert coverage and expose outages. Acceptance: duplicated/missing/out-of-range device values enter review; no implication of continuous staffed monitoring unless operationally provided.
- [ ] **GAP-04 P2 — Patient-directed sharing.** Time-bound, recipient-scoped record view with authentication, minimum data, explicit excluded sensitive segments and audit. Acceptance: expiry, revocation, wrong recipient and amended records tested; downloaded copies cannot be remotely revoked and that limit is disclosed.
- [ ] **GAP-05 P3 — Community hosting.** Hub/affiliate governance, separate privileges, ownership, service agreements, upgrades, cost transparency and exit export. Acceptance: affiliate boundary tests and an independently restorable exit package.
- [ ] **GAP-06 P3 — Health-plan platform and exchange.** Model enrollment, benefits, contracts, utilization/authorization, claims adjudication, appeals, provider directory and care management as separate bounded domains. Acceptance: country-specific rules/version, payer-provider purpose boundaries and duplicate/remittance reconciliation tested; exchange can ship before full plan administration.
- [ ] **GAP-07 P3 — Fertility/embryology.** Episodes/cycles, specimen identity, consent, storage location, witnessing, custody and outcome linkage under specialist governance. Acceptance: custody interruption and identity mismatch block the affected process; no unreviewed procedure rules.
- [ ] **GAP-08 P3 — Radiation oncology.** Consultation, staging, external planning-system interfaces, plan/version approval, course/fraction documentation, equipment QA references and delivered-treatment reconciliation. Acceptance: stale plan or mismatched patient cannot be treated as approved; delivery hardware remains separately certified.
- [ ] **GAP-09 P3 — Trials and biobanking.** Study/protocol versions, eligibility review, consent/reconsent, visits, adverse-event reporting, investigational product accountability and specimen custody. Acceptance: withdrawn/expired consent blocks new prohibited use; trial edits preserve source record.
- [ ] **GAP-10 P3 — Long-term and occupational care.** Distinct long-term assessments/care plans and workforce fitness/exposure episodes, with separation of employer-accessible output from confidential care records. Acceptance: transitions retain ownership and employer cannot browse full worker chart.
- [ ] **GAP-11 P1 — Remaining-specialty decomposition.** Split DEP-25 into separate ENT, urology, rheumatology, endocrinology, infectious disease, neurology, pain, nutrition, sleep and occupational specifications. Acceptance: each gets clinician owner, data dictionary, screens, lifecycle, integration contract and normal/failure scenarios; a grouped row is not complete specialty coverage.
- [ ] **GAP-12 P1 — Clinical content operations.** Govern formularies, interaction evidence, order sets, calculators, immunization schedules and quality measures with license/source, effective date, review, impact assessment and withdrawal path. Acceptance: local/offline package integrity and stale-content alerts tested; no clinical rule activated solely from generated text.
- [ ] **GAP-13 P1 — Public evidence expansion.** Assign research owner, verify U rows using direct primary sources, split overly broad claims, record availability and retain superseded snapshots. Acceptance: every reclassified row cites the precise support; unavailable details remain unknown.
- [ ] **GAP-14 P1 — Procurement and site readiness.** Hardware sizing, printer/scanner/device compatibility, onboarding, migration, clinician training, accessibility, support/escalation and go-live rollback. Acceptance: site rehearses normal shift, surge, downtime and recovery; independent clinical/operational sign-off recorded.

## Baseline result
Current implemented coverage: 0%. Current clinically validated coverage: 0%. Specification readiness is partial and not assigned an invented percentage. Research rows are a starting inventory; expanding them is required before any defensible claim of broad parity. Hospital GUI, offline operation and performance targets are proposed requirements, not demonstrated advantages over Epic.
