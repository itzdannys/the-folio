# The Folio — Milestone 18.23: 2024 PHB Druid character-sheet sign-off

**Date:** 16 November 2026  
**Source:** User-provided revised 2024 *Player’s Handbook*, with SRD 5.2.1 cross-checks. No third-party monster-data or copyrighted rules PDFs are bundled.

## Scope and acceptance

This milestone adds the 2024 Druid base class, levels 1–20, to the existing offline single-character workflow, including the **Circle of the Land**, **Circle of the Moon**, **Circle of the Sea**, and **Circle of the Stars**. The class-choice and persistence systems remain backwards-compatible. Sign-off here means Folio handles the Druid's character-owned choices, resources, rolls, and action tracking **when supplied with required table-confirmed external facts**. It does **not** mean that Folio adjudicates all monster actions, creature positions, full spell text, or an arbitrary external Beast stat block without user inputs.

### Base class

- Druidic language and the always-prepared *Speak with Animals* spell; Primal Order: Magician (additional cantrip, Arcana/Nature check bonus) or Warden (martial-weapon proficiency, Medium armor training).
- 2024 spellcasting progression and preparation, including cantrip counts and class-specific granted spells. Retains long-rest prepared-spell changes and existing class spellbook.
- Wild Shape with correct level thresholds, known-form limits, CR and flight eligibility, Bonus Action and resources, timed form state, temporary HP without replacing the Druid's HP, and verified beast AC, speed and weapon attacks.
- Wild Companion summons a Fey familiar using a Wild Shape use or spell slot, with long-rest expiration tracked; creature actions remain table managed.
- Wild Resurgence exchange actions, Elemental Fury (Potent Spellcasting / Primal Strike), Primal Strike bonus dice and damage types, Beast Spells and level-20 Archdruid features.
- Known Beast forms are entered or replaced using **source-verified** statistics. The app deliberately does not auto-import the user's mixed-edition third-party `dnd-data-main.zip` into this release.

### Four 2024 PHB circles

| Circle | In-app mechanics / tracking |
|---|---|
| **Land** | Preserves existing Land types, Circle spells, Land’s Aid, Natural Recovery, Nature’s Ward and Sanctuary controls. |
| **Moon** | Expanded form CR, AC and temporary-HP calculation, Circle spell access while shaped, Radiant form attacks, Wisdom to Constitution saving throws while shaped, Moonlight Step, Lunar Form damage and Shared Moonlight. |
| **Sea** | Wrath of the Sea Emanation with target saves, damage and pushes, radius scaling, swimming, Stormborn flight and resistance, Oceanic Gift placement/dual-form resource costs. |
| **Stars** | Star Map free Guiding Bolt, Starry Form Archer/Chalice/Dragon and level-10 scaling, Cosmic Omen use/Reaction/Long-Rest pattern, Full of Stars resistances. |

### Integration and safeguards

- `js/druid-2024.js` is the Druid's resource/turn engine; `js/druid-ui.js` supplies its controls. Modules are loaded by the existing app. Its data lives in `character.build` and `resources.classState/classResources`, preserving old save fields and legacy characters.
- Actual melee weapon attacks can commit Primal Strike extra elemental damage in the same confirmed hit and share a tracked Action budget. Verified Beast attacks use their own form panel. Druid form AC/speed flow into the main stats.
- Automatic damage resistance now applies Sea's Stormborn and Stars' Full of Stars while the applicable features are active. Magician adds its bonus to computed skill checks.
- Existing Bard, Cleric, Ranger, Monk, Rogue, Barbarian, Fighter and Paladin mechanics are unchanged, aside from shared calculations necessary for the Druid.

### Deliberate table confirmations and limitations

- **Source-verified Beast data**: Folio cannot certify that a manually entered creature stat block is legal; it enforces known-form CR/flight/count gates and uses the values the player confirms. Beast multiattack, special monster abilities, creature equipment and anatomy still require following the supplied original stat block at the table.
- **Outside characters and enemies**: target AC, saving-throw results, positioning, immunities, range, condition application, ally movement and encounter adjudication remain player/DM confirmed. Wild Companion familiar actions and Sea Oceanic Gift ally turns are not a separate companion/ally combat simulator.
- **Spells**: spell slots, granted/prepared selections, casting costs and available Druid class interactions are tracked, but arbitrary spell descriptions, material component costs and full creature outcomes are not automatically resolved. Some cantrip and area effects use reference/manual resolution.
- **Not in scope:** multiclassing, later or third-party subclasses, automatic rules-version certification across the unreviewed source registry, network/multiplayer, authoritative Monster Manual data redistribution.

### Verification results

- `npm test`: **853/853 automated tests passed**, including 37 focused Druid tests.
- `python tests/milestone18-23-druid-browser.py`: **passed** for all four circles, creation, verified known Beast form, Wild Shape and attacks, Sea Emanation, Starry Form, save/reopen and mobile layout.
- Individual browser regressions passed: Bard 18.22, Cleric 18.21, Ranger 18.20, Monk 18.19, Rogue 18.18, Barbarian 18.17, Fighter 18.16C, Paladin 18.15I, and rules registry 18.15B.
- `npm run audit:rules`: **594 entries**, **0 revision-ID duplicates and 0 version conflicts**. **551 candidates remain unverified for source/version review**; registry audit is **read-only** and is not proof of full rule-content completeness.
- ZIP integrity and clean-extraction automated and Druid browser tests are required before delivering this release.

### Continuity

Existing Pip and all personal Folio character profiles, campaigns, homebrew data, offline saves, backups, UI themes and `Open The Folio.cmd` remain supported. Do not replace or import the external `dnd-data-main.zip` blindly. Next class is **Sorcerer**, then Warlock and Wizard.
