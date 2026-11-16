'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const I=require('../js/inventory.js');
const C=require('../js/core.js');
require('../js/dice.js');require('../js/data.js');require('../js/weapon-catalog.js');
const M=require('../js/class-mechanics.js'), W=require('../js/weapon-rules.js');
function build(sub='Oath of Devotion',n=15){
 const c={templateKind:'starter',className:'Paladin',subclass:sub,level:n,
 scores:{str:16,dex:12,con:14,int:10,wis:10,cha:18},profSaves:['wis','cha'],profSkills:['Athletics'],
 build:{characterClass:'Paladin',subclass:sub,slotMax:[4,3,3,2,1,0,0,0,0]}};
 const sword=I.gear('sword','Longsword','weapon',1,'',{equipped:true,weapon:{category:'Martial',kind:'Melee',damage:'1d8',type:'Slashing',properties:'Versatile',propertyList:['Versatile'],ability:'str',grip:1,mastered:false}});
 const bow=I.gear('bow','Longbow','weapon',1,'',{equipped:false,weapon:{category:'Martial',kind:'Ranged',damage:'1d8',type:'Piercing',properties:'Two-Handed',propertyList:['Two-Handed'],ability:'dex',grip:2}});
 return {character:c,inventory:{items:[sword,bow]},resources:{hp:30,maxHp:80,tempHp:0,conditions:[],classState:{},classResources:M.normalizeResources(c),spellSlots:[4,3,3,2,1,0,0,0,0],concentration:''}};
}
const dice=side=>side===20?14:4;
function attack(s,options={},mode='melee',id='sword',smite=null,targetAC=12){return W.attack(s.character,s.inventory,id,mode,'normal',targetAC,dice,s.resources,null,null,smite,null,null,options);}
function vow(s){return M.vowOfEnmity(s,'Golem');}
const soul={vowedTarget:true,soulVengeance:true,triggeringAttackConfirmed:true,withinReach:true};

