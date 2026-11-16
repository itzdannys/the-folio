/* Milestone 17.5: 2024 PHB spell-name index absent from the SRD 5.2.1.
   Only factual identifying metadata is bundled. No proprietary rule text or
   unverified casting mechanics. The SRD records remain the rules baseline.
   Sources: D&D Beyond 2024 PHB update and the published spell-list indices.
   Reconcile renamed SRD entries using aliases instead of double-counting. */
(function(root){'use strict';
const PHB_SOURCE='phb-2024';
const classes={B:'Bard',C:'Cleric',D:'Druid',P:'Paladin',R:'Ranger',S:'Sorcerer',W:'Warlock',Z:'Wizard'};
const data=[
// Name, spell level, official class-list codes. No mechanics assumed here.
['Blade Ward',0,'BSWZ'],['Friends',0,'BSWZ'],['Mind Sliver',0,'SWZ'],
['Thorn Whip',0,'D'],['Thunderclap',0,'BDSWZ'],['Toll the Dead',0,'CWZ'],['Word of Radiance',0,'C'],
['Armor of Agathys',1,'W'],['Arms of Hadar',1,'W'],['Compelled Duel',1,'P'],
['Hail of Thorns',1,'R'],['Thunderous Smite',1,'P'],['Witch Bolt',1,'SWZ'],['Wrathful Smite',1,'P'],
['Arcane Vigor',2,'SZ'],['Beast Sense',2,'DR'],['Cloud of Daggers',2,'BSWZ'],
['Cordon of Arrows',2,'R'],['Crown of Madness',2,'BSWZ'],['Summon Beast',2,'DR'],
['Aura of Vitality',3,'CDP'],['Blinding Smite',3,'P'],['Conjure Barrage',3,'R'],
["Crusader's Mantle",3,'P'],['Elemental Weapon',3,'DPR'],['Feign Death',3,'BCDZ'],
['Hunger of Hadar',3,'W'],['Lightning Arrow',3,'R'],['Summon Fey',3,'DRWZ'],['Summon Undead',3,'WZ'],
['Aura of Purity',4,'CP'],['Fount of Moonlight',4,'BD'],['Grasping Vine',4,'DR'],
['Staggering Smite',4,'P'],['Summon Aberration',4,'WZ'],['Summon Construct',4,'Z'],['Summon Elemental',4,'DRZ'],
['Banishing Smite',5,'P'],['Circle of Power',5,'CPZ'],['Conjure Volley',5,'R'],
['Destructive Wave',5,'P'],["Jallarzi's Storm of Radiance",5,'WZ'],
['Steel Wind Strike',5,'RZ'],['Summon Celestial',5,'CP'],['Swift Quiver',5,'R'],
['Synaptic Static',5,'BSWZ'],["Yolande's Regal Presence",5,'BZ'],
['Arcane Gate',6,'SWZ'],['Summon Fiend',6,'WZ'],["Tasha's Bubbling Cauldron",6,'WZ'],
['Power Word Fortify',7,'BC'],['Telepathy',8,'Z']
];
const slug=n=>n.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const refs=data.map(([name,level,codes])=>Object.freeze({
 key:'phb-2024_'+slug(name),name,level,classes:[...codes].map(ch=>classes[ch]),
 school:'',castingTime:'',range:'',components:'',duration:'',concentration:null,ritual:null,
 sourceId:PHB_SOURCE,source:'Player\u2019s Handbook (2024)',implementation:'reference only',referenceOnly:true,
 description:'Reference entry only. Consult your 2024 Player\u2019s Handbook for the official casting requirements, effects and upcasting rules.',
 higherLevel:'',sourceUrl:'https://www.dndbeyond.com/spells',
 provenance:'2024 PHB spell-list index; no commercial rules text bundled.'
}));
// Open SRD uses generic names for some named PHB spells; these are search
// aliases pointing at existing mechanics, NOT separately selectable spells.
const aliases=Object.freeze({
 'Acid Arrow':["Melf's Acid Arrow"],
 'Arcane Hand':["Bigby's Hand"],
 'Arcane Sword':["Mordenkainen's Sword"],
 "Arcanist's Magic Aura":["Nystul's Magic Aura"],
 'Black Tentacles':["Evard's Black Tentacles"],
 'Faithful Hound':["Mordenkainen's Faithful Hound"],
 'Floating Disk':["Tenser's Floating Disk"],
 'Freezing Sphere':["Otiluke's Freezing Sphere"],
 'Hideous Laughter':["Tasha's Hideous Laughter"],
 'Instant Summons':["Drawmij's Instant Summons"],
 'Irresistible Dance':["Otto's Irresistible Dance"],
 'Magnificent Mansion':["Mordenkainen's Magnificent Mansion"],
 'Private Sanctum':["Mordenkainen's Private Sanctum"],
 'Resilient Sphere':["Otiluke's Resilient Sphere"],
 'Secret Chest':["Leomund's Secret Chest"],
 'Telepathic Bond':["Rary's Telepathic Bond"],
 'Tiny Hut':["Leomund's Tiny Hut"]
});
root.FolioSpellExpansions={references:refs,aliases,PHB_SOURCE,slug};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioSpellExpansions;
})(typeof window!=='undefined'?window:globalThis);
