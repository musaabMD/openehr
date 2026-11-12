# Epic versus our EHR plan — feature-by-feature review
Research and repository baseline: 2026-11-12, main commit 15cba2ffd60aa7a3f80bb3981373e2a58376087c. Scope: public product descriptions plus identified first-party customer evidence. This review assesses the existing plan BEFORE the new recommendations below; recommendations do not retroactively improve its score.

## Finding
190 comparison rows: **74 represented by explicit tasks (R), 74 broad/partial (B), 42 specific gaps (G)**. Ten rows separately have unverified Epic comparison evidence. These categories describe planning coverage only. All 190 rows have implementation = 0 and deployment validation = 0.

The plan is broad enough to organize enterprise EHR development, but is not an engineering-complete substitute for Epic. The largest explicit gaps found in this review concern communications, guest access, social-resource coordination, payer portal/network operations, specialty variants, specific AI workflows and governed shared research data.

## Meaning of status and evidence
- **R — Represented:** a comparable requirement and task-level acceptance intent exist. Fields, APIs, complete exceptions, prototypes, validated content and clinician sign-off still need implementation-level specification.
- **B — Broad/partial:** a general umbrella exists but does not specify this particular workflow adequately.
- **G — Gap:** the compared specific requirement has no explicit task in the baseline; the new requirement ID is a recommendation to add it.
- **U evidence:** Epic's exact feature or equivalence has not been verified here. This does not mean Epic lacks it.
- **Capability/listed:** a primary product page names the feature. This is vendor-reported product scope, not independent effectiveness or universal general availability.
- **Customer example/documentation:** evidence of the named customer's use, not every Epic installation.
- **Announced:** roadmap/announcement evidence; do not score as universally deployed.

No “fully matched” status is awarded. “Best GUI,” “faster,” “safer,” and “better offline” require matched evidence, not a planning checkbox. We do not have access to proprietary configuration libraries, every customer workflow, or all private roadmap material. This review is deliberately scoped rather than advertised as every Epic feature.

## How to read the rows
Feature labels summarize public capabilities; next-action columns are our independently designed requirements and reviewer judgments, not Epic implementation details. Follow task IDs in [delivery backlog](DETAILED_DELIVERY_BACKLOG.md), [gap register](CAPABILITY_COMPARISON_MATRIX.md), [GUI specification](HOSPITAL_GUI_SPEC.md) and [offline/performance](OFFLINE_AND_PERFORMANCE.md). “master §” refers to numbered sections of the [master blueprint](EPIC_INSPIRED_EHR_MASTER_BACKLOG.md). NEW IDs are specified later in this document. Every row has owner UNASSIGNED and evidence artifact NONE until assigned.

## Core chart and outpatient care

| ID | Epic capability or comparison question | Evidence | Plan | Existing/new task | What is still required |
|---|---|---|---|---|---|
| EP-001 | Shared patient chart | [E01][E01]; overview | R | REC-01–05 | Define cross-encounter retrieval and reconciliation contract |
| EP-002 | Chronic-condition workflows | [E01][E01]; capability | R | DEP-01 | Specify condition packs and approved measures |
| EP-003 | Telehealth/e-visits | [E01][E01]; capability | B | master §4; OPS-02 | Add separate asynchronous e-visit triage, response and closure |
| EP-004 | Preventive care-gap recall | [E01][E01]; capability | R | OPS-06 | Specify schedule versions, exception handling and outreach ownership |
| EP-005 | Behavioral screening and treatment | [E01][E01]; capability | R | DEP-15 | Add instruments, scoring provenance and setting-specific safety cases |
| EP-006 | Convenient/employee-health care | [E01][E01]; capability | B | GAP-10 | Separate employer reports from confidential medical record |
| EP-007 | Pediatric visit acceleration | [E01][E01]; customer example | B | DEP-14; HUI-28 | Create reviewed single-visit checklist with safe defaults |

## Inpatient, nursing and communications

| ID | Epic capability or comparison question | Evidence | Plan | Existing/new task | What is still required |
|---|---|---|---|---|---|
| EP-008 | Hospital care plans | [E02][E02]; capability | R | DEP-02/03 | Specify interdisciplinary goal revision and handoff |
| EP-009 | Critical-care workspace | [E02][E02]; capability | R | DEP-05 | Specify observation/device reconciliation at bedside |
| EP-010 | Pharmacy ordering | [E02][E02]; capability | R | MED-01 | Define prescribing-to-verification transitions |
| EP-011 | Pharmacy verification/preparation | [E02][E02]; capability | R | MED-01/02 | Separate qualified verification, preparation and release |
| EP-012 | Pharmacy dispensing/administration | [E02][E02]; capability | R | MED-01/03 | Test cabinet/pump/administration acknowledgements |
| EP-013 | Pharmacy inventory | [E02][E02]; capability | R | MED-02 | Specify discrepancy and recall reconciliation |
| EP-014 | Infection surveillance (Bugsy) | [E02][E02]; capability | B | OPS-08; DEP-25 | Add case definitions, suspected/confirmed states and reporting review |
| EP-015 | Case-manager task tracking | [E02][E02]; capability | B | OPS-08 | Create dedicated case-management worklist and ownership model |
| EP-016 | Utilization review | [E02][E02]; capability | B | master §13; GAP-06 | Specify concurrent review, evidence, deadlines and appeal |
| EP-017 | Post-acute placement requests | [E02][E02]; capability | B | DEP-24; OPS-08 | Track facility offers, acceptance, authorization and canceled placement |
| EP-018 | Bedside care access | [E02][E02]; capability | B | master §12 | Specify bedside identity, education and discharge reset |
| EP-019 | Staff secure chat | [E02][E02]; capability | G | NEW-01 | Specify recipients, care context, retention and urgent escalation |
| EP-020 | Time-sensitive staff push | [E02][E02]; capability | B | OPS-09 | Specify delivery/read/action distinctions and failed-device fallback |
| EP-021 | Nurse-call integration | [E02][E02]; capability | G | NEW-01 | Separate alarm receipt, accepted response and bedside resolution |
| EP-022 | Clinical VoIP integration | [E02][E02]; capability | G | NEW-01 | Define credentialed directory, calling and downtime fallback |
| EP-023 | Nursing ambient assessment drafts | [E02][E02]; capability | R | AI-03 | Separate observation proposal from committed assessment |
| EP-024 | End-of-shift note drafts | [E02][E02]; capability | R | AI-03 | Define sources, review and unsigned state |

