'use strict';
// Local-only, read-only inventory. Never changes profiles or imports online data.
for(const file of ['data','inventory','class-mechanics','core','character','spell-catalog','spell-expansions','spell-supplements','weapon-catalog','builder','rules-registry','source-registry','rules-version-adapter'])require('../js/'+file+'.js');
const a=global.FolioRulesVersionAudit.audit();
console.log('The Folio — read-only rules version audit');
console.log(`Existing candidate source catalogue: ${a.candidateCount+a.pendingOptions.length+a.homebrew.length} entries`);
console.log(`Catalogued with complete source dates: ${a.candidateCount}; pending source metadata: ${a.pendingOptions.length}`);
console.log(`Source records with full dates: ${a.sourceCount}; sources requiring date verification: ${a.pendingSources.length}`);
console.log(`Version records with explicitly reviewed source identity: ${a.selected.length}`);
console.log(`Candidates awaiting manual source/version verification: ${a.quarantined.length}`);
console.log(`Version conflicts: ${a.conflicts.length}; duplicate revision IDs: ${a.duplicates.length}`);
console.log(`Personal source-pack entries kept separate: ${a.homebrew.length}`);
console.log('Reviewed identities (NOT automatically certified mechanics):');
for(const entry of a.selected)console.log(`  ${entry.canonicalId} — ${entry.sourceId} — mechanics ${entry.mechanicsStatus}`);
console.log('Important: All existing builder choices remain available; no saves or rules are modified.');
