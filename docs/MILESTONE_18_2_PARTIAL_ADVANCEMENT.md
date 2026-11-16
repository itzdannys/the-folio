# The Folio — Milestone 18.2 (PARTIAL): Earned Advancement & Fighting Styles

**Release:** 2.0.0-alpha.18.2-partial. **Date:** November 15, 2026.

This builds directly on Milestone 18.1 typed damage. It is **not** a completed 2024 Player's Handbook, a finished level-1–20 class feature engine, or complete support for all commercial sourcebooks. Prior feature limitations remain.

## Verified code changes

1. **Earned feat/ASI milestones for the 12 SRD core classes.** Standard milestones are class levels 4, 8, 12, 16 and 19, with Fighter 6 and 14, and Rogue 10. New characters can record a separate choice at each reached milestone. For unselected milestones the builder explicitly reports **Unresolved** and does not invent an ability bonus or feat. These class grants do not apply by assumption to homebrew classes.
2. **Ability Score Improvement works mechanically.** Select two +1 options; selecting one ability twice gives +2. The app checks the score-20 ceiling and updates ability scores, related modifiers, derived skills/saves/attacks and suggested maximum HP when Constitution changes. Reopening Build & Level preserves the choices. Leveling down suspends future awards, with their selections retained for later restoration rather than being silently applied.
3. **Feat selection at earned levels.** Select from bundled/locally imported feats; check implemented level/ability/class prerequisites, restrict nonrepeatable duplicate choices and prevent selection before the required level. **Most selected feats still require manual use of their actual effects**. The extra-feat control remains a *separate manual grant*, not a substitute for earned milestones.
4. **Class-granted Fighting Style selections.** Fighter can select one at class level 1; Paladin and Ranger at level 2. Style choice is saved and shown as a character feature. **Defense** applies +1 AC while wearing armor. **Archery** applies +2 to attack rolls made with ranged weapons, not thrown melee weapons. These are the specifically automated styles; other styles are still manual.
5. **Additional verified passive feat effects.** An *Alert* feat granted by a background or selected feat adds Proficiency Bonus to Initiative (its initiative-swap interaction remains manual). *Tough* contributes +2 HP per character level. These are not stackable duplicate grants. Dwarf species HP additions remain separate.
6. **HP level-up bug fixed.** The builder now distinguishes auto-calculated HP from a manual HP override. Raising level or Constitution no longer accidentally freezes a previously auto-generated HP total; explicit manual overrides remain explicit. Old saves are not rewritten automatically on load, and the Character Editor's current manually adjusted max HP is preserved in Build & Level.
7. **Features page, print page and release text** reflect saved award choices; the legacy Pip-specific template is unchanged. Undo and local backup data keep the new choice fields.

## Source verification

- User-supplied **SRD 5.2.1** PDF: class advancement and Fighter extra ASIs (pp. 47–49), Rogue extra ASI (pp. 61–63), feat improvement and Fighting Style rules (pp. 87–88), character creation and HP (pp. 19–23).
- D&D Beyond free basic feats: <https://www.dndbeyond.com/sources/dnd/br-2024/feats>.
- D&D Beyond official 2024 Origin Feats overview (Tough): <https://www.dndbeyond.com/posts/1785-the-backgrounds-and-origin-feats-in-the-2024>.

SRD 5.2.1 is licensed under CC BY 4.0 with attribution provided in `ATTRIBUTION.md`. The non-SRD catalogues still contain reference metadata rather than republished commercial rulebook chapters.

## What has NOT been implemented

- All class features for all 12 classes at every level, subclass feature choices, class-specific feat exceptions or feat-specific spell selection beyond currently available mechanics.
- Most active feat effects, several 2024 PHB Fighting Styles not present in the current SRD catalogue, and class features with ongoing effect durations.
- Complete class-specific weapon mastery selections, multiclassing, official character option databases beyond the bundled/licensed material, or verification of each supplement's latest errata.
- Automatic migration of legacy manual ability increases into newly recorded ASI milestones: **review an older character's entered base scores before adding historical ASI choices**, or you could accidentally award the same increase twice.
- The new feature list records *earned* feats/ASIs, but it does not mean all the feat's abilities are executable.

## Test evidence

- **251 Node tests passed** after adding 11 progression/feat/style tests and retaining the 240 prior tests.
- Interactive Chromium flow: create Fighter level 4; select actual STR +2; save and reopen; level to 6; select Constitution +2; save; reopen; verify feature card and mobile layout.
- Inherited Chromium workflows for damage/Rage, class resources, backgrounds, species, spells, equipment, and Milestone 15.3 artwork passed.

Do not replace the current installation blindly. Export a full Library JSON backup first; extract this ZIP into a separate folder and verify your characters before retiring the previous build.
