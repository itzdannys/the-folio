(function(root){'use strict';
// 2024/5.5e origins and feats: compact original catalogue metadata, not a
// reproduction of proprietary rulebook chapters. Free rules: PHB 24.
// PHB-only entries have selection metadata but reference-only details;
// they must not be presented as possessing full proprietary rules text.
const SRC='https://www.dndbeyond.com/sources/dnd/br-2024/';
const PHB='https://www.dndbeyond.com/posts/1785-the-backgrounds-and-origin-feats-in-the-2024';
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const BASE=[
 ['Acolyte','int wis cha','Insight|Religion','Calligrapher’s Supplies','Magic Initiate (Cleric)'],
 ['Artisan','str dex int','Investigation|Persuasion','Artisan’s Tools (choose)','Crafter'],
 ['Charlatan','dex con cha','Deception|Sleight of Hand','Forgery Kit','Skilled'],
 ['Criminal','dex con int','Sleight of Hand|Stealth','Thieves’ Tools','Alert'],
 ['Entertainer','str dex cha','Acrobatics|Performance','Musical Instrument (choose)','Musician'],
 ['Farmer','str con wis','Animal Handling|Nature','Carpenter’s Tools','Tough'],
 ['Guard','str int wis','Athletics|Perception','Gaming Set (choose)','Alert'],
 ['Guide','dex con wis','Stealth|Survival','Cartographer’s Tools','Magic Initiate (Druid)'],
 ['Hermit','con wis cha','Medicine|Religion','Herbalism Kit','Healer'],
 ['Merchant','con int cha','Animal Handling|Persuasion','Navigator’s Tools','Lucky'],
 ['Noble','str int cha','History|Persuasion','Gaming Set (choose)','Skilled'],
 ['Sage','con int wis','Arcana|History','Calligrapher’s Supplies','Magic Initiate (Wizard)'],
 ['Sailor','str dex wis','Acrobatics|Perception','Navigator’s Tools','Tavern Brawler'],
 ['Scribe','dex int wis','Investigation|Perception','Calligrapher’s Supplies','Skilled'],
 ['Soldier','str dex con','Athletics|Intimidation','Gaming Set (choose)','Savage Attacker'],
 ['Wayfarer','dex wis cha','Insight|Stealth','Thieves’ Tools','Lucky']
];
const openBgs=new Set(['Acolyte','Criminal','Sage','Soldier']);
const backgrounds=BASE.map(([name,abilities,skills,tool,feat])=>({
 id:'background:'+slug(name),kind:'background',name,abilities:abilities.split(' '),skills:skills.split('|'),tool,feat,
 official:true,sourceId:openBgs.has(name)?'srd-2024':'phb-2024',
 implementation:openBgs.has(name)?'partially automated':'reference only',sourceUrl:openBgs.has(name)?SRC+'character-origins':PHB,
 description:`${skills.replace('|',' & ')} · ${feat} · ${tool}`,
 // All 16 have verified structured selection metadata. Interactive mechanics are implemented in origin-2024.js.
 details:`Background abilities: ${abilities.toUpperCase().replace(/ /g, ', ')}. Origin feat: ${feat}. Tool: ${tool}. Choose the standard starting package or 50 GP in the builder.`
}));
// Catalog details are original brief pointers; source URLs lead to actual rules.
const DATA=[
 ['Ability Score Improvement','General',4,'Choose +2 to one score or +1 to two (max 20); repeatable.','srd-2024','',true],
 ['Alert','Origin',1,'Add proficiency bonus to Initiative; may trade initiative with a willing ally immediately after rolling.','srd-2024'],
 ['Archery','Fighting Style',1,'+2 to attack rolls with ranged weapons, if you have the Fighting Style feature.','srd-2024','Fighting Style'],
 ['Boon of Combat Prowess','Epic Boon',19,'Once per turn turn a missed attack into a hit; includes a selectable +1 ability.','srd-2024'],
 ['Boon of Dimensional Travel','Epic Boon',19,'Teleport after Attack or Magic action; includes a selectable +1 ability.','srd-2024'],
 ['Boon of Fate','Epic Boon',19,'Adjust an eligible D20 Test by rolling 2d4, subject to recharge; includes a +1 ability.','srd-2024'],
 ['Boon of Irresistible Offense','Epic Boon',19,'Bypass resistance to physical weapon damage types and enhance critical hits.','srd-2024'],
 ['Boon of the Night Spirit','Epic Boon',19,'Gain a conditional shadow concealment feature and resistances in dim light or darkness.','srd-2024'],
 ['Boon of Spell Recall','Epic Boon',19,'Chance to retain a level 1–4 spell slot when casting with it.','srd-2024','Spellcasting'],
 ['Boon of Truesight','Epic Boon',19,'Grants Truesight to 60 feet; includes a selectable +1 ability.','srd-2024'],
 ['Defense','Fighting Style',1,'+1 AC while wearing light, medium or heavy armor.','srd-2024','Fighting Style'],
 ['Blind Fighting','Fighting Style',1,'Blindsight within 10 feet; creature detection is table-confirmed.','phb-2024','Fighting Style'],
 ['Dueling','Fighting Style',1,'+2 damage when holding one Melee weapon in one hand and no other weapons.','phb-2024','Fighting Style'],
 ['Interception','Fighting Style',1,'Reaction to reduce damage from an attack against a nearby creature by 1d10 + proficiency while holding a weapon or shield.','phb-2024','Fighting Style'],
 ['Protection','Fighting Style',1,'Reaction with a Shield to protect a nearby ally from a visible attacker until your next turn.','phb-2024','Fighting Style'],
 ['Thrown Weapon Fighting','Fighting Style',1,'+2 damage when hitting with a ranged attack using a weapon with the Thrown property.','phb-2024','Fighting Style'],
 ['Unarmed Fighting','Fighting Style',1,'Unarmed damage uses 1d6 plus Strength or 1d8 without a weapon or shield; may damage a grappled creature at turn start.','phb-2024','Fighting Style'],
 ['Druidic Warrior','Fighting Style',2,'Ranger-only alternative; learn two Druid cantrips (Wisdom), change one on Ranger level-up.','phb-2024','RangerOnly'],
 ['Blessed Warrior','Fighting Style',2,'Paladin class option instead of a Fighting Style feat: choose two Cleric cantrips, using Charisma; one may change on gaining a Paladin level.','phb-2024','PaladinOnly'],
 ['Grappler','General',4,'Improved grapple-and-strike interactions; requires STR or DEX 13+.','srd-2024','StrDex13'],
 ['Great Weapon Fighting','Fighting Style',1,'Treat 1 or 2 on qualifying two-handed melee weapon damage dice as 3.','srd-2024','Fighting Style'],
 ['Magic Initiate (Cleric)','Origin',1,'Select two Cleric cantrips and one level-1 spell; use its free daily casting and prepared options.','srd-2024','',true],
 ['Magic Initiate (Druid)','Origin',1,'Select two Druid cantrips and one level-1 spell; use its free daily casting and prepared options.','srd-2024','',true],
 ['Magic Initiate (Wizard)','Origin',1,'Select two Wizard cantrips and one level-1 spell; use its free daily casting and prepared options.','srd-2024','',true],
 ['Savage Attacker','Origin',1,'Once per turn reroll a weapon’s damage dice for an attack and use either result.','srd-2024'],
 ['Skilled','Origin',1,'Gain three skills or tool proficiencies, chosen by the player; repeatable.','srd-2024','',true],
 ['Two-Weapon Fighting','Fighting Style',1,'Add the ability modifier to qualifying Light-weapon extra-attack damage.','srd-2024','Fighting Style'],
 ['Crafter','Origin',1,'A crafting-focused Origin feat with tool proficiency and purchasing benefits. Consult the PHB.','phb-2024'],
 ['Healer','Origin',1,'Support healing and medical care using the feat’s particular action rules. Consult the PHB.','phb-2024'],
 ['Lucky','Origin',1,'A limited pool of luck-based benefits. Consult the PHB for uses and recovery.','phb-2024'],
 ['Musician','Origin',1,'Musical proficiency and a rest-based team benefit. Consult the PHB.','phb-2024'],
 ['Tavern Brawler','Origin',1,'Improved unarmed combat and improvised-weapon utility. Consult the PHB.','phb-2024'],
 ['Tough','Origin',1,'Hit point maximum increases by 2 per character level; automated in the neutral builder.','phb-2024']
];

// Remaining 2024 PHB General Feats (chapter 5, pp. 202–209).
// Concise feature summaries for character-sheet use; consult PHB 24 for adjudication.
const GENERAL_2024=[
 ['Actor','cha','cha13','Improve CHA; imitate voices and gain advantages while impersonating a persona.'],
 ['Athlete','str dex','strDex13','Improve STR/DEX; climb at full speed, stand from Prone for 5 ft, jump with a 5-ft run-up.'],
 ['Charger','str dex','strDex13','Improve STR/DEX; stronger Dash and once-per-turn charge damage or shove.'],
 ['Chef','con wis','','Improve CON/WIS; Cook’s Utensils, meals on Short Rest, and temporary-HP treats.'],
 ['Crossbow Expert','dex','dex13','Improve DEX; load and fire crossbows effectively, including close-range and off-hand use.'],
 ['Crusher','str con','','Improve STR/CON; once-per-turn bludgeoning push and stronger bludgeoning critical hits.'],
 ['Defensive Duelist','dex','dex13','Improve DEX; Reaction with a Finesse weapon to parry a melee attack.'],
 ['Dual Wielder','str dex','strDex13','Improve STR/DEX; Bonus Action off-hand attack and draw or stow two weapons.'],
 ['Durable','con','','Improve CON; advantage on death saves and a Hit Die-powered Bonus Action recovery.'],
 ['Elemental Adept','int wis cha','casting','Improve casting ability; choose elemental damage type, ignore resistance and treat 1s as 2s.'],
 ['Fey-Touched','int wis cha','','Improve INT/WIS/CHA; Misty Step plus one divination/enchantment level-1 spell, free daily casts.'],
 ['Great Weapon Master','str','str13','Improve STR; add Proficiency Bonus to eligible Heavy weapon attacks and make a Bonus Action attack on crit/kill.'],
 ['Heavily Armored','str con','mediumArmor','Improve STR/CON; gain Heavy armor training.'],
 ['Heavy Armor Master','str con','heavyArmor','Improve STR/CON; reduce damage from attacks while wearing Heavy armor.'],
 ['Inspiring Leader','wis cha','wisCha13','Improve WIS/CHA; after rests grant temporary HP to your allies.'],
 ['Keen Mind','int','int13','Improve INT; Investigation, Arcana, History or Nature expertise and better recall.'],
 ['Lightly Armored','str dex','','Improve STR/DEX; gain Light armor and Shield training.'],
 ['Mage Slayer','str dex','','Improve STR/DEX; disrupt spellcasters and protect a failed mental saving throw once per rest.'],
 ['Medium Armor Master','str dex','mediumArmor','Improve STR/DEX; enhanced Dexterity contribution to Medium armor AC.'],
 ['Moderately Armored','str dex','lightArmor','Improve STR/DEX; gain Medium armor training.'],
 ['Mounted Combatant','str dex wis','','Improve STR/DEX/WIS; advantage against smaller unmounted creatures; redirect attacks and evade on your mount.'],
 ['Observant','int wis','intWis13','Improve INT/WIS; improve Perception or Insight and rapid Search action.'],
 ['Piercer','str dex','','Improve STR/DEX; reroll piercing damage once per turn and extra die on piercing critical.'],
 ['Poisoner','dex int','','Improve DEX/INT; Poisoner’s Kit, ignore poison resistance and create weapon poison.'],
 ['Polearm Master','str dex','strDex13','Improve STR/DEX; Bonus Action butt-end attack and opportunity attacks on entry.'],
 ['Resilient','str dex con int wis cha','','Improve an ability; gain proficiency with its saving throw.'],
 ['Ritual Caster','int wis cha','castingStat13','Improve a mental ability; choose rituals and cast faster once per Long Rest.'],
 ['Sentinel','str dex','strDex13','Improve STR/DEX; stop enemies with Opportunity Attacks, defend nearby allies.'],
 ['Shadow-Touched','int wis cha','','Improve INT/WIS/CHA; Invisibility plus one illusion/necromancy level-1 spell, free daily casts.'],
 ['Sharpshooter','dex','dex13','Improve DEX; ranged weapon attacks ignore most cover and long-range penalties.'],
 ['Shield Master','str','shieldArmor','Improve STR; Shield Bash once per turn and defensive Reaction on successful Dexterity save.'],
 ['Skill Expert','str dex con int wis cha','','Improve an ability; choose one skill proficiency and another skill for Expertise.'],
 ['Skulker','dex','dex13','Improve DEX; Blindsight 10 ft, combat hiding benefits, misses do not reveal you.'],
 ['Slasher','str dex','','Improve STR/DEX; once-per-turn speed reduction with slashing and penalties on slashing critical.'],
 ['Speedy','dex con','dexCon13','Improve DEX/CON; +10 ft speed, Dash through difficult terrain, better mobility.'],
 ['Spell Sniper','int wis cha','casting','Improve mental ability; spell attack range, melee safety and cover bypass.'],
 ['Telekinetic','int wis cha','','Improve a mental ability; invisible Mage Hand and telekinetic shove Bonus Action.'],
 ['Telepathic','int wis cha','','Improve a mental ability; telepathy and free Detect Thoughts once per Long Rest.'],
 ['War Caster','int wis cha','casting','Improve mental ability; concentration advantage, somatic casting while armed and spell opportunity attacks.'],
 ['Weapon Master','str dex','','Improve STR/DEX; choose a weapon mastery property training.']
];
const EPIC_2024=[
 ['Boon of Energy Resistance','Choose two elemental resistances; reactionary energy discharge.', ''],
 ['Boon of Fortitude','Increase maximum HP by 40 and gain healing benefits.', ''],
 ['Boon of Recovery','Recover from dropping to 0 HP and improve recovery.', ''],
 ['Boon of Skill','Skill expertise and proficiency across all skills.', ''],
 ['Boon of Speed','Increase speed by 30 ft and enhance mobility.', '']
];
for(const [name,abilities,requires,details] of GENERAL_2024)
 DATA.push([name,'General',4,details,'phb-2024',requires]);
for(const [name,details,requires] of EPIC_2024)
 DATA.push([name,'Epic Boon',19,details,'phb-2024',requires]);
const GENERAL_ABILITIES=Object.fromEntries(GENERAL_2024.map(([name,abilities])=>[name,abilities.split(' ')]));
GENERAL_ABILITIES['Grappler']=['str','dex'];
const EPIC_ABILITY_EXCEPTIONS={'Boon of Irresistible Offense':['str','dex'],'Boon of Spell Recall':['int','wis','cha']};
const EPIC_ABILITY_ALL=['str','dex','con','int','wis','cha'];
const REPEATABLE=new Set(['Elemental Adept']);
const featId=name=>name==='Defense'?'feat:fighting-style-defense':name==='Two-Weapon Fighting'?'feat:fighting-style-two-weapon-fighting':'feat:'+slug(name);
const feats=DATA.map(([name,category,minLevel,details,sourceId,requires='',repeatable=false])=>({
 id:featId(name),kind:'feat',name:category==='Fighting Style'?'Fighting Style: '+name:name,category,minLevel,
 sourceId,implementation:sourceId==='srd-2024'?'partially automated':'reference only',
 official:true,requires,repeatable:repeatable||REPEATABLE.has(name),abilityChoices:category==='General'?(GENERAL_ABILITIES[name]||[]):category==='Epic Boon'?(EPIC_ABILITY_EXCEPTIONS[name]||EPIC_ABILITY_ALL):[],sourceUrl:sourceId==='srd-2024'?SRC+'feats':PHB,
 description:`${category} · ${details}`,details
}));
// PHB 24 p.177–185 starting equipment (compact item names and quantities;
// no proprietary item text). All backgrounds alternatively grant 50 GP.
const EQUIPMENT={
 Acolyte:{gp:8,items:[['Calligrapher’s Supplies',1],['Book (prayers)',1],['Holy Symbol',1],['Parchment',10],['Robe',1]]},
 Artisan:{gp:32,items:[['Chosen tool',1],['Pouch',2],["Traveler's Clothes",1]]},
 Charlatan:{gp:15,items:[['Forgery Kit',1],['Costume',1],['Fine Clothes',1]]},
 Criminal:{gp:15,items:[['Dagger',2],["Thieves’ Tools",1],['Crowbar',1],['Pouch',2],["Traveler's Clothes",1]]},
 Entertainer:{gp:11,items:[['Chosen instrument',1],['Costume',2],['Mirror',1],['Perfume',1],["Traveler's Clothes",1]]},
 Farmer:{gp:30,items:[['Sickle',1],["Carpenter’s Tools",1],["Healer’s Kit",1],['Iron Pot',1],['Shovel',1],["Traveler's Clothes",1]]},
 Guard:{gp:12,items:[['Spear',1],['Light Crossbow',1],['Bolt',20],['Chosen gaming set',1],['Hooded Lantern',1],['Manacles',1],['Quiver',1],["Traveler's Clothes",1]]},
 Guide:{gp:3,items:[['Shortbow',1],['Arrow',20],["Cartographer’s Tools",1],['Bedroll',1],['Quiver',1],['Tent',1],["Traveler's Clothes",1]]},
 Hermit:{gp:15,items:[['Quarterstaff',1],['Herbalism Kit',1],['Bedroll',1],['Book (philosophy)',1],['Lamp',1],['Oil (flask)',3],["Traveler's Clothes",1]]},
 Merchant:{gp:22,items:[["Navigator’s Tools",1],['Pouch',2],["Traveler's Clothes",1]]},
 Noble:{gp:29,items:[['Chosen gaming set',1],['Fine Clothes',1],['Perfume',1]]},
 Sage:{gp:8,items:[['Quarterstaff',1],["Calligrapher’s Supplies",1],['Book (history)',1],['Parchment',8],['Robe',1]]},
 Sailor:{gp:20,items:[['Dagger',1],["Navigator’s Tools",1],['Rope',1],["Traveler's Clothes",1]]},
 Scribe:{gp:23,items:[["Calligrapher’s Supplies",1],['Fine Clothes',1],['Lamp',1],['Oil (flask)',3],['Parchment',12]]},
 Soldier:{gp:14,items:[['Spear',1],['Shortbow',1],['Arrow',20],['Chosen gaming set',1],["Healer’s Kit",1],['Quiver',1],["Traveler's Clothes",1]]},
 Wayfarer:{gp:15,items:[['Dagger',2],["Thieves’ Tools",1],['Gaming Set',1],['Bedroll',1],['Pouch',2],["Traveler's Clothes",1]]}
};
for(const b of backgrounds){const pack=EQUIPMENT[b.name];if(pack){b.equipmentA=pack.items;b.equipmentGp=pack.gp;b.equipmentB=50;b.implementation='interactive';b.details+=` Starting equipment: set A (${pack.gp} GP + items) or set B (50 GP).`;}}
const FAST_CRAFT={
 'Ladder':'Carpenter’s Tools','Torch':'Carpenter’s Tools','Case':'Leatherworker’s Tools','Pouch':'Leatherworker’s Tools',
 'Block and Tackle':'Mason’s Tools','Jug':'Potter’s Tools','Lamp':'Potter’s Tools','Ball Bearings':'Smith’s Tools',
 'Bucket':'Smith’s Tools','Caltrops':'Smith’s Tools','Grappling Hook':'Smith’s Tools','Iron Pot':'Smith’s Tools',
 'Bell':'Tinker’s Tools','Shovel':'Tinker’s Tools','Tinderbox':'Tinker’s Tools','Basket':'Weaver’s Tools',
 'Rope':'Weaver’s Tools','Net':'Weaver’s Tools','Tent':'Weaver’s Tools','Club':'Woodcarver’s Tools',
 'Greatclub':'Woodcarver’s Tools','Quarterstaff':'Woodcarver’s Tools'
};
function validateFeat(feat,{level=1,characterClass='',scores={},subclass='',granted=[],armorTraining=[]}={}){
 if(!feat||!feat.official||!feat.category)return '';
 if(level<feat.minLevel)return `${feat.name} requires level ${feat.minLevel} or higher.`;
 const req=feat.requires||'',ability=k=>Number(scores?.[k]||0)>=13;
 if(req==='RangerOnly'&&!(characterClass==='Ranger'&&level>=2))return 'Druidic Warrior requires Ranger level 2 or higher.';
 if(req==='PaladinOnly'&&!(characterClass==='Paladin'&&level>=2))return 'Blessed Warrior is a Paladin-only Fighting Style alternative at level 2.';
 if((req==='StrDex13'||req==='strDex13')&&!['str','dex'].some(ability))return `${feat.name} requires Strength or Dexterity 13 or higher.`;
 for(const [key,abilities,message] of [
  ['cha13',['cha'],'Charisma 13'],['dex13',['dex'],'Dexterity 13'],['str13',['str'],'Strength 13'],['int13',['int'],'Intelligence 13'],
  ['dexCon13',['dex','con'],'Dexterity or Constitution 13'],['intWis13',['int','wis'],'Intelligence or Wisdom 13'],
  ['wisCha13',['wis','cha'],'Wisdom or Charisma 13'],['castingStat13',['int','wis','cha'],'Intelligence, Wisdom, or Charisma 13']
 ])if(req===key&&!abilities.some(ability))return `${feat.name} requires ${message} or higher.`;
 const canCast=['Bard','Cleric','Druid','Paladin','Ranger','Sorcerer','Warlock','Wizard'].includes(characterClass)||level>=3&&['Eldritch Knight','Arcane Trickster'].includes(subclass);
 if(['Spellcasting','casting'].includes(req)&&!canCast)return `${feat.name} requires a Spellcasting or Pact Magic feature.`;
 const armor=new Set(armorTraining);
 if(['Fighter','Paladin'].includes(characterClass))['light','medium','heavy','shield'].forEach(x=>armor.add(x));
 else if(['Barbarian','Cleric','Druid','Ranger'].includes(characterClass))['light','medium','shield'].forEach(x=>armor.add(x));
 else if(['Bard','Rogue','Warlock'].includes(characterClass))armor.add('light');
 if(subclass==='College of Valor'||subclass==='College of Valour') ['medium','shield'].forEach(x=>armor.add(x));
 for(const [name,type] of [['Lightly Armored','light'],['Moderately Armored','medium'],['Heavily Armored','heavy']])if(granted.includes(name))armor.add(type);
 const training={lightArmor:'light',mediumArmor:'medium',heavyArmor:'heavy',shieldArmor:'shield'};
 if(training[req]&&!armor.has(training[req]))return `${feat.name} requires ${training[req]==='shield'?'Shield':'Armor'} Training (${training[req]}).`;
 if(req==='Fighting Style'&&!((characterClass==='Fighter'&&level>=1)||(['Paladin','Ranger'].includes(characterClass)&&level>=2)))return `${feat.name} requires a Fighting Style feature. The builder currently verifies Fighter 1, Paladin 2, or Ranger 2; use a manual override for other sources.`;
 return '';
}
root.FolioOrigins={backgrounds,feats,FAST_CRAFT,validateFeat};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioOrigins;
})(typeof window!=='undefined'?window:globalThis);