## Specialty features

| ID | Epic capability or comparison question | Evidence | Plan | Existing/new task | What is still required |
|---|---|---|---|---|---|
| EP-025 | Cardiac structured reports | [E03][E03]; capability | R | DEP-11 | Define procedure-specific structured fields |
| EP-026 | Cardiac image/system links | [E03][E03]; capability | R | DEP-11; INT-02 | Test patient/accession reconciliation |
| EP-027 | Dental treatment planning | [E03][E03]; capability | R | DEP-17 | Specify longitudinal plan and procedure states |
| EP-028 | Dermatology finding tracking | [E03][E03]; capability | R | DEP-22 | Define lesion identity, image consent and changes |
| EP-029 | ED decision-support workspace | [E03][E03]; capability | R | DEP-04; ORD-02 | Specify time-sensitive rule governance |
| EP-030 | Endoscopy scheduling | [E03][E03]; capability | R | DEP-21; OPS-01 | Add preparation dependencies and cancellations |
| EP-031 | Endoscopy reporting/follow-up | [E03][E03]; capability | R | DEP-21 | Specify finding/image mapping and recall owner |
| EP-032 | Genomic prescribing context | [E03][E03]; capability | B | DEP-25 | Add variant provenance, interpretation version and withdrawal |
| EP-033 | Tumor biomarker context | [E03][E03]; capability | B | DEP-12/25 | Specify molecular report-to-plan reconciliation |
| EP-034 | Lab orders/specimen tracking | [E03][E03]; capability | R | DEP-07 | Specify sample identity and rejection paths |
| EP-035 | Anatomic pathology | [E03][E03]; capability | R | DEP-08 | Specify block/slide/report correction lineage |
| EP-036 | Dialysis treatment planning | [E03][E03]; capability | R | DEP-19 | Specify plan versions and session deviations |
| EP-037 | Dialysis quality reporting | [E03][E03]; capability | B | DEP-19; OPS-07 | Define measure engine and denominator versions |
| EP-038 | Prenatal-to-delivery documentation | [E03][E03]; capability | R | DEP-13 | Specify dating, episode and newborn linkage |
| EP-039 | Fertility cycle tracking | [E03][E03]; capability | R | GAP-07 | Expand cycle states and custody schema |
| EP-040 | Oncology protocol ordering | [E03][E03]; capability | R | DEP-12 | Specify prerequisites and independent verification |
| EP-041 | Radiation treatment tracking | [E03][E03]; capability | R | GAP-08 | Define planning-system and fraction reconciliation |
| EP-042 | Cancer staging/registry submission | [E03][E03]; capability | B | DEP-12; master §14 | Specify staging edition and region-specific registry exports |
| EP-043 | Eye diagnostics/imaging | [E03][E03]; capability | R | DEP-16 | Specify laterality and serial comparison |
| EP-044 | Optometry-specific package | [E03][E03]; capability | G | NEW-02 | Separate optometry forms/content from surgical eye-care pack |
| EP-045 | Orthopedic location charting | [E03][E03]; capability | R | DEP-18 | Specify body map and laterality |
| EP-046 | Joint-injection workflow | [E03][E03]; capability | B | DEP-18; master §11 | Add consent, site and procedure documentation |
| EP-047 | Joint registry export | [E03][E03]; capability | B | DEP-18 | Specify region/registry contract and version |
| EP-048 | Radiology schedule/exam/report | [E03][E03]; capability | R | DEP-10 | Specify accession lifecycle |
| EP-049 | Radiology actionable findings | [E03][E03]; capability | R | ORD-03; DEP-10 | Define finding owner and overdue escalation |
| EP-050 | Radiology resource dashboards | [E03][E03]; capability | B | OPS-07; DEP-10 | Define modality utilization and delay metrics |
| EP-051 | Pre/intra/postoperative record | [E03][E03]; capability | R | DEP-06 | Specify common perioperative event timeline |
| EP-052 | Anesthesia outcome/charge capture | [E03][E03]; capability | B | DEP-06; OPS-03 | Link documented events to reviewed outcome/charge definitions |
| EP-053 | Transplant evaluation/follow-up | [E03][E03]; capability | R | DEP-20 | Specify committee/waitlist/longitudinal states |
| EP-054 | Transplant research/registry | [E03][E03]; capability | B | DEP-20; OPS-07 | Define consent and registry-specific submission |

