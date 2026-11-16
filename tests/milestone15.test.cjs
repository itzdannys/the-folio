const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs'),path=require('node:path');
const FL=require('../js/layout.js'),ART=require('../js/artwork.js');
require('../js/inventory.js');require('../js/data.js');require('../js/core.js');require('../js/character.js');require('../js/journal.js');require('../js/appearance.js');
const S=require('../js/storage.js'),L=require('../js/library.js');
test('M15 default book emblem applies to Pip, starter characters, and missing legacy artwork',()=>{
 assert.equal(ART.sourceForEmblem({}), 'assets/folio-book.svg');
 assert.equal(ART.sourceForEmblem(undefined,true), 'assets/folio-book.svg');
 assert.equal(ART.sourceForEmblem(undefined,false), 'assets/folio-book.svg');
 const custom='data:image/png;base64,'+Buffer.from('custom').toString('base64');
 assert.equal(ART.sourceForEmblem({emblem:custom}),custom);
 assert.equal(ART.sourceForEmblem({emblemPreset:'butterfly'}),'assets/butterfly.svg');
 assert.equal(ART.sourceForEmblem({emblemPreset:'book'}),'assets/folio-book.svg');
 assert.equal(ART.validate({emblemPreset:'invalid'}),false);
 assert.match(fs.readFileSync(path.join(__dirname,'../assets/folio-book.svg'),'utf8'),/<svg/);
});
test('M15 layout default and normalization are bounded, complete, and independent',()=>{
 assert.deepEqual(FL.defaults(),FL.DEFAULT);
 const draft=FL.defaults();draft[0].pop();assert.equal(FL.DEFAULT[0].length,2);
 const cleaned=FL.normalize([['skills','skills','not-known'],['ability-scores'],['weapons-attacks']]);
 assert.deepEqual(cleaned.flat().sort(),FL.IDS.slice().sort());
 assert.equal(new Set(cleaned.flat()).size,7);
 assert.equal(FL.valid(FL.defaults()),true);
 assert.equal(FL.valid([['skills','skills'],[],[]]),false);
 assert.equal(FL.valid([['<script>'],[],[]]),false);
});
test('M15 movement updates column and slot and is reversible',()=>{
 let cols=FL.defaults();cols=FL.move(cols,'ability-scores',1,1);
 assert.deepEqual(cols[0],['saving-throws']);
 assert.deepEqual(cols[1],['skills','ability-scores','conditions-concentration']);
 cols=FL.move(cols,'ability-scores',0,0);
 assert.equal(FL.isDefault(cols),true);
});
test('M15 old saved characters accept new settings without adding to combat undo history',()=>{
 const first=L.fromLegacy(),id=first.characters[0].id,oldPast=first.characters[0].stack.past;
 const columns=FL.move(FL.defaults(),'skills',2,1);
 const stack=structuredClone(first.characters[0].stack);stack.present.layout={collapsedPanels:['sheet:skills'],sheetColumns:columns};
 const updated=L.replaceStack(first,id,stack);
 assert.equal(S.validate(updated.characters[0].stack.present),true);
 assert.deepEqual(updated.characters[0].stack.past,oldPast);
 const restored=L.normalize(updated);
 assert.deepEqual(restored.characters[0].stack.present.layout.sheetColumns,columns);
 assert.equal(restored.characters[0].stack.present.layout.collapsedPanels[0],'sheet:skills');
 const copied=L.duplicateCharacter(updated,id).data;
 assert.deepEqual(copied.characters[1].stack.present.layout.sheetColumns,columns);
 const malformed=structuredClone(stack.present);malformed.layout.sheetColumns=[['fake'],[],[]];
 assert.equal(S.validate(malformed),false);
});
test('M15 editor provides save, cancel, reset and pointer + accessible arrow interaction',()=>{
 const ui=fs.readFileSync(path.join(__dirname,'../js/ui.js'),'utf8'),main=fs.readFileSync(path.join(__dirname,'../js/main.js'),'utf8'),index=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 for(const action of ['layout-edit','layout-save','layout-cancel','layout-reset','layout-move'])assert.match(main+ui,new RegExp(action));
 assert.match(main,/setPointerCapture/);assert.match(main,/FL\.fromDOM/);
 assert.match(index,/js\/layout\.js/);
 assert.match(ui,/Edit layout/);
});
