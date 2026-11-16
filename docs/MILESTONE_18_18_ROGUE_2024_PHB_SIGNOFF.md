# Milestone 18.18 — 2024 PHB Rogue character-sheet sign-off

## Scope
This release builds on Milestone 18.17 and implements 2024 PHB Rogue levels 1–20 and the four 2024 subclasses: Arcane Trickster, Assassin, Soulknife and Thief. It preserves existing local storage, Pip, other classes, campaigns, homebrew, styling and the offline startup workflow.

## Implemented and verified
- Level progression, Sneak Attack dice, Cunning Action/Steady Aim, Cunning Strike, Reliable Talent, resource recovery and Stroke of Luck.
- Rogue tracked-turn action, bonus action, Light/Nick, confirmed opportunity reactions and once-per-turn Sneak Attack, including separate confirmed creature turns.
- Assassin first-round attack advantages, bonus damage, poison interactions and Death Strike confirmation.
- Soulknife Psychic Blades, Psionic Energy Dice, Psychic Whispers, Psi-Bolstered Knack, teleportation, Psychic Veil, Homing Strikes and Rend Mind.
- Arcane Trickster subclass spellcasting, Mage Hand improvements, Magical Ambush, Versatile Trickster and Spell Thief confirmations.
- Thief Fast Hands options, climb/jump benefits, Use Magic Device charges and scroll DC, additional attunement capacity, and Thief’s Reflexes.

## Testing
- `node --test`: 704/704 passed from development folder.
- `python tests/milestone18-18-rogue-browser.py`: passed all four subclasses, saving/reopening and mobile layout.
- Cross-class browser checks passed for Barbarian 18.17, Fighter 18.16C and Paladin 18.15I.
- The source manager browser smoke did not finish; not counted as a pass.
- `node scripts/audit-rules.cjs`: 578 entries, no duplicate revision IDs or version conflicts; 535 entries await source/version verification.
- Run the above commands from within the `The Folio` folder after extraction.

## Boundaries
This is a **single-class 2024 Player’s Handbook Rogue character-sheet sign-off**, not a complete VTT or combat simulator. Enemy rolls, saving throws, tactical positioning, ally reactions, spell outcomes and environmental conditions require confirmation where Folio lacks authority or creature sheets. Not all spell effects are automatically simulated. Multiclassing and other-source subclasses are separate future work. The external `dnd-data-main` source archive is not redistributed.
