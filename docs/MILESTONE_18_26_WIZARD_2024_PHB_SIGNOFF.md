# The Folio — Milestone 18.26 Wizard (2024 Player’s Handbook)

**Sign-off scope:** 2024 PHB **single-class Wizard character-sheet functionality** from levels 1–20, all four subclasses. The prior 18.25 Warlock ZIP is the base. The Folio remains an offline personal application with no login, server, cloud or sharing.

## Rules source and audit method

- The user's 2024 *Player's Handbook*, printed pages 164–175 (Wizard progression, Wizard spellbook and features, Abjurer, Diviner, Evoker, Illusionist). No wholesale commercial PHB spell text is copied or bundled.
- The existing Folio spell catalogue, source registry, 2024 SRD and approved supplement references were reused. Uploaded mixed-era `dnd-data-main.zip` is **not** bulk imported. Name-only source references require the PHB and DM confirmation.
- This is a standalone player-character sheet with explicit manual/DM confirmation for external events, targets and creature results. It does not simulate opponents or implement arbitrary spells in full.

## Level progression and Wizard spellbook

- Full class progression 1–20: Charisma is **not** used for Wizard spells; the existing builder and rules engine use **Intelligence**. Standard Wizard slots, 2024 prepared spell counts, cantrips, class feats and school specialization are retained or corrected.
- A **persistent Wizard spellbook** (`wizardResearchKeys`, `wizardSavantKeys`, `wizardCopiedKeys`, and migration-safe `wizardLegacyKeys`) is now distinct from the prepared spell list. Fresh Wizards can select six level-1 spells at creation and two new spells per added Wizard level. The interface reports remaining selections; newly created Wizards cannot prepare levelled spells absent from their book.
- A found Wizard spell can be copied only after explicit confirmation of a source and the **2 hours and 50 GP per spell level** transcription expenditure; Folio records the confirmed costs but does not remove coins from inventory on its own. Spellbook creation at high level is still a guided process, not an invented choice of spells for the player.
- Legacy Wizard prepared spells are migrated into a separate book entry set, retaining existing choices rather than silently deleting them.
- Ritual Adept: an eligible Wizard Ritual may be cast from the book when unprepared. Spellbook catalog, ritual casting and free casts integrate with the existing Spellbook controls.
- Arcane Recovery: recover combined slot levels up to ceil(Wizard level / 2), slot levels at most 5, **after a completed Short Rest**, once per Long Rest; earlier unrestricted direct recovery is fixed.
- Scholar at 2: choose Expertise in an eligible proficient skill. Memorize Spell at 5: change one prepared levelled spell for another in the book immediately after a Short Rest.
- Spell Mastery at 18: select one level-1 and one level-2 **Action** spell from the book; they remain prepared and can be cast at base level without a slot. Signature Spells at 20: two distinct level-3 spells remain prepared, each with a free cast restored on a **Short or Long Rest**.
- Wizard turn controls track Action, Bonus Action, Reaction and slot expenditure during an explicitly tracked turn; untimed/out-of-turn external events remain table-confirmed.

## Four official Wizard subclasses

- **Abjurer** (level 3/6/10/14): school Savant; Arcane Ward and slot-powered HP restoration; Projected Ward reaction with confirmed visible ally and incoming damage; Spell Breaker with always-prepared Counterspell/Dispel Magic, optional Bonus Action Dispel Magic, and confirmation-assisted slot refund; Spell Resistance with player-confirmed spell-damage application. The ward absorbs incoming damage before temporary and normal HP, without inventing enemy damage.
- **Diviner**: school Savant; record 2 Portent d20 results after a Long Rest (3 at level 14) and spend one per turn before the replacement roll; Expert Divination restores an expended lower level slot when eligible; The Third Eye grants a selectable sense with Bonus Action tracking and correct rest expiration.
- **Evoker**: school Savant; existing Potent Cantrip, Sculpt Spells and Empowered Evocation systems preserved; Overchannel integrated with spell-casting dialog, limited to eligible level-1–5 slotted Wizard spells, maximum damage on declared effect and repeat-use Necrotic self damage. All enemy target and saving throw outcomes remain DM-confirmed.
- **Illusionist**: school Savant; Improved Illusions and Minor Illusion rules and sheet notes; always-prepared Summon Beast/Fey, one free Illusion summon per Long Rest with half creature HP; Illusory Self reaction and optional level-2+ recharge; Illusory Reality Bonus Action requires a confirmed nonmagical inanimate object from an active slotted illusion.
- All four Savant progressions grant two school spellbook additions at level 3 and additional school spells at newly unlocked spell-slot tiers.

## App integration and data preservation

New modules: `js/wizard-2024.js` (state, choices, action tracking, rules) and `js/wizard-ui.js` (real Wizard sheet and Spellbook controls). Integrated with `js/builder.js`, `js/builder-ui.js`, `js/main.js`, `js/rules-engine.js`, `js/rules-ui.js`, `js/class-mechanics.js`, and `index.html`. All work is incremental on the 18.25 full application. The existing `Open The Folio.cmd`, characters including Pip, optional campaign folders, homebrew entries, autosave, backups, character appearance, dice roller and other 11 classes remain present. Existing saves are not rewritten at installation.

## Verification

- `npm test`: **923/923 passing** (27 dedicated Wizard tests plus the prior suite), including level gates, spellbook persistence, ritual casting, recovery, core subclass features, free casting, turn tracking and level-up preservation.
- `python tests/milestone18-26-wizard-browser.py`: all **four schools**, real class-panel actions and persistent Wizard spellbook, copied spell GP/time confirmation, Portent, Third Eye, Illusory Reality, Mastery/Signature choices, save/reopen, **390px mobile viewport** — passed.
- Existing 12 named browser suites for Paladin, Fighter, Barbarian, Rogue, Monk, Ranger, Cleric, Bard, Druid, Sorcerer, Warlock and rules-registry — passed independently. Total **13/13 targeted Chromium scripts**.
- `npm run audit:rules`: **603 records**, zero version conflicts and zero duplicate revision IDs; **560 items still need source/version verification** in the read-only registry. These source-metadata gaps do not automatically revise any character.
- Full release ZIP is built from application files (not uploaded PDFs), extracted into an independent clean folder and retested before release.

## What is explicitly not claimed

No automated DM, enemy turn engine, arbitrary 2024 spell-effect resolver, familiar/illusion creature stat AI, encounter-position oracle, redistribution of proprietary PHB spell text, cross-book source certification, or completed multiclass engine. Some named spells in the Folio catalogue are **reference-only**, and the user must confirm their actual PHB effects and casting prerequisites. Wizard spellbook recovery from a physically lost original book, the physical transcription of spells and the inventory spend are handled by player confirmation. Some external events may have to be recorded outside an active turn, such as creature spell saves and attack outcomes.

**Checkpoint:** 12 / 12 2024 PHB classes signed off within the stated **single-class character-sheet** scope. Future work may focus on broader rules verification, multiclassing, expanded spell effects and polish, not another missing PHB class.
