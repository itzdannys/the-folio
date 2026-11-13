const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../js/inventory.js');
require('../js/core.js');
require('../js/data.js');
require('../js/character.js');
require('../js/spell-catalog.js');
require('../js/weapon-catalog.js');
require('../js/dice.js');
require('../js/spells.js');
const FR=require('../js/rules-engine.js');
const WR=require('../js/weapon-rules.js');
const D=require('../js/dice.js');
const I=globalThis.PipInventory;
const UI=require('../js/rules-ui.js');
const spellKey=name=>globalThis.FolioSpellCatalog.spells.find(s=>s.name===name)?.key;
function build(characterClass,level,extra={}){return {templateKind:'starter',name:'Test',className:characterClass,level,build:{characterClass,level,spellAbility:extra.spellAbility||'int',slotMax:extra.slotMax||Array(9).fill(0)},scores:{str:16,dex:14,con:14,int:16,wis:12,cha:12},...extra};}

test('bundled spell catalogue contains 339 SRD spells with searchable class and level metadata',()=>{
 assert.equal(FolioSpellCatalog.spells.length,339);
 assert.ok(FolioSpellCatalog.spells.every(s=>s.key&&s.name&&Number.isInteger(s.level)&&Array.isArray(s.classes)));
 const wizard=FR.availableSpells(build('Wizard',5,{slotMax:[4,3,2]}));
 assert.ok(wizard.length>30);assert.ok(wizard.every(s=>s.classes.includes('Wizard')&&s.level<=3));
 const paladin=FR.availableSpells(build('Paladin',7,{slotMax:[4,3]}));
 assert.equal(paladin.length,24);assert.ok(paladin.every(s=>s.classes.includes('Paladin')&&s.level<=2));
});

test('spell access expands by class, subclass and character level',()=>{
 const ranger=FR.spellAccess(build('Ranger',5));assert.deepEqual(ranger.lists,['Ranger']);assert.equal(ranger.maxLevel,2);
 const fighter=FR.spellAccess(build('Fighter',9,{subclass:'Eldritch Knight'}));assert.deepEqual(fighter.lists,['Wizard']);assert.equal(fighter.maxLevel,2);
 const bard=FR.spellAccess(build('Bard',10));assert.deepEqual(bard.lists,['Bard','Cleric','Druid','Wizard']);
 const barbarian=FR.availableSpells(build('Barbarian',10));assert.equal(barbarian.length,0);
});

test('preparation and known-spell limits follow class progression tables',()=>{
 assert.deepEqual(FR.preparationLimits(build('Wizard',5)),{cantrips:4,prepared:9,timing:'any-long-rest',label:'Prepared spells'});
 assert.equal(FR.preparationLimits(build('Paladin',7)).prepared,7);
 assert.equal(FR.preparationLimits(build('Paladin',7)).timing,'one-long-rest');
 assert.equal(FR.preparationLimits(build('Bard',5)).prepared,9);
 assert.equal(FR.preparationLimits(build('Bard',5)).timing,'one-level-up');
 assert.deepEqual(FR.mysticArcanumMax(build('Warlock',17)),{6:1,7:1,8:1,9:1});
});

test('selection limits distinguish cantrips, prepared spells, and Mystic Arcanum',()=>{
 const c=build('Wizard',5),book={catalogSelections:[]};
 const cantrips=FR.availableSpells(c,{level:0}).slice(0,5).map(s=>s.key);
 assert.match(FR.selectionError(c,book,cantrips),/limit exceeded/i);
 const spells=FR.availableSpells(c,{level:1}).slice(0,10).map(s=>s.key);
 assert.match(FR.selectionError(c,book,spells),/limit exceeded/i);
 const warlock=build('Warlock',11),arcanum=FR.availableSpells(warlock,{level:6}).slice(0,2).map(s=>s.key);
 assert.match(FR.selectionError(warlock,{catalogSelections:[]},arcanum),/limit exceeded/i);
});

test('generic spell casting spends the selected slot and updates concentration only when needed',()=>{
 const c=build('Wizard',5,{slotMax:[4,3,2]}),shield=spellKey('Shield'),web=spellKey('Web');
 const book={catalogSelections:[shield,web],custom:[],castLog:[]};
 const resources={spellSlots:[4,3,2,0,0,0,0,0,0],concentration:'Old effect',mysticArcanum:{}};
 const cast1=FR.cast(c,book,resources,shield,'slot1');assert.equal(cast1.resources.spellSlots[0],3);assert.equal(cast1.resources.concentration,'Old effect');
 const cast2=FR.cast(c,cast1.book,cast1.resources,web,'slot2');assert.equal(cast2.resources.spellSlots[1],2);assert.equal(cast2.resources.concentration,'Web');
 assert.equal(cast2.book.castLog.length,2);
});

