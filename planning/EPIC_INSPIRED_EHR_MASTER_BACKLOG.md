# OpenEHR — Epic-inspired capability blueprint and implementation backlog
**Research snapshot:** 2026-11-12. **Status:** planning only; no capabilities are implemented by this document.
**Goal:** Free-to-install, open-source, secure, configurable, multilingual EHR for primary care, specialty clinics, hospitals, and health systems. Build original software; do not copy Epic source, proprietary screens, assets, terminology databases, or trademarks.

## How to use this backlog
Every checkbox is an engineering deliverable. For each feature produce: user stories, clinical workflow map, data model, API/FHIR contract, permissions matrix, accessible UI design, failure/recovery states, automated tests, threat model, audit events, localization, deployment documentation, and clinician-approved acceptance test. Mark **P0** foundational, **P1** essential, **P2** advanced, **P3** long-term. Named Epic products below are *publicly documented comparison references*, not claims of feature parity or permission to reuse proprietary implementations. Public documentation is not an exhaustive inventory of Epic's private/customer-specific features.

## 0. Product governance and safety (P0)
- [ ] Define clinical scope, intended users, care settings, countries, medical-device/regulatory boundaries, patient-safety governance and a clinical safety officer.
- [ ] Choose OSI-approved license (e.g. AGPL-3.0 or Apache-2.0 after legal review); publish contribution policy, code of conduct, SBOM, dependency and vulnerability disclosure policy.
- [ ] Establish clinical hazard log, severity/likelihood scoring, mitigations, safety cases, human factors tests and incident review.
- [ ] No claim of HIPAA/GDPR/Saudi PDPL or other regulatory compliance without jurisdiction-specific assessment, deployment controls and evidence.
- [ ] All clinical content, drug dictionaries, codes and decision-support rules require validated licensed/open sources, versioning, provenance and local governance.
- [ ] Create reproducible synthetic demo datasets; never commit real PHI, secrets or credentials.
- [ ] Track each item as backlog issue with owner, priority, dependencies, acceptance criteria, evidence and release milestone.

## 1. Architecture, installation, customization (P0)
- [ ] Modular monolith initially, explicit domain boundaries, event/outbox integration, documented API; split services only with demonstrated operational need.
- [ ] PostgreSQL transactional store, object storage for documents, search index, queue, immutable audit/event pipeline; encrypt backups and test restoration.
- [ ] Tenant/facility/department isolation, organization hierarchy, facility-specific policies, master patient index and cross-facility identity reconciliation.
- [ ] One-command local demo via Docker Compose; hardened production deployment using Helm/Kubernetes or equivalent, secrets management, TLS, health checks and rolling upgrades.
- [ ] Installation wizard: locale, facility, users, departments, services, formularies, templates, time zone, units, regulatory profile, integration keys.
- [ ] Configurable form builder, workflows, routing, alerts, dashboards, order sets, specialty templates and terminology maps with approval/version/rollback.
- [ ] Plugin SDK, signed extensions, least-privilege scopes, compatibility/version policy, sandboxing, marketplace-style catalog without mandatory cloud services.
- [ ] Offline/downtime procedures, read-only emergency access, queued synchronization with conflict resolution, recovery point/time objectives and DR drills.
- [ ] Observability: metrics, traces, logs without PHI leakage, SLOs, performance budgets, capacity/load tests and upgrade migration tests.

