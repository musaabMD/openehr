# Offline operation and performance specification
Revision 2026-11-12. Proposed architecture and acceptance tasks; not implemented. Supplements FND, SEC, INT and MED tasks in [delivery backlog](DETAILED_DELIVERY_BACKLOG.md).

## Operating model
The default hospital installation runs its authoritative application, database, identity service, terminology, audit, document storage and supported integrations on hospital-controlled infrastructure. Internet loss must not stop local clinical workflows. No mandatory cloud login, CDN, license check, telemetry, remote font, AI provider or public DNS is allowed on the critical path. LAN availability and internet availability are separate health signals.

A local hospital server is the authority for that facility. A redundant local deployment can survive a server failure; a single-server demo cannot claim high availability. Multi-site exchange is asynchronous when the WAN is down. External eRx, payer claims, outside records, off-site portal access and remote video depend on their networks and must show unavailable/pending rather than false success.

## Modes and permitted actions
| Mode | Read | Write and safety behavior |
|---|---|---|
| Internet down; hospital LAN healthy | Full locally authorized chart | Normal local signed transactions, local eMAR and LAN devices; external actions queued with explicit status |
| WAN partition between facilities | Local authoritative records; remote snapshots show source and age | Only the owning facility's authority can commit restricted resources; remote changes reconcile later |
| Workstation disconnected from LAN | Only explicitly provisioned encrypted downtime dataset | Default read-only plus durable unsigned notes/observations; orders and administrations use the approved downtime procedure, not an authoritative electronic completion |
| Server unavailable | Separate approved downtime read replica or encrypted packet, with snapshot time | Controlled paper/downtime workflow; reconcile after restoration |
| Power unavailable | Approved printed downtime materials and hospital continuity plan | No claim that software operates without powered equipment; UPS/generator tests are facility responsibilities |

Detached mobile clinical signing/administration is a future separate safety case, not implicitly enabled by offline drafts. Never show a queued draft as signed, delivered, administered, billed or acknowledged. No cache can guarantee immediate revocation while its device is disconnected.

## Required tasks
- [ ] **OFF-01 P0 — Dependency independence.** Vendor all critical static assets; provide local identity and DNS/time configuration, local terminology and offline installation bundles with manifests/signature verification. Acceptance: block all internet routes during a fresh installation from a prepared bundle and complete the synthetic local encounter.
- [ ] **OFF-02 P0 — Durable local commits.** Atomically commit domain revision and outbox event in PostgreSQL; acknowledge success only after required durable writes. Audit linkage must survive a crash. Acceptance: terminate process before/after transaction commit; a retry returns the same result without duplicate clinical action.
- [ ] **OFF-03 P0 — Connectivity UI.** Distinguish internet outage, local server outage, expired authorization and stale data. Show last successful sync by source, pending count and actionable recovery. Acceptance: server reachability checks, not browser online flag alone, control status; no PHI leaks in diagnostics.
- [ ] **OFF-04 P1 — Scoped downtime cache.** Managed devices only, minimal assigned census and approved clinical summary; no entire-hospital default cache. Encrypt using device-bound key protection and approved local unlock; no PHI or bearer tokens in plain localStorage or service-worker cache. Default proposed offline authorization lifetime 8 hours, configurable only through reviewed policy; expiry fails closed. Acceptance: cross-user/device access denied; stolen storage cannot expose plaintext; reconnect enforces revocation and purge.
- [ ] **OFF-05 P1 — Durable draft journal.** Stable UUID, author/device, patient identifier authority, base revision, effective/recorded times, monotonic sequence and payload digest. States: local-draft, queued, syncing, server-accepted, conflict, rejected. Acceptance: device restart preserves durable drafts; quota failure prevents “saved” indication and starts the downtime procedure.
- [ ] **OFF-06 P1 — Sync protocol.** Per-source checkpoint, bounded batches, idempotency, at-least-once delivery, backoff/jitter and resumable attachment uploads. Server reauthorizes every item and validates patient mapping/current privileges. Acceptance: 10 repeated deliveries create one accepted operation; lost acknowledgement and reordered messages reconcile; rejected items remain visible and owned.
- [ ] **OFF-07 P0 — Conflict rules.** No last-write-wins for clinical meaning. Independent observations append with provenance and duplicate review; competing medication/allergy/order/note changes require human resolution against current server state. Signed records accept amendments only. Bed assignments and appointment slots require authority-side locking. Acceptance: stale stop/start medication, patient merge and concurrent bed allocation never resolve silently.
- [ ] **OFF-08 P0 — Authority and partition fencing.** One writable authority per facility/resource partition; failover requires quorum/fencing and old leader exclusion. Acceptance: sever replication links and demonstrate that two primaries cannot commit conflicting administrations or reservations. Device clocks never determine winner.
- [ ] **OFF-09 P1 — External action queue.** Distinguish prepared, authorized, pending-delivery, acknowledged, failed and canceled. Revalidate time-sensitive intent before reconnect submission; cancellations and duplicates reconcile with partner. Acceptance: internet restoration cannot automatically submit stale prescriptions or duplicate claims.
- [ ] **OFF-10 P1 — Downtime reconciliation.** Assign downtime episode ID, authorized reconciler and unresolved queue; import paper/draft events with original author/time and transcription provenance. Acceptance: reconcile meds, allergies, results, patient identity and duplicated orders before closing the episode; two reviewers handle locally designated high-risk discrepancies.
- [ ] **OFF-11 P0 — Backups and availability.** Encrypted local plus isolated secondary backups, key recovery, restore evidence, replication lag alarms and documented failover. Acceptance: restore data, attachments and audit chain together; test missing/corrupt backup and compromised node; replication is not treated as backup.
- [ ] **OFF-12 P1 — Standalone facility deployment.** Provide update/rollback bundles, signed migration preflight, storage monitoring and dependency inventories. Acceptance: facility operates indefinitely without internet subject to maintained local infrastructure; disconnected-device authorization expires by policy.
- [ ] **OFF-13 P2 — Offline AI.** Optional approved local model with local retrieval and strict authorization. Acceptance: external AI outage leaves manual workflows intact; insufficient hardware produces explicit unavailability; AI never invents data hidden by an outage.
- [ ] **OFF-14 P1 — Outage exercise.** Complete a 72-hour synthetic internet blackout with 200 active local sessions, lab/result flow, printing and local barcode operations; then reconnect and reconcile all partner queues. Separately test LAN partition, server loss, credential expiry, lost device, disk full, clock skew and power interruption.

