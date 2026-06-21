import xlsx from 'xlsx'; import { readFileSync } from 'fs';
const wb = xlsx.read(readFileSync('raw/tax-revenues.xlsx'), { cellDates: false });
console.log('SHEETS:', wb.SheetNames.join(' | '));
for (const name of wb.SheetNames.slice(0, 3)) {
  const ws = wb.Sheets[name]; const rows = xlsx.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: null });
  console.log(`\n### SHEET "${name}" rows=${rows.length}`);
  rows.slice(0, 40).forEach((r, i) => { const c = r.map(x => x === null ? '' : String(x)).map(s => s.length > 26 ? s.slice(0,26)+'…' : s); console.log(`r${i}: [${c.join(' | ')}]`); });
}
