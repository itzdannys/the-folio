(function(root){'use strict';
const C=root.PipCore || (typeof require==='function'?require('./core.js'):null);
const D=root.PipData || (typeof require==='function'?require('./data.js'):null);
const I=root.PipInventory || (typeof require==='function'?require('./inventory.js'):null);
const clone=x=>JSON.parse(JSON.stringify(x));
const allowedGroups=['Paladin','Oath','Species','Feat','Background','Item','Custom'];
const abilities=['str','dex','con','int','wis','cha'];
const limitedSlots=[
  null,[2,0],[2,0],[3,0],[3,0],[4,2],[4,2],[4,3],[4,3]
];
const preparedAt=[0,2,3,4,5,6,6,7,7];
const ensureCharacter=c=>({...c,featureEdits:c.featureEdits&&typeof c.featureEdits==='object'&&!Array.isArray(c.featureEdits)?c.featureEdits:{},customFeatures:Array.isArray(c.customFeatures)?c.customFeatures:[],overrides:c.overrides&&typeof c.overrides==='object'&&!Array.isArray(c.overrides)?c.overrides:{},tools:Array.isArray(c.tools)?c.tools:[],languages:Array.isArray(c.languages)?c.languages:[]});
const resourceCaps=level=>({layOnHands:5*level,channelDivinity:level>=3?2:0,slots1:(limitedSlots[level]||[4,3])[0],slots2:(limitedSlots[level]||[4,3])[1],hitDice:level});
function baseFeature(f,c){if(c.featureEdits[f.id])return {...f,...c.featureEdits[f.id],id:f.id,core:true};const feat={...f,core:true};if(f.id==='aura-protection'){feat.short=`+${C.mod(c.scores.cha)} to Pip’s and allies’ saving throws within 10 ft.`;feat.detail=`While Pip is conscious and able to grant the aura, add +${C.mod(c.scores.cha)} to saves within 10 feet. Includes concentration saves.`;}if(f.id==='lay-on-hands'){feat.short=`${5*c.level} HP healing pool per Long Rest; Bonus Action by touch.`;}return feat;}
function allFeatures(character){const c=ensureCharacter(character);return [...(c.templateKind==='starter'?[]:D.features.map(f=>baseFeature(f,c))),...c.customFeatures.map(f=>({...f,core:false}))];}
function featureList(character){return allFeatures(character).filter(x=>!x.hidden);}
function updateFeature(character,id,entry){const c=ensureCharacter(character);const clean={name:entry.name.trim(),group:entry.group,short:entry.short.trim(),detail:entry.detail.trim(),hidden:!!entry.hidden};if(!clean.name||!clean.short||!allowedGroups.includes(clean.group)||clean.name.length>90||clean.short.length>300||clean.detail.length>3000)throw Error('Enter a feature name, short description and valid group.');
 if(D.features.some(f=>f.id===id))return {...c,featureEdits:{...c.featureEdits,[id]:clean}};
 if(c.customFeatures.some(f=>f.id===id))return {...c,customFeatures:c.customFeatures.map(f=>f.id===id?{...f,...clean}:f)};
 return {...c,customFeatures:[...c.customFeatures,{id:id||('feature-'+C.makeId()),...clean}]};
}
function deleteFeature(character,id){const c=ensureCharacter(character);if(D.features.some(f=>f.id===id))throw Error('Built-in features are edited or hidden, not deleted.');return {...c,customFeatures:c.customFeatures.filter(f=>f.id!==id)};}
function resetFeature(character,id){const c=ensureCharacter(character);const changes={...c.featureEdits};delete changes[id];return {...c,featureEdits:changes};}
function normalizedResource(raw,id){const name=String(raw.name||'').trim(),max=Number(raw.max),current=Number(raw.current);const reset=String(raw.reset||'manual');if(!name||name.length>65||!Number.isInteger(max)||max<1||max>9999||!Number.isInteger(current)||current<0||current>max||!['manual','short','long'].includes(reset))throw Error('Resource needs a name, positive maximum, and current use within the limit.');return {id:id||('resource-'+C.makeId()),name,max,current,reset,note:String(raw.note||'').slice(0,500)};}
function saveResource(resources,raw,id){const item=normalizedResource(raw,id);return resources.some(r=>r.id===id)?resources.map(r=>r.id===id?item:r):[...resources,item];}
function adjustResource(resources,id,delta){return resources.map(r=>r.id===id?{...r,current:C.clamp(r.current+delta,0,r.max)}:r);}
function restResources(resources,kind){return resources.map(r=>['short','long'].includes(r.reset)&&(kind==='long'||r.reset==='short')?{...r,current:r.max}:r);}
function editorData(form,oldCharacter){const fd=new FormData(form),old=ensureCharacter(oldCharacter),scores={},profSaves=[],profSkills=[],expertise=[];for(const k of abilities){const n=Number(fd.get(k));if(!Number.isInteger(n)||n<1||n>30)throw Error('Ability scores must be whole numbers from 1 to 30.');scores[k]=n;if(fd.get('save-'+k)==='on')profSaves.push(k);}
 for(const [name] of D.skills){const p=String(fd.get('skill-'+name)||'none');if(p==='proficient'||p==='expertise')profSkills.push(name);if(p==='expertise')expertise.push(name);}
 const level=Number(fd.get('level')),speed=Number(fd.get('speed')),maxHp=Number(fd.get('maxHp'));
 if(!Number.isInteger(level)||level<1||level>20||!Number.isInteger(maxHp)||maxHp<1||maxHp>9999||!Number.isInteger(speed)||speed<0||speed>300)throw Error('Level, maximum HP or speed is out of range.');
 if(old.templateKind!=='starter'&&level>8)throw Error('Pip’s specialist spell rules are supported only through level 8.');if(old.templateKind==='starter'&&level!==old.level)throw Error('Use Build & Level to change class level and spell slots safely.');
 if(old.templateKind!=='starter'&&String(fd.get('className')||old.className).trim()!==old.className)throw Error('A Pip-based sheet cannot change classes safely yet. Create a neutral character to use the universal builder.');
 const list=key=>String(fd.get(key)||'').split(',').map(x=>x.trim()).filter(Boolean).slice(0,30);
 const overrides={};for(const key of ['ac','initiative','speed','spellDC','spellAttack','attackBonus','attackDamage']){const value=String(fd.get('override-'+key)||'').trim();if(value==='')continue;const n=Number(value);if(!Number.isInteger(n)||n< -99||n>999)throw Error('Manual overrides must be whole numbers or blank.');overrides[key]=n;}
 return {...old,name:String(fd.get('name')||old.name).trim().slice(0,65)||old.name,fullName:String(fd.get('fullName')||old.fullName).trim().slice(0,65),tagline:String(fd.get('tagline')||old.tagline).trim().slice(0,180),species:String(fd.get('species')||old.species).trim().slice(0,100),className:String(fd.get('className')||old.className).trim().slice(0,80),subclass:String(fd.get('subclass')||old.subclass).trim().slice(0,100),background:String(fd.get('background')||old.background).trim().slice(0,80),scores,profSaves,profSkills,expertise,level,speed,maxHp,tools:list('tools'),languages:list('languages'),overrides};
}
function computePreview(before,after,inventory){const x=C.derived(before,inventory),y=C.derived(after,inventory);const compare=(key,label)=>x[key]===y[key]?null:{label,previous:x[key],next:y[key]};const result=[compare('ac','Armor Class'),compare('initiative','Initiative'),compare('speed','Speed'),compare('pb','Proficiency bonus'),compare('attackBonus','Attack bonus'),compare('spellDC','Spell save DC'),compare('spellAttack','Spell attack')].filter(Boolean);
 for(const k of abilities)if(x.saves[k]!==y.saves[k])result.push({label:k.toUpperCase()+' saving throw',previous:x.saves[k],next:y.saves[k]});
 for(const [name] of D.skills)if(x.skills[name]!==y.skills[name])result.push({label:name,previous:x.skills[name],next:y.skills[name]});
 if(before.level!==after.level)result.push({label:'Level',previous:before.level,next:after.level});
 if(before.maxHp!==after.maxHp)result.push({label:'Max HP',previous:before.maxHp,next:after.maxHp});
 if(before.level!==after.level&&before.templateKind!=='starter'){const a=resourceCaps(before.level),b=resourceCaps(after.level);for(const k of Object.keys(a))if(a[k]!==b[k])result.push({label:({layOnHands:'Lay on Hands cap',hitDice:'Hit Dice cap',channelDivinity:'Channel Divinity cap',slots1:'1st-level slots',slots2:'2nd-level slots'})[k],previous:a[k],next:b[k]});}
 return result;
}
function applyCharacterState(state,character){const old=state.character,c=ensureCharacter(character),r=state.resources;
 if(c.templateKind==='starter'&&c.build){const base={...(c.build.baseScores||c.scores)};for(const k of abilities){base[k]=Math.min(30,Math.max(1,(base[k]||10)+(c.scores[k]-old.scores[k])));}c.build={...c.build,baseScores:base,scores:{...c.scores}};}const oldCap=resourceCaps(old.level),newCap=resourceCaps(c.level),newResources={...r,maxHp:c.maxHp,hp:C.clamp(r.hp+(c.maxHp-old.maxHp),0,c.maxHp)};
 for(const k of Object.keys(newCap)){if(c.templateKind==='starter'&&k!=='hitDice')continue;if(k==='hitDice'&&c.level>old.level)newResources[k]=C.clamp(r[k]+c.level-old.level,0,newCap[k]);else newResources[k]=C.clamp((r[k]??0)+Math.max(0,newCap[k]-oldCap[k]),0,newCap[k]);}
 return {...state,character:c,resources:newResources};}
root.PipCharacter={allowedGroups,abilities,limitedSlots,preparedAt,ensureCharacter,resourceCaps,featureList,allFeatures,updateFeature,deleteFeature,resetFeature,normalizedResource,saveResource,adjustResource,restResources,editorData,computePreview,applyCharacterState};
if(typeof module!=='undefined'&&module.exports)module.exports=root.PipCharacter;
})(typeof window!=='undefined'?window:globalThis);
