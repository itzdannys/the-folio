# The Folio — Milestone 17.5: Expanded spell catalogue

**Build:** `2.0.0-alpha.17.5` (local, offline). **Based on:** Milestone 17.4 equipment release. **Status:** functional index expansion, not a completed all-books rules database.

## Delivered

The PHB (2024) indexes 391 spell names. Folio previously bundled 339 licensed SRD 5.2.1 spell records. The 17.5 reconciliation adds **52 distinctly named PHB reference entries**, and uses **17 aliases** for spells whose SRD names differ from PHB naming. This yields **391 distinct indexed names** without losing or renaming older saved SRD spell IDs. See `PHB_2024_SPELL_INDEX_AUDIT.md` for the exact reference list, grouped by spell level.

- **Spell discovery:** existing prepare/managing workflows index all 391 names, including class/level eligibility and a new Source filter. Rows show a source and whether complete SRD mechanics are available.
- **Spell details:** reference entries clearly identify their handbook, spell level, classes, and missing rules. Unknown concentration, ritual, time, components, range and duration remain unknown, not guessed. Bundled SRD spell descriptions and 339 practical guidance records are unchanged.
- **Prepared spells and casting:** compatible PHB-only reference names can be saved in a character's spellbook. The Cast action allows marking a slot spent, but **does not** resolve a reference spell or claim its effects, concentration, prerequisites, targets, dice or timing are automated. The full handbook remains necessary.
- **Personal source packs:** a local JSON import can provide spell names, levels, class lists, descriptions and optional metadata for a book you own or your own homebrew. Reference-only packs can be selected; source-pack metadata is saved in full-Library backups. Selected spell snapshots survive pack removal.
- **Compatibility:** existing SRD spell IDs, Pip specialist preparation, class-level limits, Spellbook organization, save/undo support and equipment functionality remain. No cloud calls, paid dependencies or server introduced.

## Source and rights distinction

The SRD catalogue is licensed open reference material. The 52 PHB-only entries are *identification metadata*, not official rules, and may not provide automated resolution. No commercial PHB, Tasha's, Xanathar's, Eberron or other non-SRD book contents were bulk copied. **All official sourcebooks** remains the planned long-term coverage of the unified catalogue. This build completes only the 2024 PHB name-index gap and optional personal import mechanism.

## Validation

- `npm test`: **216/216 passing** (nine new Milestone 17.5 tests).
- `python tests/milestone17-5-spells-browser.py`: Chromium reference/standard details, source filters, selection, reference-only cast warning, narrow viewport; passing.
- Inherited M16 Spellbook / M16.1 guidance / M17.2 backgrounds / M17.3 species / M17.4 equipment browser workflows: passing.
- **Not independently completed:** spell-by-spell updated official errata audit; full non-SRD mechanics; complete list of every spell across all official sourcebooks; complete multiclassed casters; real Windows `file://` persistence check.

## Upgrade safely

1. Export a **full Library JSON backup** from your current Folio and keep the previous folder.
2. Extract the 17.5 ZIP into a separate folder, launch `Open The Folio.cmd` and import the backup if necessary.
3. Check Pip's prepared spells/resources and at least one existing character. On a new Wizard, inspect a PHB-only reference such as *Arcane Vigor* to see the manual-rules warning; inspect an SRD spell like *Mage Armor* for the complete rules.
4. Close and reopen your browser, confirm characters and notes persist; verify backup export/import if you changed folders. Do not replace your old copy until satisfied.

## Reference sources

- Official SRD 5.2.1: https://www.dndbeyond.com/srd
- Official 2024 PHB updates: https://www.dndbeyond.com/posts/1810-updates-in-the-players-handbook-2024
- Official spell listings: https://www.dndbeyond.com/spells