test('prepared lists, one-spell Long Rest changes, and known-spell level-up changes apply at the right time',()=>{
 const pending={catalogSelections:['old'],catalogPending:['new-a','new-b']};
 assert.deepEqual(FR.applyPreparedChanges(pending).catalogSelections,['new-a','new-b']);
 const queued={catalogSelections:['old'],catalogQueued:[{from:'old',to:'new'}]};
 assert.deepEqual(FR.applyPreparedChanges(queued).catalogSelections,['new']);
 const known={catalogSelections:['old'],catalogLevelUpQueued:[{from:'old',to:'new'}]};
 assert.deepEqual(FR.applyLevelUpChanges(known,1).catalogSelections,['new']);
 assert.deepEqual(FR.applyLevelUpChanges(known,0).catalogSelections,['old']);
});

test('Warlock Pact Magic restores on Short Rest and Mystic Arcanum remains a Long Rest resource',()=>{
 const c=build('Warlock',11,{slotMax:[0,0,0,0,3]});
 const restored=FR.shortRestResources(c,{spellSlots:[0,0,0,0,1],mysticArcanum:{6:0}});
 assert.equal(restored.spellSlots[4],3);assert.equal(restored.mysticArcanum[6],0);
 const max=FR.mysticArcanumResources(c,{6:0});assert.deepEqual(max,{6:0});
});

test('weapon catalogue contains 38 standard weapons with properties and mastery metadata',()=>{
 assert.equal(FolioWeaponCatalog.weapons.length,38);
 assert.ok(FolioWeaponCatalog.weapons.every(w=>w.key&&w.name&&w.damageDice&&Array.isArray(w.properties)));
 assert.ok(FolioWeaponCatalog.masteryDescriptions.Vex);
 const item=WR.catalogItem(FolioWeaponCatalog.weapons.find(w=>w.name==='Longsword'),'test-longsword');
 assert.equal(item.category,'weapon');assert.equal(item.weapon.damage,'1d8');assert.equal(item.weapon.mastery,'Sap');
 assert.equal(I.validateItem(item),true);
});

test('weapon attacks use proficiency, Advantage/Disadvantage, target AC, and critical damage',()=>{
 const c=build('Fighter',5),template=FolioWeaponCatalog.weapons.find(w=>w.name==='Longsword');
 let item=WR.catalogItem(template,'longsword');item.equipped=true;const inv=I.add({currency:{pp:0,gp:0,ep:0,sp:0,cp:0},transactions:[],items:[]},item);
 const seq=[20,4,5];let i=0;const result=WR.attack(c,inv,'longsword','melee','normal',25,()=>seq[i++]);
 assert.equal(result.result.critical,true);assert.equal(result.result.hit,true);assert.equal(result.result.attackBonus,6);assert.equal(result.result.damage,12);
 const advSeq=[3,19,4];i=0;const adv=WR.attack(c,inv,'longsword','melee','advantage',null,()=>advSeq[i++]);
 assert.deepEqual(adv.result.rolls,[3,19]);assert.equal(adv.result.natural,19);assert.equal(adv.result.hit,null);
});

test('weapon proficiency, mastery selection, and hand constraints are checked',()=>{
 const paladin=build('Paladin',7),fighter=build('Fighter',10);
 assert.equal(WR.masteryLimit(paladin),2);assert.equal(WR.masteryLimit(fighter),5);
 const c=build('Wizard',5),template=FolioWeaponCatalog.weapons.find(w=>w.name==='Longbow');
 let item=WR.catalogItem(template,'bow');item.equipped=true;
 let inv=I.add({currency:{pp:0,gp:0,ep:0,sp:0,cp:0},transactions:[],items:[]},item);
 assert.equal(WR.proficient(c,item.weapon),false);
 assert.match(WR.attackError(c,inv,item,'ranged'),/ammunition remaining/i);
 inv=I.add(inv,I.gear('arrows','Arrows','ammunition',3));
 const err=WR.attackError(c,inv,item,'ranged');assert.equal(err,'');
 const noHands=I.add(inv,{...I.gear('shield','Shield','shield',1,'',{equipped:true,armor:{kind:'shield',baseAC:2,enhancement:0}})});
 assert.match(WR.attackError(c,noHands,noHands.items.find(x=>x.id==='bow'),'ranged'),/hands/i);
});

