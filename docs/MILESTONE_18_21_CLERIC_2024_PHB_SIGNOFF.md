# Milestone 18.21 — Cleric 2024 Player's Handbook (character-sheet sign-off)

## Baseline and boundaries

Built from the existing **18.20 Ranger signed-off Folio**. The existing Folio browser, offline local save, export/import backups, character profiles, campaigns, homebrew editor, dice, weapon roller, and previously completed classes remain in place. No server, account, online fetch, or cloud data is required. This milestone uses the latest 2024 PHB **single-class Cleric** options only. It does not claim to implement every spell's bespoke effects or multiclassing; those are separate projects.

## What existed before

- A 2024-compatible Cleric full-caster spell progression, prepared spellbook, known Cleric spells and spell slots.
- Channel Divinity resources, Divine Spark, and Life Domain's Preserve Life.
- General character creation, equipment, saving throws, action and reaction tracking, dice, local persistence and backups.

## Added in 18.21

- The remaining three 2024 PHB domains (Light, Trickery, War) in the same subclass list as Life, with **stable subclass identifiers**, no 2014 duplication, and level 3 entry gates. Domain-granted spells are gated at levels 3/5/7/9 without consuming normal preparation slots.
- Divine Order (Protector or Thaumaturge), including Protector martial-weapon proficiency and Thaumaturge's cantrip allowance and Arcana/Religion bonus.
- Cleric turn tracker and spell cast timing/action budget; integrated with the normal Folio Spellbook and local save data.
- Turn Undead and level-5 Sear Undead target rolls; Divine Spark 1–4 dice by class level, Life Preserve Life; Channel Divinity use recovery.
- Level-7 Blessed Strikes choice: Divine Strike (weapon attack + critical dice, once per turn; improvement at 14) or Potent Spellcasting (Wisdom damage bonus, level-14 confirmed-target temporary HP).
- Divine Intervention (level 10, verified spell eligibility and no slot expenditure) and Greater Divine Intervention (level 20, Wish recovery across Long Rests).
- Life Domain: slot-based healing bonus, self-heal when healing others, maximum healing dice at level 17, and Preserve Life.
- Light Domain: Radiance of the Dawn with confirmed saving throws, Warding Flare Reaction and level-6 temporary HP, level-17 Corona of Light timed effect.
- Trickery Domain: Blessing of the Trickster, Invoke Duplicity with tracked duration/Bonus Action/teleport and level-17 follow-up healing; player-confirmed positioning and attack advantage.
- War Domain: War Priest limited Bonus Action weapon attacks, Guided Strike reaction/attack correction, level-6 War God's Blessing, and automatic level-17 physical-damage resistance.
- Local UI controls for class turns, resources and attacks. No user data migrations or replacement of the source-pack system.

## Tested

- **783/783 automated Node tests passed** (prior 758 plus 25 Cleric tests). New tests exercise levels 1–20 across all four domains, state/eligibility, resource spending, level gates, rest behavior, spell grants, saves, actions, damage, healing, and save serialization.
- **8/8 named browser checks passed** (Cleric; Ranger; Monk; Fighter; Barbarian; Rogue; Paladin; rules version registry). The Cleric check creates all four domain characters in the actual builder, invokes abilities and confirms save/reopen and mobile layout.
- Rules audit: **588 catalogue candidates**, 0 duplicate revision IDs, 0 source version conflicts. **545 candidate entries still require manual source/version verification** across the broader database; this Cleric milestone does not certify the entire source catalogue.
- Final distributable tested after clean extraction.

## Manual/table-confirmed boundaries — NOT automatic

- The Folio is a **character-sheet** app, not a virtual tabletop or monster database. Other creatures' HP, conditions, locations, consent, line of sight and saving throws require user/DM confirmation; no creature data is invented.
- Spellbook manages preparation, costs, casts and spell metadata, but individual unusual spell outcomes (including Wish) still use the user/DM's instructions; Divine Intervention records its free cast selection and recovery but does not simulate every spell.
- Life healing amount controls require a confirmed healing spell in the Spellbook; do not record a slot twice. Warding Flare ally temporary HP, Trickery illusion spell origin and War God's Blessing spell effects are confirmed-table events.
- Combat turn tracking is opt-in when the user starts a Cleric turn, preserving the original out-of-combat sheet/Spellbook workflow.
- The new Cleric weapon attack control applies Divine Strike; external enemy/ally effects and other combat displays may require table confirmation. Full generic spell damage simulation and multiclass features are not part of this sign-off.

## Licensing and provenance

Only rules-identifying labels and calculated mechanics metadata were added, not full copyrighted PHB excerpts. Existing SRD content and personal-source import boundaries are retained; the supplied external JSON/XML compendia are not bundled. Source/version audit remains read-only.
