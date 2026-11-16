'use strict';
const {test}=require('node:test'),A=require('node:assert/strict');
require('../js/data.js');const I=require('../js/inventory.js');const Core=require('../js/core.js');
require('../js/dice.js');require('../js/weapon-catalog.js');
const M=require('../js/class-mechanics.js'),W=require('../js/weapon-rules.js'),P=require('../js/paladin-combat.js');
const fixed=(n)=>n===20?14:n===8?4:n===6?3:4;
const fullSlots=[4,3,3,2,1,0,0,0,0];
function make(oath='Oath of Devotion',n=20){const c={templateKind:'starter',className:'Paladin',subclass:oath,level:n,scores:{str:16,dex:12,con:14,int:10,wis:10,cha:18},profSaves:['wis','cha'],build:{characterClass:'Paladin',subclass:oath,slotMax:[...fullSlots]}};
 const sword=I.gear('sword','Longsword','weapon',1,'',{equipped:true,weapon:{category:'Martial',kind:'Melee',damage:'1d8',type:'Slashing',properties:'Versatile',propertyList:['Versatile'],ability:'str',grip:1}});
 return {character:c,inventory:{items:[sword]},resources:{hp:48,maxHp:100,tempHp:0,conditions:[],classState:{},classResources:M.normalizeResources(c),spellSlots:[...fullSlots]}};}
function addLight(s,masteredNick=false){s.inventory.items=[I.gear('a','Scimitar','weapon',1,'',{equipped:true,weapon:{category:'Martial',kind:'Melee',damage:'1d6',type:'Slashing',properties:'Light,Finesse',propertyList:['Light','Finesse'],ability:'str',grip:1,mastery:'Nick',mastered:masteredNick}}),I.gear('b','Shortsword','weapon',1,'',{equipped:true,weapon:{category:'Martial',kind:'Melee',damage:'1d6',type:'Piercing',properties:'Light,Finesse',propertyList:['Light','Finesse'],ability:'str',grip:1,mastery:'Vex',mastered:false}})];return s;}
function attack(s,id='sword',role='attack',extra={}){return W.attack(s.character,s.inventory,id,'melee','normal',14,fixed,s.resources,null,null,null,null,null,{attackRole:role,...extra});}
function spend(s,r){return {...s,resources:r.resources,inventory:r.inventory||s.inventory};}

