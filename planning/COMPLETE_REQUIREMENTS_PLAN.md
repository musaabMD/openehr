# Complete requirement coverage for the current comparison set
Revision 2026-11-12. Baseline reviewed: main commit 595a8c23694111949e1fc051b4d887c6cbd57e50. Status: explicit draft requirements and acceptance scenarios, not implemented software or clinician-approved design.

## Coverage result
| Measure | Result | What is counted |
|---|---:|---|
| Epic functionality rows with explicit requirement contracts | **180/180 = 100%** | EP-001–EP-180 each has fields, workflow and normal/failure acceptance intent below |
| Epic unresolved comparison questions with explicit verification contracts | **10/10 = 100%** | EP-181–EP-190 are verification questions, not ten additional proven Epic features |
| All current Epic comparison rows mapped | **190/190 = 100%** | Traceability across the enumerated set, preserving source uncertainty |
| Additional major-EHR rows mapped | **61/61 = 100%** | Each maps to concrete contracts in the companion closure register |
| Implemented functionality | **0%** | Repository still contains planning documents only |
| Clinically validated functionality | **0%** | No deployment/test results are implied by acceptance criteria |

This is 100% requirement coverage of the named comparison set, not knowledge of 100% of Epic's private features. Research evidence/availability gaps remain evidence gaps. Counts are not safety, certification, performance or usability proof. An explicit contract establishes planned work; schema details, implementation design and specialist sign-off still require review.

The earlier 74 represented / 74 broad / 42 missing baseline remains historically accurate. This revision closes planning traceability by supplying individual contracts for all rows rather than merely relabeling the old umbrella tasks. See [original review and sources](EPIC_FEATURE_BY_FEATURE.md) and [updated traceability CSV](EPIC_FEATURE_BY_FEATURE.csv). No row is marked implemented or clinically complete.

## Binding delivery contract
All requirements below are unchecked engineering tasks. Each has an individual data contract, behavior and acceptance scenario; the following controls bind every one. A task is complete only after implementation and linked verification evidence—not because this document exists.

**Identity and data.** Every record/action carries organization/facility, patient identifier plus assigning authority where relevant, encounter/episode, unique immutable ID, actor/delegation, effective and recorded timestamps, source, terminology/schema version and optimistic revision. Explicitly distinguish absent/unknown/declined/not assessed. Signed records are amended, never silently overwritten. Preserve attachment/source checksums and lineage.

**API and lifecycle.** Define typed query/command contracts for each named entity; publish exact required/optional fields, formats, cardinalities, units, enums, constraints, error codes and state-transition permissions before coding. Mutating operations require idempotency keys, current revision and server authorization; persist the domain change and outbox/audit linkage atomically. Return authoritative committed/pending/conflict/rejected states. Never infer success from a browser save animation or transport receipt.

**Permission and ownership.** Deny by default at object/query/search/attachment/export/AI layers; apply care relationship, purpose, facility, consent/proxy and credential. Technical administrators do not inherit clinical signing. Sensitive specialties/payer/employer/research roles have distinct policies. Each unresolved task has current owner/coverage, escalation and closure evidence.

**GUI.** Apply [hospital UI contracts](HOSPITAL_GUI_SPEC.md): persistent patient/encounter, clear units/status/source freshness, keyboard support, accessible tables/forms and explicit errors. Build field-level normal, empty, loading, stale, conflict, denied, offline and recovery states; original light/dark/high-contrast English/Arabic RTL design. Preview consequential action against current patient and content. No unmeasured “best GUI” claim.

**Offline/performance.** Apply [offline/performance contracts](OFFLINE_AND_PERFORMANCE.md): hospital local server remains authoritative during internet loss; external transactions queue visibly; detached devices retain only approved encrypted scoped snapshots/unsigned drafts. Authorization expiry and conflict handling remain explicit. Reconnect reauthorizes and reconciles each event, with no silent last-write-wins for clinical meaning. Critical interactive budgets are tested at the documented scale; correctness and durability cannot be bypassed for speed.

**Audit and failure recovery.** Record view/sign/edit/export/admin/AI/action intent, result, version and correlation without leaking PHI to general logs. Test timeout after commit, retries, duplicated/out-of-order messages, concurrent revision, partner outage, device loss, disk/quota failure and restoration as applicable. Encryption/key recovery, backup restoration and audit integrity are deployment gates.

**Clinical and AI governance.** Clinical rules, thresholds, instruments, regimen content and drug knowledge require approved sources/licenses/version; none are supplied by generated prose. AI tasks use explicit intended use, source-linked draft output, uncertainty/abstention, authorized reviewer, model/prompt/corpus versions, approved data use, heldout evaluation and kill switch. Generated content cannot silently sign, prescribe, administer, diagnose, enroll, approve/deny coverage, send or publish. EXT-12 applies individually to every AI task.

**Verification evidence.** Use synthetic/approved test data. Record expected and actual results, fixtures, version, screenshots/traces where meaningful, owner, clinical/operational reviewer and unresolved hazards. Every requirement needs at least the stated normal path plus the stated failure conditions; tests are criteria, not already passed results.

## Owner roles, priorities and dependencies
| Requirement group | Priority | Accountable reviewer role to appoint | Dependencies |
|---|---|---|---|
| EP-001–007 core/outpatient | P0/P1 | Clinical informatics + ambulatory lead | FND-01–04, SEC-01–04, REC/ORD/INT foundation |
| EP-008–024 hospital/nursing/communications | P1, AI subsets P2 | Hospital medicine, nursing, pharmacy, infection prevention, case management leads | Shared chart, orders, local authority, qualified roles |
| EP-025–054 specialties | P1–P3 by DEP pack | Named specialty lead plus lab/imaging/pharmacy as relevant | Core clinical, catalog/terminology and interfaces |
| EP-055–078 patient/access/finance | P1/P2 | Patient access, privacy and revenue-cycle leads | Identity/consent, scheduling, transaction adapter |
| EP-079–106 exchange/population/payers | P1–P3 | Interoperability, population health and payer leads | Identity/purpose, versioned mappings and partner agreements |
| EP-107–171 individual AI tasks | P2/P3 | Task-specific clinician/operational lead + AI governance | Manual workflow verified, SEC-02, EXT-12 |
| EP-172–180 analytics/mobile/resilience/agents | P1–P3 | Analytics, nursing, IT operations and security leads | Scoped data, local durability, OFF/PERF and EXT-12 for agents |
| EP-181–190 verification questions | P0/P1 before corresponding deployment claim | Clinical safety, privacy/security, operations and regulatory leads | Matched source evidence and repeatable verification protocol |
| EXT requirements | Per task/deployment | Domain owner named in purpose plus relevant reviewer above | Shared controls and linked Epic requirement contracts |

Task statuses remain UNIMPLEMENTED; individual people are not invented. The project must appoint owners and approve detailed design before deployment. This does not reduce requirements mapping coverage; it limits readiness honestly.

## Individual requirement contracts

## Core chart and outpatient care

### EP-001

- [ ] **Shared patient chart** — functional requirement. Baseline R; related tasks: REC-01–05.
- **Data:** PatientIdentifier(authority,value), Encounter, RecordSource, revision.
- **Required workflow:** Authorized chart joins local encounters and reconciled outside records; show source and stale/unreconciled sections in persistent patient context.
- **Acceptance scenarios:** Retrieve two encounters and an outside amendment; deny another facility's unauthorized record; delayed patient-A response cannot paint patient B.

### EP-002

- [ ] **Chronic-condition workflows** — functional requirement. Baseline R; related tasks: DEP-01.
- **Data:** ConditionEpisode, approved pathwayVersion, goal, measure, dueTask.
- **Required workflow:** Enroll, assess, document approved intervention, measure outcome and recall; each overdue action has clinician/pool ownership.
- **Acceptance scenarios:** Complete a synthetic chronic-care review; declined care remains distinct from completed care; a retired pathway cannot silently rewrite prior goals.

### EP-003

- [ ] **Telehealth/e-visits** — functional requirement. Baseline B; related tasks: master §4; OPS-02.
- **Data:** VisitRequest(modality,urgency,location), consent, triageOwner, responseDue.
- **Required workflow:** Separate live video visits from asynchronous e-visits; verify identity/location, route triage, document response and close with follow-up ownership.
- **Acceptance scenarios:** Run both modalities; dropped video retains note and reconnect state; urgent asynchronous concern follows approved escalation, never routine auto-closure.

### EP-004

- [ ] **Preventive care-gap recall** — functional requirement. Baseline R; related tasks: OPS-06.
- **Data:** MaintenanceRule(version,eligibility,exclusion), lastEvidence, dueDate, contactConsent.
- **Required workflow:** Calculate preventive gaps from dated evidence; clinician accepts/excludes/defers; outreach schedules and closes only on qualifying evidence.
- **Acceptance scenarios:** New external evidence closes the correct gap; refusal/defer remain visible; rule updates are reproducible and do not erase past decisions.

### EP-005

- [ ] **Behavioral screening and treatment** — functional requirement. Baseline R; related tasks: DEP-15.
- **Data:** AssessmentInstrument(version), response, scoreProvenance, careEpisode, safetyPlan.
- **Required workflow:** Administer approved screening, review score and context, assign assessment/treatment and follow-up; restrict sensitive notes by policy.
- **Acceptance scenarios:** Reviewer confirms calculation on approved synthetic fixtures; missing responses are not zero; proxy/research exports exclude unauthorized segments.

### EP-006

- [ ] **Convenient/employee-health care** — functional requirement. Baseline B; related tasks: GAP-10.
- **Data:** OccupationalEpisode, exposure, fitnessOpinion, employerRecipient, consentScope.
- **Required workflow:** Separate worker clinical record from minimum employer fitness output; route care referrals and occupational follow-up under distinct privileges.
- **Acceptance scenarios:** Issue a scoped employer report; employer cannot see diagnoses or unrelated visits; revoked disclosure blocks future access.

### EP-007

- [ ] **Pediatric visit acceleration** — functional requirement. Baseline B; related tasks: DEP-14; HUI-28.
- **Data:** VisitChecklist(version,ageEligibility), itemStatus, vaccineEvidence, developmentalConcern.
- **Required workflow:** Present a pediatric visit checklist linked to chart sections; complete items independently without bulk asserting normal findings.
- **Acceptance scenarios:** Run well-child visit; skipped items stay unassessed; age/guardian change refreshes applicable items without overwriting signed entries.

## Inpatient, nursing and communications

### EP-008

- [ ] **Hospital care plans** — functional requirement. Baseline R; related tasks: DEP-02/03.
- **Data:** CarePlan(version), problem, goal, intervention, owner, reviewDue.
- **Required workflow:** Multidisciplinary staff propose, review, accept and revise goals; handoff transfers tasks with acceptance; discharge preserves open needs.
- **Acceptance scenarios:** Two disciplines revise without lost updates; removed team member's tasks enter covering pool; unmet goal cannot auto-mark achieved.

### EP-009

- [ ] **Critical-care workspace** — functional requirement. Baseline R; related tasks: DEP-05.
- **Data:** DeviceObservation(source,time,unit,quality), supportRecord, lineEvent, observationGap.
- **Required workflow:** Show ICU/NICU time-aligned observations, validated support/titration documentation and gaps; retain manual/device distinction.
- **Acceptance scenarios:** Replay late, duplicate and disconnected device data; no fabricated continuous trend; incompatible units block aggregation and stale values are labeled.

### EP-010

- [ ] **Pharmacy ordering** — functional requirement. Baseline R; related tasks: MED-01.
- **Data:** MedicationOrder(catalogVersion,doseUnit,route,frequency,indication,stopRule).
- **Required workflow:** Prescriber builds and reviews exact order; governed local safety checks precede signature; pharmacy queue receives authoritative revision.
- **Acceptance scenarios:** Submit one valid order; missing required unit and stale revision reject; retransmission creates one order, not two.

### EP-011

- [ ] **Pharmacy verification/preparation** — functional requirement. Baseline R; related tasks: MED-01/02.
- **Data:** Verification(orderRevision,reviewer), preparationBatch, ingredients, witness, releaseStatus.
- **Required workflow:** Qualified pharmacist verifies current order; technician prepares under assigned workflow; independent checks precede release where policy requires.
- **Acceptance scenarios:** Process a batch; changed order invalidates prior verification; technician cannot grant pharmacist release; recalled ingredient quarantines preparation.

### EP-012

- [ ] **Pharmacy dispensing/administration** — functional requirement. Baseline R; related tasks: MED-01/03.
- **Data:** DispenseEvent(orderRevision,lot), administrationEvent, scanEvidence, statusReason.
- **Required workflow:** Dispense then verify patient/medication and record administration or refusal/hold; reconcile cabinet/pump acknowledgements separately.
- **Acceptance scenarios:** Trace one dose end to end; barcode mismatch blocks routine completion; timeout remains pending; stopped order triggers current-state review.

### EP-013

- [ ] **Pharmacy inventory** — functional requirement. Baseline R; related tasks: MED-02.
- **Data:** StockItem(lot,expiry,location), movement, quarantine, reconciliationCase.
- **Required workflow:** Receive, store, transfer, count, dispense, return and recall with attributable stock movements; witnessed waste follows local controlled-drug policy.
- **Acceptance scenarios:** Recall finds remaining stock and exposed patients; negative unexplained inventory opens discrepancy; expired/quarantined lot cannot dispense.

### EP-014

- [ ] **Infection surveillance (Bugsy)** — functional requirement. Baseline B; related tasks: OPS-08; DEP-25.
- **Data:** SurveillanceDefinition(version), suspectedCase, labEvidence, exposureLink, reportingStatus.
- **Required workflow:** Infection prevention staff review signals, confirm/exclude cases, link contacts and submit approved mandatory reports; avoid automated diagnostic labels.
- **Acceptance scenarios:** Reproduce a cluster from synthetic evidence; corrected lab result reopens review; duplicate notification does not duplicate confirmed cases.

### EP-015

