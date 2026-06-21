import xlsx from 'xlsx';
import { readFileSync } from 'fs';

function load(path){
  const wb = xlsx.read(readFileSync(path), {cellDates:false});
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, {header:1, blankrows:false, defval:null});
  const hIdx = rows.findIndex(r => r[0] && String(r[0]).trim()==='Year');
  const headers = rows[hIdx].map(h => h===null?'':String(h).trim());
  const data = rows.slice(hIdx+1).filter(r => r[0]!==null && String(r[0]).match(/^\d{4}$/));
  return {headers, data, hIdx};
}
function col(headers, re){ return headers.findIndex(h => re.test(h)); }
function num(v){ if(v===null||v==='')return 0; const n=Number(String(v).replace(/\s/g,'').replace(',','.')); return isNaN(n)?0:n; }

for(const f of process.argv.slice(2)){
  const {headers, data, hIdx} = load(f);
  console.log('\n=================================================');
  console.log('FILE:', f, ' headerRow(0idx)=', hIdx, ' dataRows=', data.length);
  console.log('HEADERS:', headers.map((h,i)=>`${i}:${h}`).join(' | '));

  const isExp = col(headers,/^SPF$/)>=0;
  if(isExp){
    const cSPF=col(headers,/^SPF$/), cFR=col(headers,/SPF.*FR/), cNL=col(headers,/SPF.*NL/);
    const cCE=col(headers,/CE\/VK/), cCL=col(headers,/CL\/VeK/);
    console.log(`amount cols -> CE/VK idx=${cCE} ("${headers[cCE]}"), CL/VeK idx=${cCL} ("${headers[cCL]}")`);
    const agg={}; let gCE=0,gCL=0,bad=0;
    for(const r of data){
      const k=String(r[cSPF]);
      const ce=num(r[cCE]), cl=num(r[cCL]);
      if(r[cCL]!==null && isNaN(Number(String(r[cCL]).replace(',','.')))) bad++;
      gCE+=ce; gCL+=cl;
      (agg[k] ||= {fr:r[cFR], nl:r[cNL], ce:0, cl:0, n:0});
      agg[k].ce+=ce; agg[k].cl+=cl; agg[k].n++;
    }
    const list=Object.entries(agg).sort((a,b)=>b[1].cl-a[1].cl);
    console.log(`DISTINCT SPF departments: ${list.length}   non-numeric CL cells: ${bad}`);
    console.log(`GRAND TOTAL  CE/VK=${gCE.toLocaleString()}   CL/VeK=${gCL.toLocaleString()}  (unit?)`);
    console.log('--- by department (code | CL sum | n lines | FR | NL) ---');
    for(const [k,v] of list) console.log(`  ${k.padStart(2)} | CL=${Math.round(v.cl).toLocaleString().padStart(13)} | n=${String(v.n).padStart(4)} | ${String(v.fr).slice(0,32).padEnd(32)} | ${String(v.nl).slice(0,28)}`);
  } else {
    const cSecFR=col(headers,/Section_FR/), cTitFR=col(headers,/Title_FR/);
    const cDC=col(headers,/DC\/VR/), cRC=col(headers,/RC\/KO/);
    console.log(`amount cols -> DC/VR idx=${cDC} ("${headers[cDC]}"), RC/KO idx=${cRC} ("${headers[cRC]}")`);
    const agg={}; let gDC=0,gRC=0;
    for(const r of data){
      const k=`${r[cTitFR]} > ${r[cSecFR]}`;
      gDC+=num(r[cDC]); gRC+=num(r[cRC]);
      (agg[k] ||= {dc:0,rc:0,n:0}); agg[k].dc+=num(r[cDC]); agg[k].rc+=num(r[cRC]); agg[k].n++;
    }
    console.log(`GRAND TOTAL  DC/VR=${gDC.toLocaleString()}   RC/KO=${gRC.toLocaleString()}`);
    console.log('--- by Title > Section (DC sum | n) ---');
    for(const [k,v] of Object.entries(agg).sort((a,b)=>b[1].dc-a[1].dc)) console.log(`  DC=${Math.round(v.dc).toLocaleString().padStart(13)} | n=${String(v.n).padStart(4)} | ${k}`);
  }
}
