/* The Folio — standalone, dependency-free rules identity/version registry.
 * Safe to include in Node or the offline browser app. Does not mutate saves.
 * No proprietary rule text is bundled. See README.md before integration.
 */
(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FolioRulesRegistry = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';
  const TYPES = new Set(['class', 'subclass', 'species', 'background', 'feat', 'spell', 'feature', 'weapon', 'armor', 'shield', 'equipment', 'magic-item', 'condition', 'rule', 'resource']);
  const SOURCE_KINDS = new Set(['official', 'official-digital', 'partnered', 'third-party', 'playtest', 'homebrew']);
  const DEFAULT_KINDS = new Set(['official', 'official-digital']);
  const STATUS = new Set(['unverified', 'reviewed', 'verified']);
  const MECHANICS = new Set(['none', 'data-only', 'partial', 'implemented', 'verified']);
  const ID = /^[a-z][a-z0-9]*(?:[.:_-][a-z0-9]+)*$/;
  const own = (v, k) => Object.prototype.hasOwnProperty.call(v, k);
  const isObject = v => v !== null && typeof v === 'object' && !Array.isArray(v);
  const clone = x => JSON.parse(JSON.stringify(x));
  const report = (code, message, context = {}) => ({ code, message, ...context });
  const checkDate = s => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(s + 'T00:00:00Z')) && new Date(s + 'T00:00:00Z').toISOString().slice(0, 10) === s;
  function validateSource(source) {
    const issues = [];
    if (!isObject(source)) return [report('invalid-source', 'Source must be an object')];
    if (!ID.test(source.id || '')) issues.push(report('bad-source-id', 'Source needs a stable machine ID'));
    if (!source.title || typeof source.title !== 'string') issues.push(report('bad-source-title', 'Source needs a title'));
    if (!SOURCE_KINDS.has(source.kind)) issues.push(report('bad-source-kind', 'Source kind is invalid'));
    if (!checkDate(source.publishedAt)) issues.push(report('bad-published-date', 'Source needs YYYY-MM-DD publication date'));
    if (!source.publisher || typeof source.publisher !== 'string') issues.push(report('bad-publisher', 'Source needs a publisher'));
    if (!['cc-by-4.0','other-approved','restricted','unknown'].includes(source.license)) issues.push(report('bad-license', 'Source needs an explicit license classification'));
    return issues;
  }
  function validateOption(option, sourceMap) {
    const issues = [];
    if (!isObject(option)) return [report('invalid-option', 'Rule option must be an object')];
    if (!ID.test(option.canonicalId || '')) issues.push(report('bad-canonical-id', 'Option needs a stable canonicalId'));
    if (!ID.test(option.revisionId || '')) issues.push(report('bad-revision-id', 'Option needs a unique revisionId'));
    if (!TYPES.has(option.type)) issues.push(report('bad-type', 'Unsupported rules type'));
    if (typeof option.name !== 'string' || !option.name.trim()) issues.push(report('bad-name', 'Option needs a name'));
    if (!sourceMap.has(option.sourceId)) issues.push(report('unknown-source', 'Option references an unknown source'));
    if (!STATUS.has(option.reviewStatus)) issues.push(report('bad-review-status', 'Option must be unverified/reviewed/verified'));
    if (!MECHANICS.has(option.mechanicsStatus)) issues.push(report('bad-mechanics-status', 'Option must declare its mechanics state'));
    if (!Array.isArray(option.supersedes || [])) issues.push(report('bad-supersedes', 'supersedes must be an array of revision IDs'));
    if (!Array.isArray(option.dependencies || [])) issues.push(report('bad-dependencies', 'dependencies must be an array of canonical IDs'));
    if (option.supersedes?.includes(option.revisionId)) issues.push(report('self-supersession', 'Revision cannot supersede itself'));
    if (option.dependencies?.includes(option.canonicalId)) issues.push(report('self-dependency', 'Option cannot depend on itself'));
    if (option.mechanicsStatus === 'verified' && (!Array.isArray(option.mechanicsTestIds) || option.mechanicsTestIds.length === 0)) issues.push(report('unproved-mechanics', 'Verified mechanics need test IDs'));
    return issues;
  }
  // Store only structured JSON; no automatic interpretation of prose as executable effects.
  function resolveRegistry({ sources = [], options = [], aliases = {}, includeKinds = [...DEFAULT_KINDS] } = {}) {
    const diagnostics = [], conflicts = [], duplicates = [], quarantined = [];
    if (!Array.isArray(sources) || !Array.isArray(options) || !isObject(aliases)) throw new TypeError('sources, options, or aliases have invalid container types');
    const sourceMap = new Map();
    for (const source of sources) {
      const issues = validateSource(source);
      if (issues.length) { diagnostics.push(...issues.map(x => ({ ...x, sourceId: source?.id }))); continue; }
      if (sourceMap.has(source.id)) { diagnostics.push(report('duplicate-source', 'Source ID occurs more than once', { sourceId: source.id })); continue; }
      sourceMap.set(source.id, source);
    }
    const allowed = new Set(includeKinds);
    for (const k of allowed) if (!SOURCE_KINDS.has(k)) throw new TypeError('Unsupported source kind: ' + k);
    const grouped = new Map(), byRevision = new Map();
    for (const raw of options) {
      const issues = validateOption(raw, sourceMap);
      if (issues.length) { quarantined.push({ option: clone(raw), reasons: issues }); continue; }
      const option = clone(raw), source = sourceMap.get(option.sourceId);
      if (!allowed.has(source.kind)) { quarantined.push({ option, reasons: [report('excluded-kind', 'Not in current official source filter', { kind: source.kind })] }); continue; }
      if (option.reviewStatus !== 'verified') { quarantined.push({ option, reasons: [report('not-verified', 'Manual verification against an authoritative source is required')] }); continue; }
      if (byRevision.has(option.revisionId)) {
        const first = byRevision.get(option.revisionId);
        if (JSON.stringify(first) === JSON.stringify(option)) duplicates.push(option.revisionId);
        else conflicts.push(report('revision-data-conflict', 'Same revision ID carries contradictory content', { revisionId: option.revisionId, canonicalId: option.canonicalId }));
        continue;
      }
      byRevision.set(option.revisionId, option);
      if (!grouped.has(option.canonicalId)) grouped.set(option.canonicalId, []);
      grouped.get(option.canonicalId).push(option);
    }
    const selected = [], unresolved = new Set();
    for (const [canonicalId, variants] of grouped) {
      if (conflicts.some(x => x.canonicalId === canonicalId)) { unresolved.add(canonicalId); continue; }
      const revisions = new Map(variants.map(v => [v.revisionId, v]));
      const superseded = new Set();
      let bad = false;
      for (const option of variants) for (const old of option.supersedes || []) {
        if (!revisions.has(old)) {
          // Supersession of a historical revision absent from this batch is permissible,
          // but still recorded for a later audit.
          diagnostics.push(report('outside-supersession', 'Superseded revision is not loaded in this batch', { canonicalId, revisionId: option.revisionId, target: old }));
          continue;
        }
        if (revisions.get(old).canonicalId !== canonicalId) { bad = true; break; }
        superseded.add(old);
        const predecessor = revisions.get(old), newer = sourceMap.get(option.sourceId), older = sourceMap.get(predecessor.sourceId);
        if (newer.publishedAt < older.publishedAt || (newer.publishedAt === older.publishedAt && option.revisionId === predecessor.revisionId)) {
          conflicts.push(report('invalid-supersession-date', 'Supersession cannot point to a later publication', { canonicalId, revisionId: option.revisionId }));
          bad = true;
        }
      }
      // A reviewer's explicit supersedes edge is required; date alone never wins.
      const heads = variants.filter(v => !superseded.has(v.revisionId));
      if (bad || heads.length !== 1) {
        conflicts.push(report('ambiguous-current-version', 'Cannot choose a latest version without an unambiguous reviewed supersession chain', { canonicalId, heads: heads.map(x => x.revisionId) }));
        unresolved.add(canonicalId); continue;
      }
      // Cycles disconnected from the selected head must not silently pass.
      const visited = new Set(), stack = new Set();
      function hasCycle(id) {
        if (stack.has(id)) return true;
        if (visited.has(id)) return false;
        visited.add(id); stack.add(id);
        const node = revisions.get(id);
        for (const old of node?.supersedes || []) if (revisions.has(old) && hasCycle(old)) return true;
        stack.delete(id); return false;
      }
      if (variants.some(v => hasCycle(v.revisionId))) {
        conflicts.push(report('supersession-cycle', 'Versions contain a cycle', { canonicalId })); unresolved.add(canonicalId); continue;
      }
      selected.push(heads[0]);
    }
    // Dependency errors are blockers, not just warnings: never activate partial
    // rules whose selected prerequisite was omitted, conflicted or quarantined.
    const selectedMap = new Map(selected.map(x => [x.canonicalId, x]));
    for (let changed = true; changed;) {
      changed = false;
      for (const option of [...selectedMap.values()]) {
        const missing = (option.dependencies || []).filter(dep => !selectedMap.has(dep));
        if (missing.length) {
          selectedMap.delete(option.canonicalId);
          quarantined.push({ option: clone(option), reasons: missing.map(dep => report('unresolved-dependency', 'Dependency missing from selected registry', { dependency: dep })) });
          diagnostics.push(...missing.map(dep => report('unresolved-dependency', 'Rule withheld because a dependency is missing', { canonicalId: option.canonicalId, dependency: dep })));
          changed = true;
        }
      }
    }
    const revisedSelected = [...selectedMap.values()];
    // Alias data does not rewrite saves. It is only an explicit migration proposal.
    for (const [legacy, current] of Object.entries(aliases)) {
      if (!ID.test(legacy) || !ID.test(current) || legacy === current) diagnostics.push(report('bad-alias', 'Invalid or self-referential alias', { legacy, current }));
      if (!selectedMap.has(current)) diagnostics.push(report('alias-target-missing', 'Alias target was not resolved', { legacy, current }));
      const seen = new Set([legacy]); let target = current;
      while (own(aliases, target)) {
        if (seen.has(target)) { diagnostics.push(report('alias-cycle', 'Alias graph contains a cycle', { legacy, current })); break; }
        seen.add(target); target = aliases[target];
      }
    }
    return {
      selected: clone(revisedSelected),
      conflicts: clone(conflicts),
      quarantined: clone(quarantined),
      duplicates: clone(duplicates),
      diagnostics: clone(diagnostics),
      totals: { candidateSources: sources.length, candidateOptions: options.length, selected: revisedSelected.length, quarantined: quarantined.length, conflicts: conflicts.length }
    };
  }
  function previewReferenceMigration(references, aliases, selectedOptions) {
    if (!Array.isArray(references) || !isObject(aliases) || !Array.isArray(selectedOptions)) throw new TypeError('Invalid migration input');
    const ids = new Set(selectedOptions.map(x => x.canonicalId));
    return references.map(originalId => {
      if (typeof originalId !== 'string') return { originalId, proposedId: originalId, status: 'invalid-reference' };
      const proposedId = own(aliases, originalId) ? aliases[originalId] : originalId;
      if (!ids.has(proposedId)) return { originalId, proposedId: originalId, status: 'unresolved-preserved' };
      return { originalId, proposedId, status: originalId === proposedId ? 'unchanged' : 'proposed-alias' };
    });
  }
  return Object.freeze({ validateSource, validateOption, resolveRegistry, previewReferenceMigration });
});
