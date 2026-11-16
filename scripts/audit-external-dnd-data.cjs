#!/usr/bin/env node
'use strict';
/** Read-only optional audit of a locally extracted dnd-data-main/data directory.
 *  Intentionally does not import descriptions into Folio, save characters, or fetch online data.
 *  Usage: node scripts/audit-external-dnd-data.cjs /path/to/dnd-data-main/data
 */
const fs=require('node:fs'),path=require('node:path');
const dir=process.argv[2];
if(!dir){console.error('Usage: node scripts/audit-external-dnd-data.cjs <dnd-data-main/data directory>');process.exitCode=2;}
else {
 try{
  const kinds=['classes','species','backgrounds','spells','items','monsters'];
  const report={input:path.resolve(dir),generatedAt:new Date().toISOString(),datasets:{},totalRecords:0,metadataOnly:true,notAuthorizedForRedistribution:true};
  for(const kind of kinds){
   const rows=JSON.parse(fs.readFileSync(path.join(dir,kind+'.json'),'utf8'));
   if(!Array.isArray(rows))throw Error(kind+' must be an array');
   if(rows.some(x=>!x||typeof x.name!=='string'))throw Error(kind+' has records without an option name');
   const incompleteSourceMetadata=rows.filter(x=>typeof x.book!=='string'||!x.book||typeof x.publisher!=='string'||!x.publisher).length;
   const countByBook=book=>rows.filter(r=>r.book===book).length;
   const old=new Set(rows.filter(r=>r.book==="Player's Handbook").map(r=>r.name.toLocaleLowerCase()+'|'+String(r.publisher||'').toLocaleLowerCase()));
   const revised=new Set(rows.filter(r=>r.book==="Player's Handbook (2024)").map(r=>r.name.toLocaleLowerCase()+'|'+String(r.publisher||'').toLocaleLowerCase()));
   const overlap=[...old].filter(key=>revised.has(key)).length;
   report.datasets[kind]={records:rows.length,incompleteSourceMetadata,phb2024:countByBook("Player's Handbook (2024)"),phbLegacy:countByBook("Player's Handbook"),basic2024:countByBook('Free Basic Rules (2024)'),dmg2024:countByBook("Dungeon Master's Guide (2024)"),sameNameAcrossPhbVersions:overlap};
   report.totalRecords+=rows.length;
  }
  console.log(JSON.stringify(report,null,2));
 }catch(e){console.error('External audit failed:',e.message);process.exitCode=1;}
}
