'use strict';
const {test}=require('node:test'), assert=require('node:assert/strict');
require('../js/inventory.js');require('../js/data.js');require('../js/core.js');require('../js/character.js');require('../js/journal.js');require('../js/storage.js');
const B=require('../js/builder.js'),Spec=require('../js/species-catalog.js'),R=require('../js/source-registry.js'),L=require('../js/library.js'),S=require('../js/storage.js');
const raw=(x={})=>({name:'Cass',classId:'class:rogue',speciesId:'species:changeling',backgroundId:'background:criminal',level:7,scores:{str:10,dex:10,con:10,int:10,wis:10,cha:10},backgroundPlus:'dex',backgroundOne:'con',speciesSize:'Medium',speciesSkills:['Insight','Performance'],...x});
test('26 species records include nine SRD, current Aasimar, five Eberron and eleven recent releases',()=>{
 assert.equal(Spec.records.length,26);assert.equal(Spec.records.filter(x=>x.sourceId==='srd-2024').length,9);
 assert.equal(Spec.records.filter(x=>x.sourceId==='eberron-2025').length,5);
 assert.equal(Spec.records.filter(x=>x.sourceId==='ravenloft-2026').length,4);
 assert.equal(Spec.records.filter(x=>x.sourceId==='lorwyn-2026').length,7);
 assert.equal(B.species.find(s=>s.name==='Aasimar').sourceId,'phb-2024');
 assert.equal(B.species.find(s=>s.name==='Changeling').sourceId,'eberron-2025');
 assert.equal(B.species.filter(s=>s.name==='Changeling').length,1,'obsolete Changeling record is not duplicated');
 assert.ok(B.species.some(s=>s.name==='Lorwyn Changeling'),'distinct species must not get deduplicated');
});
test('Eberron Changeling saves Fey type, selected size and two distinct instinct skills',()=>{
 const b=B.buildFromInput(raw());
 assert.equal(b.species,'Changeling');assert.equal(b.speciesSize,'Medium');assert.equal(b.speciesType,'Fey');assert.equal(b.speed,30);
 assert.deepEqual(b.speciesSkillChoices,['Insight','Performance']);
 assert.ok(b.skills.includes('Insight')&&b.skills.includes('Performance'));
 assert.equal(b.speciesTraits.find(t=>t.name==='Shape-Shifter').name,'Shape-Shifter');
 assert.equal(b.scores.dex,12,'species choice must not invent ability scores');
});
test('illegal species size, ancestry, skill and duplicate choices are rejected',()=>{
 assert.throws(()=>B.buildFromInput(raw({speciesSize:'Huge'})),/Species size must be/);
 assert.throws(()=>B.buildFromInput(raw({speciesSkills:['Arcana']})),/not valid/);
 assert.throws(()=>B.buildFromInput(raw({speciesSkills:['Insight','Insight']})),/different/);
 assert.throws(()=>B.buildFromInput(raw({speciesSkills:['Insight','Performance','Deception']})),/not valid/);
 assert.throws(()=>B.buildFromInput(raw({speciesId:'species:elf',speciesVariant:'Goblin',speciesSkills:[]})),/Invalid elven lineage/);
});
test('core lineages and sizes are explicitly recorded, but optional choices remain incomplete rather than invented',()=>{
 const elf=B.buildFromInput(raw({speciesId:'species:elf',speciesSkills:['Perception'],speciesSize:'Medium',speciesVariant:'Wood Elf'}));
 assert.equal(elf.speciesVariant,'Wood Elf');assert.equal(elf.speciesChoices.pending.length,0);
 const orc=B.buildFromInput(raw({speciesId:'species:orc',speciesSkills:[],speciesSize:''}));
 assert.equal(orc.speciesSize,'Medium');
 const human=B.buildFromInput(raw({speciesId:'species:human',speciesSkills:[],speciesSize:'Small'}));
 assert.deepEqual(human.speciesChoices.pending,['Choose 1 skill']);
});
test('reference-only species without bundled speed must have manual speed, never an invented default',()=>{
 assert.throws(()=>B.buildFromInput(raw({speciesId:'species:kalashtar',speciesSkills:[],speciesSize:'Medium'})),/Enter the species speed/);
 const b=B.buildFromInput(raw({speciesId:'species:kalashtar',speciesSkills:[],speciesSize:'Medium',speciesSpeed:'30'}));
 assert.equal(b.species,'Kalashtar');assert.equal(b.speciesType,'Aberration');assert.equal(b.speed,30);assert.equal(b.speciesSpeedManual,30);
 assert.ok(b.speciesTraits.some(x=>x.name==='Mindlink'));
});
test('individual species feature cards survive storage and library backups',()=>{
 const build=B.buildFromInput(raw());const state=B.applyToState(L.startCharacter({name:'Cass'}).present,build);
 assert.equal(state.character.size,'Medium');assert.equal(state.character.creatureType,'Fey');
 assert.ok(state.character.profSkills.includes('Performance'));
 assert.ok(state.character.customFeatures.some(f=>f.name==='Shape-Shifter'&&f.group==='Species'));
 assert.ok(state.character.customFeatures.some(f=>f.name==='Species selections'));
 assert.equal(S.validate(state),true);assert.equal(S.migrate(state).character.build.speciesType,'Fey');
 const record=L.addCharacter(L.fromLegacy(null),{present:state,past:[]},null);
 const restored=L.importPackage(JSON.stringify(L.exportAll(record.data)));
 assert.equal(restored.library.characters.find(x=>x.name==='Cass').stack.present.character.size,'Medium');
});
test('local species pack entries can set speed, size, creature type and separate traits with strict bounds',()=>{
 const pkg={format:'folio-source-pack',version:1,id:'user-tome',name:'Personally Owned Supplement',published:'2026',license:'User notes',description:'Personal species references',entries:[{id:'moonling',category:'species',name:'Moonling',speed:35,sizes:['Small'],creatureType:'Fey',traits:['Moon Step','Starfall'],description:'Original notes'}]};
 const pack=R.parseUserPack(pkg),o=B.optionList('species',[],[pack]).find(x=>x.name==='Moonling');
 assert.equal(o.speed,35);assert.deepEqual(o.sizes,['Small']);assert.equal(o.traits[0].name,'Moon Step');
 const b=B.buildFromInput(raw({speciesId:o.id,speciesSize:'Small',speciesSkills:[]}),[],null,[pack]);
 assert.equal(b.species,'Moonling');assert.equal(b.speed,35);assert.equal(b.speciesType,'Fey');
 const same=B.buildFromInput(raw({speciesId:o.id,speciesSize:'Small',speciesSkills:[]}),[],b,[]);
 assert.equal(same.speciesTraits.length,2,'saved snapshot works without installed user pack');
 assert.throws(()=>R.parseUserPack({...pkg,entries:[{...pkg.entries[0],speed:999}]}),/Invalid source pack/);
 assert.throws(()=>R.parseUserPack({...pkg,entries:[{...pkg.entries[0],traits:['x'.repeat(101)]}]}),/Invalid source pack/);
 assert.throws(()=>R.parseUserPack({...pkg,entries:[{...pkg.entries[0],sizes:['Huge']}]}),/Invalid source pack/);
});
test('Pip remains specialist: new species build cannot overwrite his rules',()=>{
 const pip=globalThis.PipData.newState();const build=B.buildFromInput(raw());
 assert.throws(()=>B.applyToState(pip,build),/protected/);
 assert.match(pip.character.species,/Changeling/);
});
test('SRD dwarf toughness scales with level and Wood Elf movement is 35 feet',()=>{
 const dwarf=B.buildFromInput(raw({speciesId:'species:dwarf',speciesSkills:[],speciesSize:'Medium',level:7}));
 const elf=B.buildFromInput(raw({speciesId:'species:elf',speciesVariant:'Wood Elf',speciesSkills:['Perception'],speciesSize:'Medium'}));
 assert.equal(dwarf.speciesHpBonus,7);assert.equal(dwarf.suggestedHp,45);
 assert.equal(elf.speed,35);assert.equal(elf.darkvisionFeet,60);assert.ok(elf.skills.includes('Perception'));
 const drow=B.buildFromInput(raw({speciesId:'species:elf',speciesVariant:'Drow',speciesSkills:['Perception'],speciesSize:'Medium'}));
 assert.equal(drow.darkvisionFeet,120);
});
test('editing a newly created species build removes only tracked previous granted skills',()=>{
 const first=B.buildFromInput(raw());let state=B.applyToState(L.startCharacter({name:'Cass'}).present,first);
 assert.ok(state.character.profSkills.includes('Performance'));
 const next=B.buildFromInput(raw({speciesId:'species:orc',speciesSkills:[],speciesSize:'Medium'}),[],first);
 state=B.applyToState(state,next);
 assert.ok(!state.character.profSkills.includes('Performance'));
 assert.ok(state.character.profSkills.includes('Sleight of Hand'),'background skills remain');
 assert.equal(state.character.creatureType,'Humanoid');
});
