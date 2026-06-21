# CLAUDE.md — "Where Do My Taxes Go — Belgium"

Single fresh-start brief. A citizen-facing web app showing where Belgian tax money goes, built on data.gov.be open data. **Live artifact:** https://claude.ai/code/artifact/e56f4924-ae08-44a5-9f9b-d13d7480b3e3 (redeploys to the same URL).

> Companion docs: `PLAN.md` (original plan), `pipeline/ETL_FINDINGS.md` (federal data evidence), `REGIONS-INTEGRATION.md` (multi-level plan), `PHASE2-PROGRESS.md` (phase-2 log). This file is the source of truth — if they conflict, trust CLAUDE.md.

## What it is
Multi-screen, hash-routed, **100% static, no-backend** web app. Trilingual NL/FR/EN. Belgian tricolor identity, Lucide icons. Shows the **federal budget** by theme, lets a citizen estimate their **personal contribution** (income + indirect taxes) and see it split **across government levels**, plus a "who does what" explainer for the 4 levels.

## Stack (ACTUAL — note: diverged from the original SvelteKit plan)
- **Vanilla JS, zero runtime dependencies.** Hand-rolled squarified treemap (no D3/framework). Chosen for "cheap + not over-engineered". The `PLAN.md` SvelteKit/Tailwind/Paraglide design was **not** used — a port is a future option, not current reality.
- **Build:** `web/build-artifact.mjs` inlines CSS + JS + icons + content + levels + all data into one self-contained `web/standalone.html` (CSP-safe — the Claude artifact blocks all external requests, so everything is inlined).
- **ETL:** Node + SheetJS (`xlsx@0.18.5` in `pipeline/`), Python `pypdf` for the communal-rate PDF.
- **Host target:** Cloudflare Pages free tier (not yet deployed there; currently lives as the Claude artifact).

## Repo layout (ACTUAL)
```
web/
  index.html              # app shell (appbar, year switcher, lang, tab bar, #view)
  app.js                  # router + all views + i18n (NL/FR/EN) + logic
  app.css                 # tokens (Belgian palette) + all components
  icons.js                # globalThis.ICONS — inlined Lucide SVG paths (ISC)
  content.js              # globalThis.CONTENT — per-category explanations (12 fns)
  levels.js               # globalThis.LEVELS — 4 government-level explainers
  build-artifact.mjs      # inlines everything → standalone.html
  standalone.html         # generated, single-file app = what gets published
  data/federal-{2023,2024,2025}.json   # generated budgets
  data/communal-pit.json  # 581 communes → additional-PIT %
pipeline/
  build.mjs               # federal XLSX → web/data/federal-YYYY.json (validated)
  taxonomy-map.json       # 20 depts → 12 functions + econ filter + dept-01 split
  ETL_FINDINGS.md         # evidence for every data rule below
  *.mjs                   # inspect/analyze/drill diagnostics
  raw/                    # downloaded XLSX/PDF (gitignored)
CLAUDE.md PLAN.md REGIONS-INTEGRATION.md PHASE2-PROGRESS.md executive-summary.html
```

## Build / run commands
```bash
# regenerate federal budgets (full voted cycles only)
node pipeline/build.mjs pipeline/raw/exp_2024_ini.xlsx 2024 web/data
# rebuild the publishable single file, then re-publish to the same artifact URL
cd web && node build-artifact.mjs        # → web/standalone.html → Artifact tool, same URL
```
After editing any `web/*` file: `node build-artifact.mjs`, then publish `standalone.html` via the Artifact tool to the existing URL.

## Architecture
- **Hash router** in `app.js`: `#/` Home · `#/budget` · `#/category/:id` · `#/levels` · `#/level/:id` · `#/compare` · `#/you` · `#/about` · `#/sources`.
- **View Transitions** (feature-detected, reduced-motion safe). SPA a11y: focus to `<h1>` on route change, per-route `document.title`, `aria-current`, `#route-status` live region.
- **Nav = 5 tabs** (Home/Budget/Compare/You/About). Levels reached via a Home card (keep nav ≤5).
- **Data model:** nested tree `{id, label:{nl,fr,en}, amount, children[]}` — drives treemap, table, drilldown uniformly.

## Data sources & verified facts
- **Federal budget** — data.gov.be `fpsbosa-bb-budget-YYYY`, **CC0, XLSX-only, no API**. Only **2023, 2024 = full**; **2025 = provisional** (flagged); no 2026 yet. ~1 new full year/yr.
- **Tax revenue** — finance.belgium.be `federally-collected-tax-revenues.xlsx` (CC0). 2025 per-capita: VAT €3,251, excise €946.
- **Communal PIT rates** — federal `municipal-tax-rate-2024.pdf` → `communal-pit.json` (581 communes, 0–9%, avg 7.46%).
- **Wallonia** — ODWB Opendatasoft Explore API v2.1 (CSV/JSON, CC BY), municipal budgets by function. **Best regional feed** (Phase 3).
- **Brussels** — openbudgets.brussels = procurement/subsidy cadaster only → **functional-budget GAP**.
- **Flanders** — BBC aggregated tables (Excel/PDF); per-commune via separate tool.
- **Communities** — **no own taxes**; funded by federal transfers (Special Financing Act 1989).

