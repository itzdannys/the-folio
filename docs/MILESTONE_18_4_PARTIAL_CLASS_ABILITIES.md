# The Folio — Milestone 18.4 (PARTIAL): Three Functional Class Abilities

**Version:** `2.0.0-alpha.18.4-partial` · 15 November 2026. Based on the Milestone 18.3 project. **Not a complete Milestone 18, PHB 2024 implementation, or all-sourcebooks implementation.**

## Implemented (not just reference entries)

| Class / source | Actually functioning in this build | Remaining manual / not implemented |
|---|---|---|
| **Wizard — Arcane Recovery**, SRD 5.2.1 p. 77 | Select any valid combination of expended spell slots (level 1–5) with summed levels ≤ `ceil(Wizard level/2)`; restore slots, prevent over-recovery, spend the once-per-Long-Rest use; Long Rest resets it. | Player confirms that a Short Rest was completed and that the Wizard studied their spellbook. Rest timing is not simulated automatically. |
| **Druid — Wild Resurgence**, SRD 5.2.1 p. 42 | Level 5+: when Wild Shape has zero uses, spend a chosen available spell slot to restore one Wild Shape use. Alternatively expend one Wild Shape use to create one level 1 spell slot, with its own once-per-Long-Rest limit. Extra slot may exceed base capacity until Long Rest. | The once-per-turn limit for the slot→Wild Shape exchange is not automatically enforced; the player tracks combat turns. Wild Shape beast statistics/transformation remain incomplete. |
| **Cleric — Divine Spark**, SRD 5.2.1 p. 37 | Level 2+: expend one Channel Divinity use, roll 1d8+Wis, increasing to 2d8 at level 7, 3d8 at 13, 4d8 at 18. Record healing for another creature or Radiant/Necrotic damage with the Cleric spell-save DC, half damage on a successful Constitution save. Saves selection to the character state for display and Undo. | **The Cleric cannot heal themselves with this feature** (SRD specifies *another creature*). No target creature object or target dice roller exists yet, so users apply healing/damage to the other creature themselves. No automatic action-economy enforcement. |

### Implementation files

- `js/class-mechanics.js`: guarded, pure state transitions and resource/slot calculations, with input and class/level validation.
- `js/builder-ui.js`: class-specific controls and result summaries, only for eligible characters.
- `js/main.js`: UI actions use the same state transactions, local persistence and Undo as existing Folio features.
- `tests/milestone18-4-class-abilities.test.cjs`: source-backed cases for level limits, resource availability, scaling, recovery, save DC override, cross-class denial and state cloning.
- `tests/milestone18-4-class-abilities-browser.py`: real Chromium create-character/use-ability/mobile UI workflow; no remote service.

## Verified and not verified

The automated Node suite and Chromium scripts were run on the local code and later on an extracted release archive. Their passing results establish only their respective tested behavior, **not** full system or rules correctness. Browser tests use a simulated local store, so permanent Windows file/browser storage and recovery of your personal data remain to be verified on your machine.

## Still open

1. Remaining class features (including complete Monk, Ranger, Warlock, Bard etc. active abilities) across levels 1–20.
2. All core 2024 PHB subclasses, further official subclasses and cross-feature interactions.
3. Target-aware combat, player/ally/monster targeting, turn/action economy, spell/effect duration, summoned creatures, conditions from attacks.
4. The full 2024 PHB beyond SRD, commercial supplementary mechanics, and the all-official-books unified catalogue (not simply names).
5. User-provided materials/rights needed for some book-specific details, a comprehensive rules/errata audit, and extensive acceptance testing.

The current 430-name spell catalogue still contains 91 reference-only entries. Pip's existing specialist template has not been converted to this new universal rules engine. No internet or cloud account is required to use the Folio.

**Upgrade:** Export a full Library JSON backup from the installed version, extract this package to a different folder, launch `Open The Folio.cmd`, and verify your characters before migrating.

The bundled **SRD 5.2.1** is licensed CC BY 4.0; required attribution is in `ATTRIBUTION.md`. No proprietary sourcebook text was added in this milestone.
