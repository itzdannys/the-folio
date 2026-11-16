'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
require('../js/data.js');require('../js/inventory.js');require('../js/core.js');
const M=require('../js/class-mechanics.js');
function fresh(sub='Oath of Devotion',n=15){
 const c={templateKind:'starter',className:'Paladin',subclass:sub,level:n,scores:{str:16,dex:12,con:14,int:10,wis:10,cha:18},profSaves:['wis','cha'],build:{characterClass:'Paladin',subclass:sub,slotMax:[4,3,3,2,1]}};
 return {character:c,inventory:{items:[]},resources:{hp:40,maxHp:80,tempHp:0,conditions:[],classResources:M.normalizeResources(c),classState:{},spellSlots:[4,3,3,2,1]}};
}
const attack={hit:true,eligibleMelee:true,critical:false};
const fixed=side=>side===8?4:10;
test('tracking is opt-in and reset does not erase persistent resources or vow',()=>{
 const s=fresh('Oath of Vengeance',15);
 assert.equal(s.resources.classState.paladinTurnTracking,undefined);
 const a=M.usePaladinTouch(s,5),b=M.usePaladinTouch(a,5);
 assert.equal(b.resources.hp,50); // Free exploration bookkeeping remains backward compatible.
 const started=M.paladinNewTurn(b);
 assert.equal(started.resources.classState.paladinTurnTracking,true);
 assert.equal(started.resources.classState.paladinBonusActionUsed,false);
 const touched=M.usePaladinTouch(started,5);
 assert.equal(touched.resources.classState.paladinBonusActionUsed,true);
 assert.throws(()=>M.usePaladinTouch(touched,5),/Bonus Action/);
 assert.equal(touched.resources.classResources['lay-on-hands'],60);
 const reset=M.paladinNewTurn(touched);
 assert.equal(reset.resources.classResources['lay-on-hands'],60);
 assert.equal(reset.resources.classState.paladinBonusActionUsed,false);
 assert.equal(M.usePaladinTouch(reset,5).resources.hp,60);
});
test('Divine Sense spends bonus; Abjure Foes spends action and cannot consume an already-used action',()=>{
 const start=M.paladinNewTurn(fresh('Oath of the Ancients',11));
 const sense=M.activateDivineSense(start);
 assert.equal(sense.resources.classState.paladinBonusActionUsed,true);
 assert.throws(()=>M.usePaladinTouch(sense,1),/Bonus Action/);
 const after=M.abjureFoes(sense,[{name:'Wight',visibleWithin60:true,wisdomSaveTotal:9}]);
 assert.equal(after.resources.classState.paladinActionUsed,true);
 assert.throws(()=>M.abjureFoes(after,[{name:'Ghoul',visibleWithin60:true,wisdomSaveTotal:9}]),/Action/);
 assert.equal(after.resources.classResources['channel-divinity'],1);
});
test('Nature’s Wrath uses Magic action; Peerless Athlete and capstones use bonus',()=>{
 const a=M.paladinNewTurn(fresh('Oath of the Ancients',9));
 const wrath=M.naturesWrath(a,2);
 assert.equal(wrath.resources.classState.paladinActionUsed,true);
 assert.throws(()=>M.abjureFoes(wrath,[{name:'Ghoul',visibleWithin60:true,wisdomSaveTotal:8}]),/Action/);
 const g=M.paladinNewTurn(fresh('Oath of Glory',20));
 const athlete=M.activatePeerlessAthlete(g);
 assert.throws(()=>M.oathCapstone(athlete),/Bonus Action/);
 const legend=M.oathCapstone(M.paladinNewTurn(athlete));
 assert.equal(legend.resources.classState.paladinBonusActionUsed,true);
});
test('Free Divine Smite claims bonus without a spell slot; another bonus action is blocked',()=>{
 const s=M.paladinNewTurn(fresh());
 const result=M.resolvePaladinSmite(s,attack,{cost:'free'},fixed);
 assert.equal(result.applied,true);
 assert.equal(result.resources.classState.paladinBonusActionUsed,true);
 assert.equal(result.resources.classState.paladinSpellSlotUsed,false);
 assert.equal(result.resources.classResources['divine-smite-free'],0);
 assert.throws(()=>M.resolvePaladinSmite({...s,resources:result.resources},attack,{cost:'slot1'},fixed),/Bonus Action/);
});
test('Action spell slot followed by slot Smite is blocked; free Smite allowed',()=>{
 const s=M.paladinNewTurn(fresh());
 const after=M.recordPaladinSpellCast(s,{time:'Action'},'slot1');
 assert.equal(after.resources.classState.paladinSpellSlotUsed,true);
 assert.equal(after.resources.classState.paladinActionUsed,true);
 assert.throws(()=>M.resolvePaladinSmite(after,attack,{cost:'slot1'},fixed),/only one spell slot/);
 const free=M.resolvePaladinSmite(after,attack,{cost:'free'},fixed);
 assert.equal(free.resources.classState.paladinBonusActionUsed,true);
 assert.equal(free.resources.classState.paladinSpellSlotUsed,true);
});
test('Recognized spell casting times claim the appropriate Action, Bonus Action, Reaction',()=>{
 const s=M.paladinNewTurn(fresh());
 const a=M.recordPaladinSpellCast(s,{time:'1 Action'},'slot1');
 assert.throws(()=>M.recordPaladinSpellCast(a,{time:'Action'},'slot2'),/Action/);
 assert.throws(()=>M.recordPaladinSpellCast(a,{time:'Bonus Action'},'slot2'),/one spell slot/);
 const b=M.recordPaladinSpellCast(a,{time:'Bonus Action'},'cantrip');
 assert.equal(b.resources.classState.paladinBonusActionUsed,true);
 assert.throws(()=>M.recordPaladinSpellCast(b,{time:'Bonus Action'},'cantrip'),/Bonus Action/);
 const reaction=M.recordPaladinSpellCast(b,{time:'Reaction'},'slot2');
 assert.equal(reaction.resources.classState.reactionUsed,true);
 assert.throws(()=>M.recordPaladinSpellCast(reaction,{time:'Reaction'},'slot2'),/Reaction/);
});
test('Paladin Vengeance Hunter’s Mark shares Bonus Action and spell-slot limit',()=>{
 const s=M.paladinNewTurn(fresh('Oath of Vengeance',9));
 const mark=M.castHuntersMark(s,'slot',1,'Wight');
 assert.equal(mark.resources.classState.paladinBonusActionUsed,true);
 assert.equal(mark.resources.classState.paladinSpellSlotUsed,true);
 assert.equal(mark.resources.spellSlots[0],3);
 assert.throws(()=>M.castHuntersMark(mark,'slot',1,'Ghoul'),/Bonus Action/);
 assert.equal(M.castHuntersMark(fresh('Oath of Vengeance',9),'slot',1,'Wight').resources.classState.paladinBonusActionUsed,undefined);
});
test('Countercheck: wrong class and inactive turn never gain a tracking flag',()=>{
 const s=fresh();s.character.build.characterClass='Cleric';
 assert.throws(()=>M.paladinNewTurn(s),/requires a Paladin/);
 assert.equal(M.recordPaladinSpellCast(s,{time:'Bonus Action'},'slot1'),s);
});
test('Turn flags persist in JSON without mutating original and reset on next turn',()=>{
 const s=fresh(),tracked=M.paladinNewTurn(s),cast=M.recordPaladinSpellCast(tracked,{time:'Bonus Action'},'slot1');
 const restored=JSON.parse(JSON.stringify(cast));
 assert.equal(restored.resources.classState.paladinSpellSlotUsed,true);
 assert.equal(restored.resources.classState.paladinBonusActionUsed,true);
 const reset=M.paladinNewTurn(restored);
 assert.equal(reset.resources.classState.paladinSpellSlotUsed,false);
 assert.equal(reset.resources.classState.paladinBonusActionUsed,false);
 assert.equal(s.resources.classState.paladinTurnTracking,undefined);
});
test('Attack-action oath abilities do not consume a second action but reject spent Action',()=>{
 const first=M.paladinNewTurn(fresh('Oath of Vengeance',9));
 const vow=M.vowOfEnmity(first,'Wight');
 assert.equal(vow.resources.classState.paladinActionUsed,true); // Attack action claimed; its attacks remain available.
 const cast=M.recordPaladinSpellCast(first,{time:'Action'},'slot1');
 assert.throws(()=>M.vowOfEnmity(cast,'Wight'),/Attack action/);
 const devotion=M.paladinNewTurn(fresh('Oath of Devotion',9));
 devotion.inventory.items.push({id:'blade',name:'Longsword',category:'weapon',quantity:1,equipped:true,weapon:{kind:'Melee'}});
 assert.equal(M.activateSacredWeapon(devotion,'blade').resources.classState.paladinActionUsed,true);
 const spent=M.recordPaladinSpellCast(devotion,{time:'Action'},'slot1');
 assert.throws(()=>M.activateSacredWeapon(spent,'blade'),/Attack action/);
});
test('Incapacitation prevents tracked Paladin Bonus Action even with available resources',()=>{
 const s=M.paladinNewTurn(fresh());s.resources.conditions=['Stunned'];
 assert.throws(()=>M.usePaladinTouch(s,5),/Incapacitated/);
 assert.throws(()=>M.recordPaladinSpellCast(s,{time:'Action'},'slot1'),/Incapacitated/);
 assert.equal(s.resources.classResources['lay-on-hands'],75);
});
test('Initiative start of the Paladin turn resets budget only once per round',()=>{
 const state=M.paladinNewTurn(fresh());state.encounter={active:true,round:2,currentId:'hero',roster:[{id:'hero',isPip:true}]};
 const cast=M.recordPaladinSpellCast(state,{time:'Action'},'slot1');
 const refreshed=M.paladinStartTurn(cast);
 assert.equal(refreshed.resources.classState.paladinActionUsed,false);
 assert.equal(refreshed.resources.classState.paladinSpellSlotUsed,false);
 assert.equal(refreshed.resources.classState.paladinTurnKey,'2:hero');
 const again=M.recordPaladinSpellCast(refreshed,{time:'Action'},'slot1');
 const blockedReset=M.paladinStartTurn(again);
 assert.equal(blockedReset.resources.classState.paladinActionUsed,true);
 const next={...again,encounter:{...again.encounter,round:3}};
 assert.equal(M.paladinStartTurn(next).resources.classState.paladinActionUsed,false);
});
