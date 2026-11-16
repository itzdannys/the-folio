'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
require('../js/inventory.js');require('../js/data.js');require('../js/core.js');require('../js/character.js');require('../js/storage.js');
const M=require('../js/class-mechanics.js'),C=globalThis.PipCore,B=require('../js/builder.js'),L=require('../js/library.js'),S=require('../js/storage.js');
function setup(klass,subclass,level=10,changes={}){
 const character={templateKind:'starter',className:klass,subclass,level,scores:{str:12,dex:14,con:14,int:12,wis:18,cha:18},profSaves:[],profSkills:[],tools:[],build:{characterClass:klass,subclass,spellAbility:'cha',slotMax:[4,3,3,2,1]}};
 const resources={hp:10,maxHp:65,tempHp:0,classResources:M.normalizeResources(character),classState:{},spellSlots:[4,3,3,2,1],concentration:'',conditions:[],...changes};
 return {character,resources,inventory:{items:[]},encounter:{active:false,round:1,roster:[],currentId:null}};
}
test('Life Domain Preserve Life heals only to half HP and spends exactly one Channel Divinity',()=>{
 let s=setup('Cleric','Life Domain',8,{hp:10,maxHp:60});
 const a=M.usePreserveLife(s,20,10);
 assert.equal(a.resources.hp,30);
 assert.equal(a.resources.classResources['channel-divinity'],2);
 assert.equal(a.resources.lastClassEffect.otherAmount,10);
 assert.equal(a.resources.lastClassEffect.unused,10);
 assert.equal(s.resources.hp,10);
 assert.throws(()=>M.usePreserveLife(s,21,0),/above half/);
 assert.throws(()=>M.usePreserveLife(s,20,21),/exceeds/);
 assert.throws(()=>M.usePreserveLife({...s,resources:{...s.resources,hp:30}},1,0),/below half/);
 assert.throws(()=>M.usePreserveLife(setup('Cleric','Life Domain',2),1,0),/level 3/);
 assert.throws(()=>M.usePreserveLife(setup('Cleric','Not Life Domain',8),1,0),/Life Domain/);
});
test('Life Domain Preserve Life cannot spend when Channel Divinity is depleted',()=>{
 const s=setup('Cleric','Life Domain',8);s.resources.classResources['channel-divinity']=0;
 assert.throws(()=>M.usePreserveLife(s,1),/Channel Divinity/);
});
test('Fiend temp HP are nonstacking, require confirmed defeated enemy and proximity for ally',()=>{
 let s=setup('Warlock','Fiend Patron',8,{tempHp:20});
 const a=M.useDarkOnesBlessing(s,{enemyDefeated:true});
 assert.equal(a.resources.tempHp,20,'higher existing temp HP remains');
 s.resources.tempHp=0;
 const b=M.useDarkOnesBlessing(s,{enemyDefeated:true,byAlly:true,withinTenFeet:true});
 assert.equal(b.resources.tempHp,12,'8 Warlock levels plus CHA modifier 4');
 assert.throws(()=>M.useDarkOnesBlessing(s,{enemyDefeated:true,byAlly:true}),/proximity/);
 assert.throws(()=>M.useDarkOnesBlessing(s,{}),/Confirm/);
 assert.throws(()=>M.useDarkOnesBlessing(setup('Warlock','No Patron',8),{enemyDefeated:true}),/Fiend Patron/);
});
test('Fiend Own Luck spends d10 resource only at level 6 and resets on long rest',()=>{
 let s=setup('Warlock','Fiend Patron',6);
 let a=M.useDarkOnesLuck(s,9,15,7);
 assert.equal(a.resources.lastClassEffect.total,16);
 assert.equal(a.resources.lastClassEffect.success,true);
 assert.equal(a.resources.classResources['dark-ones-luck'],3);
 assert.equal(M.rest(a.character,a.resources.classResources,'short')['dark-ones-luck'],3);
 assert.equal(M.rest(a.character,a.resources.classResources,'long')['dark-ones-luck'],4);
 assert.throws(()=>M.useDarkOnesLuck(setup('Warlock','Fiend Patron',5),9,15,7),/level 6/);
 assert.throws(()=>M.useDarkOnesLuck(s,9,15,11),/valid d10/);
});
test('Fiendish Resilience requires rest, excludes Force, applies automatic typed damage resistance',()=>{
 let s=setup('Warlock','Fiend Patron',10,{hp:45,tempHp:0});
 assert.throws(()=>M.chooseFiendResilience(s,'Fire',false),/Rest/);
 assert.throws(()=>M.chooseFiendResilience(s,'Force',true),/cannot select Force/);
 s=M.chooseFiendResilience(s,'Fire',true);
 const fire=M.resolveIncomingDamage(s,19,'Fire');
 assert.equal(fire.details.resolved,9);
 assert.equal(fire.details.source,'Fiendish Resilience');
 assert.equal(fire.state.resources.hp,36);
 assert.equal(M.resolveIncomingDamage(s,19,'Cold').details.resolved,19);
 s=M.chooseFiendResilience(s,'Cold',true);
 assert.equal(M.resolveIncomingDamage(s,18,'Cold').details.resolved,9);
 assert.equal(M.resolveIncomingDamage(s,18,'Fire').details.resolved,18);
 assert.throws(()=>M.chooseFiendResilience(setup('Warlock','Fiend Patron',9),'Fire',true),/level 10/);
});
test('Fiendish Resilience damage stacking is nonmultiplicative and respects vulnerability',()=>{
 const s=M.chooseFiendResilience(setup('Warlock','Fiend Patron',10,{hp:50}),'Poison',true);
 assert.equal(M.resolveIncomingDamage(s,21,'Poison',{resistant:true}).details.resolved,10);
 assert.equal(M.resolveIncomingDamage(s,21,'Poison',{vulnerable:true}).details.resolved,20);
 assert.equal(M.resolveIncomingDamage(s,21,'Poison',{immune:true}).details.resolved,0);
});
test('Draconic Resilience raises builder automatic HP at level 3 and subsequent levels',()=>{
 const raw=(lev,sub='subclass:draconic-sorcery',hp='')=>({name:'Dragon Sorcerer',classId:'class:sorcerer',subclassId:sub,speciesId:'species:human',backgroundId:'background:acolyte',level:lev,scores:{str:10,dex:14,con:14,int:10,wis:12,cha:16},backgroundPlus:'int',backgroundOne:'cha',maxHp:hp});
 const available=B.optionList('subclass').filter(x=>x.name==='Draconic Sorcery');assert.equal(available.length,1);
 const id=available[0].id;
 const make=(n,hp='')=>B.buildFromInput(raw(n,id,hp));
 const at3=make(3),at4=make(4),manual=make(4,90);
 assert.equal(at3.draconicHpBonus,5);assert.equal(at4.draconicHpBonus,6);
 assert.equal(at4.suggestedHp-at3.suggestedHp,7,'ordinary level gain 6 plus Draconic 1');
 assert.equal(manual.maxHp,90);assert.equal(manual.suggestedHp,at4.suggestedHp);
 const before=B.applyToState(L.startCharacter({name:'Dragon Sorcerer'}).present,at3);
 const after=B.applyToState(before,at4);
 assert.equal(after.resources.maxHp,at4.maxHp);
 assert.equal(after.resources.hp,at4.maxHp);
 assert.equal(S.validate(S.migrate(after)),true);
});
test('Draconic unarmored AC uses DEX and CHA; equipping armor cancels it',()=>{
 const s=setup('Sorcerer','Draconic Sorcery',6);
 assert.equal(C.derived(s.character,s.inventory,s.resources).ac,16);
 s.inventory.items.push({id:'armor',category:'armor',quantity:1,equipped:true,armor:{kind:'light',baseAC:11,dexCap:9}});
 assert.equal(M.passive(s.character,s.inventory).unarmoredAC,null);
 assert.equal(C.derived(s.character,s.inventory,s.resources).ac,13);
 assert.equal(M.passive(setup('Sorcerer','Different',6).character,{items:[]}).unarmoredAC,null);
});
test('Dragon Wings spent free use or sorcery points with manual activation and dismissal',()=>{
 let s=setup('Sorcerer','Draconic Sorcery',14);
 let activated=M.useDragonWings(s,'free');
 assert.equal(activated.resources.classResources['dragon-wings'],0);
 assert.equal(activated.resources.classState.dragonWingsActive,true);
 assert.equal(activated.resources.lastClassEffect.flySpeed,60);
 let dismissed=M.useDragonWings(activated);
 assert.equal(dismissed.resources.classState.dragonWingsActive,false);
 assert.throws(()=>M.useDragonWings(dismissed,'free'),/spent/);
 let paid=M.useDragonWings(dismissed,'sorcery');
 assert.equal(paid.resources.classResources['sorcery-points'],11);
 assert.equal(M.rest(paid.character,paid.resources.classResources,'long')['dragon-wings'],1);
 assert.throws(()=>M.useDragonWings(setup('Sorcerer','Draconic Sorcery',13)),/level 14/);
});
test('New subclass state survives clone/persistence without modifying original character',()=>{
 let s=setup('Warlock','Fiend Patron',10);
 s=M.chooseFiendResilience(s,'Necrotic',true);
 s=M.useDarkOnesBlessing(s,{enemyDefeated:true});
 const copy=S.clone(s);
 assert.equal(copy.resources.classState.fiendResistance,'Necrotic');
 assert.equal(copy.resources.tempHp,14);
 assert.equal(s.character.subclass,'Fiend Patron');
});

