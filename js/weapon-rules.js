(function(root){'use strict';
const C=root.PipCore,I=root.PipInventory,D=root.FolioDice,CAT=root.FolioWeaponCatalog;const clone=x=>JSON.parse(JSON.stringify(x));
const properties=['Ammunition','Finesse','Heavy','Light','Loading','Reach','Thrown','Two-Handed','Versatile'];
const classOf=c=>root.FolioSpellRules?.className(c)||String(c?.className||'').replace(/\s+\d+$/,'');
const hasStyle=(c,name)=>c?.templateKind==='starter'&&(c.build?.grantedFeatNames||[]).includes('Fighting Style: '+name);

const mod=n=>Math.floor((Number(n||10)-10)/2);
const hands=w=>w.properties?.includes('Two-Handed')&&w.name!=='Lance'?2:Number(w.grip||1);
const masteryLimit=c=>{const cls=classOf(c),lvl=Number(c.level)||1;if(c.weaponLimitOverride)return Number(c.weaponMasteryLimit)||0;if(cls==='Fighter')return 3+(lvl>=4?1:0)+(lvl>=10?1:0)+(lvl>=16?1:0);if(cls==='Barbarian')return 2+(lvl>=4?1:0)+(lvl>=10?1:0);return ['Rogue','Paladin','Ranger'].includes(cls)?2:0;};
function proficient(c,w){if(w.proficiency==='yes')return true;if(w.proficiency==='no')return false;if((c.profWeapons||[]).some(x=>x===w.name||x===w.category))return true;const cls=classOf(c);if(w.category==='Simple')return true;if(['Barbarian','Fighter','Paladin','Ranger'].includes(cls)||cls==='Cleric'&&c.build?.clericOrder==='Protector'||cls==='Bard'&&(c.build?.subclass||c.subclass)==='College of Valor'&&c.level>=3||cls==='Druid'&&c.build?.druidOrder==='Warden')return true;if(cls==='Rogue')return (w.properties||[]).some(x=>['Finesse','Light'].includes(x));if(cls==='Monk')return (w.properties||[]).includes('Light');return false;}
function abilityFor(c,w){if(classOf(c)==='Monk'&&c.templateKind==='starter'&&w.kind==='Melee'&&(w.category==='Simple'||(w.properties||[]).includes('Light')))return mod(c.scores.dex)>=mod(c.scores.str)?'dex':'str';if(w.ability&&w.ability!=='auto')return w.ability;if((w.properties||[]).includes('Finesse'))return mod(c.scores.dex)>mod(c.scores.str)?'dex':'str';return w.kind==='Ranged'?'dex':'str';}
function stats(c,item,mode='normal',bonuses={}){const w=item.weapon||{},ability=abilityFor(c,w),ab=mod(c.scores[ability]),pb=proficient(c,w)?C.proficiency(c.level):0,magic=Number(w.magicBonus||0);return {ability,abilityMod:ab,proficient:pb>0,proficiency:pb,attackBonus:ab+pb+magic+Number(w.attackAdjustment||0)+Number(bonuses.attack||0)+(w.kind==='Ranged'&&c.templateKind==='starter'&&(c.build?.grantedFeatNames||[]).includes('Fighting Style: Archery')?2:0),damageBonus:ab+magic+Number(w.damageAdjustment||0)+Number(bonuses.damage||0),damageDice:mode==='two-handed'&&w.versatileDice?w.versatileDice:w.damage,masteryDC:8+ab+C.proficiency(c.level)};}
function summary(c,inventory){const weapons=inventory.items.filter(x=>x.category==='weapon'&&x.equipped&&x.quantity>0),shield=inventory.items.some(x=>x.category==='shield'&&x.equipped&&x.quantity>0);return {hands:weapons.reduce((n,x)=>n+hands(x.weapon||{}),0)+(shield?1:0),handLimit:c.weaponLimitOverride?Number(c.weaponHandLimit)||2:2,mastered:new Set(inventory.items.filter(x=>x.category==='weapon'&&x.weapon?.mastered).map(x=>x.weapon.catalogKey||x.name.toLowerCase())).size,masteryLimit:masteryLimit(c)};}
function modes(item){const w=item.weapon||{},out=[];if(w.kind==='Ranged')out.push({key:'ranged',label:'Ranged'});else out.push({key:'melee',label:w.versatileDice?'One-handed':'Melee'});if(w.versatileDice)out.push({key:'two-handed',label:'Two-handed'});if((w.properties||[]).includes('Thrown'))out.push({key:'throw',label:'Throw'});return out;}
function catalogItem(template,id){const w=template;const ability=w.properties.includes('Finesse')?'auto':w.kind==='Ranged'?'dex':'str';const ammoCount=0;return I.gear(id,w.name,'weapon',1,`${w.category} ${w.kind} weapon · ${w.weight} · ${w.cost}`,{equipped:false,cost:w.cost,weight:w.weight,source:'PHB 24',weapon:{catalogKey:w.key,category:w.category,kind:w.kind,damage:w.damageDice,type:w.damageType,range:w.range?`${w.range} ft`:'5 ft',mastery:w.mastery||'—',ability,proficiency:'auto',magicBonus:0,attackAdjustment:0,damageAdjustment:0,properties:w.properties.join(', '),propertyList:[...w.properties],versatileDice:w.versatileDice||'',ammunitionType:w.ammunition||'',ammunitionCount:ammoCount,weight:w.weight,cost:w.cost,grip:w.properties.includes('Two-Handed')?2:1,mastered:false,limitedUses:false,usesMax:1,usesUsed:0}});}
function validDamage(expr){return /^(?:[1-9]|1[0-9]|20)d(?:[2-9]|[1-9][0-9]|100)$|^[1-9][0-9]?$/.test(String(expr||''));}
function ammoItem(inv,type){const q=String(type||'').toLowerCase();return inv.items.find(x=>x.category==='ammunition'&&x.quantity>0&&String(x.name).toLowerCase().includes(q))||null;}
function attackError(c,inv,item,mode){const w=item?.weapon||{};if(!item||item.category!=='weapon')return 'Weapon not found.';if(!item.equipped)return 'Equip this weapon before attacking.';if(item.quantity<1)return 'No copies of this weapon remain.';if(!modes(item).some(x=>x.key===mode))return 'That attack mode is unavailable.';const damage=mode==='two-handed'&&w.versatileDice?w.versatileDice:w.damage;if(!validDamage(damage))return 'Enter valid weapon damage before attacking.';const current=summary(c,inv),needed=current.hands-hands(w)+(mode==='two-handed'?2:mode==='throw'?1:hands(w));if(needed>current.handLimit)return `This attack needs ${needed} hands; only ${current.handLimit} are available.`;if(w.propertyList?.includes('Ammunition')||(w.properties||'').includes('Ammunition')){if(mode==='ranged'&&!ammoItem(inv,w.ammunitionType))return `No ${w.ammunitionType||'ammunition'} ammunition remaining. Add ammunition to Inventory.`;if(mode==='ranged'&&hands(w)===1&&needed+1>current.handLimit)return 'A free hand is needed to load this weapon.';}if(w.limitedUses&&w.usesUsed>=w.usesMax)return 'No weapon uses remaining.';return '';}
function masteryReminder(w,stats,hit){if(!w.mastered||!w.mastery||w.mastery==='—')return '';if(hit==='unknown')return `${w.mastery}: resolve the hit or miss before applying this mastery.`;const d=CAT.masteryDescriptions[w.mastery]||'';if(w.mastery==='Graze'&&!hit)return `Graze: on a miss, you may deal ${Math.max(0,stats.abilityMod)} ${w.type} damage.`;if(w.mastery==='Topple')return `Topple: target may make a CON save (DC ${stats.masteryDC}) or fall Prone.`;return `${w.mastery}: ${d}`;}
function attack(c,inv,itemId,mode='melee',rollMode='normal',targetAC=null,rollFn=D.rollDie,resources=null,sneakOptions=null,markOptions=null,smiteOptions=null,barbarianOptions=null,hunterOptions=null,oathOptions=null,fighterOptions=null,rogueOptions=null,monkOptions=null){const item=inv.items.find(x=>x.id===itemId);const error=attackError(c,inv,item,mode);if(error)throw Error(error);if(!['normal','advantage','disadvantage'].includes(rollMode))throw Error('Invalid roll mode.');const w=item.weapon||{},st=stats(c,item,mode,I.bonusSummary(inv)),sacredActive=!!(root.FolioClassMechanics?.devotion(c)&&resources?.classState?.sacredWeaponId===itemId&&item.equipped&&w.kind==='Melee'),sacredBonus=sacredActive?Math.max(1,Math.floor((Number(c.scores.cha)-10)/2)):0;st.attackBonus+=sacredBonus;const rage=!!resources?.classState?.raging&&classOf(c)==='Barbarian'&&abilityFor(c,w)==='str';if(rage)st.damageBonus+=root.FolioClassMechanics?.passive(c,inv).rageBonus||0;const heavy=(w.propertyList||[]).includes('Heavy')&&Number(c.scores[w.kind==='Ranged'?'dex':'str'])<13;const marked=!!markOptions?.targetIsMarked;const ranger=classOf(c)==='Ranger',vengeanceMarked=classOf(c)==='Paladin'&&root.FolioClassMechanics?.vengeance(c);if(marked&&(!(ranger||vengeanceMarked)||!root.FolioClassMechanics?.marked(resources||{})))throw Error('An active Ranger or Vengeance Paladin Hunter’s Mark is required for marked-target damage.');if(marked&&!(Number.isInteger(targetAC)&&targetAC>0))throw Error('Enter target AC to confirm a Hunter’s Mark hit.');const paladin=classOf(c)==='Paladin',smiteCost=smiteOptions?.cost||'none';
 const soulReaction=!!oathOptions?.soulVengeance;
 const gloriousCounter=!!oathOptions?.gloryCounterattack;
 const relentlessOpportunity=!!oathOptions?.relentlessOpportunity;
 const legendUnerring=!!oathOptions?.livingLegendUnerring;
 if([soulReaction,gloriousCounter,relentlessOpportunity].filter(Boolean).length>1)throw Error('Only one special Reaction attack can be used at a time.');
 if(gloriousCounter||relentlessOpportunity||legendUnerring){
  if(!Number.isInteger(targetAC)||targetAC<1)throw Error('Enter target AC to resolve this Paladin feature.');
  if((resources?.conditions||[]).some(x=>['Incapacitated','Paralyzed','Petrified','Stunned','Unconscious'].includes(x)))throw Error('You cannot use this feature while Incapacitated.');
 }
 if(gloriousCounter){
  if(!paladin||Number(c.level)<15||!root.FolioClassMechanics?.glory(c))throw Error('Glorious Defense counterattack requires Glory Paladin level 15.');
  if(!resources?.classState?.gloryCounterattackPending||!resources?.classState?.reactionUsed)throw Error('A successful Glorious Defense Reaction must be awaiting its counterattack.');
  if(!oathOptions.gloryAttackerConfirmed)throw Error('Confirm you are attacking the creature whose hit Glorious Defense prevented.');
  if(!oathOptions.gloryInRange)throw Error('Confirm the attacker is in this weapon attack’s range.');
  if(smiteCost!=='none')throw Error('Divine Smite requires a Bonus Action and cannot be cast with a Glorious Defense counterattack.');
 }
 if(relentlessOpportunity){
  if(!paladin||Number(c.level)<7||!root.FolioClassMechanics?.vengeance(c))throw Error('Relentless Avenger requires Vengeance Paladin level 7.');
  if(!oathOptions.opportunityConfirmed||!oathOptions.opportunityInReach)throw Error('Confirm the Opportunity Attack trigger and melee reach.');
  if(w.kind!=='Melee'||mode==='throw'||mode==='ranged')throw Error('Relentless Avenger requires a melee weapon Opportunity Attack.');
  if(resources?.classState?.reactionUsed)throw Error('Your Reaction has already been used.');
  if(smiteCost!=='none')throw Error('Divine Smite requires a Bonus Action and cannot be cast with an off-turn Opportunity Attack.');
 }
 if(legendUnerring){
  if(!paladin||Number(c.level)<20||!root.FolioClassMechanics?.glory(c)||!resources?.classState?.livingLegendActive)throw Error('Unerring Strike requires active Living Legend on a level 20 Glory Paladin.');
  if(resources?.classState?.gloryLegendHitUsed)throw Error('Unerring Strike has already been used this turn.');
  if(!oathOptions.ownTurnConfirmed||soulReaction||gloriousCounter||relentlessOpportunity)throw Error('Unerring Strike only works on a weapon attack during your own turn.');
 }
 if(soulReaction){
  if(!paladin||Number(c.level)<15||!root.FolioClassMechanics?.vengeance(c))throw Error('Soul of Vengeance requires Oath of Vengeance Paladin level 15.');
  if(!oathOptions.vowedTarget||!resources?.classState?.vowTarget)throw Error('Soul of Vengeance requires the current Vow of Enmity target.');
  if(!oathOptions.triggeringAttackConfirmed)throw Error('Confirm the vowed creature just made an attack roll.');
  if(!oathOptions.withinReach)throw Error('Confirm the vowed creature is in melee weapon range.');
  if(w.kind!=='Melee'||mode==='throw'||mode==='ranged')throw Error('Soul of Vengeance requires a melee weapon attack in reach.');
  if(!Number.isInteger(targetAC)||targetAC<1)throw Error('Enter target AC to resolve this Reaction attack.');
  if(resources?.classState?.reactionUsed)throw Error('Your Reaction has already been used.');
  if((resources?.conditions||[]).some(x=>['Incapacitated','Paralyzed','Petrified','Stunned','Unconscious'].includes(x)))throw Error('You cannot react while Incapacitated.');
  if(smiteCost!=='none')throw Error('Divine Smite uses a Bonus Action and cannot be cast with this off-turn Reaction.');
 }
 // A confirmed Attack action / Light / Nick / ordinary Opportunity Attack consumes
 // its own budget; specialized oath Reactions are handled separately below.
 const attackRole=oathOptions?.attackRole||'attack';
 if(attackRole==='opportunity'&&!oathOptions?.opportunityConfirmed)throw Error('Confirm the ordinary Opportunity Attack trigger.');
 if([soulReaction,gloriousCounter,relentlessOpportunity].some(Boolean)&&attackRole!=='attack')throw Error('Special oath Reaction attacks choose the standard attack role.');
 const budget=paladin&&!soulReaction&&!gloriousCounter&&!relentlessOpportunity&&root.FolioPaladinCombat?root.FolioPaladinCombat.attackBudget(c,resources||{},item,mode,attackRole):null;
 if(paladin&&attackRole!=='attack'&&smiteCost!=='none')throw Error('Divine Smite must follow a hit on your turn using a Bonus Action.');
 if(paladin&&['nick','light-bonus'].includes(attackRole)&&!(c.build?.grantedFeatNames||[]).some(n=>/Fighting Style:\s*Two.Weapon Fighting/i.test(n)))st.damageBonus-=Math.max(0,st.abilityMod);
 // Fighting Style damage applies only to the qualifying weapon damage, never
 // to extra Smite, Radiant Strikes, or other spell dice.
 const props=w.propertyList||String(w.properties||'').split(/\s*,\s*/);
 const heldOtherWeapon=inv.items.some(x=>x.id!==itemId&&x.category==='weapon'&&x.equipped&&x.quantity>0);
 const dueling=hasStyle(c,'Dueling')&&w.kind==='Melee'&&mode==='melee'&&!props.includes('Two-Handed')&&!heldOtherWeapon;
 const thrownStyle=hasStyle(c,'Thrown Weapon Fighting')&&mode==='throw'&&props.includes('Thrown');
 const greatWeaponStyle=hasStyle(c,'Great Weapon Fighting')&&w.kind==='Melee'&&(props.includes('Two-Handed')||props.includes('Versatile'))&&(mode==='two-handed'||props.includes('Two-Handed'));
 if(dueling||thrownStyle)st.damageBonus+=2;

 if(smiteCost!=='none'&&(!paladin||Number(c.level)<2))throw Error('Divine Smite requires Paladin level 2.');
 if(smiteCost!=='none'&&w.kind!=='Melee')throw Error('Divine Smite requires a weapon classified as Melee (including thrown Melee weapons).');
 if(smiteCost!=='none'&&!(Number.isInteger(targetAC)&&targetAC>0))throw Error('Enter target AC to confirm a hit before selecting Divine Smite.');
 const isBarbarian=classOf(c)==='Barbarian',barbarianFlags=resources?.classState||{},recklessChosen=!!barbarianOptions?.reckless;
 if(barbarianOptions?.retaliation&&!isBarbarian)throw Error('Only Berserker Barbarians can use Retaliation.');
 if(barbarianOptions?.retaliation&&!(w.kind==='Melee'&&mode!=='throw'))throw Error('Retaliation requires a Melee weapon attack (not a thrown attack).');
 if(recklessChosen&&!isBarbarian)throw Error('Only Barbarians may use Reckless Attack.');
 if(recklessChosen&&Number(c.level)<2)throw Error('Reckless Attack requires Barbarian level 2.');
 if(recklessChosen&&!barbarianFlags.recklessThisTurn&&barbarianFlags.barbarianAttackRolledThisTurn)throw Error('Reckless Attack must be chosen on your first attack roll of the turn.');
 const strengthAttack=isBarbarian&&st.ability==='str';
 const brutalEffects=(barbarianOptions?.brutalEffects||[]).filter(x=>x&&x!=='none');
 if(brutalEffects.length){
  if(!isBarbarian||Number(c.level)<9)throw Error('Brutal Strike requires Barbarian level 9.');
  if(!strengthAttack)throw Error('Brutal Strike requires a Strength-based attack.');
  if(!recklessChosen&&!barbarianFlags.recklessThisTurn)throw Error('Brutal Strike requires Reckless Attack.');
  if(rollMode==='disadvantage'||heavy)throw Error('Brutal Strike cannot be used on an attack with Disadvantage.');
 }
 const B=isBarbarian?root.FolioBarbarian2024:null;
 const barbRole=barbarianOptions?.attackRole||'attack';
 const barbarianBudget=B&&!barbarianOptions?.retaliation?B.attackBudget(c,resources||{},item,barbRole,mode,!!barbarianOptions?.opportunityConfirmed):null;
 const rogue=classOf(c)==='Rogue'&&root.FolioRogue2024?root.FolioRogue2024:null;
 const rogueRole=rogueOptions?.attackRole||'attack';
 if(rogueOptions?.firstRound&&rogue&&resources?.classState?.rogueTurnTracking&&resources.classState.rogueRound!==1)throw Error('Assassinate applies only during round one.');
 if(rogueOptions?.poisonFailed&&!sneakOptions?.strikes?.includes('poison'))throw Error('Envenom Weapons requires Poison Cunning Strike.');
 if(rogueOptions?.deathSaveTotal!==null&&rogueOptions?.deathSaveTotal!==undefined&&!rogueOptions?.firstRound)throw Error('Death Strike requires first-round Sneak Attack.');
 if(rogue&&['light-bonus','nick'].includes(rogueRole)&&!(w.propertyList||[]).includes('Light'))throw Error('Light extra attacks require a Light weapon.');
 const rogueBudget=rogue?rogue.attackBudget(c,resources||{},{role:rogueRole,opportunityConfirmed:!!rogueOptions?.opportunityConfirmed,item,mode}):null;
 const fighter=classOf(c)==='Fighter'&&root.FolioFighter2024?root.FolioFighter2024:null;
 const fighterTarget=fighterOptions?.targetName?String(fighterOptions.targetName).trim():'';
 if(fighter&&fighterOptions?.masteryOverride&&(!w.mastered||Number(c.level)<9||!['Push','Sap','Slow'].includes(fighterOptions.masteryOverride)))throw Error('Tactical Master needs a mastered weapon and Fighter level 9.');
 const fighterRole=fighterOptions?.attackRole||'attack';
 if(fighterRole==='opportunity'&&!fighterOptions?.opportunityConfirmed)throw Error('Confirm the Fighter Opportunity Attack trigger and reach.');
 if(fighterRole==='psi-bonus'&&(!fighter.psi(c)||Number(c.level)<18||resources?.concentration!=='Telekinesis'||!resources?.classState?.psiTelekinesisActive))throw Error('Telekinetic Master bonus attack requires Telekinesis concentration.');
 if(fighterRole==='riposte'){
  if(!fighter.battle(c)||!(resources?.classState?.fighterKnownManeuvers||[]).includes('Riposte'))throw Error('Learn Riposte before using its Reaction attack.');
  if(!fighterOptions?.riposteConfirmed)throw Error('Confirm the enemy missed you with a melee attack and is within reach.');
  if(w.kind!=='Melee'||mode==='throw'||mode==='ranged')throw Error('Riposte requires a melee counterattack.');
  if(!Number.isInteger(targetAC)||targetAC<1)throw Error('Riposte requires target AC.');
  if(resources?.classState?.reactionUsed)throw Error('Reaction already used.');
  if(fighterOptions?.maneuver||fighterOptions?.precision||fighter.previewFeint(c,resources||{},fighterTarget))throw Error('Riposte cannot stack another maneuver on the same attack.');
 }
 if(fighterOptions?.precision&&fighterOptions?.maneuver)throw Error('Only one Battle Master maneuver can apply to an attack.');
 if(fighterOptions?.precision&&(!fighter.battle(c)||!(resources?.classState?.fighterKnownManeuvers||[]).includes('Precision Attack')))throw Error('Precision Attack must be learned.');
 if(fighterOptions?.precision&&(!Number.isInteger(targetAC)||targetAC<1))throw Error('Precision Attack requires target AC.');
 if(fighterOptions?.precision&&!fighterOptions?.targetName)throw Error('Precision Attack needs a named target.');
 if(fighterOptions?.precision&&!fighterOptions?.useRelentless&&(resources?.classResources?.['superiority-dice']??0)<1)throw Error('No Superiority Dice remaining.');
 if(fighterOptions?.precision&&fighterOptions?.useRelentless&&(Number(c.level)<15||resources?.classState?.fighterRelentlessUsed))throw Error('Relentless is available once per turn from level 15.');
 if(fighterOptions?.maneuver&&fighter.previewFeint(c,resources||{},fighterTarget))throw Error('Feinting Attack cannot stack with a second maneuver on the same attack.');
 const fighterPowerOptions=fighter?{...fighterOptions,useRelentless:fighterRole==='riposte'||fighterOptions?.precision?false:!!fighterOptions?.useRelentless,targetAC,attackRole:fighterRole,weaponDamageType:w.type}:null;
 if(fighter)fighter.validateAttackPower(c,resources||{},fighterPowerOptions);
 const fighterBudget=fighter?fighter.attackBudget(c,resources||{},item,mode,fighterRole):null;
 const monk=root.FolioMonk2024?.isMonk(c)?root.FolioMonk2024:null;
 const ranger2024=root.FolioRanger2024?.isRanger(c)?root.FolioRanger2024:null;
 const rangerBudget=ranger2024&&resources?.classState?.rangerTurnTracking?ranger2024.attackBudget(c,resources,hunterOptions?.attackRole||'attack',{light:(w.propertyList||[]).includes('Light'),nick:(w.mastery||'')==='Nick'&&!!w.mastered,confirmed:!!hunterOptions?.confirmed,target:String(hunterOptions?.targetName||'').trim(),weaponId:itemId}):null;
 const monkBudget=monk?{...resources,classState:monk.attackBudget({character:c,resources:resources||{},inventory:inv},'attack')}:null;
 const studiedAdv=fighter&&fighter.previewAttack(c,resources||{},fighterTarget);
 const feintAdv=fighter&&fighter.previewFeint(c,resources||{},fighterTarget);
 const recklessAdv=strengthAttack&&(recklessChosen||!!barbarianFlags.recklessThisTurn);
 const oathVow=paladin&&root.FolioClassMechanics?.vengeance(c)&&!!resources?.classState?.vowTarget&&!!oathOptions?.vowedTarget;if(oathOptions?.vowedTarget&&!oathVow)throw Error('Vow Advantage requires an active Oath of Vengeance target.');
 const rogueSteady=rogue&&!!resources?.classState?.rogueSteadyAim;const rogueAmbush=rogue?.assassin(c)&&!!rogueOptions?.firstRound&&!!rogueOptions?.targetNotActed;const precise=ranger&&marked&&c.level>=17;const hasAdv=!!(monk&&resources?.classState?.monkNextAttackAdvantage)||rogueSteady||rogueAmbush||rollMode==='advantage'||precise||recklessAdv||oathVow||studiedAdv||feintAdv,hasDis=rollMode==='disadvantage'||heavy,effective=hasAdv&&hasDis?'normal':hasAdv?'advantage':hasDis?'disadvantage':'normal';const strikeMode=brutalEffects.length?'normal':effective;const rolls=strikeMode==='normal'?[rollFn(20)]:[rollFn(20),rollFn(20)];let natural=strikeMode==='advantage'?Math.max(...rolls):strikeMode==='disadvantage'?Math.min(...rolls):rolls[0];const threshold=root.FolioClassMechanics?.championCriticalThreshold(c)||20;let total=natural+st.attackBonus,critical=natural>=threshold,miss=natural===1,hasAC=Number.isInteger(targetAC)&&targetAC>0;let hit=critical?true:!miss&&(hasAC?total>=targetAC:null);
 let rogueStroke=null;if(rogueOptions?.strokeLuck){if(!rogue)throw Error('Stroke of Luck requires Rogue class.');if(hit!==false)throw Error('Stroke of Luck requires a confirmed missed attack.');rogueStroke=rogue.strokeOnAttack(c,rogueBudget||resources||{},{hit:false,confirmed:true});hit=true;critical=true;miss=false;natural=20;total=20+st.attackBonus;} const unerringApplied=legendUnerring&&hit===false;if(unerringApplied)hit=true;
 const fighterPrecision=fighter&&fighterOptions?.precision&&hit===false&&natural!==1?fighter.precisionAttack(c,fighterBudget||resources||{},{total,natural,targetAC,useRelentless:!!fighterOptions?.useRelentless},rollFn):null;
 if(fighterPrecision?.applied)hit=fighterPrecision.hit;
 const monkWeapon=monk&&monk.martialEligible({character:c,inventory:inv})&&w.kind==='Melee'&&(w.category==='Simple'||(w.properties||[]).includes('Light'))&&mode!=='throw';
 const monkDie=monkWeapon?monk.martialDie(c):0;
 const expr=monkDie&&/^1d\d+$/.test(String(st.damageDice))&&Number(String(st.damageDice).split('d')[1])<monkDie?'1d'+monkDie:st.damageDice;const match=String(expr).match(/^([1-9]\d*)d([2-9]|1[0-9]|20|100)$/);let damageRolls=[],damage=0;if((!miss||unerringApplied)&&hit!==false){if(match){const count=Number(match[1])*(critical?2:1),sides=Number(match[2]);damageRolls=Array.from({length:count},()=>rollFn(sides));if(greatWeaponStyle&&damageRolls.some(x=>!Number.isInteger(x)||x<1||x>sides))throw Error('Invalid weapon damage die.');if(greatWeaponStyle)damageRolls=damageRolls.map(x=>Math.max(3,x));damage=damageRolls.reduce((a,b)=>a+b,0)+st.damageBonus;}else damage=Number(expr)+st.damageBonus;if(damage<0)damage=0;}
 let sneak=null;
 if(sneakOptions?.enabled){
  const M=root.FolioClassMechanics;
  if(!M)throw Error('Sneak Attack rules are unavailable.');
  sneak=M.resolveSneakAttack({character:c,resources:rogueStroke||rogueBudget||resources||{},inventory:inv},w,{rollMode:effective,hit,critical},sneakOptions,rollFn);
  damage+=sneak.extraDamage||0;
 }
 let roguePower=null;
 if(rogue){
   const config=rogueOptions||{};
   const poisoned=!!config.poisonFailed;
   roguePower=rogue.weaponEffects(c,sneak?.resources||rogueStroke||rogueBudget||resources||{}, {hit,critical,sneak:!!sneak?.applied,weaponType:w.type,firstRound:!!config.firstRound,targetNotActed:!!config.targetNotActed,poisonFailed:poisoned,deathSaveTotal:config.deathSaveTotal??null,poisonUsed:!!sneak?.applied&&!!sneakOptions?.strikes?.includes('poison')},rollFn);
   if(roguePower?.damage)damage+=roguePower.damage;
   if(roguePower?.deathStrike)damage*=2;
 }
 let barbarian=null;
 if(isBarbarian){
  const M=root.FolioClassMechanics;
  barbarian=M.barbarianAttack({character:c,resources:resources||{}},{hit,critical,strengthAttack,meleeAttack:w.kind==='Melee'&&mode!=='throw',disadvantage:rollMode==='disadvantage'||heavy},{...(barbarianOptions||{}),brutalEffects},rollFn);
  damage+=barbarian.extraDamage;
 }
 const barbarian2024=B?B.applyWeaponAttack(c,barbarian?.resources||resources||{},barbarianBudget,{hit,critical,strengthAttack,meleeAttack:w.kind==='Melee'&&mode!=='throw'}, {...(barbarianOptions||{}),heavyOrVersatile:(w.propertyList||[]).some(x=>['Heavy','Versatile'].includes(x)),target:barbarianOptions?.targetName||''},rollFn):null;
 if(barbarian2024)damage+=barbarian2024.damage;
 let hunterPrey=null;if(hunterOptions?.targetWounded){hunterPrey=root.FolioClassMechanics.resolveHunterPrey({character:c,resources:resources||{}},{hit,critical},hunterOptions,rollFn);damage+=hunterPrey.extraDamage||0;}
 const rangerEffects=ranger2024?ranger2024.weaponEffects(c,rangerBudget||resources||{},{hit:hit===true,critical,target:hunterOptions?.targetName||'',feyPsychic:!!hunterOptions?.feyPsychic,gloomDread:!!hunterOptions?.gloomDread,confirmed:!!hunterOptions?.confirmed},rollFn):null;
 if(rangerEffects)damage+=rangerEffects.damage;
 let markDamage=0,markRolls=[];if(marked&&hit===true){const sides=ranger&&c.level>=20?10:6;markRolls=Array.from({length:critical?2:1},()=>rollFn(sides));markRolls.forEach(value=>{if(!Number.isInteger(value)||value<1||value>sides)throw Error('Invalid Hunter’s Mark damage roll.');});markDamage=markRolls.reduce((a,b)=>a+b,0);damage+=markDamage;}const radiantStrikes=paladin&&c.level>=11&&w.kind==='Melee'&&hit===true;
 let radiantRolls=[],radiantDamage=0;
 if(radiantStrikes){radiantRolls=Array.from({length:critical?2:1},()=>rollFn(8));if(radiantRolls.some(v=>!Number.isInteger(v)||v<1||v>8))throw Error('Invalid Radiant Strikes d8.');radiantDamage=radiantRolls.reduce((a,b)=>a+b,0);damage+=radiantDamage;}
 let smite=null;
 if(smiteCost!=='none'&&hit===true){
  const M=root.FolioClassMechanics;if(!M)throw Error('Paladin rules unavailable.');
  smite=M.resolvePaladinSmite({character:c,resources:budget||resources||{}},{hit,critical,eligibleMelee:true},smiteOptions,rollFn);damage+=smite.extraDamage;
 }
 const fighterPowerBase=fighterPrecision?.resources||fighterBudget||resources||{};
 if(fighterPowerOptions){fighterPowerOptions.attackNatural=natural;fighterPowerOptions.attackTotal=total;}
 const fighterPower=fighter?fighter.applyAttackPower(c,fighterPowerBase,{hit,critical},fighterPowerOptions,rollFn):null;
 if(fighterPower)damage+=fighterPower.damage+fighterPower.forceDamage;
 const fighterRiposte=fighter&&fighterRole==='riposte'?fighter.riposteAttack(c,fighterPower?.resources||fighterPowerBase,{hit,critical,useRelentless:!!fighterOptions?.useRelentless},rollFn):null;
 if(fighterRiposte)damage+=fighterRiposte.damage;
 const fighterFollowup=fighter?fighter.finalizeManeuverAttack(c,fighterRiposte?.resources||fighterPower?.resources||fighterPowerBase,{target:fighterTarget,hit,critical,melee:w.kind==='Melee'&&mode!=='throw',lungeConfirmed:!!fighterOptions?.lungeConfirmed},rollFn):null;
 if(fighterFollowup)damage+=fighterFollowup.damage;
 const next=clone(inv),target=next.items.find(x=>x.id===itemId);if(mode==='throw')target.quantity=Math.max(0,target.quantity-1);if(mode==='ranged'&&((w.propertyList||[]).includes('Ammunition')||(w.properties||'').includes('Ammunition'))){const ammo=ammoItem(next,w.ammunitionType);if(ammo)ammo.quantity=Math.max(0,ammo.quantity-1);}if(w.limitedUses)target.weapon.usesUsed=(target.weapon.usesUsed||0)+1;
 const state=summary(c,next);const weaponDamage=damage-(sneak?.extraDamage||0)-(barbarian?.extraDamage||0)-(barbarian2024?.damage||0)-markDamage-radiantDamage-(smite?.extraDamage||0)-(hunterPrey?.extraDamage||0)-(fighterPower?.damage||0)-(fighterPower?.forceDamage||0)-(fighterRiposte?.damage||0)-(fighterFollowup?.damage||0)-(roguePower?.damage||0)-(rangerEffects?.damage||0);const msg=`${item.name}: d20 ${rolls.join(' / ')} ${st.attackBonus>=0?'+':''}${st.attackBonus} = ${total}${critical?' · CRITICAL':miss?' · NATURAL 1':hit===null?' · Check target AC':hit?' · HIT':' · MISS'}${hit===false?'':` · ${critical?'Critical ':''}damage ${(markDamage||radiantDamage||smite?.extraDamage||barbarian?.extraDamage)?`${weaponDamage+(sneak?.extraDamage||0)+(barbarian?.extraDamage||0)+(hunterPrey?.extraDamage||0)} ${w.type}${markDamage?' + '+markDamage+' Force':''}${radiantDamage+((smite?.extraDamage)||0)?' + '+(radiantDamage+((smite?.extraDamage)||0))+' Radiant':''} = ${damage} total`:`${damage} ${w.type}`}${hit===null?' (if hit)':''}`}${barbarian2024?.damage?' · Zealot Divine Fury +'+barbarian2024.damage+' '+barbarian2024.typedDamage:''}${barbarian2024?.effect?' · '+barbarian2024.effect.feature:''}${heavy?' · Heavy property disadvantage':''}${rage?' · Rage bonus included':''}${barbarianOptions?.retaliation?' · Berserker Retaliation (Reaction spent)':''}${barbarian?.reckless?' · Reckless Attack'+(barbarian?.brutalEffects?.length?' (Advantage forfeited for this strike)':' (enemies have Advantage against you until your next turn)'):''}${barbarian?.frenzy?' · Berserker Frenzy +'+barbarian.rolls.reduce((a,b)=>a+b,0)+' '+w.type+' ('+barbarian.rolls.length+'d6)':''}${barbarian?.brutalEffects?.length?' · Brutal Strike '+barbarian.brutalRolls.length+'d10 = '+barbarian.brutalDamage+' '+w.type+' · '+barbarian.brutalEffects.map(x=>x.key).join(', '):''}${hunterPrey?.applied?' · Colossus Slayer +'+hunterPrey.extraDamage+' '+w.type+' ('+hunterPrey.rolls.length+'d8)':''}${sacredActive?' · Sacred Weapon attack +'+sacredBonus:''}${marked&&markDamage?' · Hunter’s Mark +'+markDamage+' Force ('+markRolls.length+'d'+(ranger&&c.level>=20?10:6)+')':''}${radiantDamage?' · Radiant Strikes +'+radiantDamage+' Radiant ('+radiantRolls.length+'d8)':''}${smite?.applied?' · Divine Smite +'+smite.extraDamage+' Radiant ('+smite.diceRolled.length+'d8, '+smiteCost+')':''}${smiteCost!=='none'&&hit===false?' · Divine Smite NOT spent on miss':''}${fighterPower?.maneuver?' · Battle Master '+fighterPower.maneuver.name+' +'+fighterPower.damage+' '+w.type+' ('+fighterPower.maneuver.rolls.length+'d'+fighterPower.maneuver.dieSize+')':''}${fighterPower?.psionic?' · Psionic Strike +'+fighterPower.forceDamage+' Force':''}${fighterPower?.maneuver?.secondaryTarget?' · Sweeping Attack vs '+fighterPower.maneuver.secondaryTarget+': '+(fighterPower.maneuver.secondaryHit?'HIT '+fighterPower.maneuver.secondaryDamage+' '+w.type:'MISS'):''}${fighterPrecision?.applied?' · Precision Attack +'+fighterPrecision.bonus+(fighterPrecision.hit?' (now HIT)':' (still MISS)'):''}${fighterRiposte?' · Riposte Reaction '+(hit?'+'+fighterRiposte.damage+' '+w.type:'miss; die spent'):''}${fighterFollowup?.details?.length?' · '+fighterFollowup.details.map(x=>x.name+' +'+x.damage).join(', '):''}${fighterPower?.applied?' · '+damage+' total damage':''}${oathVow?' · Vow of Enmity Advantage vs confirmed vowed target':''}${soulReaction?' · Soul of Vengeance Reaction spent':''}${gloriousCounter?' · Glorious Defense counterattack (same Reaction)':''}${relentlessOpportunity?' · Opportunity Attack Reaction spent'+(hit?' · target Speed reduced to 0, may move up to half your Speed without Opportunity Attacks':' · no Relentless Avenger benefit on miss'):''}${unerringApplied?' · Living Legend Unerring Strike turns miss into hit':''}${paladin&&resources?.classState?.paladinTurnTracking?' · '+(attackRole==='attack'?'Attack action':attackRole==='light-bonus'?'Light Bonus Action':attackRole==='nick'?'Nick extra attack':'Opportunity Attack'):''}${rangerEffects?.parts?.length?' · '+rangerEffects.parts.map(x=>x.feature+' +'+x.amount+' '+x.type).join(', '):''}${precise?' · Precise Hunter advantage'+(effective==='normal'?' canceled':''):''}${rogueStroke?' · Stroke of Luck converts failed attack into a critical hit':''}${roguePower?.damage?' · Assassin bonus +'+roguePower.damage:''}${roguePower?.deathStrike?' · Death Strike doubles damage':''}${sneak?.applied?' · Sneak Attack +'+sneak.extraDamage+' ('+sneak.diceRolled.length+'d6)'+(sneak.effects.length?' · Cunning Strike: '+sneak.effects.map(x=>x.name+(x.save?' DC '+x.saveDC:'')).join(', '):''):''}${masteryReminder(w,st,hit===null?'unknown':hit===false||miss?'miss':'hit')?' · '+masteryReminder(w,st,hit===null?'unknown':hit===false||miss?'miss':'hit'):''}`;
 let nextResources=hunterPrey?.applied?hunterPrey.resources:smite?.applied?smite.resources:sneak?.applied?sneak.resources:barbarian2024?barbarian2024.resources:barbarian?barbarian.resources:null;
 if(rogueStroke){nextResources=nextResources?{...rogueStroke,...nextResources,classResources:{...rogueStroke.classResources,...nextResources.classResources},classState:{...rogueStroke.classState,...nextResources.classState}}:rogueStroke;}
 if(rogueBudget){nextResources=nextResources?{...rogueBudget,...nextResources,classState:{...rogueBudget.classState,...nextResources.classState}}:rogueBudget;}
 if(budget){nextResources=nextResources?{...budget,...nextResources,classState:{...budget.classState,...nextResources.classState}}:budget;}
 if(fighterBudget){nextResources=nextResources?{...fighterBudget,...nextResources,classState:{...fighterBudget.classState,...nextResources.classState}}:fighterBudget;}
 if(monkBudget){monkBudget.classState.monkNextAttackAdvantage=false;nextResources=nextResources?{...monkBudget,...nextResources,classState:{...nextResources.classState,...monkBudget.classState}}:monkBudget;}
 const fighterFinalResources=fighterFollowup?.resources||fighterRiposte?.resources||fighterPower?.resources||fighterPrecision?.resources||fighterBudget;
 if(fighterFinalResources){nextResources={...(nextResources||fighterFinalResources),...fighterFinalResources,classState:{...(nextResources?.classState||{}),...fighterFinalResources.classState}};}
 if(fighter){nextResources=fighter.afterAttack(c,nextResources||resources,hit,fighterTarget,natural);}
 if(monk){const stun=monk.weaponStun(c,nextResources||monkBudget||resources||{},{hit:hit===true,stunning:!!monkOptions?.stunning,saveTotal:monkOptions?.stunSave??null});if(stun)nextResources={...(nextResources||{}),...stun,classState:{...(nextResources?.classState||{}),...stun.classState}};}
 if(rangerBudget){nextResources=nextResources?{...rangerBudget,...nextResources,classState:{...nextResources.classState,...rangerBudget.classState}}:rangerBudget;}
 if(rangerEffects){nextResources={...(nextResources||rangerEffects.resources),...rangerEffects.resources,classState:{...(nextResources?.classState||{}),...rangerEffects.resources.classState},classResources:{...(nextResources?.classResources||{}),...rangerEffects.resources.classResources}};}
 if(rogue&&hit===true&&(nextResources||resources)?.classState?.rogueVeilActive){const base=nextResources||resources;nextResources={...base,classState:{...base.classState,rogueVeilActive:false,rogueVeilRounds:0}};}
 if(soulReaction){const prior=nextResources||resources||{};nextResources={...prior,classState:{...prior.classState,reactionUsed:true},lastClassEffect:{feature:'Soul of Vengeance',target:resources.classState.vowTarget,hit,critical,damage,note:'A confirmed attack roll by the vowed creature triggered a melee Reaction attack. Resolve damage and target state with the DM.'}};}
 if(gloriousCounter){const prior=nextResources||resources||{};nextResources={...prior,classState:{...prior.classState,gloryCounterattackPending:false,reactionUsed:true},lastClassEffect:{feature:'Glorious Defense counterattack',hit,critical,damage,note:'Counterattack against the confirmed attacker completed as part of the previously spent Reaction; no second Reaction charged.'}};}
 if(relentlessOpportunity){const prior=nextResources||resources||{};nextResources={...prior,classState:{...prior.classState,reactionUsed:true},lastClassEffect:{feature:'Relentless Avenger',hit,critical,damage,speedReduced:!!hit,moveHalfSpeed:!!hit,note:hit?'Opportunity Attack hit. Target Speed becomes 0 for this turn; you may move up to half your Speed without provoking Opportunity Attacks as part of the same Reaction.':'Opportunity Attack missed. Reaction spent; no Relentless Avenger benefit.'}};}
 if(unerringApplied){const prior=nextResources||resources||{};nextResources={...prior,classState:{...prior.classState,gloryLegendHitUsed:true},lastClassEffect:{feature:'Living Legend Unerring Strike',hit:true,critical:false,damage,note:'One missed weapon attack on your turn was turned into a normal hit; once-per-turn use spent.'}};}
 if(ranger2024&&root.FolioClassMechanics?.hunter(c)&&resources?.classState?.hunterPrey==='horde'&&(hunterOptions?.attackRole||'attack')==='attack'&&!resources?.classState?.rangerHunterHordeUsed&&String(hunterOptions?.targetName||'').trim()){const r0=nextResources||resources||{};const original=String(hunterOptions.targetName).trim();nextResources={...r0,classState:{...r0.classState,rangerHunterHordeReady:true,rangerHunterHordeTarget:original,rangerHordeWeaponId:itemId,rangerAttackedTargets:[...new Set([...(r0.classState?.rangerAttackedTargets||[]),original])]}};}
 const damageComponents=[{type:w.type,amount:weaponDamage+(sneak?.extraDamage||0)+(barbarian?.extraDamage||0)+(hunterPrey?.extraDamage||0)+(fighterPower?.damage||0)+(fighterRiposte?.damage||0)+(fighterFollowup?.damage||0)}];
 if(barbarian2024?.damage)damageComponents.push({type:barbarian2024.typedDamage||w.type,amount:barbarian2024.damage});
 if(markDamage)damageComponents.push({type:'Force',amount:markDamage});
 if(rangerEffects?.parts?.length)damageComponents.push(...rangerEffects.parts.map(x=>({type:x.type,amount:x.amount})));
 if(radiantDamage||smite?.extraDamage)damageComponents.push({type:'Radiant',amount:radiantDamage+(smite?.extraDamage||0)});
 if(fighterPower?.forceDamage)damageComponents.push({type:'Force',amount:fighterPower.forceDamage});
 if(roguePower?.parts?.length)damageComponents.push(...roguePower.parts.map(p=>({type:p.type,amount:p.amount})));
 if(roguePower?.deathStrike)damageComponents.push({type:'Death Strike additional damage (same types as original)',amount:Math.max(0,damage/2)});
 return {inventory:next,...(nextResources?{resources:nextResources}:{}),result:{itemId,weapon:item.name,rolls,natural,total,attackBonus:st.attackBonus,critical,hit,damage,damageRolls,sneakAttack:sneak?.applied?{extraDamage:sneak.extraDamage,diceRolled:sneak.diceRolled,effects:sneak.effects}:null,barbarian2024:barbarian2024?{extraDamage:barbarian2024.damage,damageType:barbarian2024.typedDamage,effect:barbarian2024.effect,attackRole:barbRole}:null,barbarian:barbarian?{reckless:barbarian.reckless,frenzy:barbarian.frenzy,extraDamage:barbarian.extraDamage,diceRolled:barbarian.rolls,brutalDamage:barbarian.brutalDamage,brutalRolls:barbarian.brutalRolls,brutalEffects:barbarian.brutalEffects}:null,hunterPrey:hunterPrey?.applied?{extraDamage:hunterPrey.extraDamage,rolls:hunterPrey.rolls}:null,ranger2024:ranger2024?{attackRole:hunterOptions?.attackRole||'attack',target:hunterOptions?.targetName||'',effects:rangerEffects?.parts||[],extraDamage:rangerEffects?.damage||0}:null,sacredWeaponBonus:sacredBonus,fightingStyleDamageBonus:dueling||thrownStyle?2:0,greatWeaponStyleApplied:greatWeaponStyle,vowOfEnmityAdvantage:oathVow,soulOfVengeance:soulReaction,gloriousDefenseCounterattack:gloriousCounter,relentlessAvenger:relentlessOpportunity?{hit:!!hit,speedReduced:!!hit,moveHalfSpeed:!!hit}:null,livingLegendUnerring:unerringApplied,attackRole:paladin?attackRole:null,huntersMark:marked?{target:resources.classState.huntersMarkTarget,extraDamage:markDamage,diceRolled:markRolls,preciseHunter:precise,damageType:'Force'}:null,radiantStrikes:radiantStrikes?{extraDamage:radiantDamage,diceRolled:radiantRolls,damageType:'Radiant'}:null,divineSmite:smiteCost!=='none'?{applied:!!smite?.applied,cost:smiteCost,extraDamage:smite?.extraDamage||0,diceRolled:smite?.diceRolled||[],damageType:'Radiant'}:null,damageBonus:st.damageBonus,damageType:w.type,damageComponents,mastery:fighterOptions?.masteryOverride||w.mastery,masteryReminder:fighterOptions?.masteryOverride?('Tactical Master: '+fighterOptions.masteryOverride+' (confirm creature outcome at table)'):masteryReminder(w,st,hit===null?'unknown':hit===false||miss?'miss':'hit'),rogue:rogue?{attackRole:rogueRole,steadyAim:!!rogueSteady,assassinSurprise:!!rogueAmbush,extraDamage:roguePower?.damage||0,deathStrike:!!roguePower?.deathStrike,strokeOfLuck:!!rogueStroke}:null,fighter: fighter?{attackRole:fighterRole,studiedAdvantage:!!studiedAdv,feintAdvantage:!!feintAdv,precision:fighterPrecision?.applied?{bonus:fighterPrecision.bonus,hit:fighterPrecision.hit}:null,riposte:fighterRiposte?{damage:fighterRiposte.damage,spent:true}:null,followup:fighterFollowup?.details||[],target:fighterTarget,masteryOverride:fighterOptions?.masteryOverride||null,attackPower:fighterPower?.applied?{maneuver:fighterPower.maneuver,psionic:fighterPower.psionic,extraDamage:fighterPower.damage+fighterPower.forceDamage}:null}:null,heavy,mode,rollMode:strikeMode,targetAC:hasAC?targetAC:null,message:msg},summary:state};}

// 2024 SRD Unarmed Strike: damage attack, or a reach/size-confirmed Grapple or
// Shove saving throw. Does not invent conditions on an external enemy sheet.
function paladinUnarmed(c,resources,{kind='damage',attackRole='attack',rollMode='normal',targetAC=null,saveTotal=null,saveAbility='str',sizeAndReachConfirmed=false,opportunityConfirmed=false,smiteCost='none',fiendOrUndead=false,vowedTarget=false,inventory=null}={},rollFn=D.rollDie){
 if(classOf(c)!=='Paladin'||c.templateKind!=='starter')throw Error('This unarmed combat assistant is for single-class Paladins.');
 if(!['damage','grapple','shove'].includes(kind))throw Error('Choose Damage, Grapple or Shove.');
 if(!['normal','advantage','disadvantage'].includes(rollMode))throw Error('Choose a valid d20 roll mode.');
 if(!['attack','opportunity'].includes(attackRole))throw Error('Unarmed Strikes do not qualify for Light or Nick extra attacks.');
 if(attackRole==='opportunity'&&(smiteCost!=='none'||kind!=='damage'))throw Error('An Opportunity Attack cannot cast Divine Smite or initiate Grapple/Shove.');
 if(attackRole==='opportunity'&&!opportunityConfirmed)throw Error('Confirm the Opportunity Attack trigger and melee reach.');
 const roleBudget=root.FolioPaladinCombat.attackBudget(c,resources||{},{id:'unarmed',weapon:{kind:'Melee',propertyList:[]}},'melee',attackRole);
 if(kind!=='damage'){
  if(!sizeAndReachConfirmed)throw Error('Confirm the creature is in reach and no more than one size larger.');
  if(!['str','dex'].includes(saveAbility)||!Number.isInteger(saveTotal)||saveTotal< -100||saveTotal>200)throw Error('Enter the target’s Strength or Dexterity saving throw total.');
  const dc=8+C.proficiency(c.level)+Math.floor((Number(c.scores.str)-10)/2),failed=saveTotal<dc;
  const msg=`Unarmed ${kind}: target ${saveAbility.toUpperCase()} save ${saveTotal} vs DC ${dc} · ${failed?(kind==='grapple'?'GRAPPLED':'SHOVED (Prone or 5 ft)'):'resisted'}`;
  const r=roleBudget||resources||{};
  return {resources:{...r,lastClassEffect:{feature:'Unarmed Strike '+kind,saveDC:dc,saveTotal,saveAbility,failed,note:'DM confirms creature size, reach, grapple free-hand requirement and its ongoing conditions.'}},result:{kind,saveDC:dc,saveTotal,saveAbility,failed,hit:null,damage:0,message:msg}};
 }
 const ab=Math.floor((Number(c.scores.str)-10)/2),bonus=ab+C.proficiency(c.level);
 const vow=!!vowedTarget&&!!root.FolioClassMechanics?.vengeance(c)&&!!resources?.classState?.vowTarget;
 if(vowedTarget&&!vow)throw Error('Vow of Enmity must be active against the confirmed target.');
 const effective=vow?(rollMode==='disadvantage'?'normal':'advantage'):rollMode;
 const rolls=effective==='normal'?[rollFn(20)]:[rollFn(20),rollFn(20)];
 if(rolls.some(x=>!Number.isInteger(x)||x<1||x>20))throw Error('Invalid unarmed d20 roll.');
 const natural=effective==='advantage'?Math.max(...rolls):effective==='disadvantage'?Math.min(...rolls):rolls[0];
 const total=natural+bonus,critical=natural===20,hit=natural===20?true:natural===1?false:Number.isInteger(targetAC)&&targetAC>=1&&targetAC<=50?total>=targetAC:null;
 if(smiteCost!=='none'&&(hit===null||attackRole!=='attack'))throw Error('Divine Smite requires a confirmed hit on your turn.');
 const unarmedStyle=hasStyle(c,'Unarmed Fighting');
 const hasHeldGear=inventory?.items?.some(i=>i.equipped&&i.quantity>0&&['weapon','shield'].includes(i.category));
 const styleDie=unarmedStyle?(hasHeldGear===false?8:6):0;
 const styleRoll=styleDie&&hit!==false?rollFn(styleDie):null;
 if(styleDie&&hit!==false&&(!Number.isInteger(styleRoll)||styleRoll<1||styleRoll>styleDie))throw Error('Invalid Unarmed Fighting die.');
 // A critical doubles the damage dice, including the style's d6/d8.
 const critExtra=styleDie&&hit!==false&&critical?rollFn(styleDie):0;
 if(critExtra&&(!Number.isInteger(critExtra)||critExtra<1||critExtra>styleDie))throw Error('Invalid critical damage die.');
 const baseDamage=hit===false?0:Math.max(0,(styleDie?styleRoll+critExtra:1)+ab);
 let damage=baseDamage,radiant=0,smite=null,r=roleBudget||resources||{};
 if(hit===true&&Number(c.level)>=11){const dice=Array.from({length:critical?2:1},()=>rollFn(8));if(dice.some(x=>!Number.isInteger(x)||x<1||x>8))throw Error('Invalid Radiant Strikes roll.');radiant=dice.reduce((a,b)=>a+b,0);damage+=radiant;}
 if(hit&&smiteCost!=='none'){
  smite=root.FolioClassMechanics.resolvePaladinSmite({character:c,resources:r},{hit:true,eligibleMelee:true,critical},{cost:smiteCost,fiendOrUndead},rollFn);
  damage+=smite.extraDamage;r=smite.resources;
 }
 const message=`Unarmed Strike d20 ${rolls.join(' / ')} ${bonus>=0?'+':''}${bonus} = ${total}${critical?' · CRITICAL':''}${hit===null?' · preview':hit?' · HIT':' · MISS'} · ${damage} total damage${radiant?' (Radiant Strikes +'+radiant+' Radiant)':''}${smite?.applied?' (Divine Smite +'+smite.extraDamage+' Radiant)':''}`;
 return {resources:r,result:{kind:'damage',natural,total,critical,hit,damage,baseDamage,unarmedStyleDie:styleDie,radiant,smite:smite?.applied?{extraDamage:smite.extraDamage,cost:smiteCost}:null,attackRole,message}};
}
// In-person play: recording a weapon use never rolls or assumes it hit.
function recordPhysicalAttack(state,itemId,mode='melee'){
 const inv=state.inventory,item=inv.items.find(x=>x.id===itemId);
 if(!item||item.category!=='weapon')throw Error('Choose a weapon from Inventory.');
 if(!item.equipped||item.quantity<1)throw Error('Equip this weapon before recording its use.');
 if(!modes(item).some(x=>x.key===mode))throw Error('That weapon mode is not available.');
 const w=item.weapon||{},ammoRequired=mode==='ranged'&&((w.propertyList||[]).includes('Ammunition')||String(w.properties||'').includes('Ammunition'));
 let next=inv,notice='Physical dice and DM confirmation determine whether the attack hit.';
 if(mode==='throw'){
  next=I.update(next,itemId,{quantity:item.quantity-1});
  notice='One thrown weapon removed from your carried quantity. '+notice;
 }else if(ammoRequired){
  const ammo=ammoItem(inv,w.ammunitionType||'');
  if(ammo){next=I.update(next,ammo.id,{quantity:ammo.quantity-1});notice='One '+ammo.name+' used. '+notice;}
  else notice='No tracked ammunition was found; track the ammunition at the table. '+notice;
 }
 const r=state.resources||{};
 return {...state,inventory:next,resources:{...r,lastClassEffect:{feature:'Manual weapon use',weapon:item.name,mode,note:notice}}};
}
function masteryError(c,inv,itemId,enabled){const item=inv.items.find(x=>x.id===itemId);if(!item)throw Error('Weapon not found.');if(!enabled)return '';const w=item.weapon||{},current=summary(c,inv),key=w.catalogKey||item.name.toLowerCase(),already=inv.items.some(x=>x.id!==itemId&&x.category==='weapon'&&x.weapon?.mastered&&(x.weapon.catalogKey||x.name.toLowerCase())===key);if(!w.mastery||w.mastery==='—')return 'This weapon has no mastery property.';if(!proficient(c,w))return 'Your character is not proficient with this weapon.';if(classOf(c)==='Barbarian'&&w.kind==='Ranged')return 'Barbarians can select only melee weapon masteries.';
 const chosen=new Set(inv.items.filter(x=>x.category==='weapon'&&x.weapon?.mastered&&x.quantity>0).map(x=>x.weapon.catalogKey||x.name.toLowerCase()));
 if(enabled)chosen.add(key);
 if(chosen.size>current.masteryLimit)return `Your class mastery limit is ${current.masteryLimit}.`;
 return '';}
root.FolioWeaponRules={properties,masteryLimit,proficient,abilityFor,stats,summary,modes,catalogItem,validDamage,ammoItem,attackError,attack,recordPhysicalAttack,paladinUnarmed,masteryError};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioWeaponRules;
})(typeof window!=='undefined'?window:globalThis);
