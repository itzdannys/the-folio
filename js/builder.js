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
const Species=root.FolioSpecies||(typeof require==='function'?require('./species-catalog.js'):null);
const species=Species.records;
// New metadata module; Node tests can load the builder standalone.
const Origins=root.FolioOrigins||(typeof require==='function'?require('./origin-catalog.js'):null);
const backgrounds=Origins.backgrounds;
const feats=Origins.feats;
const subclassData=['Berserker','College of Lore','Life Domain','Circle of the Land','Champion','Warrior of the Open Hand','Oath of Devotion','Hunter','Thief','Draconic Sorcery','Fiend Patron','Evoker'];
const subclasses=[...subclassData.map((name,i)=>({id:'subclass:'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),kind:'subclass',name,classId:classes[i].id,official:true,sourceId:'srd-2024',description:'PHB 24 subclass; dedicated character-sheet features and optional effects'})),...['Aberrant Sorcery','Clockwork Sorcery','Wild Magic Sorcery'].map(name=>({id:'subclass:'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),kind:'subclass',name,classId:'class:sorcerer',official:true,sourceId:'phb-2024',description:'2024 PHB Sorcerer subclass; local character-sheet mechanics'})),...['Abjurer','Diviner','Illusionist'].map(name=>({id:'subclass:'+name.toLowerCase(),kind:'subclass',name,classId:'class:wizard',official:true,sourceId:'phb-2024',description:'2024 PHB Wizard school, spellbook and class features'})),...['Archfey Patron','Celestial Patron','Great Old One Patron'].map(name=>({id:'subclass:'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),kind:'subclass',name,classId:'class:warlock',official:true,sourceId:'phb-2024',description:'2024 PHB Warlock patron; local character sheet functionality'})),...['Circle of the Moon','Circle of the Sea','Circle of the Stars'].map(name=>({id:'subclass:'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),kind:'subclass',name,classId:'class:druid',official:true,sourceId:'phb-2024',description:'2024 Player’s Handbook Druid circle; local character-sheet mechanics'})),...['College of Dance','College of Glamour','College of Valor'].map(name=>({id:'subclass:'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),kind:'subclass',name,classId:'class:bard',official:true,sourceId:'phb-2024',description:'2024 Player’s Handbook Bard college; local character-sheet mechanics'})),...['Path of the Wild Heart','Path of the World Tree','Path of the Zealot'].map(name=>({id:'subclass:'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),kind:'subclass',name,classId:'class:barbarian',official:true,sourceId:'phb-2024',description:'2024 Player’s Handbook Barbarian path; character-sheet mechanics tracked locally'})),...['Battle Master','Eldritch Knight','Psi Warrior'].map(name=>({id:'subclass:'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),kind:'subclass',name,classId:'class:fighter',official:true,sourceId:'phb-2024',description:'2024 PHB Fighter subclass; mechanics tracked within the character sheet'})),...['Warrior of Mercy','Warrior of Shadow','Warrior of the Elements'].map(name=>({id:'subclass:'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),kind:'subclass',name,classId:'class:monk',official:true,sourceId:'phb-2024',description:'2024 PHB Monk subclass; local character-sheet mechanics'})),...['Arcane Trickster','Assassin','Soulknife'].map(name=>({id:'subclass:'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),kind:'subclass',name,classId:'class:rogue',official:true,sourceId:'phb-2024',description:'2024 PHB Rogue subclass; local character-sheet mechanics'})),...['Light Domain','Trickery Domain','War Domain'].map(name=>({id:'subclass:'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),kind:'subclass',name,classId:'class:cleric',official:true,sourceId:'phb-2024',description:'2024 PHB Cleric domain; character-sheet mechanics and confirmed creature effects'})),...['Beast Master','Fey Wanderer','Gloom Stalker'].map(name=>({id:'subclass:'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),kind:'subclass',name,classId:'class:ranger',official:true,sourceId:'phb-2024',description:'2024 PHB Ranger subclass; local character-sheet mechanics and confirmed creature effects'})),...['Oath of Glory','Oath of the Ancients','Oath of Vengeance'].map(name=>({id:'subclass:'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-'),kind:'subclass',name,classId:'class:paladin',official:true,sourceId:'phb-2024',description:'2024 Player’s Handbook Paladin oath; audited mechanics implemented progressively. Some effects are manually resolved.'}))];
const builtin={class:classes,subclass:subclasses,species,background:backgrounds,feat:feats,spell:[],weapon:[],item:[]};
const fullSlots=[[],[2],[3],[4,2],[4,3],[4,3,2],[4,3,3],[4,3,3,1],[4,3,3,2],[4,3,3,3,1],[4,3,3,3,2],[4,3,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,3,1,1,1,1],[4,3,3,3,3,2,1,1,1],[4,3,3,3,3,2,2,1,1]];
// 2024 SRD class feat/ASI awards: the normal levels, plus Fighter 6/14 and
// Rogue 10. These are earned CHARACTER choices, not the separate manual
// "extra feat" selector. Unknown/homebrew classes are never assigned core
// class awards by guesswork.
const CORE_CLASS_NAMES=new Set(CLASS_DATA.map(x=>x[0]));
function featMilestones(className,characterLevel){
 if(!CORE_CLASS_NAMES.has(className))return [];
 const levels=[4,8,12,16,19];
 if(className==='Fighter')levels.push(6,14);
 if(className==='Rogue')levels.push(10);
 return levels.filter(n=>n<=characterLevel).sort((a,b)=>a-b);
}
function normaliseAdvancements(raw,old,characterClass,characterLevel,homebrew,sourcePacks,backgroundFeat,extraFeat,startingScores,styleName='',subclass=''){
 const prev=old?.characterClass===characterClass&&old?.advancementChoices&&typeof old.advancementChoices==='object'?old.advancementChoices:{};
 const entries=raw===undefined?prev:{...prev,...raw};
 if(!entries||typeof entries!=='object'||Array.isArray(entries))throw Error('Invalid level advancement selections.');
 const clean={};const scores={...startingScores};const encountered=new Set([backgroundFeat,extraFeat,styleName].filter(Boolean));const earnedNames=[];
 const milestones=featMilestones(characterClass,characterLevel);
 for(const n of milestones){
  const choice=entries[String(n)];if(!choice||choice.type==='none')continue;
  if(!choice||typeof choice!=='object'||Array.isArray(choice))throw Error('Invalid advancement at level '+n+'.');
  if(choice.type==='asi'){
   const first=choice.first,second=choice.second;
   if(!ABILITIES.includes(first)||!ABILITIES.includes(second))throw Error('Choose two ability increases at level '+n+'.');
   const delta={};delta[first]=(delta[first]||0)+1;delta[second]=(delta[second]||0)+1;
   for(const [key,bonus] of Object.entries(delta))if(scores[key]+bonus>20)throw Error('Level '+n+' ASI cannot raise '+key.toUpperCase()+' above 20.');
   for(const [key,bonus] of Object.entries(delta))scores[key]+=bonus;
   clean[n]={type:'asi',first,second};
  }else if(choice.type==='feat'){
   const featId=String(choice.featId||'');
   const feat=findOption('feat',featId,homebrew,old?.options,sourcePacks);
   if(!feat)throw Error('Choose a valid feat at level '+n+'.');
   if(feat.requires==='RangerOnly')throw Error('Druidic Warrior is selected as a Ranger Fighting Style, not a feat.');
   if(feat.requires==='PaladinOnly')throw Error('Blessed Warrior is a Paladin class choice, not a feat. Select it as your Fighting Style.');
   if(feat.name==='Ability Score Improvement')throw Error('Use the Ability Score Improvement controls for level '+n+'.');
   const problem=Origins.validateFeat(feat,{level:n,characterClass,scores,subclass,granted:earnedNames});if(problem)throw Error('Level '+n+': '+problem);
   if(feat.minLevel&&n<feat.minLevel)throw Error('Level '+n+': '+feat.name+' is not yet available.');
   if(encountered.has(feat.name)&&!feat.repeatable)throw Error(feat.name+' cannot be granted more than once.');
   const ability=String(choice.ability||'').toLowerCase();
   if(ability){
    if(!feat.abilityChoices?.includes(ability))throw Error('Level '+n+': choose a permitted ability increase for '+feat.name+'.');
    const cap=feat.category==='Epic Boon'?30:20;
    if(scores[ability]+1>cap)throw Error('Level '+n+': '+feat.name+' cannot raise '+ability.toUpperCase()+' above '+cap+'.');
    scores[ability]++;
   }
   encountered.add(feat.name);earnedNames.push(feat.name);clean[n]={type:'feat',featId,featName:feat.name,...(ability?{ability}:{})};
  }else throw Error('Invalid advancement selection at level '+n+'.');
 }
 // Choices earned at a higher level remain stored when leveling down, but
 // cannot affect current stats or feat grants until that level is regained.
 for(const [n,choice] of Object.entries(entries))if(/^\d+$/.test(n)&&Number(n)>characterLevel&&Number(n)<=20&&choice&&typeof choice==='object')clean[n]={...choice};
 return {choices:clean,scores,earned:milestones,unresolved:milestones.filter(n=>!clean[n])};
}
function fightingStyleLevel(className){return className==='Fighter'?1:['Paladin','Ranger'].includes(className)?2:null;}
function grantedFeatNames(build){
 const names=[build?.backgroundFeat,build?.ids?.feat?build.feat:null];
 for(const [level,choice] of Object.entries(build?.advancementChoices||{}))if(Number(level)<=build.level&&choice?.type==='feat')names.push(choice.featName);
 return [...new Set(names.filter(Boolean))];
}
const int=(x,min,max)=>Number.isInteger(x)&&x>=min&&x<=max;
const text=(x,max=100)=>String(x??'').trim().slice(0,max);
const makeId=()=>typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():'hb-'+Date.now().toString(36)+Math.random().toString(36).slice(2);
function packOption(pack,entry){return {id:`source:${pack.id}:${entry.category}:${entry.id}`,kind:entry.category,name:entry.name,official:false,sourceId:pack.id,
  sourceName:pack.name,implementation:'user-entered',description:entry.description||'',details:entry.description||'',
  abilities:entry.category==='background'?entry.abilities||[]:[],skills:entry.category==='background'?entry.skills||[]:[],tool:entry.category==='background'?entry.tool||'':'',feat:entry.category==='background'?entry.feat||'':'',
  category:entry.category==='feat'?entry.featCategory||'':undefined,minLevel:entry.category==='feat'?entry.minLevel||1:undefined,
  speed:entry.category==='species'?(Number.isInteger(entry.speed)?entry.speed:null):undefined,
  sizes:entry.category==='species'?(entry.sizes||[]):undefined,
  creatureType:entry.category==='species'?(entry.creatureType||'See source'):undefined,
  traits:entry.category==='species'?(entry.traits||[]).map(n=>({name:n,summary:'User-entered feature; consult your saved source notes for the effect.'})):undefined};}
function optionList(kind,homebrew=[],sourcePacks=[]){const imported=['background','feat','species'].includes(kind)?(sourcePacks||[]).flatMap(p=>(p.entries||[]).filter(x=>x.category===kind).map(x=>packOption(p,x))):[];
 return [...(builtin[kind]||[]),...(homebrew||[]).filter(x=>x.kind===kind),...imported];}
function findOption(kind,id,homebrew=[],snapshots=[],sourcePacks=[]){return optionList(kind,homebrew,sourcePacks).find(x=>x.id===id)||(snapshots||[]).find(x=>x.id===id&&x.kind===kind)||null;}
function normalizeHomebrew(raw,previousId=''){
 const kind=text(raw.kind,20),name=text(raw.name,90);if(!KINDS.includes(kind)||!name)throw Error('Choose a valid homebrew category and enter a name.');
 const numeric=(val,min,max,fallback)=>{const n=Number(val);return int(n,min,max)?n:fallback;};
 const option={id:previousId||('hb-'+makeId()),kind,name,official:false,description:text(raw.description,1500),classId:text(raw.classId,120),hitDie:numeric(raw.hitDie,4,20,8),casting:['none','full','half','pact','third'].includes(raw.casting)?raw.casting:'none',primary:ABILITIES.includes(raw.primary)?raw.primary:'cha',speed:numeric(raw.speed,0,120,30),bonusAbility:ABILITIES.includes(raw.bonusAbility)?raw.bonusAbility:'',bonusAmount:numeric(raw.bonusAmount,-5,5,0),acBonus:numeric(raw.acBonus,-5,10,0),speedBonus:numeric(raw.speedBonus,-30,60,0),skills:text(raw.skills,300).split(',').map(s=>s.trim()).filter(Boolean).slice(0,10),traits:text(raw.traits,600).split(',').map(s=>s.trim()).filter(Boolean).slice(0,12).map(name=>({name,summary:'User-entered trait; see custom species notes for the effect.'})),sizes:kind==='species'?(raw.sizes==='Small, Medium'?['Small','Medium']:raw.sizes==='Small'?['Small']:raw.sizes==='Medium'?['Medium']:[]):[],creatureType:text(raw.creatureType,60)||'See source',abilities:text(raw.abilities,120).toLowerCase().split(',').map(s=>s.trim()).filter(s=>ABILITIES.includes(s)).slice(0,3),feat:text(raw.feat,90),saves:text(raw.saves,300).toLowerCase().split(',').map(s=>s.trim()).filter(s=>ABILITIES.includes(s)).slice(0,6),level:numeric(raw.level,0,9,1),damage:text(raw.damage,80),mastery:text(raw.mastery,60)};
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
function buildFromInput(raw,homebrew=[],existing,sourcePacks=[]){
 const name=text(raw.name,65);if(!name)throw Error('Enter a character name.');
 const level=Number(raw.level);if(!int(level,1,20))throw Error('Choose a level from 1 to 20.');
 const ids={class:raw.classId,species:raw.speciesId,background:raw.backgroundId,subclass:raw.subclassId||'',feat:raw.featId||''};
 const snapshot=[];const chosen={};for(const kind of ['class','species','background','subclass','feat']){
  if(!ids[kind])continue;
  const o=findOption(kind,ids[kind],homebrew,existing?.options,sourcePacks);if(!o)throw Error('One selected '+kind+' option is no longer available.');
  if(kind==='subclass'&&o.classId&&o.classId!==ids.class)throw Error('Subclass does not belong to the chosen class.');
  if(kind==='subclass'&&level<3)throw Error('Subclasses are available at level 3 and above in the 2024 single-class builder.');
  chosen[kind]=o;snapshot.push(clone(o));
 }
 if(!chosen.class)throw Error('Choose a class.');
 const styleUnlock=fightingStyleLevel(chosen.class.name);
 const styleId=raw.fightingStyleId===undefined&&existing?.characterClass===chosen.class.name?(existing.fightingStyleId||''):String(raw.fightingStyleId||'');
 const fightingStyle=styleId?findOption('feat',styleId,homebrew,existing?.options,sourcePacks):null;
 if(styleId&&(!fightingStyle||fightingStyle.category!=='Fighting Style'||(fightingStyle.requires==='PaladinOnly'&&chosen.class.name!=='Paladin'||fightingStyle.requires==='RangerOnly'&&chosen.class.name!=='Ranger')||!styleUnlock||level<styleUnlock))throw Error('This class and level cannot select that Fighting Style.');
 if(fightingStyle&&!snapshot.some(x=>x.id===fightingStyle.id))snapshot.push(clone(fightingStyle));
 // SRD 5.2.1 p.49: Champion Fighter gains a SECOND Fighting Style at level 7.
 // Keep a selected style when leveling down, but apply it only while eligible.
 const championStyleEligible=chosen.class.name==='Fighter'&&chosen.subclass?.name==='Champion'&&level>=7;
 const championStyleId=raw.championStyleId===undefined&&existing?.characterClass===chosen.class.name?(existing.championStyleId||''):String(raw.championStyleId||'');
 const championStyleOption=championStyleId?findOption('feat',championStyleId,homebrew,existing?.options,sourcePacks):null;
 if(championStyleId&&(!championStyleOption||(championStyleOption.category!=='Fighting Style'||['PaladinOnly','RangerOnly'].includes(championStyleOption.requires))))throw Error('Champion extra Fighting Style must be a Fighting Style feat.');
 if(championStyleEligible&&championStyleId&&championStyleId===styleId)throw Error('Choose a different Fighting Style for Champion level 7.');
 const activeChampionStyle=championStyleEligible?championStyleOption:null;
 if(championStyleOption&&!snapshot.some(x=>x.id===championStyleOption.id))snapshot.push(clone(championStyleOption));
 const scores=baseScores(raw.scores);
 const backgroundMethod=raw.backgroundMethod==='triple'?'triple':'split';
 let backgroundPlus=raw.backgroundPlus||'',backgroundOne=raw.backgroundOne||'';
 const permitted=chosen.background?.abilities||[];
 if(backgroundMethod==='triple'){backgroundPlus='';backgroundOne='';}
 else if(permitted.length){if(backgroundPlus&&!permitted.includes(backgroundPlus)||backgroundOne&&!permitted.includes(backgroundOne)||backgroundPlus&&backgroundOne&&backgroundPlus===backgroundOne)throw Error('Background increases must use two different permitted abilities.');}
 else {backgroundPlus='';backgroundOne='';}
 const toolSpec=chosen.background?.tool||'';
 const needsToolChoice=/\(choose\)|Choose one/i.test(toolSpec);
 const backgroundToolChoice=needsToolChoice?String(raw.backgroundToolChoice||existing?.backgroundToolChoice||'').trim():'';
 if(backgroundToolChoice){const O=root.FolioOrigin2024||(typeof require==='function'?require('./origin-2024.js'):null);const allowed=/Artisan/i.test(toolSpec)?O.ARTISAN:/Musical/i.test(toolSpec)?O.INSTRUMENT:/Gaming/i.test(toolSpec)?O.GAMING:[];if(!allowed.includes(backgroundToolChoice))throw Error('Choose the correct kind of tool proficiency for this background.');}
 const backgroundEquipmentChoice=['A','B'].includes(raw.backgroundEquipmentChoice)?raw.backgroundEquipmentChoice:(raw.backgroundEquipmentChoice===undefined&&existing?.background===chosen.background?.name?existing?.backgroundEquipmentChoice||'':'');
 if(backgroundEquipmentChoice==='A'&&needsToolChoice&&!backgroundToolChoice)throw Error('Choose your background tool or instrument before accepting equipment package A.');
 const speciesChoices=Species.choices(chosen.species,{size:raw.speciesSize,variant:raw.speciesVariant,skills:raw.speciesSkills||[]});
 const speciesId=chosen.species?.id||'';
 const speciesCastingAbility=['species:elf','species:gnome','species:tiefling'].includes(speciesId)?(raw.speciesCastingAbility||existing?.speciesCastingAbility||''):'';
 if(speciesCastingAbility&&!['int','wis','cha'].includes(speciesCastingAbility))throw Error('Species spellcasting ability must be Intelligence, Wisdom or Charisma.');
 const speciesOriginFeatId=speciesId==='species:human'?(raw.speciesOriginFeatId||existing?.speciesOriginFeatId||''):'';
 const speciesOriginFeat=speciesOriginFeatId?findOption('feat',speciesOriginFeatId,homebrew,existing?.options,sourcePacks):null;
 if(speciesOriginFeatId&&(!speciesOriginFeat||speciesOriginFeat.category!=='Origin'))throw Error('Human Versatile requires an Origin feat.');
 if(speciesOriginFeat&&!snapshot.some(o=>o.id===speciesOriginFeat.id))snapshot.push(clone(speciesOriginFeat));
 const speciesHighElfCantrip=speciesId==='species:elf'&&speciesChoices.variant==='High Elf'?(raw.speciesHighElfCantrip||existing?.speciesHighElfCantrip||''):'';
 if(speciesHighElfCantrip){const cat=(root.FolioSpellRules?.catalog?.()||[]);if(!cat.some(x=>x.name===speciesHighElfCantrip&&x.level===0&&(x.classes||[]).includes('Wizard')))throw Error('High Elf replacement must be a Wizard cantrip.');}

 const bonusOptions=[chosen.species,chosen.background,chosen.subclass,chosen.feat].filter(Boolean);
 for(const [k] of Object.entries(scores)){
  const increase=permitted.includes(k)?(backgroundMethod==='triple'?1:(k===backgroundPlus?2:k===backgroundOne?1:0)):0;
  // 2024 backgrounds cannot take a score above 20, unlike some Epic Boons.
  if(increase&&scores[k]+increase>20)throw Error('Background increases cannot raise '+k.toUpperCase()+' above 20.');
  scores[k]+=increase+bonusOptions.reduce((t,opt)=>t+(opt.bonusAbility===k?(opt.bonusAmount||0):0),0);
  if(scores[k]>30||scores[k]<1)throw Error('Final '+k.toUpperCase()+' score is outside 1–30.');
 }
 const extraFeatAbility=String(raw.extraFeatAbility===undefined?existing?.extraFeatAbility||'':raw.extraFeatAbility||'').toLowerCase();
 if(extraFeatAbility&&chosen.feat){const allowed=chosen.feat.abilityChoices||[];
  if(!allowed.includes(extraFeatAbility))throw Error('Choose a valid ability increase for the extra feat.');
  const cap=chosen.feat.category==='Epic Boon'?30:20;
  if(scores[extraFeatAbility]+1>cap)throw Error('Extra feat cannot raise '+extraFeatAbility.toUpperCase()+' above '+cap+'.');
  scores[extraFeatAbility]++;
 }
 const awards=normaliseAdvancements(raw.advancementChoices,existing,chosen.class.name,level,homebrew,sourcePacks,chosen.background?.feat||'',chosen.feat?.name||'',scores,fightingStyle?.name,chosen.subclass?.name||'');
 Object.assign(scores,awards.scores);
 // Level 20 Primal Champion is derived from base scores, never applied twice after a rebuild.
 if(chosen.class.name==='Barbarian'&&level>=20){scores.str=Math.min(25,scores.str+4);scores.con=Math.min(25,scores.con+4);}
 if(chosen.class.name==='Monk'&&level>=20){scores.dex=Math.min(25,scores.dex+4);scores.wis=Math.min(25,scores.wis+4);}
 if(chosen.feat?.requires==='RangerOnly')throw Error('Druidic Warrior must be chosen in the Ranger Fighting Style section.');
 if(chosen.feat?.requires==='PaladinOnly')throw Error('Blessed Warrior must be chosen in the Paladin Fighting Style section, not as a feat.');
 const extraFeatError=Origins.validateFeat(chosen.feat,{level,characterClass:chosen.class.name,scores,subclass:chosen.subclass?.name||''});
 if(extraFeatError)throw Error(extraFeatError);
 if(chosen.feat?.minLevel&&level<chosen.feat.minLevel)throw Error(chosen.feat.name+' requires level '+chosen.feat.minLevel+' or higher.');
 if(chosen.feat&&chosen.feat.name===chosen.background?.feat&&(!chosen.feat.repeatable||chosen.feat.name.startsWith('Magic Initiate (')))throw Error(chosen.feat.name+' cannot be selected twice.');
 const constitution=Math.floor((scores.con-10)/2),hitDie=chosen.class.hitDie||8,average=Math.floor(hitDie/2)+1;
 const speciesHpBonus=chosen.species?.id==='species:dwarf'?level:0;
 const activeFeatNames=[chosen.background?.feat,speciesOriginFeat?.name,chosen.feat?.name,fightingStyle?.name,activeChampionStyle?.name,...Object.entries(awards.choices).filter(([lv,ch])=>Number(lv)<=level&&ch.type==='feat').map(([lv,ch])=>ch.featName)];
 const toughHpBonus=activeFeatNames.includes('Tough')?2*level:0;
 const draconicHpBonus=chosen.class.name==='Sorcerer'&&chosen.subclass?.name==='Draconic Sorcery'&&level>=3?level+2:0;
 const boonHpBonus=activeFeatNames.includes('Boon of Fortitude')?40:0;
 const suggestedHp=Math.max(1,hitDie+constitution)+(level-1)*Math.max(1,average+constitution)+speciesHpBonus+toughHpBonus+draconicHpBonus+boonHpBonus;
 const manualHp=raw.maxHp===''||raw.maxHp===undefined||raw.maxHp===null?null:Number(raw.maxHp);
 if(manualHp!==null&&!int(manualHp,1,9999))throw Error('Maximum HP must be a whole number between 1 and 9999.');
 const maxHp=manualHp??suggestedHp;
 const knownSkills=[...(chosen.background?.skills||[]),...bonusOptions.flatMap(o=>o.skills||[]),...speciesChoices.skills];
 const skills=[...new Set([...knownSkills,...(chosen.class.name==='Monk'&&level>=3&&chosen.subclass?.name==='Warrior of Mercy'?['Insight','Medicine']:[])])];
 const saves=[...new Set([...Object.values(awards.choices).filter(ch=>ch.type==='feat'&&ch.featName==='Resilient'&&ch.ability).map(ch=>ch.ability),...(chosen.feat?.name==='Resilient'&&extraFeatAbility?[extraFeatAbility]:[]),...(chosen.class.saves||[]),...bonusOptions.flatMap(o=>o.saves||[]),...(chosen.class.name==='Rogue'&&level>=15?['wis','cha']:[])])];
 const speciesSpeed=chosen.species?(Number.isInteger(chosen.species.speed)?chosen.species.speed:(raw.speciesSpeed==null||raw.speciesSpeed===''?NaN:Number(raw.speciesSpeed))):30;
 if(chosen.species&&!Number.isInteger(chosen.species.speed)&&!int(speciesSpeed,0,120))throw Error('Enter the species speed from your sourcebook (0–120 ft).');
 const speed=speciesSpeed+(activeFeatNames.includes('Speedy')?10:0)+(activeFeatNames.includes('Boon of Speed')?30:0)+(chosen.species?.id==='species:elf'&&speciesChoices.variant==='Wood Elf'?5:0)+bonusOptions.reduce((v,o)=>v+(o.speedBonus||0),0);
 const acBonus=bonusOptions.reduce((v,o)=>v+(o.acBonus||0),0);
 const spellAbility=chosen.class.primary||'cha';
 return {name,level,ids,options:snapshot,baseScores:baseScores(raw.scores),scores,advancementChoices:awards.choices,advancementUnresolved:awards.unresolved,advancementEarned:awards.earned,grantedFeatNames:activeFeatNames.filter(Boolean),toughHpBonus,boonHpBonus,draconicHpBonus,manualHp,extraFeatAbility,fightingStyleId:styleId,fightingStyleName:fightingStyle?.name||'',championStyleId,championStyleName:activeChampionStyle?.name||'',characterClass:chosen.class.name,species:chosen.species?.name||'Unassigned',background:chosen.background?.name||'Unassigned',subclass:chosen.subclass?.name||'',feat:chosen.feat?.name||(chosen.background?.feat||''),hitDie,maxHp,suggestedHp,speed,acBonus,saves,skills,slotMax:slotsFor(chosen.class,level,chosen.subclass?.name),spellAbility,backgroundMethod,backgroundPlus,backgroundOne,backgroundTool:chosen.background?.tool||'',backgroundToolChoice,backgroundEquipmentChoice,backgroundFeat:chosen.background?.feat||'',speciesChoices,speciesSize:speciesChoices.size,speciesVariant:speciesChoices.variant,speciesSkillChoices:speciesChoices.skills,speciesCastingAbility,speciesOriginFeatId,speciesOriginFeatName:speciesOriginFeat?.name||'',speciesHighElfCantrip,speciesType:chosen.species?.creatureType||'Humanoid',speciesTraits:(chosen.species?.traits||[]).map(t=>({...t})),speciesSourceId:chosen.species?.sourceId||'',darkvisionFeet:(chosen.species?.id==='species:elf'&&speciesChoices.variant==='Drow'?120:(chosen.species?.darkvisionFeet||0))+(chosen.class.name==='Monk'&&level>=3&&chosen.subclass?.name==='Warrior of Shadow'?60:0)+(chosen.class.name==='Ranger'&&level>=3&&chosen.subclass?.name==='Gloom Stalker'?60:0),speciesHpBonus,grantedSkills:skills,speciesSpeedManual:chosen.species&&!Number.isInteger(chosen.species.speed)?speciesSpeed:null,notes:text(raw.notes,1500)};
}
function applyToState(state,b){
 const s=clone(state),prior=s.character||{},priorBuild=prior.build;
 if(prior.templateKind!=='starter')throw Error('Pip’s original subclass-specific sheet is protected. Duplicate Pip or create a new character for the universal builder.');
 if(b.characterClass==='Wizard'&&!priorBuild)b.wizardBookInitialized=true;
 if(b.characterClass==='Druid'&&priorBuild?.characterClass==='Druid'){b.druidOrder=priorBuild.druidOrder||'';b.druidFury=priorBuild.druidFury||'';b.druidKnownForms=(priorBuild.druidKnownForms||[]).filter(x=>x.cr<=(b.subclass==='Circle of the Moon'&&b.level>=3?Math.floor(b.level/3):b.level>=8?1:b.level>=4?.5:.25)&&(!x.fly||b.level>=8)).slice(0,b.level>=8?8:b.level>=4?6:4);}
 if(b.characterClass==='Bard'&&priorBuild?.characterClass==='Bard'){b.bardClassSkills=(priorBuild.bardClassSkills||[]).slice(0,3);b.bardExpertise=(priorBuild.bardExpertise||[]).slice(0,b.level>=9?4:b.level>=2?2:0);b.bardLoreSkillChoices=b.subclass==='College of Lore'&&b.level>=3?(priorBuild.bardLoreSkillChoices||[]):[];b.bardLoreDiscoveryNames=b.subclass==='College of Lore'&&b.level>=6?(priorBuild.bardLoreDiscoveryNames||[]):[];b.bardLoreDiscoveryKeys=b.subclass==='College of Lore'&&b.level>=6?(priorBuild.bardLoreDiscoveryKeys||[]):[];}
 if(b.characterClass==='Wizard'&&priorBuild?.characterClass==='Wizard'){for(const key of ['wizardResearchKeys','wizardSavantKeys','wizardCopiedKeys','wizardLegacyKeys','wizardMasteryKeys','wizardSignatureKeys'])b[key]=priorBuild[key]||[];b.wizardBookInitialized=!!priorBuild.wizardBookInitialized;b.wizardInkGP=priorBuild.wizardInkGP||0;b.wizardCopyHours=priorBuild.wizardCopyHours||0;b.wizardScholarSkill=priorBuild.wizardScholarSkill||'';}
 if(b.characterClass==='Warlock'&&priorBuild?.characterClass==='Warlock'){b.warlockInvocations=(priorBuild.warlockInvocations||[]).slice(0,root.FolioWarlock2024?.SLOTS?.[b.level]||[0,1,3,3,3,5,5,6,6,7,7,7,8,8,8,9,9,9,10,10,10][b.level]);b.warlockTomeCantrips=priorBuild.warlockTomeCantrips||[];b.warlockTomeRituals=priorBuild.warlockTomeRituals||[];}
 if(b.characterClass==='Sorcerer'&&priorBuild?.characterClass==='Sorcerer'){b.sorcererMetamagic=(priorBuild.sorcererMetamagic||[]).slice(0,b.level>=17?6:b.level>=10?4:b.level>=2?2:0);b.sorcererDragonElement=b.subclass==='Draconic Sorcery'&&b.level>=6?(priorBuild.sorcererDragonElement||''):'';}
 if(b.characterClass==='Barbarian'&&priorBuild?.characterClass==='Barbarian'){b.barbarianPrimalSkill=priorBuild.barbarianPrimalSkill||'';}
 if(b.characterClass==='Ranger'&&priorBuild?.characterClass==='Ranger'){b.rangerExpertise=(priorBuild.rangerExpertise||[]).slice(0,b.level>=9?3:b.level>=2?1:0);b.rangerLanguages=priorBuild.rangerLanguages||[];b.rangerSocialSkill=b.subclass==='Fey Wanderer'?priorBuild.rangerSocialSkill||'':'';b.rangerIronSave=b.subclass==='Gloom Stalker'&&b.level>=7?priorBuild.rangerIronSave||'':'';}
 if(b.characterClass==='Fighter'&&b.subclass==='Battle Master'&&priorBuild?.characterClass==='Fighter'&&priorBuild?.subclass==='Battle Master'&&b.level>=3){b.fighterStudentSkill=priorBuild.fighterStudentSkill||'';b.fighterStudentTool=priorBuild.fighterStudentTool||'';}
 // Preserve separately configured feat options on build edits and level changes.
 const origin=root.FolioOrigin2024||(typeof require==='function'?require('./origin-2024.js'):null);
 for(const key of ['originMagic','originSkilled','originCrafterTools','originMusicianTools','featChoices','featAutoSkills','featAutoExpertise','featAutoTools'])if(priorBuild&&b[key]===undefined)b[key]=JSON.parse(JSON.stringify(priorBuild[key]||(['originMagic','featChoices'].includes(key)?{}:[])));
 const oldSpeciesCharacter={...prior,build:priorBuild};
 const prevSlots=s.resources.spellSlots||Array(9).fill(0);
 const previousMax=priorBuild?.slotMax||Array(9).fill(0);
 const spellSlots=b.slotMax.map((max,i)=>Math.max(0,Math.min(max,prevSlots[i]===undefined?max:prevSlots[i]+Math.max(0,max-(previousMax[i]||0)))));
 if(!priorBuild)for(let i=0;i<9;i++)spellSlots[i]=b.slotMax[i];
 const priorAuto=priorBuild?.grantedSkills?new Set(priorBuild.grantedSkills):new Set();
 const oldOriginSkills=(priorBuild?.originSkilled||[]).filter(k=>origin.SKILLS.includes(k));const oldFeatSkills=priorBuild?.featAutoSkills||[];const oldFeatExpertise=priorBuild?.featAutoExpertise||[];const oldFeatTools=priorBuild?.featAutoTools||[];
 const previousOriginTools=[priorBuild?.backgroundToolChoice||priorBuild?.backgroundTool,...(priorBuild?.originSkilled||[]),...(priorBuild?.originCrafterTools||[]),...(priorBuild?.originMusicianTools||[])].filter(Boolean);
 const baseTool= b.backgroundToolChoice||(!/\(choose\)|Choose one/i.test(b.backgroundTool)?b.backgroundTool:'');
 const actualOrigin={templateKind:'starter',level:b.level,build:b};
 const originSkills=(origin.has(actualOrigin,'Skilled')?b.originSkilled||[]:[]).filter(x=>origin.SKILLS.includes(x));
 const originTools=[...(origin.has(actualOrigin,'Skilled')?b.originSkilled||[]:[]).filter(x=>origin.TOOLS.includes(x)),...(origin.has(actualOrigin,'Crafter')?b.originCrafterTools||[]:[]),...(origin.has(actualOrigin,'Musician')?b.originMusicianTools||[]:[])];
 const previouslyManual=(prior.profSkills||[]).filter(k=>!priorAuto.has(k)&&!oldOriginSkills.includes(k)&&!oldFeatSkills.includes(k)&&k!==priorBuild?.fighterStudentSkill&&!(priorBuild?.bardLoreSkillChoices||[]).includes(k)&&!(priorBuild?.bardClassSkills||[]).includes(k));
 s.character={...prior,expertise:[...(prior.expertise||[]).filter(x=>!(priorBuild?.rangerExpertise||[]).includes(x)&&!(priorBuild?.bardExpertise||[]).includes(x)&&!oldFeatExpertise.includes(x)),...(b.rangerExpertise||[]),...(b.bardExpertise||[]),...(b.characterClass==='Wizard'&&b.level>=2&&b.wizardScholarSkill?[b.wizardScholarSkill]:[])],languages:[...(prior.languages||[]).filter(x=>!(priorBuild?.rangerLanguages||[]).includes(x)),...(b.rangerLanguages||[])],templateKind:'starter',name:b.name,className:b.characterClass,subclass:b.subclass,species:b.species,background:b.background,level:b.level,scores:b.scores,speed:b.speed,size:b.speciesSize||prior.size||'',creatureType:b.speciesType||prior.creatureType||'Humanoid',darkvisionFeet:b.darkvisionFeet??prior.darkvisionFeet??0,profSaves:[...new Set([...b.saves,...(b.characterClass==='Ranger'&&b.subclass==='Gloom Stalker'&&b.level>=7?['wis']:[])])],profSkills:[...new Set([...previouslyManual,...b.skills,...originSkills,...(b.bardClassSkills||[]),...(b.bardLoreSkillChoices||[]),...(b.fighterStudentSkill?[b.fighterStudentSkill]:[]),...(b.characterClass==='Barbarian'&&b.level>=3&&b.barbarianPrimalSkill?[b.barbarianPrimalSkill]:[])])],maxHp:b.maxHp,tools:[...new Set([...(prior.tools||[]).filter(x=>x!==priorBuild?.fighterStudentTool&&!previousOriginTools.includes(x)&&!oldFeatTools.includes(x)),...(baseTool?[baseTool]:[]),...originTools,...(b.fighterStudentTool?[b.fighterStudentTool]:[]),...(b.characterClass==='Rogue'&&b.subclass==='Assassin'&&b.level>=3?['Disguise Kit',"Poisoner's Kit"]:[]),...(b.characterClass==='Monk'&&b.subclass==='Warrior of Mercy'&&b.level>=3?['Herbalism Kit']:[])])],build:{...b,...(priorBuild?.characterClass===b.characterClass&&priorBuild?.subclass===b.subclass&&priorBuild?.landType?{landType:priorBuild.landType}:{})},overrides:{...prior.overrides}};
 // The bonus is an additional automatic AC modifier, not a manual override.
 s.character.build.acBonus=b.acBonus;
 if(root.FolioSpecies2024){const spec=root.FolioSpecies2024;s.resources.speciesState=spec.normalize(s.character,s.resources.speciesState||{},priorBuild?oldSpeciesCharacter:null);}
 if(origin)s.resources.originState=origin.normalize(s.character,s.resources.originState||{},priorBuild?oldSpeciesCharacter:null);
 if(b.characterClass==='Rogue'&&b.subclass==='Assassin'&&b.level>=3){for(const [id,itemName] of [['assassin-disguise-kit','Disguise Kit'],['assassin-poisoners-kit',"Poisoner's Kit"]]){if(s.inventory?.items&&!s.inventory.items.some(x=>x.name.toLowerCase()===itemName.toLowerCase()))s.inventory.items.push(root.PipInventory.gear(id,itemName,'tools',1,'Granted by Assassin subclass'));}}
 const preserved=(s.character.customFeatures||[]).filter(f=>!f.id?.startsWith('build-option-')&&!f.id?.startsWith('build-advancement-'));
 const groups={class:'Custom',subclass:'Custom',species:'Species',background:'Background',feat:'Feat'};
 s.character.customFeatures=[...preserved,...(b.speciesOriginFeatName?[{id:'build-option-species-origin-feat',name:b.speciesOriginFeatName,group:'Feat',short:'Human Versatile · extra Origin feat',detail:'Chosen in Species & Traits. Resolve remaining feat mechanics at the table.',hidden:false}]:[]),...b.options.filter(o=>o.id!==b.speciesOriginFeatId).map(o=>({id:'build-option-'+o.kind,name:o.name,group:groups[o.kind]||'Custom',short:(o.description||'Selected '+o.kind).slice(0,300),detail:(o.details||o.description||'Selected through the character builder.')+' Source: '+(root.FolioSources?.displayName(o.sourceId,o.source)||'Personal homebrew')+'. Confirm any unimplemented choices in your book.',hidden:false})),
 ...(b.speciesTraits||[]).map((t,i)=>({id:'build-option-species-trait-'+i,name:t.name,group:'Species',short:(t.summary||'Review the species rulebook entry.').slice(0,300),detail:(t.summary||'Consult the official source.')+' Full mechanics and use limits may require manual tracking. Source: '+(root.FolioSources?.displayName(b.speciesSourceId)||'Custom')+'.',hidden:false})),
 ...(b.ids.species?[{id:'build-option-species-choices',name:'Species selections',group:'Species',short:[b.speciesSize||'Size not recorded',b.speciesVariant,b.speciesSkillChoices?.join(' · ')].filter(Boolean).join(' · '),detail:'Species choices are saved. The Features & Traits page provides supported PHB 24 effects, rest tracking and DM-assisted abilities; other-book entries remain reference only.',hidden:false}]:[])];
 for(const [lv,ch] of Object.entries(b.advancementChoices||{})){
  if(Number(lv)>b.level)continue;
  if(ch.type==='asi')s.character.customFeatures.push({id:'build-advancement-'+lv,name:'Level '+lv+' · Ability Score Improvement',group:'Feat',short:ch.first.toUpperCase()+' +1, '+ch.second.toUpperCase()+' +1 (already calculated)',detail:'Earned from '+b.characterClass+' progression; resulting ability scores, related modifiers and suggested hit points are calculated.',hidden:false});
  else if(ch.type==='feat')s.character.customFeatures.push({id:'build-advancement-'+lv,name:'Level '+lv+' · '+ch.featName,group:'Feat',short:'Earned at class level '+lv+(ch.ability?' · '+ch.ability.toUpperCase()+' +1':' · choose feat ability increase in Build & Level if applicable')+'. '+(['Tough','Alert','Fighting Style: Defense'].includes(ch.featName)?'Supported passive effects calculated.':'Other effects require manual resolution.'),detail:'This feat is earned from the class progression table; complex actions and optional choices not specifically listed as automated still require manual resolution.',hidden:false});
 }
 if(b.championStyleName)s.character.customFeatures.push({id:'build-option-champion-style',name:b.championStyleName,group:'Feat',short:'Champion level 7 additional Fighting Style'+(['Fighting Style: Defense','Fighting Style: Archery'].includes(b.championStyleName)?' (supported bonus calculated)':' (manual effects)')+'.',detail:'This additional Fighting Style is active only at Champion Fighter level 7+. Non-automated effects remain manual.',hidden:false});
 if(b.fightingStyleName)s.character.customFeatures.push({id:'build-option-fighting-style',name:b.fightingStyleName,group:'Feat',short:'Class-granted Fighting Style'+(['Fighting Style: Defense','Fighting Style: Archery'].includes(b.fightingStyleName)?' (supported bonus calculated)':' (manual effects)')+'.',detail:'Granted at Fighter level 1 or Paladin/Ranger level 2. Other conditions and effects are manual unless specifically described as automatic.',hidden:false});
 if(b.backgroundFeat||b.feat&&!b.options.some(x=>x.kind==='feat'))s.character.customFeatures.push({id:'build-option-originfeat',name:b.backgroundFeat||b.feat,group:'Feat',short:'Origin feat granted by the selected background; record its selections and triggered effects.',detail:'The background grant is recorded, but complex feat mechanics are not automatic.',hidden:false});
 const hpChange=b.maxHp-(s.resources.maxHp||10);s.resources={...s.resources,maxHp:b.maxHp,hp:Math.min(b.maxHp,Math.max(0,(s.resources.hp||0)+hpChange)),hitDice:Math.max(0,Math.min(b.level,(s.resources.hitDice||1)+Math.max(0,b.level-(prior.level||1)))),spellSlots};
 if(root.FolioSpellRules){const gained=Math.max(0,b.level-(prior.level||1));if(gained)s.spellbook=root.FolioSpellRules.applyLevelUpChanges(s.spellbook,gained);s.resources.mysticArcanum=root.FolioSpellRules.mysticArcanumResources({build:b,level:b.level,className:b.characterClass},s.resources.mysticArcanum||{});}
 if(root.FolioClassMechanics){const M=root.FolioClassMechanics;const prev=priorBuild?prior:null;s.resources.classResources=M.normalizeResources(s.character,s.resources.classResources||{},prev);s.resources.classState={...(priorBuild?.characterClass===b.characterClass&&priorBuild?.subclass===b.subclass?s.resources.classState||{}:{}),raging:priorBuild?.characterClass===b.characterClass?!!s.resources.classState?.raging:false};}
 const ready=origin?origin.awardEquipment(s):s;
 const feats=root.FolioFeat2024||(typeof require==='function'?require('./feats-2024.js'):null);
 if(!feats)return ready;
 const reconciled=feats.reconcile(ready);
 const oldChar=priorBuild?{...prior,build:priorBuild}:null;
 reconciled.resources.featState=feats.normalize(reconciled.character,ready.resources?.featState||{},oldChar);
 return reconciled;
}
function advancementMarkers(className,level){const feats=featMilestones(className,20);return {subclass:level>=3,featMilestones:feats.filter(x=>x<=level),nextFeat:feats.find(x=>x>level)||null,upcoming:feats.filter(x=>x>level).slice(0,3)};}
function normalizeBuild(b){return b&&typeof b==='object'&&Number.isInteger(b.level)&&Array.isArray(b.options)?b:null;}
root.FolioBuilder={KINDS,ABILITIES,classes,species,backgrounds,subclasses,feats,builtin,optionList,findOption,normalizeHomebrew,homebrewAdd,homebrewUpdate,homebrewRemove,slotsFor,buildFromInput,applyToState,advancementMarkers,featMilestones,fightingStyleLevel,grantedFeatNames,normalizeBuild,makeId};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioBuilder;
})(typeof window!=='undefined'?window:globalThis);