## Patient experience

| ID | Epic capability or comparison question | Evidence | Plan | Existing/new task | What is still required |
|---|---|---|---|---|---|
| EP-055 | Cross-organization patient login | [E04][E04]; capability | R | GAP-01 | Specify identity proofing and account unlinking |
| EP-056 | Digital care access | [E04][E04]; capability | R | OPS-01/02 | Specify patient journey and authorization boundaries |
| EP-057 | Patient contact CRM | [E04][E04]; capability | R | GAP-02 | Specify case routing and channel consent |
| EP-058 | Home care-plan guidance | [E04][E04]; capability | R | GAP-03 | Define enrollment and staffed response contract |
| EP-059 | Wearable observations | [E04][E04]; capability | R | GAP-03 | Specify source quality, units and duplicates |
| EP-060 | Remote monitoring | [E04][E04]; capability | R | GAP-03 | Specify thresholds, coverage and outage handling |
| EP-061 | Patient-directed temporary sharing | [E04][E04]; capability | R | GAP-04 | Specify recipient, scope, expiry and audit |
| EP-062 | Bedside clinical view | [E04][E04]; capability | B | master §12 | Add bedside discharge/session reset |
| EP-063 | Patient health insights | [E04][E04]; capability | B | OPS-02; AI-04 | Separate approved education from unreviewed interpretation |
| EP-064 | Patient appointment scheduling | [E04][E04]; capability | R | OPS-01/02 | Specify slot authority and rules |
| EP-065 | Digital check-in | [E04][E04]; capability | B | master §12; OPS-01 | Specify identity confirmation and demographic reconciliation |
| EP-066 | Earlier-slot notifications | [E04][E04]; capability | R | OPS-01 | Specify offer expiration and exclusive reservation |
| EP-067 | Multichannel communication | [E04][E04]; capability | B | master §12; GAP-02 | Specify delivery consent, bounce and opt-out |
| EP-068 | Patient finance assistance | [E04][E04]; capability | B | OPS-03 | Add eligibility/application lifecycle and human handoff |

## Access and revenue

| ID | Epic capability or comparison question | Evidence | Plan | Existing/new task | What is still required |
|---|---|---|---|---|---|
| EP-069 | Visit/procedure/diagnostic scheduling | [E05][E05]; capability | R | OPS-01 | Define duration, dependency and resource constraints |
| EP-070 | Referral authorizations | [E05][E05]; capability | B | ORD-04; OPS-03 | Separate authorization episodes, evidence and expiry |
| EP-071 | Guest scheduling | [E05][E05]; capability | G | NEW-03 | Define no-account identity proofing without record disclosure |
| EP-072 | Guest price shopping | [E05][E05]; capability | G | NEW-03 | Separate public estimate from patient-specific account data |
| EP-073 | Hospital/professional estimates | [E05][E05]; capability | B | OPS-03 | Specify components, exclusions and versioned calculation |
| EP-074 | Electronic insurance verification | [E05][E05]; capability | B | OPS-03/04 | Specify payer request/response, stale status and manual fallback |
| EP-075 | Self-pay arrangements | [E05][E05]; capability | B | OPS-03 | Specify agreements, collections and reconciliation |
| EP-076 | Registration automation | [E05][E05]; capability | B | OPS-01; AI-06 | Specify confidence limits and human correction |
| EP-077 | Charge automation | [E05][E05]; capability | B | OPS-03; AI-05 | Specify documented trigger, review and reversal |
| EP-078 | Patient payment access | [E05][E05]; capability | R | OPS-03 | Specify tokenized payment and signed callbacks |

## Interoperability

| ID | Epic capability or comparison question | Evidence | Plan | Existing/new task | What is still required |
|---|---|---|---|---|---|
| EP-079 | Cross-EHR exchange | [E06][E06]; capability | R | INT-01/02 | Specify identity/consent plus correction provenance |
| EP-080 | Community-hosted EHR extension | [E06][E06]; capability | R | GAP-05 | Define hub/affiliate authority and exit plan |
| EP-081 | Patient-directed FHIR apps | [E06][E06]; capability | R | INT-01 | Define profiles, scopes and conformance evidence |
| EP-082 | Government record exchange | [E06][E06]; capability | B | OPS-04; INT-02 | Add region-specific agencies and minimum data contracts |
| EP-083 | Community-provider chart/referral access | [E06][E06]; capability | R | OPS-09 | Specify relationship-limited chart scope |
| EP-084 | Payer clinical/claims exchange | [E06][E06]; capability | R | GAP-06 | Separate payer purpose and clinical care access |
| EP-085 | Electronic referral exchange | [E06][E06]; capability | R | ORD-04; INT-02 | Specify receipt and consultation closure |
| EP-086 | Outside-test duplication checks | [E06][E06]; capability | B | ORD-02; INT-04 | Normalize identity/test/time without hiding uncertainty |
| EP-087 | Cross-network care gaps | [E06][E06]; capability | B | OPS-06; GAP-06 | Define source freshness and evidence quality |
| EP-088 | Published interface catalog | [E06][E06]; capability | B | master §15; INT-01/02 | Specify searchable versioned developer catalog and sandbox |

## Population health

