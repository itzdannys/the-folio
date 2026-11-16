# The Folio — Milestone 17.1.1: Current Rules (revised local alpha)

**Based on:** Milestone 17.1 Rules & Sources. This is a **replacement for that local build**, not the full milestone 17 content catalogue.

## Changed

- One **2024 revised 5e/SRD 5.2.1** rules baseline (included and always on); **no 2014/2024 dropdown**.
- Source reference controls remain available at the library, campaign and character level. The Homebrew Library, original user metadata pack import, and all character editing workflows remain intact.
- Legacy 2014 source mode preferences in earlier 17.1 saves/exports migrate to the modern rules baseline. Historic 2014 reference pack metadata is retained but labelled as older and not automatically compatible.
- Eliminated edition-related new-character blocks and misleading on-sheet warnings. Core HP/spell/combat calculations remain identical to the original 2024 implementation.

## Not yet included

- This is not an automatic import of the newest commercial books. Names of external publications are **reference labels only**. No new paid-book class, subclass, spell, feat, species, background or equipment mechanics have been installed.
- The current rules baseline does not mean every included feature/erratum is individually implemented. Complete current-version deduplication and missing categories are Milestone 17.2+ work; 339-spell independent source verification is also outstanding.
- 2014-only character creation and rules calculations are **not supported** and are no longer an edition option.

## Verification

- **181/181 Node tests pass**, including migration of old 2014-labelled library and character backups, preserved resources/Undo, source preference inheritance, pack safety and registry counts.
- Chromium/Playwright source manager checks pass at desktop and 390px widths; core 15.3 and 16.x regressions are also retained.

## Upgrade

1. Export a **full Library JSON** from your existing installation and keep that backup.
2. Extract the new ZIP into a separate folder, keeping the older Folio folder intact.
3. Launch **Open The Folio.cmd**. If characters are missing, import the full library backup.
4. Check Pip, your other characters, source references, spell preparation, resources, and appearance before deleting anything.

See `docs/SOURCE_PACKS.md` for source-pack format, migrations and limits.
