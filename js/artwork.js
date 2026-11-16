(function(root){'use strict';
// Media is stored once per library character, never once per combat Undo snapshot.
// Only canvas-processed raster data URLs are accepted, no remote URLs or SVG markup.
const LIMITS={portrait:190000,emblem:125000,tokenImage:120000};
const DATA=/^data:image\/(?:webp|png|jpeg);base64,[a-zA-Z0-9+/]+={0,2}$/;
const COLORS=['#c5a475','#f1e5cc','#c1c5d8','#7aa9a3','#af7e9f','#343e57'];
const clamp=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):fallback;
const image=(v,key)=>typeof v==='string'&&v.length<=LIMITS[key]&&DATA.test(v)?v:'';
const cleanColor=(v)=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v)?v.toLowerCase():'#c5a475';
function tokenOptions(raw){const t=raw&&typeof raw==='object'?raw:{};return {source:['portrait','emblem'].includes(t.source)?t.source:'portrait',shape:['circle','rounded'].includes(t.shape)?t.shape:'circle',zoom:clamp(t.zoom,1,3,1),x:clamp(t.x,-100,100,0),y:clamp(t.y,-100,100,0),ringWidth:Math.round(clamp(t.ringWidth,2,26,10)),ringColor:cleanColor(t.ringColor)};}
function defaults(){return {portrait:'',emblem:'',emblemPreset:'book',tokenImage:'',sheetIcon:'emblem',cardImage:'portrait',token:tokenOptions({})};}
function normalize(raw){const r=raw&&typeof raw==='object'?raw:{};return {portrait:image(r.portrait,'portrait'),emblem:image(r.emblem,'emblem'),emblemPreset:r.emblemPreset==='butterfly'?'butterfly':'book',tokenImage:image(r.tokenImage,'tokenImage'),sheetIcon:r.sheetIcon==='token'?'token':'emblem',cardImage:['portrait','emblem','token'].includes(r.cardImage)?r.cardImage:'portrait',token:tokenOptions(r.token)};}
function validate(raw){if(raw===undefined)return true;if(!raw||typeof raw!=='object'||Array.isArray(raw))return false;if(raw.emblemPreset!==undefined&&!['book','butterfly'].includes(raw.emblemPreset))return false;if(raw.sheetIcon!==undefined&&!['emblem','token'].includes(raw.sheetIcon))return false;if(raw.cardImage!==undefined&&!['portrait','emblem','token'].includes(raw.cardImage))return false;for(const key of Object.keys(LIMITS))if(raw[key]!==undefined&&raw[key]!==''&&!image(raw[key],key))return false;
 const t=raw.token;if(t!==undefined&&(!t||typeof t!=='object'||Array.isArray(t)))return false;
 if(t&&JSON.stringify(t).length>900)return false;
 return true;
}
function presetSource(a){return a.emblem||(a.emblemPreset==='butterfly'?'assets/butterfly.svg':'assets/folio-book.svg');}
function chooseSource(a){const art=normalize(a);return art.token.source==='emblem'?presetSource(art):(art.portrait||presetSource(art));}
function sourceForEmblem(art){const a=normalize(art);return a.sheetIcon==='token'&&a.tokenImage?a.tokenImage:presetSource(a);}
function sourceForCard(art){const a=normalize(art);if(a.cardImage==='token')return a.tokenImage||presetSource(a);if(a.cardImage==='emblem')return presetSource(a);return a.portrait||presetSource(a);}
function cardIsPortrait(art){const a=normalize(art);return a.cardImage==='portrait'&&!!a.portrait;}
function sourceForToken(art){const a=normalize(art);return a.tokenImage||chooseSource(a);}
root.FolioArtwork={LIMITS,COLORS,defaults,normalize,validate,tokenOptions,chooseSource,sourceForEmblem,sourceForCard,cardIsPortrait,sourceForToken,presetSource};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioArtwork;
})(typeof window!=='undefined'?window:globalThis);
