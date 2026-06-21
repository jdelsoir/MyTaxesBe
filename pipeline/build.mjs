// build.mjs — Federal budget XLSX → citizen-friendly nested JSON.
// Usage: node build.mjs <expenses.xlsx> <year> [outDir]
// Verified against FPS BOSA eBudget Expenses files (2024 INI/C2, 2025). CC0 data.
import xlsx from 'xlsx';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';

const [file, yearArg, outDirArg] = process.argv.slice(2);
if (!file || !yearArg) { console.error('usage: node build.mjs <expenses.xlsx> <year> [outDir]'); process.exit(1); }
const YEAR = Number(yearArg);
const OUT_DIR = outDirArg || resolve(dirname(file), '../static/data');
const MAP = JSON.parse(readFileSync(new URL('./taxonomy-map.json', import.meta.url)));

// --- load + detect header ---
// Robust across years: the data sheet is sometimes "BudgetOnline", sometimes
// "Expenses YYYY INI"; preamble rows vary (header at index 2 or 3). So scan
// EVERY sheet for the row whose first cell is exactly "Year" — never trust the
// sheet name or a fixed header index.
const wb = xlsx.read(readFileSync(file), { cellDates: false });
let rows = null, hIdx = -1, usedSheet = null;
for (const name of wb.SheetNames) {
  const r = xlsx.utils.sheet_to_json(wb.Sheets[name], { header: 1, blankrows: false, defval: null });
  const i = r.findIndex(row => row[0] && String(row[0]).trim() === 'Year');
  if (i >= 0) { rows = r; hIdx = i; usedSheet = name; break; }
}
if (hIdx < 0) throw new Error('header row (cell "Year") not found in any sheet — unexpected file layout');
const H = rows[hIdx].map(x => x === null ? '' : String(x).trim());
const data = rows.slice(hIdx + 1).filter(r => r[0] != null && String(r[0]).match(/^\d{4}$/));

const ci = re => { const i = H.findIndex(h => re.test(h)); if (i < 0) throw new Error('column not found: ' + re); return i; };
const C = {
  spf: ci(/^SPF$/), spfFR: ci(/^SPF\/FOD FR$/), spfNL: ci(/^SPF\/FOD NL$/),
  progFR: ci(/^PROG FR$/), progNL: ci(/^PROG NL$/), sec1: ci(/^SEC1$/),
  cl: ci(/CL\/VeK/)
};
const num = v => { if (v == null || v === '') return 0; const n = Number(String(v).replace(/\s/g, '').replace(',', '.')); return isNaN(n) ? 0 : n; };

// --- classify each line into a function ---
const exclude = new Set(MAP.excludeEconomicClasses.classes);
const fnAgg = {};            // fn -> { amount, children: Map(childLabel -> {amount, fr, nl}) }
const unmapped = new Set();
let grossTotal = 0, excludedTotal = 0, netTotal = 0;

for (const r of data) {
  const cl = num(r[C.cl]);
  grossTotal += cl;
  const econClass = String(r[C.sec1]).padStart(2, '0')[0];
  if (exclude.has(econClass)) { excludedTotal += cl; continue; }

  const dept = String(r[C.spf]).padStart(2, '0');
  let fn;
  const ov = MAP.departmentOverrides[dept];
  if (ov) {
    const prog = String(r[C.progFR] || '');
    const hit = ov.byProgram.find(p => new RegExp(p.match, 'i').test(prog));
    fn = hit ? hit.fn : ov.default;
  } else {
    fn = MAP.departments[dept];
  }
  if (!fn) { unmapped.add(`${dept} (${r[C.spfFR]})`); continue; }

  netTotal += cl;
  const node = (fnAgg[fn] ||= { amount: 0, children: new Map() });
  node.amount += cl;
  // child = program for overridden depts, else department
  const childLabel = ov ? String(r[C.progFR] || 'Autres') : String(r[C.spfFR]);
  const childLabelNL = ov ? String(r[C.progNL] || 'Andere') : String(r[C.spfNL]);
  const ch = node.children.get(childLabel) || { amount: 0, fr: childLabel, nl: childLabelNL };
  ch.amount += cl; node.children.set(childLabel, ch);
}

// --- FAIL LOUD on unmapped departments ---
if (unmapped.size) { console.error('UNMAPPED departments — refusing to build:\n  ' + [...unmapped].join('\n  ')); process.exit(2); }

// --- cycle plausibility guard ---
if (grossTotal < MAP.cycleRule.minPlausibleTotalKEUR)
  console.warn(`WARNING: gross total ${Math.round(grossTotal).toLocaleString()} kEUR < plausible floor ${MAP.cycleRule.minPlausibleTotalKEUR.toLocaleString()} — likely a PARTIAL/provisional cycle. Do not publish.`);

// --- build tree (amounts → euros) ---
const k = v => Math.round(v * 1000); // kEUR -> EUR
const tree = {
  id: 'root',
  label: { nl: 'Federale uitgaven', fr: 'Dépenses fédérales', en: 'Federal spending' },
  amount: k(netTotal),
  children: Object.entries(fnAgg)
    .sort((a, b) => b[1].amount - a[1].amount)
    .map(([fn, v]) => ({
      id: fn,
      label: { nl: MAP.functions[fn].nl, fr: MAP.functions[fn].fr, en: MAP.functions[fn].en },
      amount: k(v.amount),
      children: [...v.children.values()]
        .sort((a, b) => b.amount - a.amount)
        .map(c => ({ label: { nl: c.nl, fr: c.fr }, amount: k(c.amount) }))
    }))
};

// --- validate sums ---
const sumChildren = tree.children.reduce((s, c) => s + c.amount, 0);
if (sumChildren !== tree.amount) throw new Error(`sum mismatch: children ${sumChildren} != root ${tree.amount}`);
for (const fnNode of tree.children) {
  const cs = fnNode.children.reduce((s, c) => s + c.amount, 0);
  if (cs !== fnNode.amount) throw new Error(`sum mismatch in ${fnNode.id}: ${cs} != ${fnNode.amount}`);
}

const out = {
  year: YEAR, level: 'federal', currency: 'EUR',
  amount_basis: 'payment appropriations (CL/VeK), financing operations excluded',
  total_spending: tree.amount,
  gross_before_exclusions: k(grossTotal),
  financing_excluded: k(excludedTotal),
  provisional: grossTotal < MAP.cycleRule.minPlausibleTotalKEUR,
  source: `${MAP.source.dataset.replace('YYYY', YEAR)} (CC0)`,
  generated_from: file.split('/').pop(),
  sheet_used: usedSheet,
  tree
};

mkdirSync(OUT_DIR, { recursive: true });
const outPath = resolve(OUT_DIR, `federal-${YEAR}.json`);
writeFileSync(outPath, JSON.stringify(out, null, 2));

// --- report ---
const eur = n => '€' + (n / 1e9).toFixed(2) + 'B';
console.log(`\nOK  ${outPath}`);
console.log(`Gross (all lines):      ${eur(k(grossTotal))}`);
console.log(`Financing excluded:     ${eur(k(excludedTotal))}  (debt rollover + financial transactions)`);
console.log(`NET 'where taxes go':   ${eur(tree.amount)}`);
console.log(`\nFunctional breakdown (${YEAR}):`);
for (const c of tree.children) {
  const pct = (c.amount / tree.amount * 100).toFixed(1);
  console.log(`  ${String(pct).padStart(5)}%  ${eur(c.amount).padStart(9)}  ${c.label.en}`);
}
