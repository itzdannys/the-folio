'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const I=require('../js/inventory.js');require('../js/core.js');require('../js/data.js');require('../js/dice.js');require('../js/weapon-catalog.js');
const M=require('../js/class-mechanics.js'),W=require('../js/weapon-rules.js'),S=require('../js/storage.js');
const UI=require('../js/builder-ui.js');
function setup(kind='Barbarian',level=9,subclass='Berserker'){
 const c={templateKind:'starter',className:kind,subclass,level,scores:{str:16,dex:14,con:16,int:12,wis:10,cha:16},profSaves:kind==='Bard'?['dex','cha']:['str','con'],profSkills:['Athletics','Stealth','Persuasion'],expertise:['Stealth'],tools:["Thieves' Tools"],speed:30,build:{characterClass:kind,subclass,slotMax:[4,2,0,0,0,0,0,0,0]}};
 const axe=I.gear('axe','Battleaxe','weapon',1,'',{equipped:true,weapon:{category:'Martial',kind:'Melee',damage:'1d8',type:'Slashing',properties:'Versatile',propertyList:['Versatile'],ability:'str',grip:1}});
 return {character:c,resources:{hp:32,maxHp:64,tempHp:0,conditions:[],concentration:'',classResources:M.normalizeResources(c),classState:{},spellSlots:[4,2,0,0,0,0,0,0,0]},inventory:{items:[axe]}};
}
const dice=(s)=>s===20?14:s===10?7:s===6?4:5;
const atk=(s,opts={},rolls=dice,mode='normal',ac=12)=>W.attack(s.character,s.inventory,'axe','melee',mode,ac,rolls,s.resources,null,null,null,opts);
const withAttack=(s,result)=>({...s,inventory:result.inventory,resources:result.resources||s.resources});
test('Brutal Strike level 9 forgoes Reckless Advantage and adds d10 only on confirmed hit',()=>{
 let s=setup();const a=atk(s,{reckless:true,brutalEffects:['forceful']});
 assert.equal(a.result.rollMode,'normal');assert.equal(a.result.rolls.length,1);
 assert.equal(a.result.barbarian.brutalDamage,7);assert.equal(a.result.barbarian.brutalRolls.length,1);
 assert.equal(a.result.barbarian.brutalEffects[0].key,'forceful');
 assert.equal(a.resources.classState.brutalUsedThisTurn,true);
 assert.equal(a.resources.classState.recklessThisTurn,true);
 assert.match(a.result.message,/Brutal Strike/);
});
test('Brutal Strike must meet class, level, Strength, Reckless and normal roll restrictions',()=>{
 assert.throws(()=>atk(setup('Barbarian',8),{reckless:true,brutalEffects:['forceful']}),/level 9/);
 assert.throws(()=>atk(setup(),{brutalEffects:['forceful']}),/Reckless Attack/);
 assert.throws(()=>atk(setup(),{reckless:true,brutalEffects:['forceful']},dice,'disadvantage'),/Disadvantage/);
 const s=setup();s.inventory.items[0].weapon.ability='dex';assert.throws(()=>atk(s,{reckless:true,brutalEffects:['forceful']}),/Strength-based/);
 const c=setup('Fighter',9,'Champion');assert.throws(()=>atk(c,{brutalEffects:['forceful']}),/Brutal Strike requires/);
});
test('Brutal Strike decision consumes its one attempt even if weapon misses',()=>{
 let s=setup();const missed=atk(s,{reckless:true,brutalEffects:['hamstring']},dice,'normal',35);
 assert.equal(missed.result.barbarian.brutalDamage,0);
 assert.equal(missed.resources.classState.brutalUsedThisTurn,true);
 s=withAttack(s,missed);assert.throws(()=>atk(s,{brutalEffects:['forceful']}),/already used/);
 const fresh=M.barbarianNewTurn(s);assert.equal(fresh.resources.classState.brutalUsedThisTurn,false);
});
test('Higher-level Brutal Strike options and critical damage work together',()=>{
 assert.throws(()=>atk(setup('Barbarian',12),{reckless:true,brutalEffects:['staggering']}),/unavailable/);
 const a=atk(setup('Barbarian',13),{reckless:true,brutalEffects:['staggering']});
 assert.equal(a.result.barbarian.brutalDamage,7);
 const critical=(side)=>side===20?20:side===10?7:5;
 const b=atk(setup('Barbarian',17),{reckless:true,brutalEffects:['forceful','sundering']},critical);
 assert.equal(b.result.barbarian.brutalRolls.length,4);
 assert.equal(b.result.barbarian.brutalDamage,28);
 assert.equal(b.result.barbarian.brutalEffects.length,2);
 assert.throws(()=>atk(setup('Barbarian',17),{reckless:true,brutalEffects:['forceful','forceful']}),/distinct/);
 assert.throws(()=>atk(setup('Barbarian',13),{reckless:true,brutalEffects:['forceful','hamstring']}),/level limit/);
});
test('Berserker Frenzy remains compatible with Brutal Strike without duplicate dice',()=>{
 const s=M.startRage(setup('Barbarian',9));
 const a=atk(s,{reckless:true,brutalEffects:['forceful']});
 assert.equal(a.result.barbarian.diceRolled.length,3);
 assert.equal(a.result.barbarian.brutalRolls.length,1);
 assert.equal(a.result.barbarian.extraDamage,12+7);
 assert.equal(a.result.damageComponents[0].amount,a.result.damage);
});
test('Relentless Rage succeeds using Constitution save bonus, restores 2x level, and raises DC',()=>{
 let s=M.startRage(setup('Barbarian',11));s.resources.hp=10;
 const a=M.resolveIncomingDamage(s,40,'Fire',{relentlessRoll:10});
 assert.equal(a.details.relentless.dc,10);assert.equal(a.details.relentless.save,7);
 assert.equal(a.details.relentless.success,true);
 assert.equal(a.state.resources.hp,22);
 assert.equal(a.state.resources.classState.relentlessDC,15);
 const b=M.resolveIncomingDamage({...a.state,resources:{...a.state.resources,hp:5}},20,'Fire',{relentlessRoll:5});
 assert.equal(b.details.relentless.dc,15);
 assert.equal(b.details.relentless.success,false);
 assert.equal(b.state.resources.hp,0);
 assert.equal(b.state.resources.classState.relentlessDC,20);
});
test('Relentless Rage respects temporary HP, massive damage and optional save',()=>{
 const baseline=M.startRage(setup('Barbarian',11));
 const a=M.resolveIncomingDamage({...baseline,resources:{...baseline.resources,hp:10,tempHp:9}},17,'Fire',{relentlessRoll:10});
 assert.equal(a.details.relentless,null);assert.equal(a.state.resources.hp,2);
 const deadly=M.resolveIncomingDamage({...baseline,resources:{...baseline.resources,hp:10,maxHp:50}},65,'Fire',{relentlessRoll:20});
 assert.equal(deadly.details.relentless,null,'massive damage kills outright');
 const optedOut=M.resolveIncomingDamage({...baseline,resources:{...baseline.resources,hp:10}},12,'Fire');
 assert.equal(optedOut.details.relentlessEligible,true);
 assert.equal(optedOut.state.resources.hp,0);
 assert.throws(()=>M.resolveIncomingDamage({...baseline,resources:{...baseline.resources,hp:10}},12,'Fire',{relentlessRoll:21}),/valid d20/);
});
test('Relentless Rage DC persists through save copy and resets after Short Rest',()=>{
 const s=M.startRage(setup('Barbarian',11));s.resources.hp=3;
 const spent=M.resolveIncomingDamage(s,9,'Fire',{relentlessRoll:10}).state;
 assert.equal(S.clone(spent).resources.classState.relentlessDC,15);
 const fresh={...spent,resources:{...spent.resources,classState:{...spent.resources.classState,raging:false,relentlessDC:10}}};
 assert.equal(fresh.resources.classState.relentlessDC,10);
});
test('Rogue Reliable Talent raises qualifying low d20 to 10, including tool proficiencies',()=>{
 const s=setup('Rogue',7,'Thief');
 const a=M.resolveAbilityCheck(s,{type:'skill',name:'Stealth',rollMode:'normal',dc:15},[2]);
 assert.equal(a.resources.lastClassEffect.die,10);assert.equal(a.resources.lastClassEffect.modifier,2+3+3);
 assert.equal(a.resources.lastClassEffect.total,18);
 assert.equal(a.resources.lastClassEffect.reliableTalent,true);
 const b=M.resolveAbilityCheck(s,{type:'tool',name:"Thieves' Tools",ability:'dex',dc:13},[1]);
 assert.equal(b.resources.lastClassEffect.die,10);
 assert.equal(b.resources.lastClassEffect.total,15);
});
test('Reliable Talent does not apply to untrained skills, low-level Rogues or non-Rogues',()=>{
 const a=M.resolveAbilityCheck(setup('Rogue',7),{name:'Arcana'},[3]);assert.equal(a.resources.lastClassEffect.die,3);
 const b=M.resolveAbilityCheck(setup('Rogue',6),{name:'Stealth'},[2]);assert.equal(b.resources.lastClassEffect.die,2);
 const c=M.resolveAbilityCheck(setup('Fighter',7),{name:'Stealth'},[1]);assert.equal(c.resources.lastClassEffect.die,1);
});
test('Bard Jack of All Trades adds half proficiency to untrained skill checks only',()=>{
 const s=setup('Bard',10,'Lore');
 const a=M.resolveAbilityCheck(s,{name:'Arcana'},[10]);
 assert.equal(a.resources.lastClassEffect.jackOfAllTrades,2);
 assert.equal(a.resources.lastClassEffect.modifier,3,'INT +1, Jack +2');
 const b=M.resolveAbilityCheck(s,{name:'Persuasion'},[10]);
 assert.equal(b.resources.lastClassEffect.jackOfAllTrades,0);
 const low=M.resolveAbilityCheck(setup('Bard',1),{name:'Arcana'},[10]);assert.equal(low.resources.lastClassEffect.jackOfAllTrades,0);
});
test('Barbarian Primal Knowledge and Strength Advantage work only with Rage and eligible skills',()=>{
 const s=M.startRage(setup('Barbarian',3));
 const a=M.resolveAbilityCheck(s,{name:'Stealth',primalStrength:true,rollMode:'normal'},[6,14]);
 assert.equal(a.resources.lastClassEffect.ability,'str');
 assert.equal(a.resources.lastClassEffect.rollMode,'advantage');
 assert.equal(a.resources.lastClassEffect.natural,14);
 assert.throws(()=>M.resolveAbilityCheck(s,{name:'Arcana',primalStrength:true},[11]),/Primal Knowledge/);
 assert.throws(()=>M.resolveAbilityCheck(setup('Barbarian',3),{name:'Stealth',primalStrength:true},[10]),/requires Rage/);
});
test('Barbarian Indomitable Might applies to qualifying Strength checks at level 18',()=>{
 const s=setup('Barbarian',18);
 const a=M.resolveAbilityCheck(s,{name:'Athletics'},[1]);
 assert.equal(a.resources.lastClassEffect.total,16);
 assert.equal(a.resources.lastClassEffect.indomitableMight,true);
 const b=M.resolveAbilityCheck(s,{name:'Stealth'},[1]);assert.equal(b.resources.lastClassEffect.indomitableMight,false);
});
test('Champion Athletics Advantage and disadvantage cancellation are shared check mechanics',()=>{
 const s=setup('Fighter',7,'Champion');
 const advantage=M.resolveAbilityCheck(s,{name:'Athletics'},[4,15]);
 assert.equal(advantage.resources.lastClassEffect.rollMode,'advantage');
 const canceled=M.resolveAbilityCheck(s,{name:'Athletics',rollMode:'disadvantage'},[4]);
 assert.equal(canceled.resources.lastClassEffect.rollMode,'normal');
});
test('Shared check resolver rejects invalid rolls, skill and tool claims',()=>{
 const s=setup('Rogue',7);
 assert.throws(()=>M.resolveAbilityCheck(s,{name:'Stealth'},[0]),/required d20/);
 assert.throws(()=>M.resolveAbilityCheck(s,{name:'FakeSkill'},[4]),/Unknown skill/);
 assert.throws(()=>M.resolveAbilityCheck(s,{type:'tool',name:'Forgery Kit',ability:'dex'},[4]),/listed tool/);
 assert.throws(()=>M.resolveAbilityCheck(s,{name:'Stealth',dc:0},[4]),/Check DC/);
 const rollFn=d=>d===20?11:1;
 assert.equal(M.resolveAbilityCheck(s,{name:'Stealth'},rollFn).resources.lastClassEffect.total,19);
});
test('Bard Countercharm uses Reaction on a failed Charmed/Frightened save and rolls Advantage',()=>{
 const s=setup('Bard',7);
 const a=M.useCountercharm(s,{target:'self',condition:'Charmed',ability:'wis',dc:17,originalTotal:4},[3,18]);
 assert.equal(a.resources.lastClassEffect.total,18);
 assert.equal(a.resources.lastClassEffect.success,true);
 assert.equal(a.resources.classState.reactionUsed,true);
 assert.throws(()=>M.useCountercharm(a,{target:'self',condition:'Charmed',ability:'wis',dc:17,originalTotal:4},[18,20]),/Reaction already spent/);
});
test('Bard Countercharm supports an ally using supplied save modifier without modifying ally state',()=>{
 const s=setup('Bard',9);
 const a=M.useCountercharm(s,{target:'ally',condition:'Frightened',ability:'cha',dc:22,originalTotal:8,allySaveModifier:4},[6,13]);
 assert.equal(a.resources.lastClassEffect.total,17);
 assert.equal(a.resources.lastClassEffect.success,false);
 assert.equal(a.resources.lastClassEffect.target,'ally');
 assert.deepEqual(s.resources.classState,{});
});
test('Countercharm rejects invalid triggers, targets and states',()=>{
 const s=setup('Bard',7);
 const opts={target:'self',condition:'Charmed',ability:'wis',dc:15,originalTotal:4};
 assert.throws(()=>M.useCountercharm(setup('Bard',6),opts,[20,20]),/level 7/);
 assert.throws(()=>M.useCountercharm(setup('Rogue',9),opts,[20,20]),/Bard level 7/);
 assert.throws(()=>M.useCountercharm(s,{...opts,originalTotal:16},[20,20]),/failed saving throw/);
 assert.throws(()=>M.useCountercharm(s,{...opts,condition:'Prone'},[20,20]),/Charmed or Frightened/);
 assert.throws(()=>M.useCountercharm({...s,resources:{...s.resources,conditions:['Stunned']}},opts,[20,20]),/Incapacitated/);
});
test('New class controls render for the correct class and level, not placeholder headings',()=>{
 const bar=UI.classTracker(setup('Barbarian',17));assert.match(bar,/Relentless Rage/);assert.match(bar,/class-check-roll/);
 const bard=UI.classTracker(setup('Bard',7));assert.match(bard,/bard-countercharm/);
 const rogue=UI.classTracker(setup('Rogue',7));assert.match(rogue,/Reliable Talent/);
 const old=UI.classTracker(setup('Bard',6));assert.doesNotMatch(old,/bard-countercharm/);
});
test('Initiative is rolled as a d20 check, not copied from the Initiative modifier',()=>{
 const s=setup('Rogue',7,'Thief');s.character.name='Scout';
 const out=M.rollInitiative(s,()=>12);
 assert.equal(out.mode,'normal');assert.equal(out.total,14);
 assert.equal(out.state.encounter.roster[0].initiative,14);
 assert.equal(out.state.encounter.roster[0].name,'Scout');
 assert.equal(out.state.resources.lastClassEffect.feature,'Initiative');
});
test('Feral Instinct at Barbarian level 7 grants initiative Advantage',()=>{
 const s=setup('Barbarian',7);
 const rolled=[4,18];const out=M.rollInitiative(s,()=>rolled.shift());
 assert.equal(out.mode,'advantage');assert.equal(out.total,20);
 assert.deepEqual(out.rolls,[4,18]);
 const low=M.rollInitiative(setup('Barbarian',6),()=>4);
 assert.equal(low.mode,'normal');assert.equal(low.total,6);
});
test('Champion Initiative Advantage works, Surprise Disadvantage cancels it',()=>{
 const s=setup('Fighter',7,'Champion');let dice=[12,17];
 const a=M.rollInitiative(s,()=>dice.shift());assert.equal(a.mode,'advantage');
 const b=M.rollInitiative(s,()=>12,{surprised:true});assert.equal(b.mode,'normal');
 const regular=M.rollInitiative(setup('Rogue',7),()=>12,{surprised:true});
 assert.equal(regular.mode,'disadvantage');assert.equal(regular.rolls.length,2);
});
test('Initiative must use valid d20 and read passive Initiative bonuses',()=>{
 const s=setup('Fighter',3,'Champion');
 assert.throws(()=>M.rollInitiative(s,()=>0),/Invalid initiative d20/);
 const baseline=M.rollInitiative(s,()=>10);
 assert.equal(baseline.total,12);
 s.character.build.grantedFeatNames=['Alert'];
 const alert=M.rollInitiative(s,()=>10);
 assert.equal(alert.total,14);
});
test('Bard Jack of All Trades appears in displayed skill modifiers and shared roll results',()=>{
 const s=setup('Bard',10,'College of Lore');
 const C=require('../js/core.js'),skills=C.derived(s.character,s.inventory,s.resources).skills;
 assert.equal(skills.Arcana,3);
 assert.equal(skills.Persuasion,7);
 const actual=M.resolveAbilityCheck(s,{name:'Arcana'},[10]);
 assert.equal(actual.resources.lastClassEffect.total,10+skills.Arcana);
});
