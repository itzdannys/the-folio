const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
require('../js/inventory.js');require('../js/data.js');require('../js/core.js');require('../js/character.js');require('../js/journal.js');require('../js/appearance.js');require('../js/storage.js');require('../js/builder.js');
const ART=require('../js/artwork.js'),L=require('../js/library.js');
const sample='data:image/webp;base64,'+Buffer.from('a portrait').toString('base64');
test('Artwork uses safe, bounded raster payloads only',()=>{
 assert.equal(ART.validate({portrait:sample}),true);
 assert.equal(ART.validate({portrait:'https://example.com/picture.png'}),false);
 assert.equal(ART.validate({portrait:'data:image/svg+xml;base64,PHN2Zy8+'}),false);
 assert.equal(ART.validate({portrait:'data:image/png;base64,'+'A'.repeat(200000)}),false);
 assert.equal(ART.normalize({portrait:'javascript:alert(1)',emblem:sample}).portrait,'');
 assert.equal(ART.normalize({portrait:'javascript:alert(1)',emblem:sample}).emblem,sample);
});
test('Token options clamp invalid values; default emblem now uses the book for all characters',()=>{
 const t=ART.tokenOptions({source:'fake',shape:'bad',zoom:100,x:600,y:-350,ringWidth:42,ringColor:'javascript:alert(1)'});
 assert.equal(t.zoom,3);assert.equal(t.x,100);assert.equal(t.y,-100);assert.equal(t.ringWidth,26);
 assert.equal(t.source,'portrait');assert.equal(t.shape,'circle');assert.equal(t.ringColor,'#c5a475');
 assert.equal(ART.sourceForEmblem(undefined,true),'assets/folio-book.svg');
 assert.equal(ART.sourceForEmblem(undefined,false),'assets/folio-book.svg');
});
test('M13 library loads into M14 without art and saves artwork outside Undo history',()=>{
 const before=L.fromLegacy(),cid=before.characters[0].id,past=before.characters[0].stack.past;
 const restored=L.normalize(before);assert.equal(restored.characters[0].artwork.portrait,'');
 const modified=L.setArtwork(restored,cid,{portrait:sample,emblem:sample,token:{source:'portrait',shape:'circle',ringColor:'#abcdef'}});
 assert.equal(modified.characters[0].artwork.portrait,sample);
 assert.deepEqual(modified.characters[0].stack.past,past);
 const second=L.addCharacter(modified,L.startCharacter({name:'Other'}));
 assert.equal(second.data.characters[1].artwork.portrait,'');
 assert.equal(second.data.characters[0].artwork.portrait,sample);
});
test('Character exports, library exports, imports and duplication preserve independent artwork',()=>{
 const start=L.fromLegacy(),cid=start.characters[0].id;
 const a=L.setArtwork(start,cid,{portrait:sample,emblem:sample,tokenImage:sample,token:{zoom:1.6,ringColor:'#123456'}});
 const single=L.exportCharacter(a,cid),read=L.importPackage(JSON.stringify(single));
 assert.equal(read.kind,'character');assert.equal(read.artwork.portrait,sample);assert.equal(read.artwork.token.zoom,1.6);
 const merged=L.mergePackage(a,read).data;assert.equal(merged.characters.length,2);assert.equal(merged.characters[1].artwork.tokenImage,sample);
 const dup=L.duplicateCharacter(a,cid).data;assert.equal(dup.characters[1].artwork.emblem,sample);
 const whole=L.importPackage(JSON.stringify(L.exportAll(merged)));assert.equal(whole.library.characters.length,2);
 assert.equal(whole.library.characters[1].artwork.portrait,sample);
 const oldBackup=require('../js/storage.js').bundle(a.characters[0].stack);assert.equal(L.importPackage(JSON.stringify(oldBackup)).kind,'character');
 assert.equal(L.mergePackage(a,L.importPackage(JSON.stringify(oldBackup))).data.characters[1].artwork.portrait,'');
});
test('M14 has custom emblem and artwork navigation while keeping Folio project branding',()=>{
 const ui=fs.readFileSync(path.join(__dirname,'../js/ui.js'),'utf8'),main=fs.readFileSync(path.join(__dirname,'../js/main.js'),'utf8');
 assert.match(ui,/data-action="open-artwork"/);assert.match(ui,/FolioArtwork\.sourceForEmblem/);
 assert.match(ui,/<img src="assets\/folio-book\.svg" alt=""\/>/);
 assert.match(main,/case 'artwork-save'/);assert.match(main,/AU\.downloadPNG/);
 assert.match(fs.readFileSync(path.join(__dirname,'../index.html'),'utf8'),/js\/artwork-ui.js/);
});