## 2. Identity, roles, privacy and security (P0)
- [ ] SSO OIDC/SAML, MFA/passkeys, SCIM provisioning, emergency account controls, session expiration, device management and login anomaly alerts.
- [ ] RBAC plus attribute/context-based access: organization, facility, department, patient relationship, care team, purpose of use, consent and time.
- [ ] Roles: patient, caregiver/proxy, registrar, scheduler, front desk, nurse, charge nurse, physician, resident, consultant, pharmacist, pharmacy technician, lab technician, pathologist, radiology technologist, radiologist, surgeon, anesthetist, therapist, dietitian, social worker, case manager, infection prevention, quality, billing/coding, finance, researcher, IT support, security auditor, local administrator, system administrator.
- [ ] Per-role read/create/edit/sign/cosign/order/dispense/administer/export/break-glass rights; delegated tasks and trainee supervision.
- [ ] Break-glass with reason, time limit, elevated logging and mandatory retrospective review; sensitive chart segmentation and VIP protections.
- [ ] TLS in transit, encryption at rest, key rotation, KMS/HSM support, scoped service credentials, secure password hashing, field-level protection as needed.
- [ ] Tamper-evident audit trail for chart view, edit, print, export, order, result, AI access, admin changes and consent; retention and export controls.
- [ ] Consent, proxy access, legal holds, access requests, correction workflows, data retention/deletion policies as allowed by local law.
- [ ] Secure SDLC: SAST/DAST, SCA, SBOM, signed builds, dependency pinning, penetration testing, threat modeling, OWASP ASVS, disaster recovery.
- [ ] Backup/restore verification, ransomware response, business continuity and multi-person approval for dangerous administrative actions.

## 3. Core longitudinal record and clinical workspace (P0)
- [ ] Patient registration, identifiers, demographics, aliases, contact details, insurance, guarantor, language, preferred name, duplicate detection/merge with audit.
- [ ] Encounter lifecycle: planned, arrived, triaged, in progress, admitted, transferred, discharged, canceled, amended.
- [ ] Longitudinal problem list, encounter diagnoses, medical/surgical/family/social history, allergies/intolerances, medications, immunizations, vitals, observations, growth charts.
- [ ] Clinical notes: templates, smart fields, structured and free text, dictation, auto-save, version history, amendments, co-signatures and legal attestation.
- [ ] Orders: labs, imaging, medications, procedures, referrals, therapies; favorites, order sets, indications, priority, specimen details, status and results reconciliation.
- [ ] Chart review timeline, trends, flowsheets, graphing, attachments, scanned records, outside records, reconciliation and provenance.
- [ ] Clinical inbox: results, refill requests, patient messages, referrals, deficiencies, cosign requests, reminders, escalation and coverage pools.
- [ ] Clinical decision support: allergy/interaction/dose/duplicate alerts, evidence links, override reasons, alert fatigue monitoring and rule governance.
- [ ] Care plans, goals, multidisciplinary tasks, handoff/SBAR, patient instructions, discharge summary, follow-up, medication reconciliation.
- [ ] Clinical calculators only with validated formulas, units, indications, limitations and documented clinical ownership.
**Acceptance:** a clinician can safely complete a synthetic outpatient encounter end-to-end with every change attributable and recoverable.

## 4. Ambulatory and primary care (P1; EpicCare Ambulatory reference)
- [ ] Provider schedules, rooming, chief complaint, screening questionnaires, health maintenance, preventive reminders and chronic disease registries.
- [ ] SOAP/structured visit documentation, procedure documentation, point-of-care tests, e-prescribing, referrals, after-visit summaries and telehealth.
- [ ] Chronic disease pathways for diabetes, hypertension, asthma, COPD, CKD and other locally approved conditions; registry outreach and panel management.
- [ ] Vaccination schedules, recall, contraindications, immunization registry interfaces and batch/lot tracking.
- [ ] Family medicine, pediatrics, geriatrics, women's health and behavioral health configurations.

