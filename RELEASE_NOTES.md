# Milestone 12 — Offline Release & 3D Dice

- Removed face numerals from all six Quick Roll picker icons, including the d6 and d20. Labels below the icons still identify the dice type.
- Added offline canvas rendering of genuine 3D meshes with correct face counts (d4, d6, d8, d10, d12, d20), tumbling, shading, perspective, animated bounce, and landing orientation.
- Fair random outcomes remain generated independently by the pre-existing dice engine. The 3D tumbling is scripted for visual clarity and does **not** run a full collision/rigid-body physics simulation. Results are revealed after animation.
- Per-character color customization also affects the 3D meshes. Accessible reduced-motion handling preserves results; Escape closes Quick Roll and restores focus.
- Added `Open The Folio.cmd` as a convenient Windows browser launcher, no accounts/server/subscriptions; it is not a native `.exe`.
- Preserved all prior character libraries, saved themes, custom backgrounds, homebrew, spells, weapons, combat plays, inventory, backup formats, and Pip's full sheet.
- Tested 136 Node cases and three browser workflows, including actual canvas pixel changes, two dice with modifiers, Advantage, result history, navigation, old appearance screens, mobile, no JS page errors. Final ZIP re-extraction verified separately.
- Known limitations: no dedicated rigid-body physics, real Windows `file://` launch and long-term IndexedDB persistence still must be tested on the user's computer, and no full multiclassing or universal subclass mechanics engine.

---

# Milestone 11 — Appearance Studio & Custom Dice Colours

Built on the complete Milestone 10.1 project without changing combat, spell, weapon or dice RNG rules.

- Added six visual presets. A new character defaults to Classic Parchment; Pip stays Midnight Masquerade until manually changed.
- Added editable colours, three local font pairings, spacing density, optional ornaments, and a live preview.
- Added safely resized local personal backgrounds, positioning/dimming, theme-aware mastheads, and backup inclusion.
- Added four dice-colour presets and user-defined face, edge, and numeral colours while retaining accurate SVG geometry.
- Added a reusable theme library and independent character appearance snapshots; full-library backups include templates and backgrounds.
- Added colour contrast warnings, library-card theme previews, migration of old character data, automated and browser regressions.

**Compatibility:** Existing save versions and previous full-library JSON exports can be loaded. This adds optional appearance fields without changing the library's format version. Export your old Library JSON first when upgrading between different folders/origins.

**Verification:** 131/131 automated tests; inherited M10 browser smoke and new Appearance browser workflow passed; actual Windows `file://` and IndexedDB restart persistency unverified in sandbox.

---

# Milestone 10.1 — Quick Roll Dice and Library Navigation

This is a **focused, backwards-compatible maintenance update** to the completed Milestone 10 project.

- Replaced six schematic Quick Roll dice icons with bundled, numbered SVG assets derived from actual polyhedron face geometry: tetrahedron (d4), cube (d6), octahedron (d8), pentagonal trapezohedron (d10), dodecahedron (d12), and icosahedron (d20). Only visible faces are drawn in perspective. Dice results and roll behavior are unchanged.
- The top-left **THE FOLIO / CHARACTER SHEET** brand is now a keyboard-accessible button returning to the character library; removed the redundant ← Library header control. No saved state is changed when returning.
- Added explicit documentation of Paladin 9+ spell-tier eligibility, the level-7/8 limit on Pip's bespoke progression, and the lack of multiclassing automation.
- Added automated navigation, dice asset, and Paladin progression regression tests and browser smoke coverage of loaded icons and logo navigation.

No user data schema, spell database, weapon logic, or rolling algorithms were modified. Export a library JSON backup before moving between extracted folders.

---

# Milestone 10 release notes — The Folio 2.0

## New

- Bundled 339-record SRD 5.2.1 spell dataset and class-/level-filtered preparation workspace, without replacing Pip's everyday four-group spell layout.
- Rules-aware preparation, queued Long Rest/level-up changes, ritual/Mystic Arcanum/slot casting controls, concentration and Undo.
- 38-weapon catalogue with properties, optional attack rolls, critical damage, target AC, ammunition and hand checks, and reference-only mastery reminders.
- Floating, animated Quick Roll: d4/d6/d8/d10/d12/d20, dice count, modifier, Advantage/Disadvantage and roll history.
- Copy reusable homebrew spells and weapons/items from the saved Milestone 9 Homebrew Library into the current character's Spellbook or Inventory. The imported entries remain editable snapshots.
- More direct regression/browser tests and refreshed SRD/third-party attribution.

## Fixes found during audit

- Noninitial full-list preparation changes are queued until a Long Rest, not castable immediately.
- Single-swap actions validate class/level eligibility, cantrip versus leveled spell, duplicates and Mystic Arcanum compatibility.
- Illegal imported catalog spells cannot be cast by unsupported classes.
- Weapon mastery is limited by the class maximum and counted by distinct weapon kinds; Barbarian mastery restricts ranged weapons.
- Weapon mastery is not presented as triggered when the target AC is unspecified.
- Pip's specialist level-7/8 replacement picker cannot queue level-3+ Paladin spells.
- Cast dialogs explain the 2024 limit of one spent spell slot per turn; full turn-action enforcement remains manual.

## Compatibility

Includes all prior character library, campaign, homebrew and Pip assets. Existing Milestone 9 JSON library backups can be imported via the Library. Export an old backup before upgrading. Older saves and homebrew without the new optional fields are supported. Changes save locally on the device; no account or server is required.

## Known limitations

Some rule outcomes require player/DM decisions; the engine is not a full multiclass or class-feature simulator. Wizard-specific spellbook acquisition, action economy, true offline sync across browsers, all 2025 sourcebook content, custom background themes/dice skins and native desktop packaging are out of scope. Importing a basic homebrew weapon/spell uses editable placeholder fields. The Windows `file://` launch and real browser IndexedDB persistence couldn't be exercised in this environment. See `TESTING.md`.
