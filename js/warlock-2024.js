(function(root){'use strict';
// 2024 PHB Warlock sheet state and decisions. Sourcebook-dependent effects stay DM-confirmed.
const mod=n=>Math.floor((Number(n||10)-10)/2),int=(n,a,b)=>Number.isInteger(n)&&n>=a&&n<=b;
const clean=x=>String(x??'').trim().slice(0,100);
const level=c=>Number(c?.level||c?.build?.level||1);
const isWarlock=c=>c?.templateKind==='starter'&&(c.build?.characterClass||c.className)==='Warlock';
const subclass=c=>isWarlock(c)&&level(c)>=3?String(c.build?.subclass||c.subclass||''):'';
const patron=(c,k)=>subclass(c)===k;
const cha=c=>Math.max(1,mod(c.scores?.cha));
const dc=c=>8+(2+Math.floor((level(c)-1)/4))+mod(c.scores?.cha);
const SLOTS=[0,1,3,3,3,5,5,6,6,7,7,7,8,8,8,9,9,9,10,10,10];
const INVOCATIONS=[
 ['Agonizing Blast',2,'damage-cantrip',true],['Armor of Shadows',1],['Ascendant Step',5],['Devil’s Sight',2],
 ['Devouring Blade',12,'Thirsting Blade'],['Eldritch Mind',1],['Eldritch Smite',5,'Pact of the Blade'],
 ['Eldritch Spear',2,'damage-cantrip',true],['Fiendish Vigor',2],['Gaze of Two Minds',5],['Gift of the Depths',5],
 ['Gift of the Protectors',9,'Pact of the Tome'],['Investment of the Chain Master',5,'Pact of the Chain'],
 ['Lessons of the First Ones',2,'origin-feat',true],['Lifedrinker',9,'Pact of the Blade'],['Mask of Many Faces',2],
 ['Master of Myriad Forms',5],['Misty Visions',2],['One with Shadows',5],['Otherworldly Leap',2],
 ['Pact of the Blade',1],['Pact of the Chain',1],['Pact of the Tome',1],['Repelling Blast',2,'attack-cantrip',true],
 ['Thirsting Blade',5,'Pact of the Blade'],['Visions of Distant Realms',9],['Whispers of the Grave',7],['Witch Sight',15]
].map(([name,min=1,requires='',repeatable=false])=>Object.freeze({name,min,requires,repeatable}));
const INV_BY_NAME=Object.fromEntries(INVOCATIONS.map(x=>[x.name,x]));
const names=c=>(c.build?.warlockInvocations||[]).map(x=>String(x).split('::')[0]);
const has=(c,x)=>isWarlock(c)&&names(c).includes(x);
const attach=x=>String(x).split('::').slice(1).join('::');
const granted=(c)=>{
 if(!isWarlock(c))return [];
 const n=level(c),s=subclass(c);let tiers={};
 if(s==='Archfey Patron')tiers={3:['Calm Emotions','Faerie Fire','Misty Step','Phantasmal Force','Sleep'],5:['Blink','Plant Growth'],7:['Dominate Beast','Greater Invisibility'],9:['Dominate Person','Seeming']};
 if(s==='Celestial Patron')tiers={3:['Aid','Cure Wounds','Guiding Bolt','Lesser Restoration','Light','Sacred Flame'],5:['Daylight','Revivify'],7:['Guardian of Faith','Wall of Fire'],9:['Greater Restoration','Summon Celestial']};
 if(s==='Fiend Patron')tiers={3:['Burning Hands','Command','Scorching Ray','Suggestion'],5:['Fireball','Stinking Cloud'],7:['Fire Shield','Wall of Fire'],9:['Geas','Insect Plague']};
 if(s==='Great Old One Patron')tiers={3:['Detect Thoughts','Dissonant Whispers','Phantasmal Force',"Tasha’s Hideous Laughter"],5:['Clairvoyance','Hunger of Hadar'],7:['Confusion','Summon Aberration'],9:['Modify Memory','Telekinesis']};
 let extras=[];
 if(s==='Great Old One Patron')for(const [key,arr] of Object.entries(tiers))tiers[key]=arr.map(x=>x==="Tasha’s Hideous Laughter"?'Hideous Laughter':x);
 if(n>=9)extras.push('Contact Other Plane');
 if(n>=10&&s==='Great Old One Patron')extras.push('Hex');
 if(has(c,'Pact of the Tome'))extras.push(...(c.build?.warlockTomeCantrips||[]),...(c.build?.warlockTomeRituals||[]));
 const free={ 'Armor of Shadows':'Mage Armor','Ascendant Step':'Levitate','Fiendish Vigor':'False Life', 'Gift of the Depths':'Water Breathing', 'Mask of Many Faces':'Disguise Self', 'Master of Myriad Forms':'Alter Self', 'Misty Visions':'Silent Image', 'One with Shadows':'Invisibility', 'Otherworldly Leap':'Jump','Visions of Distant Realms':'Arcane Eye','Whispers of the Grave':'Speak with Dead','Pact of the Chain':'Find Familiar'};
 for(const [inv,sp] of Object.entries(free))if(has(c,inv))extras.push(sp);
 return [...new Set([...Object.entries(tiers).filter(([k])=>n>=Number(k)).flatMap(([,arr])=>arr),...extras])];
};
const resourcesFor=c=>{
 if(!isWarlock(c))return [];
 const n=level(c),s=subclass(c),entry=(key,name,max,reset='long',note='')=>({key,name,max,reset,shortGain:0,note});
 return [
 ...(s==='Archfey Patron'?[entry('warlock-fey-steps','Steps of the Fey · free Misty Step',cha(c)),...(n>=10?[entry('warlock-beguile','Beguiling Defenses (free)',1,'long','Reaction on confirmed hit')]:[])]:[]),
 ...(s==='Celestial Patron'?[entry('warlock-healing-light','Healing Light · d6 pool',1+n),...(n>=14?[entry('warlock-searing','Searing Vengeance',1)]:[])]:[]),
 ...(s==='Fiend Patron'&&n>=14?[entry('warlock-hurl','Hurl through Hell',1)]:[]),
 ...(s==='Great Old One Patron'&&n>=6?[entry('warlock-clairvoyant','Clairvoyant Combat',1,'short')]:[]),
 ...(has(c,'Gift of the Depths')?[entry('warlock-depths','Gift of the Depths free cast',1)]:[]),
 ...(has(c,'Gift of the Protectors')?[entry('warlock-protectors','Gift of the Protectors',1)]:[])
 ];
};
function failure(why){throw Error(why);}
function ensure(s,n=1){if(!isWarlock(s?.character)||level(s.character)<n)failure('This feature requires Warlock level '+n+'.');}
const f=s=>({...s.resources.classState||{}}),p=s=>({...s.resources.classResources||{}});
function update(s,flags,effect,other={}){return {...s,resources:{...s.resources,...other,classState:flags,lastClassEffect:effect}};}
function resource(s,key){const entry=(root.FolioClassMechanics?.resourcesFor(s.character)||resourcesFor(s.character)).find(x=>x.key===key);if(!entry)failure('That resource is not available.');return {entry,current:p(s)[key]??entry.max};}
function spend(s,key,count=1){const {current}=resource(s,key);if(current<count)failure('No '+key+' uses left.');return {...p(s),[key]:current-count};}
function roll(fn,sides){const value=typeof fn==='function'?fn(sides):1;if(!int(value,1,sides))failure('Invalid dice result.');return value;}
function budget(s,kind){const x=f(s);if(!['action','bonus','reaction'].includes(kind))failure('Unknown action budget.');const key=kind==='reaction'?'reactionUsed':kind==='bonus'?'warlockBonusUsed':'warlockActionUsed';if((x.warlockTurnTracking||kind==='reaction')&&x[key])failure(kind+' already spent this turn.');if(x.warlockTurnTracking||kind==='reaction')x[key]=true;return x;}
function newTurn(s){ensure(s);const x=f(s);return update(s,{...x,warlockTurnTracking:true,warlockActionUsed:false,warlockBonusUsed:false,reactionUsed:false,warlockSpellSlotCast:false,warlockRadiantUsed:false,warlockLifedrinkerUsed:false,warlockHurlUsed:false,warlockRepelUsed:false,warlockPactAttacks:0,warlockBewitchReady:false,warlockSmiteUsed:false}, {feature:'Warlock turn',note:'Action, Bonus Action, Reaction and once-per-turn effects reset.'});}
function restState(c,old={},kind='short'){
 if(!isWarlock(c))return old;
 const next={...old,warlockTurnTracking:false,warlockActionUsed:false,warlockBonusUsed:false,reactionUsed:false,warlockSpellSlotCast:false,warlockRadiantUsed:false,warlockLifedrinkerUsed:false,warlockHurlUsed:false,warlockPactAttacks:0,warlockBewitchReady:false,warlockSmiteUsed:false,warlockGazeActive:false,warlockProtectorPending:false};
 if(kind==='long'){next.warlockContactUsed=false;next.warlockMageArmor=false;next.warlockResistanceRestReady=true;next.warlockMistyEscapeActive=false;next.warlockCompanionActive=false;}
 if(kind==='short')next.warlockResistanceRestReady=true;
 return next;
}
function restEffect(s,kind){if(!isWarlock(s.character))return s;const n=level(s.character);if(patron(s.character,'Celestial Patron')&&n>=10){const offered=n+mod(s.character.scores.cha),hp=Math.max(s.resources.tempHp||0,offered);return {...s,resources:{...s.resources,tempHp:hp,lastClassEffect:{feature:'Celestial Resilience',offered,applied:hp,kind,note:'Up to five confirmed creatures may each gain half Warlock level plus Charisma modifier Temporary HP. Apply to their own sheets.'}}};}return s;}
function choose(s,list){ensure(s);if(!Array.isArray(list)||list.length!==SLOTS[level(s.character)])failure('Select exactly '+SLOTS[level(s.character)]+' invocations.');
 const seen=new Map();for(const value of list){const name=clean(value.split('::')[0]),item=INV_BY_NAME[name];if(!item||level(s.character)<item.min)failure('Unqualified invocation: '+name);const previous=seen.get(name)||0;if(previous&&!item.repeatable)failure('That invocation cannot be selected twice: '+name);seen.set(name,previous+1);
  if(['damage-cantrip','attack-cantrip','origin-feat'].includes(item.requires)&&!attach(value))failure(name+' needs a named cantrip or Origin feat.');
  if(item.requires==='damage-cantrip'||item.requires==='attack-cantrip'){
    const sp=(root.FolioSpellRules?.catalog?.()||[]).find(x=>x.name===attach(value)&&x.level===0&&(x.classes||[]).includes('Warlock'));
    if(!sp||!/damage|attack|hurt|wound|harm/i.test(sp.description||sp.name))failure('Choose a damaging Warlock cantrip, confirmed in your spell source.');
    if(item.requires==='attack-cantrip'&&!/attack/i.test(sp.description||sp.name))failure('Repelling Blast requires a Warlock cantrip that makes an attack roll.');
  }
  if(item.requires==='origin-feat'){
    const allowed=root.FolioOrigins?.feats||[];
    if(!allowed.some(o=>o.name===attach(value)&&String(o.category||'').toLowerCase().includes('origin')))failure('Lessons of the First Ones requires a valid Origin feat.');
  }}
 for(const value of list){const item=INV_BY_NAME[value.split('::')[0]];if(item.requires&&!['damage-cantrip','attack-cantrip','origin-feat'].includes(item.requires)&&!seen.has(item.requires))failure(item.name+' needs '+item.requires+'.');}
 for(const [name,count] of seen)if(count>1){const attaches=list.filter(v=>v.split('::')[0]===name).map(attach);if(new Set(attaches).size!==count)failure('Repeatable invocations need different eligible selections.');}
 const b={...s.character.build,warlockInvocations:[...list]};return {...update(s,f(s),{feature:'Eldritch Invocations',note:'Validated '+list.length+' current choices and prerequisites.'}),character:{...s.character,build:b}};
}
function tome(s,cantrips,rituals){ensure(s);if(!has(s.character,'Pact of the Tome'))failure('Pact of the Tome invocation required.');if(!Array.isArray(cantrips)||!Array.isArray(rituals)||cantrips.length!==3||rituals.length!==2||new Set(cantrips).size!==3||new Set(rituals).size!==2||[...cantrips,...rituals].some(x=>!clean(x)))failure('Choose three different cantrips and two level 1 ritual spells.');
 const catalog=root.FolioSpellRules?.catalog?.()||[];
 const preparedNames=new Set((s.spellbook?.catalogSelections||[]).map(key=>catalog.find(sp=>sp.key===key)?.name).filter(Boolean));const subclassSpells=new Set(granted({...s.character,build:{...s.character.build,warlockInvocations:(s.character.build.warlockInvocations||[]).filter(x=>x!=='Pact of the Tome')}}));for(const x of [...cantrips,...rituals])if(preparedNames.has(x)||subclassSpells.has(x))failure('Book of Shadows choices must not already be prepared: '+x);for(const x of cantrips){if(!catalog.some(sp=>sp.name===x&&sp.level===0))failure('Tome cantrip not found in catalog: '+x);}
 for(const x of rituals){if(!catalog.some(sp=>sp.name===x&&sp.level===1&&sp.ritual===true))failure('Tome ritual must be a verified level 1 ritual: '+x);}
 return {...update(s,f(s),{feature:'Book of Shadows',note:'Chosen spells are always prepared while the Book of Shadows is present.'}),character:{...s.character,build:{...s.character.build,warlockTomeCantrips:[...cantrips],warlockTomeRituals:[...rituals]}}};
}
function recordCast(s,spell,cost,{confirmedTime='',psychic=false,withoutComponents=false}={}){
 ensure(s);if(!spell)failure('Choose a valid spell.');
 const x=f(s),st=String(spell.time||spell.castingTime||'').toLowerCase(),time=/bonus action/.test(st)?'bonus':/reaction/.test(st)?'reaction':/^(1\s*)?action$/.test(st)?'action':/minute|hour|day/.test(st)?'action':confirmedTime;
 if(!['action','bonus','reaction'].includes(time))failure('Confirm the casting time from the sourcebook.');
 if(psychic&&!patron(s.character,'Great Old One Patron'))failure('Psychic Spells needs the Great Old One patron.');
 if(withoutComponents&&(!patron(s.character,'Great Old One Patron')||!['Enchantment','Illusion'].includes(spell.school)))failure('Only Enchantment or Illusion spells have this component option.');
 if(x.warlockTurnTracking&&cost.startsWith('slot')&&x.warlockSpellSlotCast)failure('Spell slot already cast during this tracked turn.');
 const g=budget(s,time);if(cost.startsWith('slot'))g.warlockSpellSlotCast=true;
 if(level(s.character)>=14&&patron(s.character,'Archfey Patron')&&cost.startsWith('slot')&&time==='action'&&['Enchantment','Illusion'].includes(spell.school))g.warlockBewitchReady=true;
 return update(s,g,{feature:'Warlock spellcast',spell:spell.name,cost,psychic,withoutComponents,note:(psychic?'Player chose Psychic damage. ':'')+(withoutComponents?'Verbal and Somatic components omitted. ':'')+'Target effects, spell details and save outcomes require DM confirmation.'});
}
function pactWeapon(s,{weapon='',damage='1d8',target='',ac=null,attack=false,confirmed=false}={},fn){ensure(s);if(!has(s.character,'Pact of the Blade'))failure('Choose Pact of the Blade first.');if(!clean(weapon)||!/^(?:[1-3])d(?:4|6|8|10|12)$/.test(damage))failure('Give the chosen weapon and valid dice (for example 1d8).');
 if(!attack){const g=budget(s,'bonus');g.warlockPactWeapon={weapon:clean(weapon),damage};return update(s,g,{feature:'Pact of the Blade',weapon:clean(weapon),note:'Conjured or bonded melee weapon; Charisma attack and damage; choose Necrotic/Psychic/Radiant on a confirmed attack.'});}
 if(!confirmed||!clean(target))failure('Confirm a real target and attack before rolling.');const x=f(s);if(!x.warlockPactWeapon)failure('Conjure or bond a Pact weapon first.');
 const max=has(s.character,'Devouring Blade')&&level(s.character)>=12?3:has(s.character,'Thirsting Blade')&&level(s.character)>=5?2:1;
 if(x.warlockTurnTracking&&x.warlockPactAttacks>=max)failure('No pact weapon attacks left in this Attack action.');let g={...x};if(g.warlockTurnTracking&&!g.warlockPactAttacks)g=budget(s,'action');g.warlockPactAttacks=(g.warlockPactAttacks||0)+1;
 const d20=roll(fn,20),atk=mod(s.character.scores.cha)+2+Math.floor((level(s.character)-1)/4),total=d20+atk;
 const [count,sides]=damage.split('d').map(Number),rolls=Array.from({length:count},()=>roll(fn,sides));const dmg=rolls.reduce((a,b)=>a+b,0)+mod(s.character.scores.cha);
 return update(s,g,{feature:'Pact weapon attack',target:clean(target),d20,total,damage:dmg,damageRolls:rolls,hit:ac==null?null:d20===20||d20!==1&&total>=ac,attackNumber:g.warlockPactAttacks,maxAttacks:max,note:'Apply damage and conditions only on a DM-confirmed hit; pact weapon attacks use your Charisma modifier.'});
}
function action(s,kind,{target='',confirmed=false,value=0,choice='',mode='',slot=0,save=null}={},fn){ensure(s);const n=level(s.character),sub=subclass(s.character),self=clean(target)==='Self'||clean(target)===s.character.name;let g=f(s),q=p(s),r={...s.resources},eff=null;
 const requireConfirm=()=>{if(!confirmed)failure('Confirm the triggering creature, range and timing with your DM.');};
 const useSlot=()=>{const max=s.character.build.slotMax.findIndex(x=>x>0),sl=[...(r.spellSlots||[])];if(max<0||!sl[max])failure('No Pact Magic slot remains.');sl[max]--;r.spellSlots=sl;return max+1;};
 switch(kind){
  case 'contact':if(n<9)failure('Contact Patron requires level 9.');if(g.warlockContactUsed)failure('Contact Patron free use already spent.');g=budget(s,'action');g.warlockContactUsed=true;eff={feature:'Contact Patron',note:'Cast Contact Other Plane without a slot; saving throw automatically succeeds; once per Long Rest.'};break;
  case 'fey-step':if(sub!=='Archfey Patron')failure('Archfey required.');q=spend(s,'warlock-fey-steps');g=budget(s,'bonus');eff={feature:'Steps of the Fey',choice:clean(choice||'Refreshing Step'),note:clean(choice)==='Taunting Step'?'DM rolls Wisdom saves; affected creatures have disadvantage on attacks against creatures other than you.':'You or an ally within 10 feet of the destination gains 1d10 Temporary HP; apply to confirmed sheet.'};if(choice==='Refreshing Step'&&self)r.tempHp=Math.max(r.tempHp||0,roll(fn,10));break;
  case 'fey-escape':requireConfirm();if(sub!=='Archfey Patron'||n<6)failure('Misty Escape requires Archfey level 6.');g=budget(s,'reaction');if(mode==='free')q=spend(s,'warlock-fey-steps');else useSlot();g.warlockMistyEscapeActive=true;eff={feature:'Misty Escape',note:'Cast Misty Step in response to taking damage; choose Invisible or Dreadful Step, resolve creature saves with DM.'};break;
  case 'beguile':requireConfirm();if(sub!=='Archfey Patron'||n<10)failure('Beguiling Defenses requires level 10.');if(mode==='restore')useSlot();else q=spend(s,'warlock-beguile');g=budget(s,'reaction');eff={feature:'Beguiling Defenses',note:'Charmed immunity; halve damage from confirmed attacker and request Wisdom save; retaliation Psychic damage equals damage taken.'};break;
  case 'bewitch':if(sub!=='Archfey Patron'||n<14||!g.warlockBewitchReady)failure('Cast an Enchantment or Illusion Action spell using a Pact slot first.');g.warlockBewitchReady=false;eff={feature:'Bewitching Magic',note:'Misty Step as part of the same action without another spell slot.'};break;
  case 'heal':requireConfirm();if(sub!=='Celestial Patron')failure('Celestial required.');if(!int(value,1,cha(s.character)))failure('Healing Light spends 1–Charisma modifier dice.');q=spend(s,'warlock-healing-light',value);g=budget(s,'bonus');{const rolls=Array.from({length:value},()=>roll(fn,6)),amount=rolls.reduce((a,b)=>a+b,0);if(self)r.hp=Math.min(r.maxHp,r.hp+amount);eff={feature:'Healing Light',rolls,amount,target:clean(target),note:self?'Your HP was restored; others must update their own sheets.':'Player-target healing amount; update target sheet after DM confirmation.'};}break;
  case 'radiant':requireConfirm();if(sub!=='Celestial Patron'||n<6)failure('Radiant Soul requires level 6.');if(g.warlockRadiantUsed)failure('Radiant Soul used this turn.');g.warlockRadiantUsed=true;eff={feature:'Radiant Soul',bonus:mod(s.character.scores.cha),target:clean(target),note:'Add Charisma modifier once to Radiant/Fire spell damage against one target, no invented result.'};break;
  case 'searing':requireConfirm();if(sub!=='Celestial Patron'||n<14)failure('Searing Vengeance requires level 14.');if(self&&r.hp>0)failure('Searing Vengeance on yourself requires 0 HP and a Death Save trigger.');q=spend(s,'warlock-searing');if(self)r.hp=Math.max(r.hp||0,Math.ceil(r.maxHp/2));eff={feature:'Searing Vengeance',healedTo:r.hp,note:'Triggered when you or an ally within 60 ft would make Death Save. If this is your sheet your HP increases; otherwise track ally healing on their own sheet. DM confirms nearby enemy Radiant damage and Blinded condition.'};break;
  case 'hurl':requireConfirm();if(sub!=='Fiend Patron'||n<14)failure('Hurl through Hell requires level 14.');if(g.warlockHurlUsed)failure('Hurl through Hell already used this turn.');if(mode==='restore')useSlot();else q=spend(s,'warlock-hurl');g.warlockHurlUsed=true;eff={feature:'Hurl through Hell',target:clean(target),saveDC:dc(s.character),note:'After a confirmed attack hit, Charisma save vs Warlock DC; on failure non-Fiend takes 8d10 Psychic and Incapacitated until end of your next turn. DM decides.'};break;
  case 'mind':requireConfirm();if(sub!=='Great Old One Patron')failure('Great Old One required.');g=budget(s,'bonus');g.warlockMind={target:clean(target),rangeMiles:cha(s.character),minutes:n};eff={feature:'Awakened Mind',note:'Telepathy up to '+cha(s.character)+' miles for '+n+' minutes; both parties must mentally use languages the other understands.'};break;
  case 'clairvoyant':requireConfirm();if(sub!=='Great Old One Patron'||n<6||g.warlockMind?.target!==clean(target))failure('Connect your Awakened Mind to this creature first.');if(mode==='restore')useSlot();else q=spend(s,'warlock-clairvoyant');eff={feature:'Clairvoyant Combat',target:clean(target),saveDC:dc(s.character),note:'Wisdom save; on failure target has disadvantage to attack you and you have Advantage against target while linked. DM confirms save.'};break;
  case 'hex':requireConfirm();if(sub!=='Great Old One Patron'||n<10||!clean(choice))failure('Eldritch Hex requires level 10, a chosen ability and a confirmed Hex target.');g.warlockHex={target:clean(target),ability:choice};eff={feature:'Eldritch Hex',target:clean(target),note:'The Hex target has disadvantage on saves of the chosen ability for the duration of Hex. Confirm you already cast Hex.'};break;
  case 'thrall':requireConfirm();if(sub!=='Great Old One Patron'||n<14)failure('Create Thrall requires level 14.');g.warlockCompanionActive=true;eff={feature:'Create Thrall',note:'If Summon Aberration is cast, you may remove Concentration and give it a 1-minute duration; companion gains '+(n+mod(s.character.scores.cha))+' Temporary HP and its first Hex-target hit on each turn deals extra Psychic damage. DM tracks creature.'};break;
  case 'smite':requireConfirm();if(!has(s.character,'Eldritch Smite')||!f(s).warlockPactWeapon)failure('Eldritch Smite requires an active pact weapon and invocation.');if(g.warlockSmiteUsed)failure('Eldritch Smite already used this turn.');{const lvl=useSlot();const dice=Array.from({length:lvl+1},()=>roll(fn,8));g.warlockSmiteUsed=true;eff={feature:'Eldritch Smite',rolls:dice,damage:dice.reduce((a,b)=>a+b,0),note:'Extra Force damage, plus may make confirmed Huge-or-smaller target Prone; DM confirms attack hit and size.'};}break;
  case 'lifedrinker':requireConfirm();if(!has(s.character,'Lifedrinker')||n<9)failure('Lifedrinker not available.');if(g.warlockLifedrinkerUsed)failure('Lifedrinker used this turn.');g.warlockLifedrinkerUsed=true;{const die=roll(fn,6),type=clean(choice||'Necrotic');if(!['Necrotic','Psychic','Radiant'].includes(type))failure('Select a valid Lifedrinker damage type.');if(mode==='heal'){if(r.hitDice<1)failure('A Hit Die is required for Lifedrinker healing.');const hitDie=roll(fn,8);r.hitDice--;r.hp=Math.min(r.maxHp,r.hp+Math.max(1,hitDie+mod(s.character.scores.con)));}eff={feature:'Lifedrinker',die,damage:die,type,note:'Once per turn on a confirmed pact weapon hit; optional Hit Die expenditure for self-healing.'};}break;
  case 'protectors':requireConfirm();if(!has(s.character,'Gift of the Protectors'))failure('Gift of the Protectors required.');if(!(g.warlockProtectorNames||[]).includes(clean(target)))failure('That creature is not named in your Book of Shadows.');q=spend(s,'warlock-protectors');eff={feature:'Gift of the Protectors',target:clean(target),note:'A creature named in your Book of Shadows drops to 1 HP instead of 0 (unless killed outright); restore all uses after a Long Rest. DM confirms eligibility.'};break;
  case 'depths':if(!has(s.character,'Gift of the Depths'))failure('Gift of the Depths required.');q=spend(s,'warlock-depths');g=budget(s,'action');eff={feature:'Gift of the Depths',note:'Water Breathing free cast; Warlock also gains Swim Speed equal to Speed and can breathe underwater.'};break;
  default:failure('Unknown Warlock feature.');
 }
 return update(s,g,eff,{...r,classResources:q});
}
function eldritchBlast(s,{target='',targetAC=null,confirmed=false,largeOrSmaller=false,mode='normal'}={},fn){
 ensure(s);if(!confirmed||!clean(target))failure('Confirm your Eldritch Blast target.');
 const spell=root.FolioSpellRules?.catalog?.().find(x=>x.name==='Eldritch Blast');
 if(!spell||(s.spellbook?.catalogSelections||[]).every(x=>x!==spell.key))failure('Select Eldritch Blast as a known Warlock cantrip in the Spellbook first.');
 if(!['normal','advantage','disadvantage'].includes(mode))failure('Invalid attack roll mode.');
 if(targetAC!==null&&!int(targetAC,1,50))failure('Confirm a valid AC or leave it unknown.');
 let g=budget(s,'action');const n=level(s.character),count=n>=17?4:n>=11?3:n>=5?2:1;
 const selected=name=>(s.character.build?.warlockInvocations||[]).some(v=>v===''+name+'::Eldritch Blast');
 const agonizing=selected('Agonizing Blast'),push=selected('Repelling Blast'),range=120+(selected('Eldritch Spear')?30*n:0);
 const bonus=mod(s.character.scores.cha)+2+Math.floor((n-1)/4),hits=[];
 for(let i=0;i<count;i++){
  const dice=[roll(fn,20),...(mode==='normal'?[]:[roll(fn,20)])],d20=mode==='advantage'?Math.max(...dice):mode==='disadvantage'?Math.min(...dice):dice[0];
  const total=d20+bonus,hit=targetAC===null?null:d20===20||d20!==1&&total>=targetAC;
  const damageDie=hit===false?null:roll(fn,10);const potentialDamage=damageDie==null?0:damageDie+(agonizing?mod(s.character.scores.cha):0);
  hits.push({d20,dice,total,hit,damageDie,potentialDamage,damage:hit===true?potentialDamage:null,pushFeet:hit===true&&push&&largeOrSmaller?10:0});
 }
 g.warlockLastBlast={target:clean(target),hits};
 return update(s,g,{feature:'Eldritch Blast',target:clean(target),range,attackBonus:bonus,beams:count,hits,agonizing,repelling:push,note:'Each beam makes a separate spell attack. Damage is only assigned on a confirmed hit; Repelling Blast push needs a confirmed Large-or-smaller target. Spellbook casting still records the cantrip separately.'});
}
function protectorsNames(s,names){ensure(s,9);if(!has(s.character,'Gift of the Protectors'))failure('Gift of the Protectors required.');if(!Array.isArray(names)||names.length>cha(s.character)||new Set(names.map(clean)).size!==names.length||names.some(x=>!clean(x)))failure('Provide up to Charisma modifier distinct named creatures.');return update(s,{...f(s),warlockProtectorNames:names.map(clean)}, {feature:'Gift of the Protectors',note:'Names written in the Book of Shadows; each eligible creature may be protected once per Long Rest.'});}
function chain(s,{form='',confirmed=false}={}){ensure(s);if(!has(s.character,'Pact of the Chain'))failure('Pact of the Chain required.');if(!['Imp','Pseudodragon','Quasit','Skeleton','Slaad Tadpole','Sphinx of Wonder','Sprite','Venomous Snake','Standard Familiar'].includes(form))failure('Choose a PHB familiar form.');if(!confirmed)failure('Confirm Find Familiar casting with your rules source.');return update(s,{...f(s),warlockFamiliar:{form,invocationInvestment:has(s.character,'Investment of the Chain Master')}},{feature:'Pact of the Chain',form,note:'Familiar tracks creature stats separately. Pact allows its attack with your Attack action replacement; Investment adds Bonus Action command, 40-ft flight/swim speed, damage-type choice, save DC and resistance Reaction.'});}
function gaze(s,{target='',confirmed=false,maintain=false}={}){ensure(s,5);if(!has(s.character,'Gaze of Two Minds'))failure('Gaze of Two Minds invocation required.');if(maintain){if(!f(s).warlockGazeActive||!confirmed||f(s).warlockGazeTarget!==clean(target))failure('Confirm the existing willing link on the same plane before maintaining it.');}else if(!confirmed||!clean(target))failure('Confirm a willing touched creature on the same plane.');const g=budget(s,'bonus');g.warlockGazeActive=true;g.warlockGazeTarget=clean(target);return update(s,g,{feature:maintain?'Gaze of Two Minds · maintained':'Gaze of Two Minds',note:maintain?'Bonus Action maintained the existing telepathic connection through the end of next turn.':'Perceive through willing creature until end of next turn. Spells may originate from its position if within 60 feet, as adjudicated by the DM.'});}

root.FolioWarlock2024={isWarlock,subclass,patron,cha,dc,SLOTS,INVOCATIONS,has,granted,resourcesFor,choose,tome,recordCast,pactWeapon,eldritchBlast,protectorsNames,chain,gaze,action,newTurn,restState,restEffect};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioWarlock2024;
})(typeof window!=='undefined'?window:globalThis);
