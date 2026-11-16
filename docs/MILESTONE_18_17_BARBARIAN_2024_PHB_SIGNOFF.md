# Milestone 18.17 — 2024 Player's Handbook Barbarian sign-off

**Scope:** Single-class 2024 PHB Barbarian levels 1–20 and four subclasses (Berserker, Path of the Wild Heart, Path of the World Tree, Path of the Zealot) in Folio's offline character-sheet workflow. Built directly on Fighter sign-off 18.16C. **Not** an all-book, multiclass, fully automated encounter, or full spell-effect rules engine.

## Pre-existing mechanics, kept intact

- Barbarian Rage and shared class resources, Heavy armor restriction, Reckless Attack/Strength advantage, Unarmored Defense, weapon mastery, Danger Sense, Extra Attack, Brutal Strike (level 9/13/17), Relentless Rage (level 11), the Berserker's Frenzy, Mindless Rage, Retaliation and Intimidating Presence, Feral Instinct, and level-18 Strength checks.
- Existing inventory, spellbook, ability and skill check resolution, rest buttons, condition and damage handling, combat initiative, character saving, export/import, campaign folders, homebrew, appearance and Pip.

## Added and connected in 18.17

| Level / path | Implemented character-sheet behavior | External/table adjudication |
| --- | --- | --- |
| Base 1–20 | Rage duration/extension, damage resistance, automatic Rage damage, Rage turn budget and exhaustion rules as appropriate; Extra Attack, Light/Nick and Opportunity Attack; Unarmed Strike with Grapple/Shove saves; Primal Knowledge skill proficiency; Danger Sense and Rage save advantage; Instinctive Pounce when entering Rage; Persistent Rage, initiative Rage recovery; Primal Champion +4 Str/Con up to 25 | Which enemy moved, target size/reach, exact battlefield movement, circumstances extending Rage |
| Berserker 3/6/10/14 | Existing Frenzy, Mindless Rage, Retaliation, Intimidating Presence preserved; latter now honors shared tracked Bonus Action; Frenzy also works with Unarmed Strike | Enemy saving throws for Intimidating Presence and external target conditions |
| Wild Heart 3/6/10/14 | Bear/Eagle/Wolf Rage choices, 2024 Bear resistances, Eagle Dash+Disengage on Rage entry or subsequent Bonus Action, Owl Darkvision, Panther Climb, Salmon Swim, falcon Flight when unarmored, Lion/Ram selection, Ram on confirmed melee hits; Wisdom ritual spell access to Beast Sense, Speak with Animals and Commune with Nature | Ally attack advantage from Wolf, Lion enemy targeting, ritual effect details, animal narrative |
| World Tree 3/6/10/14 | Vitality Surge temporary HP, Life-Giving Force bonus HP for another creature, Branches of the Tree save and Reaction, Battering Roots reach/mastery choice on attacks, Travel Along the Tree Bonus Action including **teleport as part of the Rage activation Bonus Action**, long teleport once per Rage, ally count, range | Confirmed ally HP updates, target positions and teleport destinations |
| Zealot 3/6/10/14 | Divine Fury Radiant/Necrotic damage applied on the first confirmed own-turn weapon **or unarmed** hit (critical doubles the die only), healing d12 pool, Fanatical Focus reroll, Zealous Presence bonus action, Rage of the Gods flight/resistance, Revivification Reaction and Rage expenditure | Other creatures' HP, their saving throws, recipient movement, aura outcomes |

Shared mechanics include level and subclass eligibility; number of Rage uses; rest recharge; tracked Actions, Bonus Actions and Reactions; duration, resource and once-per-turn controls; no fake enemy sheets. Unknown/DM-controlled positioning and other creatures' resources are always explicitly player-confirmed.

## Verification

- Automated `npm test`: **669/669 passed** after additions (35 new focused Barbarian tests and 634 inherited tests). Includes a 20-level, four-subclass resource audit and offline save-state cloning.
- Chromium browser: new 18.17 Barbarian UI/save/mobile flow; previous 18.10 Barbarian, 18.16C Fighter, 18.15I Paladin, 18.6 Rogue and 18.15B registry browser regressions **passed** individually.
- `npm run audit:rules`: 575 total candidate entries; 0 duplicate revision IDs/version conflicts, but **532 candidates still need manual provenance/version verification**. This is a read-only audit, not content import.
- Full package re-extraction and retesting performed before release (see TESTING.md).

## Explicit exclusions

- This release does not add official Barbarian subclasses from older unsuperseded supplements or later books. Those need the global latest-version content review.
- Does not auto-manage other creatures' HP, saves, conditions, temporary HP or grid positions, or fully adjudicate spells. Player/DM-confirmed outcomes are recorded instead.
- Does not implement multiclass Barbarians, additional sourcebooks, full shared encounter turns or complete weapon masteries for **every** class.
- Does not import or redistribute the proprietary descriptions from the user-provided `dnd-data-main.zip`; the existing registry remains read-only.

**Sign-off applies only to the agreed 2024 PHB single-class Barbarian character-sheet functionality**. It does not claim complete automation of D&D combat.
