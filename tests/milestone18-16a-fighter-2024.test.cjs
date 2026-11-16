'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const I=require('../js/inventory.js');require('../js/core.js');require('../js/data.js');require('../js/dice.js');require('../js/weapon-catalog.js');
const M=require('../js/class-mechanics.js'),F=require('../js/fighter-2024.js'),W=require('../js/weapon-rules.js'),B=require('../js/builder.js'),S=require('../js/storage.js');
const fighter=(lv=3,sub='Battle Master')=>({templateKind:'starter',className:'Fighter',subclass:sub,level:lv,scores:{str:16,dex:14,con:14,int:16,wis:10,cha:10},profSaves:['str','con'],profSkills:[],expertise:[],weapons:[],tools:[],speed:30,build:{characterClass:'Fighter',subclass:sub,grantedFeatNames:[]}});
function state(lv=3,sub='Battle Master'){
 const c=fighter(lv,sub);const weapon=I.gear('sword','Longsword','weapon',1,'',{equipped:true,weapon:{kind:'Melee',category:'Martial',damage:'1d8',type:'Slashing',propertyList:['Versatile'],properties:'Versatile',mastery:'Sap',mastered:true,ability:'str',grip:1}});
 return {character:c,resources:{hp:25,maxHp:70,tempHp:0,classResources:M.normalizeResources(c),classState:{},conditions:[],spellSlots:[],heroicInspiration:false},inventory:{items:[weapon]},encounter:{active:false,roster:[]}};
}
function strike(s,natural=12,options={}){const die=side=>side===20?natural:side===8?4:2;return W.attack(s.character,s.inventory,'sword','melee','normal',options.targetAC||15,die,s.resources,null,null,null,null,null,null,{attackRole:options.role||'attack',targetName:options.target||'Goblin',masteryOverride:options.mastery||'',opportunityConfirmed:true});}
test('builder has exactly four current 2024 PHB Fighter subclasses without duplicates',()=>{
 const subs=B.builtin.subclass.filter(x=>x.classId==='class:fighter');assert.deepEqual(subs.map(x=>x.name).sort(),['Battle Master','Champion','Eldritch Knight','Psi Warrior']);assert.equal(new Set(subs.map(x=>x.id)).size,4);assert.ok(subs.filter(x=>x.name!=='Champion').every(x=>x.sourceId==='phb-2024'));
});
test('Fighter resources level-up correctly without restoring previously spent uses',()=>{
 assert.equal(M.resourcesFor(fighter(3,'Battle Master')).find(x=>x.key==='superiority-dice').max,4);
 assert.equal(M.resourcesFor(fighter(7,'Battle Master')).find(x=>x.key==='superiority-dice').max,5);
 assert.equal(M.resourcesFor(fighter(15,'Battle Master')).find(x=>x.key==='superiority-dice').max,6);
 assert.equal(M.normalizeResources(fighter(7,'Battle Master'),{'superiority-dice':2},fighter(3,'Battle Master'))['superiority-dice'],3);
 assert.equal(M.resourcesFor(fighter(13,'Champion')).find(x=>x.key==='indomitable').max,2);
 assert.equal(M.resourcesFor(fighter(20,'Champion')).find(x=>x.key==='action-surge').max,2);
});
test('Psi Warrior levels scale 4/6/8/10/12 Energy Dice and die d6 d8 d10 d12',()=>{
 for(const [lv,num,side] of [[3,4,6],[5,6,8],[9,8,8],[11,8,10],[13,10,10],[17,12,12]]){
  const c=fighter(lv,'Psi Warrior');assert.equal(M.resourcesFor(c).find(x=>x.key==='psionic-energy').max,num);assert.equal(F.dieSize(c),side);
 }
});
test('Battle Master maneuver selections enforce known levels, no duplicates, preserve state',()=>{
 let s=state();s=F.manageManeuvers(s,['Ambush','Trip Attack','Precision Attack']);assert.equal(s.resources.classState.fighterKnownManeuvers.length,3);
 assert.throws(()=>F.manageManeuvers(s,['Ambush','Ambush']),/unique/);
 assert.throws(()=>F.manageManeuvers(s,['Ambush','Trip Attack','Precision Attack','Rally']),/level limit/);
 assert.deepEqual(S.clone(s).resources.classState.fighterKnownManeuvers,['Ambush','Trip Attack','Precision Attack']);
 assert.equal(F.maneuverLimit(fighter(7)),5);assert.equal(F.maneuverLimit(fighter(10)),7);assert.equal(F.maneuverLimit(fighter(15)),9);
});
test('Battle Master expends one superiority die of correct size and resets on short rest',()=>{
 let s=state();s=F.manageManeuvers(s,['Trip Attack']);let v=F.useManeuver(s,{maneuver:'Trip Attack',triggerConfirmed:true,target:'Orc',rollValue:6});assert.equal(v.resources.lastClassEffect.die,6);
 assert.equal(v.resources.lastClassEffect.saveDC,13);assert.equal(v.resources.classResources['superiority-dice'],3);
 assert.equal(M.rest(v.character,v.resources.classResources,'short')['superiority-dice'],4);
 assert.throws(()=>F.useManeuver(s,{maneuver:'Rally',triggerConfirmed:true,rollValue:2}),/Learn this maneuver/);
});
test('Battle Master 2024 Relentless is a once-per-turn free d8, not old initiative recharge',()=>{
 let s=state(15);s=F.manageManeuvers(s,['Trip Attack']);s=F.newTurn(s);
 let v=F.useManeuver(s,{maneuver:'Trip Attack',target:'Orc',triggerConfirmed:true,useRelentless:true,rollValue:8});
 assert.equal(v.resources.classResources['superiority-dice'],6);
 assert.throws(()=>F.useManeuver(v,{maneuver:'Trip Attack',target:'Orc',triggerConfirmed:true,useRelentless:true,rollValue:2}),/once per turn/);
 assert.equal(F.useManeuver(F.newTurn(v),{maneuver:'Trip Attack',target:'Orc',triggerConfirmed:true,useRelentless:true,rollValue:2}).resources.lastClassEffect.dieSize,8);
});
test('Battle Master Parry consumes shared Reaction and protects against duplicate reactions',()=>{
 let s=F.manageManeuvers(state(10),['Parry']);let v=F.useManeuver(s,{maneuver:'Parry',triggerConfirmed:true,incomingDamage:15,rollValue:7});
 assert.equal(v.resources.lastClassEffect.remainingDamage,5);
 assert.equal(v.resources.classState.reactionUsed,true);
 assert.throws(()=>F.useManeuver(v,{maneuver:'Parry',triggerConfirmed:true,rollValue:4}),/Reaction already used/);
});
test('Know Your Enemy confirms target and consumes free long-rest use, then a die',()=>{
 let s=state(7);assert.throws(()=>F.knowEnemy(s,{target:'Cultist'}),/within 30/);
 let v=F.knowEnemy(s,{target:'Cultist',within30:true});assert.equal(v.resources.classResources['know-your-enemy'],0);
 let x=F.knowEnemy(v,{target:'Cultist',within30:true,restoreWithDie:true});assert.equal(x.resources.classResources['superiority-dice'],4);
});
test('Psi Warrior protective Reaction spends an Energy Die, guarded mind ends both conditions',()=>{
 let s=state(10,'Psi Warrior');let v=F.psiAction(s,{action:'protective',within30:true,triggerConfirmed:true,dieValue:4});
 assert.equal(v.resources.lastClassEffect.amount,7);assert.equal(v.resources.classResources['psionic-energy'],7);
 assert.equal(v.resources.classState.reactionUsed,true);
 assert.throws(()=>F.psiAction(v,{action:'protective',within30:true,triggerConfirmed:true,dieValue:4}),/Reaction already used/);
 const guarded=F.psiAction({...s,resources:{...s.resources,conditions:['Charmed','Frightened','Poisoned']}},{action:'guarded',triggerConfirmed:true});
 assert.deepEqual(guarded.resources.conditions,['Poisoned']);
});
test('Psi Strike once per own turn, free movement and leap use have correct rest budget',()=>{
 let s=F.newTurn(state(7,'Psi Warrior'));let v=F.psiAction(s,{action:'strike',within30:true,triggerConfirmed:true,target:'Ogre',dieValue:2});
 assert.equal(v.resources.lastClassEffect.amount,5);assert.throws(()=>F.psiAction(v,{action:'strike',within30:true,triggerConfirmed:true,dieValue:2}),/once on each/);
 v=F.psiAction(v,{action:'movement',within30:true,triggerConfirmed:true,target:'Crate'});assert.equal(v.resources.classResources['telekinetic-movement'],0);
 v=F.psiAction(v,{action:'leap',triggerConfirmed:true});assert.equal(v.resources.classResources['psi-powered-leap'],0);
 assert.equal(M.rest(v.character,v.resources.classResources,'short')['psi-powered-leap'],1);
});
test('Psi Warrior level gates, Bulwark free/restored, Telekinesis concentration',()=>{
 assert.throws(()=>F.psiAction(state(3,'Psi Warrior'),{action:'leap',triggerConfirmed:true}),/not unlocked/);
 let s=state(18,'Psi Warrior');let a=F.psiAction(s,{action:'bulwark',within30:true,triggerConfirmed:true});
 assert.equal(a.resources.classResources['bulwark-of-force'],0);
 let b=F.psiAction(a,{action:'telekinesis',triggerConfirmed:true});assert.equal(b.resources.concentration,'Telekinesis');
 assert.equal(b.resources.classResources['telekinetic-master'],0);
 assert.ok(b.resources.classState.psiTelekinesisActive);
});
test('Eldritch Knight weapon bond respects two-weapon maximum, summon spends Bonus Action',()=>{
 let s=state(7,'Eldritch Knight');s=F.weaponBond(s,'sword');s=F.newTurn(s);
 assert.deepEqual(s.resources.classState.fighterBondedWeapons,['sword']);
 let summoned=F.summonBond(s,'sword');assert.equal(summoned.resources.classState.fighterBonusActionUsed,true);
 assert.throws(()=>F.summonBond(summoned,'sword'),/Bonus Action already/);
 assert.throws(()=>F.weaponBond(s,'missing'),/inventory weapon/);
});
test('Eldritch Knight War Magic consumes one attack for cantrip, two at level 18 for spells',()=>{
 let s=F.newTurn(state(7,'Eldritch Knight'));assert.throws(()=>F.warMagic(s,{spellLevel:0,verifiedActionCasting:true}),/Begin an Attack/);
 const atk=strike(s,18);s={...s,resources:atk.resources};assert.equal(s.resources.classState.fighterAttackRolls,1);
 let a=F.warMagic(s,{spellLevel:0,verifiedActionCasting:true});assert.equal(a.resources.classState.fighterAttackRolls,2);
 assert.throws(()=>F.warMagic(s,{spellLevel:1,verifiedActionCasting:true}),/level 18/);
 s=F.newTurn(state(18,'Eldritch Knight'));s={...s,resources:strike(s,18).resources};
 const b=F.warMagic(s,{spellLevel:2,verifiedActionCasting:true});assert.equal(b.resources.classState.fighterAttackRolls,3);
});
test('Fighter Attack action counts 1/2/3/4 attacks by level and refuses excess',()=>{
 for(const [lv,max] of [[1,1],[5,2],[11,3],[20,4]]){
  let s=F.newTurn(state(lv,'Champion'));
  for(let i=0;i<max;i++){const a=strike(s,15);s={...s,resources:a.resources};}
  assert.equal(s.resources.classState.fighterAttackRolls,max);
  assert.throws(()=>strike(s,15),/Extra Attack limit reached/);
 }
});
test('Action Surge permits one extra tracked Attack action after max attacks',()=>{
 let s=F.newTurn(state(5,'Champion'));for(let i=0;i<2;i++)s={...s,resources:strike(s,14).resources};
 s=M.fighterActionSurge(s);assert.equal(s.resources.classState.fighterSurgeActions,1);
 s={...s,resources:strike(s,14).resources};assert.equal(s.resources.classState.fighterAttackRolls,1);assert.equal(s.resources.classState.fighterSurgeActions,0);
 assert.throws(()=>M.fighterActionSurge(s),/(only once per turn|No Action Surge uses)/);
});
test('Studied Attacks grants Advantage after a missed attack to the same creature only',()=>{
 let s=F.newTurn(state(13,'Champion'));
 const miss=strike(s,3,{target:'Goblin',targetAC:25});assert.equal(miss.result.hit,false);
 s={...s,resources:miss.resources};assert.equal(F.previewAttack(s.character,s.resources,'Goblin'),true);
 assert.equal(F.previewAttack(s.character,s.resources,'Orc'),false);
 const follow=strike(s,20,{target:'Goblin',targetAC:25});assert.equal(follow.result.fighter.studiedAdvantage,true);
 s=F.newTurn({...s,resources:follow.resources});assert.equal(F.previewAttack(s.character,s.resources,'Goblin'),false);
});
test('Tactical Master validates mastered weapon and override property at level 9+',()=>{
 let s=state(9);const attack=strike(s,15,{mastery:'Push'});assert.equal(attack.result.mastery,'Push');
 assert.throws(()=>strike(state(8),15,{mastery:'Slow'}),/Tactical Master/);
});
test('Fighter-specific turns, resources and target records survive clone, without changing Paladin data',()=>{
 let s=F.newTurn(state(13,'Champion'));s={...s,resources:strike(s,1,{target:'Goblin'}).resources};
 const copy=S.clone(s);assert.equal(copy.resources.classState.fighterTurnTracking,true);assert.equal(copy.resources.classState.fighterStudiedTarget,'Goblin');
 let pal=state(7,'Champion');pal.character.build.characterClass='Paladin';pal.character.className='Paladin';assert.throws(()=>F.newTurn(pal),/Fighter required/);
});

