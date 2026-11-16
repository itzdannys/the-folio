# The Folio — Milestone 18.9 (PARTIAL): Fighter and Champion

**Version:** `2.0.0-alpha.18.9-partial` · November 15, 2026. Derived from the actual Milestone 18.8 ZIP. **This is not a finished Fighter class, finished Champion subclass, completed Milestone 18, complete 2024 Player's Handbook, or complete all-official-sourcebooks integration.**

## Implemented and tested

1. **Fighter Action Surge (level 2+):** a button spends an actual Action Surge use and records that it allows an additional **non-Magic** action on the player's turn. A turn flag prevents spending a second use during the same tracked turn even at Fighter level 17 (when two uses exist between rests). The action is reset when the initiative tracker advances back to the player's turn. Class uses replenish on a Short or Long Rest. The app still relies on the player to resolve their extra action, target and timing.
2. **Fighter Indomitable (level 9+):** the player chooses the failed save type, enters the original failed total and DC, and the app rerolls the d20. It adds the relevant calculated saving-throw modifier and Fighter level, spends an Indomitable use, and records whether the **required new result** succeeds. Uses scale at levels 9, 13, 17 and reset on Long Rest. Environmental/temporary modifiers not recorded by Folio must still be checked at the table.
3. **Champion Improved Critical / Superior Critical:** Champion weapon attacks score critical hits on natural 19–20 at Fighter level 3+ and natural 18–20 at level 15+. These rolls now automatically hit and double eligible damage dice in the actual weapon roller, without changing non-Champion classes. **Unarmed Strike resolution is not integrated** with the weapon roller.
4. **Champion Remarkable Athlete:** Champion Initiative uses **two d20 and the higher result**, applying real Advantage when rolling from the tracker. Strength (Athletics) Advantage and moving half Speed without opportunity attacks after a critical hit are described as table-resolved; they are not simulated.
5. **Champion Additional Fighting Style (level 7):** a **second, different** Fighting Style can be selected via Build & Level, persisted, shown in Features, and disabled when leveled below 7. Available Archery and Defense bonuses are actually applied by the corresponding attack/armor calculations. Other Fighting Style effects are still manual. Level-down preserves the saved selection for later reactivation.
6. **Champion Heroic Warrior (level 10):** at the start of the Champion's **tracked combat turn**, the app grants Heroic Inspiration if it is missing. It does not grant extra instances when Inspiration is already held.
7. **Champion Survivor (level 18):** at the start of the Champion's tracked combat turn, Heroic Rally restores `5 + Constitution modifier` hit points (minimum zero) if HP is positive and no higher than half maximum HP. The same tracked turn is guarded against repeat healing. Defy Death has a button to roll two d20, choose the higher, and treat 18–20 as a natural 20, recovering 1 HP. Death-save counters are updated; further death/stabilization narration stays with the player/DM.
8. **Persistence:** spent resources, class-turn states, feature choices and level-dependent critical hits survive the existing local-save and reopen flow. Existing Paladin, Ranger, Rogue, Spellbook and equipment features were kept.

## Scope limitations and manual requirements

- The encounter tracker is a lightweight turn tracker, not a full combat action-economy simulator. Extra Attack/Action Surge actions, Bonus Actions, other reaction rules, movement, target conditions and enemy HP are **not automatically resolved**. Action Surge's once-per-turn flag resets on tracked player turns; if not using an encounter, the user should track turn changes and manage the class resource carefully.
- Fighter **Tactical Shift, Tactical Master, Studied Attacks** and other conditional features are not fully wired into the attack and encounter system. They remain manual or descriptive. The Fighter class is **not complete**.
- Champion's **second Fighting Style** works for selection and the specifically implemented Defense/Archery bonuses; the full effects of other styles are not automatically applied. Remarkable Athlete Athletics advantage and post-critical movement remain manual. Champion is **not complete**.
- The official SRD subclass here is Champion; no implication is made that all 2024 PHB Fighter subclasses or other official sourcebook subclasses work. All-sourcebooks coverage remains substantially incomplete.
- Character saves, conditions, and derived bonuses are based on character-recorded data. For Indomitable, table-specific situational modifiers may still need manual accounting.
- Windows local persistence has not been tested on the user's own Windows machine. Back up the Library as JSON and unpack the ZIP into a separate folder to test it.

## Source and testing

Rules: **System Reference Document 5.2.1**, Fighter and Champion, pp. **47–49**, CC BY 4.0, attribution in `ATTRIBUTION.md`. This document was supplied directly by the user.

- `node --test`: **330 / 330** passing tests (11 focused new tests on Fighter/Champion plus the 319-test baseline).
- `python tests/milestone18-9-fighter-browser.py`: Champion creation, both Fighting Styles, edit persistence, Action Surge, Indomitable, a natural 18 critical at Champion level 18, reopening, and 390px mobile layout; **passed**.
- Ten prior browser workflows passed: 18.8 Paladin; 18.7 Ranger; 18.6 Rogue; 18.5 Bard/Fighter/Monk; 18.4 Wizard/Druid/Cleric; 18.2 advancement; 18.1 typed damage; 17.6 supplements; 16.1 spell audit; 15.3 artwork.
- The release ZIP passed `unzip -t`; the 330-test suite also passed after clean extraction.
