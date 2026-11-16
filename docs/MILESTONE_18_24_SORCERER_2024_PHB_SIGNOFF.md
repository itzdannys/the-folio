# The Folio — Milestone 18.24: 2024 PHB Sorcerer character-sheet sign-off

**Date:** 16 November 2026  
**Starting version:** The Folio Milestone 18.23 — Druid sign-off.  
**Rules source:** The user's revised 2024 *Player’s Handbook*, printed pp. 139–151 (PDF pp. 142–154), checked against existing SRD-backed catalog metadata. The supplementary `dnd-data-main.zip` was examined as a mixed-source reference only; no unverified copyrighted/older/third-party material is imported into this distribution.

## Meaning of sign-off

This milestone signs off **single-class Sorcerer, levels 1–20, and all four 2024 PHB Sorcerer subclasses** for the Folio's existing offline, confirmation-assisted character-sheet workflow. It tracks available character choices, spellcasting resources, actions, self effects and explicit resource costs. It **does not** mean Folio simulates a Dungeon Master, enemy locations, arbitrary spell effects or complete Monster Manual stat blocks. For spells provided as name-only references, the user must read their own sourcebook.

## Base Sorcerer — levels 1–20

- **2024 Spellcasting:** Charisma-based spell attacks and save DCs, full-caster slot table, cantrips (four initially, five at level 4, six at level 10), increasing prepared-spell limits, cantrip/prepared spell changes on level advancement, and a verified Spellbook. Level-19 Epic Boon and ordinary feat choices remain in the existing character builder.
- **Innate Sorcery:** two Long Rest uses; Bonus Action activation and ten-round timer; one-point boost to Sorcerer spell save DC; actual Advantage on confirmed Sorcerer spell attack rolls, with recorded d20s, target AC, hit/miss and natural 1/20 handling.
- **Font of Magic:** no-action slot-to-points conversion; Bonus Action creation of spell slots 1–5 at costs 2/3/5/6/7 Sorcery Points, with the minimum class levels 2/3/5/7/9. Created slots disappear on Long Rest. Points cannot exceed class maximum.
- **Sorcerous Restoration:** after a **completed Short Rest**, restore up to half Sorcerer level (round down), once per Long Rest.
- **Metamagic:** all ten 2024 options selectable as 2 / 4 / 6 known at Sorcerer levels 2 / 10 / 17. Choices persist in the character build. The real spellcasting modal spends the correct points and validates timing/target/eligibility. Careful tracks named protected creatures; Distant, Extended, Heightened, Quickened, Subtle, Transmuted and Twinned record their confirmed effect. Empowered rolls replacement damage dice; Seeking rerolls a confirmed missed spell attack and updates tracked hit resolution.
- **Sorcery Incarnate (7):** when Innate Sorcery uses run out, pay two Sorcery Points to activate; supports two compatible Metamagic options on a spell while active.
- **Arcane Apotheosis (20):** one free Metamagic option on each tracked turn while Innate Sorcery is active.
- **Turn tracking:** action / Bonus Action / Reaction, one spell-slot cast per turn, Quickened restrictions, non-invented confirmation of spell casting times, and long-duration casting as a sustained Magic Action requiring manual follow-through. Round timers can be advanced via the Sorcerer turn button.

## Four Sorcerer origins

| 2024 PHB subclass | Integrated mechanics |
|---|---|
| **Aberrant Sorcery** | Level-gated Psionic Spells, including canonical-name aliases for *Evard’s Black Tentacles* and *Rary’s Telepathic Bond*; Telepathic Speech and range/duration; level-6 Psionic Sorcery casts the granted spells with Sorcery Points instead of slots; Psychic resistance and defensive-save reminder; Revelation in Flesh multi-choice adaptations and timer; Warping Implosion use / five-point recharge and DM-confirmed external effects. |
| **Clockwork Sorcery** | All Clockwork Spells always prepared; Restore Balance spends Reaction and a Charisma-based daily use; Bastion of Law creates 1–5 d8 ward and tracks rolls/reductions (applies self damage only when self is the confirmed target); Trance of Order duration and minimum d20 for the dedicated Sorcerer spell attack; Clockwork Cavalcade free / seven-point recharge with explicitly allocated self HP. |
| **Draconic Sorcery** | Always-prepared Draconic Spells; fixed Draconic Resilience HP at subclass level 3 (**+5 HP, then +1 per later Sorcerer level**); unarmored base AC 10 + Dexterity modifier + Charisma modifier; persistent elemental affinity choice with corresponding damage resistance and one-damage-roll modifier; Dragon Wings duration and daily recharge; Dragon Companion free cast, optional no-concentration one-minute variant, spell slot use and DM-confirmed companion details. |
| **Wild Magic Sorcery** | Tides of Chaos usage and mandatory surge following the next Sorcerer slot-cast; once-per-turn optional d20 check; 25 indexed 2024 PHB surge ranges; Controlled Chaos roll twice / choose outcome; Bend Luck Reaction and d4; Tamed Surge once per Long Rest with exclusion of the final table row. Resolving table outcomes requires the player's PHB and DM. |

