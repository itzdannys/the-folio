# Milestone 18.11 — Partial Cross-Class Rules Batch

**Status: PARTIAL.** This is a larger, integrated rules-engine release based on Milestone 18.10; it is **not** completion of Milestone 18, the 2024 Player's Handbook, or all official D&D sourcebooks.

## Rules reference

Implementation was checked against the supplied **System Reference Document 5.2.1**, distributed under CC BY 4.0 (see `ATTRIBUTION.md`). Relevant print pages: game D20/initiative/proficiency rules (pp. 6–13), Barbarian (pp. 28–30), Bard Countercharm (pp. 32–33), Fighter Champion (pp. 47–49), and Rogue Reliable Talent (p. 63). The additional rules are implemented as code rather than just sourcebook names or guidance text.

## Newly functional

| Character / system | Verified behavior | What remains manual |
| --- | --- | --- |
| Barbarian 9/13/17 — Brutal Strike | Weapon roller can forgo Reckless Advantage on a qualifying Strength attack. Adds 1d10 / 2d10 on hit (doubled on critical), validates level-gated, distinct Forceful/Hamstring/Staggering/Sundering choices, and prevents a second attempt on the same turn. Integrates with Berserker Frenzy. | Target push, speed change, saving-throw disadvantage and the next ally's +5 attack bonus are displayed for the DM rather than changing another creature's state. |
| Barbarian 11 — Relentless Rage | When incoming damage would drop an actively raging character from positive HP to 0 without killing it outright, an optional Constitution saving throw uses the character's computed save bonus; on success HP becomes twice Barbarian level. DC starts at 10, rises by 5 for each attempt, and resets with a Short or Long Rest. | Instant-death/massive damage has no Relentless save; the player confirms whether to attempt the save. |
| Barbarian 3/18 — Primal Knowledge and Indomitable Might | The shared skill roller allows eligible skills to use Strength during Rage, includes Strength-check Advantage, and applies the level-18 minimum total. | GM assigns DC and whether the skill is appropriate. |
| Rogue 7 — Reliable Talent | The shared check roller replaces qualifying low d20 rolls with a 10 for proficient skills and listed tool proficiencies. It respects expertise and advantage/disadvantage. | Tool ability must be chosen; proficiencies must be present in the character build. |
| Bard 2 — Jack of All Trades | Untrained skill modifiers use half proficiency in both displayed scores and the check roller. | Untrained tool checks are not yet supported as a dedicated mode. |
| Bard 7 — Countercharm | After a failed saving throw against a Charmed or Frightened effect, rolls two d20 with Advantage, uses the higher result and the correct self/ally modifier, and consumes a Reaction. A turn-reset button restores the Reaction. | Ally's save modifier and range must be confirmed. Folio does not alter another character's condition tracker automatically. |
| Fighter Champion — Athletics | The shared ability check roller applies Champion Athletics Advantage and cancels it with Disadvantage. | Other special effects remain scoped to their existing panels. |
| General / Barbarian / Champion — Initiative | Starting a tracked encounter now rolls a real d20 + Initiative modifier; Feral Instinct and Champion Advantage are applied, as is selectable Surprise Disadvantage. | Other actors are still entered manually. |

### Implemented safeguards

- Features are gated by class and level. Conditions that invalidate a feature reject the action rather than silently spending resources.
- Relentless Rage does not apply if the attack would cause instant death via massive damage.
- Brutal Strike uses the attack's confirmed hit/critical result and doubles only damage **dice**, not flat bonuses.
- Brute and Frenzy damage combine correctly but are separately recorded.
- Rest, turn, Reaction, and save history are stored in the character's existing resource state, compatible with the existing autosave / Undo system.
- No extra sourcebooks or premium rulebook contents were imported in this release.

## Tests performed

- **367/367 Node automated tests passed**, including **24 new test cases** in `tests/milestone18-batch-shared-rules.test.cjs`. These include legal/illegal triggers, cross-class isolation, misses, criticals, optional saves, DC increases, advantage cancellation, rest and state-copy compatibility, and rendering of new class controls.
- **10 Chromium browser workflows exited successfully:** the new cross-class batch; the M18.10 Barbarian; M18.9 Fighter; M18.8 Paladin; M18.7 Ranger; M18.6 Rogue; M18.2 character advancement; M18.1 typed damage; M16 Spellbook; and M15.3 artwork.
- The older M17.6 supplemental-spells browser script printed its PASS result, but a surrounding regression command stalled before recording a clean exit. **That check is not counted among the 10 successful exits**. Its Node tests are included in the 367.
- The new Chromium run verified creating characters, clicking the actual controls, combat attacks, saved resources after reopening, and a narrow 390px viewport.

## Explicitly NOT complete

- **Not all base class features** from levels 1–20 have been implemented.
- **Not all 48 PHB subclasses**, optional features, 2024 PHB feats, spells or species have executable mechanics.
- **Not all official sourcebooks are indexed or implemented.** The existing supplemental entries still include reference-only records.
- Folio does not model a complete battlefield, enemy HP, ally condition states, exact positions, area targeting or all action-economy restrictions.
- Older custom and imported character content retains manual-rule limitations.
- This is still a **personal offline alpha**. Windows installation and migration on the user's device require verification with an exported Library backup.

## Going forward

Maintain a **batch development / individual verification / cross-feature regression** workflow. Next batch should target several remaining SRD class and subclass abilities at once, with source-based tests for each and a new completion ledger that tracks functional coverage, not the number of catalogue entries.
