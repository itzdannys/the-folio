(function(root){'use strict';
const clone=x=>JSON.parse(JSON.stringify(x));
// One unified catalogue: 339 openly licensed SRD records, 52 PHB name-only
// references, separately audited official supplement names, and inert user spells. Proprietary references do
// not have pretend values for mechanics that have not been entered or verified.
const catalog=()=>{
 const open=root.FolioSpellCatalog?.spells||[];
 const refs=root.FolioSpellExpansions?.references||[];
 const supplements=root.FolioSupplementSpells?.references||[];
 const user=(root.FolioActiveLibrary?.sourcePacks||[]).flatMap(pack=>(pack.entries||[]).filter(e=>e.category==='spell'&&Number.isInteger(e.level)&&Array.isArray(e.classes)&&e.classes.length).map(e=>({
  key:`${pack.id}:spell:${e.id}`,name:e.name,level:e.level,classes:[...e.classes],
  school:e.school||'',castingTime:e.castingTime||'',range:e.range||'',components:e.components||'',duration:e.duration||'',
  concentration:typeof e.concentration==='boolean'?e.concentration:null,ritual:typeof e.ritual==='boolean'?e.ritual:null,
  sourceId:pack.id,source:pack.name,implementation:'user-entered',referenceOnly:true,
  description:e.description||'User-entered reference only; consult your source for rules.',higherLevel:'',
  provenance:`Locally imported source pack · ${pack.name}`,
  sourceUrl:'',legacyReference:pack.edition==='2014'
 })));
 // Prefer bundled 2024 SRD/PHB records if a supplementary name was superseded.
 // Never silently replace user-created IDs or change saved historical choices.
 const baseNames=new Set([...open,...refs].map(x=>x.name.toLowerCase()));
 return [...open,...refs,...supplements.filter(x=>!baseNames.has(x.name.toLowerCase())),...user];
};
const className=c=>c?.build?.characterClass||String(c?.className||'').replace(/\s+\d+$/,'').trim();
const levelOf=c=>Math.max(1,Math.min(20,Number(c?.level)||1));
function supplementAccess(sp,c){
 if(sp.accessRule!=='dunamancy')return true;
 if(className(c)!=='Wizard')return false;
 const sub=String(c?.build?.subclass||c?.subclass||'').toLowerCase();
 const chrono=sub.includes('chronurgy')||sub.includes('chronomancy');
 const gravi=sub.includes('graviturgy');
 if(!chrono&&!gravi)return false;
 // The original book's restrictions are disputed. We use the narrower
 // tradition-specific index by default; a DM may import a custom grant.
 return sp.tradition==='B'||(sp.tradition==='C'&&chrono)||(sp.tradition==='G'&&gravi);
}
const fullCasters=new Set(['Bard','Cleric','Druid','Sorcerer','Wizard','Warlock']);
function spellAccess(c){const cls=className(c),level=levelOf(c),sub=String(c?.build?.subclass||c?.subclass||'').trim().toLowerCase();
 if(fullCasters.has(cls))return {lists:cls==='Bard'&&level>=10?['Bard','Cleric','Druid','Wizard']:[cls],maxLevel:Math.min(9,Math.ceil(level/2)),cantrips:true};
 if(['Paladin','Ranger'].includes(cls))return {lists:[cls],maxLevel:Math.min(5,1+Math.floor((level-1)/4)),cantrips:level>=2&&(cls==='Paladin'&&(c.build?.fightingStyleName==='Fighting Style: Blessed Warrior'||(c.build?.grantedFeatNames||[]).includes('Fighting Style: Blessed Warrior'))||cls==='Ranger'&&(c.build?.fightingStyleName==='Fighting Style: Druidic Warrior'||(c.build?.grantedFeatNames||[]).includes('Fighting Style: Druidic Warrior')))};
 if(cls==='Barbarian'&&sub==='path of the wild heart')return {lists:[],maxLevel:level>=10?5:level>=3?2:0,cantrips:false};
 if(level>=3&&((cls==='Fighter'&&sub==='eldritch knight')||(cls==='Rogue'&&sub==='arcane trickster')))return {lists:['Wizard'],maxLevel:1+Math.floor((level-1)/6),cantrips:true};
 return {lists:[],maxLevel:0,cantrips:false};
}
function availableSpells(c,filters={}){
 const access=spellAccess(c),q=String(filters.query||'').trim().toLowerCase();
 const grantedNames=new Set(classGrantedSpellNames(c));
 const blessed=className(c)==='Paladin'&&access.cantrips;const druidic=className(c)==='Ranger'&&access.cantrips;
 return catalog().filter(sp=>(access.lists.some(x=>(sp.classes||[]).includes(x))||grantedNames.has(sp.name)||blessed&&sp.level===0&&(sp.classes||[]).includes('Cleric')||druidic&&sp.level===0&&(sp.classes||[]).includes('Druid'))&&supplementAccess(sp,c)&&(sp.level<=access.maxLevel||grantedNames.has(sp.name))&&
 (sp.level>0||access.cantrips||grantedNames.has(sp.name))&&(filters.level==null||filters.level===''||sp.level===Number(filters.level))&&
 (!filters.school||sp.school===filters.school)&&
 (filters.concentration==null||sp.concentration===filters.concentration)&&
 (filters.ritual==null||sp.ritual===filters.ritual)&&
 (!filters.sourceId||filters.sourceId==='phb-24-unified'&&['srd-2024','phb-2024'].includes(sp.sourceId||'srd-2024')||filters.sourceId===sp.sourceId||filters.sourceId==='srd-2024'&&!sp.sourceId)&&
 (!q||[sp.name,sp.description,sp.higherLevel,sp.school,(sp.classes||[]).join(' '),sp.source||'',...(root.FolioSpellExpansions?.aliases?.[sp.name]||[])].join(' ').toLowerCase().includes(q))
 ).sort((a,b)=>a.level-b.level||a.name.localeCompare(b.name));
}
const standard=[4,5,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22],wizard=[4,5,6,7,9,10,11,12,14,15,16,16,17,18,19,21,22,23,24,25],sorcerer=[2,4,6,7,9,10,11,12,14,15,16,16,17,17,18,18,19,20,21,22],half=[2,3,4,5,6,6,7,7,9,9,10,10,11,11,12,12,14,14,15,15],warlock=[2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15],third=[0,0,3,4,4,4,5,6,6,7,8,8,9,10,10,11,11,11,12,13];
function preparationLimits(c){const cls=className(c),idx=levelOf(c)-1,sub=String(c?.build?.subclass||c?.subclass||'').trim().toLowerCase(),table={Bard:standard,Cleric:standard,Druid:standard,Wizard:wizard,Sorcerer:sorcerer,Paladin:half,Ranger:half,Warlock:warlock}[cls],base={Bard:2,Cleric:3,Druid:2,Wizard:3,Sorcerer:4,Warlock:2}[cls]||0;
 if(table)return {cantrips:cls==='Bard'?(levelOf(c)>=10?4:levelOf(c)>=4?3:2):cls==='Cleric'?3+(levelOf(c)>=4?1:0)+(levelOf(c)>=10?1:0)+(c.build?.clericOrder==='Thaumaturge'?1:0):cls==='Druid'?2+(levelOf(c)>=4?1:0)+(levelOf(c)>=10?1:0)+(c.build?.druidOrder==='Magician'?1:0):['Paladin','Ranger'].includes(cls)&&spellAccess(c).cantrips?2:base?base+(levelOf(c)>=4?1:0)+(levelOf(c)>=10?1:0):0,prepared:table[idx],timing:['Cleric','Druid','Wizard'].includes(cls)?'any-long-rest':['Paladin','Ranger'].includes(cls)?'one-long-rest':'one-level-up',label:['Bard','Ranger','Warlock'].includes(cls)?'Known spells':'Prepared spells'};
 if(levelOf(c)>=3&&((cls==='Fighter'&&sub==='eldritch knight')||(cls==='Rogue'&&sub==='arcane trickster')))return {cantrips:(cls==='Rogue'?2:2)+(levelOf(c)>=10?1:0),prepared:third[idx],timing:'one-level-up',label:'Known spells'};
 return {cantrips:0,prepared:0,timing:'none',label:'Spells'};
}
function selectedIds(book){return [...new Set(book?.catalogSelections||[])];}
function getSpell(key,book={}){const found=catalog().find(s=>s.key===key)||book.catalogSnapshots?.[key];if(found)return normalizeSpell(found);return (book.custom||[]).find(s=>s.id===key)||null;}
function normalizeSpell(sp){
 const manual=!!sp.referenceOnly,rawSource=sp.source|| (manual?'Player’s Handbook (2024)':'2024 SRD · Open5e'),source=root.FolioSources?.displayName(sp.sourceId||'srd-2024',rawSource)||rawSource;
 return {id:sp.key,name:sp.name,level:sp.level,school:sp.school||(manual?'Unverified':'Unknown'),
 time:manual&&!sp.castingTime?'Check sourcebook':String(sp.castingTime||'Action').replaceAll('-',' ').replace(/(\d)(minute|hour|day)/gi,'$1 $2').replace(/^./,x=>x.toUpperCase()),
 range:sp.range||(manual?'Check sourcebook':''),duration:(sp.concentration===true?'Concentration · ':'')+(sp.duration||(manual?'Check sourcebook':'')),
 components:sp.components||(manual?'Check sourcebook':''),short:manual?(sp.description||'Refer to sourcebook'):String(sp.description||'').replace(/\s+/g,' ').slice(0,180),
 detail:sp.description||'',higherLevel:sp.higherLevel||'',concentration:sp.concentration===true,ritual:sp.ritual===true,
 concentrationKnown:typeof sp.concentration==='boolean',ritualKnown:typeof sp.ritual==='boolean',
 classes:sp.classes||[],resolution:manual?'Manual · check your sourcebook':'See spell description',
 origin:'catalog',source,sourceId:sp.sourceId||'srd-2024',referenceOnly:manual,
 aliases:root.FolioSpellExpansions?.aliases?.[sp.name]||[],sourceUrl:sp.sourceUrl||'',provenance:sp.provenance||'',legacyReference:!!sp.legacyReference,accessNote:sp.accessNote||'',raw:sp};
}
function snapshotSelections(book,keys){const snapshots={...(book.catalogSnapshots||{})};for(const key of keys){const sp=catalog().find(s=>s.key===key);if(sp?.referenceOnly)snapshots[key]={key:sp.key,name:sp.name,level:sp.level,classes:[...(sp.classes||[])],school:sp.school||'',castingTime:sp.castingTime||'',range:sp.range||'',components:sp.components||'',duration:sp.duration||'',concentration:sp.concentration??null,ritual:sp.ritual??null,sourceId:sp.sourceId||'',source:sp.source||'',referenceOnly:true,description:String(sp.description||'').slice(0,1500),sourceUrl:sp.sourceUrl||'',provenance:sp.provenance||'',legacyReference:!!sp.legacyReference,accessNote:sp.accessNote||''};}
 return {...book,catalogSnapshots:Object.fromEntries(Object.entries(snapshots).slice(-160))};}

// SRD 5.2.1 pp. 40, 70, 76: selected subclasses always prepare
// these spells at their listed CLASS level, even when absent from the base list.
// Spell grants do not count against ordinary preparation limits.
const SUBCLASS_GRANTS=Object.freeze({
 'Cleric:Life Domain':[[3,['Aid','Bless','Cure Wounds','Lesser Restoration']],[5,['Mass Healing Word','Revivify']],[7,['Aura of Life','Death Ward']],[9,['Greater Restoration','Mass Cure Wounds']]],
 'Sorcerer:Draconic Sorcery':[[3,['Alter Self','Chromatic Orb','Command',"Dragon's Breath"]],[5,['Fear','Fly']],[7,['Arcane Eye','Charm Monster']],[9,['Legend Lore','Summon Dragon']]],
 'Paladin:Oath of Devotion':[[3,['Protection from Evil and Good','Shield of Faith']],[5,['Aid','Zone of Truth']],[9,['Beacon of Hope','Dispel Magic']],[13,['Freedom of Movement','Guardian of Faith']],[17,['Commune','Flame Strike']]],
 'Paladin:Oath of Glory':[[3,['Guiding Bolt','Heroism']],[5,['Enhance Ability','Magic Weapon']],[9,['Haste','Protection from Energy']],[13,['Compulsion','Freedom of Movement']],[17,['Legend Lore',"Yolande's Regal Presence"]]],
 'Paladin:Oath of the Ancients':[[3,['Ensnaring Strike','Speak with Animals']],[5,['Misty Step','Moonbeam']],[9,['Plant Growth','Protection from Energy']],[13,['Ice Storm','Stoneskin']],[17,['Commune with Nature','Tree Stride']]],
 'Paladin:Oath of Vengeance':[[3,['Bane',"Hunter's Mark"]],[5,['Hold Person','Misty Step']],[9,['Haste','Protection from Energy']],[13,['Banishment','Dimension Door']],[17,['Hold Monster','Scrying']]],
 'Ranger:Fey Wanderer':[[3,['Charm Person']],[5,['Misty Step']],[9,['Summon Fey']],[13,['Dimension Door']],[17,['Mislead']]],
 'Ranger:Gloom Stalker':[[3,['Disguise Self']],[5,['Rope Trick']],[9,['Fear']],[13,['Greater Invisibility']],[17,['Seeming']]],
 'Warlock:Fiend Patron':[[3,['Burning Hands','Command','Scorching Ray','Suggestion']],[5,['Fireball','Stinking Cloud']],[7,['Fire Shield','Wall of Fire']],[9,['Geas','Insect Plague']]]
});
const LAND_CIRCLE_SPELLS=Object.freeze({
 arid:[[3,['Blur','Burning Hands','Fire Bolt']],[5,['Fireball']],[7,['Blight']],[9,['Wall of Stone']]],
 polar:[[3,['Fog Cloud','Hold Person','Ray of Frost']],[5,['Sleet Storm']],[7,['Ice Storm']],[9,['Cone of Cold']]],
 temperate:[[3,['Misty Step','Shocking Grasp','Sleep']],[5,['Lightning Bolt']],[7,['Freedom of Movement']],[9,['Tree Stride']]],
 tropical:[[3,['Acid Splash','Ray of Sickness','Web']],[5,['Stinking Cloud']],[7,['Polymorph']],[9,['Insect Plague']]]
});
function classGrantedSpellNames(c){
 const name=className(c),n=levelOf(c),sub=String(c?.build?.subclass||c?.subclass||'');
 const wildRituals=name==='Barbarian'&&sub==='Path of the Wild Heart'&&n>=3?['Beast Sense','Speak with Animals',...(n>=10?['Commune with Nature']:[])]:[];
 const arcaneHand=name==='Rogue'&&sub==='Arcane Trickster'&&n>=3?['Mage Hand']:[];
 const monkCantrips=name==='Monk'&&n>=3?(sub==='Warrior of Shadow'?['Minor Illusion']:sub==='Warrior of the Elements'?['Elementalism']:[]):[];
 const clericGrants=name==='Cleric'?(root.FolioCleric2024?.grantSpells(c)||[]):[];
 const bardGrants=name==='Bard'?[...(root.FolioBard2024?.grantSpells(c)||[]),...(sub==='College of Lore'&&n>=6?(c.build?.bardLoreDiscoveryNames||[]).slice(0,2):[])]:[];
 // Named 2024 PHB grants resolve to the corresponding openly licensed SRD
 // generic name (Evard's Black Tentacles => Black Tentacles, for example).
 // Keep the player's PHB names in FolioSorcerer2024.GRANTS for source auditing.
 const wizardGrants=name==='Wizard'?(root.FolioWizard2024?.schoolGrants(c)||[]):[];
 const warlockGrants=name==='Warlock'?(root.FolioWarlock2024?.granted(c)||[]):[];
 const sorcererGrants=name==='Sorcerer'?(root.FolioSorcerer2024?.grantSpells(c)||[]).map(granted=>{
  if(catalog().some(sp=>sp.name===granted))return granted;
  const alias=Object.entries(root.FolioSpellExpansions?.aliases||{}).find(([,names])=>names.includes(granted));
  return alias?.[0]||granted;
 }):[];
 const speciesGrants=(root.FolioSpecies2024?.grants(c)||[]);
 const originGrants=(root.FolioOrigin2024?.spellsFor(c)||[]);const featGrants=(root.FolioFeat2024?.spellsFor(c)||[]);
 const fixed=name==='Ranger'?["Hunter's Mark"]:name==='Druid'?['Speak with Animals']:name==='Paladin'?[...(n>=2?['Divine Smite']:[]),...(n>=5?['Find Steed']:[])]:[];
 const land=name==='Druid'&&sub==='Circle of the Land'?LAND_CIRCLE_SPELLS[c?.build?.landType]||[]:[];
 const druidCircle=name==='Druid'?({
  'Circle of the Moon':[[3,['Cure Wounds','Moonbeam','Starry Wisp']],[5,['Conjure Animals']],[7,['Fount of Moonlight']],[9,['Mass Cure Wounds']]],
  'Circle of the Sea':[[3,['Fog Cloud','Gust of Wind','Ray of Frost','Shatter','Thunderwave']],[5,['Lightning Bolt','Water Breathing']],[7,['Control Water','Ice Storm']],[9,['Conjure Elemental','Hold Monster']]],
  'Circle of the Stars':[[3,['Guidance','Guiding Bolt']]]
 }[sub]||[]):[];
 return [...new Set([...speciesGrants,...originGrants,...featGrants,...fixed,...clericGrants,...bardGrants,...sorcererGrants,...warlockGrants,...wizardGrants,...arcaneHand,...monkCantrips,...wildRituals,...(SUBCLASS_GRANTS[name+':'+sub]||[]).filter(([at])=>at<=n).flatMap(([,spells])=>spells),...land.filter(([at])=>at<=n).flatMap(([,spells])=>spells),...druidCircle.filter(([at])=>at<=n).flatMap(([,spells])=>spells)])];
}
function selectionSummary(c,book){const cls=className(c),limits=preparationLimits(c),selected=selectedIds(book),counts={cantrips:0,prepared:0,granted:classGrantedSpellNames(c).length,arcanum:{6:0,7:0,8:0,9:0}};for(const key of selected){const sp=getSpell(key,book);if(!sp)continue;if(cls==='Warlock'&&sp.level>=6)counts.arcanum[sp.level]=(counts.arcanum[sp.level]||0)+1;else if(sp.level===0)counts.cantrips++;else if(classGrantedSpellNames(c).includes(sp.name)){}else counts.prepared++;}for(const sp of book.custom||[])if(sp.alwaysPrepared)counts.granted++;const issues=[];if(counts.cantrips>limits.cantrips)issues.push({key:'cantrips',used:counts.cantrips,limit:limits.cantrips});if(counts.prepared>limits.prepared)issues.push({key:'prepared',used:counts.prepared,limit:limits.prepared});for(const lvl of [6,7,8,9]){const max=cls==='Warlock'&&levelOf(c)>=11+(lvl-6)*2?1:0;if(counts.arcanum[lvl]>max)issues.push({key:'arcanum'+lvl,used:counts.arcanum[lvl],limit:max});}return {limits,counts,issues,selected};}
function selectionError(c,book,next){
 if(!Array.isArray(next)||next.some(x=>typeof x!=='string'))return 'Choose valid spell entries.';
 if(new Set(next).size!==next.length)return 'Each spell can be selected only once.';
 const before=selectionSummary(c,book),after=selectionSummary(c,{...book,catalogSelections:next});
 const available=new Set(availableSpells(c).map(x=>x.key));
 const oldSelected=new Set(before.selected);const granted=new Set(classGrantedSpellNames(c));
 for(const key of next){
  if(className(c)==='Wizard'&&c?.build?.wizardBookInitialized&&root.FolioWizard2024&&getSpell(key,book)?.level>0&&!oldSelected.has(key)&&!root.FolioWizard2024.hasBook(c,getSpell(key,book)))return 'First add this Wizard spell to your spellbook using the class sheet.';
  if(granted.has(getSpell(key,book)?.name)&&!oldSelected.has(key))return 'This spell is always prepared by your class; do not spend a preparation choice on it.';
  if(!available.has(key)&&!oldSelected.has(key))return 'That spell is unavailable for this class or level.';
 }
 for(const issue of after.issues){const old=before.issues.find(x=>x.key===issue.key)?.used||0;if(issue.used>old)return `Selection limit exceeded: ${issue.used} selected, limit ${issue.limit}.`;}
 return '';
}
function swapError(c,book,from,to,{levelUp=false}={}){
 const selected=selectedIds(book);
 if(!selected.includes(from))return 'Select a spell currently on your list.';
 if(selected.includes(to))return 'That spell is already selected.';
 const old=getSpell(from,book),incoming=getSpell(to,book);
 if(!old||!incoming)return 'Choose valid outgoing and incoming spells.';
 if((old.level===0)!==(incoming.level===0))return 'Replace a cantrip with another cantrip, or a leveled spell with another leveled spell.';
 if(className(c)==='Ranger'&&spellAccess(c).cantrips&&old.level===0&&!levelUp)return 'Druidic Warrior cantrips can only be replaced when you gain a Ranger level.';
 if(className(c)==='Paladin'&&spellAccess(c).cantrips&&old.level===0&&!levelUp)return 'Blessed Warrior cantrips can only be replaced when you gain a Paladin level, not after a Long Rest.';
 if(className(c)==='Warlock'&&(old.level>=6)!==(incoming.level>=6))return 'Mystic Arcanum must be replaced with an eligible spell of the same spell level.';
 if(className(c)==='Warlock'&&old.level>=6&&old.level!==incoming.level)return 'A Mystic Arcanum replacement must be of the same spell level.';
 return selectionError(c,book,[...selected.filter(id=>id!==from),to]);
}
function applyPreparedChanges(book){if(book.catalogPending)return {...book,catalogSelections:[...book.catalogPending],catalogPending:null};if(book.catalogQueued?.length){const [swap,...rest]=book.catalogQueued;return {...book,catalogSelections:[...new Set([...(book.catalogSelections||[]).filter(x=>x!==swap.from),swap.to])],catalogQueued:rest};}return book;}
function applyLevelUpChanges(book,count=1){let next={...book,catalogSelections:[...(book.catalogSelections||[])],catalogLevelUpQueued:[...(book.catalogLevelUpQueued||[])]};for(let i=0;i<count&&next.catalogLevelUpQueued.length;i++){const [swap,...rest]=next.catalogLevelUpQueued;next.catalogSelections=[...next.catalogSelections.filter(x=>x!==swap.from),swap.to];next.catalogLevelUpQueued=rest;}return next;}
function castOptions(c,book,resources,key){if(c?.templateKind==='starter'&&resources?.classState?.raging)return [];const sp=getSpell(key,book),wizard=root.FolioWizard2024,bookRitual=className(c)==='Wizard'&&wizard?.hasBook(c,sp)&&sp?.ritual===true,selected=bookRitual||classGrantedSpellNames(c).includes(sp?.name)||selectedIds(book).includes(key)||(book.custom||[]).some(x=>x.id===key&&x.alwaysPrepared)||(c.templateKind!=='starter'&&root.PipSpells?.activeSpells(book).includes(key));if(!sp||!selected)return [];if(className(c)==='Wizard'&&c?.build?.wizardBookInitialized&&sp.level>0&&!root.FolioWizard2024?.hasBook(c,sp)&&!classGrantedSpellNames(c).includes(sp.name))return [];if(className(c)==='Paladin'&&sp.name==='Divine Smite')return [];if(sp.origin==='catalog'&&!availableSpells(c).some(x=>x.key===key)&&!book.catalogSnapshots?.[key])return [];if(sp.level===0)return [{key:'cantrip',label:'Cantrip · no slot'}];const out=[];const species=root.FolioSpecies2024;const speciesKey=species?.speciesSpell(c,sp.name),speciesMagicConfigured=!['elf','gnome','tiefling'].includes(species?.id(c))||!!species?.spellAbility(c);if(speciesMagicConfigured&&speciesKey&&((resources?.speciesState?.charges?.[speciesKey]??species.specifications(c).find(x=>x.key===speciesKey)?.max??0)>0))out.push({key:'species-free',label:'Species magic · free cast ('+species.spellAbility(c).toUpperCase()+')'});if(speciesMagicConfigured&&species?.id(c)==='gnome'&&species.variant(c)==='Forest Gnome'&&sp.name==='Speak with Animals'&&species.charge(c,resources,'speak')>0)out.push({key:'species-free',label:'Forest Gnome · free cast'});const Origin=root.FolioOrigin2024;
 for(const feat of Origin?.MAGIC||[]){if(Origin?.has(c,feat)&&c.build?.originMagic?.[feat]?.spell===sp.name&&Origin.remaining(c,resources,'magic:'+feat)>0){const stats=Origin.magicStats(c,feat);if(stats)out.push({key:'origin-free:'+feat,label:feat+' · free cast (DC '+stats.saveDC+', +'+stats.attackBonus+' spell attack)'});}}
 const featFree=root.FolioFeat2024?.freeOption(c,sp.name,resources);if(featFree)out.push(featFree);
 if(sp.ritual&&(className(c)!=='Wizard'||root.FolioWizard2024?.hasBook(c,sp)))out.push({key:'ritual',label:'Ritual · no slot'});const cls=className(c);if(cls==='Paladin'&&sp.name==='Find Steed'&&((resources?.classResources?.['faithful-steed-free']??1)>0))out.push({key:'paladin-steed-free',label:'Faithful Steed · free casting'});if(cls==='Ranger'&&sp.name==="Hunter's Mark"&&((resources?.classResources?.['favored-enemy']??root.FolioClassMechanics?.resourcesFor(c).find(x=>x.key==='favored-enemy')?.max??0)>0))out.push({key:'ranger-free',label:'Favored Enemy · free casting'});if(cls==='Sorcerer'&&root.FolioSorcerer2024?.aberrant(c)&&levelOf(c)>=6&&sp.level>=1&&classGrantedSpellNames(c).includes(sp.name)&&(resources.classResources?.['sorcery-points']??levelOf(c))>=sp.level)out.push({key:'sorcerer-psionic',label:`Psionic Sorcery · ${sp.level} Sorcery Points (no slot)`});if(cls==='Warlock'){const W=root.FolioWarlock2024;if(W?.patron(c,'Archfey Patron')&&sp.name==='Misty Step'&&(resources.classResources?.['warlock-fey-steps']??W.cha(c))>0)out.push({key:'warlock-fey-step',label:'Steps of the Fey · free Misty Step'});const free={'Mage Armor':'Armor of Shadows','Levitate':'Ascendant Step','False Life':'Fiendish Vigor','Disguise Self':'Mask of Many Faces','Alter Self':'Master of Myriad Forms','Silent Image':'Misty Visions','Invisibility':'One with Shadows','Jump':'Otherworldly Leap','Arcane Eye':'Visions of Distant Realms','Speak with Dead':'Whispers of the Grave','Find Familiar':'Pact of the Chain'};if(free[sp.name]&&W?.has(c,free[sp.name]))out.push({key:'warlock-invocation',label:'Eldritch Invocation · no spell slot'});if(sp.name==='Contact Other Plane'&&W&&levelOf(c)>=9&&!resources.classState?.warlockContactUsed)out.push({key:'warlock-contact',label:'Contact Patron · free cast (once per Long Rest)'});if(sp.name==='Water Breathing'&&W?.has(c,'Gift of the Depths')&&(resources.classResources?.['warlock-depths']??1)>0)out.push({key:'warlock-depths',label:'Gift of the Depths · free cast'});}
 if(cls==='Wizard'&&root.FolioWizard2024){if(!selectedIds(book).includes(key)&&!classGrantedSpellNames(c).includes(sp.name)&&bookRitual)return out.filter(x=>x.key==='ritual');out.push(...root.FolioWizard2024.freeOptions(c,sp,resources));}
 if(cls==='Warlock'&&sp.level>=6){const arcanum=resources.mysticArcanum||{};if(arcanum[sp.level]>0)out.push({key:'arcanum'+sp.level,label:`Level ${sp.level} Mystic Arcanum`});return out;}const slots=resources.spellSlots||c.build?.slotMax||[];for(let lvl=sp.level;lvl<=9;lvl++)if(Number(slots[lvl-1]||0)>0)out.push({key:'slot'+lvl,label:`Level ${lvl} slot`});return out;}
function cast(c,book,resources,key,cost){const sp=getSpell(key,book),opt=castOptions(c,book,resources,key).find(x=>x.key===cost);if(!opt)throw Error('That spell cannot be cast with the selected resource.');const next={...resources,spellSlots:[...(resources.spellSlots||c.build?.slotMax||Array(9).fill(0))],mysticArcanum:{...(resources.mysticArcanum||{})}};if(cost.startsWith('slot')){const lvl=Number(cost.slice(4));if(next.spellSlots[lvl-1]<=0)throw Error('No spell slot remains.');next.spellSlots[lvl-1]--;if(root.FolioFeat2024?.has(c,'Boon of Spell Recall')&&lvl<=4&&Math.floor(Math.random()*4)+1===lvl){next.spellSlots[lvl-1]++;next.lastFeatEffect='Boon of Spell Recall: level-'+lvl+' spell slot was retained on d4 roll.';}}else if(cost==='wizard-signature'||cost==='wizard-mastery'||cost==='wizard-phantasmal'){const wizard=root.FolioWizard2024;if(!wizard?.freeOptions(c,sp,resources).some(o=>o.key===cost))throw Error('This free Wizard casting option is unavailable.');}
 else if(cost.startsWith('feat-free:')||cost.startsWith('feat-quick:')){const FT=root.FolioFeat2024;if(!FT)throw Error('Feat spell resource unavailable.');Object.assign(next,FT.freeCast(c,next,sp.name,cost));}
 else if(cost.startsWith('origin-free:')){const O=root.FolioOrigin2024,feat=cost.slice('origin-free:'.length);if(!O?.has(c,feat)||c.build?.originMagic?.[feat]?.spell!==sp.name||O.remaining(c,next,'magic:'+feat)<1)throw Error('Magic Initiate free cast is unavailable.');const state=O.normalize(c,next.originState||{},c);state.charges['magic:'+feat]--;next.originState=state;}
  else if(cost==='species-free'){const spec=root.FolioSpecies2024;if(!spec)throw Error('Species magic unavailable.');const spellKey=spec.speciesSpell(c,sp.name),speciesKey=spellKey||(spec.id(c)==='gnome'&&spec.variant(c)==='Forest Gnome'&&sp.name==='Speak with Animals'?'speak':'');if(!speciesKey||spec.charge(c,next,speciesKey)<1)throw Error('No free species spell casts remain.');const res=spec.normalize(c,next.speciesState,c);res.charges[speciesKey]--;next.speciesState=res;}
 else if(cost==='warlock-fey-step'){const W=root.FolioWarlock2024;if(!W?.patron(c,'Archfey Patron')||sp.name!=='Misty Step')throw Error('Steps of the Fey unavailable.');const left=next.classResources?.['warlock-fey-steps']??W.cha(c);if(left<1)throw Error('No free Steps of the Fey remain.');next.classResources={...next.classResources,'warlock-fey-steps':left-1};}
 else if(cost==='warlock-depths'){const W=root.FolioWarlock2024;if(!W?.has(c,'Gift of the Depths')||sp.name!=='Water Breathing'||(next.classResources?.['warlock-depths']??1)<1)throw Error('Gift of the Depths unavailable.');next.classResources={...next.classResources,'warlock-depths':0};}
 else if(cost==='warlock-contact'){if(className(c)!=='Warlock'||levelOf(c)<9||sp.name!=='Contact Other Plane'||next.classState?.warlockContactUsed)throw Error('Contact Patron unavailable.');next.classState={...next.classState,warlockContactUsed:true};}
 else if(cost==='warlock-invocation'){const free={'Mage Armor':'Armor of Shadows','Levitate':'Ascendant Step','False Life':'Fiendish Vigor','Disguise Self':'Mask of Many Faces','Alter Self':'Master of Myriad Forms','Silent Image':'Misty Visions','Invisibility':'One with Shadows','Jump':'Otherworldly Leap','Arcane Eye':'Visions of Distant Realms','Speak with Dead':'Whispers of the Grave','Find Familiar':'Pact of the Chain'};if(!root.FolioWarlock2024?.has(c,free[sp.name]||''))throw Error('Invocation is not known.');if(sp.name==='False Life'){next.tempHp=Math.max(next.tempHp||0,12);next.lastClassEffect={feature:'Fiendish Vigor',note:'Free False Life uses its maximum possible die result: 12 Temporary HP.',offered:12};}if(sp.name==='Mage Armor'){next.classState={...next.classState,warlockMageArmor:true};next.lastClassEffect={feature:'Armor of Shadows',note:'Mage Armor active: base AC 13 + Dexterity modifier for 8 hours while unarmored; mark expiration manually.'};}}
 else if(cost==='sorcerer-psionic'){const pts=next.classResources?.['sorcery-points']??levelOf(c);if(!root.FolioSorcerer2024?.aberrant(c)||levelOf(c)<6||sp.level<1||!classGrantedSpellNames(c).includes(sp.name)||pts<sp.level)throw Error('Psionic Sorcery requires granted spells and enough Sorcery Points.');next.classResources={...next.classResources,'sorcery-points':pts-sp.level};}else if(cost==='paladin-steed-free'){const max=root.FolioClassMechanics?.resourcesFor(c).find(x=>x.key==='faithful-steed-free')?.max;if(!max||(next.classResources?.['faithful-steed-free']??max)<1)throw Error('Faithful Steed free cast already used.');next.classResources={...(next.classResources||{}),'faithful-steed-free':0};}else if(cost.startsWith('arcanum')){const lvl=Number(cost.slice(7));if(!next.mysticArcanum[lvl])throw Error('Mystic Arcanum is already spent.');next.mysticArcanum[lvl]--;}if(sp.concentration&&!sp.referenceOnly){next.concentration=sp.name;next.lastConcentrationDC=null;}const nextBook={...book,castLog:[...(book.castLog||[]).slice(-39),{id:key,cost,manual:!!sp.referenceOnly,at:new Date().toISOString()}]};return {book:nextBook,resources:next};}
function mysticArcanumMax(c){if(className(c)!=='Warlock')return {};const lvl=levelOf(c),out={};for(const n of [6,7,8,9])if(lvl>=11+(n-6)*2)out[n]=1;return out;}
function mysticArcanumResources(c,previous={}){const max=mysticArcanumMax(c),out={};for(const [k,v] of Object.entries(max))out[k]=Math.min(v,Number.isInteger(previous[k])?previous[k]:v);return out;}
function shortRestResources(c,resources){if(className(c)==='Warlock')return {...resources,spellSlots:[...(c.build?.slotMax||Array(9).fill(0))]};return resources;}
function catalogKeyForName(name){const target=String(name||'').toLowerCase();return catalog().find(s=>s.name.toLowerCase()===target||(root.FolioSpellExpansions?.aliases?.[s.name]||[]).some(a=>a.toLowerCase()===target))?.key||null;}
root.FolioSpellRules={catalog,classGrantedSpellNames,spellAccess,availableSpells,preparationLimits,selectedIds,getSpell,normalizeSpell,snapshotSelections,selectionSummary,selectionError,swapError,applyPreparedChanges,applyLevelUpChanges,castOptions,cast,shortRestResources,mysticArcanumMax,mysticArcanumResources,catalogKeyForName,className,levelOf};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioSpellRules;
})(typeof window!=='undefined'?window:globalThis);
