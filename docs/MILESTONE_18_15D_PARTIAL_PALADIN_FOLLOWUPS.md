# Milestone 18.15D — Paladin Follow-up Attacks (PARTIAL)

**Source:** User-provided Milestone 18.15C ZIP, not the published older GitHub build. **State:** Tested mechanics for three additional 2024 Paladin subclass features. Not a complete Paladin, PHB, sourcebook import, or rules migration.

## Previously available

- Complete offline Folio shell: character library, Pip, campaigns, homebrew, equipment, spellbook, local autosave, backups, artwork and dice.
- Audit-only, non-destructive source registry introduced in 18.15B.
- Existing 18.15C abilities, including Divine Smite-triggered Devotion protection and Vengeance Soul of Vengeance attack; baseline 474 Node tests.
- Glory Glorious Defense originally spent a Reaction/charge and calculated AC but only **described** its counterattack.
- Glory Living Legend could be activated but Unerring Strike was manual.
- Vengeance Relentless Avenger was only a reminder. Existing Reaction state and weapon roller are reused.

## Implemented in this batch

1. **Oath of Glory, level 15, Glorious Defense counterattack:** The defensive Reaction now records whether the AC bonus actually changed the enemy's hit into a miss. A successful defense provides a pending follow-up in the normal weapon roller, available after explicit attacker and weapon-range confirmations. The roller resolves a real weapon attack and damage, consumes the pending follow-up, and **does not spend another Reaction or use**. If the AC bonus fails to prevent the hit, no follow-up is available. The pending action clears on the next tracked Paladin turn, manual turn reset or rest. The enemy's identity/range and timing remain human-confirmed.
2. **Oath of Vengeance, level 7, Relentless Avenger:** Confirm an enemy provoked an Opportunity Attack and is within melee reach; a real melee weapon attack is rolled using the existing engine and spends the shared Reaction, even on a miss. On a hit, Folio records that the target's Speed can be reduced to zero for the current turn and that the Paladin can move up to half their Speed without provoking Opportunity Attacks as part of the same Reaction. It **does not move miniature tokens or change an untracked enemy's stats**. A miss grants no special movement effect.
3. **Oath of Glory, level 20, Living Legend — Unerring Strike:** While Living Legend is active, an optional confirmed attack on the Paladin's turn can turn a missed weapon attack (including a natural 1) into a **normal hit**. Weapon damage, modifiers, and automatic Radiant Strikes then resolve through the existing roller. A natural hit consumes no use; converting a miss consumes the once-per-turn permission until the next tracked turn or manual turn reset. No Reaction is spent. The separate failed-saving-throw reroll remains manual.

**Guards:** Wrong subclass/level, missing AC or trigger confirmation, impossible melee/ranged modes, unavailable Reaction, incapacitation, off-turn Divine Smite, and combining separate Reaction attacks are rejected. No new fields or identifiers were added to character-creation/save schemas; new state is stored inside optional `resources.classState` and survives normal save/restore.

## Verification

- `npm test` — **488 / 488** Node tests passed (474 previous plus 14 new tests).
- `python tests/milestone18-15d-paladin-followups-browser.py` — passed, including all three new mechanics in the real UI, in-memory local save/reopen and 390-pixel viewport.
- `python tests/milestone18-15c-paladin-reactions-browser.py` — passed.
- `python tests/milestone18-15-phb-paladin-browser.py` — passed.
- `python tests/milestone17-sources-browser.py` — passed.
- `python tests/milestone18-15b-rules-registry-browser.py` — passed.
- The broad `tests/browser-smoke.py` did not complete during this validation window; do not mark it passed for this batch. Prior 18.15C smoke status remains documented.

The browser smoke uses a stubbed `localStorage`, not an actual Windows launcher or IndexedDB migration; Windows-specific filesystem execution was not tested here. All new behavior remains offline at runtime.

## Still incomplete

- Paladin class and four oaths at levels 1–20 have **not** been completely implemented. Important remaining work includes shared action/bonus-action economy and expiry, enemy/ally aura tracking, Divine Sense and Abjure Foes final checks, Living Legend save rerolls, Glory and Devotion ally effects, Ancients spell/saving-throw aura interactions, Vengeance capstone fear targeting, further PHB feat/spell mechanics, and multiclass progression.
- Source audit remains read-only. No automatic sourcebook conflict resolution, licensed importer, erasure of legacy options, or live builder switching was performed.
- Spells and special effects not computed by the engine are not advertised as automated; DM/player confirmations remain necessary for out-of-app creatures, ranges, line of sight, saving throws, duration and movement.

**Next:** Finish remaining Paladin mechanics against the user's 2024 PHB, maintaining a level-by-level, subclass-by-subclass implementation/verification register before declaring Paladin complete. Do not move to Fighter or other classes yet.