## 5. Hospital inpatient, nursing and bed management (P1; EpicCare Inpatient reference)
- [ ] Admission/transfer/discharge (ADT), bed board, capacity, isolation flags, room/bed status, transport and housekeeping requests.
- [ ] Physician rounds, progress notes, daily orders, handoff, consults, discharge planning and multidisciplinary care coordination.
- [ ] Nursing care plans, assessments, flowsheets, acuity, shift handoffs, assignment and staffing dashboards.
- [ ] eMAR with barcode medication administration, five-rights safety checks, held/missed/refused doses, infusion documentation and dual verification.
- [ ] Intake/output, lines/drains/airways, pressure injury, fall risk, restraints, sepsis screening and rapid-response workflows with validated protocols.
- [ ] ICU/critical care ventilator and device observations, high-frequency charting, titration, sedation and organ-support workflows.
- [ ] Patient transport, nutrition orders, infection prevention, discharge education and transition-of-care communications.

## 6. Emergency, urgent care and trauma (P1; ASAP reference)
- [ ] Arrival tracking board, triage acuity, chief complaint, waiting/roomed status, reassessment and escalation.
- [ ] ED clinician workspace, fast orders, medication administration, procedures, bedside tests, disposition and discharge instructions.
- [ ] Trauma/resuscitation event timeline, stroke/STEMI/sepsis pathways with local protocol approval, observation stays and handoffs.
- [ ] Ambulance/pre-arrival notification, transfer center, diversion and mass-casualty downtime workflows.

## 7. Surgery, anesthesia and procedural services (P1–P2; OpTime/Anesthesia references)
- [ ] OR block scheduling, case requests, pre-op assessments, consent verification, checklists, equipment/implant requirements.
- [ ] Surgical preference cards, intraoperative events, specimen tracking, implants/lot/serial traceability and procedure notes.
- [ ] Anesthesia pre-assessment, airway, monitoring streams, medications, intraoperative record, recovery/PACU and post-op follow-up.
- [ ] Sterile processing/instrument trays, turnover, perioperative quality, case costing and utilization.
- [ ] Endoscopy scheduling, findings, image attachments, structured reports, pathology linkage and surveillance recall (Lumens reference).

## 8. Pharmacy and medication lifecycle (P1; Willow reference)
- [ ] Medication catalog/formulary, RxNorm or locally licensed terminology, strength/form/route, substitutions, controlled-substance controls.
- [ ] Prescribing, medication reconciliation, clinical verification, dispensing, unit dose, compounding, inventory and expiry/lot tracking.
- [ ] Inpatient and ambulatory pharmacy workflows, prior authorization, e-prescription interfaces where available.
- [ ] Dosing calculators with renal/hepatic/pediatric adjustments only after validation, allergy/interaction checking, therapeutic drug monitoring.
- [ ] Barcode dispense/administer, smart pump/device interfaces, infusion plans, oncology protocols with independent double-checks.
- [ ] Controlled drugs inventory, witnessed waste, discrepancy management and regulatory reports.

## 9. Laboratory, pathology, blood bank (P1–P2; Beaker reference)
- [ ] Lab order catalog, accessioning, specimen collection/barcodes, collection timing, chain of custody and rejection rules.
- [ ] Analyzer/LIS interfaces, quality control, reference ranges by age/sex/method, delta checks, critical results escalation and acknowledgement.
- [ ] Microbiology culture/susceptibility, molecular testing, cytology, histopathology, specimen grossing and structured pathology reports.
- [ ] Blood bank: typing, crossmatch, component inventory, issue/transfusion traceability and reaction reporting under specialist validation.
- [ ] Point-of-care testing, external lab routing, result corrections, amendments and patient notification.

## 10. Imaging, cardiology and diagnostics (P1–P2; Radiant/Cupid references)
- [ ] Radiology orders, modality scheduling, protocoling, contrast/allergy checks, technologist worklists, reporting and critical-result follow-up.
- [ ] DICOM/PACS integration, DICOMweb viewers, image links, structured radiology reports and incidental finding tracking.
- [ ] ECG, echo, stress testing, cath lab, electrophysiology, structured cardiovascular reports and device integration.
- [ ] Pulmonary function, EEG, EMG, sleep studies and other diagnostic-service workflows with configurable templates.

