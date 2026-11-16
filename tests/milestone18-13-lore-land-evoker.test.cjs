'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
require('../js/inventory.js');require('../js/data.js');require('../js/core.js');require('../js/character.js');require('../js/storage.js');require('../js/spell-catalog.js');require('../js/spell-expansions.js');require('../js/spell-supplements.js');
const M=require('../js/class-mechanics.js'),B=require('../js/builder.js'),F=require('../js/rules-engine.js'),S=require('../js/storage.js');
function setup(klass,subclass,n=10){
 const character={templateKind:'starter',className:klass,subclass,level:n,scores:{str:12,dex:14,con:14,int:18,wis:18,cha:18},profSkills:[],tools:[],build:{characterClass:klass,subclass,slotMax:[4,3,3,2,1,0,0,0,0]}};
 const resources={hp:10,maxHp:70,tempHp:0,classState:{},classResources:M.normalizeResources(character),spellSlots:[3,2,2,1,0,0,0,0,0],conditions:[],concentration:'',hitDice:n};
 return {character,resources,inventory:{items:[]},spellbook:{catalogSelections:[],custom:[]},encounter:{active:false,roster:[],round:1}};
}
test('Lore Cutting Words is subclass- and level-gated and requires a visible target',()=>{
 const s=setup('Bard','College of Lore',3);
 assert.throws(()=>M.loreCuttingWords(setup('Bard','College of Lore',2),{kind:'damage',originalTotal:15,visibleWithin60:true},3),/level 3/);
 assert.throws(()=>M.loreCuttingWords(setup('Bard','Different',10),{kind:'damage',originalTotal:15,visibleWithin60:true},3),/College of Lore/);
 assert.throws(()=>M.loreCuttingWords(s,{kind:'attack',originalTotal:18,dc:15},4),/visible/);
 assert.throws(()=>M.loreCuttingWords(s,{kind:'attack',originalTotal:11,dc:15,visibleWithin60:true},4),/initially successful/);
});
test('Lore Cutting Words spends one reaction and Bardic Inspiration; never invents enemy outcomes',()=>{
 let s=setup('Bard','College of Lore',10),original=s.resources.classResources['bardic-inspiration'];
 const a=M.loreCuttingWords(s,{kind:'attack',originalTotal:17,dc:15,visibleWithin60:true},6);
 assert.equal(a.resources.lastClassEffect.total,11);
 assert.equal(a.resources.lastClassEffect.nowFails,true);
 assert.equal(a.resources.classResources['bardic-inspiration'],original-1);
 assert.equal(a.resources.classState.reactionUsed,true);
 assert.throws(()=>M.loreCuttingWords(a,{kind:'damage',originalTotal:12,visibleWithin60:true},4),/Reaction/);
 assert.equal(s.resources.classState.reactionUsed,undefined,'input not mutated');
 const b=M.loreCuttingWords(M.resetReaction(a),{kind:'damage',originalTotal:3,visibleWithin60:true},6);
 assert.equal(b.resources.lastClassEffect.total,0,'damage cannot go negative');
});
test('Lore die sizes and no Inspiration prevent illegal uses',()=>{
 assert.throws(()=>M.loreCuttingWords(setup('Bard','College of Lore',4),{kind:'damage',originalTotal:10,visibleWithin60:true},8),/valid roll/);
 let s=setup('Bard','College of Lore',5);s.resources.classResources['bardic-inspiration']=0;
 assert.throws(()=>M.loreCuttingWords(s,{kind:'damage',originalTotal:10,visibleWithin60:true},2),/Bardic Inspiration/);
});
test('Peerless Skill spends Inspiration only when failure becomes success',()=>{
 const s=setup('Bard','College of Lore',14),uses=s.resources.classResources['bardic-inspiration'];
 const still=M.lorePeerlessSkill(s,{kind:'check',originalTotal:5,dc:20},8);
 assert.equal(still.resources.lastClassEffect.success,false);
 assert.equal(still.resources.classResources['bardic-inspiration'],uses);
 const improved=M.lorePeerlessSkill(s,{kind:'attack',originalTotal:13,dc:20},8);
 assert.equal(improved.resources.lastClassEffect.success,true);
 assert.equal(improved.resources.classResources['bardic-inspiration'],uses-1);
 assert.throws(()=>M.lorePeerlessSkill(setup('Bard','College of Lore',13),{originalTotal:10,dc:20},9),/level 14/);
 assert.throws(()=>M.lorePeerlessSkill(s,{originalTotal:20,dc:20},8),/failed/);
});
test('Circle of the Land choice requires confirmed long rest and modifies granted spells',()=>{
 const s=setup('Druid','Circle of the Land',9);
 assert.throws(()=>M.chooseCircleLand(s,'arid'),/Long Rest/);
 assert.throws(()=>M.chooseCircleLand(s,'forest',true),/Choose/);
 const polar=M.chooseCircleLand(s,'polar',true);
 assert.equal(polar.character.build.landType,'polar');
 const spells=F.classGrantedSpellNames(polar.character);
 assert.ok(spells.includes('Ray of Frost'));
 assert.ok(spells.includes('Cone of Cold'));
 assert.ok(!spells.includes('Fireball'));
 assert.equal(F.classGrantedSpellNames(setup('Druid','Circle of the Land',9).character).length,1,'unselected land has only innate Speak with Animals');
 assert.equal(F.classGrantedSpellNames(setup('Druid','Other',9).character).length,1);
});
test('Circle spell grants are level-appropriate, do not affect unrelated Druids and honor alternative land choices',()=>{
 const s=setup('Druid','Circle of the Land',3);
 const temperate=M.chooseCircleLand(s,'temperate',true).character;
 assert.deepEqual(F.classGrantedSpellNames(temperate),['Speak with Animals','Misty Step','Shocking Grasp','Sleep']);
 const full=M.chooseCircleLand(setup('Druid','Circle of the Land',9),'tropical',true).character;
 assert.equal(F.classGrantedSpellNames(full).length,7);
 assert.ok(F.availableSpells(full).some(sp=>sp.name==='Polymorph'));
 assert.ok(!F.classGrantedSpellNames(setup('Bard','College of Lore',9).character).includes('Polymorph'));
});
test('Land Aid has two separate rolls, spends one Wild Shape, and can heal self',()=>{
 const s=setup('Druid','Circle of the Land',10);const before=s.resources.classResources['wild-shape'];
 const a=M.useLandsAid(s,[3,4,5],[5,6,2],{healSelf:true});
 assert.equal(a.resources.classResources['wild-shape'],before-1);
 assert.equal(a.resources.hp,23);
 assert.equal(a.resources.lastClassEffect.damage,12);
 assert.equal(a.resources.lastClassEffect.healing,13);
 assert.equal(a.resources.lastClassEffect.saveDC,16);
 assert.equal(s.resources.hp,10);
 const b=M.useLandsAid(s,[1,2,3],[4,5,6],{healSelf:false});
 assert.equal(b.resources.hp,10);
 assert.equal(b.resources.lastClassEffect.healing,15);
 assert.throws(()=>M.useLandsAid(s,[1,2],[4,5],{}),/appropriate number/);
});
test('Land Aid rejects missing Wild Shape, invalid dice and ineligible subclasses',()=>{
 let s=setup('Druid','Circle of the Land',3);s.resources.classResources['wild-shape']=0;
 assert.throws(()=>M.useLandsAid(s,[1,1],[1,1]),/Wild Shape/);
 assert.throws(()=>M.useLandsAid(setup('Druid','Other',3),[1,1],[1,1]),/Circle of the Land/);
 assert.throws(()=>M.useLandsAid(setup('Druid','Circle of the Land',3),[7,1],[1,1]),/valid d6/);
});
test('Natural Recovery restores a bounded bundle of missing slots after short rest once per long rest',()=>{
 let s=setup('Druid','Circle of the Land',6);
 assert.equal(s.resources.classResources['land-recovery'],1);
 assert.throws(()=>M.landRecoverSlots(s,[1,2]),/Short Rest/);
 assert.throws(()=>M.landRecoverSlots(s,[1,1,2],true),/no greater/);
 assert.throws(()=>M.landRecoverSlots(s,[6],true),/levels 1/);
 const a=M.landRecoverSlots(s,[1,2],true);
 assert.deepEqual(a.resources.spellSlots.slice(0,3),[4,3,2]);
 assert.equal(a.resources.classResources['land-recovery'],0);
 assert.throws(()=>M.landRecoverSlots(a,[3],true),/already used/);
 assert.equal(M.rest(a.character,a.resources.classResources,'short')['land-recovery'],0);
 assert.equal(M.rest(a.character,a.resources.classResources,'long')['land-recovery'],1);
});
test('Natural Recovery refuses a full slot or unsupported class/level',()=>{
 let s=setup('Druid','Circle of the Land',10);s.resources.spellSlots[0]=4;
 assert.throws(()=>M.landRecoverSlots(s,[1],true),/unspent/);
 assert.throws(()=>M.landRecoverSlots(setup('Druid','Circle of the Land',5),[1],true),/level 6/);
 assert.throws(()=>M.landRecoverSlots(setup('Wizard','Evoker',10),[1],true),/Circle of the Land/);
});
test('Free Circle spell requires a selected land, level 1+ spell, and one use per long rest',()=>{
 let s=M.chooseCircleLand(setup('Druid','Circle of the Land',6),'arid',true);
 const a=M.useNaturalRecoveryFreeSpell(s,'Fireball');
 assert.equal(a.resources.classResources['land-free-spell'],0);
 assert.equal(a.resources.spellSlots[2],2,'free casting does not spend slot');
 assert.throws(()=>M.useNaturalRecoveryFreeSpell(a,'Fireball'),/already used/);
 assert.throws(()=>M.useNaturalRecoveryFreeSpell(s,'Fire Bolt'),/level 1\+/);
 assert.throws(()=>M.useNaturalRecoveryFreeSpell(s,'Silvery Barbs'),/always-prepared/);
});
test('Nature’s Ward resists chosen type, honors damage order, and does not affect other types',()=>{
 let s=M.chooseCircleLand(setup('Druid','Circle of the Land',10),'arid',true);
 assert.equal(M.resolveIncomingDamage(s,19,'Fire').details.resolved,9);
 assert.equal(M.resolveIncomingDamage(s,19,'Fire',{vulnerable:true}).details.resolved,18);
 assert.equal(M.resolveIncomingDamage(s,19,'Fire',{resistant:true}).details.resolved,9);
 assert.equal(M.resolveIncomingDamage(s,19,'Cold').details.resolved,19);
 assert.equal(M.resolveIncomingDamage(s,19,'Fire').details.source,'Nature’s Ward');
 s=M.chooseCircleLand(s,'polar',true);
 assert.equal(M.resolveIncomingDamage(s,20,'Cold').details.resolved,10);
 assert.equal(M.resolveIncomingDamage(s,20,'Fire').details.resolved,20);
 const low=M.chooseCircleLand(setup('Druid','Circle of the Land',9),'arid',true);
 assert.equal(M.resolveIncomingDamage(low,20,'Fire').details.resolved,20);
});
test('Nature’s Ward clears existing Poisoned condition on land selection at level 10',()=>{
 const s=setup('Druid','Circle of the Land',10);s.resources.conditions=['Poisoned','Prone'];
 const a=M.chooseCircleLand(s,'tropical',true);
 assert.deepEqual(a.resources.conditions,['Prone']);
 assert.deepEqual(s.resources.conditions,['Poisoned','Prone']);
});
test('Evoker Potent Cantrip halves on confirmed miss or save, without casting or altering enemy HP',()=>{
 const s=setup('Wizard','Evoker',3);
 const a=M.evokerPotentCantrip(s,{isWizardCantrip:true,missOrSaveSucceeded:true,damage:17});
 assert.equal(a.resources.lastClassEffect.damage,8);
 assert.equal(a.resources.hp,s.resources.hp);
 assert.throws(()=>M.evokerPotentCantrip(s,{damage:10}),/Confirm/);
 assert.throws(()=>M.evokerPotentCantrip(setup('Wizard','Other',10),{isWizardCantrip:true,missOrSaveSucceeded:true,damage:10}),/Evoker/);
});
test('Sculpt Spells enforces level-based protected target count',()=>{
 const s=setup('Wizard','Evoker',6);
 const a=M.evokerSculptSpells(s,{spellLevel:3,chosenAllies:4});
 assert.equal(a.resources.lastClassEffect.chosenAllies,4);
 assert.equal(M.evokerSculptSpells(s,{spellLevel:0,chosenAllies:1}).resources.lastClassEffect.chosenAllies,1, 'one cantrip target can be sculpted');
 assert.throws(()=>M.evokerSculptSpells(s,{spellLevel:3,chosenAllies:5}),/visible allies/);
 assert.throws(()=>M.evokerSculptSpells(s,{spellLevel:3,chosenAllies:4,visible:false}),/visible allies/);
 assert.throws(()=>M.evokerSculptSpells(setup('Wizard','Evoker',5),{spellLevel:3,chosenAllies:2}),/level 6/);
});
test('Empowered Evocation calculates one roll with Intelligence modifier',()=>{
 const s=setup('Wizard','Evoker',10);
 const a=M.evokerEmpoweredDamage(s,{wizardEvocation:true,baseDamage:21});
 assert.equal(a.resources.lastClassEffect.total,25);
 assert.throws(()=>M.evokerEmpoweredDamage(s,{wizardEvocation:false,baseDamage:21}),/Confirm/);
 assert.throws(()=>M.evokerEmpoweredDamage(setup('Wizard','Evoker',9),{wizardEvocation:true,baseDamage:21}),/level 10/);
});
test('Selected land persists through builder level-up and JSON clone',()=>{
 const ids={name:'Level Up Land',classId:'class:druid',subclassId:'subclass:circle-of-the-land',speciesId:'species:human',backgroundId:'background:acolyte',level:9,scores:{str:10,dex:14,con:14,int:12,wis:18,cha:10},backgroundPlus:'wis',backgroundOne:'int'};
 const base=B.buildFromInput(ids);const basic=setup('Druid','Circle of the Land',9);
 let s=B.applyToState(basic,base);
 s=M.chooseCircleLand(s,'polar',true);
 assert.equal(S.clone(s).character.build.landType,'polar');
 const updated=B.applyToState(s,B.buildFromInput({...ids,level:10},[],base));
 assert.equal(updated.character.build.landType,'polar');
 assert.ok(F.classGrantedSpellNames(updated.character).includes('Cone of Cold'));
 const different=B.applyToState(updated,B.buildFromInput({...ids,classId:'class:cleric',subclassId:'subclass:life-domain'},[],base));
 assert.equal(different.character.build.landType,undefined,'changing class clears Land choice');
});