test('Subclasses grant SRD spells at exact class levels without counting as preparations',()=>{
 require('../js/spell-catalog.js');require('../js/spell-expansions.js');require('../js/spell-supplements.js');
 const F=require('../js/rules-engine.js');
 const c=(cl,sub,n)=>({templateKind:'starter',className:cl,subclass:sub,level:n,build:{characterClass:cl,subclass:sub,slotMax:[4,3,3,2,1]}});
 assert.equal(F.classGrantedSpellNames(c('Cleric','Life Domain',2)).length,0);
 assert.equal(F.classGrantedSpellNames(c('Cleric','Life Domain',3)).length,4);
 assert.equal(F.classGrantedSpellNames(c('Cleric','Life Domain',5)).length,6);
 assert.equal(F.classGrantedSpellNames(c('Cleric','Life Domain',9)).length,10);
 assert.equal(F.classGrantedSpellNames(c('Sorcerer','Draconic Sorcery',9)).length,10);
 assert.equal(F.classGrantedSpellNames(c('Warlock','Fiend Patron',9)).length,11); // Contact Patron adds Contact Other Plane at level 9
 assert.equal(F.classGrantedSpellNames(c('Sorcerer','Unrelated',9)).length,0);
 const warlock=c('Warlock','Fiend Patron',5),f=F.classGrantedSpellNames(warlock);
 assert.ok(f.includes('Fireball'));
 const fireball=F.catalog().find(sp=>sp.name==='Fireball');assert.ok(fireball);
 assert.ok(F.availableSpells(warlock).some(sp=>sp.key===fireball.key));
 const book={catalogSelections:[],catalogSnapshots:{},custom:[]};
 assert.equal(F.selectionSummary(warlock,book).counts.prepared,0);
 assert.equal(F.selectionSummary(warlock,book).counts.granted,6);
 assert.ok(F.castOptions(warlock,book,{spellSlots:[0,0,2],mysticArcanum:{}},fireball.key).some(o=>o.key==='slot3'));
 assert.match(F.selectionError(warlock,book,[fireball.key]),/always prepared/);
});
test('Subclass spell grants do not bypass class restrictions for unrelated characters',()=>{
 const F=require('../js/rules-engine.js');
 const c={templateKind:'starter',className:'Sorcerer',level:5,subclass:'Draconic Sorcery',build:{characterClass:'Sorcerer',subclass:'Draconic Sorcery'}};
 assert.ok(F.availableSpells(c).some(x=>x.name==='Command'),'Draconic Sorcerer has granted non-Sorcerer spell');
 assert.equal(F.availableSpells({...c,subclass:'Different',build:{characterClass:'Sorcerer',subclass:'Different'}}).some(x=>x.name==='Command'),false);
 assert.equal(F.classGrantedSpellNames({...c,level:2}).length,0);
});
