# Milestone 18.15G — Paladin Turn Budget (PARTIAL)

**Baseline:** Complete Milestone 18.15F ZIP, including all existing profiles, customizations, offline storage, campaign folders, homebrew, dice, source packs, and the read-only rules version registry. This is an incremental update, not a rebuild.

## Already implemented and preserved

- Single-class Paladin progression and all four 2024 PHB oaths, with the partial mechanics of 18.15–18.15F.
- Paladin's existing Channel Divinity, Lay On Hands, Divine Smite, attack roller, aura checks, Glory/Vengeance Reactions, initiative and saving-throw systems.
- Existing character IDs and resource serialization; existing exports, local autosave, import, and legacy Pip profile behavior.
- 517 automated tests at 18.15F; registry audit remains read-only.

## Changes actually implemented

1. **Opt-in Paladin turn ledger:** New `Start new Paladin turn` button in the existing class-resources panel. When enabled, it displays and tracks one Action, one Bonus Action, a shared Reaction, and whether a spell slot was spent **casting a spell** on that turn. The flags are saved in the existing `resources.classState` object and survive reopen/export; no new storage keys or migrations.
2. **Combat turn synchronization:** When the existing initiative engine advances to the Paladin's own turn, the budget is refreshed, once per encounter round. Manual turn-start remains available if the user isn't tracking initiative.
3. **Covered Bonus Actions:** Divine Sense, Lay On Hands / Restoring Touch, Peerless Athlete, the Paladin oath capstone activations, Holy Nimbus activation, Hunter's Mark for Vengeance, and confirmed Divine Smite after a hit cannot consume an already-spent tracked Bonus Action. Free Divine Smite consumes the Bonus Action but not a spell slot.
4. **Covered Actions:** Abjure Foes and Nature's Wrath require an available tracked Magic action. Vow of Enmity and Sacred Weapon, which activate as part of an Attack action, are blocked after a tracked Action was spent but do not themselves falsely spend a *second* Action.
5. **Recognized Paladin spell casts:** The existing cast dialog routes Paladin casts through the same ledger. Recognized Action/Bonus Action/Reaction casting times count toward the applicable budget. A spell with a casting cost like `slot1`–`slot9` also marks a spell slot cast this turn. A second slot-based casting on that tracked turn is refused; ritual and free casts are not mistaken for slot expenditure. A Paladin Hunter's Mark cast follows the same logic.
6. **Action safety:** Tracked incapacitation prevents these actions. A rejected event has no deducted Lay On Hands points, Channel Divinity use, or slot usage. Resetting a turn does not refill spent long-rest resources; Undo remains available.
7. **Clear UI wording:** Updated spell-cast and Smite descriptions to explain which tracked interactions are enforced, without claiming combat automation is complete.

## Important limits — NOT COMPLETE

- Opt-in action tracking is intentionally disabled outside a started Paladin turn, preserving out-of-combat spell recording. A player must use **Start new Paladin turn** if not using initiative; clicking it incorrectly can reset a spent budget.
- The general weapon roller is not an Attack-action engine and **does not yet enforce the number of Attack actions, Extra Attack, Nick, two-weapon Bonus Actions, or off-turn attack economy**. Vow/Sacred Weapon are only guarded against an *already-spent* tracked Action.
- An unverified/manual reference spell may have unknown or long casting time. The tracker does not fabricate one; sourcebook verification and table tracking are still required. Reaction spells can occur on another creature's turn: this ledger enforces the shared Reaction but does not apply the Paladin's **own-turn** spell-slot counter to an off-turn Reaction cast.
- Enemy/ally positions, condition progression, concentration, durations, turn boundaries, and many other spell effects still rely on actual DM/player confirmations. This does not resolve all high-level oath abilities, all Paladin spell interactions, multiclassing, or official sourcebook content.
- No existing character save was automatically migrated. The source-version registry still operates in **audit-only** mode, with the same 562 baseline catalogue entries and pending source verification.

## Verification

- `npm test`: **529/529** passing Node tests (517 inherited + 12 dedicated turn-budget cases covering action/bonus/slot competition, spells, Divine Smite, Hunter's Mark, Attack-action oath features, incapacitation, initiative renewal and JSON save/reopen).
- `python tests/milestone18-15g-paladin-turn-budget-browser.py`: PASS (new controls, duplicate Bonus Action rejection, Abjure Foes, saving/reopening, actual Aid/Shield of Faith cast dialog and one-slot rejection, mobile 390px).
- Browser regression passes: `milestone18-15f-paladin-ally-auras-browser.py`, `milestone18-15e-paladin-channel-reroll-browser.py`, `milestone18-15d-paladin-followups-browser.py`, `milestone18-15c-paladin-reactions-browser.py`, `milestone18-15b-rules-registry-browser.py`, `milestone17-sources-browser.py`.
- The older broad `milestone18-15-phb-paladin-browser.py` stalled during this pass and is **not claimed as passing**. The real Windows launcher and real user IndexedDB/backups are **not verified** by the headless tests (which use stubbed localStorage).
- `npm run audit:rules`: read-only, 562 entries, no version conflicts, no migrated content. Do not treat 562 as a count of verified current official options.

## Rules basis

- D&D Beyond SRD 5.2.1 / Basic Rules 2024: spell casting times and rule limiting slot expenditure to one spell cast with a spell slot per turn; the Paladin features and their action requirements. See https://www.dndbeyond.com/srd and https://www.dndbeyond.com/sources/dnd/br-2024/character-classes and https://www.dndbeyond.com/sources/dnd/br-2024/spells.
- 2024 Player's Handbook for Oath of Glory and Oath of Vengeance subclass-specific triggers (same publication previously reviewed). New implementation contains original code and brief rule summaries; it does not redistribute a complete proprietary PHB.

**Next:** Finish the Paladin's combat action model, external target effects and spell interactions, then complete level-by-level Paladin/oath verification. Do not call the class complete or move to the next class yet.