- [ ] **Case-manager task tracking** — functional requirement. Baseline B; related tasks: OPS-08.
- **Data:** CaseEpisode, coordinator, barrier, task, dueAt, handoffAcceptance.
- **Required workflow:** Case manager owns discharge/social/coverage barriers and dependent tasks; coordinate teams and escalate delays using dedicated worklist.
- **Acceptance scenarios:** Close one episode after all dependent tasks reconcile; departing coordinator's tasks transfer explicitly; unread message never closes a barrier.

### EP-016

- [ ] **Utilization review** — functional requirement. Baseline B; related tasks: master §13; GAP-06.
- **Data:** ReviewEpisode(servicePeriod,level,policyVersion), evidence, deadline, reviewerDecision.
- **Required workflow:** Perform concurrent/retrospective utilization review, gather evidence, communicate payer decision and track disagreement/appeal through separate states.
- **Acceptance scenarios:** Review changing service period; expired policy stays historical; unanswered request escalates; pending decision cannot display approved coverage.

### EP-017

- [ ] **Post-acute placement requests** — functional requirement. Baseline B; related tasks: DEP-24; OPS-08.
- **Data:** PlacementRequest, recipientFacility, capability, offer, expiry, authorization.
- **Required workflow:** Send consented placement packet, track offers and constraints, accept destination and coordinate transport; canceled/expired offers remain historical.
- **Acceptance scenarios:** Accept one valid offer; simultaneous acceptance cannot double-place; denied authorization reopens barrier and informs responsible team.

### EP-018

- [ ] **Bedside care access** — functional requirement. Baseline B; related tasks: master §12.
- **Data:** BedsideSession(patient,device,proxyScope), educationAssignment, careTeam, serviceRequest.
- **Required workflow:** Show current care plan/team and approved education; patients submit nonurgent requests; discharge/device reassignment terminates session.
- **Acceptance scenarios:** Reassign room tablet after discharge; old patient data inaccessible; nurse request displays submitted/accepted/resolved separately.

### EP-019

- [ ] **Staff secure chat** — functional requirement. Baseline G; related tasks: NEW-01.
- **Data:** ChatThread(contextPatient,participants), message, urgency, receipt, retentionRule.
- **Required workflow:** Authenticate care-team recipients, send secure messages and attachments, transfer coverage and escalate urgent nonresponse under approved policy.
- **Acceptance scenarios:** Wrong patient attachment prevented; unavailable recipient routes coverage; read receipt does not close clinical task; audit includes additions/removals.

### EP-020

- [ ] **Time-sensitive staff push** — functional requirement. Baseline B; related tasks: OPS-09.
- **Data:** Notification(eventId,recipientDevice,priority,ttl), deliveryAttempt, acceptedAction.
- **Required workflow:** Push minimal content with secure deep link; track delivery separately from read and clinical acceptance; use local fallback for unreachable devices.
- **Acceptance scenarios:** Lost/expired push creates owned escalation; duplicate push does not duplicate action; lockscreen contains no unnecessary PHI.

### EP-021

- [ ] **Nurse-call integration** — functional requirement. Baseline G; related tasks: NEW-01.
- **Data:** NurseCallEvent(device,room,patientLink,priority), acknowledgment, responder, resolution.
- **Required workflow:** Integrate call adapters, verify location mapping, assign response and retain independent bedside resolution; nurse-call system remains available through EHR outage.
- **Acceptance scenarios:** Room reassignment cannot route old call to new patient; adapter outage alarms locally; acknowledgement alone cannot resolve call.

### EP-022

- [ ] **Clinical VoIP integration** — functional requirement. Baseline G; related tasks: NEW-01.
- **Data:** DirectoryEntry(role,coverage,extension), callSession, identityContext, fallbackRoute.
- **Required workflow:** Launch authenticated staff calls from role directory with explicit patient context when permitted; maintain external emergency calling procedure.
- **Acceptance scenarios:** Wrong/missing extension handled without exposing chart; failed call offers fallback; directory update removes departed clinician.

### EP-023

- [ ] **Nursing ambient assessment drafts** — functional requirement. Baseline R; related tasks: AI-03.
- **Data:** RecordingConsent, speaker, assessmentDraft(field,sourceTime), reviewer.
- **Required workflow:** Capture approved nursing conversation and propose discrete assessment fields; nurse reviews each before committing observation/signature.
- **Acceptance scenarios:** Negation and wrong-speaker fixtures fail safely; unclear value stays empty; draft cannot satisfy a required signed assessment.

### EP-024

- [ ] **End-of-shift note drafts** — functional requirement. Baseline R; related tasks: AI-03.
- **Data:** ShiftInterval, assignedPatients, chartEvidence, outstandingTask, draftNote.
- **Required workflow:** Summarize the nurse's shift with dated evidence and unresolved care tasks; permit edit/reject and normal signature workflow.
- **Acceptance scenarios:** Prior shift's event retains time; unfinished task never becomes completed in narrative; changed assignment reauthorizes retrieval.

## Specialty features

### EP-025

- [ ] **Cardiac structured reports** — functional requirement. Baseline R; related tasks: DEP-11.
- **Data:** CardiacStudy(accession,procedureType), structuredMeasurement(unit,method), interpretation.
- **Required workflow:** Select procedure-specific form, reconcile measurements and create verified report with amendment/version history.
- **Acceptance scenarios:** Two measurement methods remain distinguishable; unsigned imported values cannot masquerade as final interpretation; corrected report preserves prior version.

### EP-026

- [ ] **Cardiac image/system links** — functional requirement. Baseline R; related tasks: DEP-11; INT-02.
- **Data:** ExternalStudyUID, accessionAuthority, patientMapping, imageLink, deviceResult.
- **Required workflow:** Link ECG/PACS/procedural data to correct study and patient, display availability and reconcile mismatches in operator queue.
- **Acceptance scenarios:** Duplicate accession across facilities remains distinct; unavailable image is visibly unavailable; mismatched patient link quarantines import.

### EP-027

- [ ] **Dental treatment planning** — functional requirement. Baseline R; related tasks: DEP-17.
- **Data:** DentalChart(toothSystem,tooth,surface), periodontalFinding, treatmentPhase, procedure.
- **Required workflow:** Record oral findings, propose and consent treatment, schedule phases, perform procedures and coordinate medical risks/referrals.
- **Acceptance scenarios:** Tooth-numbering system explicit in print/export; canceled treatment stays historical; imaging cannot attach to wrong tooth/patient.

### EP-028

- [ ] **Dermatology finding tracking** — functional requirement. Baseline R; related tasks: DEP-22.
- **Data:** LesionID, bodyLocation,laterality, photoConsent, measurement, specimenID.
- **Required workflow:** Follow each lesion over time, compare images/findings, link biopsy/pathology and assign follow-up until reviewed.
- **Acceptance scenarios:** Two nearby lesions remain distinct; revoked photo consent restricts new disclosure; missing pathology leaves owned unresolved task.

### EP-029

- [ ] **ED decision-support workspace** — functional requirement. Baseline R; related tasks: DEP-04; ORD-02.
- **Data:** EDArrival, acuityVersion, reassessmentDue, clinicalAlert, disposition.
- **Required workflow:** Provide triage/ED board and governed time-sensitive decision-support with current clinical context and response ownership.
- **Acceptance scenarios:** Unknown identity can receive tracked care; stale acuity triggers reassessment; unsupported alert threshold is not activated.

### EP-030

- [ ] **Endoscopy scheduling** — functional requirement. Baseline R; related tasks: DEP-21; OPS-01.
- **Data:** ProcedureBooking(service,resource,prepStatus), consent, transportNeed.
- **Required workflow:** Reserve endoscopy resources with preparation prerequisites, cancellation/reschedule and location-specific availability.
- **Acceptance scenarios:** Incomplete preparation triggers reviewed exception instead of silent clearance; concurrent booking cannot reserve exclusive resource twice.

### EP-031

- [ ] **Endoscopy reporting/follow-up** — functional requirement. Baseline R; related tasks: DEP-21.
- **Data:** ProcedureFinding(location,imageRef), specimenRef, reportRevision, recallPlan.
- **Required workflow:** Document findings linked to images/specimens, sign report, reconcile pathology and schedule reviewed surveillance/follow-up.
- **Acceptance scenarios:** Wrong image/specimen association rejected; amended pathology reopens follow-up; recall interval requires approved source and owner.

### EP-032

- [ ] **Genomic prescribing context** — functional requirement. Baseline B; related tasks: DEP-25.
- **Data:** GeneticReport(lab,assembly,variant,interpretationVersion), phenotype, consent.
- **Required workflow:** Present reviewed genotype/phenotype evidence in prescribing context, with explicit uncertainty and signed interpretation; never substitute generated medication rules.
- **Acceptance scenarios:** Reclassified variant prompts review; ambiguous allele remains uncertain; access honors genetics consent and exported provenance.

### EP-033

- [ ] **Tumor biomarker context** — functional requirement. Baseline B; related tasks: DEP-12/25.
- **Data:** TumorSample, biomarker(method,value,unit), molecularReportRevision, treatmentPlanRef.
- **Required workflow:** Link reviewed biomarkers to correct sample/episode and multidisciplinary plan; preserve differing methods and uncertain findings.
- **Acceptance scenarios:** Corrected molecular report prompts plan review; different tumor sample cannot overwrite prior finding; no automatic treatment selection.

### EP-034

- [ ] **Lab orders/specimen tracking** — functional requirement. Baseline R; related tasks: DEP-07.
- **Data:** LabOrder, specimenBarcode, accession, collectionTime, rejectionReason, resultVersion.
- **Required workflow:** Order, collect, receive, process/QC, verify and report with specimen custody and explicit rejection/recollection.
- **Acceptance scenarios:** Wrong-patient specimen quarantined; analyzer resend idempotent; critical/corrected result routes accountable follow-up.

### EP-035

- [ ] **Anatomic pathology** — functional requirement. Baseline R; related tasks: DEP-08.
- **Data:** Container,cassette,block,slide, specimenSite, grossingRecord, signedInterpretation.
- **Required workflow:** Trace specimen through preparation, pathologist review, second opinion and final/amended structured report.
- **Acceptance scenarios:** Broken custody or duplicate label blocks progression; correction never erases original; specimen count reconciles to originating procedure.

### EP-036

- [ ] **Dialysis treatment planning** — functional requirement. Baseline R; related tasks: DEP-19.
- **Data:** DialysisPrescription(version,access,modality,approvedParameters), session, deviation.
- **Required workflow:** Nephrologist signs prescription; team documents access/session observations and approved deviations; post-session reconciliation retains historical prescription.
- **Acceptance scenarios:** Prescription change affects intended session only; interrupted treatment records actual events; no unreviewed numerical treatment defaults.

### EP-037

- [ ] **Dialysis quality reporting** — functional requirement. Baseline B; related tasks: DEP-19; OPS-07.
- **Data:** MeasureDefinition(version,cohort,exclusions), sessionEvidence, reportingPeriod.
- **Required workflow:** Derive reviewed dialysis quality measures with reproducible denominator and traceable sessions; submit only approved regional outputs.
- **Acceptance scenarios:** Recompute closed period including amendment; missing session flagged, not imputed; incompatible measure editions never combine silently.

### EP-038

- [ ] **Prenatal-to-delivery documentation** — functional requirement. Baseline R; related tasks: DEP-13.
- **Data:** PregnancyEpisode, datingRevision,fetusID, deliveryEvent, motherNewbornLink.
- **Required workflow:** Prenatal record flows into labor/delivery and postpartum; maintain multiple fetuses/newborn identities and episode-linked observations.
- **Acceptance scenarios:** Twins and temporary newborn IDs remain distinct; revised dating retains original; restricted maternal data not automatically exposed through newborn proxy.

### EP-039

- [ ] **Fertility cycle tracking** — functional requirement. Baseline R; related tasks: GAP-07.
- **Data:** FertilityCycle, gameteEmbryoID, storageLocation, consentVersion, witnessEvent.
- **Required workflow:** Document reviewed fertility cycle and custody through collection/storage/transfer using approved identity witnessing and consent checks.
- **Acceptance scenarios:** Mismatched custody/witness or expired consent blocks affected step; every movement traceable; no clinical protocol invented by system.

### EP-040

- [ ] **Oncology protocol ordering** — functional requirement. Baseline R; related tasks: DEP-12.
- **Data:** RegimenVersion, cycle, prerequisite, medicationOrder, verification, toxicity.
- **Required workflow:** Oncologist reviews approved plan; validate prerequisites, double-check preparation/administration and document toxicity and holds.
- **Acceptance scenarios:** Regimen revision cannot alter past cycle; missing prerequisite enters hold; independent verification cannot be self-approved when prohibited.

### EP-041

- [ ] **Radiation treatment tracking** — functional requirement. Baseline R; related tasks: GAP-08.
- **Data:** RadiationCourse, planUID/version, approval, fraction, deliveredRecord, deviceRef.
- **Required workflow:** Integrate planning system with reviewed plan and fraction tracking; reconcile delivered treatment and interruptions under specialist governance.
- **Acceptance scenarios:** Wrong patient or stale plan cannot count as approved treatment; duplicate fraction delivery message reconciles; equipment system remains distinct authority.

### EP-042

- [ ] **Cancer staging/registry submission** — functional requirement. Baseline B; related tasks: DEP-12; master §14.
- **Data:** CancerEpisode, stageEdition, stageEvidence, reviewer, registrySchemaVersion.
- **Required workflow:** Review stage components and submit approved registry packet with source traceability, correction and response state.
- **Acceptance scenarios:** Stage edition preserved; incomplete stage remains incomplete; rejected registry submission stays owned; resubmission idempotent.

### EP-043

- [ ] **Eye diagnostics/imaging** — functional requirement. Baseline R; related tasks: DEP-16.
- **Data:** EyeFinding(laterality,method,unit), diagnosticStudy, imageRef, serialComparison.
- **Required workflow:** Capture eye-specific measurements and images, compare over time and produce signed reports with correction history.
- **Acceptance scenarios:** Wrong eye visibly rejected; method changes marked on graph; missing measurement never rendered as normal or zero.

### EP-044

