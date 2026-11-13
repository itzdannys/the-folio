const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../js/inventory.js');
require('../js/data.js');
require('../js/core.js');
require('../js/character.js');
require('../js/spells.js');
const R=require('../js/release.js');
const S=require('../js/storage.js');
function state(){return global.PipData.newState();}
function print(s){return R.printView(s,global.PipCore.derived(s.character,s.inventory));}
test('release print view is always two printable sections with recognizable layout',()=>{
 const html=print(state());
 assert.equal((html.match(/class="print-page"/g)||[]).length,2);
 for(const expected of ['print-ability-grid','Saving Throws','Skills','Weapons &amp; Attacks','Spellbook & Combat Notes','Lay on Hands','Divine Favor','Pip'])assert.ok(html.includes(expected),expected);
 assert.ok(!html.includes('&lt;small&gt;'));
});
test('printed abilities and HP follow saved character values',()=>{
 const s=state();s.character.scores.dex=18;s.resources.hp=55;const html=print(s);
 assert.match(html,/DEX<\/small><b>18<\/b>/);assert.match(html,/55 \/ 60/);
 assert.match(html,/AC<\/small><b>18<\/b>/);
});
test('printed weapons reflect equipped item bonuses and mastery',()=>{
 const html=print(state());assert.match(html,/Shortsword/);assert.match(html,/Scimitar/);assert.match(html,/Vex/);assert.match(html,/Nick/);
});
test('printed content escapes HTML from user-edited character and play notes',()=>{
 const s=state();s.character.name='<script>alert(1)</script>';s.notes[0].text='<img src=x onerror=alert(1)> & x';const html=print(s);
 assert.ok(!html.includes('<script>'));assert.ok(!html.includes('<img src=x'));
 assert.ok(html.includes('&lt;script&gt;'));assert.ok(html.includes('&lt;img src=x'));
});
test('printed spell list contains active spells but not unprepared Paladin options',()=>{
 const html=print(state());assert.match(html,/Divine Favor/);assert.match(html,/Hunter’s Mark/);assert.ok(!html.includes('<b>Cure Wounds</b>'));
});
test('print header follows current identity, features obey hidden status',()=>{
 const s=state();s.character.fullName='Papillon the Veiled';s.character.featureEdits={'skilled':{hidden:true,name:'Skilled',short:'',detail:'',group:'Feat'}};
 const html=print(s);assert.match(html,/Papillon the Veiled/);assert.ok(!html.includes('<b>Skilled</b>'));
});
test('backups remain round-trippable with v6 saves',()=>{
 const initial={present:state(),past:[]};const packed=S.bundle(initial);const restored=S.importBackup(JSON.stringify(packed));assert.deepEqual(restored.present.character,initial.present.character);assert.deepEqual(restored.present.resources,initial.present.resources);assert.equal(restored.present.appearance.preset,'masquerade');assert.deepEqual(restored.past,[]);
});
test('imports reject bad format and malformed journal, without mutating original',()=>{
 const initial={present:state(),past:[]};const packed=S.bundle(initial);const saved=JSON.stringify(initial);
 const invalid={...packed,present:{...packed.present,journal:[{id:'broken'}]}};
 assert.throws(()=>S.importBackup(JSON.stringify(invalid)));
 assert.throws(()=>S.importBackup(JSON.stringify({...packed,format:'not-pip'})));
 assert.equal(JSON.stringify(initial),saved);
});
test('print works with an empty playbook and no equipped weapons',()=>{
 const s=state();s.notes=[];s.inventory.items.forEach(i=>i.equipped=false);const html=print(s);
 assert.match(html,/No equipped weapons/);assert.match(html,/Combat plays/);
});
