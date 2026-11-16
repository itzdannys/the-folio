'use strict';
const {test}=require('node:test'),A=require('node:assert/strict');
for(const x of ['data','spell-catalog','spell-expansions','spell-supplements','inventory','core','character','dice','journal','appearance','layout','origin-catalog'])require('../js/'+x+'.js');
const W=require('../js/wizard-2024.js'),M=require('../js/class-mechanics.js'),B=require('../js/builder.js'),R=require('../js/rules-engine.js'),Core=require('../js/core.js');
const die=n=>n===20?17:n===12?8:n===10?6:n===8?5:4;
const spell=name=>R.catalog().find(sp=>sp.name===name);
const key=name=>{const x=spell(name);A.ok(x,'Spell '+name+' indexed');return x.key;};
function fixture(n=5,sub='Abjurer',data={}){
 const build={characterClass:'Wizard',subclass:sub,slotMax:B.slotsFor(B.classes.find(x=>x.name==='Wizard'),n),spellAbility:'int',wizardBookInitialized:true,wizardResearchKeys:[],wizardCopiedKeys:[],wizardSavantKeys:[],wizardLegacyKeys:[],...data};
 const character={templateKind:'starter',className:'Wizard',subclass:sub,level:n,name:'Test Wizard',scores:{str:10,dex:14,con:14,int:18,wis:12,cha:10},speed:30,profSaves:['int','wis'],profSkills:['Arcana','History'],expertise:[],overrides:{},build};
 return {character,resources:{hp:25,maxHp:48,tempHp:5,hitDice:n,conditions:[],concentration:'',spellSlots:[...build.slotMax],classResources:M.normalizeResources(character),classState:{}},spellbook:{catalogSelections:[],custom:[],catalogSnapshots:{}},inventory:{items:[]}};
}
function cast(s,name,cost,flags={}){
 const sp=R.getSpell(key(name),s.spellbook);W.prepareCast(s,sp,cost,{confirmedTime:'action',...flags});const r=R.cast(s.character,s.spellbook,s.resources,sp.id,cost);return W.postCast({...s,resources:r.resources,spellbook:r.book},sp,cost,flags,die);
}
test('Wizard 2024 1-20 progression uses correct cantrips and prepared counts',()=>{
 const prepared=[4,5,6,7,9,10,11,12,14,15,16,16,17,18,19,21,22,23,24,25];
 for(let n=1;n<=20;n++){const s=fixture(n),lim=R.preparationLimits(s.character);A.equal(lim.cantrips,n>=10?5:n>=4?4:3);A.equal(lim.prepared,prepared[n-1]);A.equal(W.researchCap(s.character),6+2*(n-1));A.equal(M.resourcesFor(s.character).find(x=>x.key==='arcane-recovery').max,1);}
});
test('All four Wizard schools appear in builder and unlock at level 3',()=>{for(const name of ['Abjurer','Diviner','Evoker','Illusionist']){A.ok(B.subclasses.some(x=>x.classId==='class:wizard'&&x.name===name));A.equal(W.subclass(fixture(2,name).character),'');A.equal(W.subclass(fixture(3,name).character),name);}});
test('Six initial spells, level-one restriction and two research additions per level',()=>{
 let s=fixture(1),choices=R.catalog().filter(x=>x.level===1&&x.classes.includes('Wizard')&&!x.referenceOnly).slice(0,7);A.equal(choices.length,7);
 for(let i=0;i<6;i++)s=W.learn(s,choices[i].key);
 A.equal(W.keys(s.character).length,6);A.throws(()=>W.learn(s,choices[6].key),/six|Six/);A.throws(()=>W.learn(fixture(1),key('Misty Step')),/eligible/);
 const high=fixture(5);A.equal(W.researchCap(high.character),14);
});
test('Found spells require confirmed source, GP and time; duplicate/cantrip and out-level rejected',()=>{
 let s=fixture(5);A.throws(()=>W.learn(s,key('Magic Missile'),'copy'),/Confirm/);s=W.learn(s,key('Magic Missile'),'copy',{confirmed:true});A.equal(s.character.build.wizardInkGP,50);A.equal(s.character.build.wizardCopyHours,2);A.throws(()=>W.learn(s,key('Magic Missile')),/already/);
 A.throws(()=>W.learn(s,key('Fire Bolt'),'copy',{confirmed:true}),/level 1\+/);A.throws(()=>W.learn(s,key('Wish'),'copy',{confirmed:true}),/eligible/);
});
test('School Savant adds two initial spells and one at each newly unlocked spell tier',()=>{
 let s=fixture(3,'Abjurer'),a=R.catalog().filter(x=>x.level<=2&&x.level>0&&x.school==='Abjuration'&&x.classes.includes('Wizard')).slice(0,3);A.ok(a.length>=3);
 s=W.learn(s,a[0].key,'savant');s=W.learn(s,a[1].key,'savant');A.equal(W.savantSlots(s.character),2);A.throws(()=>W.learn(s,a[2].key,'savant'),/All current/);
 let s5=fixture(5,'Diviner');A.equal(W.savantSlots(s5.character),3);A.throws(()=>W.learn(s5,key('Magic Missile'),'savant'),/school/);
});
test('Legacy prepared Wizard spells preserved when initializing new book; new Wizard must use book',()=>{
 const old=fixture(7,'Evoker',{wizardBookInitialized:false}),magic=key('Magic Missile');old.spellbook.catalogSelections=[magic];const migrated=W.mergeLegacy(old);A.ok(W.keys(migrated.character).includes(magic));A.equal(W.keys(old.character).length,0);
 const fresh=fixture(7);A.match(R.selectionError(fresh.character,fresh.spellbook,[magic]),/spellbook/);A.deepEqual(R.castOptions(fresh.character,{catalogSelections:[magic]},fresh.resources,magic),[]);
 const ready=W.learn(fresh,magic);A.equal(R.selectionError(ready.character,ready.spellbook,[magic]),'');
});
test('Wizard Ritual Adept casts a spell recorded in book when it is unprepared',()=>{
 let s=W.learn(fixture(5),key('Detect Magic'));
 const opts=R.castOptions(s.character,s.spellbook,s.resources,key('Detect Magic'));A.deepEqual(opts.map(o=>o.key),['ritual']);
 const casted=cast(s,'Detect Magic','ritual');A.deepEqual(casted.resources.spellSlots,s.resources.spellSlots);
 const no=fixture(5);A.deepEqual(R.castOptions(no.character,no.spellbook,no.resources,key('Detect Magic')),[]);
});
test('Long Rest preparation requires the spell in book; cantrips still selected normally',()=>{
 const s=W.learn(fixture(7),key('Shield'));
 A.equal(R.selectionError(s.character,s.spellbook,[key('Shield'),key('Fire Bolt')]),'');
 A.match(R.selectionError(s.character,s.spellbook,[key('Fireball')]),/spellbook/);
});
test('Memorize Spell is immediate after Short Rest and only for a book spell',()=>{
 let s=fixture(5);s=W.learn(s,key('Shield'));s=W.learn(s,key('Magic Missile'));s.spellbook.catalogSelections=[key('Shield')];
 A.throws(()=>W.memorize(s,key('Shield'),key('Magic Missile')),/Short Rest/);
 s={...s,resources:{...s.resources,classState:W.restState(s.character,s.resources.classState,'short')}};
 s=W.memorize(s,key('Shield'),key('Magic Missile'));A.ok(s.spellbook.catalogSelections.includes(key('Magic Missile')));
 A.throws(()=>W.memorize(s,key('Magic Missile'),key('Shield')),/Short Rest/);
});
test('Arcane Recovery needs an actual Short Rest, respects capacity, one use per Long Rest',()=>{
 let s=fixture(5);s.resources.spellSlots[0]--;A.throws(()=>M.recoverWizardSlots(s,[1]),/Short Rest/);
 s={...s,resources:{...s.resources,classState:W.restState(s.character,s.resources.classState,'short')}};
 s=M.recoverWizardSlots(s,[1]);A.equal(s.resources.spellSlots[0],4);A.equal(s.resources.classResources['arcane-recovery'],0);
 A.throws(()=>M.recoverWizardSlots(s,[1]),/already/);
});
test('Scholar Expertise in eligible trained skill modifies core skill check',()=>{
 const s=fixture(3);const before=Core.derived(s.character,s.inventory,s.resources).skills.Arcana;
 const c={...s.character,expertise:['Arcana'],build:{...s.character.build,wizardScholarSkill:'Arcana'}};
 A.equal(Core.derived(c,s.inventory,s.resources).skills.Arcana,before+2);
});
test('Spell Mastery levels 1/2 Action spells are permanently prepared and free at base level',()=>{
 let s=fixture(18,'Evoker');s=W.learn(s,key('Magic Missile'));s=W.learn(s,key('Shield'));s=W.learn(s,key('Scorching Ray'));
 A.throws(()=>W.configure(s,'mastery',[key('Shield'),key('Scorching Ray')]),/Action/);
 s=W.configure(s,'mastery',[key('Magic Missile'),key('Scorching Ray')]);A.ok(R.classGrantedSpellNames(s.character).includes('Magic Missile'));
 A.ok(R.castOptions(s.character,s.spellbook,s.resources,key('Magic Missile')).some(o=>o.key==='wizard-mastery'));
 const after=cast(s,'Magic Missile','wizard-mastery');A.deepEqual(after.resources.spellSlots,s.resources.spellSlots);
});
test('Signature Spells select two level 3 spells, one free cast each per Short Rest',()=>{
 let s=fixture(20,'Abjurer');s=W.learn(s,key('Fireball'));s=W.learn(s,key('Lightning Bolt'));s=W.configure(s,'signature',[key('Fireball'),key('Lightning Bolt')]);
 A.ok(R.castOptions(s.character,s.spellbook,s.resources,key('Fireball')).some(x=>x.key==='wizard-signature'));
 s=cast(s,'Fireball','wizard-signature');A.ok(!R.castOptions(s.character,s.spellbook,s.resources,key('Fireball')).some(x=>x.key==='wizard-signature'));
 s={...s,resources:{...s.resources,classState:W.restState(s.character,s.resources.classState,'short')}};
 A.ok(R.castOptions(s.character,s.spellbook,s.resources,key('Fireball')).some(x=>x.key==='wizard-signature'));
});
test('Abjurer Ward activates from slotted Abjuration casting, absorbs typed damage before temp HP',()=>{
 let s=fixture(5,'Abjurer');s=W.learn(s,key('Shield'));s.spellbook.catalogSelections=[key('Shield')];s=cast(s,'Shield','slot1');A.deepEqual(s.resources.classState.wizardWard,{hp:14,max:14,active:true});
 const after=M.resolveIncomingDamage(s,10,'Fire');A.equal(after.details.wardAbsorbed,10);A.equal(after.state.resources.hp,25);A.equal(after.state.resources.tempHp,5);A.equal(after.state.resources.classState.wizardWard.hp,4);
 const more=M.resolveIncomingDamage(after.state,7,'Fire');A.equal(more.details.wardAbsorbed,4);A.equal(more.state.resources.tempHp,2);
});
test('Abjurer Ward replenishment costs Bonus Action and slot, Projected Ward costs reaction and confirms',()=>{
 let s=fixture(6,'Abjurer');s.resources.classState.wizardWard={active:true,hp:1,max:16};s=W.repairWard(s,2);A.equal(s.resources.classState.wizardWard.hp,5);A.equal(s.resources.spellSlots[1],2);
 A.throws(()=>W.repairWard(s,1),/Bonus Action/);
 A.throws(()=>W.consumeWard(s,3,{projected:true,target:'Ally'}),/confirmed/);
 s=W.consumeWard(s,3,{projected:true,target:'Ally',confirmed:true});A.equal(s.resources.classState.wizardWard.hp,2);A.ok(s.resources.classState.reactionUsed);
});
test('Spell Breaker refunds spent Counterspell on confirmed failed interruption',()=>{
 let s=fixture(10,'Abjurer');s=W.learn(s,key('Counterspell'));s.spellbook.catalogSelections=[key('Counterspell')];s=cast(s,'Counterspell','slot3');A.equal(s.resources.spellSlots[2],2);
 A.throws(()=>W.action(s,'spell-breaker'),/Confirm/);s=W.action(s,'spell-breaker',{confirmed:true});A.equal(s.resources.spellSlots[2],3);
 A.throws(()=>W.action(s,'spell-breaker',{confirmed:true}),/already|not already|Confirm/);
});
test('Abjurer Spell Resistance requires explicit spell-damage confirmation',()=>{
 const s=fixture(14,'Abjurer'),fromSpell=M.resolveIncomingDamage(s,18,'Fire',{spellDamage:true}),normal=M.resolveIncomingDamage(s,18,'Fire');A.equal(fromSpell.details.resolved,9);A.equal(normal.details.resolved,18);
});
test('Diviner Portent rolls two/three dice once per Long Rest and substitutes once per turn',()=>{
 let s=fixture(14,'Diviner');s=W.portent(s,{rollNow:true},die);A.equal(s.resources.classState.wizardPortents.length,3);A.throws(()=>W.portent(s,{rollNow:true},die),/already/);
 A.throws(()=>W.portent(s,{index:0,target:'Ally'}),/Confirm/);s=W.portent(s,{index:0,target:'Ally',confirmed:true},die);A.equal(s.resources.lastClassEffect.d20,17);A.throws(()=>W.portent(s,{index:1,target:'Enemy',confirmed:true},die),/once|Only one/);
 s=W.action(s,'turn');s=W.portent(s,{index:1,target:'Enemy',confirmed:true},die);A.equal(s.resources.classState.wizardPortents.filter(x=>x.used).length,2);
});
test('Expert Divination refunds eligible lower slot atomically on slotted Divination spell',()=>{
 let s=fixture(10,'Diviner');s=W.learn(s,key('Detect Thoughts'));s.spellbook.catalogSelections=[key('Detect Thoughts')];s.resources.spellSlots[0]--;
 s=cast(s,'Detect Thoughts','slot2',{expertLevel:1});A.equal(s.resources.spellSlots[0],4);A.equal(s.resources.spellSlots[1],2);
 A.throws(()=>cast(s,'Detect Thoughts','slot2',{expertLevel:2}),/lower-level/);
});
test('Third Eye requires Bonus Action, recharges on Short Rest; no automatic enemy observations',()=>{
 let s=fixture(10,'Diviner');s=W.action(s,'third-eye',{choice:'Darkvision'});A.equal(s.resources.classState.wizardThirdEye,'Darkvision');A.throws(()=>W.action(s,'third-eye',{choice:'See Invisibility'}),/spent/);
 s={...s,resources:{...s.resources,classState:W.restState(s.character,s.resources.classState,'short')}};s=W.action(s,'third-eye',{choice:'See Invisibility'});A.equal(s.resources.classState.wizardThirdEye,'See Invisibility');
});
test('Evoker Potent, Sculpt, Empowered older signed-off mechanics are preserved',()=>{
 const s=fixture(14,'Evoker');A.ok(M.evoker(s.character));A.equal(M.evokerPotentCantrip(s,{isWizardCantrip:true,missOrSaveSucceeded:true,damage:21}).resources.lastClassEffect.damage,10);
 A.equal(M.evokerSculptSpells(s,{spellLevel:3,chosenAllies:2}).resources.lastClassEffect?.feature,'Sculpt Spells');
 A.equal(M.evokerEmpoweredDamage(s,{wizardEvocation:true,baseDamage:10}).resources.lastClassEffect?.total,14);
});
test('Evoker Overchannel first free, then takes 2d12 per slot level ignoring resistance',()=>{
 let s=fixture(14,'Evoker');s=W.learn(s,key('Magic Missile'));s.spellbook.catalogSelections=[key('Magic Missile')];s=cast(s,'Magic Missile','slot1',{overchannel:true,confirmedDamage:true});A.equal(s.resources.lastClassEffect.selfNecroticDamage,0);
 s=cast(s,'Magic Missile','slot1',{overchannel:true,confirmedDamage:true});A.equal(s.resources.lastClassEffect.selfNecroticDamage,16);A.equal(s.resources.tempHp,0);A.equal(s.resources.hp,14);
 A.throws(()=>W.prepareCast(s,R.getSpell(key('Magic Missile'),s.spellbook),'slot1',{overchannel:true}),/Overchannel/);
});
test('Illusionist Minor Illusion and free Phantasmal summons remain class-granted and limited',()=>{
 let s=fixture(6,'Illusionist');A.ok(R.classGrantedSpellNames(s.character).includes('Minor Illusion'));A.ok(R.classGrantedSpellNames(s.character).includes('Summon Beast'));
 A.ok(R.castOptions(s.character,s.spellbook,s.resources,key('Summon Beast')).some(x=>x.key==='wizard-phantasmal'));
 s=cast(s,'Summon Beast','wizard-phantasmal');A.match(s.resources.lastClassEffect.note,/half/);A.ok(!R.castOptions(s.character,s.spellbook,s.resources,key('Summon Fey')).some(x=>x.key==='wizard-phantasmal'));
});
test('Illusory Self reaction and Illusory Reality bonus action require confirmation',()=>{
 let s=fixture(14,'Illusionist');A.throws(()=>W.action(s,'illusory-self'),/Confirm/);s=W.action(s,'illusory-self',{confirmed:true});A.ok(s.resources.classState.reactionUsed);
 A.throws(()=>W.action(s,'illusory-self',{confirmed:true}),/Reaction/);s=W.action(s,'turn');s=W.action(s,'illusory-self',{confirmed:true,slot:2});A.equal(s.resources.spellSlots[1],2);
 A.throws(()=>W.action(s,'illusory-reality',{target:'Stone bridge'}),/Confirm/);s=W.action(s,'illusory-reality',{target:'Stone bridge',confirmed:true});A.equal(s.resources.lastClassEffect.object,'Stone bridge');
});
test('Wizard book, feats and choices persist after level-up via builder applyToState',()=>{
 let s=fixture(9,'Diviner'),k=key('Shield');s=W.learn(s,k);s.character.profSkills=['Arcana'];s.character.build.wizardScholarSkill='Arcana';
 const b=B.buildFromInput({name:'Test Wizard',level:10,classId:'class:wizard',subclassId:'subclass:diviner',speciesId:'species:human',backgroundId:'background:acolyte',scores:{str:10,dex:14,con:14,int:18,wis:12,cha:10},backgroundPlus:'int',backgroundOne:'wis'});
 const changed=B.applyToState(s,b);A.ok(W.keys(changed.character).includes(k));A.equal(changed.character.build.wizardScholarSkill,'Arcana');A.equal(changed.character.level,10);
 A.deepEqual(JSON.parse(JSON.stringify(changed.character.build.wizardResearchKeys)),[k]);
});
test('Wizard tracked turn permits one Action, one Bonus Action and one Reaction; resets next turn',()=>{
 let s=fixture(7,'Evoker');s=W.learn(s,key('Magic Missile'));s=W.learn(s,key('Misty Step'));s=W.learn(s,key('Shield'));s.spellbook.catalogSelections=[key('Magic Missile'),key('Misty Step'),key('Shield')];
 s=W.action(s,'turn');s=cast(s,'Magic Missile','slot1');A.equal(s.resources.classState.wizardActionUsed,true);A.equal(s.resources.classState.wizardSlotUsed,true);
 A.throws(()=>cast(s,'Magic Missile','slot1'),/Action|spell slot/i);
 A.throws(()=>cast(s,'Misty Step','slot2'),/spell slot/i);
 s=cast(s,'Shield','slot1');A.equal(s.resources.classState.reactionUsed,true);A.throws(()=>cast(s,'Shield','slot1'),/reaction/i);
 s=W.action(s,'turn');s=cast(s,'Misty Step','slot2');A.equal(s.resources.classState.wizardBonusUsed,true);
});
test('Abjurer Spell Breaker permanently prepares its two spells and supports Dispel Bonus Action',()=>{
 let s=fixture(10,'Abjurer');A.ok(R.classGrantedSpellNames(s.character).includes('Counterspell'));A.ok(R.classGrantedSpellNames(s.character).includes('Dispel Magic'));
 A.ok(R.castOptions(s.character,s.spellbook,s.resources,key('Dispel Magic')).some(x=>x.key==='slot3'));
 s=W.action(s,'turn');const sp=R.getSpell(key('Dispel Magic'),s.spellbook);
 W.prepareCast(s,sp,'slot3',{dispelBonus:true});const casted=R.cast(s.character,s.spellbook,s.resources,key('Dispel Magic'),'slot3');s=W.postCast({...s,resources:casted.resources,spellbook:casted.book},sp,'slot3',{dispelBonus:true});
 A.equal(s.resources.classState.wizardBonusUsed,true);A.equal(s.resources.classState.wizardActionUsed,false);
 A.throws(()=>W.prepareCast(s,sp,'slot3',{dispelBonus:true}),/bonus/i);
 const low=fixture(9,'Abjurer');A.ok(!R.classGrantedSpellNames(low.character).includes('Counterspell'));A.throws(()=>W.prepareCast(low,sp,'slot3',{dispelBonus:true}),/level 10/);
});
