const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../js/data.js');
require('../js/inventory.js');
require('../js/core.js');
require('../js/character.js');
require('../js/spell-catalog.js');
require('../js/spells.js');
require('../js/rules-engine.js');
require('../js/spell-guides.js');
const audit=require('../js/spell-audit.js');
require('../js/ui.js');
const UI=globalThis.PipUI;
const catalog=globalThis.FolioSpellCatalog.spells;
const state=globalThis.PipData.newState();
const derived=globalThis.PipCore.derived(state.character,state.inventory);
const spell=name=>catalog.find(s=>s.name===name);

test('M16.1: all 339 2024 SRD spells have distinct original usage and caution text',()=>{
 const report=audit.coverage(catalog);
 assert.deepEqual(report,{total:339,guides:339,missing:[],extra:[],duplicates:0});
 for(const sp of catalog){
  const note=audit.get(sp.key);
  assert.ok(note?.use?.length>32,`Short or missing usage: ${sp.name}`);
  assert.ok(note?.watch?.length>32,`Short or missing caution: ${sp.name}`);
  assert.ok(!/(?:todo|tbd|placeholder)/i.test(note.use+' '+note.watch),sp.name);
  assert.ok(sp.description?.length>20,`Missing mechanics: ${sp.name}`);
  assert.ok(sp.castingTime&&sp.range&&sp.duration&&sp.components,`Missing metadata: ${sp.name}`);
 }
 const allNotes=Object.values(audit.entries);
 assert.equal(new Set(allNotes.map(n=>n.use)).size,339);
 assert.equal(new Set(allNotes.map(n=>n.watch)).size,339);
});

test('M16.1: every catalogue spell renders a reference with full rules, tailored advice and casting metadata',()=>{
 for(const sp of catalog){
  const html=UI.referenceModal(sp.key,state,derived);
  assert.ok(html.includes('Full 2024 spell description'),`Missing source panel: ${sp.name}`);
  assert.ok(html.includes('When to use')&&html.includes('Watch out'),`Missing advice: ${sp.name}`);
  assert.ok(html.includes('What it does'),`Missing preview: ${sp.name}`);
  assert.ok(html.includes('Higher slots')||html.includes('Cantrip scaling'),sp.name);
  assert.ok(html.includes('Resolution cue'),sp.name);
  assert.ok(html.includes('spell-source-body'),sp.name);
  assert.ok(html.includes('Components:'),sp.name);
 }
});

test('M16.1: 2024 distinctions are preserved in notes and source data',()=>{
 for(const [name, expected] of [
  ['Spiritual Weapon',true],['Prayer of Healing',false],['Shield',false],['Conjure Animals',true]
 ])assert.equal(spell(name).concentration,expected,name);
 assert.equal(spell('Prayer of Healing').castingTime,'1minute');
 assert.match(audit.get(spell('Prayer of Healing').key).watch,/1 minute/);
 assert.match(audit.get(spell('Guidance').key).watch,/skill/);
 assert.match(audit.get(spell('Resistance').key).watch,/Action/);
 assert.match(audit.get(spell('Ray of Sickness').key).watch,/no separate save/);
 assert.match(audit.resolve(spell('Inflict Wounds')),/Constitution saving throw/);
 assert.match(audit.resolve(spell('Chill Touch')),/Melee spell attack/);
 assert.match(audit.resolve(spell('Chromatic Orb')),/Ranged spell attack/);
 const p=globalThis.PipGuides['prayer-of-healing'];
 assert.match(p.effect,/1 minute/);
 assert.doesNotMatch(p.tip,/10 minute/);
});

test('M16.1: user guidance cannot mutate preparation, resources, or local backup schema',()=>{
 const snapshot=JSON.stringify(state);
 for(const sp of catalog){audit.get(sp.key);audit.resolve(sp);UI.referenceModal(sp.key,state,derived);}
 assert.equal(JSON.stringify(state),snapshot);
});

test('M16.1: original spell wording is HTML-escaped in reference details',()=>{
 const escape=UI.escapeHtml('<img src=x onerror=alert(1)>');
 assert.equal(escape,'&lt;img src=x onerror=alert(1)&gt;');
 const a=spell('Wish');
 const html=UI.referenceModal(a.key,state,derived);
 assert.ok(html.includes('spell-source-details'));
 assert.ok(html.includes('Wish'));
});
