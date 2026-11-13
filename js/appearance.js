(function(root){'use strict';
// Appearance data is deliberately independent from rules, characters, and dice randomness.
// Theme snapshots live in each character's save. No remote fonts, images or requests.
const PRESETS={
 classic:{name:'Classic Parchment',accent:'#886344',page:'#373b45',header:'#4b5060',panel:'#fff8ed',ink:'#302c32',line:'#cab79d',background:'#252934',diceFace:'#58546d',diceEdge:'#dec8a4',diceInk:'#fff5df'},
 masquerade:{name:'Midnight Masquerade',accent:'#c7a26d',page:'#18111b',header:'#39223b',panel:'#faf7ef',ink:'#332438',line:'#ccb18c',background:'#18111b',diceFace:'#49334e',diceEdge:'#d9bb8e',diceInk:'#f9e8c4'},
 forest:{name:'Enchanted Forest',accent:'#a6c29a',page:'#132720',header:'#26483e',panel:'#f0f5e9',ink:'#28433a',line:'#b1c1a2',background:'#10261d',diceFace:'#356450',diceEdge:'#b1d6ad',diceInk:'#f2ffec'},
 celestial:{name:'Celestial Archive',accent:'#b1c5ed',page:'#131c32',header:'#283b61',panel:'#f0f4fc',ink:'#263757',line:'#b4c7e0',background:'#141e35',diceFace:'#354e85',diceEdge:'#c3d4fc',diceInk:'#f7faff'},
 ember:{name:'Ember & Iron',accent:'#dfa66d',page:'#2b2523',header:'#51352e',panel:'#f7f0e6',ink:'#4b302d',line:'#d4b49b',background:'#26201f',diceFace:'#844a32',diceEdge:'#ecc093',diceInk:'#fff2d9'},
 minimal:{name:'Minimal Adventurer',accent:'#8298ae',page:'#202938',header:'#36465b',panel:'#f8fafc',ink:'#253345',line:'#bbc7d3',background:'#202938',diceFace:'#475971',diceEdge:'#b3c6d6',diceInk:'#f9feff'}
};
const DICE_STYLES={amethyst:'Amethyst & Gold',emerald:'Emerald Jade',steel:'Forged Steel',ivory:'Ivory & Ink',custom:'Custom colours'};
const TYPES=['editorial','classic','modern'],DENSITIES=['comfortable','compact'],POSITIONS=['center','top','bottom','left','right'];
const HEX=/^#[a-f\d]{6}$/i;const IMAGE=/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;
const copy=x=>JSON.parse(JSON.stringify(x));
const color=(v,def)=>typeof v==='string'&&HEX.test(v)?v.toLowerCase():def;
const finite=(v,a,b,def)=>Number.isFinite(Number(v))?Math.max(a,Math.min(b,Math.round(Number(v)))):def;
const oneOf=(v,list,def)=>list.includes(v)?v:def;
const cleanImage=src=>typeof src==='string'&&src.length<=180000&&IMAGE.test(src)?src:'';
function defaults(kind='starter'){return {preset:kind==='starter'?'classic':'masquerade',colors:{},font:'editorial',density:'comfortable',ornaments:true,backgroundImage:'',imagePosition:'center',imageDim:50,dice:{style:'amethyst',face:'',edge:'',ink:''}};}
function normalize(raw,kind='starter'){
 const b=defaults(kind),v=raw&&typeof raw==='object'?raw:{},preset=Object.prototype.hasOwnProperty.call(PRESETS,v.preset)?v.preset:b.preset;
 const cols={};for(const k of ['accent','page','header','panel','ink','line'])if(v.colors?.[k]&&HEX.test(v.colors[k]))cols[k]=v.colors[k].toLowerCase();
 const dice=v.dice||{};
 return {preset,colors:cols,font:oneOf(v.font,TYPES,b.font),density:oneOf(v.density,DENSITIES,b.density),ornaments:typeof v.ornaments==='boolean'?v.ornaments:b.ornaments,backgroundImage:cleanImage(v.backgroundImage),imagePosition:oneOf(v.imagePosition,POSITIONS,'center'),imageDim:finite(v.imageDim,0,90,50),dice:{style:Object.prototype.hasOwnProperty.call(DICE_STYLES,dice.style)?dice.style:'amethyst',face:color(dice.face,''),edge:color(dice.edge,''),ink:color(dice.ink,'')}};
}
function palette(raw,kind){const a=normalize(raw,kind);return {...PRESETS[a.preset],...a.colors};}
function dicePalette(raw,kind){const a=normalize(raw,kind);const options={amethyst:['#49334e','#d9bb8e','#f9e8c4'],emerald:['#356450','#b1d6ad','#f2ffec'],steel:['#4e5864','#c7d4df','#f8fafc'],ivory:['#e8dbc5','#5d514e','#28242b']};const fallback=options[a.dice.style]||[palette(a).diceFace,palette(a).diceEdge,palette(a).diceInk];return {face:color(a.dice.face,fallback[0]),edge:color(a.dice.edge,fallback[1]),ink:color(a.dice.ink,fallback[2])};}
function blendHex(a,b,t){return '#'+[1,3,5].map(i=>Math.round(parseInt(a.slice(i,i+2),16)*(1-t)+parseInt(b.slice(i,i+2),16)*t).toString(16).padStart(2,'0')).join('');}
function mix(c,f){const a=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));return '#'+a.map(n=>Math.max(0,Math.min(255,Math.round(n*f))).toString(16).padStart(2,'0')).join('');}
// Original local polyhedral SVG artwork is shipped as deterministic templates.
function diceSrc(n,appearance){const svg=root.FolioDiceTemplates?.[n];if(!svg)return 'assets/dice/d'+n+'.svg';const v=dicePalette(appearance),m={
 '#37253e':mix(v.face,.78),'#523653':v.face,'#624565':mix(v.face,1.21),'#705273':blendHex(v.face,v.ink,.28),'#dfc89c':v.edge,'#f4e8c8':v.ink,'#201227':mix(v.face,.52)
};const out=svg.replace(/#[0-9a-fA-F]{6}/g,hex=>m[hex.toLowerCase()]||hex);return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(out);}
function apply(body,raw,kind='starter',libraryMode=false){const a=normalize(raw,kind),p=palette(a,kind);body.dataset.folioTheme=libraryMode?'library':a.preset;body.dataset.hasBackground=!libraryMode&&!!a.backgroundImage?'yes':'no';body.classList.toggle('folio-themed',!libraryMode);for(const k of ['accent','page','header','panel','ink','line'])body.style.setProperty('--theme-'+k,p[k]);body.style.setProperty('--theme-position',a.imagePosition);body.style.setProperty('--theme-dim',String(a.imageDim/100));body.style.setProperty('--theme-image',!libraryMode&&a.backgroundImage?'url("'+a.backgroundImage+'")':'none');body.dataset.themeFont=a.font;body.dataset.themeDensity=a.density;body.dataset.themeOrnaments=a.ornaments?'yes':'no';}
function fromForm(form,prior,kind='starter'){
 const f=new FormData(form),v={...normalize(prior,kind),preset:String(f.get('preset')||'classic'),colors:{},font:String(f.get('font')||'editorial'),density:String(f.get('density')||'comfortable'),ornaments:f.has('ornaments'),imagePosition:String(f.get('imagePosition')||'center'),imageDim:Number(f.get('imageDim')),dice:{style:String(f.get('diceStyle')||'amethyst'),face:String(f.get('diceFace')||''),edge:String(f.get('diceEdge')||''),ink:String(f.get('diceInk')||'')}};
 for(const k of ['accent','page','header','panel','ink','line'])v.colors[k]=String(f.get(k)||'');
 return normalize(v,kind);
}
function contrast(c1,c2){const luminance=c=>{const rgb=[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];};const a=luminance(c1),b=luminance(c2);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);}
function savedTheme(name,appearance){name=String(name||'').trim().slice(0,60);if(!name)throw Error('Give the reusable theme a name');const a=normalize(appearance);return {id:'theme-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),name,appearance:a};}
function validateSavedTheme(item){return !!item&&typeof item.id==='string'&&item.id.length<=100&&typeof item.name==='string'&&item.name.length>0&&item.name.length<=60&&!!item.appearance&&JSON.stringify(item).length<185000;}
root.FolioAppearance={PRESETS,DICE_STYLES,defaults,normalize,palette,dicePalette,diceSrc,apply,fromForm,savedTheme,validateSavedTheme,cleanImage,mix,contrast};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioAppearance;
})(typeof window!=='undefined'?window:globalThis);
