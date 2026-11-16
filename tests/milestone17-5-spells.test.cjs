'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
require('../js/spell-catalog.js');
const E=require('../js/spell-expansions.js'),R=require('../js/rules-engine.js'),P=require('../js/source-registry.js');
const srds=globalThis.FolioSpellCatalog.spells;
const hero=(cls='Wizard',level=7)=>({name:'Starling',level,templateKind:'starter',build:{characterClass:cls}});
const draft=(keys=[])=>({catalogSelections:keys,custom:[],castLog:[],catalogSnapshots:{}});
const packJSON=()=>JSON.stringify({format:'folio-source-pack',version:1,id:'user-my-book',name:'My Owned Book',edition:'current',description:'Private notes from my book',published:'2026',license:'User-provided',entries:[{category:'spell',id:'star-song',name:'Star Song',level:2,classes:['Wizard','Bard'],school:'Illusion',castingTime:'Action',range:'60 feet',description:'Use your own book to resolve this spell. Do not automatically apply effects.',concentration:null,ritual:null}]});

test('PHB reference index completes 391 distinct spells without duplicating SRD aliases',()=>{
 assert.equal(srds.length,339);assert.equal(E.references.length,52);assert.equal(R.catalog().length,391);
 assert.equal(new Set(R.catalog().map(x=>x.name.toLowerCase())).size,391);
 assert.deepEqual([...Array(10)].map((_,i)=>R.catalog().filter(x=>x.level===i).length),[34,64,63,52,41,48,34,21,18,16]);
 assert.ok(E.references.every(x=>x.referenceOnly&&x.sourceId==='phb-2024'&&x.concentration===null&&x.ritual===null));
 assert.equal(R.catalogKeyForName("Bigby's Hand"),R.catalogKeyForName('Arcane Hand'));
 assert.equal(R.catalogKeyForName("Tasha's Hideous Laughter"),R.catalogKeyForName('Hideous Laughter'));
});
test('class and level filtering includes PHB names, honours source, excludes invalid levels',()=>{
 const warlock=R.availableSpells(hero('Warlock',5));
 assert.ok(warlock.some(x=>x.name==='Hunger of Hadar'));
 assert.ok(!warlock.some(x=>x.name==='Power Word Fortify'));
 assert.ok(!warlock.some(x=>x.name==='Arcane Vigor'));
 assert.ok(R.availableSpells(hero('Wizard',5),{query:'arcane vigor'}).some(x=>x.name==='Arcane Vigor'));
 assert.ok(R.availableSpells(hero('Wizard',5),{sourceId:'phb-2024'}).every(x=>x.referenceOnly));
 assert.ok(R.availableSpells(hero('Wizard',5),{sourceId:'srd-2024'}).every(x=>!x.referenceOnly));
 assert.ok(R.availableSpells(hero('Wizard',5),{query:"bigby's hand"}).length===0,'fifth level spell is not available at Wizard 5');
 assert.ok(R.availableSpells(hero('Wizard',9),{query:"bigby's hand"}).some(x=>x.name==='Arcane Hand'));
});
test('reference details never invent casting time, concentration or rules',()=>{
 const sp=R.getSpell(E.references.find(x=>x.name==='Arcane Vigor').key);
 assert.equal(sp.referenceOnly,true);assert.equal(sp.concentrationKnown,false);
 assert.equal(sp.time,'Check sourcebook');assert.equal(sp.components,'Check sourcebook');
 assert.equal(sp.resolution,'Manual · check your sourcebook');
 assert.match(sp.detail,/Reference entry only/);
 assert.equal(sp.source,'PHB 24');
});
test('reference spells can be selected and logged without setting invented concentration',()=>{
 const id=E.references.find(x=>x.name==='Arcane Vigor').key,b=draft([id]),character=hero();
 assert.equal(R.selectionError(character,draft(),[id]),'');
 const resources={spellSlots:[4,3,3,1,0,0,0,0,0],concentration:'Bless',mysticArcanum:{}};
 assert.ok(R.castOptions(character,b,resources,id).some(o=>o.key==='slot2'));
 const next=R.cast(character,b,resources,id,'slot2');
 assert.equal(next.resources.spellSlots[1],2);assert.equal(next.resources.concentration,'Bless');
 assert.equal(next.book.castLog.at(-1).manual,true);
 assert.equal(resources.spellSlots[1],3);
 assert.throws(()=>R.cast(character,b,resources,id,'ritual'),/cannot be cast/);
});
test('personal source-book spell metadata imports, filters and snapshots survive pack deletion',()=>{
 const imported=P.importPack({sourcePacks:[]},packJSON());
 assert.equal(imported.sourcePacks[0].entries[0].level,2);
 assert.equal(imported.sourcePacks[0].entries[0].concentration,null);
 globalThis.FolioActiveLibrary=imported;
 try{
  assert.equal(R.catalog().length,392);
  const spells=R.availableSpells(hero('Wizard'),{sourceId:'user-my-book',query:'star song'});
  assert.equal(spells.length,1);assert.equal(spells[0].referenceOnly,true);
  const key=spells[0].key;
  const record=R.snapshotSelections(draft(),[key]);
  assert.ok(record.catalogSnapshots[key]);
  assert.equal(R.getSpell(key,record).name,'Star Song');
  globalThis.FolioActiveLibrary=P.removePack(imported,'user-my-book');
  assert.equal(R.catalog().length,391);
  assert.equal(R.getSpell(key,record).name,'Star Song');
  assert.equal(R.getSpell(key,record).referenceOnly,true);
  assert.ok(P.registry(imported).some(entry=>entry.name==='Star Song'&&entry.category==='spell'));
 }finally{delete globalThis.FolioActiveLibrary;}
});
test('source pack validation rejects missing/unsafe spell metadata',()=>{
 const j=JSON.parse(packJSON());j.entries[0].level=20;
 assert.throws(()=>P.parseUserPack(j),/Invalid source pack/);
 j.entries[0].level=2;j.entries[0].classes=['Unpublished Class'];
 assert.throws(()=>P.parseUserPack(j),/Invalid source pack/);
 j.entries[0].classes=['Wizard'];j.entries[0].concentration='maybe';
 assert.throws(()=>P.parseUserPack(j),/Invalid source pack/);
});

