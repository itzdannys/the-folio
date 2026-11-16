# Milestone 18.15F — Paladin Ally Auras and Self-Aura Guard (PARTIAL)

**Source:** The complete, previously generated 18.15E ZIP. This is an incremental update to the same offline Folio application, not a restart, a new web app, or an alternative UI.

## Already present and preserved

- Full character library, Pip, campaigns, homebrew, local autosave/backup, dice, weapons, spellbook and styling.
- Level-gated base 2024 Paladin class progression and four PHB oath choices; actual self Aura of Protection bonus, self resistance for Ancients, self Devotion half cover after tracked Divine Smite, and existing subclass mechanics.
- Shared Channel Divinity and Reaction usage, existing Initiative tracker, partial turn effects and the read-only 18.15B rules version audit.
- 501 passing Node tests at prior release 18.15E.

## Implemented in this increment

1. **Ally Aura of Protection (Paladin level 6+):** Validates a named ally within a user-confirmed 10-foot Emanation, increasing to 30 feet at Paladin level 18. Adds the Paladin's actual Charisma modifier (minimum +1) to a supplied saving throw total; calculates pass/fail against an entered DC. Users can indicate that the total already includes a different Paladin's aura, so the bonus is not stacked.
2. **Oath of Devotion, Smite of Protection (level 15+):** While the existing tracked Smite of Protection effect is active, ally aura calculations can apply Half Cover: +2 to an eligible Dexterity saving throw, or +2 AC against a supplied attack roll. The user can report equal or better cover, avoiding stacking. The effect does not activate without a Divine Smite, and the preexisting next-turn expiry remains intact.
3. **Oath of the Ancients, Aura of Warding (level 7+):** Calculates an ally's Necrotic, Psychic, or Radiant damage after resistance (round down), with explicit prevention of duplicate resistance. The tool is not an encounter-wide creature HP engine.
4. **Aura of Courage and Aura of Devotion:** Ally condition checker records temporary suppression/immunity to Frightened (all Paladins level 10+) or Charmed (Devotion level 7+) while within the aura. The Paladin's own Conditions panel now also rejects Frightened when Aura of Courage is active, matching the existing Devotion self-Charmed protection.
5. **0-HP correctness:** The existing self Aura of Protection saving-throw modifier and Devotion Smite of Protection cover are now correctly inactive at 0 HP, even when the player has not explicitly checked the Unconscious condition.
6. **UI and persistence:** The new ally-aura controls live in the existing class resources sheet. Results appear in a status area and are persisted as `resources.lastClassEffect`; no new save schema, character ID, online dependency, or forced migration. No ally HP, ability scores, or conditions are fabricated or silently edited.

**Boundaries:** Users must confirm distances, target identities, rolled totals, saves, and any existing cover/resistance. Calculations are performed on *one ally event at a time*, not on separate creature sheets. Other Paladin ally movement/conditions, Holy Nimbus enemy effects, Avenging Angel fear, Elder Champion enemy saves, spell interaction, and complete Action/Bonus Action enforcement still need work. For single-class level 1–20, other feats/spell selections and multiclassing are not certified complete. **The Paladin class is still PARTIAL.**

## Tests

- `npm test`: **517 / 517** tests pass: 501 inherited + 16 new focused tests.
- `python tests/milestone18-15f-paladin-ally-auras-browser.py`: pass (Devotion saving throw and condition, Ancients resistance, Vengeance Aura of Courage, source character save/reopen, 390 px viewport).
- Previous browser regression scripts 18.15E, 18.15D, 18.15C, 18.15 PHB Paladin, 18.15B registry, 17 sources, and broad `browser-smoke.py`: pass.
- Browser tests are headless Chromium with stubbed localStorage. They verify UI flows but not the actual Windows `.cmd` launcher or real user's local IndexedDB store. An actual user backup was not imported for this test; existing save schema was preserved.

## Source and licensing

Aura of Protection, Aura of Courage, and Devotion benefits checked against SRD 5.2.1 / official D&D Beyond 2024 Basic Rules (CC BY 4.0 SRD). Ancients Aura of Warding checked against official 2024 PHB/Beyond revision reference. This code uses original short descriptions and calculations, not full proprietary rules text. Existing attribution and license documentation remains intact.

**Next:** Continue implementing remaining Paladin action economy and enemy/ally spell/condition interactions against current official rules. Do not move to another class before the Paladin audit is complete.
