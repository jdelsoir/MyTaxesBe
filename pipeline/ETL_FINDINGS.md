# ETL Findings — Federal Budget (verified 2026-06-20)

Hands-on inspection of the real FPS BOSA `eBudget` XLSX files. Every number below was reproduced from the actual downloads in `raw/`. Scripts: `inspect.mjs`, `analyze.mjs`, `drill.mjs`, `econ.mjs` (diagnostics) and `build.mjs` (production ETL).

## Files inspected

| Local | Source filename | Rows | Total CL/VeK |
|---|---|---|---|
| `exp_2024_ini.xlsx` | 01 2024 …eBudget-Expenses_Cycle_INI_2024 | 2,285 | €161.37B |
| `exp_2024_c2.xlsx` | …eBudget-Expenses_Cycle_2_2024 | 2,288 | €160.43B |
| `exp_2025_c7.xlsx` | 04 2025 …eBudget-Expenses_Cycle_7_2025 | 2,178 | €49.88B ⚠ |
| `inc_2024_ini.xlsx` | 01 2024 …eBudget-Incomes_Cycle_INI_2024 | 496 | — |
| `inc_2024_c2.xlsx` | …eBudget-Incomes_Cycle_2_2024 | — | — |

Download host: `https://bosa.belgium.be/sites/default/files/content/documents/<urlencoded name>.xlsx`. Returns 200 with a normal browser User-Agent.

## Verified schema — EXPENSES

- One sheet: **`BudgetOnline`**. Two preamble rows; **header row = the row whose first cell is `Year`** (index 2 in 2025, 3 in 2024 — must detect, not hardcode).
- 25 columns, identical across 2024 & 2025 (only the year in the amount headers changes):

```
Year | RefDate | SPF | SPF/FOD FR | SPF/FOD NL | DO | DO FR | DO NL |
PROG | PROG FR | PROG NL | ACT | SEC1 | SEC2 | NO | LIT | DC | Genre | CRIP |
Omschrijving | Lange Omschrijving | Libellé | Libellé Long | YYYY CE/VK | YYYY CL/VeK
```

- **Dimensions**: `SPF` = department/ministry (code), `DO` = division, `PROG` = program, `ACT` = activity. `SEC1`/`SEC2` = ESA economic classification (what kind of spend). FR + NL labels for every level.
- **Amounts** (unit = **thousands of euros, kEUR**):
  - `CE/VK` = Crédit d'engagement / Vastleggingskrediet = **commitment** appropriation.
  - `CL/VeK` = Crédit de liquidation / Vereffeningskrediet = **payment (cash-out)** appropriation → **use this** for "where taxes go".
- 20 distinct `SPF` departments, stable across years (see `taxonomy-map.json`).

## Verified schema — INCOMES (different!)

- Same sheet name, **3** preamble rows (header detect still works).
- 23 cols: `Title / Section / Chapitre` dimensions + `DC/VR`, `RC/KO` amounts.
- ⚠ **Fiscal-revenue rows show 0 in the amount column** — the budget-incomes file does NOT carry usable tax-composition figures. **Use the FPS Finance `federally-collected-tax-revenues.xlsx` for the revenue side**, as the plan already specifies.

## Three gotchas that would have broken the app

