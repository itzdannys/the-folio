'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
require('../js/data.js');require('../js/inventory.js');require('../js/core.js');
const M=require('../js/class-mechanics.js');
function make(sub='Oath of Devotion',level=18,cha=18){
 const c={templateKind:'starter',className:'Paladin',subclass:sub,level,scores:{str:16,dex:12,con:14,int:10,wis:10,cha},profSaves:['wis','cha'],build:{characterClass:'Paladin',subclass:sub,slotMax:[4,3,3,2,1,0,0,0,0]}};
 return {character:c,inventory:{items:[]},resources:{hp:55,maxHp:80,tempHp:0,conditions:[],classState:{},classResources:M.normalizeResources(c),spellSlots:[4,3,3,2,1,0,0,0,0]}};
}
const resolve=(s,options={})=>M.resolvePaladinAllyAura(s,{allyName:'Cleric Ally',distanceFeet:5,kind:'save',ability:'wis',baseTotal:13,dc:16,...options});
test('level 6 Paladin grants minimum +1 aura save bonus but not below level 6',()=>{
 const low=make('Oath of Devotion',5);assert.throws(()=>resolve(low),/level 6/);
 const s=make('Oath of Devotion',6,8),r=resolve(s).resources.lastClassEffect;
 assert.equal(r.auraBonus,1);assert.equal(r.total,14);assert.equal(r.success,false);assert.equal(r.range,10);
});
test('Charisma bonus calculates successful and unsuccessful ally saves',()=>{
 const s=make('Oath of Devotion',7),out=resolve(s);
 assert.equal(out.resources.lastClassEffect.total,17);
 assert.equal(out.resources.lastClassEffect.success,true);
 assert.deepEqual(s.resources.classState,{});
 assert.equal(s.resources.lastClassEffect,undefined);
 assert.equal(out.resources.lastClassEffect.appliedToAllySheet,false);
});
test('Aura range grows from 10 ft to 30 ft exactly at level 18',()=>{
 const seventeen=make('Oath of the Ancients',17);
 assert.doesNotThrow(()=>resolve(seventeen,{distanceFeet:10}));
 assert.throws(()=>resolve(seventeen,{distanceFeet:11}),/within 10 feet/);
 const eighteen=make('Oath of the Ancients',18);
 assert.equal(resolve(eighteen,{distanceFeet:30}).resources.lastClassEffect.range,30);
 assert.throws(()=>resolve(eighteen,{distanceFeet:31}),/within 30 feet/);
});
test('Aura switches off for incapacitated Paladin or zero HP',()=>{
 for(const condition of ['Incapacitated','Unconscious','Paralyzed','Stunned','Petrified']){
  const s=make();s.resources.conditions=[condition];assert.throws(()=>resolve(s),/inactive/);
 }
 const s=make();s.resources.hp=0;assert.throws(()=>resolve(s),/0 HP/);
});
test('Aura rejects wrong classes, invalid locations, and invalid inputs',()=>{
 const s=make();s.character.build.characterClass='Wizard';assert.throws(()=>resolve(s),/level 6/);
 const pal=make();assert.throws(()=>resolve(pal,{allyName:'  '}),/Name the affected ally/);
 assert.throws(()=>resolve(pal,{distanceFeet:-1}),/within 30 feet/);
 assert.throws(()=>resolve(pal,{distanceFeet:2.5}),/within 30 feet/);
 assert.throws(()=>resolve(pal,{kind:'mystery'}),/calculation/);
 assert.throws(()=>resolve(pal,{baseTotal:NaN}),/valid save/);
 assert.throws(()=>resolve(pal,{dc:0}),/valid save/);
});
test('Saving throws never stack multiple Paladin Aura of Protection bonuses',()=>{
 const s=make();const out=resolve(s,{otherPaladinAuraApplied:true}).resources.lastClassEffect;
 assert.equal(out.auraBonus,0);assert.equal(out.total,13);
});
test('Smite of Protection Half Cover adds +2 to Dex saves plus protection, not other saves',()=>{
 const s=make('Oath of Devotion',15),active={...s,resources:{...s.resources,classState:{smiteProtectionActive:true}}};
 const dex=resolve(active,{ability:'dex'}).resources.lastClassEffect;
 assert.equal(dex.auraBonus,4);assert.equal(dex.coverBonus,2);assert.equal(dex.total,19);
 assert.equal(resolve(active,{ability:'con'}).resources.lastClassEffect.coverBonus,0);
 assert.equal(resolve(s,{ability:'dex'}).resources.lastClassEffect.coverBonus,0);
});
test('Same or better cover prevents cover stacking while Aura of Protection remains active',()=>{
 const s=make('Oath of Devotion',15);s.resources.classState.smiteProtectionActive=true;
 const r=resolve(s,{ability:'dex',alreadyCovered:true}).resources.lastClassEffect;
 assert.equal(r.auraBonus,4);assert.equal(r.coverBonus,0);assert.equal(r.total,17);
});
test('Smite of Protection ally Half Cover may turn hit into miss',()=>{
 const s=make('Oath of Devotion',15);s.resources.classState.smiteProtectionActive=true;
 const r=resolve(s,{kind:'attack',baseTotal:16,dc:17}).resources.lastClassEffect;
 assert.equal(r.coverBonus,2);assert.equal(r.effectiveAC,18);assert.equal(r.prevented,true);
 assert.equal(resolve(s,{kind:'attack',baseTotal:16,dc:18}).resources.lastClassEffect.prevented,false);
 assert.equal(resolve(s,{kind:'attack',baseTotal:16,dc:17,alreadyCovered:true}).resources.lastClassEffect.prevented,false);
});
test('Smite of Protection refuses unactivated, wrong oath, or below level 15',()=>{
 assert.throws(()=>resolve(make('Oath of Devotion',15),{kind:'attack',baseTotal:16,dc:17}),/active Smite/);
 const a=make('Oath of Glory',15);a.resources.classState.smiteProtectionActive=true;
 assert.throws(()=>resolve(a,{kind:'attack',baseTotal:16,dc:17}),/active Smite/);
 const b=make('Oath of Devotion',14);b.resources.classState.smiteProtectionActive=true;
 assert.throws(()=>resolve(b,{kind:'attack',baseTotal:16,dc:17}),/level 15/);
});
test('Ancients Aura of Warding halves only eligible damage types and rounds down',()=>{
 const s=make('Oath of the Ancients',7);
 for(const damageType of ['Necrotic','Psychic','Radiant']){
  const r=resolve(s,{kind:'damage',baseTotal:17,damageType}).resources.lastClassEffect;
  assert.equal(r.finalDamage,8);assert.equal(r.resistanceApplied,true);
 }
 assert.throws(()=>resolve(s,{kind:'damage',baseTotal:17,damageType:'Fire'}),/Necrotic/);
});
test('Resistance does not stack; wrong oath/level cannot invoke Warding',()=>{
 const s=make('Oath of the Ancients',7);
 const r=resolve(s,{kind:'damage',baseTotal:9,damageType:'Psychic',alreadyResistant:true}).resources.lastClassEffect;
 assert.equal(r.finalDamage,9);assert.equal(r.resistanceApplied,false);
 assert.throws(()=>resolve(make('Oath of the Ancients',6),{kind:'damage',baseTotal:12,damageType:'Psychic'}),/level 7/);
 assert.throws(()=>resolve(make('Oath of Devotion',7),{kind:'damage',baseTotal:12,damageType:'Psychic'}),/Ancients/);
});
test('Devotion suppresses Charmed while in aura at level 7, not permanently remove it',()=>{
 const s=make('Oath of Devotion',7),r=resolve(s,{kind:'condition',condition:'Charmed'}).resources.lastClassEffect;
 assert.equal(r.immune,true);assert.equal(r.effectSuppressed,true);
 assert.throws(()=>resolve(make('Oath of the Ancients',7),{kind:'condition',condition:'Charmed'}),/does not grant immunity/);
});
test('Aura of Courage suppresses Frightened for all level 10+ Paladins',()=>{
 const r=resolve(make('Oath of Vengeance',10),{kind:'condition',condition:'Frightened'}).resources.lastClassEffect;
 assert.equal(r.immune,true);
 assert.throws(()=>resolve(make('Oath of Vengeance',9),{kind:'condition',condition:'Frightened'}),/does not grant immunity/);
});
test('Ally aura results survive JSON save/reopen; do not mutate ally or resource counters',()=>{
 const s=make('Oath of Devotion',15);s.resources.classState.smiteProtectionActive=true;
 const original=JSON.stringify(s.resources.classResources);
 const r=resolve(s,{kind:'save',ability:'dex'}),saved=JSON.parse(JSON.stringify(r));
 assert.equal(saved.resources.lastClassEffect.total,19);
 assert.equal(JSON.stringify(r.resources.classResources),original);
 assert.equal(saved.resources.classState.smiteProtectionActive,true);
});
test('Paladin self Aura of Protection and Smite of Protection are inactive at 0 HP',()=>{
 const core=require('../js/core.js');const s=make('Oath of Devotion',15);s.resources.classState.smiteProtectionActive=true;
 const live=core.derived(s.character,s.inventory,s.resources);
 assert.equal(live.auraProtection,4);assert.equal(live.smiteProtectionCover,true);
 const down={...s.resources,hp:0};const defeated=core.derived(s.character,s.inventory,down);
 assert.equal(defeated.auraProtection,0);assert.equal(defeated.smiteProtectionCover,false);
 assert.equal(live.saves.wis-defeated.saves.wis,4);
 assert.equal(live.ac-defeated.ac,2);
});