test('Paladin Attack action allows one roll before level 5, two from level 5',()=>{
 for(const n of [1,4,5,11,20]){let s=M.paladinNewTurn(make('Oath of Devotion',n));for(let j=0;j<(n>=5?2:1);j++)s=spend(s,attack(s));A.throws(()=>attack(s),/All attacks/);A.equal(s.resources.classState.paladinAttackRolls,n>=5?2:1);A.equal(s.resources.classState.paladinActionUsed,true);}
});
test('Attack action budget persists after restarting a save and resets on a new turn',()=>{
 let s=M.paladinNewTurn(make());s=spend(s,attack(s));let saved=JSON.parse(JSON.stringify(s));A.equal(saved.resources.classState.paladinAttackRolls,1);saved=spend(saved,attack(saved));A.throws(()=>attack(saved),/All attacks/);const restarted=M.paladinNewTurn(saved);A.equal(restarted.resources.classState.paladinAttackRolls,0);A.doesNotThrow(()=>attack(restarted));
});
test('Vow of Enmity claims Attack action but does not spend attacks, and blocks Magic action',()=>{
 const s=M.paladinNewTurn(make('Oath of Vengeance',7)),v=M.vowOfEnmity(s,'Cultist');A.equal(v.resources.classState.paladinActionUsed,true);A.equal(v.resources.classState.paladinAttackRolls||0,0);let next=spend(v,attack(v));next=spend(next,attack(next));A.throws(()=>M.recordPaladinSpellCast(next,{time:'Action'},'cantrip'),/Action/);
});
test('Sacred Weapon claims Attack action but leaves both attacks available',()=>{
 const s=M.paladinNewTurn(make()),sw=M.activateSacredWeapon(s,'sword');A.equal(sw.resources.classState.paladinActionUsed,true);A.equal(sw.resources.classState.paladinAttackRolls||0,0);A.doesNotThrow(()=>attack(sw));
});
test('Light extra attack needs a separate Light weapon and spends Bonus Action',()=>{
 let s=M.paladinNewTurn(addLight(make('Oath of Devotion',5)));A.throws(()=>attack(s,'b','light-bonus'),/different Light weapon/);s=spend(s,attack(s,'a'));A.throws(()=>attack(s,'a','light-bonus'),/different Light weapon/);s=spend(s,attack(s,'b','light-bonus'));A.equal(s.resources.classState.paladinBonusActionUsed,true);A.equal(s.resources.classState.paladinLightExtraUsed,true);A.throws(()=>attack(s,'b','light-bonus'),/already been used/);
});
test('Nick extra attack requires chosen mastery and does not cost Bonus Action',()=>{
 let s=M.paladinNewTurn(addLight(make('Oath of Devotion',5)));s=spend(s,attack(s,'b'));A.throws(()=>attack(s,'a','nick'),/Nick requires/);s.inventory.items[0].weapon.mastered=true;s=spend(s,attack(s,'a','nick'));A.equal(s.resources.classState.paladinBonusActionUsed,false);A.equal(s.resources.classState.paladinLightExtraUsed,true);
});
test('Light extra attack omits positive ability damage without two-weapon fighting style',()=>{
 let s=M.paladinNewTurn(addLight(make('Oath of Devotion',5)));s=spend(s,attack(s,'a'));const off=attack(s,'b','light-bonus');A.equal(off.result.damageBonus,0);A.equal(off.result.damage,3);
 const styled=M.paladinNewTurn(addLight(make('Oath of Devotion',5)));styled.character.build.grantedFeatNames=['Fighting Style: Two-Weapon Fighting'];const after=spend(styled,attack(styled,'a'));A.equal(attack(after,'b','light-bonus').result.damageBonus,3);
});
test('Ordinary Opportunity Attack requires a confirmed trigger and spends Reaction',()=>{
 let s=M.paladinNewTurn(make());A.throws(()=>attack(s,'sword','opportunity'),/Confirm/);s=spend(s,attack(s,'sword','opportunity',{opportunityConfirmed:true}));A.equal(s.resources.classState.reactionUsed,true);A.equal(s.resources.classState.paladinAttackRolls,0);A.throws(()=>attack(s,'sword','opportunity',{opportunityConfirmed:true}),/Reaction/);
});
test('Unarmed damage uses Strength, proficiency and Radiant Strikes after level 11',()=>{
 const s=M.paladinNewTurn(make('Oath of Devotion',11)),r=W.paladinUnarmed(s.character,s.resources,{targetAC:14},fixed);A.equal(r.result.hit,true);A.equal(r.result.baseDamage,4);A.equal(r.result.radiant,4);A.equal(r.result.damage,8);A.equal(r.resources.classState.paladinAttackRolls,1);
});
test('Unarmed damage respects target AC and grants neither Radiant Strikes nor smite on miss',()=>{
 const s=M.paladinNewTurn(make('Oath of Devotion',11)),r=W.paladinUnarmed(s.character,s.resources,{targetAC:50},fixed);A.equal(r.result.hit,false);A.equal(r.result.damage,0);A.equal(r.result.radiant,0);A.equal(s.resources.classResources['divine-smite-free'],1);
});
test('Unarmed Divine Smite on hit spends Bonus Action and free Smite charge, not a spell slot',()=>{
 const s=M.paladinNewTurn(make('Oath of Devotion',11)),r=W.paladinUnarmed(s.character,s.resources,{targetAC:14,smiteCost:'free'},fixed);A.equal(r.result.smite.cost,'free');A.equal(r.resources.classState.paladinBonusActionUsed,true);A.equal(r.resources.classResources['divine-smite-free'],0);A.equal(r.resources.spellSlots[0],4);
});
test('Unarmed Grapple/Shove uses target saves and requires reach confirmation',()=>{
 const s=M.paladinNewTurn(make('Oath of Devotion',8));A.throws(()=>W.paladinUnarmed(s.character,s.resources,{kind:'grapple',saveTotal:4},fixed),/reach/);const grapple=W.paladinUnarmed(s.character,s.resources,{kind:'grapple',saveAbility:'dex',saveTotal:9,sizeAndReachConfirmed:true},fixed);A.equal(grapple.result.failed,true);A.equal(grapple.result.saveDC,14);const shove=W.paladinUnarmed(s.character,s.resources,{kind:'shove',saveAbility:'str',saveTotal:17,sizeAndReachConfirmed:true},fixed);A.equal(shove.result.failed,false);
});
test('Unarmed Opportunity Attack refuses off-turn Smite and requires confirmed reach/trigger',()=>{
 const s=M.paladinNewTurn(make());A.throws(()=>W.paladinUnarmed(s.character,s.resources,{attackRole:'opportunity',targetAC:12},fixed),/Confirm/);A.throws(()=>W.paladinUnarmed(s.character,s.resources,{attackRole:'opportunity',opportunityConfirmed:true,smiteCost:'free'},fixed),/cannot cast Divine Smite/);const out=W.paladinUnarmed(s.character,s.resources,{attackRole:'opportunity',opportunityConfirmed:true,targetAC:12},fixed);A.equal(out.resources.classState.reactionUsed,true);
});
test('Paladin does not change Wizard or Cleric weapon attacks without turn tracking',()=>{
 let s=make();s.character.className='Cleric';s.character.build.characterClass='Cleric';const out=attack(s);A.equal(out.resources,undefined);A.equal(out.result.hit,true);
});
test('Nature’s Wrath resolves initial and repeated Strength saves, expires after ten turn-end checks',()=>{
 let s=M.paladinNewTurn(make('Oath of the Ancients',9));s=M.naturesWrath(s,2);let out=P.resolveEvent(s,{type:'nature-initial',targetName:'Wight',distanceFeet:10,saveTotal:7});A.equal(out.resources.lastClassEffect.failed,true);A.equal(out.resources.classState.paladinExternalEffects[0].condition,'Restrained');A.equal(out.resources.classState.natureWrathPending,1);const fail=P.resolveEvent(out,{type:'nature-repeat',targetName:'Wight',saveTotal:6});A.equal(fail.resources.classState.paladinExternalEffects[0].turnsRemaining,9);const escape=P.resolveEvent(fail,{type:'nature-repeat',targetName:'Wight',saveTotal:99});A.equal(escape.resources.classState.paladinExternalEffects.length,0);A.throws(()=>P.resolveEvent(escape,{type:'nature-repeat',targetName:'Wight',saveTotal:8}),/No active/);
});
test('Nature’s Wrath cannot be ended merely by damage',()=>{
 let s=make('Oath of the Ancients',7);s.resources.classState.natureWrathPending=1;s=P.resolveEvent(s,{type:'nature-initial',targetName:'Wight',distanceFeet:5,saveTotal:4});A.throws(()=>P.clearEffect(s,{source:'Nature’s Wrath',targetName:'Wight',reason:'damaged'}),/Damage does not/);A.equal(P.clearEffect(s,{source:'Nature’s Wrath',targetName:'Wight',reason:'manual'}).resources.classState.paladinExternalEffects.length,0);
});
test('Avenging Angel frightens enemy after confirmed Wisdom save and clears after damage',()=>{
 let s=make('Oath of Vengeance',20);s.resources.classState.avengingAngelActive=true;s=P.resolveEvent(s,{type:'angel-start',targetName:'Enemy',distanceFeet:10,saveTotal:1});A.equal(s.resources.classState.paladinExternalEffects[0].condition,'Frightened');const ended=P.clearEffect(s,{targetName:'Enemy',source:'Avenging Angel',reason:'damaged'});A.equal(ended.resources.classState.paladinExternalEffects.length,0);A.throws(()=>P.resolveEvent({...s,resources:{...s.resources,classState:{...s.resources.classState,avengingAngelActive:false}}},{type:'angel-start',targetName:'Enemy',distanceFeet:5,saveTotal:1}),/must be active/);
});
test('Holy Nimbus deals Charisma + proficiency Radiant to confirmed enemy starting in aura',()=>{
 let s=make('Oath of Devotion',20);s.resources.classState.holyNimbusActive=true;const out=P.resolveEvent(s,{type:'nimbus-start',targetName:'Ghoul',distanceFeet:30});A.equal(out.resources.lastClassEffect.damage,10);A.equal(out.resources.lastClassEffect.damageType,'Radiant');A.throws(()=>P.resolveEvent(s,{type:'nimbus-start',targetName:'Ghoul',distanceFeet:31}),/within 30 feet/);
});
test('Elder Champion applies enemy saving-throw Disadvantage and checks the DC',()=>{
 let s=make('Oath of the Ancients',20);s.resources.classState.elderChampionActive=true;const out=P.resolveEvent(s,{type:'elder-save',targetName:'Lich',distanceFeet:20,rollA:17,rollB:3,saveModifier:7});A.equal(out.resources.lastClassEffect.total,10);A.equal(out.resources.lastClassEffect.failed,true);A.throws(()=>P.resolveEvent(s,{type:'elder-save',targetName:'Lich',distanceFeet:40,rollA:17,rollB:3,saveModifier:7}),/within 30 feet/);
});
test('Elder Champion permits Action spell to be cast using Bonus Action, not twice',()=>{
 let s=M.paladinNewTurn(make('Oath of the Ancients',20));s.resources.classState.elderChampionActive=true;const spell={time:'1 Action'};const out=M.recordPaladinSpellCast(s,spell,'slot1',{swift:true});A.equal(out.resources.classState.paladinActionUsed,false);A.equal(out.resources.classState.paladinBonusActionUsed,true);A.equal(out.resources.classState.paladinSpellSlotUsed,true);A.throws(()=>M.recordPaladinSpellCast(out,spell,'cantrip',{swift:true}),/Bonus Action/);
});
test('Glory Aura of Alacrity offers nearby ally Speed boost within aura range',()=>{
 const s=make('Oath of Glory',18);const out=M.resolvePaladinAllyAura(s,{allyName:'Sorcerer',distanceFeet:30,kind:'speed',baseTotal:30});A.equal(out.resources.lastClassEffect.bonus,10);A.equal(out.resources.lastClassEffect.effectiveSpeed,40);A.throws(()=>M.resolvePaladinAllyAura(s,{allyName:'Sorcerer',distanceFeet:31,kind:'speed',baseTotal:30}),/within 30 feet/);
});
test('External target effects do not mutate character or other creatures and survive JSON save/reopen',()=>{
 let s=make('Oath of Vengeance',20);s.resources.classState.avengingAngelActive=true;const before=JSON.stringify(s.character);const after=JSON.parse(JSON.stringify(P.resolveEvent(s,{type:'angel-start',targetName:'Lich',distanceFeet:5,saveTotal:4})));A.equal(JSON.stringify(after.character),before);A.equal(after.resources.classState.paladinExternalEffects[0].target,'Lich');A.equal(s.resources.classState.paladinExternalEffects,undefined);
});