### 1. Provisional/partial cycles (the 3× total gap)
2024-INI (€161.37B) and 2024-C2 (€160.43B) agree within 0.6% → cycles of the same year are revisions of the same full budget. But **2025-Cycle-7 = €49.9B** (refDate Dec 2024) — a **provisional-twelfths** partial budget (Belgium's 2025 budget was delayed). Comparing it to a full cycle understates everything 3×.
→ `build.mjs` warns and refuses to treat a year below `minPlausibleTotalKEUR` (90,000,000) as publishable.

### 2. Debt is mostly financing, not cost (the €72B trap)
Dept 51 "Dette publique" = €72.4B gross, but by economic class:
- `91` amortization/rollover = €53.3B (you re-borrow it — **not a tax cost**)
- `81` securities/derivatives/FX = €8.5B (financial operations)
- `21` **interest = €10.06B** (the real cost to taxpayers)

Across the **whole** file, financing operations are huge:

| ESA class (SEC1 1st digit) | Share of gross 2024 |
|---|---|
| 9 — debt amortization / rollover | **33.0%** |
| 8 — financial transactions (loans, securities) | **5.7%** |

→ `build.mjs` **excludes economic classes 8 & 9** (`excludeEconomicClasses` in the map). Interest (class 2) is kept and shown as "Debt interest".

### 3. Federal Health looks tiny — and that's correct
SPF Santé publique (dept 25) = only **€1.11B (1.1%)**. Healthcare is funded through **social security** (INAMI/RIZIV), which sits inside the €33B "Social protection". The UI must annotate this so nobody reads "Belgium spends 1% on health".

## Multi-year verification (2023–2025)

Checked the full series. **The open portal only carries 2023, 2024, 2025** — `fpsbosa-bb-budget-2022` and earlier return 404, and **there is no 2026 dataset yet** (the current-year budget lags). So usable full years for trends = **2023 and 2024 only** (2025 is provisional, see gotcha 1).

**Structure is stable but has two safe-to-anticipate variations:**

| File | Sheet name | Header row idx | Cols | Depts |
|---|---|---|---|---|
| exp_2023_ini | **`Expenses 2023 INI`** | 2 | 25 | 20 |
| exp_2023_cb | `BudgetOnline` | 3 | 25 | 20 |
| exp_2024_ini | `BudgetOnline` | 3 | 25 | 20 |
| exp_2024_c2 | `BudgetOnline` | 3 | 25 | 20 |
| exp_2025_c7 | `BudgetOnline` | 2 | 25 | 20 |

- **All 5 files share ONE column signature** (25 cols identical, year-stripped). **All have exactly the same 20 department codes — zero drift.**
- ⚠ **Sheet name is not fixed** (`BudgetOnline` vs `Expenses 2023 INI`) and **header row index varies (2 or 3)**. `build.mjs` now **scans every sheet for the `Year` header row** — never hardcode the sheet name or index.
- Cycle labels seen: `INI` (initial), numbered (`2`,`6`,`7`), `CB_voted` (Contrôle Budgétaire = budget-control adjustment, a full-year cycle). Anticipate `INI` / `<n>` / `CB[_voted]`.

**Totals trend (net, financing excluded):** 2023 €89.7B → 2024 €98.9B (+10%). Each year's cycles agree (2023 INI €89.7B ≈ CB €89.0B; 2024 INI €98.9B ≈ C2 €97.9B).

**⚠ Reclassification anomaly — year-over-year is not directly comparable.** Two functions swing hard 2023→2024 with *identical department codes*:
- `finance_admin` 6.9% → 13.4%; `economy_work_science` 4.4% → 1.6%.
- Cause located: dept 18 Finances program "Subsistance" **+€6.9B** (€2.0B→€8.9B), while dept 32 Economie subsidies **−€2.4B** ("Subvention organismes externe" €2.08B→€0.01B). Large items (energy-crisis / provisions / subsidies) migrated **between departments** between years.
- **Implication:** a department→function snapshot is honest for a single year, but cross-year function trends can show artificial jumps from reclassification, not real policy change. The app must default to a single latest full year and treat trends as a caveated secondary view (or build a SEC-economic / COFOG crosswalk for stable trends — heavier, post-MVP).

## Honest result (2024, full INI cycle)

- Gross (all lines): **€161.37B**
- Financing excluded (class 8+9): **€62.50B**
- **NET "where taxes go": €98.87B** → **€8,451 / person / year ≈ €23 / person / day** (pop 11.7M, Statbel).

Functional split (12 functions):

| % | €B | Function |
|---:|---:|---|
| 33.6 | 33.19 | Social protection |
| 16.8 | 16.63 | Regions & Communities |
| 13.4 | 13.24 | Finance & Administration |
| 10.2 | 10.12 | Debt interest |
| 5.3 | 5.20 | Security & Interior |
| 5.1 | 5.08 | Defence |
| 4.9 | 4.86 | Foreign Affairs & EU |
| 4.4 | 4.39 | Mobility & Transport |
| 2.7 | 2.69 | Justice |
| 1.6 | 1.63 | Economy, Work & Science |
| 1.1 | 1.11 | Health |
| 0.7 | 0.73 | Democratic Institutions |

Cross-checked against 2024-C2: ≤1% drift per function. Sum validation (children == parent) passes at every level.

## Indirect-tax per-capita (FPS Finance, for the "your contribution" feature)

`federally-collected-tax-revenues.xlsx` (CC0, monthly) — sheets `EN_data_M` (monthly) + `EN_data_cum` (cumulative; Dec row = full year). Cols: 1 direct, 8 indirect, **10 excise duties**, **12 "actual" VAT** (€ million). Recent rows use Excel serial dates, older use `MM/YYYY` strings.

Latest full year **2025**: VAT €38,029.7M → **€3,251/resident**; excise (all duties combined) €11,068.9M → **€946/resident** (pop 11.7M). Excise is NOT split by product in the data → the app's fuel/alcohol/tobacco split is a labelled estimate (~fuel 59% / tobacco 28% / alcohol 14%). These ground the You-screen indirect-tax defaults.

## Remaining editorial calls (for product review)

- Excluding class 8 entirely also drops staff loans + a few capital injections that are arguably policy. Defensible, but document it.
- "Finance & Administration" (€13.2B) includes transfers booked under SPF Finances — could be split further with `DO`/`PROG` if a finer view is wanted.
- `regions_communities` split is by `PROG FR` regex; confirm the regex still matches if program labels change year to year.
