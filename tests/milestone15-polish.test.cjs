const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ART=require('../js/artwork.js');
const data=(type='png')=>'data:image/'+type+';base64,'+Buffer.from('example').toString('base64');
test('M15.1 old artwork still loads with independent default icon and card choices',()=>{
 const a=ART.normalize({portrait:data(),emblemPreset:'butterfly'});
 assert.equal(a.sheetIcon,'emblem');assert.equal(a.cardImage,'portrait');
 assert.equal(ART.sourceForCard(a),a.portrait);assert.equal(ART.sourceForEmblem(a),'assets/butterfly.svg');
 assert.equal(ART.sourceForEmblem({}),'assets/folio-book.svg');
});
test('M15.1 library cards independently choose emblem, portrait, or saved token',()=>{
 const a={portrait:data(),emblem:data('webp'),tokenImage:data('jpeg')};
 assert.equal(ART.sourceForCard({...a,cardImage:'portrait'}),a.portrait);
 assert.equal(ART.sourceForCard({...a,cardImage:'emblem'}),a.emblem);
 assert.equal(ART.sourceForCard({...a,cardImage:'token'}),a.tokenImage);
 assert.equal(ART.cardIsPortrait({...a,cardImage:'emblem'}),false);
 assert.equal(ART.cardIsPortrait({...a,cardImage:'portrait'}),true);
 assert.equal(ART.sourceForCard({cardImage:'portrait'}),'assets/folio-book.svg');
});
test('M15.1 token can be the character icon while emblem remains preserved',()=>{
 const a={emblemPreset:'butterfly',sheetIcon:'token',tokenImage:data('webp')};
 assert.equal(ART.sourceForEmblem(a),a.tokenImage);
 assert.equal(ART.presetSource(a),'assets/butterfly.svg');
 assert.equal(ART.sourceForEmblem({...a,tokenImage:''}),'assets/butterfly.svg');
 assert.equal(ART.chooseSource({token:{source:'emblem'},emblemPreset:'book'}),'assets/folio-book.svg');
});
test('M15.1 invalid choices rejected and fallback safely',()=>{
 assert.equal(ART.validate({sheetIcon:'<script>'}),false);
 assert.equal(ART.validate({cardImage:'remote-url'}),false);
 assert.equal(ART.normalize({cardImage:'bad',sheetIcon:'bad'}).cardImage,'portrait');
 assert.equal(ART.normalize({cardImage:'bad',sheetIcon:'bad'}).sheetIcon,'emblem');
});
test('M15.3 exposes stable drag, in-editor reset, token icon shortcut, options and Undo',()=>{
 const main=fs.readFileSync(path.join(__dirname,'../js/main.js'),'utf8');
 const ui=fs.readFileSync(path.join(__dirname,'../js/ui.js'),'utf8');
 const artUI=fs.readFileSync(path.join(__dirname,'../js/artwork-ui.js'),'utf8');
 for(const key of ['layout-reset','layout-insert-before','layout-insert-after','sheetDrag.pending','event.deltaY'])assert.match(main+ui,new RegExp(key.replace('.','\\.')));
 assert.doesNotMatch(ui,/data-action="layout-reset-saved"/);
 assert.match(ui,/folio-options-menu/);assert.match(ui,/always-visible-undo/);
 assert.match(artUI,/CANVAS_PRESET_EMBLEMS/);
 assert.match(artUI,/artwork-card-image/);assert.match(artUI,/artwork-sheet-icon/);
 assert.match(artUI,/data-action="artwork-use-token-as-sheet"/);
 assert.match(main,/case 'artwork-use-token-as-sheet':saveArtworkDraft\(true\)/);
});
