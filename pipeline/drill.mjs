import xlsx from 'xlsx';
import { readFileSync } from 'fs';
const SERIAL0 = Date.UTC(1899,11,30);
const serialToDate = s => new Date(SERIAL0 + Math.round(s)*86400000).toISOString().slice(0,10);
function load(p){const wb=xlsx.read(readFileSync(p),{cellDates:false});const ws=wb.Sheets[wb.SheetNames[0]];const rows=xlsx.utils.sheet_to_json(ws,{header:1,blankrows:false,defval:null});const h=rows.findIndex(r=>r[0]&&String(r[0]).trim()==='Year');return{headers:rows[h].map(x=>x==null?'':String(x).trim()),data:rows.slice(h+1).filter(r=>r[0]!=null&&String(r[0]).match(/^\d{4}$/))};}
const num=v=>{if(v==null||v==='')return 0;const n=Number(String(v).replace(/\s/g,'').replace(',','.'));return isNaN(n)?0:n;};
const ci=(h,re)=>h.findIndex(x=>re.test(x));

// 1) refdate + totals for all expense files
console.log('=== CYCLE / TOTAL CHECK (expenses) ===');
for(const f of ['raw/exp_2024_ini.xlsx','raw/exp_2024_c2.xlsx','raw/exp_2025_c7.xlsx']){
  const {headers,data}=load(f);
  const cCL=ci(headers,/CL\/VeK/), cRef=1;
  let tot=0; for(const r of data) tot+=num(r[cCL]);
  console.log(`  ${f.padEnd(28)} refDate=${serialToDate(data[0][cRef])}  lines=${data.length}  totalCL=${Math.round(tot).toLocaleString()} kEUR`);
}

// 2) DEBT (dept 51) composition by SEC1 economic code + descriptions
console.log('\n=== DEBT (SPF 51) composition, 2024 INI, by SEC1/SEC2 + FR label ===');
{ const {headers,data}=load('raw/exp_2024_ini.xlsx');
  const cSPF=ci(headers,/^SPF$/),cS1=ci(headers,/^SEC1$/),cS2=ci(headers,/^SEC2$/),cLib=ci(headers,/^Libellé$/),cCL=ci(headers,/CL\/VeK/);
  const debt=data.filter(r=>String(r[cSPF])==='51').sort((a,b)=>num(b[cCL])-num(a[cCL]));
  for(const r of debt) console.log(`  SEC ${r[cS1]}/${r[cS2]} | CL=${Math.round(num(r[cCL])).toLocaleString().padStart(12)} | ${String(r[cLib]).slice(0,55)}`);
}

// 3) DOTATIONS (dept 01) composition 2024 INI by PROG
console.log('\n=== DOTATIONS (SPF 01) by program, 2024 INI ===');
{ const {headers,data}=load('raw/exp_2024_ini.xlsx');
  const cSPF=ci(headers,/^SPF$/),cPF=ci(headers,/PROG.*FR|^PROG FR/),cCL=ci(headers,/CL\/VeK/);
  const cProgFR=ci(headers,/^PROG FR$/);
  const agg={}; for(const r of data.filter(r=>String(r[cSPF])==='01')){const k=String(r[cProgFR]);(agg[k]||={cl:0,n:0});agg[k].cl+=num(r[cCL]);agg[k].n++;}
  for(const [k,v] of Object.entries(agg).sort((a,b)=>b[1].cl-a[1].cl)) console.log(`  CL=${Math.round(v.cl).toLocaleString().padStart(12)} | n=${v.n} | ${k.slice(0,55)}`);
}
