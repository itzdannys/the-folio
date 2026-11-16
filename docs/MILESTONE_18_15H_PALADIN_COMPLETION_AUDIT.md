# The Folio — Milestone 18.15H Paladin completion pass

**Baseline:** 18.15G, 2024 *Player's Handbook* Paladin and its four revised subclasses, with the existing read-only versioned rules inventory. **Date:** 2026-11-15. **Status:** A substantial Paladin mechanics completion pass, **NOT total autonomous D&D combat/spell simulation**. No separate 2014/2024 versions were introduced.

## What already worked before this batch

- Single-class Paladin progression, hit points, proficiency and class resource limits, slot progression, prepared oath spells, Paladin weapon mastery selection, Lay On Hands / Restoring Touch, Divine Smite / free use, Find Steed free-use record, Channel Divinity, Divine Sense and Abjure Foes.
- Aura of Protection / Courage, Devotion aura / Smite of Protection / Holy Nimbus activation, Glory Inspiring Smite / Glorious Defense / Living Legend activation and reroll, Ancients Aura of Warding / Undying Sentinel / Elder Champion activation and start-turn regeneration, Vengeance Vow / Relentless Avenger / Soul of Vengeance / Avenging Angel activation.
- Local-first saves, profiles and campaigns, Pip, homebrew, offline UI, dice, equipment and source packs. Existing turn-budget tracker was opt-in and did not yet enforce weapon Attack/Extra Attack roles.

## Added and linked to the existing application

| Paladin option | Added behavior | Limit of automation |
|---|---|---|
| Core Attack action, level 5 Extra Attack | One normal attack before level 5, up to two from 5; attacks count in the optional tracked turn. | Player must start the tracked turn, choose the right role, and confirm attack-specific circumstances. |
| 2024 Light and Nick | Extra attack using a different Light weapon; Bonus Action for Light, no Bonus Action when mastered Nick applies; Two-Weapon Fighting positive modifier is accounted for. | Player chooses the appropriate attack role and equips the weapons. |
| Ordinary Opportunity Attack | Validates confirmed trigger and melee weapon reach, charges the shared Reaction; distinct from oath-specific Reactions. | Creature movement and line of sight are DM confirmed. |
| Sacred Weapon / Vow of Enmity | Starting the ability in a tracked turn claims the Attack action but preserves attacks available during that action. | Confirmation of target and aura range remains with the table. |
| Unarmed Strike | Attack roll/critical/hit/damage, Radiant Strikes from level 11, Divine Smite on confirmed hit; Grapple/Shove save DC and outcome; shared Attack/Reaction budget. | DM confirms target reach, size, free hand, enemy saves and ongoing conditions. |
| Glory Aura of Alacrity | Nearby ally's walking Speed calculated with +10 from level 7; correct 10/30-ft aura range. | Ally entering/starting its turn, duration and movement still player/DM confirmed. |
| Ancients Nature's Wrath | Save comparison for initial target(s), repeat Strength saves at turn ends, maximum duration countdown, effect ending logic. | No enemy sheet changes or automatic turn advancing. |
| Ancients Elder Champion | Enemy saving throw with two d20 (Disadvantage) and DC, and Swift Spells can record Action spells as a Bonus Action while the capstone is active. | Requires confirmed enemy in aura and eligible spell casting time; enemy saves manually input. |
| Vengeance Avenging Angel | On enemy turn start, confirms Wisdom save; records Frightened effect and ends it when damage or expiry is confirmed. | No automatic enemies, positions, aura turns or enemy HP. |
| Devotion Holy Nimbus | Damage on confirmed enemy turn start in active aura = Charisma modifier + proficiency bonus, Radiant. | DM applies damage to enemy; sunlight effects are manual. |
| Blessed Warrior | New Paladin-only level-2 Fighting Style alternative with access to two Cleric cantrips, Charisma casting and a **level-up**, not Long Rest, replacement path. | Cantrips available only from locally bundled/licensed content or authorized local imports; many individual spell effects remain manual. |
| Data / UI integration | Separate source-audit records for the new Paladin style option, new event controls, result details, save/reopen and undo-preserving transactions. | Version registry still **read-only**, with 563 inventoried options; it does not swap current rules automatically. |

## Explicit remaining limitations: why this is marked partial

The user requested all remaining Paladin parts; the entire Paladin-specific 1–20 progression and four oaths have been audited and applicable controls expanded, but the following would require broad changes to the whole application, other character sheets, or full licensed data and therefore **are not finished**:

1. **Not every individual Paladin spell is a functional simulator**. Sourcebook-only spell references lack complete licensed text/target logic. Spell preparation, eligibility, casting costs and shared action limits work; certain concentration, summon, mount, AoE, duration, movement and conditional effects require table input.
2. **External creatures and allies don't have autonomous turns or authoritative sheets in Folio**. Enemy saving throws, damage, fear, restraint, and ally positioning use confirmed input and recorded results. This deliberately avoids inventing outcomes or silently editing somebody else's character.
3. **Full cross-class action economy and multiclass Paladin support** are outside the 18.15H Paladin-specific scope. Turn tracking is opt-in, and certain reaction/spell timings and effect expiry require table tracking.
4. **Selected official non-PHB Paladin subclasses and 2025/26 content** are not source-verified or implemented in this build. The four audited 2024 PHB oaths are the current focus, and the general source/version registry remains read-only.
5. Windows `.cmd` launcher and real IndexedDB persistence were not exercised by the automated Chromium harness, which stubs localStorage; normal saves, reopening within that browser fixture, and JSON state persistence were verified.

**No external source data was scraped and redistributed.** Existing licensed data and concise original rule summaries were used; sourcebook-only references stay separate from mechanics.

## Verification and reproducibility

- Run `npm test` from the extracted project root. **554/554 tests passed** in the initial integration environment (529 inherited, 25 new Paladin closure tests). This includes a four-oath level-1–20 availability sweep and cross-class compatibility.
- Run `python tests/milestone18-15h-paladin-closure-browser.py`: new Paladin unarmed/grapple/Extra Attack, Glory aura Speed, Vengeance enemy-effect, save/reopen and 390px mobile check.
- The earlier 18.15B, C, D, E, F, G browser suites and the broad 2024 PHB Paladin browser test were rerun and passed after two compatibility fixes: expected catalogue count (562→563) and duplicate Opportunity Attack checkbox input names.
- `npm run audit:rules`: **563 catalogue entries**, **525 candidate source-date records**, **38 pending source metadata**, **5 reviewed version identities**, **no duplicate revision IDs or conflicts**. The 520 other date-complete candidates are still pending manual source/version verification; **audit does not certify mechanics**.
- `node --check` for the modified JavaScript, a clean ZIP extraction, and a second `npm test` and new browser pass should be performed before distribution.

**Developer note:** `FolioPaladinCombat` is a small offline-only module, loaded alongside the existing class mechanics. Nothing was migrated or deleted, no online service was introduced, and no Pip-specific class logic was altered.
