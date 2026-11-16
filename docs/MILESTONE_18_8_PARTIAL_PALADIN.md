# The Folio — Milestone 18.8 (PARTIAL): Paladin Combat and Spell Grants

**Version:** `2.0.0-alpha.18.8-partial` · November 15, 2026. Derived from Milestone 18.7. **Not a completed Paladin class, Milestone 18, 2024 PHB implementation, or all-official-sourcebooks implementation.**

## Implemented and tested

- **Paladin's Smite (level 2+):** The weapon attack window provides a free once-per-Long-Rest casting and the currently available spell-slot casting costs. It requires a confirmed hit (target AC entered), a weapon categorized **Melee** (which includes thrown Melee weapons under the revised 2024 wording), and explicit player intent to smite. A miss never spends the cost. Base damage is 2d8 Radiant, +1d8 per spell-slot level above 1, +1d8 if the player confirms Fiend/Undead; critical hits double these dice. Both damage and slot/free-use spending are saved, undoable and visibly reported. SRD 5.2.1, pp. 53–54, 141.
- **Radiant Strikes (Paladin level 11+):** Confirmed hits from the weapon roller using a Melee weapon add 1d8 Radiant automatically (2d8 on critical hits), including thrown Melee weapons. Reported separately from the weapon's damage type and any Divine Smite. SRD 5.2.1 p. 55.
- **Lay On Hands / Restoring Touch (self):** A self-only form allows spending pool points to heal and/or remove active conditions. Poisoned costs 5 pool points at any Paladin level. At level 14+, Blinded, Charmed, Deafened, Frightened, Paralyzed and Stunned cost 5 pool points each. The app rejects inactive conditions, invalid level gates and unaffordable costs; removing a condition does not also restore HP. SRD 5.2.1 pp. 53–55.
- **Class spell grants:** Divine Smite is listed as always prepared starting at level 2, Find Steed from level 5, and neither consumes a standard prepared-spell slot. Divine Smite's ordinary Cast button is disabled because it needs a hit; use it through the weapon roller. Find Steed is castable once without a spell slot per Long Rest, or using available slots, and consumes the correct resource. The actual steed is still managed at the table.
- **Persistence / regression:** class resource pools and spell casts are stored with local character state. Existing character templates, older saves, damage types, Rogue/Ranger attack effects and prep lists are retained. Tests cover level gates, costs, misses, critical hits, save copying, Long Rest, and cross-version Spellbook behaviour.

## Important limitations

- **The Bonus Action trigger is not automatically enforced.** Player must use Divine Smite immediately after a confirmed hit on their own turn while their Bonus Action is available. The app also does not enforce the revised one-spell-slot-per-turn rule; the player must confirm this before choosing a cost.
- The weapon roller handles **weapons**, not Unarmed Strikes. Unarmed Strike Divine Smites and Radiant Strikes are not yet calculated; they remain manual.
- The Folio does not know enemies' actual AC, type, identity, distance or current conditions. The user must enter AC and confirm Fiend/Undead status. It does not apply the damage to another character automatically.
- Find Steed is tracked as a spell cast with a free use or slot, **not** as a created mount with a functioning stat block, actions or hit points.
- Lay On Hands on other creatures, the full Paladin subclass/Oath system, Sacred Weapon, Divine Sense, Abjure Foes, Aura of Courage, Smite of Protection, Holy Nimbus and other conditional mechanics remain incomplete or manual. Pip's specialist template remains separate from the generic builder.
- The complete 2024 PHB, every subclass and all official 5e sourcebooks **are not included or fully automated**. Commercial-book entries may be reference-only and must not be misrepresented as implemented.
- Windows-specific persistence has not been tested on the user's device; export a Library JSON backup and extract into a separate folder first.

## Verification

- `node --test`: **319/319** tests passed (14 new Paladin tests; existing baseline 305).
- `python tests/milestone18-8-paladin-browser.py`: character creation, Smite/Radiant Strikes on weapon hit, resource persistence, Lay On Hands, granted spells, Faithful Steed cast, 390-pixel viewport.
- 10 prior browser workflows passed: Ranger 18.7, Rogue 18.6, Bard/Fighter/Monk 18.5, Wizard/Druid/Cleric 18.4, defenses 18.3, level-up 18.2, typed damage 18.1, supplements 17.6, spell reference 16.1, and artwork 15.3.

**Rules source and attribution:** Wizards of the Coast SRD 5.2.1, Creative Commons Attribution 4.0. See `ATTRIBUTION.md`.
