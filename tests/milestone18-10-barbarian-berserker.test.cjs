'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const I=require('../js/inventory.js');require('../js/core.js');require('../js/data.js');require('../js/dice.js');require('../js/weapon-catalog.js');
const M=require('../js/class-mechanics.js'),W=require('../js/weapon-rules.js'),S=require('../js/storage.js');
function setup(n=3,subclass='Berserker',ability='str'){
 const c={templateKind:'starter',className:'Barbarian',subclass,level:n,scores:{str:16,dex:14,con:16,int:10,wis:10,cha:10},profSaves:['str','con'],profSkills:[],expertise:[],speed:30,build:{characterClass:'Barbarian',subclass}};
 const sword=I.gear('axe','Battleaxe','weapon',1,'',{equipped:true,weapon:{category:'Martial',kind:'Melee',damage:'1d8',type:'Slashing',properties:'Versatile',propertyList:['Versatile'],ability,grip:1}});
 return {character:c,resources:{hp:32,maxHp:60,tempHp:0,conditions:[],concentration:'',classResources:M.normalizeResources(c),classState:{},spellSlots:[]},inventory:{items:[sword]},encounter:{active:false,round:1,roster:[],currentId:null}};
}
const die=(d)=>d===20?15:d===6?4:5;
function roll(s,opts=null,mode='normal',targetAC=10,dice=die){return W.attack(s.character,s.inventory,'axe','melee',mode,targetAC,dice,s.resources,null,null,null,opts);}
function commit(s,a){return {...s,inventory:a.inventory,resources:a.resources||s.resources};}
test('Reckless Attack grants Strength attacks Advantage and tracks disadvantage against Barbarian until next turn',()=>{
 let s=setup(3);const a=roll(s,{reckless:true});
 assert.equal(a.result.rollMode,'advantage');assert.equal(a.result.rolls.length,2);
 assert.equal(a.result.barbarian.reckless,true);assert.match(a.result.message,/enemies have Advantage/);
 s=commit(s,a);assert.equal(s.resources.classState.recklessThisTurn,true);
 const b=roll(s);assert.equal(b.result.rollMode,'advantage','Reckless applies to subsequent Strength attacks this turn');
 const third=roll(commit(s,b),null,'disadvantage');assert.equal(third.result.rollMode,'normal','Advantage and Disadvantage cancel');
 const fresh=M.barbarianNewTurn(s);assert.equal(fresh.resources.classState.recklessThisTurn,false);
 assert.equal(roll(fresh).result.rollMode,'normal');
});
test('Reckless Attack must be chosen on first weapon attack of turn and never at level 1',()=>{
 assert.throws(()=>roll(setup(1),{reckless:true}),/level 2/);
 const s=setup(),first=commit(s,roll(s));
 assert.throws(()=>roll(first,{reckless:true}),/first attack roll/);
 assert.equal(roll(M.barbarianNewTurn(first),{reckless:true}).result.rollMode,'advantage');
 assert.throws(()=>M.barbarianNewTurn({...s,character:{...s.character,className:'Fighter',build:{characterClass:'Fighter'}}}),/Barbarians/);
});
test('Berserker Frenzy rolls Rage-bonus d6s on first qualifying hit, only once per turn',()=>{
 let s=M.startRage(setup(3)),a=roll(s,{reckless:true});
 assert.equal(a.result.barbarian.extraDamage,8);assert.equal(a.result.barbarian.diceRolled.length,2);
 assert.equal(a.result.damageComponents[0].amount,a.result.damage);
 assert.equal(a.result.damage,5+3+2+8);
 s=commit(s,a);assert.equal(s.resources.classState.frenzyUsedThisTurn,true);
 const repeat=roll(s);assert.equal(repeat.result.barbarian.extraDamage,0);
 const another=roll(M.barbarianNewTurn(s),{reckless:true});assert.equal(another.result.barbarian.extraDamage,8);
 assert.equal(another.result.damage,18);
});
test('Frenzy scales at levels 9 and 16, with extra dice doubled on a critical hit',()=>{
 for(const [n,expected] of [[3,4],[9,6],[16,8]]){
  let s=M.startRage(setup(n)),a=roll(s,{reckless:true},'normal',10,d=>d===20?20:d===6?4:5);
  assert.equal(a.result.critical,true);
  assert.equal(a.result.barbarian.diceRolled.length,expected);
  assert.equal(a.result.barbarian.extraDamage,4*expected);
  assert.equal(a.result.damageComponents[0].amount,a.result.damage);
 }
});
test('Frenzy does not apply when Rage is off, Reckless is unused, hit misses, or subclass is not Berserker',()=>{
 assert.equal(roll(setup(),{reckless:true}).result.barbarian.extraDamage,0);
 assert.equal(roll(M.startRage(setup())).result.barbarian.extraDamage,0);
 assert.equal(roll(M.startRage(setup(3,'Other')),{reckless:true}).result.barbarian.extraDamage,0);
 const miss=roll(M.startRage(setup()),{reckless:true},'normal',49,d=>d===20?2:4);
 assert.equal(miss.result.hit,false);assert.equal(miss.result.barbarian.extraDamage,0);
 const unknown=roll(M.startRage(setup()),{reckless:true},'normal',null);
 assert.equal(unknown.result.barbarian.extraDamage,0,'no unconfirmed hit effects');
});
test('Frenzy and Reckless use Strength, not Dexterity, and can apply on a thrown melee weapon',()=>{
 let s=M.startRage(setup(3,'Berserker','dex'));
 assert.equal(roll(s,{reckless:true}).result.rollMode,'normal');
 assert.equal(roll(s,{reckless:true}).result.barbarian.extraDamage,0);
 s=M.startRage(setup(3));s.inventory.items[0].weapon.properties='Versatile, Thrown';s.inventory.items[0].weapon.propertyList=['Versatile','Thrown'];
 const out=W.attack(s.character,s.inventory,'axe','throw','normal',10,die,s.resources,null,null,null,{reckless:true});
 assert.equal(out.result.barbarian.extraDamage,8);
});
test('Berserker level-6 Mindless Rage clears Charmed/Frightened and protects against reapplication',()=>{
 let s=setup(6);s.resources.conditions=['Charmed','Frightened','Poisoned'];
 assert.equal(M.mindlessRage(s.character,s.resources),false);
 const rage=M.startRage(s);
 assert.deepEqual(rage.resources.conditions,['Poisoned']);
 assert.equal(M.mindlessRage(rage.character,rage.resources),true);
 assert.equal(M.mindlessRage(rage.character,M.startRage(rage).resources),false);
 const lower=setup(5);lower.resources.conditions=['Charmed'];
 assert.deepEqual(M.startRage(lower).resources.conditions,['Charmed']);
});
test('Tracked encounter advances reset Reckless / Frenzy only when Barbarian turn begins',()=>{
 const s=setup(9);s.resources.classState={recklessThisTurn:true,barbarianAttackRolledThisTurn:true,frenzyUsedThisTurn:true};
 s.encounter={active:true,round:2,currentId:'enemy',roster:[{id:'me',isPip:true},{id:'enemy'}]};
 assert.equal(M.barbarianStartTurn(s),s);
 const next=M.barbarianStartTurn({...s,encounter:{...s.encounter,currentId:'me'}});
 assert.equal(next.resources.classState.frenzyUsedThisTurn,false);
 assert.equal(next.resources.classState.barbarianAttackRolledThisTurn,false);
 assert.equal(M.barbarianStartTurn(next),next,'must not rerun same turn');
});
test('Frenzy use and turn flags persist across backup-friendly clone and survive rest without missing state',()=>{
 let s=M.startRage(setup()),a=roll(s,{reckless:true});s=commit(s,a);
 let saved=S.clone(s);assert.equal(saved.resources.classState.frenzyUsedThisTurn,true);
 const rested=M.rest(saved.character,saved.resources.classResources,'short');
 assert.ok(rested.rage>=0);assert.equal(saved.resources.classState.recklessThisTurn,true);
});
test('Retaliation spends a Reaction on a Melee attack, not a normal-turn Frenzy, and refreshes at next turn',()=>{
 let s=M.startRage(setup(10));s.resources.classState={...s.resources.classState,recklessThisTurn:true};
 let atk=W.attack(s.character,s.inventory,'axe','melee','normal',10,die,s.resources,null,null,null,{retaliation:true});
 assert.equal(atk.result.barbarian.frenzy,false,'Frenzy only applies on own turn');
 assert.match(atk.result.message,/Retaliation/);
 s=commit(s,atk);assert.equal(s.resources.classState.reactionUsed,true);
 assert.equal(s.resources.classState.barbarianAttackRolledThisTurn,false,'off-turn reaction cannot consume first own-turn attack');
 assert.throws(()=>W.attack(s.character,s.inventory,'axe','melee','normal',10,die,s.resources,null,null,null,{retaliation:true}),/Reaction is already spent/);
 s=M.barbarianNewTurn(s);assert.equal(s.resources.classState.reactionUsed,false);
 assert.equal(s.resources.classState.recklessThisTurn,false);
 assert.throws(()=>W.attack(setup(9).character,setup(9).inventory,'axe','melee','normal',10,die,setup(9).resources,null,null,null,{retaliation:true}),/level 10/);
});
test('Retaliation rejects thrown and ranged attack mode',()=>{
 let s=setup(10);s.inventory.items[0].weapon.properties='Thrown';s.inventory.items[0].weapon.propertyList=['Thrown'];
 assert.throws(()=>W.attack(s.character,s.inventory,'axe','throw','normal',10,die,s.resources,null,null,null,{retaliation:true}),/Melee weapon attack/);
});
test('Berserker Intimidating Presence uses free charge, then Rage pool, and emits level-scaled Wisdom DC',()=>{
 let s=setup(14);assert.equal(M.resourcesFor(s.character).find(x=>x.key==='intimidating-presence').max,1);
 const out=M.useIntimidatingPresence(s,'free');
 assert.equal(out.resources.classResources['intimidating-presence'],0);
 assert.equal(out.resources.lastClassEffect.dc,16,'STR +3, proficiency +5');
 assert.equal(out.resources.classResources.rage,s.resources.classResources.rage);
 assert.throws(()=>M.useIntimidatingPresence(out,'free'),/free Intimidating Presence use is spent/);
 const rage=M.useIntimidatingPresence(out,'rage');
 assert.equal(rage.resources.classResources.rage,s.resources.classResources.rage-1);
 assert.equal(rage.resources.classResources['intimidating-presence'],0);
 assert.throws(()=>M.useIntimidatingPresence(s,'rage'),/remaining free/);
 const rested=M.rest(s.character,rage.resources.classResources,'long');assert.equal(rested['intimidating-presence'],1);
 assert.equal(rested.rage,M.resourcesFor(s.character).find(x=>x.key==='rage').max);
});
test('Intimidating Presence rejects wrong class, too low level, incapacitated state and exhausted resources',()=>{
 assert.throws(()=>M.useIntimidatingPresence(setup(13)),/level 14/);
 let s=setup(14);s.resources.conditions=['Stunned'];
 assert.throws(()=>M.useIntimidatingPresence(s),/Incapacitated/);
 s=setup(14);s.resources.classResources['intimidating-presence']=0;s.resources.classResources.rage=0;
 assert.throws(()=>M.useIntimidatingPresence(s,'rage'),/No Rage uses/);
 assert.throws(()=>M.useIntimidatingPresence(s,'bad'),/cost/);
});
