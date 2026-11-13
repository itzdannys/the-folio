const {test}=require('node:test');const assert=require('node:assert/strict');
require('../js/inventory.js');require('../js/data.js');require('../js/core.js');require('../js/character.js');require('../js/journal.js');require('../js/storage.js');
const B=require('../js/builder.js'),L=require('../js/library.js'),D=globalThis.PipData,S=globalThis.PipStorage,C=globalThis.PipCore,H=globalThis.PipCharacter;
const raw=(changes={})=>({name:'Ilyra',classId:'class:wizard',speciesId:'species:elf',backgroundId:'background:sage',subclassId:'',featId:'',level:5,scores:{str:10,dex:10,con:10,int:10,wis:10,cha:10},maxHp:'',backgroundPlus:'int',backgroundOne:'wis',...changes});
test('12 classes, nine SRD species, four SRD backgrounds and all levels 1–20 are selectable',()=>{
 assert.equal(B.classes.length,12);assert.equal(B.species.length,9);assert.equal(B.backgrounds.length,4);
 for(const c of B.classes)for(let level=1;level<=20;level++){
  const b=B.buildFromInput(raw({classId:c.id,level,backgroundPlus:'',backgroundOne:''}));
  assert.equal(b.level,level);assert.equal(b.slotMax.length,9);assert.equal(b.hitDie,c.hitDie);
 }
});
test('single-class spell progression: Wizard 5, Paladin 7, Warlock 17 and noncaster',()=>{
 assert.deepEqual(B.slotsFor(B.classes.find(c=>c.name==='Wizard'),5).slice(0,4),[4,3,2,0]);
 assert.deepEqual(B.slotsFor(B.classes.find(c=>c.name==='Paladin'),1).slice(0,2),[2,0]);
 assert.deepEqual(B.slotsFor(B.classes.find(c=>c.name==='Paladin'),7).slice(0,3),[4,3,0]);
 assert.deepEqual(B.slotsFor(B.classes.find(c=>c.name==='Warlock'),17).slice(0,6),[0,0,0,0,4,0]);
 assert.ok(B.slotsFor(B.classes.find(c=>c.name==='Barbarian'),20).every(v=>v===0));
});
test('2024 background scores, saves, skills, feat, fixed-average HP and subclass validation',()=>{
 const b=B.buildFromInput(raw());assert.equal(b.scores.int,12);assert.equal(b.scores.wis,11);assert.deepEqual(b.saves,['int','wis']);assert.deepEqual(b.skills,['Arcana','History']);assert.equal(b.feat,'Magic Initiate (Wizard)');assert.equal(b.suggestedHp,22);
 assert.throws(()=>B.buildFromInput(raw({backgroundPlus:'str'})),/Background increases/);
 assert.throws(()=>B.buildFromInput(raw({subclassId:B.subclasses.find(x=>x.name==='Champion').id})),/Subclass does not belong/);
 assert.throws(()=>B.buildFromInput(raw({subclassId:B.subclasses.find(x=>x.name==='Evoker').id,level:2})),/level 3/);
});
test('homebrew supports classes, backgrounds, subclasses, species, feats, spells, weapons, items',()=>{
 let homebrew=[];for(const kind of B.KINDS)homebrew=B.homebrewAdd(homebrew,{kind,name:'Homebrew '+kind,description:'Reusable custom option'});
 assert.equal(homebrew.length,B.KINDS.length);
 assert.equal(new Set(homebrew.map(x=>x.id)).size,homebrew.length);
 homebrew=B.homebrewUpdate(homebrew,homebrew[0].id,{kind:'class',name:'Artificer',hitDie:8,casting:'half',saves:'con,int',primary:'int'});
 const art=homebrew[0];const build=B.buildFromInput(raw({classId:art.id}),homebrew);
 assert.equal(build.characterClass,'Artificer');assert.equal(build.spellAbility,'int');assert.deepEqual(build.saves,['con','int']);
 assert.equal(B.homebrewRemove(homebrew,art.id).length,homebrew.length-1);
 const afterDelete=B.buildFromInput(raw({classId:art.id}),[],build);assert.equal(afterDelete.characterClass,'Artificer');
});
test('homebrew mechanical effects apply once and survive save migration',()=>{
 const opt=B.normalizeHomebrew({kind:'species',name:'Moonfolk',speed:35,bonusAbility:'dex',bonusAmount:1,acBonus:1});
 const b=B.buildFromInput(raw({speciesId:opt.id,backgroundPlus:'',backgroundOne:''}),[opt]);
 assert.equal(b.scores.dex,11);assert.equal(b.speed,35);assert.equal(b.acBonus,1);
 const starter=L.startCharacter({name:'Ilyra'});starter.present=B.applyToState(starter.present,b);
 const s=starter.present;assert.equal(s.character.scores.dex,11);assert.equal(C.derived(s.character,s.inventory).ac,11);assert.equal(s.resources.maxHp,22);
 assert.equal(S.validate(s),true);assert.equal(S.migrate(s).character.build.ids.species,opt.id);
 const second=B.buildFromInput(raw({speciesId:opt.id,backgroundPlus:'',backgroundOne:''}),[],b);
 const applied=B.applyToState(s,second);assert.equal(applied.character.scores.dex,11,'does not add bonus twice');
});
test('leveling a generic character recalculates Hit Dice and slots, preserves spent uses',()=>{
 const start=B.buildFromInput(raw({level:5}));let state=B.applyToState(L.startCharacter({name:'Ilyra'}).present,start);
 state.resources.spellSlots[0]-=1;state.resources.hp-=3;
 const next=B.buildFromInput(raw({level:6}),[],start);state=B.applyToState(state,next);
 assert.equal(state.character.level,6);assert.equal(state.resources.hitDice,6);
 assert.equal(state.resources.spellSlots[0],3);assert.equal(state.resources.hp,23);
 assert.equal(S.validate(state),true);
});
test('legacy Pip state remains specialist and cannot be replaced by builder',()=>{
 const pip=D.newState();const b=B.buildFromInput(raw());assert.throws(()=>B.applyToState(pip,b),/protected/);
 assert.equal(pip.character.scores.dex,16);assert.equal(pip.character.className,'Paladin');
});
test('library exports and reimports reusable homebrew without losing legacy characters',()=>{
 let lib=L.fromLegacy(null);lib.homebrew=B.homebrewAdd(lib.homebrew,{kind:'feat',name:'Strange Luck',acBonus:1});
 const pkg=L.exportAll(lib);const parsed=L.importPackage(JSON.stringify(pkg));const merged=L.mergePackage(L.fromLegacy(null),parsed).data;
 assert.equal(merged.homebrew.length,1);assert.equal(merged.characters.length,2);assert.equal(L.validate(merged),true);
 assert.equal(L.normalize({...lib,homebrew:undefined}).homebrew.length,0);
});
test('character editor score edits update saved builder base scores',()=>{
 let state=B.applyToState(L.startCharacter({name:'Ilyra'}).present,B.buildFromInput(raw()));
 const c={...state.character,scores:{...state.character.scores,dex:16}};
 state=H.applyCharacterState(state,c);
 assert.equal(state.character.build.baseScores.dex,16);
});
