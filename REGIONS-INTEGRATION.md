# Multi-level integration plan — Regions, Communities, Communes

How Belgian taxation/spending splits across government levels, and a phased, honesty-first plan to add the regional / community / communal levels to the citizen app. Grounded in deep-research (verified 3-0 unless noted), 2026-06-21.

---

## 0. The one-paragraph reality

Belgium has **four levels**: Federal, **3 Regions** (Flanders, Wallonia, Brussels-Capital), **3 Communities** (Flemish, French, German-speaking), **~581 Communes**. Competences split cleanly enough to build honest citizen pages. **But the open data is uneven**: federal = clean (already in the app), Wallonia = good machine-readable API, Flanders = aggregated tables, **Brussels = a real gap**, Communities = no own-tax data (they're federally funded). So a single normalized "all-levels budget by theme" is **not honestly buildable today** — the plan works *with* that, not against it.

---

## 1. Who taxes what (verified competences; ⚠ rates unverified this round)

| Level | Own taxes | Spends on (competences) |
|---|---|---|
| **Federal** | Personal income tax (base), corporate tax, VAT, excise, social security | Social protection/pensions, **curative** healthcare (via social security), justice, federal police, defence, foreign affairs, debt interest, rail (SNCB) |
| **Regions** | Regional **PIT surcharge** (opcentiemen/additionnels, 6th State Reform); registration duties (property); inheritance & gift duties; **road tax**; **vehicle registration (TMC/BIV)** | Economy, employment, environment & water, nature, **energy**, public works & infrastructure, transport (except rail), agriculture & fisheries, **housing**, spatial planning, oversight of communes |
| **Communities** | **None** — financed by federal transfers (Special Financing Act 1989) on shared PIT/VAT | **Education** & training, **culture & media**, language, welfare/family/youth aid, **preventive** health (NOT curative — that's federal) |
| **Communes** | **Additional communal tax on PIT** (~0–9%, per commune ⚠); opcentiemen on the immovable withholding tax (précompte immobilier / onroerende voorheffing); local levies | Local police & fire, local roads, waste, civil & population registry, elections, planning permission, social welfare (CPAS/OCMW), municipal schools |

**Key honesty fact:** Communities have **no own tax**. They're funded by reallocated federal PIT/VAT (French Community ≈ 96% federal transfers). → In any personal split, community spending must be shown as a *slice of federal-origin money*, never a separate tax line.

⚠ **Rates not yet verified.** Communal additional-PIT %, regional PIT surcharge, registration/inheritance/road/TMC rates were NOT verified this research round. Must be separately sourced (a federal `municipal-tax-rate-2024.pdf` listing all 581 communal PIT rates was identified) before any computation.

---

## 2. The central constraint — data availability per level

| Level | Source | Format | Theme budget? | Tax revenue? | Verdict |
|---|---|---|---|---|---|
| Federal | data.gov.be FPS BOSA | XLSX, CC0 | ✅ (in app) | ✅ FPS Finance | **Done** |
| Wallonia / Fed. W-B | **ODWB** (Opendatasoft Explore API v2.1) | CSV/JSON API, CC BY | ✅ municipal **by function** (Namur verified) | partial | **Best feed** (per-commune coverage varies) |
| Flanders | lokaalbestuur.vlaanderen.be BBC | Excel/PDF, aggregated | ~ aggregated by gov-type; per-commune via separate analysis tool | ~ | Medium (URLs unstable, site migration) |
| Brussels-Capital | openbudgets.brussels | procurement/subsidies cadaster only | ❌ no functional budget | ❌ no tax revenue | **Gap** — needs separate regional budget docs |
| Communities | — | — | transfer-funded | ❌ no own tax | Explainer only |
| Communes (all) | NBB/Belfius local-finance; federal communal-rate PDF | studies/PDF | ~ | communal PIT rates (PDF, 581) | Rates usable; budgets patchy |

**Implication:** don't promise a unified cross-level treemap. Build **per-level**, each honestly sourced; normalize toward a shared taxonomy only where data allows.

---

## 3. The feasible high-value feature: "Your taxes by level"

This is **more buildable and more citizen-relevant** than a cross-level budget viz, because a citizen's tax euro *does* split across levels computably:

- **Communal**: additional % on your PIT (per commune, ~0–9%).
- **Regional**: regional PIT surcharge + (occasionally) registration/inheritance/road taxes.
- **Federal**: the PIT base after the regional portion + all the indirect taxes already modelled (VAT, fuel, etc.).
- **Communities**: shown as *funded out of federal* (no own tax) — a labelled note, not a tax line.

Output for the citizen: *"Of your total tax this year: €X federal · €Y your Region · €Z your commune (NAME) — plus communities, funded from federal."* Honest, personal, accessible.

**Needs (gating):** verified communal additional-% dataset (581 communes) + regional surcharge method. Until verified, label clearly and don't ship the numbers.

---

## 4. Phased integration plan

### Phase 1 — "Who does what" explainers (build first; zero data risk)
- New **Levels** screen: 4 cards (Federal / Region / Community / Commune).
- Each → a detail page: *what it taxes*, *what it's responsible for* (the verified competence list), *how it's funded* (esp. communities = federal transfers).
- Pure authored content (like `content.js`), trilingual, WCAG. **High comprehension value, fully verified, no data dependency.** Ships immediately.

### Phase 2 — "Your taxes by level" personal split
- In the **You** screen, add a commune picker (search the 581 communes).
- Compute federal / regional / communal share of the user's PIT using the verified communal-% + regional surcharge; communities shown as federal-funded.
- Reuse the existing estimate framing (illustrative, magnitudes scale). **Gated on verifying the rate datasets** (open item §6).

### Phase 3 — Regional/communal SPENDING by theme (opt-in, where data exists)
- **Wallonia**: "your commune budget" via ODWB API by-function (start with Namur; expand as coverage allows).
- **Flanders**: regional aggregated + per-commune via the BBC analysis tool (harder; later).
- **Brussels**: **explainer only** + honest "functional budget not in open data yet" note (the gap).
- Keep levels **separate** screens — never a merged total implying comparability.

### Phase 4 — Normalize (long-term)
- Map per-level budgets onto a shared functional taxonomy (like the federal 12 themes) **only as data improves**. Community pages stay competence-explainers funded-by-federal.

---

## 5. UX / accessibility (citizen-centric)

- **Don't overwhelm**: keep federal as the default; levels are an *explore-deeper* path. Progressive disclosure.
- **Navigation**: nav is already at 5 (Home/Budget/Compare/You/About). Add levels as a **card on Home + a sub-route**, or a level selector inside Budget — avoid a 6th always-visible tab (research: ≤5 primary items).
- **Plain-language competence explainers** double as trust-builders (honest drill-down beats simplified labels).
- **Trilingual** NL/FR/EN; official commune names.
- **WCAG**: same patterns already in place (focus mgmt on route change, aria-current, accessible tables, contrast).

## 6. Honesty & org guardrails (must-haves)

- **Never** sum levels into one "total government budget" treemap implying they're comparable/normalized.
- **Communities**: always shown as federally funded — no own tax line.
- **Brussels**: state the functional-budget data gap explicitly; don't fabricate.
- **Rates**: verify communal/regional rates before any computation ships (Phase 2 gate).
- **PII (org rule)**: ODWB "Subsides attribués"/grants datasets name individual recipients — **never surface recipient names** in the citizen UI; screen before display.

## 7. Open items to verify before Phase 2/3

1. Communal additional-PIT rates, all 581 communes (federal `municipal-tax-rate-2024.pdf` identified — fetch & parse).
2. Regional PIT surcharge mechanism/rate (6th State Reform).
3. Regional own-tax rates (registration, inheritance/gift, road tax, TMC/BIV) if adding occasional add-ons.
4. ODWB per-commune by-function coverage breadth (verified for Namur; not proven uniform across ~262 Walloon communes).
5. German-speaking Community + 581-commune aggregate finance (NBB/Belfius) formats/licences.

---

## Recommendation

Build **Phase 1 now** (explainers — verified, accessible, zero data risk, immediately useful). In parallel, fetch + verify the communal/regional **rate datasets** to unlock **Phase 2** (the personal by-level split — the highest-value citizen feature). Treat Phase 3 (regional/communal spending viz) as opt-in and region-by-region, honest about the Brussels gap. Never merge levels into a single fake total.

**Sources** (verified): belgium.be (federal/region/community/commune competences); EU CoR Division of Powers; be.brussels; CFWB Special Financing Act; ODWB Explore API (live-tested); lokaalbestuur.vlaanderen.be BBC; openbudgets.brussels; finance.belgium.be municipal-tax-rate PDF. Refuted/excluded: Communities cover curative medicine (they cover **preventive** only).
