const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../js/inventory.js');
const B=require('../js/homebrew-bridge.js');
const I=globalThis.PipInventory;
const emptyInventory=()=>({items:[],transactions:[],currency:{pp:0,gp:0,ep:0,sp:0,cp:0}});
const spell={id:'hb-spell1',kind:'spell',name:'Butterfly Step',level:2,description:'Teleport a short distance, subject to the table ruling.'};
const weapon={id:'hb-weapon1',kind:'weapon',name:'Moonsteel Rapier',damage:'1d8',mastery:'Vex',description:'A personal weapon'};

test('saved homebrew spell can be imported without changing the source or original spells',()=>{
 const book={prepared:['bless'],custom:[]};const before=structuredClone(spell);
 const next=B.addSpell(book,spell,'custom-copy1');
 assert.deepEqual(spell,before);assert.deepEqual(book.custom,[]);
 assert.equal(next.custom.length,1);assert.equal(next.custom[0].level,2);
 assert.equal(next.custom[0].sourceHomebrewId,'hb-spell1');assert.equal(next.custom[0].alwaysPrepared,true);
 assert.match(next.custom[0].detail,/Teleport/);
 assert.throws(()=>B.addSpell(next,spell,'custom-copy2'),/already/i);
});
test('homebrew spell rejects malformed inputs',()=>{
 const book={custom:[]};assert.throws(()=>B.addSpell(book,{...spell,level:10},'id'),/level/i);
 assert.throws(()=>B.addSpell(book,{...spell,kind:'item'},'id'),/spell/i);
 assert.throws(()=>B.addSpell(book,{...spell,name:''},'id'),/name/i);
});
test('saved homebrew weapons import into inventory with editable safe default fields',()=>{
 const before=structuredClone(weapon);const inventory=emptyInventory();
 const next=B.addEquipment(inventory,weapon,'w1');
 assert.deepEqual(weapon,before);assert.equal(inventory.items.length,0);assert.equal(next.items.length,1);
 const item=next.items[0];assert.equal(item.category,'weapon');assert.equal(item.weapon.damage,'1d8');assert.equal(item.weapon.mastery,'Vex');assert.equal(item.weapon.mastered,false);
 assert.equal(item.weapon.type,'Slashing');assert.equal(item.equipped,false);
 assert.equal(I.validate(next),true);
});
test('saved generic item can be imported and invalid weapon dice are rejected',()=>{
 const source={id:'hb-item1',kind:'item',name:'Silver Keepsake',description:'A custom trinket'};
 const inventory=B.addEquipment(emptyInventory(),source,'i1');assert.equal(inventory.items[0].category,'gear');assert.equal(I.validate(inventory),true);
 assert.throws(()=>B.addEquipment(emptyInventory(),{...weapon,damage:'1d0'},'w2'),/damage dice/i);
 assert.throws(()=>B.addEquipment(emptyInventory(),{...weapon,damage:'<script>'},'w2'),/damage dice/i);
});
test('saved homebrew picker escapes user-controlled markup',()=>{
 const evil={...spell,name:'<img src=x onerror=alert(1)>',description:'<script>alert(1)</script>'};
 const markup=B.modal([evil],'spell');
 assert.match(markup,/&lt;img/);assert.match(markup,/&lt;script/);
 assert.doesNotMatch(markup,/<img/);assert.doesNotMatch(markup,/<script/);
});
test('lookup uses an exact saved option ID and matching kind',()=>{
 assert.equal(B.record([spell,weapon],'hb-spell1','spell').name,'Butterfly Step');
 assert.throws(()=>B.record([spell,weapon],'hb-spell1','weapon'),/not found/i);
});