## 11. Specialty department packs (P2–P3)
- [ ] Oncology (Beacon reference): staging, tumor board, regimens, cycle plans, infusion, toxicity, survivorship and registries.
- [ ] Obstetrics/gynecology (Stork reference): prenatal episode, fetal monitoring interfaces, labor/delivery, postpartum, newborn linkage and fertility.
- [ ] Pediatrics/NICU: growth curves, weight-based medication safeguards, neonatal documentation and developmental screening.
- [ ] Orthopedics (Bones reference): injury, fracture, joint replacement, implants, rehabilitation and registry export.
- [ ] Ophthalmology (Kaleidoscope reference): visual acuity, refraction, imaging, procedures and longitudinal eye findings.
- [ ] Dentistry (Wisdom reference): odontogram, periodontal chart, imaging, dental procedures and treatment plan.
- [ ] Dermatology: body maps, lesion tracking, photography consent, pathology and procedures.
- [ ] Neurology/neurosurgery: stroke pathway, seizure tracking, neuro assessments and operative documentation.
- [ ] Psychiatry/behavioral health: confidential notes, risk assessments, therapy sessions and specialized consent/access.
- [ ] Rehabilitation: PT/OT/speech goals, functional measures, therapy plans and progress.
- [ ] Nephrology/dialysis: dialysis prescription, sessions, access, fluids, labs and longitudinal adequacy.
- [ ] Transplant (Phoenix reference): evaluation, selection committee, waitlist, donor/recipient matching interfaces and post-transplant care.
- [ ] Genetics/genomics: family pedigree, variant interpretations, pharmacogenomics and consent.
- [ ] Infectious disease: stewardship, antimicrobial review, infection control and outbreak reporting.
- [ ] ENT, urology, rheumatology, endocrinology, gastroenterology, pulmonology, pain, palliative care, wound care, nutrition, sleep medicine, occupational medicine, home health and hospice: specialty-specific forms, orders, outcome measures and care pathways.
**Acceptance for every pack:** specialty clinician reviews a complete synthetic scenario, safe transitions to/from core record and appropriate confidentiality.

## 12. Patient and caregiver experience (P1–P2; MyChart references)
- [ ] Patient portal/mobile-responsive app: appointments, results with release rules, medication list, allergies, summaries, instructions and records download.
- [ ] Self-scheduling, waitlists, e-check-in, questionnaires, reminders, video visits and secure messaging.
- [ ] Proxy/guardian access with age-based rules, consent, sensitive-data segmentation and revocation.
- [ ] Prescription refill requests, immunization record, preventive care reminders, care plans and remote monitoring.
- [ ] Online estimates, invoices, payments, financial assistance, billing questions and accessibility.
- [ ] Inpatient bedside view of care team, plan, education, meals and requests (MyChart Bedside inspiration).
- [ ] Patient-controlled time-limited record sharing, portable health record export and cross-organization identity linking where lawful.
- [ ] SMS/email/push preferences, language preference, communication templates and emergency escalation policies.

## 13. Revenue cycle, scheduling and enterprise operations (P1–P2)
- [ ] Provider/facility/resource calendars, appointment types, referrals, authorizations, waitlists, no-shows and capacity optimization.
- [ ] Coverage eligibility, benefits, registration quality, estimates, charge capture, coding review, claims generation, remittance and denials.
- [ ] Revenue cycle: payer contracts, billing edits, claim status, appeals, patient statements, payment plans and reconciliation.
- [ ] Country-specific billing adapters: ICD-10 variants, CPT/HCPCS only with valid licensing, DRG/local classifications and payer formats.
- [ ] Inventory, procurement, supply chain, sterile goods, assets, maintenance, transport, housekeeping, dietary and staff scheduling.
- [ ] CRM/contact center, outreach campaigns, population health registries, referral management and service recovery (Cheers inspiration).

