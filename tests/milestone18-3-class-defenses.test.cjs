const {test}=require('node:test'),assert=require('node:assert/strict');
require('../js/inventory.js');require('../js/data.js');
const M=require('../js/class-mechanics.js'),C=require('../js/core.js');
const S=require('../js/storage.js');
const scores={str:14,dex:16,con:14,int:10,wis:12,cha:18};
const inv={items:[]};
function sample(name,level=7){return {character:{templateKind:'starter',className:name,level,scores:{...scores},profSaves:[],profSkills:[],expertise:[],speed:30,overrides:{},build:{characterClass:name,spellAbility:name==='Sorcerer'||name==='Paladin'?'cha':'wis'}},inventory:inv,resources:{hp:60,maxHp:60,tempHp:0,conditions:[],concentration:'',classState:{},classResources:{},spellSlots:[4,3,2,0,0,0,0,0,0]}};}
test('2024 Paladin Aura of Protection adds CHA modifier to each personal save from level 6, only once',()=>{
 const at5=sample('Paladin',5),at6=sample('Paladin',6);
 assert.equal(C.derived(at5.character,inv,at5.resources).saves.con,2);
 assert.equal(C.derived(at6.character,inv,at6.resources).saves.con,6);
 at6.character.profSaves=['con'];
 assert.equal(C.derived(at6.character,inv,at6.resources).saves.con,9,'CON +2, PB +3, aura +4');
 assert.equal(C.derived(at6.character,inv,at6.resources).auraProtection,4);
 at6.resources.conditions=['Incapacitated'];
 assert.equal(C.derived(at6.character,inv,at6.resources).saves.con,5);
});
test('Paladin minimum Aura bonus is +1 even at negative CHA, and never applies to non-Paladins',()=>{
 const p=sample('Paladin',6);p.character.scores.cha=7;
 assert.equal(C.derived(p.character,inv,p.resources).saves.con,3);
 p.character.build.characterClass='Fighter';p.character.className='Fighter';
 assert.equal(C.derived(p.character,inv,p.resources).saves.con,2);
 const pip=sample('Paladin',6);pip.character.templateKind='pip';
 assert.equal(C.derived(pip.character,inv,pip.resources).auraProtection,0);
});
test('Innate Sorcery activation spends one use, raises own Sorcerer spell save DC, and can end',()=>{
 let s=sample('Sorcerer',1),base=C.derived(s.character,s.inventory,s.resources).spellDC;
 s=M.toggleInnateSorcery(s);
 assert.equal(s.resources.classResources['innate-sorcery'],1);
 assert.equal(C.derived(s.character,s.inventory,s.resources).spellDC,base+1);
 assert.equal(C.derived(s.character,s.inventory,s.resources).innateSorcery,true);
 s=M.toggleInnateSorcery(s);
 assert.equal(C.derived(s.character,s.inventory,s.resources).spellDC,base);
 assert.equal(s.resources.classResources['innate-sorcery'],1,'ending does not refund a spent use');
 s=M.toggleInnateSorcery(s);
 assert.equal(s.resources.classResources['innate-sorcery'],0);
 s=M.toggleInnateSorcery(s);
 assert.throws(()=>M.toggleInnateSorcery(s),/No Innate Sorcery uses/);
 assert.equal(M.rest(s.character,s.resources.classResources,'long')['innate-sorcery'],2);
});
test('Innate Sorcery cannot be activated by another class, while Incapacitated, or after resources exhausted',()=>{
 let s=sample('Wizard',10);assert.throws(()=>M.toggleInnateSorcery(s),/Sorcerer/);
 s=sample('Sorcerer',2);s.resources.conditions=['Incapacitated'];
 assert.throws(()=>M.toggleInnateSorcery(s),/Incapacitated/);
 s.resources.conditions=[];s.resources.classResources['innate-sorcery']=0;
 assert.throws(()=>M.toggleInnateSorcery(s),/No Innate Sorcery uses/);
});
test('Uncanny Dodge halves a visible qualifying attack, consumes Reaction once, and saves result',()=>{
 const first=sample('Rogue',5);
 const hit=M.resolveIncomingDamage(first,25,'Piercing',{defense:'uncanny-dodge'});
 assert.equal(hit.details.resolved,12);
 assert.equal(hit.state.resources.hp,48);
 assert.equal(hit.details.defense,'uncanny-dodge');
 assert.equal(hit.state.resources.classState.reactionUsed,true);
 assert.throws(()=>M.resolveIncomingDamage(hit.state,10,'Piercing',{defense:'uncanny-dodge'}),/Reaction already used/);
 const next=M.resetReaction(hit.state);
 assert.equal(M.resolveIncomingDamage(next,11,'Piercing',{defense:'uncanny-dodge'}).details.resolved,5);
 assert.equal(first.resources.classState.reactionUsed,undefined,'prior state untouched');
});
test('Uncanny Dodge eligibility and Incapacitated restriction are enforced',()=>{
 assert.throws(()=>M.resolveIncomingDamage(sample('Rogue',4),10,'Fire',{defense:'uncanny-dodge'}),/level 5/);
 assert.throws(()=>M.resolveIncomingDamage(sample('Monk',10),10,'Fire',{defense:'uncanny-dodge'}),/Rogue level 5/);
 const s=sample('Rogue',7);s.resources.conditions=['Stunned'];
 assert.throws(()=>M.resolveIncomingDamage(s,10,'Fire',{defense:'uncanny-dodge'}),/Incapacitated/);
});
test('Evasion on a qualifying Dexterity saving throw: success prevents all damage, failure halves it',()=>{
 for(const cls of ['Monk','Rogue']){
  const s=sample(cls,7);
  assert.equal(M.resolveIncomingDamage(s,23,'Fire',{defense:'evasion-success'}).details.resolved,0);
  assert.equal(M.resolveIncomingDamage(s,23,'Fire',{defense:'evasion-fail'}).details.resolved,11);
  assert.equal(M.resolveIncomingDamage(s,23,'Fire',{defense:'evasion-fail',resistant:true}).details.resolved,5);
  assert.equal(M.resolveIncomingDamage(s,23,'Fire',{defense:'evasion-success'}).state.resources.hp,60);
 }
 assert.throws(()=>M.resolveIncomingDamage(sample('Monk',6),23,'Fire',{defense:'evasion-success'}),/level 7/);
 assert.throws(()=>M.resolveIncomingDamage(sample('Fighter',15),23,'Fire',{defense:'evasion-fail'}),/Rogue or Monk/);
});
test('Monk Deflect Attacks reduces qualifying attack damage by d10 + DEX + Monk level and costs a Reaction',()=>{
 let s=sample('Monk',3),hit=M.resolveIncomingDamage(s,22,'Slashing',{defense:'deflect-attacks',deflectDie:6});
 assert.equal(hit.details.deflectReduction,12,'6+DEX 3+level 3');
 assert.equal(hit.details.resolved,10);
 assert.equal(hit.state.resources.classState.reactionUsed,true);
 assert.throws(()=>M.resolveIncomingDamage(hit.state,22,'Slashing',{defense:'deflect-attacks',deflectDie:6}),/Reaction already used/);
 s=M.resetReaction(hit.state);
 assert.equal(M.resolveIncomingDamage(s,8,'Bludgeoning',{defense:'deflect-attacks',deflectDie:10}).details.resolved,0);
 assert.throws(()=>M.resolveIncomingDamage(sample('Monk',2),22,'Slashing',{defense:'deflect-attacks',deflectDie:6}),/level 3/);
 assert.throws(()=>M.resolveIncomingDamage(sample('Monk',3),22,'Fire',{defense:'deflect-attacks',deflectDie:6}),/Bludgeoning/);
 assert.throws(()=>M.resolveIncomingDamage(sample('Monk',3),22,'Slashing',{defense:'deflect-attacks',deflectDie:11}),/Roll a d10/);
});
test('reaction status survives JSON and resource migration without damaging old characters',()=>{
 const s=sample('Rogue',10),after=M.resolveIncomingDamage(s,18,'Fire',{defense:'uncanny-dodge'}).state;
 assert.deepEqual(JSON.parse(JSON.stringify(after.resources.classState)),{reactionUsed:true});
 assert.equal(S.clone(after).resources.classState.reactionUsed,true);
 assert.notEqual(after.resources.hp,s.resources.hp);
});