- [ ] **Optometry-specific package** — functional requirement. Baseline G; related tasks: NEW-02.
- **Data:** OptometryEncounter, refraction(distance,near,correction), lensHistory, eyeHealth, referral.
- **Required workflow:** Separate optometry workspace with reviewed refraction/contact-lens templates, visual-function documentation and specialist referrals.
- **Acceptance scenarios:** Right/left and corrected/uncorrected values remain distinct; optical prescription amendment retains prior version; referral closure tracked.

### EP-045

- [ ] **Orthopedic location charting** — functional requirement. Baseline R; related tasks: DEP-18.
- **Data:** MusculoskeletalFinding(bodySite,laterality,location), injuryEpisode, procedure, implant.
- **Required workflow:** Document location-specific review and procedure findings on original body map; link rehabilitation and implant outcomes.
- **Acceptance scenarios:** Site/laterality explicit on every order/report; patient switch clears map draft; implant lot links recall to patient.

### EP-046

- [ ] **Joint-injection workflow** — functional requirement. Baseline B; related tasks: DEP-18; master §11.
- **Data:** InjectionProcedure(site,laterality,consent,medicationLot), checklist, complication.
- **Required workflow:** Verify patient/site/consent, record approved injected material and procedure, document aftercare and follow-up.
- **Acceptance scenarios:** Mismatched site/consent prevents routine completion; corrected medication entry remains amendment; no unsupported dose recommendation.

### EP-047

- [ ] **Joint registry export** — functional requirement. Baseline B; related tasks: DEP-18.
- **Data:** RegistryCase, implantID, procedureRevision, consent, exportSchema, response.
- **Required workflow:** Build reviewed joint-replacement registry packet from signed surgical/implant data; submit, reconcile rejection and correct.
- **Acceptance scenarios:** Missing implant lineage blocks submission; corrected case produces linked revision; export excludes unauthorized data.

### EP-048

- [ ] **Radiology schedule/exam/report** — functional requirement. Baseline R; related tasks: DEP-10.
- **Data:** ImagingOrder, accession, protocol, schedule, acquisition, interpretationRevision.
- **Required workflow:** Schedule/protocol/acquire/report while reconciling DICOM identity and contraindication screening under reviewed policy.
- **Acceptance scenarios:** Wrong accession quarantined; incomplete exam remains incomplete; corrected report and modality downtime generate owned recovery.

### EP-049

- [ ] **Radiology actionable findings** — functional requirement. Baseline R; related tasks: ORD-03; DEP-10.
- **Data:** ActionableFinding(reportRevision,category,recommendation), owner,dueDate,closureEvidence.
- **Required workflow:** Review report recommendations, assign accountable follow-up, escalate overdue work and close only with documented outcome.
- **Acceptance scenarios:** Portal view/read receipt cannot close finding; corrected report re-evaluates prior action; departing owner transfers responsibility.

### EP-050

- [ ] **Radiology resource dashboards** — functional requirement. Baseline B; related tasks: OPS-07; DEP-10.
- **Data:** ModalitySession, booking, acquisitionTimes, delayReason, metricDefinition.
- **Required workflow:** Show approved operational dashboard with utilization, queues and delays, excluding canceled activity per metric version.
- **Acceptance scenarios:** User drills into authorized cases; denominator/time interval visible; late corrections update metrics with lineage, not fabricated precision.

### EP-051

- [ ] **Pre/intra/postoperative record** — functional requirement. Baseline R; related tasks: DEP-06.
- **Data:** SurgicalCase, site, consent, checklist, eventTime, specimen, implant, PACUHandoff.
- **Required workflow:** Maintain one perioperative timeline across pre-op, intra-op and recovery with qualified documentation and accountable handoff.
- **Acceptance scenarios:** Count discrepancy, site mismatch or missing consent triggers approved handling; device outage preserves manual provenance; handoff acceptance recorded.

### EP-052

- [ ] **Anesthesia outcome/charge capture** — functional requirement. Baseline B; related tasks: DEP-06; OPS-03.
- **Data:** AnesthesiaEvent, outcomeDefinition, complication, chargeRuleVersion, reviewedCharge.
- **Required workflow:** Derive proposed outcomes/charges from verified anesthesia events; specialist/coder reviews and reconciles corrections.
- **Acceptance scenarios:** Aborted case and late amendment adjust proposed charges; no undocumented procedure charge; signed event history retained.

### EP-053

- [ ] **Transplant evaluation/follow-up** — functional requirement. Baseline R; related tasks: DEP-20.
- **Data:** TransplantEpisode, committeeDecision, waitlistState, donorRecipientLink, followupTask.
- **Required workflow:** Track evaluation, reviewed committee/waitlist transitions, surgery and longitudinal follow-up with separated donor/recipient access.
- **Acceptance scenarios:** Candidate deferral/removal keeps reasons and authority; donor record not exposed through recipient role; missed follow-up escalates.

### EP-054

- [ ] **Transplant research/registry** — functional requirement. Baseline B; related tasks: DEP-20; OPS-07.
- **Data:** TransplantRegistryPacket, studyConsent, episodeEvidence, schemaVersion, response.
- **Required workflow:** Generate reviewed clinical registry/research datasets with separate purpose/legal controls and correction lineage.
- **Acceptance scenarios:** Withdrawn study permission blocks prohibited new use; rejected registry packet remains owned; linked export contains minimum authorized fields.

## Patient experience

### EP-055

- [ ] **Cross-organization patient login** — functional requirement. Baseline R; related tasks: GAP-01.
- **Data:** AccountLink(organization,verifiedSubject,scope), consent, revocation, recoveryCase.
- **Required workflow:** Verify each organization identity independently, link accounts by explicit consent, show source and support unlink/recovery without merging clinical identities automatically.
- **Acceptance scenarios:** Same-name patients cannot link by name alone; unlink blocks subsequent source access; lost account recovery cannot bypass organization proofing.

### EP-056

- [ ] **Digital care access** — functional requirement. Baseline R; related tasks: OPS-01/02.
- **Data:** ServiceDirectory(location,availability,accessibility), careRequest, triageRoute.
- **Required workflow:** Let patients find appropriate services, submit requests and reach scheduling/telehealth under approved scope; distinguish advice from administrative navigation.
- **Acceptance scenarios:** Unavailable service offers reviewed alternatives; urgent clinical content follows escalation; guest search reveals no patient data.

### EP-057

- [ ] **Patient contact CRM** — functional requirement. Baseline R; related tasks: GAP-02.
- **Data:** ContactCase(identityProof,reason,channel), consent, scriptVersion, owner, escalation.
- **Required workflow:** Staff verify caller/proxy, review minimum necessary interaction history, route request and document resolution in purpose-scoped CRM.
- **Acceptance scenarios:** Wrong caller fails verification without disclosure; bounced contact remains unresolved; billing role cannot browse sensitive clinical notes.

### EP-058

- [ ] **Home care-plan guidance** — functional requirement. Baseline R; related tasks: GAP-03.
- **Data:** HomePlan(version,task,frequency,education), enrollment, patientResponse, monitoringCoverage.
- **Required workflow:** Enroll consenting patient, deliver approved guidance, collect completion/symptom responses and assign exceptions to staffed care team.
- **Acceptance scenarios:** Patient sees actual monitoring hours; missed response routes owner; declined task not marked completed; unsupported symptom advice escalates.

### EP-059

- [ ] **Wearable observations** — functional requirement. Baseline R; related tasks: GAP-03.
- **Data:** DeviceEnrollment(patient,deviceID), reading(value,unit,deviceTime,receivedTime,quality).
- **Required workflow:** Pair authorized wearable, ingest idempotently, normalize only validated units and retain source/quality; patients/team reconcile questionable readings.
- **Acceptance scenarios:** Duplicates collapse by stable identity; clock skew and impossible/incompatible units flag review; disconnected device displays data gap.

### EP-060

- [ ] **Remote monitoring** — functional requirement. Baseline R; related tasks: GAP-03.
- **Data:** MonitoringEpisode, approvedThresholdVersion, observation, alert, coveragePool.
- **Required workflow:** Apply validated site thresholds to accepted readings, generate owned alerts and document response/closure; network gaps have separate escalation.
- **Acceptance scenarios:** Alert delivered/read/action states distinct; absent data is not normal; no automated emergency-service guarantee; uncovered periods visibly explained.

### EP-061

- [ ] **Patient-directed temporary sharing** — functional requirement. Baseline R; related tasks: GAP-04.
- **Data:** ShareGrant(recipient,scope,expiry), proof, tokenDigest, accessLog.
- **Required workflow:** Patient authorizes minimal temporary view after identity verification; recipient authenticates, retrieves allowed sections and grant expires/revokes.
- **Acceptance scenarios:** Expired grant cannot fetch new data; sensitive segments excluded; downloaded copies labeled with disclosure limits and cannot be claimed remotely revocable.

### EP-062

- [ ] **Bedside clinical view** — functional requirement. Baseline B; related tasks: master §12.
- **Data:** BedsideSession, careTeam, schedule, education, mealServiceRequest, dischargeState.
- **Required workflow:** Authenticate inpatient/proxy on approved device; present care plan and approved nonurgent services; reset on transfer/discharge/device reassignment.
- **Acceptance scenarios:** Discharged patient's prior session cannot read next patient's chart; meal request checks diet restrictions; clinical request remains pending until staff accepts.

### EP-063

- [ ] **Patient health insights** — functional requirement. Baseline B; related tasks: OPS-02; AI-04.
- **Data:** InsightCard(sourceRecord,ruleOrModelVersion,reviewStatus), education, contactRoute.
- **Required workflow:** Show patient-approved health trends and explanations with source date and uncertainty, respecting results-release and proxy policy.
- **Acceptance scenarios:** Preliminary/corrected result labeled; changed report invalidates obsolete explanation; no unsourced diagnosis or false reassurance.

### EP-064

- [ ] **Patient appointment scheduling** — functional requirement. Baseline R; related tasks: OPS-01/02.
- **Data:** AppointmentType, eligibility, slot, resourceReservation, booking, cancellation.
- **Required workflow:** Patient searches authorized slots, reserves atomically, confirms and reschedules with policy/notification; preserve canceled booking history.
- **Acceptance scenarios:** Two simultaneous requests cannot secure same exclusive slot; expired reservation releases; timezone and location visible before confirmation.

### EP-065

- [ ] **Digital check-in** — functional requirement. Baseline B; related tasks: master §12; OPS-01.
- **Data:** CheckInSession(identity,encounter), demographicsProposal, coverageProposal, questionnaire.
- **Required workflow:** Verify arriving patient, collect updates and consent, reconcile changes with staff and mark arrival only for intended encounter.
- **Acceptance scenarios:** Unverified update cannot overwrite chart; duplicate arrival idempotent; proxy updates respect scope; offline input remains draft.

### EP-066

- [ ] **Earlier-slot notifications** — functional requirement. Baseline R; related tasks: OPS-01.
- **Data:** WaitlistEntry(criteria,priority), slotOffer(expiry), acceptance, reservation.
- **Required workflow:** Offer newly available slot to eligible patients under transparent rules; accepted offer atomically revalidates reservation and original appointment.
- **Acceptance scenarios:** Concurrent acceptance yields one reservation; expired offer cannot book; patient cannot lose existing appointment before confirmed replacement.

### EP-067

- [ ] **Multichannel communication** — functional requirement. Baseline B; related tasks: master §12; GAP-02.
- **Data:** CommunicationPreference(language,channel,purpose), templateVersion, delivery, optOut.
- **Required workflow:** Select permitted channel, render reviewed message, record delivery/bounce/response and fallback; separate transactional communications from outreach.
- **Acceptance scenarios:** Opt-out suppresses prohibited future messages across queues; SMS/push omit sensitive details; bounced urgent communication escalates to staff.

### EP-068

- [ ] **Patient finance assistance** — functional requirement. Baseline B; related tasks: OPS-03.
- **Data:** AssistanceApplication(householdEvidence,policyVersion), eligibilityReview, decision, appeal.
- **Required workflow:** Explain assistance options, collect minimum required evidence, route human review, communicate decision and reconcile account adjustment.
- **Acceptance scenarios:** Missing evidence stays pending; appeal retains original decision; applicant portal cannot access other guarantor's finances; offline submission not falsely delivered.

## Access and revenue

### EP-069

- [ ] **Visit/procedure/diagnostic scheduling** — functional requirement. Baseline R; related tasks: OPS-01.
- **Data:** ResourceCalendar(type,location,capacity), appointmentDependency, bookingVersion.
- **Required workflow:** Schedule visits/procedures/diagnostics against providers, rooms and equipment, checking sequence, preparation and exclusive resources server-side.
- **Acceptance scenarios:** Concurrent bookings respect capacity; rescheduling propagates dependent tasks; outage never presents tentative slot as confirmed.

### EP-070

- [ ] **Referral authorizations** — functional requirement. Baseline B; related tasks: ORD-04; OPS-03.
- **Data:** AuthorizationEpisode(service,coverage,validPeriod), evidence, request, payerResponse.
- **Required workflow:** Link referral to correct authorization, track pending/approved/denied/expired states and units; recheck changed service/coverage before use.
- **Acceptance scenarios:** Expired or exhausted authorization not shown valid; payer timeout remains pending; canceled referral reconciles outstanding authorization request.

### EP-071

- [ ] **Guest scheduling** — functional requirement. Baseline G; related tasks: NEW-03.
- **Data:** GuestSession(proofLevel), bookingIntent, verification, reservation, contact.
- **Required workflow:** Permit low-friction service search/booking with transaction-specific verification and abuse controls; create/link patient identity only after review.
- **Acceptance scenarios:** Name/DOB alone cannot reveal existing chart; repeated request idempotent; failed proof exposes no booked-patient identity.

### EP-072

- [ ] **Guest price shopping** — functional requirement. Baseline G; related tasks: NEW-03.
- **Data:** PublicServicePrice(version,assumptions), shopperInputs, estimateID, disclaimer.
- **Required workflow:** Provide no-login service estimates using nonsensitive inputs and transparent exclusions; invite verified account journey for personal insurance calculation.
- **Acceptance scenarios:** Public endpoint never queries/discloses patient account; expired price version flagged; estimate distinguished from final bill or coverage guarantee.

### EP-073

