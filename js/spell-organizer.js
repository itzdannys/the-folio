/* Milestone 16 — purely organizational spell collections. Never modifies preparation or resources. */
(function(root){'use strict';
const PURPOSES=['Offense','Defense','Healing','Control','Utility','Exploration','Social','Ritual'];
const DEFAULT=()=>({folders:[],categories:[],assignments:{},sets:[]});
const cleanName=x=>String(x??'').trim().replace(/\s+/g,' ').slice(0,45);
const cleanId=x=>typeof x==='string'&&x.length<=140&&/^[\w.:-]+$/.test(x)&&!['__proto__','constructor','prototype'].includes(x);
const validList=(xs,max)=>Array.isArray(xs)?xs.filter(x=>typeof x==='string'&&x.length<=140).slice(0,max):[];
function normalize(x){
 const base=x&&typeof x==='object'&&!Array.isArray(x)?x:{};
 const items=kind=>(Array.isArray(base[kind])?base[kind]:[]).filter(z=>z&&cleanId(z.id)&&cleanName(z.name)).slice(0,40).map(z=>({id:z.id,name:cleanName(z.name)}));
 const folders=items('folders'),categories=items('categories'),categoryIds=new Set(categories.map(x=>x.id)),folderIds=new Set(folders.map(x=>x.id));
 const assignments={};
 for(const [key,raw] of Object.entries(base.assignments&&typeof base.assignments==='object'&&!Array.isArray(base.assignments)?base.assignments:{}).slice(0,1500)){
  if(!cleanId(key)||!raw||typeof raw!=='object')continue;
  assignments[key]={folder:folderIds.has(raw.folder)?raw.folder:'',purposes:validList(raw.purposes,8).filter(x=>PURPOSES.includes(x)),categories:validList(raw.categories,40).filter(x=>categoryIds.has(x))};
 }
 const sets=(Array.isArray(base.sets)?base.sets:[]).filter(z=>z&&cleanId(z.id)&&cleanName(z.name)&&Array.isArray(z.spells)).slice(0,30).map(z=>({id:z.id,name:cleanName(z.name),spells:[...new Set(validList(z.spells,500))]}));
 return {folders,categories,assignments,sets};
}
function withOrganizer(book,fn){return {...book,organizer:fn(normalize(book.organizer))};}
function createNamed(book,kind,name,id){if(!['folders','categories'].includes(kind))throw Error('Unknown collection type.');const value=cleanName(name);if(!value)throw Error('Enter a name first.');if(!cleanId(id))throw Error('Invalid collection identifier.');return withOrganizer(book,o=>{if(o[kind].length>=40)throw Error('You have reached the collection limit.');if(o[kind].some(x=>x.id===id||x.name.toLowerCase()===value.toLowerCase()))throw Error('A collection with this name already exists.');return {...o,[kind]:[...o[kind],{id,name:value}]};});}
function removeNamed(book,kind,id){if(!['folders','categories'].includes(kind))throw Error('Unknown collection type.');return withOrganizer(book,o=>({...o,[kind]:o[kind].filter(x=>x.id!==id),assignments:Object.fromEntries(Object.entries(o.assignments).map(([spellId,a])=>[spellId,{...a,folder:kind==='folders'&&a.folder===id?'':a.folder,categories:kind==='categories'?a.categories.filter(x=>x!==id):a.categories}]))}));}
function saveAssignment(book,id,folder,purposes,categories){if(!cleanId(id))throw Error('Invalid spell.');return withOrganizer(book,o=>{if(folder&&!o.folders.some(x=>x.id===folder))throw Error('Select an existing folder.');if((purposes||[]).some(x=>!PURPOSES.includes(x)))throw Error('Invalid purpose label.');if((categories||[]).some(x=>!o.categories.some(c=>c.id===x)))throw Error('Invalid custom category.');return {...o,assignments:{...o.assignments,[id]:{folder:folder||'',purposes:[...new Set(purposes||[])],categories:[...new Set(categories||[])]}}};});}
function saveSet(book,name,id,spellIds){const value=cleanName(name);if(!value)throw Error('Name your spell collection.');if(!cleanId(id))throw Error('Invalid collection identifier.');return withOrganizer(book,o=>{if(o.sets.length>=30)throw Error('You have reached the saved collection limit.');if(o.sets.some(x=>x.name.toLowerCase()===value.toLowerCase()))throw Error('A collection with this name already exists.');return {...o,sets:[...o.sets,{id,name:value,spells:[...new Set(validList(spellIds,500))]}]};});}
function removeSet(book,id){return withOrganizer(book,o=>({...o,sets:o.sets.filter(s=>s.id!==id)}));}
const tagMap={
 'Damage/Offense':'Offense','Healing':'Healing','Defense/Protection':'Defense','Buff/Support':'Defense','Debuff':'Control','Control':'Control','Movement':'Exploration','Detection/Information':'Exploration','Social':'Social','Exploration/Utility':'Utility'
};
function purposes(sp,book){const o=normalize(book?.organizer),entry=o.assignments[sp?.id]||{},values=new Set();
 for(const t of sp?.tags||[])if(tagMap[t])values.add(tagMap[t]);else if(PURPOSES.includes(t))values.add(t);
 if(!values.size){
  const all=[sp?.name,sp?.short,sp?.detail].join(' ').toLowerCase();
  if(/damage|attack roll|spell attack|weapon attack|fireball|smite|bolt/.test(all))values.add('Offense');
  if(/heal|regain.*hit point|restore.*hit point|cure/.test(all))values.add('Healing');
  if(/armor class|resistance|shield|protect|temporary hit point/.test(all))values.add('Defense');
  if(/frighten|charm|paraly|restrain|slow|illusion|control|compel/.test(all))values.add('Control');
  if(/teleport|travel|fly|water|search|locate|detect|explor/.test(all))values.add('Exploration');
  if(/conversation|persua|language|communicat|social/.test(all))values.add('Social');
  if(!values.size)values.add('Utility');
 }
 if(sp?.ritual)values.add('Ritual');
 for(const p of entry.purposes||[])values.add(p);
 return [...values].filter(p=>PURPOSES.includes(p));
}
function actionType(sp){return String(sp?.time||sp?.castingTime||'').trim();}
function matches(sp,filter={},castable=false){
 const q=String(filter.query||'').trim().toLowerCase();
 if(q&&![sp.name,sp.short,sp.detail,sp.school,sp.source,(sp.classes||[]).join(' ')].join(' ').toLowerCase().includes(q))return false;
 if(filter.level!==''&&filter.level!=null&&sp.level!==Number(filter.level))return false;
 if(filter.school&&sp.school!==filter.school)return false;
 if(filter.action&&!(actionType(sp).toLowerCase().includes(filter.action.toLowerCase())))return false;
 if(filter.concentration==='yes'&&!sp.concentration||filter.concentration==='no'&&sp.concentration)return false;
 if(filter.ritual==='yes'&&!sp.ritual||filter.ritual==='no'&&sp.ritual)return false;
 if(filter.source&&sp.source!==filter.source)return false;
 if(filter.availability==='castable'&&!castable||filter.availability==='unavailable'&&castable)return false;
 return true;
}
root.FolioSpellOrganizer={PURPOSES,DEFAULT,normalize,createNamed,removeNamed,saveAssignment,saveSet,removeSet,purposes,matches,actionType};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioSpellOrganizer;
})(typeof window!=='undefined'?window:globalThis);
