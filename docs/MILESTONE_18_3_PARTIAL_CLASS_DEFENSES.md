# The Folio — Milestone 18.3 (PARTIAL): Class Defenses and Innate Sorcery

**Build:** `2.0.0-alpha.18.3-partial` — 15 November 2026. Built on Milestone 18.2, retaining the offline character library, customization, spellbook and existing specialist sheet.

**This is a partial rules-engine update, not a completed Player's Handbook or an all-sourcebooks release.** Status is based on execution of code and the tests listed below, not on the presence of an entry in a catalogue.

## Actually implemented

| Feature | Actual calculations / state | Player-entered or still manual |
|---|---|---|
| Paladin: Aura of Protection (level 6) | Adds `max(1, CHA modifier)` to **the Paladin's own saving throws**; doesn't grant at level 5; suspends while Incapacitated or similarly disabling conditions. Shows range 10 ft (30 ft at level 18). Concentration save modifier includes aura without double-counting it. | Bonus to other creatures within aura; proximity and competing auras are not tracked. The specialist Pip template retains its existing separate calculations. |
| Sorcerer: Innate Sorcery (level 1) | Explicit Activate/End action deducts one of two uses; active state adds +1 to own Sorcerer spell-save DC. It restores uses on Long Rest and ends in the rest workflow. | 1-minute duration must be ended manually; Advantage on Sorcerer spell attack rolls is shown as a reminder and not auto-rolled. This is a single-class character-builder implementation. |
| Rogue: Uncanny Dodge (level 5) | Selecting the defensive option when applying damage halves incoming qualifying attack damage (round down), records the spent Reaction, and blocks reuse until the player resets their Reaction at the start of their turn. Undo and saved state preserve the result. | Player must confirm **a visible attacker hit with an attack roll**; the Folio cannot determine that from a damage number. Combat-turn reaction renewal is a manual button, not an automatic initiative integration. |
| Monk: Deflect Attacks (level 3) | When a qualifying Bludgeoning/Piercing/Slashing attack hit is entered, rolls `1d10`, adds Dexterity modifier and Monk level, reduces incoming damage (minimum zero), and consumes a tracked Reaction. | Player must confirm the trigger. Mixed-type attack damage isn't represented. Redirecting damage after reducing it to zero, which costs a Focus Point and involves another target's saving throw, is not implemented. |
| Rogue and Monk: Evasion (level 7) | A per-hit option handles a qualifying Dexterity-saving-throw effect: on success, 0 damage; on failure, half damage (round down). This is applied before Resistance and Vulnerability. | Player supplies the result of the saving throw and must verify the effect normally permits half damage on success. No saving throw or targeting automation is implied. |

**Rules basis:** User-provided *System Reference Document 5.2.1*, CC BY 4.0: damage order p. 17, Monk features pp. 51–52, Paladin Aura p. 56, Rogue Uncanny Dodge / Evasion pp. 63–64, and Sorcerer Innate Sorcery p. 65. Required attribution remains in `ATTRIBUTION.md`.

### Technical changes

- `js/class-mechanics.js`: explicit active-state transitions and per-hit defenses with class/level and resource guards, audit data and Reaction state.
- `js/core.js`: passes resources into derived calculations to include conditional Aura/Innate bonuses.
- `js/ui.js` and `js/builder-ui.js`: render state and optional trigger-confirmed damage actions; only eligible classes see their controls.
- `js/main.js`: hooks controls into Undo/save and rest transitions; manual defensive choices reset after use.
- `js/storage.js`/`js/builder.js`: validate new Boolean states and prevent carrying active class powers into a different class's build.
- Nothing was uploaded to GitHub. No accounts, remote server, or external runtime dependencies were added.

### Verification evidence

- **260 / 260 Node tests pass**, including nine new tests for active bonuses, damage mitigation, limits, and serialization.
- **8 browser scripts passed:** the new Paladin/Sorcerer/Rogue/Monk class feature acceptance test; inherited Spellbook, species, equipment, spells, damage, advancement, and class-resource workflows. New test includes a 390px mobile viewport.
- Browser tests use in-memory storage rather than real Windows device storage; persist/export on your machine remains to be manually verified.

## What is still not done

- All 12 classes' complete level 1–20 choices and active/passive features.
- All 48 PHB subclasses and newer/older-compatible official subclasses; subclass resources and effects.
- Fully functional feats, species traits, class spellcasting interactions, multiclassing, all PHB spells and commercial sourcebook content.
- Multi-target combat, dice-versus-target workflows, proximity, enemy effects, action/reaction tracking integrated with initiative, lasting-effect timers, end-turn triggers and complex ability resolution.
- Complete independent errata validation for all rules and sourcebook catalogue entries.

**Upgrade safely:** Export a full Library JSON backup from the installed build, extract this ZIP to a different folder, open `Open The Folio.cmd`, and verify your own saved characters before switching.