| ID | Epic capability or comparison question | Evidence | Plan | Existing/new task | What is still required |
|---|---|---|---|---|---|
| EP-089 | External clinical/claims aggregation | [E07][E07]; capability | R | OPS-06; INT-04 | Preserve provenance and population permission |
| EP-090 | Value-contract performance | [E07][E07]; capability | B | OPS-07; master §13 | Add attribution, contract denominator and financial measures |
| EP-091 | Cross-setting care management | [E07][E07]; capability | B | OPS-06; DEP-24 | Specify enrollment, goals, interventions and closure |
| EP-092 | Previsit team huddle | [E07][E07]; capability | B | DEP-01; HUI-05 | Add team worklist, readiness and action ownership |
| EP-093 | Social-needs resource directory | [E07][E07]; capability | G | NEW-04 | Specify referral, resource availability and return outcome |
| EP-094 | Adaptive outreach campaigns | [E07][E07]; capability | B | OPS-06; GAP-02 | Add channel fallback, consent and delivery limits |
| EP-095 | ACO quality-file aggregation | [E07][E07]; capability | G | NEW-05 | Specify jurisdiction-specific QRDA import/export and measures |

## Health plans

| ID | Epic capability or comparison question | Evidence | Plan | Existing/new task | What is still required |
|---|---|---|---|---|---|
| EP-096 | Enrollment and benefit administration | [E08][E08]; capability | R | GAP-06 | Specify eligibility dates and retroactive changes |
| EP-097 | Service authorization | [E08][E08]; capability | R | GAP-06 | Define deadline, evidence and decision lifecycle |
| EP-098 | Claims and capitation payment | [E08][E08]; capability | B | GAP-06 | Split capitation attribution, accrual and settlement |
| EP-099 | Member communications portal | [E08][E08]; capability | B | GAP-06; OPS-02 | Separate member role from patient portal |
| EP-100 | Provider risk/gap portal | [E08][E08]; capability | B | GAP-06; OPS-06 | Specify payer-provider authorization scope |
| EP-101 | Employer coverage portal | [E08][E08]; capability | G | NEW-06 | Prevent exposure of confidential employee care details |
| EP-102 | Utilization review deadlines | [E08][E08]; capability | B | GAP-06 | Specify service clocks and escalation |
| EP-103 | Referral steering/network recommendations | [E08][E08]; capability | G | NEW-06 | Specify network adequacy, availability and transparent criteria |
| EP-104 | Bed-day tracking | [E08][E08]; capability | B | GAP-06; DEP-02 | Specify covered/denied/pending periods |
| EP-105 | Payer event/authorization exchange | [E08][E08]; capability | R | GAP-06; INT-02 | Define acknowledgements and reconciliation |
| EP-106 | Member analytics | [E08][E08]; capability | B | GAP-06; OPS-07 | Specify purpose, attribution and small-cell controls |

## Clinician AI (Art)

| ID | Epic capability or comparison question | Evidence | Plan | Existing/new task | What is still required |
|---|---|---|---|---|---|
| EP-107 | Message-response drafting | [E09][E09]; listed | R | AI-03 | Evaluate intent, missing context and escalation |
| EP-108 | Outpatient note/order/diagnosis drafts | [E09][E09]; listed | R | AI-02 | Separate proposals and authorized signatures |
| EP-109 | Inpatient/outpatient summaries | [E09][E09]; listed | R | AI-01 | Specify scope, recency and source citations |
| EP-110 | Nursing care-plan note drafts | [E09][E09]; listed | R | AI-03 | Test unfinished tasks and unsupported assertions |
| EP-111 | AI text rewriting | [E09][E09]; listed | B | master §17 | Prevent meaning changes and preserve original |
| EP-112 | Cancer-stage extraction | [E09][E09]; listed | G | NEW-07 | Require staging edition, source and expert review |
| EP-113 | Imaging follow-up extraction | [E09][E09]; listed | B | master §17; ORD-03 | Specify negation, recommendation and assigned closure |
| EP-114 | Hospital-course drafts | [E09][E09]; listed | B | master §17; AI-03 | Specify temporal episode boundaries |
| EP-115 | Inbox patient-context summary | [E09][E09]; listed | B | AI-01/03 | Filter by current authorized patient and message |
| EP-116 | Inpatient/ED ambient drafts | [E09][E09]; listed | B | AI-02; DEP-04 | Specify multiple speakers, urgency and consent |
| EP-117 | Home OASIS assessment suggestions | [E09][E09]; listed | G | NEW-07 | Use licensed/versioned instruments and field review |
| EP-118 | Medication rationale insights | [E09][E09]; listed | B | AI-01; MED-01 | Separate documented indication from inferred rationale |
| EP-119 | Risk-adjustment evidence summary | [E09][E09]; listed | B | AI-05 | Require source-backed evidence without diagnosis inflation |
| EP-120 | Pre-anesthesia risk summary | [E09][E09]; listed | G | NEW-07 | Source risks; no unsupervised clearance |
| EP-121 | Diagnosis-code proposals | [E09][E09]; listed | R | AI-05 | Bind suggestions to documented findings/version |
| EP-122 | Visit service-level proposals | [E09][E09]; listed | G | NEW-07 | Specify jurisdiction/code-set rules and coder review |
| EP-123 | Transition-of-care summaries | [E09][E09]; listed | R | AI-01/03 | Include unresolved actions and covering owner |
| EP-124 | Pathology structured extraction | [E09][E09]; listed | G | NEW-07 | Retain narrative and expert approval |
| EP-125 | Cardiac procedure narratives | [E09][E09]; listed | G | NEW-07 | Bind text to verified procedural observations |
| EP-126 | Patient-instruction drafts | [E09][E09]; listed | R | AI-03 | Check language, units and approved plan |
| EP-127 | Outside-medication extraction | [E09][E09]; listed | B | master §17; MED-01 | Review parsed units/route/frequency before reconciliation |
| EP-128 | Referral-reason summaries | [E09][E09]; listed | B | AI-01; ORD-04 | Preserve question, urgency and missing evidence |
| EP-129 | Social-needs extraction | [E09][E09]; listed | G | NEW-07 | Distinguish screening, quoted concern and confirmed need |
| EP-130 | Therapy progress-note drafts | [E09][E09]; listed | G | NEW-07 | Link goals/measures without invented improvement |
| EP-131 | ED problem summaries | [E09][E09]; listed | B | AI-01; DEP-04 | Prioritize recency without suppressing contradictions |
| EP-132 | Transplant committee summaries | [E09][E09]; listed | G | NEW-07 | Preserve contraindication uncertainty and expert review |
| EP-133 | Cardiac follow-up candidates | [E09][E09]; listed | G | NEW-07 | Validate eligibility flags and specialist approval |
| EP-134 | Result-to-care-gap extraction | [E09][E09]; listed | B | master §17; OPS-06 | Create reviewed follow-up proposals with ownership |
| EP-135 | Nurse assignment suggestions | [E09][E09]; listed | G | NEW-08 | Check skills, workload and approved staffing limits |
| EP-136 | Discharge-barrier extraction | [E09][E09]; listed | B | AI-03; DEP-02 | Preserve proposed versus confirmed readiness |
| EP-137 | Dialysis-rounding summaries | [E09][E09]; listed | G | NEW-07 | Bind to treatment dates, units and session provenance |
| EP-138 | Pre-anesthesia triage summary | [E09][E09]; listed | G | NEW-07 | Keep eligibility decision with authorized clinician |
| EP-139 | Scanned-referral extraction | [E09][E09]; listed | G | NEW-09 | Review patient identity and urgency before creation |
| EP-140 | Cited chart Q&A/visualization | [E09][E09]; listed | B | master §17; AI-01 | Specify query evaluation and no unsupported graph |
| EP-141 | Spanish-to-English message preview | [E09][E09]; listed | G | NEW-10 | Preserve original; evaluate urgent meaning; no Arabic equivalence claim |

