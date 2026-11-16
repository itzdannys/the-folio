'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const I=require('../js/inventory.js');
require('../js/core.js');require('../js/data.js');require('../js/dice.js');require('../js/weapon-catalog.js');
const M=require('../js/class-mechanics.js'),W=require('../js/weapon-rules.js'),S=require('../js/storage.js');
function setup(n=3,subclass='Champion'){
 const character={templateKind:'starter',className:'Fighter',subclass,level:n,scores:{str:16,dex:14,con:16,int:10,wis:10,cha:10},profSaves:['str','con'],profSkills:[],expertise:[],weapons:[],tools:[],speed:30,build:{characterClass:'Fighter',subclass}};
 const weapon=I.gear('sword','Longsword','weapon',1,'',{equipped:true,weapon:{category:'Martial',kind:'Melee',damage:'1d8',type:'Slashing',properties:'Versatile',propertyList:['Versatile'],ability:'str',grip:1}});
 const s={character,resources:{hp:22,maxHp:60,tempHp:0,heroicInspiration:false,conditions:[],classResources:M.normalizeResources(character),classState:{},spellSlots:[]},inventory:{items:[weapon]},encounter:{active:false,round:1,roster:[],currentId:null}};
 return s;
}
function atk(s,natural){return W.attack(s.character,s.inventory,'sword','melee','normal',40,side=>side===20?natural:4,s.resources);}
test('Champion improves critical threshold on weapon attacks from 3 and 15, never non-Champions',()=>{
 assert.equal(M.championCriticalThreshold(setup(1).character),20);
 assert.equal(M.championCriticalThreshold(setup(3).character),19);
 assert.equal(M.championCriticalThreshold(setup(15).character),18);
 assert.equal(M.championCriticalThreshold(setup(20,'Another').character),20);
 for(const [n,natural,crit] of [[3,19,true],[14,18,false],[15,18,true],[15,17,false]]){
  const result=atk(setup(n),natural).result;
  assert.equal(result.critical,crit,`level ${n} natural ${natural}`);
  assert.equal(result.hit,crit?true:false);
  assert.equal(result.damageRolls.length,crit?2:0);
 }
});
test('Action Surge grants extra non-Magic action and spends one use, max once per turn',()=>{
 let s=setup(17),once=M.fighterActionSurge(s);
 assert.equal(once.resources.classResources['action-surge'],1);
 assert.equal(once.resources.classState.actionSurgeThisTurn,true);
 assert.throws(()=>M.fighterActionSurge(once),/only once per turn/);
 assert.equal(M.rest(s.character,once.resources.classResources,'short')['action-surge'],2);
 assert.throws(()=>M.fighterActionSurge(setup(1)),/level 2/);
});
test('Indomitable rerolls failed saves using actual saving throw modifier plus Fighter level',()=>{
 const s=setup(9),a=M.useIndomitable(s,'wis',8,20,12);
 // WIS 10: +0, not proficient, plus level 9 = 21
 assert.equal(a.resources.lastClassEffect.finalTotal,21);
 assert.equal(a.resources.lastClassEffect.success,true);
 assert.equal(a.resources.classResources.indomitable,0);
 assert.equal(s.resources.classResources.indomitable,1);
 assert.throws(()=>M.useIndomitable(a,'wis',8,20,10),/No Indomitable uses/);
 assert.equal(M.rest(s.character,a.resources.classResources,'short').indomitable,0);
 assert.equal(M.rest(s.character,a.resources.classResources,'long').indomitable,1);
});
test('Indomitable must accept a failed reroll and cannot be applied on prior success',()=>{
 const s=setup(13),a=M.useIndomitable(s,'dex',3,40,1);
 assert.equal(a.resources.lastClassEffect.success,false);
 assert.equal(a.resources.lastClassEffect.finalTotal,16); // 1 + DEX 2 + level 13
 assert.equal(a.resources.classResources.indomitable,1);
 assert.throws(()=>M.useIndomitable(s,'dex',20,20,10),/failed saving throw/);
 assert.throws(()=>M.useIndomitable(s,'luck',3,20,10),/saving throw ability/);
});
test('Champion start-of-turn grants Heroic Inspiration at level 10 and heals only when bloodied at level 18',()=>{
 let s=setup(18);s.resources.hp=22;
 s.encounter={active:true,round:1,roster:[{id:'pip',isPip:true}],currentId:'pip'};
 const a=M.fighterStartTurn(s);
 assert.equal(a.resources.hp,30,'5 + CON 3 healed');
 assert.equal(a.resources.heroicInspiration,true);
 assert.equal(a.resources.lastClassEffect.feature,'Survivor · Heroic Rally');
 const repeat=M.fighterStartTurn(a);assert.deepEqual(repeat,a,'same turn cannot heal twice');
 const second=M.fighterStartTurn({...a,encounter:{...a.encounter,round:2},resources:{...a.resources,hp:24}});
 assert.equal(second.resources.hp,32);
 const healthy=M.fighterStartTurn({...a,encounter:{...a.encounter,round:3},resources:{...a.resources,hp:50}});
 assert.equal(healthy.resources.hp,50,'no healing above half max');
});
test('Fighter turn effects only apply when the player turn is active, including no Champion feature on generic Fighter',()=>{
 let s=setup(18);s.encounter={active:true,round:2,roster:[{id:'pip',isPip:true},{id:'npc',isPip:false}],currentId:'npc'};
 assert.equal(M.fighterStartTurn(s),s);
 s={...s,character:{...s.character,subclass:'Not Champion',build:{characterClass:'Fighter',subclass:'Not Champion'}}};
 const a=M.fighterStartTurn({...s,encounter:{...s.encounter,currentId:'pip'}});
 assert.equal(a.resources.hp,22);
 assert.equal(a.resources.heroicInspiration,false);
});
test('Fighter start turn re-enables Action Surge but not its spent rest pool',()=>{
 let s=setup(17),spent=M.fighterActionSurge(s);
 spent={...spent,encounter:{active:true,round:4,roster:[{id:'pip',isPip:true}],currentId:'pip'}};
 const next=M.fighterStartTurn(spent);
 assert.equal(next.resources.classState.actionSurgeThisTurn,false);
 assert.equal(next.resources.classResources['action-surge'],1);
 assert.equal(M.fighterActionSurge(next).resources.classResources['action-surge'],0);
});
test('Champion Defy Death rolls with Advantage and 18–20 restores 1 HP at level 18',()=>{
 const s=setup(18);s.resources.hp=0;
 const out=M.championDeathSave(s,4,18);
 assert.equal(out.resources.hp,1);
 assert.equal(out.resources.deathFailure,0);
 assert.equal(out.resources.lastClassEffect.chosen,18);
 const fail=M.championDeathSave(s,1,1);
 assert.equal(fail.resources.deathFailure,2);
 const pass=M.championDeathSave(s,8,12);
 assert.equal(pass.resources.deathSuccess,1);
 assert.throws(()=>M.championDeathSave(setup(15),20,20),/level 18/);
 assert.throws(()=>M.championDeathSave(setup(18),20,20),/0 HP/);
});
test('New Fighter state survives save-like copying with Champion turn and resource flags',()=>{
 let s=setup(18);s=M.fighterActionSurge(s);
 const copy=S.clone(s);
 assert.equal(copy.resources.classState.actionSurgeThisTurn,true);
 assert.equal(copy.resources.classResources['action-surge'],1);
 assert.equal(s.resources.classResources['action-surge'],1);
});
function buildChampion(level,extra={}){
 const B=require('../js/builder.js');
 return B.buildFromInput({name:'Champion Build',classId:'class:fighter',subclassId:'subclass:champion',speciesId:'species:human',backgroundId:'background:acolyte',level,scores:{str:16,dex:14,con:14,int:10,wis:10,cha:10},backgroundPlus:'wis',backgroundOne:'int',fightingStyleId:'feat:fighting-style-defense',championStyleId:'feat:archery',...extra});
}
test('Champion level 7 bonus Fighting Style is a separate selected, saved grant with active Archery and Defense',()=>{
 const B=require('../js/builder.js'),b=buildChampion(7);
 assert.equal(b.championStyleName,'Fighting Style: Archery');
 assert.ok(b.grantedFeatNames.includes('Fighting Style: Archery'));
 assert.ok(b.grantedFeatNames.includes('Fighting Style: Defense'));
 const s=B.applyToState(require('../js/library.js').startCharacter({name:'Champion Build'}).present,b);
 assert.ok(s.character.customFeatures.some(f=>f.id==='build-option-champion-style'));
 const bow=I.gear('bow','Longbow','weapon',1,'',{equipped:true,weapon:{category:'Martial',kind:'Ranged',damage:'1d8',type:'Piercing',properties:'Heavy',propertyList:['Heavy'],ability:'dex',grip:2}});
 const ranged=W.stats(s.character,bow,'ranged');
 assert.equal(ranged.attackBonus,2+3+2,'DEX + proficiency + Archery');
});
test('Champion second style must differ and deactivates when below level 7 or leaving Champion',()=>{
 const B=require('../js/builder.js');
 assert.throws(()=>buildChampion(7,{championStyleId:'feat:fighting-style-defense'}),/different Fighting Style/);
 assert.throws(()=>buildChampion(7,{championStyleId:'feat:alert'}),/Fighting Style feat/);
 const at7=buildChampion(7),down= B.buildFromInput({name:'Downlevel',classId:'class:fighter',subclassId:'subclass:champion',speciesId:'species:human',backgroundId:'background:acolyte',level:6,scores:{str:16,dex:14,con:14,int:10,wis:10,cha:10},backgroundPlus:'wis',backgroundOne:'int',fightingStyleId:'feat:fighting-style-defense'},[],at7);
 assert.equal(down.championStyleName,'');
 assert.equal(down.championStyleId,'feat:archery','preserve future-level selection');
 assert.ok(!down.grantedFeatNames.includes('Fighting Style: Archery'));
 const back= B.buildFromInput({name:'Backlevel',classId:'class:fighter',subclassId:'subclass:champion',speciesId:'species:human',backgroundId:'background:acolyte',level:7,scores:{str:16,dex:14,con:14,int:10,wis:10,cha:10},backgroundPlus:'wis',backgroundOne:'int',fightingStyleId:'feat:fighting-style-defense'},[],down);
 assert.equal(back.championStyleName,'Fighting Style: Archery');
});
