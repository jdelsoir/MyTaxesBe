import xlsx from 'xlsx';
import { readFileSync } from 'fs';
function load(p){const wb=xlsx.read(readFileSync(p),{cellDates:false});const ws=wb.Sheets[wb.SheetNames[0]];const rows=xlsx.utils.sheet_to_json(ws,{header:1,blankrows:false,defval:null});const h=rows.findIndex(r=>r[0]&&String(r[0]).trim()==='Year');return{headers:rows[h].map(x=>x==null?'':String(x).trim()),data:rows.slice(h+1).filter(r=>r[0]!=null&&String(r[0]).match(/^\d{4}$/))};}
const num=v=>{if(v==null||v==='')return 0;const n=Number(String(v).replace(/\s/g,'').replace(',','.'));return isNaN(n)?0:n;};
const ci=(h,re)=>h.findIndex(x=>re.test(x));
const {headers,data}=load('raw/exp_2024_ini.xlsx');
const cS1=ci(headers,/^SEC1$/),cLib=ci(headers,/^Libellé$/),cCL=ci(headers,/CL\/VeK/);
// group by SEC1 first digit (ESA economic class)
const grp={}; const samp={};
for(const r of data){const s1=String(r[cS1]).padStart(2,'0');const d=s1[0];(grp[d]||=0);grp[d]+=num(r[cCL]);(samp[d]||=new Set());if(samp[d].size<3)samp[d].add(`${s1}:${String(r[cLib]).slice(0,30)}`);}
let g=0;Object.values(grp).forEach(v=>g+=v);
console.log('=== ECONOMIC CLASS (SEC1 first digit) — 2024 INI, total CL by class ===');
const names={'0':'?','1':'Operating (wages/goods)','2':'Interest on debt','3':'(misc)','4':'Current transfers/subsidies','5':'Income transfers (households/ROW)','6':'(misc)','7':'Capital/investment','8':'Financial transactions (loans/securities)','9':'Debt amortization/rollover'};
for(const [d,v] of Object.entries(grp).sort()){const pct=(v/g*100).toFixed(1);console.log(`  class ${d} ${String(names[d]||'').padEnd(40)} CL=${Math.round(v).toLocaleString().padStart(13)} (${pct}%)  e.g. ${[...samp[d]].join(' ; ')}`);}
console.log(`  TOTAL = ${Math.round(g).toLocaleString()} kEUR`);
const financing = (grp['8']||0)+(grp['9']||0);
console.log(`\n  Financing ops (class 8+9, exclude from 'where taxes go') = ${Math.round(financing).toLocaleString()} kEUR (${(financing/g*100).toFixed(1)}%)`);
console.log(`  HONEST net-spending base (total - 8 - 9) = ${Math.round(g-financing).toLocaleString()} kEUR  (~EUR ${((g-financing)/1e6).toFixed(1)} billion)`);
