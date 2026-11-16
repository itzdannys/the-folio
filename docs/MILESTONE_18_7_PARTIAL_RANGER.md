# The Folio — Milestone 18.7 (PARTIAL): Ranger Hunter’s Mark and Class Features

**Version:** `2.0.0-alpha.18.7-partial` · November 15, 2026. Based on Milestone 18.6. **Not complete Milestone 18, a complete Ranger implementation, full PHB coverage, or support for all official sourcebooks.**

## Verified mechanics implemented

- **Favored Enemy / Hunter's Mark, Ranger level 1+:** Ranger's Mark is always available in the Spellbook and doesn't consume a prepared-spell choice. A player can cast it by spending a level-appropriate *free Favored Enemy use* or an available spell slot. A target name must be supplied; the player confirms the creature is visible within 90 ft. Folio records the target and concentration. Recasting on a new target spends another use or slot, as normal; ending concentration disables the effect. SRD 5.2.1 p. 58 and p. 141.
- **Hunter's Mark weapon damage:** If a player explicitly checks that the attack targets the currently marked creature, a **confirmed hit** gains **1d6 Force damage**; on a critical hit those dice are doubled. A missed attack gets no Mark damage. The attack report distinguishes the weapon's damage type from the additional Force damage. Target AC is required for marked attacks, avoiding guesses about a hit. SRD p. 141.
- **Relentless Hunter, Ranger level 13+:** When concentrating on Hunter's Mark, incoming damage no longer creates a concentration check. For other concentration spells or below level 13, normal concentration checks remain. SRD p. 59.
- **Precise Hunter, Ranger level 17+:** Against a *player-confirmed* marked creature, the attack roller grants Advantage (and respects cancellation from Disadvantage). SRD p. 59.
- **Foe Slayer, Ranger level 20:** Hunter's Mark bonus damage increases to **1d10 Force**, with critical hit dice doubled as normal. SRD p. 59.
- **Tireless, Ranger level 10+:** Rolls a d8, adds Wisdom modifier (minimum 1), and grants temporary HP **without stacking** with prior temporary HP. Uses equal the Wisdom modifier (minimum 1); Long Rest restores uses. SRD p. 59.
- **Nature's Veil, Ranger level 14+:** Bonus Action activation spends a Wisdom-modifier-based use (minimum 1), records the Invisible state for the player to manage and permits manually ending it. Long Rest restores uses. SRD p. 59.
- **Save/Undo:** These operations use existing transactions and saved resource state. Ranger's Mark can also be cast from the Spellbook's cast modal; the cast log is preserved there.
- **Previous characters:** Pip's specialist character template and other class features remain unchanged by this Ranger-only behaviour.

## Not automated (do not treat these as complete)

- The app does not know real combat positions, visibility, actual target identity, enemy HP, range, turn order, action economy, concentration elapsed time or whether a mark remains valid. The player supplies and confirms target identity and turn timing.
- The Spellbook and weapon roller implement the specific listed Mark rules; the Mark bonus to **spell attacks** is not yet handled by a separate spell-attack roller. Spell effects on enemy characters are not simulated.
- Ranger Tireless's Short Rest Exhaustion reduction is **not** yet automatically applied because a complete exhaustion system isn't present. Nature's Veil's Invisible condition is a local active-use indicator, **not** automatically applied to every attack/defense calculation; it must be ended manually when its duration expires.
- Ranger subclasses and many other level-dependent class features are incomplete. Ranger multiclassing, current PHB non-SRD content, and other official sourcebooks remain incomplete. SRD 5.2.1 does not include every PHB or commercial-supplement character option.
- This is browser-tested with simulated local persistence; it has not been independently verified on the user's Windows installation. Use a separate folder and export a Library JSON backup before switching.

## Validation performed

- `node --test`: all 305 tests passed including 12 new Ranger cases for legal costs, state, misses, critical hits, level gates, resource scaling, damage types, advantage/disadvantage, concentration checks, and save-compatible copies.
- `python tests/milestone18-7-ranger-browser.py`: create a Ranger, cast Mark, equip weapon, attack the marked creature, save/reopen, use Tireless and Nature's Veil, inspect mobile, and cast the free Mark from an otherwise unprepared Spellbook.
- Regression browser workflows passed for M18.6 Rogue, M18.5 Bard/Fighter/Monk, M18.4 Wizard/Druid/Cleric, M18.3 defenses, M18.2 advancement, M17.6 supplements, M17.3 species, M16.1 spell references and M15 artwork. The older M18.1 typed-damage browser script stalled on a separate run; **that one workflow remains unverified** despite its underlying Node tests passing.

**Attribution:** Bundled SRD content is used under CC BY 4.0; see `ATTRIBUTION.md`. No non-SRD book text was added.