## 14. Population health, analytics, research (P2)
- [ ] Operational dashboards for throughput, safety, utilization, quality, access, finance and patient experience with role-scoped drilldowns.
- [ ] Registries, cohort definitions, preventive gaps, risk stratification and quality measure engines with versioned definitions.
- [ ] Research consent, IRB controls, de-identification/pseudonymization, cohort exports, provenance and reproducible datasets.
- [ ] Public health, immunization, cancer and disease registries; surveillance and mandatory reporting adapters.
- [ ] Data warehouse/lakehouse export, FHIR bulk export, terminology services and metadata catalog.

## 15. Interoperability (P0–P2)
- [ ] HL7 FHIR R4/R4B core resources, SMART on FHIR authorization, OAuth2 scopes, launch contexts and conformance tests; plan R5 migration carefully.
- [ ] HL7 v2 ADT/ORM/ORU/SIU interfaces, interface engine, acknowledgements, retries, dead-letter queue and reconciliation.
- [ ] DICOM/DICOMweb, IHE profiles, CDA/C-CDA as regionally required, NCPDP or local eRx, X12 or local claims, device integration.
- [ ] SNOMED CT, LOINC, ICD, RxNorm and UCUM only under applicable licensing and jurisdictional rules.
- [ ] Data import/migration, deduplication, patient matching, external result provenance, consent checks, audit and bidirectional reconciliation.
- [ ] OpenAPI docs, sandbox, integration test harness, rate limits, webhook signing and partner onboarding.

## 16. GUI, colors, accessibility and interaction design (P0–P1)
- [ ] Create an original design system; do not reproduce Epic's proprietary layouts, icons or brand identity.
- [ ] Palette proposal (not Epic colors): primary navy #17324D, action teal #087F8C, background #F6F8FA, surface #FFFFFF, text #17212B, border #D6DEE5, success #237A57, warning #9B6500, danger #B42318, info #235EA7. Verify WCAG contrast in all combinations.
- [ ] Light, dark and high-contrast modes; theme tokens, facility branding and safe color-blind alternatives; never use color as sole signal for critical alerts.
- [ ] Global navigation by role: dashboard, patient search, schedules, inbox, worklists, orders, results, reports, admin.
- [ ] Patient chart: persistent patient banner, allergies/alerts, encounter context, left-side section navigation, central clinical workspace, optional right-side tasks/results; avoid unsafe context switching.
- [ ] Fast keyboard-first workflows, autosave feedback, undo where safe, optimistic concurrency conflict warnings, clear signatures and status.
- [ ] Responsive tablet/desktop layouts, WCAG 2.2 AA, screen reader labels, focus management, touch targets, RTL Arabic, English and multilingual support.
- [ ] Alert hierarchy: critical interruptive only when clinically justified; noncritical inline; show reason, action, source, timestamp and override path.
- [ ] Role-specific dashboards: physician rounding, nurse assignment, pharmacist verification, lab specimen queue, radiology worklist, front desk check-in, patient portal, administrator operations.
- [ ] Build Figma/open design tokens and usability-test realistic scenarios with clinicians and patients before release.

