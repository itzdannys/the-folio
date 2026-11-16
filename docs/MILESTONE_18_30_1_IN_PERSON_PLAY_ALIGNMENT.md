# Milestone 18.30.1 — In-person play alignment

**Date:** November 16, 2026  
**Base:** 18.30 PHB 2024 Feats (full standalone Folio app)

## Scope

The Folio is an **offline character sheet and character manager for an in-person D&D game**. Players roll physical dice and the DM resolves the game at the table. Folio stores characters, calculates stable modifiers, gives reference information, records limited uses and recovery, and keeps HP and inventory organized. Folio is **not** a virtual tabletop, combat simulator, game engine, or a replacement for the DM. Its pre-existing Quick Roll utility remains optional.

## Changes

1. **Manual initiative:** Enter the total rolled with physical dice to start the optional personal initiative tracker. Encounter tracking is not required for HP, class resources, spells, notes, inventory, or ordinary character management. The old digital initiative button is explicitly optional.
2. **Weapons, manual first:** Equipped weapons open an attack reference showing hit and damage information, mastery and modes. **Record use · no dice** consumes one tracked arrow or thrown weapon when relevant without rolling a d20, asking for enemy AC, declaring a hit, or resolving damage. Untracked ammo produces a reminder, not a block. Melee use does not spend ammunition. Undo and autosave remain available. The existing advanced attack calculator can be reached with **Optional digital roll**.
3. **Physical-dice healing:** Fighter Second Wind, Ranger Tireless and Monk (Open Hand) Wholeness of Body offer **Record ... use · physical dice** controls. They spend the limited use and relevant tracked Action/Bonus Action, but do not roll or change HP/temp HP. The player enters the actual result rolled at the table using the sheet's HP tools. Old digital healing is retained behind optional expandable panels.
4. **Digital class tools are optional:** Monk Unarmed Strike, Warlock Eldritch Blast, Cleric weapon rolls, Bard Dance Agile Strike and the three healing rollers are grouped under expandable, clearly optional controls rather than the default sheet action. Expanding one stays expanded across a state-driven render. Shared Monk target and element controls stay visible for non-digital class mechanics.
5. **Wording:** The Combat Playbook explicitly distinguishes the optional round tracker from normal character bookkeeping; the separate Quick Roll remains available.

## Known boundaries

- This is an **alignment release**, not an assertion that every legacy class control is now manual-only. Some niche effects or conditional spells still have digital-resolution actions. Future polish can continue separating *resource spend* from *optional dice calculator* without weakening the rules reference.
- Recording a weapon use **does not confirm a hit**, adjudicate masteries, handle enemy HP, spend Sneak Attack, or automatically process every class turn budget. The DM and players do those things at the table; Folio retains the relevant self-resource controls.
- This update does not add initiative for other combatants automatically, enemy saves, maps, movement, or full encounter automation.
- The original folder structure, local character storage, Windows launcher, sources, classes, species, feats, spellbooks, homebrew, campaigns, appearance, dice utility and backup formats are retained.
- Export your saved characters before upgrading. The Windows `Open The Folio.cmd` is included, but cannot be directly executed in the Linux automated test environment.

## Verification

- Node automated tests: prior regression suite plus 7 new tests for no-roll melee/ranged/thrown weapon use and Second Wind, Tireless and Wholeness of Body resource handling.
- Playwright physical-play browser test: manually entered initiative, weapon reference/record, optional digital attack, mobile width and runtime error check.
- Relevant legacy browser tests were revised to intentionally open digital tools now that they are not shown by default; prior rules-engine expectations remain.
- Read-only rules registry audit and clean ZIP extraction/retesting completed before release.
