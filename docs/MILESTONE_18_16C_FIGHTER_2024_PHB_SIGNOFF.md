# Milestone 18.16C — Fighter 2024 Player’s Handbook character-sheet sign-off

## Scope and baseline

Builds on the user's 18.16B archive, including the signed-off 18.15I Paladin. The agreement is to complete one class at a time for offline character-sheet functionality, **not** to simulate every creature in a D&D encounter. Only the four 2024 PHB Fighter subclasses are within this sign-off. Older non-superseded official supplements, later releases, multiclassing, and full arbitrary spell automation remain separate work.

## Core Fighter, levels 1–20

- **1–2:** Fighting Style, Second Wind, Weapon Mastery, Action Surge and Tactical Mind remain present and use existing shared class resources.
- **3–8:** Class/subclass unlock at 3, ASIs/feats and Fighter-specific Extra Attack/Tactical Shift at 5; Action Surge and weapon attacks share a tracked action budget; level gates are verified.
- **9–14:** Indomitable, Tactical Master (Push/Sap/Slow mastered-weapon alternatives), third Attack-action attack at 11 and Studied Attacks at 13 are tracked; misses grant target-specific Advantage until the appropriate expiry.
- **15–20:** Remaining Fighter subclass features, Action Surge/Indomitable resource increases, feat selections, and four attacks per Attack action at level 20 are preserved. Weapon interactions use the same attack budget as the base class.

## Champion

Preserved from earlier Fighter batches: critical-range upgrades, Remarkable Athlete, additional Fighting Style, Heroic Warrior inspiration, and level-18 Survivor/Defy Death checks. Only the character's own calculations and confirmed triggers are automated.

## Battle Master

- All 20 2024 maneuver options are selectable subject to known-maneuver limits and level-based Superiority Dice pools (d8/d10/d12). Relentless's 2024 free d8 is tracked once per turn.
- **Attack-integrated:** Disarming, Distracting, Goading, Maneuvering, Menacing, Pushing, Trip, and Sweeping (including its separate second-creature check), Precision on a miss, Riposte as a Reaction, and Feinting/Lunging damage after verified attack prerequisites. Attack-linked dice are consumed only when their actual trigger succeeds or, for Precision and Riposte, when used on the specified attack event. Critical hits double appropriate bonus damage dice.
- **Self resources:** Evasive Footwork and Bait-and-Switch self AC bonuses, self Rally temporary HP, Reaction/Bonus Action limits and their expiry/short-rest behavior use actual sheet state.
- **Progression choices:** Student of War chooses one eligible Fighter skill and one Artisan tool, persists across save/reopen and compatible build reconstruction. Commander’s Strike replaces one of the Fighter's Attack-action attacks; the ally's Reaction and attack result are confirmed at the table. Know Your Enemy consumes the appropriate free use or Superiority Die.
- **Table-confirmed:** Enemy saving throws, disarm/drop position, knockback, Charmed/Frightened/Prone conditions, ally attack and movement, other-creature AC/HP, and environment-dependent initiative/ability checks. Folio records die/DC/bonus/results; no other character is silently modified.

## Eldritch Knight

- Fighter spell progression and Wizard cantrip/level spell access are tied to the 2024 subclass choice saved in `character.build`. This fixes a missing-subclass lookup in older spell rules.
- Weapon Bond/summoning and normal spell slot/concentration bookkeeping are preserved.
- War Magic (level 7) and Improved War Magic (level 18) now cast through the existing Spellbook; replacement of one or two Attack-action attacks, spell-slot validation and spell log form one transaction. Invalid casts cannot partly spend resources. The old button navigates to Spellbook.
- Eldritch Strike target-specific saving-throw Disadvantage is checked against its expiry; Arcane Charge stores the confirmed teleport and uses Action Surge resource tracking. Spell effects beyond Folio's existing spell engine still require normal tabletop adjudication.

## Psi Warrior

- Psionic Energy Dice pool/die size and short/long rest recovery are level-gated. Protective Field, once-on-turn Psionic Strike, Telekinetic Movement, Psi-Powered Leap, Guarded Mind and Bulwark of Force remain in the sheet.
- Psionic Strike's Force damage is attached to confirmed weapon hits. Telekinetic Thrust now evaluates the recent-struck target's confirmed Strength save against Fighter's actual DC without inventing monster state.
- Telekinetic Movement's free use correctly recharges at a Short Rest. Psi-Powered Leap/Bulwark track temporary durations; self Bulwark Half Cover affects AC/Dex saves and ends when incapacitated.
- Telekinetic Master records Telekinesis concentration and allows its limited Bonus Action weapon attack only while concentrating, respecting other tracked Bonus Actions. DM controls monster interactions and the spell's creature effects.

## Shared bug fixes and safety

- Fixed HTML encoding of apostrophes in the builder: previously Artisan tool labels like `Smith's Tools` were rendered incorrectly as `Smithundefineds Tools`. No visual redesign or user-data schema replacement.
- Persisted resource/selection changes via existing storage and Undo. Existing Paladin, Pip, homebrew, campaign folders, import/export, auto-save, offline behavior and UI preserved.
- The user-provided `dnd-data-main.zip` was used as an external audit/reference, **not** copied into this release. Neither the external raw copyrighted text nor unauthorized book data is repackaged.

## Verification and limitations

- **634/634 Node tests** pass. New tests include Precision hit/miss, Riposte, Sweeping AC, Feint/Lunge, atomically cast War Magic, persistent Student of War, Commander’s Strike, Psi Thrust, self defenses, Telekinetic Master, tests for existing character classes.
- Seven completed Chromium browser checks pass: 18.16A, 18.16B, 18.16C, Paladin 18.15I, Rogue 18.6, registry/Pip 18.15B, source packs M17.
- Read-only registry: 572 options; 0 reported revision-ID conflicts; 529 pending identity reviews. Database-wide version completeness **not** signed off.
- UI automation uses mocked local storage; it does not prove behavior on every real Windows machine or with an arbitrary old character ZIP. Some external encounters, complete spell descriptions/effects, cross-character reactions and movement need player or DM-confirmed inputs as intended by the product scope.

**Sign-off decision:** The **2024 PHB Fighter single-class character-sheet mechanics** are sufficiently implemented and regression-tested for the same scope used to sign off Paladin. This is not a claim that the complete 2024 PHB, every spell, all official books or multiclassing is finished.
