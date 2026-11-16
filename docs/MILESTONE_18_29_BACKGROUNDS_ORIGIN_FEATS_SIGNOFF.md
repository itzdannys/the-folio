# Milestone 18.29 — 2024 PHB Backgrounds & Origin Feats

**Base:** Milestone 18.28 Species & Traits. **Release date:** 2026-11-16.

**Scope:** All sixteen backgrounds and ten distinct Origin feats from the revised 2024 Player's Handbook, integrated with the single-class 2024 character builder and offline Folio. Magic Initiate is presented as three distinct Cleric/Druid/Wizard list choices, as it already was in the rules catalogue. This is **not** a claim that all general feats, all other books, multiclassing or every spell effect is fully automated.

## Background coverage

The sixteen verified PHB 24 backgrounds are Acolyte, Artisan, Charlatan, Criminal, Entertainer, Farmer, Guard, Guide, Hermit, Merchant, Noble, Sage, Sailor, Scribe, Soldier, and Wayfarer. Each retains its existing three eligible ability scores, two skills, tool proficiency, and granted Origin feat. The builder now presents and records any variable tool/instrument/gaming set, a starting-equipment package A with quantities and starting currency, or the alternative package B (50 GP). Package A uses the installed item/weapon inventory catalogue where possible and keeps the equipment usable. Gear is awarded **once** when a starting package is chosen; editing the background does not silently remove or re-award existing gear, since it might have been spent or customized. The player can leave the equipment choice unselected and add it later.

Other-source backgrounds, species and homebrew selections remain in the builder and are not silently reclassified as PHB 24 content. The PHB 24 display label is unified in public-facing spell and reference screens; separate underlying license/source identifiers remain unchanged for provenance.

## Origin feat behaviors

| Origin feat | Character-sheet functionality | Confirmation or limitations |
| --- | --- | --- |
| Alert | Initiative adds proficiency bonus; feat displayed in Features | Swapping Initiative with a willing ally requires table agreement and normal encounter ordering |
| Crafter | Three verified Fast Crafting tool choices; 20% nonmagical purchase discount reminder; one temporary crafted item per Long Rest, with equipped weapons usable as weapons; item removed on next Long Rest | Confirm possession of correct tools and materials; direct purchases are still player-entered, not an automated shop transaction |
| Healer | Healer's Kit use tracking, Hit Die expenditure, PB added to healing, one reroll of a healing die showing 1, self-healing application | Real Healer's Kit must be in Inventory; for another creature the amount is recorded and applied by that player/DM, never invented on this local sheet; eligible spell-healing rerolls remain user-assisted |
| Lucky | PB-sized Luck Point pool; spend for Advantage on a D20 Test or Disadvantage on an incoming attack; Long Rest recovery | Player confirms the appropriate roll/trigger; Folio does not roll an enemy attack |
| Magic Initiate (Cleric/Druid/Wizard) | Choose two cantrips, one level-1 spell, and INT/WIS/CHA casting ability; add spells to shared Spellbook, show feat-specific DC/attack and one free level-1 cast per Long Rest; may use normal spell slots | List and level selection verified against installed spell catalogue; effects requiring unrepresented external targets/position remain DM-confirmed |
| Musician | Three instrument choices with sheet proficiency and a rest-song control for PB listeners | Record completed Short/Long Rest and willing listeners; their Inspiration belongs on their own sheets |
| Savage Attacker | One weapon-damage-reroll reminder per turn; resets with tracked turn | Requires player-confirmed weapon hit and damage result |
| Skilled | Three saved skill/tool proficiencies per feat grant, reflected in sheet modifiers | Selections must be unique; repeatable feats support additional choices |
| Tavern Brawler | Unarmed damage and damage-1 reroll guidance; one 5-ft push use per turn with turn reset | Target location, hit and movement outcomes require DM confirmation |
| Tough | +2 maximum HP per level, applied by existing core builder | Not double-counted on build edits |

The **Background & Origin** builder step summarizes each choice, while the everyday **Features & Traits** screen groups optional feat configuration and active abilities. Resource expenditure is persistent, supports Undo and save/reopen, and is recharged on the appropriate rest or turn through the existing workflow.

## Verification

- All existing PHB class and species implementations are preserved in the unchanged local-first application.
- `npm test`: 953 / 953 tests passing, including 17 new focused tests in `tests/milestone18-29-origins.test.cjs`.
- Targeted Chromium scripts: 16 suites covering Paladin, Fighter, Barbarian, Rogue, Monk, Ranger, Cleric, Bard, Druid, Sorcerer, Warlock, Wizard, source registry, earlier UI polish, PHB species, and the new Origin builder / action / save-reopen / mobile tests.
- `npm run audit:rules`: 603 catalogued candidates, zero version conflicts and zero duplicate revision IDs; 560 candidates remain awaiting independent manual source/version verification. **This audit does not certify all rule mechanics.**
- The final zip must be extracted into a new directory and re-tested before distribution; do not include the supplied commercial PHB PDF or external data ZIP.

## Deliberate boundaries

The Folio does not automate creature statistics outside the active character sheet, enemy rolls, the geometry of targets, external elapsed time, other characters' Hit Dice and Inspiration, arbitrary spell effects, material acquisition, or a full store/pricing workflow. The confirmation checkbox is a player record, not proof that the DM accepted a result. Other-book background content and general/epic feats are still separate work. Multiclassing is not enabled by this milestone.

**Next proposed milestone:** 18.30 — General Feats and remaining feat mechanics, followed by 18.31 multiclassing.
