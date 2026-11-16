'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const I=require('../js/inventory.js');require('../js/core.js');
require('../js/dice.js');require('../js/data.js');require('../js/weapon-catalog.js');
const M=require('../js/class-mechanics.js'), W=require('../js/weapon-rules.js');
function make(sub='Oath of Glory',level=20){
 const c={templateKind:'starter',className:'Paladin',subclass:sub,level,
  scores:{str:16,dex:12,con:14,int:10,wis:10,cha:18},profSaves:['wis','cha'],
  build:{characterClass:'Paladin',subclass:sub,slotMax:[4,3,3,2,1,0,0,0,0]}};
 const sword=I.gear('sword','Longsword','weapon',1,'',{equipped:true,weapon:{category:'Martial',kind:'Melee',damage:'1d8',type:'Slashing',properties:'Versatile',propertyList:['Versatile'],ability:'str',grip:1}});
 const bow=I.gear('bow','Longbow','weapon',1,'',{equipped:false,weapon:{category:'Martial',kind:'Ranged',damage:'1d8',type:'Piercing',properties:'Two-Handed',propertyList:['Two-Handed'],ability:'dex',grip:2}});
 return {character:c,inventory:{items:[sword,bow]},resources:{hp:70,maxHp:80,tempHp:0,conditions:[],classState:{},classResources:M.normalizeResources(c),spellSlots:[4,3,3,2,1,0,0,0,0],concentration:''}};
}
const roll=(sides)=>sides===20?14:4;
const weak=(sides)=>sides===20?1:4;
function attack(s,opts={},targetAC=12,rollFn=roll,mode='melee',id='sword',smite=null){return W.attack(s.character,s.inventory,id,mode,'normal',targetAC,rollFn,s.resources,null,null,smite,null,null,opts);}
const gloryOpts={gloryCounterattack:true,gloryAttackerConfirmed:true,gloryInRange:true};
const revengeOpts={relentlessOpportunity:true,opportunityConfirmed:true,opportunityInReach:true};
const legendOpts={livingLegendUnerring:true,ownTurnConfirmed:true};

