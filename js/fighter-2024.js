(function(root){'use strict';
// The Folio: 2024 Fighter sheet mechanics. Confirmed targets are recorded, never edited.
const CM=()=>root.FolioClassMechanics;
const mod=n=>Math.floor((Number(n)-10)/2);
const pb=n=>2+Math.floor((Number(n)-1)/4);
const isF=c=>c?.templateKind==='starter'&&(c.build?.characterClass||c.className)==='Fighter';
const level=c=>Number(c?.level)||1;
const sub=c=>c?.build?.subclass||c?.subclass||'';
const battle=c=>isF(c)&&level(c)>=3&&sub(c)==='Battle Master';
const psi=c=>isF(c)&&level(c)>=3&&sub(c)==='Psi Warrior';
const eldritch=c=>isF(c)&&level(c)>=3&&sub(c)==='Eldritch Knight';
const incapacitated=r=>(r?.hp??1)<=0||(r?.conditions||[]).some(x=>['Incapacitated','Unconscious','Paralyzed','Stunned','Petrified'].includes(x));
const name=x=>{const s=String(x||'').trim();if(!s||s.length>80)throw Error('Enter a confirmed creature name (1–80 characters).');return s;};
const dice=(d,roll)=>{const n=roll(d);if(!Number.isInteger(n)||n<1||n>d)throw Error('Invalid die roll.');return n;};
const MNS=['Ambush','Bait and Switch',"Commander's Strike",'Commanding Presence','Disarming Attack','Distracting Strike','Evasive Footwork','Feinting Attack','Goading Attack','Lunging Attack','Maneuvering Attack','Menacing Attack','Parry','Precision Attack','Pushing Attack','Rally','Riposte','Sweeping Attack','Tactical Assessment','Trip Attack'];
const MNS_SET=new Set(MNS);
const REACTION_MNS=new Set(['Parry','Riposte']);
const BONUS_MNS=new Set(['Evasive Footwork','Feinting Attack','Lunging Attack','Rally']);
const HIT_MNS=new Set(['Disarming Attack','Distracting Strike','Goading Attack','Maneuvering Attack','Menacing Attack','Pushing Attack','Sweeping Attack','Trip Attack']);
const CHECK_MNS=new Set(['Ambush','Commanding Presence','Tactical Assessment','Precision Attack']);
function dieSize(c,variant='normal'){return variant==='relentless'?8:battle(c)?level(c)>=18?12:level(c)>=10?10:8:psi(c)?level(c)>=17?12:level(c)>=11?10:level(c)>=5?8:6:0;}
function maneuverLimit(c){return battle(c)?level(c)>=15?9:level(c)>=10?7:level(c)>=7?5:3:0;}
function manageManeuvers(s,selection){const c=s.character,r=s.resources;if(!battle(c))throw Error('Battle Master is required.');if(!Array.isArray(selection)||new Set(selection).size!==selection.length||selection.length>maneuverLimit(c)||selection.some(x=>!MNS_SET.has(x)))throw Error('Choose unique official maneuvers within your level limit.');return {...s,resources:{...r,classState:{...r.classState,fighterKnownManeuvers:selection},lastClassEffect:{feature:'Battle Master maneuvers',note:selection.length+' of '+maneuverLimit(c)+' choices recorded; revisit only when your DM permits a level-up replacement.'}}};}
function newTurn(s){const c=s.character,r=s.resources;if(!isF(c))throw Error('Fighter required.');const f=r.classState||{};return {...s,resources:{...r,classState:{...f,fighterTurnTracking:true,fighterTurnCount:(f.fighterTurnCount||0)+1,fighterActionUsed:false,fighterBonusActionUsed:false,fighterAttackActionInProgress:false,fighterAttackRolls:0,fighterSurgeActions:0,fighterLightExtraUsed:false,fighterLightTrigger:null,fighterRelentlessUsed:false,fighterPsiStrikeUsed:false,fighterTelekinesisBonusUsed:false,fighterFeintTarget:null,fighterFeintDie:0,fighterLungeDie:0,fighterEvasiveBonus:0,fighterBaitBonus:0,fighterBaitSelf:false,psiLeapActive:false,psiBulwarkRounds:incapacitated(r)?0:Math.max(0,(f.psiBulwarkRounds||0)-1),psiBulwarkActive:!incapacitated(r)&&(f.psiBulwarkRounds||0)>1,actionSurgeThisTurn:false,reactionUsed:false,...((f.fighterStudiedExpires||0)<(f.fighterTurnCount||0)+1?{fighterStudiedTarget:null}:{} )}}};}
function startTurn(s){if(!isF(s.character))return s;const r=s.resources,f=r.classState||{};if(!f.fighterTurnTracking)return s;return {...s,resources:{...r,classState:{...f,fighterActionUsed:false,fighterBonusActionUsed:false,fighterAttackActionInProgress:false,fighterAttackRolls:0,fighterSurgeActions:0,fighterLightExtraUsed:false,fighterLightTrigger:null,fighterRelentlessUsed:false,fighterPsiStrikeUsed:false,fighterTelekinesisBonusUsed:false,fighterFeintTarget:null,fighterFeintDie:0,fighterLungeDie:0,fighterEvasiveBonus:0,fighterBaitBonus:0,fighterBaitSelf:false,psiLeapActive:false,psiBulwarkRounds:incapacitated(r)?0:Math.max(0,(f.psiBulwarkRounds||0)-1),psiBulwarkActive:!incapacitated(r)&&(f.psiBulwarkRounds||0)>1,reactionUsed:false,actionSurgeThisTurn:false,fighterTurnCount:(f.fighterTurnCount||0)+1}}};}
function spendBonus(r){const f=r.classState||{};if(f.fighterTurnTracking&&f.fighterBonusActionUsed)throw Error('Bonus Action already used this tracked turn.');return {...f,...(f.fighterTurnTracking?{fighterBonusActionUsed:true}:{})};}
function spendReaction(r){const f=r.classState||{};if(f.reactionUsed)throw Error('Reaction already used.');return {...f,reactionUsed:true};}
function attackBudget(c,r,item,mode,role='attack'){
 if(!isF(c)||!r?.classState?.fighterTurnTracking)return null;
 if(incapacitated(r))throw Error('Cannot attack while incapacitated.');
 const f=r.classState||{},w=item.weapon||{},id=item.id,props=w.propertyList||[];
 const light=props.includes('Light')||String(w.properties||'').includes('Light');
 const max=CM().passive(c,{items:[]}).attacks;
 let z={...f};
 if(role==='opportunity'||role==='riposte'){
  if(w.kind!=='Melee'||mode==='throw'||mode==='ranged')throw Error('Reaction counterattack must be melee in reach.');
  z=spendReaction(r);
 }else if(role==='psi-bonus'){
  if(!psi(c)||level(c)<18||!f.psiTelekinesisActive||r.concentration!=='Telekinesis')throw Error('Telekinetic Master Bonus Action attack requires active Telekinesis concentration.');
  if(f.fighterTelekinesisBonusUsed)throw Error('Telekinetic Master attack already made this turn.');
  z=spendBonus(r);z.fighterTelekinesisBonusUsed=true;
 }else if(role==='attack'){
  if(f.fighterActionUsed&&!f.fighterAttackActionInProgress&&!(f.fighterSurgeActions>0))throw Error('Your Action was spent.');
  if((f.fighterAttackRolls||0)>=max){if(!(f.fighterSurgeActions>0))throw Error('Extra Attack limit reached.');z.fighterSurgeActions=f.fighterSurgeActions-1;z.fighterAttackRolls=0;}
  z.fighterActionUsed=true;z.fighterAttackActionInProgress=true;z.fighterAttackRolls=(z.fighterAttackRolls||0)+1;
  if(light&&!z.fighterLightExtraUsed)z.fighterLightTrigger=id;
 }else if(role==='light-bonus'||role==='nick'){
  if(!light||!f.fighterLightTrigger||f.fighterLightTrigger===id||f.fighterLightExtraUsed)throw Error('The Light attack needs a different eligible Light weapon.');
  if(role==='nick'&&(!w.mastered||w.mastery!=='Nick'))throw Error('Nick mastery must be selected on this weapon.');
  if(role==='light-bonus')z=spendBonus({...r,classState:z});
  z.fighterLightExtraUsed=true;z.fighterLightTrigger=null;
 }else throw Error('Invalid Fighter attack role.');
 return {...r,classState:z};
}
function previewAttack(c,r,target){const f=r?.classState||{};return isF(c)&&level(c)>=13&&target&&f.fighterStudiedTarget?.toLowerCase()===target.toLowerCase()&&(f.fighterStudiedExpires??-1)>=(f.fighterTurnCount||0);}
function afterAttack(c,r,hit,target,natural){if(!isF(c)||!r)return r;const f=r.classState||{},ct=f.fighterTurnCount||0,z={...f};if(level(c)>=13&&target){if(hit===false){z.fighterStudiedTarget=target;z.fighterStudiedExpires=ct+1;}else if(f.fighterStudiedTarget?.toLowerCase()===target.toLowerCase()){z.fighterStudiedTarget=null;z.fighterStudiedExpires=ct;}}if(eldritch(c)&&level(c)>=10&&hit===true&&target){z.eldritchStrikeTarget=target;z.eldritchStrikeExpires=ct+1;}return {...r,classState:z};}
function useManeuver(s,{maneuver,triggerConfirmed=false,target='',useRelentless=false,rollValue=null,incomingDamage=null,saveTotal=null}={},rollFn=()=>1){const c=s.character,r=s.resources,f=r.classState||{};
 if(!battle(c)||!MNS_SET.has(maneuver))throw Error('Choose a Battle Master maneuver.');
 if(!(f.fighterKnownManeuvers||[]).includes(maneuver))throw Error('Learn this maneuver in your selected maneuvers first.');
 if(!triggerConfirmed)throw Error('Confirm the maneuver trigger at the table.');if(incapacitated(r))throw Error('Cannot use a maneuver while incapacitated.');
 if(useRelentless&&(level(c)<15||f.fighterRelentlessUsed))throw Error('Relentless is available only once per turn from level 15.');
 if(!useRelentless&&(r.classResources?.['superiority-dice']??0)<1)throw Error('No Superiority Dice remaining.');
 let z={...f};if(REACTION_MNS.has(maneuver))z=spendReaction(r);if(BONUS_MNS.has(maneuver))z=spendBonus({...r,classState:z});
 if(HIT_MNS.has(maneuver)||maneuver==='Precision Attack'||maneuver==='Riposte')if(!target)throw Error('Record the attack target for this maneuver.');
 const side=dieSize(c,useRelentless?'relentless':'normal'),die=rollValue==null?dice(side,rollFn):rollValue;
 if(!Number.isInteger(die)||die<1||die>side)throw Error('Superiority Die is outside its valid range.');
 if(useRelentless)z.fighterRelentlessUsed=true;
 const saveDC=8+pb(level(c))+Math.max(mod(c.scores.str),mod(c.scores.dex));
 const notes={
  'Ambush':'Add die to confirmed Stealth check or Initiative roll.',
  'Bait and Switch':'Switch with willing adjacent creature; add die to chosen creature AC until next turn.',
  "Commander's Strike":'Replace an Attack action attack; ally uses Reaction and adds die to its damage on hit.',
  'Commanding Presence':'Add die to Intimidation, Performance or Persuasion check.',
  'Disarming Attack':'Add die to damage; target makes Strength save to avoid dropping held item.',
  'Distracting Strike':'Add die to damage; next qualifying ally attack has Advantage.',
  'Evasive Footwork':'Disengage with Bonus Action; add die to AC until your next turn.',
  'Feinting Attack':'Advantage on next attack against nearby target this turn; on hit add die damage.',
  'Goading Attack':'Add die damage; failed Wisdom save penalizes attacks against other targets.',
  'Lunging Attack':'Dash and add die damage to qualifying charge hit.',
  'Maneuvering Attack':'Add die damage; an ally can move with its Reaction.',
  'Menacing Attack':'Add die damage; failed Wisdom save Frightens until end of next turn.',
  'Parry':'Reduce confirmed incoming melee damage by die + STR or DEX modifier.',
  'Precision Attack':'Add die to missed attack roll; compare new total against AC.',
  'Pushing Attack':'Add die damage; failed Strength save pushes eligible target.',
  'Rally':'Grant ally temporary HP = die + floor(Fighter level / 2).',
  'Riposte':'After melee attack misses you, Reaction counterattack; add die damage on hit.',
  'Sweeping Attack':'Second adjacent target takes die damage if same attack roll would hit.',
  'Tactical Assessment':'Add die to History, Investigation or Insight check.',
  'Trip Attack':'Add die damage; failed Strength save makes eligible target Prone.'};
 if(maneuver==='Feinting Attack'){z.fighterFeintTarget=name(target);z.fighterFeintDie=side;}
 if(maneuver==='Lunging Attack')z.fighterLungeDie=side;
 if(maneuver==='Evasive Footwork')z.fighterEvasiveBonus=die;
 if(maneuver==='Bait and Switch'){z.fighterBaitBonus=die;z.fighterBaitSelf=String(target).trim().toLowerCase()==='self';}
 const total=incomingDamage==null?null:Math.max(0,incomingDamage-Math.max(0,die+Math.max(mod(c.scores.str),mod(c.scores.dex))));
 const detail={feature:'Battle Master maneuver',maneuver,die,dieSize:side,saveDC,target,preventedDamage:total===null?null:incomingDamage-total,remainingDamage:total,bonus: maneuver==='Rally'?die+Math.floor(level(c)/2):die,note:notes[maneuver]};
 return {...s,resources:{...r,tempHp:maneuver==='Rally'&&String(target).trim().toLowerCase()==='self'?Math.max(r.tempHp||0,detail.bonus):r.tempHp,classState:z,classResources:useRelentless?r.classResources:CM().adjust(c,r.classResources,'superiority-dice',-1),lastClassEffect:detail}};
}
// The weapon roller calls these functions in a single transaction. A checked box is
// never enough to award a benefit: the weapon roll must confirm the triggering hit.
// Do not modify outside creatures' HP/conditions from a character-only sheet.
const ATTACK_HIT_MANEUVERS=['Disarming Attack','Distracting Strike','Goading Attack','Maneuvering Attack','Menacing Attack','Pushing Attack','Sweeping Attack','Trip Attack'];
const ATTACK_HIT_SET=new Set(ATTACK_HIT_MANEUVERS);
function validateAttackPower(c,r,options={}){
 const maneuver=String(options.maneuver||'');const psionic=!!options.psiStrike;
 if(!maneuver&&!psionic){if(options.useRelentless)throw Error('Relentless needs a selected maneuver.');return false;}
 if(!Number.isInteger(options.targetAC)||options.targetAC<1||options.targetAC>50)throw Error('A target AC is required for attack-linked Fighter powers.');
 if(!String(options.targetName||'').trim())throw Error('Name the confirmed target for attack-linked Fighter powers.');
 if(maneuver==='Sweeping Attack'&&(!options.secondaryName||!options.secondaryWithinReach||!Number.isInteger(options.secondaryAC)||options.secondaryAC<1||options.secondaryAC>50))throw Error('Sweeping Attack requires a confirmed second target within reach and its AC.');
 if(incapacitated(r))throw Error('Cannot activate Fighter attack powers while incapacitated.');
 const f=r?.classState||{};
 if(maneuver){
  if(!battle(c)||!ATTACK_HIT_SET.has(maneuver))throw Error('Choose a supported Battle Master hit maneuver.');
  if(!(f.fighterKnownManeuvers||[]).includes(maneuver))throw Error('Learn the maneuver before using it with an attack.');
  if(options.useRelentless){if(level(c)<15||f.fighterRelentlessUsed)throw Error('Relentless is available once per turn from level 15.');}
  else if((r.classResources?.['superiority-dice']??0)<1)throw Error('No Superiority Dice remaining.');
 }
 if(psionic){
  if(!psi(c))throw Error('Psionic Strike requires a Psi Warrior.');
  if(options.attackRole==='opportunity')throw Error('Psionic Strike is available only on your own turn.');
  if(!options.within30)throw Error('Confirm the target is within 30 feet for Psionic Strike.');
  if(f.fighterPsiStrikeUsed)throw Error('Psionic Strike is once per turn. Start a new turn first.');
  if((r.classResources?.['psionic-energy']??0)<1)throw Error('No Psionic Energy Dice remaining.');
 }
 return true;
}
function applyAttackPower(c,r,{hit=false,critical=false}={},options={},rollFn=()=>1){
 if(!validateAttackPower(c,r,options))return {resources:r,applied:false,damage:0,forceDamage:0,maneuver:null,psionic:null};
 if(hit!==true)return {resources:r,applied:false,damage:0,forceDamage:0,maneuver:null,psionic:null,note:'Attack-linked features were not spent because this attack missed.'};
 let pool={...r.classResources},z={...r.classState},maneuverResult=null,psionicResult=null,damage=0,forceDamage=0;
 if(options.maneuver){
  const side=dieSize(c,options.useRelentless?'relentless':'normal');
  const rolls=Array.from({length:options.maneuver==='Sweeping Attack'?1:critical?2:1},()=>dice(side,rollFn));
  const amount=rolls.reduce((a,b)=>a+b,0);
  if(options.useRelentless)z.fighterRelentlessUsed=true;
  else pool=CM().adjust(c,pool,'superiority-dice',-1);
  if(options.maneuver!=='Sweeping Attack')damage+=amount;
  const swept=options.maneuver==='Sweeping Attack'&&options.attackNatural!==1&&(options.attackNatural>=20||options.attackTotal>=options.secondaryAC);
  maneuverResult={name:options.maneuver,dieSize:side,rolls,damage:options.maneuver==='Sweeping Attack'?0:amount,secondaryTarget:options.maneuver==='Sweeping Attack'?String(options.secondaryName).trim():null,secondaryHit:options.maneuver==='Sweeping Attack'?!!swept:null,secondaryDamage:options.maneuver==='Sweeping Attack'&&swept?amount:0,damageType:options.weaponDamageType||'',saveDC:8+pb(level(c))+Math.max(mod(c.scores.str),mod(c.scores.dex)),usedRelentless:!!options.useRelentless,
   note:'Confirmed target is affected only when its relevant save and conditions are resolved at the table.'};
 }
 if(options.psiStrike){
  const side=dieSize(c),roll=dice(side,rollFn),amount=Math.max(0,roll+mod(c.scores.int));
  pool=CM().adjust(c,pool,'psionic-energy',-1);
  z.fighterPsiStrikeUsed=true;forceDamage+=amount;
  psionicResult={dieSize:side,roll,damage:amount,damageType:'Force',saveDC:level(c)>=7?8+pb(level(c))+mod(c.scores.int):null,
   note:'Psionic Strike requires a hit and damage. At level 7+, the DM may resolve Telekinetic Thrust with the noted Strength save DC.'};
 }
 const result={feature:'Fighter attack-linked power',target:String(options.targetName).trim(),maneuver:maneuverResult,psionic:psionicResult,extraDamage:damage+forceDamage,
  note:'External creature HP, saves and positions are controlled by the table, not Folio.'};
 return {resources:{...r,classState:z,classResources:pool,lastClassEffect:result},applied:true,damage,forceDamage,maneuver:maneuverResult,psionic:psionicResult};
}
function knowEnemy(s,{target='',within30=false,restoreWithDie=false}={}){const c=s.character,r=s.resources;if(!battle(c)||level(c)<7)throw Error('Know Your Enemy requires Battle Master level 7.');const t=name(target);if(!within30)throw Error('Confirm target visible within 30 feet.');let pool={...r.classResources};if((pool['know-your-enemy']??0)<1){if(!restoreWithDie||(pool['superiority-dice']??0)<1)throw Error('Restore Know Your Enemy by expending a Superiority Die.');pool=CM().adjust(c,pool,'superiority-dice',-1);}else pool=CM().adjust(c,pool,'know-your-enemy',-1);return {...s,resources:{...r,classResources:pool,classState:spendBonus(r),lastClassEffect:{feature:'Know Your Enemy',target:t,note:'DM confirms target Immunities, Resistances and Vulnerabilities.'}}};}
function psiAction(s,{action,target='',within30=false,triggerConfirmed=false,dieValue=null,saveTotal=null,forceRestoration=false}={},rollFn=()=>1){const c=s.character,r=s.resources,f=r.classState||{},n=level(c);if(!psi(c))throw Error('Psi Warrior level 3 required.');if(incapacitated(r))throw Error('Cannot use psionic power while Incapacitated.');const allowed=['protective','strike','movement','leap','guarded','bulwark','telekinesis'];if(!allowed.includes(action))throw Error('Choose a psionic feature.');if(!triggerConfirmed)throw Error('Confirm trigger at the table.');let pool={...r.classResources},z={...f},cost=0,side=dieSize(c),die=null;
 const freeKey={movement:'telekinetic-movement',leap:'psi-powered-leap',bulwark:'bulwark-of-force',telekinesis:'telekinetic-master'}[action];
 const min={protective:3,strike:3,movement:3,leap:7,guarded:10,bulwark:15,telekinesis:18}[action];if(n<min)throw Error('Feature has not unlocked.');
 if(['protective','strike','movement','bulwark'].includes(action)&&!within30)throw Error('Confirm target within 30 feet.');
 if(action==='strike'&&f.fighterPsiStrikeUsed)throw Error('Psionic Strike once on each of your turns.');
 if(['protective'].includes(action))z=spendReaction(r);
 if(['leap','bulwark'].includes(action))z=spendBonus({...r,classState:z});
 if(['movement','telekinesis'].includes(action)&&f.fighterTurnTracking){if(f.fighterActionUsed)throw Error('Your Action has already been spent.');z.fighterActionUsed=true;z.fighterAttackActionInProgress=false;}
 if(action==='telekinesis'&&r.concentration&&r.concentration!=='Telekinesis')throw Error('Cannot concentrate on Telekinesis while concentrating on another spell.');
 if(action==='guarded'){if(!(r.conditions||[]).some(x=>x==='Charmed'||x==='Frightened'))throw Error('Guarded Mind needs Charmed or Frightened.');cost=1;}
 if(action==='protective'||action==='strike')cost=1;
 if(freeKey){if((pool[freeKey]??0)>0)pool=CM().adjust(c,pool,freeKey,-1);else cost=1;}
 if(cost){if((pool['psionic-energy']??0)<1)throw Error('Not enough Psionic Energy Dice.');pool=CM().adjust(c,pool,'psionic-energy',-1);}
 if(['protective','strike'].includes(action))die=dieValue==null?dice(side,rollFn):dieValue;
 if(die!==null&&(!Number.isInteger(die)||die<1||die>side))throw Error('Psionic roll outside die range.');
 const amount=die===null?null:action==='protective'?Math.max(1,die+mod(c.scores.int)):die+mod(c.scores.int);
 if(action==='strike')z.fighterPsiStrikeUsed=true;
 if(action==='leap')z.psiLeapActive=true;
 if(action==='bulwark'){z.psiBulwarkActive=true;z.psiBulwarkRounds=10;}
 if(action==='telekinesis')z.psiTelekinesisActive=true;
 if(action==='movement')z.psiLastMovedTarget=name(target);
 let conditions=r.conditions,concentration=r.concentration;
 if(action==='guarded')conditions=(r.conditions||[]).filter(x=>!['Charmed','Frightened'].includes(x));
 if(action==='telekinesis')concentration='Telekinesis';
 const notes={protective:'Reaction: reduce a confirmed creature’s damage by the rolled amount; external HP stays manual.',strike:'After a confirmed weapon hit this turn, add rolled Force damage to the target. At level 7+ you may trigger Telekinetic Thrust on a failed STR save.',movement:'Move eligible loose object or willing creature; location is adjudicated at the table.',leap:'Bonus Action: fly up to twice Speed until end of current turn.',guarded:'Ended all Charmed and Frightened effects on your character.',bulwark:'Bonus Action: Half Cover to up to INT modifier (min 1) confirmed creatures for 1 minute.',telekinesis:'Cast Telekinesis once without slots/components; on each maintained turn, a Bonus Action weapon attack may be made.'};
 return {...s,resources:{...r,conditions,concentration,classResources:pool,classState:z,lastClassEffect:{feature:'Psi Warrior',action,target,die,dieSize:side,amount,saveDC:8+pb(n)+mod(c.scores.int),note:notes[action]}}};
}
function weaponBond(s,itemId,replaceId=''){const c=s.character,r=s.resources;if(!eldritch(c))throw Error('Eldritch Knight required.');const item=s.inventory?.items?.find(x=>x.id===itemId&&x.category==='weapon');if(!item)throw Error('Select an inventory weapon.');const bonded=(r.classState?.fighterBondedWeapons||[]).filter(x=>x!==itemId);if(bonded.length>=2){if(!bonded.includes(replaceId))throw Error('Choose which of two bonded weapons to replace.');bonded.splice(bonded.indexOf(replaceId),1);}return {...s,resources:{...r,classState:{...r.classState,fighterBondedWeapons:[...bonded,itemId]},lastClassEffect:{feature:'War Bond',weapon:item.name,note:'Bond ritual confirmed: one hour with weapon within reach. Summon as Bonus Action on the same plane.'}}};}
function summonBond(s,itemId){const c=s.character,r=s.resources;if(!eldritch(c)||(r.classState?.fighterBondedWeapons||[]).includes(itemId)===false)throw Error('Weapon must be bonded.');return {...s,resources:{...r,classState:spendBonus(r),lastClassEffect:{feature:'War Bond summon',weapon:itemId,note:'Summoned bonded weapon to hand. Confirm same-plane requirement.'}}};}
function warMagic(s,{spellLevel=0,verifiedActionCasting=false}={}){const c=s.character,r=s.resources;if(!eldritch(c)||level(c)<7)throw Error('War Magic requires Eldritch Knight level 7.');if(!verifiedActionCasting)throw Error('Verify Wizard spell has Action casting time.');if(!Number.isInteger(spellLevel)||spellLevel<0||spellLevel>2)throw Error('Choose a valid spell level.');if(spellLevel>0&&(level(c)<18||spellLevel>2))throw Error('Improved War Magic requires Fighter level 18.');if(r.classState?.fighterTurnTracking&&!r.classState?.fighterAttackActionInProgress)throw Error('Begin an Attack action before replacing an attack with a spell.');const required=spellLevel===0?1:2;const used=(r.classState?.fighterAttackRolls||0);const max=CM().passive(c,{items:[]}).attacks;if(r.classState?.fighterTurnTracking&&used+required>max)throw Error('Not enough remaining attacks to replace with this spell.');return {...s,resources:{...r,classState:{...r.classState,fighterAttackRolls:used+required,warMagicPending:{spellLevel,required}},lastClassEffect:{feature:spellLevel?'Improved War Magic':'War Magic',spellLevel,replaced:required,note:'Attacks were replaced. Cast the eligible Wizard spell from your existing spellbook; undo if the cast is cancelled.'}}};}
function eldritchSpellSave(s,{target='',dieA,dieB,saveModifier=0}={}){const c=s.character,r=s.resources;if(!eldritch(c)||level(c)<10)throw Error('Eldritch Strike needs level 10.');const t=name(target),f=r.classState||{};if(f.eldritchStrikeTarget?.toLowerCase()!==t.toLowerCase()||(f.eldritchStrikeExpires??-1)<(f.fighterTurnCount||0))throw Error('Target must have been struck by a weapon before next-turn expiration.');if(![dieA,dieB].every(x=>Number.isInteger(x)&&x>=1&&x<=20)||!Number.isInteger(saveModifier))throw Error('Enter confirmed target d20 rolls and modifier.');const rolled=Math.min(dieA,dieB),total=rolled+saveModifier,dc=8+pb(level(c))+mod(c.scores.int);return {...s,resources:{...r,classState:{...f,eldritchStrikeTarget:null},lastClassEffect:{feature:'Eldritch Strike save',target:t,rolls:[dieA,dieB],total,dc,failed:total<dc,note:'Confirmed target had Disadvantage on its next save against your spell.'}}};}
// Resolving a previously missed attack with Precision Attack happens in the same weapon
// transaction. The die is spent even if the revised total is still a miss; a natural 1
// stays a miss. No attack-linked maneuver can be stacked with it.
function precisionAttack(c,r,{total,natural,targetAC,useRelentless=false}={},rollFn=()=>1){
 if(!battle(c)||!(r.classState?.fighterKnownManeuvers||[]).includes('Precision Attack'))throw Error('Precision Attack must be learned by a Battle Master.');
 if(!Number.isInteger(targetAC)||targetAC<1||targetAC>50||!Number.isInteger(total)||!Number.isInteger(natural))throw Error('Precision Attack requires a confirmed attack total and AC.');
 if(natural===1||natural===20||total>=targetAC)return {resources:r,applied:false,hit:total>=targetAC&&natural!==1,bonus:0};
 const f=r.classState||{};
 if(useRelentless&&(level(c)<15||f.fighterRelentlessUsed))throw Error('Relentless is available once per tracked turn from level 15.');
 if(!useRelentless&&(r.classResources?.['superiority-dice']??0)<1)throw Error('No Superiority Dice remaining.');
 const side=dieSize(c,useRelentless?'relentless':'normal'),bonus=dice(side,rollFn);
 const resources={...r,classState:{...f,...(useRelentless?{fighterRelentlessUsed:true}:{})},classResources:useRelentless?r.classResources:CM().adjust(c,r.classResources,'superiority-dice',-1),lastClassEffect:{feature:'Precision Attack',bonus,side,total:total+bonus,hit:total+bonus>=targetAC}};
 return {resources,applied:true,hit:total+bonus>=targetAC,bonus};
}
// A Riposte uses the Reaction and Superiority Die when the counterattack is made,
// including on a miss. Only a confirmed melee miss against you can trigger it.
function riposteAttack(c,r,{hit=false,critical=false,useRelentless=false}={},rollFn=()=>1){
 if(!battle(c)||(r.classState?.fighterKnownManeuvers||[]).includes('Riposte')===false)throw Error('Riposte must be learned by a Battle Master.');
 if(useRelentless&&(level(c)<15||r.classState?.fighterRelentlessUsed))throw Error('Relentless is available once per tracked turn from level 15.');
 if(!useRelentless&&(r.classResources?.['superiority-dice']??0)<1)throw Error('No Superiority Dice remaining for Riposte.');
 const side=dieSize(c,useRelentless?'relentless':'normal'),rolls=hit?Array.from({length:critical?2:1},()=>dice(side,rollFn)):[],damage=rolls.reduce((a,b)=>a+b,0);
 const resources={...r,classState:{...r.classState,reactionUsed:true,...(useRelentless?{fighterRelentlessUsed:true}:{})},classResources:useRelentless?r.classResources:CM().adjust(c,r.classResources,'superiority-dice',-1),lastClassEffect:{feature:'Riposte',hit,dieSize:side,rolls,extraDamage:damage}};
 return {resources,damage,rolls,spent:true};
}
function previewFeint(c,r,target){return battle(c)&&!!target&&r.classState?.fighterFeintTarget?.toLowerCase()===String(target).toLowerCase()&&!!r.classState?.fighterFeintDie;}
function finalizeManeuverAttack(c,r,{target='',hit=false,critical=false,melee=false,lungeConfirmed=false}={},rollFn=()=>1){
 if(!battle(c))return {resources:r,damage:0,details:[]};
 const f=r.classState||{},z={...f},details=[];let damage=0;
 if(previewFeint(c,r,target)){
  if(hit){const rolls=Array.from({length:critical?2:1},()=>dice(f.fighterFeintDie,rollFn));const value=rolls.reduce((a,b)=>a+b,0);damage+=value;details.push({name:'Feinting Attack',rolls,damage:value});}
  z.fighterFeintTarget=null;z.fighterFeintDie=0;
 }
 if(f.fighterLungeDie&&melee&&lungeConfirmed){
  if(hit){const rolls=Array.from({length:critical?2:1},()=>dice(f.fighterLungeDie,rollFn));const value=rolls.reduce((a,b)=>a+b,0);damage+=value;details.push({name:'Lunging Attack',rolls,damage:value});}
  z.fighterLungeDie=0;
 }
 return {resources:{...r,classState:z},damage,details};
}
// The spell and Attack-action replacement commit together. The ordinary spellbook
// still validates preparation, slot level, and concentration. This avoids an orphaned
// War Magic reservation if casting is refused or cancelled.
function castWizardSpell(s,{spellId,cost,warMagic=false,actionTimeConfirmed=false}={}){
 const c=s.character,r=s.resources,FR=root.FolioSpellRules||(typeof require==='function'?require('./rules-engine.js'):null);
 if(!eldritch(c)||!FR)throw Error('Eldritch Knight is required.');
 const sp=FR.getSpell(spellId,s.spellbook);if(!sp)throw Error('Choose an available Wizard spell.');
 if(!(sp.classes||[]).includes('Wizard')&&!FR.availableSpells(c).some(x=>x.name===sp.name))throw Error('War Magic requires an eligible Wizard spell.');
 const casting=String(sp.time||'').trim().toLowerCase(),verified=/^(?:1\s*)?action$/.test(casting)||(!/^(?:bonus action|reaction|\d+\s*(?:min|hour|day))/i.test(casting)&&actionTimeConfirmed);
 if(!warMagic){
  if(r.classState?.fighterTurnTracking){const f=r.classState;if(verified){if(f.fighterActionUsed)throw Error('Your normal Action is already spent; use War Magic during an Attack action instead.');}
   else if(/bonus action/i.test(casting)&&f.fighterBonusActionUsed)throw Error('Bonus Action already spent.');
   else if(/reaction/i.test(casting)&&f.reactionUsed)throw Error('Reaction already spent.');}
  const q=FR.cast(c,s.spellbook,r,spellId,cost);let z={...q.resources.classState};if(z.fighterTurnTracking){if(verified)z.fighterActionUsed=true;else if(/bonus action/i.test(casting))z.fighterBonusActionUsed=true;else if(/reaction/i.test(casting))z.reactionUsed=true;}
  return {...s,resources:{...q.resources,classState:z},spellbook:q.book};
 }
 if(level(c)<7)throw Error('War Magic requires Fighter level 7.');
 if(!verified)throw Error('War Magic requires verified Action casting time.');
 if(sp.level>0&&(level(c)<18||sp.level>2))throw Error('Improved War Magic requires Fighter level 18 and a Wizard spell of level 1 or 2.');
 if(sp.level===0&&cost!=='cantrip')throw Error('War Magic cantrips cost no slot.');
 if(sp.level>0&&!String(cost).startsWith('slot'))throw Error('Improved War Magic requires a spell slot.');
 const required=sp.level>0?2:1,f=r.classState||{},max=CM().passive(c,{items:[]}).attacks;
 let z={...f};if(f.fighterTurnTracking){
  if(f.fighterActionUsed&&!f.fighterAttackActionInProgress&&!(f.fighterSurgeActions>0))throw Error('The Attack action is no longer available.');
  if((f.fighterAttackRolls||0)+required>max){
   if(!(f.fighterSurgeActions>0))throw Error('Not enough remaining attacks for War Magic.');
   z.fighterSurgeActions--;z.fighterAttackRolls=0;
  }
  z.fighterActionUsed=true;z.fighterAttackActionInProgress=true;z.fighterAttackRolls=(z.fighterAttackRolls||0)+required;
  if(z.fighterAttackRolls>max)throw Error('Not enough remaining attacks for War Magic.');
 }
 const q=FR.cast(c,s.spellbook,r,spellId,cost);
 return {...s,spellbook:q.book,resources:{...q.resources,classState:z,lastClassEffect:{feature:sp.level?'Improved War Magic':'War Magic',spell:sp.name,cost,attacksReplaced:required,note:'Spell slot and Attack-action replacement were committed together; spell effects on other creatures remain table-confirmed.'}}};
}
// Student of War is a permanent Fighter subclass proficiency selection. Store it on
// the build (not merely in a transient button/resource record) so rebuilds can retain it.
const STUDENT_SKILLS=['Acrobatics','Animal Handling','Athletics','History','Insight','Intimidation','Persuasion','Perception','Survival'];
const ARTISAN_TOOLS=["Alchemist's Supplies","Brewer's Supplies","Calligrapher's Supplies","Carpenter's Tools","Cartographer's Tools","Cobbler's Tools","Cook's Utensils","Glassblower's Tools","Jeweler's Tools","Leatherworker's Tools","Mason's Tools","Painter's Supplies","Potter's Tools","Smith's Tools","Tinker's Tools","Weaver's Tools","Woodcarver's Tools"];
function studentOfWar(s,{skill,tool}={}){
 const c=s.character,r=s.resources;
 if(!battle(c)||!STUDENT_SKILLS.includes(skill)||!ARTISAN_TOOLS.includes(tool))throw Error('Student of War requires one Fighter skill and one Artisan tool.');
 const previous=c.build?.fighterStudentSkill||r.classState?.fighterStudentSkill;
 if((c.profSkills||[]).includes(skill)&&skill!==previous)throw Error('Choose a new skill proficiency not already granted by the build.');
 const skills=(c.profSkills||[]).filter(x=>x!==previous);
 return {...s,character:{...c,profSkills:[...new Set([...skills,skill])],tools:[...new Set([...(c.tools||[]).filter(x=>x!==(c.build?.fighterStudentTool||r.classState?.fighterStudentTool)),tool])],build:{...c.build,fighterStudentSkill:skill,fighterStudentTool:tool}},resources:{...r,classState:{...r.classState,fighterStudentSkill:skill,fighterStudentTool:tool},lastClassEffect:{feature:'Student of War',skill,tool}}};
}
function commandersStrike(s,{ally='',reactionConfirmed=false,hitConfirmed=false,useRelentless=false}={},rollFn=()=>1){
 const c=s.character,r=s.resources,f=r.classState||{};
 if(!battle(c)||(f.fighterKnownManeuvers||[]).includes("Commander's Strike")===false)throw Error('Learn Commander\'s Strike first.');
 if(!reactionConfirmed)throw Error('Confirm a willing ally can see or hear you and spends its Reaction.');
 const allyName=name(ally);
 if(incapacitated(r))throw Error('Cannot use a maneuver while incapacitated.');
 if(useRelentless&&(level(c)<15||f.fighterRelentlessUsed))throw Error('Relentless is available once per tracked turn from level 15.');
 if(!useRelentless&&(r.classResources?.['superiority-dice']??0)<1)throw Error('No Superiority Dice remaining.');
 let z={...f};
 if(f.fighterTurnTracking){
  const max=CM().passive(c,{items:[]}).attacks;
  if(f.fighterActionUsed&&!f.fighterAttackActionInProgress&&!(f.fighterSurgeActions>0))throw Error('No Attack action is available.');
  if((f.fighterAttackRolls||0)>=max){if(!(f.fighterSurgeActions>0))throw Error('No remaining attacks to replace.');z.fighterSurgeActions--;z.fighterAttackRolls=0;}
  z.fighterActionUsed=true;z.fighterAttackActionInProgress=true;z.fighterAttackRolls=(z.fighterAttackRolls||0)+1;
 }
 if(useRelentless)z.fighterRelentlessUsed=true;
 const side=dieSize(c,useRelentless?'relentless':'normal'),roll=hitConfirmed?dice(side,rollFn):null;
 const resources={...r,classState:z,classResources:useRelentless?r.classResources:CM().adjust(c,r.classResources,'superiority-dice',-1),lastClassEffect:{feature:"Commander's Strike",ally:allyName,allyReactionConfirmed:true,hitConfirmed:!!hitConfirmed,damageBonus:roll||0,dieSize:side,note:'Replaced one Fighter Attack-action attack. The willing ally makes and resolves its own attack/Reaction at the table.'}};
 return {...s,resources};
}
function telekineticThrust(s,{target='',saveTotal,choice='prone',triggerConfirmed=false}={}){
 const c=s.character,r=s.resources,e=r.lastClassEffect||{};
 if(!psi(c)||level(c)<7)throw Error('Telekinetic Thrust requires Psi Warrior level 7.');
 if(!triggerConfirmed||e.feature!=='Fighter attack-linked power'||!e.psionic||!e.target||e.target.toLowerCase()!==name(target).toLowerCase())throw Error('Confirm a recent Psionic Strike damage event against this target.');
 if(!['prone','move'].includes(choice)||!Number.isInteger(saveTotal))throw Error('Choose a valid thrust and confirmed Strength saving throw total.');
 const dc=8+pb(level(c))+mod(c.scores.int),failed=saveTotal<dc;
 return {...s,resources:{...r,lastClassEffect:{feature:'Telekinetic Thrust',target:e.target,choice,saveTotal,dc,failed,applied:failed,note:failed?(choice==='prone'?'Target may receive Prone.':'Target may be moved up to 10 ft horizontally.'):'Target resisted the thrust; enemy state remains DM controlled.'}}};
}
root.FolioFighter2024={battle,psi,eldritch,MANEUVERS:MNS,ATTACK_HIT_MANEUVERS,STUDENT_SKILLS,ARTISAN_TOOLS,studentOfWar,commandersStrike,telekineticThrust,validateAttackPower,applyAttackPower,precisionAttack,riposteAttack,previewFeint,finalizeManeuverAttack,castWizardSpell,dieSize,maneuverLimit,manageManeuvers,newTurn,startTurn,spendBonus,attackBudget,previewAttack,afterAttack,useManeuver,knowEnemy,psiAction,weaponBond,summonBond,warMagic,eldritchSpellSave};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioFighter2024;
})(typeof globalThis!=='undefined'?globalThis:window);
