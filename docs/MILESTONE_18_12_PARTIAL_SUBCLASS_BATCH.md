# Milestone 18.12 — Partial subclass-mechanics batch

**Scope:** SRD 5.2.1 subclasses: Life Domain Cleric, Fiend Patron Warlock, and Draconic Sorcery Sorcerer. This release is **partial**. It does not complete these subclasses, all core classes, the 2024 Player's Handbook, or the all-official-sourcebooks goal.

## Sources and rules authority

- Wizards of the Coast, *System Reference Document 5.2.1*, CC BY 4.0, pp. 40 (Life Domain), 69–70 (Draconic Sorcery), 76 (Fiend Patron). Source: https://www.dndbeyond.com/srd
- The PDF supplied by the project owner was checked against the mechanics implemented here. Only these explicitly identified SRD features are described as implemented.
- PHB-only and third-party non-SRD mechanics are not inferred from name-only catalogue entries.

## Mechanics implemented and tested

1. **Life Domain — Preserve Life (level 3)**: spend one Channel Divinity, allocate up to `5 × Cleric level` HP among eligible Bloodied creatures, and never heal the Cleric above half maximum HP. The Cleric's own HP changes in the app; other-creature allocations are recorded for the DM to apply. Costs, caps, level/class gates, and saved state are tested.
2. **Fiend Patron — Dark One's Blessing (level 3)**: gain nonstacking temporary HP of `max(1, Charisma modifier + Warlock level)` when the player confirms the enemy-defeated condition, with ally proximity confirmation where applicable.
3. **Fiend Patron — Dark One's Own Luck (level 6)**: spend one of `max(1, Charisma modifier)` long-rest uses and add a rolled d10 to a confirmed ability check or saving throw after the roll but before effects. DC, resource and result are recorded.
4. **Fiend Patron — Fiendish Resilience (level 10)**: explicitly select a non-Force damage type after confirming a Short or Long Rest. Incoming typed damage is automatically halved when it matches, with normal no-stacking and Resistance/Vulnerability precedence. Type can be changed at a later confirmed rest.
5. **Draconic Sorcery — Draconic Resilience (level 3)**: automatic suggested/max HP gains equal Sorcerer level from level 3 onward; unarmored AC is `10 + DEX mod + CHA mod`, with shield handled separately by the equipment system. Manual HP overrides remain manual and are not silently changed.
6. **Draconic Sorcery — Dragon Wings (level 14)**: track activation/dismissal, 60-foot flight, one free long-rest activation, and later activations spending 3 Sorcery Points. Duration and turn action economy remain manual.
7. **Always-prepared subclass spells:** full SRD lists for the three subclasses are granted at class levels 3/5/7/9, do not consume normal preparation selections, and can be cast from the existing Spellbook when the record and resource are available. Subclass grants do not become universal class spell access for other builds.

## Explicit limitations and unimplemented features

- **Life Cleric:** Disciple of Life, Blessed Healer and Supreme Healing need their additional healing effects wired into ordinary spell resolution. Preserve Life does *not* alter other characters' HP automatically.
- **Draconic Sorcerer:** Elemental Affinity's selected type/damage bonus/resistance and Dragon Companion are not implemented. Dragon Wings lasts up to one hour at the table; Folio records activation rather than ticking down time.
- **Fiend Warlock:** Hurl Through Hell is not implemented; Dark One's Own Luck requires player confirmation of timing; proximity and death triggers for Dark One's Blessing require player confirmation. Fiendish Resilience rests are confirmed rather than independently detected.
- **Shared engine:** No complete turn/target/party model, automatic status changes to other creatures, or complete spell-effect resolver. Many other classes and subclasses remain partial or unimplemented.
- The 430-entry catalogue from earlier milestones still includes many **reference-only** entries; this release does not turn them into full mechanics.

## Verification

- **379/379** automated Node tests passed in the working tree, including **12 new** focused tests for subclass rules and level-based spell grants.
- New Chromium workflow passed for Life, Fiend and Draconic character creation, subclass controls, save/reopen, and 390px mobile rendering.
- Earlier cross-class and Paladin, Ranger and PHB spell-browser tests passed in separate checks. Other older browser workflows were not exhaustively rerun in this release.
- ZIP integrity, fresh extraction and rerun testing are release requirements before shipping.

## Upgrade safety

Export a full Library JSON backup before testing the ZIP. Extract into a new folder. Do not overwrite a known-good build without verifying characters locally on Windows. No migration resets previously saved statistics intentionally; new subclass state is optional and defaults safely.
