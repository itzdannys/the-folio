# Milestone 18.15E — Paladin shared Channel Divinity and Glory saving-throw reroll (PARTIAL)

**Development source:** user-supplied Milestone 18.15D ZIP. This increment modifies the existing offline Folio app; it does not replace the character builder, source registry, combat roller, character library, homebrew, backups, or campaigns. Paladin remains **incomplete**.

## What was already present

- 2024 Paladin progression, all four PHB oath choices and their level-gated spell grants, existing Channel Divinity resource capacity (2 at level 3, 3 at level 11), and resource restoration.
- Several implemented subclass abilities, including Devotion Smite of Protection, Vengeance Soul of Vengeance and Relentless Avenger, and Glory Glorious Defense / Living Legend's Unerring Strike.
- A shared Reaction flag and derived saving-throw calculations (including the Paladin's own Aura of Protection). The 18.15B audit-only source registry remains in place.
- **Missing before this increment:** actual Divine Sense and Abjure Foes controls; Living Legend's failed-save reroll; their UI/save regression coverage.

## Implemented in 18.15E

1. **Divine Sense (Paladin level 3+, shared Channel Divinity).** Activate with a Bonus Action, spend **one existing Channel Divinity use**, record a manually timed ten-minute, 60-foot detection effect and its state, and end it without refunding the resource. Prevent activation while incapacitated, at 0 HP, while already active, or without a charge. An incapacitating condition set through the Conditions panel or reduction to 0 HP using the damage engine also ends the active effect. Rests clear it. Enemy/object discovery is confirmed at the table, not invented from Folio character state.
2. **Abjure Foes (Paladin level 9+).** Spend one *shared* Channel Divinity use for a Magic action. Confirm visible targets within 60 feet and enter **one full Wisdom saving-throw total per target**. The engine enforces up to max(1, Charisma modifier) unique creatures, computes the Paladin's actual spell save DC, records which targets succeeded or failed, and displays the individual outcomes on the sheet. Enemy Frightened condition, its movement/action restrictions, duration, damage-ending and range remain DM-managed because Folio does not own those creatures' character sheets.
3. **Living Legend: Saving Throw Reroll (Glory Paladin level 20).** While the capstone is active, enter the previously **failed** save total, DC and save ability. Roll a new d20 with the existing dice roller; use the current derived save modifier (including the Paladin's own active Aura of Protection) and report success or failure. Spend the same shared Reaction used by Glorious Defense and other reactive features; reject a second Reaction or incapacitated user. The **new result is mandatory**, even if lower. Add the actual UI, role/status feedback and persistence through existing `classState` and `lastClassEffect` fields.

**No new storage schema or forced migration.** This batch does not automatically update opponent hit points, opponents' conditions, creature positions, ally bonuses, or full spell action economy. A failed roll input is a user declaration, not automatically verified against an out-of-app dice roll. Abjure Foes effects are recorded in a result snapshot, not a persistent enemy-condition engine.

## Validation

- `npm test`: **501/501** Node tests passed, including **13 new focused tests** (488 inherited).
- `python tests/milestone18-15e-paladin-channel-reroll-browser.py`: passed; Divine Sense activation/end, Abjure Foes save resolution, Glory reroll, in-browser save/reopen and 390px mobile layout.
- `python tests/milestone18-15d-paladin-followups-browser.py`: passed.
- `python tests/milestone18-15c-paladin-reactions-browser.py`: passed.
- `python tests/milestone18-15-phb-paladin-browser.py`: passed.
- `python tests/milestone18-15b-rules-registry-browser.py`: passed.
- `python tests/milestone17-sources-browser.py`: passed.
- `python tests/browser-smoke.py`: passed (previous broad smoke previously unverified for 18.15D).
- These browser runs stub localStorage and are not proof of Windows `.cmd` launcher behavior or real IndexedDB upgrades. An exported user backup and user's real Windows environment were not used for this run.

## Remaining Paladin gaps

- **Base class:** shared Action/Bonus Action and slot-per-turn enforcement; complete and automatically applied effects for every feat, spell, and condition; enemy/ally aura targeting and state; subclass feature expiry and full turn tracking.
- **Oaths:** Devotion's ally half-cover; Ancients' enemy saving-throw penalties and faster action spells under Elder Champion; Glory's ally temporary HP/movement distribution and all combinations of existing effects; Vengeance's Avenging Angel target fear state; numerous creature conditions/durations remain table-confirmed or manual.
- **Longer-term:** multiclassing, full 2024 PHB options, 2025–2026 revisions and sourcebook import/supersession. The existing 18.15B registry is **audit-only**, not active builder version switching.

The work is correctly labelled **partial**, not “Paladin completed.” Continue Paladin after this checkpoint rather than moving to another class.

## Source / rights

Divine Sense and Abjure Foes were checked against **SRD 5.2.1**, Paladin pp. 54–55 (CC BY 4.0), with the required project attribution already in `ATTRIBUTION.md`. Living Legend's saving-throw reroll was checked against the user's 2024 Player's Handbook reference; this release contains original implementation logic and short descriptive UI text, not a reproduced publisher rules chapter.
