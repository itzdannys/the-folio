# The Folio — Milestone 18.30: PHB 24 Feats

**Status:** Implemented and verified for the single-class **offline personal character-sheet scope**. This does **not** imply the app is a full tabletop battle/DM simulator.

## Starting point and preservation

Based on full Milestone 18.29 ZIP, without a restart. Keep `Open The Folio.cmd` (same Windows local launcher), library and auto-save, Pip/legacy characters, campaign folders, local backups, other-book and user-entered homebrew choices, appearance, dice and all 12 2024 PHB classes. Rules metadata keeps legally distinct `srd-2024` and `phb-2024` IDs; both display as **PHB 24** in the app. No handbook PDF or supplementary third-party data archive is redistributed in the release.

## Catalogue and builder

- 42 General feats, 10 standard Fighting Style feats, 12 Epic Boons. Paladin Blessed Warrior and Ranger Druidic Warrior remain class-specific Fighting Style alternatives, not counted among the ten.
- Earlier Origin feats are preserved from 18.29, including all three Magic Initiate spell lists.
- Feat milestones, 2024 eligibility and prerequisite checks; feat-specific ability increases (+1 choice where applicable), Epic Boon cap up to 30, ASI choices and Resilient saving-throw proficiency. Earned level-gated feats stop applying after a level-down, while future choices are retained for level-up.
- A character's earned feat cards show on Features & Traits, collapsed by default; feat options and history persist per character.

## Applied character-sheet mechanics

- **Passives/calculations:** selected ability-score increases, Tough already provided by 18.29, Boon of Fortitude +40 max HP, Speedy / Boon of Speed, Boon of Truesight, Skulker / Blind Fighting sense, Medium Armor Master Dexterity cap when medium armor equipped, Heavy Armor Master once the player confirms qualifying attack damage, Energy Resistance selection and the confirmed Night Spirit lighting condition, and selected skill proficiencies/Expertise from Skill Expert, Keen Mind, Observant and Boon of Skill.
- **Spell system:** Fey-Touched (Misty Step and chosen spell), Shadow-Touched (Invisibility and chosen spell), Ritual Caster (level-1 Ritual choices and Quick Ritual), Telepathic (Detect Thoughts), Telekinetic (Mage Hand), plus Boon of Spell Recall's chance to retain a spent level-1–4 slot. Free cast resource tracking integrates with the existing Spellbook.
- **Active use records/resources:** Charger, Crusher, Grappler, Piercer, Slasher, Shield Master, Mage Slayer, Durable, Chef treats, Inspiring Leader, Poisoner craft (50 GP and inventory doses), Polearm Master, Sentinel, Telekinetic shove, Dual Wielder, Defensive Duelist, Interception and Protection, and Epic Boon Combat Prowess, Dimensional Travel, Energy Redirection, Fate, Fortitude, Recovery, Speed and Night Spirit. Rest/turn counters use existing character resource storage. Reaction-based feats share reaction accounting through the class-state tracker.
- **Incoming Damage:** Boon of Recovery Last Stand appears only when usable and is applied to an eligible incoming hit after player confirmation; heavy armor reduction is optional per qualifying attack, not silently applied to environmental or spell damage.

## Intentional manual / DM-assisted boundaries

The Folio is a local character sheet, not a tactical board. The application cannot determine whether an enemy is in reach, whether a target failed a saving throw, lighting and terrain beyond player input, whether an attack crit or hit without the table/DM, which allies are eligible, or an enemy's final HP. Conditional triggers need explicit player confirmation. Not every feat's special combat interaction is automatically injected into every weapon roll: for example, weapon and spell attack benefits that depend on an enemy's cover, position, Resistance, spell school, or use of the Attack Action remain reference/confirmation-assisted. The feat cards provide concise summaries, not the proprietary text of the Player’s Handbook. These are honest feature boundaries, not missing feat entries.

The builder remains single-class; non-PHB sources and unreviewed homebrew are preserved but not automatically treated as PHB rules. Character sheets can still use manual overrides for table rulings.

## Verification

- Automated: `node --test tests/*.test.cjs`: **983/983 passed**.
- Browser: **17/17** target suites, including all twelve previously signed-off classes, source registry, prior UI polish, Species & Traits, Backgrounds & Origin Feats, and new feat-builder UX. Latest feat browser test includes save/reopen and mobile layout.
- Source audit: **648 candidate rules records**, zero version conflicts/duplicate revisions; **605 candidates still require manual source/version review**.
- Release: full ZIP preserved; clean-extraction tests run separately. The Windows `.cmd` file is included but cannot be executed natively on the Linux test host.

## Next milestone

18.31 multiclassing, including true combined spell-slot progression, cross-class prerequisites/features and tests. Do not assume multiclassing works in 18.30.