test('Blessed Warrior is a Paladin-only level-2 class choice and permits two Cleric cantrips',()=>{
 require('../js/spell-catalog.js');require('../js/spell-expansions.js');
 const O=require('../js/origin-catalog.js'),F=require('../js/rules-engine.js');
 const style=O.feats.find(x=>x.name==='Fighting Style: Blessed Warrior');A.ok(style);A.equal(style.sourceId,'phb-2024');
 A.match(O.validateFeat(style,{level:2,characterClass:'Fighter'}),/Paladin-only/);
 A.match(O.validateFeat(style,{level:1,characterClass:'Paladin'}),/level 2/);
 A.equal(O.validateFeat(style,{level:2,characterClass:'Paladin'}),'');
 const c=make().character;c.level=2;c.build.fightingStyleName=style.name;
 A.equal(F.preparationLimits(c).cantrips,2);
 const allowed=F.availableSpells(c).filter(x=>x.level===0).map(x=>x.name);
 A.ok(allowed.includes('Guidance'));A.ok(allowed.includes('Sacred Flame'));A.ok(!allowed.includes('Fire Bolt'));
 A.ok(!F.availableSpells(c).some(x=>x.level===1&&x.name==='Healing Word'));
 c.build.fightingStyleName='Fighting Style: Defense';A.equal(F.preparationLimits(c).cantrips,0);
});
test('Every Paladin level 1–20 offers a defined core resource record and preserves four-oath eligibility',()=>{
 for(const oath of ['Oath of Devotion','Oath of Glory','Oath of the Ancients','Oath of Vengeance'])for(let n=1;n<=20;n++){
  const s=make(oath,n);A.ok(s.resources.classResources&&typeof s.resources.classResources==='object');
  const turn=M.paladinNewTurn(s);A.equal(turn.resources.classState.paladinTurnTracking,true);
  A.equal(turn.character.level,n);A.equal(turn.character.subclass,oath);
  A.equal(M.devotion(s.character),n>=3&&oath==='Oath of Devotion');
  A.equal(M.glory(s.character),n>=3&&oath==='Oath of Glory');
  A.equal(M.ancients(s.character),n>=3&&oath==='Oath of the Ancients');
  A.equal(M.vengeance(s.character),n>=3&&oath==='Oath of Vengeance');
 }
});

test('Blessed Warrior cantrips use level-up swapping, not Paladin long-rest spell swapping',()=>{
 require('../js/spell-catalog.js');require('../js/spell-expansions.js');const FR=require('../js/rules-engine.js');
 const c=make().character;c.level=7;c.build.fightingStyleName='Fighting Style: Blessed Warrior';
 const guidance=FR.catalog().find(x=>x.name==='Guidance'&&x.level===0),light=FR.catalog().find(x=>x.name==='Light'&&x.level===0);A.ok(guidance&&light);
 const b={catalogSelections:[guidance.key],custom:[]};
 A.match(FR.swapError(c,b,guidance.key,light.key),/when you gain a Paladin level/);
 A.equal(FR.swapError(c,b,guidance.key,light.key,{levelUp:true}),'');
 const queued={...b,catalogLevelUpQueued:[{from:guidance.key,to:light.key}]};
 A.deepEqual(FR.applyLevelUpChanges(queued).catalogSelections,[light.key]);
});
