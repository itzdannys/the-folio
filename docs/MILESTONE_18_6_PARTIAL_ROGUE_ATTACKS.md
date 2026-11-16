# The Folio — Milestone 18.6 (PARTIAL): Rogue Weapon Sneak Attack & Cunning Strike

**Version:** `2.0.0-alpha.18.6-partial` · November 15, 2026. Built on Milestone 18.5. **Not the completed Milestone 18, PHB, or all-official-sourcebooks support.**

## What actually works

- **Rogue Sneak Attack:** Weapon Attack / Roll now accepts an explicit Sneak Attack selection for starter Rogues; validates the actual weapon has the Finesse property or is Ranged, checks advantage or user-confirmed non-Incapacitated ally adjacency (without disadvantage), checks a known target AC and a confirmed hit, then rolls `ceil(Rogue level / 2)d6` bonus damage of the weapon's type. Only one Sneak Attack is recorded per turn. A miss does not consume it.
- **Critical hit:** Both the attack's weapon damage dice and remaining Sneak Attack dice are rolled twice; a Cunning Strike die cost is deducted **before** critical-hit doubling.
- **Cunning Strike, level 5+:** Poison (requires an actual Poisoner's Kit inventory item), Trip (requires confirmation the target is Large or smaller), Withdraw. The selected strike costs 1d6, and Folio rolls only the remaining Sneak Attack dice. Saving throw DC = 8 + Dexterity modifier + proficiency bonus.
- **Improved Cunning Strike, level 11+:** Two different legal effects in one hit, with combined costs enforced.
- **Devious Strikes, level 14+:** Daze (2d6), Knock Out (6d6) and Obscure (3d6), with their appropriate saving throw abilities and DC calculations. Illegal costs, prerequisites, levels, and duplicate effects are rejected without spending ammunition or altering the character.
- **Usable UI and persistence:** Attack / Roll includes Rogue-only controls, weapon damage totals include the extra dice, the class area displays the last Sneak Attack result and target saves, and the explicit **Start new turn** button resets the use for an off-turn attack or a later turn. State persists through normal local saving, library reopening and Undo transactions.
- Existing weapon attacks without Sneak Attack selected retain previous behaviour. No changes to Pip's specialist template, or other classes' weapon rolls.

## What remains manual or incomplete

- Folio **cannot detect** whether an ally is within 5 ft of a target or Incapacitated, or whether a special situation grants Advantage, so the player must confirm these. It has no map, enemy AC database, encounter-turn tracking, or automatic Sneak Attack reset.
- The target's condition, repeated saves, movement, duration and size are not applied to an enemy sheet; Folio reports rule instructions and save DCs for table resolution.
- The player must select the Sneak Attack option; eligibility does not silently apply it to every attack.
- Other Rogue features (including subclass-specific attacks) and most other class/subclass mechanics are incomplete.
- 2024 PHB non-SRD options and all official supplement content remain incomplete. No commercial-book text was added.

## Verification

- `node --test` (all Node tests), including 10 new Rogue rule tests (damage, criticals, saves, level gates, costs, misses, persistence-compatible state).
- `python tests/milestone18-6-rogue-browser.py`: create Rogue, add/equip Dagger, roll an attack with Withdraw, return to library and reopen, verify once-per-turn use, reset and re-open on mobile.
- Previous browser smoke/regression scripts: run as part of release testing.

**Upgrade:** Export a Library JSON backup from your current build. Unzip this new build to a separate folder and verify characters before switching. Windows desktop persistence is not independently verified on your PC.
