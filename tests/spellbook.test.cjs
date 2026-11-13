const test = require('node:test');
const assert = require('node:assert/strict');
require('../js/data.js');
const P=require('../js/spells.js');
const S=require('../js/storage.js');
const D=globalThis.PipData;

test('2024 Paladin eligible list covers exactly sixteen first-level and eleven second-level spells',()=>{
 assert.equal(P.paladinIds.length,27);
 assert.equal(P.all.filter(x=>x.level===1&&P.eligible(x.id)).length,16);
 assert.equal(P.all.filter(x=>x.level===2&&P.eligible(x.id)).length,11);
 assert.ok(P.eligible('compelled-duel'));
 assert.ok(P.eligible('cure-wounds'));
 assert.ok(P.eligible('zone-of-truth'));
 assert.ok(!P.eligible('chromatic-orb'));
});

test('prepared seven with nine grants; grant list cannot be displaced',()=>{
 const b=P.newBook();
 assert.equal(b.prepared.length,7);
 assert.equal(P.grants.length,9);
 assert.equal(P.activeSpells(b).length,16);
 assert.throws(()=>P.queueSwap(b,'bless','chromatic-orb'));
 assert.throws(()=>P.queueSwap(b,'divine-smite','compelled-duel'));
});

test('queue swap and apply exactly one after each Long Rest',()=>{
 const b=P.newBook();
 let next=P.queueSwap(b,'bless','cure-wounds');
 next=P.queueSwap(next,'aid','warding-bond');
 assert.equal(next.prepared.includes('bless'),true);
 let after=P.applyOneSwap(next);
 assert.equal(after.prepared.includes('cure-wounds'),true);
 assert.equal(after.prepared.includes('aid'),true);
 assert.equal(after.queued.length,1);
 after=P.applyOneSwap(after);
 assert.equal(after.prepared.includes('warding-bond'),true);
 assert.equal(after.prepared.length,7);
 assert.deepEqual(P.applyOneSwap(after),after);
});

test('cast spending free use, slots, concentration and undo-friendly changes',()=>{
 const b=P.newBook(),r=D.newState().resources;
 const hunter=P.cast(b,r,'hunters-mark','freeHuntersMark');
 assert.equal(hunter.resources.freeHuntersMark,0);
 assert.equal(hunter.resources.concentration,'Hunter’s Mark');
 assert.equal(hunter.resources.slots1,4);
 assert.throws(()=>P.cast(hunter.book,hunter.resources,'hunters-mark','freeHuntersMark'));
 const favor=P.cast(hunter.book,hunter.resources,'divine-favor','slots1');
 assert.equal(favor.resources.concentration,'Hunter’s Mark');
 assert.equal(favor.resources.slots1,3);
 const blessing=P.cast(favor.book,favor.resources,'bless','slots1');
 assert.equal(blessing.resources.concentration,'Bless');
 assert.equal(blessing.resources.slots1,2);
 // A state snapshot saved before casting restores both changes, not just the slot.
 assert.equal(favor.resources.slots1,3);
 assert.equal(favor.resources.concentration,'Hunter’s Mark');
});

test('Ritual option works only for a prepared ritual and uses no slot',()=>{
 const b=P.newBook();
 assert.deepEqual(P.castOptions('detect-magic',b,D.newState().resources),[]);
 const amended={...b,prepared:[...b.prepared.slice(0,6),'detect-magic']};
 const r=D.newState().resources;
 assert.ok(P.castOptions('detect-magic',amended,r).some(x=>x.key==='ritual'));
 const cast=P.cast(amended,r,'detect-magic','ritual');
 assert.equal(cast.resources.slots1,4);
 assert.equal(cast.resources.concentration,'Detect Magic');
});

test('migration from milestone one keeps custom scores, notes, initiative and resources',()=>{
 const state=D.newState();
 state.version=1;delete state.spellbook;state.character.scores.dex=18;state.resources.hp=47;
 state.notes.push({id:'custom-note',title:'Additional play',text:'Take cover',links:[],pinned:false});
 const migrated=S.migrate(state);
 assert.equal(migrated.version,6);
 assert.equal(migrated.character.scores.dex,18);
 assert.equal(migrated.resources.hp,47);
 assert.equal(migrated.notes.length,4);
 assert.equal(migrated.spellbook.prepared.length,7);
 assert.ok(S.validate(migrated));
 const backup={format:'pip-masquerade-backup',version:1,present:state,past:[state]};
 const restored=S.importBackup(JSON.stringify(backup));
 assert.equal(restored.present.character.scores.dex,18);
 assert.equal(restored.past[0].version,6);
});

test('backup v2 preserves spells and custom entries',()=>{
 let state=D.newState();state.spellbook.queued.push({from:'bless',to:'compelled-duel'});
 state.spellbook.custom.push({id:'custom-x',name:'Curtain Call',level:1,alwaysPrepared:true});
 const x=S.importBackup(JSON.stringify(S.bundle({present:state,past:[]})));
 assert.equal(x.present.spellbook.custom[0].name,'Curtain Call');
 assert.equal(x.present.spellbook.queued[0].to,'compelled-duel');
});
