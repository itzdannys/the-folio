'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
require('../js/data.js');require('../js/core.js');require('../js/inventory.js');require('../js/dice.js');require('../js/weapon-catalog.js');require('../js/spell-catalog.js');require('../js/spell-expansions.js');require('../js/spell-supplements.js');
const B=require('../js/barbarian-2024.js'),M=require('../js/class-mechanics.js'),WR=require('../js/weapon-rules.js'),Build=require('../js/builder.js'),FR=require('../js/rules-engine.js'),S=require('../js/storage.js'),I=require('../js/inventory.js');
function state(n=3,sub='Berserker'){
 const c={templateKind:'starter',className:'Barbarian',subclass:sub,level:n,scores:{str:18,dex:14,con:16,int:12,wis:12,cha:10},profSaves:['str','con'],profSkills:[],speed:30,build:{characterClass:'Barbarian',subclass:sub,darkvisionFeet:0,grantedFeatNames:[]}};
 const axe=I.gear('axe','Greataxe','weapon',1,'',{equipped:true,weapon:{category:'Martial',kind:'Melee',damage:'1d12',type:'Slashing',properties:'Heavy, Two-Handed',propertyList:['Heavy','Two-Handed'],mastery:'Cleave',mastered:true,ability:'str',grip:2}});
 return {character:c,resources:{hp:52,maxHp:80,tempHp:0,conditions:[],classResources:M.normalizeResources(c),classState:{},concentration:'',spellSlots:[]},inventory:{items:[axe]},encounter:{active:false,round:1,roster:[],currentId:null}};
}
const die=n=>n===20?15:n===12?7:n===6?4:5;
const commit=(s,q)=>({...s,inventory:q.inventory,resources:q.resources||s.resources});
function attack(s,options={},targetAC=12,roll=die){return WR.attack(s.character,s.inventory,'axe','melee','normal',targetAC,roll,s.resources,null,null,null,options);}
function start(s,other={}){return B.startRage(s,{...(B.wild(s.character)?{animal:'Bear',...(s.character.level>=14?{power:'Ram'}:{})}:{}),...other});}
const withEncounter=s=>({...s,encounter:{active:true,round:1,roster:[{id:'player',isPip:true}],currentId:'player'}});

