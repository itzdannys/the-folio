# Milestone 18.15C — Paladin defensive aura and reaction attack (PARTIAL)

**Release status:** Real but **limited** Paladin mechanics, built on the user-supplied Milestone 18.15B local app and its read-only version-registry audit. **This milestone does not finish Paladin, any of the four oaths, all official spells, or the 2024 PHB.**

## What was already implemented

- The existing Folio library, Pip, homebrew, offline saving, import/export, campaign folders, dice, appearance and weapon roller remain.
- The read-only version audit and source registry from 18.15B remain unchanged.
- Four Paladin subclasses can be selected in the 2024 builder. Devotion, Glory, Ancients and Vengeance already had some class features, spell grants, attack bonuses, resources and manual reminders.
- **Before this batch**, Devotion's level-15 Smite of Protection was only a descriptive feature; Vengeance's level-15 Soul of Vengeance was only a manual combat reminder.

## What changed

### Oath of Devotion — Smite of Protection (level 15)

- A real Divine Smite applied after a confirmed Melee-weapon hit now sets a temporary `smiteProtectionActive` flag at Devotion level 15+.
- While active and the Paladin is not incapacitated, its derived sheet AC and Dexterity saves gain **+2** for Half Cover. The bonus also applies if the player entered a manual base AC override.
- The protection ends automatically at the start of the next tracked Paladin turn, via the manual **Start of your next turn** control, or on a rest. No slot or free casting is consumed on a missed hit.
- Allies in Aura of Protection also receive the rules benefit, but because there is no synced ally-character combat state, their bonuses must be applied on their own sheets. The engine avoids claiming those changes are automatic.

### Oath of Vengeance — Soul of Vengeance (level 15)

- A new option appears in the existing **weapon Attack / Roll** dialog when a Vengeance Paladin level 15+ has an active Vow of Enmity target.
- The player must confirm that (1) this is the currently vowed creature, (2) it has just hit or missed with an **attack roll**, and (3) it is within reach of the chosen melee weapon.
- The same weapon roller resolves the attack with the Vow's Advantage (subject to normal cancellation), weapon damage and Radiant Strikes where applicable. The Paladin's Reaction is spent even if the resulting attack misses.
- The control refuses a missing trigger, wrong subclass/level, thrown or ranged attack, absent target AC, unavailable Reaction, incapacitation, or Divine Smite's off-turn Bonus Action.
- The Reaction's spent state and result are stored in the usual per-character local save. **The opponent's trigger, target distance and HP remain player/DM-confirmed**, since Folio does not track enemy actions automatically.

## Files changed

- `js/class-mechanics.js`, `js/core.js`, `js/weapon-rules.js`, `js/builder-ui.js`, `js/rules-ui.js`, `js/main.js`.
- `tests/milestone18-15c-paladin-reactions.test.cjs` adds 12 direct Node cases.
- `tests/milestone18-15c-paladin-reactions-browser.py` exercises real character creation, combat UI, local save/reopen and mobile width.
- `package.json`, `CHANGELOG.md`, `README.md` and this document updated for checkpoint clarity.

## Sources and rights

Original behavior and explanatory summaries were verified against the supplied 2024 *Player's Handbook* (Paladin and subclass features, printed pp. 113–117), with the publicly available D&D Beyond 2024 Basic Rules / SRD 5.2.1 for Oath of Devotion. This app does **not** bundle the user's PHB PDF or proprietary sourcebook passages, and does not silently import unlicensed third-party compendiums. Publication metadata in the audit registry remains **read-only**.

## Tests and current limitations

- `npm test` — **474 / 474 passed** (462 baseline plus 12 new).
- `python tests/milestone18-15c-paladin-reactions-browser.py` — **passed**.
- `python tests/milestone18-15-phb-paladin-browser.py` — **passed**.
- `python tests/milestone17-sources-browser.py` — **passed**.
- `python tests/milestone18-15b-rules-registry-browser.py` — **passed**.
- `python tests/browser-smoke.py` — **passed**, including Pip isolation and existing spell/weapon flows.
- `npm run audit:rules` — read-only; still **562** catalogue records, **5** Paladin identities explicitly source-reviewed, **519** requiring further version review, **38** lacking complete source dates.

**Not yet automated:** accurate target range and creature conditions, ally aura updates, creature/DM actions, strict per-turn Bonus Action timing and spell-slot limits, full level-1–20 advancement choices, most non-SRD spell effects, the remaining subclass capstone triggers and interactions, and multiclassing. Glorious Defense's counterattack, Living Legend's reroll and unerring hit, and several other Paladin features remain partial/manual.

### Next Paladin work

Continue with remaining level-gated Paladin mechanics and choices, especially class-level Abjure Foes and Divine Sense state verification, Glory's Living Legend and Glorious Defense follow-up attacks, Vengeance's Relentless Avenger and enemy fear triggers, plus action-economy consistency. Complete a checklist for every Paladin level and each subclass before claiming the class is fully implemented. Keep the version-audit registry non-destructive until canonical mappings and migrations are reviewed.
