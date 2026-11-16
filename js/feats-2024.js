(function(root){'use strict';
// Milestone 18.30 — PHB 24 General, Fighting Style and Epic Boon feat integration.
// This module stores choices and player-confirmed outcomes; it never decides enemy saves/positions.
const CAT=root.FolioOrigins||(typeof require==='function'?require('./origin-catalog.js'):null);
const SKILLS=['Acrobatics','Animal Handling','Arcana','Athletics','Deception','History','Insight','Intimidation','Investigation','Medicine','Nature','Perception','Performance','Persuasion','Religion','Sleight of Hand','Stealth','Survival'];
const ABILITIES=['str','dex','con','int','wis','cha'];
const ENERGY=['Acid','Cold','Fire','Lightning','Necrotic','Poison','Psychic','Radiant','Thunder'];
const ELEMENTS=['Acid','Cold','Fire','Lightning','Thunder'];
const MARTIAL=['Battleaxe','Blowgun','Flail','Glaive','Greataxe','Greatsword','Halberd','Hand Crossbow','Heavy Crossbow','Lance','Longbow','Longsword','Maul','Morningstar','Pike','Pistol','Rapier','Scimitar','Shortsword','Trident','War Pick','Warhammer','Whip'];
const SPELLCHOICES=['Fey-Touched','Shadow-Touched','Ritual Caster','Telepathic','Telekinetic'];
const PB=c=>2+Math.floor((Math.max(1,Number(c?.level)||1)-1)/4);
const MOD=(c,k)=>Math.floor(((Number(c?.scores?.[k])||10)-10)/2);
const names=c=>c?.templateKind==='starter'?new Set((c.build?.grantedFeatNames||[]).filter(Boolean)):new Set();
const has=(c,n)=>names(c).has(n);
const count=(c,n)=>(c?.build?.grantedFeatNames||[]).filter(x=>x===n).length;
const supported=c=>c?.templateKind==='starter'&&!!c.build;
const configured=(c,n)=>c?.build?.featChoices?.[n]||{};
const granted=c=>(CAT?.feats||[]).filter(f=>['General','Fighting Style','Epic Boon'].includes(f.category)&&has(c,f.name));
const longKeys={"Mage Slayer":['mage-slayer-guard'],"Ritual Caster":['ritual-quick'],"Telepathic":['feat-spell:Detect Thoughts'],"Boon of Recovery":['recovery-last-stand']};
const shortKeys={"Boon of Fate":['fate']};
const turnKeys={"Charger":['charger'],"Crusher":['crusher'],"Grappler":['grappler'],"Piercer":['piercer'],"Slasher":['slasher'],"Shield Master":['shield-bash'],"Boon of Combat Prowess":['combat-prowess'],"Boon of Fortitude":['fortitude-heal']};
const staticSpecs=c=>{if(!supported(c))return [];
 const specs=[];for(const feat of granted(c)){
  const n=feat.name;
  for(const key of longKeys[n]||[])specs.push({key,max:1,reset:'long'});
  for(const key of shortKeys[n]||[])specs.push({key,max:1,reset:'short'});
  for(const key of turnKeys[n]||[])specs.push({key,max:1,reset:'turn'});
  if(n==='Boon of Recovery')specs.push({key:'recovery-dice',max:10,reset:'long'});
  if(n==='Fey-Touched')specs.push(...['Misty Step',configured(c,n).spell].filter(Boolean).map(spell=>({key:'feat-spell:'+spell,max:1,reset:'long'})));
  if(n==='Shadow-Touched')specs.push(...['Invisibility',configured(c,n).spell].filter(Boolean).map(spell=>({key:'feat-spell:'+spell,max:1,reset:'long'})));
 }
 return specs;
};
const specs=c=>[...new Map(staticSpecs(c).map(o=>[o.key,o])).values()];
function normalize(c,old={},oldC=null){const prior=old&&typeof old==='object'?old:{};const oldSpecs=new Map(specs(oldC||c).map(x=>[x.key,x]));const charges={};for(const s of specs(c)){const v=prior.charges?.[s.key];charges[s.key]=Math.max(0,Math.min(s.max,Number.isInteger(v)?Math.min(s.max,v+Math.max(0,s.max-(oldSpecs.get(s.key)?.max||s.max))):s.max));}
 return {charges,last:typeof prior.last==='string'?prior.last.slice(0,400):'',nightSpiritActive:has(c,'Boon of the Night Spirit')&&!!prior.nightSpiritActive,preparedChefTreats:has(c,'Chef')?Math.max(0,Math.min(PB(c),Number(prior.preparedChefTreats)||0)):0};}
const remaining=(c,r,key)=>r?.featState?.charges?.[key]??specs(c).find(s=>s.key===key)?.max??0;
function rest(c,old={},kind='long'){
 const state=normalize(c,old,c);for(const sp of specs(c))if(kind==='long'||kind==='short'&&sp.reset==='short'||kind==='turn'&&sp.reset==='turn')state.charges[sp.key]=sp.max;
 if(kind==='long'){state.preparedChefTreats=0;state.nightSpiritActive=false;}return state;
}
function restState(state,kind='long'){const c=state?.character;if(!supported(c))return state;return {...state,resources:{...state.resources,featState:rest(c,state.resources?.featState||{},kind)}};}
function startTurn(state){return restState(state,'turn');}
function initiative(state){const c=state?.character;if(!has(c,'Boon of Fate'))return state;const fs=normalize(c,state.resources?.featState||{},c);fs.charges.fate=1;return {...state,resources:{...state.resources,featState:fs}};}
function abilityFor(c,n){if(c?.build?.feat===n&&c.build.extraFeatAbility)return c.build.extraFeatAbility;
 for(const [lv,ch] of Object.entries(c?.build?.advancementChoices||{}))if(+lv<=c.level&&ch.type==='feat'&&ch.featName===n&&ch.ability)return ch.ability;
 return '';
}
function validateChoices(c,name,raw){if(!has(c,name))throw Error('This character does not have '+name+'.');const x=raw||{};
 const spellCat=root.FolioSpellRules?.catalog?.()||[];
 if(name==='Fey-Touched'||name==='Shadow-Touched'){
  const schools=name==='Fey-Touched'?['Divination','Enchantment']:['Illusion','Necromancy'];
  if(x.spell&&!spellCat.some(s=>s.name===x.spell&&s.level===1&&schools.includes(s.school)))throw Error(name+' requires a level-1 '+schools.join('/')+' spell.');
 }
 if(name==='Ritual Caster'){
  const rituals=x.rituals||[];if(!Array.isArray(rituals)||rituals.length>PB(c)||new Set(rituals).size!==rituals.length)throw Error('Choose at most PB distinct level-1 Ritual spells.');
  if(!rituals.every(n=>spellCat.some(s=>s.name===n&&s.level===1&&s.ritual===true)))throw Error('All Ritual Caster choices must be level-1 Ritual spells.');
 }
 if(name==='Elemental Adept'){const selected=x.damageTypes||[x.damageType].filter(Boolean);if(!Array.isArray(selected)||selected.length>count(c,'Elemental Adept')||new Set(selected).size!==selected.length||selected.some(t=>!ELEMENTS.includes(t)))throw Error('Choose a different valid elemental damage type for each Elemental Adept feat.');return {damageTypes:selected};}
 if(name==='Boon of Energy Resistance'&&x.resistances?.length){if(x.resistances.length!==2||new Set(x.resistances).size!==2||!x.resistances.every(t=>ENERGY.includes(t)))throw Error('Choose two different energy damage types.');}
 if(name==='Skill Expert'&&x.skill&&(!SKILLS.includes(x.skill)||x.expertise&&!SKILLS.includes(x.expertise)))throw Error('Choose valid skill names.');
 if(['Keen Mind','Observant'].includes(name)&&x.skill&&!(name==='Keen Mind'?['Arcana','History','Investigation','Nature']:['Insight','Perception']).includes(x.skill))throw Error('Choose an eligible skill for '+name+'.');
 if(name==='Boon of Skill'&&x.expertise&&!SKILLS.includes(x.expertise))throw Error('Choose a valid Expertise skill.');
 if(name==='Weapon Master'&&x.weapon&&!(root.FolioWeaponCatalog?.weapons||[]).some(w=>w.name===x.weapon)&&!MARTIAL.includes(x.weapon))throw Error('Choose a weapon type from the weapon catalogue.');
 return {...x};
}
function reconcile(state,prior=null){const c=state.character;if(!supported(c))return state;
 const b=c.build||{},options=b.featChoices||{};const owned=new Set(b.featAutoSkills||[]),expertOwned=new Set(b.featAutoExpertise||[]),toolsOwned=new Set(b.featAutoTools||[]);
 const newSkills=new Set(),newExpert=new Set(),newTools=new Set();
 const availableSkill=new Set([...(c.profSkills||[]).filter(x=>!owned.has(x)),...(b.grantedSkills||[])]);
 if(has(c,'Boon of Skill'))for(const sk of SKILLS){newSkills.add(sk);availableSkill.add(sk);}
 if(has(c,'Chef'))newTools.add('Cook’s Utensils');if(has(c,'Poisoner'))newTools.add('Poisoner’s Kit');
 if(has(c,'Skill Expert')){const opt=options['Skill Expert']||{};if(SKILLS.includes(opt.skill)){newSkills.add(opt.skill);availableSkill.add(opt.skill);}if(SKILLS.includes(opt.expertise)&&availableSkill.has(opt.expertise))newExpert.add(opt.expertise);}
 for(const feat of ['Keen Mind','Observant'])if(has(c,feat)){const skill=options[feat]?.skill;if(SKILLS.includes(skill)){
  if(availableSkill.has(skill))newExpert.add(skill);else {newSkills.add(skill);availableSkill.add(skill);}
 }}
 if(has(c,'Boon of Skill')&&SKILLS.includes(options['Boon of Skill']?.expertise))newExpert.add(options['Boon of Skill'].expertise);
 const manualSkills=(c.profSkills||[]).filter(x=>!owned.has(x));const manualExpert=(c.expertise||[]).filter(x=>!expertOwned.has(x));const manualTools=(c.tools||[]).filter(x=>!toolsOwned.has(x));
 const nextBuild={...b,featAutoSkills:[...newSkills],featAutoExpertise:[...newExpert],featAutoTools:[...newTools]};
 return {...state,character:{...c,build:nextBuild,profSkills:[...new Set([...manualSkills,...newSkills])],expertise:[...new Set([...manualExpert,...newExpert])],tools:[...new Set([...manualTools,...newTools])]}};
}
function choose(state,name,choices={}){if(!supported(state?.character))throw Error('Feats panel is for builder characters.');const c=state.character;
 const clean=validateChoices(c,name,choices);const options={...(c.build?.featChoices||{}),[name]:clean};
 const next={...state,character:{...c,build:{...c.build,featChoices:options}}};
 const s=reconcile(next);const previous=c.build?.featChoices?.[name]||{};
 // Preserve spent charges on unchanged spells and re-normalize the inventory on re-selection.
 return {...s,resources:{...s.resources,featState:normalize(s.character,s.resources?.featState||{},c)}};
}
const spellsFor=c=>{if(!supported(c))return [];
 const names=[];if(has(c,'Fey-Touched'))names.push('Misty Step',configured(c,'Fey-Touched').spell);
 if(has(c,'Shadow-Touched'))names.push('Invisibility',configured(c,'Shadow-Touched').spell);
 if(has(c,'Telekinetic'))names.push('Mage Hand');if(has(c,'Telepathic'))names.push('Detect Thoughts');
 if(has(c,'Ritual Caster'))names.push(...(configured(c,'Ritual Caster').rituals||[]));
 return [...new Set(names.filter(Boolean))];
};
function freeOption(c,spell,r){if(!supported(c))return null;
 for(const feat of ['Fey-Touched','Shadow-Touched'])if(has(c,feat)&&[feat==='Fey-Touched'?'Misty Step':'Invisibility',configured(c,feat).spell].includes(spell)&&remaining(c,r,'feat-spell:'+spell)>0)return {key:'feat-free:'+spell,label:feat+' · free cast (Long Rest)'};
 if(has(c,'Telepathic')&&spell==='Detect Thoughts'&&remaining(c,r,'feat-spell:Detect Thoughts')>0)return {key:'feat-free:Detect Thoughts',label:'Telepathic · free Detect Thoughts (Long Rest)'};
 if(has(c,'Ritual Caster')&&(configured(c,'Ritual Caster').rituals||[]).includes(spell)&&remaining(c,r,'ritual-quick')>0)return {key:'feat-quick:'+spell,label:'Ritual Caster · Quick Ritual (Long Rest)'};
 return null;
}
function freeCast(c,r,spell,cost){const key=cost.startsWith('feat-quick:')?'ritual-quick':'feat-spell:'+spell;
 if(!freeOption(c,spell,r)||remaining(c,r,key)<1)throw Error('The selected feat free casting is unavailable.');
 const fs=normalize(c,r.featState||{},c);fs.charges[key]--;fs.last=(cost.startsWith('feat-quick:')?'Quick Ritual':'Free feat casting')+': '+spell;
 return {...r,featState:fs};
}
function use(state,kind,{confirmed=false,target='',amount=0,diceCount=1,damageType='',self=false,mode=''}={},roll=n=>1+Math.floor(Math.random()*n)){
 const c=state.character,r=state.resources||{},defs={
  'charger': 'Charger','crusher':'Crusher','grappler':'Grappler','piercer':'Piercer','slasher':'Slasher','shield-bash':'Shield Master',
  'combat-prowess':'Boon of Combat Prowess','fate':'Boon of Fate','mage-slayer-guard':'Mage Slayer',
  'fortitude-heal':'Boon of Fortitude','durable':'Durable','chef-prepare':'Chef','chef-eat':'Chef','inspiring-leader':'Inspiring Leader',
  'recovery-last-stand':'Boon of Recovery','recovery-dice':'Boon of Recovery','boon-speed-disengage':'Boon of Speed',
  'boon-dimensional':'Boon of Dimensional Travel','boon-night':'Boon of the Night Spirit',
  'boon-energy':'Boon of Energy Resistance','poisoner':'Poisoner','ritual-quick':'Ritual Caster',
  'telekinetic-shove':'Telekinetic','defensive-duelist':'Defensive Duelist','interception':'Fighting Style: Interception',
  'protection':'Fighting Style: Protection','polearm':'Polearm Master','sentinel':'Sentinel','dual-wielder':'Dual Wielder'
 };
 const feat=defs[kind];if(!feat||!has(c,feat))throw Error('This character does not have the selected feat.');
 if(!confirmed)throw Error('Confirm the triggering conditions and DM-controlled outcomes before recording a feat use.');
 const fs=normalize(c,r.featState||{},c),key=kind==='chef-eat'||kind==='chef-prepare'?'':kind;
 if(specs(c).some(x=>x.key===key)&&remaining(c,r,key)<=0)throw Error('No feat uses remain until the required rest or turn.');
 let nextR={...r},note=feat+': '+kind.replaceAll('-',' '),nextI=state.inventory;
 if(kind==='durable'){
  if(!(r.hitDice>0))throw Error('No Hit Dice remain to spend.');
  const die=Number(c.build?.hitDie)||8,val=roll(die);nextR.hitDice=r.hitDice-1;nextR.hp=Math.min(r.maxHp,r.hp+val);note='Durable: Bonus Action spent one d'+die+' Hit Die; rolled '+val+' healing.';
 }else if(kind==='chef-prepare'){
  if(fs.preparedChefTreats>0)throw Error('Existing Chef treats must be used or expire first.');
  fs.preparedChefTreats=PB(c);note='Chef: prepared '+PB(c)+' treats using Cook’s Utensils and ingredients (expire after eight hours; track timing at table).';
 }else if(kind==='chef-eat'){
  if(fs.preparedChefTreats<1)throw Error('No Chef treats prepared.');
  fs.preparedChefTreats--;if(self)nextR.tempHp=Math.max(r.tempHp||0,PB(c));
  note='Chef: Bonus Action, one treat consumed; '+PB(c)+' temporary HP'+(self?' applied to self':' offered to '+(target||'recipient')+' (other player applies)')+'.';
 }else if(kind==='recovery-dice'){
  const num=Number(diceCount);if(!Number.isInteger(num)||num<1||num>fs.charges['recovery-dice'])throw Error('Choose 1–'+remaining(c,r,'recovery-dice')+' recovery dice.');
  let sum=0;for(let i=0;i<num;i++)sum+=roll(10);nextR.hp=Math.min(r.maxHp,r.hp+sum);fs.charges['recovery-dice']-=num;note='Boon of Recovery: Bonus Action, spent '+num+'d10 and healed '+sum+'.';
 }else if(kind==='recovery-last-stand'){
  throw Error('Use Last Stand in the Incoming Damage popup when a confirmed hit would reduce HP to zero.');
 }else if(kind==='fortitude-heal'){
  const amountHeal=Math.max(0,MOD(c,'con'));nextR.hp=Math.min(r.maxHp,r.hp+amountHeal);note='Boon of Fortitude: extra '+amountHeal+' healing after confirmed healing this turn.';
 }else if(kind==='boon-night'){
  fs.nightSpiritActive=mode==='on';note='Boon of the Night Spirit: '+(fs.nightSpiritActive?'DM-confirmed Dim Light/Darkness, resistance active':'shadow condition ended')+'.';
 }else if(kind==='inspiring-leader'){
  const temp=c.level+Math.max(MOD(c,'wis'),MOD(c,'cha'));if(self)nextR.tempHp=Math.max(r.tempHp||0,temp);
  note='Inspiring Leader: after confirmed rest, '+temp+' temporary HP'+(self?' applied to self':' offered to '+(target||'eligible allies')+' (other players apply)')+'.';
 }else if(kind==='poisoner'){
  if(!((c.tools||[]).includes('Poisoner’s Kit')))throw Error('Poisoner’s Kit proficiency required.');
  const I=root.PipInventory||(typeof require==='function'?require('./inventory.js'):null);
  if((state.inventory?.currency?.gp||0)<50)throw Error('Poisoner requires 50 GP of materials. Add money to Inventory first.');
  nextI=I.adjustCurrency(state.inventory,'gp',50,'spend','Poisoner: crafted PB doses with one hour of work.');
  nextI=I.add(nextI,I.gear('poisoner-craft-'+Date.now()+'-'+Math.random().toString(36).slice(2),'Basic Poison (Poisoner)','consumable',PB(c),'Poisoner feat · craft after one hour, confirm application/effect with DM.'));
  note='Poisoner: 50 GP of materials spent; '+PB(c)+' doses of poison added to Inventory after confirmed one-hour crafting.';
 }else if(kind==='telekinetic-shove'){
  const ab=abilityFor(c,'Telekinetic');note='Telekinetic shove: Bonus Action, DC '+(8+PB(c)+MOD(c,ab||'int'))+' STR save for target '+(target||'chosen creature')+'; DM resolves success and movement.';
 }else if(kind==='boon-energy'){
  const types=configured(c,'Boon of Energy Resistance').resistances||[];
  if(!types.includes(damageType))throw Error('Damage type must be one of your two selected resistances.');
  note='Energy Redirection: Reaction after taking '+damageType+' damage; enemy rolls DC '+(8+PB(c)+MOD(c,'con'))+' DEX save against 2d12+CON damage; DM resolves.';
 }else if(kind==='fate'){
  let sum=roll(4)+roll(4);note='Boon of Fate: rolled 2d4 ('+sum+') to apply as a DM-confirmed bonus or penalty to an eligible d20 test.';
 }else if(kind==='combat-prowess')note='Boon of Combat Prowess: turn a confirmed missed attack into a hit once before your next turn; DM applies result.';
 else if(kind==='shield-bash')note='Shield Master: once this turn after a melee weapon hit, target STR save DC '+(8+PB(c)+MOD(c,'str'))+'; DM decides push 5 ft or Prone.';
 else if(kind==='defensive-duelist')note='Defensive Duelist: Reaction, add PB '+PB(c)+' to AC against the triggering melee hit; DM checks whether it misses.';
 else if(kind==='interception')note='Interception: Reaction, reduce an eligible nearby ally’s incoming damage by 1d10+'+PB(c)+'; confirm target and damage with DM.';
 else if(kind==='boon-speed-disengage')note='Boon of Speed: Bonus Action Disengage also ends Grappled on this character.';
 else if(kind==='boon-dimensional')note='Boon of Dimensional Travel: after Attack/Magic action, teleport up to 30 ft to a visible unoccupied space confirmed by DM.';
 else if(kind==='mage-slayer-guard')note='Mage Slayer: convert a failed INT, WIS or CHA save into success; once per Short/Long Rest.';
 else if(kind==='ritual-quick')note='Ritual Caster: one prepared feat ritual uses its normal casting time at no spell-slot cost; use Spellbook for real casting.';
 if(key&&kind!=='recovery-dice'&&specs(c).some(x=>x.key===key))fs.charges[key]--;
 // Class features and feat reactions share the same once-per-round reaction.
 const react=['defensive-duelist','interception','protection','sentinel','boon-energy'];
 if(react.includes(kind)){if(r.classState?.reactionUsed)throw Error('Reaction already used this round.');nextR.classState={...r.classState,reactionUsed:true};}
 fs.last=note;
 nextR={...nextR,featState:fs,lastClassEffect:{feature:'Feat',name:feat,note}};
 return {...state,resources:nextR,inventory:nextI};
}
const passive=c=>({speed:has(c,'Speedy')?10:0,boonSpeed:has(c,'Boon of Speed')?30:0,
 maxHp:has(c,'Boon of Fortitude')?40:0,truesight:has(c,'Boon of Truesight')?60:0,
 blindsight:has(c,'Skulker')||has(c,'Fighting Style: Blind Fighting')?10:0,
 resistances:has(c,'Boon of Energy Resistance')?configured(c,'Boon of Energy Resistance').resistances||[]:[]});
root.FolioFeat2024={PB,MOD,SKILLS,ENERGY,ELEMENTS,ABILITIES,granted,has,count,supported,configured,passive,specs,normalize,remaining,rest,restState,startTurn,initiative,abilityFor,validateChoices,reconcile,choose,spellsFor,freeOption,freeCast,use};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioFeat2024;
})(typeof window!=='undefined'?window:globalThis);