## Performance objectives
These are proposed engineering budgets, not benchmark results. Publish raw distributions, errors, dataset and topology; never claim “fast” from an empty demo.

Reference test profile: current supported browser, 4-core/8-GB workstation, 1920×1080 display; dedicated 8-vCPU/32-GB local app node and 8-vCPU/32-GB database node with SSD, 1-Gbps LAN and 20-ms simulated round-trip. Seed 100,000 synthetic patients, 1 million encounters and 20 million observations. Simulate 200 concurrent active users with a documented mix of chart reads, search, notes, orders and results. Validate 1,000-session larger-site profile independently; no extrapolated claims.

| User-visible action | Target | Measurement boundary |
|---|---|---|
| Keyboard/selection feedback | p95 ≤100 ms | Input to next painted feedback |
| Warm local chart summary | p95 ≤1 s, p99 ≤2 s | Navigation to essential chart content usable |
| Cold chart first open | p95 ≤2.5 s | New session navigation to essential content; no oversized image download |
| Patient search | p95 ≤500 ms | Submit to authorized first result page, including network/render |
| Note save acknowledgement | p95 ≤500 ms | Save to durable local-server acknowledgement |
| Sign/order submission | p95 ≤1 s | Confirm to durable transaction and visible status; includes local safety checks |
| Worklist update | p95 ≤2 s | Authoritative commit to visible authorized board update |
| 100-row flowsheet | p95 ≤1 s | Open to usable first viewport |
| Offline draft durability | p95 ≤300 ms | Save to verified encrypted local journal commit |
| Sync backlog of 10,000 small events | ≤5 minutes | Healthy reference LAN after reconnection, without breaching interactive budgets |

Error budget: <0.1% unexpected failures under stated normal load; report authorization denials and deliberately simulated partner failures separately. Never trade correctness, permission checks, durability or medication safety for latency. Pending may render immediately; completed may render only after authoritative acknowledgement.

- [ ] **PERF-01 P0 — Query design.** Tenant/patient/time indexes, bounded pagination, query plans and no unbounded history requests. Acceptance: above chart/search targets at seeded scale; no cross-tenant results or N+1 regressions.
- [ ] **PERF-02 P1 — UI payload.** Initial critical compressed JavaScript target ≤300 KB excluding separately loaded imaging; lazy-load specialty packs, virtualize long lists and cancel stale patient requests. Acceptance: measured bundles and browser traces; accessibility works with virtualized rows.
- [ ] **PERF-03 P0 — Cache safety.** Authoritative writes stay transactional; cache only allowed derived reads with tenant/user/policy/version keys. Acceptance: revocation, allergy changes and patient switches invalidate relevant views; stale content is labeled.
- [ ] **PERF-04 P1 — Workload isolation.** Queue analytics, exports, AI and batch imports with quotas; local clinical traffic takes precedence. Acceptance: 10 concurrent exports and a sync storm do not break chart/sign targets.
- [ ] **PERF-05 P1 — Instrumentation.** PHI-free latency metrics, queue age, slow-query aggregation and correlation IDs. Acceptance: trace chart→API→database→paint; publish p50/p95/p99 and errors by mode.
- [ ] **PERF-06 P1 — Regression suite.** Cold/warm runs, 8-hour soak, peak bursts, slow workstation and degraded LAN tests with fixed seeds. Acceptance: a failed safety or performance budget blocks that deployment's release gate.

## Sources and evidence
The architecture and budgets above are independent project choices. [ONC SAFER contingency planning](https://healthit.gov/resources/2025-safer-guide-contingency-planning/) informs the need to plan for EHR unavailability; it does not certify this design. See [SAFER guides](https://healthit.gov/clinical-quality-and-safety/safer-guides/) for broader safety review.
