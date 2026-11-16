# Milestone 18.19 — 2024 Player’s Handbook Monk character-sheet sign-off

## Scope

This release follows Rogue 18.18. It covers the **single-class 2024 PHB Monk, levels 1–20**, with the four subclasses **Warrior of Mercy, Warrior of Shadow, Warrior of the Elements, and Warrior of the Open Hand**. It is an offline character-sheet rules engine, not an encounter simulator. Existing Folio saves, Pip, campaigns, homebrew, backups, dice and the other class implementations remain in their existing file formats. No external copyrighted compendium is imported or redistributed by this release.

## Base class

- Existing Focus Points, Martial Arts, Unarmored Defense and mobility progression retained. Martial Arts damage dice, Monk weapon Dexterity use, Unarmed Strike damage/Grapple/Shove and Extra Attack now use dedicated Monk attack/turn controls.
- Tracked Action, Bonus Action and Reaction, Flurry of Blows strikes (including level-10 third strike), Patient Defense, Step of the Wind, and attack limit. Turn mode is opt-in to avoid disrupting out-of-combat character sheet use.
- Uncanny Metabolism and Perfect Focus resource recovery reused; Deflect Attacks and level-13 Deflect Energy handle appropriate damage types; fully blocked attack can redirect damage at cost of Focus when eligible. Slow Fall, Evasion, Self-Restoration, level-14 all-save proficiency and reroll, Superior Defense and level-20 Body and Mind are available.
- Stunning Strike available on qualifying confirmed Unarmed Strike and Monk-weapon hits with once-per-turn and Focus checks. Deflect/redirect still needs a confirmed attack result, creature eligibility and saving throw from the table.

## Four 2024 subclasses

| Subclass | Character-sheet support | Table-confirmed boundaries |
|---|---|---|
| **Mercy** | Hands of Harm and Healing, Flurry replacements/free harm, poison/removable conditions, skill/tools, ultimate revival resources and healing totals | Other creatures’ HP/conditions, eligible corpse and touch range |
| **Shadow** | Darkness/Concentration tracking, Darkvision, Minor Illusion, Shadow Step, improved free Unarmed Strike, Cloak of Shadows and free Shadow Flurry | Light, line-of-sight, exact darkness area and destinations |
| **Elements** | Attunement, elemental damage and strength-save push, Elementalism, burst damage, swim/fly movement, resistance, destructive stride and empowered attacks | Area targets, target saves and coordinates |
| **Open Hand** | Existing Wholeness and Quivering Palm retained; Addle/Push/Topple on confirmed Flurry hits and Fleet Step follow-up | Enemy conditions, target eligibility and tactical placement |

## Verification (2026-11-15 / 2026-11-16)

- **728/728** Node automated tests pass, comprising the 704 inherited tests plus 24 new Monk tests, including action economy, level-1 to level-20 progression, subclass eligibility, Focus use, healing/harm, damage resistance, saving throws, timed effect cleanup and save serialization.
- Monk browser suite creates all four subclasses and verifies class UI, Focus abilities, weapon Stunning Strike control, save/reopen and narrow-screen layout.
- Existing Fighter, Rogue, Barbarian and Paladin browser regressions have been rerun, including the cross-class weapon dialog fix. The rules-registry browser test's entry count was updated after the addition of three 2024 Monk subclasses.
- Read-only rules audit: **581** current entries; **0** duplicate revision IDs or reported version conflicts. **538** candidate records still await manual source/version confirmation. This audit is **not** certification of every source or official content choice.

## Manual and future scope

The user or DM remains responsible for verifying enemy positions, target armor class, attack results, saving-throw totals, ally reactions, environmental conditions, concentration interruption and hostile creature state. Folio does not autonomously run a battlefield and cannot modify enemies whose sheets it does not own. Arbitrary spell effects, multiclassing, future sourcebook variants, exhaustive publisher-revision review and other Monk subclasses from non-2024 books remain separate future work. Duration counters advance through user-confirmed tracked turns, not real-time clocks. Some generic weapon and spell interfaces retain the preexisting optional/manual behavior outside tracked turns.

Run `node --test`, `node scripts/audit-rules.cjs`, and `python tests/milestone18-19-monk-browser.py` from the extracted `The Folio` directory.
