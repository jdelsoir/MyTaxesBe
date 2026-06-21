import xlsx from 'xlsx';
import { readFileSync } from 'fs';

const files = process.argv.slice(2);
for (const f of files) {
  const wb = xlsx.read(readFileSync(f), { cellDates: false });
  console.log('\n############################################');
  console.log('FILE:', f);
  console.log('SHEETS:', wb.SheetNames.join(' | '));
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name];
    const ref = ws['!ref'] || 'EMPTY';
    const range = ref === 'EMPTY' ? null : xlsx.utils.decode_range(ref);
    const ncols = range ? range.e.c - range.s.c + 1 : 0;
    const nrows = range ? range.e.r - range.s.r + 1 : 0;
    console.log(`\n  --- SHEET "${name}"  ref=${ref}  rows=${nrows} cols=${ncols}`);
    // dump first 15 rows as arrays
    const rows = xlsx.utils.sheet_to_json(ws, { header: 1, blankrows: false, defval: null });
    rows.slice(0, 15).forEach((r, i) => {
      const cells = r.map(c => c === null ? '' : String(c)).map(s => s.length > 22 ? s.slice(0,22)+'…' : s);
      console.log(`   r${i}: [${cells.join(' | ')}]`);
    });
    console.log(`   ...(total ${rows.length} non-blank rows)`);
  }
}
