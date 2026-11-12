# Hospital interface specification
Revision 2026-11-12. Original proposed design; no GUI implemented. “Best” means demonstrated safety, accessibility and task efficiency with hospital users, not a visual-style claim. Related tasks: UX-01–07 and [offline/performance](OFFLINE_AND_PERFORMANCE.md).

## Workspace structure
Desktop baseline 1440×900; verify 1280×720, 1920×1080 and tablet 1024×768. Use a 56-pixel application bar, 64-pixel minimum patient-context band, optional 224-pixel navigation, flexible clinical workspace and collapsible 320-pixel task panel. Dimensions are design starting points, not fixed obstacles to zoom or localization.

Application bar: organization/facility, role/workspace switcher, authorized global search, inbox count, connectivity and session controls. Patient band: preferred/legal name as policy permits, two identifiers, DOB/age, active encounter/location, allergy assessment state, critical flags, source freshness. Avoid unnecessary identifiers on public boards. Patient context remains visible during chart tasks and confirmations. Other tabs must not implicitly switch the active patient.

Clinical navigation: overview, history, problems, medications/allergies, notes, orders, results, observations, care plan, documents and transitions. Persistent role worklists sit outside the chart; shared components keep the same meaning across departments.

## Visual system
Use semantic CSS tokens, original icons with text labels, system/local bundled fonts and no internet-loaded assets. Base text 16 px, secondary text ≥14 px by default; users can enlarge text without loss of functionality. Tabular numerals for times/measurements, clear units, ≥1.4 line height for prose, compact tables only where legible. No decorative animations in critical workflows; respect reduced motion.

| Token | Light proposal | Dark proposal | Rule |
|---|---|---|---|
| Canvas | #F6F8FA | #101820 | Low-distraction background |
| Surface | #FFFFFF | #192631 | Cards, tables and dialogs |
| Primary text | #17212B | #EEF3F7 | Verify every pairing |
| Secondary text | #475569 | #B8C5D1 | Never use faint text for clinical essentials |
| Primary action | #087F8C | #6DD5DF | Foreground picked by measured contrast |
| Navigation | #17324D | #213B50 | Stable role/workspace location |
| Danger | #B42318 | #FFB4AB | Icon + explicit text; never color alone |
| Warning | #9B6500 | #F4CE79 | Meaning distinct from critical danger |
| Success | #237A57 | #83D6B1 | Does not imply clinical resolution by itself |
| Focus | #235EA7 | #9BC2FF | Visible outline on all interactive surfaces |

- [ ] **HUI-01 P0 — Token implementation.** Validate light/dark/high-contrast foreground/background pairs, selected/disabled/error/hover states and charts. Acceptance: WCAG 2.2 AA contrast criteria verified; dark-theme danger/warning labels remain readable.
- [ ] **HUI-02 P0 — Component library.** Buttons, fields, comboboxes, date/time/unit inputs, patient band, status chips, data grids, flowsheets, timelines, notes, medication cards and confirmation dialogs. Acceptance: documented keyboard/screen-reader behaviors and error messages for every component.
- [ ] **HUI-03 P0 — State vocabulary.** Separate local draft, saved on server, signed, pending delivery, delivered, reviewed, rejected, corrected and conflicted. Acceptance: icon/text/state mapping is consistent in tables, detail screens and printouts; queued is never labeled completed.

## Role workspaces and screen contracts
Every screen specifies permission, data source, freshness, primary task, side effects, empty/loading/error/forbidden/offline states, keyboard path and audit events. Server authorization remains mandatory.

| ID / role screen | Essential information | Primary action and safety behavior |
|---|---|---|
| HUI-04 Registrar | Duplicate candidates, identifiers, demographics, coverage and encounter | Register/check-in; duplicate review before merge; no broad clinical detail |
| HUI-05 Physician rounds | Assigned census, current location, overnight events, active problems, meds, pending tests and discharge barriers | Open patient, review, document, order and handoff; result ownership stays visible |
| HUI-06 Nurse assignment | Assigned patients, due/overdue tasks, precautions, observations, lines and escalation | Chart assessment, review eMAR and handoff; reminders show actual ownership/time |
| HUI-07 eMAR | Patient identifiers, barcode state, active order, dose/unit/route/time, last administration and holds | Scan→verify→document; mismatch, discontinuation and stale data get explicit handling |
| HUI-08 Emergency board | Authorized masked identity, acuity, arrival/waiting age, location, assigned team, pending actions and disposition | Reassess/assign/open; units/timers explicit; sortable board does not silently reorder beneath a click |
| HUI-09 Bed management | Occupied/available/cleaning/isolation beds, transfers and constraints | Allocate/transfer through server reservation; conflicts return current availability |
| HUI-10 Pharmacy | Verification queue, allergies, relevant labs, med history, formulary and preparation status | Verify/reject/clarify; show prerequisites and qualified verifier |
| HUI-11 Laboratory | Ordered tests, specimens, collection status, QC state, critical/corrected results | Accession/verify/report by credential; mismatch never silently repaired |
| HUI-12 Imaging | Modality queues, accession, indication, protocol status, prior studies and critical follow-up | Protocol/acquire/report; patient/accession identity reconciled with viewer |
| HUI-13 Surgery/anesthesia | Case, site/laterality, checklist, consent, equipment, meds and event timeline | Record each perioperative stage; checklist discrepancies owned and visible |
| HUI-14 Results/inbox | Urgency, age, owner, source, corrected status and unresolved action | Assign/review/act/escalate; reading does not equal closure |
| HUI-15 Scheduling | Resource/provider availability, appointment constraints, waitlist and location | Reserve/book/cancel; optimistic availability never guarantees reservation |
| HUI-16 Patient/proxy | Permitted appointments, instructions, results, meds and messages | Plain-language requests with clear response expectations; scope shown per proxy |
| HUI-17 Operations/security | Uptime, backup age, queues, failed interfaces, access reviews and incidents | Investigate/configure with explicit privilege; no default clinical chart access |