## 17. AI capabilities and safeguards (P2, after safe core)
**Public Epic comparison:** Art (clinicians), Emmie (patients), Penny (revenue cycle), and Agent Factory (agent-building). Implement original equivalents with explicit human oversight.
- [ ] AI chart summarization with source-linked citations, timestamps, uncertainty, role-based access and no invented facts.
- [ ] Ambient encounter transcription and draft notes/orders/diagnoses: consent, recording indicators, configurable retention, speaker separation, review-before-sign, no autonomous order placement.
- [ ] Draft patient messages, discharge instructions, referral letters, handoff summaries, shift notes and hospital-course notes with clinician approval.
- [ ] Patient-facing assistant for navigation, scheduling, billing explanations, health literacy and staff escalation; never represent chatbot output as a diagnosis.
- [ ] Revenue-cycle assistance: code suggestions, documentation gaps, denial triage, appeal drafts and billing questions with human review.
- [ ] AI-assisted radiology/pathology follow-up extraction, medication reconciliation, care-gap detection, clinical inbox routing and prioritization.
- [ ] Natural-language chart questions using retrieval, per-user authorization filters, citations and explicit abstention on missing evidence.
- [ ] AI agent SDK with scoped tools, allowlists, approval gates, audit/replay, sandbox evaluation, kill switch and human accountability.
- [ ] Model-agnostic local/self-hosted inference option; no PHI sent to external model providers without approved contracts, data controls and consent where required.
- [ ] Benchmark hallucinations, omissions, bias, multilingual performance, unsafe recommendations, prompt injection, model drift, privacy leakage and adversarial tests.
- [ ] AI output always labeled draft, provenance retained, clinician can edit/reject, and irreversible clinical actions require authorized human confirmation.
- [ ] Monitor performance by task and patient group with incident reporting, rollback and model version governance.

## 18. Verification and release gates
- [ ] P0 milestone: secure install, identity, audit, registration, longitudinal chart, encounters, notes, orders, results, basic FHIR, synthetic end-to-end test.
- [ ] P1 milestone: ambulatory, inpatient nursing, eMAR, ED, pharmacy, lab, scheduling, patient portal and integration adapters.
- [ ] P2 milestone: perioperative, imaging, revenue cycle, specialty packs, analytics, AI pilots with safety review.
- [ ] P3 milestone: broad specialty coverage, regional integrations, advanced research and multi-site scale.
- [ ] Gate each release on threat model, security tests, accessibility audit, backup restore drill, clinical simulation, downtime test, performance/load test and documented known limitations.
- [ ] Never deploy for real clinical care until independent clinical safety, privacy, regulatory and operational reviews are completed.

## What makes a leading enterprise EHR valuable — design principles
- [ ] Unified longitudinal record across care settings, reducing fragmentation and duplicate entry.
- [ ] Deep specialty workflows that still share a consistent patient identity and clinical context.
- [ ] Closed-loop ordering, results, medication administration and follow-up with accountable ownership.
- [ ] Role-specific high-throughput workspaces, templates, order sets and configurable workflows.
- [ ] Patient engagement, secure messaging, scheduling, access and care coordination.
- [ ] Interoperability, enterprise reporting, implementation support, training, governance and ongoing upgrades.
- [ ] Safety-first clinical decision support and continuously evaluated AI assistance.

## Public sources and verification notes
- Epic specialties: https://www.epic.com/software/specialties/
- Epic patient experience: https://www.epic.com/software/patient-experience/
- Epic AI overview: https://www.epic.com/software/ai/
- Epic Art clinician AI: https://www.epic.com/software/art/
- Epic AI Charting release (2026-02-04): https://www.epic.com/epic/post/epic-ai-charting-rolls-out-alongside-an-expanding-set-of-built-in-ai-capabilities/
- Epic nursing ambient AI (2026-08-13): https://www.epic.com/epic/post/mount-sinai-medical-center-among-first-in-the-nation-to-bring-ambient-ai-to-nurses/
- Epic patient-message AI (2026-11-04): https://www.epic.com/epic/post/nurses-answer-patient-messages-faster-gain-time-for-care-with-epic-ai/
- Epic Agent Factory (2026-09-15): https://www.epic.com/epic/post/at-agent-factory-build-a-thon-health-systems-create-their-own-ai-agents/
- HL7 FHIR: https://hl7.org/fhir/ ; SMART: https://smarthealthit.org/ ; OWASP ASVS: https://owasp.org/www-project-application-security-verification-standard/
**Caveat:** Epic's complete customer-specific configuration, private roadmap, and proprietary specifications are not publicly available. This is a broad, independently designed functional backlog informed by public materials, not a verified inventory of every Epic feature.
