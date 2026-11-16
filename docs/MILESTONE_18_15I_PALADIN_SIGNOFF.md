# Milestone 18.15I — 2024 PHB Paladin character-sheet sign-off

**Date:** 2026-11-15  
**Base:** Milestone 18.15H; integrates with existing Folio, not a replacement project.  
**Scope:** Single-class Paladin, levels 1–20, and the four oaths from the 2024 Player's Handbook: Devotion, Glory, Ancients, Vengeance. All character-sheet rules use the newest applicable 2024 PHB/SRD rules as checked in this development batch.

## Feature coverage and status

| Levels | Features / category | What Folio handles |
|---|---|---|
| 1–2 | Lay On Hands, Spellcasting, Weapon Mastery, Fighting Style, Paladin's Smite | Class data/resources, healing, combat dice, mastered weapons, all eleven available 2024 Fighting Style choices including Blessed Warrior, free/slot smite accounting. Tracked Action/Bonus Action and cast-slot limits. |
| 3–5 | Channel Divinity, oath selection/spells, ASI, Extra Attack, Faithful Steed | Channel Divinity options and short/long rest recharge, oath-granted spells, level gating, Attack/Extra Attack and Light/Nick, Find Steed cast with local companion stats/HP. |
| 6–11 | Aura of Protection, oath level-7 effects, Abjure Foes, Aura of Courage, Radiant Strikes | Own aura modifiers/immunity, ally calculator, Abjure Foes tracked saves, damage and resource integration, confirmed attacks. |
| 12–19 | ASI, Restoring Touch, oath level-15 powers, aura expansion, epic feat choice | Level gating and character-sheet feat choices, condition removal/healing, reactive subclass effects, correct 30-foot aura. |
| 20 | Oath capstones | Resource consumption, timed powers, confirmed enemy/aura effects, rerolls, bonus action casting under Elder Champion, once-per-turn hits and self regeneration. |
| Devotion | Sacred Weapon, Devotion aura, Smite of Protection, Holy Nimbus | Class resources, attack bonus, anti-Charm, Half Cover, logged aura damage. |
| Glory | Peerless Athlete, Aura of Alacrity, Inspiring Smite, Glorious Defense, Living Legend | Timed athlete checks, ally speed calculator, temporary HP distribution, confirmed reaction/counterattack, save reroll and missed-attack correction. |
| Ancients | Nature's Wrath, Aura of Warding, Undying Sentinel, Elder Champion | Confirmed saves and effect tracking, typed resistance, lethal/nonlethal rescue, timed capstone, turn-start healing and Swift Spells. |
| Vengeance | Vow of Enmity, Relentless Avenger, Soul of Vengeance, Avenging Angel | Target Advantage, transfer/duration, Opportunity and Reaction strikes, enemy fear calculations/records. |

## Milestone 18.15I additions

1. Timed effects tick by explicit six-second combat rounds when turn tracking is enabled; manual end is still available for non-combat situations. Timer state is serialized.
2. Six missing PHB Fighting Styles imported as *distinct 2024* options; Dueling/Thrown/GWF and Unarmed use actual damage dice; Protection/Interception and the once-per-turn grapple option use existing shared Reaction and turn-ledger state.
3. Faithful Steed stores its form/type, AC = 10 + spell level, maximum HP = 5 + 10 × spell level, speed 60 ft and 60-ft flying speed from 4th-level casting onward. The resource cost uses existing spellcasting logic. HP updates and dismissal persist.
4. Tracked combat spells with unknown casting time require manual confirmation of the sourcebook casting-time category; no free action bypass. Older untracked noncombat recordings are preserved.
5. Fixed existing d10 versatile damage roll parsing; existing other-class weapon calculations remain compatible.

## Test evidence

- `npm test`: **572/572**, including 18 additional sign-off cases, class level-by-level checks inherited from 18.15H, and historical behavior tests.
- `npm run audit:rules`: **569 entries**, no duplicate revision IDs or version conflicts. This is not 569 source-verified official records: 526 need verification, 38 still lack complete source dates and only five class/oath identities have been explicitly reviewed.
- Nine focused and regression browser suites pass (listed in root `TESTING.md`), covering characters created at several levels, spellcasting, weapon attacks and Reactions, saving/reopening, ally and enemy event recording, source imports and mobile layout.
- Clean ZIP extraction plus rerun of Node tests and new browser smoke performed as release verification.

## Explicit scope boundary — what still requires the table or future project-wide work

- **DM input remains required** for enemy rolls, legal target positions/reach, creature type and awareness, external creature/ally HP and conditions, mount initiative/actions, and interpreting many individual spell effects. Folio assists with calculations, resources, reminders and recording but is **not** an independent virtual tabletop or encounter simulator.
- Reference-only spells do not acquire automatically executable full text/mechanics. Real spell-effect coverage varies with available licensed local data; 2024 PHB content alone does not imply every spell is simulated.
- **Older official Paladin subclasses not revised in the 2024 PHB** and options newly released in 2025–2026 are not automatically included by finishing the four PHB oaths. These are separate sourcebook licensing/version-review work.
- **Multiclassing** and fully automated feat interactions across every official book are still project-level gaps; this sign-off applies to **single-class 2024 PHB Paladin**.
- Local browser tests stub `localStorage` and do not test an installed Windows launcher or migration of a user's physical IndexedDB database. Always export/back up before replacing the installed copy.

**Sign-off decision:** The scope above — 2024 PHB Paladin base class and four oaths within Folio's character-sheet architecture — is feature-complete and regression-tested. No claim of fully autonomous tabletop combat, exhaustive official 2026 options, or completion of unrelated classes is made.
