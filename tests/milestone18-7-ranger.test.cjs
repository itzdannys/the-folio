'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const I=require('../js/inventory.js');
require('../js/core.js');require('../js/dice.js');require('../js/weapon-catalog.js');require('../js/spell-catalog.js');require('../js/spell-expansions.js');require('../js/spell-supplements.js');
const CM=require('../js/class-mechanics.js'),W=require('../js/weapon-rules.js'),B=require('../js/builder.js'),FR=require('../js/rules-engine.js'),S=require('../js/storage.js');
function fixture(level=5,wis=16){
 const character={templateKind:'starter',className:'Ranger',level,scores:{str:14,dex:18,con:14,int:10,wis,cha:10},build:{characterClass:'Ranger',slotMax:B.slotsFor(B.classes.find(x=>x.name==='Ranger'),level)}};
 const sword=I.gear('weapon1','Shortsword','weapon',1,'',{equipped:true,weapon:{category:'Martial',kind:'Melee',damage:'1d6',type:'Piercing',properties:'Finesse, Light',propertyList:['Finesse','Light'],ability:'auto',grip:1,mastered:false}});
 return {character,resources:{hp:40,maxHp:40,tempHp:0,conditions:[],classResources:CM.normalizeResources(character),classState:{},concentration:'',spellSlots:[...character.build.slotMax]},inventory:{items:[sword]},spellbook:{catalogSelections:[],custom:[]}};
}
function attack(state,rolls=[12,5,6],opts={targetIsMarked:true},mode='normal',ac=10){let n=0;return W.attack(state.character,state.inventory,'weapon1','melee',mode,ac,()=>rolls[n++],state.resources,null,opts);}
test('Ranger Favored Enemy free casts consume a use and activate concentration with a target',()=>{
 const s=fixture();const initial=s.resources.classResources['favored-enemy'];const a=CM.castHuntersMark(s,'free',1,'Goblin Boss');
 assert.equal(a.resources.classResources['favored-enemy'],initial-1);assert.deepEqual(a.resources.spellSlots,s.resources.spellSlots);
 assert.equal(a.resources.classState.huntersMarkTarget,'Goblin Boss');assert.equal(CM.marked(a.resources),true);
 assert.match(a.resources.concentration,/Hunter/);assert.equal(s.resources.concentration,'');
 const recast=CM.castHuntersMark(a,'free',1,'Another');assert.equal(recast.resources.classState.huntersMarkTarget,'Another');assert.equal(recast.resources.classResources['favored-enemy'],initial-2);
 assert.equal(CM.endHuntersMark(a).resources.concentration,'');
});
test('Ranger can cast Hunter’s Mark using an actual spell slot without spending free uses',()=>{
 const s=fixture(5),free=s.resources.classResources['favored-enemy'];const a=CM.castHuntersMark(s,'slot',1,'Ogre');
 assert.equal(a.resources.classResources['favored-enemy'],free);assert.equal(a.resources.spellSlots[0],s.resources.spellSlots[0]-1);
 assert.equal(CM.endHuntersMark(a).resources.classState.huntersMarkTarget,'');
});
test('Hunter’s Mark refuses invalid targets, slots, non-Rangers, incapacitation and empty uses',()=>{
 const s=fixture();assert.throws(()=>CM.castHuntersMark(s,'free',1,' '),/name/);
 assert.throws(()=>CM.castHuntersMark(s,'slot',9,'Bear'),/eligible/);
 assert.throws(()=>CM.castHuntersMark(s,'gift',1,'Bear'),/free use or a spell slot/);
 s.resources.classResources['favored-enemy']=0;assert.throws(()=>CM.castHuntersMark(s,'free',1,'Bear'),/No free/);
 s.resources.conditions=['Incapacitated'];assert.throws(()=>CM.castHuntersMark(s,'slot',1,'Bear'),/incapacitated/);
 s.resources.conditions=[];s.character.build.characterClass='Fighter';assert.throws(()=>CM.castHuntersMark(s,'free',1,'Bear'),/Ranger/);
});
test('Hunter’s Mark damage is Force, only on a hit against the manually confirmed target',()=>{
 const s=CM.castHuntersMark(fixture(),'free',1,'Gnoll');const r=attack(s,[12,2,5]);
 assert.equal(r.result.hit,true);assert.equal(r.result.huntersMark.extraDamage,5);assert.equal(r.result.huntersMark.damageType,'Force');
 assert.equal(r.result.damage,2+4+5);assert.match(r.result.message,/Hunter’s Mark \+5 Force/);
 const ordinary=attack(s,[12,2],null);assert.equal(ordinary.result.damage,6);assert.equal(ordinary.result.huntersMark,null);
 const miss=attack(s,[2],{targetIsMarked:true});assert.equal(miss.result.damage,0);assert.equal(miss.result.huntersMark.extraDamage,0);
 assert.equal(s.resources.classResources['favored-enemy'],2,'weapons do not consume additional free cast uses');
});
test('Critical Hunter’s Mark doubles its Force dice; level 20 uses d10',()=>{
 const five=CM.castHuntersMark(fixture(5),'free',1,'Troll');const low=attack(five,[20,2,3,5,6]);
 assert.equal(low.result.critical,true);assert.deepEqual(low.result.huntersMark.diceRolled,[5,6]);
 const high=CM.castHuntersMark(fixture(20),'free',1,'Troll');const big=attack(high,[20,2,3,4,7,10]);
 assert.deepEqual(big.result.huntersMark.diceRolled,[7,10]);assert.equal(big.result.huntersMark.extraDamage,17);
});
test('Precise Hunter advantage applies at Ranger 17 to mark attacks, but disadvantage cancels it',()=>{
 const s=CM.castHuntersMark(fixture(17),'free',1,'Vampire');
 const a=attack(s,[4,15,2,3],{targetIsMarked:true});
 assert.equal(a.result.rollMode,'advantage');assert.equal(a.result.natural,15);assert.equal(a.result.huntersMark.preciseHunter,true);
 const b=attack(s,[4,15,2,3],{targetIsMarked:true},'disadvantage');
 assert.equal(b.result.rollMode,'normal');assert.equal(b.result.natural,4);
 const c=CM.castHuntersMark(fixture(16),'free',1,'Vampire');
 assert.equal(attack(c,[12,2,3]).result.rollMode,'normal');
});
test('Mark weapon bonus cannot be used without a confirmed AC and active concentration',()=>{
 const s=fixture();assert.throws(()=>attack(s,[12,4,5]),/active Ranger/);
 const active=CM.castHuntersMark(s,'free',1,'Dragon');assert.throws(()=>attack(active,[12,4,5],{targetIsMarked:true},'normal',null),/target AC/);
 const broken={...active,resources:{...active.resources,concentration:''}};assert.throws(()=>attack(broken,[12,4,5]),/active Ranger/);
});
test('Relentless Hunter at Ranger 13 prevents damage from triggering concentration check on Hunter’s Mark',()=>{
 const at13=CM.castHuntersMark(fixture(13),'free',1,'Troll');const r=CM.resolveIncomingDamage(at13,20,'Fire');
 assert.equal(r.details.concentrationDC,null);assert.equal(r.details.concentrationProtected,true);assert.equal(r.state.resources.lastConcentrationDC,null);
 const at12=CM.castHuntersMark(fixture(12),'free',1,'Troll');const lower=CM.resolveIncomingDamage(at12,20,'Fire');
 assert.equal(lower.details.concentrationDC,10);assert.equal(lower.details.concentrationProtected,false);
 const other={...at13,resources:{...at13.resources,concentration:'Pass without Trace'}};
 assert.equal(CM.resolveIncomingDamage(other,20,'Fire').details.concentrationDC,10);
});
test('Tireless follows level gate, d8 roll, Wisdom uses, and non-stacking temporary HP',()=>{
 assert.throws(()=>CM.useTireless(fixture(9),4),/level 10/);
 const s=fixture(10);s.resources.tempHp=10;const a=CM.useTireless(s,8);
 assert.equal(a.resources.tempHp,11);assert.equal(a.resources.classResources.tireless,2);assert.equal(a.resources.lastClassEffect.temporaryHpApplied,1);
 const b=CM.useTireless(a,1);assert.equal(b.resources.tempHp,11);assert.equal(b.resources.classResources.tireless,1);
 assert.throws(()=>CM.useTireless(s,9),/d8/);
 const low=fixture(10,8);assert.equal(CM.resourcesFor(low.character).find(x=>x.key==='tireless').max,1);
 assert.equal(CM.useTireless(low,1).resources.lastClassEffect.offered,1);
});
test('Nature’s Veil spends only on activation, records the active effect and enforces level and pool',()=>{
 assert.throws(()=>CM.toggleNaturesVeil(fixture(13)),/level 14/);
 const s=fixture(14),initial=s.resources.classResources['natures-veil'];
 const a=CM.toggleNaturesVeil(s);assert.equal(a.resources.classResources['natures-veil'],initial-1);
 assert.equal(a.resources.classState.naturesVeilActive,true);
 const b=CM.toggleNaturesVeil(a);assert.equal(b.resources.classResources['natures-veil'],initial-1);
 assert.equal(b.resources.classState.naturesVeilActive,false);
 const spent=fixture(14);spent.resources.classResources['natures-veil']=0;
 assert.throws(()=>CM.toggleNaturesVeil(spent),/No Nature’s Veil/);
});
test('Free Ranger Hunter’s Mark is available in Spellbook without using a preparation slot',()=>{
 const s=fixture(),key=FR.catalogKeyForName("Hunter's Mark");assert.ok(key);
 const options=FR.castOptions(s.character,s.spellbook,s.resources,key);
 assert.ok(options.some(x=>x.key==='ranger-free'));
 assert.ok(options.some(x=>x.key==='slot1'));
 assert.equal(FR.selectionSummary(s.character,s.spellbook).counts.prepared,0);
 const included={...s.spellbook,catalogSelections:[key]};
 assert.equal(FR.selectionSummary(s.character,included).counts.prepared,0);
 assert.equal(FR.selectionSummary(s.character,included).counts.granted,1);
});
test('Ranger level features survive save-style copying, rest restores uses, and marked damage stops on concentration end',()=>{
 const s=fixture(14),a=CM.castHuntersMark(s,'free',1,'Hobgoblin');
 const b=CM.useTireless(a,3),c=CM.toggleNaturesVeil(b),copy=S.clone(c);
 assert.equal(copy.resources.classState.huntersMarkTarget,'Hobgoblin');
 assert.equal(copy.resources.classState.naturesVeilActive,true);
 assert.equal(copy.resources.lastClassEffect.feature,'Nature’s Veil');
 const rested=CM.rest(copy.character,copy.resources.classResources,'long');
 assert.equal(rested['favored-enemy'],CM.resourcesFor(copy.character).find(x=>x.key==='favored-enemy').max);
 assert.equal(rested.tireless,3);assert.equal(rested['natures-veil'],3);
 const ended=CM.endHuntersMark(copy);assert.equal(CM.marked(ended.resources),false);
 assert.throws(()=>attack(ended),/active Ranger/);
});
