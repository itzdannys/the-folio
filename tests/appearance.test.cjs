const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
require('../js/inventory.js');require('../js/data.js');require('../js/core.js');require('../js/character.js');require('../js/journal.js');
const A=require('../js/appearance.js');

const L=require('../js/library.js');
const S=require('../js/storage.js');
const here=require('node:path').join(__dirname,'..');
const src=p=>fs.readFileSync(require('node:path').join(here,p),'utf8');

test('new characters start neutral; migrated Pip retains masquerade',()=>{
 const pip=S.migrate(L.fromLegacy().characters[0].stack.present);assert.equal(pip.appearance.preset,'masquerade');
 const starter=L.startCharacter({name:'Amara',className:'Wizard'}).present;
 assert.equal(S.migrate(starter).appearance.preset,'classic');
});
test('all six presets have safe usable colours',()=>{
 assert.equal(Object.keys(A.PRESETS).length,6);
 for(const k of Object.keys(A.PRESETS)){const p=A.palette({preset:k});for(const colorKey of ['accent','page','header','panel','ink','line'])assert.match(p[colorKey],/^#[a-f0-9]{6}$/i);}
});
test('normalization prevents invalid colours, scriptable background urls, and oversized data',()=>{
 const x=A.normalize({preset:'oh-no',colors:{accent:'red;display:none',header:'#AABBCC'},backgroundImage:'url(javascript:alert(1))',dice:{face:'bad',style:'steel'},imageDim:777});
 assert.equal(x.preset,'classic');assert.equal(x.colors.accent,undefined);assert.equal(x.colors.header,'#aabbcc');assert.equal(x.backgroundImage,'');assert.equal(x.imageDim,90);assert.equal(x.dice.style,'steel');assert.equal(A.normalize({preset:'__proto__',dice:{style:'constructor'}}).preset,'classic');assert.equal(A.normalize({preset:'__proto__',dice:{style:'constructor'}}).dice.style,'amethyst');
 assert.equal(A.cleanImage('data:image/svg+xml;base64,PHN2Zz4='),'');
 assert.equal(A.cleanImage('data:image/png;base64,'+'A'.repeat(181000)),'');
});
test('custom text colours receive a useful contrast calculation',()=>{assert.ok(A.contrast('#ffffff','#000000')>20);assert.ok(A.contrast('#f0f0f0','#ececec')<4.5);});
test('Dice images show number-free SVG shapes and custom palette alters only display, not randomness',()=>{
 require('../js/dice-templates.js');const first=A.diceSrc(6,{dice:{style:'steel'}}),other=A.diceSrc(6,{dice:{style:'emerald'}});
 assert.ok(first.startsWith('data:image/svg+xml'));assert.ok(other.startsWith('data:image/svg+xml'));assert.notEqual(first,other);
 const svg=decodeURIComponent(first.split(',')[1]);assert.doesNotMatch(svg,/<text x=/);assert.match(svg,/d6 polyhedral die shape/);
 assert.doesNotMatch(src('js/appearance.js'),/Math\.random\(\)\s*\*\s*(?:4|6|8|10|12|20)/);
});
test('Appearance persists in per-character stack with Undo and backup',()=>{
 const pip=S.migrate(L.fromLegacy().characters[0].stack.present),old=L.fromLegacy({present:pip,past:[]}),cid=old.characters[0].id;
 const edited={...pip,appearance:A.normalize({preset:'forest',colors:{accent:'#00aa55'},dice:{style:'emerald'}})};
 const newer=L.replaceStack(old,cid,{present:edited,past:[pip]});
 assert.equal(newer.characters[0].stack.present.appearance.preset,'forest');
 assert.equal(newer.characters[0].stack.past[0].appearance.preset,'masquerade');
 const restored=S.importBackup(JSON.stringify(S.bundle(newer.characters[0].stack)));
 assert.equal(restored.present.appearance.colors.accent,'#00aa55');
 assert.equal(restored.past[0].appearance.preset,'masquerade');
});
test('Reusable themes appear in full library backups and do not overwrite other characters',()=>{
 let l=L.fromLegacy();const original=l.characters[0].stack.present.appearance;
 const t=A.savedTheme('Custom sea',A.normalize({preset:'celestial',colors:{accent:'#224466'}}));
 l={...l,themes:[t]};const pkg=L.importPackage(JSON.stringify(L.exportAll(l)));
 assert.equal(pkg.library.themes[0].name,'Custom sea');
 const copy=L.mergePackage(l,pkg).data;
 assert.equal(copy.themes.length,2);assert.notEqual(copy.themes[0].id,copy.themes[1].id);
 assert.deepEqual(l.characters[0].stack.present.appearance,original);
});
test('Existing v6 character backups without appearance still import',()=>{
 const sample=L.fromLegacy().characters[0].stack.present,backup=S.bundle({present:sample,past:[]});delete backup.present.appearance;
 const restored=S.importBackup(JSON.stringify(backup));assert.equal(restored.present.appearance.preset,'masquerade');
});
test('Appearance user interface is wired into render and controls',()=>{
 assert.match(src('js/ui.js'),/data-action="open-appearance"/);
 assert.match(src('js/main.js'),/case 'appearance-save-theme'/);
 assert.match(src('js/main.js'),/if\(form\.id==='appearance-form'\)/);
 assert.match(src('js/rules-ui.js'),/FolioAppearance\?\.diceSrc/);
 assert.match(src('index.html'),/js\/appearance-ui.js/);
});