- [ ] **Hospital/professional estimates** — functional requirement. Baseline B; related tasks: OPS-03.
- **Data:** Estimate(components,professionalFacilitySplit,contractVersion), assumptions, patientShare.
- **Required workflow:** Calculate reviewed hospital/professional estimate from available coverage/contracts and service bundle; version changes and show uncertainty.
- **Acceptance scenarios:** Missing provider component explicit; changed service yields new estimate, not rewritten history; final charges reconcile to actual documented care.

### EP-074

- [ ] **Electronic insurance verification** — functional requirement. Baseline B; related tasks: OPS-03/04.
- **Data:** EligibilityQuery(coverage,serviceDate), payerTransaction, responseVersion, verifiedAt.
- **Required workflow:** Submit regional adapter request, interpret approved response fields, retain evidence and route errors/manual verification; expose freshness.
- **Acceptance scenarios:** Duplicate response reconciles; partner unavailable shows unverified/pending; prior eligibility is not proof of authorization or future payment.

### EP-075

- [ ] **Self-pay arrangements** — functional requirement. Baseline B; related tasks: OPS-03.
- **Data:** SelfPayAgreement(balance,terms,consent,installments), adjustment, reconciliation.
- **Required workflow:** Staff review balance, agree permissible terms, schedule payments/communications and reconcile changes/assistance with financial ledger.
- **Acceptance scenarios:** Payment retries never double charge; hardship adjustment retains audit; default does not silently alter clinical care access.

### EP-076

- [ ] **Registration automation** — functional requirement. Baseline B; related tasks: OPS-01; AI-06.
- **Data:** RegistrationProposal(source,fields,confidence), matchedIdentity, reviewer, revision.
- **Required workflow:** Import verified submissions/documents as proposed demographic/coverage updates; authorized staff resolve identity and field conflicts.
- **Acceptance scenarios:** Ambiguous same-name identity quarantined; confidence alone never merges records; approved field update retains before/after and source.

### EP-077

- [ ] **Charge automation** — functional requirement. Baseline B; related tasks: OPS-03; AI-05.
- **Data:** ChargeProposal(triggerEvent,codeVersion,ruleVersion), reviewer, reversal.
- **Required workflow:** Derive proposed charges only from documented clinical/operational evidence, check duplicates and route approval/edits before billing.
- **Acceptance scenarios:** Aborted/canceled procedure cannot charge as completed; amended source revises/reverses through audit; no generated evidence added to support charge.

### EP-078

- [ ] **Patient payment access** — functional requirement. Baseline R; related tasks: OPS-03.
- **Data:** PaymentIntent(account,amount,currency), tokenizedProviderRef, signedCallback, refund.
- **Required workflow:** Verify payer/account scope, create idempotent payment, process signed provider notifications and reconcile/refund without storing card data unnecessarily.
- **Acceptance scenarios:** Lost callback remains pending until verified; replay/changed amount rejected; refund approval and ledger reconciliation attributable.

## Interoperability

### EP-079

- [ ] **Cross-EHR exchange** — functional requirement. Baseline R; related tasks: INT-01/02.
- **Data:** ExchangeRequest(purpose,identity,consent), sourceDocument, mappingVersion, reconciliation.
- **Required workflow:** Request outside data through approved interfaces, match patient, quarantine uncertain identity and reconcile accepted facts with source/version.
- **Acceptance scenarios:** Corrected outside result doesn't silently erase local interpretation; duplicate documents collapse appropriately; revoked consent blocks new unauthorized retrieval.

### EP-080

- [ ] **Community-hosted EHR extension** — functional requirement. Baseline R; related tasks: GAP-05.
- **Data:** AffiliateAgreement, organizationBoundary, authorityPartition, serviceLevel, exitPackage.
- **Required workflow:** Host community facility under explicit data/privilege/operations boundaries, shared patient identity policy and independently restorable exit export.
- **Acceptance scenarios:** Affiliate user cannot browse unrelated facility; upgrade restores prior configuration; exit package includes identifiers, documents and audit provenance.

### EP-081

- [ ] **Patient-directed FHIR apps** — functional requirement. Baseline R; related tasks: INT-01.
- **Data:** FHIRCapability, profileVersion, SMARTClient, scope, consentGrant, resourceRevision.
- **Required workflow:** Publish supported profiles/search/write semantics, authorize apps and expose only permitted records with pagination and auditable revocation.
- **Acceptance scenarios:** Unsupported resource/write fails explicitly; revoked grant invalidates new requests; attachment/search/export scope matches chart access.

### EP-082

- [ ] **Government record exchange** — functional requirement. Baseline B; related tasks: OPS-04; INT-02.
- **Data:** AgencyAdapter(country,legalBasis,requestType), authorization, packet, receipt.
- **Required workflow:** Map approved government record-request contracts to minimum permitted dataset; staff review authority, dispatch and reconcile receipt/rejection.
- **Acceptance scenarios:** Unverified request blocked; network failure stays queued; correction retains linked prior packet; no country enabled by generic compliance flag.

### EP-083

- [ ] **Community-provider chart/referral access** — functional requirement. Baseline R; related tasks: OPS-09.
- **Data:** CommunityUser(careRelationship,facility), referral, scopedChartView, expiry.
- **Required workflow:** Verify external provider relationship and grant limited chart/referral access with time/purpose bounds and notifications.
- **Acceptance scenarios:** Ended relationship revokes new access; search reveals only authorized patients; clinician notification does not imply referral acceptance.

### EP-084

- [ ] **Payer clinical/claims exchange** — functional requirement. Baseline R; related tasks: GAP-06.
- **Data:** PayerExchange(purpose,contract), claimClinicalLink, packet, freshness.
- **Required workflow:** Exchange clinical/claims information under distinct care/coverage purposes with field-level minimization, consent/legal review and source lineage.
- **Acceptance scenarios:** Employer/payer role cannot inherit care-team privileges; duplicate events reconciled; stale paid-claim data labeled.

### EP-085

- [ ] **Electronic referral exchange** — functional requirement. Baseline R; related tasks: ORD-04; INT-02.
- **Data:** ReferralMessage(id,patientAuthority,question,urgency), acceptance, consultReport, closure.
- **Required workflow:** Send structured referral/attachments, obtain receipt and accepting clinician, track scheduling and return signed report for referring-team review.
- **Acceptance scenarios:** Rejected/unbooked referral remains owned; transport receipt cannot count as clinical acceptance; correction routes current owner.

### EP-086

- [ ] **Outside-test duplication checks** — functional requirement. Baseline B; related tasks: ORD-02; INT-04.
- **Data:** TestComparison(code,method,specimen,time,source), duplicateCandidate, override.
- **Required workflow:** Compare proposed local test against authorized outside evidence using reviewed mappings; show possible duplication with uncertainty and clinician choice.
- **Acceptance scenarios:** Method/time mismatch not treated interchangeable; unknown identity excluded; clinician records appropriate override without deleting original evidence.

### EP-087

- [ ] **Cross-network care gaps** — functional requirement. Baseline B; related tasks: OPS-06; GAP-06.
- **Data:** NetworkGap(ruleVersion,sourceCompleteness), evidence, conflict, assignedTask.
- **Required workflow:** Combine authorized local/outside evidence for reviewed care-gap rules, mark incomplete feeds and require resolution of conflicting facts.
- **Acceptance scenarios:** Late outside evidence triggers recalculation; missing feed not misrepresented as untreated condition; closure retains qualifying evidence.

### EP-088

- [ ] **Published interface catalog** — functional requirement. Baseline B; related tasks: master §15; INT-01/02.
- **Data:** InterfaceSpec(protocol,version,operations,scopes), schema, sandboxCase, deprecation.
- **Required workflow:** Publish searchable developer catalog, examples, contracts and synthetic sandbox; version incompatible changes and document supported deployments.
- **Acceptance scenarios:** Example credentials synthetic; deprecated interface announces timeline; schema/contract tests reject undocumented writes and invalid authorization.

## Population health

### EP-089

- [ ] **External clinical/claims aggregation** — functional requirement. Baseline R; related tasks: OPS-06; INT-04.
- **Data:** AggregateFact(source,patientMapping,clinicalOrClaimTime), qualityFlag, lineage.
- **Required workflow:** Ingest clinical and paid-claim datasets into governed common model; reconcile duplicates, amendments and access by purpose.
- **Acceptance scenarios:** Source correction propagates with lineage; ambiguous identity excluded from actionable aggregate; restricted fact cannot leak through dashboard.

### EP-090

- [ ] **Value-contract performance** — functional requirement. Baseline B; related tasks: OPS-07; master §13.
- **Data:** ValueContract(version,attribution,period,measures,target,costBasis), settlement.
- **Required workflow:** Compute reviewed population/financial performance against contract-specific definitions; expose assumptions, lag and opportunities for staff review.
- **Acceptance scenarios:** Different attribution periods stay separate; late claim restates report with version; financial trend cannot be presented as causal clinical effect.

### EP-091

- [ ] **Cross-setting care management** — functional requirement. Baseline B; related tasks: OPS-06; DEP-24.
- **Data:** CareManagementEnrollment, needs, goals, intervention, coordinator, transition.
- **Required workflow:** Assess across settings, assign social/clinical tasks, track outcomes and transfer responsibility with explicit acceptance.
- **Acceptance scenarios:** Discharged patient retains coordinator until accepted transfer; declined intervention not completed; duplicate program enrollment reconciled.

### EP-092

- [ ] **Previsit team huddle** — functional requirement. Baseline B; related tasks: DEP-01; HUI-05.
- **Data:** HuddleSession(date,team), scheduledPatient, readinessItem, taskOwner.
- **Required workflow:** Provide authorized previsit team list with screenings, missing preparation and assigned actions; reconcile changes as patients arrive.
- **Acceptance scenarios:** Canceled visit removed without losing needed follow-up; team role limits display; bulk action cannot assert unperformed clinical assessment.

### EP-093

- [ ] **Social-needs resource directory** — functional requirement. Baseline G; related tasks: NEW-04.
- **Data:** ResourceDirectory(version,eligibility,capacity,contact), socialNeed, referral, outcome.
- **Required workflow:** Review need with patient, select available resource, obtain disclosure consent, route referral and track acceptance/service/outcome.
- **Acceptance scenarios:** Outdated capacity triggers confirmation; declined referral returns coordinator; resource directory never promises service not accepted.

### EP-094

- [ ] **Adaptive outreach campaigns** — functional requirement. Baseline B; related tasks: OPS-06; GAP-02.
- **Data:** Campaign(audienceDefinition,consent,purpose), channelSequence, attempt, stopRule.
- **Required workflow:** Staff approve eligible population and message sequence, send only allowed contacts, fallback on nondelivery and stop on response/opt-out.
- **Acceptance scenarios:** Sync/restored queue rechecks opt-out; frequency cap enforced; recipient count reproducible; campaign cannot auto-close a clinical gap.

### EP-095

- [ ] **ACO quality-file aggregation** — functional requirement. Baseline G; related tasks: NEW-05.
- **Data:** QualityPackage(jurisdiction,measureVersion), patientEvidence, QRDAFile, submission.
- **Required workflow:** Import/export applicable quality formats, reconcile affiliate data, validate measures and review aggregate submission with evidence trace.
- **Acceptance scenarios:** Duplicated affiliate patient not double counted; rejected schema stays pending; corrected evidence regenerates versioned report without pretending certification.

## Health plans

### EP-096

- [ ] **Enrollment and benefit administration** — functional requirement. Baseline R; related tasks: GAP-06.
- **Data:** MemberEnrollment(effectivePeriod), planBenefitVersion, dependent, eligibilityRevision.
- **Required workflow:** Enroll/change/terminate member benefits under reviewed rules; preserve retroactive adjustments and communicate affected authorizations/claims.
- **Acceptance scenarios:** Coverage gap explicit; retroactive termination opens reconciliation rather than erasing paid claims; dependent scope verified.

### EP-097

- [ ] **Service authorization** — functional requirement. Baseline R; related tasks: GAP-06.
- **Data:** PayerAuthorization(service,policyVersion,units,validity), criteriaEvidence, reviewerDecision.
- **Required workflow:** Receive request, verify enrollment, gather evidence and record authorized human decision, reason, notice and appeal lifecycle.
- **Acceptance scenarios:** Missing criterion is unknown, not automatically denied; changed service reopens review; deadline violation escalates.

### EP-098

- [ ] **Claims and capitation payment** — functional requirement. Baseline B; related tasks: GAP-06.
- **Data:** Claim(adjudicationVersion), contract, capitationAttribution, settlement, reversal.
- **Required workflow:** Separate fee-for-service adjudication from population-based capitation; review accrual, payments and corrections through reconciled ledger.
- **Acceptance scenarios:** Retroactive enrollment/attribution produces linked adjustment; duplicate remittance cannot double pay; appealed claim retains prior decision.

### EP-099

- [ ] **Member communications portal** — functional requirement. Baseline B; related tasks: GAP-06; OPS-02.
- **Data:** MemberPortalIdentity, coverageScope, notice, communicationPreference.
- **Required workflow:** Present permitted benefit/authorization/claim information and reminders under member-specific identity and proxy controls.
- **Acceptance scenarios:** Member role cannot expose dependent's restricted clinical information; terminated enrollment follows retention/access policy; failed notice stays owned.

### EP-100

- [ ] **Provider risk/gap portal** — functional requirement. Baseline B; related tasks: GAP-06; OPS-06.
- **Data:** ProviderPortalRelationship, attributedMembers, riskModelVersion, gapEvidence.
- **Required workflow:** Show purpose-scoped risk/gap information to contracted providers with source freshness and care-coordination action tracking.
- **Acceptance scenarios:** Provider sees only authorized membership/relationship; unknown risk model not implied clinically validated; drilldown preserves source restrictions.

### EP-101

- [ ] **Employer coverage portal** — functional requirement. Baseline G; related tasks: NEW-06.
- **Data:** EmployerPortalContract, coveredGroup, permittedCoverageFields, aggregatePolicy.
- **Required workflow:** Provide approved coverage/administrative output and disclosure-controlled aggregates, without confidential worker clinical details.
- **Acceptance scenarios:** Small-cell and row restrictions enforced; employer cannot infer diagnosis through filter/export; revoked contract removes new access.

