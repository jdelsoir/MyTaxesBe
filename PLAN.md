# Where Do My Taxes Go — Belgium

**Implementation Plan**
Citizen-facing open-budget explorer built on Belgian open data (data.gov.be).

Status: planning · Last updated: 2026-06-20

---

## 0. Decision summary (the shape)

| Decision | Choice | Why |
|---|---|---|
| Architecture | **100% static, no backend, no DB** | XLSX→JSON at build time. CDN serves prebuilt pages. €0, scales infinitely. |
| Framework | **SvelteKit + `adapter-static`** | Smallest JS bundle, fastest, simplest prerender. (Next.js static export = acceptable alt.) |
| Host | **Cloudflare Pages** (free tier) | Unlimited bandwidth/requests; global CDN. |
| Charts | **D3** (treemap/sankey) + **Observable Plot** (bars/lines) | D3 for hierarchy viz; Plot for the rest (less code). |
| Styling | **Tailwind CSS** | Modern look fast, tiny prod CSS. |
| i18n | **Paraglide** (NL/FR/EN) | Compile-time, zero runtime cost, type-safe. |
| Data prep | **Node + SheetJS** ETL script | One toolchain (JS); converts messy XLSX → clean nested JSON. |
| Refresh | **GitHub Action (cron)** → re-run ETL → redeploy | Budget updates yearly, tax monthly. No live fetch. |

**Killer feature:** a salary slider ("Daily Bread"). Enter income → see *your* tax euro split across functions, per day. Validated by OpenSpending's original.

**Central insight:** the authoritative federal data is XLSX-only with no API → **build-time ETL is the entire backend**. That makes the app fully static = free + infinitely scalable.

**ETL is built and verified** against real files (2023–2025) — see `pipeline/ETL_FINDINGS.md`. Working code: `pipeline/build.mjs` + `pipeline/taxonomy-map.json`. Generated output: `static/data/federal-2023.json`, `federal-2024.json`.

---

## 0b. Data-availability reality (verified 2026-06-20)

Drilled the actual FPS BOSA files across years. What's really available shapes the product:

- **Only 3 budget years exist on the open portal: 2023, 2024, 2025.** 2022 and earlier = 404; **no 2026 yet** (current-year budget lags publication). Plan around a thin history.
- **2025 is provisional** (twelfths, €50B vs full €161B) → effectively **two full comparable years (2023, 2024)** today. A new full year appears roughly annually.
- **Schema is stable** (one column signature, fixed 20 departments across all files) BUT the **sheet name and header-row position vary** — the ETL scans all sheets for the `Year` header; never hardcode.
- **Year-over-year is not directly comparable**: large items migrate between departments across years (e.g. €6.9B into Finances, −€2.4B out of Economie, 2023→2024). Single-year snapshots are honest; trend views need a caveat. → **Downgrade the year-over-year feature** (see §6) to a clearly-labelled secondary view, not a headline.

---

## 1. Verified data foundation

All facts below adversarially verified (3-0 vote) via deep-research, 2026-06-20.

| Source | What | Format | License | Use |
|---|---|---|---|---|
| data.gov.be `fpsbosa-bb-budget-2025` | Federal budget, expenses + incomes by cycle | **XLSX only** (no API) | CC0 | Core: where money goes |
| finance.belgium.be `federally-collected-tax-revenues.xlsx` | Federally collected tax, monthly cumulative €M, cash basis | XLSX | CC0 | Where money comes from |
| ODWB Explore API v2.1 (`odwb.be`) | Walloon municipal budgets (Namur etc.), 1,272 datasets | JSON/CSV/XLSX **live API** | CC BY | Phase 2: local level |
| Statbel | Fiscal income 2005-2023, population, CPI | XLSX/TXT | CC BY 4.0 | Per-capita context, salary calc |
| openbudgets.brussels (Paradigm) | Public procurement + subsidies register | data tables | CC BY 4.0 | Phase 3 (different data model) |
| Flanders (`openbudgetten`/Vlaanderen) | **UNVERIFIED** — confirm before use | ? | ? | Defer — verify first |

Portal context: data.gov.be ≈ 30,800 datasets, 4,815 under "Economy & Finance". Federal budget is a recurring yearly series (2023, 2024, 2025 confirmed).

