import xlsx from 'xlsx';import {readFileSync} from 'fs';
const num=v=>{if(v==null||v==='')return 0;const n=Number(String(v).replace(/\s/g,'').replace(',','.'));return isNaN(n)?0:n;};
const wb=xlsx.read(readFileSync('raw/exp_2024_ini.xlsx'));const ws=wb.Sheets[wb.SheetNames[0]];
const rows=xlsx.utils.sheet_to_json(ws,{header:1,blankrows:false,defval:null});const h=rows.findIndex(r=>r[0]&&String(r[0]).trim()==='Year');
const H=rows[h].map(x=>x==null?'':String(x).trim());const d=rows.slice(h+1).filter(r=>r[0]!=null&&String(r[0]).match(/^\d{4}$/));
const ci=re=>H.findIndex(x=>re.test(x));const cS=ci(/^SPF$/),cP=ci(/^PROG FR$/),cL=ci(/^Libellé$/),cS1=ci(/^SEC1$/),cCL=ci(/CL\/VeK/);
// finance_admin = depts 18,06,19; show top lines (excl class 8/9)
const m={};
for(const r of d){const dep=String(r[cS]).padStart(2,'0');if(!['18','06','19'].includes(dep))continue;if(['8','9'].includes(String(r[cS1]).padStart(2,'0')[0]))continue;const k=`${dep}|${r[cP]}|${r[cL]}`;m[k]=(m[k]||0)+num(r[cCL]);}
console.log('finance_admin top lines (net, €M):');
Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([k,v])=>console.log(`  ${(v/1e3).toFixed(0).padStart(6)}  ${k.slice(0,70)}`));