### EP-102

- [ ] **Utilization review deadlines** — functional requirement. Baseline B; related tasks: GAP-06.
- **Data:** ReviewClock(jurisdiction,serviceType,calendar,pauses), dueAt, escalation.
- **Required workflow:** Calculate review turnaround from versioned rules, expose pause basis and route overdue/urgent work to accountable reviewer.
- **Acceptance scenarios:** Timezone/holiday/clock-change fixtures reproduce deadlines; unauthorized pause cannot stop clock; late decision retains breach event.

### EP-103

- [ ] **Referral steering/network recommendations** — functional requirement. Baseline G; related tasks: NEW-06.
- **Data:** ProviderNetwork(version,specialty,capacity,location), routingCriteria, recommendation.
- **Required workflow:** Offer transparent network referrals based on approved eligibility/availability and patient constraints; allow human choice and override.
- **Acceptance scenarios:** Outdated capacity prompts confirmation; no recommendation implies guaranteed appointment; criteria changes preserve prior explanation and fairness review.

### EP-104

- [ ] **Bed-day tracking** — functional requirement. Baseline B; related tasks: GAP-06; DEP-02.
- **Data:** InpatientCoverageDay(date,clinicalEvidence,status), reviewEpisode, denialAppeal.
- **Required workflow:** Track requested/approved/pending/denied days independently from actual clinical ADT; reconcile payer decisions and appeals.
- **Acceptance scenarios:** Patient remains clinically admitted despite pending coverage; timezone crossing not duplicate day; reversal preserves original payer state.

### EP-105

- [ ] **Payer event/authorization exchange** — functional requirement. Baseline R; related tasks: GAP-06; INT-02.
- **Data:** PayerClinicalEvent(id,purpose), authorizationUpdate, subscriptionScope, receipt.
- **Required workflow:** Publish/receive scoped admission/discharge/authorization events with stable IDs and resumable reconciliation.
- **Acceptance scenarios:** Reordered decision event cannot silently overwrite newer authority revision; expired subscription blocks delivery; retry idempotent.

### EP-106

- [ ] **Member analytics** — functional requirement. Baseline B; related tasks: GAP-06; OPS-07.
- **Data:** MemberMetric(definition,period,attribution), riskSource, dashboard, scheduledExport.
- **Required workflow:** Produce versioned clinical/business member analytics with role/purpose controls, refresh labels and approved disclosures.
- **Acceptance scenarios:** Report reruns reproduce cohort; suppression applies to downloads as well as screen; delayed claims flagged and prior results retained.

## Clinician AI (Art)

### EP-107

- [ ] **Message-response drafting** — functional requirement. Baseline R; related tasks: AI-03.
- **Data:** IncomingMessage, authorizedContext, draftResponse, escalationFlag, sourceRefs.
- **Required workflow:** Propose reply grounded in permitted chart/message context, show evidence, let clinician edit/reject and send through normal communications authorization.
- **Acceptance scenarios:** Wrong patient, missing context, negation and urgent-message fixtures evaluated; draft never sends itself; rejected draft cannot close inbox item.

### EP-108

- [ ] **Outpatient note/order/diagnosis drafts** — functional requirement. Baseline R; related tasks: AI-02.
- **Data:** ConsentedTranscript(speaker,time), encounter, noteDraft, proposedOrder, proposedDiagnosis.
- **Required workflow:** Extract encounter-specific proposals, resolve catalog terms, show original utterances and require clinician review plus normal signing/safety checks.
- **Acceptance scenarios:** Patient-reported medication never becomes new prescription automatically; wrong speaker/ambiguous unit remains unresolved; duplicate generation creates no extra order.

### EP-109

- [ ] **Inpatient/outpatient summaries** — functional requirement. Baseline R; related tasks: AI-01.
- **Data:** SummaryScope(encounters,dateWindow), fact(source,time), contradiction, unknown.
- **Required workflow:** Generate visit/inpatient summary with source links and visible recency; allow user to inspect evidence or abstain.
- **Acceptance scenarios:** Contradictory allergies and stopped medications stay explicit; hidden segments not retrieved; source unavailable yields missing-evidence label rather than invented fact.

### EP-110

- [ ] **Nursing care-plan note drafts** — functional requirement. Baseline R; related tasks: AI-03.
- **Data:** ShiftCarePlanEvidence, goalStatus, proposedNarrative, unresolvedTask.
- **Required workflow:** Draft nurse care-plan note from assigned patients and actual shift events; show incomplete interventions and require nurse signature.
- **Acceptance scenarios:** Planned intervention cannot become performed; previous shift correctly dated; review before chart commit; no absent measurement filled in.

### EP-111

- [ ] **AI text rewriting** — functional requirement. Baseline B; related tasks: master §17.
- **Data:** OriginalText, rewritePurpose, audience, proposedText, semanticDiff.
- **Required workflow:** Suggest readability/tone changes while preserving clinical facts, doses, negation and uncertainty; expose comparison and accept/reject.
- **Acceptance scenarios:** Adversarial numerals/negations retained; unsupported addition flagged; original never overwritten before user acceptance.

### EP-112

- [ ] **Cancer-stage extraction** — functional requirement. Baseline G; related tasks: NEW-07.
- **Data:** CancerStageSchema(edition), sourceSpan, extractedComponent, confidence, reviewer.
- **Required workflow:** Extract staging components with evidence and missing/ambiguous fields; oncology reviewer assigns approved structured stage.
- **Acceptance scenarios:** Tumor site/edition mismatch rejected; historical stage not mistaken current; model cannot finalize registry stage.

### EP-113

- [ ] **Imaging follow-up extraction** — functional requirement. Baseline B; related tasks: master §17; ORD-03.
- **Data:** RadiologyReport(revision), sourceSpan, finding, recommendation, urgencyProposal.
- **Required workflow:** Extract follow-up candidates and link report evidence; clinician confirms clinical meaning, owner and due date before task activation.
- **Acceptance scenarios:** Negated/resolved incidental finding not active; corrected report reopens review; extraction alone cannot close communication.

### EP-114

- [ ] **Hospital-course drafts** — functional requirement. Baseline B; related tasks: master §17; AI-03.
- **Data:** AdmissionEpisode, datedNotes, codeEvents, hospitalCourseDraft.
- **Required workflow:** Summarize admission sequence and key decisions with source chronology, unresolved issues and clinician-approved final narrative.
- **Acceptance scenarios:** Outside admission excluded unless attributed; canceled/incorrectly entered events identified; no fabricated resolution at discharge.

### EP-115

- [ ] **Inbox patient-context summary** — functional requirement. Baseline B; related tasks: AI-01/03.
- **Data:** MessageID, contextSnapshot, medsProblemsResults, sourceFreshness.
- **Required workflow:** Show concise authorized context beside inbox reply; include current status and conflicts without changing underlying lists.
- **Acceptance scenarios:** Summary invalidates on patient/message switch; amended result refreshes; no inferred diagnosis from unrelated encounter.

### EP-116

- [ ] **Inpatient/ED ambient drafts** — functional requirement. Baseline B; related tasks: AI-02; DEP-04.
- **Data:** EDOrInpatientEncounter, consent, speakerSegments, noteDraft, pendingOrderProposal.
- **Required workflow:** Capture multi-party acute-care discussion as draft, distinguish current actions from historical/conditional statements and queue proposals for review.
- **Acceptance scenarios:** Emergency interruption retains partial draft; overheard other-patient speech rejected; conditional orders never commit automatically.

### EP-117

- [ ] **Home OASIS assessment suggestions** — functional requirement. Baseline G; related tasks: NEW-07.
- **Data:** AssessmentEdition, itemDefinition, visitTranscript, proposedAnswer, evidence.
- **Required workflow:** Suggest individual home-assessment fields only for approved instrument/license, with field-level review and visit-time applicability.
- **Acceptance scenarios:** Missing evidence remains blank; wrong edition cannot map silently; output cannot submit/sign regulatory assessment.

### EP-118

- [ ] **Medication rationale insights** — functional requirement. Baseline B; related tasks: AI-01; MED-01.
- **Data:** MedicationHistory(orderEvents,indications,notes), rationaleEvidence, uncertainty.
- **Required workflow:** Summarize documented medication starts/stops/changes and reasons with dated excerpts; distinguish inferred association from documented rationale.
- **Acceptance scenarios:** Similar drugs not conflated; refill message not proof of adherence; no evidence means rationale unknown.

### EP-119

- [ ] **Risk-adjustment evidence summary** — functional requirement. Baseline B; related tasks: AI-05.
- **Data:** DiagnosisCandidate, historicalEvidence, codeVersion, riskContext.
- **Required workflow:** Present source-backed historical diagnosis evidence to qualified coding/review staff without asserting a new condition or overstating risk.
- **Acceptance scenarios:** Resolved/rule-out diagnoses labeled; duplicate condition not inflated; clinician/coder retains authority and rejection history.

### EP-120

- [ ] **Pre-anesthesia risk summary** — functional requirement. Baseline G; related tasks: NEW-07.
- **Data:** PreAnesthesiaScope, reviewedChartEvidence, concern, missingData.
- **Required workflow:** Summarize documented anesthesia-relevant conditions, prior procedures and medications with sources for anesthetist review.
- **Acceptance scenarios:** No automatic clearance/risk category; stale history and conflicting reports visible; missing studies treated unknown.

### EP-121

- [ ] **Diagnosis-code proposals** — functional requirement. Baseline R; related tasks: AI-05.
- **Data:** EncounterFinding, diagnosisCodeSystem/version, proposal, justification.
- **Required workflow:** Suggest code from documented current assessment, show text/code mapping and require clinician/coder acceptance through normal workflow.
- **Acceptance scenarios:** Negated/ruled-out condition not offered as confirmed; retired code flagged; accepted code does not alter signed narrative.

### EP-122

- [ ] **Visit service-level proposals** — functional requirement. Baseline G; related tasks: NEW-07.
- **Data:** ServiceContext(jurisdiction,codeSet,documentation,timeEvidence), levelProposal.
- **Required workflow:** Apply approved service-level rule set to actual evidence and show contributing facts; qualified user selects final level.
- **Acceptance scenarios:** Missing time/complexity not fabricated; wrong jurisdiction blocks recommendation; higher reimbursement never substitutes clinical justification.

### EP-123

- [ ] **Transition-of-care summaries** — functional requirement. Baseline R; related tasks: AI-01/03.
- **Data:** TransitionEpisode, dischargeEvidence, pendingTest, medicationChange, receivingTeam.
- **Required workflow:** Draft transition summary with remaining actions, responsible owners and reconciliation issues, ready for clinician review and controlled sharing.
- **Acceptance scenarios:** Unresulted tests retain owner; receiving team acceptance separate from send receipt; restricted notes excluded.

### EP-124

- [ ] **Pathology structured extraction** — functional requirement. Baseline G; related tasks: NEW-07.
- **Data:** PathologyNarrative, structuredSchema, extractedField, sourceSpan, reviewer.
- **Required workflow:** Extract into draft synoptic fields preserving narrative, specimen identity and uncertainty; pathologist validates/signs final report.
- **Acceptance scenarios:** Specimen/site mismatch stops extraction-to-chart; missing margin/grade not inferred; corrected narrative invalidates proposed fields.

### EP-125

- [ ] **Cardiac procedure narratives** — functional requirement. Baseline G; related tasks: NEW-07.
- **Data:** CardiacProcedureEvent, verifiedMeasurement, narrativeTemplate, draft.
- **Required workflow:** Generate draft procedure narrative from verified intraprocedural data and approved terminology with cardiologist review.
- **Acceptance scenarios:** Aborted procedure and complication reflected; unverified device value not promoted to final fact; wrong accession blocks generation.

### EP-126

- [ ] **Patient-instruction drafts** — functional requirement. Baseline R; related tasks: AI-03.
- **Data:** ApprovedAssessmentPlan, instructionTemplate, language, sourceRefs.
- **Required workflow:** Draft after-visit instructions only from documented plan, preserving medication units, restrictions, warning signs and follow-up intended by clinician.
- **Acceptance scenarios:** Cannot add new treatment or unsupported timeframe; contradictory plan requests clarification; signature/release requires human approval.

### EP-127

- [ ] **Outside-medication extraction** — functional requirement. Baseline B; related tasks: master §17; MED-01.
- **Data:** OutsideMedicationText, doseUnit, route, frequency, source, parseStatus.
- **Required workflow:** Parse external medication statements as reconciliation proposals, show original text and unresolved abbreviations; pharmacist/clinician accepts into local list.
- **Acceptance scenarios:** Decimal/unit ambiguity blocks auto-fill; historical medication not assumed active; duplicate imported statement not second active therapy.

### EP-128

- [ ] **Referral-reason summaries** — functional requirement. Baseline B; related tasks: AI-01; ORD-04.
- **Data:** ReferralQuestion, reasonEvidence, urgency, priorWorkup, missingItems.
- **Required workflow:** Summarize why consultation requested and relevant authorized workup for specialist review; preserve question and uncertainty.
- **Acceptance scenarios:** Referral question not replaced by model diagnosis; missing attachments flagged; quoted urgent concern not silently downgraded.

### EP-129

- [ ] **Social-needs extraction** — functional requirement. Baseline G; related tasks: NEW-07.
- **Data:** NoteSpan, proposedSocialNeed(type,status,time), screeningReminder, consent.
- **Required workflow:** Flag possible social barriers as unconfirmed screening opportunities; staff confirm with patient before care-plan or directory referral.
- **Acceptance scenarios:** Quoted family member's problem not assigned to patient; resolved need dated; no automatic stigmatizing chart label.

### EP-130

- [ ] **Therapy progress-note drafts** — functional requirement. Baseline G; related tasks: NEW-07.
- **Data:** TherapyEpisode, goalVersion, functionalMeasure, visitEvidence, progressDraft.
- **Required workflow:** Draft PT/OT/speech assessment referencing measured progress, current goals and actual treatment for therapist review.
- **Acceptance scenarios:** No invented improvement or delivered therapy; changed measure edition separated; plan and performed intervention remain distinct.

### EP-131

