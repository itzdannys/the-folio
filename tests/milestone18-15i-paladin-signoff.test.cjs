'use strict';
const {test}=require('node:test'),A=require('node:assert/strict');
require('../js/data.js');const I=require('../js/inventory.js');require('../js/core.js');require('../js/dice.js');require('../js/weapon-catalog.js');
const M=require('../js/class-mechanics.js'),W=require('../js/weapon-rules.js'),P=require('../js/paladin-combat.js'),O=require('../js/origin-catalog.js');
function make(sub='Oath of Devotion',lvl=20,style=''){
 const c={templateKind:'starter',className:'Paladin',subclass:sub,level:lvl,scores:{str:16,dex:12,con:14,int:10,wis:10,cha:18},profSaves:['wis','cha'],build:{characterClass:'Paladin',subclass:sub,slotMax:[4,3,3,2,1],fightingStyleName:style?'Fighting Style: '+style:'',grantedFeatNames:style?['Fighting Style: '+style]:[]}};
 const sword=I.gear('sword','Longsword','weapon',1,'',{equipped:true,weapon:{category:'Martial',kind:'Melee',damage:'1d8',type:'Slashing',properties:'Versatile',propertyList:['Versatile'],ability:'str',grip:1}});
 return {character:c,inventory:{items:[sword]},resources:{hp:48,maxHp:100,tempHp:0,conditions:[],classState:{},classResources:M.normalizeResources(c),spellSlots:[4,3,3,2,1]},spellbook:{catalogSelections:[]}};
}
const roll=n=>n===20?14:n===10?1:1;
function attack(s,mode='melee',fn=roll){return W.attack(s.character,s.inventory,'sword',mode,'normal',14,fn,s.resources,null,null,null,null,null,{attackRole:'attack'});}
function elapsed(state,turns){let s=state;for(let i=0;i<turns;i++)s=M.paladinNewTurn(s);return s;}
test('all eleven latest Paladin Fighting Style choices are source-tracked without a 2014 duplicate',()=>{
 const names=['Archery','Blind Fighting','Defense','Dueling','Great Weapon Fighting','Interception','Protection','Thrown Weapon Fighting','Two-Weapon Fighting','Unarmed Fighting','Blessed Warrior'];
 for(const name of names){const entries=O.feats.filter(f=>f.name==='Fighting Style: '+name);A.equal(entries.length,1,name);A.ok(['phb-2024','srd-2024'].includes(entries[0].sourceId));A.equal(O.validateFeat(entries[0],{characterClass:'Paladin',level:2}), '');A.ok(O.validateFeat(entries[0],{characterClass:'Paladin',level:1}));}
 A.ok(O.validateFeat(O.feats.find(f=>f.name==='Fighting Style: Blessed Warrior'),{characterClass:'Fighter',level:3}));
});
test('Divine Sense ticks down over 100 explicit Paladin turns and never silently consumes real-world time',()=>{
 let s=M.paladinNewTurn(make('Oath of the Ancients',7));s=M.activateDivineSense(s);
 A.equal(s.resources.classState.paladinTimedEffects.divineSenseActive.roundsRemaining,100);
 s=elapsed(s,99);A.equal(s.resources.classState.divineSenseActive,true);A.equal(s.resources.classState.paladinTimedEffects.divineSenseActive.roundsRemaining,1);
 s=M.paladinNewTurn(s);A.equal(s.resources.classState.divineSenseActive,false);A.ok(s.resources.classState.paladinRecentlyExpired.includes('divineSenseActive'));
});
test('Vow lasts ten tracked rounds, can transfer without refreshing timer, then ends',()=>{
 let s=M.paladinNewTurn(make('Oath of Vengeance',15));s=M.vowOfEnmity(s,'Wight');s=elapsed(s,4);
 s=M.transferVow(s,'Ghoul',true);A.equal(s.resources.classState.vowTarget,'Ghoul');A.equal(s.resources.classState.paladinTimedEffects.vowTarget.roundsRemaining,6);
 s=elapsed(s,6);A.equal(s.resources.classState.vowTarget,null);
});
test('Holy Nimbus, Living Legend, Elder Champion and Avenging Angel expire after their own verified durations',()=>{
 for(const [sub,flag,turns] of [['Oath of Devotion','holyNimbusActive',100],['Oath of Glory','livingLegendActive',100],['Oath of the Ancients','elderChampionActive',10],['Oath of Vengeance','avengingAngelActive',100]]){
  let s=M.paladinNewTurn(make(sub,20));s=sub==='Oath of Devotion'?M.useHolyNimbus(s):M.oathCapstone(s);
  A.equal(s.resources.classState[flag],true);
  A.equal(s.resources.classState.paladinTimedEffects[flag].roundsRemaining,turns);
  s=elapsed(s,turns-1);A.equal(s.resources.classState[flag],true);
  s=M.paladinNewTurn(s);A.equal(s.resources.classState[flag],false);
 }
});
test('Elder Champion regenerates before expiry but never once the 1-minute effect has ended',()=>{
 let s=M.paladinNewTurn(make('Oath of the Ancients'));s=M.oathCapstone(s);const hp=s.resources.hp;
 s=elapsed(s,1);A.equal(s.resources.hp,hp+10);
 s=elapsed(s,9);A.equal(s.resources.classState.elderChampionActive,false);
 const before=s.resources.hp;s=M.paladinNewTurn(s);A.equal(s.resources.hp,before);
});
test('timed Paladin state is JSON-saveable and old saves without timers still load',()=>{
 let s=M.paladinNewTurn(make('Oath of Glory'));s=M.activatePeerlessAthlete(s);
 s=JSON.parse(JSON.stringify(s));A.equal(s.resources.classState.paladinTimedEffects.gloryAthleteActive.roundsRemaining,600);
 s=elapsed(s,1);A.equal(s.resources.classState.paladinTimedEffects.gloryAthleteActive.roundsRemaining,599);
 const legacy=make();legacy.resources.classState={vowTarget:'legacy tracked by player'};A.doesNotThrow(()=>M.paladinNewTurn(legacy));
});
test('Dueling adds 2 to one-handed melee weapon damage with a shield but not with two weapons or two hands',()=>{
 let s=make('Oath of Devotion',6,'Dueling');A.equal(attack(s).result.fightingStyleDamageBonus,2);
 const shield=I.gear('shield','Shield','shield',1,'',{equipped:true});s.inventory.items.push(shield);A.equal(attack(s).result.fightingStyleDamageBonus,2);
 s.inventory.items=s.inventory.items.filter(x=>x.category!=='shield');s.inventory.items.push(I.gear('extra','Dagger','weapon',1,'',{equipped:true,weapon:{kind:'Melee',damage:'1d4',type:'Piercing',grip:1}}));A.equal(attack(s).result.fightingStyleDamageBonus,0);
 s.inventory.items.pop();s.inventory.items[0].weapon.versatileDice='1d10';A.equal(attack(s,'two-handed').result.fightingStyleDamageBonus,0);
});
test('Great Weapon Fighting raises only qualifying weapon damage dice to at least 3, including on critical hits',()=>{
 let s=make('Oath of Devotion',6,'Great Weapon Fighting');s.inventory.items[0].weapon.versatileDice='1d10';
 let r=attack(s,'two-handed');A.equal(r.result.damageRolls[0],3);A.equal(r.result.greatWeaponStyleApplied,true);
 r=attack(s,'melee');A.equal(r.result.damageRolls[0],1);A.equal(r.result.greatWeaponStyleApplied,false);
 r=attack(s,'two-handed',n=>n===20?20:1);A.deepEqual(r.result.damageRolls,[3,3]);
});
test('Thrown Weapon Fighting adds 2 only on a thrown-weapon ranged attack',()=>{
 const s=make('Oath of Devotion',7,'Thrown Weapon Fighting');s.inventory.items[0].weapon.properties='Thrown';s.inventory.items[0].weapon.propertyList=['Thrown'];
 A.equal(attack(s,'throw').result.fightingStyleDamageBonus,2);
 A.equal(attack(s,'melee').result.fightingStyleDamageBonus,0);
});
test('Unarmed Fighting uses 1d8 bare handed, 1d6 with equipped shield and doubles dice on natural 20',()=>{
 let s=M.paladinNewTurn(make('Oath of Devotion',7,'Unarmed Fighting'));s.inventory.items=[];
 let r=W.paladinUnarmed(s.character,s.resources,{targetAC:13,inventory:s.inventory},roll);
 A.equal(r.result.unarmedStyleDie,8);A.equal(r.result.baseDamage,4);
 s.inventory.items.push(I.gear('shield','Shield','shield',1,'',{equipped:true}));
 r=W.paladinUnarmed(s.character,s.resources,{targetAC:13,inventory:s.inventory},roll);A.equal(r.result.unarmedStyleDie,6);
 r=W.paladinUnarmed(s.character,s.resources,{targetAC:13,inventory:s.inventory},n=>n===20?20:1);
 A.equal(r.result.baseDamage,5);
});
test('Interception validates held gear and confirmed hit, applies Reaction without changing ally HP',()=>{
 let s=M.paladinNewTurn(make('Oath of Glory',10,'Interception'));
 A.throws(()=>P.fightingStyleReaction(s,{kind:'interception',allyName:'Bard',triggerConfirmed:false,incomingDamage:12},roll),/Confirm/);
 const out=P.fightingStyleReaction(s,{kind:'interception',allyName:'Bard',triggerConfirmed:true,incomingDamage:12},roll);
 A.equal(out.resources.lastClassEffect.damageAfter,7); // 1d10 rolled 1 + PB 4
 A.equal(out.resources.classState.reactionUsed,true);A.equal(s.resources.classState.reactionUsed,false);
 A.throws(()=>P.fightingStyleReaction(out,{kind:'interception',allyName:'Bard',triggerConfirmed:true,incomingDamage:12},roll),/Reaction/);
});
test('Protection requires shield, consumes Reaction, records ally until next turn',()=>{
 let s=M.paladinNewTurn(make('Oath of Devotion',7,'Protection'));
 A.throws(()=>P.fightingStyleReaction(s,{kind:'protection',allyName:'Cleric',triggerConfirmed:true},roll),/Shield/);
 s.inventory.items.push(I.gear('shield','Shield','shield',1,'',{equipped:true}));
 s=P.fightingStyleReaction(s,{kind:'protection',allyName:'Cleric',triggerConfirmed:true},roll);
 A.equal(s.resources.classState.paladinProtectionTarget,'Cleric');A.equal(s.resources.classState.reactionUsed,true);
 s=M.paladinNewTurn(s);A.equal(s.resources.classState.paladinProtectionTarget,null);
});
test('Unarmed Fighting 1d4 against grappled creature is once per tracked turn, before other actions',()=>{
 let s=M.paladinNewTurn(make('Oath of Devotion',8,'Unarmed Fighting'));
 s=P.unarmedFightingStartDamage(s,{targetName:'Enemy',grappleConfirmed:true},roll);
 A.equal(s.resources.lastClassEffect.damage,1);A.equal(s.resources.classState.paladinUnarmedGrappleUsed,true);
 A.throws(()=>P.unarmedFightingStartDamage(s,{targetName:'Enemy',grappleConfirmed:true},roll),/once/);
 s=M.paladinNewTurn(s);A.doesNotThrow(()=>P.unarmedFightingStartDamage(s,{targetName:'Enemy',grappleConfirmed:true},roll));
});
test('Paladin timed effects do not alter Pip original custom character state',()=>{
 const before={character:{name:'Pip',templateKind:'original',className:'Paladin',level:7},resources:{classState:{}}};
 A.throws(()=>M.paladinNewTurn(before),/Paladin/);
 A.deepEqual(before.resources.classState,{});
});
test('Faithful Steed companion follows 2024 spell-level AC, HP and flying thresholds',()=>{
 let s=make('Oath of Glory',5);
 A.throws(()=>P.summonSteed({...s,character:{...s.character,level:4}}),/level 5/);
 A.throws(()=>P.summonSteed(s,{creatureType:'Dragon'}),/type/);
 s=P.summonSteed(s,{spellLevel:2,creatureType:'Fey',form:'Elk'});
 A.deepEqual([s.resources.classState.paladinSteed.ac,s.resources.classState.paladinSteed.maxHp,s.resources.classState.paladinSteed.flyFeet],[12,25,0]);
 s=P.summonSteed(s,{spellLevel:4,creatureType:'Celestial',form:'Pegasus'});
 A.deepEqual([s.resources.classState.paladinSteed.ac,s.resources.classState.paladinSteed.maxHp,s.resources.classState.paladinSteed.flyFeet],[14,45,60]);
 A.equal(s.resources.classState.paladinSteed.creatureType,'Celestial');
});
test('Companion hit points are bounded and persistent, dismissing affects no Paladin HP',()=>{
 let s=P.summonSteed(make('Oath of Devotion',12),{spellLevel:3});const characterHP=s.resources.hp;
 s=P.steedHP(s,-50);A.equal(s.resources.classState.paladinSteed.hp,0);
 s=P.steedHP(s,100);A.equal(s.resources.classState.paladinSteed.hp,35);
 A.throws(()=>P.steedHP(s,0),/nonzero/);
 s=JSON.parse(JSON.stringify(s));A.equal(s.resources.classState.paladinSteed.spellLevel,3);
 s=P.dismissSteed(s);A.equal(s.resources.classState.paladinSteed,null);
 A.equal(s.resources.hp,characterHP);A.throws(()=>P.dismissSteed(s),/no summoned steed/);
});
test('Spell casts with unknown time require verified timing when turn tracking is active',()=>{
 const s=M.paladinNewTurn(make());A.throws(()=>M.recordPaladinSpellCast(s,{name:'Personal Reference Spell'},'slot1'),/Confirm/);
 const a=M.recordPaladinSpellCast(s,{name:'Personal Reference Spell'},'slot1',{confirmedTime:'action'});
 A.equal(a.resources.classState.paladinActionUsed,true);A.equal(a.resources.classState.paladinSpellSlotUsed,true);
 A.throws(()=>M.recordPaladinSpellCast(a,{name:'Other Reference'},'cantrip',{confirmedTime:'action'}),/Action/);
 const older=M.recordPaladinSpellCast(make(),{name:'Manual Reference'},'slot1');
 A.equal(Boolean(older.resources.classState?.paladinTurnTracking),false);
});
test('Verified bonus and reaction timing use the shared Paladin action budget',()=>{
 let s=M.paladinNewTurn(make());s=M.recordPaladinSpellCast(s,{name:'Manual Reference'},'cantrip',{confirmedTime:'bonus'});
 A.equal(s.resources.classState.paladinBonusActionUsed,true);
 A.throws(()=>M.recordPaladinSpellCast(s,{name:'Manual Reference'},'cantrip',{confirmedTime:'bonus'}),/Bonus Action/);
 s=M.recordPaladinSpellCast(s,{name:'Manual Reaction'},'cantrip',{confirmedTime:'reaction'});
 A.equal(s.resources.classState.reactionUsed,true);
});
