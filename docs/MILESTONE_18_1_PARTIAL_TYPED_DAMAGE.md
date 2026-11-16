# Milestone 18.1 — Damage resolution & Rage resistance (PARTIAL)

Date: 2026-11-15

## What actually works in this build

- Incoming damage has a type selector in the existing HP controls. `Unspecified` is the safe default, so physical resistance is never inferred from an unknown type.
- Active **SRD 2024 Barbarian Rage** automatically grants Resistance to Bludgeoning, Piercing, and Slashing. This only works for universal-builder Barbarian characters that have activated Rage; it does not assume every class or specialist has these resistances.
- Optional **per-hit manual** Resistance, Vulnerability, and Immunity switches allow a player to apply effects granted by spells, equipment, other abilities, or the DM without storing them as permanent traits.
- Resistance is applied once (rounded down), then Vulnerability doubles. Immunity overrides both. This order is verified against **SRD 5.2.1 p. 17**.
- Adjusted damage is taken from temporary HP first, then regular HP. Concentration DCs use adjusted damage rather than raw incoming damage (**SRD 5.2.1 pp. 16–18, 104–106**). Full concentration outcomes remain player-confirmed.
- The HP UI shows the last resolution with incoming and adjusted damage, temporary HP absorbed, and real HP lost; the existing transaction Undo restores the previous state. Last damage audit metadata is included in character JSON saves.
- Invalid damage amounts and types are rejected in the engine.

## What this is **not**

- **Not complete**: the 2024 PHB, Milestone 18, the full class/subclass engine, or support for all official sourcebooks.
- Rage's round-by-round duration and extension triggers are still manual; Strength advantage and condition-specific checks are not automatically resolved. Rage does not roll all attacks for the player. As in 18.0, class resource trackers are not all actual abilities.
- Only Rage's three damage resistances are inferred from class features. The app does **not** automatically apply resistance from every species, subclass, spell, equipment item, or Pip's custom features. For those, use the explicitly manual per-hit controls.
- No automatic target/monster damage, death-at-zero handling, damage reduction from every item, battle turn/action budget, or guaranteed resolution of conflicting modifiers. DM calls remain manual.
- This does not confirm Windows filesystem persistence or all official feature interactions on the user's device.

## Tests run and outcomes

- `npm test` — **240/240 passing** (233 previous tests + 7 targeted new damage tests).
- `python tests/milestone18-1-damage-browser.py` — Chromium: create new Barbarian, Rage, type-specific resistance, Undo, manually combine modifiers, 390-pixel viewport.
- `python tests/milestone18-class-mechanics-browser.py` — previous Fighter, Barbarian, Paladin and Sorcerer workflows.
- Passed browser regressions: `browser-smoke.py`, `milestone16-browser.py`, `milestone17-2-origins-browser.py`, `milestone17-3-species-browser.py`, `milestone17-4-equipment-browser.py`, `milestone17-6-supplements-browser.py`, `milestone15-3-browser.py`.
- Browser tests use mocked localStorage and are **not** a Windows-specific persistence test.

## Rules provenance and license

Based on the user-supplied *System Reference Document 5.2.1*, Wizards of the Coast, particularly pages **16–18** (damage, Resistance, Vulnerability, Immunity, temporary HP) and **28–29** (Barbarian Rage). Attribution and license statement are in `ATTRIBUTION.md`. Code is an original implementation, not an imported proprietary rules engine.

## Next substantial work

Mechanically complete **single-class level 1–20 progression and class feature choices** with actual UI and test coverage, then implement SRD subclasses, 2024 PHB content under available rights, multiclassing and cross-source interactions. Continue to track each option as functional, manual, or reference-only. **No claim of full completion.**