## Patient AI (Emmie)

| ID | Epic capability or comparison question | Evidence | Plan | Existing/new task | What is still required |
|---|---|---|---|---|---|
| EP-142 | Text scheduling/rescheduling | [E10][E10]; listed | B | AI-04; OPS-01 | Secure identity; no stale-slot confirmation |
| EP-143 | Visit-derived reminders | [E10][E10]; listed | B | AI-04; OPS-06 | Review follow-up intent and communications consent |
| EP-144 | Plain-language endoscopy overview | [E10][E10]; listed | G | NEW-11 | Validate terminology, uncertainty and escalation |
| EP-145 | Imaging-result explanation | [E10][E10]; listed | G | NEW-11 | Maintain result status and prevent false reassurance |
| EP-146 | Plain-language instructions | [E10][E10]; listed | B | AI-03/04 | Verify clinical meaning and approved language |
| EP-147 | Billing/payment conversation | [E10][E10]; listed | R | AI-04; OPS-03 | Reauthorize balance/payment tools per action |
| EP-148 | Patient chart Q&A | [E10][E10]; listed | B | AI-04; SEC-02 | Separate proxy scope and source visibility |

## Operational AI (Penny)

| ID | Epic capability or comparison question | Evidence | Plan | Existing/new task | What is still required |
|---|---|---|---|---|---|
| EP-149 | Utilization-review draft | [E11][E11]; listed | G | NEW-12 | Bind summary to current chart and review period |
| EP-150 | Professional denial-appeal draft | [E11][E11]; listed | R | AI-05 | Link every justification to actual record |
| EP-151 | Risk-adjustment assistance | [E11][E11]; listed | B | AI-05 | Avoid unsupported code capture |
| EP-152 | Patient microsite drafts | [E11][E11]; listed | G | NEW-13 | Require content/translation/privacy approval |
| EP-153 | Hospital/professional code suggestions | [E11][E11]; listed | R | AI-05 | Separate coding contexts and authority |
| EP-154 | Outpatient denial-appeal draft | [E11][E11]; listed | B | AI-05 | Specify payer/version and deadline |
| EP-155 | Authorization evidence summary | [E11][E11]; listed | B | AI-05; GAP-06 | Reference documents and missing prerequisites |
| EP-156 | Authorization-question drafts | [E11][E11]; listed | G | NEW-12 | Review question-specific evidence; no fabricated answers |
| EP-157 | Dashboard insight narrative | [E11][E11]; listed | G | NEW-14 | Check denominator, interval and statistical caveats |
| EP-158 | Inpatient denial-appeal draft | [E11][E11]; listed | B | AI-05 | Use correct episode and payer criteria |
| EP-159 | Natural-language report queries | [E11][E11]; listed | G | NEW-14 | Use read-only scoped query plan and preview |
| EP-160 | Payer-policy evidence assistance | [E11][E11]; listed | G | NEW-12 | Version payer rules and surface conflicting criteria |
| EP-161 | Surgical case-request consistency | [E11][E11]; listed | G | NEW-15 | Present discrepancy; no silent procedure replacement |
| EP-162 | Documentation-improvement suggestions | [E11][E11]; listed | B | AI-05; OPS-05 | Nonleading query and clinician-authored response |
| EP-163 | Scan patient/type classification | [E11][E11]; listed | G | NEW-09 | No autonomous wrong-chart attachment |
| EP-164 | Outreach content drafts | [E11][E11]; listed | G | NEW-13 | Enforce audience, consent and publication review |
| EP-165 | Trial eligibility assistance | [E11][E11]; listed | G | NEW-16 | Separate candidate matching from investigator enrollment |
| EP-166 | Patient-flow suggestions | [E11][E11]; listed | G | NEW-08 | Recheck current bed/skills/isolation constraints |
| EP-167 | Discharge-planning insights | [E11][E11]; listed | B | AI-03; DEP-02 | Human approval before milestone completion |
| EP-168 | Medical-necessity comparison | [E11][E11]; listed | G | NEW-12 | Show criterion and source without autonomous denial |
| EP-169 | Policy-document extraction | [E11][E11]; listed | G | NEW-12 | Review extracted criteria before rule use |
| EP-170 | Diagnosis-evidence highlighting | [E11][E11]; listed | B | AI-05 | Maintain source context and contradictions |
| EP-171 | Authorization-decision support | [E11][E11]; listed | G | NEW-12 | Authorized reviewer owns final decision and appeal path |

