'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const I=require('../js/inventory.js');
require('../js/core.js');require('../js/data.js');require('../js/weapon-catalog.js');require('../js/dice.js');
const M=require('../js/class-mechanics.js'),W=require('../js/weapon-rules.js'),S=require('../js/storage.js');
function state(level=5,kind='dagger'){
 const character={templateKind:'starter',name:'Test Rogue',className:'Rogue',level,scores:{str:12,dex:18,con:14,int:10,wis:12,cha:10},build:{characterClass:'Rogue'}};
 const weapon=kind==='dagger'?{category:'Simple',kind:'Melee',damage:'1d4',type:'Piercing',ability:'dex',properties:'Finesse, Light, Thrown',propertyList:['Finesse','Light','Thrown'],grip:1}:{category:'Simple',kind:'Melee',damage:'1d6',type:'Bludgeoning',ability:'str',properties:'',propertyList:[],grip:1};
 const item=I.gear('w1',kind,'weapon',1,'',{equipped:true,weapon});
 return {character,resources:{hp:30,maxHp:30,tempHp:0,classState:{},classResources:{},spellSlots:[]},inventory:{items:[item]}};
}
function attack(s,opts,seq=[15,3,4,5,6,2,1,4,3,2,5,6,1,2,3,4,5,6,3,2]){
 let i=0;return W.attack(s.character,s.inventory,'w1','melee','advantage',12,()=>seq[i++],s.resources,{enabled:true,strikes:[],...opts});
}

test('Sneak Attack is included in weapon damage, scaled, and tracked once per turn',()=>{
 const s=state(5),a=attack(s,{},[15,12,2,4,5,6]);
 assert.equal(a.result.hit,true);assert.equal(a.result.damage,2+4+4+5+6);
 assert.equal(a.result.sneakAttack.extraDamage,15);
 assert.equal(a.resources.classState.sneakAttackUsed,true);
 assert.equal(s.resources.classState.sneakAttackUsed,undefined);
 assert.throws(()=>attack({...s,resources:a.resources},{}),/already used/);
 const reset=M.resetSneakAttack({...s,resources:a.resources});
 assert.equal(reset.resources.classState.sneakAttackUsed,false);
 assert.equal(attack(reset,{}).result.sneakAttack.diceRolled.length,3);
});
test('misses do not spend Sneak Attack or roll its damage',()=>{
 const s=state(5),a=attack(s,{},[2,3]);
 assert.equal(a.result.hit,false);assert.equal(a.result.sneakAttack,null);
 assert.equal(a.resources,undefined);assert.equal(a.result.damage,0);
});
test('natural 20 doubles remaining Sneak Attack dice as well as weapon dice',()=>{
 const a=attack(state(5),{strikes:['withdraw']},[20,8,2,3,4,5,6,1]);
 assert.equal(a.result.critical,true);
 assert.equal(a.result.sneakAttack.diceRolled.length,4,'3d6-1d6=2d6, then doubled');
 assert.equal(a.result.sneakAttack.extraDamage,4+5+6+1);
 assert.equal(a.result.damage,2+3+4+4+5+6+1);
 assert.equal(a.resources.lastClassEffect.diceSpent,1);
});
test('Cunning Strike effects spend dice before rolling and compute correct save DC',()=>{
 const s=state(5),a=attack(s,{strikes:['trip'],targetLargeOrSmaller:true},[12,7,4,6,2]);
 assert.equal(a.result.sneakAttack.diceRolled.length,2);
 assert.equal(a.result.sneakAttack.extraDamage,6+2);
 assert.equal(a.result.sneakAttack.effects[0].saveDC,15); // 8 + Dex +4 + proficiency +3
 assert.equal(a.result.sneakAttack.effects[0].save,'Dexterity');
 assert.match(a.result.message,/Cunning Strike/);
});
test('requires a valid finesse or ranged weapon and a real sneak-attack trigger',()=>{
 const s=state(5,'mace');assert.throws(()=>attack(s,{}),/Finesse or Ranged/);
 const dagger=state(5);
 assert.throws(()=>W.attack(dagger.character,dagger.inventory,'w1','melee','normal',12,()=>15,dagger.resources,{enabled:true,strikes:[]}),/Advantage/);
 const sequence=[12,7,2,3,4,5];let i=0;
 const a=W.attack(dagger.character,dagger.inventory,'w1','melee','normal',12,()=>sequence[i++],dagger.resources,{enabled:true,allyAdjacent:true,strikes:[]});
 assert.equal(a.result.sneakAttack.diceRolled.length,3);
 assert.throws(()=>W.attack(dagger.character,dagger.inventory,'w1','melee','disadvantage',12,()=>15,dagger.resources,{enabled:true,allyAdjacent:true}),/Advantage/);
});
test("won't spend once-per-turn use when target AC was not provided",()=>{
 const s=state(5);assert.throws(()=>W.attack(s.character,s.inventory,'w1','melee','advantage',null,()=>15,s.resources,{enabled:true}),/target AC/);
 assert.equal(s.resources.classState.sneakAttackUsed,undefined);
});
test("Poison requires Poisoner's Kit and Trip requires size confirmation",()=>{
 const s=state(5);
 assert.throws(()=>attack(s,{strikes:['poison']}),/Poisoner.s Kit/);
 assert.throws(()=>attack(s,{strikes:['trip']}),/Large or smaller/);
 s.inventory.items.push(I.gear('kit','Poisoner’s Kit','tool',1,''));
 const a=attack(s,{strikes:['poison']});assert.equal(a.result.sneakAttack.effects[0].save,'Constitution');
});
test('level gates and die costs reject illegal strikes without changing inventory',()=>{
 assert.throws(()=>attack(state(4),{strikes:['trip'],targetLargeOrSmaller:true}),/not available/);
 assert.throws(()=>attack(state(10),{strikes:['trip','withdraw'],targetLargeOrSmaller:true}),/not available/);
 assert.throws(()=>attack(state(14),{strikes:['knock-out','obscure']}),/costs more/);
 assert.throws(()=>attack(state(14),{strikes:['trip','trip'],targetLargeOrSmaller:true}),/different/);
 const s=state(14),a=attack(s,{strikes:['daze','obscure']});
 assert.equal(a.result.sneakAttack.diceRolled.length,2); // 7d6 - 2d6 - 3d6
 assert.equal(a.result.sneakAttack.effects.length,2);
 assert.equal(a.result.sneakAttack.effects[0].saveDC,17); // Dex +4 + PB +5
});
test('no Sneak Attack option leaves legacy weapon attacks unchanged',()=>{
 const s=state(5);let i=0;const a=W.attack(s.character,s.inventory,'w1','melee','normal',12,()=>[12,2][i++],s.resources);
 assert.equal(a.result.damage,6);assert.equal(a.result.sneakAttack,null);assert.equal(a.resources,undefined);
});
test('Sneak Attack use, chosen effects and damage survive a JSON copy',()=>{
 const s=state(14),a=attack(s,{strikes:['withdraw']});const c=S.clone(a.resources);
 assert.equal(c.classState.sneakAttackUsed,true);
 assert.equal(c.lastClassEffect.feature,'Sneak Attack');
 assert.equal(c.lastClassEffect.diceSpent,1);
});
