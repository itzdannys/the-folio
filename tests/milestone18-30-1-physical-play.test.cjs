'use strict';
const {test}=require('node:test'),A=require('node:assert/strict');
for(const f of ['data','inventory','dice','weapon-catalog','core','fighter-2024','ranger-2024','monk-2024','class-mechanics','weapon-rules'])require('../js/'+f+'.js');
const I=global.PipInventory,W=global.FolioWeaponRules,CM=global.FolioClassMechanics;
function state(cls='Fighter',lv=5,sub='Champion'){
 const c={templateKind:'starter',className:cls,subclass:sub,level:lv,scores:{str:16,dex:14,con:14,int:12,wis:16,cha:10},profSaves:[],profSkills:[],speed:30,build:{characterClass:cls,subclass:sub,grantedFeatNames:[],spellAbility:'wis'}};
 return {character:c,inventory:I.defaults(),resources:{hp:25,maxHp:70,tempHp:3,classResources:CM.normalizeResources(c),classState:{},conditions:[],spellSlots:[]},encounter:{active:false,roster:[]}};
}
test('Manual melee attack keeps HP, resources, dice, and inventory unchanged',()=>{
 let s=state();const old=structuredClone(s);s=W.recordPhysicalAttack(s,'shortsword','melee');
 A.equal(s.resources.hp,old.resources.hp);A.deepEqual(s.resources.classResources,old.resources.classResources);A.deepEqual(s.inventory,old.inventory);
 A.equal(s.resources.lastClassEffect.feature,'Manual weapon use');A.match(s.resources.lastClassEffect.note,/physical dice/i);
});
test('Manual ranged use records one real ammunition without any attack roll',()=>{
 let s=state(),bow=s.inventory.items.find(x=>x.id==='shortbow');s={...s,inventory:I.update(s.inventory,'shortbow',{equipped:true})};
 s=W.recordPhysicalAttack(s,'shortbow','ranged');A.equal(s.inventory.items.find(x=>x.id==='arrows').quantity,19);A.equal(s.resources.hp,25);
 A.match(s.resources.lastClassEffect.note,/one Arrows used/i);
});
test('Manual thrown use decrements the thrown weapon only',()=>{
 let s=state();s={...s,inventory:I.update(s.inventory,'dagger',{equipped:true,quantity:3})};s=W.recordPhysicalAttack(s,'dagger','throw');
 A.equal(s.inventory.items.find(x=>x.id==='dagger').quantity,2);A.equal(s.inventory.items.find(x=>x.id==='arrows').quantity,20);
});
test('When tracked ammunition is missing, a table-approved use remains recordable',()=>{
 let s=state();s={...s,inventory:I.update(I.update(s.inventory,'shortbow',{equipped:true}),'arrows',{quantity:0})};
 s=W.recordPhysicalAttack(s,'shortbow','ranged');A.match(s.resources.lastClassEffect.note,/track the ammunition at the table/);
});
test('Second Wind uses a charge without inventing physical dice or healing',()=>{
 let s=state('Fighter',5);const before=s.resources.classResources['second-wind'];s=CM.recordPhysicalRecovery(s,'second-wind');
 A.equal(s.resources.classResources['second-wind'],before-1);A.equal(s.resources.hp,25);A.equal(s.resources.tempHp,3);A.equal(s.resources.lastClassEffect.physicalDice,true);
});
test('Tireless records a use without assigning temporary HP',()=>{
 let s=state('Ranger',10,'Hunter');const before=s.resources.classResources.tireless;s=CM.recordPhysicalRecovery(s,'tireless');
 A.equal(s.resources.classResources.tireless,before-1);A.equal(s.resources.hp,25);A.equal(s.resources.tempHp,3);
});
test('Wholeness of Body records a use without inventing healing or dice',()=>{
 let s=state('Monk',6,'Warrior of the Open Hand');const before=s.resources.classResources['wholeness-of-body'];s=CM.recordPhysicalRecovery(s,'wholeness');
 A.equal(s.resources.classResources['wholeness-of-body'],before-1);A.equal(s.resources.hp,25);A.equal(s.resources.tempHp,3);
 A.throws(()=>CM.recordPhysicalRecovery(state('Monk',5,'Warrior of the Open Hand'),'wholeness'),/unlocked/i);
});
