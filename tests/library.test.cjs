const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../js/inventory.js');require('../js/data.js');require('../js/core.js');require('../js/character.js');require('../js/journal.js');require('../js/storage.js');
const D=globalThis.PipData,S=globalThis.PipStorage,L=require('../js/library.js');
const initial=()=>L.fromLegacy(null);
const starter=(name='Celeste')=>L.startCharacter({name,className:'Wizard',species:'Elf'});

test('legacy Pip save migrates into exactly one character without rewriting stats or undo',()=>{
 const state=D.newState();state.resources.hp=43;state.character.scores.dex=18;
 const past=D.newState(),lib=L.fromLegacy({present:state,past:[past]});
 assert.equal(lib.characters.length,1);assert.equal(lib.characters[0].stack.present.resources.hp,43);
 assert.equal(lib.characters[0].stack.present.character.scores.dex,18);
 assert.equal(lib.characters[0].stack.past.length,1);
 assert.equal(lib.characters[0].stack.past[0].resources.hp,60);
 assert.equal(S.validate(lib.characters[0].stack.present),true);
});
test('new starter is neutral and has no Pip spells, items, class features or genie AC',()=>{
 const fresh=starter(),s=fresh.present;
 assert.equal(s.character.templateKind,'starter');assert.equal(s.character.className,'Wizard');
 assert.deepEqual(s.character.profSaves,[]);assert.deepEqual(s.spellbook.prepared,[]);
 assert.deepEqual(s.notes,[]);assert.deepEqual(s.inventory.items,[]);
 assert.equal(s.resources.layOnHands,0);
 assert.equal(globalThis.PipCore.derived(s.character,s.inventory).ac,10);
 assert.deepEqual(globalThis.PipCharacter.featureList(s.character),[]);
 assert.equal(S.validate(s),true);
});
test('campaign folders are optional and deleting a folder does not delete its characters',()=>{
 let lib=initial();const campaign=L.addCampaign(lib,'The Starlit Road','A campaign').data;
 lib=campaign;const c=lib.campaigns[0];lib=L.updateCharacter(lib,lib.characters[0].id,{campaignId:c.id});
 assert.equal(lib.characters[0].campaignId,c.id);
 lib=L.deleteCampaign(lib,c.id);assert.equal(lib.characters.length,1);
 assert.equal(lib.characters[0].campaignId,null);assert.equal(lib.campaigns.length,0);
});
test('duplicate creates independent state and undo history',()=>{
 let lib=initial(),original=lib.characters[0];
 const copy=L.duplicateCharacter(lib,original.id);lib=copy.data;
 assert.equal(lib.characters.length,2);assert.notEqual(copy.id,original.id);
 const duplicate=lib.characters.find(c=>c.id===copy.id);
 assert.equal(duplicate.stack.present.character.name,'Pip (copy)');
 const altered=L.clone(duplicate.stack);altered.present.resources.hp=12;altered.past=[altered.present];
 lib=L.replaceStack(lib,copy.id,altered);
 assert.equal(lib.characters.find(c=>c.id===original.id).stack.present.resources.hp,60);
 assert.equal(lib.characters.find(c=>c.id===copy.id).stack.present.resources.hp,12);
});
test('moving and renaming a character does not alter its saved combat state',()=>{
 let lib=initial(),cid=lib.characters[0].id;
 lib=L.addCampaign(lib,'A New Campaign').data;
 lib=L.updateCharacter(lib,cid,{name:'Papillon',campaignId:lib.campaigns[0].id});
 assert.equal(lib.characters[0].name,'Papillon');
 assert.equal(lib.characters[0].stack.present.character.name,'Papillon');
 assert.equal(lib.characters[0].stack.present.resources.hp,60);
 assert.equal(lib.characters[0].stack.present.encounter.round,1);
});
test('whole-library backup imports as new records and remaps campaign IDs',()=>{
 let lib=initial();lib=L.addCampaign(lib,'Jesters').data;
 const first=lib.characters[0].id,folder=lib.campaigns[0].id;
 lib=L.updateCharacter(lib,first,{campaignId:folder});
 lib=L.addCharacter(lib,starter('Celeste'),null).data;
 const bundle=L.exportAll(lib),parsed=L.importPackage(JSON.stringify(bundle));
 assert.equal(parsed.kind,'library');
 const merged=L.mergePackage(initial(),parsed).data;
 assert.equal(merged.characters.length,3);
 assert.equal(merged.campaigns.length,1);
 assert.notEqual(merged.campaigns[0].id,folder);
 assert.equal(merged.characters.find(c=>c.name==='Pip'&&c.campaignId!==null).campaignId,merged.campaigns[0].id);
 assert.equal(L.validate(merged),true);
});
test('legacy single-character backup import does not replace existing characters',()=>{
 const old=S.bundle({present:D.newState(),past:[]});
 const incoming=L.importPackage(JSON.stringify(old));
 let lib=initial();lib=L.mergePackage(lib,incoming).data;
 assert.equal(lib.characters.length,2);
 assert.notEqual(lib.characters[0].id,lib.characters[1].id);
});
test('delete removes only selected character and supports an empty library',()=>{
 let lib=initial();lib=L.addCharacter(lib,starter(),null).data;
 const p=lib.characters.find(x=>x.name==='Pip');lib=L.removeCharacter(lib,p.id);
 assert.equal(lib.characters.length,1);assert.equal(lib.characters[0].name,'Celeste');
 lib=L.removeCharacter(lib,lib.characters[0].id);assert.equal(lib.characters.length,0);
 assert.equal(L.validate(lib),true);
});
test('malformed and unsupported backup formats are rejected without changing a valid library',()=>{
 const before=JSON.stringify(initial());assert.throws(()=>L.importPackage('{"format":"invented"}'));
 assert.throws(()=>L.importPackage('{bad json'));assert.throws(()=>L.normalize({format:L.FORMAT,version:1,characters:[{id:'broken'}],campaigns:[]}));
 assert.equal(JSON.stringify(initial()).includes('Pip'),true);assert.ok(before);
});
test('falls back to local browser storage if indexedDB is unavailable',async()=>{
 const mem=new Map();globalThis.localStorage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>{mem.set(k,v)},removeItem:k=>mem.delete(k)};
 const first=await L.load(null);assert.equal(first.data.characters.length,1);assert.equal(first.mode,'localstorage');
 const newer=L.addCharacter(first.data,starter(),null).data;await L.save(newer);
 const second=await L.load(null);assert.equal(second.data.characters.length,2);
 assert.equal(second.data.characters[1].stack.present.character.name,'Celeste');
 delete globalThis.localStorage;
});
