(function(root){'use strict';
const TYPES=['Session','NPC','Location','Quest','Ruling','Relationship','Backstory','Note'];
const STATUSES=['Open','In progress','Completed','On hold'];
const clone=v=>JSON.parse(JSON.stringify(v));
const tidy=v=>String(v??'').trim();
const isDate=v=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const [year,month,day]=v.split('-').map(Number);const d=new Date(Date.UTC(year,month-1,day));return d.getUTCFullYear()===year&&d.getUTCMonth()+1===month&&d.getUTCDate()===day;};
const uniq=xs=>[...new Set(xs)];
function normalized(raw,prior){
 if(!raw||typeof raw!=='object')throw Error('Journal entry is missing');
 const title=tidy(raw.title),body=tidy(raw.body),type=TYPES.includes(raw.type)?raw.type:'Note';
 if(!title||title.length>120)throw Error('Give the entry a title (up to 120 characters).');
 if(!body||body.length>12000)throw Error('Write a note (up to 12,000 characters).');
 const date=tidy(raw.date);if(date&&!isDate(date))throw Error('Enter a valid date or leave it blank.');
 let tags=Array.isArray(raw.tags)?raw.tags:String(raw.tags||'').split(',');
 tags=uniq(tags.map(tidy).filter(Boolean)).slice(0,20);
 if(tags.some(t=>t.length>36))throw Error('Tags must be 36 characters or fewer.');
 const links=uniq((Array.isArray(raw.links)?raw.links:[]).filter(x=>typeof x==='string'&&/^(spell|feature|item):[\w-]{1,120}$/.test(x))).slice(0,30);
 const createdAt=prior?.createdAt||new Date().toISOString(),updatedAt=new Date().toISOString();
 return {id:prior?.id||tidy(raw.id)||'j-'+Math.random().toString(36).slice(2,11),type,title,body,date,tags,links,status:type==='Quest'?(STATUSES.includes(raw.status)?raw.status:'Open'):'',pinned:Boolean(raw.pinned),createdAt,updatedAt};
}
function validate(e){try{if(!e||typeof e.id!=='string'||!e.id||typeof e.pinned!=='boolean'||!Array.isArray(e.tags)||!Array.isArray(e.links)||typeof e.createdAt!=='string'||typeof e.updatedAt!=='string')return false;
 const n=normalized(e,e);return n.title===e.title&&n.body===e.body&&n.type===e.type&&n.date===e.date&&n.status===e.status&&n.tags.length===e.tags.length&&n.links.length===e.links.length;}catch{return false;}}
function migrate(entries){return Array.isArray(entries)?entries.filter(x=>x&&typeof x==='object'&&typeof x.title==='string'&&typeof x.body==='string').map(x=>{try{if(validate(x))return clone(x);const clean=normalized({...x,id:tidy(x.id)||undefined},x);if(x.updatedAt&&typeof x.updatedAt==='string')clean.updatedAt=x.updatedAt;return clean;}catch{return null}}).filter(Boolean):[];}
function upsert(entries,raw,id){const current=entries.find(e=>e.id===id);if(id&&!current)throw Error('Journal entry not found');const entry=normalized({...raw,id:id||raw.id},current);
 return current?entries.map(e=>e.id===id?entry:e):[...entries,entry];}
function remove(entries,id){return entries.filter(x=>x.id!==id);}
function pin(entries,id){return entries.map(e=>e.id===id?{...e,pinned:!e.pinned,updatedAt:new Date().toISOString()}:e);}
function setStatus(entries,id,status){if(!STATUSES.includes(status))throw Error('Unknown quest status');return entries.map(e=>e.id===id&&e.type==='Quest'?{...e,status,updatedAt:new Date().toISOString()}:e);}
function search(entries,filters={}){const q=tidy(filters.query).toLocaleLowerCase(),type=filters.type||'All',status=filters.status||'All',tag=tidy(filters.tag).toLocaleLowerCase();
 return entries.filter(e=>(type==='All'||e.type===type)&&(status==='All'||(e.type==='Quest'&&e.status===status))&&(!tag||e.tags.some(t=>t.toLowerCase()===tag))&&(!q||[e.title,e.body,e.type,e.status,e.date,...e.tags,...e.links].join(' ').toLocaleLowerCase().includes(q)))
 .sort((a,b)=>Number(b.pinned)-Number(a.pinned)||(b.date||b.updatedAt.slice(0,10)).localeCompare(a.date||a.updatedAt.slice(0,10))||b.updatedAt.localeCompare(a.updatedAt));}
function availableLinks(state){const spells=[...(root.PipSpells?.all||[]),...(state.spellbook?.custom||[])].map(s=>({id:'spell:'+s.id,name:s.name,group:'Spells'}));
 const features=(root.PipCharacter?.allFeatures?.(state.character)||[]).map(f=>({id:'feature:'+f.id,name:f.name,group:'Features'}));
 const items=(state.inventory?.items||[]).map(i=>({id:'item:'+i.id,name:i.name,group:'Items'}));
 return [...spells,...features,...items];}
function resolveLink(state,link){return availableLinks(state).find(x=>x.id===link)||{id:link,name:'Unavailable reference',group:'Missing'};}
root.PipJournal={TYPES,STATUSES,normalized,validate,migrate,upsert,remove,pin,setStatus,search,availableLinks,resolveLink,clone};
if(typeof module!=='undefined'&&module.exports)module.exports=root.PipJournal;
})(typeof window!=='undefined'?window:globalThis);
