const {test}=require('node:test'),A=require('node:assert/strict');
require('../js/data.js');require('../js/spell-catalog.js');require('../js/spell-expansions.js');require('../js/spell-supplements.js');require('../js/inventory.js');require('../js/core.js');require('../js/character.js');require('../js/dice.js');require('../js/journal.js');require('../js/appearance.js');require('../js/layout.js');
const S=require('../js/sorcerer-2024.js'),M=require('../js/class-mechanics.js'),B=require('../js/builder.js'),R=require('../js/rules-engine.js'),L=require('../js/library.js'),St=require('../js/storage.js');
const dice=n=>n===20?17:n===100?85:n===8?6:n===4?3:5;
function fixture(level=7,subclass='Aberrant Sorcery'){
 const c={templateKind:'starter',className:'Sorcerer',subclass,level,name:'Test Mage',scores:{str:10,dex:14,con:14,int:10,wis:12,cha:18},speed:30,profSaves:['con','cha'],profSkills:[],expertise:[],overrides:{},build:{characterClass:'Sorcerer',subclass,slotMax:B.slotsFor(B.classes.find(x=>x.name==='Sorcerer'),level),sorcererMetamagic:[]}};
 return {character:c,resources:{hp:32,maxHp:50,tempHp:0,conditions:[],concentration:'',spellSlots:[...c.build.slotMax],classState:{},classResources:M.normalizeResources(c)},spellbook:{catalogSelections:[],custom:[],catalogSnapshots:{}},inventory:{items:[]}};
}
function hasError(fn,message){A.throws(fn,message);}
const spell=(name='Chromatic Orb',level=1,time='Action')=>({name,level,time,range:'90 feet',duration:'Instantaneous',school:'Evocation',concentration:false});

