# Requirements coverage report
Revision: 2026-11-12. Baseline: 595a8c23694111949e1fc051b4d887c6cbd57e50. Checks below verify document traceability/structure, not implementation, clinical content or safety.

## Denominators and result
| Set | Before: explicit / broad / gap | Current mapped | Percentage |
|---|---|---:|---:|
| Epic comparison inventory | 74 / 74 / 42 across 190 rows | 190 / 190 | 100% |
| Epic functionality subset | EP-001–180 | 180 / 180 | 100% |
| Epic verification-question subset | EP-181–190, comparator evidence unresolved | 10 / 10 | 100% action coverage |
| Additional vendor inventory | Historical statuses retained in original review | 61 / 61 | 100% |
| Unmapped rows across both inventories | Previously partial/missing intents | 0 / 251 | 0% unmapped |

The inventories overlap in functionality. 251 rows is a traceability count, not 251 distinct clinical features. 190 individual contracts plus 13 extension contracts cover these rows; 16 separate specialty subcontracts expand grouped clinical packs.

Before revision, explicit mapping was 74/190 = 38.95%; including broad mentions yielded 148/190 = 77.89%. This revision adds fields, required behavior and acceptance intent for every comparison row. It does not obtain undisclosed vendor specifications or change implementation status.

## Performed checks
- PASS — epicRows
- PASS — uniqueComparisonIDs
- PASS — individualContracts
- PASS — functionalContracts
- PASS — verificationContracts
- PASS — majorRows
- PASS — allMajorRequirementsResolve
- PASS — noOrphanEpicContracts
- PASS — extensionContracts
- PASS — allEpicAnchorsPresent
- PASS — allExtensionAnchorsPresent
- PASS — implementationStillZero

PASS — relative document links and requirement anchor targets resolve across all seven changed documents. Publishing verification also requires reading back committed files for exact content equality. The commit operation uses the previously read branch head as a lease; a concurrent change must be reviewed rather than overwritten.

## Meaning of complete planning coverage
Each enumerated functionality row has explicit draft data/workflow/acceptance requirements; each uncertain comparison question has a concrete verification contract. Every major-vendor row maps to those contracts or an explicit extension. No category heading or nonempty placeholder alone counts as a row contract.

These are implementation tasks with specified intended behavior, not fully approved low-level designs. People must be appointed to reviewer roles; exact API/schema field constraints, clinical content, regional rules, interface/device contracts and fixture thresholds must be approved during implementation design. Tasks remain unchecked until delivered and verified.

## Remaining status
- Implemented functionality: 0%; no application exists in this repository.
- Clinically validated functionality: 0%; no acceptance test is presented as already passed.
- Ten Epic comparison questions retain unknown comparator evidence; being planned for verification does not establish equivalence.
- Proprietary/undiscovered vendor features are outside this frozen inventory and cannot honestly be assigned 100% coverage.
- Source, release, country and availability limitations remain in the historical comparison/source register.

## Maintenance rule
Adding a comparison row requires a new or semantically justified existing contract, source/evidence status and acceptance scenarios in the same change. Never relabel unknown as supported, broad as implemented, or a generated requirement as clinically approved to preserve a percentage. Report functional mapping, comparator research, implemented work and deployment validation separately.
