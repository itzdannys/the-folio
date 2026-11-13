(function(root){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
const catalog=()=>root.FolioSpellCatalog?.spells||[];
const className=c=>c?.build?.characterClass||String(c?.className||'').replace(/\s+\d+$/,'').trim();
const levelOf=c=>Math.max(1,Math.min(20,Number(c?.level)||1));
const fullCasters=new Set(['Bard','Cleric','Druid','Sorcerer','Wizard','Warlock']);
function spellAccess(c){const cls=className(c),level=levelOf(c),sub=String(c?.subclass||'').trim().toLowerCase();
 if(fullCasters.has(cls))return {lists:cls==='Bard'&&level>=10?['Bard','Cleric','Druid','Wizard']:[cls],maxLevel:Math.min(9,Math.ceil(level/2)),cantrips:true};
 if(['Paladin','Ranger'].includes(cls))return {lists:[cls],maxLevel:Math.min(5,1+Math.floor((level-1)/4)),cantrips:false};
 if(level>=3&&((cls==='Fighter'&&sub==='eldritch knight')||(cls==='Rogue'&&sub==='arcane trickster')))return {lists:['Wizard'],maxLevel:1+Math.floor((level-1)/6),cantrips:true};
 return {lists:[],maxLevel:0,cantrips:false};
}
function availableSpells(c,filters={}){const access=spellAccess(c),q=String(filters.query||'').trim().toLowerCase();return catalog().filter(sp=>access.lists.some(x=>(sp.classes||[]).includes(x))&&sp.level<=access.maxLevel&&(sp.level>0||(access.cantrips&&(className(c)!=='Bard'||sp.classes.includes('Bard'))))&&(filters.level==null||filters.level===''||sp.level===Number(filters.level))&&(!filters.school||sp.school===filters.school)&&(filters.concentration==null||sp.concentration===filters.concentration)&&(filters.ritual==null||sp.ritual===filters.ritual)&&(!q||[sp.name,sp.description,sp.higherLevel,sp.school,(sp.classes||[]).join(' ')].join(' ').toLowerCase().includes(q))).sort((a,b)=>a.level-b.level||a.name.localeCompare(b.name));}
const standard=[4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22],wizard=[4,5,6,7,9,10,11,12,14,15,16,16,17,18,19,21,22,23,24,25],sorcerer=[2,4,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22],half=[2,3,4,5,6,6,7,7,9,9,10,10,11,11,12,12,14,14,15,15],warlock=[2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15],third=[0,0,3,4,4,4,5,6,6,7,8,8,9,10,10,11,11,11,12,13];
function preparationLimits(c){const cls=className(c),idx=levelOf(c)-1,sub=String(c?.subclass||'').trim().toLowerCase(),table={Bard:standard,Cleric:standard,Druid:standard,Wizard:wizard,Sorcerer:sorcerer,Paladin:half,Ranger:half,Warlock:warlock}[cls],base={Bard:2,Cleric:3,Druid:2,Wizard:3,Sorcerer:4,Warlock:2}[cls]||0;
 if(table)return {cantrips:base?base+(levelOf(c)>=4?1:0)+(levelOf(c)>=10?1:0):0,prepared:table[idx],timing:['Cleric','Druid','Wizard'].includes(cls)?'any-long-rest':['Paladin','Ranger'].includes(cls)?'one-long-rest':'one-level-up',label:['Bard','Ranger','Sorcerer','Warlock'].includes(cls)?'Known spells':'Prepared spells'};
 if(levelOf(c)>=3&&((cls==='Fighter'&&sub==='eldritch knight')||(cls==='Rogue'&&sub==='arcane trickster')))return {cantrips:(cls==='Rogue'?3:2)+(levelOf(c)>=10?1:0),prepared:third[idx],timing:'one-level-up',label:'Known spells'};
 return {cantrips:0,prepared:0,timing:'none',label:'Spells'};
}
function selectedIds(book){return [...new Set(book?.catalogSelections||[])];}
function getSpell(key,book={}){const found=catalog().find(s=>s.key===key);if(found)return normalizeSpell(found);return (book.custom||[]).find(s=>s.id===key)||null;}
function normalizeSpell(sp){return {id:sp.key,name:sp.name,level:sp.level,school:sp.school,time:String(sp.castingTime||'Action').replaceAll('-',' '),range:sp.range,duration:(sp.concentration?'Concentration · ':'')+sp.duration,components:sp.components,short:String(sp.description||'').replace(/\s+/g,' ').slice(0,180),detail:sp.description,higherLevel:sp.higherLevel||'',concentration:!!sp.concentration,ritual:!!sp.ritual,classes:sp.classes||[],resolution:'See spell description',origin:'catalog',source:'SRD 5.2.1',raw:sp};}
function selectionSummary(c,book){const cls=className(c),limits=preparationLimits(c),selected=selectedIds(book),counts={cantrips:0,prepared:0,granted:0,arcanum:{6:0,7:0,8:0,9:0}};for(const key of selected){const sp=getSpell(key,book);if(!sp)continue;if(cls==='Warlock'&&sp.level>=6)counts.arcanum[sp.level]=(counts.arcanum[sp.level]||0)+1;else if(sp.level===0)counts.cantrips++;else counts.prepared++;}for(const sp of book.custom||[])if(sp.alwaysPrepared)counts.granted++;const issues=[];if(counts.cantrips>limits.cantrips)issues.push({key:'cantrips',used:counts.cantrips,limit:limits.cantrips});if(counts.prepared>limits.prepared)issues.push({key:'prepared',used:counts.prepared,limit:limits.prepared});for(const lvl of [6,7,8,9]){const max=cls==='Warlock'&&levelOf(c)>=11+(lvl-6)*2?1:0;if(counts.arcanum[lvl]>max)issues.push({key:'arcanum'+lvl,used:counts.arcanum[lvl],limit:max});}return {limits,counts,issues,selected};}
function selectionError(c,book,next){
 if(!Array.isArray(next)||next.some(x=>typeof x!=='string'))return 'Choose valid spell entries.';
 if(new Set(next).size!==next.length)return 'Each spell can be selected only once.';
 const before=selectionSummary(c,book),after=selectionSummary(c,{...book,catalogSelections:next});
 const available=new Set(availableSpells(c).map(x=>x.key));
 const oldSelected=new Set(before.selected);
 for(const key of next){
  if(!available.has(key)&&!oldSelected.has(key))return 'That spell is unavailable for this class or level.';
 }
 for(const issue of after.issues){const old=before.issues.find(x=>x.key===issue.key)?.used||0;if(issue.used>old)return `Selection limit exceeded: ${issue.used} selected, limit ${issue.limit}.`;}
 return '';
}
function swapError(c,book,from,to){
 const selected=selectedIds(book);
 if(!selected.includes(from))return 'Select a spell currently on your list.';
 if(selected.includes(to))return 'That spell is already selected.';
 const old=getSpell(from,book),incoming=getSpell(to,book);
 if(!old||!incoming)return 'Choose valid outgoing and incoming spells.';
 if((old.level===0)!==(incoming.level===0))return 'Replace a cantrip with another cantrip, or a leveled spell with another leveled spell.';
 if(className(c)==='Warlock'&&(old.level>=6)!==(incoming.level>=6))return 'Mystic Arcanum must be replaced with an eligible spell of the same spell level.';
 if(className(c)==='Warlock'&&old.level>=6&&old.level!==incoming.level)return 'A Mystic Arcanum replacement must be of the same spell level.';
 return selectionError(c,book,[...selected.filter(id=>id!==from),to]);
}
function applyPreparedChanges(book){if(book.catalogPending)return {...book,catalogSelections:[...book.catalogPending],catalogPending:null};if(book.catalogQueued?.length){const [swap,...rest]=book.catalogQueued;return {...book,catalogSelections:[...new Set([...(book.catalogSelections||[]).filter(x=>x!==swap.from),swap.to])],catalogQueued:rest};}return book;}
function applyLevelUpChanges(book,count=1){let next={...book,catalogSelections:[...(book.catalogSelections||[])],catalogLevelUpQueued:[...(book.catalogLevelUpQueued||[])]};for(let i=0;i<count&&next.catalogLevelUpQueued.length;i++){const [swap,...rest]=next.catalogLevelUpQueued;next.catalogSelections=[...next.catalogSelections.filter(x=>x!==swap.from),swap.to];next.catalogLevelUpQueued=rest;}return next;}
function castOptions(c,book,resources,key){const sp=getSpell(key,book),selected=selectedIds(book).includes(key)||(book.custom||[]).some(x=>x.id===key&&x.alwaysPrepared)||(c.templateKind!=='starter'&&root.PipSpells?.activeSpells(book).includes(key));if(!sp||!selected)return [];if(sp.origin==='catalog'&&!availableSpells(c).some(x=>x.key===key))return [];if(sp.level===0)return [{key:'cantrip',label:'Cantrip · no slot'}];const out=[];if(sp.ritual)out.push({key:'ritual',label:'Ritual · no slot'});const cls=className(c);if(cls==='Warlock'&&sp.level>=6){const arcanum=resources.mysticArcanum||{};if(arcanum[sp.level]>0)out.push({key:'arcanum'+sp.level,label:`Level ${sp.level} Mystic Arcanum`});return out;}const slots=resources.spellSlots||c.build?.slotMax||[];for(let lvl=sp.level;lvl<=9;lvl++)if(Number(slots[lvl-1]||0)>0)out.push({key:'slot'+lvl,label:`Level ${lvl} slot`});return out;}
function cast(c,book,resources,key,cost){const sp=getSpell(key,book),opt=castOptions(c,book,resources,key).find(x=>x.key===cost);if(!opt)throw Error('That spell cannot be cast with the selected resource.');const next={...resources,spellSlots:[...(resources.spellSlots||c.build?.slotMax||Array(9).fill(0))],mysticArcanum:{...(resources.mysticArcanum||{})}};if(cost.startsWith('slot')){const lvl=Number(cost.slice(4));if(next.spellSlots[lvl-1]<=0)throw Error('No spell slot remains.');next.spellSlots[lvl-1]--;}else if(cost.startsWith('arcanum')){const lvl=Number(cost.slice(7));if(!next.mysticArcanum[lvl])throw Error('Mystic Arcanum is already spent.');next.mysticArcanum[lvl]--;}if(sp.concentration){next.concentration=sp.name;next.lastConcentrationDC=null;}const nextBook={...book,castLog:[...(book.castLog||[]).slice(-39),{id:key,cost,at:new Date().toISOString()}]};return {book:nextBook,resources:next};}
function mysticArcanumMax(c){if(className(c)!=='Warlock')return {};const lvl=levelOf(c),out={};for(const n of [6,7,8,9])if(lvl>=11+(n-6)*2)out[n]=1;return out;}
function mysticArcanumResources(c,previous={}){const max=mysticArcanumMax(c),out={};for(const [k,v] of Object.entries(max))out[k]=Math.min(v,Number.isInteger(previous[k])?previous[k]:v);return out;}
function shortRestResources(c,resources){if(className(c)==='Warlock')return {...resources,spellSlots:[...(c.build?.slotMax||Array(9).fill(0))]};return resources;}
function catalogKeyForName(name){const target=String(name||'').toLowerCase();return catalog().find(s=>s.name.toLowerCase()===target)?.key||null;}
root.FolioSpellRules={catalog,spellAccess,availableSpells,preparationLimits,selectedIds,getSpell,normalizeSpell,selectionSummary,selectionError,swapError,applyPreparedChanges,applyLevelUpChanges,castOptions,cast,shortRestResources,mysticArcanumMax,mysticArcanumResources,catalogKeyForName,className,levelOf};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioSpellRules;
})(typeof window!=='undefined'?window:globalThis);
