# Milestone 18.10 — Barbarian & Path of the Berserker (PARTIAL)

**Status:** Functional increment, **not** completion of Milestone 18, Barbarian, the 2024 PHB, or all official D&D sourcebooks. This build is based on the 18.9 ZIP. Core rules were checked against the user's SRD 5.2.1 PDF, especially printed pages 28–30 for Barbarian/Berserker and pages 13–17 for attack, critical and damage interactions. Licensed SRD material is credited in `ATTRIBUTION.md`.

## Implemented and exercised

- **Reckless Attack (level 2):** choose before your first weapon-attack roll of a turn; tracked Strength-based weapon attacks then gain Advantage until next turn, canceled by Disadvantage as normal. The attack display warns that enemy attacks have Advantage against you. A later choice after a recorded first attack is rejected.
- **Frenzy (Berserker level 3):** the first **confirmed Strength-based hit on your own turn** while both raging and using Reckless Attack adds d6 dice equal to Rage Damage bonus (+2/+3/+4 -> 2/3/4d6); on a critical, those added dice are doubled. It only triggers once per tracked turn, and never on Retaliation.
- **Mindless Rage (Berserker level 6):** starting Rage ends Charmed and Frightened on the character, and the condition selectors refuse to apply either while Rage remains active.
- **Retaliation (Berserker level 10):** a player-confirmed melee weapon Reaction spends the reaction even if the attack misses. It cannot be used twice before the start of a new turn. The triggering damage, range, and opponent are affirmed by the user rather than independently detected by the app.
- **Intimidating Presence (Berserker level 14):** the correct Strength-based Wisdom save DC is calculated and recorded. The free once-per-Long-Rest use is consumed; subsequent uses consume Rage uses. The targets, condition duration, and repeat saving throws remain at-the-table decisions.
- **Turn state and persistence:** new turn can be explicitly confirmed or identified through the encounter tracker, renewing eligible per-turn flags and Reaction. Rules state survives normal local save/character reopening; previous Folio character data remains compatible.
- **Weapon-roll message fix:** a no-resource-change weapon roll updates the result message rather than leaving the last weapon roll visible in the toast.

## Incomplete or manually resolved

- Rage's full duration/extension and combat action economy; Folio does not know all weapon attacks, actions, enemy attacks, target locations, spell effects, or actual DM decisions. The player must confirm the start of each turn if not using encounter tracking.
- Reckless Attack's **enemy Advantage** is displayed as a reminder; there is no enemy attack roller for applying it automatically.
- The Retaliation trigger (damage by creature within 5 ft) and Intimidating Presence target saves are not verified by Folio.
- Barbarian's remaining base class features, including full Brutal Strike choice/effect resolution, Relentless Rage, and other advanced interactions. Rage and certain passive rules from older partial builds still exist.
- All other subclasses, complete 2024 PHB rules and all-official-sourcebook automation remain unfinished; existing non-SRD entries can be reference-only.

## Tests

- `node --test`: **343 / 343 passed**, including 13 added Barbarian/Berserker tests covering prerequisites, action limits, correct added damage, critical doubling, ranged/DEX exclusion, Retaliation exclusion, resources and persisted flags.
- `python tests/milestone18-10-barbarian-browser.py`: **passed** (level 6 and 14 character creation, Rage, Reckless, Frenzy once per turn, Intimidating Presence and Retaliation UI, reopen, 390px mobile layout).
- Six earlier browser regression scripts passed during this development cycle: Fighter 18.9, Paladin 18.8, Ranger 18.7, Rogue 18.6, typed damage 18.1, and supplement spell index 17.6.
- Clean extraction and complete `node --test` have been rerun on the final archive (see `TESTING.md`). This does not prove every game rule is implemented or bug-free.

## Upgrade safety

Back up your **full Library JSON** before upgrading. Extract the ZIP into its own folder, launch `Open The Folio.cmd`, and verify characters/saves before replacing the previous version. No user data is stored in the release ZIP.
