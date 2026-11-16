(function(root){'use strict';
// Verified SRD 5.2.1 mechanics for the single-class 2024 builder.
// This is deliberately NOT a complete implementation of every class feature.
if(typeof require==='function'&&!root.FolioPaladinCombat)require('./paladin-combat.js');
if(typeof require==='function'&&!root.FolioBarbarian2024)require('./barbarian-2024.js');
if(typeof require==='function'&&!root.FolioRogue2024)require('./rogue-2024.js');
if(typeof require==='function'&&!root.FolioRanger2024)require('./ranger-2024.js');
if(typeof require==='function'&&!root.FolioBard2024)require('./bard-2024.js');
if(typeof require==='function'&&!root.FolioDruid2024)require('./druid-2024.js');
if(typeof require==='function'&&!root.FolioSorcerer2024)require('./sorcerer-2024.js');
if(typeof require==='function'&&!root.FolioWarlock2024)require('./warlock-2024.js');
const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
const cls=c=>c?.templateKind==='starter'?(c.build?.characterClass||c.className||''):'';
const level=c=>clamp(Number(c?.level)||1,1,20);
const mod=n=>Math.floor((Number(n)-10)/2);
const entry=(key,name,max,reset,shortGain=0,note='')=>({key,name,max,reset,shortGain,note});
function resourcesFor(c){
 const n=level(c),name=cls(c);if(!name)return [];
 switch(name){
  case 'Barbarian':return [entry('rage','Rage',n<3?2:n<6?3:n<12?4:n<17?5:6,'long',1,'Bonus Action; no spells or concentration while raging'),...(root.FolioBarbarian2024?.zealot(c)&&n>=3?[entry('warrior-of-the-gods','Warrior of the Gods',n>=17?7:n>=12?6:n>=6?5:4,'long',0,'d12 self-healing dice; Bonus Action')]:[]),...(root.FolioBarbarian2024?.zealot(c)&&n>=10?[entry('zealous-presence','Zealous Presence (free)',1,'long',0,'Advantage for up to 10 nearby allies')]:[]),...(root.FolioBarbarian2024?.zealot(c)&&n>=14?[entry('rage-of-the-gods','Rage of the Gods',1,'long',0,'Once per Long Rest; 1-minute divine form')]:[]),...(berserker(c)&&n>=14?[entry('intimidating-presence','Intimidating Presence (free)',1,'long',0,'Once per Long Rest, or restore the use by spending one Rage use')]:[])];
  case 'Bard':return [entry('bardic-inspiration','Bardic Inspiration',Math.max(1,mod(c.scores.cha)),n>=5?'short':'long',0,'Bonus Action; d6 → d8 (5) → d10 (10) → d12 (15)')];
  case 'Cleric':return [...(n>=2?[entry('channel-divinity','Channel Divinity',n>=18?4:n>=6?3:2,'long',1,'Regain one expended use on a Short Rest')]:[]),...(n>=3&&root.FolioCleric2024?.light(c)?[entry('cleric-warding-flare','Warding Flare',Math.max(1,mod(c.scores.wis)),n>=6?'short':'long',0,'Defensive Reaction')]:[]),...(n>=17&&root.FolioCleric2024?.light(c)?[entry('cleric-corona','Corona of Light',Math.max(1,mod(c.scores.wis)),'long',0,'One-minute sunlight aura')]:[]),...(n>=3&&root.FolioCleric2024?.war(c)?[entry('cleric-war-priest','War Priest',Math.max(1,mod(c.scores.wis)),'short',0,'Bonus Action attack')]:[]),...(n>=10?[entry('cleric-divine-intervention','Divine Intervention',1,'long',0,'Free Cleric spell; Wish available at level 20 with extended recovery')]:[])];
  case 'Druid':return [...(n>=2?[entry('wild-shape','Wild Shape',n>=17?4:n>=6?3:2,'long',1,'Regain one expended use on a Short Rest'),...(circleLand(c)&&n>=6?[entry('land-recovery','Natural Recovery (slots)',1,'long',0,'After Short Rest: recover a combined ceil(Druid level/2) slot levels'),entry('land-free-spell','Natural Recovery (free Circle spell)',1,'long',0,'One prepared Circle spell of level 1+ without a spell slot')]:[]),...(n>=5?[entry('wild-resurgence-slot','Wild Resurgence: level 1 slot',1,'long',0,'Once per Long Rest: exchange one Wild Shape use for one level 1 spell slot')]:[])]:[]),...(root.FolioDruid2024?.moon(c)&&n>=10?[entry('druid-moonlight-step','Moonlight Step',Math.max(1,mod(c.scores.wis)),'long',0,'Bonus Action teleport up to 30 feet')]:[]),...(root.FolioDruid2024?.stars(c)?[entry('druid-star-bolt','Star Map free Guiding Bolt',Math.max(1,mod(c.scores.wis)),'long',0,'Free Guiding Bolt cast'),...(n>=6?[entry('druid-cosmic-omen','Cosmic Omen',Math.max(1,mod(c.scores.wis)),'long',0,'Weal/Woe Reaction after omen roll')]:[])]:[])];
  case 'Fighter':return [entry('second-wind','Second Wind',n>=10?4:n>=4?3:2,'long',1,'Bonus Action: heal 1d10 + Fighter level'),...(n>=2?[entry('action-surge','Action Surge',n>=17?2:1,'short',0,'Extra action; not the Magic action')]:[]),...(n>=9?[entry('indomitable','Indomitable',n>=17?3:n>=13?2:1,'long',0,'Reroll a failed save with a Fighter-level bonus')]:[]),...((c.build?.subclass||c.subclass)==='Battle Master'&&n>=3?[entry('superiority-dice','Superiority Dice',n>=15?6:n>=7?5:4,'short',0,'d8 / d10 at level 10 / d12 at 18; selected maneuvers'),...(n>=7?[entry('know-your-enemy','Know Your Enemy (free)',1,'long',0,'Bonus Action; inspect confirmed creature resistances and immunities')]:[])]:[]),...((c.build?.subclass||c.subclass)==='Psi Warrior'&&n>=3?[entry('psionic-energy','Psionic Energy Dice',n>=17?12:n>=13?10:n>=9?8:n>=5?6:4,'long',1,'d6 / d8 at level 5 / d10 at level 11 / d12 at 17'),entry('telekinetic-movement','Telekinetic Movement (free)',1,'short'),...(n>=7?[entry('psi-powered-leap','Psi-Powered Leap (free)',1,'short')]:[]),...(n>=15?[entry('bulwark-of-force','Bulwark of Force (free)',1,'long')]:[]),...(n>=18?[entry('telekinetic-master','Telekinetic Master (free)',1,'long')]:[])]:[])];
  case 'Monk':return [...(root.FolioMonk2024?.mercy(c)&&n>=17?[entry('monk-mercy-ultimate','Hand of Ultimate Mercy',1,'long',0,'5 Focus; revive confirmed recent corpse')]:[]),...(openHand(c)&&n>=6?[entry('wholeness-of-body','Wholeness of Body',Math.max(1,mod(c.scores.wis)),'long',0,'Bonus Action: heal Martial Arts die + Wisdom modifier')]:[]),...(n>=2?[entry('focus-points','Focus Points',n,'short',0,'Flurry of Blows, Patient Defense, Step of the Wind and other features'),entry('uncanny-metabolism','Uncanny Metabolism',1,'long',0,'At initiative: refill Focus and heal Monk level + Martial Arts die')]:[])];
  case 'Paladin':return [...(devotion(c)&&n>=20?[entry('holy-nimbus','Holy Nimbus',1,'long',0,'Bonus Action, 10 min; restore use with a level 5 slot')]:[]),...(glory(c)&&n>=15?[entry('glorious-defense','Glorious Defense',Math.max(1,mod(c.scores.cha)),'long',0,'Reaction: grant Charisma modifier AC against a triggering hit')]:[]),...(glory(c)&&n>=20?[entry('living-legend','Living Legend',1,'long',0,'Bonus Action for 10 minutes; can restore with level 5 spell slot')]:[]),...(ancients(c)&&n>=15?[entry('undying-sentinel','Undying Sentinel',1,'long',0,'When a nonlethal blow would reduce you to 0 HP, recover 1 + three times Paladin level HP')]:[]),...(ancients(c)&&n>=20?[entry('elder-champion','Elder Champion',1,'long',0,'Bonus Action for 1 minute; can restore with level 5 spell slot')]:[]),...(vengeance(c)&&n>=20?[entry('avenging-angel','Avenging Angel',1,'long',0,'Bonus Action for 10 minutes; can restore with level 5 spell slot')]:[]),entry('lay-on-hands','Lay On Hands',n*5,'long',0,'Hit-point pool, spent in amounts rather than uses'),...(n>=2?[entry('divine-smite-free','Paladin’s Smite (free)',1,'long',0,'Once per Long Rest: cast Divine Smite after a confirmed melee hit without expending a slot')]:[]),...(n>=5?[entry('faithful-steed-free','Faithful Steed (free)',1,'long',0,'Once per Long Rest: cast Find Steed without a slot; mount is resolved at the table')]:[]),...(n>=3?[entry('channel-divinity','Channel Divinity',n>=11?3:2,'long',1,'Regain one expended use on a Short Rest')]:[])];
  case 'Rogue':return [...(n>=20?[entry('stroke-of-luck','Stroke of Luck',1,'short',0,'Convert failed d20 Test to natural 20')]:[]),...(root.FolioRogue2024?.soul(c)?[entry('rogue-psionic-energy','Soulknife Psionic Energy Dice',root.FolioRogue2024.energyMax(n),'long',1,'Die size scales d6/d8/d10/d12'),...(n>=13?[entry('rogue-psychic-veil','Psychic Veil (free)',1,'long')]:[]),...(n>=17?[entry('rogue-rend-mind','Rend Mind (free)',1,'long')]:[])]:[]),...(root.FolioRogue2024?.trickster(c)&&n>=17?[entry('rogue-spell-thief','Spell Thief',1,'long')]:[])];
  case 'Ranger':return [...(root.FolioRanger2024?.gloom(c)?[entry('ranger-dread-ambusher','Dread Ambusher',Math.max(1,mod(c.scores.wis)),'long',0,'On a confirmed hit, add Psychic damage')]:[]),...(root.FolioRanger2024?.fey(c)&&n>=11?[entry('ranger-fey-reinforcements','Fey Reinforcements',1,'long',0,'Free Summon Fey spell')]:[]),...(root.FolioRanger2024?.fey(c)&&n>=15?[entry('ranger-misty-wanderer','Misty Wanderer',Math.max(1,mod(c.scores.wis)),'long',0,'Free Misty Step with ally')]:[]),entry('favored-enemy','Favored Enemy: Hunter’s Mark',n>=17?6:n>=13?5:n>=9?4:n>=5?3:2,'long',0,'Free casts of Hunter’s Mark; use Cast Hunter’s Mark to actually activate it'),...(n>=10?[entry('tireless','Tireless',Math.max(1,mod(c.scores.wis)),'long',0,'Magic action: receive 1d8 + Wisdom modifier temporary HP (minimum 1)')]:[]),...(n>=14?[entry('natures-veil','Nature’s Veil',Math.max(1,mod(c.scores.wis)),'long',0,'Bonus Action: Invisible through the end of your next turn; track turn timing manually')]:[])];
  case 'Sorcerer':return [entry('innate-sorcery','Innate Sorcery',2,'long',0,'Bonus Action, 1 minute; +1 Sorcerer spell save DC and attack Advantage'),...(n>=2?[entry('sorcery-points','Sorcery Points',n,'long',0,'Font of Magic and Metamagic')]:[]),...(n>=5?[entry('sorcerous-restoration','Sorcerous Restoration',1,'long',0,'After a Short Rest, regain at most half Sorcerer level in points')]:[]),...(root.FolioSorcerer2024?.clockwork(c)?[entry('sorcerer-balance','Restore Balance',Math.max(1,mod(c.scores.cha)),'long',0,'Reaction, removes Advantage and Disadvantage')]:[]),...(root.FolioSorcerer2024?.clockwork(c)&&n>=14?[entry('sorcerer-trance','Trance of Order',1,'long',0,'One minute, free then 5 Sorcery Points')]:[]),...(root.FolioSorcerer2024?.clockwork(c)&&n>=18?[entry('sorcerer-cavalcade','Clockwork Cavalcade',1,'long',0,'Magic Action, free then 7 Sorcery Points')]:[]),...(root.FolioSorcerer2024?.aberrant(c)&&n>=18?[entry('sorcerer-warp','Warping Implosion',1,'long',0,'Magic Action, free then 5 Sorcery Points')]:[]),...(draconic(c)&&n>=14?[entry('dragon-wings','Dragon Wings (free)',1,'long',0,'Bonus Action, 1 hour, then 3 Sorcery Points')]:[]),...(draconic(c)&&n>=18?[entry('sorcerer-dragon-companion','Dragon Companion free Summon Dragon',1,'long',0,'Free Summon Dragon, optionally without Concentration')]:[])];
  case 'Warlock':return [...(root.FolioWarlock2024?.resourcesFor(c)||[]),...(n>=2?[entry('magical-cunning','Magical Cunning',1,'long',0,'1-minute rite: recover up to half Pact slots rounded up')]:[]),...(fiend(c)&&n>=6?[entry('dark-ones-luck',"Dark One’s Own Luck",Math.max(1,mod(c.scores.cha)),'long',0,'After seeing an ability check or saving throw, add 1d10 before effects occur')]:[])];
  case 'Wizard':return [entry('arcane-recovery','Arcane Recovery',1,'long',0,'After Short Rest, recover spell slots totalling ceil(Wizard level / 2), each below level 6')];
  default:return [];
 }
}
function normalizeResources(c,values={},oldC=null){
 const oldSpecs=new Map(resourcesFor(oldC).map(x=>[x.key,x]));
 const out={};for(const spec of resourcesFor(c)){
  const oldMax=oldSpecs.get(spec.key)?.max;
  const current=Number.isInteger(values?.[spec.key])?values[spec.key]:spec.max;
  // On level up, new capacity is added without erasing previously spent uses.
  out[spec.key]=clamp(current+(oldMax===undefined?0:Math.max(0,spec.max-oldMax)),0,spec.max);
 }return out;
}
function restClassState(c,previous={},kind='short'){
 if(cls(c)==='Bard')return root.FolioBard2024?.restState(c,previous,kind)||previous;
 if(cls(c)==='Druid')return root.FolioDruid2024?.restState(c,previous,kind)||previous;
 if(cls(c)==='Sorcerer')return root.FolioSorcerer2024?.restState(c,previous,kind)||previous;
 if(cls(c)==='Warlock')return root.FolioWarlock2024?.restState(c,previous,kind)||previous;
 if(cls(c)==='Wizard')return root.FolioWizard2024?.restState(c,previous,kind)||previous;
 if(cls(c)==='Monk')return root.FolioMonk2024?.restState(c,previous,kind)||previous;
 if(cls(c)==='Cleric')return root.FolioCleric2024?.restState(c,previous,kind)||previous;
 if(cls(c)==='Ranger')return root.FolioRanger2024?.restState(c,previous,kind)||previous;
 // Rogue turn/encounter flags are cleared at rests; persistent user choices remain.
 if(cls(c)==='Rogue'){const f={...previous,rogueTurnTracking:false,rogueActionUsed:false,rogueBonusUsed:false,rogueAttackUsed:false,rogueLightUsed:false,rogueSteadyAim:false,rogueSpeedZero:false,rogueMoved:false,roguePsychicMain:false,roguePsychicBonus:false,reactionUsed:false,sneakAttackUsed:false,rogueRound:0,thiefSecondTurnUsed:false,rogueVeilActive:false};return kind==='long'?{...f,rogueWhispersFreeUsed:false,rogueStolenSpell:null,rogueStolenSpellHours:0}:f;}
 if(!['short','long'].includes(kind))throw Error('Unknown rest type.');
 if(kind==='short')return {...(root.FolioBarbarian2024?.restState(c,previous,'short')||previous),fighterFeintTarget:null,fighterFeintDie:0,fighterLungeDie:0,fighterEvasiveBonus:0,fighterBaitBonus:0,fighterBaitSelf:false,psiLeapActive:false,psiBulwarkActive:false,psiBulwarkRounds:0,psiTelekinesisActive:false,warMagicPending:null,fighterTurnTracking:false,fighterAttackRolls:0,fighterAttackActionInProgress:false,fighterActionUsed:false,fighterBonusActionUsed:false,fighterSurgeActions:0,fighterExtraUsed:false,fighterRelentlessUsed:false,fighterPsiStrikeUsed:false,fighterTelekinesisBonusUsed:false,paladinTurnTracking:false,paladinActionUsed:false,paladinBonusActionUsed:false,paladinSpellSlotUsed:false,paladinAttackRolls:0,paladinAttackActionInProgress:false,paladinLightExtraUsed:false,paladinLightTriggerWeapon:null,natureWrathPending:0,paladinExternalEffects:[],paladinTimedEffects:{},paladinRecentlyExpired:[],paladinProtectionTarget:null,paladinUnarmedGrappleUsed:false,divineSenseActive:false,raging:false,innateSorcery:false,reactionUsed:false,naturesVeilActive:false,dragonWingsActive:false,relentlessDC:10,sacredWeaponId:null,holyNimbusActive:false,smiteProtectionActive:false,gloryCounterattackPending:false,gloryLegendHitUsed:false,gloryAthleteActive:false,livingLegendActive:false,elderChampionActive:false,avengingAngelActive:false,vowTarget:null,hunterDefenseType:null,openHandHitsLeft:0};
 // Persistent selected options and Quivering Palm vibrations are not single-rest counters.
 return {...(root.FolioBarbarian2024?.restState(c,previous,'long')||{}),...(cls(c)==='Fighter'?{fighterKnownManeuvers:previous.fighterKnownManeuvers||[],fighterBondedWeapons:previous.fighterBondedWeapons||[],fighterStudentSkill:previous.fighterStudentSkill||'',fighterStudentTool:previous.fighterStudentTool||'',fighterTurnTracking:false,fighterAttackRolls:0,fighterAttackActionInProgress:false,fighterActionUsed:false,fighterBonusActionUsed:false,fighterSurgeActions:0,fighterRelentlessUsed:false,fighterPsiStrikeUsed:false,fighterFeintTarget:null,fighterFeintDie:0,fighterLungeDie:0,fighterEvasiveBonus:0,fighterBaitBonus:0,fighterBaitSelf:false,psiLeapActive:false,psiBulwarkActive:false,psiBulwarkRounds:0,psiTelekinesisActive:false,warMagicPending:null}:{}),raging:false,paladinTimedEffects:{},paladinRecentlyExpired:[],paladinProtectionTarget:null,paladinUnarmedGrappleUsed:false,...(hunter(c)?{hunterPrey:previous.hunterPrey||null,hunterDefense:previous.hunterDefense||null}:{}),...(fiend(c)?{fiendResistance:previous.fiendResistance||null}:{}),...(openHand(c)&&previous.quiveringPalmTarget?{quiveringPalmTarget:previous.quiveringPalmTarget}:{})};
}
function adjust(c,values,key,delta){const spec=resourcesFor(c).find(x=>x.key===key);if(!spec||!Number.isInteger(delta)||Math.abs(delta)>9999)throw Error('Invalid class resource.');const current=Number.isInteger(values?.[key])?values[key]:spec.max;return {...values,[key]:clamp(current+delta,0,spec.max)};}
function rest(c,values={},kind){
 if(!['short','long'].includes(kind))throw Error('Unknown rest type.');const result={...values};
 for(const spec of resourcesFor(c)){
  const before=Number.isInteger(values?.[spec.key])?values[spec.key]:spec.max;
  result[spec.key]=kind==='long'||spec.reset==='short'?spec.max:clamp(before+spec.shortGain,0,spec.max);
 }
 return result;
}
// SRD 5.2.1 pp. 29–30: Barbarian Reckless Attack and Berserker Frenzy / Mindless Rage.
function berserker(c){return cls(c)==='Barbarian'&&level(c)>=3&&(c.subclass==='Berserker'||c.build?.subclass==='Berserker');}
function mindlessRage(c,r){return berserker(c)&&level(c)>=6&&!!r?.classState?.raging;}
function lifeDomain(c){return cls(c)==='Cleric'&&level(c)>=3&&(c.subclass==='Life Domain'||c.build?.subclass==='Life Domain');}
function draconic(c){return cls(c)==='Sorcerer'&&level(c)>=3&&(c.subclass==='Draconic Sorcery'||c.build?.subclass==='Draconic Sorcery');}
function fiend(c){return cls(c)==='Warlock'&&level(c)>=3&&(c.subclass==='Fiend Patron'||c.build?.subclass==='Fiend Patron');}
function lore(c){return cls(c)==='Bard'&&level(c)>=3&&(c.subclass==='College of Lore'||c.build?.subclass==='College of Lore');}
function circleLand(c){return cls(c)==='Druid'&&level(c)>=3&&(c.subclass==='Circle of the Land'||c.build?.subclass==='Circle of the Land');}
function evoker(c){return cls(c)==='Wizard'&&level(c)>=3&&(c.subclass==='Evoker'||c.build?.subclass==='Evoker');}
function devotion(c){return cls(c)==='Paladin'&&level(c)>=3&&(c.subclass==='Oath of Devotion'||c.build?.subclass==='Oath of Devotion');}
function glory(c){return cls(c)==='Paladin'&&level(c)>=3&&(c.subclass==='Oath of Glory'||c.build?.subclass==='Oath of Glory');}
function ancients(c){return cls(c)==='Paladin'&&level(c)>=3&&(c.subclass==='Oath of the Ancients'||c.build?.subclass==='Oath of the Ancients');}
function vengeance(c){return cls(c)==='Paladin'&&level(c)>=3&&(c.subclass==='Oath of Vengeance'||c.build?.subclass==='Oath of Vengeance');}
function hunter(c){return cls(c)==='Ranger'&&level(c)>=3&&(c.subclass==='Hunter'||c.build?.subclass==='Hunter');}
function openHand(c){return cls(c)==='Monk'&&level(c)>=3&&(c.subclass==='Warrior of the Open Hand'||c.build?.subclass==='Warrior of the Open Hand');}
const HUNTER_PREY=Object.freeze(['colossus','horde']);
const HUNTER_DEFENSE=Object.freeze(['escape','multiattack']);
// 2024 SRD: one slot expended to cast a spell per TURN; each creature normally
// has one Action and one Bonus Action on its own turn. This tracker is opt-in
// outside initiative, and is only enforced once started. It never guesses what
// other characters have done. Reaction usage remains shared with existing code.
function paladinNewTurn(state){
 if(cls(state.character)!=='Paladin')throw Error('Paladin turn tracking requires a Paladin.');
 const r=state.resources,flags=paladinDurationAdvance(r.classState||{});
 const regen=ancients(state.character)&&level(state.character)>=20&&flags.elderChampionActive&&r.hp>0?Math.min(10,r.maxHp-r.hp):0;
 return {...state,resources:{...r,hp:r.hp+regen,...(regen?{lastClassEffect:{feature:'Elder Champion regeneration',healed:regen}}:{}),classState:{...flags,paladinTurnTracking:true,paladinActionUsed:false,paladinBonusActionUsed:false,paladinSpellSlotUsed:false,reactionUsed:false,paladinAttackRolls:0,paladinAttackActionInProgress:false,paladinLightTriggerWeapon:null,paladinLightExtraUsed:false,gloryLegendHitUsed:false,gloryCounterattackPending:false,smiteProtectionActive:false,paladinProtectionTarget:null,paladinUnarmedGrappleUsed:false}}};
}
function paladinTurnMark(r,kind='none',slot=false){
 const f=r.classState||{};
 if(!f.paladinTurnTracking)return {...f};
 if(!['none','action','bonus','reaction'].includes(kind))throw Error('Unrecognized Paladin action type.');
 if(kind!=='none'&&!paladinCanAct(r))throw Error('Cannot take this action while Incapacitated or at 0 HP.');
 if(kind==='action'&&f.paladinActionUsed)throw Error('Your Action has already been used this tracked turn.');
 if(kind==='bonus'&&f.paladinBonusActionUsed)throw Error('Your Bonus Action has already been used this tracked turn.');
 if(kind==='reaction'&&f.reactionUsed)throw Error('Your Reaction has already been used.');
 if(slot&&f.paladinSpellSlotUsed)throw Error('You can expend only one spell slot to cast a spell on the same turn.');
 return {...f,...(kind==='action'?{paladinActionUsed:true}:{}),...(kind==='bonus'?{paladinBonusActionUsed:true}:{}),...(kind==='reaction'?{reactionUsed:true}:{}),...(slot?{paladinSpellSlotUsed:true}:{})};
}
function paladinAttackActionAllowed(r){
 if(r.classState?.paladinTurnTracking&&r.classState.paladinActionUsed&&!r.classState.paladinAttackActionInProgress)throw Error('Your Action has already been used; this feature requires the Attack action.');
 if(r.classState?.paladinTurnTracking&&!paladinCanAct(r))throw Error('Cannot take the Attack action while Incapacitated or at 0 HP.');
}
function paladinSpellTiming(spell,cost){
 if(cost==='ritual')return 'none'; // A ritual takes minutes; manual ongoing actions.
 const time=String(spell?.time||spell?.castingTime||'').trim().toLowerCase();
 if(/bonus action/.test(time))return 'bonus';
 if(/reaction/.test(time))return 'reaction';
 if(/^(?:1\s*)?action$/.test(time))return 'action';
 return 'none'; // Long/unknown times still need table adjudication.
}
function recordPaladinSpellCast(state,spell,cost,{swift=false,confirmedTime=''}={}){
 if(cls(state.character)!=='Paladin')return state;
 const r=state.resources,slot=/^slot[1-9]$/.test(cost);
 let normalKind=paladinSpellTiming(spell,cost);
 // Reference-only spells may lack their casting time; require a verified
 // action type during tracked combat rather than silently treating it as free.
 const time=String(spell?.time||spell?.castingTime||'').toLowerCase();
 const longTime=cost==='ritual'||/minute|hour|day|round|ritual/.test(time);
 if(normalKind==='none'&&!longTime&&r.classState?.paladinTurnTracking){
  if(!['action','bonus','reaction'].includes(confirmedTime))throw Error('Confirm the spell’s casting time from your sourcebook before casting in a tracked Paladin turn.');
  normalKind=confirmedTime;
 }

 if(swift&&(!ancients(state.character)||level(state.character)<20||!r.classState?.elderChampionActive||normalKind!=='action'))throw Error('Swift Spells requires active Elder Champion and a spell with a verified Action casting time.');
 const kind=swift?'bonus':normalKind;
 if(r.classState?.paladinTurnTracking&&!paladinCanAct(r))throw Error('Cannot cast while Incapacitated or at 0 HP.');
 // Reaction spells can be cast on another creature's turn. Never misapply the
 // Paladin's own-turn slot counter to that off-turn event.
 const newFlags=paladinTurnMark(r,kind,slot&&kind!=='reaction');
 return {...state,resources:{...r,classState:newFlags}};
}
// 2024 Paladin temporary effects: record durations as 6-second combat rounds.
// Only an explicitly tracked turn advances this clock. Outside initiative,
// duration is displayed for player/DM confirmation rather than guessed.
const PALADIN_DURATION_ROUNDS=Object.freeze({
 divineSenseActive:100,sacredWeaponId:100,gloryAthleteActive:600,vowTarget:10,
 holyNimbusActive:100,livingLegendActive:100,elderChampionActive:10,avengingAngelActive:100
});
function paladinDurationStart(flags,key){
 const rounds=PALADIN_DURATION_ROUNDS[key];if(!rounds)throw Error('Unknown timed Paladin feature.');
 return {...flags,paladinTimedEffects:{...(flags.paladinTimedEffects||{}),[key]:{roundsRemaining:rounds,startedAtTurn:flags.paladinTurnNumber||0}}};
}
function paladinDurationEnd(flags,key){const timed={...(flags.paladinTimedEffects||{})};delete timed[key];return {...flags,paladinTimedEffects:timed,[key]:['vowTarget','sacredWeaponId'].includes(key)?null:false};}
function paladinDurationAdvance(flags){
 const turn=(flags.paladinTurnNumber||0)+1,timed={},expired=[];
 let result={...flags,paladinTurnNumber:turn};
 for(const [key,value] of Object.entries(flags.paladinTimedEffects||{})){
  if(!(key in PALADIN_DURATION_ROUNDS)||!value||!Number.isInteger(value.roundsRemaining))continue;
  const remaining=value.roundsRemaining-(turn>(value.startedAtTurn||0)?1:0);
  if(remaining<=0){expired.push(key);result[key]=['vowTarget','sacredWeaponId'].includes(key)?null:false;}
  else timed[key]={...value,roundsRemaining:remaining};
 }
 result.paladinTimedEffects=timed;
 return {...result,paladinRecentlyExpired:expired};
}
// SRD 5.2.1 pp. 56-57: Sacred Weapon, Aura of Devotion and Holy Nimbus.
function activateSacredWeapon(state,weaponId){
 const c=state.character,r=state.resources;
 if(!devotion(c))throw Error('Sacred Weapon requires Oath of Devotion level 3.');
 paladinAttackActionAllowed(r);
 const item=state.inventory?.items?.find(w=>w.id===weaponId);
 if(!item||item.category!=='weapon'||item.weapon?.kind!=='Melee'||!item.equipped||!item.quantity)throw Error('Sacred Weapon requires a held and equipped Melee weapon.');
 if((r.classResources?.['channel-divinity']??resourcesFor(c).find(x=>x.key==='channel-divinity')?.max??0)<1)throw Error('No Channel Divinity uses left.');
 return {...state,resources:{...r,classResources:adjust(c,r.classResources||{},'channel-divinity',-1),classState:paladinDurationStart({...root.FolioPaladinCombat.claimAttackAction(r),sacredWeaponId:weaponId},'sacredWeaponId'),lastClassEffect:{feature:'Sacred Weapon',weapon:item.name,attackBonus:Math.max(1,mod(c.scores.cha)),note:'10 minutes or until ended/not carried. Attacks with this weapon gain this bonus; choose Radiant or normal damage type at the table.'}}};
}
function endSacredWeapon(state){
 if(!devotion(state.character))throw Error('Sacred Weapon requires Oath of Devotion.');
 return {...state,resources:{...state.resources,classState:paladinDurationEnd(state.resources.classState||{},'sacredWeaponId')}};
}
function useHolyNimbus(state,mode='free'){
 const c=state.character,r=state.resources;
 if(!devotion(c)||level(c)<20)throw Error('Holy Nimbus requires Oath of Devotion level 20.');
 if(r.classState?.holyNimbusActive)return {...state,resources:{...r,classState:paladinDurationEnd(r.classState||{},'holyNimbusActive')}};
 if(!['free','slot'].includes(mode))throw Error('Select a Holy Nimbus cost.');
 let classResources={...r.classResources},slots=[...(r.spellSlots||c.build?.slotMax||[])];
 if((classResources['holy-nimbus']??1)<1){if(mode!=='slot'||!slots[4])throw Error('No Holy Nimbus use or level 5 slot available.');slots[4]--;}
 else if(mode==='slot')throw Error('Use the free Holy Nimbus charge first.');
 classResources['holy-nimbus']=0;
 return {...state,resources:{...r,spellSlots:slots,classResources,classState:paladinDurationStart({...paladinTurnMark(r,'bonus'),holyNimbusActive:true},'holyNimbusActive'),lastClassEffect:{feature:'Holy Nimbus',note:'For 10 minutes: Fiend/Undead-caused saves Advantage; enemies starting within aura take CHA+PB Radiant damage; aura emits sunlight. Track affected creatures manually.'}}};
}
// 2024 Player's Handbook, Paladin subclasses, pp. 115–117 (first printing).
// Original app logic, not a reproduction of the book; external creature effects remain DM-controlled.
// SRD 5.2.1 p. 55: Channel Divinity options shared by ALL 2024 Paladins.
// Enemy positions, line-of-sight and creature saves remain player/DM-confirmed.
const PALADIN_INCAPACITATING=new Set(['Incapacitated','Paralyzed','Petrified','Stunned','Unconscious']);
function paladinCanAct(resources){return !((resources?.conditions||[]).some(x=>PALADIN_INCAPACITATING.has(x))||(resources?.hp??1)<=0);}
function activateDivineSense(state){
 const c=state.character,r=state.resources;
 if(cls(c)!=='Paladin'||level(c)<3)throw Error('Divine Sense requires Paladin level 3.');
 if(!paladinCanAct(r))throw Error('Cannot activate Divine Sense while Incapacitated or at 0 HP.');
 if(r.classState?.divineSenseActive)throw Error('Divine Sense is already active; end it before activating again.');
 if((r.classResources?.['channel-divinity']??0)<1)throw Error('No Channel Divinity uses left.');
 return {...state,resources:{...r,classResources:adjust(c,r.classResources||{},'channel-divinity',-1),classState:paladinDurationStart({...paladinTurnMark(r,'bonus'),divineSenseActive:true},'divineSenseActive'),lastClassEffect:{feature:'Divine Sense',range:60,durationMinutes:10,note:'Bonus Action; for up to 10 minutes sense Celestials, Fiends, Undead and consecrated or desecrated places/objects within 60 feet. Location and creature types confirmed by DM; ends if Incapacitated.'}}};
}
function endDivineSense(state){
 const c=state.character,r=state.resources;
 if(cls(c)!=='Paladin'||level(c)<3)throw Error('Divine Sense requires Paladin level 3.');
 return {...state,resources:{...r,classState:paladinDurationEnd(r.classState||{},'divineSenseActive'),lastClassEffect:{feature:'Divine Sense ended',note:'Divine Sense ended; Channel Divinity is not refunded.'}}};
}
function abjureFoes(state,targets=[]){
 const c=state.character,r=state.resources;
 if(cls(c)!=='Paladin'||level(c)<9)throw Error('Abjure Foes requires Paladin level 9.');
 if(!paladinCanAct(r))throw Error('Cannot use Abjure Foes while Incapacitated or at 0 HP.');
 if((r.classResources?.['channel-divinity']??0)<1)throw Error('No Channel Divinity uses left.');
 const limit=Math.max(1,mod(c.scores.cha));
 if(!Array.isArray(targets)||targets.length<1||targets.length>limit)throw Error('Abjure Foes targets 1–'+limit+' visible creatures (Charisma modifier minimum one).');
 const names=new Set();
 const resolved=targets.map(t=>{
  if(!t||typeof t.name!=='string'||!t.name.trim()||t.name.trim().length>80||t.visibleWithin60!==true)throw Error('Each Abjure Foes target needs a name and confirmation it is visible within 60 feet.');
  const name=t.name.trim(),key=name.toLowerCase();
  if(names.has(key))throw Error('Choose each Abjure Foes creature only once.');
  names.add(key);
  const total=t.wisdomSaveTotal;
  if(!Number.isInteger(total)||total<0||total>200)throw Error('Enter each target’s full Wisdom saving-throw total (0–200).');
  return {name,wisdomSaveTotal:total};
 });
 const core=root.PipCore||(typeof require==='function'?require('./core.js'):null);
 const dc=core.derived(c,state.inventory,r).spellDC;
 const outcomes=resolved.map(t=>({...t,failed:t.wisdomSaveTotal<dc,frightened:t.wisdomSaveTotal<dc}));
 const oldEffects=(r.classState?.paladinExternalEffects||[]).filter(x=>!outcomes.some(t=>t.failed&&t.name.toLowerCase()===x.target.toLowerCase()&&x.source==='Abjure Foes'));
 const newEffects=outcomes.filter(t=>t.failed).map(t=>({source:'Abjure Foes',target:t.name,condition:'Frightened',turnsRemaining:10}));
 return {...state,resources:{...r,classResources:adjust(c,r.classResources||{},'channel-divinity',-1),classState:{...paladinTurnMark(r,'action'),paladinExternalEffects:[...oldEffects,...newEffects].slice(-30)},lastClassEffect:{feature:'Abjure Foes',saveDC:dc,targetCount:outcomes.length,targets:outcomes,note:'Magic action: failed Wisdom saves cause Frightened for up to 1 minute or until any damage; affected creatures can move, take an action, OR a Bonus Action on a turn. DM tracks enemy status and ending.'}}};
}
// 2024 PHB, Oath of Glory level 20: failed-save reroll is a Reaction; new roll is mandatory.
function livingLegendSaveReroll(state,{ability,initialTotal,dc}={},die){
 const c=state.character,r=state.resources;
 if(!glory(c)||level(c)<20||!r.classState?.livingLegendActive)throw Error('Saving Throw Reroll requires active Living Legend at Paladin level 20.');
 if(!paladinCanAct(r))throw Error('Cannot take a Reaction while Incapacitated or at 0 HP.');
 if(r.classState?.reactionUsed)throw Error('Reaction already spent.');
 if(!['str','dex','con','int','wis','cha'].includes(ability))throw Error('Select the saving throw ability.');
 if(!Number.isInteger(initialTotal)||initialTotal< -100||initialTotal>200||!Number.isInteger(dc)||dc<1||dc>100||initialTotal>=dc)throw Error('Enter a failed saving-throw total and its DC.');
 if(!Number.isInteger(die)||die<1||die>20)throw Error('The reroll must be a d20 result.');
 const core=root.PipCore||(typeof require==='function'?require('./core.js'):null);
 const modifier=core.derived(c,state.inventory,r).saves[ability];
 const total=die+modifier;
 return {...state,resources:{...r,classState:{...r.classState,reactionUsed:true},lastClassEffect:{feature:'Living Legend Saving Throw Reroll',ability,initialTotal,dc,die,modifier,total,success:total>=dc,note:'Reaction spent. MUST use the new d20 + current saving-throw modifier, even if the new result is worse; other situational bonuses/penalties require DM confirmation.'}}};
}

// 2024 Paladin auras are emanations centered on the Paladin (10 ft, 30 ft at 18).
// Other creatures do not have full character sheets in Folio, so ally calculations
// use confirmed inputs and are recorded as a result snapshot, never as ally HP or conditions.
function resolvePaladinAllyAura(state,{allyName,distanceFeet,kind,baseTotal,dc,ability='wis',damageType='',condition='',alreadyCovered=false,otherPaladinAuraApplied=false,alreadyResistant=false}={}){
 const c=state.character,r=state.resources,n=level(c);
 if(cls(c)!=='Paladin'||n<6)throw Error('Ally aura requires Paladin level 6.');
 if(!paladinCanAct(r))throw Error('Aura of Protection is inactive while the Paladin is Incapacitated or at 0 HP.');
 const range=n>=18?30:10;
 if(typeof allyName!=='string'||!allyName.trim()||allyName.trim().length>80)throw Error('Name the affected ally.');
 if(!Number.isInteger(distanceFeet)||distanceFeet<0||distanceFeet>range)throw Error('Confirm the ally is within '+range+' feet.');
 if(!['save','attack','damage','condition','speed'].includes(kind))throw Error('Choose an aura calculation.');
 const result={feature:'Paladin Ally Aura',ally:allyName.trim(),distanceFeet,range,kind,appliedToAllySheet:false};
 const auraBonus=Math.max(1,mod(c.scores.cha));
 const halfCover=devotion(c)&&n>=15&&!!r.classState?.smiteProtectionActive;
 if(kind==='save'){
  if(!['str','dex','con','int','wis','cha'].includes(ability))throw Error('Select a saving throw ability.');
  if(!Number.isInteger(baseTotal)||baseTotal< -100||baseTotal>200||!Number.isInteger(dc)||dc<1||dc>100)throw Error('Enter a valid save total (excluding this aura) and DC.');
  const protection=otherPaladinAuraApplied?0:auraBonus;
  const cover=ability==='dex'&&halfCover&&!alreadyCovered?2:0;
  Object.assign(result,{ability,baseTotal,dc,auraBonus:protection,coverBonus:cover,otherPaladinAuraApplied:!!otherPaladinAuraApplied,total:baseTotal+protection+cover,success:baseTotal+protection+cover>=dc,
    note:'The entered total must exclude this Paladin’s aura and newly applied cover. Different Paladins’ Aura of Protection bonuses never stack. Higher or equal cover replaces Half Cover; situational effects remain DM-confirmed.'});
 }else if(kind==='speed'){
  if(!glory(c)||n<7)throw Error('Aura of Alacrity requires Oath of Glory level 7.');
  if(!Number.isInteger(baseTotal)||baseTotal<0||baseTotal>300)throw Error('Enter the ally’s normal walking Speed in feet.');
  Object.assign(result,{baseSpeed:baseTotal,bonus:10,effectiveSpeed:baseTotal+10,note:'Confirm the ally just entered your aura for the first time this turn or started its turn there. +10 feet lasts through the end of its next turn; track position and time at the table.'});
 }else if(kind==='attack'){
  if(!halfCover)throw Error('Ally Half Cover requires active Smite of Protection at Devotion Paladin level 15.');
  if(!Number.isInteger(baseTotal)||baseTotal<1||baseTotal>100||!Number.isInteger(dc)||dc<1||dc>200)throw Error('Enter the ally AC before this Half Cover and the incoming attack total.');
  const cover=alreadyCovered?0:2;
  Object.assign(result,{baseAC:baseTotal,attackTotal:dc,coverBonus:cover,effectiveAC:baseTotal+cover,prevented:dc>=baseTotal&&dc<baseTotal+cover,
    note:'Half Cover grants +2 AC if the ally does not already have equal or better cover. It lasts only until the Paladin’s next turn; DM confirms line of effect and positioning.'});
 }else if(kind==='damage'){
  if(!ancients(c)||n<7)throw Error('Aura of Warding requires an Ancients Paladin at level 7.');
  if(!['Necrotic','Psychic','Radiant'].includes(damageType))throw Error('Aura of Warding resists Necrotic, Psychic, or Radiant damage.');
  if(!Number.isInteger(baseTotal)||baseTotal<0||baseTotal>100000)throw Error('Enter a nonnegative whole-number damage amount.');
  const adjusted=alreadyResistant?baseTotal:Math.floor(baseTotal/2);
  Object.assign(result,{damageType,rawDamage:baseTotal,resistanceApplied:!alreadyResistant,finalDamage:adjusted,
    note:'Resistance halves the selected damage type (round down). Do not apply resistance twice; DM resolves immunity, vulnerability and other modifiers in the proper order.'});
 }else{
  if(!['Charmed','Frightened'].includes(condition))throw Error('Choose Charmed or Frightened.');
  const immune=(condition==='Charmed'&&devotion(c)&&n>=7)||(condition==='Frightened'&&n>=10);
  if(!immune)throw Error('This Paladin does not grant immunity to '+condition+' at this level.');
  Object.assign(result,{condition,immune:true,effectSuppressed:true,
    note:'The condition has no effect on the ally while in this aura; the condition is not removed from an external creature’s sheet and may resume outside the aura.'});
 }
 return {...state,resources:{...r,lastClassEffect:result}};
}

function paladinOath(state,name){const c=state.character;if(!['Oath of Glory','Oath of the Ancients','Oath of Vengeance'].includes(name)||cls(c)!=='Paladin'||level(c)<3||c.build?.subclass!==name)throw Error(name+' requires its Paladin subclass at level 3.');return c;}
function paladinOathCost(state,key,feature,note){const r=state.resources,c=state.character;if((r.classResources?.['channel-divinity']??0)<1)throw Error('No Channel Divinity uses left.');return {...state,resources:{...r,classResources:adjust(c,r.classResources||{},'channel-divinity',-1),lastClassEffect:{feature,note}}};}
function activatePeerlessAthlete(state){paladinOath(state,'Oath of Glory');const flags=paladinTurnMark(state.resources,'bonus');const next=paladinOathCost(state,'channel-divinity','Peerless Athlete','Bonus Action; for one hour, Athletics/Acrobatics checks gain Advantage, jumps +10 ft.');return {...next,resources:{...next.resources,classState:paladinDurationStart({...flags,gloryAthleteActive:true},'gloryAthleteActive')}};}
function endPeerlessAthlete(state){paladinOath(state,'Oath of Glory');return {...state,resources:{...state.resources,classState:paladinDurationEnd(state.resources.classState||{},'gloryAthleteActive')}};}
function inspiringSmite(state,rolls,selfPoints=0){const c=paladinOath(state,'Oath of Glory'),r=state.resources;if(r.lastClassEffect?.feature!=='Divine Smite')throw Error('Inspiring Smite must immediately follow a tracked Divine Smite.');if(!Array.isArray(rolls)||rolls.length!==2||rolls.some(d=>!Number.isInteger(d)||d<1||d>8))throw Error('Inspiring Smite requires 2d8.');const total=rolls[0]+rolls[1]+level(c);if(!Number.isInteger(selfPoints)||selfPoints<0||selfPoints>total)throw Error('Self share must be between 0 and the temporary HP available.');const next=paladinOathCost(state,'channel-divinity','Inspiring Smite','Distribute remaining temporary HP to chosen creatures within 30 ft manually; recipients do not stack temp HP.');const tempHp=Math.max(r.tempHp||0,selfPoints);return {...next,resources:{...next.resources,tempHp,lastClassEffect:{feature:'Inspiring Smite',total,selfPoints,otherPoints:total-selfPoints,rolls,note:'Self temp HP applied; assign remainder to allies within 30 ft manually.'}}};}
function gloriousDefense(state,{attackTotal,targetAC,creatureWithinTenFeet=true}={}){const c=paladinOath(state,'Oath of Glory'),r=state.resources;if(level(c)<15)throw Error('Glorious Defense requires Paladin level 15.');if(!creatureWithinTenFeet)throw Error('The protected creature must be visible within 10 feet.');if(!Number.isInteger(attackTotal)||!Number.isInteger(targetAC)||targetAC<1||attackTotal<targetAC)throw Error('Provide the confirmed hit total and target AC.');if(r.classState?.reactionUsed)throw Error('Reaction already spent.');const bonus=Math.max(1,mod(c.scores.cha));if((r.classResources?.['glorious-defense']??0)<1)throw Error('No Glorious Defense uses remain.');return {...state,resources:{...r,classResources:adjust(c,r.classResources||{},'glorious-defense',-1),classState:{...r.classState,reactionUsed:true,gloryCounterattackPending:attackTotal<targetAC+bonus},lastClassEffect:{feature:'Glorious Defense',attackTotal,targetAC,bonus,newAC:targetAC+bonus,avoided:attackTotal<targetAC+bonus,note:attackTotal<targetAC+bonus?'The hit became a miss; open a weapon attack now and confirm the attacker is in range for the counterattack.':'The boosted AC did not stop the attack; no counterattack is available.'}}};}
function naturesWrath(state,targetCount=1){const c=paladinOath(state,'Oath of the Ancients');if(!Number.isInteger(targetCount)||targetCount<1||targetCount>100)throw Error('Enter a valid number of targets.');const next=paladinOathCost(state,'channel-divinity',"Nature's Wrath",'Magic action, chosen visible creatures within 15 ft make Strength saves; failed targets are Restrained up to one minute and repeat at turn ends.');return {...next,resources:{...next.resources,classState:{...paladinTurnMark(state.resources,'action'),natureWrathPending:targetCount},lastClassEffect:{...next.resources.lastClassEffect,targetCount,saveDC:8+2+Math.floor((level(c)-1)/4)+mod(c.scores.cha)}}};}
function vowOfEnmity(state,target){paladinOath(state,'Oath of Vengeance');paladinAttackActionAllowed(state.resources);if(typeof target!=='string'||!target.trim()||target.length>80)throw Error('Name a visible target within 30 feet.');const next=paladinOathCost(state,'channel-divinity','Vow of Enmity','Attack action, target visible within 30 feet; attacks against the named target gain Advantage for one minute or until renewed.');return {...next,resources:{...next.resources,classState:paladinDurationStart({...root.FolioPaladinCombat.claimAttackAction(state.resources),vowTarget:target.trim()},'vowTarget')}};}
function transferVow(state,target,defeated=false){paladinOath(state,'Oath of Vengeance');if(!defeated||!state.resources.classState?.vowTarget)throw Error('Transfer requires confirmation that the original vowed target dropped to 0 HP before the vow ended.');if(typeof target!=='string'||!target.trim()||target.length>80)throw Error('Name a different target within 30 feet.');if(target.trim()===state.resources.classState.vowTarget)throw Error('Choose a different target.');return {...state,resources:{...state.resources,classState:{...state.resources.classState,vowTarget:target.trim()},lastClassEffect:{feature:'Vow transferred',target:target.trim(),note:'New visible target confirmed within 30 ft; vow retains remaining duration.'}}};}
function endVow(state){paladinOath(state,'Oath of Vengeance');return {...state,resources:{...state.resources,classState:paladinDurationEnd(state.resources.classState||{},'vowTarget')}};}
function oathCapstone(state,mode='free'){const c=state.character,r=state.resources,sub=c.build?.subclass;const config={'Oath of Glory':['living-legend','livingLegendActive','Living Legend'],'Oath of the Ancients':['elder-champion','elderChampionActive','Elder Champion'],'Oath of Vengeance':['avenging-angel','avengingAngelActive','Avenging Angel']}[sub];if(cls(c)!=='Paladin'||level(c)<20||!config)throw Error('Oath capstone requires a qualifying level 20 Paladin.');const [key,flag,name]=config;if(r.classState?.[flag])return {...state,resources:{...r,classState:paladinDurationEnd(r.classState||{},flag)}};if(!['free','slot'].includes(mode))throw Error('Choose an activation cost.');let classResources={...r.classResources},slots=[...(r.spellSlots||c.build?.slotMax||[])];if((classResources[key]??0)>0){if(mode!=='free')throw Error('Use the free oath capstone charge first.');classResources=adjust(c,classResources,key,-1);}else{if(mode!=='slot'||!slots[4])throw Error('No free capstone use or level 5 spell slot available.');slots[4]--;}
 return {...state,resources:{...r,classResources,spellSlots:slots,classState:paladinDurationStart({...paladinTurnMark(r,'bonus'),[flag]:true},flag),lastClassEffect:{feature:name,note:name==='Living Legend'?'10 minutes: Advantage on Charisma checks; reroll failed saves with Reaction; one weapon miss becomes a hit each turn.':name==='Elder Champion'?'One minute: regain 10 HP at the start of your turn, foes in aura have save Disadvantage against spells/Channel Divinity, action spells can become Bonus Actions.':'10 minutes: Fly Speed 60 ft, hover, aura foes make Wisdom save or become Frightened. Resolve enemy effects manually.'}}};}
function paladinStartTurn(state){const c=state.character,r=state.resources,e=state.encounter;if(cls(c)!=='Paladin'||!e?.active)return state;const player=e.roster?.find(x=>x.isPip);if(!player||e.currentId!==player.id)return state;const key=String(e.round)+':'+player.id;if(r.classState?.paladinTurnKey===key)return state;const flags=paladinDurationAdvance(r.classState||{});const regen=ancients(c)&&level(c)>=20&&flags.elderChampionActive&&r.hp>0?Math.min(10,r.maxHp-r.hp):0;return {...state,resources:{...r,hp:r.hp+regen,classState:{...flags,paladinTurnKey:key,paladinTurnTracking:true,paladinActionUsed:false,paladinBonusActionUsed:false,paladinSpellSlotUsed:false,paladinAttackRolls:0,paladinAttackActionInProgress:false,paladinLightTriggerWeapon:null,paladinLightExtraUsed:false,gloryLegendHitUsed:false,gloryCounterattackPending:false,smiteProtectionActive:false,paladinProtectionTarget:null,paladinUnarmedGrappleUsed:false,reactionUsed:false},...(regen?{lastClassEffect:{feature:'Elder Champion regeneration',healed:regen,note:'Regained 10 HP at the start of this tracked turn, capped at max HP.'}}:{})}};}

// SRD 5.2.1 pp. 61-62: Hunters choose Prey and Defense after a Short or Long Rest.
function chooseHunterOptions(state,prey,defense=null,restConfirmed=false){
 const c=state.character,r=state.resources;
 if(!hunter(c))throw Error('Hunter options require Hunter Ranger level 3.');
 if(!restConfirmed)throw Error('Confirm a Short or Long Rest to choose Hunter options.');
 if(!HUNTER_PREY.includes(prey))throw Error('Choose a valid Hunter Prey.');
 if(level(c)>=7&&!HUNTER_DEFENSE.includes(defense))throw Error('Choose a valid Hunter Defense.');
 return {...state,resources:{...r,classState:{...r.classState,hunterPrey:prey,hunterDefense:level(c)>=7?defense:null,hunterColossusUsed:false,hunterSuperiorPreyUsed:false,hunterDefenseType:null},lastClassEffect:{feature:'Hunter Options',prey,defense,note:'Choice made on a confirmed rest; Colossus Slayer and other timed attacks reset on your next tracked turn.'}}};
}
function hunterNewTurn(state){if(!hunter(state.character))throw Error('Hunter turn tracker requires Hunter.');const r=state.resources;return {...state,resources:{...r,classState:{...r.classState,hunterColossusUsed:false,hunterSuperiorPreyUsed:false,reactionUsed:false}}};}
function hunterStartTurn(state){
 const e=state.encounter,c=state.character;if(!hunter(c)||!e?.active)return state;
 const player=e.roster?.find(x=>x.isPip);if(!player||e.currentId!==player.id)return state;
 const key=String(e.round)+':'+player.id;if(state.resources.classState?.hunterTurnKey===key)return state;
 const updated=hunterNewTurn(state);return {...updated,resources:{...updated.resources,classState:{...updated.resources.classState,hunterTurnKey:key}}};
}
function resolveHunterPrey(state,attack,{targetWounded=false}={},rollDie){
 const c=state.character,r=state.resources,flags=r.classState||{};
 if(!hunter(c))throw Error('Hunter Prey requires Hunter level 3.');
 if(flags.hunterPrey!=='colossus')throw Error('Choose Colossus Slayer after a rest first.');
 if(!targetWounded)throw Error('Confirm that the target is missing HP.');
 if(attack.hit===null)throw Error('Enter target AC to confirm a Colossus Slayer hit.');
 if(attack.hit===false)return {extraDamage:0,resources:r,applied:false};
 if(flags.hunterColossusUsed)throw Error('Colossus Slayer can be used only once per turn.');
 const rolls=Array.from({length:attack.critical?2:1},()=>rollDie(8));
 if(rolls.some(v=>!Number.isInteger(v)||v<1||v>8))throw Error('Invalid Colossus Slayer d8.');
 const extraDamage=rolls.reduce((a,b)=>a+b,0);
 return {extraDamage,applied:true,rolls,resources:{...r,classState:{...flags,hunterColossusUsed:true},lastClassEffect:{feature:'Colossus Slayer',extraDamage,rolls,critical:!!attack.critical,note:'Target was missing HP; once this turn. Damage shares weapon damage type.'}}};
}
function useSuperiorHunterDefense(state,type){
 const c=state.character,r=state.resources;
 if(!hunter(c)||level(c)<15)throw Error('Superior Hunter Defense requires Hunter Ranger level 15.');
 if(!DAMAGE_TYPES.includes(type)||type==='Unspecified')throw Error('Choose the triggering damage type.');
 if(r.classState?.reactionUsed)throw Error('Reaction already spent.');
 return {...state,resources:{...r,classState:{...r.classState,reactionUsed:true,hunterDefenseType:type},lastClassEffect:{feature:'Superior Hunter Defense',type,note:'Reaction when taking damage; resistance to this type until the end of the current turn. End the defense manually at that time.'}}};
}
function endSuperiorHunterDefense(state){const r=state.resources;return {...state,resources:{...r,classState:{...r.classState,hunterDefenseType:null}}};}
// SRD 5.2.1 p. 52: Open Hand action features. Targets remain DM-controlled.
function useWholenessOfBody(state,die){
 const c=state.character,r=state.resources;if(!openHand(c)||level(c)<6)throw Error('Wholeness of Body requires Open Hand Monk level 6.');
 const cap=resourcesFor(c).find(x=>x.key==='wholeness-of-body')?.max;
 if((r.classResources?.['wholeness-of-body']??cap)<1)throw Error('No Wholeness of Body uses remain.');
 const max=monkMartialDie(level(c));if(!Number.isInteger(die)||die<1||die>max)throw Error('Enter a valid Martial Arts die.');
 const healed=Math.min(Math.max(0,(r.maxHp||0)-(r.hp||0)),Math.max(1,die+mod(c.scores.wis)));
 if(r.classState?.monkTurnTracking&&r.classState.monkBonusUsed)throw Error('Bonus Action already used this tracked turn.');
 return {...state,resources:{...r,hp:r.hp+healed,classResources:adjust(c,r.classResources||{},'wholeness-of-body',-1),classState:{...r.classState,monkBonusUsed:r.classState?.monkTurnTracking?true:!!r.classState?.monkBonusUsed},lastClassEffect:{feature:'Wholeness of Body',healed,die,note:'Self healing as a Bonus Action; Wisdom uses per Long Rest.'}}};
}
function useOpenHandTechnique(state,effect,flurryHitConfirmed=false){
 const c=state.character,r=state.resources;if(!openHand(c))throw Error('Open Hand Technique requires Open Hand Monk level 3.');
 if(!['addle','push','topple'].includes(effect))throw Error('Choose Addle, Push or Topple.');
 if(!flurryHitConfirmed||!(r.classState?.openHandHitsLeft>0))throw Error('Confirm a Flurry of Blows hit from your most recent tracked Flurry.');
 const dc=8+mod(c.scores.wis)+(2+Math.floor((level(c)-1)/4));
 return {...state,resources:{...r,classState:{...r.classState,openHandHitsLeft:r.classState.openHandHitsLeft-1},lastClassEffect:{feature:'Open Hand Technique',effect,dc,save:effect==='push'?'Strength':effect==='topple'?'Dexterity':null,note:effect==='addle'?'Target cannot make Opportunity Attacks until next turn.':effect==='push'?'If target fails Strength save, push up to 15 ft.':'If target fails Dexterity save, target becomes Prone. Resolve the save with DM.'}}};
}
function quiveringPalm(state,mode,target='',rolls=[],saveSucceeded=false,hitConfirmed=false){
 const c=state.character,r=state.resources;if(!openHand(c)||level(c)<17)throw Error('Quivering Palm requires Open Hand Monk level 17.');
 const flags=r.classState||{};
 if(mode==='place'){
  if(!hitConfirmed)throw Error('Confirm an Unarmed Strike hit before applying Quivering Palm.');
  if(typeof target!=='string'||!target.trim()||target.trim().length>80)throw Error('Confirm a creature hit by an Unarmed Strike and its name.');
  if((r.classResources?.['focus-points']??level(c))<4)throw Error('Quivering Palm requires four Focus Points.');
  return {...state,resources:{...r,classResources:adjust(c,r.classResources||{},'focus-points',-4),classState:{...flags,quiveringPalmTarget:target.trim()},lastClassEffect:{feature:'Quivering Palm placed',target:target.trim(),note:'On a confirmed Unarmed Strike hit. Vibrations last Monk level days; only one target at a time.'}}};
 }
 if(mode!=='release'||!flags.quiveringPalmTarget)throw Error('No active Quivering Palm to end.');
 if(!Array.isArray(rolls)||rolls.length!==10||rolls.some(x=>!Number.isInteger(x)||x<1||x>12))throw Error('Roll ten d12 for Quivering Palm.');
 const full=rolls.reduce((a,b)=>a+b,0),damage=saveSucceeded?Math.floor(full/2):full;
 return {...state,resources:{...r,classState:{...flags,quiveringPalmTarget:null},lastClassEffect:{feature:'Quivering Palm released',target:flags.quiveringPalmTarget,full,damage,saveSucceeded,dc:8+mod(c.scores.wis)+(2+Math.floor((level(c)-1)/4)),note:'Constitution save; target must be on the same plane. Player/DM applies damage; release costs an action or forgoes an Attack action strike.'}}};
}

const LAND_TYPES=Object.freeze({arid:'Fire',polar:'Cold',temperate:'Lightning',tropical:'Poison'});
const FIEND_RESIST_TYPES=Object.freeze(['Acid','Bludgeoning','Cold','Fire','Lightning','Necrotic','Piercing','Poison','Psychic','Radiant','Slashing','Thunder']);
// SRD 5.2.1 p. 35: College of Lore. Enemy roll and DC are confirmed by
// the player/DM because Folio cannot inspect other creatures' rolls.
function loreCuttingWords(state,{kind='attack',originalTotal,dc=null,visibleWithin60=false}={},die){
 const c=state.character,r=state.resources;
 if(!lore(c))throw Error('Cutting Words requires College of Lore level 3.');
 if(!visibleWithin60)throw Error('Confirm the creature is visible within 60 feet.');
 if(!['attack','check','damage'].includes(kind))throw Error('Cutting Words requires an attack, ability check, or damage roll.');
 if(!Number.isInteger(originalTotal)||originalTotal<0||originalTotal>99999||!Number.isInteger(die)||die<1||die>(level(c)>=15?12:level(c)>=10?10:level(c)>=5?8:6))throw Error('Enter a valid roll and Bardic Inspiration die.');
 if(kind!=='damage'&&(!Number.isInteger(dc)||dc<1||dc>100||originalTotal<dc))throw Error('Cutting Words must target an initially successful attack or check.');
 if(r.classState?.reactionUsed)throw Error('Reaction already used.');
 if((r.conditions||[]).some(x=>['Incapacitated','Paralyzed','Petrified','Stunned','Unconscious'].includes(x)))throw Error('Cannot react while Incapacitated.');
 if((r.classResources?.['bardic-inspiration']??resourcesFor(c)[0].max)<1)throw Error('No Bardic Inspiration remaining.');
 const total=Math.max(0,originalTotal-die);
 return {...state,resources:{...r,classResources:adjust(c,r.classResources||{},'bardic-inspiration',-1),classState:{...r.classState,reactionUsed:true},lastClassEffect:{feature:'Cutting Words',kind,originalTotal,die,total,dc,nowFails:kind==='damage'?null:total<dc,note:'Subtract the die from the confirmed creature roll. Damage cannot fall below zero; DM resolves the outcome.'}}};
}
function lorePeerlessSkill(state,{kind='check',originalTotal,dc}={},die){
 const c=state.character,r=state.resources;
 if(!lore(c)||level(c)<14)throw Error('Peerless Skill requires College of Lore level 14.');
 if(!['check','attack'].includes(kind)||!Number.isInteger(originalTotal)||!Number.isInteger(dc)||dc<1||dc>100||originalTotal>=dc)throw Error('Peerless Skill requires your failed ability check or attack roll.');
 const size=level(c)>=15?12:10;
 if(!Number.isInteger(die)||die<1||die>size)throw Error('Invalid Bardic Inspiration die.');
 if((r.classResources?.['bardic-inspiration']??resourcesFor(c)[0].max)<1)throw Error('No Bardic Inspiration available.');
 const total=originalTotal+die,success=total>=dc;
 return {...state,resources:{...r,classResources:success?adjust(c,r.classResources||{},'bardic-inspiration',-1):r.classResources,lastClassEffect:{feature:'Peerless Skill',kind,originalTotal,dc,die,total,success,spent:success,note:success?'Failure became success: Bardic Inspiration expended.':'Check still failed: Bardic Inspiration NOT expended.'}}};
}
// SRD 5.2.1 p. 46: current land is a character choice, because spell grants
// require character data even in the Spellbook (which does not receive resources).
function chooseCircleLand(state,land,restConfirmed=false){
 const c=state.character,r=state.resources;
 if(!circleLand(c))throw Error('Circle Spells require Circle of the Land Druid level 3.');
 if(!Object.hasOwn(LAND_TYPES,land))throw Error('Choose arid, polar, temperate, or tropical land.');
 if(!restConfirmed)throw Error('Circle land can be changed after a confirmed Long Rest.');
 const character={...c,build:{...c.build,landType:land}};
 const conditions=level(c)>=10?(r.conditions||[]).filter(x=>x!=='Poisoned'):r.conditions;
 return {...state,character,resources:{...r,conditions,lastClassEffect:{feature:'Circle Spells',land,note:'Land chosen after Long Rest; Circle spells refresh in Spellbook. Nature’s Ward follows this land at level 10.'}}};
}
function useLandsAid(state,damageRolls,healRolls,{healSelf=false}={}){
 const c=state.character,r=state.resources;
 if(!circleLand(c))throw Error('Land’s Aid requires Circle of the Land level 3.');
 const count=level(c)>=14?4:level(c)>=10?3:2;
 for(const rolls of [damageRolls,healRolls])if(!Array.isArray(rolls)||rolls.length!==count||rolls.some(x=>!Number.isInteger(x)||x<1||x>6))throw Error('Roll the appropriate number of valid d6 dice for damage and healing.');
 if((r.classResources?.['wild-shape']??0)<1)throw Error('No Wild Shape use remains for Land’s Aid.');
 const damage=damageRolls.reduce((a,b)=>a+b,0),healing=healRolls.reduce((a,b)=>a+b,0);
 const hp=healSelf?Math.min(r.maxHp,r.hp+healing):r.hp;
 return {...state,resources:{...r,hp,classResources:adjust(c,r.classResources||{},'wild-shape',-1),lastClassEffect:{feature:'Land’s Aid',damage,healing,healSelf,damageRolls:[...damageRolls],healRolls:[...healRolls],saveDC:8+mod(c.scores.wis)+2+Math.floor((level(c)-1)/4),note:'10-foot Sphere within 60 feet. Chosen creatures take Necrotic damage on failed Con save or half on success; one creature heals. Other targets are DM-managed.'}}};
}
function landRecoverSlots(state,slotLevels,shortRestConfirmed=false){
 const c=state.character,r=state.resources;
 if(!circleLand(c)||level(c)<6)throw Error('Natural Recovery requires Circle of the Land level 6.');
 if(shortRestConfirmed!==true)throw Error('Natural Recovery requires a completed Short Rest.');
 if((r.classResources?.['land-recovery']??1)<1)throw Error('Natural Recovery was already used since Long Rest.');
 if(!Array.isArray(slotLevels)||!slotLevels.length||slotLevels.some(x=>!Number.isInteger(x)||x<1||x>5)||slotLevels.reduce((a,b)=>a+b,0)>Math.ceil(level(c)/2))throw Error('Recover levels 1–5 with total levels no greater than half Druid level (rounded up).');
 const max=c.build?.slotMax||[],current=[...(r.spellSlots||max)];
 for(const l of slotLevels){if((current[l-1]||0)>=(max[l-1]||0))throw Error('Cannot recover an unspent spell slot.');current[l-1]++;}
 return {...state,resources:{...r,spellSlots:current,classResources:adjust(c,r.classResources||{},'land-recovery',-1),lastClassEffect:{feature:'Natural Recovery',slots:[...slotLevels],note:'Recovered slot levels after a Short Rest; no spell slot of level 6+ can be recovered.'}}};
}
function useNaturalRecoveryFreeSpell(state,spellName){
 const c=state.character,r=state.resources;
 if(!circleLand(c)||level(c)<6)throw Error('Free Circle spell requires Circle of the Land level 6.');
 if((r.classResources?.['land-free-spell']??1)<1)throw Error('Free Circle spell already used since Long Rest.');
 const granted=(root.FolioSpellRules||(typeof require==='function'?require('./rules-engine.js'):null))?.classGrantedSpellNames(c)||[];
 if(typeof spellName!=='string'||!granted.includes(spellName))throw Error('Choose an always-prepared Circle spell.');
 const f=(root.FolioSpellRules||(typeof require==='function'?require('./rules-engine.js'):null))?.catalog?.().find(x=>x.name===spellName);
 if(!f||f.level<1)throw Error('Natural Recovery free spell requires a level 1+ Circle spell.');
 return {...state,resources:{...r,classResources:adjust(c,r.classResources||{},'land-free-spell',-1),lastClassEffect:{feature:'Natural Recovery free spell',spellName,note:'Casting was recorded without a slot. Check casting time, components, targets and concentration in the Spellbook.'}}};
}
// SRD 5.2.1 pp. 82–83: Evoker features. Spell mechanics beyond the
// explicit rolls entered by the user remain at the table, not guessed.
function evokerPotentCantrip(state,{isWizardCantrip=false,missOrSaveSucceeded=false,damage=0}={}){
 const c=state.character,r=state.resources;
 if(!evoker(c))throw Error('Potent Cantrip requires Evoker level 3.');
 if(!isWizardCantrip||!missOrSaveSucceeded||!Number.isInteger(damage)||damage<0||damage>99999)throw Error('Confirm a damaging Wizard cantrip that missed or was saved against, with its rolled damage.');
 const total=Math.floor(damage/2);
 return {...state,resources:{...r,lastClassEffect:{feature:'Potent Cantrip',fullDamage:damage,damage:total,note:'Apply half damage only, with no secondary effect. The target’s HP is handled at the table.'}}};
}
function evokerSculptSpells(state,{spellLevel,chosenAllies=0,visible=true,evocation=true}={}){
 const c=state.character,r=state.resources;
 if(!evoker(c)||level(c)<6)throw Error('Sculpt Spells requires Evoker level 6.');
 if(!visible||!evocation||!Number.isInteger(spellLevel)||spellLevel<0||spellLevel>9||!Number.isInteger(chosenAllies)||chosenAllies<1||chosenAllies>1+spellLevel)throw Error('Choose visible allies within 1 + spell level for an Evocation spell.');
 return {...state,resources:{...r,lastClassEffect:{feature:'Sculpt Spells',spellLevel,chosenAllies,note:'Chosen creatures automatically succeed on their saving throws and take no damage if a successful save would normally halve damage. DM resolves targets.'}}};
}
function evokerEmpoweredDamage(state,{wizardEvocation=false,baseDamage}={}){
 const c=state.character,r=state.resources;
 if(!evoker(c)||level(c)<10)throw Error('Empowered Evocation requires Evoker level 10.');
 if(!wizardEvocation||!Number.isInteger(baseDamage)||baseDamage<0||baseDamage>99999)throw Error('Confirm one Wizard Evocation spell damage roll.');
 const bonus=mod(c.scores.int);
 return {...state,resources:{...r,lastClassEffect:{feature:'Empowered Evocation',baseDamage,bonus,total:Math.max(0,baseDamage+bonus),note:'Add Intelligence modifier to one damage roll only; targets and other rolls remain manual.'}}};
}
function usePreserveLife(state,selfAmount=0,otherAmount=0){
 const c=state.character,r=state.resources;
 if(!lifeDomain(c))throw Error('Preserve Life requires Life Domain Cleric level 3.');
 if(!Number.isInteger(selfAmount)||!Number.isInteger(otherAmount)||selfAmount<0||otherAmount<0||selfAmount+otherAmount<1)throw Error('Allocate whole positive Preserve Life healing points.');
 const capacity=level(c)*5;
 if(selfAmount+otherAmount>capacity)throw Error('Preserve Life exceeds the Channel Divinity healing pool.');
 const half=Math.floor((r.maxHp||0)/2);
 if(selfAmount>0&&(r.hp||0)>=half)throw Error('Preserve Life targets only Bloodied creatures below half maximum HP.');
 if(selfAmount>Math.max(0,half-(r.hp||0)))throw Error('Preserve Life cannot heal the Cleric above half maximum HP.');
 if((r.classResources?.['channel-divinity']??resourcesFor(c).find(x=>x.key==='channel-divinity').max)<1)throw Error('No Channel Divinity uses remain.');
 const classResources=adjust(c,r.classResources||{},'channel-divinity',-1);
 return {...state,resources:{...r,hp:(r.hp||0)+selfAmount,classResources,lastClassEffect:{feature:'Preserve Life',selfAmount,otherAmount,unused:capacity-selfAmount-otherAmount,note:'Other creatures must be Bloodied, within 30 feet, and cannot be healed above half their maximum HP. Their healing is recorded for the DM to apply.'}}};
}
function useDarkOnesBlessing(state,{enemyDefeated=false,byAlly=false,withinTenFeet=false}={}){
 const c=state.character,r=state.resources;
 if(!fiend(c))throw Error('Dark One’s Blessing requires Fiend Patron level 3.');
 if(!enemyDefeated||byAlly&&!withinTenFeet)throw Error('Confirm a defeated enemy and ally proximity if applicable.');
 const offered=Math.max(1,mod(c.scores.cha)+level(c));
 const tempHp=Math.max(r.tempHp||0,offered);
 return {...state,resources:{...r,tempHp,lastClassEffect:{feature:'Dark One’s Blessing',offered,applied:tempHp-(r.tempHp||0),byAlly,note:'Enemy reduced to 0 HP; ally defeats require enemy within 10 feet. Temporary HP do not stack.'}}};
}
function useDarkOnesLuck(state,originalTotal,dc,die){
 const c=state.character,r=state.resources;
 if(!fiend(c)||level(c)<6)throw Error('Dark One’s Own Luck requires Fiend Patron level 6.');
 if(!Number.isInteger(originalTotal)||!Number.isInteger(dc)||dc<1||dc>100||!Number.isInteger(die)||die<1||die>10)throw Error('Enter the check/save total, DC, and a valid d10.');
 const cap=resourcesFor(c).find(x=>x.key==='dark-ones-luck').max;
 if((r.classResources?.['dark-ones-luck']??cap)<1)throw Error('No Dark One’s Own Luck uses remain.');
 return {...state,resources:{...r,classResources:adjust(c,r.classResources||{},'dark-ones-luck',-1),lastClassEffect:{feature:'Dark One’s Own Luck',originalTotal,dc,die,total:originalTotal+die,success:originalTotal+die>=dc,note:'Use after seeing an ability check or saving throw but before its effects; at most once per roll.'}}};
}
function chooseFiendResilience(state,type,restConfirmed=false){
 const c=state.character,r=state.resources;
 if(!fiend(c)||level(c)<10)throw Error('Fiendish Resilience requires Fiend Patron level 10.');
 if(!FIEND_RESIST_TYPES.includes(type))throw Error('Fiendish Resilience cannot select Force or an invalid type.');
 if(restConfirmed!==true)throw Error('Select Fiendish Resilience when finishing a Short or Long Rest.');
 return {...state,resources:{...r,classState:{...r.classState,fiendResistance:type},lastClassEffect:{feature:'Fiendish Resilience',damageType:type,note:'Chosen at end of a confirmed Short or Long Rest; this resistance is applied automatically to incoming typed damage.'}}};
}
function useDragonWings(state,mode='free'){
 const c=state.character,r=state.resources,n=level(c);
 if(!draconic(c)||n<14)throw Error('Dragon Wings requires Draconic Sorcery level 14.');
 if(r.classState?.dragonWingsActive)return {...state,resources:{...r,classState:{...r.classState,dragonWingsActive:false},lastClassEffect:{feature:'Dragon Wings',mode:'dismiss',note:'Wings dismissed; duration otherwise lasts up to 1 hour.'}}};
 if(!['free','sorcery'].includes(mode))throw Error('Choose a legal Dragon Wings resource.');
 let classResources={...r.classResources};
 const free=classResources['dragon-wings']??1;
 if(mode==='free'){
  if(free<1)throw Error('Free Dragon Wings use has been spent.');
  classResources=adjust(c,classResources,'dragon-wings',-1);
 }else{
  if(free>0)throw Error('Use your free Dragon Wings activation first.');
  if((classResources['sorcery-points']??n)<3)throw Error('Three Sorcery Points are required to restore Dragon Wings.');
  classResources=adjust(c,classResources,'sorcery-points',-3);
 }
 return {...state,resources:{...r,classResources,classState:{...r.classState,dragonWingsActive:true},lastClassEffect:{feature:'Dragon Wings',mode,flySpeed:60,note:'Bonus Action; lasts 1 hour or until dismissed. Folio does not automatically track duration.'}}};
}

// The app cannot determine when a tabletop turn begins unless the tracker advances.
// A manual reset is therefore explicit, never inferred from an unrelated attack.
function barbarianNewTurn(state){
 const c=state.character,r=state.resources;if(cls(c)!=='Barbarian')throw Error('Only Barbarians use this turn tracker.');
 return {...state,resources:{...r,classState:{...(r.classState||{}),barbarianAttackRolledThisTurn:false,recklessThisTurn:false,frenzyUsedThisTurn:false,brutalUsedThisTurn:false,reactionUsed:false}}};
}
function barbarianStartTurn(state){
 const e=state.encounter,c=state.character;if(cls(c)!=='Barbarian'||!e?.active)return state;
 const player=e.roster?.find(x=>x.isPip);if(!player||e.currentId!==player.id)return state;
 const key=String(e.round)+':'+player.id;
 if(state.resources.classState?.barbarianTurnKey===key)return state;
 const reset=barbarianNewTurn(state);return {...reset,resources:{...reset.resources,classState:{...reset.resources.classState,barbarianTurnKey:key}}};
}
function useIntimidatingPresence(state,cost='free'){
 const c=state.character,r=state.resources;
 if(!berserker(c)||level(c)<14)throw Error('Intimidating Presence requires Berserker level 14.');
 if((r.conditions||[]).some(x=>['Incapacitated','Paralyzed','Petrified','Stunned','Unconscious'].includes(x)))throw Error('Intimidating Presence is unavailable while Incapacitated.');
 const free=r.classResources?.['intimidating-presence']??1;
 const rage=r.classResources?.rage??resourcesFor(c).find(x=>x.key==='rage').max;
 if(!['free','rage'].includes(cost))throw Error('Choose an Intimidating Presence cost.');
 if(cost==='free'&&free<1)throw Error('The free Intimidating Presence use is spent.');
 if(cost==='rage'&&free>0)throw Error('Use the remaining free Intimidating Presence charge first.');
 if(cost==='rage'&&rage<1)throw Error('No Rage uses remain to restore Intimidating Presence.');
 const classResources={...r.classResources,['intimidating-presence']:0,...(cost==='rage'?{rage:rage-1}:{})};
 const dc=8+mod(c.scores.str)+(2+Math.floor((level(c)-1)/4));
 return {...state,resources:{...r,classResources,lastClassEffect:{feature:'Intimidating Presence',cost,dc,save:'Wisdom',radiusFeet:30,note:'Bonus Action; selected creatures in a 30-foot Emanation make a Wisdom save or are Frightened up to 1 minute. Repeated saves and targets are resolved at the table.'}}};
}
function barbarianAttack(state,attack,options={},rollDie){
 const c=state.character,r=state.resources,n=level(c),flags=r.classState||{};
 if(cls(c)!=='Barbarian')throw Error('This attack tracker requires a Barbarian.');
 if(options.retaliation){
  if(!berserker(c)||n<10)throw Error('Retaliation requires Berserker level 10.');
  if(flags.reactionUsed)throw Error('Your Reaction is already spent.');
  if(!attack.meleeAttack)throw Error('Retaliation requires a Melee weapon attack.');
  if(options.reckless)throw Error('You cannot choose Reckless Attack during an off-turn Retaliation attack.');
 }
 if(options.reckless&&! (n>=2))throw Error('Reckless Attack requires Barbarian level 2.');
 const brutalEffects=(options.brutalEffects||[]).filter(x=>x&&x!=='none');
 if(brutalEffects.length){
  if(n<9)throw Error('Brutal Strike requires Barbarian level 9.');
  if(options.retaliation)throw Error('Brutal Strike must be used on your own turn.');
  if(!attack.strengthAttack)throw Error('Brutal Strike requires a Strength-based attack.');
  if(!options.reckless&&!flags.recklessThisTurn)throw Error('Brutal Strike requires Reckless Attack.');
  if(flags.brutalUsedThisTurn)throw Error('Brutal Strike was already used this turn.');
  if(attack.disadvantage)throw Error('Brutal Strike cannot be used on an attack with Disadvantage.');
  if(brutalEffects.length>(n>=17?2:1)||new Set(brutalEffects).size!==brutalEffects.length)throw Error('Choose distinct Brutal Strike effects within your level limit.');
  const available={forceful:9,hamstring:9,staggering:13,sundering:13};
  for(const k of brutalEffects)if(!available[k]||n<available[k])throw Error('Brutal Strike effect is unavailable at this level.');
  if(attack.hit===null)throw Error('Brutal Strike requires target AC to resolve the chosen attack.');
 }
 if(options.reckless&&!flags.recklessThisTurn&&flags.barbarianAttackRolledThisTurn)throw Error('Choose Reckless Attack on your first attack roll of this turn. Start a new turn to reset.');
 const reckless=!!(flags.recklessThisTurn||options.reckless);
 const frenzy=berserker(c)&&!!flags.raging&&reckless&&attack.hit===true&&attack.strengthAttack&&!options.retaliation&&!flags.frenzyUsedThisTurn;
 let rolls=[],extraDamage=0,brutalRolls=[],brutalDamage=0;
 if(frenzy){if(typeof rollDie!=='function')throw Error('Frenzy requires a dice roller.');
  const count=(n>=16?4:n>=9?3:2)*(attack.critical?2:1);
  for(let i=0;i<count;i++){const value=rollDie(6);if(!Number.isInteger(value)||value<1||value>6)throw Error('Invalid Frenzy d6.');rolls.push(value);}
  extraDamage=rolls.reduce((a,b)=>a+b,0);
 }
 if(brutalEffects.length&&attack.hit===true){
  if(typeof rollDie!=='function')throw Error('Brutal Strike requires a dice roller.');
  for(let i=0;i<(n>=17?2:1)*(attack.critical?2:1);i++){
   const v=rollDie(10);if(!Number.isInteger(v)||v<1||v>10)throw Error('Invalid Brutal Strike d10.');
   brutalRolls.push(v);
  }
  brutalDamage=brutalRolls.reduce((a,b)=>a+b,0);extraDamage+=brutalDamage;
 }
 const classState={...flags,barbarianAttackRolledThisTurn:!!flags.barbarianAttackRolledThisTurn||!options.retaliation,recklessThisTurn:reckless,frenzyUsedThisTurn:!!flags.frenzyUsedThisTurn||frenzy,brutalUsedThisTurn:!!flags.brutalUsedThisTurn||brutalEffects.length>0,reactionUsed:!!flags.reactionUsed||!!options.retaliation};
 const details=brutalEffects.map(k=>({key:k,note:{forceful:'Push 15 feet; you may follow up to half your Speed without Opportunity Attacks.',hamstring:'Target Speed -15 feet until your next turn.',staggering:'Target has Disadvantage on its next saving throw and cannot make Opportunity Attacks until your next turn.',sundering:'Next attack by another creature before your next turn gains +5.'}[k]}));
 const lastClassEffect=brutalEffects.length?{feature:'Brutal Strike',brutalEffects:details,brutalDamage,brutalRolls,hit:attack.hit,critical:!!attack.critical,frenzyDamage:rolls.reduce((a,b)=>a+b,0),note:'You forgo Reckless Attack Advantage. Apply chosen target effects with the DM.'}:frenzy?{feature:'Berserker Frenzy',extraDamage,rolls,critical:!!attack.critical,note:'First Strength-based hit this turn while raging after Reckless Attack; dice double on a critical hit.'}:r.lastClassEffect;
 return {extraDamage,rolls,frenzy,reckless,brutalEffects:details,brutalDamage,brutalRolls,resources:{...r,classState,lastClassEffect}};
}

// SRD 5.2.1 pp. 8, 29-30, 32, 49, 63:
// consistent D20 check math including Reliable Talent, Jack of All Trades,
// Primal Knowledge, Indomitable Might and Champion Athletics advantage.
function resolveAbilityCheck(state,options={},rolls=[]){
 const c=state.character,r=state.resources,n=level(c),name=cls(c);
 const skills=(root.PipData||(typeof require==='function'?require('./data.js'):null))?.skills||[];
 const skillMap=new Map(skills);
 const type=options.type||'skill',label=String(options.name||'');
 if(type!=='skill'&&type!=='tool')throw Error('Choose a skill or tool check.');
 if(type==='skill'&&!skillMap.has(label))throw Error('Unknown skill.');
 if(type==='tool'&&!(c.tools||[]).includes(label))throw Error('Tool check must use a listed tool; untrained checks are manual.');
 const baseAbility=type==='skill'?skillMap.get(label):options.ability;
 if(!['str','dex','con','int','wis','cha'].includes(baseAbility))throw Error('Choose a valid ability.');
 const primal=!!options.primalStrength;
 if(primal&&(name!=='Barbarian'||n<3||!r.classState?.raging||type!=='skill'||!['Acrobatics','Intimidation','Perception','Stealth','Survival'].includes(label)))throw Error('Primal Knowledge requires Rage and an eligible skill.');
 const ability=primal?'str':baseAbility;
 const trained=type==='tool'||(c.profSkills||[]).includes(label);
 const expertise=type==='skill'&&(c.expertise||[]).includes(label)&&trained;
 const pb=2+Math.floor((n-1)/4),jack=name==='Bard'&&n>=2&&!trained?Math.floor(pb/2):0;
 const automaticAdvantage=(name==='Barbarian'&&r.classState?.raging&&ability==='str')||(name==='Fighter'&&champion(c)&&label==='Athletics'&&type==='skill')||(glory(c)&&r.classState?.gloryAthleteActive&&type==='skill'&&['Athletics','Acrobatics'].includes(label))||(glory(c)&&n>=20&&r.classState?.livingLegendActive&&ability==='cha');
 const chosen=options.rollMode||'normal';if(!['normal','advantage','disadvantage'].includes(chosen))throw Error('Invalid check roll mode.');
 const effective=automaticAdvantage&&chosen==='disadvantage'?'normal':automaticAdvantage?'advantage':chosen;
 const needed=effective==='normal'?1:2;
 const actualRolls=typeof rolls==='function'?Array.from({length:needed},()=>rolls(20)):rolls;
 if(!Array.isArray(actualRolls)||actualRolls.length!==needed||actualRolls.some(d=>!Number.isInteger(d)||d<1||d>20))throw Error('Provide the required d20 roll or rolls.');
 const natural=effective==='advantage'?Math.max(...actualRolls):effective==='disadvantage'?Math.min(...actualRolls):actualRolls[0];
 const reliable=name==='Rogue'&&n>=7&&trained&&natural<10;
 const die=reliable?10:natural;
 const modifier=mod(c.scores[ability])+(trained?pb:jack)+(expertise?pb:0)+(root.FolioRanger2024?.fey(c)&&ability==='cha'?mod(c.scores.wis):0)+(root.FolioCleric2024?.divineOrderBonus(state,label)||0)+(name==='Druid'&&c.build?.druidOrder==='Magician'&&type==='skill'&&['Arcana','Nature'].includes(label)?Math.max(1,mod(c.scores.wis)):0);
 const calculated=die+modifier;
 const indomitable=name==='Barbarian'&&n>=18&&ability==='str'&&calculated<c.scores.str;
 const total=indomitable?c.scores.str:calculated;
 const dc=options.dc==null?null:Number(options.dc);
 if(dc!==null&&(!Number.isInteger(dc)||dc<1||dc>100))throw Error('Check DC must be a whole number from 1 to 100.');
 const effect={feature:'Ability Check',type,name:label,ability,rolls:[...actualRolls],rollMode:effective,natural,die,modifier,total,dc,success:dc===null?null:total>=dc,trained,expertise,reliableTalent:reliable,jackOfAllTrades:jack,primalKnowledge:primal,indomitableMight:indomitable,automaticAdvantage};
 return {...state,resources:{...r,lastClassEffect:effect}};
}
// SRD 5.2.1 pp. 13, 29 and 49: initiative is a Dexterity check, not
// merely the Initiative modifier. Feral Instinct and Champion grant Advantage.
// A surprised combatant has Disadvantage; the two cancel if both apply.
function rollInitiative(state,rollDie,options={}){
 const c=state.character,r=state.resources,n=level(c),name=cls(c);
 if(typeof rollDie!=='function')throw Error('Initiative requires a dice roller.');
 const advantage=(name==='Barbarian'&&n>=7)||champion(c)||(name==='Rogue'&&n>=3&&(c.build?.subclass||c.subclass)==='Assassin');
 const disadvantage=options.surprised===true;
 const mode=advantage&&disadvantage?'normal':advantage?'advantage':disadvantage?'disadvantage':'normal';
 const rolls=Array.from({length:mode==='normal'?1:2},()=>rollDie(20));
 if(rolls.some(v=>!Number.isInteger(v)||v<1||v>20))throw Error('Invalid initiative d20.');
 const natural=mode==='advantage'?Math.max(...rolls):mode==='disadvantage'?Math.min(...rolls):rolls[0];
 const C=root.PipCore||(typeof require==='function'?require('./core.js'):null);
 const modifier=C.derived(c,state.inventory||{items:[]},r).initiative+(root.FolioRanger2024?.gloom(c)?mod(c.scores.wis):0),total=natural+modifier;
 return {total,mode,rolls,state:{...state,encounter:C.beginEncounter(state.encounter||{active:false,roster:[],round:1},total,undefined,c.name),resources:{...r,lastClassEffect:{feature:'Initiative',rolls,mode,natural,modifier,total,surprised:disadvantage,automaticAdvantage:advantage}}}};
}

// SRD 5.2.1 p. 33: Countercharm rerolls a FAILED save with Advantage.
// An ally's save modifier is entered by the player: Folio does not manage ally sheets.
function useCountercharm(state,options={},rolls=[]){
 const c=state.character,r=state.resources;
 if(cls(c)!=='Bard'||level(c)<7)throw Error('Countercharm requires Bard level 7.');
 if(r.classState?.reactionUsed)throw Error('Reaction already spent.');
 if((r.conditions||[]).some(x=>['Incapacitated','Paralyzed','Petrified','Stunned','Unconscious'].includes(x)))throw Error('Cannot use Countercharm while Incapacitated.');
 if(!['Charmed','Frightened'].includes(options.condition))throw Error('Countercharm applies only to Charmed or Frightened effects.');
 if(!['self','ally'].includes(options.target))throw Error('Specify yourself or an ally within 30 feet.');
 const dc=Number(options.dc),originalTotal=Number(options.originalTotal);
 if(!Number.isInteger(dc)||dc<1||dc>100||!Number.isInteger(originalTotal)||originalTotal>=dc)throw Error('Countercharm requires a failed saving throw and a valid DC.');
 if(!['str','dex','con','int','wis','cha'].includes(options.ability))throw Error('Choose the saving throw ability.');
 if(!Array.isArray(rolls)||rolls.length!==2||rolls.some(x=>!Number.isInteger(x)||x<1||x>20))throw Error('Countercharm rolls two d20.');
 const modif=options.target==='self'?(root.PipCore||(typeof require==='function'?require('./core.js'):null)).derived(c,state.inventory||{items:[]},r).saves[options.ability]:Number(options.allySaveModifier);
 if(!Number.isInteger(modif)||modif<-100||modif>100)throw Error('Enter the ally’s saving throw modifier.');
 const chosen=Math.max(...rolls),total=chosen+modif;
 return {...state,resources:{...r,classState:{...(r.classState||{}),reactionUsed:true},lastClassEffect:{feature:'Countercharm',target:options.target,condition:options.condition,ability:options.ability,dc,originalTotal,rolls:[...rolls],chosen,modifier:modif,total,success:total>=dc,note:'The new roll must be used; any conditions or target consequences are resolved by the player/DM.'}}};
}

// SRD 5.2.1 pp. 47–49: Fighter / Champion mechanics.
function champion(c){return cls(c)==='Fighter'&&level(c)>=3&&(c.subclass==='Champion'||c.build?.subclass==='Champion');}
function championCriticalThreshold(c){return champion(c)?level(c)>=15?18:19:20;}
function fighterActionSurge(state){
 const c=state.character,r=state.resources;
 if(cls(c)!=='Fighter'||level(c)<2)throw Error('Action Surge requires Fighter level 2.');
 if((r.classResources?.['action-surge']??resourcesFor(c).find(x=>x.key==='action-surge').max)<1)throw Error('No Action Surge uses remain.');
 if(r.classState?.actionSurgeThisTurn)throw Error('Action Surge can be used only once per turn. Start a new Fighter turn first.');
 return {...state,resources:{...r,classResources:adjust(c,r.classResources||{},'action-surge',-1),classState:{...r.classState,actionSurgeThisTurn:true,...(r.classState?.fighterTurnTracking?{fighterSurgeActions:(r.classState.fighterSurgeActions||0)+1}:{})},lastClassEffect:{feature:'Action Surge',note:'One additional action on your turn, except the Magic action. The other action must be resolved at the table.'}}};
}
function useIndomitable(state,ability,initialTotal,dc,reroll){
 const c=state.character,r=state.resources;
 if(cls(c)!=='Fighter'||level(c)<9)throw Error('Indomitable requires Fighter level 9.');
 if(!['str','dex','con','int','wis','cha'].includes(ability))throw Error('Choose a saving throw ability.');
 if(!Number.isInteger(initialTotal)||!Number.isInteger(dc)||dc<1||dc>100||initialTotal>=dc)throw Error('Indomitable requires a failed saving throw and valid DC.');
 if(!Number.isInteger(reroll)||reroll<1||reroll>20)throw Error('Roll a valid d20 for Indomitable.');
 if((r.classResources?.indomitable??resourcesFor(c).find(x=>x.key==='indomitable').max)<1)throw Error('No Indomitable uses remain.');
 const core=root.PipCore||(typeof require==='function'?require('./core.js'):null);
 const saveModifier=core.derived(c,state.inventory,r).saves[ability];
 const finalTotal=reroll+saveModifier+level(c),success=finalTotal>=dc;
 return {...state,resources:{...r,classResources:adjust(c,r.classResources||{},'indomitable',-1),lastClassEffect:{feature:'Indomitable',ability,initialTotal,dc,reroll,saveModifier,fighterBonus:level(c),finalTotal,success,note:'The new result must be used, even if it fails.'}}};
}
// Called only when the tracked encounter advances to the player character's turn.
// A persisted turn key prevents duplicate healing / Inspiration for a single turn.
function fighterStartTurn(state){
 const c=state.character,r=state.resources,e=state.encounter;
 if(cls(c)!=='Fighter'||!e?.active)return state;
 const player=e.roster?.find(x=>x.isPip);if(!player||e.currentId!==player.id)return state;
 const turnKey=String(e.round)+':'+player.id;
 if(r.classState?.fighterTurnKey===turnKey)return state;
 let hp=r.hp,heroicInspiration=!!r.heroicInspiration;
 const rally=champion(c)&&level(c)>=18&&hp>=1&&hp<=Math.floor(r.maxHp/2);
 if(rally)hp=Math.min(r.maxHp,hp+Math.max(0,5+mod(c.scores.con)));
 if(champion(c)&&level(c)>=10)heroicInspiration=true;
 const next={...state,resources:{...r,hp,heroicInspiration,classState:{...r.classState,actionSurgeThisTurn:false,fighterTurnKey:turnKey},lastClassEffect:rally?{feature:'Survivor · Heroic Rally',healed:hp-r.hp,turnKey}:r.lastClassEffect}};return root.FolioFighter2024?.startTurn?root.FolioFighter2024.startTurn(next):next;
}
function championDeathSave(state,die1,die2){
 const c=state.character,r=state.resources;
 if(!champion(c)||level(c)<18)throw Error('Defy Death requires Champion Fighter level 18.');
 if(r.hp!==0)throw Error('Death saves require 0 HP.');
 if((r.deathFailure||0)>=3||(r.deathSuccess||0)>=3)throw Error('Death saves are already resolved; reset the tracker before rolling again.');
 if(![die1,die2].every(x=>Number.isInteger(x)&&x>=1&&x<=20))throw Error('Roll two d20 for Death Saving Throw Advantage.');
 const chosen=Math.max(die1,die2),success=chosen>=10,revive=chosen>=18;
 const deathSuccess=revive?0:success?Math.min(3,(r.deathSuccess||0)+1):r.deathSuccess||0;
 const deathFailure=revive?0:!success?Math.min(3,(r.deathFailure||0)+(chosen===1?2:1)):r.deathFailure||0;
 return {...state,resources:{...r,hp:revive?1:r.hp,deathSuccess,deathFailure,lastClassEffect:{feature:'Defy Death',rolls:[die1,die2],chosen,revive,success,deathSuccess,deathFailure,note:'On three failures the character dies; this tracker does not automate death beyond the counter.'}}};
}
function armorStatus(inventory){const active=(inventory?.items||[]).filter(x=>x.equipped&&x.quantity>0);return {armor:active.some(x=>x.category==='armor'),shield:active.some(x=>x.category==='shield'),heavy:active.some(x=>x.category==='armor'&&x.armor?.kind==='heavy')};}
function passive(c,inventory){const name=cls(c),n=level(c),equipment=armorStatus(inventory),dex=mod(c.scores.dex);let unarmoredAC=null,movement=0,attacks=1;
 if(!equipment.armor&&name==='Barbarian')unarmoredAC=10+dex+mod(c.scores.con);
 if(!equipment.armor&&!equipment.shield&&name==='Monk')unarmoredAC=10+dex+mod(c.scores.wis);
 if(!equipment.armor&&!equipment.shield&&root.FolioBard2024?.dance(c))unarmoredAC=10+dex+mod(c.scores.cha);
 if(!equipment.armor&&draconic(c))unarmoredAC=10+dex+mod(c.scores.cha);
 if(name==='Barbarian'&&n>=5&&!equipment.heavy)movement=10;
 if(name==='Monk'&&n>=2&&!equipment.armor&&!equipment.shield)movement=n>=18?30:n>=14?25:n>=10?20:n>=6?15:10;
 if(name==='Ranger'&&n>=6&&!equipment.heavy)movement=10;
 if(glory(c)&&n>=7)movement=10;
 if(name==='Fighter')attacks=n>=20?4:n>=11?3:n>=5?2:1;
 else if(['Barbarian','Monk','Paladin','Ranger'].includes(name)&&n>=5||name==='Bard'&&root.FolioBard2024?.valor(c)&&n>=6)attacks=2;
 return {unarmoredAC,movement,attacks,rogueSneakAttackDice:name==='Rogue'?Math.ceil(n/2):0,rageBonus:name==='Barbarian'?(n>=16?4:n>=9?3:2):0};
}
function startRage(state){const c=state.character,r=state.resources;if(cls(c)!=='Barbarian')throw Error('Only Barbarians can Rage.');if(r.classState?.raging)return {...state,resources:{...r,classState:{...r.classState,raging:false}}};if(armorStatus(state.inventory).heavy)throw Error('Rage cannot begin while wearing Heavy armor.');if(r.conditions?.includes('Incapacitated'))throw Error('Cannot enter Rage while Incapacitated.');const current=r.classResources?.rage??resourcesFor(c)[0].max;if(current<1)throw Error('No Rage uses remaining.');const immune=berserker(c)&&level(c)>=6;return {...state,resources:{...r,conditions:immune?(r.conditions||[]).filter(x=>!['Charmed','Frightened'].includes(x)):r.conditions,concentration:'',lastConcentrationDC:null,classResources:adjust(c,r.classResources||{},'rage',-1),classState:{...(r.classState||{}),raging:true}}};}
function toggleInnateSorcery(state){
 const c=state.character,r=state.resources;
 if(cls(c)!=='Sorcerer')throw Error('Innate Sorcery requires a Sorcerer.');
 const active=!!r.classState?.innateSorcery;
 if(active)return {...state,resources:{...r,classState:{...r.classState,innateSorcery:false}}};
 if((r.conditions||[]).includes('Incapacitated'))throw Error('Cannot activate Innate Sorcery while Incapacitated.');
 if((r.classResources?.['innate-sorcery']??2)<1)throw Error('No Innate Sorcery uses remain.');
 return {...state,resources:{...r,classResources:adjust(c,r.classResources||{},'innate-sorcery',-1),classState:{...r.classState,innateSorcery:true}}};
}
function resetReaction(state){const r=state.resources;return {...state,resources:{...r,classState:{...r.classState,reactionUsed:false,...(cls(state.character)==='Paladin'?{smiteProtectionActive:false,gloryCounterattackPending:false,gloryLegendHitUsed:false}:{})}}};}
function useSecondWind(state,die){const c=state.character,r=state.resources;
 if(cls(c)!=='Fighter')throw Error('Second Wind requires Fighter.');
 if(!Number.isInteger(die)||die<1||die>10)throw Error('Roll a d10 for Second Wind.');
 if((r.classResources?.['second-wind']??resourcesFor(c)[0].max)<1)throw Error('No Second Wind uses remain.');
 const cf=root.FolioFighter2024?.spendBonus?root.FolioFighter2024.spendBonus(r):r.classState||{};return {...state,resources:{...r,hp:Math.min(r.maxHp,r.hp+die+level(c)),classResources:adjust(c,r.classResources||{},'second-wind',-1),classState:cf,lastClassEffect:{feature:'Second Wind',healed:Math.min(r.maxHp-r.hp,die+level(c)),tacticalShift:level(c)>=5?Math.floor(Number(c.speed||30)/2):0,note:level(c)>=5?'Tactical Shift: move up to half Speed without provoking Opportunity Attacks.':'Bonus Action healing.'}}};}
// Personal bookkeeping only: spend the feature, roll physical dice, enter the healed HP on the sheet.
function recordPhysicalRecovery(state,kind){
 const c=state.character,r=state.resources||{},clsName=cls(c);
 if(!['second-wind','tireless','wholeness'].includes(kind))throw Error('Unknown recovery ability.');
 const key=kind==='second-wind'?'second-wind':kind==='tireless'?'tireless':'wholeness-of-body';
 const spec=resourcesFor(c).find(x=>x.key===key);
 if(!spec||kind==='second-wind'&&clsName!=='Fighter'||kind==='tireless'&&(clsName!=='Ranger'||level(c)<10)||kind==='wholeness'&&(!openHand(c)||level(c)<6))throw Error('Your character has not unlocked this recovery feature.');
 if((r.classResources?.[key]??spec.max)<1)throw Error('No uses of this feature remain.');
 let flags={...(r.classState||{})};
 if(kind==='second-wind')flags=root.FolioFighter2024?.spendBonus?root.FolioFighter2024.spendBonus(r):flags;
 if(kind==='tireless'){
  if(flags.rangerTurnTracking&&flags.rangerActionUsed)throw Error('Tireless needs an available Action this tracked turn.');
  if(flags.rangerTurnTracking)flags.rangerActionUsed=true;
 }
 if(kind==='wholeness'){
  if(flags.monkTurnTracking&&flags.monkBonusUsed)throw Error('Bonus Action already spent this tracked turn.');
  if(flags.monkTurnTracking)flags.monkBonusUsed=true;
 }
 const title=kind==='second-wind'?'Second Wind':kind==='tireless'?'Tireless':'Wholeness of Body';
 const note=kind==='second-wind'?'Roll 1d10 + Fighter level; set recovered HP yourself.':kind==='tireless'?'Roll 1d8 + Wisdom modifier (minimum 1); set temporary HP yourself.':'Roll your Martial Arts die + Wisdom modifier; set recovered HP yourself.';
 return {...state,resources:{...r,classResources:adjust(c,r.classResources||{},key,-1),classState:flags,lastClassEffect:{feature:title,physicalDice:true,note:'Use recorded; '+note}}};
}
function useLayOnHands(state,amount){const c=state.character,r=state.resources;if(cls(c)!=='Paladin')throw Error('Lay On Hands requires Paladin.');
 if(!Number.isInteger(amount)||amount<1)throw Error('Choose a positive number of healing points.');
 const cap=r.classResources?.['lay-on-hands']??resourcesFor(c)[0].max;
 if(cap<amount)throw Error('Not enough Lay On Hands points.');
 return {...state,resources:{...r,hp:Math.min(r.maxHp,r.hp+amount),classState:paladinTurnMark(r,'bonus'),classResources:adjust(c,r.classResources||{},'lay-on-hands',-amount)}};}
// SRD 5.2.1 pp. 53-55: Lay On Hands can remove Poisoned for 5 points.
// At Paladin level 14, Restoring Touch also removes six specified conditions.
// These self-only controls do not assume allies can be modified in this app.
const TOUCH_CONDITIONS=new Set(['Poisoned','Blinded','Charmed','Deafened','Frightened','Paralyzed','Stunned']);
function usePaladinTouch(state,healing=0,conditions=[]){
 const c=state.character,r=state.resources,n=level(c);
 if(cls(c)!=='Paladin')throw Error('Lay On Hands requires a Paladin.');
 if(!Number.isInteger(healing)||healing<0)throw Error('Healing must be a nonnegative whole number.');
 if(!Array.isArray(conditions)||conditions.length>7||new Set(conditions).size!==conditions.length||conditions.some(x=>!TOUCH_CONDITIONS.has(x)))throw Error('Choose distinct valid conditions.');
 if(conditions.some(x=>x!=='Poisoned')&&n<14)throw Error('Restoring Touch requires Paladin level 14.');
 if(conditions.some(x=>!(r.conditions||[]).includes(x)))throw Error('Only currently active conditions can be removed.');
 const cost=healing+5*conditions.length,pool=r.classResources?.['lay-on-hands']??n*5;
 if(cost<1)throw Error('Select healing or a condition to remove.');
 if(cost>pool)throw Error('Not enough Lay On Hands points.');
 const healed=Math.min(healing,Math.max(0,(r.maxHp||0)-(r.hp||0)));
 return {...state,resources:{...r,hp:(r.hp||0)+healed,conditions:(r.conditions||[]).filter(x=>!conditions.includes(x)),classResources:adjust(c,r.classResources||{},'lay-on-hands',-cost),classState:paladinTurnMark(r,'bonus'),lastClassEffect:{feature:conditions.length?'Restoring Touch':'Lay On Hands',requestedHealing:healing,healed,conditionsRemoved:[...conditions],pointsSpent:cost,note:'Bonus Action on self; another creature must be tracked on its own sheet.'}}};
}
function useMagicalCunning(state){const c=state.character,r=state.resources;if(cls(c)!=='Warlock'||level(c)<2)throw Error('Magical Cunning requires Warlock level 2.');
 if((r.classResources?.['magical-cunning']??1)<1)throw Error('Magical Cunning has already been used.');
 const slots=[...(r.spellSlots||[])],max=c.build?.slotMax||[];
 const pool=max.findIndex(n=>n>0);if(pool<0)throw Error('No Pact Magic slots configured.');
 const restoring=Math.min(level(c)>=20?max[pool]:Math.ceil(max[pool]/2),max[pool]-(slots[pool]||0));
 if(restoring<1)throw Error('No spent Pact slots to restore.');slots[pool]=(slots[pool]||0)+restoring;
 const withSlots={...r,spellSlots:slots,classResources:adjust(c,r.classResources||{},'magical-cunning',-1),lastClassEffect:{feature:'Magical Cunning',restored:restoring,note:'After a 1-minute rite, recovered '+restoring+' spent Pact Magic slot(s). Once per Long Rest.'}};return root.FolioWarlock2024?.restEffect({...state,resources:withSlots},'cunning')||{...state,resources:withSlots};}
function useSorcerousRestoration(state){return root.FolioSorcerer2024.restoration(state);}
function convertSorcery(state,direction,slotLevel){return root.FolioSorcerer2024.convert(state,direction,slotLevel);}
// SRD 5.2.1, p.77: Arcane Recovery is a single, once-per-Long-Rest choice
// made after finishing a Short Rest, not a generic +/- slot adjustment.
function recoverWizardSlots(state,slotLevels){
 const c=state.character,r=state.resources;
 if(cls(c)!=='Wizard')throw Error('Arcane Recovery requires a Wizard.');
 if((r.classResources?.['arcane-recovery']??1)<1)throw Error('Arcane Recovery already used today.');
 if(!r.classState?.wizardShortRestReady)throw Error('Arcane Recovery requires completing a Short Rest before use.');
 if(!Array.isArray(slotLevels)||slotLevels.length<1||slotLevels.length>10||slotLevels.some(n=>!Number.isInteger(n)||n<1||n>5))throw Error('Choose one or more spell slots of level 1 to 5.');
 const budget=Math.ceil(level(c)/2),spent=slotLevels.reduce((a,b)=>a+b,0);
 if(spent>budget)throw Error('Arcane Recovery exceeds half your Wizard level (rounded up).');
 const caps=c.build?.slotMax||[],slots=[...(r.spellSlots||caps)];
 for(const slotLevel of slotLevels){const i=slotLevel-1,cap=Number(caps[i]||0);if(!cap||Number(slots[i]||0)>=cap)throw Error('No expended level '+slotLevel+' slot to recover.');slots[i]=(slots[i]||0)+1;}
 return {...state,resources:{...r,spellSlots:slots,classResources:adjust(c,r.classResources||{},'arcane-recovery',-1),lastClassEffect:{feature:'Arcane Recovery',recovered:[...slotLevels],budget}}};
}
// SRD 5.2.1, p.42: Wild Resurgence. The app does not enforce its
// once-per-turn limitation because combat turns are not universally tracked.
function regainWildShapeFromSlot(state,slotLevel){
 const c=state.character,r=state.resources;
 if(cls(c)!=='Druid'||level(c)<5)throw Error('Wild Resurgence requires Druid level 5.');
 if(!Number.isInteger(slotLevel)||slotLevel<1||slotLevel>9)throw Error('Choose a valid spell slot level.');
 if((r.classResources?.['wild-shape']??resourcesFor(c).find(x=>x.key==='wild-shape').max)!==0)throw Error('Wild Shape must be empty before exchanging a spell slot.');
 const slots=[...(r.spellSlots||c.build?.slotMax||[])];if((slots[slotLevel-1]||0)<1)throw Error('No spell slot of that level remains.');
 slots[slotLevel-1]--;
 return {...state,resources:{...r,spellSlots:slots,classResources:adjust(c,r.classResources||{},'wild-shape',1),lastClassEffect:{feature:'Wild Resurgence',mode:'slot-to-shape',slotLevel}}};
}
function exchangeWildShapeForSlot(state){
 const c=state.character,r=state.resources;
 if(cls(c)!=='Druid'||level(c)<5)throw Error('Wild Resurgence requires Druid level 5.');
 if((r.classResources?.['wild-resurgence-slot']??1)<1)throw Error('Wild Resurgence slot exchange already used today.');
 if((r.classResources?.['wild-shape']??resourcesFor(c).find(x=>x.key==='wild-shape').max)<1)throw Error('No Wild Shape uses remain.');
 const slots=[...(r.spellSlots||c.build?.slotMax||Array(9).fill(0))];slots[0]=(slots[0]||0)+1;
 return {...state,resources:{...r,spellSlots:slots,classResources:{...adjust(c,r.classResources||{},'wild-shape',-1),'wild-resurgence-slot':0},lastClassEffect:{feature:'Wild Resurgence',mode:'shape-to-slot',slotLevel:1}}};
}
// SRD 5.2.1 p.37: Divine Spark targets ANOTHER creature. This generates
// accurate healing/damage information for the player/DM without healing the
// active character or assuming the target's Constitution save succeeds.
function useDivineSpark(state,kind,rolls){
 const c=state.character,r=state.resources,n=level(c);
 if(cls(c)!=='Cleric'||n<2)throw Error('Divine Spark requires Cleric level 2.');
 if(!['heal','radiant','necrotic'].includes(kind))throw Error('Choose healing, Radiant damage, or Necrotic damage.');
 const count=n>=18?4:n>=13?3:n>=7?2:1;
 if(!Array.isArray(rolls)||rolls.length!==count||rolls.some(v=>!Number.isInteger(v)||v<1||v>8))throw Error('Divine Spark requires '+count+' valid d8 roll(s).');
 if((r.classResources?.['channel-divinity']??resourcesFor(c).find(x=>x.key==='channel-divinity').max)<1)throw Error('No Channel Divinity uses remain.');
 const amount=Math.max(0,rolls.reduce((a,b)=>a+b,0)+mod(c.scores.wis));
 const dcBonus=root.PipInventory?.bonusSummary?.(state.inventory)?.spellDC||0;
 const saveDC=Number.isInteger(c.overrides?.spellDC)?c.overrides.spellDC:8+(2+Math.floor((n-1)/4))+mod(c.scores.wis)+dcBonus;
 const effect={feature:'Divine Spark',kind,rolls:[...rolls],wisdomModifier:mod(c.scores.wis),amount,target:'another creature within 30 feet',...(kind!=='heal'?{constitutionSaveDC:saveDC,successDamage:Math.floor(amount/2)}:{})};
 return {...state,resources:{...r,classResources:adjust(c,r.classResources||{},'channel-divinity',-1),lastClassEffect:effect}};
}
// SRD 5.2.1, pp. 31-32: Bardic Inspiration is given to ANOTHER creature,
// and its die is used by the recipient after a failed D20 test. We record the
// grant, not a pretend bonus to the Bard or a fabricated ally state.
function grantBardicInspiration(state){
 const c=state.character,r=state.resources,n=level(c);
 if(cls(c)!=='Bard')throw Error('Bardic Inspiration requires a Bard.');
 const cap=resourcesFor(c).find(x=>x.key==='bardic-inspiration').max;
 if((r.classResources?.['bardic-inspiration']??cap)<1)throw Error('No Bardic Inspiration uses remain.');
 const die=n>=15?12:n>=10?10:n>=5?8:6;
 return {...state,resources:{...r,classResources:adjust(c,r.classResources||{},'bardic-inspiration',-1),lastClassEffect:{feature:'Bardic Inspiration',die,recipient:'another creature within 60 feet that can see or hear you',duration:'1 hour',note:'Recipient rolls the die after failing a D20 Test; one die per creature.'}}};
}
function useFontOfInspiration(state,slotLevel){
 const c=state.character,r=state.resources;
 if(cls(c)!=='Bard'||level(c)<5)throw Error('Font of Inspiration requires Bard level 5.');
 if(!Number.isInteger(slotLevel)||slotLevel<1||slotLevel>9)throw Error('Choose a valid spell slot level.');
 const cap=resourcesFor(c).find(x=>x.key==='bardic-inspiration').max;
 const current=r.classResources?.['bardic-inspiration']??cap;
 if(current>=cap)throw Error('Bardic Inspiration is already full.');
 const slots=[...(r.spellSlots||c.build?.slotMax||[])];
 if((slots[slotLevel-1]||0)<1)throw Error('No spell slot of that level remains.');
 slots[slotLevel-1]--;
 return {...state,resources:{...r,spellSlots:slots,classResources:adjust(c,r.classResources||{},'bardic-inspiration',1),lastClassEffect:{feature:'Font of Inspiration',slotLevel,restored:1}}};
}
// SRD 5.2.1 p.48: Second Wind is only spent when the failed ability check
// becomes a success. The player supplies the original check total and its DC;
// Folio can't infer table circumstances or which skill was rolled.
function useTacticalMind(state,checkTotal,dc,die){
 const c=state.character,r=state.resources;
 if(cls(c)!=='Fighter'||level(c)<2)throw Error('Tactical Mind requires Fighter level 2.');
 if(!Number.isInteger(checkTotal)||checkTotal<0||checkTotal>100||!Number.isInteger(dc)||dc<1||dc>100||!Number.isInteger(die)||die<1||die>10)throw Error('Enter a valid check total, DC, and d10 roll.');
 if(checkTotal>=dc)throw Error('Tactical Mind is only usable after a failed ability check.');
 const cap=resourcesFor(c).find(x=>x.key==='second-wind').max;
 if((r.classResources?.['second-wind']??cap)<1)throw Error('No Second Wind uses remain.');
 const success=checkTotal+die>=dc;
 return {...state,resources:{...r,classResources:success?adjust(c,r.classResources||{},'second-wind',-1):{...r.classResources},lastClassEffect:{feature:'Tactical Mind',initialTotal:checkTotal,dc,die,finalTotal:checkTotal+die,success,spentSecondWind:success}}};
}
// SRD 5.2.1 pp. 50-52. The 2024 Monk has two FREE bonus actions as well
// as more powerful Focus Point versions. Full turn enforcement and enemy
// application are not available yet; only local resources/temporary HP change.
const monkMartialDie=n=>n>=17?12:n>=11?10:n>=5?8:6;
function useMonkFocus(state,mode,rolls=[]){
 const c=state.character,r=state.resources,n=level(c);
 if(cls(c)!=='Monk'||n<2)throw Error('Monk focus requires Monk level 2.');
 if(!['flurry','patient','patient-free','step','step-free'].includes(mode))throw Error('Unknown Monk technique.');
 const cost=['flurry','patient','step'].includes(mode)&&!(mode==='flurry'&&root.FolioMonk2024?.shadow(c)&&n>=17&&r.classState?.monkCloakActive)?1:0;
 const cap=resourcesFor(c).find(x=>x.key==='focus-points').max;
 if(cost&&(r.classResources?.['focus-points']??cap)<cost)throw Error('Not enough Focus Points.');
 const count=mode==='patient'&&n>=10?2:0,dieSize=monkMartialDie(n);
 if(!Array.isArray(rolls)||rolls.length!==count||rolls.some(x=>!Number.isInteger(x)||x<1||x>dieSize))throw Error('Invalid Martial Arts dice for this technique.');
 const points=cost?adjust(c,r.classResources||{},'focus-points',-cost):{...r.classResources};
 const awarded=rolls.reduce((a,b)=>a+b,0);
 const tempHp=count?Math.max(r.tempHp||0,awarded):r.tempHp;
 const effect={feature:'Monk Focus',mode,cost,bonusAction:true,attacks:mode==='flurry'?(n>=10?3:2):0,
  dash:mode.startsWith('step'),disengage:mode==='step'||mode.startsWith('patient'),dodge:mode==='patient',
  doubleJump:mode==='step',martialDie:dieSize,temporaryHpOffered:awarded,temporaryHpApplied:count?tempHp-(r.tempHp||0):0,
  note:mode==='step'&&n>=10?'At level 10+ you may also bring one eligible willing creature; track manually.':'Target effects and turn timing are manual.'};
 const updated={...state,resources:{...r,tempHp,classResources:points,classState:{...r.classState,openHandHitsLeft:openHand(c)&&mode==='flurry'?effect.attacks:0},lastClassEffect:effect}};
 return root.FolioMonk2024?root.FolioMonk2024.focusTechnique(state,mode,updated):updated;
}
function useUncannyMetabolism(state,die){
 const c=state.character,r=state.resources,n=level(c);
 if(cls(c)!=='Monk'||n<2)throw Error('Uncanny Metabolism requires Monk level 2.');
 const maxDie=monkMartialDie(n);
 if(!Number.isInteger(die)||die<1||die>maxDie)throw Error('Roll a valid Martial Arts die.');
 if((r.classResources?.['uncanny-metabolism']??1)<1)throw Error('Uncanny Metabolism already used since Long Rest.');
 const specs=resourcesFor(c),cap=specs.find(x=>x.key==='focus-points').max;
 const recovered=Math.max(0,cap-(r.classResources?.['focus-points']??cap));
 const healed=Math.min(Math.max(0,(r.maxHp||0)-(r.hp||0)),n+die);
 return {...state,resources:{...r,hp:(r.hp||0)+healed,classResources:{...r.classResources,'focus-points':cap,'uncanny-metabolism':0},lastClassEffect:{feature:'Uncanny Metabolism',martialDie:die,healed,focusRecovered:recovered,note:'Use when rolling Initiative; the player confirms this trigger.'}}};
}
function usePerfectFocus(state){
 const c=state.character,r=state.resources;
 if(cls(c)!=='Monk'||level(c)<15)throw Error('Perfect Focus requires Monk level 15.');
 const current=r.classResources?.['focus-points']??level(c);
 if(current>=4)throw Error('Perfect Focus requires 3 or fewer Focus Points.');
 const pool={...r.classResources,'focus-points':4};
 return {...state,resources:{...r,classResources:pool,lastClassEffect:{feature:'Perfect Focus',focusRecovered:4-current,note:'Only when rolling Initiative, instead of Uncanny Metabolism; confirm trigger manually.'}}};
}

// SRD 5.2.1 pp. 58-59, 141: Ranger abilities. The application cannot
// independently verify creature visibility, distance, identity, or turn timing.
const HUNTERS_MARK='Hunter’s Mark';
const marked=(r)=>/hunter.s mark/i.test(String(r?.concentration||''))&&!!r?.classState?.huntersMarkTarget;
function rangerTarget(target){
 const name=String(target||'').trim();
 if(!name||name.length>80)throw Error('Enter a marked creature name (1–80 characters).');
 return name;
}
function castHuntersMark(state,source='free',slotLevel=1,target){
 const c=state.character,r=state.resources,n=level(c),t=rangerTarget(target);
 if(cls(c)==='Ranger'&&r.classState?.rangerTurnTracking&&r.classState?.rangerBonusUsed&&!r.classState?.rangerMarkPrepared)throw Error('Hunter’s Mark requires an available Bonus Action.');
 if(cls(c)==='Ranger'&&r.classState?.rangerTurnTracking&&source==='slot'&&r.classState?.rangerSpellSlotUsed&&!r.classState?.rangerMarkPrepared)throw Error('Only one spell slot may be expended to cast spells on your tracked Ranger turn.');
 if(cls(c)!=='Ranger'&&!vengeance(c))throw Error('Hunter’s Mark requires a Ranger or Oath of Vengeance Paladin.');
 if((r.conditions||[]).some(x=>['Incapacitated','Unconscious','Paralyzed','Stunned','Petrified'].includes(x)))throw Error('Cannot cast Hunter’s Mark while incapacitated.');
 if(!['free','slot'].includes(source))throw Error('Choose a free use or a spell slot.');
 let classResources={...r.classResources},slots=[...(r.spellSlots||c.build?.slotMax||[])];
 if(source==='free'){
  if(cls(c)!=='Ranger')throw Error('Free Hunter’s Mark casts require Ranger Favored Enemy.');
  const cap=resourcesFor(c).find(x=>x.key==='favored-enemy').max;
  if((classResources['favored-enemy']??cap)<1)throw Error('No free Hunter’s Mark uses remain.');
  classResources=adjust(c,classResources,'favored-enemy',-1);
 }else{
  const caps=c.build?.slotMax||[],idx=Number(slotLevel)-1;
  if(!Number.isInteger(slotLevel)||idx<0||idx>=9||!caps[idx]||!(slots[idx]>0))throw Error('No eligible spell slot available for Hunter’s Mark.');
  slots[idx]--;
 }
 return {...state,resources:{...r,spellSlots:slots,classResources,concentration:HUNTERS_MARK,lastConcentrationDC:null,classState:{...(cls(c)==='Paladin'?paladinTurnMark(r,'bonus',source==='slot'):(r.classState||{})),huntersMarkTarget:t,...(cls(c)==='Ranger'&&r.classState?.rangerTurnTracking?{rangerBonusUsed:true,rangerSpellSlotUsed:source==='slot'||!!r.classState.rangerSpellSlotUsed,rangerMarkPrepared:false}:{})},lastClassEffect:{feature:HUNTERS_MARK,target:t,source,slotLevel:source==='slot'?slotLevel:null,note:'You confirm the target is visible within 90 feet. Bonus Action and concentration duration are tracked manually.'}}};
}
function endHuntersMark(state){
 const r=state.resources;if(cls(state.character)!=='Ranger'&&!vengeance(state.character))throw Error('Hunter’s Mark requires Ranger or Oath of Vengeance.');
 if(!marked(r))throw Error('Hunter’s Mark is not active.');
 return {...state,resources:{...r,concentration:'',lastConcentrationDC:null,classState:{...(r.classState||{}),huntersMarkTarget:''}}};
}
function useTireless(state,die){
 const c=state.character,r=state.resources;if(cls(c)!=='Ranger'||level(c)<10)throw Error('Tireless requires Ranger level 10.');
 if(!Number.isInteger(die)||die<1||die>8)throw Error('Tireless requires a d8 roll.');
 if(r.classState?.rangerTurnTracking&&r.classState?.rangerActionUsed)throw Error('Tireless requires an available Magic action.');
 const spec=resourcesFor(c).find(x=>x.key==='tireless');if((r.classResources?.tireless??spec.max)<1)throw Error('No Tireless uses remaining.');
 const offered=Math.max(1,die+mod(c.scores.wis)),tempHp=Math.max(r.tempHp||0,offered);
 return {...state,resources:{...r,tempHp,classState:{...r.classState,...(r.classState?.rangerTurnTracking?{rangerActionUsed:true}:{})},classResources:adjust(c,r.classResources||{},'tireless',-1),lastClassEffect:{feature:'Tireless',die,offered,temporaryHpApplied:tempHp-(r.tempHp||0)}}};
}
function toggleNaturesVeil(state){
 const c=state.character,r=state.resources;if(cls(c)!=='Ranger'||level(c)<14)throw Error('Nature’s Veil requires Ranger level 14.');
 if(r.classState?.naturesVeilActive)return {...state,resources:{...r,classState:{...r.classState,naturesVeilActive:false}}};
 if(r.classState?.rangerTurnTracking&&r.classState?.rangerBonusUsed)throw Error('Nature’s Veil requires an available Bonus Action.');
 if((r.conditions||[]).some(x=>['Incapacitated','Unconscious','Paralyzed','Stunned','Petrified'].includes(x)))throw Error('Cannot activate Nature’s Veil while incapacitated.');
 const cap=resourcesFor(c).find(x=>x.key==='natures-veil').max;
 if((r.classResources?.['natures-veil']??cap)<1)throw Error('No Nature’s Veil uses remaining.');
 return {...state,resources:{...r,classResources:adjust(c,r.classResources||{},'natures-veil',-1),classState:{...r.classState,naturesVeilActive:true,...(r.classState?.rangerTurnTracking?{rangerBonusUsed:true,rangerVeilUntilTurn:(r.classState.rangerTurn||0)+1}:{})},lastClassEffect:{feature:'Nature’s Veil',note:'Invisible until end of next turn. Player must track turn timing and condition interactions.'}}};
}
// SRD 5.2.1, pp. 61-63. A hit and the triggering circumstances must be
// confirmed; this is NOT an automatic assumption that every Rogue hit qualifies.
const ROGUE_STRIKES=Object.freeze({
 poison:{level:5,cost:1,save:'Constitution',note:'On a failed save the target is Poisoned for 1 minute; repeat at the end of each turn.'},
 trip:{level:5,cost:1,save:'Dexterity',note:'On a failed save, a Large-or-smaller target falls Prone.'},
 withdraw:{level:5,cost:1,save:null,note:'Move up to half your Speed without provoking Opportunity Attacks.'},
 daze:{level:14,cost:2,save:'Constitution',note:'On a failed save, next turn the target may move, act, or take a Bonus Action (only one).'},
 'knock-out':{level:14,cost:6,save:'Constitution',note:'On a failed save the target is Unconscious for up to 1 minute; it repeats saves at the end of its turns, and damage ends it.'},
 obscure:{level:14,cost:3,save:'Dexterity',note:'On a failed save, the target is Blinded until the end of its next turn.'},
 'stealth-attack':{level:9,cost:1,save:null,note:'Thief Supreme Sneak: Hidden Invisible condition persists only if end your turn behind Three-Quarters or Total Cover.'}
});
function resetSneakAttack(state){
 if(cls(state.character)!=='Rogue')throw Error('Only Rogues have Sneak Attack.');
 const r=state.resources||{};
 return {...state,resources:{...r,classState:{...(r.classState||{}),sneakAttackUsed:false}}};
}
function resolveSneakAttack(state,weapon,attack,{enabled=false,allyAdjacent=false,targetLargeOrSmaller=false,strikes=[],hidden=false,coverConfirmed=false}={},rollDie){
 if(!enabled)return {applied:false,resources:state.resources,extraDamage:0};
 const c=state.character,r=state.resources||{},n=level(c);
 if(cls(c)!=='Rogue')throw Error('Sneak Attack requires a Rogue.');
 if(!attack||!['normal','advantage','disadvantage'].includes(attack.rollMode))throw Error('Invalid attack roll mode.');
 const props=Array.isArray(weapon.propertyList)?weapon.propertyList:Array.isArray(weapon.properties)?weapon.properties:String(weapon.properties||'').split(',').map(v=>v.trim());
 if(weapon.kind!=='Ranged'&&!props.includes('Finesse'))throw Error('Sneak Attack requires a Finesse or Ranged weapon.');
 if(attack.rollMode!=='advantage'&&!(allyAdjacent&&attack.rollMode!=='disadvantage'))throw Error('Sneak Attack needs Advantage, or an active ally within 5 feet of the target and no Disadvantage.');
 if(r.classState?.sneakAttackUsed)throw Error('Sneak Attack was already used this turn. Start a new turn to reset it.');
 if(!Array.isArray(strikes)||strikes.length>2||strikes.some(x=>typeof x!=='string'))throw Error('Choose valid Cunning Strike effects.');
 const chosen=strikes.filter(x=>x&&x!=='none');
 if(chosen.length!==new Set(chosen).size)throw Error('Choose different Cunning Strike effects.');
 if(chosen.length>(n>=11?2:n>=5?1:0))throw Error('Cunning Strike choices are not available at this level.');
 let cost=0;const effects=[];
 for(const key of chosen){
  const info=ROGUE_STRIKES[key];if(!info||n<info.level)throw Error('Cunning Strike option not available at this level.');
  if(key==='poison'&&!state.inventory?.items?.some(x=>x.quantity>0&&/poisoner.s kit/i.test(x.name)))throw Error("Poison Cunning Strike requires a Poisoner's Kit in inventory.");
  if(key==='trip'&&!targetLargeOrSmaller)throw Error('Confirm the target is Large or smaller to use Trip.');
  if(key==='stealth-attack'&&(!root.FolioRogue2024?.thief(c)||!hidden||!coverConfirmed))throw Error('Supreme Sneak requires a level-9 Thief, the Hide action Invisible condition and confirmed cover.');
  cost+=info.cost;
  effects.push({name:key,cost:info.cost,save:info.save,saveDC:info.save?8+mod(c.scores.dex)+(2+Math.floor((n-1)/4)):null,note:info.note});
 }
 const dice=Math.ceil(n/2);
 if(cost>dice)throw Error('Cunning Strike costs more Sneak Attack dice than available.');
 if(attack.hit===null)throw Error('Enter target AC to confirm a hit before applying Sneak Attack.');
 if(attack.hit===false)return {applied:false,miss:true,resources:r,extraDamage:0,effects:[],diceRolled:[]};
 if(typeof rollDie!=='function')throw Error('A dice roller is required.');
 const count=(dice-cost)*(attack.critical?2:1),rolled=[];
 for(let i=0;i<count;i++){const value=rollDie(6);if(!Number.isInteger(value)||value<1||value>6)throw Error('Invalid d6 result.');rolled.push(value);}
 const extraDamage=rolled.reduce((a,b)=>a+b,0);
 const effect={feature:'Sneak Attack',diceAvailable:dice,diceSpent:cost,diceRolled:rolled,critical:!!attack.critical,extraDamage,effects,weaponDamageType:weapon.type,note:'Effects resolve after damage. Target saves and status are handled by the player/DM.'};
 return {applied:true,extraDamage,effects,diceRolled:rolled,resources:{...r,classState:{...(r.classState||{}),sneakAttackUsed:true},lastClassEffect:effect}};
}

// SRD 5.2.1 pp. 54, 141: Divine Smite is a Bonus Action immediately
// AFTER hitting with a Melee weapon or Unarmed Strike. The weapon roller
// requires the player to confirm target AC and that their Bonus Action is free.
function resolvePaladinSmite(state,attack,{cost='none',fiendOrUndead=false}={},rollDie){
 if(cost==='none'||cost==null)return {applied:false,extraDamage:0,resources:state.resources,diceRolled:[]};
 const c=state.character,r=state.resources,n=level(c);
 if(cls(c)!=='Paladin'||n<2)throw Error('Divine Smite requires Paladin level 2.');
 if(!attack?.eligibleMelee)throw Error('Divine Smite requires a Melee weapon hit or Unarmed Strike, not a Ranged weapon attack.');
 if(attack.hit!==true)throw Error('Divine Smite requires a confirmed hit and target AC.');
 if((r.conditions||[]).some(x=>['Incapacitated','Paralyzed','Petrified','Stunned','Unconscious'].includes(x)))throw Error('You cannot cast Divine Smite while Incapacitated.');
 if(typeof fiendOrUndead!=='boolean')throw Error('Specify whether the target is a Fiend or Undead.');
 let spellSlotLevel=1,resources={...r,spellSlots:[...(r.spellSlots||c.build?.slotMax||[])]};
 if(cost==='free'){
  const remaining=r.classResources?.['divine-smite-free']??1;
  if(remaining<1)throw Error('Free Divine Smite already used since Long Rest.');
  resources.classResources=adjust(c,r.classResources||{},'divine-smite-free',-1);
 }else if(/^slot[1-5]$/.test(cost)){
  spellSlotLevel=Number(cost.slice(4));
  if((resources.spellSlots[spellSlotLevel-1]||0)<1)throw Error('No spell slot of that level remains.');
  resources.spellSlots[spellSlotLevel-1]--;
 }else throw Error('Invalid Divine Smite casting cost.');
 const count=(2+(spellSlotLevel-1)+(fiendOrUndead?1:0))*(attack.critical?2:1),rolls=[];
 if(typeof rollDie!=='function')throw Error('A dice roller is required.');
 for(let i=0;i<count;i++){const value=rollDie(8);if(!Number.isInteger(value)||value<1||value>8)throw Error('Invalid d8 for Divine Smite.');rolls.push(value);}
 const extraDamage=rolls.reduce((sum,v)=>sum+v,0);
 const protectedAura=devotion(c)&&n>=15;
 const effect={feature:'Divine Smite',cost,spellSlotLevel,fiendOrUndead,critical:!!attack.critical,diceRolled:rolls,extraDamage,damageType:'Radiant',smiteProtection:protectedAura,note:protectedAura?'Smite of Protection: the Paladin and allies in the Aura of Protection have Half Cover until the start of the Paladin’s next turn; other sheets track their own bonus.':'Divine Smite consumed the tracked Bonus Action and, when applicable, the one-slot spell-casting limit.'};
 return {applied:true,extraDamage,resources:{...resources,classState:{...paladinTurnMark(r,'bonus',cost!=='free'),...(protectedAura?{smiteProtectionActive:true}:{})},lastClassEffect:effect},diceRolled:rolls};
}
// Incoming typed damage. Sources of resistance are additive in provenance, NOT
// multiplicative in effect: two resistances still halve only once (SRD 5.2.1 p.17).
// Only the SRD Barbarian Rage passive is inferred automatically here.
const DAMAGE_TYPES=Object.freeze(['Unspecified','Acid','Bludgeoning','Cold','Fire','Force','Lightning','Necrotic','Piercing','Poison','Psychic','Radiant','Slashing','Thunder']);
const RAGE_RESISTANCE=new Set(['Bludgeoning','Piercing','Slashing']);
function resolveIncomingDamage(state,amount,type='Unspecified',choices={}){
 if(!Number.isInteger(amount)||amount<0||amount>99999)throw Error('Damage must be a whole number from 0 to 99999.');
 if(!DAMAGE_TYPES.includes(type))throw Error('Choose a valid damage type.');
 const r=state.resources,c=state.character;
 const raging=cls(c)==='Barbarian'&&!!r.classState?.raging;
 // Manual switches are per-hit only, never treated as ongoing character effects.
 const fiendResistance=fiend(c)&&level(c)>=10&&r.classState?.fiendResistance===type;
 const greatOldOnePsychic=!!root.FolioWarlock2024?.patron(c,'Great Old One Patron')&&level(c)>=10&&type==='Psychic';
 const celestialRadiant=!!root.FolioWarlock2024?.patron(c,'Celestial Patron')&&level(c)>=6&&type==='Radiant';
 const landResistance=circleLand(c)&&level(c)>=10&&LAND_TYPES[c.build?.landType]===type;
 const hunterResistance=hunter(c)&&level(c)>=15&&r.classState?.hunterDefenseType===type;
 const ancientsResistance=ancients(c)&&level(c)>=7&&['Necrotic','Psychic','Radiant'].includes(type)&&!(r.conditions||[]).some(x=>['Incapacitated','Paralyzed','Petrified','Stunned','Unconscious'].includes(x));
 const wildBear=raging&&root.FolioBarbarian2024?.wild(c)&&r.classState?.wildRageAnimal==='Bear'&&!['Force','Necrotic','Psychic','Radiant','Unspecified'].includes(type);
 const zealotForm=raging&&root.FolioBarbarian2024?.zealot(c)&&level(c)>=14&&r.classState?.zealotFormActive&&['Necrotic','Psychic','Radiant'].includes(type);
 const monkDefense=cls(c)==='Monk'&&level(c)>=18&&r.classState?.monkDefenseActive&&type!=='Force'&&type!=='Unspecified';
 const monkElements=cls(c)==='Monk'&&root.FolioMonk2024?.elements(c)&&level(c)>=17&&r.classState?.monkElementActive&&r.classState?.monkElementResistance===type;
 const warAvatar=cls(c)==='Cleric'&&root.FolioCleric2024?.war(c)&&level(c)>=17&&['Bludgeoning','Piercing','Slashing'].includes(type);
 const druidSea=!!root.FolioDruid2024?.sea(c)&&level(c)>=10&&!!r.classState?.druidSea&&r.classState.druidSea.self&&['Cold','Lightning','Thunder'].includes(type);
 const druidStars=!!root.FolioDruid2024?.stars(c)&&level(c)>=14&&!!r.classState?.druidStarry&&['Bludgeoning','Piercing','Slashing'].includes(type);
 const sorcererPsychic=!!root.FolioSorcerer2024?.aberrant(c)&&level(c)>=6&&type==='Psychic';
 const sorcererElement=!!root.FolioSorcerer2024?.draconic(c)&&level(c)>=6&&c.build?.sorcererDragonElement===type;
 const species=root.FolioSpecies2024;const speciesId=species?.supported(c)?species.id(c):'';const speciesDamage=species?.heritageDamage(c)||'';const speciesResistance=(speciesId==='aasimar'&&['Radiant','Necrotic'].includes(type))||(['dragonborn','dwarf','tiefling'].includes(speciesId)&&speciesDamage===type);
 const featResistances=root.FolioFeat2024?.passive(c)?.resistances||[];const boonResist=featResistances.includes(type)||root.FolioFeat2024?.has(c,'Boon of the Night Spirit')&&!!r.featState?.nightSpiritActive&&!['Psychic','Radiant','Unspecified'].includes(type);
 const automaticResistance=boonResist||speciesResistance||warAvatar||(raging&&RAGE_RESISTANCE.has(type))||wildBear||zealotForm||fiendResistance||landResistance||hunterResistance||ancientsResistance||monkDefense||monkElements||druidSea||druidStars||sorcererPsychic||sorcererElement||greatOldOnePsychic||celestialRadiant;
 const wizardSpellResist=!!root.FolioWizard2024?.isWizard(c)&&root.FolioWizard2024.subclass(c)==='Abjurer'&&level(c)>=14&&choices.spellDamage===true;
 const resistant=automaticResistance||wizardSpellResist||choices.resistant===true;
 const vulnerable=choices.vulnerable===true,immune=choices.immune===true;
 // Defensive options are explicit per-hit choices. They require the player to
 // confirm the trigger; the Folio does not know who attacked or who saved.
 const defense=choices.defense||'none',who=cls(c),n=level(c);
 if(!['none','uncanny-dodge','deflect-attacks','evasion-success','evasion-fail'].includes(defense))throw Error('Invalid defensive feature.');
 const incapacitated=(r.conditions||[]).some(x=>['Incapacitated','Paralyzed','Petrified','Stunned','Unconscious'].includes(x));
 if(defense==='uncanny-dodge'&&(who!=='Rogue'||n<5))throw Error('Uncanny Dodge requires Rogue level 5.');
 if(defense==='deflect-attacks'&&(who!=='Monk'||n<3))throw Error('Deflect Attacks requires Monk level 3.');
 if(defense==='deflect-attacks'&&!RAGE_RESISTANCE.has(type)&&n<13)throw Error('Before Deflect Energy at level 13, Deflect Attacks requires Bludgeoning, Piercing, or Slashing attack damage.');
 if(defense==='deflect-attacks'&&(!Number.isInteger(choices.deflectDie)||choices.deflectDie<1||choices.deflectDie>10))throw Error('Roll a d10 for Deflect Attacks.');
 if(defense.startsWith('evasion')&&(!['Rogue','Monk'].includes(who)||n<7))throw Error('Evasion requires Rogue or Monk level 7.');
 if(defense!=='none'&&incapacitated)throw Error('This defensive feature is unavailable while Incapacitated.');
 if(['uncanny-dodge','deflect-attacks'].includes(defense)&&r.classState?.reactionUsed)throw Error('Reaction already used; reset at the start of your turn.');
 // Damage modifiers, then resistance, then vulnerability (SRD 5.2.1 p.17).
 const qualifiedHeavy=!!root.FolioFeat2024?.has(c,'Heavy Armor Master')&&(state.inventory?.items||[]).some(i=>i.equipped&&i.category==='armor'&&i.armor?.kind==='heavy')&&['Bludgeoning','Piercing','Slashing'].includes(type);
 if(choices.heavyArmorAttack&&!qualifiedHeavy)throw Error('Heavy Armor Master needs a qualifying attack and worn Heavy armor.');
 const heavyReduction=choices.heavyArmorAttack?Math.max(0,2+Math.floor((level(c)-1)/4)):0;
 const damageAfterHeavy=Math.max(0,amount-heavyReduction);
 const adjusted=defense==='uncanny-dodge'||defense==='evasion-fail'?Math.floor(damageAfterHeavy/2):defense==='evasion-success'?0:defense==='deflect-attacks'?Math.max(0,damageAfterHeavy-Math.max(0,choices.deflectDie+mod(c.scores.dex)+n)):damageAfterHeavy;
 const afterResistance=immune?0:resistant?Math.floor(adjusted/2):adjusted;
 const resolved=immune?0:vulnerable?afterResistance*2:afterResistance;
 const activeWard=root.FolioWizard2024?.isWizard(c)&&root.FolioWizard2024.subclass(c)==='Abjurer'?r.classState?.wizardWard:null;
 const wardAbsorbed=activeWard?.active?Math.min(activeWard.hp||0,resolved):0;const bodyResolved=resolved-wardAbsorbed;
 const absorb=Math.min(r.tempHp||0,bodyResolved);
 const hpLost=Math.min(r.hp||0,Math.max(0,bodyResolved-absorb));
 const C=root.PipCore||(typeof require==='function'?require('./core.js'):null);
 let result=C.applyDamage(r,bodyResolved),relentless=null;
 const eligibleRelentless=cls(c)==='Barbarian'&&level(c)>=11&&r.classState?.raging&&r.hp>0&&result.hp===0&&Math.max(0,resolved-(r.tempHp||0)-r.hp)<r.maxHp;
 if(eligibleRelentless&&choices.relentlessRoll!=null){
  const die=choices.relentlessRoll;if(!Number.isInteger(die)||die<1||die>20)throw Error('Relentless Rage requires a valid d20 roll.');
  const dc=r.classState?.relentlessDC||10;
  const save=(root.PipCore||(typeof require==='function'?require('./core.js'):null)).derived(c,state.inventory||{items:[]},r).saves.con;
  const success=die+save>=dc;
  relentless={die,save,dc,total:die+save,success,healedTo:success?2*level(c):0};
  result={...result,hp:success?2*level(c):0,deathSuccess:success?0:result.deathSuccess,deathFailure:success?0:result.deathFailure};
 }
 const undyingEligible=ancients(c)&&level(c)>=15&&(r.classResources?.['undying-sentinel']??1)>0&&r.hp>0&&result.hp===0&&Math.max(0,resolved-(r.tempHp||0)-r.hp)<r.maxHp;
 if(choices.undyingSentinel&&!undyingEligible)throw Error('Undying Sentinel requires a nonfatal hit reducing you to 0 HP and an available use.');
 if(undyingEligible&&choices.undyingSentinel)result={...result,hp:Math.min(r.maxHp,1+3*level(c)),deathSuccess:0,deathFailure:0,classResources:adjust(c,r.classResources||{},'undying-sentinel',-1),lastClassEffect:{feature:'Undying Sentinel',healedTo:Math.min(r.maxHp,1+3*level(c)),note:'Consumed once-per-Long-Rest Undying Sentinel use on a nonlethal 0-HP hit.'}};
 const orcEligible=speciesId==='orc'&&species?.charge(c,r,'endurance')>0&&r.hp>0&&result.hp===0&&Math.max(0,resolved-(r.tempHp||0)-r.hp)<r.maxHp;
 if(choices.orcEndurance&&!orcEligible)throw Error('Relentless Endurance requires an eligible, nonfatal hit that reduces HP to zero.');
 if(orcEligible&&choices.orcEndurance){const ss=species.normalize(c,r.speciesState,c);ss.charges.endurance--;ss.last='Relentless Endurance triggered by incoming damage: 1 HP instead of 0.';result={...result,hp:1,deathSuccess:0,deathFailure:0,speciesState:ss};}
 const feat=root.FolioFeat2024,lastStandEligible=feat?.has(c,'Boon of Recovery')&&feat.remaining(c,r,'recovery-last-stand')>0&&r.hp>0&&C.applyDamage(r,bodyResolved).hp===0;
 if(choices.featLastStand&&!lastStandEligible)throw Error('Boon of Recovery Last Stand requires a confirmed hit reducing you to 0 HP and an available use.');
 if(choices.featLastStand&&(choices.undyingSentinel||choices.orcEndurance))throw Error('Choose one zero-HP recovery feature for this hit.');
 if(lastStandEligible&&choices.featLastStand){const fs=feat.normalize(c,r.featState||{},c);fs.charges['recovery-last-stand']--;fs.last='Boon of Recovery: Last Stand used during confirmed incoming damage.';result={...result,hp:Math.min(r.maxHp,1+Math.floor(r.maxHp/2)),deathSuccess:0,deathFailure:0,featState:fs};}

 const protectedMark=cls(c)==='Ranger'&&level(c)>=13&&marked(r);
 const details={raw:amount,type,resolved:bodyResolved,heavyReduction,featLastStandApplied:!!(lastStandEligible&&choices.featLastStand),wardAbsorbed,absorbed:absorb,hpLost,resistant,vulnerable,immune,automaticResistance,defense,deflectReduction:defense==='deflect-attacks'?Math.max(0,amount-adjusted):0,source:speciesResistance?'Species resistance':wizardSpellResist?'Spell Resistance':celestialRadiant?'Radiant Soul':greatOldOnePsychic?'Thought Shield':sorcererPsychic?'Psychic Defenses':sorcererElement?'Elemental Affinity':druidSea?'Stormborn':druidStars?'Full of Stars':warAvatar?'Avatar of Battle':monkDefense?'Superior Defense':monkElements?'Elemental Epitome':wildBear?'Wild Heart Bear':zealotForm?'Rage of the Gods':hunterResistance?'Superior Hunter Defense':fiendResistance?'Fiendish Resilience':landResistance?'Nature’s Ward':ancientsResistance?'Aura of Warding':raging&&RAGE_RESISTANCE.has(type)?'Barbarian Rage':'',
  // A hit absorbed by temporary HP still counts as taking damage for concentration.
  concentrationDC:r.concentration&&bodyResolved>0&&!protectedMark?C.concentrationDC(bodyResolved):null,concentrationProtected:protectedMark&&bodyResolved>0,relentless,relentlessEligible:eligibleRelentless,undyingEligible,undyingApplied:!!(undyingEligible&&choices.undyingSentinel)};
 return {state:{...state,resources:{...result,lastConcentrationDC:protectedMark?null:result.lastConcentrationDC,lastDamage:details,classState:{...r.classState,...(wardAbsorbed?{wizardWard:{...activeWard,hp:activeWard.hp-wardAbsorbed}}:{}),...(relentless?{relentlessDC:relentless.dc+5}:{}),...(['uncanny-dodge','deflect-attacks'].includes(defense)?{reactionUsed:true}:{}),...(result.hp===0&&cls(c)==='Paladin'?{divineSenseActive:false}:{}),...(result.hp===0&&cls(c)==='Barbarian'?{raging:false,barbarianRageRemaining:0,zealotFormActive:false}:{})},...(relentless?{lastClassEffect:{feature:'Relentless Rage',...relentless}}:{})}},details};
}
// A Boolean state tracks a manual Rage duration. It does not simulate turns or attacks.
root.FolioClassMechanics={PALADIN_DURATION_ROUNDS,paladinDurationStart,paladinDurationEnd,paladinDurationAdvance,paladinNewTurn,paladinTurnMark,recordPaladinSpellCast,restClassState,devotion,glory,ancients,vengeance,activateDivineSense,endDivineSense,abjureFoes,livingLegendSaveReroll,resolvePaladinAllyAura,activatePeerlessAthlete,endPeerlessAthlete,inspiringSmite,gloriousDefense,naturesWrath,vowOfEnmity,transferVow,endVow,oathCapstone,paladinStartTurn,hunter,openHand,activateSacredWeapon,endSacredWeapon,useHolyNimbus,chooseHunterOptions,hunterNewTurn,hunterStartTurn,resolveHunterPrey,useSuperiorHunterDefense,endSuperiorHunterDefense,useWholenessOfBody,useOpenHandTechnique,quiveringPalm,HUNTER_PREY,HUNTER_DEFENSE,lore,circleLand,evoker,LAND_TYPES,loreCuttingWords,lorePeerlessSkill,chooseCircleLand,useLandsAid,landRecoverSlots,useNaturalRecoveryFreeSpell,evokerPotentCantrip,evokerSculptSpells,evokerEmpoweredDamage,lifeDomain,draconic,fiend,FIEND_RESIST_TYPES,usePreserveLife,useDarkOnesBlessing,useDarkOnesLuck,chooseFiendResilience,useDragonWings,rollInitiative,resolveAbilityCheck,useCountercharm,cls,level,berserker,mindlessRage,barbarianNewTurn,barbarianStartTurn,barbarianAttack,useIntimidatingPresence,champion,championCriticalThreshold,fighterActionSurge,useIndomitable,fighterStartTurn,championDeathSave,resourcesFor,normalizeResources,adjust,rest,armorStatus,passive,startRage,toggleInnateSorcery,resetReaction,useSecondWind,recordPhysicalRecovery,useLayOnHands,usePaladinTouch,useMagicalCunning,useSorcerousRestoration,convertSorcery,recoverWizardSlots,regainWildShapeFromSlot,exchangeWildShapeForSlot,useDivineSpark,grantBardicInspiration,useFontOfInspiration,useTacticalMind,monkMartialDie,useMonkFocus,useUncannyMetabolism,usePerfectFocus,DAMAGE_TYPES,resolveIncomingDamage,ROGUE_STRIKES,resetSneakAttack,resolveSneakAttack,resolvePaladinSmite,castHuntersMark,endHuntersMark,useTireless,toggleNaturesVeil,marked};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioClassMechanics;
})(typeof window!=='undefined'?window:globalThis);
