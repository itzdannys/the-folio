const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../js/inventory.js');require('../js/data.js');require('../js/class-mechanics.js');require('../js/core.js');require('../js/character.js');require('../js/storage.js');
const B=require('../js/builder.js'),L=require('../js/library.js'),C=globalThis.PipCore,S=globalThis.PipStorage;
const raw=(klass='Fighter',level=4,updates={})=>({name:'Test Hero',classId:'class:'+klass.toLowerCase(),speciesId:'species:human',backgroundId:'background:acolyte',level,scores:{str:15,dex:13,con:14,int:10,wis:10,cha:12},backgroundPlus:'int',backgroundOne:'wis',maxHp:'',...updates});
test('official single-class earned feats use SRD thresholds, including Fighter and Rogue exceptions',()=>{
 const all=B.classes.map(c=>c.name);
 for(const name of all){
  const earned=B.featMilestones(name,20);
  assert.deepEqual(earned,name==='Fighter'?[4,6,8,12,14,16,19]:name==='Rogue'?[4,8,10,12,16,19]:[4,8,12,16,19]);
  assert.deepEqual(B.featMilestones(name,3),[]);
 }
 assert.deepEqual(B.featMilestones('Artificer',20),[],'custom classes must not inherit SRD feat grants');
});
test('unselected earned milestones remain unresolved without silently increasing ability scores',()=>{
 const b=B.buildFromInput(raw('Fighter',6));
 assert.deepEqual(b.advancementUnresolved,[4,6]);
 assert.equal(b.scores.str,15);
 assert.deepEqual(b.advancementChoices,{});
});
test('ASI increases scores and derived calculations, accepts +2 or +1/+1, and survives backup export',()=>{
 const changes={4:{type:'asi',first:'str',second:'str'},6:{type:'asi',first:'con',second:'dex'}};
 const b=B.buildFromInput(raw('Fighter',6,{advancementChoices:changes}));
 assert.equal(b.scores.str,17);assert.equal(b.scores.dex,14);assert.equal(b.scores.con,15);
 assert.equal(b.advancementUnresolved.length,0);
 let state=B.applyToState(L.startCharacter({name:'Test Hero'}).present,b);
 assert.equal(state.resources.maxHp,b.suggestedHp);
 assert.ok(state.character.customFeatures.some(f=>f.id==='build-advancement-4'));
 assert.equal(C.derived(state.character,state.inventory).saves.str,6,'STR +3 and proficiency +3');
 assert.equal(S.validate(S.migrate(state)),true);
 const next=B.buildFromInput(raw('Fighter',7,{advancementChoices:changes}),[],b);
 state=B.applyToState(state,next);
 assert.equal(state.character.scores.str,17);
 assert.equal(state.resources.maxHp,next.suggestedHp);
 assert.equal(state.resources.hp,next.suggestedHp,'full HP after level up remains full');
});
test('level-down inactivates future ASIs and level-up reactivates them without double-application',()=>{
 const selections={4:{type:'asi',first:'str',second:'str'},6:{type:'asi',first:'dex',second:'dex'}};
 const at6=B.buildFromInput(raw('Fighter',6,{advancementChoices:selections}));
 const at4=B.buildFromInput(raw('Fighter',4,{advancementChoices:{}}),[],at6);
 assert.equal(at4.scores.str,17);assert.equal(at4.scores.dex,13);
 assert.equal(at4.advancementChoices[6].type,'asi');
 const back6=B.buildFromInput(raw('Fighter',6,{advancementChoices:{}}),[],at4);
 assert.equal(back6.scores.str,17);assert.equal(back6.scores.dex,15);
 assert.deepEqual(back6.advancementUnresolved,[]);
});
test('ASI exceeding 20 or missing required choices is rejected',()=>{
 assert.throws(()=>B.buildFromInput(raw('Fighter',4,{scores:{str:19,dex:13,con:14,int:10,wis:10,cha:12},advancementChoices:{4:{type:'asi',first:'str',second:'str'}}})),/above 20/);
 assert.throws(()=>B.buildFromInput(raw('Fighter',4,{advancementChoices:{4:{type:'asi',first:'str',second:''}}})),/Choose two ability/);
});
test('feat progression enforces prerequisites, duplicates, earliest level, and source classification',()=>{
 const alert=B.feats.find(x=>x.name==='Alert').id;
 const epic=B.feats.find(x=>x.name==='Boon of Fate').id;
 assert.throws(()=>B.buildFromInput(raw('Fighter',4,{advancementChoices:{4:{type:'feat',featId:epic}}})),/requires level 19/);
 assert.throws(()=>B.buildFromInput(raw('Fighter',8,{backgroundId:'background:criminal',backgroundPlus:'dex',backgroundOne:'int',advancementChoices:{4:{type:'feat',featId:alert}}})),/cannot be granted more than once/);
 const b=B.buildFromInput(raw('Fighter',19,{advancementChoices:{19:{type:'feat',featId:epic}}}));
 assert.equal(b.advancementChoices[19].featName,'Boon of Fate');
 assert.equal(b.advancementUnresolved.length,6);
});
test('Alert, Defense, and Tough automatic passive benefits apply only where actually granted',()=>{
 const criminal=B.buildFromInput(raw('Fighter',4,{backgroundId:'background:criminal',backgroundPlus:'dex',backgroundOne:'int'}));
 const state=B.applyToState(L.startCharacter({name:'Alert'}).present,criminal);
 assert.equal(C.derived(state.character,state.inventory).initiative, C.mod(criminal.scores.dex)+C.proficiency(4));
 const farmer=B.buildFromInput(raw('Fighter',4,{backgroundId:'background:farmer',backgroundPlus:'str',backgroundOne:'con'}));
 assert.equal(farmer.toughHpBonus,8);
 const without=B.buildFromInput(raw('Fighter',4));
 assert.equal(farmer.suggestedHp-without.suggestedHp,8);
 const defense=B.feats.find(f=>f.name==='Fighting Style: Defense').id;
 const built=B.buildFromInput(raw('Fighter',4,{featId:defense}));
 let equipped=B.applyToState(L.startCharacter({name:'Defender'}).present,built);
 assert.equal(C.derived(equipped.character,equipped.inventory).ac,10+C.mod(built.scores.dex));
 equipped.inventory.items=[{id:'test',category:'armor',quantity:1,equipped:true,armor:{kind:'medium',baseAC:14,dexCap:2}}];
 assert.equal(C.derived(equipped.character,equipped.inventory).ac,16);
});
test('manual HP override remains manual but blank HP correctly tracks level and constitution ASI',()=>{
 const first=B.buildFromInput(raw('Fighter',4));
 assert.equal(first.manualHp,null);
 const level5=B.buildFromInput(raw('Fighter',5),[],first);
 assert.equal(level5.manualHp,null);
 assert.ok(level5.maxHp>first.maxHp);
 const extraCon=B.buildFromInput(raw('Fighter',8,{advancementChoices:{4:{type:'asi',first:'con',second:'con'},8:{type:'asi',first:'con',second:'con'}}}),[],first);
 assert.equal(extraCon.scores.con,18);
 const without=B.buildFromInput(raw('Fighter',8),[],first);
 assert.equal(extraCon.suggestedHp-without.suggestedHp,16);
 const manual=B.buildFromInput(raw('Fighter',8,{maxHp:95}),[],first);
 assert.equal(manual.maxHp,95);assert.equal(manual.manualHp,95);
});
test('legacy Pip specialist is unchanged by the new neutral character progression',()=>{
 const pip=globalThis.PipData.newState();
 assert.notEqual(pip.character.templateKind,'starter');
 assert.equal(C.derived(pip.character,pip.inventory).initiative,C.mod(pip.character.scores.dex));
 assert.equal(pip.resources.maxHp,60);
});
test('Fighting Styles unlock at the correct class level, persist and cannot be duplicated',()=>{
 const style=B.feats.find(x=>x.name==='Fighting Style: Defense').id;
 assert.equal(B.fightingStyleLevel('Fighter'),1);
 assert.equal(B.fightingStyleLevel('Paladin'),2);
 assert.equal(B.fightingStyleLevel('Ranger'),2);
 assert.equal(B.fightingStyleLevel('Wizard'),null);
 assert.throws(()=>B.buildFromInput(raw('Paladin',1,{fightingStyleId:style})),/cannot select/);
 assert.throws(()=>B.buildFromInput(raw('Wizard',10,{fightingStyleId:style})),/cannot select/);
 const p=B.buildFromInput(raw('Paladin',2,{fightingStyleId:style}));
 assert.equal(p.fightingStyleName,'Fighting Style: Defense');
 const p3=B.buildFromInput(raw('Paladin',3),[],p);
 assert.equal(p3.fightingStyleId,style,'style persists through level up when choice input is omitted');
 const f=B.buildFromInput(raw('Fighter',4,{fightingStyleId:style}));
 assert.equal(f.grantedFeatNames.filter(x=>x==='Fighting Style: Defense').length,1);
 assert.throws(()=>B.buildFromInput(raw('Fighter',4,{fightingStyleId:style,advancementChoices:{4:{type:'feat',featId:style}}})),/cannot be granted more than once/);
});
test('Fighting Style: Archery adds exactly +2 to attacks with ranged WEAPONS but not thrown melee weapons',()=>{
 const WR=require('../js/weapon-rules.js');
 const style=B.feats.find(x=>x.name==='Fighting Style: Archery').id;
 const b=B.buildFromInput(raw('Fighter',1,{fightingStyleId:style}));
 const c=B.applyToState(L.startCharacter({name:'Marksman'}).present,b).character;
 const ranged={weapon:{kind:'Ranged',category:'Martial',ability:'dex',damage:'1d8',properties:'Ammunition',magicBonus:0}};
 const melee={weapon:{kind:'Melee',category:'Martial',ability:'str',damage:'1d8',properties:'Thrown',magicBonus:0}};
 const plain=B.buildFromInput(raw('Fighter',1));
 const p=B.applyToState(L.startCharacter({name:'Plain'}).present,plain).character;
 assert.equal(WR.stats(c,ranged).attackBonus-WR.stats(p,ranged).attackBonus,2);
 assert.equal(WR.stats(c,melee,'throw').attackBonus-WR.stats(p,melee,'throw').attackBonus,0);
});
