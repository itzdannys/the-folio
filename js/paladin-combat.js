(function(root){'use strict';
// Original, offline-only 2024 Paladin event resolvers. These never silently
// change another creature's sheet: confirmations and saves come from the table.
const CM=()=>root.FolioClassMechanics;
const isPaladin=c=>c?.templateKind==='starter'&&(c?.build?.characterClass||c.className)==='Paladin';
const mod=x=>Math.floor((Number(x)-10)/2);
const pb=l=>2+Math.floor(((Number(l)||1)-1)/4);
const incapacitated=r=>(r?.hp??1)<=0||(r?.conditions||[]).some(x=>['Incapacitated','Unconscious','Paralyzed','Stunned','Petrified'].includes(x));
const light=w=>(w?.propertyList||[]).includes('Light')||/\bLight\b/i.test(String(w?.properties||''));
const label=t=>typeof t==='string'&&!!t.trim()&&t.trim().length<=80?t.trim():null;
const saveNumber=x=>Number.isInteger(x)&&x>=-100&&x<=200;
const auraRadius=c=>Number(c.level)>=18?30:10;
function attackBudget(c,r,item,mode,role='attack'){
 if(!isPaladin(c)||(!r?.classState?.paladinTurnTracking&&role!=='opportunity'))return null;
 if(incapacitated(r))throw Error('Cannot attack while Incapacitated or at 0 HP.');
 const f=r.classState||{},w=item.weapon||{},weaponId=item.id;
 const melee=w.kind==='Melee'&&mode!=='throw',hasLight=light(w);
 const max=Number(c.level)>=5?2:1;
 if(!['attack','light-bonus','nick','opportunity'].includes(role))throw Error('Choose an available weapon attack role.');
 let next={...f};
 if(role==='opportunity'){
  if(!melee)throw Error('An Opportunity Attack must use a melee attack in reach.');
  if(f.reactionUsed)throw Error('Your Reaction has already been used.');
  next.reactionUsed=true;
 }else if(role==='attack'){
  if(f.paladinActionUsed&&!f.paladinAttackActionInProgress)throw Error('Your Action was spent on another activity.');
  if((f.paladinAttackRolls||0)>=max)throw Error('All attacks in this Attack action have been used.');
  next.paladinActionUsed=true;next.paladinAttackActionInProgress=true;
  next.paladinAttackRolls=(f.paladinAttackRolls||0)+1;
  if(hasLight&&!f.paladinLightExtraUsed)next.paladinLightTriggerWeapon=weaponId;
 }else{
  if(!hasLight)throw Error('The Light extra attack requires a Light weapon.');
  if(f.paladinLightExtraUsed)throw Error('The Light extra attack has already been used this turn.');
  if(!f.paladinAttackActionInProgress||!f.paladinLightTriggerWeapon||f.paladinLightTriggerWeapon===weaponId)throw Error('Attack with a different Light weapon in the Attack action first.');
  if(role==='nick'){
   if(w.mastery!=='Nick'||!w.mastered)throw Error('Nick requires this Light weapon’s selected Nick mastery.');
  }else{
   if(f.paladinBonusActionUsed)throw Error('Your Bonus Action has already been used.');
   next.paladinBonusActionUsed=true;
  }
  next.paladinLightExtraUsed=true;next.paladinLightTriggerWeapon=null;
 }
 return {...r,classState:next};
}
function claimAttackAction(r){
 if(!r?.classState?.paladinTurnTracking)return r.classState||{};
 if(incapacitated(r))throw Error('Cannot take the Attack action while Incapacitated or at 0 HP.');
 const f=r.classState;
 if(f.paladinActionUsed&&!f.paladinAttackActionInProgress)throw Error('Your Action has already been used; requires the Attack action.');
 return {...f,paladinActionUsed:true,paladinAttackActionInProgress:true,paladinAttackRolls:f.paladinAttackRolls||0};
}
function eventDC(state){return root.PipCore.derived(state.character,state.inventory,state.resources).spellDC;}
function addEffect(effects,effect){const filtered=(effects||[]).filter(x=>!(x.target.toLowerCase()===effect.target.toLowerCase()&&x.source===effect.source));return [...filtered.slice(-29),effect];}
function requireTarget(state,{targetName,distanceFeet}={},range=60){
 if(!isPaladin(state.character))throw Error('Paladin class required.');
 if(incapacitated(state.resources))throw Error('Paladin aura is inactive while Incapacitated or at 0 HP.');
 const name=label(targetName);if(!name)throw Error('Provide a target name (1–80 characters).');
 if(!Number.isInteger(distanceFeet)||distanceFeet<0||distanceFeet>range)throw Error('Confirm the creature is within '+range+' feet.');
 return name;
}
function resolveEvent(state,{type,targetName,distanceFeet,saveTotal,rollA,rollB,saveModifier=0}={}){
 const c=state.character,r=state.resources,f=r.classState||{},range=auraRadius(c);
 let target,detail,effects=f.paladinExternalEffects||[],nextFlags={...f};
 if(type==='nature-initial'){
  if(!CM().ancients(c)||Number(c.level)<3)throw Error('Nature’s Wrath requires Oath of the Ancients.');
  target=requireTarget(state,{targetName,distanceFeet},15);
  if((f.natureWrathPending||0)<1)throw Error('Activate Nature’s Wrath before resolving target saves.');
  if(!saveNumber(saveTotal))throw Error('Enter the target’s Strength save total.');
  const failed=saveTotal<eventDC(state);
  if(failed)effects=addEffect(effects,{source:'Nature’s Wrath',target,condition:'Restrained',turnsRemaining:10});
  nextFlags.natureWrathPending=f.natureWrathPending-1;
  detail={feature:'Nature’s Wrath target save',target,saveTotal,dc:eventDC(state),failed,condition:failed?'Restrained':null,note:'A failed target is Restrained up to one minute; repeat Strength save at the end of each of its turns. Player/DM confirms turn timing.'};
 }else if(type==='nature-repeat'){
  target=label(targetName);const index=effects.findIndex(x=>x.source==='Nature’s Wrath'&&x.target.toLowerCase()===target?.toLowerCase());
  if(index<0)throw Error('No active Nature’s Wrath effect on that target.');
  if(!saveNumber(saveTotal))throw Error('Enter the repeat Strength save total.');
  const escaped=saveTotal>=eventDC(state),remaining=effects[index].turnsRemaining-1;
  effects=effects.filter((x,i)=>i!==index);
  if(!escaped&&remaining>0)effects=addEffect(effects,{source:'Nature’s Wrath',target,condition:'Restrained',turnsRemaining:remaining});
  detail={feature:'Nature’s Wrath turn-end save',target,saveTotal,dc:eventDC(state),escaped,expired:remaining<=0,note:'A success or one-minute expiration ends Restrained. Do not apply directly to another creature’s sheet.'};
 }else if(type==='angel-start'){
  if(!CM().vengeance(c)||Number(c.level)<20||!f.avengingAngelActive)throw Error('Avenging Angel must be active at Vengeance Paladin level 20.');
  target=requireTarget(state,{targetName,distanceFeet},range);
  if(!saveNumber(saveTotal))throw Error('Enter the enemy’s Wisdom saving throw total.');
  const failed=saveTotal<eventDC(state);
  if(failed)effects=addEffect(effects,{source:'Avenging Angel',target,condition:'Frightened',turnsRemaining:10});
  detail={feature:'Avenging Angel enemy start',target,saveTotal,dc:eventDC(state),failed,condition:failed?'Frightened':null,note:'Frightened lasts up to one minute or until any damage; attacks against that Frightened creature have Advantage. Track time with the DM.'};
 }else if(type==='nimbus-start'){
  if(!CM().devotion(c)||Number(c.level)<20||!f.holyNimbusActive)throw Error('Holy Nimbus must be active at Devotion Paladin level 20.');
  target=requireTarget(state,{targetName,distanceFeet},range);
  const damage=Math.max(0,mod(c.scores.cha)+pb(c.level));
  detail={feature:'Holy Nimbus enemy start',target,damage,damageType:'Radiant',note:'Enemy started turn in the active aura; apply damage on that creature’s sheet. Sunlight fills the aura.'};
 }else if(type==='elder-save'){
  if(!CM().ancients(c)||Number(c.level)<20||!f.elderChampionActive)throw Error('Elder Champion must be active at Ancients Paladin level 20.');
  target=requireTarget(state,{targetName,distanceFeet},range);
  if(![rollA,rollB].every(x=>Number.isInteger(x)&&x>=1&&x<=20)||!Number.isInteger(saveModifier)||Math.abs(saveModifier)>100)throw Error('Enter the enemy’s two d20 rolls and its save modifier.');
  const chosen=Math.min(rollA,rollB),total=chosen+saveModifier;
  detail={feature:'Elder Champion enemy save',target,rolls:[rollA,rollB],chosen,modifier:saveModifier,total,dc:eventDC(state),failed:total<eventDC(state),note:'Confirmed enemy is inside aura and is saving against this Paladin’s spell or Channel Divinity; Disadvantage applied. Other enemy modifiers are DM supplied.'};
 }else throw Error('Choose a supported Paladin external event.');
 return {...state,resources:{...r,classState:{...nextFlags,paladinExternalEffects:effects},lastClassEffect:detail}};
}
function clearEffect(state,{targetName,source,reason='manual'}={}){
 if(!isPaladin(state.character))throw Error('Paladin class required.');
 const target=label(targetName),allowed=['Nature’s Wrath','Avenging Angel','Abjure Foes'];
 if(!target||!allowed.includes(source))throw Error('Choose a recorded target and effect.');
 if(!['manual','damaged','expired'].includes(reason))throw Error('Choose a valid reason to end the condition.');
 const r=state.resources,entries=r.classState?.paladinExternalEffects||[];
 const found=entries.find(x=>x.target.toLowerCase()===target.toLowerCase()&&x.source===source);
 if(!found)throw Error('No matching external effect to clear.');
 if(reason==='damaged'&&source==='Nature’s Wrath')throw Error('Damage does not automatically end Nature’s Wrath; use manual/expired or the repeat saving throw.');
 return {...state,resources:{...r,classState:{...r.classState,paladinExternalEffects:entries.filter(x=>x!==found)},lastClassEffect:{feature:'External effect ended',target,source,reason,note:'Record only. Enemy HP and conditions remain controlled by the DM.'}}};
}

// 2024 Fighting Style Reactions resolve the Paladin's resource expenditure
// and a recorded result without mutating an external ally's HP or AC.
function fightingStyleReaction(state,{kind,allyName,triggerConfirmed=false,incomingDamage=null}={},rollDie=()=>1){
 const c=state.character,r=state.resources,f=r.classState||{};
 if(!isPaladin(c)||Number(c.level)<2)throw Error('This requires a Paladin with Fighting Style.');
 if(incapacitated(r)||f.reactionUsed)throw Error('A ready Reaction is required.');
 if(!['interception','protection'].includes(kind))throw Error('Choose Interception or Protection.');
 const chosen='Fighting Style: '+(kind==='interception'?'Interception':'Protection');
 if(!(c.build?.grantedFeatNames||[]).includes(chosen))throw Error(chosen+' must be selected in the builder.');
 const ally=label(allyName);if(!ally||!triggerConfirmed)throw Error('Confirm the visible attacker, qualifying attack and nearby ally.');
 const items=state.inventory?.items||[];
 const shield=items.some(x=>x.equipped&&x.quantity>0&&x.category==='shield');
 const weapon=items.some(x=>x.equipped&&x.quantity>0&&x.category==='weapon');
 if(kind==='interception'&&!shield&&!weapon)throw Error('Interception requires a held weapon or Shield.');
 if(kind==='protection'&&!shield)throw Error('Protection requires a held Shield.');
 let detail;
 if(kind==='interception'){
  if(!Number.isInteger(incomingDamage)||incomingDamage<0||incomingDamage>100000)throw Error('Enter the confirmed damage dealt by the triggering hit.');
  const die=rollDie(10);if(!Number.isInteger(die)||die<1||die>10)throw Error('Invalid Interception d10.');
  const reduction=die+pb(c.level);
  detail={feature:'Interception',ally,die,proficiency:pb(c.level),reduction,damageBefore:incomingDamage,damageAfter:Math.max(0,incomingDamage-reduction),appliedToAllySheet:false,note:'The Reaction reduces this one hit. Tell the ally the adjusted damage; their sheet is not changed.'};
 }else{
  detail={feature:'Protection',ally,disadvantage:true,appliedToAllySheet:false,note:'This attack and later attacks against the same ally have Disadvantage until your next turn while you remain within 5 feet. Confirm positioning at the table.'};
 }
 return {...state,resources:{...r,classState:{...f,reactionUsed:true,...(kind==='protection'?{paladinProtectionTarget:ally}:{})},lastClassEffect:detail}};
}
function unarmedFightingStartDamage(state,{targetName,grappleConfirmed=false}={},rollDie=()=>1){
 const c=state.character,r=state.resources,f=r.classState||{},target=label(targetName);
 if(!isPaladin(c)||Number(c.level)<2||!(c.build?.grantedFeatNames||[]).includes('Fighting Style: Unarmed Fighting'))throw Error('Unarmed Fighting must be chosen at Paladin level 2+.');
 if(!target||!grappleConfirmed)throw Error('Confirm a creature Grappled by you at the start of this turn.');
 if(!f.paladinTurnTracking||f.paladinUnarmedGrappleUsed||incapacitated(r))throw Error('Start a tracked turn and use this bonus only once at its start.');
 if(f.paladinActionUsed||f.paladinBonusActionUsed||f.paladinAttackRolls)throw Error('Resolve the start-of-turn Grapple damage before taking other actions.');
 const die=rollDie(4);if(!Number.isInteger(die)||die<1||die>4)throw Error('Invalid grapple damage d4.');
 return {...state,resources:{...r,classState:{...f,paladinUnarmedGrappleUsed:true},lastClassEffect:{feature:'Unarmed Fighting grapple damage',target,damage:die,damageType:'Bludgeoning',appliedToEnemySheet:false,note:'This is a once-per-turn start-of-turn benefit; DM records damage on the grappled creature.'}}};
}

// Local companion record, based on 2024 Find Steed's published numerical
// scaling. This is NOT an autonomous combatant or a verbatim stat block.
function summonSteed(state,{creatureType='Celestial',form='Horse',spellLevel=2}={}){
 const c=state.character,r=state.resources;
 if(!isPaladin(c)||Number(c.level)<5)throw Error('Faithful Steed requires Paladin level 5.');
 if(!['Celestial','Fey','Fiend'].includes(creatureType))throw Error('Choose a valid otherworldly creature type.');
 const shape=label(form);if(!shape)throw Error('Name the steed’s animal form.');
 if(!Number.isInteger(spellLevel)||spellLevel<2||spellLevel>5)throw Error('A Paladin can cast Find Steed at spell level 2–5.');
 const ac=10+spellLevel,maxHp=5+10*spellLevel;
 const steed={name:'Otherworldly Steed',form:shape,creatureType,spellLevel,ac,hp:maxHp,maxHp,speedFeet:60,flyFeet:spellLevel>=4?60:0,source:'2024 Find Steed',externalTurnsManual:true};
 return {...state,resources:{...r,classState:{...r.classState,paladinSteed:steed},lastClassEffect:{feature:'Find Steed',creatureType,form:shape,spellLevel,ac,maxHp,note:'One previous steed is replaced. Otherworldly actions, death, positioning and rider interactions remain table-confirmed.'}}};
}
function steedHP(state,delta){
 if(!isPaladin(state.character))throw Error('Paladin steed required.');
 const r=state.resources,steed=r.classState?.paladinSteed;
 if(!steed)throw Error('There is no summoned steed recorded.');
 if(!Number.isInteger(delta)||Math.abs(delta)>100000||delta===0)throw Error('Enter nonzero whole-number HP change.');
 const hp=Math.max(0,Math.min(steed.maxHp,steed.hp+delta));
 return {...state,resources:{...r,classState:{...r.classState,paladinSteed:{...steed,hp}},lastClassEffect:{feature:'Steed HP',previous:steed.hp,newHp:hp,change:delta,note:'Confirmed damage or healing on the Paladin’s own steed record.'}}};
}
function dismissSteed(state){
 if(!isPaladin(state.character)||!state.resources.classState?.paladinSteed)throw Error('There is no summoned steed recorded.');
 return {...state,resources:{...state.resources,classState:{...state.resources.classState,paladinSteed:null},lastClassEffect:{feature:'Steed dismissed',note:'Local steed record cleared; no spell slot refunded.'}}};
}
root.FolioPaladinCombat={attackBudget,claimAttackAction,resolveEvent,clearEffect,fightingStyleReaction,unarmedFightingStartDamage,summonSteed,steedHP,dismissSteed};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioPaladinCombat;
})(typeof window!=='undefined'?window:globalThis);
