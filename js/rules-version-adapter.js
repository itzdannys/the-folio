(function(root){'use strict';
// Read-only bridge between Folio's actual existing catalogues and its newly
// versioned rules registry. It does NOT change builder options, apply imported
// effects, migrate saves, or activate unverified material.
const V=root.FolioRulesRegistry||(typeof require==='function'?require('./rules-registry.js'):null);
const S=root.FolioSources||(typeof require==='function'?require('./source-registry.js'):null);
// Builder loads later in index.html, so resolve it lazily when an audit runs.
const getBuilder=()=>root.FolioBuilder||(typeof require==='function'?require('./builder.js'):null);
if(!V||!S)throw Error('Folio version audit requires both rules-registry and source-registry.');
const TYPE_MAP=Object.freeze({class:'class',subclass:'subclass',species:'species',background:'background',feat:'feat',spell:'spell',weapon:'weapon',item:'equipment',feature:'feature'});
const slug=name=>String(name||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const idSafe=x=>/^[a-z][a-z0-9]*(?:[.:_-][a-z0-9]+)*$/.test(String(x||''));
const orderedSources=raw=>(raw||[]).slice().sort((a,b)=>String(a.id).localeCompare(String(b.id)));
const reviewedPaladin=new Set([
 'srd-2024|class|paladin',
 'srd-2024|subclass|oath-of-devotion',
 'phb-2024|subclass|oath-of-glory',
 'phb-2024|subclass|oath-of-the-ancients',
 'phb-2024|subclass|oath-of-vengeance'
]);
function sourceKind(pack){return String(pack.id).startsWith('user-')?'homebrew':'official';}
function sourceLicense(pack){return /CC BY 4\.0/i.test(pack.license||'')?'cc-by-4.0':String(pack.id).startsWith('user-')?'unknown':'restricted';}
function mechanicsStatus(item){return item.status==='automated'?'implemented':item.status==='partially automated'?'partial':item.status==='reference only'?'data-only':'none';}
function sourceManifest(lib){
 const sources=[], pending=[];
 for(const pack of orderedSources(S.allPacks(lib||{}))){
  if(sourceKind(pack)==='homebrew')continue; // Never elevate user-created records to official status.
  // The original catalog's "2026" is not a confirmed publication date.
  if(!/^\d{4}-\d{2}-\d{2}$/.test(pack.published||'')){
   pending.push({sourceId:pack.id,reason:'missing-verified-publication-date',provided:pack.published||''});continue;
  }
  const candidate={id:pack.id,title:pack.name,publisher:'Wizards of the Coast',publishedAt:pack.published,kind:sourceKind(pack),license:sourceLicense(pack),catalogStatus:pack.status};
  const issues=V.validateSource(candidate);
  if(issues.length){pending.push({sourceId:pack.id,reason:'invalid-source-metadata',issues});continue;}
  sources.push(candidate);
 }
 return {sources,pending};
}
function subclassParent(name){
 const item=(getBuilder()?.builtin?.subclass||[]).find(x=>x.name===name);
 if(!item?.classId)return null;
 const parent=slug(item.classId.replace(/^class:/,''));
 return parent?'dnd:class:'+parent:null;
}
function canonicalFor(item){
 const type=TYPE_MAP[item.category];const name=slug(item.name);
 if(!type||!name)return null;
 if(type==='subclass'){
  const parent=subclassParent(item.name);
  return parent?`${'dnd:subclass:'}${parent.slice('dnd:class:'.length)}:${name}`:null;
 }
 return `dnd:${type}:${name}`;
}
function candidates(lib,availableSources){
 const included=new Set(availableSources.map(x=>x.id));
 const records=[],pending=[],homebrew=[];
 for(const item of S.registry(lib||{})){
  if(String(item.sourceId).startsWith('user-')){homebrew.push({legacyId:item.id,sourceId:item.sourceId,type:item.category,name:item.name});continue;}
  if(!included.has(item.sourceId)){
   pending.push({legacyId:item.id,sourceId:item.sourceId,name:item.name,reason:'source-metadata-unverified'});continue;
  }
  const canonicalId=canonicalFor(item);
  if(!canonicalId||!idSafe(canonicalId)){
   pending.push({legacyId:item.id,sourceId:item.sourceId,name:item.name,reason:'unmapped-canonical-identity'});continue;
  }
  const type=TYPE_MAP[item.category];const key=`${item.sourceId}|${item.category}|${slug(item.name)}`;
  const deps=type==='subclass'?[subclassParent(item.name)].filter(Boolean):[];
  // Explicitly checked named selections only; a catalog record alone is NOT proof
  // that published wording, errata, prerequisites or effects have been reviewed.
  const reviewStatus=reviewedPaladin.has(key)?'verified':'reviewed';
  records.push({
   canonicalId,revisionId:`${canonicalId}:${item.sourceId}`,sourceId:item.sourceId,
   type,name:item.name,reviewStatus,mechanicsStatus:mechanicsStatus(item),
   dependencies:deps,supersedes:[],legacyId:item.id,
   sourceAvailability:item.status||'reference only'
  });
 }
 return {records,pending,homebrew};
}
function audit(lib={}){
 const {sources,pending:pendingSources}=sourceManifest(lib);
 const {records,pending:pendingOptions,homebrew}=candidates(lib,sources);
 const result=V.resolveRegistry({sources,options:records});
 return {kind:'read-only-audit',schemaVersion:1,sourceCount:sources.length,
  candidateCount:records.length,pendingSources,pendingOptions,
  homebrew,selected:result.selected,quarantined:result.quarantined,
  duplicates:result.duplicates,conflicts:result.conflicts,diagnostics:result.diagnostics,
  totals:result.totals};
}
function previewMigration(legacyIds,lib={}){
 const result=audit(lib);
 // Aliases are never guessed: the caller must explicitly approve every mapping.
 // Even if a recognizable legacy ID matches the name, it remains unchanged here.
 return V.previewReferenceMigration(legacyIds,{},result.selected);
}
const api=Object.freeze({sourceManifest,canonicalFor,audit,previewMigration});
root.FolioRulesVersionAudit=api;
if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
