# The Folio — Milestone 17.3: Species & Traits

## What ships

**26 selectable species names**: 9 SRD 5.2.1 species, 1 PHB 2024 Aasimar reference, 5 updated Eberron 2025 species references, 4 2026 Ravenloft references, 7 Lorwyn references. These are **not** the exhaustive universe of species across all official D&D books. This milestone expands the current catalog and prepares lawful personal source-pack integration.

- In **Library → Create character / Build & Level**, a new **Species & Traits** section displays the selected species, source, creature type, size, walking speed where known, and individual feature names with a short paraphrase or a manual-reference label.
- Records size, supported subchoice (Elf, Gnome, Goliath, Dragonborn, Tiefling), and eligible skill picks (Eberron Changeling, Human, Elf). Two Changeling Instincts skill picks must be unique; missing selections are clearly reported but can be filled later.
- Applies a small number of reliable SRD effects: Dwarf Toughness +1 maximum HP per level in **suggested HP** calculations; Wood Elf base speed 35 ft; Drow extended Darkvision 120 ft; declared skill proficiencies. The rest of the traits require manual resolution. A manually entered maximum HP overrides the suggestion.
- Creates separate Features & Traits cards for each species feature and a summary of personal selections. Saves, backups, species changes and sourcepack removal retain the recorded character choice. Pip's existing dedicated Changeling setup is preserved.
- Personal metadata packs can now contribute user-created species options with verified input validation for speed, sizes, creature type and up to 12 trait names. Full class powers and sourcebook rules are never executed by source-pack JSON.

## What's *not* included

- Full copyrighted rules from paid books or a full catalogue from every official supplement. Sourcebook names and traits are *metadata only*, not claims of installed entitlement. For unfamiliar species, the builder requires you to enter speed and confirm size from your book.
- Full 2014 rules engine, legacy-option selection or automatic cross-book supersession. Updated 2025 Eberron Changeling is the single entry named **Changeling**; **Lorwyn Changeling** is a separate species in the 2026 Lorwyn setting. Older Eberron changelings are not duplicated.
- Automatic Shape-Shifter state/portrait changes, conditional Charisma Advantage, extra learned spells, resistances, Giant/Dragonborn power trackers, all innate casting, or precise source-by-source feat and background effects. They remain descriptive/manual and are scheduled for later milestones.
- Complete license audit of optional books or all current errata; references checked against the public official pages linked below, with any future corrections recorded in an audit.

## Verified provenance

- [SRD 5.2.1](https://www.dndbeyond.com/srd) — permissibly bundled current core rules and nine SRD species.
- [2024 Basic Rules — Character Origins](https://www.dndbeyond.com/sources/dnd/br-2024/character-origins) — sizes, speeds, SRD trait choices and Dwarf/Elf effects.
- [Eberron 2025 official species overview](https://www.dndbeyond.com/posts/2017-how-eberron-forge-of-the-artificer-reimagines) — five Eberron species and Changeling changes.
- [D&D Beyond Species listing](https://www.dndbeyond.com/species) — official published 2026 Ravenloft and Lorwyn names and feature headings.

SRD text is CC BY 4.0. Names and concise reference metadata from commercial books remain attributed to their owners; Folio does not redistribute their full copyrighted mechanics.

## Testing and installation

`npm test`: **200/200 passing**. All six targeted/inherited Chromium smoke workflows pass. These are not tests on an actual Windows browser `file://` profile.

Back up your full Library JSON from the previous Folio. Extract this ZIP into a new folder and launch **Open The Folio.cmd**. Test existing Pip and another character, choose a new Changeling starter and record two skills, save/reopen, and confirm all HP/spell resources remained intact before retiring the old installation.
