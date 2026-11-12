# Major-EHR requirement closure and traceability
Revision 2026-11-12. Baseline: [original major-EHR review](MAJOR_EHR_COMPARISON.md). Current requirement contracts: [complete requirement plan](COMPLETE_REQUIREMENTS_PLAN.md).

## Result
**61/61 = 100% of the enumerated additional-vendor comparison rows have explicit planned requirement coverage.** These map to existing functional contracts or 13 explicit cross-vendor extension contracts. Rows overlap across vendors; they are not 61 distinct products or independent unique features. Epic is tracked separately: 180 functional rows plus ten verification questions, all explicitly planned.

R/B/G/D/U below preserve baseline status only. Every current row is REQUIREMENT_MAPPED, not implemented/tested. A deliberate deployment difference is addressed by an explicit optional managed/local deployment contract, not falsely called identical. Unknown security/performance/release equivalence stays unknown despite our having requirements for it.

| Row | Comparator | Feature | Baseline | Current explicit requirement contracts |
|---|---|---|---|---|
| MV-C001 | Oracle Health EHR — current product page | Contextual patient summaries | R | [EP-109](COMPLETE_REQUIREMENTS_PLAN.md#ep-109) |
| MV-C002 | Oracle Health EHR — current product page | Voice chart navigation | B | [EXT-07](COMPLETE_REQUIREMENTS_PLAN.md#ext-07) |
| MV-C003 | Oracle Health EHR — current product page | Patient timeline | R | [EP-001](COMPLETE_REQUIREMENTS_PLAN.md#ep-001), [EP-009](COMPLETE_REQUIREMENTS_PLAN.md#ep-009) |
| MV-C004 | Oracle Health EHR — current product page | Personalized workflow | B | [EXT-13](COMPLETE_REQUIREMENTS_PLAN.md#ext-13) |
| MV-C005 | Oracle Health EHR — current product page | Clinical risk/care-gap insights | B | [EP-087](COMPLETE_REQUIREMENTS_PLAN.md#ep-087), [EP-089](COMPLETE_REQUIREMENTS_PLAN.md#ep-089) |
| MV-C006 | Oracle Health EHR — current product page | SaaS update model | D | [EXT-01](COMPLETE_REQUIREMENTS_PLAN.md#ext-01) |
| MV-C007 | Oracle Health EHR — current product page | Enterprise scalability/security claims | U | [EP-185](COMPLETE_REQUIREMENTS_PLAN.md#ep-185), [EP-187](COMPLETE_REQUIREMENTS_PLAN.md#ep-187) |
| MV-C008 | MEDITECH Expanse — product catalog and AI overview | Ambulatory/ED/order management | R | [EP-002](COMPLETE_REQUIREMENTS_PLAN.md#ep-002), [EP-029](COMPLETE_REQUIREMENTS_PLAN.md#ep-029), [EP-010](COMPLETE_REQUIREMENTS_PLAN.md#ep-010) |
| MV-C009 | MEDITECH Expanse — product catalog and AI overview | Nursing/mobile point of care | R | [EP-177](COMPLETE_REQUIREMENTS_PLAN.md#ep-177), [EP-178](COMPLETE_REQUIREMENTS_PLAN.md#ep-178) |
| MV-C010 | MEDITECH Expanse — product catalog and AI overview | Pharmacy | R | [EP-010](COMPLETE_REQUIREMENTS_PLAN.md#ep-010), [EP-011](COMPLETE_REQUIREMENTS_PLAN.md#ep-011), [EP-012](COMPLETE_REQUIREMENTS_PLAN.md#ep-012), [EP-013](COMPLETE_REQUIREMENTS_PLAN.md#ep-013) |
| MV-C011 | MEDITECH Expanse — product catalog and AI overview | Blood bank | R | [EP-183](COMPLETE_REQUIREMENTS_PLAN.md#ep-183) |
| MV-C012 | MEDITECH Expanse — product catalog and AI overview | Lab/microbiology/pathology | R | [EP-034](COMPLETE_REQUIREMENTS_PLAN.md#ep-034), [EP-035](COMPLETE_REQUIREMENTS_PLAN.md#ep-035) |
| MV-C013 | MEDITECH Expanse — product catalog and AI overview | Home/hospice/long-term care | B | [EXT-09](COMPLETE_REQUIREMENTS_PLAN.md#ext-09) |
| MV-C014 | MEDITECH Expanse — product catalog and AI overview | Patient portal/telehealth | R | [EP-003](COMPLETE_REQUIREMENTS_PLAN.md#ep-003), [EP-056](COMPLETE_REQUIREMENTS_PLAN.md#ep-056) |
| MV-C015 | MEDITECH Expanse — product catalog and AI overview | Interoperability network | R | [EP-079](COMPLETE_REQUIREMENTS_PLAN.md#ep-079), [EP-080](COMPLETE_REQUIREMENTS_PLAN.md#ep-080) |
| MV-C016 | MEDITECH Expanse — product catalog and AI overview | High-availability snapshot | R | [EP-179](COMPLETE_REQUIREMENTS_PLAN.md#ep-179) |
| MV-C017 | MEDITECH Expanse — product catalog and AI overview | Scheduling/revenue/HIM | R | [EP-069](COMPLETE_REQUIREMENTS_PLAN.md#ep-069), [EXT-10](COMPLETE_REQUIREMENTS_PLAN.md#ext-10), [EXT-11](COMPLETE_REQUIREMENTS_PLAN.md#ext-11) |
| MV-C018 | MEDITECH Expanse — product catalog and AI overview | General ledger/payroll/HR | G | [EXT-02](COMPLETE_REQUIREMENTS_PLAN.md#ext-02) |
| MV-C019 | MEDITECH Expanse — product catalog and AI overview | AI chart questions/summaries | R | [EP-109](COMPLETE_REQUIREMENTS_PLAN.md#ep-109), [EP-140](COMPLETE_REQUIREMENTS_PLAN.md#ep-140) |
| MV-C020 | MEDITECH Expanse — product catalog and AI overview | Predictive no-show scheduling | B | [EXT-04](COMPLETE_REQUIREMENTS_PLAN.md#ext-04) |
| MV-C021 | Altera Sunrise — hospital platform | Role-based clinical/revenue views | R | [EP-172](COMPLETE_REQUIREMENTS_PLAN.md#ep-172), [EXT-13](COMPLETE_REQUIREMENTS_PLAN.md#ext-13) |
| MV-C022 | Altera Sunrise — hospital platform | Thread ambient documentation | R | [EP-108](COMPLETE_REQUIREMENTS_PLAN.md#ep-108) |
| MV-C023 | Altera Sunrise — hospital platform | Axon outside-data integration | R | [EP-079](COMPLETE_REQUIREMENTS_PLAN.md#ep-079) |
| MV-C024 | Altera Sunrise — hospital platform | Mobile record access/alerts | R | [EP-177](COMPLETE_REQUIREMENTS_PLAN.md#ep-177), [EP-020](COMPLETE_REQUIREMENTS_PLAN.md#ep-020) |
| MV-C025 | Altera Sunrise — hospital platform | CarePath portal/messages/scheduling | R | [EP-056](COMPLETE_REQUIREMENTS_PLAN.md#ep-056), [EP-064](COMPLETE_REQUIREMENTS_PLAN.md#ep-064), [EP-067](COMPLETE_REQUIREMENTS_PLAN.md#ep-067) |
| MV-C026 | Altera Sunrise — hospital platform | Financial Manager work queues/edits | B | [EXT-10](COMPLETE_REQUIREMENTS_PLAN.md#ext-10) |
| MV-C027 | Altera Sunrise — hospital platform | HIM indexing/record management | R | [EXT-11](COMPLETE_REQUIREMENTS_PLAN.md#ext-11) |
| MV-C028 | athenahealth athenaOne — ambulatory suite and services | Specialty-tailored web/mobile/voice | R | [EP-184](COMPLETE_REQUIREMENTS_PLAN.md#ep-184), [EXT-07](COMPLETE_REQUIREMENTS_PLAN.md#ext-07), [EP-177](COMPLETE_REQUIREMENTS_PLAN.md#ep-177) |
| MV-C029 | athenahealth athenaOne — ambulatory suite and services | Network chart/orders/results | R | [EP-001](COMPLETE_REQUIREMENTS_PLAN.md#ep-001), [EP-079](COMPLETE_REQUIREMENTS_PLAN.md#ep-079), [EP-034](COMPLETE_REQUIREMENTS_PLAN.md#ep-034) |
| MV-C030 | athenahealth athenaOne — ambulatory suite and services | Care-gap insights | R | [EP-087](COMPLETE_REQUIREMENTS_PLAN.md#ep-087) |
| MV-C031 | athenahealth athenaOne — ambulatory suite and services | Practice billing/claim edits | R | [EXT-10](COMPLETE_REQUIREMENTS_PLAN.md#ext-10) |
| MV-C032 | athenahealth athenaOne — ambulatory suite and services | Authorization service | B | [EP-097](COMPLETE_REQUIREMENTS_PLAN.md#ep-097), [EXT-03](COMPLETE_REQUIREMENTS_PLAN.md#ext-03) |
| MV-C033 | athenahealth athenaOne — ambulatory suite and services | Patient engagement suite | R | [EP-057](COMPLETE_REQUIREMENTS_PLAN.md#ep-057), [EP-067](COMPLETE_REQUIREMENTS_PLAN.md#ep-067) |
| MV-C034 | athenahealth athenaOne — ambulatory suite and services | Ambient mobile notes | R | [EP-108](COMPLETE_REQUIREMENTS_PLAN.md#ep-108), [EP-177](COMPLETE_REQUIREMENTS_PLAN.md#ep-177) |
| MV-C035 | athenahealth athenaOne — ambulatory suite and services | Embedded coding/support services | G | [EXT-03](COMPLETE_REQUIREMENTS_PLAN.md#ext-03) |
| MV-C036 | eClinicalWorks/healow — AI and exchange | Fax classification/patient matching | G | [EP-163](COMPLETE_REQUIREMENTS_PLAN.md#ep-163), [EP-139](COMPLETE_REQUIREMENTS_PLAN.md#ep-139) |
| MV-C037 | eClinicalWorks/healow — AI and exchange | Cited clinical Q&A | B | [EXT-06](COMPLETE_REQUIREMENTS_PLAN.md#ext-06) |
| MV-C038 | eClinicalWorks/healow — AI and exchange | Conversational contact center | B | [EP-057](COMPLETE_REQUIREMENTS_PLAN.md#ep-057), [EP-142](COMPLETE_REQUIREMENTS_PLAN.md#ep-142), [EP-148](COMPLETE_REQUIREMENTS_PLAN.md#ep-148) |
| MV-C039 | eClinicalWorks/healow — AI and exchange | No-show prediction | B | [EXT-04](COMPLETE_REQUIREMENTS_PLAN.md#ext-04) |
| MV-C040 | eClinicalWorks/healow — AI and exchange | PRISMA outside-record search | R | [EP-079](COMPLETE_REQUIREMENTS_PLAN.md#ep-079) |
| MV-C041 | eClinicalWorks/healow — AI and exchange | FHIR/SMART/backend integrations | R | [EP-081](COMPLETE_REQUIREMENTS_PLAN.md#ep-081) |
| MV-C042 | eClinicalWorks/healow — AI and exchange | Single/patient-population EHI export | B | [EXT-05](COMPLETE_REQUIREMENTS_PLAN.md#ext-05) |
| MV-C043 | eClinicalWorks/healow — AI and exchange | TEFCA-related exchange | B | [EP-079](COMPLETE_REQUIREMENTS_PLAN.md#ep-079), [EP-190](COMPLETE_REQUIREMENTS_PLAN.md#ep-190) |
| MV-C044 | NextGen Enterprise/Office and connected tools | Specialty content/templates | R | [EP-184](COMPLETE_REQUIREMENTS_PLAN.md#ep-184), [EXT-08](COMPLETE_REQUIREMENTS_PLAN.md#ext-08) |
| MV-C045 | NextGen Enterprise/Office and connected tools | Online scheduling/recall/waitlist | R | [EP-064](COMPLETE_REQUIREMENTS_PLAN.md#ep-064), [EP-066](COMPLETE_REQUIREMENTS_PLAN.md#ep-066), [EP-094](COMPLETE_REQUIREMENTS_PLAN.md#ep-094) |
| MV-C046 | NextGen Enterprise/Office and connected tools | Digital intake/upload | B | [EP-065](COMPLETE_REQUIREMENTS_PLAN.md#ep-065), [EP-163](COMPLETE_REQUIREMENTS_PLAN.md#ep-163) |
| MV-C047 | NextGen Enterprise/Office and connected tools | Ambient SOAP notes | R | [EP-108](COMPLETE_REQUIREMENTS_PLAN.md#ep-108) |
| MV-C048 | NextGen Enterprise/Office and connected tools | Voice/text workflow agent | B | [EXT-07](COMPLETE_REQUIREMENTS_PLAN.md#ext-07), [EP-180](COMPLETE_REQUIREMENTS_PLAN.md#ep-180) |
| MV-C049 | NextGen Enterprise/Office and connected tools | Virtual visits/mobile/eRx | B | [EP-003](COMPLETE_REQUIREMENTS_PLAN.md#ep-003), [EP-177](COMPLETE_REQUIREMENTS_PLAN.md#ep-177), [EP-010](COMPLETE_REQUIREMENTS_PLAN.md#ep-010) |
| MV-C050 | NextGen Enterprise/Office and connected tools | Population-health coordination | R | [EP-089](COMPLETE_REQUIREMENTS_PLAN.md#ep-089), [EP-091](COMPLETE_REQUIREMENTS_PLAN.md#ep-091) |
| MV-C051 | NextGen Enterprise/Office and connected tools | Portal/bill pay/remote monitoring | R | [EP-056](COMPLETE_REQUIREMENTS_PLAN.md#ep-056), [EP-078](COMPLETE_REQUIREMENTS_PLAN.md#ep-078), [EP-060](COMPLETE_REQUIREMENTS_PLAN.md#ep-060) |
| MV-C052 | InterSystems TrakCare; IntelliCare is separately identified | Unified clinical/administrative record | R | [EP-001](COMPLETE_REQUIREMENTS_PLAN.md#ep-001), [EP-069](COMPLETE_REQUIREMENTS_PLAN.md#ep-069) |
| MV-C053 | InterSystems TrakCare; IntelliCare is separately identified | Departmental products | B | [EP-184](COMPLETE_REQUIREMENTS_PLAN.md#ep-184), [EXT-08](COMPLETE_REQUIREMENTS_PLAN.md#ext-08) |
| MV-C054 | InterSystems TrakCare; IntelliCare is separately identified | Revenue-cycle suite | R | [EXT-10](COMPLETE_REQUIREMENTS_PLAN.md#ext-10) |
| MV-C055 | InterSystems TrakCare; IntelliCare is separately identified | Personal Community patient access | R | [EP-055](COMPLETE_REQUIREMENTS_PLAN.md#ep-055), [EP-056](COMPLETE_REQUIREMENTS_PLAN.md#ep-056) |
| MV-C056 | InterSystems TrakCare; IntelliCare is separately identified | Assistant text interactions/search | B | [EXT-07](COMPLETE_REQUIREMENTS_PLAN.md#ext-07), [EP-140](COMPLETE_REQUIREMENTS_PLAN.md#ep-140) |
| MV-C057 | InterSystems TrakCare; IntelliCare is separately identified | Third-party data/application integration | R | [EP-079](COMPLETE_REQUIREMENTS_PLAN.md#ep-079), [EP-088](COMPLETE_REQUIREMENTS_PLAN.md#ep-088) |
| MV-C058 | Dedalus ORBIS/ORBIS U — selected public announcements | Configurable hospital EPR | B | [EXT-13](COMPLETE_REQUIREMENTS_PLAN.md#ext-13), [EP-184](COMPLETE_REQUIREMENTS_PLAN.md#ep-184) |
| MV-C059 | Dedalus ORBIS/ORBIS U — selected public announcements | Natural-language information access | B | [EP-140](COMPLETE_REQUIREMENTS_PLAN.md#ep-140) |
| MV-C060 | Dedalus ORBIS/ORBIS U — selected public announcements | Agent workflow actions/write-back | R | [EP-180](COMPLETE_REQUIREMENTS_PLAN.md#ep-180) |
| MV-C061 | Dedalus ORBIS/ORBIS U — selected public announcements | Agent governance/monitoring | R | [EXT-12](COMPLETE_REQUIREMENTS_PLAN.md#ext-12) |

## Acceptance and evidence
Each mapping inherits the linked contract's specific data, required workflow and failure/acceptance conditions plus the common role/UI/offline/audit/API delivery contract. Baseline source URLs and their limitations remain in the original comparison; this ledger makes no new vendor capability claims. The vendor/source date and availability evidence must remain separate from our planning status.

Before changing a row to IMPLEMENTED, link actual code and passing tests for all mapped requirements. Before VALIDATED, link jurisdiction/site-specific clinical/operational approval and evidence. No row can become complete by changing its label. Maintainer review must verify semantic correspondence, not just a nonempty link.

## Extension scope
EXT-01 managed/local deployment; EXT-02 finance/payroll/HR; EXT-03 staffed service delivery; EXT-04 no-show prediction; EXT-05 complete export; EXT-06 clinical-knowledge evidence retrieval; EXT-07 voice/text actions; EXT-08 individual specialty packs; EXT-09 home/hospice/long-term care; EXT-10 full revenue cycle; EXT-11 HIM; EXT-12 AI lifecycle; EXT-13 personalized role workspaces. All are explicit draft contracts, not delivered services/software.
