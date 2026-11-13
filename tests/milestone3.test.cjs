const test=require('node:test');
const assert=require('node:assert/strict');
require('../js/data.js');
const P=require('../js/spells.js');
require('../js/spell-guides.js');
const D=globalThis.PipData;
const Storage=require('../js/storage.js');
const C=require('../js/core.js');

test('every supported level 7 spell has a table-focused guide',()=>{
 assert.equal(P.all.length,33);
 assert.equal(Object.keys(globalThis.PipGuides).length,33);
 for(const sp of P.all){const guide=globalThis.PipGuides[sp.id];assert.ok(guide?.target,sp.id);assert.ok(guide?.effect,sp.id);assert.ok(guide?.tip,sp.id);}
});

test('migrate milestone 2 without losing DEX, combat plays, HP, spell choices, or cast history',()=>{
 const original=D.newState();original.version=2;delete original.spellbook.loadouts;
 original.character.scores.dex=18;original.resources.hp=37;
 original.notes.push({id:'testing',title:'Mirror Image opening',text:'Action to protect back line.',links:['mirror-image'],pinned:true});
 original.spellbook=P.queueSwap(original.spellbook,'bless','cure-wounds');
 original.spellbook.favorites=['mirror-image'];original.spellbook.castLog=[{id:'divine-favor',cost:'slots1',at:'2026-11-11'}];
 const migrated=Storage.importBackup(JSON.stringify({format:'pip-masquerade-backup',version:2,present:original,past:[]})).present;
 assert.equal(migrated.version,6);assert.equal(migrated.character.scores.dex,18);assert.equal(C.derived(migrated.character).ac,18);
 assert.equal(migrated.resources.hp,37);assert.equal(migrated.notes.at(-1).title,'Mirror Image opening');
 assert.deepEqual(migrated.spellbook.favorites,['mirror-image']);assert.equal(migrated.spellbook.queued[0].to,'cure-wounds');
 assert.equal(migrated.spellbook.castLog.length,1);assert.deepEqual(migrated.spellbook.loadouts,[]);
});

test('save a spell loadout, plan changes toward it, apply one per Long Rest',()=>{
 let book=P.newBook();
 book=P.saveLoadout(book,'First plan','starter');
 book=P.queueSwap(book,'bless','cure-wounds');
 book=P.queueSwap(book,'command','heroism');
 book=P.applyOneSwap(book);book=P.applyOneSwap(book);
 assert.ok(book.prepared.includes('cure-wounds'));assert.ok(book.prepared.includes('heroism'));
 book=P.planLoadout(book,'starter');
 assert.deepEqual(book.queued,[{from:'cure-wounds',to:'bless'},{from:'heroism',to:'command'}]);
 book=P.applyOneSwap(book);assert.ok(book.prepared.includes('bless'));assert.ok(!book.prepared.includes('command'));
 book=P.applyOneSwap(book);assert.deepEqual(book.prepared,P.initialPrepared);
 assert.equal(book.queued.length,0);
});

test('loadout planning rejects bad targets and existing queued changes',()=>{
 const book=P.saveLoadout(P.newBook(),'Tactics','t');
 assert.throws(()=>P.planLoadout({...book,queued:[{from:'bless',to:'cure-wounds'}]},'t'),/Clear existing/);
 assert.throws(()=>P.saveLoadout(book,'','bad'),/short loadout/);
 assert.throws(()=>P.planLoadout(book,'bad'),/not found/);
});

test('casting with concentration preserves old state for one-step undo',()=>{
 const before=D.newState();
 const mark=P.cast(before.spellbook,before.resources,'hunters-mark','freeHuntersMark');
 const favored=P.cast(mark.book,mark.resources,'divine-favor','slots1');
 assert.equal(favored.resources.concentration,'Hunter’s Mark');
 const restored={...mark,resources:{...mark.resources}};
 assert.equal(restored.resources.slots1,4);assert.equal(restored.resources.freeHuntersMark,0);
 assert.equal(favored.resources.slots1,3);
});

test('version 3 backup preserves named loadouts on import',()=>{
 let state=D.newState();state.spellbook=P.saveLoadout(state.spellbook,'Exploration','e');
 const backup=Storage.bundle({present:state,past:[]});
 assert.equal(backup.version,6);
 const restored=Storage.importBackup(JSON.stringify(backup));
 assert.equal(restored.present.spellbook.loadouts[0].name,'Exploration');
 assert.ok(Storage.validate(restored.present));
});
