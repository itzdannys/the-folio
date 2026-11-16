# The Folio — Milestone 18.22: 2024 PHB Bard character-sheet sign-off

**Scope:** Single-class Bard from levels 1–20, and the 2024 Player's Handbook colleges of Dance, Glamour, Lore, and Valor. Built on Milestone 18.21. This release provides a **character-sheet workflow**, not a DM/monster simulator or an all-sourcebooks rules claim.

## Primary reference and source integrity

Compared against the user-provided **2024 Player's Handbook** (Bard class and subclass section, printed pp. 58–67). Existing SRD 5.2.1 rules are retained where appropriate. Descriptions in this implementation are short, newly authored feature labels/calculation notes, not copied protected book text. The optional mixed-edition `dnd-data-main.zip` remains separate; nothing from it was silently imported. The read-only source registry is **not** evidence of universal publication/edition certification.

## Base Bard 1–20

- Correct Bard levels 1–20, spell-slot progression, Bard cantrips (2/3/4) and prepared spells (4 to 22); spell levels and selections remain in the existing Spellbook. Charisma is the spellcasting ability.
- Bardic Inspiration is granted to another named, confirmed recipient within 60 feet as a **Bonus Action**, with the character's pool reduced; die scales d6/d8/d10/d12 at Bard levels 1/5/10/15. An external recipient tracks their own die and one-hour expiry.
- Bard class skill proficiency picks (3), Expertise at levels 2/9 (2/4 picks), and Jack of All Trades for qualifying checks **and initiative**. Skill choices are retained through the character builder and level-up rebuild.
- Font of Inspiration: from level 5, uses recover on short rests; a spell slot may be exchanged for one use without spending an Action. Standard long-rest recovery remains intact.
- Countercharm at 7 remains in the existing class mechanics. Magical Secrets expands **new and replacement** Bard spell selections to Bard/Cleric/Druid/Wizard lists from level 10. Superior Inspiration restores at least two uses at initiative at 18. Words of Creation grants both Power Word spells at 20, with second-target eligibility called out for table confirmation.
- Combat-turn state tracks Action, Bonus Action, Reaction, and the one slotted cast per turn limitation. Actual attacks/spell casts use the shared weapon roller/Spellbook instead of free resource toggles.

## Subclasses

| College | Level 3 | Level 6 | Level 14 |
|---|---|---|---|
| **Dance** | Unarmored AC, Dexterity unarmed damage using Bardic die, Agile Strikes with paid Inspiration | Inspiring Movement (Reaction, Inspiration), Tandem Footwork (initiative bonus) | Leading Evasion and eligible-ally damage fractions |
| **Glamour** | Always-prepared Charm Person/Mirror Image, Beguiling Magic following qualifying slotted spells, Mantle of Inspiration (temporary HP + ally movement) | Command always prepared, tracked Mantle of Majesty and concentration | Unbreakable Majesty with confirmed attacker Charisma saves |
| **Lore** | Three added skill proficiencies, existing Cutting Words | Two always-prepared Magical Discoveries from Cleric/Druid/Wizard that persist through level-up | Existing Peerless Skill (spends Inspiration only if failure becomes success) |
| **Valor** | Martial weapons, Medium armor, Shield, Combat Inspiration (recipient-owned die) | Two Attack-action weapon attacks, explicit atomic action-time cantrip replacement through Spellbook | Battle Magic allows Bonus Action weapon attack after action-time spell |

## State, transaction and compatibility requirements

- Namespaced `resources.classState` controls and module methods added; existing characters and save schemas unchanged. No forced migration, additional server or account requirements. All changes use normal undoable Folio transactions.
- New class-specific UI at `js/bard-ui.js`; rules at `js/bard-2024.js`. Core modifications are additive and limited to rules/casting, skill passives, class choice, shared rest/initiative and attack calculations.
- Subclass choices use stable built-in source IDs. Lore selected spell keys/names, class skill choices and Expertise are saved in the character build; a regression test verifies level-up rebuild. Change of college removes inappropriate Lore extra grants.
- Existing completed classes—Paladin, Fighter, Barbarian, Rogue, Monk, Ranger and Cleric—remain available. Pip, campaigns, homebrew, autosaving, character themes and the `Open The Folio.cmd` Windows launcher remain in the ZIP.

## Verified automated checks

- Node test suite **816/816 passing** after introducing 33 Bard-specific tests, including all 20 levels, resource costs, all four colleges, spell and attack actions, rest resets, skills/level-up persistence, and cross-class isolation.
- New Chromium browser flow verifies **four Bard colleges**, interactive class controls, character saving/reopening and mobile width.
- Regression browser flows verified independently for Cleric, Ranger, Monk, Rogue, Barbarian, Fighter, Paladin and the read-only source registry. **9 browser scripts passing**, including Bard.
- `npm run audit:rules` reports **591 candidate entries**, no version conflicts and no duplicate revision IDs. Many entries still lack full source/version certification; this audit is intentionally read-only.
- The distributed ZIP is integrity-checked and unpacked into a clean directory, where automated tests and the Bard browser flow are run again.

## Explicit manual/table limits

- Bardic Inspiration held by another creature, allies' temporary HP and reactions, Charm/Frighten saving throws, movement/position, exact conditions, attack damage on non-player-controlled creatures, spell targets/effects, and the second target of a Power Word are confirmed at the table; Folio must not invent them.
- Many spells are name-only proprietary references; a reference is not treated as executable rules, and the player must consult the authorized sourcebook. User-imported spells continue to work via the preexisting manual path.
- Multiclassing, all other official sourcebook subclasses and mechanics, exhaustive monster/ally simulation, and complete source-version curation are **separate** future tasks.

**Release status:** Signed off for the agreed **2024 PHB single-class Bard character-sheet scope**, not full game-rule or all-sources automation.
