# Milestone 18.16B — Fighter attack integrations and external source audit (PARTIAL)

**Date:** 2026-11-15. **Base:** Milestone 18.16A Fighter partial ZIP. **Runtime:** Offline, no account/server, no external data dependency.

## What was already in Folio

- Fighter base-class progression, four 2024 PHB subclasses, Battle Master maneuver selections, Superiority Dice, Psi Warrior energy dice, Eldritch Knight spell/weapon features and Champion mechanics.
- Weapon-attack roller, named Fighter targets, Extra Attack/Action Surge/Light/Nick budgets, save/undo and a read-only rules registry.
- 593 automated Node tests in the starting ZIP. Attack maneuver rolls and Psi Strike were separately recorded, not atomically coupled to weapon attacks.

## Implemented in 18.16B

1. **Battle Master attack integration.** The inventory weapon-attack dialog now offers learned attack-on-hit maneuvers. For a confirmed hit against a named target with entered AC, the same weapon roll consumes one Superiority Die and adds the correct maneuver damage of the weapon's damage type. On a critical hit, the added attack damage die is doubled. It records the maneuver name, damage dice and save DC. Only one maneuver can be selected per attack. These seven on-hit maneuvers are integrated: **Disarming, Distracting, Goading, Maneuvering, Menacing, Pushing, Trip**.
2. **Relentless (Battle Master 15).** The attack roller supports the once-per-turn d8 option without spending a Superiority Die, while preventing a second use on the same tracked turn. Misses do not consume the die or free option.
3. **Psi Warrior attack integration.** Confirming a hit within 30 feet on the Fighter's turn now rolls a Psionic Energy Die, adds the Intelligence modifier as separate Force damage, and expends a die atomically. It respects once-per-turn limits and keeps the Telekinetic Thrust save DC accessible. The external target's condition/position remains table-confirmed. Psionic Strike is not applied to off-turn Opportunity Attacks.
4. **Precondition safety and serialization.** The roller rejects unlearned maneuvers, insufficient resources, missing named target or AC, unconfirmed Psi range and wrong subclass. A miss does not spend these resources. Event result details are stored with the existing character resource state; no save schema or established UI structures were replaced.
5. **Source audit utility.** Added `scripts/audit-external-dnd-data.cjs`, a read-only command for the **user-supplied** `dnd-data-main.zip`. This reads a locally extracted `data/` directory and reports catalogue counts, missing provenance and possible legacy/2024 name overlaps. It does **not** import text, modify characters, write data to a server or make network calls.

## Data-source findings (the uploaded dnd-data-main.zip)

| Dataset | Records | 2024 PHB-tagged | Same name/publisher across old and 2024 PHB |
|---|---:|---:|---:|
| Classes | 134 | 12 | 12 |
| Species | 383 | 10 | 7 |
| Backgrounds | 405 | 16 | 9 |
| Spells | 5,849 | 391 | 359 |
| Items | 15,749 | 197 | 163 |
| Monsters | 11,463 | 69 | 0 |
| **Total** | **33,983** | | |

The source also has **13 class entries with incomplete publisher/book metadata**. These counts describe source labels, **not** confirmed official or current options. An equal name does not itself prove supersession. The uploaded archive includes third-party and legacy entries; its MIT `LICENSE` is not sufficient proof of authorization to redistribute all incorporated rulebook descriptions. **No raw data from this archive was included in the distributed Folio ZIP.**

Run the optional audit after extracting the user-supplied data archive locally:

```sh
node scripts/audit-external-dnd-data.cjs /path/to/dnd-data-main/data
```

The existing rules registry remains **read-only**, and current builder choices are unchanged by this external audit. Existing saved profiles and user-created rules are unaffected.

## Verification

- Node automated suite: **607/607 passed** (593 inherited, **14 new** Fighter attack-link tests).
- Browser: **7 confirmed passing suites** — 18.16B linked attacks/save/mobile, 18.16A four Fighter subclasses, 18.9 Champion, 18.15I Paladin, 18.15B registry/Pip isolation, M17 source packs and 18.6 Rogue.
- A separate broad `tests/browser-smoke.py` run stalled; it is **not counted as passed** in this release.
- New browser tests use a mock localStorage (actual user IndexedDB content, the Windows launcher and source-book rights were not independently tested).
- The registry audit should still inventory **572** entries (read-only; the third-party archive does not add to it).

## Not yet done — Fighter remains partial

- Battle Master: **Precision Attack** as an attack-roll modification, **Riposte** counterattack and **Sweeping Attack** second-target damage remain separately resolved; several other maneuvers still have stand-alone controls or confirmed table effects. Ally reactions, target conditions, movement and saves remain table-controlled.
- Eldritch Knight: War Magic replacement and Wizard spellcasting are not yet one atomic action; caster slot and casting-time integration require further work.
- Psi Warrior: Telekinetic Thrust target saving throws, Bulwark target effects and Telekinesis's battlefield effects still rely on confirmed table inputs.
- Fighter is not signed off; broader rules imports, multiclassing, other-sourcebook content and fully automated combat are future work.

## Rights and reliability

Use this tool for personal development and source comparison. Official content must still be source-verified and appropriately licensed or imported with authorization. Do not treat names/metadata from community-curated datasets as definitive mechanics or overwrite saved character options silently.