test('Pip special Paladin cast also respects manual reference concentration',()=>{
 require('../js/data.js');require('../js/spells.js');
 const Pip=globalThis.PipSpells,reference=E.references.find(x=>x.name==='Compelled Duel');
 const fake={...reference,concentration:true};
 const lib={sourcePacks:[{id:'user-casting',name:'My Rules',edition:'current',entries:[{id:'focus-test',category:'spell',name:'Focus Test',level:1,classes:['Paladin'],concentration:true}]}]};
 globalThis.FolioActiveLibrary=lib;
 try{
  const key='user-casting:spell:focus-test';
  const book={...Pip.newBook(),prepared:[...Pip.initialPrepared.slice(0,-1),key]};
  const resources={slots1:4,slots2:2,concentration:'Bless'};
  const next=Pip.cast(book,resources,key,'slots1');
  assert.equal(next.resources.slots1,3);
  assert.equal(next.resources.concentration,'Bless','manual non-SRD casting cannot invent an automatic concentration switch');
  assert.equal(next.book.castLog.at(-1).manual,true);
 }finally{delete globalThis.FolioActiveLibrary;}
});

test('full-library backup round-trips personal spell pack and saved spell',()=>{
 require('../js/inventory.js');require('../js/data.js');require('../js/core.js');require('../js/character.js');require('../js/journal.js');require('../js/spells.js');require('../js/artwork.js');require('../js/builder.js');require('../js/storage.js');
 const L=require('../js/library.js');
 let lib=L.normalize(L.fromLegacy(null));lib=P.importPack(lib,packJSON());
 const added=L.addCharacter(lib,L.startCharacter({name:'Starling'}));lib=added.data;
 const key='user-my-book:spell:star-song',record=lib.characters.find(c=>c.id===added.id);
 record.stack.present.spellbook=R.snapshotSelections({...record.stack.present.spellbook,catalogSelections:[key]},[key]);
 const exported=L.exportAll(lib),loaded=L.importPackage(JSON.stringify(exported));
 assert.equal(loaded.library.sourcePacks[0].entries.find(x=>x.id==='star-song').level,2);
 assert.equal(loaded.library.characters.find(c=>c.id===added.id).stack.present.spellbook.catalogSelections[0],key);
});
test('merging backups remaps colliding personal spell IDs, saved sets and snapshots',()=>{
 const L=require('../js/library.js');
 let source=L.normalize(L.fromLegacy(null));source=P.importPack(source,packJSON());
 const char=L.addCharacter(source,L.startCharacter({name:'Starling'}));source=char.data;
 const record=source.characters.find(c=>c.id===char.id),old='user-my-book:spell:star-song';
 globalThis.FolioActiveLibrary=source;const withSnapshot=R.snapshotSelections(record.stack.present.spellbook,[old]);delete globalThis.FolioActiveLibrary;
 record.stack.present.spellbook={...withSnapshot,catalogSelections:[old],favorites:[old],organizer:{folders:[],categories:[],assignments:{[old]:{folder:'',purposes:['Utility'],categories:[]}},sets:[{id:'fav',name:'Favorite',spells:[old]}]}};
 const merged=L.mergePackage(source,L.importPackage(L.exportAll(source))).data;
 assert.equal(merged.sourcePacks.length,2);assert.notEqual(merged.sourcePacks[0].id,merged.sourcePacks[1].id);
 const imported=merged.characters.find(c=>c.name==='Starling'&&c.id!==char.id);
 const key=merged.sourcePacks[1].id+':spell:star-song';const book=imported.stack.present.spellbook;
 assert.deepEqual(book.catalogSelections,[key]);assert.deepEqual(book.favorites,[key]);
 assert.ok(book.catalogSnapshots[key]);assert.ok(book.organizer.assignments[key]);
 assert.deepEqual(book.organizer.sets[0].spells,[key]);
 assert.equal(L.validate(merged),true);
});
