# The Folio — Milestone 18.5 (PARTIAL): Bard, Fighter and Monk Actions

**Version:** `2.0.0-alpha.18.5-partial` · 15 November 2026. Based on Milestone 18.4. **Not a complete implementation of Milestone 18, the 2024 Player's Handbook, or all official sourcebooks.**

## Functional changes

| Class / official source | Implemented and saved | Explicitly NOT automated |
|---|---|---|
| Bard — Bardic Inspiration, SRD 5.2.1 pp. 31–32 | Spend an available use to issue a level-scaled d6/d8/d10/d12 die; record the recipient requirement and one-hour window. Class-specific uses recover on Short Rest at level 5+. | No companion/recipient sheet, transfer of the die to an ally, one-die-per-recipient validation, failed-test trigger or action economy enforcement. |
| Bard — Font of Inspiration, SRD p. 32 | From level 5, spend an actual available spell slot of a selected level to restore exactly one Bardic Inspiration use, up to the cap. Prevents missing-slot and over-cap recovery. | No automated tracking of all per-turn limits or other spellcasting interactions. |
| Fighter — Tactical Mind, SRD p. 48 | From level 2, enter the total of a failed ability check and its DC, then roll a d10. It applies the bonus, reports success/failure, and **spends Second Wind only on success**; a continuing failure preserves the use. | Check circumstances/skill proficiency are supplied by the player/DM; it doesn't make the original roll or enforce timing. |
| Monk — Flurry of Blows, SRD pp. 50–52 | Spend one Focus Point for two bonus-action Unarmed Strikes (three at level 10+); record attack allowance. | Target selection, attack rolls/damage, and used bonus action are not enforced by a turn engine. |
| Monk — Patient Defense / Step of the Wind, SRD pp. 50–52 | Separate free and 1-Focus variants, recording their correct Dodge/Disengage/Dash/jump outcomes. At level 10+, Patient Defense rolls **two Martial Arts dice** for temporary HP and keeps the higher of existing/new temporary HP, never adds them. | Map movement, carried ally, action economy, and enemies' attack state remain manual; player can manually replace existing temp HP if preferred. |
| Monk — Uncanny Metabolism, SRD p. 51 | At level 2+, on confirmed initiative trigger, restore all Focus Points, roll an appropriate Martial Arts die, heal up to HP max by Monk level + die, and spend once-per-Long-Rest usage. | Folio does not detect the initiative event; the player must only activate it when eligible. |
| Monk — Perfect Focus, SRD p. 52 | At level 15+, restore Focus Points to four when there are three or fewer, to be activated on rolling Initiative instead of Uncanny Metabolism. | Folio doesn't enforce mutually exclusive initiative recovery or track initiative encounters consistently; the player must choose the legal trigger. |

All handlers use the existing persistent character transaction and Undo path. No character save-schema version change is necessary. No non-SRD commercial sourcebook text was bundled in this implementation.

## Verification performed

- `npm test`: **283/283 Node tests passed** on the implementation folder, including **15 new tests** for resource costs, scaling, prerequisites, rejected invalid uses, and persistence-compatible state cloning.
- `python tests/milestone18-5-class-actions-browser.py`: **PASS**, creating new Bard/Fighter/Monk characters, exercising controls, returning to library and reopening saved characters, and checking mobile width 390px.
- Regression browser scripts for 18.4, 18.3, 18.2, 18.1, 16, 17.3, 17.4, 17.5, 17.6, and 16.1 each printed **PASS** in this development folder. These tests do not establish complete official rule coverage or on-device Windows persistence.

## Still incomplete

- Core class feature mechanics and user choices from levels 1–20 across all classes; most subclass effects.
- Combat turns, reaction/bonus-action availability, targeting/ally state, actual Monk bonus attacks, status/duration effects.
- Full 2024 PHB (beyond the SRD) and full mechanics from all official supplementary books.
- Full multiclassing, concentration and spell effects, target-aware casting, exhaustive cross-feature tests, independent errata verification.
- Windows-specific local-file persistence and real-user backup migration testing on your device.

**Upgrade:** Back up the current Library JSON first, unzip this build separately, launch `Open The Folio.cmd`, and confirm characters before switching. This is an alpha partial milestone, not a finished character manager.
