(function(root){'use strict';
// 2024 Player's Handbook Backgrounds and Origin Feats: compact gameplay implementation.
// Does not reproduce the book's prose. Situational outcomes remain player/DM-confirmed.
const PB=c=>2+Math.floor((Math.max(1,Number(c?.level)||1)-1)/4);
const M=(c,k='cha')=>Math.floor((Number(c?.scores?.[k]??10)-10)/2);
const PHB=new Set((root.FolioOrigins?.backgrounds||[]).map(b=>b.id));
const supported=c=>c?.templateKind==='starter'&&PHB.has(c?.build?.ids?.background);
const MAGIC=['Magic Initiate (Cleric)','Magic Initiate (Druid)','Magic Initiate (Wizard)'];
const ALL=['Alert','Crafter','Healer','Lucky',...MAGIC,'Musician','Savage Attacker','Skilled','Tavern Brawler','Tough'];
const SKILLS=['Acrobatics','Animal Handling','Arcana','Athletics','Deception','History','Insight','Intimidation','Investigation','Medicine','Nature','Perception','Performance','Persuasion','Religion','Sleight of Hand','Stealth','Survival'];
const ARTISAN=['Alchemist’s Supplies','Brewer’s Supplies','Calligrapher’s Supplies','Carpenter’s Tools','Cartographer’s Tools','Cobbler’s Tools','Cook’s Utensils','Glassblower’s Tools','Jeweler’s Tools','Leatherworker’s Tools','Mason’s Tools','Painter’s Supplies','Potter’s Tools','Smith’s Tools','Tinker’s Tools','Weaver’s Tools','Woodcarver’s Tools'];
const INSTRUMENT=['Bagpipes','Drum','Dulcimer','Flute','Horn','Lute','Lyre','Pan Flute','Shawm','Viol'];
const GAMING=['Dice Set','Dragonchess Set','Playing Card Set','Three-Dragon Ante Set'];
const TOOL_OTHER=['Disguise Kit','Forgery Kit','Herbalism Kit','Navigator’s Tools','Poisoner’s Kit','Thieves’ Tools'];
const TOOLS=[...new Set([...ARTISAN,...INSTRUMENT,...GAMING,...TOOL_OTHER])];
const featGrants=c=>{
 if(c?.templateKind!=='starter')return [];
 const b=c.build||{},ans=[b.backgroundFeat,b.speciesOriginFeatName,b.ids?.feat?b.feat:null];
 for(const [lv,ch] of Object.entries(b.advancementChoices||{}))if(+lv<=c.level&&ch?.type==='feat')ans.push(ch.featName);
 return ans.filter(Boolean).map(n=>n==='Fighting Style: Magic Initiate'?'Magic Initiate (Wizard)':n);
};
const has=(c,name)=>featGrants(c).includes(name);
const featCount=(c,name)=>featGrants(c).filter(n=>n===name).length;
const spellsFor=c=>Object.entries(c?.build?.originMagic||{}).filter(([feat,sel])=>has(c,feat)&&MAGIC.includes(feat)&&sel&&Array.isArray(sel.cantrips)&&sel.cantrips.length===2&&sel.spell&&['int','wis','cha'].includes(sel.ability)).flatMap(([,sel])=>[...sel.cantrips,sel.spell]);
const magicForSpell=(c,name)=>Object.entries(c?.build?.originMagic||{}).find(([feat,sel])=>has(c,feat)&&MAGIC.includes(feat)&&(sel?.spell===name||sel?.cantrips?.includes(name))&&Array.isArray(sel.cantrips)&&sel.cantrips.length===2&&['int','wis','cha'].includes(sel.ability))?.[0]||'';
const magicStats=(c,feat)=>{const ability=c?.build?.originMagic?.[feat]?.ability;return ['int','wis','cha'].includes(ability)?{ability,attackBonus:PB(c)+M(c,ability),saveDC:8+PB(c)+M(c,ability)}:null;};
function specifications(c){if(c?.templateKind!=='starter')return [];const names=featGrants(c);return [...new Set(names)].flatMap(name=>name==='Lucky'?[{key:'lucky',max:PB(c),reset:'long'}]:name==='Savage Attacker'?[{key:'savage',max:1,reset:'turn'}]:name==='Tavern Brawler'?[{key:'tavern-push',max:1,reset:'turn'}]:name==='Crafter'?[{key:'crafter-craft',max:1,reset:'long'}]:MAGIC.includes(name)?[{key:'magic:'+name,max:1,reset:'long'}]:[]);}
function normalize(c,state={},oldC=null){const orig=state&&typeof state==='object'?state:{};const prev=oldC||c;const oldMax=Object.fromEntries(specifications(prev).map(x=>[x.key,x.max]));const fresh=!oldC||oldC?.templateKind!=='starter';const charges={};for(const spec of specifications(c)){let n=orig.charges?.[spec.key];charges[spec.key]=fresh||!Number.isInteger(n)?spec.max:Math.min(spec.max,Math.max(0,n+Math.max(0,spec.max-(oldMax[spec.key]??spec.max))));}
 return {charges,last:fresh?'':String(orig.last||'').slice(0,350),lastSong:!fresh?orig.lastSong||'':'',equipmentAwarded:!!orig.equipmentAwarded,crafts:Array.isArray(orig.crafts)?orig.crafts.slice(0,12):[]};}
function rest(c,state={},kind='long'){const st=normalize(c,state,c);for(const spec of specifications(c))if(kind==='long'||kind==='short'&&spec.reset==='short'||kind==='turn'&&spec.reset==='turn')st.charges[spec.key]=spec.max;
 if(kind==='long')st.crafts=[];return st;}
const remaining=(c,r,key)=>r?.originState?.charges?.[key]??specifications(c).find(x=>x.key===key)?.max??0;
function updateState(s,note,patch={}){const c=s.character;const old=normalize(c,s.resources.originState||{},c);return {...s,resources:{...s.resources,originState:{...old,...patch,last:note},lastClassEffect:{feature:'Origin feat',note}}};}
function use(s,kind,{confirmed=false,target='',total=0,dc=0,choice='',instruments='',amount=0,self=false}={},roll=n=>Math.ceil(Math.random()*n)){
 const c=s.character,r=s.resources,pb=PB(c),f=kind==='lucky-self'||kind==='lucky-defense'?'Lucky':kind==='savage'?'Savage Attacker':kind==='tavern-push'?'Tavern Brawler':kind==='healer'?'Healer':kind==='musician'?'Musician':kind==='craft'?'Crafter':'';
 if(!f||!has(c,f))throw Error('This character does not have the selected Origin feat.');
 if(!confirmed)throw Error('Confirm the feat trigger and any target conditions before recording this effect.');
 const key=kind.startsWith('lucky')?'lucky':kind==='savage'?'savage':kind==='tavern-push'?'tavern-push':kind==='craft'?'crafter-craft':'';
 if(key&&remaining(c,r,key)<=0)throw Error('No uses remain for '+f+'.');
 let next=s,note='';let newCharges=null;
 if(kind==='lucky-self')note='Lucky: 1 Luck Point spent for Advantage on your D20 Test when rolling.';
 if(kind==='lucky-defense')note='Lucky: 1 Luck Point spent to impose Disadvantage on the confirmed incoming attack roll.';
 if(kind==='savage')note='Savage Attacker: once this turn, reroll the weapon damage dice on a confirmed hit; use either result. Calculate damage at the table.';
 if(kind==='tavern-push')note='Tavern Brawler: once this turn, the confirmed Unarmed Strike can push the creature 5 feet. DM confirms position.';
 if(key){const o=normalize(c,r.originState,c);newCharges={...o.charges,[key]:o.charges[key]-1};}
 if(kind==='healer'){
  const kits=s.inventory?.items||[];const kit=kits.find(x=>x.quantity>0&&/healer.?s kit/i.test(x.name)&&((x.maxCharges||10)>0)&&((x.charges===0&&x.maxCharges>0)?false:(x.maxCharges===0||x.charges>0)));
  if(!kit)throw Error('A Healer’s Kit with uses remaining must be in Inventory.');
  if(self&&!(r.hitDice>0))throw Error('No Hit Dice remain to expend for healing.');
  if(!self&&!String(target).trim())throw Error('Enter the recipient; their Hit Die is managed by their player.');
  const die=self?(c.build?.hitDie||8):Number(choice);
  if(![4,6,8,10,12,20].includes(die))throw Error('Choose the recipient’s Hit Die size.');
  const first=roll(die),second=first===1?roll(die):first,healing=second+pb;
  const nextItems=kits.map(x=>x.id===kit.id?{...x,maxCharges:x.maxCharges||10,charges:(x.maxCharges===0?10:x.charges)-1}:x);
  next={...s,inventory:{...s.inventory,items:nextItems},resources:{...r,...(self?{hitDice:r.hitDice-1,hp:Math.min(r.maxHp,r.hp+healing)}:{})}};
  note=`Battle Medic: one Healer's Kit use and ${self?'your':'the recipient’s'} Hit Die spent; d${die} (+reroll on 1 if needed) + PB = ${healing} healing${self?' applied':' for '+String(target).slice(0,65)+' (DM/other player applies)'}.`;
 }
 if(kind==='musician'){
  const names=String(target).split(',').map(x=>x.trim()).filter(Boolean);if(names.length===0||names.length>pb)throw Error('List 1–'+pb+' willing allies who heard the song.');
  if(!Array.isArray(c.build?.originMusicianTools)||c.build.originMusicianTools.length!==3)throw Error('First choose three musical instruments in the Origin feat panel.');
  note='Musician: on completing the confirmed Short/Long Rest, Heroic Inspiration offered to '+names.join(', ')+'. Other players record their own Inspiration.';
 }
 if(kind==='craft'){
  if(!choice||!root.FolioOrigins?.FAST_CRAFT?.[choice])throw Error('Choose a craftable item in the PHB table.');
  const tools=c.build?.originCrafterTools||[];const tool=root.FolioOrigins.FAST_CRAFT[choice];if(!tools.includes(tool))throw Error('You must be proficient with the listed Artisan’s Tools.');
  const equip=root.PipInventory||(typeof require==='function'?require('./inventory.js'):null),uid='origin-craft-'+(root.PipCore?.makeId?.()||Math.random().toString(36).slice(2));
  const weapon=root.FolioWeaponCatalog?.weapons?.find(w=>w.name===choice);
  const item=weapon?equip.gear(uid,choice,'weapon',1,'Crafter · expires at next Long Rest',{originCraft:true,weapon:{damage:weapon.damageDice,type:weapon.damageType,range:weapon.range||'5 ft',mastery:weapon.mastery,ability:weapon.properties.includes('Finesse')?'dex':'str',properties:weapon.properties.join(', '),propertyList:weapon.properties,kind:weapon.kind,category:weapon.category,grip:weapon.properties.includes('Two-Handed')?'two':'one'}}):equip.gear(uid,choice,'gear',1,'Crafter · expires at next Long Rest',{originCraft:true});
  next={...s,inventory:{...s.inventory,items:[...(s.inventory?.items||[]),item]}};
  note='Crafter: produced '+choice+' using '+tool+'. The created item expires at the next Long Rest.';
 }
 const old=normalize(c,next.resources.originState||{},c),patch={...(newCharges?{charges:newCharges}:{}),...(kind==='musician'?{lastSong:String(target).slice(0,250)}:{}),...(kind==='craft'?{crafts:[...(old.crafts||[]),next.inventory.items.at(-1).id]}:{})};
 return updateState(next,note,patch);
}
function startTurn(s){if(s?.character?.templateKind!=='starter')return s;const old=s.resources.originState||{};return {...s,resources:{...s.resources,originState:rest(s.character,old,'turn')}};}
function restState(s,kind='long'){const c=s.character;if(c?.templateKind!=='starter')return s;const old=s.resources.originState||{};const originState=rest(c,old,kind);
 if(kind==='long'){
  const crafted=new Set((old.crafts||[]));const inv=s.inventory||{items:[]};return {...s,inventory:{...inv,items:(inv.items||[]).filter(x=>!crafted.has(x.id))},resources:{...s.resources,originState}};
 }
 return {...s,resources:{...s.resources,originState}};
}
const selected=(c,key)=>c.build?.[key]||[];
function choose(s,{skilled=[],crafter=[],musician=[],magic={}}={}){
 const c=s.character;if(c.templateKind!=='starter')throw Error('Choose a character built with the 2024 builder.');
 const skillCount=featCount(c,'Skilled')*3,clean=a=>[...new Set(a.map(x=>String(x).trim()).filter(Boolean))];
 const picks=clean(skilled);if(picks.length>skillCount)throw Error('Too many Skilled proficiencies.');if(picks.some(x=>!SKILLS.includes(x)&&!TOOLS.includes(x)))throw Error('Choose valid skills or tools for Skilled.');
 const cp=clean(crafter),mp=clean(musician);if(cp.length>(has(c,'Crafter')?3:0)||cp.some(x=>!Object.values(root.FolioOrigins.FAST_CRAFT).includes(x)))throw Error('Choose up to three distinct Artisan’s Tools for Crafter.');if(mp.length>(has(c,'Musician')?3:0)||mp.some(x=>!INSTRUMENT.includes(x)))throw Error('Choose up to three Musical Instruments for Musician.');
 const updated={...(c.build?.originMagic||{})};const spellCat=root.FolioSpellRules?.catalog?.()||[];
 for(const [feat,pick] of Object.entries(magic)){
  if(!MAGIC.includes(feat)||!has(c,feat))throw Error('Magic Initiate feat not currently granted.');
  if(!pick||(!pick.spell&&!(pick.cantrips||[]).length)){delete updated[feat];continue;}
  const source=feat.match(/\(([^)]+)\)/)[1],cantrips=clean(pick.cantrips||[]),name=pick.spell;
  if(cantrips.length!==2||!name||!['int','wis','cha'].includes(pick.ability))throw Error('Magic Initiate requires two cantrips, one level-1 spell, and a casting ability.');
  if(!cantrips.every(n=>spellCat.some(sp=>sp.name===n&&sp.level===0&&(sp.classes||[]).includes(source)))||!spellCat.some(sp=>sp.name===name&&sp.level===1&&(sp.classes||[]).includes(source)))throw Error('Chosen spells must be from the selected feat spell list at the correct levels.');
  updated[feat]={cantrips,spell:name,ability:pick.ability};
 }
 const oldProf=[...(c.build?.originSkilled||[]),...(c.build?.originCrafterTools||[]),...(c.build?.originMusicianTools||[])];
 const otherSkills=(c.profSkills||[]).filter(x=>!oldProf.includes(x)),otherTools=(c.tools||[]).filter(x=>!oldProf.includes(x));
 const newBuild={...c.build,originSkilled:picks,originCrafterTools:cp,originMusicianTools:mp,originMagic:updated};
 return {...s,character:{...c,build:newBuild,profSkills:[...new Set([...otherSkills,...picks.filter(x=>SKILLS.includes(x))])],tools:[...new Set([...otherTools,...picks.filter(x=>TOOLS.includes(x)),...cp,...mp])]},resources:{...s.resources,originState:{...normalize(c,s.resources.originState||{},c),last:'Origin feat selections saved.'}}};
}
function awardEquipment(s){const b=s?.character?.build,old=s?.resources?.originState||{};if(!b||old.equipmentAwarded||!['A','B'].includes(b.backgroundEquipmentChoice)||!supported(s.character))return s;
 const record=(root.FolioOrigins?.backgrounds||[]).find(x=>x.name===b.background);if(!record)return s;
 const I=root.PipInventory||(typeof require==='function'?require('./inventory.js'):null),E=root.FolioEquipmentCatalog;
 const inv={...(s.inventory||{currency:{pp:0,gp:0,ep:0,sp:0,cp:0},transactions:[],items:[]}),items:[...(s.inventory?.items||[])],currency:{...(s.inventory?.currency||{})}};
 let gp=b.backgroundEquipmentChoice==='B'?50:Number(record.equipmentGp||0);
 inv.currency.gp=(inv.currency.gp||0)+gp;
 if(b.backgroundEquipmentChoice==='A')for(const [name,quantity] of record.equipmentA||[]){const v=name==='Chosen tool'?b.backgroundToolChoice:name==='Chosen instrument'?b.backgroundToolChoice:name==='Chosen gaming set'?b.backgroundToolChoice:name;
  if(!v)continue;
  const r=E?.records?.find(x=>x.name.toLowerCase()===v.toLowerCase());const id='origin-start-'+(root.PipCore?.makeId?.()||Math.random().toString(36).slice(2));
  const weapon=root.FolioWeaponCatalog?.weapons?.find(w=>w.name.toLowerCase()===v.toLowerCase());
  const item=weapon?I.gear(id,v,'weapon',1,'Starting equipment · '+record.name,{source:'PHB 24',weapon:{damage:weapon.damageDice,type:weapon.damageType,range:weapon.range||'5 ft',mastery:weapon.mastery,ability:weapon.kind==='Ranged'?'dex':weapon.properties.includes('Finesse')?'dex':'str',properties:weapon.properties.join(', '),propertyList:weapon.properties,kind:weapon.kind,category:weapon.category,grip:weapon.properties.includes('Two-Handed')?'two':'one'}}):r?E.toInventoryItem(r,id):I.gear(id,v,/(tools|supplies|kit|set|instrument)/i.test(v)?'tools':'gear',1,'Starting equipment · '+record.name,{source:'PHB 24'});
  item.quantity=quantity;if(/healer.?s kit/i.test(v)){item.charges=10;item.maxCharges=10;}
  inv.items.push(item);
 }
 return {...s,inventory:inv,resources:{...s.resources,originState:{...normalize(s.character,old,s.character),equipmentAwarded:true,last:'Starting '+b.background+' equipment ('+b.backgroundEquipmentChoice+') recorded.'}}};
}
root.FolioOrigin2024={PB,M,MAGIC,ALL,SKILLS,ARTISAN,INSTRUMENT,GAMING,TOOLS,featGrants,featCount,has,spellsFor,magicForSpell,magicStats,specifications,normalize,rest,remaining,use,startTurn,restState,choose,awardEquipment,supported};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioOrigin2024;
})(typeof window!=='undefined'?window:globalThis);
