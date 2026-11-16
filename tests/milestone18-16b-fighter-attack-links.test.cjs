'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
require('../js/inventory.js');require('../js/core.js');require('../js/data.js');require('../js/dice.js');require('../js/weapon-catalog.js');
const M=require('../js/class-mechanics.js'),F=require('../js/fighter-2024.js'),W=require('../js/weapon-rules.js'),I=require('../js/inventory.js'),Storage=require('../js/storage.js');
function fighter(lv=3,sub='Battle Master') {return {templateKind:'starter',className:'Fighter',level:lv,scores:{str:16,dex:14,int:16,con:14,wis:10,cha:10},build:{characterClass:'Fighter',subclass:sub,grantedFeatNames:[]}};}
function init(lv=3,sub='Battle Master',maneuvers=['Trip Attack']){
 const c=fighter(lv,sub);
 const w=I.gear('sword','Longsword','weapon',1,'',{equipped:true,weapon:{kind:'Melee',category:'Martial',damage:'1d8',type:'Slashing',propertyList:['Versatile'],properties:'Versatile',mastery:'Sap',mastered:true,ability:'str',grip:1}});
 const state={character:c,resources:{hp:35,maxHp:60,classResources:M.normalizeResources(c),classState:{},conditions:[],spellSlots:[]},inventory:{items:[w]}};
 return sub==='Battle Master'?F.manageManeuvers(state,maneuvers):state;
}
function strike(s,nat=12,opts={},roller=n=>n===20?nat:4){return W.attack(s.character,s.inventory,'sword','melee','normal',opts.targetAC===undefined?15:opts.targetAC,roller,s.resources,null,null,null,null,null,null,{attackRole:opts.role||'attack',targetName:opts.target||'Ogre',opportunityConfirmed:true,maneuver:opts.maneuver||'',useRelentless:!!opts.relentless,psiStrike:!!opts.psi,within30:!!opts.within30});}
test('Hit maneuver rolls and spends in the same weapon transaction, not an unrelated preview',()=>{
 const s=init(),q=strike(s,13,{maneuver:'Trip Attack'});
 a.equal(q.result.hit,true);a.equal(q.result.damage,11);a.equal(q.result.damageComponents[0].amount,11);
 a.equal(q.result.fighter.attackPower.maneuver.damage,4);a.equal(q.result.fighter.attackPower.maneuver.saveDC,13);
 a.equal(q.resources.classResources['superiority-dice'],3);a.equal(s.resources.classResources['superiority-dice'],4);
 a.equal(q.resources.lastClassEffect.target,'Ogre');a.match(q.result.message,/Trip Attack/);
});
test('Miss does not consume a maneuver die or award the hit effect',()=>{
 const s=init(),q=strike(s,3,{maneuver:'Trip Attack'});
 a.equal(q.result.hit,false);a.equal(q.result.fighter.attackPower,null);
 a.equal(q.resources.classResources['superiority-dice'],4);a.equal(q.result.damage,0);
});
test('A critical hit doubles the maneuver damage die, but costs one use',()=>{
 const s=init(),q=strike(s,20,{maneuver:'Trip Attack'});
 a.equal(q.result.critical,true);a.deepEqual(q.result.fighter.attackPower.maneuver.rolls,[4,4]);
 a.equal(q.result.damage,19); // 2d8 weapon +3 ability +2d8 maneuver
 a.equal(q.resources.classResources['superiority-dice'],3);
});
test('Damage and resource state remain unchanged when no Fighter attack power is selected',()=>{
 const s=init(),q=strike(s,12);
 a.equal(q.result.damage,7);a.equal(q.result.fighter.attackPower,null);
 a.equal(q.resources.classResources['superiority-dice'],4);
});
test('Hit maneuver requires AC, a named target and a learned option',()=>{
 const s=init();a.throws(()=>strike(s,12,{maneuver:'Trip Attack',targetAC:null}),/target AC/);
 a.throws(()=>W.attack(s.character,s.inventory,'sword','melee','normal',15,()=>12,s.resources,null,null,null,null,null,null,{maneuver:'Trip Attack',targetName:''}),/Name the confirmed target/);
 a.throws(()=>strike(s,12,{maneuver:'Menacing Attack'}),/Learn the maneuver/);
});
test('No Superiority Dice means no maneuver and no partial character mutation',()=>{
 let s=init();s={...s,resources:{...s.resources,classResources:{...s.resources.classResources,'superiority-dice':0}}};
 a.throws(()=>strike(s,14,{maneuver:'Trip Attack'}),/No Superiority Dice/);
 a.equal(s.resources.classResources['superiority-dice'],0);
});
test('Relentless at 15 spends no die, uses d8, and is limited once per tracked turn',()=>{
 let s=F.newTurn(init(15)),q=strike(s,16,{maneuver:'Trip Attack',relentless:true});
 a.equal(q.result.fighter.attackPower.maneuver.dieSize,8);a.equal(q.resources.classResources['superiority-dice'],6);
 s={...s,resources:q.resources};a.throws(()=>strike(s,16,{maneuver:'Trip Attack',relentless:true}),/Relentless is available once/);
 s=F.newTurn(s);a.equal(strike(s,16,{maneuver:'Trip Attack',relentless:true}).resources.classResources['superiority-dice'],6);
});
test('Relentless cannot apply before level 15 or without a chosen maneuver',()=>{
 a.throws(()=>strike(init(14),15,{maneuver:'Trip Attack',relentless:true}),/once per turn from level 15/);
 a.throws(()=>strike(init(15),15,{relentless:true}),/Relentless needs/);
});
test('Psionic Strike adds separate Force damage after an eligible hit',()=>{
 const s=F.newTurn(init(7,'Psi Warrior')),q=strike(s,13,{psi:true,within30:true});
 a.equal(q.result.hit,true);a.equal(q.result.damage,14); // weapon 4+3 and force 4+3
 a.equal(q.result.damageComponents[0].amount,7);a.deepEqual(q.result.damageComponents[1],{type:'Force',amount:7});
 a.equal(q.resources.classResources['psionic-energy'],5);a.equal(q.result.fighter.attackPower.psionic.saveDC,14);
});
test('Psionic Strike is unspent on a miss and does not double its separate die on critical',()=>{
 const s=F.newTurn(init(7,'Psi Warrior'));
 const miss=strike(s,1,{psi:true,within30:true});a.equal(miss.result.hit,false);a.equal(miss.resources.classResources['psionic-energy'],6);
 const critical=strike(s,20,{psi:true,within30:true});a.equal(critical.result.critical,true);
 a.equal(critical.result.fighter.attackPower.psionic.roll,4);a.equal(critical.result.fighter.attackPower.psionic.damage,7);
});
test('Psionic Strike cannot spend twice in a turn, or on an Opportunity Attack',()=>{
 let s=F.newTurn(init(7,'Psi Warrior'));
 const q=strike(s,16,{psi:true,within30:true});s={...s,resources:q.resources};
 a.throws(()=>strike(s,16,{psi:true,within30:true}),/once per turn/);
 a.throws(()=>strike(init(7,'Psi Warrior'),16,{psi:true,within30:true,role:'opportunity'}),/own turn/);
 s=F.newTurn(s);a.equal(strike(s,16,{psi:true,within30:true}).resources.classResources['psionic-energy'],4);
});
test('Psionic Strike requires within 30 feet and an available Psionic Energy Die',()=>{
 let s=init(7,'Psi Warrior');a.throws(()=>strike(s,15,{psi:true}),/within 30/);
 s={...s,resources:{...s.resources,classResources:{...s.resources.classResources,'psionic-energy':0}}};
 a.throws(()=>strike(s,15,{psi:true,within30:true}),/No Psionic Energy Dice/);
});
test('Fighter hit maneuvers and Psi Warrior strike do not apply to wrong Fighter subclass',()=>{
 a.throws(()=>strike(init(7,'Champion'),15,{maneuver:'Trip Attack'}),/Battle Master/);
 a.throws(()=>strike(init(7,'Champion'),15,{psi:true,within30:true}),/Psi Warrior/);
});
test('Existing save cloning preserves spent resources and attack-effect details',()=>{
 const s=init(),q=strike(s,13,{maneuver:'Trip Attack'});
 const snapshot=Storage.clone({...s,resources:q.resources,inventory:q.inventory});
 a.equal(snapshot.resources.classResources['superiority-dice'],3);
 a.equal(snapshot.resources.lastClassEffect.maneuver.name,'Trip Attack');
});
