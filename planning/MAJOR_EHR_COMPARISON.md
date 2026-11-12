# Major EHR comparison — Epic first

> **Current plan update (2026-11-12):** [Closure ledger](MAJOR_EHR_REQUIREMENT_CLOSURE.md) maps **61/61 rows (100%)** to [explicit requirement contracts](COMPLETE_REQUIREMENTS_PLAN.md). Statuses below preserve the historical review, not current coverage. Implementation/validation remain zero; product-scope/availability unknowns remain unknown.
Snapshot 2026-11-12. This is a product-scope comparison of our plan, not a ranking, market-share study, purchasing recommendation or claim of deployed parity.

## Review order and depth
1. **Epic:** [190-row detailed comparison](EPIC_FEATURE_BY_FEATURE.md), with [CSV](EPIC_FEATURE_BY_FEATURE.csv), baseline planning assessments and 17 new gap tasks.
2. **Eight other comparator families:** initial feature rows below, supported by linked official sources. These are narrower product-page reviews, not reviews as deep or complete as the Epic inventory.
3. Expand selected vendor/release/country matrices against the same atomic workflow tests before any numeric cross-vendor score.

Hospital comparators: Epic, Oracle Health (product/version distinctions required), MEDITECH Expanse, Altera Sunrise, InterSystems TrakCare/IntelliCare and Dedalus ORBIS/ORBIS U. Ambulatory comparators: athenaOne, eClinicalWorks/healow and NextGen Enterprise/Office. Scope and order are chosen for the project's needs; “major” is not a verified global market ranking.

## Assessment rules
R = comparable explicit task exists; B = broad/partial coverage; G = explicit baseline requirement missing; D = deliberate architecture/deployment difference; U = equivalence not verified. R does not mean a finished specification. All our implementation/clinical-validation values remain zero. NEW task IDs refer to [Epic review recommendations](EPIC_FEATURE_BY_FEATURE.md); those recommendations are not retroactively counted as completed baseline requirements.

Sources were accessed 2026-11-12. Unless a dated announcement is specified, a page shows public marketing/listed product scope with unknown release/GA/entitlement. Do not infer “absent” when a page is silent. Exact clinical safety, cybersecurity, performance, local interoperability and offline behavior require product- and deployment-specific evidence.

## Oracle Health EHR — current product page

