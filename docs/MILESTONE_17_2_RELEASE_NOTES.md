# Milestone 17.2 — Expanded backgrounds, feats and sourcebook-selectable entries

**Build:** `2.0.0-alpha.17.2` (personal offline alpha, November 2026).

## Delivered

- **16 revised-2024 PHB backgrounds** in the builder. The four SRD options (Acolyte, Criminal, Sage, Soldier) are distinguished from twelve PHB **reference metadata** entries. All sixteen include a name, three eligible ability scores, two skills, a tool proficiency and an Origin feat label. **Equipment and complex granted effects are not auto-applied.** The twelve proprietary entries are not full rulebook reproductions.
- **25 feat choices** covering all 17 names in the public SRD/Basic Rules list, with Magic Initiate represented as three spell-list choices, plus six PHB-only Origin feats needed by backgrounds. Legacy starter feat IDs (notably Fighting Style: Defense and Fighting Style: Two-Weapon Fighting) remain stable.
- Feat category, source/provenance, concise original reference description, minimum level, repeatability and some straightforward prerequisites. The builder checks level thresholds, Grappler STR/DEX 13, and common Fighter/Paladin/Ranger Fighting Style access. More exotic prerequisites and all conditional effects **still require manual verification**; choosing a feat does not consume game resources or automatically confer all mechanical benefits.
- Correct choice between **background +2/+1** and **+1/+1/+1**, with eligible ability restrictions and the 20-point background-increase cap. Old saved builds default to the original +2/+1 model. Added a tool grant and separate background feat field in the build snapshot. Background feats remain recorded even when an additional feat is selected.
- Imported **user-provided source packs** may contain simple `background` and `feat` entries that now appear **selectable in the character builder**, with pack attribution. Optional bounded fields include `abilities`, `skills`, `tool`, `feat`, `minLevel` and `featCategory`. This is metadata and manual reference support; it is **not an importer for PDFs, proprietary book text, or executable rule modules**. Existing JSON packs remain supported.
- Extended the library's reference directory with further official publication names (all marked **reference only**), raised the limit on locally imported packs to 150 and source selections to 200. There is **no claim** that every publication or its content is already present. The flexible pack format avoids limiting additions to a fixed built-in sourcebook list.
- Preserved all prior milestone workflows, the fixed SRD 5.2.1 baseline, source-preference migration, the legacy Pip folio, artwork, Spellbook, combat rules, and local backup format.

## Compatibility / honest limitations

1. **Broad support architecture is not the same as a complete official catalogue.** The 16 PHB backgrounds and 25 feat choices are the Milestone 17.2 batch; options from *Tasha's*, *Xanathar's*, *Eberron* and other titles are not shipped unless they already existed in prior project data or were entered/imported locally.
2. Imported sourcebook records are **user-entered**, never automatically certified as official, current, licensed or superseded. Verify their wording and compatibility with the publication and errata. The source manager's enabled toggles remain informational in this alpha; the builder may show imported entries independent of toggles.
3. The +1/+1/+1 choice is saved, but older builds using the existing +2/+1 model are unchanged. Background tool proficiency is recorded in the build; not automatically included in separate inventory/tool management.
4. The single extra-feat selector is not a complete level-by-level feat progression system. All future complex effects, selection-count requirements, subclass-granted feats and feat replacements belong in M18+.
5. The SRD is CC BY 4.0; proprietary-source entries in this release contain only limited metadata and original summaries. **Do not add commercial book chapters to a distributable ZIP** without permission. See `RIGHTS.md`, `ATTRIBUTION.md` and `docs/SOURCE_PACKS.md`.

## Rules references

- Official SRD v5.2.1: https://www.dndbeyond.com/srd
- Official revised Basic Rules, Character Origins: https://www.dndbeyond.com/sources/dnd/br-2024/character-origins
- Official revised Basic Rules, Feats: https://www.dndbeyond.com/sources/dnd/br-2024/feats
- D&D Beyond official PHB background roster: https://www.dndbeyond.com/posts/1785-the-backgrounds-and-origin-feats-in-the-2024
- Public comparison metadata consulted for proprietary PHB background selections: https://dnddiceroller.org/blog/dnd-2024-backgrounds (independent source; should be cross-checked against the user's owned book)

## Testing

- Automated Node tests: **190 / 190 passing** (baseline 181 + 9 Milestone 17.2 tests).
- Chromium: new Milestone 17.2 selection/ability/prerequisite/source-import/mobile tests passed.
- Chromium: previous Milestone 17.1 sources, Milestone 10 smoke, Milestone 16.1 spell reference, and Milestone 15.3 token/layout regressions passed.
- Real Windows `.cmd` launching and existing local browser storage migration must still be verified on the user's own machine.