### Important data caveats
- **Format gap is the central engineering risk.** The two most authoritative federal sources (FPS BOSA budget, FPS Finance tax) are **XLSX-only, no API** → mandatory build-time XLSX→JSON ETL.
- **Brussels ≠ line-item.** openbudgets.brussels is a procurement/subsidy *cadastre*, not appropriations-by-function. Cannot be merged with federal/regional line-item budgets without reconciliation; keep as a separate view.
- **Flanders not verified.** The `openbudgetten`/Vlaanderen source was not confirmed (format/license/granularity). Verify before relying on it.
- **Comparables are legacy tech** (2011–2018) and the hosted OpenSpending API has declined. They validate the *pattern* (static JSON, treemap, per-tax-contribution slider, Fiscal Data Package schema) — do **not** adopt them as live dependencies.

---

## 2. Scope — phased product

**MVP (Phase 1) — Federal only.** One authoritative CC0 source, cleanest question: "where does my federal tax euro go?" Ships standalone, useful, no multi-level reconciliation.

**Phase 2 — Add Wallonia municipal** (ODWB API, start with Namur) → proves the multi-level pattern using the only API-backed source.

**Phase 3 — Brussels + Flanders** once their data models / licenses are confirmed.

---

## 3. Architecture (no-backend static)

```
┌─────────────────────────────────────────────────────────────┐
│  BUILD TIME (GitHub Action, cron: yearly + monthly)          │
│                                                              │
│  1. fetch    federal budget XLSX (data.gov.be)               │
│              tax revenue XLSX (finance.belgium.be)           │
│              Statbel population/income XLSX                   │
│  2. parse    SheetJS → raw rows                              │
│  3. map      apply taxonomy-map.json (hand-authored) →       │
│              normalize to functional categories (COFOG-like) │
│  4. emit     /static/data/federal-2025.json  (nested tree)  │
│              /static/data/meta.json (totals, per-capita)    │
│                                                              │
│  5. SvelteKit prerender → fully static HTML/JS/JSON          │
└────────────────────────────┬────────────────────────────────┘
                             │ deploy
                             ▼
              ┌──────────────────────────────┐
              │  Cloudflare Pages CDN (free)  │  ◄── users (no server)
              │  static HTML + JS + JSON      │
              └──────────────────────────────┘
```

No runtime server. No database. The "API" = static JSON files on CDN. Update = re-run pipeline, redeploy.

---

## 4. Data model (Fiscal-Data-Package-inspired nested JSON)

This is the **actual** shape `build.mjs` emits (no longer a sketch):

```jsonc
// static/data/federal-2024.json  (real output, abridged)
{
  "year": 2024,
  "level": "federal",
  "currency": "EUR",
  "amount_basis": "payment appropriations (CL/VeK), financing operations excluded",
  "total_spending": 98872215000,        // NET, in EUR
  "gross_before_exclusions": 161369202000,
  "financing_excluded": 62496987000,    // debt rollover + financial transactions
  "source": "data.gov.be fpsbosa-bb-budget-2024 (CC0)",
  "sheet_used": "BudgetOnline",
  "tree": {
    "id": "root",
    "label": { "nl": "Federale uitgaven", "fr": "Dépenses fédérales", "en": "Federal spending" },
    "amount": 98872215000,
    "children": [
      {
        "id": "social_protection",
        "label": { "nl": "Sociale bescherming", "fr": "Protection sociale", "en": "Social protection" },
        "amount": 33193311000,
        "children": [ { "label": { "nl": "FOD SOCIALE ZEKERHEID", "fr": "SPF SÉCURITÉ SOCIALE" }, "amount": 31173457000 }, /* … */ ]
      }
      // 12 functions total, sorted by amount desc
    ]
  }
}
```

```jsonc
// /static/data/meta.json  — powers per-capita + salary slider
{
  "population": 11700000,        // Statbel
  "avg_income_tax": 0,           // Statbel fiscal income
  "tax_brackets_2025": [ /* BE personal income tax brackets for estimate */ ]
}
```

