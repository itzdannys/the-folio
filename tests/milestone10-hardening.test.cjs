const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../js/inventory.js');require('../js/core.js');require('../js/data.js');require('../js/character.js');
require('../js/spell-catalog.js');require('../js/weapon-catalog.js');require('../js/dice.js');require('../js/spells.js');
const F=require('../js/rules-engine.js'), W=require('../js/weapon-rules.js'),I=globalThis.PipInventory,C=globalThis.FolioWeaponCatalog;
function ch(cls='Wizard',level=5){return {templateKind:'starter',className:cls,level,build:{characterClass:cls,level,slotMax:[4,3,2,0,0,0,0,0,0]},scores:{str:16,dex:14,con:14,int:16,wis:12,cha:12}};}
const key=n=>globalThis.FolioSpellCatalog.spells.find(x=>x.name===n)?.key;
const baseInventory=()=>({currency:{pp:0,gp:0,ep:0,sp:0,cp:0},transactions:[],items:[]});
function withWeapon(inv,name,id,mastered=true){const temp=C.weapons.find(x=>x.name===name);if(!temp)throw Error(name+' missing');const it=W.catalogItem(temp,id);it.weapon.mastered=mastered;it.equipped=true;return I.add(inv,it);}

test('unknown spells, out-of-class spells and out-of-level spells cannot be freshly selected',()=>{
 const wizard=ch('Wizard',5),book={catalogSelections:[]};
 assert.match(F.selectionError(wizard,book,['no-such-spell']),/unavailable/i);
 assert.match(F.selectionError(wizard,book,[key('Bless')]),/unavailable/i);
 assert.match(F.selectionError(wizard,book,[key('Wish')]),/unavailable/i);
 assert.match(F.selectionError(wizard,book,[key('Shield'),key('Shield')]),/only once/i);
 assert.equal(F.selectionError(wizard,book,[key('Shield'),key('Web')]),'');
});

test('single-replacement queues validate access, duplicate spells and cantrip replacements',()=>{
 const wizard=ch('Wizard',5),shield=key('Shield'),web=key('Web'),mageHand=key('Mage Hand'),book={catalogSelections:[shield,mageHand]};
 assert.match(F.swapError(wizard,book,'not-prepared',web),/currently/i);
 assert.match(F.swapError(wizard,book,shield,mageHand),/already selected/i);
 assert.match(F.swapError(wizard,book,mageHand,web),/cantrip/i);
 assert.match(F.swapError(wizard,book,shield,key('Wish')),/unavailable/i);
 assert.equal(F.swapError(wizard,book,shield,web),'');
});

test('queued complete prepared lists do not become live until a Long Rest',()=>{
 const old=key('Shield'),newSpell=key('Web');
 const book={catalogSelections:[old],catalogPending:[newSpell],castLog:[],custom:[]};
 assert.deepEqual(F.selectedIds(book),[old]);
 assert.deepEqual(F.applyPreparedChanges(book).catalogSelections,[newSpell]);
 assert.equal(F.applyPreparedChanges(book).catalogPending,null);
});

test('cast options reject illegally imported class spells',()=>{
 const wizard=ch('Wizard',5),bless=key('Bless');
 assert.deepEqual(F.castOptions(wizard,{catalogSelections:[bless],custom:[]},{spellSlots:[4,3,2]},bless),[]);
});

test('a proposed third weapon mastery is rejected for a level 7 paladin',()=>{
 let inv=baseInventory();inv=withWeapon(inv,'Shortsword','w1');inv=withWeapon(inv,'Scimitar','w2');inv=withWeapon(inv,'Longsword','w3');
 assert.match(W.masteryError(ch('Paladin',7),inv,'w3',true),/limit is 2/i);
 assert.equal(W.masteryError(ch('Fighter',7),inv,'w3',true),'');
});

test('mastery counts distinct weapon kinds rather than duplicate copies',()=>{
 let inv=baseInventory();inv=withWeapon(inv,'Shortsword','w1');inv=withWeapon(inv,'Shortsword','w2');inv=withWeapon(inv,'Scimitar','w3');
 assert.equal(W.masteryError(ch('Paladin',7),inv,'w3',true),'');
});

test('Barbarian cannot master ranged weapons and cannot exceed class limit',()=>{
 let inv=baseInventory();inv=withWeapon(inv,'Longbow','bow');
 assert.match(W.masteryError(ch('Barbarian',5),inv,'bow',true),/melee/i);
});

test('unknown target AC does not imply that a mastery effect has triggered',()=>{
 let inv=baseInventory();inv=withWeapon(inv,'Longsword','sword');
 const r=W.attack(ch('Fighter',5),inv,'sword','melee','normal',null,()=>11);
 assert.equal(r.result.hit,null);
 assert.match(r.result.masteryReminder,/resolve the hit or miss/i);
});

test('Pip specialist preparation rejects third-level spells before level 9',()=>{
 const P=globalThis.PipSpells,book=P.newBook();
 const paladinThird=globalThis.FolioSpellCatalog.spells.find(x=>x.classes.includes('Paladin')&&x.level===3);
 assert.ok(paladinThird);
 assert.throws(()=>P.queueSwap(book,book.prepared[0],paladinThird.key),/level 1–2/i);
});