- [ ] **ED problem summaries** — functional requirement. Baseline B; related tasks: AI-01; DEP-04.
- **Data:** EDSummaryScope, activeAndHistoricalProblems, sourceTime, contradictions.
- **Required workflow:** Produce concise ED problem/history summary with source/time and unresolved discrepancies to accelerate clinician chart review.
- **Acceptance scenarios:** “History of” not transformed into active emergency; high-risk contradiction visible; no independent triage/disposition decision.

### EP-132

- [ ] **Transplant committee summaries** — functional requirement. Baseline G; related tasks: NEW-07.
- **Data:** CandidateEpisode, committeePacket, contraindicationEvidence, unknown, summaryDraft.
- **Required workflow:** Summarize authorized transplant evaluation evidence for committee preparation with explicit missing studies and prior decisions.
- **Acceptance scenarios:** Donor confidential record excluded unless separately permitted; no automatic candidacy score/decision; stale committee data flagged.

### EP-133

- [ ] **Cardiac follow-up candidates** — functional requirement. Baseline G; related tasks: NEW-07.
- **Data:** CardiacEvidence, approvedEligibilityRule, possibleFollowup, specialistReview.
- **Required workflow:** Identify possible cardiac procedure/follow-up candidates from documented evidence and approved criteria; specialist confirms task/communication.
- **Acceptance scenarios:** Outdated/incomplete evidence yields unknown; no booking/order automatically; flag never asserts diagnosis not signed by clinician.

### EP-134

- [ ] **Result-to-care-gap extraction** — functional requirement. Baseline B; related tasks: master §17; OPS-06.
- **Data:** ResultText(revision), recommendedAction, evidenceSpan, proposedGapTask.
- **Required workflow:** Convert narrative recommendations into reviewed structured follow-ups with owner and approval before applying care-gap rules.
- **Acceptance scenarios:** Negation/conditional recommendation preserved; repeated report does not duplicate task; corrected result prompts review.

### EP-135

- [ ] **Nurse assignment suggestions** — functional requirement. Baseline G; related tasks: NEW-08.
- **Data:** PatientWorkload, nurseSkills, staffingPolicy, continuity, assignmentProposal.
- **Required workflow:** Suggest feasible nurse assignments using current census and approved constraints; charge nurse reviews explanations and reserves assignment authoritatively.
- **Acceptance scenarios:** Qualification/ratio violation prevents proposal acceptance; stale census rechecks; fairness/override reasons audited; no automatic staffing reduction.

### EP-136

- [ ] **Discharge-barrier extraction** — functional requirement. Baseline B; related tasks: AI-03; DEP-02.
- **Data:** DischargeNoteEvidence, barrier(type,owner,status), proposedNextStep.
- **Required workflow:** Extract possible discharge barriers and status from notes, reconcile with structured case plan and ask coordinator to confirm.
- **Acceptance scenarios:** Historical barrier not current without evidence; conflicting statements visible; text alone cannot declare medically ready.

### EP-137

- [ ] **Dialysis-rounding summaries** — functional requirement. Baseline G; related tasks: NEW-07.
- **Data:** DialysisSessionRange, prescriptionRevision, observations, deviations, summaryDraft.
- **Required workflow:** Draft rounding summary with recent sessions and dated changes in approved parameters, preserving units and source quality.
- **Acceptance scenarios:** Interrupted/missed sessions explicit; incomparable units not trended; no generated prescription change.

### EP-138

- [ ] **Pre-anesthesia triage summary** — functional requirement. Baseline G; related tasks: NEW-07.
- **Data:** PreSurgeryEpisode, triageQuestion, historyEvidence, missingPrerequisite.
- **Required workflow:** Organize reviewed pre-anesthesia concerns and missing assessments for authorized clinician triage; preserve source and uncertainty.
- **Acceptance scenarios:** Model cannot clear/cancel surgery; incomplete record displayed as unknown; wrong procedure episode excluded.

### EP-139

- [ ] **Scanned-referral extraction** — functional requirement. Baseline G; related tasks: NEW-09.
- **Data:** ScannedReferralPage, OCRVersion, patientMatch, service, urgencyProposal.
- **Required workflow:** Quarantine scanned pages, propose referral fields and source locations, require identity and clinical-urgency review before creating referral.
- **Acceptance scenarios:** Mixed-patient packet stays quarantined; unreadable date not guessed; duplicate scan not duplicate referral.

### EP-140

- [ ] **Cited chart Q&A/visualization** — functional requirement. Baseline B; related tasks: master §17; AI-01.
- **Data:** ChartQuestion, authorizedFactSet, citedAnswer, chartSpec, abstention.
- **Required workflow:** Answer patient-chart questions with fact-level sources and optional reproducible visualization; enforce authorization in retrieval and graph data.
- **Acceptance scenarios:** Unsupported inference abstains; graph uses actual unit/time points; prompt injection cannot invoke tools or hidden data.

### EP-141

- [ ] **Spanish-to-English message preview** — functional requirement. Baseline G; related tasks: NEW-10.
- **Data:** OriginalMessage(language), translatedPreview, modelVersion, uncertainty.
- **Required workflow:** Translate approved Spanish-to-English preview while retaining original and marking machine output; separate evaluation for Arabic/other languages.
- **Acceptance scenarios:** Negation, medication units, urgent intent and culturally ambiguous text tested; unsafe/low-confidence text routes interpreter, never replaces original.

## Patient AI (Emmie)

### EP-142

- [ ] **Text scheduling/rescheduling** — functional requirement. Baseline B; related tasks: AI-04; OPS-01.
- **Data:** VerifiedConversation, schedulingIntent, eligibleSlot, bookingConfirmation.
- **Required workflow:** Patient text assistant verifies transaction identity, proposes real slots and executes authorized booking/reschedule only after confirmation.
- **Acceptance scenarios:** SMS possession alone insufficient for sensitive disclosures; race revalidates slot; failed reschedule preserves original booking.

### EP-143

- [ ] **Visit-derived reminders** — functional requirement. Baseline B; related tasks: AI-04; OPS-06.
- **Data:** VisitInstruction, dueTask, reminderProposal, patientPreference, acceptance.
- **Required workflow:** Draft reminders from approved follow-up plan, verify owner/due date and communication consent before activation.
- **Acceptance scenarios:** Conditional plan not made mandatory; new appointment/canceled instruction suppresses obsolete reminder; no clinical closure from reminder delivery.

### EP-144

- [ ] **Plain-language endoscopy overview** — functional requirement. Baseline G; related tasks: NEW-11.
- **Data:** ReleasedEndoscopyReport, approvedGlossary, plainLanguageDraft, contactRoute.
- **Required workflow:** Produce reviewed patient explanation of findings/procedures from released report, preserving uncertainty and next-step instructions.
- **Acceptance scenarios:** Pathology pending remains pending; no benign conclusion before evidence; source correction withdraws stale explanation.

### EP-145

- [ ] **Imaging-result explanation** — functional requirement. Baseline G; related tasks: NEW-11.
- **Data:** ReleasedImagingReport, comparisonContext, explanationDraft, clinicianContact.
- **Required workflow:** Explain approved report terminology without new diagnosis, preserve preliminary/corrected status and route clinical concerns.
- **Acceptance scenarios:** Critical/uncertain finding cannot become reassurance; hidden report cannot be summarized; corrected release invalidates old summary.

### EP-146

- [ ] **Plain-language instructions** — functional requirement. Baseline B; related tasks: AI-03/04.
- **Data:** ApprovedInstructionText, audienceLanguage, readabilityDraft, semanticCheck.
- **Required workflow:** Simplify clinical language without changing approved actions, dose/units, precautions or uncertainty; retain source and clinician review policy.
- **Acceptance scenarios:** Tested with decimals/negation/conditional care; unverified translation cannot be final instruction; accessible layout preserves meaning.

### EP-147

- [ ] **Billing/payment conversation** — functional requirement. Baseline R; related tasks: AI-04; OPS-03.
- **Data:** BillingConversation, verifiedAccount, currentBalance, toolIntent, confirmation.
- **Required workflow:** Explain sourced charges/coverage and permitted payment/plan options; confirm consequential transactions through standard payment controls.
- **Acceptance scenarios:** Balance rechecked before payment; duplicate prompt cannot double pay; patient cannot see guarantor/dependent account beyond scope.

### EP-148

- [ ] **Patient chart Q&A** — functional requirement. Baseline B; related tasks: AI-04; SEC-02.
- **Data:** PatientQuestion, releasedPermittedRecords, proxyScope, citedAnswer.
- **Required workflow:** Answer within authorized released information, label uncertainty and offer human contact; administrative assistance remains separate from diagnostic advice.
- **Acceptance scenarios:** Restricted proxy content cannot leak via summary; no-source question abstains; medical emergency content follows approved escalation route.

## Operational AI (Penny)

### EP-149

- [ ] **Utilization-review draft** — functional requirement. Baseline G; related tasks: NEW-12.
- **Data:** UtilizationPeriod, chartEvidence, policyVersion, reviewDraft.
- **Required workflow:** Draft evidence summary for qualified utilization staff and highlight unknown/contradictory criteria for human review.
- **Acceptance scenarios:** Cannot invent medical necessity or decide coverage; wrong admission period excluded; changed evidence reopens draft review.

### EP-150

- [ ] **Professional denial-appeal draft** — functional requirement. Baseline R; related tasks: AI-05.
- **Data:** ProfessionalClaimDenial(reason,payer,deadline), sourceDocs, appealDraft.
- **Required workflow:** Assemble fact-cited professional-billing appeal for authorized reviewer; preserve original denial and track submitted/received/decided states.
- **Acceptance scenarios:** Fabricated services/statements rejected; stale policy flagged; draft generation never submits or changes claim.

### EP-151

- [ ] **Risk-adjustment assistance** — functional requirement. Baseline B; related tasks: AI-05.
- **Data:** RiskAdjustmentContext(period,codeVersion), evidenceCandidate, contradiction.
- **Required workflow:** Assist qualified reviewers with sourced coding opportunities for valid period, retaining clinical uncertainty and explicit rejection reasons.
- **Acceptance scenarios:** Rule-out/inactive evidence cannot become confirmed diagnosis; duplicate capture detected; audit supports anti-upcoding review.

### EP-152

- [ ] **Patient microsite drafts** — functional requirement. Baseline G; related tasks: NEW-13.
- **Data:** MicrositeDraft(audience,purpose,content,language), approval, publicationVersion.
- **Required workflow:** Generate patient education/campaign/study page drafts from approved source material; preview with synthetic data and require publication approval.
- **Acceptance scenarios:** No PHI in public page; unsupported health claims blocked; rollback restores prior approved version; draft never publishes automatically.

### EP-153

- [ ] **Hospital/professional code suggestions** — functional requirement. Baseline R; related tasks: AI-05.
- **Data:** CodingContext(hospitalOrProfessional,codeSet,documentation), codeProposal.
- **Required workflow:** Suggest codes separately by billing context with evidence and qualified acceptance; preserve edits and rationale.
- **Acceptance scenarios:** Wrong context/version blocks acceptance; no documented service means no charge suggestion; signed clinical record cannot be rewritten by coder model.

### EP-154

- [ ] **Outpatient denial-appeal draft** — functional requirement. Baseline B; related tasks: AI-05.
- **Data:** OutpatientDenial, payerPolicyVersion, evidencePacket, appealDraft.
- **Required workflow:** Draft outpatient appeal tied to correct episode, service and denial reason, with reviewer edits and submission controls.
- **Acceptance scenarios:** Similar service from another date not used as evidence; deadline/escalation visible; repeated generation not duplicate appeal.

### EP-155

- [ ] **Authorization evidence summary** — functional requirement. Baseline B; related tasks: AI-05; GAP-06.
- **Data:** AuthorizationQuestionSet, requestedService, chartEvidence, missingDocuments.
- **Required workflow:** Summarize available documents against specific authorization request and identify missing evidence for staff completion.
- **Acceptance scenarios:** Irrelevant chart details excluded; no medical fact synthesized from billing alone; absent prerequisite explicitly unknown.

### EP-156

- [ ] **Authorization-question drafts** — functional requirement. Baseline G; related tasks: NEW-12.
- **Data:** AuthorizationQuestion, proposedAnswer, sourceSpan, policyVersion.
- **Required workflow:** Draft field-specific response with traceable structured/narrative evidence; authorized staff correct and confirm before transmission.
- **Acceptance scenarios:** Yes/no inversion, missing evidence and stale documentation tested; model cannot answer absent fact affirmatively; submission requires approval.

### EP-157

- [ ] **Dashboard insight narrative** — functional requirement. Baseline G; related tasks: NEW-14.
- **Data:** DashboardSnapshot(query,measureVersion,denominator,period), narrativeDraft.
- **Required workflow:** Explain actual computed measures and observed changes with source query/refresh labels and uncertainty; analyst reviews before distribution.
- **Acceptance scenarios:** No causal claim from correlation; small cells suppressed; stale snapshot prominently labeled; summary cannot invent totals.

### EP-158

- [ ] **Inpatient denial-appeal draft** — functional requirement. Baseline B; related tasks: AI-05.
- **Data:** InpatientDenial, coveredPeriod, appealPolicy, documentation, draft.
- **Required workflow:** Build inpatient-account appeal from dated service evidence and reviewed payer criteria; preserve decision lineage and human approval.
- **Acceptance scenarios:** Different covered periods not mixed; unsupported severity claim rejected; appeal outcome reconciles without erasing denial.

### EP-159

- [ ] **Natural-language report queries** — functional requirement. Baseline G; related tasks: NEW-14.
- **Data:** NaturalLanguageQuestion, semanticModel, proposedQuery, queryPlan, result.
- **Required workflow:** Translate into bounded read-only analytics query, preview scope/cost and execute under row/purpose controls; link narrative to executed query.
- **Acceptance scenarios:** Injection cannot create write/DDL or exceed limits; denied records absent in aggregates; ambiguous metric asks clarification.

### EP-160

