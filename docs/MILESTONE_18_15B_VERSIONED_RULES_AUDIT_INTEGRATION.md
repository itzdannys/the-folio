# Milestone 18.15B — Rules version audit integrated (read-only)

**Release status:** Completed as an *audit-only integration batch*, **NOT** a completed rules import, mechanic engine revision, Paladin class, or end-to-end version-selection migration.

## Verified existing state before this batch

- Input: the user's `The_Folio_Milestone_18_15_PARTIAL_PHB_Paladin_Oaths(1).zip`, version `2.0.0-alpha.18.15-phb-paladin-batch-partial`.
- Baseline `npm test`: **438 / 438** passing.
- Existing `js/source-registry.js`: already tracks source-pack metadata, imported personal packs, source preferences and reference entries. This was **not replaced**.
- Existing source inventory exposed by `FolioSources.registry({})`: **562** entries: 12 classes, 15 subclasses, 26 species, 16 backgrounds, 25 feats, 430 spell entries (includes names/reference-only entries), and 38 weapons.
- Existing saved-character, builder, inventory, spellbook, homebrew, UI and Paladin mechanics are preserved.

## Added

- `js/rules-registry.js`: tested pure registry foundation previously developed as isolated batch 18.15A. Supports stable canonical/revision IDs, explicit reviewed supersession, source filtering, dependency blocking, duplicate/conflict diagnostics, mechanical status tracking, and migration previews.
- `js/rules-version-adapter.js`: a **read-only bridge** from Folio's actual built-in/pack catalogues to the registry. It does not attempt to enact effects described by metadata.
- Browser integration in `index.html` (two local scripts added without changing existing module order).
- `scripts/audit-rules.cjs` and `npm run audit:rules`: reproducible local audit summary; no online requests or saved-data writes.
- 24 new Node tests (13 underlying registry tests, 11 application-integration tests).

## Exact scope of verification

Current read-only snapshot: **562 existing source entries**. Of those, **524** currently have complete enough provenance metadata to become version-audit candidates. The other **38** are marked *pending metadata* because their existing source entries supply year-only dates; the application continues to display/use them as before.

Only **five source identities** have been explicitly marked *verified for the source/version audit*: Paladin, Oath of Devotion, Oath of Glory, Oath of the Ancients and Oath of Vengeance. Their mechanics status remains **partial**, never verified. **519** other candidate records are held in the *audit-review queue*; they are **not removed from the existing builder**. Their review queue status does not imply their current implementations are necessarily incorrect.

The identity mapping uses a deterministic ID projection for the audit, e.g. `dnd:subclass:paladin:oath-of-glory`. This is **not yet a migration-safe canonical ID contract for all content**, because source name/slug changes and conflicts across publications still require a reviewed stable mapping/alias table. No migration is automatically applied.

## Not yet implemented / limitations

- No external XML or JSON data ingestion. No external proprietary content bundled.
- No authoritative errata crawl, book-by-book source-verification, complete 2025–2026 option audit, automatic duplicate filtering in the builder, or existing saved-character ID conversion.
- No changes to actual Paladin, multiclassing, spellcasting or combat mechanics. Existing prior milestone limitations continue to apply.
- Version audit selects only source identities explicitly reviewed: this is **not** the same as presenting the latest official options in the production builder. The existing app still uses its legacy catalogues. Review/manual source mapping is required before enabling a verified registry for gameplay.
- Publication dates present as only a year in the old catalogue are intentionally **not guessed**. Dates for other entries are copied from existing Folio metadata, not independently reverified with publisher documentation.
- Homebrew / user pack entries remain separate and are never implicitly promoted as official data.

## Validation

- `npm test`: **462 / 462** passing (438 original + 24 new) in extracted source tree.
- `python tests/milestone18-15-phb-paladin-browser.py`: PASS — three new oath UIs, Vengeance attacks/spells, save/reopen and mobile.
- `python tests/milestone17-sources-browser.py`: PASS — sources preferences, local import and legacy character interactions.
- `python tests/browser-smoke.py`: PASS — Pip isolation, creation, weapons, spell casting, dice and mobile.
- `python tests/milestone18-15b-rules-registry-browser.py`: PASS — actual offline browser loads version audit with five Paladin identities after the builder initializes.
- `npm run audit:rules` prints source counts and selected identities without altering files.

## Next implementation batch

Build a reviewed **stable ID + supersession map** for one class at a time; verify official 2024 Paladin text and errata, then connect complete Paladin mechanics and full feature tests before labelling Paladin complete. This bridge is a safe staging layer, not the completed engine.