test('Glorious Defense creates follow-up only when AC turns hit into a miss',()=>{
 const a=M.gloriousDefense(make(),{attackTotal:18,targetAC:15});
 assert.equal(a.resources.classState.gloryCounterattackPending,true);
 assert.equal(a.resources.classState.reactionUsed,true);
 assert.equal(a.resources.classResources['glorious-defense'],3);
 const b=M.gloriousDefense(make(),{attackTotal:22,targetAC:15});
 assert.equal(b.resources.lastClassEffect.avoided,false);
 assert.equal(b.resources.classState.gloryCounterattackPending,false);
});
test('Glorious Defense counterattack reuses Reaction, applies weapon damage and consumes pending follow-up',()=>{
 const s=M.gloriousDefense(make(),{attackTotal:18,targetAC:15});
 const originalCharges=s.resources.classResources['glorious-defense'];
 const out=attack(s,gloryOpts);
 assert.equal(out.result.hit,true);
 assert.equal(out.result.gloriousDefenseCounterattack,true);
 assert.equal(out.resources.classState.reactionUsed,true);
 assert.equal(out.resources.classState.gloryCounterattackPending,false);
 assert.equal(out.resources.classResources['glorious-defense'],originalCharges);
 assert.equal(out.resources.lastClassEffect.feature,'Glorious Defense counterattack');
 assert.ok(out.result.damage>0);
 assert.throws(()=>attack({...s,resources:out.resources},gloryOpts),/awaiting its counterattack/);
});
test('Glorious Defense follow-up spends no second Reaction even if the attack misses',()=>{
 const s=M.gloriousDefense(make(),{attackTotal:18,targetAC:15});
 const out=attack(s,gloryOpts,40,weak);
 assert.equal(out.result.hit,false);assert.equal(out.resources.classState.reactionUsed,true);
 assert.equal(out.resources.classState.gloryCounterattackPending,false);
});
test('Glorious Defense rejects unsupported level, no prevented hit, missing confirmation, missing AC and Divine Smite',()=>{
 assert.throws(()=>attack(make('Oath of Glory',14),gloryOpts),/level 15/);
 const s=M.gloriousDefense(make(),{attackTotal:21,targetAC:15});
 assert.throws(()=>attack(s,gloryOpts),/awaiting its counterattack/);
 const ready=M.gloriousDefense(make(),{attackTotal:18,targetAC:15});
 assert.throws(()=>attack(ready,{...gloryOpts,gloryInRange:false}),/weapon attack’s range/);
 assert.throws(()=>attack(ready,{...gloryOpts,gloryAttackerConfirmed:false}),/creature whose hit/);
 assert.throws(()=>attack(ready,gloryOpts,null),/target AC/);
 assert.throws(()=>attack(ready,gloryOpts,12,roll,'melee','sword',{cost:'free'}),/Bonus Action/);
});
test('Glorious Defense pending follow-up ends on next turn and rests; save serialization preserves pending before reset',()=>{
 const s=M.gloriousDefense(make(),{attackTotal:18,targetAC:15});
 assert.equal(JSON.parse(JSON.stringify(s)).resources.classState.gloryCounterattackPending,true);
 assert.equal(M.resetReaction(s).resources.classState.gloryCounterattackPending,false);
 assert.equal(M.restClassState(s.character,s.resources.classState,'short').gloryCounterattackPending,false);
 assert.equal(M.restClassState(s.character,s.resources.classState,'long').gloryCounterattackPending,undefined);
 const e={...s,encounter:{active:true,round:1,currentId:'p',roster:[{id:'p',isPip:true}]}};
 assert.equal(M.paladinStartTurn(e).resources.classState.gloryCounterattackPending,false);
});
test('Relentless Avenger uses melee Opportunity Attack, spends Reaction and records speed zero on hit',()=>{
 const s=make('Oath of Vengeance',7),out=attack(s,revengeOpts);
 assert.equal(out.result.relentlessAvenger.hit,true);
 assert.equal(out.result.relentlessAvenger.speedReduced,true);
 assert.equal(out.result.relentlessAvenger.moveHalfSpeed,true);
 assert.equal(out.resources.classState.reactionUsed,true);
 assert.equal(out.resources.lastClassEffect.feature,'Relentless Avenger');
 assert.equal(out.resources.lastClassEffect.speedReduced,true);
});
test('Relentless Avenger missed Opportunity Attack still spends Reaction but applies no movement effect',()=>{
 const s=make('Oath of Vengeance',7),out=attack(s,revengeOpts,40,weak);
 assert.equal(out.result.hit,false);assert.equal(out.result.relentlessAvenger.moveHalfSpeed,false);
 assert.equal(out.resources.classState.reactionUsed,true);
 assert.match(out.result.message,/no Relentless Avenger benefit on miss/);
});
test('Relentless Avenger rejects incorrect level, oath, opportunity trigger, reach, ranged mode and reaction reuse',()=>{
 assert.throws(()=>attack(make('Oath of Vengeance',6),revengeOpts),/level 7/);
 assert.throws(()=>attack(make('Oath of Glory',15),revengeOpts),/Vengeance Paladin level 7/);
 const s=make('Oath of Vengeance',7);
 assert.throws(()=>attack(s,{...revengeOpts,opportunityConfirmed:false}),/trigger and melee reach/);
 assert.throws(()=>attack(s,{...revengeOpts,opportunityInReach:false}),/trigger and melee reach/);
 assert.throws(()=>attack(s,revengeOpts,null),/target AC/);
 const bowState={...s,inventory:{items:s.inventory.items.map(i=>({...i,equipped:i.id==='bow'}))}};
 assert.throws(()=>attack(bowState,revengeOpts,12,roll,'ranged','bow'),/melee weapon Opportunity Attack/);
 const used=attack(s,revengeOpts);
 assert.throws(()=>attack({...s,resources:used.resources},revengeOpts),/Reaction has already been used/);
 assert.throws(()=>attack(s,revengeOpts,12,roll,'melee','sword',{cost:'free'}),/Bonus Action/);
});
test('Soul of Vengeance and Relentless Avenger cannot both be selected for one Reaction',()=>{
 const s=M.vowOfEnmity(make('Oath of Vengeance',15),'Ogre');
 assert.throws(()=>attack(s,{...revengeOpts,soulVengeance:true}),/Only one special Reaction/);
});
test('Living Legend Unerring Strike turns a natural 1 into a normal hit, rolling normal damage and Radiant Strikes',()=>{
 const s=M.oathCapstone(make(),'free');
 const out=attack(s,legendOpts,40,weak);
 assert.equal(out.result.natural,1);
 assert.equal(out.result.hit,true);
 assert.equal(out.result.critical,false);
 assert.equal(out.result.livingLegendUnerring,true);
 assert.ok(out.result.damage>0);
 assert.ok(out.result.radiantStrikes?.extraDamage>0);
 assert.equal(out.resources.classState.gloryLegendHitUsed,true);
 assert.equal(out.resources.lastClassEffect.feature,'Living Legend Unerring Strike');
 assert.match(out.result.message,/turns miss into hit/);
});
test('Living Legend does not consume Unerring Strike if attack already hits',()=>{
 const s=M.oathCapstone(make(),'free');
 const out=attack(s,legendOpts,10);
 assert.equal(out.result.hit,true);
 assert.equal(out.result.livingLegendUnerring,false);
 assert.equal(out.resources,undefined);
});
test('Living Legend cannot be used twice on same turn, but turn reset enables it again',()=>{
 const s=M.oathCapstone(make(),'free'),out=attack(s,legendOpts,40,weak);
 const restored={...s,resources:JSON.parse(JSON.stringify(out.resources))};
 assert.throws(()=>attack(restored,legendOpts,40,weak),/already been used/);
 const reset=M.resetReaction(restored);
 assert.equal(attack(reset,legendOpts,40,weak).result.livingLegendUnerring,true);
});
test('Living Legend requires Glory level 20, active capstone, own turn, target AC and sufficient consciousness',()=>{
 assert.throws(()=>attack(make(),legendOpts,40,weak),/active Living Legend/);
 assert.throws(()=>attack(make('Oath of Glory',19),legendOpts,40,weak),/level 20/);
 assert.throws(()=>attack(make('Oath of Vengeance',20),legendOpts,40,weak),/level 20 Glory/);
 const s=M.oathCapstone(make(),'free');
 assert.throws(()=>attack(s,{...legendOpts,ownTurnConfirmed:false},40,weak),/own turn/);
 assert.throws(()=>attack(s,legendOpts,null,weak),/target AC/);
 assert.throws(()=>attack({...s,resources:{...s.resources,conditions:['Stunned']}},legendOpts,40,weak),/Incapacitated/);
});
test('Living Legend refuses to apply to a Glorious Defense counterattack off-turn',()=>{
 const s=M.gloriousDefense(M.oathCapstone(make(),'free'),{attackTotal:18,targetAC:15});
 assert.throws(()=>attack(s,{...gloryOpts,...legendOpts},40,weak),/own turn/);
});