## Analytics, mobile and resilience

| ID | Epic capability or comparison question | Evidence | Plan | Existing/new task | What is still required |
|---|---|---|---|---|---|
| EP-172 | Role dashboards (Radar) | [E12][E12]; customer documentation | B | OPS-07; HUI-17 | Define governed role-specific metrics |
| EP-173 | Operational reports (Reporting Workbench) | [E12][E12]; customer documentation | B | OPS-07 | Specify report builder, scheduling and row permissions |
| EP-174 | Self-service cohorts (SlicerDicer) | [E12][E12]; customer documentation | B | OPS-07 | Specify query builder and disclosure controls |
| EP-175 | Analytical warehouse (Clarity/Caboodle) | [E12][E12]; customer documentation | B | master §14; OPS-07 | Specify ETL lineage, semantics and refresh SLA |
| EP-176 | Cross-institution research (Cosmos) | [E12][E12]; customer documentation | G | NEW-17 | Requires governed partner dataset, not merely a warehouse |
| EP-177 | Phone/tablet clinician access | [E13][E13]; E13 | R | OPS-09 | Test supported device workflows and remote revocation |
| EP-178 | Nursing mobile workflow | [E13][E13]; E13 | R | OPS-09; DEP-03 | Specify barcode and patient context controls |
| EP-179 | Downtime read-only snapshot | [E14][E14]; E14 | R | OFF-04/10/11 | Test cache age, access and post-outage reconciliation |
| EP-180 | Agent external connectors | [E15][E15]; E15 announced | R | AI-06 | Specify scopes/replay, failure and human approval |

## Important comparison questions still unverified

| ID | Epic capability or comparison question | Evidence | Plan | Existing/new task | What is still required |
|---|---|---|---|---|---|
| EP-181 | Detailed registration/merge parity | U | R | REC-01 | Obtain primary Epic workflow evidence; test identity hazards |
| EP-182 | Detailed eMAR/barcode parity | U | R | MED-01; DEP-03 | Verify actual comparator workflow and exception handling |
| EP-183 | Blood-bank product boundary | U | R | DEP-09 | Verify vendor versus partner scope before comparison |
| EP-184 | All department/specialty variants | U | B | DEP-25; GAP-11 | Expand separate specialty workflows and primary evidence |
| EP-185 | Exact security/consent equivalence | U | R | SEC-01–04 | Compare deployment controls and independent evidence |
| EP-186 | Exact offline mode equivalence | U | R | OFF-01–14 | Compare internet/LAN/server outage modes separately |
| EP-187 | Speed at equal workload | U | R | PERF-01–06 | No shared benchmark or superiority claim exists |
| EP-188 | Hospital GUI usability advantage | U | R | HUI-01–33 | Require matched task study; no winner assigned |
| EP-189 | Local deployment cost/licensing | U | B | FND-01/02 | Compare total operations/content/support costs |
| EP-190 | Certification by release/country | U | B | OPS-04; GAP-14 | Obtain product/version/jurisdiction-specific evidence |

## New requirements arising from the review
All unchecked. These add independent functional intent; they do not claim proprietary equivalence. Every task requires data dictionary, lifecycle, interfaces, authorization, role UI, offline behavior, hazards, clinical/operational owner and normal/failure evidence before specification approval. AI tasks additionally inherit AI-07 evaluation and SEC-02 authorization; no model output can bypass standard clinical or financial approval.