## Integration and continuity

The new logic is isolated in `js/sorcerer-2024.js`, with interactive class controls and spell dialog fields in `js/sorcerer-ui.js`. It uses the existing builder, Spellbook, resources, combat/damage calculator, local saves, backup/import/export, Library, campaign folders, homebrew registry, artwork/themes, and Quick Roll dice. It does not require a server or change the Windows `Open The Folio.cmd` launcher. Earlier signed-off classes continue to use their existing modules.

**Rules corrections inherited by this checkpoint:** Sorcery Point conversion minimum Sorcerer levels, Short Rest requirement for Restoration, Draconic HP bonus, and the two PHB/SRD generic spell-name aliases were corrected. The existing read-only source registry now lists three new verified-subclass **choices**; its review statuses do not imply a globally verified rules database.

## DM-confirmed and unfinished automation

- Wild Magic surge outcomes are **indexed, not fully auto-executed**, including friendly/unfriendly creatures, positional effects, extra rolls, conditions, altered turn mechanics and persistent magical effects. Open the PHB at printed pp. 150–151 to apply the correct effect.
- Aberrant telepathy relies on the target's understood language and range as confirmed by the player; Psionic Sorcery component exclusions are displayed, not inferred for each proprietary material requirement. Psychic defenses against Charmed/Frightened are informational; damage resistance to Psychic is automatic.
- Clockwork Trance of Order's minimum-d20 behaviour is applied to the **dedicated spell-attack control**, but not every other generic check and saving-throw dialog in Folio. Bastion shields on allies don't directly edit another person's sheet. Clockwork Cavalcade's allied healing, object repair and dispelling require table adjudication.
- Draconic Wings' one-hour duration and Aberrant ten-minute adaptations use tracked rounds if the user advances the Sorcerer turn. External clocks and durations are not automatically advanced when Folio is closed. Dragon Companion creature attacks and statistics are not simulated.
- The catalog retains a mixture of fully described SRD-licensed spells and **name-only PHB references**. Name-only spell components, concentrations, target effects, casting times and material costs still need verification at the table. Effect reminders and normal resource consumption are not a substitute for the full PHB spell rules.
- A Sorcerer turn is explicitly started using its panel; without starting it, the application cannot know when the user's in-game turn begins. Other players' and enemies' saving throws, HP, positions, vulnerability, and outcomes are never invented.
- Multiclassing, unrevised older subclasses and future sourcebooks are **not part of** the 2024 PHB single-class Sorcerer milestone. Rules-version verification of all registry records is a separate audit.

## Verification

- `npm test`: **876 / 876 passing** (23 new Sorcerer-focused unit tests in this milestone, preserving the previous 853 tests).
- `python tests/milestone18-24-sorcerer-browser.py`: verified creation of all four Sorcerer origins, PHB spells and Psionic casting from the *actual* Spellbook modal, shared Metamagic and Innate spell-attack buttons, subclass resource controls, persistence across Library save/reopen, and 390-pixel mobile overflow.
- Independently retained browser tests for Druid 18.23, Bard 18.22, Cleric 18.21 and other completed classes are rerun for this release; see `TESTING.md` for their final outcomes.
- `npm run audit:rules`: **597 existing registry entries, zero revision conflicts, zero duplicate revision IDs; 554 remain pending source/version review**. This audit does not certify the spell list or all book mechanics.
- ZIP integrity, full standalone contents, launcher, and a clean-folder extraction with unit and Sorcerer browser tests are release blockers and checked before delivery.

## Next

The remaining 2024 PHB single-class classes are **Warlock** and **Wizard**. Keep existing character data, Pip, campaigns, homebrew, customization and backups intact while adding them.