### Federal ETL rules (in `build.mjs`, evidence in `ETL_FINDINGS.md`)
- Sheet = scan all sheets for header row (first cell `Year`); name/index vary. Schema stable 2023–2025 (25 cols, 20 depts).
- Use **`CL/VeK`** (payment) amounts, **kEUR**. **Exclude ESA economic classes 8 & 9** (financing/debt-rollover ≈ 39% of gross) — keep interest (class 2). Showing gross debt as "where taxes go" is wrong.
- **Reject provisional cycles** (gross < ~€90B). Dept `01` splits by program (community/region transfers vs democratic institutions). Incomes file unusable for tax composition.
- Validate `sum(children)==parent`; fail loud on unmapped dept.
- **2024 NET = €98.87B = €8,451/person/yr (€23/day).** Federal **Health shows 1.1%** only because curative care runs via social security — annotate.
- Year-over-year is distorted by **reclassification** (e.g. €6.9B moved into Finances 2023→2024) → Compare view is caveated, not a headline.

### Personal-tax model (the "You" screen)
- Income tax: BE 2024 brackets (25/40/45/50%), minus ~€2,540 allowance. Illustrative.
- **Indirect taxes = consumption inputs × rate** (all estimates, labelled): VAT **21%** on everyday spending (rent/energy excluded — upper estimate); insurance **9.25%**; home energy **~8%** of bill (6% VAT + federal levies; distribution is regional); fuel **€0.90/L**; alcohol **35%** of spend; cigarettes **€13 pack × 78%**. VAT default €1,290/mo ≈ real per-capita VAT.
- **By level:** communal = incomeTax × commune% (from `communal-pit.json`); regional = incomeTax × `AUTONOMY_FACTOR` (0.25, estimate); federal = the rest + indirect. Communities shown as a **note** (federal-funded, no slice). "Commune not found" → explains 2024/581-commune scope, 2025 mergers may differ.

## Honesty & org guardrails (NON-NEGOTIABLE)
- **No false claims.** Every estimate is labelled; verified facts stated as fact, approximations marked "~".
- **No PII** (org rule): never surface individual names. Commune/place names OK. ODWB grant datasets name recipients → never display them.
- **Never merge government levels into one fake total budget** — they're not normalized; keep per-level, honestly sourced.
- **Communities = no own tax** → always shown as federal-funded.
- **Brussels functional-budget gap** → state it; don't fabricate.
- Verify tax rates before computing; keep the salary/consumption split clearly "your own tax", not a budget.
- Static only: no backend, no DB, no client-side XLSX parsing.

## Current status — BUILT & LIVE
- **Federal app**: Home (impactful landing + salary hook), Budget (treemap+drill, 12 category cards, table+downloads), Category detail (explanations + dept lines with %), Compare (caveated year-over-year), About, **Data sources** page (`#/sources`, linked from About — `SOURCES` array in app.js, external links). ✅
- **You**: income + 6 consumption-based indirect taxes (with per-item info popovers) + **"your tax by level"** commune split. ✅
- **Phase 1 Levels**: `#/levels` + 4 level detail pages (who taxes/spends what; communities=federal-funded; preventive vs curative health correct). ✅
- **Phase 2 By-level**: 581-commune dataset + picker + federal/regional/communal split + not-found note. ✅ Validated SHIP.
- 3 years (2023/2024 full, 2025 provisional), NL/FR/EN, WCAG-minded, Belgian palette (all 12 category fills pass AA).

## Next proposed phase — Phase 3: regional/communal SPENDING by theme
Opt-in, region-by-region (per `REGIONS-INTEGRATION.md`):
1. **Wallonia first** — ODWB Explore API, municipal budgets *by function* (start Namur). Add a "your commune budget" view for Walloon communes.
2. **Flanders** — regional aggregated BBC; per-commune later (harder).
3. **Brussels** — explainer + honest "functional budget not in open data" note (the gap).
Keep levels as **separate** screens; never a merged total. Normalize toward a shared taxonomy only as data allows.

### Backlog / polish
- Refine `AUTONOMY_FACTOR` to the exact current value (now 0.25 estimate).
- Normalize commune-name casing ("Louvain-La-Neuve" → "la"); map commune→region to label which region.
- CI auto-refresh (GitHub Action: re-run ETL on new budget year → rebuild → redeploy).
- Optional SvelteKit port for a production deploy (only if a real host/i18n routing is needed).
- EN labels for federal department line items (currently fall back to FR).