test('Fighter encounter turn reset refreshes shared Reaction and Action Surge turn permission',()=>{
 let s=F.newTurn(state(17,'Champion'));
 s={...s,resources:{...s.resources,classState:{...s.resources.classState,reactionUsed:true,actionSurgeThisTurn:true}}};
 s=F.startTurn(s);
 assert.equal(s.resources.classState.reactionUsed,false);
 assert.equal(s.resources.classState.actionSurgeThisTurn,false);
});
test('Studied Attacks persists after a hit on a different target until next qualifying attack',()=>{
 let s=F.newTurn(state(13,'Champion'));
 s={...s,resources:strike(s,2,{target:'Ogre',targetAC:30}).resources};
 assert.equal(F.previewAttack(s.character,s.resources,'Ogre'),true);
 s={...s,resources:strike(s,20,{target:'Goblin',targetAC:5}).resources};
 assert.equal(F.previewAttack(s.character,s.resources,'Ogre'),true);
});
test('Fighter 1–20 progression and four PHB subclass resource shapes are internally consistent',()=>{
 for(let lv=1;lv<=20;lv++)for(const subclass of ['Champion','Battle Master','Eldritch Knight','Psi Warrior']){
  const c=fighter(lv,subclass),spec=M.resourcesFor(c),keys=spec.map(x=>x.key);
  assert.equal(new Set(keys).size,keys.length,`${subclass} ${lv} unique resource keys`);
  assert.ok(spec.every(x=>Number.isInteger(x.max)&&x.max>=0),`${subclass} ${lv} capacities`);
  assert.equal(M.passive(c,{items:[]}).attacks,lv>=20?4:lv>=11?3:lv>=5?2:1);
  assert.equal(keys.includes('second-wind'),true);
  assert.equal(keys.includes('action-surge'),lv>=2);
  assert.equal(keys.includes('indomitable'),lv>=9);
  assert.equal(keys.includes('superiority-dice'),subclass==='Battle Master'&&lv>=3);
  assert.equal(keys.includes('psionic-energy'),subclass==='Psi Warrior'&&lv>=3);
  assert.ok(M.normalizeResources(c)&&typeof M.normalizeResources(c)==='object');
 }
});
