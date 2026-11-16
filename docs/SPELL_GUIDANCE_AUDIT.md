# M16.1 — Full spell guidance coverage / mechanics review

## What has been implemented

- All **339/339** unique spells in the checked-in 2024 Open5e SRD catalogue have individual original **When to use** and **Watch out** guidance. No placeholders or generic copy-paste records.
- Every spell reference displays level, school, casting time, range, duration, components, ritual and concentration status, its own spell-specific advice, a short unaltered source-text preview, a nonauthoritative attack/save *cue*, the exact bundled higher-slot/cantrip-scaling text when present, and a separately labelled **full bundled SRD description**, expanded by default.
- The 2024 source spell description is preserved rather than overwritten by tactical interpretation. Only safe visual emphasis formatting is applied to that displayed text.
- All 339 records are tested for unique keys, mechanical fields, nonempty advice, and reference-modal rendering. The module does not mutate spell selections, resources, backups, concentration, or casting.
- Corrected outdated Pip-specific reference wording for Prayer of Healing (2024 casting time is 1 minute).
- Checked notable revision-sensitive entries including Spiritual Weapon (concentration), Inflict Wounds (Constitution save), Chill Touch (melee spell attack), Counterspell (Constitution save), Prayer of Healing (1 minute), Resistance (Action; damage reduction), and Guidance (Action; chosen skill).

## Source and limitations

The underlying full spell text comes from the **bundled Open5e 2024 SRD snapshot**, not a live internet fetch. See `SPELL_DATA_LICENSE.md` for the CC-BY 4.0 attribution and extraction date. The authoritative online source is the [official SRD v5.2.1](https://www.dndbeyond.com/srd). Some upstream mistakes or later errata may exist. The full official SRD has **not** been independently compared against all 339 records line by line. The on-screen **Resolution cue** is a search-derived prompt and never overrides the original source text, which may include multiple saves, conditional triggers or exceptions.

Original tactical tips are suggestions, not guaranteed outcomes or rules. Spell descriptions have varied complexity; always read the full text for exact target eligibility, timing, components, ending conditions, and higher-level casting. Custom/homebrew spells still use the custom editor's supplied descriptions, not SRD notes.

## QA

- `npm test`: 168/168 Node tests pass (163 existing + 5 new).
- `python tests/milestone16-browser.py`: passes.
- `python tests/milestone15-3-browser.py`: passes.
- `python tests/milestone16-spell-audit-browser.py`: passes (desktop and mobile).
- Windows `file://` launching and storage re-import still need confirmation on the user's device; keep JSON backups.

## Follow-up work

- Optional: independent rules/editorial verification against any future official SRD updates; add source version checks and corrected entries.
- Optional: improve complex markdown stat-block and table formatting; the complete original text remains available.
- Existing M16 saved sets remain view-only collections; preparation switching is a separate feature.
