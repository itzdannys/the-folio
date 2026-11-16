'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const I=require('../js/inventory.js'),E=require('../js/equipment-catalog.js'),C=require('../js/core.js'),W=require('../js/weapon-catalog.js');
const hero={templateKind:'starter',level:5,speed:30,scores:{str:12,dex:16,con:14,int:10,wis:10,cha:10},profSaves:[],profSkills:[],expertise:[],build:{characterClass:'Fighter'}};
const add=(inv,key,id=key)=>I.add(inv,E.toInventoryItem(E.find(key),id));

test('M17.4 includes normal 2024 SRD armor, shields, tool variants and gear metadata',()=>{
 assert.ok(E.records.length>=140);assert.equal(globalThis.FolioWeaponCatalog.weapons.length,38);
 assert.equal(E.records.filter(x=>x.category==='armor').length,12);
 assert.equal(E.records.filter(x=>x.category==='shield').length,1);
 assert.ok(E.find('tool:thieves-tools')?.tool);
 assert.ok(E.records.some(x=>x.name==='Lute'&&x.group==='Musical Instruments'));
 assert.ok(E.records.some(x=>x.name==='Three-Dragon Ante Set'));
 assert.ok(E.records.some(x=>x.name==='Explorer’s Pack'));
 assert.ok(E.records.some(x=>x.name==='Arcane Focus — Wand'));
 assert.ok(E.records.every(x=>x.cost&&x.weight&&x.use&&x.group&&x.key));
 assert.equal(new Set(E.records.map(x=>x.key)).size,E.records.length);
});
test('search supports item names and groups, details provide specific action DCs',()=>{
 assert.ok(E.search('smith').some(x=>x.name==='Smith’s Tools'));
 assert.equal(E.search('', 'Shield').length,1);
 assert.ok(E.find('tool:thieves-tools').tool.utilize.includes('DC 15'));
 assert.ok(E.find('tool:alchemist-s-supplies').tool.utilize.includes('DC 15'));
 assert.equal(E.search('not-in-the-srd').length,0);
});
test('SRD armor supports AC and auto speed penalty with documented stealth warning',()=>{
 let inv={...I.defaults(),items:[]};inv=add(inv,'armor:chain-mail');
 const chain=inv.items[0];assert.ok(!chain.equipped);
 inv=I.toggleEquip(inv,chain.id);
 assert.equal(I.armorInfo(inv,3,0,hero).base,16);
 assert.equal(I.armorInfo(inv,3,0,hero).speedPenalty,-10);
 assert.ok(I.armorInfo(inv,3,0,hero).stealthDisadvantage);
 assert.equal(C.derived(hero,inv).speed,20);
 assert.ok(I.armorInfo(inv,3,0,hero).notices.some(x=>/training/i.test(x)));
 const strong={...hero,scores:{...hero.scores,str:13}};
 assert.equal(C.derived(strong,inv).speed,30);
 inv=add(inv,'armor:shield');inv=I.toggleEquip(inv,'armor:shield');
 assert.equal(C.derived(hero,inv).ac,18);
 assert.ok(I.armorInfo(inv,3,0,hero).notices.some(x=>/shield training/i.test(x)));
});
test('medium armor caps Dexterity, light armor does not; only one suit equipped',()=>{
 let inv={...I.defaults(),items:[]};
 inv=add(inv,'armor:breastplate');inv=I.toggleEquip(inv,'armor:breastplate');
 const agile={...hero,scores:{...hero.scores,dex:20}};
 assert.equal(C.derived(agile,inv).ac,16);
 inv=add(inv,'armor:studded-leather-armor');inv=I.toggleEquip(inv,'armor:studded-leather-armor');
 assert.equal(C.derived(agile,inv).ac,17);
 assert.equal(inv.items.filter(x=>x.category==='armor'&&x.equipped).length,1);
});
test('catalogue additions do not deduct coins, and retain provenance and tool data in inventory migration',()=>{
 let inv=I.defaults();const before=JSON.stringify(inv.currency);
 inv=add(inv,'tool:cartographer-s-tools','mapmaker');
 assert.equal(JSON.stringify(inv.currency),before);
 assert.ok(I.validate(inv));
 assert.equal(inv.items.find(x=>x.id==='mapmaker').source,'PHB 24'); // Visible source label is unified in M18.28.
 assert.ok(inv.items.find(x=>x.id==='mapmaker').tool.utilize.includes('DC 15'));
 assert.equal(I.migrate(inv).items.find(x=>x.id==='mapmaker').tool.ability,'Wisdom');
});
test('equipment is not instantly equipped, and stowing armor removes speed penalty',()=>{
 let inv={...I.defaults(),items:[]};inv=add(inv,'armor:splint-armor');
 assert.equal(C.derived(hero,inv).speed,30);
 inv=I.toggleEquip(inv,'armor:splint-armor');assert.equal(C.derived(hero,inv).speed,20);
 inv=I.toggleEquip(inv,'armor:splint-armor');assert.equal(C.derived(hero,inv).speed,30);
});
test('empty or absent inventory keeps previous character calculations',()=>{
 const baseline=C.derived(hero);
 assert.equal(baseline.ac,13);
 assert.equal(baseline.speed,30);
});
