'use strict';
const {test}=require('node:test');
const a=require('node:assert/strict');
require('../js/inventory.js');require('../js/core.js');require('../js/data.js');require('../js/dice.js');require('../js/weapon-catalog.js');require('../js/spell-catalog.js');require('../js/spell-expansions.js');
const M=require('../js/class-mechanics.js'),FR=require('../js/rules-engine.js'),F=require('../js/fighter-2024.js'),WR=require('../js/weapon-rules.js'),I=require('../js/inventory.js'),S=require('../js/storage.js');
const wizardCantrip='srd-2024_fire-bolt',wizardSpell='srd-2024_magic-missile';
function fighter(n=7,sub='Battle Master'){
 return {templateKind:'starter',className:'Fighter',level:n,scores:{str:16,dex:14,int:16,con:14,wis:12,cha:10},speed:30,build:{characterClass:'Fighter',subclass:sub,grantedFeatNames:[],slotMax:[4,3,2,0,0,0,0,0,0]}};
}
function state(n=7,sub='Battle Master',maneuvers=['Trip Attack']){
 let c=fighter(n,sub),w=I.gear('sword','Longsword','weapon',1,'',{equipped:true,weapon:{kind:'Melee',category:'Martial',damage:'1d8',type:'Slashing',propertyList:['Versatile'],properties:'Versatile',mastery:'Sap',mastered:true,ability:'str',grip:1}});
 let s={character:c,resources:{hp:35,maxHp:60,classResources:M.normalizeResources(c),classState:{},conditions:[],concentration:'',spellSlots:[4,3,2,0,0,0,0,0,0]},inventory:{items:[w]},spellbook:{catalogSelections:[wizardCantrip,wizardSpell],castLog:[],custom:[],catalogSnapshots:{}}};
 return sub==='Battle Master'?F.manageManeuvers(s,maneuvers):s;
}
function hit(s,nat=12,o={},die=()=>4){return WR.attack(s.character,s.inventory,'sword','melee','normal',o.targetAC??15,n=>n===20?nat:die(n),s.resources,null,null,null,null,null,null,{attackRole:o.role||'attack',targetName:o.target||'Orc',opportunityConfirmed:true,riposteConfirmed:!!o.riposteConfirmed,precision:!!o.precision,maneuver:o.maneuver||'',useRelentless:!!o.useRelentless,secondaryName:o.second||'',secondaryAC:o.secondaryAC??null,secondaryWithinReach:!!o.secondaryWithinReach,lungeConfirmed:!!o.lungeConfirmed});}
test('Precision Attack changes a missed attack using its die and spends exactly one die',()=>{
 const s=state(5,'Battle Master',['Precision Attack']),q=hit(s,5,{precision:true},()=>5);
 a.equal(q.result.hit,true);a.equal(q.result.fighter.precision.bonus,5);a.equal(q.resources.classResources['superiority-dice'],3);
 a.equal(q.result.damage,8);
});
test('Precision Attack still spends on an unsuccessful correction and never saves a natural one',()=>{
 const s=state(5,'Battle Master',['Precision Attack']);
 const q=hit(s,4,{precision:true,targetAC:30},()=>3);a.equal(q.result.hit,false);a.equal(q.resources.classResources['superiority-dice'],3);
 const nat1=hit(s,1,{precision:true},()=>4);a.equal(nat1.result.hit,false);a.equal(nat1.resources.classResources['superiority-dice'],4);
});
test('Precision and on-hit maneuvers cannot stack; unlearned Precision rejected',()=>{
 const s=state(5,'Battle Master',['Precision Attack','Trip Attack']);
 a.throws(()=>hit(s,6,{precision:true,maneuver:'Trip Attack'}),/Only one Battle Master maneuver/);
 a.throws(()=>hit(state(5),6,{precision:true}),/must be learned/);
});
test('Relentless Precision adds a free d8 once, not a spent Superiority Die',()=>{
 let s=F.newTurn(state(15,'Battle Master',['Precision Attack'])),q=hit(s,5,{precision:true,useRelentless:true},()=>7);
 a.equal(q.result.fighter.precision.bonus,7);a.equal(q.resources.classResources['superiority-dice'],6);
 a.equal(q.resources.classState.fighterRelentlessUsed,true);
});
test('Riposte consumes Reaction and Superiority Die on miss, adds die damage on hit',()=>{
 let s=F.newTurn(state(7,'Battle Master',['Riposte']));
 const missed=hit(s,2,{role:'riposte',riposteConfirmed:true});a.equal(missed.result.hit,false);a.equal(missed.result.fighter.riposte.damage,0);
 a.equal(missed.resources.classResources['superiority-dice'],4); // level 7 = 5 to start
 a.equal(missed.resources.classState.reactionUsed,true);
 a.throws(()=>hit({...s,resources:missed.resources},15,{role:'riposte',riposteConfirmed:true}),/Reaction already used/);
 s=F.newTurn(state(7,'Battle Master',['Riposte']));const landed=hit(s,15,{role:'riposte',riposteConfirmed:true});
 a.equal(landed.result.fighter.riposte.damage,4);a.equal(landed.result.damage,11);
});
test('Riposte without trigger or known maneuver is rejected before rolling',()=>{
 const s=state(5,'Battle Master',['Riposte']);a.throws(()=>hit(s,15,{role:'riposte'}),/Confirm the enemy missed/);
 a.throws(()=>hit(state(5),15,{role:'riposte',riposteConfirmed:true}),/Learn Riposte/);
});
test('Sweeping Attack spends die on original hit but only damages adjacent second creature when eligible',()=>{
 const s=state(7,'Battle Master',['Sweeping Attack']);
 const yes=hit(s,14,{maneuver:'Sweeping Attack',second:'Goblin',secondaryAC:15,secondaryWithinReach:true});
 a.equal(yes.result.hit,true);a.equal(yes.result.damage,7);a.equal(yes.result.fighter.attackPower.maneuver.secondaryDamage,4);
 a.equal(yes.result.fighter.attackPower.maneuver.secondaryHit,true);a.equal(yes.resources.classResources['superiority-dice'],4);
 const no=hit(s,12,{maneuver:'Sweeping Attack',second:'Knight',secondaryAC:28,secondaryWithinReach:true});
 a.equal(no.result.fighter.attackPower.maneuver.secondaryDamage,0);a.equal(no.resources.classResources['superiority-dice'],4);
 a.throws(()=>hit(s,15,{maneuver:'Sweeping Attack'}),/second target/);
});
test('Sweeping Attack critical does not double secondary damage die',()=>{
 const s=state(7,'Battle Master',['Sweeping Attack']);let q=hit(s,20,{maneuver:'Sweeping Attack',second:'Goblin',secondaryAC:19,secondaryWithinReach:true});
 a.equal(q.result.critical,true);a.equal(q.result.fighter.attackPower.maneuver.rolls.length,1);
 a.equal(q.result.fighter.attackPower.maneuver.secondaryDamage,4);
});
test('Feinting Attack spends Bonus Action and gives Advantage to next named attack with extra hit damage',()=>{
 let s=state(5,'Battle Master',['Feinting Attack']);s=F.newTurn(s);
 s=F.useManeuver(s,{maneuver:'Feinting Attack',target:'Orc',triggerConfirmed:true},()=>4);
 a.equal(s.resources.classState.fighterBonusActionUsed,true);a.equal(F.previewFeint(s.character,s.resources,'Orc'),true);
 const q=hit(s,14,{target:'Orc'},()=>4);a.equal(q.result.fighter.feintAdvantage,true);a.equal(q.result.fighter.followup[0].name,'Feinting Attack');a.equal(q.result.damage,11);
 a.equal(q.resources.classState.fighterFeintTarget,null);
});
test('Lunging Attack consumes Bonus Action and resolves after qualifying hit on turn',()=>{
 let s=F.newTurn(state(7,'Battle Master',['Lunging Attack']));s=F.useManeuver(s,{maneuver:'Lunging Attack',triggerConfirmed:true},()=>4);
 const q=hit(s,14,{lungeConfirmed:true});a.equal(q.result.damage,11);a.equal(q.result.fighter.followup[0].name,'Lunging Attack');
 a.equal(q.resources.classState.fighterLungeDie,0);
});
test('War Magic cantrip starts Attack action atomically and leaves one weapon attack at level 7',()=>{
 let s=F.newTurn(state(7,'Eldritch Knight'));
 s=F.castWizardSpell(s,{spellId:wizardCantrip,cost:'cantrip',warMagic:true});
 a.equal(s.resources.classState.fighterAttackRolls,1);a.equal(s.spellbook.castLog.at(-1).id,wizardCantrip);
 let q=hit(s,15);s={...s,resources:q.resources};a.equal(s.resources.classState.fighterAttackRolls,2);
 a.throws(()=>hit(s,15),/Extra Attack limit/);
});
test('Improved War Magic at level 18 replaces two attacks and expends one slot in same operation',()=>{
 let s=F.newTurn(state(18,'Eldritch Knight'));
 let cast=F.castWizardSpell(s,{spellId:wizardSpell,cost:'slot1',warMagic:true});
 a.equal(cast.resources.spellSlots[0],3);a.equal(cast.resources.classState.fighterAttackRolls,2);
 a.equal(cast.resources.lastClassEffect.attacksReplaced,2);a.equal(cast.spellbook.castLog.length,1);
 let q=hit(cast,15);a.equal(q.resources.classState.fighterAttackRolls,3);
 a.throws(()=>F.castWizardSpell(cast,{spellId:wizardSpell,cost:'slot4',warMagic:true}),/cannot be cast|not available|casting cost|Not enough remaining attacks/);
});
test('War Magic refusing illegal level, unavailable spell, or no attacks cannot spend spell slots',()=>{
 const lvl7=F.newTurn(state(7,'Eldritch Knight'));
 a.throws(()=>F.castWizardSpell(lvl7,{spellId:wizardSpell,cost:'slot1',warMagic:true}),/Improved War Magic/);
 a.equal(lvl7.resources.spellSlots[0],4);a.equal(lvl7.spellbook.castLog.length,0);
 let lvl18=F.newTurn(state(18,'Eldritch Knight'));
 let x=hit(lvl18,15);lvl18={...lvl18,resources:x.resources};x=hit(lvl18,15);lvl18={...lvl18,resources:x.resources};
 a.throws(()=>F.castWizardSpell(lvl18,{spellId:wizardSpell,cost:'slot1',warMagic:true}),/Not enough remaining attacks/);
 a.equal(lvl18.resources.spellSlots[0],4);
});
test('Eldritch Knight casting a normal Action spell prevents an Attack action that tracked turn',()=>{
 let s=F.newTurn(state(7,'Eldritch Knight'));
 s=F.castWizardSpell(s,{spellId:wizardCantrip,cost:'cantrip'});
 a.equal(s.resources.classState.fighterActionUsed,true);
 a.throws(()=>hit(s,14),/Action was spent/);
});
test('Eldritch Strike target expires and save Disadvantage is usable within the window',()=>{
 let s=F.newTurn(state(10,'Eldritch Knight'));s={...s,resources:hit(s,15,{target:'Orc'}).resources};
 let q=F.eldritchSpellSave(s,{target:'Orc',dieA:12,dieB:5,saveModifier:2});a.equal(q.resources.lastClassEffect.total,7);
 s={...s,resources:{...s.resources,classState:{...s.resources.classState,fighterTurnCount:5}}};
 a.throws(()=>F.eldritchSpellSave(s,{target:'Orc',dieA:12,dieB:5,saveModifier:2}),/next-turn expiration/);
});
test('Psi Warrior Telekinetic Movement free use recharges on Short Rest',()=>{
 let s=state(7,'Psi Warrior');s=F.psiAction(s,{action:'movement',target:'Barrel',within30:true,triggerConfirmed:true});
 a.equal(s.resources.classResources['telekinetic-movement'],0);
 a.equal(M.rest(s.character,s.resources.classResources,'short')['telekinetic-movement'],1);
});
test('Telekinetic Master bonus attack is tracked as Bonus Action with maintained concentration',()=>{
 let s=F.newTurn(state(18,'Psi Warrior'));s=F.psiAction(s,{action:'telekinesis',triggerConfirmed:true});
 a.equal(s.resources.concentration,'Telekinesis');a.equal(s.resources.classState.fighterActionUsed,true);
 let q=hit(s,14,{role:'psi-bonus'});a.equal(q.resources.classState.fighterBonusActionUsed,true);
 a.throws(()=>hit({...s,resources:q.resources},14,{role:'psi-bonus'}),/Telekinetic Master attack already/);
 a.throws(()=>hit({...s,resources:{...s.resources,concentration:''}},14,{role:'psi-bonus'}),/requires Telekinesis concentration/);
});
test('Psi-Powered Leap ends next turn and Bulwark expires after ten tracked turns',()=>{
 let s=F.newTurn(state(18,'Psi Warrior'));s=F.psiAction(s,{action:'leap',triggerConfirmed:true});
 a.equal(s.resources.classState.psiLeapActive,true);s=F.newTurn(s);a.equal(s.resources.classState.psiLeapActive,false);
 s=F.psiAction(s,{action:'bulwark',within30:true,triggerConfirmed:true});a.equal(s.resources.classState.psiBulwarkRounds,10);
 for(let i=0;i<10;i++)s=F.newTurn(s);
 a.equal(s.resources.classState.psiBulwarkActive,false);a.equal(s.resources.classState.psiBulwarkRounds,0);
});
test('Snapshot clone preserves new Fighter selections without altering other character classes',()=>{
 let s=F.newTurn(state(18,'Eldritch Knight'));s=F.castWizardSpell(s,{spellId:wizardSpell,cost:'slot1',warMagic:true});
 let snapshot=S.clone(s);a.equal(snapshot.resources.spellSlots[0],3);a.equal(snapshot.spellbook.castLog.length,1);
 let pal=state(18,'Eldritch Knight');pal.character.className='Paladin';pal.character.build.characterClass='Paladin';
 a.throws(()=>F.castWizardSpell(pal,{spellId:wizardCantrip,cost:'cantrip'}),/Eldritch Knight/);
});
test('Student of War grants a Fighter skill and Artisan tool, persists on build and save/rebuild',()=>{
 let s=state(7,'Battle Master',["Commander's Strike"]);s.character.profSkills=[];s.character.tools=[];
 s=F.studentOfWar(s,{skill:'Perception',tool:"Smith's Tools"});
 a.equal(s.character.build.fighterStudentSkill,'Perception');a.ok(s.character.profSkills.includes('Perception'));
 a.ok(s.character.tools.includes("Smith's Tools"));
 const B=require('../js/builder.js');const clone=S.clone(s);
 let reb=B.applyToState(clone,{...clone.character.build,slotMax:clone.character.build.slotMax,skills:[],saves:['str','con'],options:[],ids:{}});
 a.equal(reb.character.build.fighterStudentTool,"Smith's Tools");a.ok(reb.character.profSkills.includes('Perception'));
 a.throws(()=>F.studentOfWar(s,{skill:'Arcana',tool:"Smith's Tools"}),/Fighter skill/);
});
test("Commander's Strike replaces one Attack action attack and spends a die even when ally misses",()=>{
 let s=F.newTurn(state(5,'Battle Master',["Commander's Strike"]));
 s=F.commandersStrike(s,{ally:'Rogue',reactionConfirmed:true,hitConfirmed:false});
 a.equal(s.resources.classState.fighterAttackRolls,1);
 a.equal(s.resources.classResources['superiority-dice'],3);
 a.equal(s.resources.lastClassEffect.damageBonus,0);
 let q=hit(s,14);a.equal(q.resources.classState.fighterAttackRolls,2);
 a.throws(()=>F.commandersStrike(s,{ally:'Rogue'}),/Confirm a willing ally/);
});
test('Relentless Commander Strike is free once per tracked turn with a d8 on confirmed ally hit',()=>{
 let s=F.newTurn(state(15,'Battle Master',["Commander's Strike"]));
 let q=F.commandersStrike(s,{ally:'Rogue',reactionConfirmed:true,hitConfirmed:true,useRelentless:true},()=>6);
 a.equal(q.resources.classResources['superiority-dice'],6);
 a.equal(q.resources.lastClassEffect.damageBonus,6);
 a.throws(()=>F.commandersStrike(q,{ally:'Rogue',reactionConfirmed:true,useRelentless:true}),/once per tracked turn/);
});
test('Evasive Footwork and self-directed Bait and Switch adjust AC and expire on next turn',()=>{
 let s=F.newTurn(state(7,'Battle Master',['Evasive Footwork','Bait and Switch']));s.character.profSaves=['str','con'];s.character.profSkills=[];
 let base=globalThis.PipCore.derived(s.character,s.inventory,s.resources).ac;
 s=F.useManeuver(s,{maneuver:'Evasive Footwork',triggerConfirmed:true},()=>4);
 a.equal(globalThis.PipCore.derived(s.character,s.inventory,s.resources).ac,base+4);
 // A second Bonus Action is not required by Bait and Switch; movement is confirmed at table.
 s=F.useManeuver(s,{maneuver:'Bait and Switch',target:'self',triggerConfirmed:true},()=>3);
 a.equal(globalThis.PipCore.derived(s.character,s.inventory,s.resources).ac,base+7);
 s=F.newTurn(s);a.equal(globalThis.PipCore.derived(s.character,s.inventory,s.resources).ac,base);
});
test('Rally on self records non-stacking temp HP; rest clears temporary maneuver effects',()=>{
 let s=state(5,'Battle Master',['Rally']);s.resources.tempHp=5;
 s=F.useManeuver(s,{maneuver:'Rally',target:'self',triggerConfirmed:true},()=>4);
 a.equal(s.resources.tempHp,6);a.equal(s.resources.lastClassEffect.bonus,6);
 const short=M.restClassState(s.character,{...s.resources.classState,fighterFeintDie:8,psiBulwarkActive:true},'short');
 a.equal(short.fighterFeintDie,0);a.equal(short.psiBulwarkActive,false);
});
test('Telekinetic Thrust records confirmed target save without mutating an external monster',()=>{
 let s=state(7,'Psi Warrior');const q=WR.attack(s.character,s.inventory,'sword','melee','normal',15,n=>n===20?16:4,s.resources,null,null,null,null,null,null,{attackRole:'attack',targetName:'Ogre',psiStrike:true,within30:true});
 s={...s,resources:q.resources};
 let t=F.telekineticThrust(s,{target:'Ogre',saveTotal:10,choice:'prone',triggerConfirmed:true});
 a.equal(t.resources.lastClassEffect.failed,true);a.equal(t.resources.lastClassEffect.applied,true);
 a.throws(()=>F.telekineticThrust(s,{target:'Different',saveTotal:10,triggerConfirmed:true}),/recent Psionic Strike/);
});
test('Psi Warrior Bulwark gives self Half Cover to AC and Dexterity saves only while active',()=>{
 let s=state(15,'Psi Warrior');s.character.profSaves=['str','con'];s.character.profSkills=[];
 let before=globalThis.PipCore.derived(s.character,s.inventory,s.resources);
 s=F.psiAction(s,{action:'bulwark',within30:true,triggerConfirmed:true});
 let after=globalThis.PipCore.derived(s.character,s.inventory,s.resources);
 a.equal(after.ac,before.ac+2);a.equal(after.saves.dex,before.saves.dex+2);
 s={...s,resources:{...s.resources,conditions:['Incapacitated']}};
 a.equal(globalThis.PipCore.derived(s.character,s.inventory,s.resources).ac,before.ac);
});
test('Psi Warrior Magic Action is prevented after a tracked weapon Attack action',()=>{
 let s=F.newTurn(state(7,'Psi Warrior'));s={...s,resources:hit(s,15).resources};
 a.throws(()=>F.psiAction(s,{action:'movement',target:'Barrel',within30:true,triggerConfirmed:true}),/Action has already been spent/);
});
