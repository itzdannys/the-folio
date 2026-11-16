(function(root){'use strict';
// Milestone 17.3: current-rules species index. SRD trait names and original short
// descriptions are CC BY 4.0; non-SRD entries are NAME-AND-FEATURE metadata only.
// A reference entry is not an installed rulebook or an automated rules module.
const SRD='srd-2024',PHB='phb-2024',EBERRON='eberron-2025';
const trait=(name,summary='Consult the species rules for its full effect.')=>({name,summary});
const srd=(id,name,speed,sizes,traits,extra={})=>({id:'species:'+id,kind:'species',name,speed,sizes,creatureType:'Humanoid',sourceId:SRD,official:true,implementation:'partially automated',description:'2024 Player’s Handbook species, with traits, level progression, and interactive sheet features.',traits:traits.map(t=>typeof t==='string'?trait(t):trait(...t)),...extra});
const ref=(id,name,sourceId,traitNames,extra={})=>({id:'species:'+id,kind:'species',name,sourceId,official:true,implementation:'reference only',description:'Official current-rules species reference. Full supplemental-book mechanics are not bundled; review the sourcebook before play.',traits:traitNames.map(n=>trait(n,'Feature name for reference. Apply its rules using your official sourcebook.')),sizes:[],speed:null,creatureType:'See source',...extra});
const records=[
 srd('dragonborn','Dragonborn',30,['Medium'],[['Dragon Ancestry','Choose an ancestry; it affects breath damage and resistance.'],['Breath Weapon','An alternative to one attack of the Attack action; see rules for save, damage and uses.'],['Damage Resistance','Resistance to the chosen ancestry’s damage type.'],['Darkvision','See in darkness within the species range.'],['Draconic Flight','Temporary flight unlocked at the specified level.']],{darkvisionFeet:60,variant:{label:'Dragon ancestry',options:['Black','Blue','Brass','Bronze','Copper','Gold','Green','Red','Silver','White']}}),
 srd('dwarf','Dwarf',30,['Medium'],[['Darkvision','See in darkness up to 120 feet.'],['Dwarven Resilience','Poison resistance and advantage against the Poisoned condition.'],['Dwarven Toughness','Maximum HP increases by 1 per character level (included in suggested HP).'],['Stonecunning','Limited-use tremorsense when touching or standing on stone.']],{darkvisionFeet:120}),
 srd('elf','Elf',30,['Medium'],[['Darkvision','See in darkness; Drow has an extended range.'],['Elven Lineage','Choose Drow, High Elf or Wood Elf; spells vary by level.'],['Fey Ancestry','Advantage against being Charmed.'],['Keen Senses','Choose Insight, Perception or Survival proficiency.'],['Trance','Elves can finish a Long Rest in four hours of meditation.']],{darkvisionFeet:60,skillChoice:{label:'Keen Senses',count:1,options:['Insight','Perception','Survival']},variant:{label:'Elven lineage',options:['Drow','High Elf','Wood Elf']}}),
 srd('gnome','Gnome',30,['Small'],[['Darkvision','See in darkness up to 60 feet.'],['Gnomish Cunning','Advantage on Intelligence, Wisdom and Charisma saving throws.'],['Gnomish Lineage','Choose Forest or Rock Gnome for their different magic.']],{darkvisionFeet:60,variant:{label:'Gnomish lineage',options:['Forest Gnome','Rock Gnome']}}),
 srd('goliath','Goliath',35,['Medium'],[['Giant Ancestry','A giant-derived power, with limited uses per Long Rest.'],['Large Form','At level 5, a temporary transformation can make you Large.'],['Powerful Build','Supports carrying and escaping grapples.']],{variant:{label:'Giant ancestry',options:['Cloud','Fire','Frost','Hill','Stone','Storm']}}),
 srd('halfling','Halfling',30,['Small'],[['Brave','Advantage on saves against being Frightened.'],['Halfling Nimbleness','Move through larger creatures’ spaces but do not stop there.'],['Luck','Reroll a natural 1 on a d20 Test, using the new roll.'],['Naturally Stealthy','Hide when suitably obscured by a larger creature.']]),
 srd('human','Human',30,['Small','Medium'],[['Resourceful','Gain Heroic Inspiration after a Long Rest.'],['Skillful','Choose one skill proficiency.'],['Versatile','Gain an additional Origin feat (record this manually).']],{skillChoice:{label:'Skillful proficiency',count:1,options:['Acrobatics','Animal Handling','Arcana','Athletics','Deception','History','Insight','Intimidation','Investigation','Medicine','Nature','Perception','Performance','Persuasion','Religion','Sleight of Hand','Stealth','Survival']}}),
 srd('orc','Orc',30,['Medium'],[['Adrenaline Rush','Bonus Action Dash with temporary HP; limited uses.'],['Darkvision','See in darkness up to 120 feet.'],['Relentless Endurance','Once per Long Rest, remain at 1 HP instead of falling to 0.']],{darkvisionFeet:120}),
 srd('tiefling','Tiefling',30,['Small','Medium'],[['Darkvision','See in darkness up to 60 feet.'],['Fiendish Legacy','Choose an Abyssal, Chthonic or Infernal set of magical benefits.'],['Otherworldly Presence','Grants Thaumaturgy; casting ability follows the chosen legacy.']],{darkvisionFeet:60,variant:{label:'Fiendish legacy',options:['Abyssal','Chthonic','Infernal']}}),
 srd('aasimar','Aasimar',30,['Small','Medium'],[['Celestial Resistance','Resistance to Necrotic and Radiant damage.'],['Darkvision','See in darkness to 60 feet.'],['Healing Hands','Magic action; heal proficiency bonus d4; once per Long Rest.'],['Light Bearer','Light cantrip, Charisma spellcasting.'],['Celestial Revelation','At level 5, choose a temporary celestial form once per Long Rest.']],{sourceId:PHB,darkvisionFeet:60}),
 ref('changeling','Changeling',EBERRON,['Changeling Instincts','Shape-Shifter'],{sizes:['Small','Medium'],speed:30,creatureType:'Fey',description:'Updated 2025 Eberron Changeling. Shape-Shifter changes appearance/voice; while transformed, Charisma checks have Advantage. Gear does not transform. Full text in your sourcebook.',skillChoice:{label:'Changeling Instincts (choose two)',count:2,options:['Deception','Insight','Intimidation','Performance','Persuasion']}}),
 ref('kalashtar','Kalashtar',EBERRON,['Dual Mind','Mental Discipline','Mindlink','Severed from Dreams'],{creatureType:'Aberration'}),
 ref('khoravar','Khoravar',EBERRON,['Darkvision','Fey Ancestry','Fey Gift','Lethargy Resilience','Skill Versatility'],{darkvisionFeet:60}),
 ref('shifter','Shifter',EBERRON,['Bestial Instincts','Darkvision','Shifting']),
 ref('warforged','Warforged',EBERRON,['Construct Resilience','Integrated Protection','Sentry’s Rest','Specialized Design','Tireless'],{creatureType:'Construct'}),
 // Current 2026 setting releases: index names and feature titles only. Their
 // walking speeds and full mechanics must come from the reader's own source.
 ref('dhampir','Dhampir','ravenloft-2026',['Darkvision','Spider Climb','Trace of Undeath','Vampiric Bite']),
 ref('hexblood','Hexblood','ravenloft-2026',['Darkvision','Eerie Token','Distant Message','Remote Viewing'],{creatureType:'Fey'}),
 ref('lupin','Lupin','ravenloft-2026',['Darkvision','Feral Pounce','Howl','Werewolf Instincts']),
 ref('reborn','Reborn','ravenloft-2026',['Escaped Death','Everlasting','Knowledge from a Past Life','Strange Endurance']),
 ref('boggart','Boggart','lorwyn-2026',['Darkvision','Fey Ancestry','Fury of the Small','Nimble Escape']),
 ref('faerie-lorwyn','Faerie (Lorwyn)','lorwyn-2026',['Faerie Magic','Flight'],{creatureType:'Fey'}),
 ref('flamekin','Flamekin','lorwyn-2026',['Darkvision','Fire Resistance','Reach to the Blaze']),
 ref('kithkin','Kithkin','lorwyn-2026',['Brave','Kithkin Nimbleness','Luck','Naturally Stealthy']),
 ref('lorwyn-changeling','Lorwyn Changeling','lorwyn-2026',['Shape Self','Darkvision','Delightful Imitator','Unpredictable Movement'],{creatureType:'Fey'}),
 ref('lorwyn-elf','Lorwyn-Shadowmoor Elf','lorwyn-2026',['Darkvision','Elven Lineage','Fey Ancestry','Keen Senses','Trance']),
 ref('rimekin','Rimekin','lorwyn-2026',['Cold Fire Magic','Cold Resistance','Darkvision'])
];
const allSkills=['Acrobatics','Animal Handling','Arcana','Athletics','Deception','History','Insight','Intimidation','Investigation','Medicine','Nature','Perception','Performance','Persuasion','Religion','Sleight of Hand','Stealth','Survival'];
// A species size/variant/skill selection is metadata, not a replacement for rules text.
function choices(species,raw={}){
 if(!species)return {size:'',variant:'',skills:[],pending:[]};
 const sizes=species.sizes||[];const size=String(raw.size||'');
 if(size&&!['Small','Medium'].includes(size))throw Error('Species size must be Small or Medium.');
 if(size&&sizes.length&&!sizes.includes(size))throw Error('Size is not available for '+species.name+'.');
 const variant=String(raw.variant||'');if(variant&&species.variant&&!species.variant.options.includes(variant))throw Error('Invalid '+species.variant.label.toLowerCase()+'.');
 const request=Array.isArray(raw.skills)?raw.skills.map(s=>String(s||'').trim()).filter(Boolean):[];
 if(new Set(request).size!==request.length)throw Error('Species skill choices must be different.');
 if(request.length>(species.skillChoice?.count||0)||request.some(s=>!species.skillChoice?.options.includes(s)))throw Error('Species skills are not valid for '+species.name+'.');
 const pending=[];
 if(sizes.length>1&&!size)pending.push('Choose a size');
 if(species.variant&&!variant)pending.push('Choose '+species.variant.label.toLowerCase());
 if(species.skillChoice&&request.length<species.skillChoice.count)pending.push('Choose '+species.skillChoice.count+' '+(species.skillChoice.count===1?'skill':'skills'));
 return {size:size||(sizes.length===1?sizes[0]:''),variant,skills:request,pending};
}
root.FolioSpecies={records,allSkills,choices};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioSpecies;
})(typeof window!=='undefined'?window:globalThis);
