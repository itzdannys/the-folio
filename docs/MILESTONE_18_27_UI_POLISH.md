# Milestone 18.27 — Folio UI polish sign-off

## Scope and source of truth

Based directly on the full Milestone 18.26 Wizard ZIP. This is **interface-only**; all 12 previously reviewed PHB 2024 single-class sheet implementations remain included. The Windows offline launcher (`Open The Folio.cmd`) is kept unchanged. No login, server, subscription, synchronization or replacement of previous characters or homebrew.

## Changes and expected behavior

1. **Damage controls:** HP strip shows amount, Damage, Heal and Temp HP. Opening Damage displays an accessible dialog with amount, damage type, manual Resistance, Vulnerability and Immunity, a short explanation, eligible class-defense controls, and explicit Apply/Cancel. Only confirmation applies damage; cancel does not. Last hit and Undo remain. Manual switches reset after use. Rage and concentration reminder use existing rule logic. DM decides which of the manual checkboxes apply.
2. **Spellbook density:** Single **Filters & grouping** toggle reveals name search, level, school, casting time, concentration, ritual, source, availability, and alternate grouping controls. Main spellbook tabs/records remain visible without expanding. Clear filters appears when any filter is active. Filters do not change spell preparations or resources.
3. **Custom spell grouping:** Top-level Custom spell disclosure now contains **Create custom spell** and **Add from Homebrew Library**. No homebrew entries are deleted or imported without user action.
4. **Source text:** Two 2024 source IDs (`srd-2024`, `phb-2024`) display as **PHB 24** across source choices, spell references, builder subclass/species/background entries, and preparation-source filters. IDs remain distinct for compatibility, provenance, licensing and save import. Only openly licensed SRD data is bundled for full mechanical descriptions; handbook-only entries may be reference-only. Legal attribution may still explicitly say **SRD 5.2.1**.
5. **Pip’s personal list:** This was a character-specific convenience category mistakenly offered as though it were a publication source. Removed the misleading source choice. Pip’s individual spell options and prepared/always-prepared groups remain. They were not deleted or magically converted into PHB-exclusive material.
6. **Class choice:** Creation and editing now offer **only** subclasses for the chosen class. Switching classes resets incompatible subclass choice and updates preview. All four 2024 PHB subclasses for each of twelve classes remain available by their class; compatible custom homebrew subclasses remain selectable.

## Verification checklist

- `npm test`: original 923 Node tests, unchanged rules engine behavior.
- `npm run audit:rules`: 603 candidate entries, 560 pending verification, zero version conflicts/revision duplicates.
- `python tests/milestone18-27-polish-browser.py`: source labels, subclass filtering on class change, damage popup, filters, custom spell submenu, mobile layout.
- Existing browser tests revised to interact with damage modal, filter expander and unified-source manager.
- Prior-class browser suite run for each signed-off class as well as rules registry; see run logs in `test-output/` if included in development tree. Final clean-extraction tests recorded below when packaging.

## Boundaries

No changes to publication/license data, source IDs, character-serialized schema, custom spell payloads, campaign IDs or save format. No new automatic enemy positions, saving throws, damage outcomes or online functions. Windows `.cmd` launcher can be verified for inclusion and content on this Linux environment, but not executed as a Windows shell. Export character backups before moving to a different folder/origin.
