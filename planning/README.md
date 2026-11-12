# EHR planning

Updated: 2026-11-12. Planning only; no clinical application has been implemented.

**Current requirements mapping:** 180/180 Epic functionality rows + 10/10 verification questions; 61/61 additional-vendor rows. All enumerated rows have explicit draft requirement contracts (**100% traceability**). This is not 100% of Epic's undisclosed proprietary features, implementation or clinical validation. See the complete plan and closure ledger; earlier comparison counts remain historical baselines.

| Document | Purpose |
|---|---|
| [Complete requirement contracts](COMPLETE_REQUIREMENTS_PLAN.md) | 190 individual contracts, 13 extensions and 16 named specialty subcontracts with data/workflow/acceptance intent |
| [Major-EHR closure ledger](MAJOR_EHR_REQUIREMENT_CLOSURE.md) | Every one of the 61 additional-vendor rows mapped to explicit contracts |
| [Coverage verification report](REQUIREMENTS_COVERAGE_REPORT.md) | Mapping counts, consistency checks and remaining readiness limits |
| [Master capability blueprint](EPIC_INSPIRED_EHR_MASTER_BACKLOG.md) | Broad clinical, specialty, patient, enterprise and AI scope |
| [Detailed delivery backlog](DETAILED_DELIVERY_BACKLOG.md) | Original tasks, dependencies and department acceptance scenarios |
| [Capability comparison and gap register](CAPABILITY_COMPARISON_MATRIX.md) | 85 scoped comparison/requirement rows, source status, scoring method and 14 explicit gap tasks |
| [Offline operation and performance](OFFLINE_AND_PERFORMANCE.md) | Local hospital authority, internet-independent operation, downtime, synchronization, conflict rules and benchmark budgets |
| [Hospital interface specification](HOSPITAL_GUI_SPEC.md) | Original tokens, role workspaces, screen contracts, accessibility and measured usability |
| [Epic feature-by-feature review](EPIC_FEATURE_BY_FEATURE.md) | 190 baseline assessments and 17 new gap tasks with source evidence |
| [Epic comparison CSV](EPIC_FEATURE_BY_FEATURE.csv) | Machine-readable IDs, evidence, plan status and implementation/validation baseline |
| [Major EHR comparison](MAJOR_EHR_COMPARISON.md) | Epic first, plus 61 initial feature rows across eight other comparator families |

## Start here
1. Start with the complete requirement contracts and coverage report; use historical comparison documents for provenance. All implementation and clinical-validation scores are zero.
2. Resolve FND/SEC license, architecture, identity, audit and clinical-safety foundations.
3. Implement the local hospital encounter slice with OFF-01/02/03/07/08, patient-context GUI and performance instrumentation.
4. Exercise internet outage, clinical failure scenarios and restore before adding specialty packs.
5. Collect linked implementation and deployment-specific verification evidence before marking tasks complete.

The default target is full local hospital operation during internet loss. Disconnected workstations have a separately governed downtime mode; queued drafts are not clinical completion. External services remain dependent on their networks. Offline and speed claims require the specified tests.

All tasks remain unimplemented until evidence is reviewed. Epic names are public comparison references; this is an independent design, not an exhaustive inventory or claim of feature parity. Unknown proprietary details stay unknown. The repository name does not establish openEHR standards conformance. License selection remains a foundational task; the project does not yet contain a license grant.

When existing broad requirements conflict with the newer detailed offline, interface or comparison contracts, use the complete requirement plan together with the detailed offline/interface contracts and record a design decision before implementation. In particular, standalone offline workstations must not implicitly commit orders or administrations.
