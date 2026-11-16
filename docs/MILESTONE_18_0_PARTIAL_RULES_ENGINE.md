# Milestone 18.0 — Real class mechanics foundation (PARTIAL, not a completed milestone)

**Date:** November 15, 2026  
**Source of rules:** supplied *System Reference Document 5.2.1* (CC BY 4.0), pp. 7–8, 23–26 and 28–82. See `ATTRIBUTION.md`.

## Actual new behaviour

This release adds `js/class-mechanics.js` to the offline runtime. It is a small **working** rules engine, not another catalogue of names. Its rules are checked against SRD 5.2.1, and the implemented effects can change a character's HP, resources, spell slots, Armor Class, speed, or rolled weapon damage.

- **Class resource pools:** Rages, Bardic Inspiration, Cleric Channel Divinity, Druid Wild Shape, Fighter Second Wind/Action Surge/Indomitable, Monk Focus Points, Paladin Lay On Hands/Channel Divinity, Ranger free Hunter's Mark uses, Sorcerer Innate Sorcery/Sorcery Points/Restoration, Warlock Magical Cunning, Wizard Arcane Recovery. Rogue has no invented limited-use core pool. Values scale at verified class-level thresholds.
- **Short/long rests:** apply class-specific recovery instead of resetting every pool indiscriminately. Rage ends on rest. Existing Warlock Pact-slot restoration is preserved. **Some feature-specific recovery decisions remain manual.**
- **Barbarian:** entering Rage spends a use, requires no Heavy armor and clears concentration; Rage blocks Spellbook casting until ended, and the weapon roller adds the SRD Rage damage bonus for Strength attacks. Duration/round extension, Strength advantage and actual damage resistance are not yet automated.
- **Barbarian / Monk:** automatic Unarmored Defense AC when equipment permits; Monk's level-based Unarmored Movement; Barbarian Fast Movement; Ranger Roving speed. These feed the normal derived-stat card, not just a label.
- **Weapon attacks:** Fighter's 1 / 2 / 3 / 4 attacks per Attack action at the published thresholds are calculated (and displayed); other Extra Attack classes are displayed at level 5. This does *not* automatically roll a sequence of attacks. Rogue Sneak Attack dice scale by level and display as a reminder, not an automatic damage rider.
- **Fighter:** one-click Second Wind rolls a real d10, restores self HP up to maximum, spends one use, and supports Undo.
- **Paladin:** self-targeted Lay On Hands heals a chosen number of HP and deducts exactly that many points. Healing another character and condition removal still need separate workflows.
- **Warlock:** Magical Cunning restores the permitted number of expended Pact slots and spends its once-per-long-rest resource. Does not simulate ritual time.
- **Sorcerer:** Font of Magic slot-to-points and points-to-slot conversions with the 2/3/5/6/7 creation-cost table. Sorcerous Restoration recovers up to half the Sorcerer level in points after a Short Rest and consumes its once-per-long-rest use. The user remains responsible for declaring when that Short Rest has happened.
- **Persistence and safety:** new counters/state survive existing JSON save/backup normalization, existing Pip remains protected, individual characters keep their own values, and core mechanics support Undo through the existing transaction system. Old saves receive default counters without losing pre-existing resources.

## Still not implemented — do not mistake this for complete class support

- Not all class features or 2024 PHB subclasses are implemented; equipment training, additional class-skill choices, many feat effects, and starting gear are still incomplete.
- No full turn/action economy, Rage duration/automatic resistance, automatic Sneak Attack checks, multiclass rules, targets, summoned creatures, or GM rulings.
- Druid Wild Shape forms, Ranger Hunter's Mark free casting, Bardic Inspiration application, Arcane Recovery slot choice, and many other entries are **resource trackers only**. They must not be described as automatic ability implementations.
- The original SRD spell catalogue and PHB/supplement references are unchanged; 91 reference-only spells still lack verified bundled casting mechanics.
- PHB commercial-only content, newer sourcebooks, and every official character option are **not** bundled or completely implemented. Personal source-pack imports remain supported but don't automatically create mechanics.
- Windows `file://` storage/persistence and every possible level-1–20 class combination have not been independently tested in the user's real installation.

## Evidence

- `npm test`: **233/233 passing** (12 new targeted mechanics tests; 221 pre-existing tests preserved).
- `python tests/milestone18-class-mechanics-browser.py`: real browser clicks through Fighter, Barbarian, Paladin and Sorcerer resource workflows; 390px width.
- Passed regression suites: `browser-smoke.py`, `milestone16-browser.py`, `milestone17-2-origins-browser.py`, `milestone17-3-species-browser.py`, `milestone17-4-equipment-browser.py`, `milestone17-6-supplements-browser.py`, `milestone15-3-browser.py`.
- Browser tests use in-memory localStorage rather than Windows disk storage. **Passing them is not proof of full rules coverage.**

## Next necessary implementation (not completed by this release)

1. Complete SRD class level 1–20 feature rules and class-choice workflows (skills, fighting styles, invocations, spell preparation, feats, feature resources).
2. Mechanically implement the 12 SRD subclasses and all permitted core feats/species traits, with feature-specific tests.
3. Complete the broader 2024 PHB through verifiable rules/input from the user's sources; handle commercial text with appropriate rights.
4. Extend and verify content across other official books, then implement multiclass and difficult cross-source interactions.
5. Run Windows launcher/persistence checks and a coverage audit before using the word **complete** for any of the above.

**Release verdict:** Milestone 18 work has genuinely begun; **Milestone 18 is NOT COMPLETE**. Milestone 17 official-book coverage is also NOT COMPLETE.
