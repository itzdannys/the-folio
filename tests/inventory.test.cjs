const {test}=require('node:test');
const assert=require('node:assert/strict');
const I=require('../js/inventory.js');
const C=require('../js/core.js');
require('../js/data.js');
const Data=globalThis.PipData;
const Storage=require('../js/storage.js');
function eqItem(id,name,category='magic',bonuses={},extra={}){return I.gear(id,name,category,1,'',{
 equipped:true,requiresAttunement:true,attuned:false,
 bonuses:{...I.zeroBonuses(),...bonuses},...extra
});}

test('starter equipment includes both ready blades, arrows, diamond, and 11 GP',()=>{
 const inv=I.defaults();assert.equal(inv.items.length,13);
 assert.equal(inv.currency.gp,11);
 assert.equal(inv.items.find(x=>x.id==='arrows').quantity,20);
 assert.ok(inv.items.find(x=>x.id==='diamond').notes.includes('Chromatic Orb'));
 assert.deepEqual(I.readyWeapons(inv).map(x=>x.id),['shortsword','scimitar']);
 assert.equal(C.derived(Data.initialCharacter,inv).ac,17);
});
test('unattuned magic item provides no bonus until attuned and equipped',()=>{
 let inv=I.add(I.defaults(),eqItem('cloak','Protective cloak','magic',{ac:1,saves:1}));
 assert.equal(C.derived(Data.initialCharacter,inv).ac,17);
 inv=I.toggleAttune(inv,'cloak');
 assert.equal(C.derived(Data.initialCharacter,inv).ac,18);
 assert.equal(C.derived(Data.initialCharacter,inv).saves.con,3);
 inv=I.toggleEquip(inv,'cloak');
 assert.equal(C.derived(Data.initialCharacter,inv).ac,17);
 assert.equal(C.derived(Data.initialCharacter,inv).saves.con,2);
});
test('attunement cannot exceed 3 and duplicate attuned names are rejected',()=>{
 let inv=I.defaults();for(let j=1;j<=4;j++)inv=I.add(inv,eqItem('magic'+j,'Ring '+j));
 for(let j=1;j<=3;j++)inv=I.toggleAttune(inv,'magic'+j);
 assert.throws(()=>I.toggleAttune(inv,'magic4'),/limit/i);
 let test=I.add(I.defaults(),eqItem('one','Dup'));test=I.toggleAttune(test,'one');
 assert.throws(()=>I.add(test,eqItem('two','dup','magic',{}, {attuned:true})),/inventory/i);
});
test('shield and armor change AC but do not stack armor with Genie Splendor',()=>{
 let inv=I.defaults();const shield=I.gear('shield-test','Test shield','shield',1,'',{equipped:true,armor:{kind:'shield',baseAC:2,enhancement:0}});
 inv=I.add(inv,shield);assert.equal(C.derived(Data.initialCharacter,inv).ac,19);
 const armor=I.gear('leather-test','Leather','armor',1,'',{equipped:true,armor:{kind:'light',baseAC:11,enhancement:0}});
 inv=I.add(inv,armor);assert.equal(C.derived(Data.initialCharacter,inv).ac,16); // 11+DEX3+Shield2
 const chain=I.gear('chain-test','Chain mail','armor',1,'',{equipped:true,armor:{kind:'heavy',baseAC:16,enhancement:0}});
 inv=I.add(inv,chain);assert.equal(C.derived(Data.initialCharacter,inv).ac,18);
 assert.equal(inv.items.filter(x=>x.category==='armor'&&x.equipped).length,1);
});
test('ready weapon magic bonus is per weapon; global bonuses affect both',()=>{
 let inv=I.defaults();let n=I.weaponNumbers(inv.items.find(i=>i.id==='shortsword'),Data.initialCharacter,C.derived(Data.initialCharacter,inv));
 assert.deepEqual([n.attack,n.damage],[6,3]);
 inv=I.update(inv,'shortsword',{weapon:{...inv.items.find(i=>i.id==='shortsword').weapon,magicBonus:1}});
 let d=C.derived(Data.initialCharacter,inv);
 assert.equal(I.weaponNumbers(inv.items.find(i=>i.id==='shortsword'),Data.initialCharacter,d).attack,7);
 assert.equal(I.weaponNumbers(inv.items.find(i=>i.id==='scimitar'),Data.initialCharacter,d).attack,6);
 inv=I.add(inv,I.gear('enhance','Combat charm','magic',1,'',{equipped:true,bonuses:{...I.zeroBonuses(),attack:1,damage:2}}));d=C.derived(Data.initialCharacter,inv);
 assert.equal(I.weaponNumbers(inv.items.find(i=>i.id==='shortsword'),Data.initialCharacter,d).attack,8);
 assert.equal(I.weaponNumbers(inv.items.find(i=>i.id==='scimitar'),Data.initialCharacter,d).damage,5);
});
test('Nick summary only appears with two ready Light weapons',()=>{
 let inv=I.defaults();assert.equal(I.hasNickTwinBlades(inv),true);
 inv=I.toggleEquip(inv,'scimitar');assert.equal(I.hasNickTwinBlades(inv),false);
});
test('currency transactions have a history and refuse negative balances',()=>{
 let inv=I.defaults();inv=I.adjustCurrency(inv,'gp',5,'spend','Tavern','txn1');
 assert.equal(inv.currency.gp,6);assert.equal(inv.transactions[0].note,'Tavern');
 assert.throws(()=>I.adjustCurrency(inv,'gp',7,'spend'),/Not enough/);
 assert.throws(()=>I.adjustCurrency(inv,'gp',1.5,'add'),/whole number/);
 inv=I.adjustCurrency(inv,'sp',25,'add','Reward','txn2');assert.equal(inv.currency.sp,25);
});
test('charge spending, explicit long-rest recharge, and manual/dawn recovery',()=>{
 let inv=I.defaults();for(const [id,recharge] of [['a','manual'],['b','long-rest'],['c','dawn']]){
  inv=I.add(inv,I.gear(id,'Wand '+id,'magic',1,'',{maxCharges:3,charges:2,recharge}));
 }
 inv=I.changeCharges(inv,'a',-1);assert.equal(inv.items.find(i=>i.id==='a').charges,1);
 assert.throws(()=>I.changeCharges(inv,'a',-2),/Not enough/);
 inv=I.longRest(inv);assert.equal(inv.items.find(i=>i.id==='b').charges,3);
 assert.equal(inv.items.find(i=>i.id==='a').charges,1);
 assert.equal(inv.items.find(i=>i.id==='c').charges,2);
});
test('older v3 save migrates inventory without changing DEX, resources or spellbook',()=>{
 const orig=Data.newState();orig.version=3;delete orig.inventory;
 orig.character.scores.dex=18;orig.resources.hp=42;orig.spellbook.prepared[0]='cure-wounds';
 const next=Storage.migrate(orig);
 assert.equal(next.version,6);assert.equal(next.inventory.currency.gp,11);
 assert.equal(next.character.scores.dex,18);assert.equal(next.resources.hp,42);
 assert.equal(next.spellbook.prepared[0],'cure-wounds');assert.equal(C.derived(next.character,next.inventory).ac,18);
});
test('inventory, currency history, and undo snapshots survive backup export/import',()=>{
 let before=Data.newState(),after=structuredClone(before);
 after.inventory=I.adjustCurrency(after.inventory,'gp',3,'spend','Gift','x');
 after.inventory=I.toggleEquip(after.inventory,'scimitar');
 const backup=Storage.bundle({present:after,past:[before]});
 const restored=Storage.importBackup(JSON.stringify(backup));
 assert.equal(restored.present.inventory.currency.gp,8);
 assert.equal(restored.present.inventory.transactions.length,1);
 assert.equal(restored.past[0].inventory.currency.gp,11);
 assert.equal(I.readyWeapons(restored.present.inventory).length,1);
});
