(function(root){'use strict';
const ALLOWED=[4,6,8,10,12,20,100];
function randomBelow(max,source){
 if(typeof source==='function')return Math.max(0,Math.min(max-1,Math.floor(source()*max)));
 const cryptoObj=root.crypto;
 if(cryptoObj?.getRandomValues){const a=new Uint32Array(1),limit=Math.floor(4294967296/max)*max;do{cryptoObj.getRandomValues(a);}while(a[0]>=limit);return a[0]%max;}
 return Math.floor(Math.random()*max);
}
function rollDie(sides,source){if(!ALLOWED.includes(Number(sides)))throw Error('Unsupported die.');return randomBelow(Number(sides),source)+1;}
function parseExpression(input){const raw=String(input||'').replace(/\s+/g,'').toLowerCase();const m=raw.match(/^(\d{1,2})d(4|6|8|10|12|20|100)([+-]\d{1,4})?$/);if(!m)throw Error('Use a roll such as 2d6+3 or 1d20.');const count=Number(m[1]),sides=Number(m[2]),modifier=Number(m[3]||0);if(count<1||count>20)throw Error('Roll between 1 and 20 dice at a time.');return {count,sides,modifier,expression:raw};}
function rollExpression(input,source){const parsed=typeof input==='string'?parseExpression(input):input;const rolls=Array.from({length:parsed.count},()=>rollDie(parsed.sides,source));return {...parsed,rolls,total:rolls.reduce((a,b)=>a+b,0)+parsed.modifier};}
function rollD20(mode='normal',source){if(!['normal','advantage','disadvantage'].includes(mode))throw Error('Invalid d20 roll mode.');const rolls=[rollDie(20,source)];if(mode!=='normal')rolls.push(rollDie(20,source));const chosen=mode==='advantage'?Math.max(...rolls):mode==='disadvantage'?Math.min(...rolls):rolls[0];return {rolls,chosen,mode};}
root.FolioDice={ALLOWED,rollDie,parseExpression,rollExpression,rollD20};
if(typeof module!=='undefined'&&module.exports)module.exports=root.FolioDice;
})(typeof window!=='undefined'?window:globalThis);
