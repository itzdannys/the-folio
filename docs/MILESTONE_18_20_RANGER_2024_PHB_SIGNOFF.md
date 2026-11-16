# Milestone 18.20 — Ranger 2024 PHB character-sheet sign-off

**Scope:** The Folio offline, personal, local-first **single-class** Ranger levels 1–20, using the four revised 2024 Player's Handbook Ranger subclasses. Built on the validated 18.19 Monk ZIP. This is **not** an all-sourcebooks, all-spells, fully autonomous combat simulator or multiclassing sign-off.

## What was already present

- Ranger spell slots and prepared-spell builder; Favored Enemy's free Hunter's Mark casts, spell-slot casts, marked weapon-hit Force damage, Precise Hunter, Foe Slayer, Relentless Hunter concentration protection.
- Base passive movement and Extra Attack; Hunter's existing Colossus Slayer/Horde Breaker options, Defensive Tactics, superior defense; Tireless temporary HP; Nature's Veil and other baseline class controls.
- Local saving, campaign folders, custom character/homebrew, Pip, equipment and weapons, dice, source-manager audit and Windows launcher.

## What changed in this milestone

- Added missing 2024 subclass choices **Beast Master, Fey Wanderer, Gloom Stalker**, while preserving Hunter and stable character IDs.
- Added **Druidic Warrior** as a Ranger-only level-2 Fighting Style alternative with two selected Druid cantrips, rather than an unrestricted general feat.
- Added class-specific tracked turns: Action, Bonus Action, Reaction, spell-slot-cast limit, Extra Attack, Light/Nick, Opportunity and specialized extra attacks. Untracked out-of-combat usage remains available. Hunter's Mark casts share this budget, whether cast from the class panel or spellbook.
- Added **Deft Explorer** proficiency-based Expertise/language selections and level-9 expertise, saved through character rebuilds; updated the core sheet to display Fey Wanderer Charisma-check bonuses, Gloom Stalker Iron Mind saves, Roving climb/swim speeds and Feral Senses Blindsight range.
- **Beast Master:** Land/Sea/Sky companion stat blocks with level/Wisdom scaling, HP editing, 2024 Beast's Strike rolls, command actions, Extra Attack substitution, level-7 additional beast Bonus Action, level-11 Bestial Fury, spell-slot revival after a confirmed one-minute ritual, level-15 Share Spells confirmation and save persistence.
- **Fey Wanderer:** Dreadful Strikes Psychic damage once per target/turn through the actual weapon roller; Otherworldly Glamour skill bonus; Beguiling Twist Reaction/saving-throw result; free Fey Reinforcements and concentration choice; Misty Wanderer free casts with confirmed willing passenger. Always-prepared subclass spells are granted through existing spell engine.
- **Gloom Stalker:** Dread Ambusher's Wisdom Initiative bonus, first-turn +10 ft movement, Dreadful Strike on weapon hits (charge limited; once/turn, critical dice), Umbral Sight/Darkvision and Iron Mind, level-11 Sudden Strike extra attack / Mass Fear table-confirmed saving-throw path, Shadowy Dodge shared Reaction and teleport. No superseded first-round extra attack from 2014.
- **Hunter:** Existing 2024 Colossus Slayer, Horde Breaker, rest choices and defensive options retained. Horde Breaker corrected to trigger from an eligible **weapon attack even if it misses**, and to require a distinct nearby target and the same weapon; Superior Hunter's Prey confirmed damage, Hunter's Lore and level-15 defense integration.
- Continued read-only version audit; 585 built-in catalogue records, 547 source candidates and 38 pending options. No automated replacement or unauthorized bulk import of third-party content.

## Functional boundaries

**Folio calculates and commits Ranger-side rules:** slot/free-use consumption, companion HP and attack dice, damage and resource charges, limit enforcement, selected abilities/proficiencies, known levels and class state. The app does **not** own enemy/ally character sheets and cannot authoritatively know whether a target was hit by another actor, is in range, has a particular size/condition, or passed a saving throw. Confirm those details in the app; record other-creature HP/conditions at the table.

Certain spell effects (including Summon Fey, Misty Step passenger positions, Share Spells on another creature, wilderness rituals and enemy fear) are intentionally confirmation-assisted, not simulated. The 2024 Tireless short-rest decrease of Exhaustion and Gloom Stalker darkvision concealment are documented for table recording, because Folio's existing one-character sheet does not maintain an external-world state/exhaustion automation. The shared rules registry remains **read-only audit**, not yet the builder's authoritative version selector. Multiclassing and sourcebooks beyond the 2024 PHB remain outside this single-class milestone.

## Verification

- **758 / 758 Node automated tests passed**, including **30 new Ranger-focused tests**. Tested all 20 levels and all four subclass unlocks, spent resources and their limits, rest persistence, spell casting rules, companion forms/strike/HP/revival, Fey/Gloom bonuses, Hunter Horde/Superior, initiative, legacy-save round trips, and cross-class isolation.
- **Seven individual Chromium browser suites passed**: Ranger, Monk, Fighter, Rogue, Barbarian, Paladin, and read-only registry. Ranger browser test creates all four Ranger subclasses in the built-in builder, uses Beast/Gloom/Fey controls and actual weapon attacks, saves/reopens characters, and checks mobile overflow.
- Tests use isolated simulated saves/storage. Live user files, Windows launcher operating system behaviour and arbitrary third-party data cannot be exhaustively tested from the test harness. No save schema migration introduced.
- The final packaged ZIP was clean-extracted and the automated suite, Ranger browser suite and rules audit rerun from its extracted contents.

## Future work — separate from 2024 single-class Ranger

Additional sourcebooks with Ranger options; global all-sourcebook version selection; multispecies party/monster simulator; comprehensive spell-effect engine and multiclassing. Do not conflate these future-wide systems with this Ranger character-sheet sign-off.
