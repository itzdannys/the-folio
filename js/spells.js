/* 2024 Paladin level 1–2 preparation catalogue, with extra grants from Pip's sheet.
   Short, original table summaries; full official rules remain in the books.
   Class spell list: https://www.dndbeyond.com/sources/dnd/br-2024/character-classes#PaladinSpellList */
(function(root){'use strict';
const V='Damage/Offense',H='Healing',D='Defense/Protection',B='Buff/Support',E='Debuff',C='Control',M='Movement',I='Detection/Information',S='Social',X='Exploration/Utility';
const extra=[
 ['compelled-duel','Compelled Duel',1,'Enchantment','Bonus Action','30 ft','Concentration · 1 min','V',[C,E,D],'Wisdom save','A creature that fails its Wisdom save is challenged to focus on you. It has trouble attacking others, and its movement away from you is limited.','The effect can end if you attack another creature or your allies harm the target.'],
 ['cure-wounds','Cure Wounds',1,'Abjuration','Action','Touch','Instant','V, S',[H],'Automatic','Restore 2d8 + your spellcasting modifier HP to a creature you touch.','Add 2d8 healing per slot above level 1.'],
 ['detect-evil-and-good','Detect Evil and Good',1,'Divination','Action','Self (30 ft)','Concentration · 10 min','V, S',[I,X],'Automatic','Sense the presence and location of certain supernatural creature types and consecrated or desecrated places nearby.','Blocked by some barriers; not a general alignment detector.'],
 ['detect-magic','Detect Magic',1,'Divination','Action or ritual','Self (30 ft)','Concentration · 10 min','V, S',[I,X],'Automatic','Sense magic nearby and study visible auras to learn the school of magic.','Ritual casting adds 10 minutes and spends no slot.'],
 ['detect-poison-and-disease','Detect Poison and Disease',1,'Divination','Action or ritual','Self (30 ft)','Concentration · 10 min','V, S, M',[I,X],'Automatic','Locate and identify poisons, poisonous creatures, and diseases nearby.','Ritual option; some barriers block detection.'],
 ['heroism','Heroism',1,'Enchantment','Action','Touch','Concentration · 1 min','V, S',[B,D],'Automatic','A willing creature is immune to Frightened and gains temporary HP at the start of each turn.','Temporary HP equal to your spellcasting modifier; more targets with higher slots.'],
 ['protection-from-evil-and-good','Protection from Evil and Good',1,'Abjuration','Action','Touch','Concentration · 10 min','V, S, M',[D,B],'Automatic','Protect a willing creature against certain supernatural creature types, making it harder for them to attack or influence the target.','Requires holy water or powdered silver and iron, consumed by the spell.'],
 ['purify-food-and-drink','Purify Food and Drink',1,'Transmutation','Action or ritual','10 ft (5-ft sphere)','Instant','V, S',[X],'Automatic','Remove poison and spoilage from nonmagical food and drink in the area.','Ritual option; does not purify magical substances.'],
 ['searing-smite','Searing Smite',1,'Evocation','Bonus Action after melee hit','Self','1 min','V',[V,E],'Triggered rider + Constitution save','On a melee hit, add 1d6 Fire. Target burns for 1d6 at the start of each turn, then saves to end the burning.','All Fire damage dice increase by 1d6 per slot above level 1.'],
 ['wrathful-smite','Wrathful Smite',1,'Necromancy','Bonus Action after melee hit','Self','1 min','V',[V,E,C],'Triggered rider + Wisdom save','A melee hit deals +1d6 Necrotic and forces a Wisdom save or Frightened; it repeats the save at the end of each turn.','Damage increases by 1d6 per slot above level 1.'],
 ['gentle-repose','Gentle Repose',2,'Necromancy','Action or ritual','Touch','10 days','V, S, M',[X,D],'Automatic','Preserve a corpse against decay and undeath and extend the time window for possible revival.','Ritual option; needs copper pieces placed over the eyes.'],
 ['locate-object','Locate Object',2,'Divination','Action','Self (1,000 ft)','Concentration · 10 min','V, S, M',[I,X],'Automatic','Sense the direction of a familiar or specifically described object within range.','Lead can block detection; moving water and other obstacles matter.'],
 ['magic-weapon','Magic Weapon',2,'Transmutation','Bonus Action','Touch','1 hour','V, S',[B,V],'Automatic','Make a nonmagical weapon a magic weapon with +1 to attack and damage rolls for the duration.','At higher slots the bonus improves.'],
 ['protection-from-poison','Protection from Poison',2,'Abjuration','Action','Touch','1 hour','V, S',[D,H],'Automatic','Remove Poisoned from a target. For the duration it gains poison resistance and advantage on saves against being Poisoned.','No concentration.'],
 ['shining-smite','Shining Smite',2,'Transmutation','Bonus Action after melee hit','Self','Concentration · 1 min','V',[V,E,B],'Triggered rider','Add 2d6 Radiant to a melee hit. The creature glows, cannot benefit from Invisible, and attacks against it have advantage.','Damage +1d6 for each slot above level 2.'],
 ['warding-bond','Warding Bond',2,'Abjuration','Action','Touch','1 hour','V, S, M',[D,B],'Automatic','Grant an ally +1 AC, +1 to saves and resistance to damage while nearby; you take the same damage they take.','Requires paired platinum rings; the bond ends if you separate too far.'],
 ['zone-of-truth','Zone of Truth',2,'Enchantment','Action','60 ft (15-ft sphere)','10 min','V, S',[S,C,I],'Charisma save','Creatures in the zone save against being unable to tell deliberate lies; you know who succeeds or fails.','They can evade answers or remain silent.']
];
const metadata={
 'bless':['Enchantment','V, S, M',[B,D],'Automatic','Concentration · 1 min','Each of up to three creatures adds 1d4 to attacks and saves. More targets with higher slots.'],
 'command':['Enchantment','V',[C,E,S],'Wisdom save','Instant','Failed save compels one brief command next turn; extra target per slot above level 1.'],
 'divine-favor':['Transmutation','V, S',[V,B],'Automatic','1 min','Each weapon hit adds 1d4 Radiant, no concentration.'],
 'shield-of-faith':['Abjuration','V, S, M',[D,B],'Automatic','Concentration · 10 min','Target gains +2 AC while you maintain concentration.'],
 'aid':['Abjuration','V, S, M',[H,B,D],'Automatic','8 hours','Up to three creatures gain +5 current and maximum HP for 8 hours; higher slots add +5 more per level.'],
 'prayer-of-healing':['Abjuration','V',[H,B],'Automatic','Instant','Up to five creatures heal 2d8 and each receives a Short Rest benefit once per Long Rest.'],
 'lesser-restoration':['Abjuration','V, S',[H,D],'Automatic','Instant','End Blinded, Deafened, Paralyzed or Poisoned on a target.'],
 'divine-smite':['Evocation','V',[V],'Triggered rider','Instant','After a qualifying melee hit on your turn, add 2d8 Radiant, plus an extra 1d8 against a Fiend or Undead.'],
 'find-steed':['Conjuration','V, S',[M,X,B],'Automatic','Instant','Summon an otherworldly mount. Paladin grants one free casting per Long Rest.'],
 'elementalism':['Transmutation','V, S',[X,S],'Automatic','Instant','Minor air, earth, fire or water effects for style, information and utility.'],
 'chromatic-orb':['Evocation','V, S, M (50 GP diamond, not consumed)',[V],'Spell attack','Instant','On a hit, 3d8 chosen elemental damage. Matching damage dice can let the orb leap to another creature.'],
 'thunderous-smite':['Evocation','V',[V,C],'Triggered rider + Strength save','Instant','After a qualifying hit add 2d6 Thunder; failed Strength save knocks prone and pushes 10 ft.'],
 'mirror-image':['Illusion','V, S',[D],'Automatic','1 min','Three illusory copies can divert attacks without concentration.'],
 'phantasmal-force':['Illusion','V, S, M',[C,E,V],'Intelligence save','Concentration · 1 min','Failed Intelligence save traps a creature in a private illusion; a fitting hazard can deal 2d8 Psychic.'],
 'hunters-mark':['Divination','V',[V,I],'Automatic','Concentration · 1 hour','Mark one visible enemy; attack-roll hits against it add 1d6 Force; track it with advantage.'],
 'misty-step':['Conjuration','V',[M,D],'Automatic','Instant','Teleport up to 30 ft to an unoccupied visible space.']
};
const all=[...root.PipData.spells.map(x=>{
 const [school,components,tags,resolution,duration,summary]=metadata[x.id];
 return {...x,school,components,tags,resolution,concentration:duration.toLowerCase().includes('concentration'),ritual:false,duration,short:summary||x.short,origin:x.source.startsWith('Prepared')?'paladin':'grant'};
}),...extra.map(([id,name,level,school,time,range,duration,components,tags,resolution,short,detail])=>({id,name,level,school,time,range,duration,components,tags,resolution,short,detail,source:'Paladin list',origin:'paladin',concentration:duration.toLowerCase().includes('concentration'),ritual:time.includes('ritual')}))];
const allMap=new Map(all.map(x=>[x.id,x]));
const paladinIds=all.filter(x=>x.origin==='paladin'||['divine-smite','find-steed','thunderous-smite'].includes(x.id)).map(x=>x.id);
const initialPrepared=['bless','command','divine-favor','shield-of-faith','aid','prayer-of-healing','lesser-restoration'];
const grants=['divine-smite','find-steed','elementalism','chromatic-orb','thunderous-smite','mirror-image','phantasmal-force','hunters-mark','misty-step'];
const freeKeys={'divine-smite':'freeDivineSmite','find-steed':'freeFindSteed','hunters-mark':'freeHuntersMark','misty-step':'freeMistyStep'};
const maxPrepared=7;
function newBook(){return {prepared:[...initialPrepared],queued:[],favorites:[],custom:[],castLog:[],loadouts:[],catalogSelections:[],catalogPending:null,catalogQueued:[],catalogLevelUpQueued:[]};}
function activeSpells(book){return [...new Set([...book.prepared,...grants,...book.custom.filter(x=>x.alwaysPrepared).map(x=>x.id)])];}
function spell(id,book){return allMap.get(id)||(book?.custom||[]).find(x=>x.id===id)||root.FolioSpellRules?.getSpell(id,book)||null;}
function eligible(id){if(paladinIds.includes(id))return true;const sp=root.FolioSpellRules?.getSpell(id);return !!sp&&(sp.classes||[]).includes('Paladin');}
function isGranted(id){return grants.includes(id);}
function queueSwap(book,from,to){
 if(!book.prepared.includes(from)||!eligible(to)||book.prepared.includes(to)||from===to||isGranted(to)||!spell(to,book)||spell(to,book).level>2)throw Error('Choose a prepared spell and a different eligible level 1–2 replacement.');
 if(book.queued.some(x=>x.from===from)||book.queued.some(x=>x.to===to))throw Error('That spell already has a queued change.');
 return {...book,queued:[...book.queued,{from,to}]};
}
function applyOneSwap(book){if(!book.queued.length)return book;const [next,...rest]=book.queued;return {...book,prepared:book.prepared.map(x=>x===next.from?next.to:x),queued:rest};}
function castOptions(id,book,resources){const s=spell(id,book);if(!s||!activeSpells(book).includes(id))return [];if(s.level===0)return [{key:'cantrip',label:'Cantrip (no slot)',cost:0}];const choices=[];if(s.ritual)choices.push({key:'ritual',label:'Ritual (10 extra minutes, no slot)',cost:0});
 const free=freeKeys[id];if(free&&resources[free]>0)choices.push({key:free,label:'Free use',cost:0});
 for(const level of [1,2])if(level>=s.level&&resources['slots'+level]>0)choices.push({key:'slots'+level,label:`Level ${level} slot`,cost:level});return choices;}
function cast(book,resources,id,cost){const s=spell(id,book),option=castOptions(id,book,resources).find(x=>x.key===cost);if(!option)throw Error('That casting cost is not available.');const changed={...resources};if(cost!=='cantrip'&&cost!=='ritual')changed[cost]--;
 if(s.concentration){changed.concentration=s.name;changed.lastConcentrationDC=null;}return {book:{...book,castLog:[...(book.castLog||[]).slice(-39),{id,cost,at:new Date().toISOString()}]},resources:changed};}

function saveLoadout(book,name,id){const title=String(name).trim();if(!title||title.length>60)throw Error('Choose a short loadout name.');return {...book,loadouts:[...(book.loadouts||[]),{id,name:title,spells:[...book.prepared]}]};}
function planLoadout(book,id){const target=(book.loadouts||[]).find(x=>x.id===id);if(!target)throw Error('Saved loadout not found.');if(book.queued.length)throw Error('Clear existing queued swaps before planning a saved loadout.');
 const outgoing=book.prepared.filter(x=>!target.spells.includes(x)),incoming=target.spells.filter(x=>!book.prepared.includes(x));
 if(target.spells.length!==maxPrepared||new Set(target.spells).size!==maxPrepared||incoming.some(x=>!eligible(x)||isGranted(x)||!spell(x,book)||spell(x,book).level>2))throw Error('This loadout contains invalid or duplicate prepared spells.');
 if(outgoing.length!==incoming.length)throw Error('Loadout preparations are incomplete.');
 return {...book,queued:outgoing.map((from,i)=>({from,to:incoming[i]}))};}
root.PipSpells={all,allMap,paladinIds,initialPrepared,grants,freeKeys,maxPrepared,spell,newBook,activeSpells,eligible,isGranted,queueSwap,applyOneSwap,saveLoadout,planLoadout,castOptions,cast,tags:[V,H,D,B,E,C,M,I,S,X]};
if(typeof module!=='undefined'&&module.exports)module.exports=root.PipSpells;
})(typeof window!=='undefined'?window:globalThis);