test('weapon attack consumes ammunition and thrown weapons consume one copy',()=>{
 const c=build('Ranger',5),bow=FolioWeaponCatalog.weapons.find(w=>w.name==='Shortbow');
 let weapon=WR.catalogItem(bow,'shortbow');weapon.equipped=true;
 let inv=I.add({currency:{pp:0,gp:0,ep:0,sp:0,cp:0},transactions:[],items:[]},weapon);inv=I.add(inv,I.gear('arrows','Arrows','ammunition',5));
 const result=WR.attack(c,inv,'shortbow','ranged','normal',null,(sides)=>Math.min(sides,10));
 assert.equal(result.inventory.items.find(x=>x.id==='arrows').quantity,4);
 const dagger=WR.catalogItem(FolioWeaponCatalog.weapons.find(w=>w.name==='Dagger'),'dagger');dagger.equipped=true;dagger.quantity=2;
 let inv2=I.add({currency:{pp:0,gp:0,ep:0,sp:0,cp:0},transactions:[],items:[]},dagger);
 const thrown=WR.attack(c,inv2,'dagger','throw','normal',null,(sides)=>Math.min(sides,10));
 assert.equal(thrown.inventory.items.find(x=>x.id==='dagger').quantity,1);
});

test('Quick Roll parses expressions and produces deterministic normal, Advantage, and Disadvantage results',()=>{
 assert.deepEqual(D.parseExpression('2d6+3'),{count:2,sides:6,modifier:3,expression:'2d6+3'});
 assert.equal(D.rollExpression({count:2,sides:6,modifier:3},()=>0).total,5);
 assert.deepEqual(D.rollD20('advantage',()=>0.99),{rolls:[20,20],chosen:20,mode:'advantage'});
 assert.deepEqual(D.rollD20('disadvantage',()=>0),{rolls:[1,1],chosen:1,mode:'disadvantage'});
 assert.throws(()=>D.parseExpression('30d6'));
});

test('Quick Roll window exposes the six requested dice and a floating compact interface',()=>{
 const html=UI.quickRollWindow({open:true,count:1,modifier:0,mode:'normal',rolling:false,history:[]});
 for(const side of [20,12,10,8,6,4])assert.ok(html.includes(`data-sides="${side}"`));
 assert.ok(html.includes('Quick Roll'));assert.ok(html.includes('quick-roll-window'));assert.ok(html.includes('quick-roll-count'));
});

test('class-specific spellbook keeps the compact view and moves the full catalogue into Manage spells',()=>{
 const c=build('Wizard',5,{slotMax:[4,3,2]}),id=spellKey('Shield'),s={character:c,spellbook:{catalogSelections:[id],custom:[],favorites:[],catalogPending:null},resources:{spellSlots:[4,3,2]}};
 const bookHtml=UI.spellbookView(s,{spellFilter:{view:'all'}});
 assert.ok(bookHtml.includes('Prepared Wizard spells'));assert.ok(bookHtml.includes('Manage spells'));assert.ok(!bookHtml.includes('339 spells in the bundled catalogue'));
 const prepHtml=UI.preparationView(s,{catalogDraft:[id],catalogSearch:'',catalogLevel:'',catalogSchool:'',catalogConcentration:'',catalogRitual:'',swapOut:id,swapIn:''});
 assert.ok(prepHtml.includes('339 spells in the bundled catalogue'));assert.ok(prepHtml.includes('Wizard spell catalogue'));
});

test('Pip keeps his original grouped Spellbook and can queue the two personal Paladin options',()=>{
 const state=PipData.newState();
 assert.ok(PipSpells.activeSpells(state.spellbook).includes('bless'));
 assert.ok(PipSpells.activeSpells(state.spellbook).includes('divine-smite'));
 const prep=UI.preparationView(state,{catalogSearch:'',catalogLevel:'',catalogSchool:'',catalogConcentration:'',catalogRitual:'',swapOut:state.spellbook.prepared[0],swapIn:''});
 assert.ok(prep.includes('Compelled Duel'));
 assert.ok(prep.includes('Wrathful Smite'));
 const queued=PipSpells.queueSwap(state.spellbook,'bless','compelled-duel');
 const applied=PipSpells.applyOneSwap(queued);
 assert.ok(applied.prepared.includes('compelled-duel'));
 assert.ok(!applied.prepared.includes('bless'));
});
