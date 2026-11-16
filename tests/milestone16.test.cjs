const {test}=require('node:test'),assert=require('node:assert/strict');
require('../js/data.js');require('../js/inventory.js');require('../js/core.js');require('../js/character.js');require('../js/spell-catalog.js');
const P=require('../js/spells.js'),O=require('../js/spell-organizer.js'),FR=require('../js/rules-engine.js');
const UI=require('../js/spell-organizer-ui.js'),S=require('../js/storage.js'),D=globalThis.PipData;
const book=()=>P.newBook();
const key=name=>globalThis.FolioSpellCatalog.spells.find(s=>s.name===name)?.key;

test('M16 existing Pip prepared spells and resources are untouched by file, tag and saved set changes',()=>{
 const state=D.newState(),original=JSON.stringify(state.resources),prepared=[...state.spellbook.prepared];
 let b=O.createNamed(state.spellbook,'folders','Battle','folder-1');
 b=O.createNamed(b,'categories','Boss fights','category-1');
 b=O.saveAssignment(b,'bless','folder-1',['Defense','Social'],['category-1']);
 b=O.saveAssignment(b,'shield-of-faith','folder-1',['Defense'],['category-1']);
 b=O.saveSet(b,'Openers','set-1',P.activeSpells(b));
 assert.equal(JSON.stringify(state.resources),original);assert.deepEqual(b.prepared,prepared);
 assert.equal(b.queued.length,0);assert.equal(b.organizer.sets[0].spells.length,16);
 assert.equal(b.organizer.assignments['bless'].folder,'folder-1');
 assert.equal(b.organizer.assignments['bless'].categories[0],'category-1');
 assert.ok(O.purposes(P.spell('bless',b),b).includes('Social'));
 assert.deepEqual(state.spellbook.organizer.sets,[]);
});

test('M16 multiple purpose labels do not clone spell records',()=>{
 let b=O.saveAssignment(book(),'bless','',['Defense','Social','Ritual'],[]);
 const entries=P.activeSpells(b);assert.equal(entries.filter(x=>x==='bless').length,1);
 const tags=O.purposes(P.spell('bless',b),b);
 assert.ok(tags.includes('Defense')&&tags.includes('Social')&&tags.includes('Ritual'));
 b=O.saveAssignment(b,'bless','',['Healing'],[]);
 assert.ok(!O.purposes(P.spell('bless',b),b).includes('Social'));
});

test('M16 deleting a folder or label keeps spells, preparation, and other labels intact',()=>{
 let b=O.createNamed(book(),'folders','First','folder-a');b=O.createNamed(b,'categories','First','category-a');
 b=O.saveAssignment(b,'bless','folder-a',['Control'],['category-a']);
 b=O.removeNamed(b,'folders','folder-a');
 assert.equal(b.organizer.assignments.bless.folder,'');assert.deepEqual(b.organizer.assignments.bless.categories,['category-a']);
 b=O.removeNamed(b,'categories','category-a');
 assert.deepEqual(b.organizer.assignments.bless.categories,[]);assert.deepEqual(b.prepared,P.initialPrepared);
});

test('M16 safe naming and invalid assignments are rejected',()=>{
 let b=O.createNamed(book(),'folders','Travel','folder-1');
 assert.throws(()=>O.createNamed(b,'folders','travel','folder-2'),/already exists/);
 assert.throws(()=>O.saveAssignment(b,'bless','not-a-folder',[],[]),/existing folder/);
 assert.throws(()=>O.saveAssignment(b,'bless','',['Not A Purpose'],[]),/Invalid purpose/);
 assert.throws(()=>O.saveSet(b,'','set-3',['bless']),/Name/);
});

test('M16 filtering respects level, source, school, timing, ritual, concentration and castability',()=>{
 const s=P.spell('detect-magic',book());
 assert.equal(O.matches(s,{level:'1',ritual:'yes',concentration:'yes'},true),true);
 assert.equal(O.matches(s,{level:'2'},true),false);
 assert.equal(O.matches(s,{school:'Evocation'},true),false);
 assert.equal(O.matches(s,{action:'Bonus Action'},true),false);
 assert.equal(O.matches(s,{availability:'castable'},false),false);
 assert.equal(O.matches(s,{availability:'unavailable'},false),true);
 assert.equal(O.matches(s,{query:'magic'},true),true);
});

test('M16 new character and legacy backup migration retain independent organizer data',()=>{
 const a=D.newState();a.spellbook=O.createNamed(a.spellbook,'folders','A only','folder-a');
 const restored=S.importBackup(JSON.stringify(S.bundle({present:a,past:[]})));
 assert.equal(restored.present.spellbook.organizer.folders[0].name,'A only');
 assert.equal(P.newBook().organizer.folders.length,0);
 const legacy=D.newState();delete legacy.spellbook.organizer;
 assert.deepEqual(S.migrate(legacy).spellbook.organizer,O.DEFAULT());
});

test('M16 shared spellbook renderer supports Pip and general characters',()=>{
 const pip=D.newState(),ui={spellFiltersOpen:true,spellFilter:{view:'all',grouping:'purpose'}};
 const groups=[['Prepared Paladin',pip.spellbook.prepared],['Always prepared',P.grants]];
 const html=UI.render(pip,ui,groups,'Spellbook','A prepared set','Change preparations');
 assert.match(html,/By purpose/);assert.match(html,/Offense/);assert.match(html,/Defense/);assert.match(html,/data-action="spell-organize"/);
 const wizard={...pip,character:{...pip.character,templateKind:'starter',className:'Wizard',level:5,build:{characterClass:'Wizard',spellAbility:'int',slotMax:[4,3,2]}},spellbook:{...pip.spellbook,catalogSelections:[key('Shield'),key('Web')]},resources:{...pip.resources,spellSlots:[4,3,2],mysticArcanum:{}}};
 const generic=UI.render(wizard,{spellFilter:{view:'all',grouping:'source'}},[['Prepared Wizard spells',wizard.spellbook.catalogSelections]],'Spellbook','Wizard','Manage spells');
 assert.match(generic,/Prepared Wizard spells/);assert.match(generic,/Cast/);assert.match(generic,/Web/);
});

test('M16 Elementalism has the five named modes in reference UI',()=>{
 const fs=require('node:fs'),ui=fs.readFileSync(require('node:path').join(__dirname,'../js/ui.js'),'utf8');
 for(const mode of ['Beckon Air','Beckon Earth','Beckon Fire','Beckon Water','Sculpt Element'])assert.match(ui,new RegExp(mode));
});
