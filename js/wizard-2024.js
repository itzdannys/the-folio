(function(root){'use strict';
// 2024 Player's Handbook pp. 164–175. Local-only sheet rules; no creature simulation.
const clone=x=>JSON.parse(JSON.stringify(x));
const SCHOOL={Abjurer:'Abjuration',Diviner:'Divination',Evoker:'Evocation',Illusionist:'Illusion'};
const level=c=>Math.max(1,Math.min(20,Number(c?.level)||1));
const isWizard=c=>(c?.build?.characterClass||c?.className)==='Wizard'&&c?.templateKind==='starter';
const subclass=c=>isWizard(c)&&level(c)>=3?(c?.build?.subclass||c?.subclass||''):'';
const school=c=>SCHOOL[subclass(c)]||'';
const intMod=c=>Math.floor(((Number(c?.scores?.int)||10)-10)/2);
const pb=c=>2+Math.floor((level(c)-1)/4);
const fail=x=>{throw Error(x);};
function ensure(s,min=1){if(!isWizard(s?.character)||level(s.character)<min)fail('Requires Wizard level '+min+'.');}
const spellByKey=key=>root.FolioSpellRules?.catalog().find(x=>x.key===key);
const spellByName=name=>root.FolioSpellRules?.catalog().find(x=>x.name===name);
const capped=(n,min,max)=>Number.isInteger(n)&&n>=min&&n<=max;
const clean=x=>String(x||'').trim().slice(0,110);
const keys=c=>[...new Set([...(c?.build?.wizardResearchKeys||[]),...(c?.build?.wizardSavantKeys||[]),...(c?.build?.wizardCopiedKeys||[]),...(c?.build?.wizardLegacyKeys||[])])];
const hasBook=(c,sp)=>!!sp&&keys(c).includes(sp.key||sp.id);
const researchCap=c=>6+2*(level(c)-1);
const gainedTiers=c=>[2,3,4,5,6,7,8,9].filter(t=>level(c)>=2*t-1);
function savantSlots(c){return !school(c)?0:2+gainedTiers(c).length-1;}
function restState(c,g={},kind='short'){
 const out={...g,wizardShortRestReady:kind==='short',wizardMemorizedThisRest:false,wizardThirdEye:kind==='short'?null:g.wizardThirdEye||null,wizardThirdEyeUsed:kind==='short'?false:!!g.wizardThirdEyeUsed,wizardIllusorySelfUsed:kind==='short'?false:!!g.wizardIllusorySelfUsed,wizardTurnPortentUsed:false,wizardTurnTracking:false,wizardActionUsed:false,wizardBonusUsed:false,reactionUsed:false,wizardSlotUsed:false,wizardSignatureSpent:{}};
 if(kind==='long'){out.wizardShortRestReady=false;out.wizardWard=null;out.wizardPortents=[];out.wizardPortentRecorded=false;out.wizardSpellBreakerRefunded=false;out.wizardThirdEye=null;out.wizardThirdEyeUsed=false;out.wizardOverchannelCount=0;out.wizardIllusorySelfUsed=false;out.wizardSummonFreeUsed=false;out.wizardSignatureSpent={};out.wizardTurnPortentUsed=false;}
 return out;
}
function mergeLegacy(s){ensure(s);const c=s.character;if(c.build?.wizardBookInitialized)return s;
 const existing=(s.spellbook?.catalogSelections||[]).filter(k=>spellByKey(k)?.level>0&&spellByKey(k)?.classes?.includes('Wizard'));
 return {...s,character:{...c,build:{...c.build,wizardBookInitialized:true,wizardResearchKeys:[],wizardSavantKeys:[],wizardCopiedKeys:[],wizardLegacyKeys:[...new Set(existing)]}}};
}
function learn(s,key,mode='research',{confirmed=false}={}){
 ensure(s);s=mergeLegacy(s);const c=s.character,sp=spellByKey(key);if(!sp||!sp.classes?.includes('Wizard')||sp.level<1||sp.level>Math.ceil(level(c)/2))fail('Choose an eligible level 1+ Wizard spell from the catalogue.');
 if(hasBook(c,sp))fail('The spell is already in your Wizard spellbook.');
 if(sp.referenceOnly&&!confirmed)fail('Confirm the PHB source and level for this name-only reference.');
 const build={...c.build};let detail='';
 if(mode==='research'){if((build.wizardResearchKeys||[]).length>=researchCap(c))fail('Six initial spells + two research spells per new Wizard level already selected.');if(level(c)===1&&sp.level!==1)fail('The six starting Wizard spells must be level 1.');build.wizardResearchKeys=[...(build.wizardResearchKeys||[]),key];detail='Added to Wizard spellbook through level-based research.';}
 else if(mode==='copy'){if(!confirmed)fail('Confirm you found this spell in an authorized source and spent the required GP and transcription hours.');build.wizardCopiedKeys=[...(build.wizardCopiedKeys||[]),key];build.wizardInkGP=(build.wizardInkGP||0)+50*sp.level;build.wizardCopyHours=(build.wizardCopyHours||0)+2*sp.level;detail=`Copied from discovered source: ${50*sp.level} GP and ${2*sp.level} hours (player-confirmed).`;}
 else if(mode==='savant'){
  const required=school(c);if(!required||sp.school!==required)fail('Savant must choose a Wizard spell of your subclass school.');
  const old=build.wizardSavantKeys||[];
  if(old.length>=savantSlots(c))fail('All current subclass Savant grants have been chosen.');
  if(old.length<2){if(sp.level>2)fail('The two initial Savant spells must be level 1 or 2.');}
  else {const tiers=gainedTiers(c).slice(1),unfilledIndex=old.length-2,tier=tiers[unfilledIndex];if(!tier||sp.level>tier)fail('This Savant bonus corresponds to a new spell-slot tier; choose a spell no higher than level '+(tier||0)+'.');}
  build.wizardSavantKeys=[...old,key];detail='Free '+required+' Savant spellbook addition.';
 }else fail('Unknown acquisition method.');
 return {...s,character:{...c,build},resources:{...s.resources,lastClassEffect:{feature:'Wizard Spellbook',spell:sp.name,mode,note:detail}}};
}
function memorize(s,from,to){ensure(s,5);s=mergeLegacy(s);const c=s.character,g=s.resources.classState||{},b=s.spellbook;if(!g.wizardShortRestReady||g.wizardMemorizedThisRest)fail('Memorize Spell requires a completed Short Rest and can replace one spell after that rest.');
 const old=spellByKey(from),next=spellByKey(to);if(!old||!next||old.level<1||next.level<1||!hasBook(c,next)||!(b.catalogSelections||[]).includes(from)||b.catalogSelections.includes(to))fail('Replace one prepared level 1+ spell with a different leveled spell from your Wizard spellbook.');
 const changed=[...b.catalogSelections.filter(k=>k!==from),to];const prob=root.FolioSpellRules.selectionError(c,b,changed);if(prob)fail(prob);
 return {...s,spellbook:{...b,catalogSelections:changed},resources:{...s.resources,classState:{...g,wizardMemorizedThisRest:true},lastClassEffect:{feature:'Memorize Spell',from:old.name,to:next.name}}};
}
function configure(s,kind,values){ensure(s);s=mergeLegacy(s);const c=s.character,build={...c.build};
 const required=kind==='mastery'?[[1,2]]:kind==='signature'?[[3,3]]:null;if(!required)fail('Unknown Wizard spell choice.');
 if(level(c)<(kind==='mastery'?18:20))fail('Feature is not unlocked yet.');if(!Array.isArray(values)||values.length!==2||values[0]===values[1])fail('Choose two different spells.');
 values.forEach((key,i)=>{const sp=spellByKey(key),need=kind==='mastery'?i+1:3;if(!sp||!hasBook(c,sp)||sp.level!==need)fail('The chosen spell must be in your book at level '+need+'.');if(kind==='mastery'&&!/^\s*(?:1\s*)?action\s*$/i.test(sp.castingTime||''))fail('Spell Mastery requires a spell with an Action casting time verified in your source.');});
 build[kind==='mastery'?'wizardMasteryKeys':'wizardSignatureKeys']=[...values];return {...s,character:{...c,build},resources:{...s.resources,lastClassEffect:{feature:kind==='mastery'?'Spell Mastery':'Signature Spells',choices:values.map(key=>spellByKey(key).name)}}};
}
const autoKeys=c=>[...(subclass(c)==='Abjurer'&&level(c)>=10?['Counterspell','Dispel Magic'].map(n=>spellByName(n)?.key):[]),...(level(c)>=18?(c.build?.wizardMasteryKeys||[]):[]),...(level(c)>=20?(c.build?.wizardSignatureKeys||[]):[]),...(subclass(c)==='Illusionist'?[(spellByName('Minor Illusion')||{}).key,...(level(c)>=6?['Summon Beast','Summon Fey'].map(n=>spellByName(n)?.key):[])]:[])].filter(Boolean);
function freeOptions(c,sp,r={}){if(!isWizard(c)||!sp)return [];
 const k=sp.key||sp.id,g=r.classState||{},out=[];
 if(level(c)>=18&&(c.build?.wizardMasteryKeys||[]).includes(k))out.push({key:'wizard-mastery',label:'Spell Mastery · no slot (lowest level)'});
 if(level(c)>=20&&(c.build?.wizardSignatureKeys||[]).includes(k)&&!g.wizardSignatureSpent?.[k])out.push({key:'wizard-signature',label:'Signature Spell · level 3, no slot (Short Rest recharge)'});
 if(subclass(c)==='Illusionist'&&level(c)>=6&&['Summon Beast','Summon Fey'].includes(sp.name)&&!g.wizardSummonFreeUsed)out.push({key:'wizard-phantasmal',label:'Phantasmal Creatures · free Illusion variant (half creature HP)'});
 return out;
}
function castingKind(sp,cost,confirmedTime='',dispelBonus=false,c=null){
 if(cost==='ritual')return 'none';
 if(dispelBonus&&sp?.name==='Dispel Magic'&&subclass(c)==='Abjurer'&&level(c)>=10)return 'bonus';
 const t=String(sp?.time||sp?.castingTime||'').trim().toLowerCase();
 if(/bonus action/.test(t))return 'bonus';
 if(/reaction/.test(t))return 'reaction';
 if(/^(?:1\s*)?action$/.test(t))return 'action';
 return ['action','bonus','reaction'].includes(confirmedTime)?confirmedTime:'none';
}
function prepareCast(s,sp,cost,{confirmedTime='',overchannel=false,expertLevel=0,confirmedDamage=false,dispelBonus=false}={}){
 ensure(s);s=mergeLegacy(s);const c=s.character,g=s.resources.classState||{};if(!sp)fail('Select a Wizard spell.');
 const clsTime=String(sp.time||'').toLowerCase();if(sp.referenceOnly&&!/^(?:1\s*)?action$|bonus action|reaction|minute|hour|day/.test(clsTime)&&!['action','bonus','reaction'].includes(confirmedTime))fail('Verify the casting time for this name-only spell.');
 if(overchannel&&(subclass(c)!=='Evoker'||level(c)<14||!/^slot[1-5]$/.test(cost)||sp.level<1||!confirmedDamage))fail('Overchannel requires an Evoker level 14+ Wizard spell cast with a spell slot of level 1–5.');
 if(dispelBonus&&(subclass(c)!=='Abjurer'||level(c)<10||sp.name!=='Dispel Magic'))fail('Only a level 10+ Abjurer can cast Dispel Magic as a Bonus Action through Spell Breaker.');
 if(g.wizardTurnTracking){
  const k=castingKind(sp,cost,confirmedTime,dispelBonus,c);
  if(k==='none'&&cost!=='ritual')fail('Verify this spell casting time (Action / Bonus Action / Reaction) for your tracked Wizard turn.');
  if((k==='action'&&g.wizardActionUsed)||(k==='bonus'&&g.wizardBonusUsed)||(k==='reaction'&&g.reactionUsed))fail('This Wizard turn has already used its '+k+' allowance.');
  if(/^slot[1-9]$/.test(cost)&&k!=='reaction'&&g.wizardSlotUsed)fail('Only one spell slot may be expended to cast a spell per tracked Wizard turn.');
 }
 return s;
}
function postCast(s,sp,cost,{overchannel=false,expertLevel=0,confirmedTime='',dispelBonus=false}={},fn){ensure(s);const c=s.character,r={...s.resources},g={...(r.classState||{})};const slot=cost.startsWith('slot')?Number(cost.slice(4)):0,sub=subclass(c),n=level(c);let effect={feature:'Wizard spell cast',spell:sp.name,cost,note:'Target saves, positions and external effects remain DM-confirmed.'};
 if(sub==='Abjurer'&&sp.school==='Abjuration'&&slot){const max=Math.max(1,2*n+intMod(c));const old=g.wizardWard;const hp=Math.min(max,(old?.hp??max)+2*slot);g.wizardWard={hp,max,active:true};effect={...effect,ward:hp,note:'Arcane Ward created/recharged by a slotted Abjuration spell; uses once-per-Long-Rest creation.'};}
 if(sub==='Diviner'&&n>=6&&sp.school==='Divination'&&slot>=2&&expertLevel){if(!capped(expertLevel,1,Math.min(slot-1,5)))fail('Expert Divination can restore only a lower-level expended slot, maximum level 5.');const caps=c.build.slotMax||[],slots=[...(r.spellSlots||caps)],i=expertLevel-1;if((slots[i]||0)>=(caps[i]||0))fail('No expended level '+expertLevel+' spell slot exists to regain.');slots[i]++;r.spellSlots=slots;effect={...effect,feature:'Expert Divination',restoredLevel:expertLevel};}
 if(sub==='Evoker'&&n>=14&&overchannel){if(!slot||slot>5)fail('Overchannel must use a spell slot of levels 1–5.');const uses=g.wizardOverchannelCount||0;const diceCount=uses===0?0:slot*(uses+1);const rolls=Array.from({length:diceCount},()=>fn?fn(12):Math.floor(Math.random()*12)+1);const selfDamage=rolls.reduce((a,b)=>a+b,0);if(selfDamage){const Core=root.PipCore||(typeof require==='function'?require('./core.js'):null);Object.assign(r,Core.applyDamage(r,selfDamage));}g.wizardOverchannelCount=uses+1;effect={...effect,feature:'Overchannel',maximumDamage:true,spellSlot:slot,selfNecroticDamage:selfDamage,rolls,note:'Maximize spell damage this turn only; repeat-use Necrotic self-damage bypasses resistance and immunity. Enemy effects are DM-confirmed.'};}
 if(cost==='wizard-signature')g.wizardSignatureSpent={...(g.wizardSignatureSpent||{}),[sp.key||sp.id]:true};
 if(cost==='wizard-phantasmal'){g.wizardSummonFreeUsed=true;effect={...effect,feature:'Phantasmal Creatures',note:'Free Illusion-school summon, half the summoned creature’s HP. DM tracks companion and creature position.'};}
 if(sub==='Illusionist'&&sp.school==='Illusion'){effect={...effect,note:(effect.note||'')+' No verbal components; +60 ft range if original range is 10+ ft. Minor Illusion can be a Bonus Action and make sound + image.'};}
 if(g.wizardTurnTracking){const kind=castingKind(sp,cost,confirmedTime,dispelBonus,c);if(kind==='action')g.wizardActionUsed=true;else if(kind==='bonus')g.wizardBonusUsed=true;else if(kind==='reaction')g.reactionUsed=true;if(slot&&kind!=='reaction')g.wizardSlotUsed=true;}
 if(dispelBonus)effect={...effect,note:(effect.note||'')+' Dispel Magic was cast as a Bonus Action using Spell Breaker; add Proficiency Bonus to its dispelling ability check.'};
 g.wizardLastCast={key:sp.key||sp.id,name:sp.name,slot,cost,school:sp.school,refundUsed:false};
 return {...s,resources:{...r,classState:g,lastClassEffect:effect}};
}
function consumeWard(s,amount,{projected=false,target='',confirmed=false}={}){ensure(s,3);if(subclass(s.character)!=='Abjurer')fail('Arcane Ward belongs to the Abjurer.');const g={...(s.resources.classState||{})},w=g.wizardWard;if(!w?.active||w.hp<1)fail('No active Arcane Ward HP.');if(!capped(amount,0,99999))fail('Confirm a nonnegative resolved incoming damage value.');if(projected&&(!confirmed||!clean(target)||level(s.character)<6))fail('Projected Ward requires Abjurer level 6, a visible ally within 30 ft and a confirmed damage event.');
 if(projected&&g.reactionUsed)fail('Reaction has already been spent.');const absorbed=Math.min(w.hp,amount);g.wizardWard={...w,hp:w.hp-absorbed};if(projected)g.reactionUsed=true;
 return {...s,resources:{...s.resources,classState:g,lastClassEffect:{feature:projected?'Projected Ward':'Arcane Ward',target:projected?clean(target):'Self',absorbed,remainingDamage:amount-absorbed,note:projected?'Apply remaining damage on the ally’s own sheet. DM confirms ally resistance and range.':'Ward HP absorbed damage before normal HP.'}}};
}
function repairWard(s,slot){ensure(s,3);if(subclass(s.character)!=='Abjurer')fail('Requires Abjurer.');if(!capped(slot,1,9))fail('Choose valid slot level.');const r=s.resources,g={...(r.classState||{})},w=g.wizardWard;if(!w?.active)fail('Create the ward with a slotted Abjuration spell first.');if(g.wizardBonusUsed)fail('Bonus Action already used this turn.');const slots=[...(r.spellSlots||[])];if((slots[slot-1]||0)<1)fail('Not enough spell slots.');slots[slot-1]--;g.wizardBonusUsed=true;g.wizardWard={...w,hp:Math.min(w.max,w.hp+2*slot)};
 return {...s,resources:{...r,spellSlots:slots,classState:g,lastClassEffect:{feature:'Arcane Ward · restore',recovered:g.wizardWard.hp-w.hp}}};
}
function portent(s,{index=0,target='',confirmed=false,rollNow=false}={},fn){ensure(s,3);if(subclass(s.character)!=='Diviner')fail('Portent requires Diviner.');const g={...(s.resources.classState||{})};if(rollNow){if(g.wizardPortentRecorded)fail('Portent dice already recorded for today.');const dice=level(s.character)>=14?3:2;g.wizardPortents=Array.from({length:dice},()=>({value:fn?fn(20):Math.floor(Math.random()*20)+1,used:false}));g.wizardPortentRecorded=true;return {...s,resources:{...s.resources,classState:g,lastClassEffect:{feature:'Portent dice',rolls:g.wizardPortents.map(v=>v.value)}}};}
 if(!confirmed||!clean(target))fail('Confirm a visible creature and replace its D20 Test BEFORE the roll.');if(g.wizardTurnPortentUsed)fail('Only one Portent substitution per turn. Reset with New Turn.');const dice=g.wizardPortents||[];if(!capped(index,0,dice.length-1)||dice[index].used)fail('The chosen Portent die is unavailable.');const value=dice[index].value;g.wizardPortents=dice.map((v,i)=>i===index?{...v,used:true}:v);g.wizardTurnPortentUsed=true;return {...s,resources:{...s.resources,classState:g,lastClassEffect:{feature:'Portent',target:clean(target),d20:value,note:'Replace one confirmed D20 Test before rolling. DM confirms the resulting check/save/attack outcome.'}}};
}
function action(s,kind,o={},fn){ensure(s);const c=s.character,n=level(c),sub=subclass(c),r={...s.resources},g={...(r.classState||{})},slots=[...(r.spellSlots||[])],confirm=()=>{if(!o.confirmed)fail('Confirm the triggering event and any DM-controlled condition first.');};let ef={feature:'Wizard '+kind};
 switch(kind){
 case 'turn':g.wizardTurnTracking=true;g.wizardTurnPortentUsed=false;g.wizardActionUsed=false;g.wizardBonusUsed=false;g.reactionUsed=false;g.wizardSlotUsed=false;ef.feature='Wizard · new turn';break;
 case 'spell-breaker':{if(sub!=='Abjurer'||n<10)fail('Spell Breaker requires Abjurer level 10.');confirm();const cast=g.wizardLastCast;if(!cast||!['Counterspell','Dispel Magic'].includes(cast.name)||!cast.slot||cast.refundUsed)fail('Confirm the latest slotted Counterspell/Dispel Magic failed to stop a spell and is not already refunded.');const cap=c.build.slotMax[cast.slot-1]||0;if((slots[cast.slot-1]||0)>=cap)fail('The spent slot is already filled.');slots[cast.slot-1]++;g.wizardLastCast={...cast,refundUsed:true};ef={feature:'Spell Breaker',slotLevel:cast.slot,note:'Refunded the confirmed failed abjuration slot. Dispel Magic may use a Bonus Action; add proficiency to its ability check.'};break;}
 case 'third-eye':if(sub!=='Diviner'||n<10)fail('The Third Eye requires Diviner level 10.');if(g.wizardThirdEyeUsed)fail('The Third Eye is spent until the next Short Rest.');if(g.wizardBonusUsed)fail('Bonus Action already used.');if(!['Darkvision','Greater Comprehension','See Invisibility'].includes(o.choice))fail('Choose an eligible Third Eye sense.');g.wizardBonusUsed=true;g.wizardThirdEyeUsed=true;g.wizardThirdEye=o.choice;ef={feature:'The Third Eye',choice:o.choice,note:'Sense lasts until the next rest. See Invisibility is a free casting; DM determines what can be perceived.'};break;
 case 'illusory-self':if(sub!=='Illusionist'||n<10)fail('Illusory Self requires Illusionist level 10.');confirm();if(g.reactionUsed)fail('Reaction already used.');if(g.wizardIllusorySelfUsed){if(!capped(o.slot,2,9)||!slots[o.slot-1])fail('Recharge requires spending a level 2+ spell slot.');slots[o.slot-1]--;}
  g.reactionUsed=true;g.wizardIllusorySelfUsed=true;ef={feature:'Illusory Self',note:'DM-confirmed triggering attack automatically misses you. Reaction spent.'};break;
 case 'illusory-reality':if(sub!=='Illusionist'||n<14)fail('Illusory Reality requires Illusionist level 14.');confirm();if(g.wizardBonusUsed)fail('Bonus Action used.');if(!clean(o.target))fail('Name the nonmagical inanimate object from an ongoing slotted Illusion spell.');g.wizardBonusUsed=true;ef={feature:'Illusory Reality',object:clean(o.target),note:'Object becomes real for 1 minute but cannot deal damage or impose conditions. DM confirms illusion and object.'};break;
 case 'sculpt':if(sub!=='Evoker'||n<6)fail('Sculpt Spells requires Evoker level 6.');confirm();if(!capped(o.slot,0,9)||!capped(o.count,1,1+o.slot))fail('Choose up to 1 + Evocation spell level visible creatures.');ef={feature:'Sculpt Spells',count:o.count,note:'Selected creatures automatically succeed on saves, and take no half-on-save damage. Creature selection DM-confirmed.'};break;
 case 'overchannel':if(sub!=='Evoker'||n<14)fail('Overchannel requires Evoker level 14.');confirm();if(!capped(o.slot,1,5)||!o.damage)fail('Confirm a damaging slotted Wizard spell level 1–5.');{const uses=g.wizardOverchannelCount||0;const dmg=Array.from({length:uses?o.slot*(uses+1):0},()=>fn?fn(12):Math.floor(Math.random()*12)+1).reduce((a,b)=>a+b,0);g.wizardOverchannelCount=uses+1;r.hp=Math.max(0,r.hp-dmg);ef={feature:'Overchannel',maximumDamage:true,selfDamage:dmg,note:'Maximize confirmed spell damage on cast turn. Necrotic self-damage bypasses resistance and immunity.'};}break;
 default:fail('Unknown Wizard ability.');
 }
 return {...s,resources:{...r,spellSlots:slots,classState:g,lastClassEffect:ef}};
}
function schoolGrants(c){if(!isWizard(c))return [];const names=autoKeys(c).map(k=>spellByKey(k)?.name).filter(Boolean);return [...new Set(names)];}
root.FolioWizard2024={isWizard,subclass,school,keys,hasBook,researchCap,savantSlots,gainedTiers,restState,mergeLegacy,learn,memorize,configure,autoKeys,freeOptions,prepareCast,postCast,consumeWard,repairWard,portent,action,schoolGrants,intMod,pb};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioWizard2024;
})(typeof window!=='undefined'?window:globalThis);
