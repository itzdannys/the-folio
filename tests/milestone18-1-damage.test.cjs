const {test}=require('node:test');
const assert=require('node:assert/strict');
require('../js/inventory.js');require('../js/data.js');
const M=require('../js/class-mechanics.js');
const C=require('../js/core.js');
const Storage=require('../js/storage.js');
function fighter(){return {character:{templateKind:'starter',className:'Fighter',level:5,scores:{str:16,dex:14,con:14,int:10,wis:10,cha:10},build:{characterClass:'Fighter'}},resources:{hp:45,maxHp:45,tempHp:0,concentration:'',classState:{}},inventory:{items:[]}};}
function barbarian(){const s=fighter();s.character.build.characterClass='Barbarian';s.character.className='Barbarian';s.resources.classState.raging=true;return s;}
test('Typed Rage resistance halves bludgeoning, piercing, slashing for any Barbarian in Rage',()=>{
 for(const type of ['Bludgeoning','Piercing','Slashing']){
  const {state,details}=M.resolveIncomingDamage(barbarian(),19,type);
  assert.equal(details.resolved,9,type);assert.equal(state.resources.hp,36,type);
  assert.equal(details.automaticResistance,true);
 }
});
test('Unspecified and nonphysical damage do NOT trigger inferred Rage resistance',()=>{
 for(const type of ['Unspecified','Fire','Cold','Thunder','Psychic','Force']){
  const {details}=M.resolveIncomingDamage(barbarian(),19,type);
  assert.equal(details.resolved,19,type);assert.equal(details.resistant,false);
 }
 const off=barbarian();off.resources.classState.raging=false;
 assert.equal(M.resolveIncomingDamage(off,19,'Slashing').details.resolved,19);
});
test('Multiple resistance sources halve once; vulnerability follows resistance, immunity overrides both',()=>{
 let x=M.resolveIncomingDamage(barbarian(),15,'Slashing',{resistant:true});
 assert.equal(x.details.resolved,7);
 x=M.resolveIncomingDamage(barbarian(),15,'Slashing',{vulnerable:true});
 assert.equal(x.details.resolved,14,'15 -> floor(7.5) -> 7 -> 14');
 x=M.resolveIncomingDamage(barbarian(),15,'Slashing',{resistant:true,vulnerable:true});
 assert.equal(x.details.resolved,14);
 x=M.resolveIncomingDamage(barbarian(),15,'Slashing',{resistant:true,vulnerable:true,immune:true});
 assert.equal(x.details.resolved,0);assert.equal(x.state.resources.hp,45);
});
test('Manual resistance and vulnerability apply per hit, without modifying saved class traits',()=>{
 const s=fighter();const first=M.resolveIncomingDamage(s,11,'Fire',{resistant:true});
 assert.equal(first.details.resolved,5);
 const second=M.resolveIncomingDamage(first.state,11,'Fire');
 assert.equal(second.details.resolved,11);
 assert.deepEqual(second.state.resources.classState,{});
});
test('Temporary HP is consumed after resistance and concentration DC uses actual damage',()=>{
 let s=barbarian();s.resources.tempHp=5;s.resources.concentration='Bless';
 const hit=M.resolveIncomingDamage(s,28,'Piercing');
 assert.equal(hit.details.resolved,14);assert.equal(hit.details.absorbed,5);
 assert.equal(hit.details.hpLost,9);assert.equal(hit.state.resources.hp,36);
 assert.equal(hit.details.concentrationDC,10);
 s=barbarian();s.resources.concentration='Bless';
 assert.equal(M.resolveIncomingDamage(s,62,'Slashing').details.concentrationDC,15);
 assert.equal(M.resolveIncomingDamage(s,62,'Fire').details.concentrationDC,30);
 const blocked=M.resolveIncomingDamage(s,62,'Fire',{immune:true});
 assert.equal(blocked.details.concentrationDC,null);assert.equal(blocked.state.resources.lastConcentrationDC,null);
});
test('Damage must be valid with a known type, no silent coercion',()=>{
 for(const amount of [-1,3.5,NaN,Infinity,100000])assert.throws(()=>M.resolveIncomingDamage(fighter(),amount,'Fire'),/whole number/);
 assert.throws(()=>M.resolveIncomingDamage(fighter(),4,'Generic'),/valid damage type/);
 assert.equal(M.resolveIncomingDamage(fighter(),0,'Fire').details.resolved,0);
});
test('Last damage audit survives JSON serialization without changing another character',()=>{
 const s=barbarian(),before=JSON.parse(JSON.stringify(s));
 const hit=M.resolveIncomingDamage(s,31,'Bludgeoning').state;
 assert.equal(hit.resources.lastDamage.resolved,15);assert.equal(before.resources.hp,45);
 const cloned=JSON.parse(JSON.stringify(hit));assert.equal(cloned.resources.lastDamage.source,'Barbarian Rage');
});