Single recursive shape drives treemap, sankey, drill-down, and tables uniformly. Borrowed from the OpenSpending **Fiscal Data Package** schema (don't run the platform; reuse the JSON shape).

---

## 5. ETL pipeline — **BUILT & verified**

The federal XLSX (`eBudget-Expenses_Cycle_*.xlsx`) is department/program-coded, not clean COFOG. The working pipeline lives in `pipeline/` and was verified against 2023–2025 files. Full evidence: `pipeline/ETL_FINDINGS.md`.

1. **Download** — XLSX from `bosa.belgium.be/sites/default/files/content/documents/…` (works with a browser User-Agent). URLs differ per year/cycle; pull from the dataset page hrefs.
2. **`pipeline/build.mjs`** — SheetJS load → **scan all sheets for the `Year` header** (sheet name & header row vary) → drop financing economic classes (SEC1 ∈ {8,9}) → map department → function (dept-01 split by program) → nested tree → **validate `sum(children)==parent` at every level**, **fail loud on any unmapped department**, warn on implausibly-low (provisional) totals.
3. **`pipeline/taxonomy-map.json`** — the brain: 20 departments → 12 functions, the economic-class exclusion rule, dept-01 program regex, trilingual labels. Review yearly.
4. **Output** — `static/data/federal-YYYY.json`. Runtime never touches XLSX.

Key verified rules baked in: use **`CL/VeK`** (payment) amounts in **kEUR**; **exclude economic classes 8+9** (financing, ~39% of gross); **reject provisional cycles**. Federal **Health shows 1.1%** only because healthcare runs through social security — annotate in UI.

---

## 6. UI / visualizations

| Screen | Viz | Library |
|---|---|---|
| Landing hero | Animated **treemap** of total budget by function | D3 hierarchy |
| "Your taxes" | **Salary slider** → bar / icon-array of your €/day per function | Plot + custom |
| Flow view | **Sankey**: revenue sources → functions | d3-sankey |
| Drill-down | Click function → department/program children | D3 |
| Per-capita | €/person/year + €/day headline (€8,451 / €23 for 2024) | text + Plot |
| Compare *(secondary, caveated)* | Year-over-year — **label clearly** | Observable Plot |
| Data | Sortable **table** + CSV/JSON download | HTML + Plot |

**Year-over-year is demoted to a secondary, explicitly-caveated view.** Verified reality: only 2 full comparable years exist (2023, 2024; 2025 provisional), and large amounts migrate between departments year to year (§0b), so naive trend lines mislead. Headline the latest single full year; if trend is shown, annotate that swings may be reclassification, not policy.

Design: Tailwind, color-blind-safe categorical palette (a hard requirement), big numbers, plain-language labels, mobile-first. Every chart is a self-contained Svelte component reading the same JSON. **Annotate the Health = 1.1% caveat** wherever Health appears.

---

## 7. Accessibility & i18n — not optional

**European Accessibility Act applies in Belgium (in force June 2025)** → target **WCAG 2.1 AA**:
- Every chart has a **visually-hidden data table** + `aria-label` summary (charts are invisible to screen readers).
- Full keyboard navigation for treemap drill-down.
- Color-blind-safe palette + never color-only encoding (labels/patterns too).
- Contrast ≥ 4.5:1.

**i18n** (Paraglide): NL + FR mandatory (official languages), EN third. Language in URL (`/nl`, `/fr`, `/en`), prerendered per locale. Data labels already trilingual in JSON.

---

## 8. Build plan — phased, detailed

### Phase 0 — Foundations (2-3 days)
1. `npm create svelte@latest`; add `adapter-static`, Tailwind, Paraglide.
2. Cloudflare Pages project + GitHub repo + auto-deploy on push.
3. Routing skeleton `/[lang]/`, layout, language switcher.

### Phase 1 — Data pipeline — ✅ **DONE** (verified against 2023–2025)
4. ✅ Download workflow + real URLs identified.
5. ✅ Schema decoded (SheetJS); robust header/sheet detection.
6. ✅ `taxonomy-map.json` authored (20 depts → 12 functions, econ filter, dept-01 split).
7. ✅ `build.mjs` — nested JSON + validation (sum checks, unmapped-fail-loud, provisional-cycle warning).
8. ✅ Generated `federal-2023.json` + `federal-2024.json`.
   - *Remaining for Phase 1:* `meta.json` (Statbel population + tax brackets for the slider); optional `fetch.mjs` to script the downloads for CI.

### Phase 2 — Core viz (4-6 days)
9. Treemap component (D3) reading `federal-2024.json`.
10. Salary-slider "Daily Bread" + BE income-tax estimate (base €8,451/yr per capita).
11. Drill-down + breadcrumb (function → department/program children).
12. Data table + downloads.

### Phase 3 — Polish (3-4 days)
13. Sankey revenue → spending (revenue side from FPS Finance file, not budget-incomes).
14. Per-capita headline + **caveated** year-over-year (2023↔2024 only; flag reclassification).
15. Accessibility pass (tables, ARIA, keyboard, contrast audit). Add Health=1.1% annotation.
16. NL/FR/EN copy complete.

### Phase 4 — Automate + ship (1-2 days)
17. GitHub Action: cron (yearly budget, monthly tax) → run pipeline → commit → auto-redeploy.
18. SEO/meta, OG cards, About page with source citations + licenses.
19. Launch.

### Phase 5 — Expand
20. Add Wallonia municipal via ODWB API (commune picker). Verify Flanders, then add.

**Total MVP (Phases 0-4): ~3 weeks solo.**

---

## 9. Cost & scaling

- Hosting: **€0** (Cloudflare Pages free, unlimited bandwidth).
- Build: GitHub Actions free tier (few runs/month).
- Domain: ~€10/yr — the only real cost.
- Scaling: static files on CDN → millions of visitors, same cost. No DB, no server to fall over.

---

## 10. Risks & mitigations

| Risk | Status / mitigation |
|---|---|
| Federal XLSX schema changes yearly | **Tested across 2023–2025: stable (1 signature, 20 depts).** Sheet name + header row vary → ETL scans all sheets for `Year`. `build.mjs` fails loud on unmapped depts. |
| Provisional/partial cycle understates totals | **Resolved**: build warns + refuses below ~€90B floor. Use full voted cycles only. |
| Debt shown as gross (€72B) misleads | **Resolved**: exclude economic classes 8+9 (financing); show interest only. |
| Year-over-year distorted by reclassification | **Found** (€6.9B moved into Finances 2023→2024). Year-over-year demoted to caveated secondary view. |
| Thin history (only 2023–2025; 2025 provisional; no 2026 yet) | Plan for 1 new full year/yr; headline latest full year. |
| Multi-level reconciliation (fed vs municipal) | MVP = federal only; don't merge levels until normalized. |
| Brussels ≠ line-item (procurement register) | Keep as separate view, label clearly. |
| Flanders data unverified | Verify `openbudgetten`/Vlaanderen format + license before Phase 5. |
| Salary→tax allocation is an estimate | Show methodology + assumptions; label "approximate"; cite Statbel. |
| "Health = 1.1%" misreads | Annotate: healthcare runs via social security, not the SPF Santé line. |

---

## 11. Open questions

1. ~~Internal schema of federal `eBudget` XLSX~~ — **resolved** (department/program-coded, no COFOG; mapped via `taxonomy-map.json`).
2. `meta.json` inputs: exact Statbel population figure + current BE personal-income-tax brackets for the salary slider.
3. Per-capita allocation assumptions — average household vs income bracket for the slider?
4. Flanders budget open data — format / license / granularity? (gates Phase 5)
5. Want stable cross-year trends? Would need a SEC-economic or COFOG crosswalk (post-MVP) to absorb department reclassifications.

---

## 12. Sources

Verified (3-0 adversarial vote unless noted), deep-research run 2026-06-20:

- data.gov.be — `fpsbosa-bb-budget-2025` (CC0, XLSX-only); `/en/datasets`; `/en/documentation/licenses`
- finance.belgium.be — `federally-collected-tax-revenues.xlsx` (CC0, monthly)
- statbel.fgov.be — `/en/open-data` (CC BY 4.0); fiscal-statistics-income
- odwb.be — Explore API v2.1 (`/api/explore/v2.1/catalog/datasets`); Namur budget datasets
- openbudgets.be.brussels — Paradigm procurement/subsidy register
- github.com/openspending/wheredoesmymoneygo.org — static "Daily Bread" per-tax-contribution pattern
- github.com/goinvo/Visual-Town-Budget — CSV→nested-JSON pipeline + D3 treemap UI
- github.com/openspending/openspending — Fiscal Data Package schema (reuse shape; avoid the microservices stack)
- svelte.dev — `adapter-static`; nextjs.org — i18n docs