[Official source](https://www.oracle.com/health/clinical-suite/electronic-health-record/). The current Oracle Health EHR page describes an AI/cloud-oriented product. Do not transfer these claims to every existing Cerner Millennium installation or assume that all legacy modules are in this product.

| Feature publicly described | Our plan | Task reference | Work still needed |
|---|---|---|---|
| Contextual patient summaries | R | AI-01 | Source citations, recency and contradiction handling |
| Voice chart navigation | B | master §17; HUI-02 | Explicit voice-command scope, confirmation and correction |
| Patient timeline | R | REC-05; master §3 | Separate clinical/effective/recorded time |
| Personalized workflow | B | HUI-28 | Approved adaptive layout with stable critical controls |
| Clinical risk/care-gap insights | B | OPS-06; AI-01 | Model validation and action ownership |
| SaaS update model | D | FND-02; OFF-12 | Our offline bundle/local deployment is a different design goal |
| Enterprise scalability/security claims | U | PERF-01–06; SEC-01–04 | Require independently comparable deployment evidence |

## MEDITECH Expanse — product catalog and AI overview

[Official source](https://ehr.meditech.com/meditech-product-list); [additional official source](https://info.meditech.com/meditech-expanse-the-intelligent-ehr-platform). Catalog confirms product categories; it does not establish each module's exact version, inclusion, workflows or local availability.

| Feature publicly described | Our plan | Task reference | Work still needed |
|---|---|---|---|
| Ambulatory/ED/order management | R | DEP-01/04; ORD-01 | Specify each department lifecycle |
| Nursing/mobile point of care | R | DEP-03; OPS-09 | Validate bedside context and device operations |
| Pharmacy | R | MED-01/02 | Verify closed-loop exceptions |
| Blood bank | R | DEP-09 | Specialist safety case and component traceability |
| Lab/microbiology/pathology | R | DEP-07/08 | Method/QC and corrected-result contracts |
| Home/hospice/long-term care | B | DEP-24; GAP-10 | Separate care-setting packs |
| Patient portal/telehealth | R | OPS-02 | Proxy, consent and failure handling |
| Interoperability network | R | INT-02; GAP-05 | Connectivity requires partner participation |
| High-availability snapshot | R | OFF-04/11 | Demonstrate fresh, authorized recovery view |
| Scheduling/revenue/HIM | R | OPS-01/03/05 | Claim and document reconciliation |
| General ledger/payroll/HR | G | MV-01 | Add or integrate a bounded enterprise-finance suite |
| AI chart questions/summaries | R | AI-01/03 | Task-specific evaluation and citations |
| Predictive no-show scheduling | B | OPS-01; master §13 | Add fairness, calibration and staff-reviewed interventions |

## Altera Sunrise — hospital platform

[Official source](https://www.alterahealth.com/solution/sunrise/). Compare named Sunrise offerings; do not attribute separate Paragon, TouchWorks or Altera Lab capabilities to Sunrise without module-level evidence. Product listings and pilot announcements are not universal GA proof.

| Feature publicly described | Our plan | Task reference | Work still needed |
|---|---|---|---|
| Role-based clinical/revenue views | R | HUI-04–17 | Test representative staffing models |
| Thread ambient documentation | R | AI-02 | Record consent and require clinician finalization |
| Axon outside-data integration | R | INT-02/04 | Identity/consent and external provenance |
| Mobile record access/alerts | R | OPS-09; NEW-01 | Device loss and unavailable recipient |
| CarePath portal/messages/scheduling | R | OPS-01/02 | Proxy and response expectations |
| Financial Manager work queues/edits | B | OPS-03 | Specify separate coding, claim and denial queue rules |
| HIM indexing/record management | R | OPS-05 | Review scan identity and signed amendments |

## athenahealth athenaOne — ambulatory suite and services

[Official source](https://www.athenahealth.com/solutions/athenaone); [additional official source](https://www.athenahealth.com/solutions/mobile-capabilities). Use an ambulatory comparator. Do not infer full hospital ICU/OR/blood-bank capability or its absence from this suite overview. Software and vendor-operated services are separate comparisons.

| Feature publicly described | Our plan | Task reference | Work still needed |
|---|---|---|---|
| Specialty-tailored web/mobile/voice | R | DEP-01; HUI-28; OPS-09 | Task-specific screen and voice behavior |
| Network chart/orders/results | R | REC-03; ORD-01/03; INT-02 | Partner reconciliation and abnormal follow-up |
| Care-gap insights | R | OPS-06 | Explain versioned gap rules |
| Practice billing/claim edits | R | OPS-03 | Review edits and remittance reconciliation |
| Authorization service | B | GAP-06; NEW-12 | Software tasks do not replace staffed service operations |
| Patient engagement suite | R | OPS-02; GAP-02 | Specify channel/consent and staff ownership |
| Ambient mobile notes | R | AI-02; OPS-09 | Consent and approved mobile capture |
| Embedded coding/support services | G | MV-02 | Add service operating model, accountability and SLAs |

## eClinicalWorks/healow — AI and exchange

[Official source](https://www.eclinicalworks.com/products-services/meet-your-ai-powered-ehr/); [additional official source](https://www.eclinicalworks.com/products-services/interoperability/). These pages document selected AI/exchange capabilities, not the whole suite. The 2026 conference also announced inpatient/pharmacy expansion; investigate release and scope before attributing comprehensive hospital coverage.

| Feature publicly described | Our plan | Task reference | Work still needed |
|---|---|---|---|
| Fax classification/patient matching | G | NEW-09 | Human identity review and quarantine |
| Cited clinical Q&A | B | AI-01; master §17 | Separate patient-chart retrieval and external medical knowledge |
| Conversational contact center | B | GAP-02; AI-04 | Live escalation and channel identity |
| No-show prediction | B | OPS-01; master §13 | Calibrate by site/group and audit interventions |
| PRISMA outside-record search | R | INT-02/04 | Patient matching and source reconciliation |
| FHIR/SMART/backend integrations | R | INT-01 | Profile/scopes and conformance tests |
| Single/patient-population EHI export | B | REC-07; OPS-07 | Add complete export schema, attachments and validation |
| TEFCA-related exchange | B | INT-02; OPS-04 | US network/legal participation is an operational dependency |

## NextGen Enterprise/Office and connected tools

[Official source](https://www.nextgen.com/). Distinguish Enterprise and Office releases plus optional connected offerings; this overview is predominantly an ambulatory-practice comparison.

| Feature publicly described | Our plan | Task reference | Work still needed |
|---|---|---|---|
| Specialty content/templates | R | DEP packs; HUI-28 | Review each template/content license |
| Online scheduling/recall/waitlist | R | OPS-01/06 | Reservation and consent-safe outreach |
| Digital intake/upload | B | OPS-02; NEW-09 | Reconcile submitted data instead of overwriting chart |
| Ambient SOAP notes | R | AI-02 | Validate attribution and clinician signature |
| Voice/text workflow agent | B | AI-06; HUI-02 | Explicit action confirmation and scoped tools |
| Virtual visits/mobile/eRx | B | OPS-02/09; MED-03 | Separate each partner/device and regulatory adapter |
| Population-health coordination | R | OPS-06 | Versioned measures and owned interventions |
| Portal/bill pay/remote monitoring | R | OPS-02/03; GAP-03 | Specify separate financial and clinical scopes |

## InterSystems TrakCare; IntelliCare is separately identified

[Official source](https://www.intersystems.com/products/trakcare/); [additional official source](https://www.intersystems.com/resources/intersystems-intellicare-ehr/). TrakCare is the comparator for the rows below. IntelliCare is a separately marketed next-generation AI EHR; no automatic feature inheritance across release/product names is assumed.

| Feature publicly described | Our plan | Task reference | Work still needed |
|---|---|---|---|
| Unified clinical/administrative record | R | REC-01–05; FND-03 | Define department boundaries and shared identity |
| Departmental products | B | DEP packs | Compare one department contract at a time |
| Revenue-cycle suite | R | OPS-03 | Use local payer/country scenarios |
| Personal Community patient access | R | OPS-02 | Identity/proxy and disclosure controls |
| Assistant text interactions/search | B | HUI-02; AI-06 | Constrain tools and confirm consequential actions |
| Third-party data/application integration | R | INT-01/02 | API contracts, authorization and interoperability evidence |

## Dedalus ORBIS/ORBIS U — selected public announcements

[Official source](https://www.dedalus.com/uki/media/news/east-and-north-hertfordshire-nhs-trust-selects-orbis-u-for-uk-first/); [additional official source](https://www.dedalus.com/global/en/media/news/dedalus-and-corti-usher-in-the-agentic-ehr-era-across-europe/). A customer-selection announcement confirms selection, not a completed deployment of every feature. ORBIS Buddy/Corti announcement is dated 2026-10-22; country/release availability must be verified.

| Feature publicly described | Our plan | Task reference | Work still needed |
|---|---|---|---|
| Configurable hospital EPR | B | FND-03; HUI-28 | Obtain detailed selected-release workflows |
| Natural-language information access | B | AI-01; HUI-02 | Source-linked authorized retrieval |
| Agent workflow actions/write-back | R | AI-06 | Action policy, clinician approval and durable audit |
| Agent governance/monitoring | R | AI-07; SEC-03 | Model/version, incidents and kill-switch evidence |

## Additional cross-vendor backlog
- [ ] **MV-01 P3 — Enterprise business-system boundary.** Decide whether general ledger, accounts payable, budget/forecasting, payroll, HR and fixed assets are native modules or supported external adapters. Specify separation of duties, postings, reconciliation, approvals, period close and regional tax/accounting rules. Acceptance: a synthetic charge/procurement/payroll event reconciles through an approved external ledger without leaking clinical notes; do not claim ERP completeness from supply inventory alone.
- [ ] **MV-02 P2 — Implementation and service delivery.** Define installation support, clinical-content maintenance, training, coding/authorization service options, partner onboarding, uptime/response SLAs and incident escalation. Acceptance: staffed responsibilities, service cost boundaries, competency and after-hours handoff tested; free code is not a promise of free professional services.
- [ ] **MV-03 P2 — Predictive access model.** Specify no-show-risk inputs, lawful use, calibration, subgroup analysis, uncertainty and approved outreach. Acceptance: risk never automatically denies access or double-books a slot; compare useful interventions with a non-AI baseline.
- [ ] **MV-04 P1 — Neutral workflow test library.** Create synthetic registration, outpatient, ED, inpatient, eMAR, pharmacy, lab, imaging, surgery, discharge, referral, payment, export and outage scenarios. Freeze patient complexity, data volume, network, devices and evaluator role; record product/version/region and all configuration. Acceptance: independent reviewers can repeat tests; unknown or unavailable modules are reported rather than assigned zero without explanation.
- [ ] **MV-05 P1 — Vendor/release evidence ledger.** For every comparator claim, capture source, access/publication date, region, release, module/license and evidence type (product page, announcement, documentation, customer example, tested). Acceptance: separate Oracle next-generation EHR from Millennium, NextGen Office from Enterprise, TrakCare from IntelliCare, ORBIS from ORBIS U, and optional AI modules from base products.
- [ ] **MV-06 P1 — Deployment economics and resilience comparison.** Compare supported hosting, internet versus LAN/server outage, snapshot freshness, offline write policy, backup/recovery, clinical content costs, support, migrations and update operations. Acceptance: no vendor marked “cannot work offline,” “slow,” “insecure” or “expensive” without comparable primary evidence and stated context.

## What the comparison changes
The plan already targets broad clinical and specialty scope. Vendor research exposes additional work in business systems, staffed service delivery, predictive access, communications and task-specific AI. Our local-first/offline, original hospital GUI and free-install goals remain independent targets; they are not proven advantages over commercial deployments. A codebase, clinical content, governed implementation and participating organizations are required before functional equivalence is meaningful.

Use Epic's detailed register as the first baseline, then apply MV-04/05 to deepen the other matrices. Do not combine hospital and ambulatory feature counts into a “best EHR” percentage.
