# Phase 2 — "Your taxes by level" — PROGRESS / RESUME

Resume file in case the usage window hits mid-build. Read this + the project memory, then continue from the first unchecked box.

## Goal
On the **You** screen, let a citizen pick their commune → show their total tax split **Federal / Regional / Communal** (Communities shown as *federal-funded*, no own line). Builds on Phase 1 (levels) + the existing personal-tax model.

## Method (decided, honesty-first)
- **Communal tax** = the *aanvullende gemeentebelasting / taxe communale additionnelle* = a **% surcharge on the federal personal income tax due**, set per commune (~0–9%). So: `communalTax = personalIncomeTax × communalPct(commune)`.
- **Regional share of PIT**: since the 6th State Reform regions levy "additionnels" on a *reduced* federal PIT (autonomy factor ≈ **25.99%** of PIT is regionalised). Honest simplification: split the income-tax base into federal (~74%) / regional (~26%) using the autonomy factor — **label as estimate, verify the exact factor**.
- **Indirect taxes** (VAT, fuel, etc.) stay **federal** (they are federally collected).
- **Communities** = no own tax → shown as a note: *funded out of federal money*, NOT a separate slice.
- All clearly **illustrative**; magnitudes scale with the user's inputs.

## Durable artifact (do FIRST)
`web/data/communal-pit.json` = `{ "<commune name>": <additional % number>, ... }` for the 581 communes.
- Source: federal `finance.belgium.be/.../111-municipal-tax-rate-2024.pdf` (identified in research). If PDF parsing is hard, look for a CSV on data.gov.be / Statbel ("aanvullende gemeentebelasting" / "taxe additionnelle communale").
- Also capture region per commune if available (to pick the right regional rule) — else infer region from commune list.

## Checklist
- [x] Fetch communal additional-PIT rate source — DONE (federal PDF, pypdf).
- [x] Parse → `web/data/communal-pit.json` — DONE: **581 communes**, 0–9%, avg 7.46%, Knokke-Heist 0% ✓, Antwerpen 7.0 / Gent 6.5 / Bruxelles 6.0 / Liège 8.0. Assessment year 2024.
- [x] Regional autonomy factor — using **AUTONOMY_FACTOR = 0.25** (6th State Reform ≈ 24.957%/25.99% depending on year) as a labelled ESTIMATE for the federal/regional PIT split. Verify exact value later if precision needed.
- [x] UI: commune picker (datalist of 581) in You screen; persists `commune`.
- [x] Calc: `byLevel()` = {federal, regional, communal}; `renderByLevel()` shows a segmented bar + legend. federal = inc×(1−AF)+indirect; regional = inc×AF; communal = inc×pct%. AF=0.25.
- [x] Honesty: `communities_note` (no own tax, federal-funded, estimate, ~25% regional) under the bar; commune % from verified 2024 dataset.
- [x] Build + Artifact redeploy (same URL e56f4924) — DONE (v22-by-level).
- [x] Validate with a subagent — DONE: SHIP, no blockers (correctness/honesty/a11y/responsive/regressions all PASS).
- [x] Update memory + mark done.

## STATUS: ✅ PHASE 2 COMPLETE, LIVE, VALIDATED (v22-by-level).
Optional future polish (non-blocking): "commune not found" hint for free-text input; refine AUTONOMY_FACTOR to exact year value.

## Guards
- PII (org): do NOT surface individual names from any dataset. Commune *names* are fine (public place names).
- Don't merge levels into a fake total; keep "by level" clearly a split of the user's OWN tax, not a budget.
- Rates are estimates → label.

## Resume command
`node build-artifact.mjs` from `web/` after edits; redeploy the standalone to the same artifact URL. App entry points unchanged (Home → You). Phase 1 levels content is in `web/levels.js`.
