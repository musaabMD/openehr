# EHR planning

Updated: 2026-11-12. The **Magic EHR** demo application now lives in this repository (see the [root README](../README.md)); [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) maps every backlog area to what the demo does. Clinical validation scores remain zero until evidence is reviewed.

| Document | Purpose |
|---|---|
| [Implementation status](IMPLEMENTATION_STATUS.md) | What the Magic EHR demo build implements today, mapped to every backlog section, HUI and OFF task |
| [Master capability blueprint](EPIC_INSPIRED_EHR_MASTER_BACKLOG.md) | Broad clinical, specialty, patient, enterprise and AI scope |
| [Detailed delivery backlog](DETAILED_DELIVERY_BACKLOG.md) | Original tasks, dependencies and department acceptance scenarios |
| [Capability comparison and gap register](CAPABILITY_COMPARISON_MATRIX.md) | 85 scoped comparison/requirement rows, source status, scoring method and 14 explicit gap tasks |
| [Offline operation and performance](OFFLINE_AND_PERFORMANCE.md) | Local hospital authority, internet-independent operation, downtime, synchronization, conflict rules and benchmark budgets |
| [Hospital interface specification](HOSPITAL_GUI_SPEC.md) | Original tokens, role workspaces, screen contracts, accessibility and measured usability |
| [Epic feature-by-feature review](EPIC_FEATURE_BY_FEATURE.md) | 190 baseline assessments and 17 new gap tasks with source evidence |
| [Epic comparison CSV](EPIC_FEATURE_BY_FEATURE.csv) | Machine-readable IDs, evidence, plan status, implementation/validation baseline and `demo_status` |
| [Major EHR comparison](MAJOR_EHR_COMPARISON.md) | Epic first, plus 61 initial feature rows across eight other comparator families |

## Start here
1. Read the comparison register's scoring rules; all implementation and clinical-validation scores are zero.
2. Resolve FND/SEC license, architecture, identity, audit and clinical-safety foundations.
3. Implement the local hospital encounter slice with OFF-01/02/03/07/08, patient-context GUI and performance instrumentation.
4. Exercise internet outage, clinical failure scenarios and restore before adding specialty packs.
5. Collect linked implementation and deployment-specific verification evidence before marking tasks complete.

The default target is full local hospital operation during internet loss. Disconnected workstations have a separately governed downtime mode; queued drafts are not clinical completion. External services remain dependent on their networks. Offline and speed claims require the specified tests.

Demo-level implementations are recorded in the implementation status file; tasks remain unvalidated until evidence is reviewed. Epic names are public comparison references; this is an independent design, not an exhaustive inventory or claim of feature parity. Unknown proprietary details stay unknown. The repository name does not establish openEHR standards conformance. License selection remains a foundational task; the project does not yet contain a license grant.

When existing broad requirements conflict with the newer detailed offline, interface or comparison contracts, use the newer contracts and record a design decision before implementation. In particular, standalone offline workstations must not implicitly commit orders or administrations.
