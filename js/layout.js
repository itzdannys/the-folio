(function(root){'use strict';
// Stable IDs for the seven major Character Sheet panels. These are layout preferences,
// independent of HP/attacks and excluded from the combat Undo history.
const DEFAULT=[['ability-scores','saving-throws'],['skills','conditions-concentration'],['weapons-attacks','resources','features-traits']];
const IDS=DEFAULT.flat();
const LABELS={'ability-scores':'Ability Scores','saving-throws':'Saving Throws','skills':'Skills','conditions-concentration':'Conditions & Concentration','weapons-attacks':'Weapons & Attacks',resources:'Resources','features-traits':'Features & Traits'};
const copy=()=>DEFAULT.map(col=>col.slice());
function normalize(raw){
 if(!Array.isArray(raw)||raw.length!==3)return copy();
 const seen=new Set(),columns=[[],[],[]];
 raw.forEach((col,index)=>{
  if(!Array.isArray(col))return;
  for(const key of col){if(typeof key==='string'&&IDS.includes(key)&&!seen.has(key)){columns[index].push(key);seen.add(key);}}
 });
 // New panels introduced by a future release appear in their original column.
 DEFAULT.forEach((col,index)=>col.forEach(key=>{if(!seen.has(key)){columns[index].push(key);seen.add(key);}}));
 return columns;
}
function valid(raw){return Array.isArray(raw)&&raw.length===3&&raw.every(col=>Array.isArray(col)&&col.length<=IDS.length&&col.every(x=>typeof x==='string'&&IDS.includes(x)))&&new Set(raw.flat()).size===raw.flat().length;}
function isDefault(raw){return JSON.stringify(normalize(raw))===JSON.stringify(DEFAULT);}
function move(columns,key,toColumn,toIndex){
 const next=normalize(columns);
 if(!IDS.includes(key)||!Number.isInteger(toColumn)||toColumn<0||toColumn>2)return next;
 for(const c of next){const index=c.indexOf(key);if(index!==-1)c.splice(index,1);}
 const col=next[toColumn];col.splice(Math.max(0,Math.min(col.length,Number(toIndex)||0)),0,key);
 return next;
}
function fromDOM(grid){const cols=[...grid.children].filter(x=>x.matches('.sheet-left,.sheet-middle,.sheet-right'));
 return normalize(cols.map(c=>[...c.children].filter(n=>n.classList.contains('folio-panel')).map(n=>n.dataset.layoutId).filter(Boolean)));
}
root.FolioLayout={DEFAULT,IDS,LABELS,defaults:copy,normalize,valid,isDefault,move,fromDOM};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioLayout;
})(typeof window!=='undefined'?window:globalThis);