test('builder offers the four 2024 PHB Barbarian paths without duplicate legacy alternatives',()=>{
 const options=Build.optionList('subclass').filter(x=>x.classId==='class:barbarian');a.deepEqual(options.map(x=>x.name),['Berserker','Path of the Wild Heart','Path of the World Tree','Path of the Zealot']);a.equal(new Set(options.map(x=>x.id)).size,4);
});
test('Berserker remains backward-compatible with existing 18.10 implementations',()=>{const s=start(state(14));const q=attack(s,{reckless:true});a.equal(q.result.barbarian.frenzy,true);a.equal(q.result.barbarian2024.extraDamage,0);a.equal(q.resources.classState.recklessThisTurn,true);});
test('level-specific class resources for Zealot, world, Wild Heart and Berserker',()=>{
 for(const sub of ['Berserker','Path of the Wild Heart','Path of the World Tree','Path of the Zealot'])for(let n=1;n<=20;n++){const c=state(n,sub).character,rs=M.resourcesFor(c);a.ok(rs.some(x=>x.key==='rage'));a.equal(rs.find(x=>x.key==='rage').max,n<3?2:n<6?3:n<12?4:n<17?5:6);if(sub==='Path of the Zealot'&&n>=3)a.equal(rs.find(x=>x.key==='warrior-of-the-gods').max,n>=17?7:n>=12?6:n>=6?5:4);}
});
test('Wild Heart must choose animal and selects Power at level 14, consuming Rage only once',()=>{
 a.throws(()=>B.startRage(state(3,'Path of the Wild Heart')),/Choose Bear/);
 a.throws(()=>B.startRage(state(14,'Path of the Wild Heart'),{animal:'Bear'}),/Power/);
 const s=start(state(14,'Path of the Wild Heart'));a.equal(s.resources.classResources.rage,4);a.equal(s.resources.classState.wildRageAnimal,'Bear');a.equal(s.resources.classState.wildRagePower,'Ram');
});
test('Bear resistance is real for supported damage types and never double-counts existing Rage resistance',()=>{
 let s=start(state(6,'Path of the Wild Heart'));
 a.equal(M.resolveIncomingDamage(s,20,'Fire').details.resolved,10);
 a.equal(M.resolveIncomingDamage(s,20,'Bludgeoning').details.resolved,10);
 a.equal(M.resolveIncomingDamage(s,20,'Psychic').details.resolved,20);
 a.equal(M.resolveIncomingDamage(s,20,'Necrotic').details.resolved,20);
 a.equal(M.resolveIncomingDamage(s,20,'Force').details.resolved,20);
 a.equal(M.resolveIncomingDamage(s,20,'Radiant').details.resolved,20);
 s=B.startRage(s);a.equal(M.resolveIncomingDamage(s,20,'Fire').details.resolved,20);
});
test('Wild Eagle costs a Bonus Action but can Dash and Disengage',()=>{
 let s=B.newTurn(state(6,'Path of the Wild Heart'));s=start(s,{animal:'Eagle'});
 a.throws(()=>B.wildEagle(s),/Bonus Action/);
 s=B.newTurn(s);const used=B.wildEagle(s);a.equal(used.resources.lastClassEffect.dash,true);a.equal(used.resources.classState.barbarianBonusUsed,true);
});
test('Wild Heart aspect selection supports Owl Darkvision, Panther and Salmon; reselect does not stack',()=>{
 let s=state(6,'Path of the Wild Heart');a.throws(()=>B.wildAspect(s,'Owl'),/Long Rest/);
 s=B.wildAspect(s,'Owl',{longRestConfirmed:true});a.equal(s.character.darkvisionFeet,60);
 s=B.wildAspect(s,'Owl',{longRestConfirmed:true});a.equal(s.character.darkvisionFeet,60);
 s=B.wildAspect(s,'Panther',{longRestConfirmed:true});a.equal(s.character.darkvisionFeet,0);
 a.equal(s.resources.classState.wildAspect,'Panther');
});
test('Wild Heart ritual access offers only its level-appropriate granted rituals',()=>{
 a.deepEqual(FR.classGrantedSpellNames(state(2,'Path of the Wild Heart').character),[]);
 a.ok(FR.classGrantedSpellNames(state(3,'Path of the Wild Heart').character).includes('Beast Sense'));
 a.ok(FR.classGrantedSpellNames(state(10,'Path of the Wild Heart').character).includes('Commune with Nature'));
 a.equal(FR.preparationLimits(state(10,'Path of the Wild Heart').character).prepared,0);
});
test('World Tree grants vitality equal to level with no temp HP stacking',()=>{
 let s=state(9,'Path of the World Tree');s.resources.tempHp=3;s=start(s);a.equal(s.resources.tempHp,9);a.equal(s.resources.classResources.rage,3);
 s=B.startRage(s);a.equal(s.resources.classState.raging,false);
});
test('Life-Giving Force applies dice to another ally once per own turn and records but does not alter their sheet',()=>{
 let s=start(state(6,'Path of the World Tree'));s=B.newTurn(s);
 a.throws(()=>B.lifeGiving(s,{target:'Ally',within10:false},die),/within 10/);
 s=B.lifeGiving(s,{target:'Ally',within10:true},die);a.equal(s.resources.lastClassEffect.temporaryHitPoints,8);a.equal(s.resources.hp,52);
 a.throws(()=>B.lifeGiving(s,{target:'Ally',within10:true},die),/already used/);
 s=B.extendRage(s);s=B.newTurn(s);a.equal(B.lifeGiving(s,{target:'Ally',within10:true},die).resources.lastClassEffect.temporaryHitPoints,8);
});
test('Branches of Tree checks exact save DC and spends reaction on success and failure',()=>{
 let s=start(state(6,'Path of the World Tree'));s=B.newTurn(s);a.throws(()=>B.branches(s,{target:'Goblin'}),/Confirm/);
 let success=B.branches(s,{target:'Goblin',within30:true,visible:true,spaceConfirmed:true,strSave:25});a.equal(success.resources.lastClassEffect.teleported,false);a.equal(success.resources.classState.reactionUsed,true);
 a.throws(()=>B.branches(success,{target:'Goblin',within30:true,visible:true,spaceConfirmed:true,strSave:1}),/Reaction already/);
 let failed=B.branches(s,{target:'Goblin',within30:true,visible:true,spaceConfirmed:true,strSave:4,slow:true});a.equal(failed.resources.lastClassEffect.teleported,true);a.equal(failed.resources.lastClassEffect.speedZero,true);
});
test('World Tree Battering Roots attaches confirmed extra Push/Topple only to eligible hits',()=>{
 let s=start(state(10,'Path of the World Tree'));let q=attack(s,{rootMastery:'Push'});a.equal(q.result.barbarian2024.effect.mastery,'Push');
 q=attack(s,{},40);a.equal(q.result.hit,false);a.equal(q.result.barbarian2024.effect,null);
 a.throws(()=>attack(s,{rootMastery:'Invalid'}),/Battering Roots/);
});
test('World Tree teleport costs Bonus Action and once-per-Rage extended travel can carry six allies',()=>{
 let s=B.newTurn(state(14,'Path of the World Tree'));s=start(s);a.throws(()=>B.travel(s,{distance:150,long:true}),/Bonus Action/);
 s=B.newTurn(s);s=B.travel(s,{distance:60,allies:0});a.equal(s.resources.lastClassEffect.distance,60);
 s=commit(s,attack(s));s=B.newTurn(s);s=B.travel(s,{distance:140,allies:6,long:true});a.equal(s.resources.classState.worldLongTeleportUsed,true);
 s=commit(s,attack(s));s=B.newTurn(s);a.throws(()=>B.travel(s,{distance:60,long:true}),/once per Rage/);
});
test('Zealot Divine Fury is added on first confirmed own-turn hit, typed and not repeated',()=>{
 let s=start(state(3,'Path of the Zealot'));let q=attack(s,{divineType:'Necrotic'});a.equal(q.result.barbarian2024.extraDamage,5);a.equal(q.result.damageComponents.at(-1).type,'Necrotic');a.equal(q.result.damage,7+4+2+5);
 s=commit(s,q);q=attack(s);a.equal(q.result.barbarian2024.extraDamage,0);
 s=B.newTurn(s);q=attack(s,{},50);a.equal(q.result.barbarian2024.extraDamage,0);
});
test('Divine Fury crit doubles only die; half-level static damage stays undoubled',()=>{
 let s=start(state(12,'Path of the Zealot'));const q=attack(s,{divineType:'Radiant'},12,n=>n===20?20:n===12?4:n===6?4:4);a.equal(q.result.barbarian2024.extraDamage,14);a.equal(q.result.barbarian2024.damageType,'Radiant');
});
test('Warrior of the Gods heals only self and spends exact d12 pool and Bonus Action',()=>{
 let s=B.newTurn(state(6,'Path of the Zealot'));s=B.zealotHeal(s,{dice:2},die);a.equal(s.resources.classResources['warrior-of-the-gods'],3);a.equal(s.resources.hp,66);
 a.throws(()=>B.zealotHeal(s,{dice:1},die),/Bonus Action/);
 s=B.newTurn(s);a.throws(()=>B.zealotHeal(s,{dice:8},die),/Not enough/);
});
test('Fanatical Focus once per rage adds rage damage to failed save reroll',()=>{
 let s=start(state(6,'Path of the Zealot'));s=B.fanaticalFocus(s,{failedTotal:10,dc:15,reroll:12,modifier:1});a.equal(s.resources.lastClassEffect.total,15);
 a.throws(()=>B.fanaticalFocus(s,{failedTotal:5,dc:15,reroll:15,modifier:1}),/already used/);
 s=B.newTurn(s);a.throws(()=>B.fanaticalFocus(s,{failedTotal:5,dc:15,reroll:15,modifier:1}),/already used/);
});
test('Zealous Presence free use precedes Rage cost and restores on long rest',()=>{
 let s=B.newTurn(state(10,'Path of the Zealot'));s=B.zealousPresence(s,{targetCount:10,within60:true});a.equal(s.resources.classResources['zealous-presence'],0);
 s=B.newTurn(s);a.throws(()=>B.zealousPresence(s,{targetCount:1,within60:true}),/already used/);
 s=B.zealousPresence(s,{targetCount:1,within60:true,cost:'rage'});a.equal(s.resources.classResources.rage,3);
 const rested=M.rest(s.character,s.resources.classResources,'long');a.equal(rested['zealous-presence'],1);
});
test('Rage of the Gods form lasts one minute, grants resistances and Revivification consumes reaction plus Rage',()=>{
 let s=start(state(14,'Path of the Zealot'),{form:true});a.equal(s.resources.classResources['rage-of-the-gods'],0);a.equal(M.resolveIncomingDamage(s,16,'Psychic').details.resolved,8);
 s=B.newTurn(s);s=B.revive(s,{target:'Ally',within30:true,aboutToDrop:true});a.equal(s.resources.lastClassEffect.targetHp,14);a.equal(s.resources.classState.reactionUsed,true);a.equal(s.resources.classResources.rage,3);
 a.throws(()=>B.revive(s,{target:'Ally',within30:true,aboutToDrop:true}),/Reaction already/);
 for(let n=0;n<9;n++)s=B.newTurn(s);a.equal(s.resources.classState.zealotFormActive,false);
});
test('Rage extension and 2024 duration expire unless attack/save/Bonus Action extend',()=>{
 let s=start(state(6));s=B.newTurn(s);a.equal(s.resources.classState.raging,true);s=B.newTurn(s);a.equal(s.resources.classState.raging,false);
 s=start(s);let q=attack(s);s=commit(s,q);s=B.newTurn(s);a.equal(s.resources.classState.raging,true);
 s=B.extendRage(s);a.equal(s.resources.classState.barbarianRageRemaining,2);
});
test('Persistent Rage supports optional initiative recovery once per Long Rest',()=>{
 let s=state(15);s.resources.classResources.rage=1;
 a.throws(()=>B.initiativeRecovery(s),/Roll Initiative/);
 s=withEncounter(s);s=B.initiativeRecovery(s);a.equal(s.resources.classResources.rage,5);
 a.throws(()=>B.initiativeRecovery(s),/already used|No expended/);
 const recovered=B.restState(s.character,s.resources.classState,'long');a.equal(recovered.barbarianInitiativeRecoveryUsed,false);
});
test('Tracked Barbarian attack economy enforces two attacks from level 5, off-turn reaction and separate Light extra',()=>{
 let s=B.newTurn(state(6));let q=attack(s);s=commit(s,q);q=attack(s);s=commit(s,q);a.equal(s.resources.classState.barbarianAttackCount,2);
 a.throws(()=>attack(s),/No attacks remain/);
 q=attack(s,{attackRole:'opportunity',opportunityConfirmed:true});a.equal(q.resources.classState.reactionUsed,true);
 a.throws(()=>attack(commit(s,q),{attackRole:'opportunity',opportunityConfirmed:true}),/Reaction already/);
});
test('Rage bonus & defensive mechanics never leak into another class',()=>{
 let s=start(state(6,'Path of the Wild Heart'));const fighter={...s,character:{...s.character,className:'Fighter',build:{characterClass:'Fighter'}}};
 a.equal(M.resolveIncomingDamage(fighter,20,'Fire').details.resolved,20);
 a.throws(()=>B.newTurn(fighter),/Barbarian/);
});
test('Primal Knowledge skill grants one unique proficiency and persists in the character',()=>{
 let s=state(3);s=B.primalSkill(s,'Nature');a.ok(s.character.profSkills.includes('Nature'));a.equal(s.character.build.barbarianPrimalSkill,'Nature');
 s=B.primalSkill(s,'Nature');a.equal(s.character.profSkills.filter(x=>x==='Nature').length,1);
 s=B.primalSkill(s,'Athletics');a.ok(s.character.profSkills.includes('Athletics'));a.ok(!s.character.profSkills.includes('Nature'));
});
test('Danger Sense, Rage Strength saves and Indomitable Might are modeled correctly',()=>{
 let s=state(18);s.resources.classState.raging=true;
 let q=B.savingThrow(s,{ability:'dex',dc:15,rollA:3,rollB:18});a.equal(q.resources.lastClassEffect.total,20);
 q=B.savingThrow(s,{ability:'str',dc:15,rollA:1,rollB:1});a.equal(q.resources.lastClassEffect.total,18);a.equal(q.resources.lastClassEffect.indomitableMight,true);
});
test('short and long rests reset active Barbarian effects but retain selected Wild Aspect',()=>{
 let s=start(state(6,'Path of the Wild Heart'));s.resources.classState.wildAspect='Owl';const short=M.restClassState(s.character,s.resources.classState,'short');a.equal(short.raging,false);a.equal(short.wildAspect,'Owl');a.equal(short.barbarianTurnTracking,false);
 const long=M.restClassState(s.character,s.resources.classState,'long');a.equal(long.wildAspect,'Owl');a.equal(long.raging,false);
});
test('storage clone preserves subclass flags and resource pools without online dependency',()=>{
 let s=start(state(14,'Path of the Zealot'),{form:true});s=B.newTurn(s);
 const restored=S.clone(s);a.equal(restored.resources.classState.zealotFormActive,true);a.equal(restored.resources.classResources['warrior-of-the-gods'],6);
});