- [ ] **NEW-01 — Unified staff communications | P1 | SEC-01/02, REC-06, OPS-09.** Patient-context staff chat, covering-team directory, delivery/read/accepted/action states, urgency, retention, export and partner adapters for nurse call and VoIP. Separate alarm transport from clinical escalation. Acceptance: unavailable recipient, lost push, wrong patient thread, device loss and disconnected LAN have owned fallback; read receipt never proves bedside action.
- [ ] **NEW-02 — Optometry pack | P2 | DEP-16, REC-03.** Specify refraction, lens/contact-lens history, visual function, eye-specific findings, imaging and referrals distinct from surgical ophthalmology. Acceptance: laterality, measurement units, correction state and signed amendments remain explicit through print/export.
- [ ] **NEW-03 — Guest access journeys | P2 | OPS-01/03, SEC-02.** Public service directory and estimates, low-friction booking and payment with transaction-specific identity proofing. Guest access never grants chart access. Acceptance: double booking, mistaken identity, payment retries, automated abuse and failed verification cannot leak patient information.
- [ ] **NEW-04 — Social-needs resource coordination | P2 | OPS-06, GAP-02.** Versioned resource directory, eligibility, capacity, consented referral, acceptance, outcome and unresolved barriers. Acceptance: stale/unavailable service, declined referral and inability to contact return to an accountable coordinator; inferred need is not confirmed assessment.
- [ ] **NEW-05 — Regional quality-report packages | P2 | OPS-07, INT-03/04.** For US scope, investigate QRDA-I/III and selected measures; other countries get separate adapters. Define attribution, numerator/denominator, exclusions, import reconciliation, evidence and approved submissions. Acceptance: regenerate a period reproducibly; amendments and missing affiliate data are visible. No certification implied.
- [ ] **NEW-06 — Payer portals, network and capitation depth | P3 | GAP-06.** Separate member, provider and employer views; provider network/referral steering; bed-day status; capitation attribution, settlement and corrections. Acceptance: employer cannot view confidential clinical details; changes to eligibility/network/contract preserve prior decisions and reconciliation history.
- [ ] **NEW-07 — Specialty clinician AI task packs | P3 | AI-01–03, specialty owner.** Separate approved tasks for staging extraction, OASIS assistance, anesthesia summaries, service-level proposals, pathology extraction, cardiac narratives/follow-up flags, social-needs extraction, therapy notes, transplant committee and dialysis summaries. Each needs its own intended use, input schema, source citations, draft output, exclusions, dataset and thresholds. Acceptance: do not ship as one generic prompt; task-specific reviewers reject unsupported fields, incorrect timing/units, contradictory sources and unauthorized content.
- [ ] **NEW-08 — Staffing and patient-flow suggestions | P3 | DEP-02/03, OPS-08.** Explicit patient workload, nurse credentials/skills, staffing policy, continuity, bed/isolation and capacity constraints; explain recommendations and permit override. Acceptance: human confirms against current authoritative state; partition/stale census cannot create a staffing assignment or bed reservation automatically.
- [ ] **NEW-09 — Document ingestion and referral extraction | P2 | REC-01, ORD-04, OPS-05.** Quarantine incoming scans/faxes, suggest patient/type and referral fields, retain source, require reviewed matching and confidence/error handling. Acceptance: ambiguous identity, OCR errors, mixed patients/pages and forged instructions cannot attach automatically to a chart or alter urgency without review.
- [ ] **NEW-10 — Clinically reviewed translation assistance | P2 | HUI-26, AI-03/07.** Preserve original text and label machine translation with language/model/version. Evaluate languages independently; Epic's described Spanish-to-English preview does not establish Arabic capability. Acceptance: urgency, negation, dosage and consent meaning evaluated; low confidence escalates to qualified interpreter; translated preview never replaces original.
- [ ] **NEW-11 — Patient-facing report explanations | P3 | OPS-02, AI-04/07.** Separate endoscopy and imaging summaries grounded in released reports with status, uncertainty, source and clinician contact route. Acceptance: corrected/preliminary results, proxy restrictions and alarming findings cannot produce unsupported reassurance; release policy and clinician follow-up remain intact.
- [ ] **NEW-12 — Authorization/utilization AI assistance | P3 | AI-05, GAP-06.** Separate utilization summary, question response, policy extraction, medical-necessity comparison and reviewer decision support. Store policy effective dates and licensing, show satisfied/unsatisfied/unknown evidence and contradictions. Acceptance: model cannot approve/deny care or fabricate criteria; reviewer signs final decision and an appeal path is retained.
- [ ] **NEW-13 — Governed outreach/content generation | P3 | GAP-02, OPS-06, AI-07.** Campaign/microsite drafts, education templates, target audiences, translated versions, clinical review and publication approval. Acceptance: preview synthetic audiences, consent suppression, rollback and no PHI in public pages; generation alone never sends messages or publishes.
- [ ] **NEW-14 — Governed self-service analytics | P2 | OPS-07, SEC-02.** Distinct role dashboards, report catalog/builder, scheduled delivery, self-service cohorts, semantic metric definitions, warehouse lineage and optional natural-language query/narratives. Acceptance: read-only bounded queries, row/purpose policy, small-cell protection, denominator/refresh labels and reproducibility; AI output links to executed query and cannot write clinical data.
- [ ] **NEW-15 — Surgical request validation assistance | P3 | DEP-06, AI-07.** Compare requested procedure/site/laterality with structured case fields and resources; surface discrepancies. Acceptance: surgeon/scheduler reviews evidence; no silent procedure, code, site or equipment replacement; stale case versions force re-review.
- [ ] **NEW-16 — Research eligibility assistance | P3 | GAP-09, AI-07.** Model study/protocol criteria, consent scope and dated evidence; identify potential candidates with unknowns. Acceptance: investigator validates inclusion/exclusion and reconsent; no automatic enrollment or disclosure to an unauthorized sponsor.
- [ ] **NEW-17 — Governed multicenter research network | P3 | OPS-07, GAP-09, INT-04.** Define partner agreements, consent/legal basis, common data model, deduplication, site provenance, refresh, permitted linkage, disclosure and withdrawal rules. Acceptance: demonstrate two synthetic contributing sites and auditable cohort reproduction. Software alone cannot reproduce Cosmos's partner network, longitudinal data, approvals or research community.