test('Devotion Divine Smite activates self Half Cover (+2 AC and DEX saves) at level 15',()=>{
 const s=build(),before=C.derived(s.character,s.inventory,s.resources);
 const outcome=attack(s,{},'melee','sword',{cost:'free'});
 assert.equal(outcome.result.divineSmite.applied,true);
 const r=outcome.resources,after=C.derived(s.character,outcome.inventory,r);
 assert.equal(after.smiteProtectionCover,true);
 assert.equal(after.ac,before.ac+2);
 assert.equal(after.saves.dex,before.saves.dex+2);
 assert.equal(after.saves.con,before.saves.con);
 assert.equal(r.lastClassEffect.smiteProtection,true);
});
test('Smite of Protection does not activate on missed hits or for level 14 or different oaths',()=>{
 for(const [sub,n] of [['Oath of Devotion',14],['Oath of Glory',15],['Oath of the Ancients',15]]){
  const s=build(sub,n),out=attack(s,{},'melee','sword',{cost:'free'});
  assert.equal(!!out.resources.classState?.smiteProtectionActive,false);
  assert.equal(C.derived(s.character,out.inventory,out.resources).smiteProtectionCover,false);
 }
 const s=build(),miss=W.attack(s.character,s.inventory,'sword','melee','normal',25,()=>2,s.resources,null,null,{cost:'free'});
 assert.equal(miss.result.hit,false);assert.equal(miss.resources,undefined);
});
test('Smite of Protection is removed at the beginning of next tracked Paladin turn, not immediately',()=>{
 const s=build(),out=attack(s,{},'melee','sword',{cost:'free'});
 const state={...s,resources:out.resources,encounter:{active:true,round:1,currentId:'hero',roster:[{id:'hero',isPip:true}]}};
 assert.equal(M.paladinStartTurn(state).resources.classState.smiteProtectionActive,false);
 assert.equal(C.derived(s.character,s.inventory,state.resources).smiteProtectionCover,true);
});
test('Manual turn reset and rest end cover; save serialization retains it until then',()=>{
 const s=build(),out=attack(s,{},'melee','sword',{cost:'free'});
 const current={...s,resources:out.resources};
 assert.equal(JSON.parse(JSON.stringify(current)).resources.classState.smiteProtectionActive,true);
 assert.equal(M.resetReaction(current).resources.classState.smiteProtectionActive,false);
 assert.equal(M.restClassState(s.character,out.resources.classState,'short').smiteProtectionActive,false);
});
test('Temporary Smite cover turns off while incapacitated and respects an AC override',()=>{
 const s=build(),out=attack(s,{},'melee','sword',{cost:'free'});
 const c={...s.character,overrides:{ac:21}};
 assert.equal(C.derived(c,s.inventory,out.resources).ac,23);
 const r={...out.resources,conditions:['Stunned']};
 assert.equal(C.derived(c,s.inventory,r).ac,21);
});
test('Soul of Vengeance rolls a melee attack with Vow Advantage and spends Reaction on a hit',()=>{
 const s=vow(build('Oath of Vengeance',15)),result=attack(s,soul);
 assert.equal(result.result.soulOfVengeance,true);
 assert.equal(result.result.rollMode,'advantage');
 assert.equal(result.result.hit,true);
 assert.equal(result.resources.classState.reactionUsed,true);
 assert.equal(result.resources.lastClassEffect.feature,'Soul of Vengeance');
 assert.equal(result.resources.lastClassEffect.target,'Golem');
 assert.match(result.result.message,/Soul of Vengeance Reaction spent/);
});
test('Soul of Vengeance spends Reaction even when the melee attack misses',()=>{
 const s=vow(build('Oath of Vengeance',15));
 const result=W.attack(s.character,s.inventory,'sword','melee','normal',40,()=>2,s.resources,null,null,null,null,null,soul);
 assert.equal(result.result.hit,false);
 assert.equal(result.resources.classState.reactionUsed,true);
 assert.equal(result.resources.lastClassEffect.hit,false);
});
test('Soul of Vengeance rejects missing trigger, vow target, reach, and AC',()=>{
 const s=vow(build('Oath of Vengeance',15));
 for(const [opts,pattern] of [
  [{...soul,triggeringAttackConfirmed:false},/attack roll/],
  [{...soul,vowedTarget:false},/current Vow/],
  [{...soul,withinReach:false},/melee weapon range/]])assert.throws(()=>attack(s,opts),pattern);
 assert.throws(()=>attack(s,soul,'melee','sword',null,null),/target AC/);
});
test('Soul of Vengeance requires proper subclass and level',()=>{
 for(const s of [build('Oath of Glory',15),build('Oath of Vengeance',14),build('Oath of Devotion',20)]){
  assert.throws(()=>attack(s,soul),/Oath of Vengeance Paladin level 15/);
 }
});
test('Soul of Vengeance rejects spent Reactions, incapacitated characters and off-turn Divine Smite',()=>{
 const s=vow(build('Oath of Vengeance',15));
 assert.throws(()=>attack({...s,resources:{...s.resources,classState:{...s.resources.classState,reactionUsed:true}}},soul),/already been used/);
 assert.throws(()=>attack({...s,resources:{...s.resources,conditions:['Stunned']}},soul),/Incapacitated/);
 assert.throws(()=>attack(s,soul,'melee','sword',{cost:'free'}),/Bonus Action/);
});
test('Soul of Vengeance rejects thrown/ranged weapons and does not interfere with ordinary attacks',()=>{
 const s=vow(build('Oath of Vengeance',15));
 const withBow={...s,inventory:{items:s.inventory.items.map(i=>({...i,equipped:i.id==='bow'}))}};
 assert.throws(()=>attack(withBow,soul,'ranged','bow'),/melee weapon/);
 const withThrown={...s,inventory:{items:s.inventory.items.map(i=>i.id==='sword'?{...i,weapon:{...i.weapon,properties:'Thrown',propertyList:['Thrown']}}:i)}};
 assert.throws(()=>attack(withThrown,soul,'throw','sword'),/melee weapon/);
 const normal=attack(s,{vowedTarget:true});
 assert.equal(normal.result.soulOfVengeance,false);
 assert.equal(normal.resources,undefined);
});
test('Reaction use survives save/reopen and is restored only when the turn resets',()=>{
 const s=vow(build('Oath of Vengeance',15)),r=attack(s,soul);
 const restored=JSON.parse(JSON.stringify({...s,resources:r.resources}));
 assert.throws(()=>attack(restored,soul),/already been used/);
 const ready=M.resetReaction(restored);
 assert.equal(attack(ready,soul).result.soulOfVengeance,true);
});
