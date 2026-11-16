'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const reg = require('../js/rules-registry.js');
const sources = [
  {id:'pub:old',title:'Older Rulebook',publisher:'Fixture Press',publishedAt:'2020-01-01',kind:'official',license:'restricted'},
  {id:'pub:new',title:'Revised Rulebook',publisher:'Fixture Press',publishedAt:'2024-09-01',kind:'official',license:'restricted'},
  {id:'pub:test',title:'Playtest',publisher:'Fixture Press',publishedAt:'2026-01-01',kind:'playtest',license:'unknown'},
  {id:'pub:third',title:'Third Party',publisher:'Somebody Else',publishedAt:'2026-09-01',kind:'third-party',license:'unknown'},
];
const opt = (canonicalId,revisionId,sourceId,other={}) => ({canonicalId,revisionId,sourceId,type:'feat',name:'Fixture Feat',reviewStatus:'verified',mechanicsStatus:'data-only',supersedes:[],dependencies:[],...other});
test('explicitly revised official version is selected without duplicate old option', () => {
  const out=reg.resolveRegistry({sources,options:[opt('dnd:feat:sample','rev:old','pub:old'),opt('dnd:feat:sample','rev:new','pub:new',{supersedes:['rev:old']})]});
  assert.deepEqual(out.selected.map(x=>x.revisionId),['rev:new']); assert.equal(out.conflicts.length,0);
});
test('older option remains if never superseded', () => {
  const out=reg.resolveRegistry({sources,options:[opt('dnd:feat:unique','rev:unique','pub:old')]});
  assert.equal(out.selected.length,1);
});
test('later publication without reviewed supersession is quarantined as ambiguous', () => {
  const out=reg.resolveRegistry({sources,options:[opt('dnd:feat:sample','rev:old','pub:old'),opt('dnd:feat:sample','rev:new','pub:new')]});
  assert.equal(out.selected.length,0);assert.equal(out.conflicts[0].code,'ambiguous-current-version');
});
test('excludes playtest and third party by default regardless of publication date', () => {
  const out=reg.resolveRegistry({sources,options:[opt('dnd:feat:test','rev:test','pub:test'),opt('dnd:feat:third','rev:third','pub:third')]});
  assert.equal(out.selected.length,0); assert.equal(out.quarantined.length,2);
});
test('unverified official material cannot silently replace older', () => {
  const out=reg.resolveRegistry({sources,options:[opt('dnd:feat:sample','rev:old','pub:old'),opt('dnd:feat:sample','rev:new','pub:new',{reviewStatus:'unverified',supersedes:['rev:old']})]});
  assert.equal(out.selected[0].revisionId,'rev:old'); assert.equal(out.quarantined.length,1);
});
test('identical repeats dedupe; contradictory repeat flags conflict', () => {
  const a=opt('dnd:feat:a','rev:a','pub:new');
  const one=reg.resolveRegistry({sources,options:[a,structuredClone(a)]});
  assert.equal(one.selected.length,1);assert.deepEqual(one.duplicates,['rev:a']);
  const two=reg.resolveRegistry({sources,options:[a,{...a,name:'Different'}]});
  assert.equal(two.selected.length,0);assert.equal(two.conflicts[0].code,'revision-data-conflict');
});
test('unmet references are diagnosed but do not crash the registry', () => {
  const result=reg.resolveRegistry({sources,options:[opt('dnd:feat:a','rev:a','pub:new',{dependencies:['dnd:class:missing']})]});
  assert.equal(result.selected.length,0);assert.equal(result.quarantined.length,1);assert.equal(result.diagnostics[0].code,'unresolved-dependency');
});
test('mechanics may not be marked verified without tests', () => {
  const result=reg.resolveRegistry({sources,options:[opt('dnd:feat:a','rev:a','pub:new',{mechanicsStatus:'verified'})]});
  assert.equal(result.selected.length,0);assert.equal(result.quarantined[0].reasons[0].code,'unproved-mechanics');
});
test('migration proposes aliases while preserving missing legacy references', () => {
  const selected=[opt('dnd:subclass:paladin:modern','rev:mod','pub:new')];
  const result=reg.previewReferenceMigration(['legacy:paladin:old','legacy:custom','dnd:subclass:paladin:modern'],{'legacy:paladin:old':'dnd:subclass:paladin:modern'},selected);
  assert.deepEqual(result.map(x=>x.status),['proposed-alias','unresolved-preserved','unchanged']);
  assert.equal(result[1].proposedId,'legacy:custom');
});
test('cyclic and self-replacing versions cannot be selected', () => {
  const out=reg.resolveRegistry({sources,options:[opt('dnd:feat:a','rev:a','pub:new',{supersedes:['rev:a']})]});
  assert.equal(out.selected.length,0);assert.equal(out.quarantined.length,1);
});
test('does not mutate source inputs', () => {
  const options=[opt('dnd:feat:a','rev:a','pub:new')], before=JSON.stringify(options);
  reg.resolveRegistry({sources,options}); assert.equal(JSON.stringify(options),before);
});

test('alias cycles are diagnosed', () => {
  const r=reg.resolveRegistry({sources,options:[opt('dnd:feat:a','rev:a','pub:new')], aliases:{'dnd:feat:one':'dnd:feat:two','dnd:feat:two':'dnd:feat:one'}});
  assert.ok(r.diagnostics.some(x=>x.code==='alias-cycle'));
});
test('works without Node module system for an offline browser', () => {
  const vm=require('node:vm'),fs=require('node:fs');
  const ctx={};vm.runInNewContext(fs.readFileSync(require.resolve('../js/rules-registry.js'),'utf8'),ctx);
  assert.equal(typeof ctx.FolioRulesRegistry.resolveRegistry,'function');
});
