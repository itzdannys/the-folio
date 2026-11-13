(function(root){'use strict';
// Rules-model foundation for the offline single-class 2024 / SRD 5.2.1 builder.
// Slot progression derived with permission from Character Keeper's shared/slots.mjs.
const clone=x=>JSON.parse(JSON.stringify(x));
const KINDS=['class','subclass','species','background','feat','spell','weapon','item'];
const ABILITIES=['str','dex','con','int','wis','cha'];
const CLASS_DATA=[
 ['Barbarian',12,['str','con'],'none','str'],['Bard',8,['dex','cha'],'full','cha'],
 ['Cleric',8,['wis','cha'],'full','wis'],['Druid',8,['int','wis'],'full','wis'],
 ['Fighter',10,['str','con'],'none','str'],['Monk',8,['str','dex'],'none','wis'],
 ['Paladin',10,['wis','cha'],'half','cha'],['Ranger',10,['str','dex'],'half','wis'],
 ['Rogue',8,['dex','int'],'none','dex'],['Sorcerer',6,['con','cha'],'full','cha'],
 ['Warlock',8,['wis','cha'],'pact','cha'],['Wizard',6,['int','wis'],'full','int']
];
const classes=CLASS_DATA.map(([name,hitDie,saves,casting,primary])=>({id:'class:'+name.toLowerCase(),kind:'class',name,hitDie,saves,casting,primary,official:true,description:`d${hitDie} Hit Die · ${casting==='none'?'No baseline spell slots':casting==='half'?'Half caster':casting==='pact'?'Pact Magic':'Full caster'}`}));
const SRD_SPECIES=[['Dragonborn',30],['Dwarf',30],['Elf',30],['Gnome',30],['Goliath',35],['Halfling',30],['Human',30],['Orc',30],['Tiefling',30]];
const species=SRD_SPECIES.map(([name,speed])=>({id:'species:'+name.toLowerCase(),kind:'species',name,speed,official:true,description:`Base speed ${speed} ft; species traits selected or recorded manually` }));
const backgrounds=[
 {name:'Acolyte',abilities:['int','wis','cha'],skills:['Insight','Religion'],feat:'Magic Initiate (Cleric)',tool:'Calligrapher’s Supplies'},
 {name:'Criminal',abilities:['dex','con','int'],skills:['Sleight of Hand','Stealth'],feat:'Alert',tool:'Thieves’ Tools'},
 {name:'Sage',abilities:['con','int','wis'],skills:['Arcana','History'],feat:'Magic Initiate (Wizard)',tool:'Calligrapher’s Supplies'},
 {name:'Soldier',abilities:['str','dex','con'],skills:['Athletics','Intimidation'],feat:'Savage Attacker',tool:'Gaming Set (choose)'}
].map(x=>({...x,id:'background:'+x.name.toLowerCase(),kind:'background',official:true,description:`${x.skills.join(' & ')} · ${x.feat}`}));
const feats=['Alert','Skilled','Savage Attacker','Magic Initiate (Cleric)','Magic Initiate (Wizard)','Tough','Fighting Style: Defense','Fighting Style: Two-Weapon Fighting'].map(x=>({id:'feat:'+x.toLowerCase().replace(/[^a-z0-9]+/g,'-'),kind:'feat',name:x,official:true,description:'SRD feat; record selections and any conditional effects separately'}));
const subclassData=['Berserker','College of Lore','Life Domain','Circle of the Land','Champion','Warrior of the Open Hand','Oath of Devotion','Hunter','Thief','Draconic Sorcery','Fiend Patron','Evoker'];
const subclasses=subclassData.map((name,i)=>({id:'subclass:'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),kind:'subclass',name,classId:classes[i].id,official:true,description:'SRD subclass; choices and features may require manual entries'}));
const builtin={class:classes,subclass:subclasses,species,background:backgrounds,feat:feats,spell:[],weapon:[],item:[]};
const fullSlots=[[],[2],[3],[4,2],[4,3],[4,3,2],[4,3,3],[4,3,3,1],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]];
const int=(x,min,max)=>Number.isInteger(x)&&x>=min&&x<=max;
const text=(x,max=100)=>String(x??'').trim().slice(0,max);
const makeId=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'hb-'+Date.now().toString(36)+Math.random().toString(36).slice(2);
function optionList(kind,homebrew=[]){return [...(builtin[kind]||[]),...(homebrew||[]).filter(x=>x.kind===kind)];}
function findOption(kind,id,homebrew=[],snapshots=[]){return optionList(kind,homebrew).find(x=>x.id===id)||(snapshots||[]).find(x=>x.id===id&&x.kind===kind)||null;}
function normalizeHomebrew(raw,previousId=''){
 const kind=text(raw.kind,20),name=text(raw.name,90);if(!KINDS.includes(kind)||!name)throw Error('Choose a valid homebrew category and enter a name.');
 const numeric=(val,min,max,fallback)=>{const n=Number(val);return int(n,min,max)?n:fallback;};
 const option={id:previousId||('hb-'+makeId()),kind,name,official:false,description:text(raw.description,1500),classId:text(raw.classId,120),hitDie:numeric(raw.hitDie,4,20,8),casting:['none','full','half','pact','third'].includes(raw.casting)?raw.casting:'none',primary:ABILITIES.includes(raw.primary)?raw.primary:'cha',speed:numeric(raw.speed,0,120,30),bonusAbility:ABILITIES.includes(raw.bonusAbility)?raw.bonusAbility:'',bonusAmount:numeric(raw.bonusAmount,-5,5,0),acBonus:numeric(raw.acBonus,-5,10,0),speedBonus:numeric(raw.speedBonus,-30,60,0),skills:text(raw.skills,300).split(',').map(s=>s.trim()).filter(Boolean).slice(0,10),abilities:text(raw.abilities,120).toLowerCase().split(',').map(s=>s.trim()).filter(s=>ABILITIES.includes(s)).slice(0,3),feat:text(raw.feat,90),saves:text(raw.saves,300).toLowerCase().split(',').map(s=>s.trim()).filter(s=>ABILITIES.includes(s)).slice(0,6),level:numeric(raw.level,0,9,1),damage:text(raw.damage,80),mastery:text(raw.mastery,60)};
 if(kind==='class'&&option.hitDie%2!==0)throw Error('Hit Die must have an even number of faces.');
 return option;
}
function homebrewAdd(list,raw){if(list.length>=200)throw Error('Homebrew library limit (200) reached.');return [...list,normalizeHomebrew(raw)];}
function homebrewUpdate(list,id,raw){if(!list.some(x=>x.id===id))throw Error('Homebrew option not found.');return list.map(x=>x.id===id?normalizeHomebrew(raw,id):x);}
function homebrewRemove(list,id){return list.filter(x=>x.id!==id);}
function slotsFor(option,level,subclassName=''){
 const casting=option?.casting||'none',n=Math.max(1,Math.min(20,Number(level)||1));let row=[];
 if(casting==='full')row=fullSlots[n];
 else if(casting==='half')row=fullSlots[Math.ceil(n/2)];
 else if(casting==='third')row=n>=3?fullSlots[Math.ceil(n/3)]:[];
 else if(casting==='pact'){const slotLevel=Math.min(5,Math.ceil(n/2)),pool=n===1?1:n<11?2:n<17?3:4;row=Array(slotLevel).fill(0);row[slotLevel-1]=pool;}
 else if(n>=3&&['Eldritch Knight','Arcane Trickster'].includes(subclassName))row=fullSlots[Math.ceil(n/3)];
 return Array.from({length:9},(_,i)=>row?.[i]||0);
}
function baseScores(raw){const out={};for(const k of ABILITIES){const n=Number(raw[k]);if(!int(n,1,30))throw Error('All six ability scores must be between 1 and 30.');out[k]=n;}return out;}
function buildFromInput(raw,homebrew=[],existing){
 const name=text(raw.name,65);if(!name)throw Error('Enter a character name.');
 const level=Number(raw.level);if(!int(level,1,20))throw Error('Choose a level from 1 to 20.');
 const ids={class:raw.classId,species:raw.speciesId,background:raw.backgroundId,subclass:raw.subclassId||'',feat:raw.featId||''};
 const snapshot=[];const chosen={};for(const kind of ['class','species','background','subclass','feat']){
  if(!ids[kind])continue;
  const o=findOption(kind,ids[kind],homebrew,existing?.options);if(!o)throw Error('One selected '+kind+' option is no longer available.');
  if(kind==='subclass'&&o.classId&&o.classId!==ids.class)throw Error('Subclass does not belong to the chosen class.');
  if(kind==='subclass'&&level<3)throw Error('Subclasses are available at level 3 and above in the 2024 single-class builder.');
  chosen[kind]=o;snapshot.push(clone(o));
 }
 if(!chosen.class)throw Error('Choose a class.');
 const scores=baseScores(raw.scores);
 let backgroundPlus=raw.backgroundPlus||'',backgroundOne=raw.backgroundOne||'';
 const permitted=chosen.background?.abilities||[];
 if(permitted.length){if(backgroundPlus&&!permitted.includes(backgroundPlus)||backgroundOne&&!permitted.includes(backgroundOne)||backgroundPlus&&backgroundOne&&backgroundPlus===backgroundOne)throw Error('Background increases must use two different permitted abilities.');}
 else {backgroundPlus='';backgroundOne='';}
 const bonusOptions=[chosen.species,chosen.background,chosen.subclass,chosen.feat].filter(Boolean);
 for(const [k] of Object.entries(scores)){scores[k]+=(k===backgroundPlus?2:0)+(k===backgroundOne?1:0)+bonusOptions.reduce((t,opt)=>t+(opt.bonusAbility===k?(opt.bonusAmount||0):0),0);if(scores[k]>30||scores[k]<1)throw Error('Final '+k.toUpperCase()+' score is outside 1–30.');}
 const constitution=Math.floor((scores.con-10)/2),hitDie=chosen.class.hitDie||8,average=Math.floor(hitDie/2)+1;
 const suggestedHp=Math.max(1,hitDie+constitution)+(level-1)*Math.max(1,average+constitution);
 const manualHp=raw.maxHp===''||raw.maxHp===undefined||raw.maxHp===null?null:Number(raw.maxHp);
 if(manualHp!==null&&!int(manualHp,1,9999))throw Error('Maximum HP must be a whole number between 1 and 9999.');
 const maxHp=manualHp??suggestedHp;
 const knownSkills=[...(chosen.background?.skills||[]),...bonusOptions.flatMap(o=>o.skills||[])];
 const skills=[...new Set(knownSkills)];
 const saves=[...new Set([...(chosen.class.saves||[]),...bonusOptions.flatMap(o=>o.saves||[])])];
 const speed=(chosen.species?.speed??30)+bonusOptions.reduce((v,o)=>v+(o.speedBonus||0),0);
 const acBonus=bonusOptions.reduce((v,o)=>v+(o.acBonus||0),0);
 const spellAbility=chosen.class.primary||'cha';
 return {name,level,ids,options:snapshot,baseScores:baseScores(raw.scores),scores,characterClass:chosen.class.name,species:chosen.species?.name||'Unassigned',background:chosen.background?.name||'Unassigned',subclass:chosen.subclass?.name||'',feat:chosen.feat?.name||(chosen.background?.feat||''),hitDie,maxHp,suggestedHp,speed,acBonus,saves,skills,slotMax:slotsFor(chosen.class,level,chosen.subclass?.name),spellAbility,backgroundPlus,backgroundOne,notes:text(raw.notes,1500)};
}
function applyToState(state,b){
 const s=clone(state),prior=s.character||{},priorBuild=prior.build;
 if(prior.templateKind!=='starter')throw Error('Pip’s original subclass-specific sheet is protected. Duplicate Pip or create a new character for the universal builder.');
 const prevSlots=s.resources.spellSlots||Array(9).fill(0);
 const previousMax=priorBuild?.slotMax||Array(9).fill(0);
 const spellSlots=b.slotMax.map((max,i)=>Math.max(0,Math.min(max,prevSlots[i]===undefined?max:prevSlots[i]+Math.max(0,max-(previousMax[i]||0)))));
 if(!priorBuild)for(let i=0;i<9;i++)spellSlots[i]=b.slotMax[i];
 s.character={...prior,templateKind:'starter',name:b.name,className:b.characterClass,subclass:b.subclass,species:b.species,background:b.background,level:b.level,scores:b.scores,speed:b.speed,profSaves:b.saves,profSkills:[...new Set([...(prior.profSkills||[]),...b.skills])],maxHp:b.maxHp,build:{...b},overrides:{...prior.overrides}};
 // The bonus is an additional automatic AC modifier, not a manual override.
 s.character.build.acBonus=b.acBonus;
 const preserved=(s.character.customFeatures||[]).filter(f=>!f.id?.startsWith('build-option-'));
 const groups={class:'Custom',subclass:'Custom',species:'Species',background:'Background',feat:'Feat'};
 s.character.customFeatures=[...preserved,...b.options.map(o=>({id:'build-option-'+o.kind,name:o.name,group:groups[o.kind]||'Custom',short:(o.description||'Selected '+o.kind).slice(0,300),detail:'Selected through the character builder. Review all complex rules and choices with your sourcebook or GM.',hidden:false}))];
 if(b.feat&&!b.options.some(x=>x.kind==='feat'))s.character.customFeatures.push({id:'build-option-originfeat',name:b.feat,group:'Feat',short:'Origin feat granted by the selected background; record its selections and triggered effects.',detail:'The background grant is recorded, but complex feat mechanics are not automatic.',hidden:false});
 const hpChange=b.maxHp-(s.resources.maxHp||10);s.resources={...s.resources,maxHp:b.maxHp,hp:Math.min(b.maxHp,Math.max(0,(s.resources.hp||0)+hpChange)),hitDice:Math.max(0,Math.min(b.level,(s.resources.hitDice||1)+Math.max(0,b.level-(prior.level||1)))),spellSlots};
 if(root.FolioSpellRules){const gained=Math.max(0,b.level-(prior.level||1));if(gained)s.spellbook=root.FolioSpellRules.applyLevelUpChanges(s.spellbook,gained);s.resources.mysticArcanum=root.FolioSpellRules.mysticArcanumResources({build:b,level:b.level,className:b.characterClass},s.resources.mysticArcanum||{});}
 return s;
}
function advancementMarkers(className,level){const feats=[4,8,12,16,19,...(className==='Fighter'?[6,14]:[]),...(className==='Rogue'?[10]:[])].sort((a,b)=>a-b);return {subclass:level>=3,featMilestones:feats.filter(x=>x<=level),nextFeat:feats.find(x=>x>level)||null,upcoming:feats.filter(x=>x>level).slice(0,3)};}
function normalizeBuild(b){return b&&typeof b==='object'&&Number.isInteger(b.level)&&Array.isArray(b.options)?b:null;}
root.FolioBuilder={KINDS,ABILITIES,classes,species,backgrounds,subclasses,feats,builtin,optionList,findOption,normalizeHomebrew,homebrewAdd,homebrewUpdate,homebrewRemove,slotsFor,buildFromInput,applyToState,advancementMarkers,normalizeBuild,makeId};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioBuilder;
})(typeof window!=='undefined'?window:globalThis);
