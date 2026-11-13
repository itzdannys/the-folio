const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const geometry=require('../js/dice-geometry.js');
const D=require('../js/dice-3d.js');
const appearance=require('../js/appearance.js');
require('../js/dice-templates.js');
const dice=require('../js/dice.js');
function near(a,b){return Math.abs(a-b)<1e-5;}
test('Number-free dice picker assets depict six correct polyhedral types',()=>{
 for(const sides of [4,6,8,10,12,20]){
  const svg=read(`assets/dice/d${sides}.svg`);
  assert.match(svg,/<polygon /);
  assert.doesNotMatch(svg,/<text[\s>]/i);
  assert.match(svg,new RegExp(`d${sides} polyhedral die shape`));
  const inlined=decodeURIComponent(appearance.diceSrc(sides,{dice:{style:'emerald'}}).split(',')[1]);
  assert.doesNotMatch(inlined,/<text[\s>]/i);
  assert.equal(geometry[sides].faces.length,sides);
  assert.ok(geometry[sides].vertices.every(v=>v.length===3));
 }
});
test('3D landing quaternions align the selected geometric face with the table',()=>{
 for(const sides of [4,6,8,10,12,20]){
  for(let value=1;value<=sides;value++){
   const q=D.landingQuaternion(sides,value,.8);
   const face=D.faceNormal(geometry[sides],geometry[sides].faces[value-1]);
   const rotated=D.rotate(q,face);
   assert.ok(near(rotated[0],0)&&near(rotated[2],0),`d${sides} face ${value} not aligned`);
   assert.ok(near(rotated[1],sides===4?-1:1));
  }
 }
});
test('3D mesh animation stays finite, keeps exact count, and reaches final quaternion',()=>{
 for(const sides of [4,6,8,10,12,20]){
  const values=Array.from({length:Math.min(sides,10)},(_,i)=>i+1);
  const scene=D.sceneDice(sides,values,1337);
  assert.equal(scene.length,values.length);
  for(const d of scene){for(const t of [0,.15,.35,.8,1]){
   const q=D.quaternionAt(d,t);
   assert.ok(q.every(Number.isFinite));assert.ok(near(Math.hypot(...q),1));
  }}
 }
});
test('Quick Roll numbers remain in result UI and RNG is separate from 3D geometry',()=>{
 const rolled=dice.rollExpression('2d6+3',()=>.25);
 assert.deepEqual(rolled.rolls,[2,2]);assert.equal(rolled.total,7);
 assert.match(read('js/main.js'),/DICE\.rollExpression/);
 assert.match(read('js/main.js'),/FolioDice3D\?\.mount/);
 assert.match(read('js/rules-ui.js'),/id="quick-roll-tray"/);
 assert.match(read('index.html'),/dice-geometry\.js/);
 assert.match(read('index.html'),/dice-3d\.js/);
});
test('Offline and reduced-motion settings are respected by the renderer',()=>{
 assert.doesNotMatch(read('js/dice-3d.js'),/fetch\(|import\(|https?:\/\//);
 assert.match(read('js/dice-3d.js'),/prefers-reduced-motion/);
 assert.match(read('css/style.css'),/\.quick-roll-tray/);
});