- [ ] **Payer-policy evidence assistance** — functional requirement. Baseline G; related tasks: NEW-12.
- **Data:** PayerGuideline(documentVersion,effectiveDates,license), criterion, evidenceLink.
- **Required workflow:** Retrieve relevant payer policy excerpts and compare with authorized evidence for denial/authorization staff review.
- **Acceptance scenarios:** Outdated/inapplicable policy clearly excluded; contradictory criteria shown; model cannot invent rule or deny care.

### EP-161

- [ ] **Surgical case-request consistency** — functional requirement. Baseline G; related tasks: NEW-15.
- **Data:** SurgicalRequestRevision, procedureCode, site, laterality, resourceRequirement.
- **Required workflow:** Compare surgeon's request with structured case fields, highlight discrepancies with evidence and route scheduler/surgeon review.
- **Acceptance scenarios:** Model cannot replace procedure/site; stale revision forces re-review; equipment mismatch becomes owned task.

### EP-162

- [ ] **Documentation-improvement suggestions** — functional requirement. Baseline B; related tasks: AI-05; OPS-05.
- **Data:** DocumentationQuery(source,reason,nonleadingTemplate), clinicianResponse.
- **Required workflow:** Suggest fact-supported clarification opportunities, review for nonleading wording, send to author and preserve independent clinician response.
- **Acceptance scenarios:** Query cannot edit signed note; rejection retained; reimbursement incentive not substituted for clinical evidence.

### EP-163

- [ ] **Scan patient/type classification** — functional requirement. Baseline G; related tasks: NEW-09.
- **Data:** ScanBatch(pageIDs,OCR), patientCandidates, documentTypeProposal, reviewer.
- **Required workflow:** Suggest patient/type, segregate mixed documents and require authorized identity confirmation before chart attachment.
- **Acceptance scenarios:** Same-name/unclear identity quarantined; source page retained; wrong-chart correction audited; high confidence never bypasses matching policy.

### EP-164

- [ ] **Outreach content drafts** — functional requirement. Baseline G; related tasks: NEW-13.
- **Data:** CampaignBrief, approvedSources, audienceDefinition, messageDraft, publicationReview.
- **Required workflow:** Draft outreach content for staff review with consent, language and channel restrictions; connect approved content to governed campaign only.
- **Acceptance scenarios:** Opt-out and suppression rechecked at send; no PHI in public preview; no automatic external messaging from generation.

### EP-165

- [ ] **Trial eligibility assistance** — functional requirement. Baseline G; related tasks: NEW-16.
- **Data:** StudyProtocolVersion, inclusionExclusion, authorizedEvidence, candidateMatch.
- **Required workflow:** Identify potential trial candidates with per-criterion evidence/unknowns, investigator review and consent-aware disclosure.
- **Acceptance scenarios:** No automatic enrollment or sponsor disclosure; revised protocol invalidates old match; missing exclusion evidence is not eligibility.

### EP-166

- [ ] **Patient-flow suggestions** — functional requirement. Baseline G; related tasks: NEW-08.
- **Data:** CapacitySnapshot, isolation, staffing, bedState, flowRecommendation.
- **Required workflow:** Suggest patient-flow options based on current constraints and explained dependencies; staff reviews/reserves using authoritative bed workflow.
- **Acceptance scenarios:** Stale recommendation cannot double-allocate bed; clinical isolation/skills limits checked; no automatic transfer/discharge.

### EP-167

- [ ] **Discharge-planning insights** — functional requirement. Baseline B; related tasks: AI-03; DEP-02.
- **Data:** DischargeEvidence, proposedMilestone, expectedDate, barrier, reviewer.
- **Required workflow:** Draft discharge next-step insights from current notes and plan, show source conflicts, require team confirmation for milestone change.
- **Acceptance scenarios:** Mention of planned discharge not actual discharge; pending test owner preserved; model cannot mark medication reconciliation complete.

### EP-168

- [ ] **Medical-necessity comparison** — functional requirement. Baseline G; related tasks: NEW-12.
- **Data:** PolicyCriterion(version), requestedService, clinicalEvidence, comparisonStatus.
- **Required workflow:** Present met/not-met/unknown evidence to utilization staff with quotations and timestamps; authorized human decides medical necessity.
- **Acceptance scenarios:** Missing evidence remains unknown; model cannot approve/deny; appeal path and original reason retained.

### EP-169

- [ ] **Policy-document extraction** — functional requirement. Baseline G; related tasks: NEW-12.
- **Data:** PolicyDocument(version,effectivePeriod), extractedCriterion, sourceSpan, approval.
- **Required workflow:** Parse payer rules into draft structured criteria, review against licensed original and approve version before decision-support use.
- **Acceptance scenarios:** OCR/negation error blocks approval; old version stays historical; generated rule never activates itself.

### EP-170

- [ ] **Diagnosis-evidence highlighting** — functional requirement. Baseline B; related tasks: AI-05.
- **Data:** PotentialDiagnosis, supportingAndContradictorySpans, codingContext.
- **Required workflow:** Highlight chart evidence for qualified coder/clinician review without changing diagnostic status or inventing confirmation.
- **Acceptance scenarios:** Family history/rule-out/negation separated; duplicate condition evidence consolidated; hidden note not disclosed to unauthorized coder.

### EP-171

- [ ] **Authorization-decision support** — functional requirement. Baseline G; related tasks: NEW-12.
- **Data:** AuthorizationRequest, diagnosisProcedureLink, currentEvidence, reviewerAction.
- **Required workflow:** Rank relevant evidence for payer review under purpose controls, present policy/unknowns and retain authorized final decision with notices/appeal.
- **Acceptance scenarios:** No autonomous adverse decision; unsupported linkage flagged; overrides, service changes and reconsideration audit preserved.

## Analytics, mobile and resilience

### EP-172

- [ ] **Role dashboards (Radar)** — functional requirement. Baseline B; related tasks: OPS-07; HUI-17.
- **Data:** DashboardDefinition(version,role,metric,refresh), drilldownScope, alertOwner.
- **Required workflow:** Configure approved role dashboards from governed metric catalog; retain patient-level permission checks on drilldown and export.
- **Acceptance scenarios:** Different role cannot inherit another's sensitive metrics; stale data labeled; actionable alert has owner; visual total reconciles to query.

### EP-173

- [ ] **Operational reports (Reporting Workbench)** — functional requirement. Baseline B; related tasks: OPS-07.
- **Data:** ReportDefinition(parameters,columns,scope,version), schedule, outputRecipient.
- **Required workflow:** Build/review operational reports, execute bounded queries, schedule approved outputs and record distribution/audit.
- **Acceptance scenarios:** Scheduled report rechecks recipient privileges; failed run not sent as empty success; pagination/export reconciles totals.

### EP-174

- [ ] **Self-service cohorts (SlicerDicer)** — functional requirement. Baseline B; related tasks: OPS-07.
- **Data:** CohortDefinition(inclusion,exclusion,time,indexEvent), terminologyVersion, suppression.
- **Required workflow:** Provide reusable authorized cohort builder with count preview, definition version and reproducible results; control patient-list export separately.
- **Acceptance scenarios:** Negation/time-window fixtures correct; small-cell protections survive filter combinations; cohort membership traces to evidence.

### EP-175

- [ ] **Analytical warehouse (Clarity/Caboodle)** — functional requirement. Baseline B; related tasks: master §14; OPS-07.
- **Data:** WarehouseFact(sourceRevision), mappingVersion, lineage, semanticMetric, refreshCheckpoint.
- **Required workflow:** Transform reviewed clinical/operational data into analytical models with resumable pipelines, late-correction handling and documented freshness.
- **Acceptance scenarios:** Replay doesn't duplicate fact; corrected source updates derived measure with history; signed clinical data never mutated by analytics.

### EP-176

- [ ] **Cross-institution research (Cosmos)** — functional requirement. Baseline G; related tasks: NEW-17.
- **Data:** ResearchPartnerAgreement, contributionBatch, commonModelVersion, purpose, withdrawal.
- **Required workflow:** Define governed multi-institution research network, validate contributing datasets, deduplicate under lawful rules and enforce study-level access/disclosure.
- **Acceptance scenarios:** Two synthetic partner sites reproduce cohort; withdrawn contribution stops prohibited future use; no claim of access to proprietary Cosmos dataset.

### EP-177

- [ ] **Phone/tablet clinician access** — functional requirement. Baseline R; related tasks: OPS-09.
- **Data:** ManagedDevice, clinicianSession, authorizedPatientList, localDraft, revocation.
- **Required workflow:** Provide phone/tablet schedules, review, notes and approved tasks using same authorization and visible source/save state as desktop.
- **Acceptance scenarios:** Device loss blocks new online access; session expiry handled; patient switch clears stale requests; disconnected draft not signed.

### EP-178

- [ ] **Nursing mobile workflow** — functional requirement. Baseline R; related tasks: OPS-09; DEP-03.
- **Data:** NursingMobileAssignment, scanEvent, specimen, observation, I/O, administration.
- **Required workflow:** Support bedside patient/medication/specimen scans and assigned nursing documentation with durable local-server acknowledgement.
- **Acceptance scenarios:** Wrong-patient scan blocks routine commit; lost LAN invokes downtime mode; repeat scan doesn't create duplicate administration/collection.

### EP-179

- [ ] **Downtime read-only snapshot** — functional requirement. Baseline R; related tasks: OFF-04/10/11.
- **Data:** DowntimeSnapshot(version,createdAt,patientScope,authorizationExpiry), packet, recoveryEpisode.
- **Required workflow:** Maintain approved encrypted scoped read-only downtime view, display snapshot age and journal drafts separately; reconcile after restoration.
- **Acceptance scenarios:** Expired offline permission fails closed; print/device cache respects scope; server recovery reconciles outstanding drafts and paper events.

### EP-180

- [ ] **Agent external connectors** — functional requirement. Baseline R; related tasks: AI-06.
- **Data:** Connector(toolSchema,scope,credentialExpiry), invocation, approval, idempotencyKey.
- **Required workflow:** Register approved external retrieval/action tools, authorize per user/purpose, require action approval and retain complete invocation outcome/replay log.
- **Acceptance scenarios:** Prompt injection cannot grant permissions; lost acknowledgment/retry idempotent; kill switch prevents new actions; partner outage remains pending.

## Important comparison questions still unverified

### EP-181

- [ ] **Detailed registration/merge parity** — verification contract. Baseline R; related tasks: REC-01.
- **Data:** IdentityScenarioCatalog, comparatorEvidence(version,site), mergeCase, reversal.
- **Required workflow:** Specify local registration/duplicate/merge/unmerge normal and exception scenarios; separately request/review public or authorized comparator evidence.
- **Acceptance scenarios:** Demonstrate twins, unknown trauma and conflicting identifiers synthetically; preserve 100% provenance; comparator remains unknown until evidence recorded.

### EP-182

- [ ] **Detailed eMAR/barcode parity** — verification contract. Baseline R; related tasks: MED-01; DEP-03.
- **Data:** MedicationScenarioCatalog, signedOrder, scanEvidence, comparatorContext.
- **Required workflow:** Specify local administration exceptions including discontinued/changed order, mismatch, refusal, held/missed dose, witnessed action and downtime reconciliation.
- **Acceptance scenarios:** Every scenario has authorized workflow and audit; no duplicate dose on replay; exact Epic equivalence stays unverified without matched workflow evidence.

### EP-183

- [ ] **Blood-bank product boundary** — verification contract. Baseline R; related tasks: DEP-09.
- **Data:** BloodBankBoundary(nativeOrPartner,certificationScope), componentID, compatibilityEvidence.
- **Required workflow:** Decide validated native module versus supported partner adapter; specify type/crossmatch, inventory, issue, bedside trace and reaction workflow with specialist owner.
- **Acceptance scenarios:** Wrong-component/recipient, emergency issue and recall simulation have reviewed outcomes; vendor/partner product scope explicitly evidenced, not assumed.

### EP-184

- [ ] **All department/specialty variants** — verification contract. Baseline B; related tasks: DEP-25; GAP-11.
- **Data:** SpecialtyPack(name,owner,fields,states,orders,interfaces,hazards,tests).
- **Required workflow:** Require separate packs for every named master department plus ENT, urology, rheumatology, endocrinology, infectious disease, neurology, pain, nutrition, sleep and occupational care; use EXT-08 contracts.
- **Acceptance scenarios:** All named packs have field/workflow/exception rows; generic template cannot count twice; comparison to unverified vendor variant remains unknown.

### EP-185

- [ ] **Exact security/consent equivalence** — verification contract. Baseline R; related tasks: SEC-01–04.
- **Data:** ControlMatrix(jurisdiction,role,purpose), threat, consentCase, auditEvidence.
- **Required workflow:** Specify object-level authorization, encryption, audit integrity, SSO/MFA and incident/recovery controls; compare only matched documented deployment controls.
- **Acceptance scenarios:** Tenant/proxy/export/AI denial cases pass before deployment; no privacy/security certification or Epic equality claimed from specification alone.

### EP-186

- [ ] **Exact offline mode equivalence** — verification contract. Baseline R; related tasks: OFF-01–14.
- **Data:** OutageScenario(internet,LAN,WAN,server,power), authority, cachePolicy, recovery.
- **Required workflow:** Specify independent local operation with OFF contracts and separate external-service/detached-device behavior; record comparator configuration evidence by mode.
- **Acceptance scenarios:** 72-hour synthetic internet outage plus partition/expiry/restore tests required; no offline order/admin commit from detached draft; unknown comparator mode stays unknown.

### EP-187

- [ ] **Speed at equal workload** — verification contract. Baseline R; related tasks: PERF-01–06.
- **Data:** BenchmarkProfile(data,users,network,hardware,taskMix), latencyPercentiles, errors.
- **Required workflow:** Freeze PERF profile and run matched correctness-preserving benchmarks, reporting p50/p95/p99, error counts and resource costs for each tested release.
- **Acceptance scenarios:** Empty demo never accepted as scale proof; no safety/permission bypass for speed; no “faster than Epic” claim without actual comparable runs.

### EP-188

