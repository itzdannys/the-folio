# The Folio — Milestone 17.6: Official supplement spell references

## New in this build

- Added 39 name/level/source reference records beyond the PHB: 15 Wildemount dunamancy names, 5 Strixhaven spells, 12 Tasha's names not already in the 2024 PHB, and 7 Fizban's names. Total **430 indexed spell names**: 339 SRD entries with included rules, 52 PHB name-only references, and 39 additional commercial-book references.
- The new references can appear in the builder's spell selection for eligible class/level, and source filters distinguish the four publications. There are no duplicate names against the existing 391-entry base.
- Restricted Wildemount spells require an appropriate Wizard tradition in the automatic picker; do not treat them as generic Wizard spells. See the audit for the subclass-specific ambiguity.
- All 39 remain **reference-only**. The app refuses to invent casting-time, component, duration, concentration, effect, ritual, or damage automation. It can track a spell slot when selected and opened from the Spellbook.
- Old saved IDs, existing SRD spell rules, Pip's original Paladin sheet, Spellbook organization, saved sets, artwork, and previous backup formats are retained. Source-pack JSON imports still work.

## Not finished

- This is not a complete index of **all** official D&D spells, and enabling a sourcebook reference is not equivalent to importing commercial rules text.
- New records come from books originally published for older 5e. The current-2024 compatibility, class access, supersession and errata status are **not** comprehensively verified. Original sourcebooks and table approval may be required.
- Individual spell effects, components, concentration, and all sourcebook-derived subclass automation remain manual.
- Windows-specific storage across `file://` sessions has not been physically checked on the user's PC. Keep a complete JSON backup and try the build in a separate folder.

## Acceptance

- `npm test`: **221/221 passing** (five new targeted supplement tests; 216 existing tests).
- Browser: dedicated 17.6 supplement browser test passes at 390px, along with M17.5 spell index, M17.4 equipment, M17.3 species, M17.2 origins, and M16/M16.1 Spellbook workflows.
- See `docs/SUPPLEMENT_SPELL_INDEX_AUDIT.md` for the full list, source links and limitations.

No GitHub changes or external service connections were made.
