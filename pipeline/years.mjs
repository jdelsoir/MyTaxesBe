import xlsx from 'xlsx';
import { readFileSync } from 'fs';
const MAP = JSON.parse(readFileSync(new URL('./taxonomy-map.json', import.meta.url)));
const SERIAL0 = Date.UTC(1899,11,30);
const sd = s => new Date(SERIAL0+Math.round(s)*86400000).toISOString().slice(0,10);
const num=v=>{if(v==null||v==='')return 0;const n=Number(String(v).replace(/\s/g,'').replace(',','.'));return isNaN(n)?0:n;};
function load(p){const wb=xlsx.read(readFileSync(p),{cellDates:false});const sheet=wb.SheetNames[0];const ws=wb.Sheets[sheet];const rows=xlsx.utils.sheet_to_json(ws,{header:1,blankrows:false,defval:null});const h=rows.findIndex(r=>r[0]&&String(r[0]).trim()==='Year');return{sheet,sheetCount:wb.SheetNames.length,hIdx:h,headers:rows[h].map(x=>x==null?'':String(x).trim()),data:rows.slice(h+1).filter(r=>r[0]!=null&&String(r[0]).match(/^\d{4}$/))};}
const sig = hs => hs.map(h=>h.replace(/\b20\d{2}\b/,'YYYY')).join('|');
const ci=(h,re)=>h.findIndex(x=>re.test(x));

const EXP=['exp_2023_ini.xlsx','exp_2023_cb.xlsx','exp_2024_ini.xlsx','exp_2024_c2.xlsx','exp_2025_c7.xlsx'];
console.log('======== EXPENSES: structural signature per file ========');
const sigs=new Map();
for(const f of EXP){const L=load('raw/'+f);const s=sig(L.headers);
  if(!sigs.has(s))sigs.set(s,[]);sigs.get(s).push(f);
  console.log(`${f.padEnd(20)} sheet="${L.sheet}"(${L.sheetCount}) hdrRow=${L.hIdx} cols=${L.headers.length} refDate=${sd(L.data[0][1])} rows=${L.data.length}`);
}
console.log(`\nDISTINCT header signatures: ${sigs.size}`);
[...sigs.entries()].forEach(([s,fs],i)=>console.log(`  sig#${i+1} <- ${fs.join(', ')}`));

console.log('\n======== EXPENSES: department-code set drift (vs exp_2024_ini) ========');
function depts(f){const L=load('raw/'+f);const c=ci(L.headers,/^SPF$/);return new Set(L.data.map(r=>String(r[c]).padStart(2,'0')));}
const ref=depts('exp_2024_ini.xlsx');
for(const f of EXP){const s=depts(f);const added=[...s].filter(x=>!ref.has(x));const removed=[...ref].filter(x=>!s.has(x));
  console.log(`${f.padEnd(20)} n=${s.size}  added:[${added.join(',')||'-'}]  missing:[${removed.join(',')||'-'}]`);}

console.log('\n======== BUILD across full cycles: totals + unmapped check ========');
const exclude=new Set(MAP.excludeEconomicClasses.classes);
function build(f){const L=load('raw/'+f);const H=L.headers;
  const C={spf:ci(H,/^SPF$/),progFR:ci(H,/^PROG FR$/),sec1:ci(H,/^SEC1$/),cl:ci(H,/CL\/VeK/)};
  let gross=0,net=0;const fn={};const unmapped=new Set();
  for(const r of L.data){const cl=num(r[C.cl]);gross+=cl;if(exclude.has(String(r[C.sec1]).padStart(2,'0')[0]))continue;
    const d=String(r[C.spf]).padStart(2,'0');let f2;const ov=MAP.departmentOverrides[d];
    if(ov){const p=String(r[C.progFR]||'');const hit=ov.byProgram.find(x=>new RegExp(x.match,'i').test(p));f2=hit?hit.fn:ov.default;}else f2=MAP.departments[d];
    if(!f2){unmapped.add(d+' '+r[ci(H,/^SPF\/FOD FR$/)]);continue;}net+=cl;fn[f2]=(fn[f2]||0)+cl;}
  return{gross,net,fn,unmapped};
}
const cols=['exp_2023_ini.xlsx','exp_2023_cb.xlsx','exp_2024_ini.xlsx','exp_2024_c2.xlsx','exp_2025_c7.xlsx'];
const R={};for(const f of cols)R[f]=build(f);
for(const f of cols){const b=R[f];console.log(`${f.padEnd(20)} gross=€${(b.gross/1e6).toFixed(1)}B net=€${(b.net/1e6).toFixed(1)}B unmapped:[${[...b.unmapped].join('; ')||'none'}]`);}

console.log('\n======== FUNCTION % trend (full cycles only) ========');
const full=['exp_2023_ini.xlsx','exp_2023_cb.xlsx','exp_2024_ini.xlsx','exp_2024_c2.xlsx'];
const allFns=Object.keys(MAP.functions);
console.log('function'.padEnd(26)+full.map(f=>f.replace('exp_','').replace('.xlsx','').padStart(11)).join(''));
for(const fnk of allFns){let line=fnk.padEnd(26);for(const f of full){const b=R[f];const pct=(b.fn[fnk]||0)/b.net*100;line+=(pct.toFixed(1)+'%').padStart(11);}console.log(line);}

console.log('\n======== INCOMES schema check (2023 vs 2024) ========');
for(const f of ['inc_2023_ini.xlsx','inc_2024_ini.xlsx']){const L=load('raw/'+f);console.log(`${f}: hdrRow=${L.hIdx} cols=${L.headers.length} sig=${sig(L.headers).slice(0,90)}...`);}
