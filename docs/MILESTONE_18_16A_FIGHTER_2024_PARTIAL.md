# Milestone 18.16A — 2024 Player’s Handbook Fighter implementation (PARTIAL)

**Date:** 2026-11-15. **Starting checkpoint:** Milestone 18.15I (signed-off 2024 PHB Paladin). This is an incremental offline-first extension of the existing Folio, not a new app.

## Previously present

- Fighter base-class level progression and resources: Fighting Style, Second Wind, Action Surge, Tactical Mind, Indomitable, Weapon Mastery, attacks at levels 1/5/11/20.
- Champion subclass choice and prior improved/superior critical, Remarkable Athlete, additional Fighting Style, Heroic Warrior, Survivor and death-save support.
- Existing weapon attack, Light/Nick, spellbook and source registry, local character library and autosaves.
- 572 automated tests and a read-only source/version audit.

## Implemented in this batch

1. Added selectable **Battle Master**, **Eldritch Knight** and **Psi Warrior** 2024 PHB options without introducing legacy duplicate versions; Champion remains the fourth.
2. Added an optional Fighter tracked-turn ledger for Action / Bonus Action / Reaction, Extra Attack (including level 11 three and level 20 four attacks), Action Surge, Light/Nick and opportunity attacks. Fighter's Second Wind uses the shared Bonus Action on tracked turns. Manual new-turn reset and encounter-advance integration refresh the Reaction. Fighter weapon attacks can use named targets and level-13 Studied Attacks Advantage after a miss, including correct expiry and retaining a different missed target after unrelated hits. Level-9 Tactical Master allows Push/Sap/Slow on eligible mastered weapon attacks with table-confirmed outcomes.
3. **Battle Master:** selectable known maneuvers (three at level 3; five at 7; seven at 10; nine at 15), saved choices; tracked Superiority Dice, die scaling, short-rest recovery, save DC, reaction/bonus economy, 20 maneuver choices with dice rolls and descriptive effect guidance, level-7 Know Your Enemy and level-15 Relentless free d8 once per tracked turn. For attack-triggered maneuvers, player confirms that the relevant weapon attack hit/missed, saves and positions; calculations involving other creatures remain manual.
4. **Psi Warrior:** persistent/scaling Psionic Energy Dice, Protective Field damage reduction roll (effect recorded, does not directly alter another creature), Psionic Strike Force damage record, Telekinetic Movement, Psi-Powered Leap, Guarded Mind removal of character conditions, Bulwark of Force, Telekinetic Master concentration record. Enforces unlock levels, rest budget and shared Reaction / Bonus Action for supported powers.
5. **Eldritch Knight:** inherits Fighter spell progression through existing one-third-caster rules; 2024 Wizard spellbook; two saved Weapon Bonds, Bonus Action summon; level-7 War Magic and level-18 Improved War Magic attack-replacement tracking, level-10 Eldritch Strike saving-throw Disadvantage calculation, level-15 Arcane Charge reminder on Action Surge.
6. Preserved existing Champion and all prior character, Paladin, Rogue, homebrew, campaigns, dice, import/export and offline features. Source inventory is read-only and does not overwrite user data.
7. Corrected two errors caught during testing: missing `window.FolioFighter2024` reference in UI event handlers and stale source-audit browser assertion. Corrected separate combat-edge cases: a reset Reaction on a new Fighter encounter turn, and Studied Attacks tracking a missed target through hits on different creatures.

## Verification (performed against the working tree)

- `npm test`: **593/593 passed**, including **21 new** Fighter-specific tests. These cover all levels 1–20 across four subclasses, choice limits, dice/resource scaling, short/long rest handling, saves, actions, Fighter-only attack budgets, persistence through JSON cloning and regression against Paladin.
- `npm run audit:rules`: **572 source catalogue entries**, zero version conflicts and zero duplicate revision IDs. **529 candidates remain unreviewed** for publication/revision provenance. The audit remains read-only.
- Completed Chromium browser checks: **7 scripts passed**: new Fighter all-four-subclass flow and save/reopen/mobile, existing Champion, previous Paladin sign-off, registry/Pip isolation, Rogue, source packs, and general app smoke including spellbook and weapon roller.
- Two broader scripts (`milestone18-batch-browser.py` and `milestone18-15g-paladin-turn-budget-browser.py`) **stalled/timed out** on this execution and are **not counted as passes**.
- Chrome tests use a localStorage stub, not a live Windows system, real IndexedDB migration, or the user's private saved data.

## Not yet complete / manual adjudication required

- The 2024 Fighter **class is not signed off as complete**: the new resource controls and attack flows are functional, but all battle maneuvers are not atomically coupled to actual weapon attacks; their target saves, conditions, positions, ally actions, temporary buffs and some attack triggers require confirmation at the table. In particular, only one maneuver per attack still needs full combat-event enforcement.
- Eldritch Knight's War Magic reserves replacement attacks and relies on the existing spellbook for the separate spell cast; it is **not a single atomic spell/attack transaction**. Specific Wizard spell effect execution and concentration interactions still need cross-audit.
- Psi Warrior Telekinetic Thrust, Bulwark targets and Telekinesis external-creature manipulation are represented by confirmed outcomes/reminders, not an automated battlefield. A player must confirm eligibility and effects.
- Champion's baseline mechanics are retained from previous milestone, but not every fighting-style interaction or encounter outcome has been retested in isolation in this release.
- The module does not auto-control external monsters or ally sheets, and the 2026 all-book options and multiclassing remain separate future work.
- The source system is still an audit registry, not a fully licensed automatic all-book importer.

## Next acceptance batch

Finish Fighter combat-event hookups (maneuver once per attack, triggered save/DC and damage integration, psi hit association, War Magic spell transaction), exhaustive class-level and save compatibility checks, then perform a 2024 PHB Fighter sign-off. The completion label must reflect what is verified, not only the presence of selectable data or buttons.

## Rights and offline requirements

Original summaries and mechanics are used here for player-facing control labels. Do not redistribute full non-SRD PHB text without authorization. No online source is required at runtime; all local player data remains under the user’s control.
