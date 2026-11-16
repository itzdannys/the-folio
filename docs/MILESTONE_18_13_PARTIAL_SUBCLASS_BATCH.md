# Milestone 18.13 — Partial SRD subclass rules batch

**STATUS: PARTIAL.** This release expands three SRD 5.2.1 subclasses, not the entire 2024 Player's Handbook. It does not complete the goal of all official D&D 5e sourcebooks. Existing Pip, multi-character, Spellbook, and art features are retained.

## Rules basis and attribution

Wizards of the Coast, *System Reference Document 5.2.1*, pages 35 (College of Lore), 46 (Circle of the Land), and 82–83 (Evoker). The SRD is licensed CC BY 4.0; see the top-level `ATTRIBUTION.md`. These sections were checked using the owner-supplied 364-page SRD 5.2.1 PDF. The rules text here is implementation guidance, not a copied commercial PHB expansion.

## Tested, working mechanics

### College of Lore — Bard

- **Cutting Words (3):** After confirming a visible creature within 60 ft and a successful attack/check or damage roll, roll the correct Bardic die, subtract it, spend one Bardic Inspiration use and the tracked Reaction. Won't award a second Reaction in the same tracked turn. Damage is floored at zero. Does not guess targets or enemy modifiers.
- **Peerless Skill (14):** Enter the **failed** own attack/check and DC; roll the Bardic die. Spend the Inspiration only if the roll becomes successful. A continuing failure does **not** spend it.
- Other Bard base-class features remain as in prior builds (including Countercharm and Jack of All Trades).

### Circle of the Land — Druid

- **Circle Spells (3):** The four official SRD land choices (Arid, Polar, Temperate, Tropical) each grant six catalogued spells by the appropriate class levels. The user must confirm a Long Rest before changing land. The choice persists through save/reopen and class level-up and is cleared if the character changes class/subclass.
- **Land's Aid (3):** Spend one Wild Shape use; roll separate damage and healing dice at the appropriate Druid level (2d6/3d6/4d6). Apply healing to the character only if self is explicitly selected. The DM determines other creatures, saving throws, and conditions.
- **Natural Recovery (6):** After a confirmed Short Rest, recover a selected collection of missing level 1–5 slots with total levels at most `ceil(Druid level/2)`, once per Long Rest. A separate once-per-Long-Rest counter records casting one prepared level 1+ Circle spell without using a slot. Casting components, concentration, and targets remain manual for this shortcut.
- **Nature's Ward (10):** Applies the appropriate typed damage Resistance from the selected land automatically, respecting nonstacking rules and vulnerability ordering. Prevents a new Poisoned condition in the sheet UI and clears existing Poisoned status when selecting a land at level 10+.
- **Nature's Sanctuary (14):** Not automated; ally positioning and cover require a party/encounter target model.

### Evoker — Wizard

- **Potent Cantrip (3):** For a confirmed damaging Wizard cantrip with a missed attack or successful target save, calculate half of the entered damage with no secondary effect. The app doesn't subtract HP from an untracked enemy.
- **Sculpt Spells (6):** Validate and record up to `1 + spell level` chosen visible creatures for an Evocation spell, **including level-0 cantrips**. Their automatic save successes and avoided half damage remain DM-resolved because the app doesn't have separate target HP/saves.
- **Empowered Evocation (10):** Add the Wizard's Intelligence modifier to one confirmed damage roll of a Wizard Evocation spell; other rolls and target effects remain manual.
- **Evocation Savant (3) and Overchannel (14):** Not automated: spellbook additions and repeated-use Necrotic backlash require further integration.

## Existing gaps and limitations

- Full spellcasting effect resolution, hit/target management and action economy are not in place, so several effects require player/DM confirmation.
- **Bard:** Bonus Proficiencies and Magical Discoveries need independent character-selection and spell-grant editors.
- **Druid:** Nature's Sanctuary has no area-targeting UI. Land selection requires manual Long Rest confirmation.
- **Wizard:** Evocation Savant and Overchannel require spellbook/cast integration and are not in this batch.
- Many other SRD subclasses and the bulk of the 48 PHB subclasses are still partial or missing. No additional paid-book entries are claimed in this release.
- Existing spell catalogue retains SRD full rules for 339 spells and 91 reference-only names. More complete official books have not been installed automatically.
- Tests cannot guarantee all rules or Windows-only persistence; the user should validate saves on their own computer.

## Verification

- **396/396 automated Node tests passed** in the development tree (379 existing plus 17 new tests).
- The new Chromium browser test checked all three subclasses, persistent choices and limited-use resources, the Circle spell list, and a 390px viewport.
- Earlier Milestone 18.12 subclass, 18.11 cross-class, 18.8 Paladin and 18.1 typed-damage browser checks passed in the working tree.
- Package integrity and fresh-extraction tests are required before release.

## Upgrade and backups

Export a full Library JSON backup from the old Folio. Extract this ZIP into a **new** folder, run `Open The Folio.cmd`, and verify your characters, artwork, spells and encounter resources. Keep the old folder as a fallback. This release does not intentionally convert existing character values or replace any paid-book content.
