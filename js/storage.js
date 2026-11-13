(function(root){'use strict';
if(!root.PipInventory && typeof require==='function')root.PipInventory=require('./inventory.js');
if(!root.PipData && typeof require==='function')root.PipData=require('./data.js');
if(!root.PipCore && typeof require==='function')root.PipCore=require('./core.js');
if(!root.PipCharacter && typeof require==='function')root.PipCharacter=require('./character.js');
if(!root.PipJournal && typeof require==='function')root.PipJournal=require('./journal.js');
if(!root.FolioAppearance && typeof require==='function')root.FolioAppearance=require('./appearance.js');
// Retain the same key so milestone-one local saves load automatically.
const KEY='pip-folio:v1';
const clone=(x)=>JSON.parse(JSON.stringify(x));
const defaultBook=()=>root.PipSpells?root.PipSpells.newBook():{prepared:['bless','command','divine-favor','shield-of-faith','aid','prayer-of-healing','lesser-restoration'],queued:[],favorites:[],custom:[],castLog:[],loadouts:[]};
function migrate(x){
 const copy=clone(x);if(![1,2,3,4,5,6].includes(copy.version))throw Error('Unsupported character data version');
 copy.version=6;copy.journal=root.PipJournal.migrate(copy.journal);copy.character=root.PipCharacter.ensureCharacter(copy.character);copy.appearance=root.FolioAppearance.normalize(copy.appearance,copy.character?.templateKind==='starter'?'starter':'pip');copy.customResources=Array.isArray(copy.customResources)?copy.customResources:[];copy.inventory=root.PipInventory.migrate(copy.inventory,copy.character.weapons);copy.spellbook={...defaultBook(),...(copy.spellbook||{})};copy.spellbook.catalogSelections=Array.isArray(copy.spellbook.catalogSelections)?copy.spellbook.catalogSelections:[];copy.spellbook.catalogQueued=Array.isArray(copy.spellbook.catalogQueued)?copy.spellbook.catalogQueued:[];copy.spellbook.catalogLevelUpQueued=Array.isArray(copy.spellbook.catalogLevelUpQueued)?copy.spellbook.catalogLevelUpQueued:[];copy.spellbook.catalogPending=Array.isArray(copy.spellbook.catalogPending)?copy.spellbook.catalogPending:null;if(copy.character.templateKind==='starter'){copy.resources.spellSlots=Array.isArray(copy.resources.spellSlots)?copy.resources.spellSlots:(copy.character.build?.slotMax||Array(9).fill(0));copy.resources.mysticArcanum=copy.resources.mysticArcanum&&typeof copy.resources.mysticArcanum==='object'?copy.resources.mysticArcanum:{};if(root.FolioSpellRules)copy.resources.mysticArcanum=root.FolioSpellRules.mysticArcanumResources(copy.character,copy.resources.mysticArcanum);}
 return copy;
}
function validate(x){
 if(!x||![1,2,3,4,5,6].includes(x.version)||!x.character||!x.resources||!x.encounter||!Array.isArray(x.notes)||!Array.isArray(x.encounter.roster))return false;
 const c=x.character,r=x.resources,e=x.encounter;if(x.appearance!==undefined&&(!x.appearance||typeof x.appearance!=='object'||(x.appearance.backgroundImage&&!root.FolioAppearance.cleanImage(x.appearance.backgroundImage))))return false;
 if(!Number.isInteger(c.level)||!c.scores||!['str','dex','con','int','wis','cha'].every(k=>Number.isFinite(c.scores[k])))return false;
 if(!Array.isArray(c.profSaves)||!Array.isArray(c.profSkills)||!Array.isArray(c.expertise)||!Array.isArray(c.weapons))return false;
 if(!Number.isFinite(r.hp)||!Number.isFinite(r.maxHp)||!Number.isFinite(r.tempHp)||!Array.isArray(r.conditions)||typeof r.concentration!=='string')return false;
 if(!['layOnHands','channelDivinity','slots1','slots2','freeDivineSmite','freeFindSteed','freeHuntersMark','freeMistyStep','hitDice'].every(k=>Number.isFinite(r[k])))return false;
 if(!x.notes.every(n=>typeof n.id==='string'&&typeof n.title==='string'&&typeof n.text==='string'&&Array.isArray(n.links)&&typeof n.pinned==='boolean'))return false;
 if(typeof e.active!=='boolean'||!Number.isInteger(e.round)||!e.roster.every(a=>typeof a.id==='string'&&typeof a.name==='string'&&Number.isFinite(a.initiative)))return false;
 if(x.version>=2){const b=x.spellbook;if(!b||!Array.isArray(b.prepared)||!Array.isArray(b.queued)||!Array.isArray(b.favorites)||!Array.isArray(b.custom)||!Array.isArray(b.castLog))return false;
 if(x.version>=3&&(!Array.isArray(b.loadouts)||!b.loadouts.every(l=>typeof l.id==='string'&&typeof l.name==='string'&&Array.isArray(l.spells))))return false;
 if(!b.prepared.every(id=>typeof id==='string')||!b.queued.every(z=>typeof z.from==='string'&&typeof z.to==='string'))return false;}
 if(x.version>=4&&!root.PipInventory.validate(x.inventory))return false;
 if(x.version>=6&&(!Array.isArray(x.journal)||!x.journal.every(root.PipJournal.validate)||new Set(x.journal.map(e=>e.id)).size!==x.journal.length))return false;
 if(x.version>=5){if(!Array.isArray(x.customResources)||!x.customResources.every(r=>{try{root.PipCharacter.normalizedResource(r,r.id);return typeof r.id==='string';}catch(e){return false;}}))return false;const z=x.character;if(!Array.isArray(z.customFeatures)||!z.featureEdits||!z.overrides||!Array.isArray(z.tools)||!Array.isArray(z.languages))return false;}
 return true;
}
function normalizeStack(item){if(!validate(item.present)||!Array.isArray(item.past))throw Error('Unsupported or incomplete save');const prepared={present:migrate(item.present),past:item.past.filter(validate).map(migrate).slice(-50)};if(!validate(prepared.present))throw Error('Invalid spellbook');return prepared;}
function load(){try{const raw=localStorage.getItem(KEY);if(!raw)return null;const item=normalizeStack(JSON.parse(raw));save(item);return item;}catch(e){root.PipStorageError=e.message;return null;}}
function save(item){try{localStorage.setItem(KEY,JSON.stringify(item));return true;}catch(e){root.PipStorageError=e.message;return false;}}
function bundle(item){return {format:'pip-masquerade-backup',version:6,exportedAt:new Date().toISOString(),present:clone(item.present),past:clone(item.past.slice(-50))};}
function importBackup(text){const x=JSON.parse(text);if(x.format!=='pip-masquerade-backup'||![1,2,3,4,5,6].includes(x.version))throw Error('Not a supported Pip Folio backup');return normalizeStack(x);}
root.PipStorage={KEY,clone,migrate,validate,load,save,bundle,importBackup};
if(typeof module!=='undefined'&&module.exports)module.exports=root.PipStorage;
})(typeof window!=='undefined'?window:globalThis);