test('World Tree level 14 teleports on Rage activation using the SAME Bonus Action and honors once-per-Rage long travel',()=>{
 let s=B.newTurn(state(14,'Path of the World Tree'));
 s=B.startRage(s,{travelOnRage:true,travelDistance:140,travelAllies:3,travelLong:true,travelConfirmed:true});
 a.equal(s.resources.classState.barbarianBonusUsed,true);a.equal(s.resources.classState.worldLongTeleportUsed,true);a.equal(s.resources.lastClassEffect.travel.distance,140);a.equal(s.resources.lastClassEffect.travel.allies,3);
 a.equal(s.resources.lastClassEffect.instinctivePounce.mayMoveUpToHalfSpeed,true);
 a.throws(()=>B.travel(s,{distance:140,long:true}),/Bonus Action/);
 s=B.newTurn(s);a.throws(()=>B.travel(s,{distance:60,long:true}),/once per Rage/);
 a.throws(()=>B.startRage(state(14,'Path of the World Tree'),{travelOnRage:true,travelDistance:160,travelLong:true,travelConfirmed:true}),/Confirm/);
});
test('Wild Heart Eagle grants Dash and Disengage with the SAME Rage activation Bonus Action',()=>{
 const s=B.startRage(B.newTurn(state(7,'Path of the Wild Heart')),{animal:'Eagle'});
 a.equal(s.resources.lastClassEffect.eagleDashDisengage,true);a.equal(s.resources.lastClassEffect.instinctivePounce.mayMoveUpToHalfSpeed,true);
});
test('Barbarian Unarmed Strike resolves Rage bonus, Zealot Radiant damage and once-per-own-turn limit',()=>{
 let s=start(state(3,'Path of the Zealot'));
 s=B.unarmed(s,{kind:'damage',targetAC:12,divineType:'Necrotic'},die);
 a.equal(s.resources.lastClassEffect.hit,true);a.equal(s.resources.lastClassEffect.damage,12);
 a.deepEqual(s.resources.lastClassEffect.damageComponents,[{type:'Bludgeoning',amount:7},{type:'Necrotic',amount:5}]);
 s=B.unarmed(s,{kind:'damage',targetAC:12},die);
 a.equal(s.resources.lastClassEffect.damage,7);
});
test('Unarmed Grapple uses Strength based save DC, counts Attack action, forces enemy saving throw to extend Rage',()=>{
 let s=B.newTurn(start(state(5,'Path of the World Tree')));
 s=B.unarmed(s,{kind:'grapple',saveTotal:9,saveAbility:'str',sizeReachConfirmed:true},die);
 a.equal(s.resources.lastClassEffect.dc,8+4+3);a.equal(s.resources.lastClassEffect.failed,true);
 a.equal(s.resources.classState.barbarianAttackCount,1);a.equal(s.resources.classState.barbarianRageRemaining,2);
 a.throws(()=>B.unarmed(s,{kind:'grapple',saveTotal:9,sizeReachConfirmed:false},die),/Confirm/);
});
test('Unarmed Reckless Attack and Berserker Frenzy use the same once-per-turn bonus damage',()=>{
 let s=start(state(5,'Berserker'));
 s=B.unarmed(s,{kind:'damage',targetAC:12,reckless:true},die);
 a.equal(s.resources.lastClassEffect.frenzy,true);a.equal(s.resources.lastClassEffect.damage,7+2*4);
 s=B.unarmed(s,{kind:'damage',targetAC:12},die);a.equal(s.resources.lastClassEffect.frenzy,false);
});
test('Berserker Intimidating Presence shares the tracked Bonus Action budget',()=>{
 let s=B.newTurn(state(14,'Berserker'));
 s=B.intimidating(s,'free');a.equal(s.resources.classState.barbarianBonusUsed,true);
 a.throws(()=>B.intimidating(s,'free'),/Bonus Action/);
});
test('Wild Heart Aspect changes update actual mobility fields without stacking',()=>{
 let s=state(6,'Path of the Wild Heart');
 s=B.wildAspect(s,'Panther',{longRestConfirmed:true});a.equal(s.character.climbSpeed,30);
 s=B.wildAspect(s,'Salmon',{longRestConfirmed:true});a.equal(s.character.climbSpeed,null);a.equal(s.character.swimSpeed,30);
 s=B.wildAspect(s,'Owl',{longRestConfirmed:true});a.equal(s.character.swimSpeed,null);a.equal(s.character.darkvisionFeet,60);
});

test('Wild Heart Falcon flight requires no armor; Zealot flight follows divine form and expires',()=>{
 let s=start(state(14,'Path of the Wild Heart'),{power:'Falcon'});a.equal(s.resources.classState.barbarianFlySpeed,30);
 let t=state(14,'Path of the Wild Heart');t.inventory.items.push(I.gear('armor1','Leather Armor','armor',1,'',{equipped:true,armor:{kind:'light'}}));
 t=start(t,{power:'Falcon'});a.equal(t.resources.classState.barbarianFlySpeed,0);
 let z=start(state(14,'Path of the Zealot'),{form:true});a.equal(z.resources.classState.barbarianFlySpeed,30);
 for(let n=0;n<10;n++)z=B.newTurn(z);a.equal(z.resources.classState.barbarianFlySpeed,0);
});