## Priorities and implications
1. Preserve the shared safety core: identity, clinical meaning, signatures, orders/results ownership, medications, permissions, audit and downtime. Comparison breadth must not displace P0 safety.
2. Close high-value hospital gaps: NEW-01 communications, explicit infection prevention/case-management depth, and patient/medication workflow exceptions.
3. Specify revenue/authorization, analytics and patient-access variants before claiming enterprise breadth.
4. Treat specialty and AI task packs as separately reviewed products, not a single “AI enabled” checkbox.
5. Network effects (partner connectivity, clinical content, deployed workflows, research datasets, training and support) require governance and participating institutions in addition to code.

## Scoring and limitations
No vendor-wide match percentage is calculated. The counts above include both directly evidenced rows and ten explicit unknowns; they are inventory counts, not an Epic denominator. R/B/G ratings are qualitative reviewer judgments of the baseline plan, not independent product certification. If numeric scoring is needed, freeze atomic acceptance criteria and clinician-approved weights, exclude/identify unsupported comparator rows, and report specification, implementation and deployment validation separately using the [scoring register](CAPABILITY_COMPARISON_MATRIX.md).

Availability for undated feature pages is “publicly listed as accessed,” not a verified GA date. Product names may refer to different release/region/site entitlements. The public post-acute and life-sciences detail pages repeatedly timed out during this review; their full feature lists are not claimed as reviewed. Their broad scope remains in the master plan; granular evidence is outstanding.

## Source register
All accessed 2026-11-12. No performance/outcome marketing statistics are used as comparative proof.

| ID | Direct source | Evidence limits |
|---|---|---|
| E01 | [Epic primary care](https://www.epic.com/software/primary-care/) | Undated public product overview; pediatric acceleration is a customer example, not universal configuration. |
| E02 | [Epic acute/inpatient](https://www.epic.com/software/acute-and-inpatient-care/) | Undated product overview; exact release, license and site configuration unverified. |
| E03 | [Epic specialties](https://www.epic.com/software/specialties/) | Undated product overview; only named feature statements are compared. |
| E04 | [Epic patient experience](https://www.epic.com/software/patient-experience/) | Undated product overview; account/region/device prerequisites unverified. |
| E05 | [Epic access/revenue](https://www.epic.com/software/access-and-revenue-cycle/) | Undated product overview; no-account access does not imply unrestricted chart access. |
| E06 | [Epic interoperability](https://www.epic.com/software/interoperability/) | Undated public description; network membership, legal basis and partner readiness still required. |
| E07 | [Epic population health](https://www.epic.com/software/population-health/) | Undated overview; US-specific quality-file examples are not global requirements. |
| E08 | [Epic health plans](https://www.epic.com/software/health-plans/) | Undated overview; payer and provider products have separate entitlements. |
| E09 | [Epic Art](https://www.epic.com/software/art/) | Public feature listing; publication/version/individual general-availability dates not established. |
| E10 | [Epic Emmie](https://www.epic.com/software/emmie/) | Public feature listing; no universal availability or unsupervised-clinical-safety inference. |
| E11 | [Epic Penny](https://www.epic.com/software/penny/) | Public feature listing; listed automation does not establish our permitted autonomy level. |
| E12 | [UC Davis deployed Epic analytics tools](https://health.ucdavis.edu/data/tools.html) | First-party customer documentation, not Epic-wide entitlement or exhaustive vendor specification. |
| E13 | [Mohawk Valley deployed Epic mobile tools](https://www.mvhealthsystem.org/employees-providers/epic-canto-haiku/) | First-party customer description of mobile access; no universal device/offline claim. |
| E14 | [RWJBarnabas provider downtime guide](https://www.rwjbh.org/documents/epic/Provider-Downtime-Tip-Sheet.pdf) | Customer-specific read-only snapshot evidence; not proof of every Epic outage configuration. |
| E15 | [Epic Agent Factory Connectors](https://www.epic.com/epic/post/introducing-connectors-a-new-way-for-apps-to-communicate-with-epic/) | 2026-10-21 announcement; prospective examples and developer capability; individual availability unverified. |

[E01]: https://www.epic.com/software/primary-care/
[E02]: https://www.epic.com/software/acute-and-inpatient-care/
[E03]: https://www.epic.com/software/specialties/
[E04]: https://www.epic.com/software/patient-experience/
[E05]: https://www.epic.com/software/access-and-revenue-cycle/
[E06]: https://www.epic.com/software/interoperability/
[E07]: https://www.epic.com/software/population-health/
[E08]: https://www.epic.com/software/health-plans/
[E09]: https://www.epic.com/software/art/
[E10]: https://www.epic.com/software/emmie/
[E11]: https://www.epic.com/software/penny/
[E12]: https://health.ucdavis.edu/data/tools.html
[E13]: https://www.mvhealthsystem.org/employees-providers/epic-canto-haiku/
[E14]: https://www.rwjbh.org/documents/epic/Provider-Downtime-Tip-Sheet.pdf
[E15]: https://www.epic.com/epic/post/introducing-connectors-a-new-way-for-apps-to-communicate-with-epic/