- [ ] **Hospital GUI usability advantage** — verification contract. Baseline R; related tasks: HUI-01–33.
- **Data:** UsabilityProtocol(role,task,patientComplexity), prototypeVersion, errorSeverity.
- **Required workflow:** Compare original hospital GUI alternatives using HUI tasks, accessibility and clinician/patient study; benchmark comparator only with authorized access and matched tasks.
- **Acceptance scenarios:** Wrong-patient/dose/stale-data scenarios reviewed; no unresolved critical test error at release gate; “best GUI” requires evidence, not palette preference.

### EP-189

- [ ] **Local deployment cost/licensing** — verification contract. Baseline B; related tasks: FND-01/02.
- **Data:** LicenseDecision, dependencyEntitlement, hardwareBill, hostingCost, supportCost.
- **Required workflow:** Require OSI-license decision and free-to-install core; publish offline bundle and transparent total-operating-cost worksheet with optional services/content separated.
- **Acceptance scenarios:** Clean install has no mandatory proprietary runtime fee; restricted drug/coding content not redistributed without rights; no unsupported commercial cost ranking.

### EP-190

- [ ] **Certification by release/country** — verification contract. Baseline B; related tasks: OPS-04; GAP-14.
- **Data:** JurisdictionReleaseProfile, intendedUse, applicableAuthority, evidenceArtifact, expiry.
- **Required workflow:** Maintain product/release/site-specific readiness register for safety, privacy, interoperability, billing and regulated software; independently review applicable claims.
- **Acceptance scenarios:** Missing prerequisite blocks that deployment label; updated release triggers impact review; unknown comparator certification cannot be marked absent or matched.

## Cross-vendor extension contracts

### EXT-01

- [ ] **Managed/local deployment and update lifecycle**.
- **Data:** DeploymentProfile(local,managed), supportedRegion, releaseManifest, migration, rollbackPoint, tenancyBoundary.
- **Required workflow:** Support local hospital installation as default and optional managed hosting using same versioned contracts. Preflight compatibility, verify signed offline update bundle, back up, migrate and retain tested rollback/recovery plan; managed service contracts identify operator responsibilities.
- **Acceptance scenarios:** A local facility completes install/update without internet from prepared bundle; managed deployment preserves organization isolation; failed migration recovers consistently without losing acknowledged transactions.

### EXT-02

- [ ] **Enterprise finance, payroll and HR boundary**.
- **Data:** LedgerAccount, posting, fiscalPeriod, payable, budget, employeeRole, payrollInput, asset, adapterVersion.
- **Required workflow:** Define optional native modules or supported adapters separately for general ledger, accounts payable, budget/forecast, payroll/HR and fixed assets. Use approved separation of duties, posting/reversal, period close, regional rules and reconciliation; keep employee medical records outside HR scope.
- **Acceptance scenarios:** Synthetic charge, invoice, asset and payroll input reconcile to approved ledger with no duplicate posting. Closed period adjustments are linked, approval cannot self-authorize where prohibited, and no clinical note is exposed to payroll/employer.

### EXT-03

- [ ] **Professional service delivery and support**.
- **Data:** ServiceCatalog, scope, staffingCoverage, competency, customerSLA, escalation, incident, costBoundary.
- **Required workflow:** Define installation, migration, clinician training, content maintenance, coding/authorization support and after-hours incident services as optional staffed operations with accountable owners, access controls and disclosed charges.
- **Acceptance scenarios:** Run synthetic onboarding and after-hours outage handoff; named covering role receives and resolves case; support accesses PHI only under approved scope; no claim that free code includes unstaffed free services.

### EXT-04

- [ ] **Predictive no-show scheduling**.
- **Data:** AppointmentRiskModelVersion, lawfulInputs, predictedProbability, uncertainty, subgroupMetric, proposedOutreach, outcome.
- **Required workflow:** Evaluate site-calibrated no-show model against non-AI baseline, present uncertainty and authorized staff-selected outreach. Keep slot reservation, access entitlement and patient choices independent of risk score.
- **Acceptance scenarios:** Holdout evaluation includes calibration and subgroup errors; risk never denies care, penalizes patient or auto-double-books; canceled/rescheduled appointments correct outcomes and prevent label leakage.

### EXT-05

- [ ] **Complete single-patient and population export**.
- **Data:** ExportScope, consentPurpose, schemaVersion, manifest, recordAndAttachmentInventory, provenance, checksum, deliveryReceipt.
- **Required workflow:** Authorize and generate machine-readable records plus documents, amendments, identifiers and relationships for single patient or approved population. Document exclusions, terminology, import guidance, encryption, retention and resumable delivery.
- **Acceptance scenarios:** Synthetic reimport reconciles every exported record/attachment/checksum and signed amendment; unauthorized segmented content excluded and documented; interrupted export resumes without duplicate/missing objects; complete export distinguished from a summary PDF.

### EXT-06

- [ ] **External medical-evidence questions**.
- **Data:** QuestionContext, licensedKnowledgeCorpusVersion, retrievalCitation, publicationDate, applicability, patientPermission, answerDraft.
- **Required workflow:** Separate patient-chart Q&A from optional clinical-knowledge retrieval. Display source/date, applicability/limitations and uncertainty; clinician interprets evidence in patient context with approved corpus/license and local/offline package options.
- **Acceptance scenarios:** Unsupported/contradictory literature question abstains or shows disagreement; no invented citation; patient data not sent externally without approved controls; corpus/model outage leaves ordinary care usable.

### EXT-07

- [ ] **Voice/text navigation and workflow actions**.
- **Data:** UserUtterance, transcript, authorizedIntent, contextPatient, confidence, confirmation, toolInvocation.
- **Required workflow:** Provide accessible typed/voice command palette for search/navigation and scoped proposed actions. Show recognized text and target patient; require explicit confirmation and normal validation/signature for consequential action; make cancel/correct straightforward.
- **Acceptance scenarios:** Background/ambiguous speech cannot commit chart/order/payment action; wrong patient or changed context cancels proposal; microphone-off and offline modes visible; read/navigation commands reveal only authorized data.

### EXT-08

- [ ] **Individual specialty pack contracts**.
- **Data:** PackID, credentialedOwnerRole, observationSchema, episodeStates, orderCatalog, instrumentVersion, interface, outcome, hazard.
- **Required workflow:** Implement separately versioned departmental packs from the specialty table below and existing DEP-01–25 tasks; common patient, orders, permissions, signatures and downtime contracts remain mandatory.
- **Acceptance scenarios:** Each named pack has its own synthetic complete visit and failure/recovery scenario, reviewer, data fields, transitions, clinical-content provenance and integration evidence; one generic form never proves multiple specialty packs.

### EXT-09

- [ ] **Home health, hospice and long-term care**.
- **Data:** CareSettingEpisode, eligibilityReview, planVersion, assignedVisit, symptomAssessment, equipment, careGoal, coverage.
- **Required workflow:** Maintain separate home-health visits, hospice comfort/caregiver plans and long-term assessments under reviewed setting-specific forms/consent. Schedule, document, review missed visits and transitions; use approved offline draft and reconciliation modes.
- **Acceptance scenarios:** Disconnected home visit retains encrypted unsigned draft; hospice goals not overwritten by generic hospital pathway; missed visit/changed caregiver routes covering team; terminal episode retains historical assessments and disclosures.

### EXT-10

- [ ] **End-to-end revenue cycle and work queues**.
- **Data:** Coverage, contractVersion, charge, codingReview, claimVersion, edit, payerReceipt, remittance, denial, appeal, ledgerEntry.
- **Required workflow:** Create reviewed charges, code and edit claim, submit through jurisdiction adapter, reconcile remittance/status, assign denials/appeals and patient balance, then close account only after owned exceptions reconcile.
- **Acceptance scenarios:** Synthetic claim→partial payment→denial→appeal→adjustment preserves every prior version; duplicate remittance/payment rejected; canceled service reverses supported charge; payer outage stays pending; unsigned evidence never fabricated.

### EXT-11

- [ ] **Health information management and document operations**.
- **Data:** DocumentSource, identityReview, index, signedRevision, deficiency, releaseRequest, retentionRule, legalHold.
- **Required workflow:** Receive/index approved documents, quarantine uncertain identity, track chart/signature deficiencies, route coding queries, review release/redaction and enforce retention/legal holds through authorized roles.
- **Acceptance scenarios:** Wrong-patient scan isolated and corrected with audit; release honors segmentation; hold prevents destruction; query cannot overwrite author-signed clinical note; deficiency closes only when required authorized signature exists.

### EXT-12

- [ ] **Clinical AI and agent lifecycle**.
- **Data:** IntendedUse, modelPromptVersion, corpusVersion, evaluationSet, thresholds, approval, deployment, incident, rollback.
- **Required workflow:** Make each AI task independently configurable with specialist-reviewed evaluation, role scopes, draft status, limits, monitored rollout, model-change impact review and kill switch. Require provider/data-use approvals for external inference; local inference optional.
- **Acceptance scenarios:** Heldout synthetic/approved fixtures cover hallucination, omission, bias, languages, prompt injection and privacy; no unapproved model promotion; failed local/external inference degrades to manual care; review evidence precedes each deployment.

### EXT-13

- [ ] **Personalized and adaptive role workspaces**.
- **Data:** WorkspaceProfile(user,role,facility), pinnedSection, shortcut, suggestion, approval, version, rollback.
- **Required workflow:** Permit user/department-approved preferences, templates and task ordering; optional learned suggestions are previewed and accepted, not silently applied to safety-critical layout. Keep patient identity, allergies, offline status and signature controls invariant across every profile.
- **Acceptance scenarios:** Switch role/facility and restore approved profile; corrupt/unapproved preference falls back safely; adaptation cannot hide critical alerts, change order meaning, reorder a clicked target or bypass accessibility; profile rollback retains clinical data.

## EXT-08 named specialty contracts
Each is a separate subtask requiring clinical-content provenance, state/permission tables, screen fields and a specialist reviewer, not one shared generic template.

| Pack | Minimum data | Required workflow | Failure/acceptance condition |
|---|---|---|---|
| ENT | Laterality; hearing/vestibular findings; airway/voice; audiogram; scope image | Assess→test/procedure→signed interpretation→referral/follow-up | Wrong-ear/site and unreadable external audiogram stay unresolved; airway urgency uses approved clinical escalation. |
| Urology | Urinary symptom instrument/version; anatomy/site; procedure; device/stent; pathology | Assess→investigate→reviewed procedure/plan→device/removal recall | Missing device-removal follow-up remains owned; site/identity mismatch blocks routine completion. |
| Rheumatology | Joint/body findings; instrument edition; disease activity; medication monitoring | Assess→score reviewed instrument→plan→lab/monitor follow-up | Unmeasured joints not normal; overdue monitoring remains unresolved; instrument versions not mixed. |
| Endocrinology | Condition episode; lab method/unit; device readings; longitudinal goal | Review→reconcile measurements→approved plan→monitor/recall | Incompatible lab units and device gaps flagged; no unvalidated dose adjustment. |
| Infectious disease | Organism/sample; susceptibility version; antimicrobial review; isolation; exposure | Consult→review microbiology→approved plan/stewardship→follow-up | Corrected susceptibility triggers review; colonization not silently treated as infection; reporting consent/legal basis enforced. |
| Neurology/neurosurgery | Neuro assessment/instrument; event/seizure; EEG/EMG; procedure site | Evaluate→test/procedure→interpret→care plan→follow-up | Incorrect event time/source and laterality retained as uncertainty; no autonomous urgent triage or diagnosis. |
| Pain medicine | Pain assessment context; function; procedure/site; medication agreement; goal | Assess→review multimodal plan→document procedure→outcome/monitor | Numeric score alone cannot drive prescription; prior agreement not current consent; procedure site checked. |
| Nutrition/dietetics | Diet/allergy; intake; anthropometrics/units; assessment; enteral/parenteral plan | Assess→reviewed nutrition plan→kitchen/pharmacy handoff→monitor | Allergy/diet conflicts block routine food order; unit mismatch flagged; actual intake distinct from ordered volume. |
| Sleep medicine | Sleep instrument/version; study channel/time; device report; interpretation | Refer→schedule study→acquire/QC→specialist report→follow-up | Failed channel/sleep-study interval not normal data; device time skew flagged; signed interpretation required. |
| Occupational medicine | Exposure; work episode; fitness opinion; disclosure scope; employer report | Assess worker→provide care→review fitness output→restricted disclosure | Employer cannot inspect confidential chart; consent/release corrected independently of clinical record. |
| Pulmonology | PFT method/reference; respiratory observation; bronchoscopy/image; home device | Assess→perform test/procedure→specialist interpret→care plan | Poor-quality effort and changed reference set displayed; no invalid longitudinal comparison. |
| Geriatrics | Functional/cognitive instrument; medication burden; caregiver authority; goals | Assess→reconcile risks/goals→coordinate services→follow-up | Decision-making/proxy scope explicit; missing instrument not zero; transfer retains goals and unresolved needs. |
| Palliative care | Goals/advance directive version; symptom context; decision authority; family meeting | Assess→document consented goals→multidisciplinary plan→reassess/transition | Prior directive not silently replaced; sensitive family notes segmented; actual patient choices attributed. |
| Wound care | WoundID/site; dimension/unit; stage-source; photo consent; dressing plan | Assess/measure→approve plan→document actual care→serial review | Different wounds not merged; missing dimension not zero; serial photograph authorization retained. |
| Rehabilitation PT/OT/speech | Episode; functional measure/version; goals; actual sessions; discharge outcome | Evaluate→approve plan→treat/document→measure→transition | Scheduled session never counted delivered; functional measures compare only valid versions; pending goals transfer. |
| Genetics counseling | Pedigree relationship; test consent; report/variant interpretation; recontact | Counsel→consent→test/review→communicate→reinterpret/recontact | Family member privacy separated; uncertain variant never represented as confirmed causality; reclassification alerts reviewer. |

## Release and change control
Implement the shared clinical slice first, then departments and patient/revenue flows, then independently evaluated AI. Inclusion of every row is a long-term scope commitment, not a promise to ship all simultaneously. Publish status by requirement ID; blocked dependencies remain visible. Preserve baseline counts and change denominator only through versioned review. Re-run traceability checks whenever comparison rows or requirement IDs change. No task marked complete can lack linked evidence, authorized review and resolved release-blocking hazards.
