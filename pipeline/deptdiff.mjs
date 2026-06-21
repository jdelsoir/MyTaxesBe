import xlsx from 'xlsx';
import { readFileSync } from 'fs';
const num=v=>{if(v==null||v==='')return 0;const n=Number(String(v).replace(/\s/g,'').replace(',','.'));return isNaN(n)?0:n;};
function load(p){const wb=xlsx.read(readFileSync(p),{cellDates:false});const ws=wb.Sheets[wb.SheetNames[0]];const rows=xlsx.utils.sheet_to_json(ws,{header:1,blankrows:false,defval:null});const h=rows.findIndex(r=>r[0]&&String(r[0]).trim()==='Year');return{H:rows[h].map(x=>x==null?'':String(x).trim()),data:rows.slice(h+1).filter(r=>r[0]!=null&&String(r[0]).match(/^\d{4}$/))};}
const ci=(h,re)=>h.findIndex(x=>re.test(x));
function deptTotals(f){const {H,data}=load(f);const cSPF=ci(H,/^SPF$/),cFR=ci(H,/^SPF\/FOD FR$/),cCL=ci(H,/CL\/VeK/);const m={};for(const r of data){const d=String(r[cSPF]).padStart(2,'0');(m[d]||={fr:r[cFR],cl:0});m[d].cl+=num(r[cCL]);}return m;}
const a=deptTotals('raw/exp_2023_ini.xlsx'), b=deptTotals('raw/exp_2024_ini.xlsx');
const keys=[...new Set([...Object.keys(a),...Object.keys(b)])].sort();
console.log('dept | 2023 €B | 2024 €B | Δ€B | name');
const rows=keys.map(k=>({k,fr:(b[k]||a[k]).fr,a:(a[k]?.cl||0)/1e6,b:(b[k]?.cl||0)/1e6})).map(o=>({...o,d:o.b-o.a}));
rows.sort((x,y)=>Math.abs(y.d)-Math.abs(x.d));
for(const o of rows)console.log(`${o.k} | ${o.a.toFixed(2).padStart(8)} | ${o.b.toFixed(2).padStart(8)} | ${(o.d>=0?'+':'')+o.d.toFixed(2)} | ${o.fr}`);

// drill the two suspects: dept 18 (Finances) and dept 32 (Economie) by program FR, 2023 vs 2024
for(const dept of ['18','32']){
  console.log(`\n--- dept ${dept}: top program moves 2023->2024 (gross CL €M) ---`);
  function prog(f){const {H,data}=load(f);const cSPF=ci(H,/^SPF$/),cP=ci(H,/^PROG FR$/),cCL=ci(H,/CL\/VeK/);const m={};for(const r of data){if(String(r[cSPF]).padStart(2,'0')!==dept)continue;const p=String(r[cP]);m[p]=(m[p]||0)+num(r[cCL]);}return m;}
  const pa=prog('raw/exp_2023_ini.xlsx'),pb=prog('raw/exp_2024_ini.xlsx');
  const pk=[...new Set([...Object.keys(pa),...Object.keys(pb)])];
  const pr=pk.map(k=>({k,a:(pa[k]||0)/1e3,b:(pb[k]||0)/1e3,d:((pb[k]||0)-(pa[k]||0))/1e3})).sort((x,y)=>Math.abs(y.d)-Math.abs(x.d)).slice(0,6);
  for(const o of pr)console.log(`  Δ${(o.d>=0?'+':'')+o.d.toFixed(0).padStart(6)}M  (23:${o.a.toFixed(0)} 24:${o.b.toFixed(0)})  ${o.k.slice(0,48)}`);
}