All screen IDs are unchecked implementation tasks despite tabular presentation. Each requires normal, permission-denied, outage and recovery demonstrations. Specialty packs extend these contracts rather than inventing incompatible navigation.

## Critical interaction details
- [ ] **HUI-18 P0 — Patient search.** Exact identifier search and constrained fuzzy name search, duplicate name indicators, assigning authority and active encounter. Acceptance: keyboard preview cannot open wrong patient after results refresh; “no authorized match” does not reveal another tenant's existence.
- [ ] **HUI-19 P0 — Note editor.** Visible author/encounter, section outline, source-linked inserted data, autosave state and final signature preview. Acceptance: simultaneous edits show diff/conflict; template update cannot rewrite signed history.
- [ ] **HUI-20 P0 — Order composer.** Search/favorites, fully qualified catalog entry, indication, units, route, timing, prerequisites and review basket. Acceptance: no unsafe preselected dose; confirmation shows patient, exact action and outstanding alerts; double-click cannot duplicate.
- [ ] **HUI-21 P0 — Observation/results display.** Collection and reported time, method/unit, reference range, provenance and correction history. Acceptance: graphs identify gaps and incompatible units; no connecting line implies an unmeasured value.
- [ ] **HUI-22 P0 — Alerts.** Governed severity, rationale, source and permitted action. Interrupt only for reviewed circumstances; maintain nonmodal unresolved-work queues. Acceptance: alert does not steal focus into a destructive default; override requires appropriate authority and reason.
- [ ] **HUI-23 P1 — Flowsheet.** Sticky patient/measurement headings, explicit date/time columns, keyboard entry with validation, corrected cells and trend access. Acceptance: horizontal/vertical scroll never makes the patient or unit ambiguous; scanner input is isolated from free-text entry.
- [ ] **HUI-24 P1 — Handoff and coverage.** Structured situation, context, tasks, contingencies, sender and receiver; task transfer requires acceptance. Acceptance: signing out never silently abandons orders/results.
- [ ] **HUI-25 P0 — Offline status panel.** Show current mode, source-specific last sync, authorized cache expiry, draft/pending/conflict counts and recovery owner. Acceptance: stale chart and pending submissions are identifiable without opening settings.
- [ ] **HUI-26 P1 — Arabic and English.** Mirror layout appropriately; preserve identifier, medication and measurement directionality using explicit bidirectional isolation. Acceptance: mixed-language names, dates, decimals and units are checked by clinicians; language switching retains context safely.
- [ ] **HUI-27 P1 — Shared/public displays.** Privacy mode, room/bed aliases, configurable masking and automatic lock. Acceptance: wallboards expose only facility-approved fields; screenshots and exports follow disclosure controls.
- [ ] **HUI-28 P1 — Configurability.** Versioned department layouts, pinned sections, task filters and order favorites with preview/approval/rollback. Acceptance: customization cannot remove identity, allergy assessment, outage status or required signing safeguards.
- [ ] **HUI-29 P1 — Printing.** Locally rendered chart summaries, labels and downtime forms with identity, source, effective time, page numbers and printed-at timestamp. Acceptance: printer failure stays visible; reprint does not create a duplicate clinical order.

## Accessibility and usability release gate
Use [WCAG 2.2](https://www.w3.org/TR/WCAG22/) AA as the accessibility target. Prefer at least 44×44 CSS-pixel primary touch controls where space permits; meet applicable minimum target-size requirements and exceptions rather than claiming every dense grid must have that size. Provide alternatives to dragging, visible focus, accessible names, field-associated errors, logical heading order and status announcements. Critical information must not depend on color, hover, audio, animation or memory alone.

- [ ] **HUI-30 P1 — Accessibility test.** Keyboard-only, screen reader, zoom/reflow, high contrast and reduced motion across core tasks. Acceptance: record browser/assistive technology combinations, manual results and remaining issues; automated checks alone do not pass the gate.
- [ ] **HUI-31 P1 — Comparative prototype testing.** Compare two original navigation/table-density alternatives with doctors, nurses, pharmacy, registration, diagnostic staff and patients. Proposed formative minimum: five participants per primary staff group across realistic shifts, followed by broader summative validation. Acceptance: measure correct completion, time, workload, errors, near misses and recovery; choose based on evidence.
- [ ] **HUI-32 P0 — Critical-task safety gate.** Wrong-patient traps, dose/unit confusion, patient switch during async response, stale allergy, barcode mismatch, corrected result and disconnected save. Acceptance: zero unresolved critical use errors in the defined validation scenarios; clinical reviewers approve mitigations and document residual risk. This is a test criterion, not a claim of zero real-world errors.
- [ ] **HUI-33 P1 — Maintain design evidence.** Store screen specs, component states, tokens, source-controlled prototypes, usability results and approved change records. Acceptance: each deployed screen traces to task, reviewer and verification evidence.

## Intended result
Fast role-based workspaces with consistent patient identity, closed-loop task ownership, keyboard efficiency and visible uncertainty. Visual polish is evaluated together with measured clinical usability, not substituted for it.
