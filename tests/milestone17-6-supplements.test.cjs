'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
require('../js/spell-catalog.js');
require('../js/spell-expansions.js');
const X=require('../js/spell-supplements.js'),R=require('../js/rules-engine.js'),P=require('../js/source-registry.js');
const hero=(cls='Wizard',level=9,subclass='')=>({templateKind:'starter',level,subclass,build:{characterClass:cls,subclass}});
const draft=(keys=[])=>({catalogSelections:keys,catalogSnapshots:{},custom:[],castLog:[]});
const name=s=>X.references.find(x=>x.name===s);
test('index includes 39 nonduplicate official supplement references alongside stable 391-record PHB/SRD baseline',()=>{
 assert.equal(X.references.length,39);
 assert.deepEqual(Object.fromEntries(Object.entries(X.groups).map(([s,v])=>[s,v.length])),{wildemount:15,strixhaven:5,tashas:12,fizbans:7});
 const cat=R.catalog();assert.equal(cat.length,430);
 assert.equal(new Set(cat.map(s=>s.key)).size,430);
 assert.equal(new Set(cat.map(s=>s.name.toLowerCase())).size,430);
 assert.ok(X.references.every(s=>s.referenceOnly&&s.legacyReference&&s.concentration===null&&s.ritual===null));
 assert.equal(R.catalogKeyForName('Mage Armor'),'srd-2024_mage-armor');
 assert.equal(R.catalogKeyForName('Armor of Agathys'),'phb-2024_armor-of-agathys');
 assert.equal(R.catalogKeyForName('Silvery Barbs'),name('Silvery Barbs').key);
});
test('source filters and class/level restrictions expose supplements, without inventing access for every class',()=>{
 const bard=R.availableSpells(hero('Bard',5),{sourceId:'strixhaven'});
 assert.ok(bard.some(x=>x.name==='Silvery Barbs'));
 assert.ok(bard.some(x=>x.name==='Borrowed Knowledge'));
 assert.ok(!bard.some(x=>x.name==='Vortex Warp'));
 const wiz=R.availableSpells(hero('Wizard',5),{sourceId:'strixhaven'});
 assert.ok(wiz.some(x=>x.name==='Vortex Warp'));
 assert.ok(!wiz.some(x=>x.name==='Sapping Sting'));
 const fizz=R.availableSpells(hero('Wizard',5),{sourceId:'fizbans'});
 assert.ok(fizz.some(x=>x.name==="Rime's Binding Ice"));
 assert.ok(!fizz.some(x=>x.name==='Draconic Transformation'));
 assert.ok(R.availableSpells(hero('Wizard',3),{query:'booming blade'}).some(x=>x.sourceId==='tashas'));
 assert.ok(!R.availableSpells(hero('Paladin',7),{query:'booming blade'}).length);
});
test('Wildemount dunamancy is gated to subclass traditions until broader permission is modeled',()=>{
 assert.equal(R.availableSpells(hero('Wizard',17),{sourceId:'wildemount'}).length,0);
 assert.equal(R.availableSpells(hero('Sorcerer',17),{sourceId:'wildemount'}).length,0);
 const chrono=R.availableSpells(hero('Wizard',17,'Chronurgy Magic'),{sourceId:'wildemount'});
 const gravi=R.availableSpells(hero('Wizard',17,'Graviturgy Magic'),{sourceId:'wildemount'});
 assert.ok(chrono.some(x=>x.name==='Gift of Alacrity'));
 assert.ok(!chrono.some(x=>x.name==='Magnify Gravity'));
 assert.ok(gravi.some(x=>x.name==='Magnify Gravity'));
 assert.ok(!gravi.some(x=>x.name==='Temporal Shunt'));
 assert.ok(chrono.some(x=>x.name==='Sapping Sting')&&gravi.some(x=>x.name==='Sapping Sting'));
});
test('supplementary spell details, selections, casting and snapshots remain manual and resource-safe',()=>{
 const sp=R.getSpell(name('Silvery Barbs').key);
 assert.equal(sp.time,'Check sourcebook');
 assert.equal(sp.concentrationKnown,false);assert.equal(sp.referenceOnly,true);
 assert.ok(sp.legacyReference);assert.match(sp.accessNote,/earlier D&D 5e/);
 const key=name('Silvery Barbs').key,b=draft([key]),c=hero('Bard',5);
 assert.equal(R.selectionError(c,draft(),[key]),'');
 assert.equal(R.snapshotSelections(draft(),[key]).catalogSnapshots[key].legacyReference,true);
 const resources={spellSlots:[4,3,2,0,0,0,0,0,0],concentration:'Bless',mysticArcanum:{}};
 const cast=R.cast(c,b,resources,key,'slot1');
 assert.equal(cast.resources.spellSlots[0],3);assert.equal(cast.resources.concentration,'Bless');
 assert.equal(cast.book.castLog.at(-1).manual,true);
 assert.equal(resources.spellSlots[0],4);
});
test('source registry attributes all 39 references to existing official source entries',()=>{
 const directory=P.allPacks({sourcePacks:[]});
 const registered=P.registry({sourcePacks:[]});
 for(const sourceId of Object.keys(X.sources)){
  assert.ok(directory.some(x=>x.id===sourceId));
  assert.equal(registered.filter(x=>x.category==='spell'&&x.sourceId===sourceId).length,X.groups[sourceId].length);
 }
});
