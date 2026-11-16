'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
for(const f of ['data','inventory','class-mechanics','core','character','spell-catalog','spell-expansions','spell-supplements','weapon-catalog','builder','rules-registry','source-registry'])require('../js/'+f+'.js');
const A=require('../js/rules-version-adapter.js');
const S=require('../js/source-registry.js');
const R=require('../js/rules-registry.js');

test('HTML loads standalone version-registry before adapter, with no runtime fetch dependency',()=>{
 const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const pre=html.indexOf('src="js/rules-registry.js"'),src=html.indexOf('src="js/source-registry.js"'),adapter=html.indexOf('src="js/rules-version-adapter.js"');
 assert.ok(pre>0&&pre<src&&src<adapter);assert.equal(/https?:\/\//.test(html),false);
});
test('audit snapshots the existing Folio catalog, rather than fabricating imported rules',()=>{
 const snapshot=S.registry({}); const result=A.audit();
 assert.equal(snapshot.length,648); // Warlock and Wizard 2024 each add three subclass references
 assert.ok(result.candidateCount<=snapshot.length);
 assert.equal(result.candidateCount+result.pendingOptions.length+result.homebrew.length,snapshot.length);
 assert.equal(result.kind,'read-only-audit');
});
test('Paladin and four PHB oaths have one canonical ID each, not four separate classes',()=>{
 const r=A.audit();
 assert.deepEqual(r.selected.map(x=>x.name),['Paladin','Oath of Devotion','Oath of Glory','Oath of the Ancients','Oath of Vengeance']);
 assert.equal(new Set(r.selected.map(x=>x.canonicalId)).size,5);
 assert.ok(r.selected.filter(x=>x.type==='subclass').every(x=>x.dependencies[0]==='dnd:class:paladin'));
 assert.ok(r.selected.every(x=>x.mechanicsStatus==='partial'));
});
test('record metadata provenance is explicit and an audited name never claims verified mechanics',()=>{
 const r=A.audit();const oath=r.selected.find(x=>x.name==='Oath of Glory');
 assert.equal(oath.sourceId,'phb-2024'); assert.equal(oath.mechanicsStatus,'partial');
 assert.equal(oath.reviewStatus,'verified');assert.equal(oath.legacyId,'phb-2024:subclass:subclass:oath-of-glory');
});
test('all other class options stay in review until genuinely source-verified',()=>{
 const r=A.audit();
 assert.ok(r.quarantined.some(x=>x.option.name==='Wizard'));
 assert.ok(!r.selected.some(x=>x.name==='Wizard'));
 assert.equal(r.selected.length,5);
});
test('2026 sources with year-only metadata are pending and cannot silently activate options',()=>{
 const r=A.audit();assert.ok(r.pendingSources.find(x=>x.sourceId==='ravenloft-2026'));
 assert.ok(r.pendingSources.find(x=>x.sourceId==='lorwyn-2026'));
 assert.ok(r.pendingOptions.find(x=>x.sourceId==='ravenloft-2026'));
 assert.ok(r.pendingOptions.find(x=>x.sourceId==='lorwyn-2026'));
});
test('user-created source packs remain separated from official revision selection',()=>{
 const pack={id:'user-my-notes',name:'My notes',edition:'current',published:'2026-11-01',license:'User-provided',description:'',status:'user-entered',entries:[{id:'personal-oath',category:'subclass',name:'Oath of Glory',description:'Homebrew variant'}]};
 assert.ok(S.validPack(pack));
 const r=A.audit({sourcePacks:[pack]});
 assert.ok(r.homebrew.some(x=>x.name==='Oath of Glory'));
 assert.deepEqual(r.selected.map(x=>x.name),A.audit().selected.map(x=>x.name));
 assert.ok(!r.selected.some(x=>x.sourceId==='user-my-notes'));
});
test('audit is not a saved-data migration and does not alter library or builtins',()=>{
 const lib={sourcePacks:[],characters:[{id:'pip',stack:{present:{character:{name:'Pip',className:'Paladin',subclass:'Oath of Devotion'}}}}]};
 const before=JSON.stringify(lib),oldBuiltins=JSON.stringify(global.FolioBuilder.builtin);
 A.audit(lib); assert.equal(JSON.stringify(lib),before);
 assert.equal(JSON.stringify(global.FolioBuilder.builtin),oldBuiltins);
});
test('migration preview is conservative: no aliases without explicit human decision',()=>{
 const ids=['subclass:oath-of-glory','my-own-oath', 'dnd:subclass:paladin:oath-of-glory'];
 const out=A.previewMigration(ids);
 assert.deepEqual(out.map(x=>x.status),['unresolved-preserved','unresolved-preserved','unchanged']);
 assert.equal(out[0].proposedId,ids[0]);
});
test('reviewed supersession selects revised official option, not both, while preserving independent older ones',()=>{
 const manifest=A.sourceManifest({});
 const src=manifest.sources.filter(x=>['srd-2024','phb-2024'].includes(x.id));
 const testOpt=(canonicalId,revisionId,sourceId,supersedes=[])=>({canonicalId,revisionId,sourceId,type:'subclass',name:'Sample',reviewStatus:'verified',mechanicsStatus:'data-only',dependencies:[],supersedes});
 const opt1=testOpt('dnd:subclass:sample','r:one','phb-2024');
 const opt2=testOpt('dnd:subclass:sample','r:two','srd-2024',['r:one']);
 const other=testOpt('dnd:subclass:other','r:other','phb-2024');
 const r=R.resolveRegistry({sources:src,options:[opt1,opt2,other]});
 assert.deepEqual(r.selected.map(x=>x.revisionId),['r:two','r:other']);
});
test('invalid or unknown revision edges never turn into runtime modifications',()=>{
 const r=A.audit();assert.equal(r.conflicts.length,0);
 assert.equal(typeof A.previewMigration,'function');
 assert.equal(typeof A.canonicalFor,'function');
});
