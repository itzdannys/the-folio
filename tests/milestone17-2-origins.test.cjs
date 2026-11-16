const {test}=require('node:test');
const assert=require('node:assert/strict');
const O=require('../js/origin-catalog.js');
const B=require('../js/builder.js');
require('../js/inventory.js');require('../js/data.js');require('../js/core.js');require('../js/character.js');require('../js/artwork.js');require('../js/journal.js');require('../js/storage.js');
const L=require('../js/library.js'),R=require('../js/source-registry.js');
const raw=(overrides={})=>({name:'Mara',level:5,classId:'class:fighter',speciesId:'species:human',backgroundId:'background:artisan',subclassId:'',featId:'',scores:{str:10,dex:10,con:10,int:10,wis:10,cha:10},backgroundPlus:'str',backgroundOne:'dex',...overrides});
test('16 official background names and mechanically labelled source provenance',()=>{
 assert.equal(O.backgrounds.length,16);assert.equal(new Set(O.backgrounds.map(x=>x.name)).size,16);
 assert.equal(O.backgrounds.filter(x=>x.sourceId==='srd-2024').length,4);
 assert.equal(O.backgrounds.filter(x=>x.sourceId==='phb-2024').length,12);
 for(const bg of O.backgrounds){assert.equal(bg.abilities.length,3);assert.equal(bg.skills.length,2);assert.ok(bg.tool&&bg.feat&&bg.sourceUrl);}
});
test('extra feats cover SRD category types and PHB-only background grants',()=>{
 assert.ok(O.feats.length>=25);
 const categories=new Set(O.feats.map(x=>x.category));assert.deepEqual([...categories].sort(),['Epic Boon','Fighting Style','General','Origin']);
 for(const bg of O.backgrounds)assert.ok(O.feats.some(f=>f.name===bg.feat),'Missing '+bg.feat);
 assert.equal(O.feats.find(x=>x.name==='Tough').sourceId,'phb-2024');
 assert.equal(O.feats.find(x=>x.name==='Fighting Style: Defense').id,'feat:fighting-style-defense');
 assert.equal(O.feats.find(x=>x.name==='Magic Initiate (Wizard)').id,'feat:magic-initiate-wizard');
});
test('2024 +2/+1 and +1/+1/+1 background allocation are exclusive and bounded',()=>{
 const split=B.buildFromInput(raw());assert.equal(split.scores.str,12);assert.equal(split.scores.dex,11);assert.equal(split.scores.int,10);
 const triple=B.buildFromInput(raw({backgroundMethod:'triple'}));assert.equal(triple.scores.str,11);assert.equal(triple.scores.dex,11);assert.equal(triple.scores.int,11);
 assert.equal(triple.backgroundMethod,'triple');assert.equal(triple.backgroundPlus,'');assert.equal(triple.backgroundOne,'');
 assert.equal(triple.backgroundTool,'Artisan’s Tools (choose)');assert.equal(triple.backgroundFeat,'Crafter');
 assert.throws(()=>B.buildFromInput(raw({backgroundPlus:'wis'})),/Background increases/);
 assert.throws(()=>B.buildFromInput(raw({scores:{str:19,dex:10,con:10,int:10,wis:10,cha:10}})),/above 20/);
 assert.throws(()=>B.buildFromInput(raw({scores:{str:20,dex:10,con:10,int:10,wis:10,cha:10},backgroundMethod:'triple'})),/above 20/);
});
test('general, epic, grappler, spellcasting and fighting style prerequisites',()=>{
 const id=name=>O.feats.find(f=>f.name===name).id;
 assert.throws(()=>B.buildFromInput(raw({level:3,featId:id('Grappler')})),/level 4/);
 assert.throws(()=>B.buildFromInput(raw({featId:id('Grappler')})),/Strength or Dexterity 13/);
 assert.equal(B.buildFromInput(raw({scores:{str:13,dex:10,con:10,int:10,wis:10,cha:10},featId:id('Grappler')})).feat,'Grappler');
 assert.throws(()=>B.buildFromInput(raw({level:18,featId:id('Boon of Truesight')})),/level 19/);
 assert.throws(()=>B.buildFromInput(raw({level:19,featId:id('Boon of Spell Recall')})),/Spellcasting/);
 assert.equal(B.buildFromInput(raw({classId:'class:wizard',level:19,featId:id('Boon of Spell Recall')})).feat,'Boon of Spell Recall');
 assert.equal(B.buildFromInput(raw({level:1,featId:id('Fighting Style: Defense')})).feat,'Fighting Style: Defense');
 assert.throws(()=>B.buildFromInput(raw({level:1,classId:'class:paladin',featId:id('Fighting Style: Defense')})),/Fighting Style feature/);
 assert.equal(B.buildFromInput(raw({level:2,classId:'class:paladin',featId:id('Fighting Style: Defense')})).feat,'Fighting Style: Defense');
});
test('origin feats are not doubled when nonrepeatable and PHB references do not auto-apply invented mechanics',()=>{
 assert.throws(()=>B.buildFromInput(raw({backgroundId:'background:criminal',featId:'feat:alert',backgroundPlus:'dex',backgroundOne:'con'})),/cannot be selected twice/);
 assert.throws(()=>B.buildFromInput(raw({backgroundId:'background:sage',featId:'feat:magic-initiate-wizard',backgroundPlus:'int',backgroundOne:'wis'})),/cannot be selected twice/);
 const b=B.buildFromInput(raw({backgroundId:'background:charlatan',featId:'feat:skilled',backgroundPlus:'dex',backgroundOne:'con'}));
 assert.equal(b.feat,'Skilled');assert.equal(b.backgroundFeat,'Skilled');
 assert.equal(b.scores.str,10);assert.equal(b.maxHp,b.suggestedHp);
 const withExtra=B.applyToState(L.startCharacter({name:'Mara'}).present,b);
 assert.equal(withExtra.character.customFeatures.filter(x=>x.name==='Skilled').length,2);
 const state=B.applyToState(L.startCharacter({name:'Mara'}).present,B.buildFromInput(raw()));
 assert.equal(state.character.background,'Artisan');assert.equal(state.character.build.backgroundFeat,'Crafter');
 assert.ok(state.character.customFeatures.some(f=>f.name==='Crafter'));
});
test('registry correctly distinguishes included SRD metadata and reference-only PHB metadata',()=>{
 const lib=L.normalize(L.fromLegacy(null));const records=R.registry(lib);
 assert.equal(records.filter(x=>x.category==='background').length,16);
 assert.equal(records.filter(x=>x.category==='feat').length,O.feats.length);
 const artisan=records.find(x=>x.name==='Artisan'&&x.category==='background');
 const acolyte=records.find(x=>x.name==='Acolyte'&&x.category==='background');
 assert.equal(artisan.sourceId,'phb-2024');assert.equal(artisan.status,'interactive');assert.equal(artisan.license,'Proprietary');
 assert.equal(acolyte.sourceId,'srd-2024');assert.equal(acolyte.license,'CC BY 4.0');
 assert.ok(records.every(x=>x.sourceId&&x.license&&x.status));
});
test('new origin metadata survives save/export/reimport and does not touch Pip',()=>{
 let lib=L.normalize(L.fromLegacy(null));const fresh=L.startCharacter({name:'Mara'});
 fresh.present=B.applyToState(fresh.present,B.buildFromInput(raw({backgroundMethod:'triple'})));
 lib=L.addCharacter(lib,fresh).data;
 const migrated=L.importPackage(JSON.stringify(L.exportAll(lib))).library;
 const build=migrated.characters.find(x=>x.name==='Mara').stack.present.character.build;
 assert.equal(build.backgroundMethod,'triple');assert.equal(build.backgroundFeat,'Crafter');
 assert.notEqual(migrated.characters.find(x=>x.name==='Pip').stack.present.character.templateKind,'starter');
});
test('any user-entered sourcebook can contribute selectable background/feat entries without claiming automatic text or rules',()=>{
 const pack=R.parseUserPack({format:'folio-source-pack',version:1,id:'user-test-source',name:'My Official-Book Notes',published:'2026',license:'User-provided metadata',description:'Notes transcribed from a personally owned supplement.',entries:[
  {id:'archivist',category:'background',name:'Archivist',abilities:['int','wis','cha'],skills:['History','Investigation'],tool:'Calligrapher’s Supplies',feat:'Skilled',description:'User-entered background metadata'},
  {id:'quick-thinker',category:'feat',name:'Quick Thinker',minLevel:4,featCategory:'General',description:'User reference; mechanics manually applied'}
 ]});
 const bg=B.optionList('background',[],[pack]).find(o=>o.name==='Archivist');
 const feat=B.optionList('feat',[],[pack]).find(o=>o.name==='Quick Thinker');
 assert.equal(bg.sourceId,'user-test-source');assert.equal(bg.official,false);
 assert.equal(feat.category,'General');assert.equal(feat.minLevel,4);
 const built=B.buildFromInput(raw({backgroundId:bg.id,backgroundPlus:'int',backgroundOne:'wis',featId:feat.id,level:5}),[],null,[pack]);
 assert.equal(built.background,'Archivist');assert.equal(built.scores.int,12);assert.equal(built.scores.wis,11);
 assert.equal(built.backgroundFeat,'Skilled');assert.equal(built.feat,'Quick Thinker');
 assert.throws(()=>B.buildFromInput(raw({backgroundId:bg.id,backgroundPlus:'int',backgroundOne:'wis',featId:feat.id,level:3}),[],null,[pack]),/level 4/);
 // Once saved, the snapshot can still be edited if the optional pack is removed.
 assert.equal(B.buildFromInput(raw({backgroundId:bg.id,backgroundPlus:'int',backgroundOne:'wis',featId:feat.id}),[],built,[]).background,'Archivist');
});
test('source-pack metadata rejects non-ability keys and invalid category, retaining safe import limits',()=>{
 const base={format:'folio-source-pack',version:1,id:'user-another',name:'Book notes',published:'2026',license:'User-created',description:'',entries:[{id:'archivist',category:'background',name:'Archivist',abilities:['int','wis','cha']}]};
 assert.throws(()=>R.parseUserPack({...base,entries:[{...base.entries[0],abilities:['constructor']}]}),/Invalid source pack/);
 assert.throws(()=>R.parseUserPack({...base,entries:[{...base.entries[0],skills:['X'.repeat(500)]}]}),/Invalid source pack/);
 assert.throws(()=>R.parseUserPack({...base,entries:[{...base.entries[0],featCategory:'Script'}]}),/Invalid source pack/);
});