test('2024 Sorcerer base resource progression level 1–20, Metamagic slots and DCs',()=>{
 for(let n=1;n<=20;n++){const s=fixture(n),r=M.resourcesFor(s.character),p=r.find(x=>x.key==='sorcery-points');A.equal(p?.max,n>=2?n:undefined);A.equal(r.find(x=>x.key==='innate-sorcery').max,2);A.equal(S.maxMeta(s.character),n>=17?6:n>=10?4:n>=2?2:0);A.equal(R.preparationLimits(s.character).cantrips,n>=10?6:n>=4?5:4);A.equal(R.preparationLimits(s.character).prepared,[2,4,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22][n-1]);}
});
test('2024 subclass spell grants correct and class-isolated at every threshold',()=>{
 for(const sub of ['Aberrant Sorcery','Clockwork Sorcery','Draconic Sorcery']){const low=fixture(2,sub).character;A.deepEqual(S.grantSpells(low),[]);const at3=fixture(3,sub).character;A.ok(S.grantSpells(at3).length>=4);for(const n of [5,7,9]){const names=R.classGrantedSpellNames(fixture(n,sub).character);for(const x of S.grantSpells(fixture(n,sub).character)){const key=R.catalogKeyForName(x);A.ok(key,'Missing catalog alias: '+x);const canonical=R.catalog().find(sp=>sp.key===key)?.name;A.ok(names.includes(canonical),sub+': '+x);}}}
 A.deepEqual(S.grantSpells(fixture(20,'Wild Magic Sorcery').character),[]);
});
test('Innate Sorcery spends uses, needs Bonus Action, applies recharge at level 7',()=>{
 let s=S.newTurn(fixture(7));s=S.innate(s);A.equal(s.resources.classResources['innate-sorcery'],1);A.equal(s.resources.classState.sorcBonusUsed,true);
 hasError(()=>S.innate({...s,resources:{...s.resources,classState:{...s.resources.classState,innateSorcery:false}}}),/Bonus Action/);
 s=S.newTurn(s);s=S.innate(s);A.equal(s.resources.classState.innateSorcery,false);s=S.innate(s);A.equal(s.resources.classResources['innate-sorcery'],0);
 s=S.newTurn(s);s=S.innate(s);s=S.innate(s);A.equal(s.resources.classResources['sorcery-points'],5);A.equal(s.resources.classState.sorcInnateRounds,10);
 const low=fixture(6);low.resources.classResources['innate-sorcery']=0;hasError(()=>S.innate(low),/exhausted/);
});
test('Font of Magic slot creation enforces minimum class level and correct costs',()=>{
 const s=fixture(2);s.resources.classResources['sorcery-points']=2;hasError(()=>S.convert(s,'to-slot',2),/Cannot create/);
 let made=S.convert(s,'to-slot',1);A.equal(made.resources.classResources['sorcery-points'],0);A.equal(made.resources.spellSlots[0],4);A.equal(made.resources.classState.sorcCreatedSlots[0],1);
 const s9=fixture(9),five=S.convert(s9,'to-slot',5);A.equal(five.resources.classResources['sorcery-points'],2);A.equal(five.resources.spellSlots[4],2);
 const s20=fixture(20);hasError(()=>S.convert(s20,'to-points',6),/exceed/);
});
test('Sorcerous Restoration is gated by a completed Short Rest, refills half and uses only once per Long Rest',()=>{
 let s=fixture(9);s.resources.classResources['sorcery-points']=2;hasError(()=>S.restoration(s),/Short Rest/);s={...s,resources:{...s.resources,classState:S.restState(s.character,s.resources.classState,'short')}};s=S.restoration(s);A.equal(s.resources.classResources['sorcery-points'],6);hasError(()=>S.restoration(s),/Short Rest/);A.equal(S.restState(s.character,s.resources.classState,'long').sorcRestorationReady,false);
});
test('Metamagic options are counted, distinct, persistent, and level gated',()=>{
 let s=fixture(2);s=S.chooseMeta(s,['Subtle Spell','Careful Spell']);A.deepEqual(S.knownMeta(s.character),['Subtle Spell','Careful Spell']);hasError(()=>S.chooseMeta(s,['Subtle Spell','Subtle Spell']),/different/);
 const build=B.buildFromInput({name:'Test Mage',level:10,classId:'class:sorcerer',subclassId:'subclass:aberrant-sorcery',speciesId:'species:human',backgroundId:'background:acolyte',scores:{str:10,dex:14,con:14,int:10,wis:12,cha:18},backgroundPlus:'int',backgroundOne:'cha'});
 const upgraded=B.applyToState({...s,character:{...s.character,templateKind:'starter',build:{...s.character.build,sorcererMetamagic:['Subtle Spell','Careful Spell']}}},build);
 A.deepEqual(upgraded.character.build.sorcererMetamagic,['Subtle Spell','Careful Spell']);
});
test('Casting spends Metamagic points once, persists effects, shares Action and slot-per-turn budget',()=>{
 let s=S.newTurn(fixture(10));s=S.chooseMeta(s,['Quickened Spell','Subtle Spell','Heightened Spell','Careful Spell']);
 s=S.recordSpellCast(s,spell(), 'slot1',{metamagic:['Quickened Spell']});A.equal(s.resources.classResources['sorcery-points'],8);A.equal(s.resources.classState.sorcBonusUsed,true);A.equal(s.resources.classState.sorcSlotCast,true);
 hasError(()=>S.recordSpellCast(s,spell('Shield',1,'Reaction'),'slot1'),/slot|Quickened/);
 const low=fixture(2);low.character.build.sorcererMetamagic=['Quickened Spell','Subtle Spell'];hasError(()=>S.recordSpellCast(low,spell(), 'slot1',{metamagic:['Quickened Spell','Subtle Spell']}),/many/);
});
test('Sorcery Incarnate allows two Metamagic options while innate; level 20 free option once per turn',()=>{
 let s=fixture(20);s.character.build.sorcererMetamagic=['Subtle Spell','Careful Spell','Quickened Spell','Heightened Spell','Distant Spell','Twinned Spell'];s=S.newTurn(s);s=S.innate(s);
 s=S.recordSpellCast(s,spell(), 'slot1',{metamagic:['Subtle Spell','Distant Spell'],confirmedRange:true});A.equal(s.resources.lastClassEffect.metamagicPoints,1);A.equal(s.resources.lastClassEffect.freeMetamagic,true);A.equal(s.resources.classState.sorcFreeMetaUsed,true);
 hasError(()=>S.recordSpellCast(s,spell('Shield',1,'Reaction'),'slot1',{metamagic:['Subtle Spell']}),/slot/);
});
test('Quickened requires Action, Heightened needs selected enemy, Twinned verified eligibility',()=>{
 const s=fixture(10);s.character.build.sorcererMetamagic=['Quickened Spell','Heightened Spell','Twinned Spell','Careful Spell'];
 hasError(()=>S.recordSpellCast(s,spell('Shield',1,'Reaction'),'slot1',{metamagic:['Quickened Spell']}),/Action/);
 hasError(()=>S.recordSpellCast(s,spell(),'slot1',{metamagic:['Heightened Spell'],confirmedSave:true}),/creature/);
 hasError(()=>S.recordSpellCast(s,spell(),'slot1',{metamagic:['Twinned Spell']}),/upcast/);
 const twinned=S.recordSpellCast(s,spell(),'slot1',{metamagic:['Twinned Spell'],confirmedUpcast:true});A.equal(twinned.resources.lastClassEffect.effectiveSpellLevel,2);
});
test('Seeking and Empowered roll actual dice and do not double-spend during failed validation',()=>{
 let s=fixture(5);s.character.build.sorcererMetamagic=['Seeking Spell','Empowered Spell'];hasError(()=>S.seeking(s,{},dice),/Confirm/);s=S.seeking(s,{missConfirmed:true},dice);A.equal(s.resources.lastClassEffect.d20,17);A.equal(s.resources.classResources['sorcery-points'],4);
 s=S.empowered(s,{dice:[6,8,6,4],confirmed:true},dice);A.deepEqual(s.resources.lastClassEffect.dice,[5,6,5,3]);A.equal(s.resources.classResources['sorcery-points'],3);hasError(()=>S.empowered(s,{dice:[6,6,6,6,6],confirmed:true},dice),/Charisma/);
});
test('Aberrant telepathic link, revelation and Warping Implosion have correct costs and gates',()=>{
 let s=fixture(18);s=S.telepathy(s,{target:'Ally',confirmed:true});A.equal(s.resources.classState.sorcTelepathy.rangeMiles,4);
 s=S.revelation(s,['Aquatic Adaptation','Glistening Flight']);A.equal(s.resources.classResources['sorcery-points'],16);A.equal(s.resources.classState.sorcRevelationRounds,100);
 s=S.warp(s,{confirmed:true});A.equal(s.resources.classResources['sorcerer-warp'],0);
 s=S.warp(s,{confirmed:true,restore:true});A.equal(s.resources.classResources['sorcery-points'],11);
 hasError(()=>S.revelation(fixture(13),['See the Invisible']),/level 14/);
});
test('Aberrant Psionic Sorcery grants an alternate cost only to confirmed granted spells',()=>{
 let s=fixture(6);const sp=R.catalog().find(x=>x.name==='Detect Thoughts');A.ok(sp);let options=R.castOptions(s.character,s.spellbook,s.resources,sp.key);A.ok(options.some(x=>x.key==='sorcerer-psionic'));
 const result=R.cast(s.character,s.spellbook,s.resources,sp.key,'sorcerer-psionic');A.equal(result.resources.classResources['sorcery-points'],4);A.deepEqual(result.resources.spellSlots,s.resources.spellSlots);
 const notAberrant=fixture(6,'Clockwork Sorcery');A.ok(!R.castOptions(notAberrant.character,notAberrant.spellbook,notAberrant.resources,sp.key).some(x=>x.key==='sorcerer-psionic'));
});
test('Clockwork Restore Balance spends a Reaction; Bastion stores ward dice and reduces self damage',()=>{
 let s=fixture(6,'Clockwork Sorcery');s=S.newTurn(s);s=S.restoreBalance(s,{target:'Ally',confirmed:true});A.equal(s.resources.classState.reactionUsed,true);A.equal(s.resources.classResources['sorcerer-balance'],3);
 hasError(()=>S.restoreBalance(s,{target:'Other',confirmed:true}),/Reaction/);
 s=S.bastion(s,{target:'Self',dice:2,confirmed:true});A.equal(s.resources.classResources['sorcery-points'],4);
 s=S.wardDamage(s,{dice:1,incoming:14,confirmed:true},dice);A.equal(s.resources.lastClassEffect.blocked,6);A.equal(s.resources.hp,24);A.equal(s.resources.classState.sorcWard.dice,1);
});
test('Clockwork Trance and Cavalcade use level gates, free use and exact self healing',()=>{
 let s=fixture(18,'Clockwork Sorcery');s=S.trance(s);A.equal(s.resources.classState.sorcTranceRounds,10);s=S.cavalcade(s,{healSelf:10,confirmed:true});A.equal(s.resources.hp,42);A.equal(s.resources.classResources['sorcerer-cavalcade'],0);
 hasError(()=>S.cavalcade(s,{healSelf:101,confirmed:true}),/allocate/);
});
test('Draconic Elemental Affinity sets resistance and matching damage bonus; Wings and Companion use real charges',()=>{
 let s=fixture(18,'Draconic Sorcery');s=S.element(s,'Fire');const damaged=M.resolveIncomingDamage(s,20,'Fire');A.equal(damaged.details.resolved,10);
 s=S.affinity(s,{spell:'Fireball',damageType:'Fire',confirmed:true});A.equal(s.resources.lastClassEffect.bonus,4);
 s=S.wings(s);A.equal(s.resources.classState.dragonWingsActive,true);s=S.wings(s,{mode:'end'});s=S.wings(s);A.equal(s.resources.classResources['sorcery-points'],15);
 s=S.companion(s,{mode:'free',noConcentration:true,confirmed:true});A.equal(s.resources.classResources['sorcerer-dragon-companion'],0);A.equal(s.resources.concentration,'');
 hasError(()=>S.companion(s,{mode:'free',confirmed:true}),/exhausted/);
});
test('Wild Magic uses a mandatory roll after Tides and supports controlled choice and Tamed Surge',()=>{
 let s=fixture(18,'Wild Magic Sorcery');s=S.surges(s,{kind:'tides',confirmed:true});s=S.recordSpellCast(s,spell(),'slot1',{roller:dice});A.equal(s.resources.classState.sorcTidesSpent,false);
 A.equal(s.resources.classState.sorcWildPending.rolls.length,2);s=S.surges(s,{kind:'choose',selected:0});A.equal(s.resources.classState.sorcLastSurge.range,'85–88');
 s=S.newTurn(s);s=S.recordSpellCast(s,spell(),'slot1');s=S.surges(s,{kind:'tamed',choice:23,confirmed:true},dice);A.equal(s.resources.classState.sorcLastSurge.range,'93–96');hasError(()=>S.surges(s,{kind:'tamed',choice:24,confirmed:true},dice),/available|eligible|immediately/);
});
test('Wild Magic voluntary checks only roll after a slot cast and only once per turn',()=>{
 let s=S.newTurn(fixture(3,'Wild Magic Sorcery'));hasError(()=>S.surges(s,{kind:'check'},dice),/cast/);
 s=S.recordSpellCast(s,spell(),'slot1');s=S.surges(s,{kind:'check'},n=>n===20?20:1);A.equal(s.resources.classState.sorcWildCheckUsed,true);A.ok(s.resources.classState.sorcLastSurge);
 hasError(()=>S.surges(s,{kind:'check'},dice),/cast|already/);
});
test('Bend Luck costs exactly one point and shared Reaction',()=>{
 let s=S.newTurn(fixture(6,'Wild Magic Sorcery'));s=S.bendLuck(s,{target:'Ogre',confirmed:true,direction:'penalty'},dice);A.equal(s.resources.classResources['sorcery-points'],5);A.equal(s.resources.lastClassEffect.die,3);hasError(()=>S.bendLuck(s,{target:'Goblin',confirmed:true},dice),/Reaction/);
});
test('Druid, Bard, Cleric and non-Sorcerer characters do not receive Sorcerer class features',()=>{
 for(const cl of ['Bard','Druid','Cleric','Paladin']){const s=fixture(15);s.character.build.characterClass=cl;s.character.className=cl;A.ok(!S.isSorcerer(s.character));hasError(()=>S.innate(s),/Sorcerer/);A.deepEqual(S.grantSpells(s.character),[]);}
});
test('Sorcerer creation, class choices, save migration, and level-up preserve other Folio state',()=>{
 const raw=n=>({name:'Libby',classId:'class:sorcerer',subclassId:'subclass:draconic-sorcery',speciesId:'species:human',backgroundId:'background:acolyte',level:n,scores:{str:10,dex:14,con:14,int:10,wis:12,cha:18},backgroundPlus:'int',backgroundOne:'cha'});
 let state=B.applyToState(L.startCharacter({name:'Libby'}).present,B.buildFromInput(raw(6)));state=S.element(state,'Lightning');state=S.chooseMeta(state,['Subtle Spell','Seeking Spell']);
 const r=B.applyToState(state,B.buildFromInput(raw(10),[],state.character.build));A.equal(r.character.build.sorcererDragonElement,'Lightning');A.deepEqual(r.character.build.sorcererMetamagic,['Subtle Spell','Seeking Spell']);
 const out=St.migrate(r);A.equal(St.validate(out),true);A.equal(out.character.name,'Libby');
});
test('Innate Sorcery grants actual spell-attack Advantage, with hit/miss and Seeking enforcement',()=>{
 let s=fixture(20,'Wild Magic Sorcery');s.character.build.sorcererMetamagic=['Seeking Spell'];s=S.innate(s);
 s=S.spellAttack(s,{target:'Confirmed enemy',targetAC:22,confirmed:true},n=>n===20?10:2);
 A.deepEqual(s.resources.lastClassEffect.rolls,[10,10]);A.equal(s.resources.lastClassEffect.advantage,true);A.equal(s.resources.lastClassEffect.total,20);A.equal(s.resources.lastClassEffect.hit,false);
 s=S.seeking(s,{missConfirmed:true},n=>n===20?19:1);A.equal(s.resources.lastClassEffect.hit,true);A.equal(s.resources.lastClassEffect.total,29);
 hasError(()=>S.seeking(s,{missConfirmed:true},dice),/last tracked attack hit/);
});
test('Careful Spell names actual protected creatures and enforces Charisma limit',()=>{
 let s=fixture(10);s.character.build.sorcererMetamagic=['Careful Spell'];
 hasError(()=>S.recordSpellCast(s,spell('Fireball',3),'slot3',{metamagic:['Careful Spell'],confirmedSave:true}),/List 1/);
 s=S.recordSpellCast(s,spell('Fireball',3),'slot3',{metamagic:['Careful Spell'],confirmedSave:true,carefulTargets:['Ally One','Ally Two']});
 A.deepEqual(s.resources.lastClassEffect.carefulProtected,['Ally One','Ally Two']);A.equal(s.resources.classResources['sorcery-points'],9);
 hasError(()=>S.recordSpellCast(fixture(10),spell('Fireball',3),'slot3',{metamagic:['Careful Spell'],confirmedSave:true,carefulTargets:['One','Two','Three','Four','Five']}),/List 1|known/);
});
test('Casting-time tracker treats long-duration casts as ongoing Magic actions, not instant ones',()=>{
 let s=S.newTurn(fixture(10));s=S.recordSpellCast(s,spell('Teleportation Circle',5,'1 minute'),'slot5');
 A.equal(s.resources.classState.sorcActionUsed,true);A.match(s.resources.lastClassEffect.note,/sustained Magic actions/);
 hasError(()=>S.recordSpellCast(s,spell('Fire Bolt',0),'cantrip'),/Action already spent/);
});
