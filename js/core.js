(function(root){'use strict';
if(!root.PipInventory && typeof require==='function')root.PipInventory=require('./inventory.js');
const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
const mod=(score)=>Math.floor((Number(score)-10)/2);
const proficiency=(level)=>2+Math.floor((Math.max(1,level)-1)/4);
const signed=(n)=>n>=0?'+'+n:String(n);
function derived(character,inventory){
 const pb=proficiency(character.level),dex=mod(character.scores.dex),cha=mod(character.scores.cha),castingAbility=character.templateKind==='starter'?(character.build?.spellAbility||'cha'):'cha',castMod=mod(character.scores[castingAbility]);
 const I=root.PipInventory,b=I?I.bonusSummary(inventory):{ac:0,attack:0,damage:0,saves:0,initiative:0,speed:0,spellDC:0,spellAttack:0,sources:[]};
 const armor=I?I.armorInfo(inventory,dex,character.templateKind==='starter'?0:cha):{base:10+dex+(character.templateKind==='starter'?0:cha),description:character.templateKind==='starter'?'Unarmored: 10 + DEX':'Genie’s Splendor: 10 + DEX + CHA'};if(character.templateKind==='starter'&&!inventory?.items?.some(i=>i.category==='armor'&&i.equipped))armor.description='Unarmored: 10 + DEX';
 const ac=armor.base+b.ac+(character.templateKind==='starter'?(character.build?.acBonus||0):0);
 const o=character.overrides||{},pick=(key,value)=>Number.isInteger(o[key])?o[key]:value;
 return {pb,ac:pick('ac',ac),armorDescription:armor.description,bonuses:b,overrides:o,initiative:pick('initiative',dex+b.initiative),speed:pick('speed',character.speed+b.speed),spellDC:pick('spellDC',8+pb+castMod+b.spellDC),spellAttack:pick('spellAttack',pb+castMod+b.spellAttack),
  aura:character.templateKind==='starter'?0:cha,attackBonus:pick('attackBonus',dex+pb+b.attack),attackDamage:pick('attackDamage',dex+b.damage),
  saves:Object.fromEntries(Object.entries(character.scores).map(([k,v])=>[k,mod(v)+(character.profSaves.includes(k)?pb:0)+b.saves])),
  skills:Object.fromEntries((root.PipData?root.PipData.skills:[]).map(([name,ability])=>[name,mod(character.scores[ability])+(character.profSkills.includes(name)?pb:0)+(character.expertise.includes(name)?pb:0)]))};
}
function applyDamage(resources,amount){
 amount=Math.max(0,Math.floor(Number(amount)||0));
 const absorbed=Math.min(resources.tempHp,amount);
 const hit=Math.max(0,amount-absorbed);
 return {...resources,tempHp:resources.tempHp-absorbed,hp:Math.max(0,resources.hp-hit),lastConcentrationDC:amount>0&&resources.concentration?Math.max(10,Math.floor(amount/2)):null};
}
function applyHealing(resources,amount){amount=Math.max(0,Math.floor(Number(amount)||0));const hp=clamp(resources.hp+amount,0,resources.maxHp);return {...resources,hp,deathSuccess:hp>0?0:resources.deathSuccess,deathFailure:hp>0?0:resources.deathFailure,lastConcentrationDC:null};}
function changeResource(resources,key,delta,max){return {...resources,[key]:clamp((resources[key]||0)+delta,0,max)};}
function sortRoster(roster){return [...roster].sort((a,b)=>b.initiative-a.initiative||a.tieRank-b.tieRank);}
function addActor(encounter,actor){const roster=sortRoster([...encounter.roster,{...actor,tieRank:Math.max(-1,...encounter.roster.map(x=>x.tieRank||0))+1}]);return {...encounter,active:true,roster};}
function beginEncounter(encounter,pipInitiative,id,name='Pip'){return {active:true,round:1,roster:[{id:id||'pip',name,initiative:pipInitiative,tieRank:0,isPip:true}],currentId:null};}
function nextTurn(encounter){
 if(!encounter.active||encounter.roster.length===0)return encounter;
 const i=encounter.roster.findIndex(x=>x.id===encounter.currentId);
 if(i<0)return {...encounter,currentId:encounter.roster[0].id};
 const next=i+1;return {...encounter,currentId:encounter.roster[next%encounter.roster.length].id,round:encounter.round+(next>=encounter.roster.length?1:0)};
}
function removeActor(encounter,id){
 const before=encounter.roster;const index=before.findIndex(x=>x.id===id);
 if(index<0)return encounter;
 const roster=before.filter(x=>x.id!==id);
 if(!roster.length)return {...encounter,roster:[],currentId:null};
 if(encounter.currentId!==id)return {...encounter,roster};
 // If the actor whose turn it is leaves, continue to the next actor at the same point in sequence.
 const wrapped=index>=roster.length;
 return {...encounter,roster,currentId:roster[index%roster.length].id,round:encounter.round+(wrapped?1:0)};
}
function setActorInitiative(encounter,id,value){return {...encounter,roster:sortRoster(encounter.roster.map(x=>x.id===id?{...x,initiative:value}:x))};}
function shiftTie(encounter,id,direction){
 const roster=[...encounter.roster],index=roster.findIndex(x=>x.id===id),target=index+direction;
 if(index<0||target<0||target>=roster.length||roster[index].initiative!==roster[target].initiative)return encounter;
 const a=roster[index],b=roster[target];const old=a.tieRank;a.tieRank=b.tieRank;b.tieRank=old;
 return {...encounter,roster:sortRoster(roster)};
}
function shortRest(resources,level=7){const cap=level>=3?(level>=11?3:2):0;return {...resources,channelDivinity:Math.min(cap,resources.channelDivinity+1)};}
function longRest(resources,level=7){const slots=level>=7?[4,3]:level>=5?[4,2]:level>=3?[3,0]:[2,0];return {...resources,hp:resources.maxHp,tempHp:0,layOnHands:level*5,slots1:slots[0],slots2:slots[1],channelDivinity:level>=3?(level>=11?3:2):0,hitDice:level,freeDivineSmite:level>=2?1:0,freeFindSteed:level>=5?1:0,freeHuntersMark:1,freeMistyStep:1,deathSuccess:0,deathFailure:0,lastConcentrationDC:null,concentration:'',conditions:[]};}
function makeId(){return typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2);}
root.PipCore={clamp,mod,proficiency,signed,derived,applyDamage,applyHealing,changeResource,sortRoster,addActor,beginEncounter,nextTurn,removeActor,setActorInitiative,shiftTie,shortRest,longRest,makeId};
if(typeof module!=='undefined'&&module.exports)module.exports=root.PipCore;
})(typeof window!=='undefined'?window:globalThis);
