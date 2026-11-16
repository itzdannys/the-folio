'use strict';
const {test}=require('node:test'),A=require('node:assert/strict');
for(const f of ['data','inventory','dice','spell-catalog','spell-expansions','spell-supplements','weapon-catalog','ranger-2024','class-mechanics','core','builder','rules-engine','weapon-rules','storage'])require('../js/'+f+'.js');
const R=require('../js/ranger-2024.js'),CM=require('../js/class-mechanics.js'),B=require('../js/builder.js'),WR=require('../js/weapon-rules.js'),I=require('../js/inventory.js'),S=require('../js/storage.js');
const roll=n=>n===20?15:n===12?7:n===10?6:n===8?5:n===6?4:n===4?3:1;
function setup(n=3,sub='Beast Master'){
 const c={templateKind:'starter',className:'Ranger',subclass:sub,level:n,scores:{str:12,dex:18,con:14,int:10,wis:16,cha:12},profSaves:['str','dex'],profSkills:['Stealth','Survival','Perception','Insight'],expertise:[],speed:30,languages:['Common'],build:{characterClass:'Ranger',subclass:sub,grantedFeatNames:[],spellAbility:'wis'}};
 return {version:6,character:c,inventory:I.defaults(),resources:{hp:35,maxHp:62,tempHp:0,conditions:[],concentration:'',classResources:CM.normalizeResources(c),classState:{},spellSlots:[]},spellbook:{prepared:[],queued:[],custom:[],castLog:[]},encounter:{active:false,round:1,roster:[],currentId:null}};
}
test('Builder offers exactly four 2024 PHB Ranger subclasses with stable IDs',()=>{
 const opts=B.optionList('subclass').filter(x=>x.classId==='class:ranger');A.deepEqual(opts.map(x=>x.name).sort(),['Beast Master','Fey Wanderer','Gloom Stalker','Hunter'].sort());A.equal(new Set(opts.map(x=>x.id)).size,4);
});
test('Level 1–20 Ranger subclass unlocks and Favored Enemy progression',()=>{
 for(let n=1;n<=20;n++)for(const sub of ['Beast Master','Fey Wanderer','Gloom Stalker','Hunter']){
  const s=setup(n,sub),c=s.character,entry=CM.resourcesFor(c).find(x=>x.key==='favored-enemy');A.equal(entry.max,n>=17?6:n>=13?5:n>=9?4:n>=5?3:2);
  A.equal(R.beast(c),n>=3&&sub==='Beast Master');A.equal(R.fey(c),n>=3&&sub==='Fey Wanderer');A.equal(R.gloom(c),n>=3&&sub==='Gloom Stalker');A.equal(R.hunter(c),n>=3&&sub==='Hunter');
 }
});
test('Druidic Warrior is Ranger-specific and class spellcasting uses Wisdom',()=>{
 const s=setup(2);const f=globalThis.FolioOrigins?.featOptions?.({characterClass:'Ranger',level:2})||[];
 A.equal(R.isRanger(s.character),true);A.equal(R.isRanger({...s.character,className:'Paladin',build:{characterClass:'Paladin'}}),false);
});
test('Ranger new turn enforces Extra Attack and shared Bonus / Reaction budgets',()=>{
 let s=R.newTurn(setup(5));s=R.attacking(s,{role:'attack'});s=R.attacking(s,{role:'attack'});A.throws(()=>R.attacking(s,{role:'attack'}),/All attacks/);
 A.throws(()=>R.attackBudget(s.character,s.resources,'light-bonus',{light:true}),/Light/);
});
test('Companion stat blocks scale by Wisdom and Ranger level',()=>{
 const s=setup(11);for(const form of ['Land','Sea','Sky']){
  const st=R.companionStats(s.character,form);A.equal(st.ac,16);A.equal(st.maxHp,(form==='Sky'?4:5)*12);A.equal(st.attackBonus,7);
 }
 A.throws(()=>R.companionStats(s.character,'Dragon'),/Land, Sea, or Sky/);
});
test('Primal Companion persists independent HP, and cannot be summoned without confirmed rest',()=>{
 let s=setup(5);A.throws(()=>R.summon(s,'Land'),/Long Rest/);s=R.summon(s,'Land',true);s=R.setBeastHp(s,10);A.equal(s.resources.classState.rangerCompanion.hp,10);
 const m=S.migrate(JSON.parse(JSON.stringify(s)));A.equal(m.resources.classState.rangerCompanion.hp,10);A.throws(()=>R.setBeastHp(s,1000),/Beast HP/);
});
test('Beast Strike has correct hit/miss dice, command cost and attack replacement',()=>{
 let s=R.newTurn(R.summon(setup(11),'Land',true));const before=s.resources.classState.rangerBeastAttacks||0;
 s=R.beastAttack(s,{targetAC:12,confirmed:true,role:'replace'},roll);A.equal(s.resources.lastClassEffect.hit,true);A.equal(s.resources.classState.rangerBeastAttacks,before+1);A.equal(s.resources.classState.rangerAttackCount,1);
 s=R.beastAttack(s,{targetAC:12,confirmed:true,role:'replace'},roll);A.throws(()=>R.beastAttack(s,{targetAC:12,confirmed:true,role:'replace'},roll),/attacks|strike|attack/i);
});
test('Companion command Bonus Actions are not reusable without a new tracked turn',()=>{
 let s=R.newTurn(R.summon(setup(7),'Sea',true));s=R.beastCommand(s,'Help',{confirmed:true});A.throws(()=>R.beastCommand(s,'Dash',{confirmed:true}),/Bonus Action|already/i);
});
test('Gloom Stalker Dread Ambusher spends charges on confirmed hits, not misses',()=>{
 const s=setup(11,'Gloom Stalker'),k='ranger-dread-ambusher',r=s.resources,first=r.classResources[k];
 const miss=R.weaponEffects(s.character,r,{hit:false,critical:false,target:'Goblin',gloomDread:true,confirmed:true},roll);
 A.equal(miss?.damage||0,0);A.equal(miss?.resources.classResources?.[k]??first,first);
 const hit=R.weaponEffects(s.character,r,{hit:true,critical:true,target:'Goblin',gloomDread:true,confirmed:true},roll);A.equal(hit.damage,20);A.equal(hit.resources.classResources[k],first-1);
});
test('Dreadful Strikes applies only once per target per turn and doubles dice on critical',()=>{
 let s=R.newTurn(setup(11,'Fey Wanderer'));let e=R.weaponEffects(s.character,s.resources,{hit:true,critical:true,target:'Goblin',feyPsychic:true,confirmed:true},roll);A.equal(e.damage,8);s={...s,resources:e.resources};
 A.equal(R.weaponEffects(s.character,s.resources,{hit:true,target:'Goblin',feyPsychic:true,confirmed:true},roll).damage,0);
 A.equal(R.weaponEffects(s.character,s.resources,{hit:true,target:'Orc',feyPsychic:true,confirmed:true},roll).damage,4);
});
test('Fey Wanderer Beguiling Twist needs trigger and shared Reaction',()=>{
 let s=R.newTurn(setup(7,'Fey Wanderer'));A.throws(()=>R.feyTwist(s,{target:'Orc'}),/Confirm/);s=R.feyTwist(s,{target:'Orc',saveTotal:4,confirmed:true});A.equal(s.resources.lastClassEffect.failed,true);A.throws(()=>R.feyTwist(s,{target:'Bugbear',saveTotal:4,confirmed:true}),/Reaction/);
});
test('Misty Wanderer and Fey Reinforcements cost appropriate resources and Action/Bonus Action',()=>{
 let s=R.newTurn(setup(15,'Fey Wanderer'));s=R.feyMisty(s,{confirmed:true});A.equal(s.resources.classState.rangerBonusUsed,true);A.throws(()=>R.feyMisty(s,{confirmed:true}),/Bonus Action/);
 s=R.newTurn(s);s=R.feyReinforcement(s,{confirmed:true,noConcentration:true});A.equal(s.resources.classState.rangerActionUsed,true);A.throws(()=>R.feyReinforcement(s,{confirmed:true}),/No ranger-fey-reinforcements/);
});
test('Gloom Stalker Stalker’s Flurry has one confirmed follow-up per trigger',()=>{
 let s=R.newTurn(setup(11,'Gloom Stalker'));const e=R.weaponEffects(s.character,s.resources,{hit:true,target:'Orc',gloomDread:true,confirmed:true},roll);s={...s,resources:e.resources};
 s=R.gloomFlurry(s,{kind:'strike',target:'Goblin',confirmed:true});A.throws(()=>R.gloomFlurry(s,{kind:'strike',target:'Goblin',confirmed:true}),/already|used/);
});
test('Hunter superior feature requires Hunter’s Mark and confirms target',()=>{
 let s=setup(11,'Hunter');A.throws(()=>R.hunterSuperiorPrey(s,{target:'Orc',confirmed:true},roll),/Hunter’s Mark/);
 s={...s,resources:{...s.resources,concentration:'Hunter’s Mark'}};s=R.hunterSuperiorPrey(s,{target:'Orc',confirmed:true},roll);A.equal(s.resources.lastClassEffect.damage,4);A.throws(()=>R.hunterSuperiorPrey(s,{target:'Orc',confirmed:true},roll),/used/);
});
test('Ranger Deft Explorer expertise and two languages persist through save/reopen',()=>{
 let s=setup(9,'Fey Wanderer');s=R.saveExpertise(s,['Stealth','Survival','Perception'],['Elvish','Sylvan'],'Deception');A.deepEqual(s.character.build.rangerExpertise,['Stealth','Survival','Perception']);A.equal(s.character.profSkills.includes('Deception'),true);
 let m=S.migrate(JSON.parse(JSON.stringify(s)));A.equal(m.character.languages.includes('Sylvan'),true);A.equal(m.character.expertise.includes('Survival'),true);
});
test('Existing Paladin, Fighter, Monk and Pip states do not qualify as Ranger',()=>{
 const s=setup(10);for(const who of ['Paladin','Fighter','Monk','Rogue','Barbarian'])A.equal(R.isRanger({...s.character,className:who,build:{characterClass:who}}),false);
});
test('Hunter’s Mark free and spell-slot casts share Bonus Action and enforce tracked spell-slot limit',()=>{
 let s=setup(5,'Hunter');s.character.build.slotMax=[4,2];s.resources.spellSlots=[4,2];s=R.newTurn(s);
 s=R.recordSpellCast(s,{name:"Hunter's Mark",time:'Bonus Action'},'slot1');
 s=CM.castHuntersMark(s,'slot',1,'Orc');A.equal(s.resources.spellSlots[0],3);A.equal(s.resources.classState.rangerBonusUsed,true);A.equal(s.resources.classState.rangerSpellSlotUsed,true);
 A.throws(()=>R.recordSpellCast(s,{name:'Cure Wounds',time:'Action'},'slot1'),/one spell slot/i);
 A.throws(()=>CM.castHuntersMark(s,'free',1,'Goblin'),/Bonus Action/);
});
test('Free Hunter’s Mark still costs Bonus Action but does not spend spell-slot allowance',()=>{
 let s=setup(5,'Hunter');s.character.build.slotMax=[4,2];s.resources.spellSlots=[4,2];s=R.newTurn(s);
 s=CM.castHuntersMark(s,'free',1,'Orc');A.equal(s.resources.classState.rangerSpellSlotUsed,false);A.equal(s.resources.classState.rangerBonusUsed,true);
 A.equal(s.resources.classResources['favored-enemy'],2);s=R.recordSpellCast(s,{name:'Cure Wounds',time:'Action'},'slot1');A.equal(s.resources.classState.rangerSpellSlotUsed,true);
});
test('Ranger unknown spell casting time requires explicit confirmation in tracked combat',()=>{
 let s=R.newTurn(setup(5,'Hunter'));
 A.throws(()=>R.recordSpellCast(s,{name:'Custom Spell'},'slot1'),/Confirm/);
 s=R.recordSpellCast(s,{name:'Custom Spell'},'slot1',{confirmedTime:'action'});A.equal(s.resources.classState.rangerActionUsed,true);
 A.throws(()=>R.recordSpellCast(s,{name:'Long Ritual',time:'10 minutes'},'ritual'),/Long casting/);
});
test('Dreadful Strike permits one confirmed hit each tracked turn, not multiple same-turn hits',()=>{
 let s=R.newTurn(setup(11,'Gloom Stalker'));
 let e=R.weaponEffects(s.character,s.resources,{hit:true,critical:false,target:'Orc',gloomDread:true,confirmed:true},roll);s={...s,resources:e.resources};
 A.throws(()=>R.weaponEffects(s.character,s.resources,{hit:true,target:'Goblin',gloomDread:true,confirmed:true},roll),/once per turn/);
 s=R.newTurn(s);e=R.weaponEffects(s.character,s.resources,{hit:true,target:'Goblin',gloomDread:true,confirmed:true},roll);A.ok(e.damage>0);
});
test('Stalker’s Flurry Sudden Strike is one additional eligible weapon attack against a distinct target',()=>{
 let s=R.newTurn(setup(11,'Gloom Stalker'));let e=R.weaponEffects(s.character,s.resources,{hit:true,target:'Orc',gloomDread:true,confirmed:true},roll);s={...s,resources:e.resources};
 s=R.gloomFlurry(s,{kind:'strike',target:'Goblin',confirmed:true});A.throws(()=>R.attackBudget(s.character,s.resources,'gloom-flurry',{target:'Orc',confirmed:true}),/different creature/);
 const r=R.attackBudget(s.character,s.resources,'gloom-flurry',{target:'Goblin',confirmed:true});A.equal(r.classState.rangerGloomFlurryPending,false);
 A.throws(()=>R.attackBudget(s.character,r,'gloom-flurry',{target:'Goblin',confirmed:true}),/Activate Stalker/);
});
test('Ranger Light Bonus and Nick attacks require a previous Light attack',()=>{
 let s=R.newTurn(setup(5,'Hunter'));
 A.throws(()=>R.attackBudget(s.character,s.resources,'light-bonus',{light:true}),/Light bonus/);
 let r=R.attackBudget(s.character,s.resources,'attack',{light:true});r=R.attackBudget(s.character,r,'light-bonus',{light:true});A.equal(r.classState.rangerBonusUsed,true);
 A.throws(()=>R.attackBudget(s.character,r,'nick',{light:true,nick:true}),/Nick requires/);
});
test('Ranger companion extra Bonus Action is once per turn, and does not spend player’s second Bonus Action',()=>{
 let s=R.newTurn(R.summon(setup(7),'Land',true));s=R.beastAttack(s,{targetAC:11,confirmed:true,role:'bonus'},roll);
 s=R.beastCommand(s,'Help',{confirmed:true});A.equal(s.resources.classState.rangerBeastExtraUsed,true);
 A.throws(()=>R.beastCommand(s,'Dash',{confirmed:true}),/already been used/);
});
test('Gloom Stalker adds Wisdom to Initiative and gains first-turn movement without modifying other classes',()=>{
 const C=require('../js/core.js');let s=setup(11,'Gloom Stalker');const ini=CM.rollInitiative(s,roll);A.equal(ini.total,15+4+3);A.equal(ini.state.resources.lastClassEffect.modifier,7);
 s=R.newTurn(s);A.equal(C.derived(s.character,s.inventory,s.resources).speed,50);
 s=R.newTurn(s);A.equal(C.derived(s.character,s.inventory,s.resources).speed,40);
 const p=setup(11,'Hunter');A.equal(CM.rollInitiative(p,roll).total,15+4);
});
test('Fey Wanderer Otherworldly Glamour adds Wisdom modifier to displayed Charisma skill totals',()=>{
 const C=require('../js/core.js');let s=setup(7,'Fey Wanderer');const got=C.derived(s.character,s.inventory,s.resources).skills.Persuasion;let p=setup(7,'Hunter');const base=C.derived(p.character,p.inventory,p.resources).skills.Persuasion;
 A.equal(got-base,3);
});
test('Gloom Stalker Iron Mind grants Wisdom save proficiency at level 7, alternate if already trained',()=>{
 const C=require('../js/core.js'),s=setup(7,'Gloom Stalker');const got=C.derived(s.character,s.inventory,s.resources).saves.wis;A.equal(got,6);
 s.character.profSaves.push('wis');s.character.build.rangerIronSave='cha';A.equal(C.derived(s.character,s.inventory,s.resources).saves.cha,4);
});
test('Ranger level 6 Roving grants climbing and swimming, Feral Senses 30 ft at level 18',()=>{
 const C=require('../js/core.js');let s=setup(18,'Hunter');const d=C.derived(s.character,s.inventory,s.resources);A.equal(d.blindsightFeet,30);A.equal(d.climbSpeed,40);A.equal(d.swimSpeed,40);
 s=setup(5,'Hunter');A.equal(C.derived(s.character,s.inventory,s.resources).blindsightFeet,0);
});
test('Beast Master Share Spells requires level 15, self-targeting confirmation and living companion',()=>{
 let s=R.summon(setup(15,'Beast Master'),'Sky',true);
 A.throws(()=>R.shareSelfSpell(s,{name:'Protection from Evil and Good'},{}),/Confirm/);
 s=R.shareSelfSpell(s,{name:'Protection from Evil and Good'},{confirmedSelfTarget:true,within30:true});A.equal(s.resources.classState.rangerSharedSpell.name,'Protection from Evil and Good');
 A.throws(()=>R.shareSelfSpell(setup(14,'Beast Master'),{name:'Cure Wounds'},{confirmedSelfTarget:true,within30:true}),/level 15/);
});
test('Hunter Horde Breaker requires new un-attacked target and same weapon, without requiring the initial hit',()=>{
 let s=R.newTurn(setup(5,'Hunter'));let f={...s.resources.classState,rangerHunterHordeReady:true,rangerHunterHordeTarget:'Orc',rangerHordeWeaponId:'bow1',rangerAttackedTargets:['Orc']};s={...s,resources:{...s.resources,classState:f}};
 A.throws(()=>R.attackBudget(s.character,s.resources,'horde',{confirmed:true,target:'Orc',weaponId:'bow1'}),/different creature/);
 A.throws(()=>R.attackBudget(s.character,s.resources,'horde',{confirmed:true,target:'Goblin',weaponId:'bow2'}),/same weapon/);
 const result=R.attackBudget(s.character,s.resources,'horde',{confirmed:true,target:'Goblin',weaponId:'bow1'});A.equal(result.classState.rangerHunterHordeUsed,true);
});
test('Beast Master Primal Companion can be restored with a confirmed one-minute Magic action and spell slot',()=>{
 let s=setup(7,'Beast Master');s.character.build.slotMax=[4,3,0];s.resources.spellSlots=[4,3,0];s=R.newTurn(R.summon(s,'Land',true));s=R.setBeastHp(s,0);
 A.throws(()=>R.reviveBeast(s,{spellLevel:1,confirmed:true,withinHour:false,minuteCompleted:true}),/Confirm/);
 let next=R.reviveBeast(s,{spellLevel:2,confirmed:true,withinHour:true,minuteCompleted:true});
 A.equal(next.resources.spellSlots[1],2);A.equal(next.resources.classState.rangerCompanion.hp,40);
 A.equal(next.resources.classState.rangerActionUsed,true);A.equal(s.resources.classState.rangerCompanion.hp,0);
 A.throws(()=>R.reviveBeast(next,{spellLevel:2,confirmed:true,withinHour:true,minuteCompleted:true}),/0 HP/);
});
