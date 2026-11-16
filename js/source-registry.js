(function(root){'use strict';
// Milestone 17.1 revised: one current 5e rules baseline, with optional reference
// sources and user-owned metadata. Sources NEVER install copyrighted book text
// or change the 2024/SRD 5.2.1 calculations already implemented by The Folio.
const BASE_SOURCE='srd-2024';
const DEFAULTS=Object.freeze({enabledSourceIds:[BASE_SOURCE]});
const LEGACY_SOURCE_IDS=Object.freeze({'srd-2014':'srd-2024','phb-2014':'phb-2024'});
const PACK_VERSIONS=['current','2024','2014','both']; // Provenance, not a selectable rules engine.
// Official book references are never equivalent to installed content.
// This is a curated starter directory, NOT an exhaustive list of every book:
// additional official supplements can be represented by local user-supplied packs.
const EXTRA_OFFICIAL_REFERENCES=[
 ['fizbans','Fizban’s Treasury of Dragons','2021'],
 ['multiverse','Mordenkainen Presents: Monsters of the Multiverse','2022'],
 ['van-richtens','Van Richten’s Guide to Ravenloft','2021'],
 ['strixhaven','Strixhaven: A Curriculum of Chaos','2021'],
 ['bigbys','Bigby Presents: Glory of the Giants','2023'],
 ['book-many-things','The Book of Many Things','2023'],
 ['spelljammer','Spelljammer: Adventures in Space','2022'],
 ['planescape','Planescape: Adventures in the Multiverse','2023'],
 ['dragonlance','Dragonlance: Shadow of the Dragon Queen','2022'],
 ['ravnica','Guildmasters’ Guide to Ravnica','2018'],
 ['eberron-rising','Eberron: Rising from the Last War','2019'],
 ['wildemount','Explorer’s Guide to Wildemount','2020'],
 ['sword-coast','Sword Coast Adventurer’s Guide','2015'],
 ['theros','Mythic Odysseys of Theros','2020'],
 ['acquisitions','Acquisitions Incorporated','2019'],
 ['forgotten-realms-adventures-2025','Forgotten Realms: Adventures in Faerûn','2025'],
 ['ravenloft-2026','Ravenloft: The Horrors Within','2026'],
 ['lorwyn-2026','Lorwyn: First Light','2026']
].map(([id,name,published])=>({id,name,published,edition:['2025','2026'].includes(published)?'2024':'both',status:'reference',license:'Proprietary',description:'Official D&D source reference. Some publicly listed option names and trait titles may appear in Folio, but full proprietary mechanics are not bundled; check supersession and use lawful personal notes.'}));
const SOURCE_PACKS=Object.freeze([
 {id:'srd-2024',name:'PHB 24',edition:'2024',published:'2025-05-01',status:'included',license:'CC BY 4.0',description:'Included PHB 24-compatible open rules baseline for local spells, weapons and character options.'},
 {id:'phb-2024',name:'PHB 24',edition:'2024',published:'2024-09-17',status:'reference',license:'Proprietary',description:'PHB 24 reference for supported player options. Some handbook content is represented by feature metadata.'},
 {id:'tashas',name:'Tasha’s Cauldron of Everything',edition:'both',published:'2020-11-17',status:'reference',license:'Proprietary',description:'Older expansion reference; use options only if not superseded and compatible with current rules.'},
 {id:'xanathars',name:'Xanathar’s Guide to Everything',edition:'both',published:'2017-11-21',status:'reference',license:'Proprietary',description:'Older expansion reference; options may need compatibility review and are not included.'},
 {id:'eberron-2025',name:'Eberron: Forge of the Artificer',edition:'2024',published:'2025-08-19',status:'reference',license:'Proprietary',description:'Five current Eberron species have selectable name/trait reference metadata; complete species mechanics are not bundled.'},
 {id:'forgotten-realms-2025',name:'Forgotten Realms: Heroes of Faerûn',edition:'2024',published:'2025-11-11',status:'reference',license:'Proprietary',description:'Current Forgotten Realms expansion reference. Noble Genies automation is planned separately.'},
 ...EXTRA_OFFICIAL_REFERENCES
]);
const isObj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const known=()=>SOURCE_PACKS.map(s=>s.id);
const uniqueSources=(items)=>[BASE_SOURCE,...new Set(items.filter(x=>typeof x==='string'&&x.length<=80).map(x=>LEGACY_SOURCE_IDS[x]||x).filter(x=>x!==BASE_SOURCE))].slice(0,200);
function normalizeSettings(raw, fallback=DEFAULTS){
 const candidate=isObj(raw)?raw:fallback;
 const ids=Array.isArray(candidate.enabledSourceIds)?candidate.enabledSourceIds:DEFAULTS.enabledSourceIds;
 // Drop historic 2014/2024 mode labels; all Folios calculate from one current baseline.
 return {enabledSourceIds:uniqueSources(ids)};
}
// Accept old backed-up settings so 17.1 archives and on-disk character saves migrate.
function validSettings(raw){return isObj(raw)&&(raw.edition===undefined||['2014','2024'].includes(raw.edition))&&Array.isArray(raw.enabledSourceIds)&&raw.enabledSourceIds.length<=200&&raw.enabledSourceIds.every(x=>typeof x==='string'&&x.length<=80)&&new Set(raw.enabledSourceIds).size===raw.enabledSourceIds.length;}
function normalizePreference(raw,legacy=false){
 if(!isObj(raw))return legacy?{mode:'custom',...normalizeSettings(DEFAULTS)}:{mode:'inherit'};
 if(raw.mode==='inherit')return {mode:'inherit'};
 return {mode:'custom',...normalizeSettings(raw)};
}
const validPreference=x=>isObj(x)&&(x.mode==='inherit'||(x.mode==='custom'&&validSettings(x)));
function displayName(sourceId,raw=''){
 const id=String(sourceId||'');const name=String(raw||'');
 if(id==='srd-2024'||id==='phb-2024'||!id&&/^(?:2024 SRD|SRD 2024|SRD 5\.2\.1|2024 SRD · Open5e|Player.s Handbook \(2024\)|PHB 2024)$/i.test(name)||/^(?:SRD 5\.2\.1|2024 SRD|Player.s Handbook \(2024\)|PHB 2024|PHB 24)(?:\s*·.*)?$/i.test(name))return 'PHB 24';
 return name||id||'Custom';
}
function allPacks(lib){return [...SOURCE_PACKS,...(lib?.sourcePacks||[])];}
const CATEGORIES=['class','subclass','species','background','feat','spell','weapon','item','feature'];
const STATUSES=['automated','partially automated','reference only','user-entered'];
function validEntry(item){return isObj(item)&&/^[a-z0-9][a-z0-9-]{0,70}$/.test(item.id)&&CATEGORIES.includes(item.category)&&typeof item.name==='string'&&item.name.trim().length>0&&item.name.length<=100&&(!item.description||typeof item.description==='string'&&item.description.length<=1500)&&(!item.prerequisites||Array.isArray(item.prerequisites)&&item.prerequisites.length<=12&&item.prerequisites.every(x=>typeof x==='string'&&x.length<=150))&&
 (!item.abilities||Array.isArray(item.abilities)&&item.abilities.length<=3&&item.abilities.every(x=>['str','dex','con','int','wis','cha'].includes(x))&&new Set(item.abilities).size===item.abilities.length)&&
 (!item.skills||Array.isArray(item.skills)&&item.skills.length<=8&&item.skills.every(x=>typeof x==='string'&&x.length<=50))&&
 (!item.tool||typeof item.tool==='string'&&item.tool.length<=80)&&(!item.feat||typeof item.feat==='string'&&item.feat.length<=100)&&
 (!item.minLevel||Number.isInteger(item.minLevel)&&item.minLevel>=1&&item.minLevel<=20)&&
 (!item.featCategory||['Origin','General','Fighting Style','Epic Boon'].includes(item.featCategory))&&
 (!item.speed&&item.speed!==0||Number.isInteger(item.speed)&&item.speed>=0&&item.speed<=120)&&
 (!item.sizes||Array.isArray(item.sizes)&&item.sizes.length<=2&&item.sizes.every(x=>['Small','Medium'].includes(x))&&new Set(item.sizes).size===item.sizes.length)&&
 (!item.creatureType||typeof item.creatureType==='string'&&item.creatureType.length<=60)&&
 (!item.traits||Array.isArray(item.traits)&&item.traits.length<=12&&item.traits.every(x=>typeof x==='string'&&x.length>=1&&x.length<=100))&&
 // Spell metadata is inert. A user's pack never installs or executes rules.
 (item.level===undefined||item.level===null||Number.isInteger(item.level)&&item.level>=0&&item.level<=9)&&
 (!item.classes||Array.isArray(item.classes)&&item.classes.length<=12&&item.classes.every(x=>['Bard','Cleric','Druid','Paladin','Ranger','Sorcerer','Warlock','Wizard','Artificer'].includes(x))&&new Set(item.classes).size===item.classes.length)&&
 ['school','castingTime','range','components','duration'].every(k=>item[k]===undefined||typeof item[k]==='string'&&item[k].length<=90)&&
 (item.concentration===undefined||item.concentration===null||typeof item.concentration==='boolean')&&
 (item.ritual===undefined||item.ritual===null||typeof item.ritual==='boolean');}
function validPack(pack){return isObj(pack)&&/^user-[a-z0-9][a-z0-9-]{0,55}$/.test(pack.id)&&typeof pack.name==='string'&&pack.name.trim().length>0&&pack.name.length<=90&&PACK_VERSIONS.includes(pack.edition)&&typeof pack.description==='string'&&pack.description.length<=600&&typeof pack.license==='string'&&pack.license.length<=120&&typeof pack.published==='string'&&pack.published.length<=40&&pack.status==='user-entered'&&Array.isArray(pack.entries)&&pack.entries.length<=150&&pack.entries.every(validEntry)&&new Set(pack.entries.map(x=>x.id)).size===pack.entries.length;}
function parseUserPack(raw){const obj=typeof raw==='string'?JSON.parse(raw):raw;if(!isObj(obj)||obj.format!=='folio-source-pack'||obj.version!==1)throw Error('Not a Folio source pack JSON v1.');
 const id=String(obj.id||'');if(!/^user-[a-z0-9][a-z0-9-]{0,55}$/.test(id)||known().includes(id))throw Error('Pack IDs must start with user- and use lowercase letters, digits and hyphens.');
 const pack={id,name:String(obj.name||'').trim(),edition:String(obj.edition||'current'),published:String(obj.published||''),license:String(obj.license||'User-provided'),description:String(obj.description||''),status:'user-entered',entries:Array.isArray(obj.entries)?obj.entries.map(i=>({id:i?.id,category:i?.category,name:i?.name,description:i?.description||'',prerequisites:i?.prerequisites||[],abilities:i?.abilities||[],skills:i?.skills||[],tool:i?.tool||'',feat:i?.feat||'',minLevel:i?.minLevel||1,featCategory:i?.featCategory||'',speed:i?.speed===undefined?null:i.speed,sizes:i?.sizes||[],creatureType:i?.creatureType||'',traits:i?.traits||[],level:i?.level??null,classes:i?.classes||[],school:i?.school||'',castingTime:i?.castingTime||'',range:i?.range||'',components:i?.components||'',duration:i?.duration||'',concentration:i?.concentration??null,ritual:i?.ritual??null})):[]};
 if(!validPack(pack))throw Error('Invalid source pack. Include a name and up to 150 simple reference entries.');
 return pack;
}
function importPack(lib,raw){const pack=validPack(raw)?raw:parseUserPack(raw);if((lib.sourcePacks||[]).some(p=>p.id===pack.id))throw Error('A source pack with this ID already exists. Remove it before importing a replacement.');if((lib.sourcePacks||[]).length>=150)throw Error('Limit of 150 user packs reached.');return {...lib,sourcePacks:[...(lib.sourcePacks||[]),pack]};}
function removePack(lib,id){if(!String(id).startsWith('user-'))throw Error('Bundled source references cannot be deleted.');return {...lib,sourcePacks:(lib.sourcePacks||[]).filter(x=>x.id!==id)};}
function effective(lib,record){const global=normalizeSettings(lib?.rulesDefaults),campaign=lib?.campaigns?.find(c=>c.id===record?.campaignId),campaignValue=campaign?.rulesDefaults?normalizeSettings(campaign.rulesDefaults):global;
 const choice=normalizePreference(record?.stack?.present?.character?.rules,true);const selected=choice.mode==='custom'?normalizeSettings(choice):campaignValue;return {...selected,inheritFrom:choice.mode==='custom'?'character':campaign?.rulesDefaults?'campaign':'library'};
}
function isLegacyPack(pack){return pack?.edition==='2014';}
function sourceAvailability(lib,settings){const ids=new Set(normalizeSettings(settings).enabledSourceIds);return allPacks(lib).map(p=>({...p,enabled:ids.has(p.id),compatible:!isLegacyPack(p),legacyReference:isLegacyPack(p)}));}
function registry(lib){const b=root.FolioBuilder||(typeof require==='function'?require('./builder.js'):null),sc=root.FolioSpellCatalog||null,wc=root.FolioWeaponCatalog||null;
 const raw=[];for(const [kind,records] of Object.entries(b?.builtin||{}))for(const item of records){
  const sourceId=item.sourceId||BASE_SOURCE,open=sourceId===BASE_SOURCE;
  raw.push({id:`${sourceId}:${kind}:${item.id}`,name:item.name,category:kind,sourceId,
   edition:'2024',published:open?'2025-05-01':'2024-09-17',license:open?'CC BY 4.0':'Proprietary',
   provenance:open?'Local SRD 5.2.1 catalogue':'Player’s Handbook reference metadata; full text not installed',
   prerequisites:item.minLevel?[`Level ${item.minLevel}+`,...(item.requires?[item.requires]:[])]:item.requires?[item.requires]:[],
   choices:[],effects:[],status:item.implementation||'partially automated',description:item.description||'',
   details:item.details||'',sourceUrl:item.sourceUrl||''});
 }
 for(const sp of root.FolioSpellExpansions?.references||[])raw.push({id:`${sp.sourceId}:spell:${sp.key}`,name:sp.name,category:'spell',sourceId:sp.sourceId,edition:'2024',published:'2024-09-17',license:'Proprietary',provenance:sp.provenance,prerequisites:[],choices:[],effects:[],status:'reference only',description:sp.description,details:'Spell name, class list, and level only. Full PHB rules are not bundled.',sourceUrl:sp.sourceUrl});
 for(const sp of root.FolioSupplementSpells?.references||[])raw.push({id:`${sp.sourceId}:spell:${sp.key}`,name:sp.name,category:'spell',sourceId:sp.sourceId,edition:'both',published:SOURCE_PACKS.find(p=>p.id===sp.sourceId)?.published||'',license:'Proprietary',provenance:sp.provenance,prerequisites:sp.accessRule==='dunamancy'?['Chronurgy/Graviturgy Wizard or DM permission']:[],choices:[],effects:[],status:'reference only',description:sp.description,details:sp.accessNote||'Older supplement; review current-rules compatibility.',sourceUrl:sp.sourceUrl});
 for(const sp of sc?.spells||[])raw.push({id:`srd-2024:spell:${sp.key}`,name:sp.name,category:'spell',sourceId:BASE_SOURCE,edition:'2024',published:'2025-05-01',license:'CC BY 4.0',provenance:'Local SRD 5.2 spell catalogue',prerequisites:[],choices:[],effects:[],status:'partially automated'});
 for(const w of wc?.weapons||[])raw.push({id:`srd-2024:weapon:${w.key}`,name:w.name,category:'weapon',sourceId:BASE_SOURCE,edition:'2024',published:'2025-05-01',license:'CC BY 4.0',provenance:'Local SRD 5.2 weapon catalogue',prerequisites:[],choices:[],effects:[],status:'partially automated'});
 for(const pack of lib?.sourcePacks||[])for(const entry of pack.entries)raw.push({id:`${pack.id}:${entry.category}:${entry.id}`,name:entry.name,category:entry.category,sourceId:pack.id,edition:pack.edition,published:pack.published,license:pack.license,provenance:'Imported local user pack',prerequisites:entry.prerequisites,choices:[],effects:[],status:'user-entered',description:entry.description,abilities:entry.abilities||[],skills:entry.skills||[],tool:entry.tool||'',feat:entry.feat||'',minLevel:entry.minLevel||1,featCategory:entry.featCategory||'',speed:entry.speed??null,sizes:entry.sizes||[],creatureType:entry.creatureType||'',traits:entry.traits||[],level:entry.level??null,classes:entry.classes||[],school:entry.school||'',castingTime:entry.castingTime||'',range:entry.range||'',components:entry.components||'',duration:entry.duration||'',concentration:entry.concentration??null,ritual:entry.ritual??null});
 return raw;
}
function eligibility(item,settings){return {enabled:normalizeSettings(settings).enabledSourceIds.includes(item.sourceId),compatible:item.edition!=='2014'};}
root.FolioSources={BASE_SOURCE,DEFAULTS,displayName,LEGACY_SOURCE_IDS,PACK_VERSIONS,SOURCE_PACKS,CATEGORIES,STATUSES,normalizeSettings,validSettings,normalizePreference,validPreference,allPacks,validPack,parseUserPack,importPack,removePack,effective,sourceAvailability,registry,eligibility,isLegacyPack};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioSources;
})(typeof window!=='undefined'?window:globalThis);
