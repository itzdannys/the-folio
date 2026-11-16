# Milestone 18.15 — 2024 Player's Handbook Paladin Oaths (PARTIAL)

**Scope:** The Folio's first *class-focused* PHB expansion, extending Milestone 18.14. This is not a complete implementation of the 2024 PHB, even for Paladin. Implemented rules were checked against the **user-supplied 2024 Player's Handbook, Paladin section, printed pages 113–117**. The submitted PDF remains a separate personal reference and is **not bundled or copied into this ZIP**. Consult later official errata for any subsequent changes; no comprehensive errata verification is claimed.

## At a glance

All four PHB Paladin oaths now exist as real, level-3+ builder selections:

- **Oath of Devotion** (existing SRD oath, with previous partial mechanics retained)
- **Oath of Glory** (new)
- **Oath of the Ancients** (new)
- **Oath of Vengeance** (new)

Each oath's ten level-based always-prepared spells are available at Paladin levels **3, 5, 9, 13, and 17** (2 per level), and the 40 names resolve to catalogue records. These grants do not consume regular preparation slots. **Catalogue availability is not spell-effect automation:** some spells remain name-only with explicit manual-resolution indicators.

## Newly implemented functions and UI

### Oath of Glory
- **Peerless Athlete** (level 3): Channel Divinity charge; on/off toggle for the one-hour duration; actual Advantage on Athletics and Acrobatics checks; jump bonus shown for manual tracking.
- **Inspiring Smite** (level 3): requires an immediately preceding tracked Divine Smite and consumes Channel Divinity. Rolls `2d8 + Paladin level`; applies chosen self share of temporary HP with nonstacking maximum; records remaining temporary HP for nearby allies, who need manual application.
- **Aura of Alacrity** (level 7): +10 ft speed appears in calculated character speed. Ally aura remains player/DM-managed.
- **Glorious Defense** (level 15): limited by Charisma modifier, uses a Reaction, accepts confirmed attack total and target AC, calculates bonus to AC, and identifies whether the attack now misses. Counterattack is manual.
- **Living Legend** (level 20): a timed activation and resource/level-5-slot fallback; active Charisma checks roll with Advantage. The saving-throw reroll and converting a missed weapon hit into a hit still require manual play.

### Oath of the Ancients
- **Nature's Wrath** (level 3): Channel Divinity cost and save DC are calculated; selected nearby targets and results remain player/DM-managed.
- **Aura of Warding** (level 7): incoming self damage of Necrotic, Psychic, or Radiant type receives proper Resistance, with no double stacking. When incapacitated, the aura's self-protection stops. Ally damage must be managed on each ally's sheet.
- **Undying Sentinel** (level 15): checkbox in incoming-damage UI; applies to qualifying, non-instantly-fatal hit reducing HP to zero; restores to `1 + 3 × Paladin level` HP up to max; consumes daily use, blocks misuse and massive damage.
- **Elder Champion** (level 20): timed activation with once-per-Long-Rest charge or spent level-5 slot; restores up to 10 HP at the start of each *tracked Paladin turn*, only once per turn, without healing someone at zero HP. Enemy saving-throw penalties and faster spell casting remain manual.

### Oath of Vengeance
- **Vow of Enmity** (level 3): names a visible target, spends Channel Divinity, persists during play and save/reopen, applies Advantage only to explicitly confirmed attacks against the active vowed target, and handles normal Advantage/Disadvantage cancellation. Transfer to another named creature requires player confirmation that the original target was reduced to 0 HP, and costs no extra Channel Divinity. End and Short Rest clear the temporary state.
- **Hunter's Mark** (level 3 oath spell): can be cast from the Spellbook with a Paladin spell slot, uses a named target and concentration, and adds the 2024 spell's `1d6 Force` to confirmed weapon hits (double dice on critical). Unlike a high-level Ranger, a level-20 Vengeance Paladin does *not* get the Ranger-only `d10` scaling. Free Favored Enemy casting is Ranger-only.
- **Relentless Avenger** (level 7): reference/reminder for Opportunity Attack trigger and movement; mechanical target movement remains manual.
- **Soul of Vengeance** (level 15): Reaction attack opportunity displayed; actual trigger/roll and Reaction timing remain manual.
- **Avenging Angel** (level 20): tracked timed activation with charge or level-5 slot fallback. Flight/hover and enemy Frightened saves are displayed but not reflected in a battlemat or tracked enemy sheet.

### Existing Devotion behaviour retained
Sacred Weapon modifies a chosen held Melee weapon's actual attack bonus; Aura of Devotion prevents self Charmed where applicable; Holy Nimbus resource tracking and oath spells remain. Devotion's full ally-auras, Smite of Protection, and 20th-level enemy triggers are still not automatic.

## Important limitations — NOT complete

- Four Paladin subclasses are selectable, but **none should be described as completely implemented**.
- Enemies, positions, range, targeting, saving throws, and ally sheet state generally require a player or DM's confirmation. A character-sheet companion cannot infer external creature actions.
- The app does not reliably enforce the full bonus action / Reaction / one-spell-slot-per-turn action economy for every effect.
- Living Legend's miss-to-hit and saving-throw reroll, Soul of Vengeance's free melee attack, Devotion Smite of Protection, Glory/Ancients ally auras, and some other triggers need further integration.
- Many spells are indexed or reference-only, **not fully scripted**.
- Multiclassing, full level 1–20 class choices and advancements, the other **44 PHB subclasses**, many feats/species/spells, and additional official books remain unfinished.
- The Folio remains an offline single-user personal project; **Pip's original specialist sheet is preserved and protected** from applying a starter builder over it.

## Verification

- `npm test` — previous entire suite plus **25 additional PHB Paladin tests**, including all oath spell grants, build option availability, rest reset, attack hits/misses/criticals, spell slots, condition resistance, reactions, temporary HP, incoming damage, once-per-day use, encounter-turn healing, and save serialization.
- `python tests/milestone18-15-phb-paladin-browser.py` — Chromium created and used **all three new oaths**, cast Vengeance's oath Hunter's Mark and attacked with both Vow and Mark, used controls, checked resource/HP behaviour, reopened characters, and validated **390 px** mobile layout.
- Existing regression workflows and clean-extraction results should be checked against the actual release log; they are not inferred from test counts.

## Follow-up development pattern

Continue class-focused PHB batches against the *complete* 2024 PHB checklist, with shared mechanics handled once and reused. Prioritize missing Paladin mechanics together with subsequent classes where they share reactions, enemy conditions, spellcasting, and durations, before claiming complete PHB class coverage. Each ability remains distinctly labelled working / partly manual / missing.
