# Milestone 18.28 — 2024 Player's Handbook Species & Traits

**Release basis:** Milestone 18.27 UI Polish, retaining all prior class engines, characters, offline library, campaigns, homebrew, spellbooks, dice roller, artwork, automatic local saves, export/import and Windows `Open The Folio.cmd` launcher.

**Scope:** The ten species described in the 2024 Player's Handbook for a newly created single-class Folio character. Other-book species, including Changeling and new supplements, remain selectable with the prior reference/choice behavior, but are **not** claimed to have full mechanical support in this release. This is a species/character-sheet implementation, not automatic arbitration of the DM's NPCs or a replacement for the purchased book.

## Implementation by species

| PHB 24 species | Implemented and interactive | Player / DM confirmation remaining |
| --- | --- | --- |
| Aasimar | Light; Necrotic and Radiant resistances; Healing Hands `PB`d4 (self healing applied or remote target recorded); Celestial Revelation level 5 form selector, minute-long active state, once-per-turn damage counter | Select valid target; creature saves for Necrotic Shroud; choose when effect expires |
| Dragonborn | Ten ancestry choices; damage-type resistance; PB/Long Rest Breath Weapon, cone/line choice, level-based d10, Dex save DC; level 5 Draconic Flight | Confirm which enemy occupies the affected area, saves, damage, and when flight ends |
| Dwarf | Darkvision 120 ft; +1 maximum HP per level; Poison resistance; Stonecunning PB/Long Rest Tremorsense activation | Poisoned-condition saving throws, stone contact and duration |
| Elf | Drow/High/Wood lineage, Darkvision, Keen Senses, Trance, Fey Ancestry; level 1/3/5 lineage spell grants; one free level-3 and -5 spell each Long Rest, using shared Spellbook; choice of innate spell ability; optional High Elf replacement Wizard cantrip | Confirm replacement at Long Rest and situational Charm effects |
| Gnome | Forest/Rock lineage, Gnomish Cunning; Forest Minor Illusion and free Speak with Animals PB/Long Rest in shared Spellbook; Rock Mending/Prestidigitation and up-to-three device tracker | Device effects and expiry after 8 hours, contextual saving throws |
| Goliath | Six Giant Ancestry powers PB/Long Rest; rolls and descriptive outcomes; Large Form level 5, temporary size/speed integration | Target space, damage on hits, teleport destination and other-creature effects |
| Halfling | Brave, Nimbleness, Naturally Stealthy passives; interactive Luck d20 reroll | Confirm qualifying roll and contextual Hide/fear/space conditions |
| Human | Small/Medium, Skillful skill choice, additional Versatile Origin feat selection, Resourceful Heroic Inspiration on Long Rest | Choose/resolve complex Origin feat effects through existing Feat system |
| Orc | Darkvision, Adrenaline Rush Bonus Action Dash + PB temp HP PB uses per Short Rest; Relentless Endurance once/Long Rest, including optional qualifying incoming-damage trigger | Confirm trigger, position, action availability and damage is not instant death |
| Tiefling | Three Fiendish Legacies and automatic corresponding resistance; Thaumaturgy + lineage cantrip; level 3/5 spells with one free cast per Long Rest; selected innate spell ability | Apply spell effects to creatures with DM resolution |

Features & Traits has separate **passive effects** and **active abilities**, with usage counters, last-outcome messages and a single clear trigger-confirmation control. Character creation adds relevant ancestry/lineage, species spell ability, Human Origin feat and High Elf cantrip choices without removing reference-only other-book species.

## Source presentation

User-facing source labels for the shared 2024 rules baseline and handbook reference both read **PHB 24**, including subclasses such as **Oath of Devotion**, species, spell filters, catalog rows and source selections. Original distinct internal `srd-2024` and `phb-2024` IDs, copyright notices, and licensing/source provenance remain in code and legal documentation. This display-only consolidation **does not mean that SRD 5.2.1 and the commercial Player's Handbook have identical licenses**.

The **COMBAT · INCOMING DAMAGE** dialog has been reorganized into a clear amount/type entry, three optional resistance/vulnerability/immunity tiles, contextual defensive feature choices and a compact explanation; the HP strip stays uncluttered.

## Verification / non-goals

- `node --test`: **936/936 passed** (previous 923 baseline plus milestone-specific coverage and related tests).
- Targeted Chromium scripts: 15/15 passed, including every PHB class and registry, 18.27 UI polish, new species creation, ability use, save/reopen, source label, damage dialog and mobile builder.
- Full standalone ZIP freshly extracted; Node tests and species browser test to be rerun on extraction prior to release.
- No logged-in account, server, subscription or network dependency. Windows launcher preserved. No redistribution of uploaded proprietary handbook or third-party archives.

**Boundaries:** The application cannot silently know a DM's creature positions, saving throws, enemy HP or outcomes. Situational saving-throw Advantage, creature effects, spell effect resolution, elapsed-minute timing, reaction availability across independent class trackers, and spell/feat options needing user choices may still require a player/DM to confirm events at the table. The builder permits an unselected choice so an existing or in-progress character is not destroyed; missing innate spellcasting abilities are flagged and free casts require choosing one first. Multiclass interactions are outside this milestone.

## Regression checklist

Creation of all ten PHB species; existing other-book species; ancestry and spell choices; levels 1/3/5/11/17; rest recharge; resource exhaustion; resistance, HP and speed modifiers; eligible spellcasting via class-free lineage spells; save/reopen; mobile builder width; damage modal; source names; all 12 existing class browser suites; launcher contents; clean ZIP extraction and retest.
