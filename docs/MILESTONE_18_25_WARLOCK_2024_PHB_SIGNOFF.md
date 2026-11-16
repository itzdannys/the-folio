# The Folio — 18.25 Warlock (2024 PHB), single-class character-sheet sign-off

**Starting checkpoint:** 18.24 full standalone Sorcerer release. **Scope:** the offline, personal Folio character-sheet application; **not** a virtual tabletop or an automated DM. There are 11 signed-off 2024 PHB classes at this checkpoint; Wizard remains. This milestone neither replaces saved characters nor imports third-party or proprietary bulk source material.

## Rules reference / provenance

Consulted the user's 2024 *Player's Handbook* (Warlock chapter, printed pp. 153–163; uploaded PDF pp. 156–166). The supplemental `dnd-data-main.zip` was not bulk-imported: this release's class rule data is hand-checked against the PHB and the existing Folio catalogue. Neither archive nor the commercial PHB is bundled. The PHB contains mechanics whose result depends on a DM-controlled target; all such targets require player/DM confirmation.

## Verified class progression and choices

- **1–20:** correct 2024 single-class Pact Magic slots and slot levels, Charisma spell ability, cantrips/prepared spell progression and Short Rest recovery; once-per-Long-Rest Magical Cunning at level 2 (one-minute rite, recovery of half the maximum slots rounded up) and Eldritch Master at level 20 (all Pact slots); Contact Patron at level 9; Mystic Arcanum at levels 11/13/15/17 with distinct once-per-Long-Rest slots; feats at levels 4/8/12/16/19 handled by existing builder.
- **Eldritch Invocations:** all 28 published 2024 PHB options exposed as level/prerequisite-aware choices. Supports repeatable eligible cantrip/Origin-feat options, and requires named prerequisite invocations. The sheet persists selected invocations on save/reopen and character level-up. Optional DM interpretations of untracked external events stay manual.
- **Pact of the Blade:** conjuration/bonding; Charisma attacks and damage, Thirsting/Devouring Blade multiple attacks, Eldritch Smite with Pact slot expenditure and damage rolls, and Lifedrinker with a separate Warlock d8 Hit Die for healing. Attacks do not assume enemy AC, hit or position: all must be confirmed.
- **Pact of the Chain:** free Find Familiar spell and form selector including special PHB familiar forms; companion's movement, attacks, saving throws and full stat block remain DM/companion sheet territory. Investment of the Chain Master rules surfaced.
- **Pact of the Tome:** choose 3 cantrips and 2 level-1 ritual spells from the verified catalogue. Spells are visible in the shared Spellbook as granted; records survive save/reopen. Gift of the Protectors tracks names and once-per-Long-Rest use.
- **Attack cantrip:** Eldritch Blast beam counts at character levels 1, 5, 11, and 17; attack/advantage calculations, Agonizing Blast Charisma damage, Eldritch Spear range and conditional Repelling Blast push. No enemy HP or effect is silently changed.
- **Other spell invocations:** Armor of Shadows adds conditional Mage Armor AC, Fiendish Vigor grants maximal False Life temporary HP; other verified no-slot invocation spells are available through the existing Spellbook casting dialog, with costs and casting time tracking.
- **Archfey Patron:** PHB subclass spells, free Steps of the Fey (Refresh/Taunt), Misty Escape, Beguiling Defenses, Bewitching Magic. Teleport legality and enemy saving throws are not invented.
- **Celestial Patron:** subclass spells, Healing Light die pool and self-healing, Radiant Soul resistance and spell damage, Celestial Resilience rest-based temporary HP, Searing Vengeance with confirmed death-save trigger.
- **Fiend Patron:** subclass spells and preserved Dark One's Blessing / Dark One's Own Luck / Fiendish Resilience plus Hurl Through Hell. Fiendish Resilience applies on typed incoming damage; Hurl target's save and effect remain DM-adjudicated.
- **Great Old One Patron:** telepathy, Psychic Spells conversion/no verbal or somatic, Clairvoyant Combatant, Eldritch Hex, Thought Shield Psychic resistance, Create Thrall. Reflective Psychic damage is shown as a rule note, not applied to enemies.

## Actual application integration

Files: `js/warlock-2024.js`, `js/warlock-ui.js`, `js/builder.js`, `js/class-mechanics.js`, `js/core.js`, `js/rules-engine.js`, `js/rules-ui.js`, `js/builder-ui.js`, `js/main.js`, `index.html`, regression tests and this document. All work remains local file-based and uses the existing `Open The Folio.cmd`. Preserved Pip, character library, custom campaigns, homebrew, saved spellbooks, backups, dice UI, theme settings and previously signed-off classes. Existing warlock-based spells and Fiend controls are reused rather than reset.

## Verification

- `npm test` — **896/896 pass**, including 20 focused Warlock tests.
- `python tests/milestone18-25-warlock-browser.py` — passes all four patrons, invocations, free Spellbook casting, pact attack, save/reopen and 390-pixel layout.
- All 11 existing browser regression suites pass: Paladin, Fighter, Barbarian, Rogue, Monk, Ranger, Cleric, Bard, Druid, Sorcerer and the rules-source registry.
- `npm run audit:rules`: **600 source records**, 0 version conflicts, 0 duplicate revision IDs. **557 candidates** still await separate source/version checks; this registry is read-only and never upgrades characters silently.
- The full standalone release ZIP is extracted into a clean folder, checked for intact Windows launcher and tested independently before distribution. The archive does not contain the uploaded PHB or supplementary ZIP.

## What remains manual or outside the signed-off scope

This is **a verified single-class player character-sheet milestone**, not a promise of fully automatic arbitrary combat. For PHB content with no approved distributable spell/stat text, the application keeps names and source pointers and asks the player to check the PHB for exact targets, durations, casting requirements, effects and limitations. DM-confirmed details include creature HP/AC, target ranges and positions, enemy saves, external spell outcomes, telepathy recipients, familiars, Create Thrall's creature, reflected psychic damage and selected invocation effect outcomes. A general multiclass engine, 2025–26 supplements, later source-version audits and complete 2024 Wizard class are **not part** of 18.25. The 2024 PHB rule book itself and mixed-era third-party archives are not redistributed.

## Next milestone

**18.26 — Wizard**: full 2024 PHB levels 1–20, four subclasses (Abjurer, Diviner, Evoker, Illusionist), verified spellbook/copy/preparation systems, Arcane Recovery, Memorize Spell, Spell Mastery and Signature Spells; retain all existing saves and regression tests.
