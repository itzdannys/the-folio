'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const I=require('../js/inventory.js');
require('../js/core.js');require('../js/dice.js');require('../js/data.js');require('../js/weapon-catalog.js');require('../js/spell-catalog.js');require('../js/spell-expansions.js');require('../js/spell-supplements.js');
const M=require('../js/class-mechanics.js'),W=require('../js/weapon-rules.js'),F=require('../js/rules-engine.js'),S=require('../js/storage.js');
function fixture(className,subclass,n=10){
 const c={templateKind:'starter',className,subclass,level:n,scores:{str:16,dex:16,con:14,int:12,wis:18,cha:18},profSkills:[],tools:[],build:{characterClass:className,subclass,slotMax:[4,3,3,2,1,0,0,0,0]}};
 const sword=I.gear('sword','Longsword','weapon',1,'',{equipped:true,weapon:{category:'Martial',kind:'Melee',damage:'1d8',type:'Slashing',properties:'Versatile',propertyList:['Versatile'],ability:'str',grip:1,mastered:false}});
 return {character:c,resources:{hp:15,maxHp:70,tempHp:0,conditions:[],classState:{},classResources:M.normalizeResources(c),spellSlots:[4,3,3,2,1,0,0,0,0],concentration:'',lastClassEffect:null},inventory:{items:[sword]}};
}
function attack(s,rolls,options=null,ac=10){let i=0;return W.attack(s.character,s.inventory,'sword','melee','normal',ac,()=>rolls[i++],s.resources,null,null,null,null,options);}
test('Devotion requires correct subclass and 3rd level; sacred weapon spends Channel Divinity',()=>{
 const s=fixture('Paladin','Oath of Devotion',3),r=M.activateSacredWeapon(s,'sword');
 assert.equal(r.resources.classResources['channel-divinity'],s.resources.classResources['channel-divinity']-1);
 assert.equal(r.resources.classState.sacredWeaponId,'sword');
 assert.equal(s.resources.classState.sacredWeaponId,undefined);
 assert.throws(()=>M.activateSacredWeapon(fixture('Paladin','Other',7),'sword'),/Oath of Devotion/);
 assert.throws(()=>M.activateSacredWeapon(fixture('Paladin','Oath of Devotion',2),'sword'),/level 3/);
});
test('Sacred Weapon validates held Melee weapon, remaining Channel Divinity and expiry',()=>{
 let s=fixture('Paladin','Oath of Devotion',4);s.inventory.items[0].equipped=false;
 assert.throws(()=>M.activateSacredWeapon(s,'sword'),/equipped/);
 s.inventory.items[0].equipped=true;s.resources.classResources['channel-divinity']=0;
 assert.throws(()=>M.activateSacredWeapon(s,'sword'),/Channel Divinity/);
 s.resources.classResources['channel-divinity']=1;
 const r=M.activateSacredWeapon(s,'sword');assert.equal(M.endSacredWeapon(r).resources.classState.sacredWeaponId,null);
});
test('Sacred Weapon actually improves attacks and can switch off; misses never deal damage',()=>{
 const s=fixture('Paladin','Oath of Devotion',3);const original=attack(s,[5,5],null,14);
 const powered=M.activateSacredWeapon(s,'sword');const improved=attack(powered,[5,5],null,14);
 assert.equal(improved.result.attackBonus-original.result.attackBonus,4);
 assert.equal(original.result.hit,false);assert.equal(improved.result.hit,true);
 assert.equal(attack(M.endSacredWeapon(powered),[5],null,14).result.hit,false);
 assert.equal(attack(powered,[1],null,14).result.damage,0);
});
test('Oath of Devotion always prepares ten subclass spells at appropriate class levels',()=>{
 const c=fixture('Paladin','Oath of Devotion',20).character;
 assert.equal(F.classGrantedSpellNames(c).filter(x=>!['Divine Smite','Find Steed'].includes(x)).length,10);
 assert.ok(F.classGrantedSpellNames({...c,level:3}).includes('Shield of Faith'));
 assert.ok(!F.classGrantedSpellNames({...c,level:3}).includes('Beacon of Hope'));
 assert.ok(F.classGrantedSpellNames({...c,level:9}).includes('Beacon of Hope'));
 assert.ok(!F.classGrantedSpellNames({...c,subclass:'Other',build:{...c.build,subclass:'Other'}}).includes('Commune'));
});
test('Holy Nimbus is level 20 only, free use then a level-five slot, and can be dismissed',()=>{
 assert.throws(()=>M.useHolyNimbus(fixture('Paladin','Oath of Devotion',19)),/level 20/);
 const s=fixture('Paladin','Oath of Devotion',20),active=M.useHolyNimbus(s);
 assert.equal(active.resources.classResources['holy-nimbus'],0);
 const off=M.useHolyNimbus(active);assert.equal(off.resources.classState.holyNimbusActive,false);
 assert.throws(()=>M.useHolyNimbus(off,'free'),/No Holy Nimbus/);
 const second=M.useHolyNimbus(off,'slot');assert.equal(second.resources.spellSlots[4],0);
});
test('Hunter choices require confirmed rest and subclass with valid level 7 defense',()=>{
 const s=fixture('Ranger','Hunter',7);
 assert.throws(()=>M.chooseHunterOptions(s,'colossus','escape'),/Rest/);
 assert.throws(()=>M.chooseHunterOptions(s,'wrong','escape',true),/Hunter Prey/);
 assert.throws(()=>M.chooseHunterOptions(s,'colossus','wrong',true),/Hunter Defense/);
 assert.throws(()=>M.chooseHunterOptions(fixture('Ranger','Other',7),'colossus','escape',true),/Hunter/);
 const a=M.chooseHunterOptions(s,'colossus','escape',true);
 assert.equal(a.resources.classState.hunterPrey,'colossus');assert.equal(a.resources.classState.hunterDefense,'escape');
});
test('Hunter Colossus Slayer adds 1d8 only on confirmed wounded hit and only once per turn',()=>{
 let s=M.chooseHunterOptions(fixture('Ranger','Hunter',3),'colossus',null,true);
 assert.throws(()=>M.resolveHunterPrey(s,{hit:true,critical:false},{}),/missing HP/);
 assert.throws(()=>M.resolveHunterPrey(s,{hit:null,critical:false},{targetWounded:true},()=>5),/target AC/);
 const b=attack(s,[11,4,7],{targetWounded:true});
 assert.equal(b.result.hunterPrey.extraDamage,7);assert.equal(b.result.damage,4+3+7);
 assert.deepEqual(b.result.damageComponents,[{type:'Slashing',amount:14}]);
 assert.equal(b.resources.classState.hunterColossusUsed,true);
 assert.throws(()=>attack({...s,resources:b.resources},[11,4,3],{targetWounded:true}),/only once per turn/);
 s=M.hunterNewTurn({...s,resources:b.resources});assert.equal(attack(s,[11,4,3],{targetWounded:true}).result.hunterPrey.extraDamage,3);
});
test('Hunter Colossus Slayer skips miss and doubles dice on critical',()=>{
 const s=M.chooseHunterOptions(fixture('Ranger','Hunter',3),'colossus',null,true);
 const missed=attack(s,[2],{targetWounded:true},20);assert.equal(missed.result.damage,0);assert.equal(missed.resources,undefined);
 const crit=attack(s,[20,3,4,6,7],{targetWounded:true});assert.equal(crit.result.hunterPrey.extraDamage,13);
 assert.equal(crit.result.damage,3+4+3+13+0); // weapon dice 3 + 4 + STR 3 + prey (6+7)
});
test('Horde Breaker cannot accidentally grant Colossus damage',()=>{
 const s=M.chooseHunterOptions(fixture('Ranger','Hunter',7),'horde','escape',true);
 assert.throws(()=>attack(s,[11,3],{targetWounded:true}),/Choose Colossus Slayer/);
});
test('Hunter superior defense uses Reaction and typed resistance; ends on demand',()=>{
 const s=fixture('Ranger','Hunter',15),r=M.useSuperiorHunterDefense(s,'Fire');
 assert.equal(r.resources.classState.reactionUsed,true);
 assert.equal(M.resolveIncomingDamage(r,11,'Fire').details.resolved,5);
 assert.equal(M.resolveIncomingDamage(r,11,'Cold').details.resolved,11);
 assert.throws(()=>M.useSuperiorHunterDefense(r,'Cold'),/Reaction/);
 assert.equal(M.resolveIncomingDamage(M.endSuperiorHunterDefense(r),11,'Fire').details.resolved,11);
 assert.throws(()=>M.useSuperiorHunterDefense(fixture('Ranger','Hunter',14),'Fire'),/level 15/);
});
test('Open Hand Wholeness uses actual Martial Arts die, wisdom and class resource',()=>{
 const s=fixture('Monk','Warrior of the Open Hand',6),a=M.useWholenessOfBody(s,4);
 assert.equal(a.resources.hp,23); // die4 + WIS4
 assert.equal(a.resources.classResources['wholeness-of-body'],3);
 assert.equal(M.rest(s.character,a.resources.classResources,'short')['wholeness-of-body'],3);
 assert.equal(M.rest(s.character,a.resources.classResources,'long')['wholeness-of-body'],4);
 assert.throws(()=>M.useWholenessOfBody(fixture('Monk','Other',6),4),/Open Hand/);
 const full=fixture('Monk','Warrior of the Open Hand',6);full.resources.hp=70;assert.equal(M.useWholenessOfBody(full,4).resources.hp,70);
});
test('Open Hand technique is gated by tracked Flurry hits; save DC follows Wisdom + proficiency',()=>{
 const s=fixture('Monk','Warrior of the Open Hand',6);
 assert.throws(()=>M.useOpenHandTechnique(s,'push',true),/Flurry/);
 const flurry=M.useMonkFocus(s,'flurry');assert.equal(flurry.resources.classState.openHandHitsLeft,2);
 assert.throws(()=>M.useOpenHandTechnique(flurry,'push',false),/Confirm/);
 const pushed=M.useOpenHandTechnique(flurry,'push',true);assert.equal(pushed.resources.lastClassEffect.dc,15);
 assert.equal(pushed.resources.lastClassEffect.save,'Strength');
 const toppled=M.useOpenHandTechnique(pushed,'topple',true);assert.equal(toppled.resources.classState.openHandHitsLeft,0);
 assert.throws(()=>M.useOpenHandTechnique(toppled,'addle',true),/Flurry/);
 assert.throws(()=>M.useOpenHandTechnique(fixture('Monk','Other',6),'addle',true),/Open Hand/);
});
test('Quivering Palm requires four Focus, persists marked target and resolves 10d12 with half save damage',()=>{
 const s=fixture('Monk','Warrior of the Open Hand',17);
 assert.throws(()=>M.quiveringPalm(fixture('Monk','Warrior of the Open Hand',16),'place','Enemy'),/level 17/);
 const marked=M.quiveringPalm(s,'place','Evil Wizard',[],false,true);
 assert.equal(marked.resources.classResources['focus-points'],13);
 assert.equal(S.clone(marked).resources.classState.quiveringPalmTarget,'Evil Wizard');
 const done=M.quiveringPalm(marked,'release','',Array(10).fill(7),true);
 assert.equal(done.resources.lastClassEffect.damage,35);
 assert.equal(done.resources.classState.quiveringPalmTarget,null);
 assert.throws(()=>M.quiveringPalm(done,'release','',Array(10).fill(7),true),/No active/);
});
test('New saves and older saves remain immutable and class resource schema remains valid',()=>{
 const old=fixture('Ranger','Hunter',11),newState=M.chooseHunterOptions(old,'colossus','escape',true);
 assert.equal(old.resources.classState.hunterPrey,undefined);
 assert.deepEqual(S.clone(newState).resources.classState,newState.resources.classState);
 assert.equal(M.normalizeResources(old.character,{} )['favored-enemy'],4);
});
test('Rest ends timed subclass effects without losing Hunter choices, Fiend resistance or Monk vibrations',()=>{
 const hunter=M.chooseHunterOptions(fixture('Ranger','Hunter',15),'colossus','escape',true);
 const hs=M.useSuperiorHunterDefense(hunter,'Fire');
 const short=M.restClassState(hs.character,hs.resources.classState,'short');
 assert.equal(short.hunterPrey,'colossus');assert.equal(short.hunterDefenseType,null);
 const long=M.restClassState(hs.character,hs.resources.classState,'long');
 assert.equal(long.hunterPrey,'colossus');assert.equal(long.hunterDefense,'escape');
 const p=M.activateSacredWeapon(fixture('Paladin','Oath of Devotion',5),'sword');
 assert.equal(M.restClassState(p.character,p.resources.classState,'short').sacredWeaponId,null);
 const monk=M.quiveringPalm(fixture('Monk','Warrior of the Open Hand',17),'place','Target',[],false,true);
 assert.equal(M.restClassState(monk.character,monk.resources.classState,'long').quiveringPalmTarget,'Target');
 const fiend=fixture('Warlock','Fiend Patron',10);fiend.resources.classState.fiendResistance='Fire';
 assert.equal(M.restClassState(fiend.character,fiend.resources.classState,'long').fiendResistance,'Fire');
});
test('Encounter Hunter turn reset executes only when the player turn actually arrives',()=>{
 let s=M.chooseHunterOptions(fixture('Ranger','Hunter',11),'colossus','escape',true);
 s={...s,encounter:{active:true,roster:[{id:'me',isPip:true},{id:'enemy',isPip:false}],round:1,currentId:'enemy'}};
 s.resources.classState.hunterColossusUsed=true;
 assert.equal(M.hunterStartTurn(s).resources.classState.hunterColossusUsed,true);
 const own=M.hunterStartTurn({...s,encounter:{...s.encounter,currentId:'me'}});
 assert.equal(own.resources.classState.hunterColossusUsed,false);
 const once=M.hunterStartTurn({...own,resources:{...own.resources,classState:{...own.resources.classState,hunterColossusUsed:true}}});
 assert.equal(once.resources.classState.hunterColossusUsed,true,'does not reset twice on the same turn');
});
test('Quivering Palm requires explicit confirmation of an Unarmed Strike hit',()=>{
 assert.throws(()=>M.quiveringPalm(fixture('Monk','Warrior of the Open Hand',17),'place','Target'),/Confirm an Unarmed Strike/);
});
