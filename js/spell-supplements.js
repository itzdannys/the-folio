/* Milestone 17.6 — carefully scoped official-supplement spell index.
 * Facts only: unique names, published level, limited class and source metadata.
 * These are NOT copies of commercial spell descriptions or usable effect automation.
 * Material first published for 2014-era 5e is a legacy reference; current-rules
 * compatibility and supersession must be reviewed with the table before use.
 * See docs/SUPPLEMENT_SPELL_INDEX_AUDIT.md for provenance and known limits. */
(function(root){'use strict';
const sources=Object.freeze({
 'wildemount':{name:'Explorer’s Guide to Wildemount (2020)',url:'https://www.dndbeyond.com/posts/757-spell-spotlight-dunamancy'},
 'strixhaven':{name:'Strixhaven: A Curriculum of Chaos (2021)',url:'https://www.dndbeyond.com/sources/dnd/sacoc'},
 'tashas':{name:'Tasha’s Cauldron of Everything (2020)',url:'https://www.dndbeyond.com/sources/dnd/tcoe'},
 'fizbans':{name:'Fizban’s Treasury of Dragons (2021)',url:'https://www.dndbeyond.com/sources/dnd/ftod'}
});
// name, level, school, class-list initials, extra access code.
// G = graviturgy, C = chronurgy, B = either Wildemount wizard tradition.
const classes={A:'Artificer',B:'Bard',C:'Cleric',D:'Druid',P:'Paladin',R:'Ranger',S:'Sorcerer',W:'Warlock',Z:'Wizard'};
const groups={
 wildemount:[
 ['Sapping Sting',0,'Necromancy','Z','B'],
 ['Gift of Alacrity',1,'Divination','Z','C'],
 ['Magnify Gravity',1,'Transmutation','Z','G'],
 ["Fortune's Favor",2,'Divination','Z','B'],
 ['Immovable Object',2,'Transmutation','Z','G'],
 ['Wristpocket',2,'Conjuration','Z','B'],
 ['Pulse Wave',3,'Evocation','Z','B'],
 ['Gravity Sinkhole',4,'Evocation','Z','G'],
 ['Temporal Shunt',5,'Transmutation','Z','C'],
 ['Gravity Fissure',6,'Evocation','Z','G'],
 ['Tether Essence',7,'Necromancy','Z','B'],
 ['Dark Star',8,'Evocation','Z','G'],
 ['Reality Break',8,'Conjuration','Z','C'],
 ['Ravenous Void',9,'Evocation','Z','G'],
 ['Time Ravage',9,'Necromancy','Z','C']
 ],
 strixhaven:[
 ['Silvery Barbs',1,'Enchantment','BSZ'],
 ['Borrowed Knowledge',2,'Divination','BCWZ'],
 ['Kinetic Jaunt',2,'Transmutation','ABSZ'],
 ['Vortex Warp',2,'Conjuration','ASZ'],
 ['Wither and Bloom',2,'Necromancy','DSZ']
 ],
 tashas:[
 ['Booming Blade',0,'Evocation','SWZ'],
 ['Green-Flame Blade',0,'Evocation','SWZ'],
 ['Lightning Lure',0,'Evocation','SWZ'],
 ['Sword Burst',0,'Conjuration','SWZ'],
 ["Tasha's Caustic Brew",1,'Evocation','ASZ'],
 ["Tasha's Mind Whip",2,'Enchantment','SZ'],
 ['Intellect Fortress',3,'Abjuration','BSWZ'],
 ['Spirit Shroud',3,'Necromancy','CPWZ'],
 ['Summon Shadowspawn',3,'Conjuration','WZ'],
 ["Tasha's Otherworldly Guise",6,'Transmutation','SWZ'],
 ['Dream of the Blue Veil',7,'Conjuration','BSWZ'],
 ['Blade of Disaster',9,'Conjuration','SWZ']
 ],
 fizbans:[
 ["Ashardalon's Stride",3,'Transmutation','ARSZ'],
 ["Draconic Transformation",7,'Transmutation','DSZ'],
 ["Fizban's Platinum Shield",6,'Abjuration','SZ'],
 ["Nathair's Mischief",2,'Illusion','BSZ'],
 ["Raulothim's Psychic Lance",4,'Enchantment','BSWZ'],
 ["Rime's Binding Ice",2,'Evocation','SZ'],
 ['Summon Draconic Spirit',5,'Conjuration','DSZ']
 ]
};
const slug=s=>s.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const references=Object.freeze(Object.entries(groups).flatMap(([sourceId,records])=>records.map(([name,level,school,codes,tradition])=>Object.freeze({
 key:`supp-${sourceId}_${slug(name)}`,name,level,school,classes:[...codes].map(ch=>classes[ch]),
 castingTime:'',range:'',components:'',duration:'',concentration:null,ritual:null,
 referenceOnly:true,implementation:'reference only',sourceId,source:sources[sourceId].name,
 sourceUrl:sources[sourceId].url,legacyReference:true,
 accessRule:sourceId==='wildemount'?'dunamancy':null,tradition:tradition||null,
 accessNote:sourceId==='wildemount'?'Dunamancy: ordinarily restricted to Chronurgy/Graviturgy wizards; other access requires DM permission. The two traditions’ specific spell groups can be interpreted differently at different tables.':'Published for earlier D&D 5e rules. Confirm current-rules compatibility and whether a newer version exists.',
 description:'Official supplement index entry only. Consult the sourcebook for casting requirements, effects, eligibility, and compatibility with current rules.',
 higherLevel:'',provenance:`Official ${sources[sourceId].name} spell-name reference; no proprietary rule text bundled.`
 }))));
root.FolioSupplementSpells={references,sources,groups,slug};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioSupplementSpells;
})(typeof window!=='undefined'?window:globalThis);
