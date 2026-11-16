const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../js/inventory.js');require('../js/data.js');require('../js/core.js');require('../js/character.js');require('../js/journal.js');require('../js/spells.js');require('../js/artwork.js');require('../js/builder.js');require('../js/spell-catalog.js');require('../js/weapon-catalog.js');
const RS=require('../js/source-registry.js'),S=require('../js/storage.js'),L=require('../js/library.js');
const fresh=()=>L.normalize(L.fromLegacy(null));
const pack={format:'folio-source-pack',version:1,id:'user-starlit',name:'Starlit Custom Options',edition:'current',license:'User-created',description:'Reference-only personal entries',published:'2026-11',entries:[{id:'starburst',name:'Starburst',category:'spell',description:'Personal campaign reference',prerequisites:['Level 3']} ]};
const ids=(lib,record)=>RS.effective(lib,record).enabledSourceIds;

test('single current-rules baseline always enabled; old core source labels migrate',()=>{
 assert.deepEqual(RS.DEFAULTS.enabledSourceIds,['srd-2024']);
 assert.deepEqual(RS.normalizeSettings({edition:'2014',enabledSourceIds:['srd-2014','phb-2014','srd-2024']}).enabledSourceIds,['srd-2024','phb-2024']);
 assert.deepEqual(RS.normalizeSettings({enabledSourceIds:[]}),{enabledSourceIds:['srd-2024']});
 assert.equal(RS.normalizeSettings({edition:'2014',enabledSourceIds:[]}).edition,undefined);
 assert.equal(RS.SOURCE_PACKS.some(x=>x.id==='srd-2014'||x.id==='phb-2014'),false);
});
test('legacy Pip and its HP/resources stay unchanged if library sources are changed',()=>{
 let lib=fresh(),cid=lib.characters[0].id;
 const resources=JSON.stringify(lib.characters[0].stack.present.resources);
 lib=L.setRulesDefaults(lib,{enabledSourceIds:['phb-2024']});
 assert.deepEqual(ids(lib,lib.characters[0]),['srd-2024']); // legacy character is pinned
 assert.equal(JSON.stringify(lib.characters[0].stack.present.resources),resources);
 assert.equal(lib.characters[0].stack.present.character.rules,undefined);
});
test('new characters inherit library then campaign sources, or use individual overrides',()=>{
 let lib=fresh();const folder=L.addCampaign(lib,'Next Chapter');lib=folder.data;
 const chr=L.addCharacter(lib,L.startCharacter({name:'Astrid'}),folder.id);lib=chr.data;
 let c=lib.characters.find(x=>x.id===chr.id);
 assert.equal(RS.effective(lib,c).inheritFrom,'library');
 lib=L.setRulesDefaults(lib,{enabledSourceIds:['phb-2024']});
 assert.deepEqual(ids(lib,c),['srd-2024','phb-2024']);
 lib=L.setCampaignRules(lib,folder.id,{enabledSourceIds:['tashas']});
 assert.deepEqual(ids(lib,c),['srd-2024','tashas']);
 lib=L.setCharacterRules(lib,chr.id,{mode:'custom',enabledSourceIds:['xanathars']});
 c=lib.characters.find(x=>x.id===chr.id);
 assert.deepEqual(ids(lib,c),['srd-2024','xanathars']);
 assert.equal(c.stack.present.character.rules.edition,undefined);
});
test('deleting campaign snapshots inherited sources without changing gameplay',()=>{
 let lib=fresh();const folder=L.addCampaign(lib,'Campaign');lib=folder.data;
 lib=L.setCampaignRules(lib,folder.id,{enabledSourceIds:['tashas']});
 const chr=L.addCharacter(lib,L.startCharacter({name:'Astrid'}),folder.id);lib=chr.data;
 const before=JSON.stringify(lib.characters.find(c=>c.id===chr.id).stack.present.resources);
 lib=L.deleteCampaign(lib,folder.id);
 const c=lib.characters.find(x=>x.id===chr.id);
 assert.deepEqual(ids(lib,c),['srd-2024','tashas']);
 assert.equal(c.stack.present.character.rules.mode,'custom');
 assert.equal(c.campaignId,null);
 assert.equal(JSON.stringify(c.stack.present.resources),before);
});
test('library backups keep references and packs; imports do not reintroduce edition choices',()=>{
 let lib=fresh();lib=RS.importPack(lib,pack);
 lib=L.setRulesDefaults(lib,{enabledSourceIds:['srd-2024','user-starlit']});
 const parsed=L.importPackage(JSON.stringify(L.exportAll(lib)));
 assert.equal(parsed.library.sourcePacks[0].entries[0].name,'Starburst');
 assert.deepEqual(parsed.library.rulesDefaults,lib.rulesDefaults);
 assert.equal(parsed.library.rulesDefaults.edition,undefined);
 const merged=L.mergePackage(fresh(),parsed).data;
 assert.equal(merged.sourcePacks.length,1);
 assert.equal(L.validate(merged),true);
});
test('overlapping imported user-pack IDs remap references and preserve existing packs',()=>{
 let source=fresh();source=RS.importPack(source,pack);
 let c=L.addCharacter(source,L.startCharacter({name:'Astrid'}));source=c.data;
 source=L.setCharacterRules(source,c.id,{mode:'custom',enabledSourceIds:['user-starlit']});
 const merged=L.mergePackage(source,L.importPackage(L.exportAll(source))).data;
 assert.equal(merged.sourcePacks.length,2);
 assert.notEqual(merged.sourcePacks[0].id,merged.sourcePacks[1].id);
 const imported=merged.characters.find(x=>x.name==='Astrid'&&x.id!==c.id);
 assert.deepEqual(ids(merged,imported),['srd-2024',merged.sourcePacks[1].id]);
});
test('source packs are inert, bounded and do not allow executable entries',()=>{
 assert.throws(()=>RS.parseUserPack({...pack,id:'../../bad'}));
 assert.throws(()=>RS.parseUserPack({...pack,entries:[{...pack.entries[0],category:'javascript'}]}));
 assert.throws(()=>RS.parseUserPack({...pack,entries:[...pack.entries,...pack.entries]}));
 assert.throws(()=>RS.parseUserPack({...pack,format:'malicious'}));
 assert.equal(RS.parseUserPack({...pack,edition:undefined}).edition,'current');
 let lib=RS.importPack(fresh(),pack);
 assert.throws(()=>RS.importPack(lib,pack));
 assert.throws(()=>RS.removePack(lib,'srd-2024'));
 lib=RS.removePack(lib,'user-starlit');assert.equal(lib.sourcePacks.length,0);
});
test('included registry still contains 339 spells, 38 weapons and labelled starter feats',()=>{
 const reg=RS.registry(fresh());
 assert.equal(reg.filter(x=>x.category==='spell'&&x.sourceId==='srd-2024').length,339);
 assert.equal(reg.filter(x=>x.category==='weapon'&&x.sourceId==='srd-2024').length,38);
 assert.ok(reg.some(x=>x.category==='feat'&&x.sourceId==='srd-2024'));
 assert.ok(reg.every(x=>x.license&&x.edition&&x.status));
 assert.ok(reg.some(x=>x.category==='background'&&x.sourceId==='phb-2024'&&x.status==='interactive'));
 assert.equal(reg.filter(x=>x.category==='background').length,16);
});
test('legacy 2014 user packs are clearly flagged and never installed as automated rules',()=>{
 const older=RS.parseUserPack({...pack,id:'user-old',edition:'2014'});
 let lib=RS.importPack(fresh(),older);
 const availability=RS.sourceAvailability(lib,{enabledSourceIds:['user-old']});
 const item=availability.find(x=>x.id==='user-old');
 assert.equal(item.enabled,true);assert.equal(item.compatible,false);assert.equal(item.legacyReference,true);
 const ref=RS.registry(lib).find(x=>x.sourceId==='user-old');
 assert.deepEqual(RS.eligibility(ref,{enabledSourceIds:['user-old']}),{enabled:true,compatible:false});
});
test('old 17.1 library backups migrate 2014 metadata to a modern baseline, preserving sheets and undo',()=>{
 let lib=fresh();const folder=L.addCampaign(lib,'Past Session');lib=folder.data;
 const chr=L.addCharacter(lib,L.startCharacter({name:'Astrid'}),folder.id);lib=chr.data;
 const old=L.exportAll(lib);const c=old.characters.find(x=>x.id===chr.id);
 old.rulesDefaults={edition:'2014',enabledSourceIds:['srd-2014','phb-2014']};
 old.campaigns[0].rulesDefaults={edition:'2014',enabledSourceIds:['srd-2014','tashas']};
 c.stack.present.character.rules={mode:'custom',edition:'2014',enabledSourceIds:['srd-2014','phb-2014','xanathars']};
 c.stack.past=[JSON.parse(JSON.stringify(c.stack.present))];
 const before=JSON.stringify(c.stack.present.resources);
 const converted=L.importPackage(JSON.stringify(old)).library;
 const c2=converted.characters.find(x=>x.id===chr.id);
 assert.deepEqual(converted.rulesDefaults,{enabledSourceIds:['srd-2024','phb-2024']});
 assert.deepEqual(converted.campaigns[0].rulesDefaults,{enabledSourceIds:['srd-2024','tashas']});
 assert.deepEqual(c2.stack.present.character.rules,{mode:'custom',enabledSourceIds:['srd-2024','phb-2024','xanathars']});
 assert.equal(c2.stack.past[0].character.rules.edition,undefined);
 assert.equal(JSON.stringify(c2.stack.present.resources),before);
 assert.equal(S.validate(c2.stack.present),true);
});
test('old 2014-labelled character-only backup is safely migrated on import',()=>{
 let lib=fresh();const cid=lib.characters[0].id;
 const item=L.exportCharacter(lib,cid);
 item.stack.present.character.rules={mode:'custom',edition:'2014',enabledSourceIds:['srd-2014','phb-2014']};
 const result=L.importPackage(JSON.stringify(item));
 assert.deepEqual(result.stack.present.character.rules,{mode:'custom',enabledSourceIds:['srd-2024','phb-2024']});
 assert.equal(S.validate(result.stack.present),true);
});
test('moving an inheriting character between different source campaigns pins sources until opt-in',()=>{
 let lib=fresh();const one=L.addCampaign(lib,'Custom Sources');lib=one.data;
 lib=L.setCampaignRules(lib,one.id,{enabledSourceIds:['phb-2024']});
 const created=L.addCharacter(lib,L.startCharacter({name:'Astrid'}));lib=created.data;
 lib=L.updateCharacter(lib,created.id,{campaignId:one.id});
 const moved=lib.characters.find(c=>c.id===created.id);
 assert.deepEqual(ids(lib,moved),['srd-2024']);
 assert.equal(moved.stack.present.character.rules.mode,'custom');
 lib=L.setCharacterRules(lib,created.id,{mode:'inherit'});
 assert.deepEqual(ids(lib,lib.characters.find(c=>c.id===created.id)),['srd-2024','phb-2024']);
});
test('removing user references cannot change preparation or game resources',()=>{
 let lib=fresh();lib=RS.importPack(lib,pack);
 const added=L.addCharacter(lib,L.startCharacter({name:'Astrid'}));lib=added.data;
 lib=L.setCharacterRules(lib,added.id,{mode:'custom',enabledSourceIds:['user-starlit']});
 const before=JSON.stringify(lib.characters.find(x=>x.id===added.id).stack.present.resources);
 lib=RS.removePack(lib,'user-starlit');
 const c=lib.characters.find(x=>x.id===added.id);
 assert.deepEqual(ids(lib,c),['srd-2024','user-starlit']);
 assert.equal(JSON.stringify(c.stack.present.resources),before);
});
