import xlsx from 'xlsx'; import { readFileSync } from 'fs';
const wb = xlsx.read(readFileSync('raw/tax-revenues.xlsx'), { cellDates: false });
const ws = wb.Sheets['EN_data_cum'];
const rows = xlsx.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: null });
const POP = 11_700_000;
const num = v => { const n = Number(v); return isNaN(n) ? 0 : n; };
// col1 direct, col8 indirect, col10 excise, col12 VAT ; month col0 "MM/YYYY"
const byYear = {};
for (const r of rows) {
  const m = String(r[0]); const mm = m.match(/^(\d{2})\/(\d{4})$/); if (!mm) continue;
  const [_, mo, yr] = mm;
  if (mo === '12') byYear[yr] = { direct: num(r[1]), indirect: num(r[8]), excise: num(r[10]), vat: num(r[12]) };
}
const years = Object.keys(byYear).sort().slice(-5);
console.log('FULL-YEAR cumulative (€ million) + per-capita (€/resident, pop 11.7M):');
console.log('year | VAT €M | VAT/cap | Excise €M | Excise/cap | Direct €M | Direct/cap | Indirect €M');
for (const y of years) {
  const d = byYear[y];
  const pc = v => Math.round(v * 1e6 / POP);
  console.log(`${y} | ${Math.round(d.vat)} | €${pc(d.vat)} | ${Math.round(d.excise)} | €${pc(d.excise)} | ${Math.round(d.direct)} | €${pc(d.direct)} | ${Math.round(d.indirect)}`);
}
