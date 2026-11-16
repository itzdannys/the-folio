## 18.30.1 — In-person Play Alignment (2026-11-16)

Physical dice are now the default: manual initiative entry; equipped weapon Attack details with roll-free ammunition/throw tracking; separate record-only Second Wind, Tireless and Wholeness of Body; digital class attack and heal tools grouped under optional expandable panels. All source packs, PHB 2024 content, existing characters, and local storage structures retained. See `docs/MILESTONE_18_30_1_IN_PERSON_PLAY_ALIGNMENT.md`.

## Milestone 18.30 — PHB 24 Feats (2026-11-16)

- Continues from the full Milestone 18.29 application. The feat catalogue now contains all **42 General feats**, **10 standard Fighting Style feats** (plus Paladin/Ranger class alternatives), **12 Epic Boons**, and previously signed-off Origin feats; older source packs and homebrew remain available.
- Character-builder feat milestone selections support prerequisites, +1 ability-score choices, Epic Boons at level 19, class Fighting Style choices, the Resilient saving throw, safe level-down/level-up and saved choices. All feat cards on Features & Traits start collapsed to keep the page readable.
- Added interactive feat options for Fey-Touched, Shadow-Touched, Ritual Caster, Skill Expert, Keen Mind, Observant, Weapon Master, Elemental Adept (including repeated selections), Boon of Skill, and Boon of Energy Resistance. Feat spells use the existing Spellbook, not a separate spell store; free casts consume their own rest-tracked resources.
- Added usage and recovery for Charger, Crusher, Grappler, Piercer, Slasher, Shield Master, Mage Slayer, Chef, Durable, Inspiring Leader, Poisoner, Telekinetic, defensive Fighting Styles and Epic Boons. Boon of Recovery Last Stand runs through the incoming-damage dialog; Heavy Armor Master supports a confirmed qualifying hit. Medium Armor Master is reflected in equipped AC. Passive Speedy / Boon of Speed, Fortitude, truesight, blindsight, skill and resistance benefits update the existing sheet.
- Player/DM confirmation remains required for target/enemy saves and movement, conditions, battlefield positions, exact combat triggers, and third-party content. Spell effects and various passive combat interactions outside the Folio character are not claimed as automatically adjudicated; see `docs/MILESTONE_18_30_FEATS_2024_PHB.md`.
- Verification: **983/983 Node tests**, **17 targeted Chromium browser suites** (12 classes plus rules registry, 18.27 UI polish, species, backgrounds and feats), **648 catalogue records / zero version conflicts** in the read-only audit. Full application and Windows launcher retained. Clean-ZIP extraction and tests are documented in the release audit.

## Milestone 18.29 — 2024 PHB Backgrounds & Origin Feats (2026-11-16)

- Continued from the 18.28 full application. The sixteen 2024 PHB backgrounds now have full builder integration for eligible score increases, skills, fixed/selected tools, granted Origin feats, and either bundled starter equipment/currency or 50 GP. Starter items are awarded once; re-editing does not silently duplicate/remove equipment.
- Implemented active character-sheet controls and saved options for Alert, Crafter, Healer, Lucky, Magic Initiate (Cleric/Druid/Wizard), Musician, Savage Attacker, Skilled, Tavern Brawler and Tough. These integrate with inventory, spellcasting, used charges, Long/Short Rest and tracked turns as applicable; DM-controlled effects still require confirmation.
- Added a dedicated Background & Origin builder area and a styled expandable Features & Traits Origin panel. Origin spell saves/attacks respect the chosen INT/WIS/CHA feat ability; existing PHB 24 source names remain unified in user-facing spell references.
- 953/953 Node tests, 16 named Chromium suites, and read-only registry audit passed (603 candidate rules records; zero version conflicts, 560 records needing manual source/version confirmation). The full ZIP is checked from a clean extraction before release. The original Windows launcher, local saves, Pip, campaigns, homebrew, all classes, Species & Traits and backups are retained.
- Detailed scope, checks and limits: `docs/MILESTONE_18_29_BACKGROUNDS_ORIGIN_FEATS_SIGNOFF.md`.

## Milestone 18.28 — Species & Traits (2024 PHB), unified source labels and incoming-damage UI (2026-11-16)

- All ten 2024 Player's Handbook species now have interactive and explanatory Species & Traits panels on the character-sheet Features page, preserving the earlier optional book-reference species in the builder.
- Added persistent active ability and rest tracking, 2024 PHB ancestry/lineage selections, shared Spellbook integration for species spells, resistance/HP/Speed calculation hooks and DM-confirmed creature outcomes. Human can record an extra Origin feat; Elf/Gnome/Tiefling can select a species spellcasting ability; High Elf can record a replacement cantrip.
- Removed remaining visible SRD source wording from core dialogs while retaining separate attribution/licensing identifiers in data and legal documentation. Standard PHB subclasses such as Oath of Devotion now show **PHB 24**.
- Redesigned the Incoming Damage popup into clear grouped controls and responsive resistance/vulnerability/immunity tiles, without refilling the HP bar.
- Verified 936/936 Node tests and 15/15 targeted Chromium suites including all earlier PHB classes, save/reopen, other-book species, source labels and mobile layout. Clean extraction is covered in release audit.
- Player/DM confirmation remains necessary for unknown enemy events and some external spell/feat effects; do not treat this as multiplayer simulation or all-book completion. See `docs/MILESTONE_18_28_SPECIES_2024_PHB_SIGNOFF.md`.

## Milestone 18.27 — Interface polish, source-label cleanup, and class-scoped builder (2026-11-16)

This release is based directly on the complete 18.26 Wizard release. It does not add new rule content or change the ruleset. The app remains offline-only, with the original `Open The Folio.cmd` launcher and existing character, campaign, homebrew, spell, artwork, and backup systems.

- Damage entry: the HP strip keeps only the amount and Damage/Heal/Temp HP actions. The explanation and damage type, manual Resistance/Vulnerability/Immunity switches, and qualified class defenses move into a single confirm-and-apply dialog. The old typed damage rules, Rage, defenses, concentration reminders, Undo and reset-after-use behavior remain.
- Spellbook: advanced filters and grouping controls are collapsed behind **Filters & grouping**; the main view tabs and spell rows stay accessible. Filter settings can be cleared, and switching between tabs retains the chosen controls.
- The former top-level **From Homebrew** button is now under **+ Custom spell**, alongside **Create custom spell**.
- Public-facing spell, subclass, species, builder and source selectors normalize the two modern source labels `srd-2024` and `phb-2024` to **PHB 24**. The underlying IDs, license text and rules provenance remain distinct and unmodified: SRD 5.2.1 is open rules, while handbook-only references do **not** ship proprietary text.
- Removed the misleading **Pip’s personal list** publication-source choice from the Paladin preparation/source menus. Pip-specific spell choices remain character-scoped as they were; their origin is not falsely treated as a published sourcebook.
- Character creation and build editing restrict subclass choices to the currently selected class. Changing class refreshes the available list and clears an incompatible previous subclass. Custom class-specific subclasses remain eligible.
- Added `tests/milestone18-27-polish-browser.py` for those flows and updated existing browser regressions for the new damage confirmation, source-list, and collapsed-filter UX.

**Limits:** Purely a UI/label update. The app does not assert that the open SRD and the proprietary PHB are the same legal source. Actual third-party/PHB-only text is not embedded; GM-controlled enemy outcomes remain confirmation-assisted. Multiclassing and broad rules-source auditing remain separate work. Back up browser-local saves before changing the launch folder.

## Milestone 18.26 — Wizard 2024 PHB single-class sign-off (16 November 2026)

- Completed Wizard level 1–20 sheet support and all four 2024 PHB schools: Abjurer, Diviner, Evoker, Illusionist, building on 18.25 without replacing existing characters or classes.
- Added persistent distinct Wizard spellbook, research/copy/Savant choices, prepared restrictions, ritual casting, Scholar Expertise, Short Rest Arcane Recovery and Memorize Spell, Spell Mastery and Signature Spells. Legacy Wizard selections are preserved in a migration-safe book record.
- Added the four schools’ interactive combat and resource mechanics and integrated them with the existing spellcasting dialog and confirmations. Fixed Signature Spell Short Rest recharge, Counterspell/Dispel always-preparation, rest and optional turn action budgets.
- **923/923 Node tests, 13/13 targeted Chromium browser suites** and source-registry audit pass. Registry has 603 entries, zero version conflicts/duplicate revisions, and 560 pending manual source checks. Full standalone ZIP cleanly extracted and retested.
- Scope and DM-controlled exceptions documented in `docs/MILESTONE_18_26_WIZARD_2024_PHB_SIGNOFF.md`. **All 12 2024 PHB classes have class-sheet sign-offs.** Multiclassing and complete creature/PHB spell automation remain separate future goals.

## Milestone 18.25 — Warlock 2024 PHB single-class sign-off (16 November 2026)

- Built directly on 18.24. Implemented Warlock levels 1–20, four official patron subclasses (Archfey, Celestial, Fiend, Great Old One), all 28 PHB Eldritch Invocations, Pact of the Blade/Chain/Tome, Pact Magic, Mystic Arcanum, Magical Cunning, Eldritch Master and Contact Patron.
- Added interactive Warlock panel and Spellbook casting options with bonus/action/reaction tracking, no-slot invocation casts, Pact weapons, Eldritch Blast beams, companion notes, telepathy, healing, defensive resources and DM-confirmed target outcomes. Reused original Fiend and shared spellbook controls.
- Corrected Armor of Shadows and Fiendish Vigor self effects and automatic Celestial Radiant Soul / Great Old One Thought Shield resistances; retained original library, Pip, campaigns, homebrew, autosave, appearance, dice roller and Windows file launcher.
- **896/896 Node tests**, **12/12 Chromium scripts** (11 earlier class/registry suites plus new Warlock), read-only source audit: **600 entries**, zero version conflicts/duplicate revision IDs, 557 still awaiting source verification. Manual DM outcomes and unlicensed spells/stat-block text explicitly excluded.
- Details and verification: [`docs/MILESTONE_18_25_WARLOCK_2024_PHB_SIGNOFF.md`](docs/MILESTONE_18_25_WARLOCK_2024_PHB_SIGNOFF.md). **11 of 12 PHB classes signed off; Wizard next.**

## Milestone 18.24 — Sorcerer 2024 PHB character-sheet sign-off (16 November 2026)

- Continued directly from full Folio 18.23; implemented Sorcerer levels 1–20 and all four official 2024 PHB origins, preserving offline Windows launcher, characters, campaigns, homebrew, themes, dice roller and backups.
- Added `js/sorcerer-2024.js` and `js/sorcerer-ui.js`: Innate Sorcery spell-attack Advantage, correct Font of Magic minimum levels and slot costs, Short Rest Sorcerous Restoration, ten Metamagic options with real spellbook costs and character choice persistence, Sorcery Incarnate and Arcane Apotheosis.
- Added Aberrant Psionic spellcasting/telepathy/adaptations/implosion; Clockwork Balance/Bastion/Trance/Cavalcade; Draconic AC/HP/affinity/wings/companion; Wild Tides/Surges/Controlled Chaos/Bend Luck/Tamed Surge. Fixed named-PHB-to-generic-SRD aliases for Aberrant granted spells.
- Respects confirmation-assisted DM rulings. Full arbitrary spell effects, creature placements/monster turns, and Wild Magic surge outcomes remain manually adjudicated. Does not bundle the supplied commercial PHB PDF or import mixed-era third-party data.
- **876 / 876 Node tests**; focused Chromium Sorcerer test passes all four subclasses, Spellbook modal, save/reopen and mobile. Read-only registry audit: **597 entries, 0 conflicts/duplicate revision IDs, 554 pending source/version review**.
- See [`docs/MILESTONE_18_24_SORCERER_2024_PHB_SIGNOFF.md`](docs/MILESTONE_18_24_SORCERER_2024_PHB_SIGNOFF.md) for acceptance details and table-confirmed limitations.

## Milestone 18.23 — Druid 2024 PHB character-sheet sign-off (16 November 2026)

- Added complete Druid progression, levels 1–20, and the Moon, Sea and Stars circles alongside preserved Land; 2024 Druidic/Primal Order, Wild Shape/Companion, Wild Resurgence, Elemental Fury and Archdruid.
- Added verified, persistent Beast stat-block entry/eligibility, Moon Wild Shape attack and AC/temporary-HP rules, Sea aura, Stars forms and omen resources; wired class spellbook and weapon attack integration.
- Fixed shared core form AC/Speed, Magician skill bonuses, Stormborn/Full of Stars passive resistance, familiar long-rest expiration and the Druid UI's duplicate confirmation IDs. Preserved previously signed-off classes and saves.
- Automated tests: **853/853 passed**; new Druid browser flow and all nine named cross-class/registry browser checks passed independently. Read-only source audit: **594 entries**, no duplicate revisions or version conflicts. Detailed boundaries: `docs/MILESTONE_18_23_DRUID_2024_PHB_SIGNOFF.md`.

## Milestone 18.22 — Bard 2024 PHB character-sheet sign-off (16 November 2026)

- Implemented Bard levels 1–20 and all four PHB colleges: Dance, Glamour, Lore, Valor; skills, Expertise, Magical Secrets, Bardic Inspiration and combat/Spellbook action budgets.
- Added college controls for inspiration, temporary HP, movement, charm/fear effects, defensive saves, unarmed strike, Lore discoveries and Valor weapon/cantrip interaction.
- Preserved the seven completed classes and all user data. Fixed saved Lore spell choice rebuild, concentration/initiative integration and explicit Valor casting.
- **816/816 Node tests; nine named browser checks passed.** Details and boundaries: `docs/MILESTONE_18_22_BARD_2024_PHB_SIGNOFF.md`.

## Milestone 18.21 — Cleric 2024 PHB (16 November 2026)

- Completed the 2024 single-class Cleric **character-sheet** pass, levels 1–20, Life/Light/Trickery/War domains, Divine Order, Channel Divinity, Blessed Strikes, Divine Intervention and domain action/resource systems.
- Added locally tested, confirmation-assisted Cleric controls and level-gated domain spells without replacing characters or the existing spellbook.
- Verified 783/783 automated tests and 8/8 named browser checks. See `docs/MILESTONE_18_21_CLERIC_2024_PHB_SIGNOFF.md` for exact scope, manual effects, and test boundaries.

## Milestone 18.20 — 2026-11-16: 2024 PHB Ranger character-sheet sign-off

- Implemented Ranger levels 1–20 class-sheet features on the existing Folio engine; added the three missing 2024 subclasses Beast Master, Fey Wanderer and Gloom Stalker alongside Hunter; added Druidic Warrior Ranger-only option.
- Added Ranger action/spell budget and attack integration; Beast companion forms, commands, strikes, recovery and Share Spells; Fey psychic strikes and spell resources; Gloom Initiative and Dreadful Strike; Hunter Superior Prey and corrected Horde Breaker.
- Preserved characters, Pip, campaigns, offline saves, source/version registry and previous class systems. No copyrighted external JSON source data auto-imported.
- **758 Node tests and seven Chromium browser suites passed.** Ranger status is signed off only for the existing 2024 PHB **single-class sheet workflow**; DM-owned creatures, multi-character battles, all spell effects, multiclassing and all-sourcebooks version review remain out of scope. See [`docs/MILESTONE_18_20_RANGER_2024_PHB_SIGNOFF.md`](docs/MILESTONE_18_20_RANGER_2024_PHB_SIGNOFF.md).

## Milestone 18.19 — 2026-11-16: 2024 PHB Monk character-sheet sign-off

- Implemented the single-class 2024 Monk 1–20 and the four subclasses Mercy, Shadow, Elements, Open Hand using the existing Folio architecture; did not replace characters, the database or storage.
- Added tracked Monk turns, Action/Bonus/Reaction budgets, Flurry/Unarmed Strike rolls and healing replacements, Monk weapon Stunning Strike, subclass Focus mechanics, timed abilities, self-restoration, resistance, level-20 scores, and level-14 saving throw proficiency. Preserved existing Open Hand features and local source audit.
- Fixed a shared weapon-dialog rendering error that initially affected the Fighter regression after adding the Monk form; Fighter and Monk browser checks pass after the fix. Also fixed Shadow Step follow-up/turn cleanup, once-per-turn Darkness movement, and Mercy self condition removal.
- **728/728** Node tests passed. The 2024 Monk browser suite and retained class regression checks passed; see [`docs/MILESTONE_18_19_MONK_2024_PHB_SIGNOFF.md`](docs/MILESTONE_18_19_MONK_2024_PHB_SIGNOFF.md) for capabilities and remaining table-controlled outcomes. Read-only audit counts 581 entries, zero conflicting revision IDs.

## Milestone 18.18 — 2026-11-15: 2024 PHB Rogue character-sheet sign-off

- Completed Rogue single-class progression and built-in 2024 subclasses: Arcane Trickster, Assassin, Soulknife and Thief.
- Integrated Sneak Attack, turn budget, subclass-specific combat/resources, magic/item handling and confirmed enemy outcomes.
- 704 automated tests passed; new Rogue, Paladin, Fighter and Barbarian browser tests passed; source-manager browser smoke not completed.
- Preserved existing Folio character data, offline storage and other classes. See [`docs/MILESTONE_18_18_ROGUE_2024_PHB_SIGNOFF.md`](docs/MILESTONE_18_18_ROGUE_2024_PHB_SIGNOFF.md).

## Milestone 18.17 — 2026-11-15: 2024 PHB Barbarian class-sheet sign-off

- Audited and integrated the Barbarian class levels 1–20 and all four revised PHB paths: Berserker, Wild Heart, World Tree and Zealot. Retained the existing Rage, Reckless Attack, Berserker and Brutal Strike implementations; added reusable duration, turn/action, subclass resources and confirmed external-effect logic.
- Added World Tree Vitality/Branches/Battering Roots/Travel, Zealot Divine Fury/Warrior of the Gods/Fanatical Focus/Zealous Presence/Rage of the Gods, and Wild Heart Rage/Aspect/Power choices with relevant self-stat effects and rituals. Implemented weapon and unarmed attacks, shared turn/reaction costs, and World Tree teleport with Rage activation.
- Extended level-20 Primal Champion attribute derivation and skill progression; preserved autosave, imports/exports, Pip, campaigns and homebrew. No proprietary external data imported.
- **669/669 automated tests** and six named Chromium browser suites passed. Read-only registry: 575 entries; zero duplicate revision IDs/conflicts; 532 still awaiting manual source/version review.
- Scope: signed off **2024 PHB single-class Barbarian sheet features**, not an autonomous creature simulator or complete legacy/new sourcebook and multiclass support. See [`docs/MILESTONE_18_17_BARBARIAN_2024_PHB_SIGNOFF.md`](docs/MILESTONE_18_17_BARBARIAN_2024_PHB_SIGNOFF.md).

## Milestone 18.16C — 2026-11-15: 2024 PHB Fighter character-sheet sign-off (all four subclasses)

- **Scope signed off:** 2024 *Player’s Handbook* single-class Fighter levels 1–20, Champion, Battle Master, Eldritch Knight, and Psi Warrior. Verified class progression and the existing shared mechanics, with remaining creature outcomes explicitly confirmed by players/DM. This is not a creature/encounter simulator or an all-sourcebooks/multiclassing sign-off.
- Connected Battle Master **Precision Attack** to actual missed weapon attacks; **Riposte** to actual Reaction weapon attacks; **Sweeping Attack** to an eligible secondary target with its own AC; **Feinting/Lunging Attack** damage and advantage to confirmed strikes; **Commander’s Strike** to one replaced Attack-action attack and a confirmed ally Reaction; **Student of War** to persistent skill/tool proficiencies; and self Evasive Footwork/Bait AC and Rally temp HP to existing derived-stat and resource systems. All 20 maneuver options remain available; effects on other creatures still require table confirmation.
- Connected Eldritch Knight's **War Magic / Improved War Magic** to the existing Spellbook and Wizard spell access, using **one atomic cast/slot/Attack-action transaction**. Fixed subclass lookup for newly created characters whose subclass is saved in `build`; kept the old button as an actual Spellbook shortcut. Eldritch Strike's target-save Disadvantage expires correctly.
- Connected Psi Warrior **Telekinetic Thrust** to an actual, recent Psionic Strike and confirmed Strength saving throw; Telekinetic Movement's free use now refreshes correctly at a Short Rest. Telekinetic Master bonus weapon attacks while concentrating, Magic-action limits, and temporary Bulwark/Leap protections use the shared tracked-turn economy and self defense calculations.
- Fixed Fighter turn/Reaction/Studied Attacks edge cases and an existing HTML-escaping issue that rendered apostrophes in Artisan tool names as `undefined`, discovered by Chromium tests. Preserved existing Paladin, Pip, campaign folders, homebrew, autosave, backups, interface and offline architecture. No raw externally uploaded copyrighted rules database was imported or redistributed.
- **634/634 automated Node tests passed** (27 18.16C cases added on top of 607 inherited). New 18.16C Chromium test and previous Fighter 18.16A/B, Paladin 18.15I, Rogue 18.6, source registry 18.15B, and M17 source pack browser tests passed. Clean-archive tests documented in `TESTING.md`. One older extended broad smoke check was not included in this verified set.
- Rules audit: **572** current catalogue entries; zero detected revision-ID duplicates/conflicts, **529 still awaiting manual publication/revision provenance confirmation**. This is a separate database-wide goal, not a claim of all-official-content completion.
- See `docs/MILESTONE_18_16C_FIGHTER_2024_PHB_SIGNOFF.md` for level-by-level scope, full mechanics/manual split, and verification evidence.

## Milestone 18.16B — 2026-11-15: Fighter weapon-linked maneuvers + Psi Strike (PARTIAL)

- Connected seven supported Battle Master on-hit maneuvers and Psi Warrior Psionic Strike to weapon attack resolution and resource spending, with critical hit dice rules, once-per-turn checks and target confirmations.
- Added a read-only audit script for the user-supplied `dnd-data-main.zip` (33,983 source records; mixed 2014/2024/third-party provenance). Raw copyrighted source descriptions are not redistributed or imported by default.
- **607/607** Node tests passed; **7 completed** browser suites passed (new and regressions). A broad browser smoke test stalled and was not counted. Fighter remains **PARTIAL**; see `docs/MILESTONE_18_16B_FIGHTER_ATTACK_LINKS_AND_DATA_AUDIT.md`.

## Milestone 18.16A — 2026-11-15: 2024 Fighter subclass mechanics (PARTIAL)

- Added Battle Master, Eldritch Knight and Psi Warrior as 2024 PHB Fighter builder options; retained Champion and the previous Paladin sign-off.
- Implemented tracked Fighter attacks, Action Surge turn budgets, Studied Attacks, Tactical Master, 20 selectable Battle Master maneuvers with Superiority Dice and Relentless, Psi Energy/abilities and Eldritch Knight weapon-bond and War Magic records. Enemy/ally decisions remain confirmed inputs.
- Fixed Fighter browser event reference, shared Reaction resets, Studied Attacks target preservation and legacy registry-browser expected count.
- **593/593** automated tests passed; **7 completed** browser regressions passed; two other long-running scripts stalled and are not counted. Rules registry: 572 entries, 0 revision ID duplicates/conflicts.
- **Fighter is not yet fully signed off**. See `docs/MILESTONE_18_16A_FIGHTER_2024_PARTIAL.md`.

## Milestone 18.15I — 2026-11-15: 2024 PHB Paladin character-sheet sign-off (four oaths)

- **Scope signed off:** 2024 PHB Paladin levels 1–20, four 2024 PHB oaths (Devotion, Glory, Ancients, Vengeance) for supported offline character-sheet mechanics. This is **not** a general encounter simulator, and not all older un-revised official subclasses or spells from other books are imported.
- Finished timed Paladin combat effects: Divine Sense, Sacred Weapon, Peerless Athlete, Vow of Enmity, Holy Nimbus, Living Legend, Elder Champion and Avenging Angel now expire after verified combat-round counts. Elder Champion heals at the appropriate tracked turn start; timers persist on save/reopen. Out-of-combat time still follows the table.
- Completed all eleven 2024 Paladin Fighting Style choices (including Blessed Warrior): new styles Blind Fighting, Dueling, Interception, Protection, Thrown Weapon Fighting, Unarmed Fighting. Dueling, Thrown, Great Weapon Fighting and Unarmed attacks resolve damage; Interception and Protection use the shared Reaction; grapple-turn damage is guarded. Fixed an existing versatile d10 damage-die parser issue found during testing.
- Faithful Steed now maintains a local Otherworldly Steed record after a successful Find Steed cast: form/type, correct spell-level AC/HP/flight thresholds, confirmed HP changes, dismissal/recast, local persistence. The spell's resource and casting cost are still spent using the existing Folio spell system.
- Reference spells with unknown times now require an explicit sourcebook-verified casting-time selection during tracked combat rather than silently bypassing action accounting; untracked out-of-combat behavior remains unchanged.
- Preserved existing characters (including Pip), style/customization, homebrew, local autosave and backups, campaign folders, offline architecture, and existing registry/migrations. No sourcebook content overwrites; registry stays a read-only audit pending source/version verification.
- Verification: **572/572** automated Node tests (18 new 18.15I sign-off cases, 554 inherited); nine Chromium browser suites passing (18.15I, 18.15D–H, 18.8 Paladin, M18 batch, M17 source pack); 569 rules candidates inventoried with **0 version conflicts** or duplicate revision IDs. Clean-extract verification recorded in `TESTING.md`.
- **Intended manual/table boundary:** DM-controlled enemy HP, movement, line of sight, positions, saving throws, allies' conditions, mount's actions, complete per-spell effects, concentration adjudication, and options whose complete text is not licensed/imported. Multiclassing and all-sourcebook/latest-options integration remain later project work, not falsely marked complete.
- See `docs/MILESTONE_18_15I_PALADIN_SIGNOFF.md` for feature-level verification and limitations.

## Milestone 18.15H — 2026-11-15: Comprehensive Paladin combat/feature pass (PARTIAL external automation)

- Added opt-in tracked Attack/Extra Attack and weapon Light/Nick/ordinary Opportunity Attack roles; fixed Attack action claiming when using Vow of Enmity or Sacred Weapon.
- Implemented Unarmed Strike damage, Radiant Strikes, confirmed-hit Divine Smite, Grapple and Shove saving-throw outcomes using the existing action/reaction/slot budget.
- Added enemy-event calculators for Ancients Nature’s Wrath initial/repeat saves, Elder Champion enemy Disadvantage and Swift Spells; Devotion Holy Nimbus enemy-turn damage; Vengeance Avenging Angel enemy fear/duration handling. Added Glory ally Aura of Alacrity speed calculations and displayed enemy-effect results.
- Added Paladin-specific Blessed Warrior level-2 style choice, two Cleric cantrips and level-up-only cantrip replacement; restricted this class option from generic feat choices.
- Preserved compatibility with old untracked attack records and all other class attacks; fixed a UI namespace error and duplicate checkbox name discovered by browser regressions. No sourcebook imports, save-format changes, or online requirement.
- **554/554 automated tests passed**, new browser suite and earlier Paladin/source browser regressions passed; read-only rules registry inventories 563 records, with only five Paladin/oath version identities reviewed.
- Still incomplete: automatic enemy/ally sheets and turns, comprehensive spell-effect automation, multiclassing and all-sourcebook/latest-option coverage. See `docs/MILESTONE_18_15H_PALADIN_COMPLETION_AUDIT.md`.

## [2.0.0-alpha.18.15g-paladin-turn-budget-partial] — Tracked Paladin turn budget (NOT complete)

- Added optional Action/Bonus Action/Reaction and slot-based casting limit enforcement for covered Paladin abilities, plus initiative/manual turn resets. Existing saves, character sheets, and offline operation remain intact.
- Linked recognized Paladin spell casts and Vengeance Hunter's Mark to the same turn ledger, along with confirmed Divine Smite, Lay On Hands, Divine Sense, Abjure Foes, and selected oath powers. Unknown spell timing and general weapon Attack actions remain manual.
- **529/529** automated tests passed; seven specific Chromium browser checks passed including the new UI/save/mobile/spell-casting test. Broad legacy Paladin browser check stalled; not counted. Rules version registry remains read-only.
- Detailed functionality and limits: `docs/MILESTONE_18_15G_PARTIAL_PALADIN_TURN_BUDGET.md`.

## [2.0.0-alpha.18.15f-paladin-ally-aura-partial] — Ally auras and Paladin self-aura guards (NOT complete)

- Added level-gated Paladin ally aura calculators for saving throws, Devotion Half Cover, Ancients Warding resistance, and Courage/Devotion condition immunity, with range validation and non-stacking checks.
- Corrected self Aura of Protection / Devotion Half Cover at 0 HP; own Aura of Courage now blocks Frightened while active.
- The existing UI and character save schema are preserved. Enemy/ally effects use player-confirmed inputs; no imaginary party-wide HP/conditions.
- **517/517** Node tests passed (16 new); eight relevant Chromium browser suites passed. Paladin, shared action economy and official-all-book rules are **still partial**.
- Details: `docs/MILESTONE_18_15F_PARTIAL_PALADIN_ALLY_AURAS.md`.

## [2.0.0-alpha.18.15e-paladin-channel-reroll-partial] — Paladin shared Channel Divinity and Glory save rerolls (NOT complete)

- Added 2024 base-Paladin **Divine Sense** controls with actual shared Channel Divinity expenditure, detection-state persistence, manual end, rest/condition/damage-to-zero termination and activation guards.
- Added 2024 level-9 **Abjure Foes**: validate eligible target counts and visibility confirmations, consume Channel Divinity, compare target Wisdom save totals with actual Paladin spell DC, display individually recorded outcomes. Enemy statuses are DM-managed.
- Added Glory level-20 **Living Legend saving-throw reroll** through existing dice roller and saving-throw bonuses. Tracks shared Reaction cost, requires a previously failed save, and mandates new result.
- 13 new focused tests, **501/501 total passing**; seven Chromium browser regression scripts passed including save/reopen, source registry, Pip and mobile. All older character/profile/homebrew/local-storage schemas retained.
- Full Paladin implementation, all-book content and runtime source-version switching are **NOT complete**. See `docs/MILESTONE_18_15E_PARTIAL_PALADIN_CHANNEL_AND_REROLL.md`.

## Milestone 18.15D — 2026-11-15: Paladin follow-up attacks (PARTIAL)

- Connected Glory Glorious Defense counterattack, Glory Living Legend Unerring Strike, and Vengeance Relentless Avenger to the real weapon roller with resource/Reaction guards, persisted state and trigger confirmations.
- Preserved the 18.15B read-only rules audit, Pip, homebrew, offline character storage, and all existing systems. No content imports or source migrations.
- **488/488** Node tests passed, including 14 new cases. The new dedicated browser suite and four earlier targeted browser/source regressions passed. Broad `browser-smoke.py` was not confirmed for this batch.
- Paladin remains **PARTIAL**. See [`docs/MILESTONE_18_15D_PARTIAL_PALADIN_FOLLOWUPS.md`](docs/MILESTONE_18_15D_PARTIAL_PALADIN_FOLLOWUPS.md).

## Milestone 18.15C — 2026-11-15: Paladin reaction and protection mechanics (PARTIAL)

- Implemented Devotion level-15 **Smite of Protection** on real Divine Smite hits: temporary +2 AC and Dexterity saving throws for the Paladin, ending on the next turn (ally effects still manual).
- Implemented Vengeance level-15 **Soul of Vengeance** as a verified-trigger melee weapon Reaction attack in the existing roller, including Advantage, damage, Reaction cost and save/reopen persistence.
- Retained all existing Folio mechanics, local data, source-pack imports, Pip and the read-only version registry. No current builder catalogue replacement or automatic migration.
- Node tests **474/474 passed**; new browser workflow and four existing browser/source regressions passed. **All four oaths and the 2024 Paladin remain incomplete.**
- Detailed implementation and gaps: [`docs/MILESTONE_18_15C_PARTIAL_PALADIN_REACTIONS.md`](docs/MILESTONE_18_15C_PARTIAL_PALADIN_REACTIONS.md).

## Milestone 18.15B — 2026-11-15: read-only version audit integrated

- Integrated the existing rules-registry foundation into the latest 18.15 Paladin build as a separate, non-destructive read-only version audit.
- Added source provenance staging, ID/revision projection, pending review/unknown publication-date reporting, conservative migration previews, and a local `npm run audit:rules` command. No existing rules or character saves were replaced.
- Retained all original 438 Node tests and added 24 for registry and integration (462 passing); three browser smoke suites passed. Paladin and other class mechanics remain partial.

## [2.0.0-alpha.18.15-phb-paladin-batch-partial] — Four 2024 PHB Paladin Oaths (NOT full class/PHB)

- Added Oath of Glory, Oath of the Ancients and Oath of Vengeance as built-in Paladin subclass options. All four Paladin oaths now grant their 10 level-gated oath spells at the correct levels.
- Connected Vengeance Vow of Enmity to target-confirmed attack Advantage, transfer/end state, and oath Hunter's Mark spell-slot/concentration/Force damage on weapon hits.
- Connected Glory Peerless Athlete Advantage, Inspiring Smite temp HP, level-7 Speed, Glorious Defense Reaction/AC, and level-20 Charisma Advantage/activation.
- Connected Ancients Nature's Wrath resources/save DC, Aura of Warding resistance, Undying Sentinel incoming-damage rescue, and Elder Champion once-per-turn HP regeneration/activation.
- Added 25 focused Paladin-oath tests plus interactive Chromium flows and mobile rendering; incomplete enemy, ally and high-level powers remain explicitly manual.
- The complete PHB, complete Paladin, full classes 1–20, other 44 PHB subclasses and all-official-sourcebook support remain unfinished.
- See [`docs/MILESTONE_18_15_PARTIAL_PHB_PALADIN_OATHS.md`](docs/MILESTONE_18_15_PARTIAL_PHB_PALADIN_OATHS.md).

## [2.0.0-alpha.18.14-srd-subclass-batch-partial] — Oath of Devotion, Hunter, Open Hand (NOT full Milestone 18)

- Added actual Sacred Weapon attack bonuses for a chosen held Melee weapon; Oath of Devotion spell grants, Aura of Devotion Charmed protection and a Holy Nimbus resource tracker.
- Added persistent Hunter Prey/Defense choices, damage-typed Colossus Slayer with critical-hit and once-per-turn checks, and Superior Hunter Defense as a temporary typed Resistance.
- Added Open Hand Wholeness of Body, Flurry-triggered technique choices, and Quivering Palm Focus costs, target marker and 10d12 save-dependent damage calculations.
- Repaired subclass choice preservation across Long Rests and timed-effect cleanup on Short Rests; preserved old character saves.
- 17 new focused automated tests (413/413 total) and an interactive three-subclass browser test. Manual-target and incomplete mechanics are documented. **PARTIAL:** full classes, the PHB and all official sourcebooks are still not complete.
- See [`docs/MILESTONE_18_14_PARTIAL_SRD_SUBCLASSES.md`](docs/MILESTONE_18_14_PARTIAL_SRD_SUBCLASSES.md).

## Milestone 18.13 — Partial subclass mechanics (College of Lore, Circle of the Land, Evoker)

- Added Cutting Words and Peerless Skill with Bardic Inspiration and Reaction rules.
- Added Druid land choice, Circle Spells grants, Land's Aid, Natural Recovery and Nature's Ward resistance/Poisoned immunity. The land choice persists through level-up and backup.
- Added Evoker Potent Cantrip, Sculpt Spells and Empowered Evocation calculators, with explicit creature/spell confirmation and no invented enemy effects.
- Added 17 new automated rules tests and browser coverage. **Partial:** not full subclass/PHB/sourcebook implementation.

## [2.0.0-alpha.18.12-subclass-batch-partial] — Three SRD Subclasses (NOT full Milestone 18)

- Added functional Life Domain Preserve Life, Fiend Patron Dark One's Blessing / Dark One's Own Luck / Fiendish Resilience, and Draconic Sorcery Draconic Resilience / Dragon Wings.
- Added level-gated subclass always-prepared spells for these three SRD subclasses, with lawful access to cross-list spells without spending preparation choices.
- Added 12 focused subclass tests and a browser workflow for character creation, persistent resources, healing/resistance, and mobile UI. **379/379** Node tests pass. Other classes/subclasses, full PHB and all-official-sourcebook mechanics remain unfinished.
- See `docs/MILESTONE_18_12_PARTIAL_SUBCLASS_BATCH.md` for precisely what is and isn't implemented.

## [2.0.0-alpha.18.11-batch-partial] — Cross-Class Mechanics Batch (NOT full Milestone 18)

- Added actual Barbarian Brutal Strike choices / dice / once-per-turn validation, plus Relentless Rage save and escalating DC on incoming lethal-but-not-instant-death damage.
- Added shared skill/tool check roller that implements Rogue Reliable Talent, Bard Jack of All Trades, Barbarian Primal Knowledge / Indomitable Might, and Champion Athletics Advantage. Bard untrained skill bonuses also appear in derived skill scores.
- Added Bard Countercharm saving-throw reroll with Advantage and Reaction tracking, including an explicit turn reset.
- Fixed encounter-start initiative to roll a d20 plus modifier, including Barbarian Feral Instinct, Champion Advantage, and selectable Surprise Disadvantage.
- Added 24 dedicated tests, one end-to-end Chromium workflow and cross-release regressions. **367/367 Node tests passed**, and 10 Chromium workflows exited successfully. See `docs/MILESTONE_18_11_PARTIAL_CROSS_CLASS_BATCH.md`.
- No claim of complete class progression, 2024 PHB or all-official-sourcebook support.

## [2.0.0-alpha.18.10-partial] — Barbarian Reckless Attack and Berserker subclass mechanics (NOT full Milestone 18)

- Added working Reckless Attack advantage with first-roll choice validation; Berserker Frenzy applies the correct extra dice and critical doubling once per own turn.
- Added Mindless Rage condition removal/immunity; Retaliation with Reaction costs; Intimidating Presence with valid Wisdom DC and free/Rage resource costs.
- These controls integrate into the real weapon roller, class panel, encounter turn tracking, local character saves and undo. Fixed a stale weapon-roll toast on attacks that spent no resources.
- Added 13 focused rules tests and level 6/14 browser coverage; **343/343 Node tests passed**. Additional earlier browser regressions passed. All listed limitations remain open; see `docs/MILESTONE_18_10_PARTIAL_BARBARIAN_BERSERKER.md`.

## [2.0.0-alpha.18.9-partial] — Functional Fighter and Champion abilities (NOT full Milestone 18)

- Fighter Action Surge now spends an actual class use and enforces once per tracked turn; Indomitable rerolls a failed saving throw with the correct class-level bonus and cost.
- Champion weapon attacks use level-dependent 19–20 / 18–20 critical thresholds, with double damage dice. Initiative uses Advantage; Heroic Warrior Inspiration and Survivor healing trigger once at the start of the tracked player turn.
- Added an independently selectable Champion level-7 Fighting Style in Build & Level, saved across level changes. Defense and Archery calculation bonuses apply automatically if chosen. Defy Death rolls with Advantage and handles the level-18 special 18–20 success.
- Added 11 targeted tests plus a Chromium browser workflow. This is still **partial**: other class and Champion features, the 2024 PHB, and all official sourcebooks remain incomplete. See `docs/MILESTONE_18_9_PARTIAL_FIGHTER_CHAMPION.md`.

## [2.0.0-alpha.18.8-partial] — Usable Paladin Divine Smite, Radiant Strikes, Lay On Hands and spell grants (NOT full Milestone 18)

- Divine Smite now applies its Radiant damage to confirmed Melee-weapon hits (including thrown Melee weapons), with valid spell-slot/free costs, critical hits and Fiend/Undead dice; misses do not spend resources.
- Paladin level-11 Radiant Strikes automatically adds the correct Radiant die to confirmed Melee-weapon hits. Weapon, Radiant Strikes, and Divine Smite damage are separately recorded.
- Lay On Hands now removes Poisoned for a 5-point cost and Restoring Touch removes eligible conditions at level 14+, with real pool spending and no double-counting as healing.
- Divine Smite and Find Steed appear as always-prepared Paladin class grants. Find Steed's free daily cast works in the Spellbook; Divine Smite must use the confirmed-hit weapon flow.
- Added 14 Paladin Node tests and browser end-to-end coverage. **319/319 Node tests** and 11 browser workflows passed. Does **not** complete Paladin features, the PHB, or all official sourcebooks; see `docs/MILESTONE_18_8_PARTIAL_PALADIN.md`.

## [2.0.0-alpha.18.7-partial] — Functional Ranger Hunter’s Mark and class abilities (NOT full Milestone 18)

- Ranger Favored Enemy now casts Hunter’s Mark for free or with spell slots; the Spellbook lists it as always prepared. Target name and concentration are persisted.
- Added marked-target **Force bonus damage** on confirmed weapon hits, including critical dice, level-17 Precise Hunter Advantage, level-20 Foe Slayer d10, and correct separation of damage types.
- Level-13 Relentless Hunter prevents damage-triggered concentration checks for Hunter's Mark. Level-10 Tireless and level-14 Nature's Veil have actual resource and state controls.
- Added 12 focused Node tests and a browser test including Spellbook casting, save/reopen and mobile layout. See `docs/MILESTONE_18_7_PARTIAL_RANGER.md` for manual rules and remaining gaps.

## [2.0.0-alpha.18.6-partial] — Working Rogue Sneak Attack + Cunning Strike (NOT full Milestone 18)

- Integrated Sneak Attack bonus damage into the real weapon-attack roller, including per-turn tracking, advantage/ally rules, Finesse/Ranged eligibility, confirmed hits and criticals.
- Implemented SRD Cunning Strike die costs, saving throw DCs and level-gated choices (Poison, Trip, Withdraw, Daze, Knock Out, Obscure). UI shows effects but doesn't alter the target's character/condition.
- Added 10 focused Node regression tests and a browser test covering Rogue creation, Dagger attack, saved-state reopening and narrow mobile layout. See `docs/MILESTONE_18_6_PARTIAL_ROGUE_ATTACKS.md`.

## [2.0.0-alpha.18.5-partial] — Functional Bard, Fighter and Monk actions (NOT full Milestone 18)

- Bard: spend Bardic Inspiration with correct die scaling and restore an expended use by converting a spell slot using Font of Inspiration at level 5+.
- Fighter: Tactical Mind adds a d10 to a failed ability check; Second Wind is **only spent if the roll succeeds**, otherwise it is preserved.
- Monk: Flurry of Blows, Patient Defense and Step of the Wind have accurate free/Focus costs; level 10+ Patient Defense temp HP is rolled and does not stack. Uncanny Metabolism and Perfect Focus restore resources when the player confirms their initiative triggers.
- Added 15 rule tests, an interactive three-class Chromium test with reopening and mobile layout, and explicit manual/unfinished scope in `docs/MILESTONE_18_5_PARTIAL_CLASS_ACTIONS.md`.

## [2.0.0-alpha.18.4-partial] — Three usable SRD class abilities (NOT full Milestone 18)

- Implemented Wizard Arcane Recovery after Short Rest: select an atomic combination of spent slots with the SRD total-level budget, maximum level 5, no recovery above normal slot capacity, once per Long Rest.
- Implemented Druid Wild Resurgence (level 5): spend a slot to regain an empty Wild Shape pool, or once per Long Rest spend a Wild Shape use to create a level 1 slot. The once-per-turn restriction remains player-tracked.
- Implemented Cleric Divine Spark (level 2): spend Channel Divinity, roll correctly scaling d8s, choose healing or Radiant/Necrotic damage and record the target's Constitution save DC and half-on-success damage. It **does not heal the Cleric** because SRD 5.2.1 specifies another creature; applying the result to the target remains manual.
- Added unit and browser checks for use limits, level scaling, validity, no cross-class leakage, save/Undo-compatible state and mobile layout. Scope is still a partial rules engine, not a finished 2024 PHB or all-sourcebook content library. See `docs/MILESTONE_18_4_PARTIAL_CLASS_ABILITIES.md`.

## [2.0.0-alpha.18.3-partial] — Class defenses and active Innate Sorcery (NOT full Milestone 18)

- Paladin Aura of Protection now actually modifies self saving throws; Sorcerer Innate Sorcery has a spendable active state and +1 spell save DC.
- Rogue Uncanny Dodge and Monk Deflect Attacks use per-hit, explicitly triggered defensive actions and track a used Reaction. Rogue and Monk Evasion now calculate qualifying Dexterity-save outcomes.
- Kept manual triggers and clear limitations: aura range/ally support, Sorcerer spell-attack Advantage, Deflect redirection, action economy, and reaction reset are not automated.
- 9 new focused Node tests (**260/260 passing**) and eight passing Chromium browser workflows, including 390px mobile testing. Prior features retained. See `docs/MILESTONE_18_3_PARTIAL_CLASS_DEFENSES.md`.

## [2.0.0-alpha.18.2-partial] — Earned class feats, ASI rules and Fighting Styles (NOT full Milestone 18)

- Class-granted feat/ASI awards now have individual saved choices at the correct SRD levels, with Fighter and Rogue bonus milestones. Selected ASIs change scores and downstream calculations, with score caps, repeatable choices and level-down handling.
- Added Fighter/Paladin/Ranger Fighting Style selectors: SRD Archery and Defense bonuses apply automatically, with other style effects manual. Alert and Tough provide limited verified passive effects when granted.
- Fixed auto HP becoming frozen on Build & Level edits; preserved manual HP overrides and Pip's specialist sheet. Implemented feat prerequisite and repeatability checks where verified.
- Added 11 Node tests and Chromium create/edit/reopen/mobile acceptance; prior regressions pass. **251/251 Node tests pass.** All PHB and class/subclass sourcebook mechanics remain incomplete; see `docs/MILESTONE_18_2_PARTIAL_ADVANCEMENT.md`.

## Milestone 18.1 — Typed damage and Barbarian Rage Resistance (PARTIAL; November 15, 2026)

- Implemented typed incoming damage with SRD Resistance/Vulnerability/Immunity order and transparent audit details.
- Barbarian Rage now *actually halves* Bludgeoning, Piercing and Slashing damage while active.
- Added per-hit manual modifiers, temporary HP/concentration integration, Undo and mobile controls.
- Tested 240 Node cases and eight older/new Chromium workflows; the rules engine and PHB remain incomplete.
- See `docs/MILESTONE_18_1_PARTIAL_TYPED_DAMAGE.md` for evidence and missing coverage.

## [2.0.0-alpha.18.0-partial] — Partial class mechanics engine (NOT a finished PHB or Milestone 18)

- Implemented SRD-backed class resource capacities, rest recovery, and actual actions for Fighter Second Wind, Paladin Lay On Hands (self), Warlock Magical Cunning, Sorcerer Font of Magic slot conversions and Sorcerous Restoration.
- Implemented Barbarian Rage resource/state, spellcasting restriction and Strength-weapon damage bonus; Barbarian/Monk Unarmored Defense and several passive movement/attack-count calculations.
- Migrates/retains resource counters in offline saves and per-character backups without changing Pip's protected template. Added 12 Node tests and a four-class Chromium/mobile interaction test. **233/233 Node tests pass**, with previous browser regressions passing.
- **Scope warning:** Many SRD class/subclass features remain manual, all-official-sourcebook and full 2024 PHB coverage remain incomplete; the 91 reference-only spells are unchanged. See `docs/MILESTONE_18_0_PARTIAL_RULES_ENGINE.md` before claiming any content is fully supported.

## [2.0.0-alpha.17.6] — Official supplement spell-name references (local build)

- Added **39 reference-only spells** across *Wildemount* (15), *Strixhaven* (5), *Tasha's* (12) and *Fizban's* (7), expanding the index to **430 distinct entries**: 339 SRD rules records, 52 PHB-only references, and 39 supplement references. Existing IDs and 17 PHB naming aliases are retained.
- Source filters and per-spell reference details display their original book and 2014-era compatibility caveats. Wildemount Dunamancy does not become a general Wizard spell; default picker checks subclass traditions. The current SRD mechanics remain untouched.
- All proprietary spell mechanics remain manual; no copied commercial spell text, pretend action/concentration data or invented rule effects. Personal source-pack imports remain supported.
- Five new automated regression tests (**221/221 passing**) and supplemental Chromium/mobile acceptance; older 17.x/16.x browser workflows remain green. See `docs/MILESTONE_17_6_RELEASE_NOTES.md` and `docs/SUPPLEMENT_SPELL_INDEX_AUDIT.md`. This is **partial official sourcebook coverage**, not completion of every book.

## [2.0.0-alpha.17.5] — Unified 2024 PHB spell index and personal spell references (local build)

- Extended the 339-record SRD 5.2.1 spell catalogue with **52 PHB-only name/level/class reference entries**, yielding **391 distinct spell entries** matching the PHB index. Included 17 PHB ↔ generic-SRD search aliases without double-counting names.
- Added source filtering and explicit `Full SRD rules` versus `Reference only (manual rules)` badges in preparation/Spellbook discovery. Separate reference pages disclose missing casting mechanics instead of fabricating them.
- Local user source packs may now import spell records (spell level, class list, optional manually entered metadata); these appear in the corresponding character classes' catalogue and can be selected. Selected references are preserved as spellbook snapshots if the personal pack is later removed.
- Cast recording can consume a selected spell slot for a reference-only spell, but never automatically starts/stops concentration or applies effects. Check the actual sourcebook before using a reference entry at the table. Existing SRD spells retain original rules and 339 individual guidance notes.
- Added nine focused Node tests and offline Chromium acceptance (source filtering, references, saved spells, manual cast UI, mobile). **216/216 Node tests** and inherited M16/M17 browser regression workflows pass. Sourcebook spells outside the PHB, official errata re-check and full automation remain open work.
- See `docs/MILESTONE_17_5_RELEASE_NOTES.md` and the PHB reconciliation register. Nothing was uploaded to GitHub.

## Milestone 17.4 — Equipment catalogue and armor rule reminders (November 2026)

- Added 144 SRD-based non-weapon catalogue records: armor, shields, tools, equipment packs, foci, instruments, games, ammunition and adventuring supplies, with original short guidance and official costs/weights.
- New searchable Armor, Tools & Gear browser with item Details and non-purchasing Add action. Maintained separate standard weapon catalogue.
- Equipped heavy armor now checks its Strength minimum for the 10-ft speed penalty; stealth disadvantage and armor/shield-training caveats are visibly labeled. Item editor retains catalog armor restrictions and exposes homebrew adjustment.
- Added seven Node regression tests and Chromium mobile/equipment acceptance. Inherited character, sourcebook, Spellbook and artwork workflows pass.
- The sourcebook goal remains all official D&D 5e publications using the latest compatible versions, but only permitted/bundled content is currently available. Full training, crafting, purchases and encumbrance remain later work.

## [2.0.0-alpha.17.3] — Expanded species, trait records and 2025 Eberron Changeling (local build)

- Expanded the builder from nine SRD species to **26 selectable species names**: the original nine SRD entries, 2024 PHB Aasimar reference, all five 2025 Eberron species references (including updated Changeling), four 2026 Ravenloft references and seven Lorwyn references. Non-SRD records provide only short verified identifiers and trait-name metadata, **not installed commercial rules text**.
- Added a readable species detail panel to the character builder with source, creature type, size, speed, individual feature cards, lineage/ancestry choices where known, and eligible skill picks. Reference-only entries missing published numeric movement details require manual entry instead of silently assuming 30 feet.
- Added validated and saved species choices, including two distinct Eberron Changeling Instincts skills, Elf Keen Senses and Human Skillful. SRD Dwarf Toughness now contributes one HP per level to estimated HP; Wood Elf speed and Drow Darkvision are calculated. Full conditional species powers, innate spells and use trackers remain manual.
- Added source-pack support for user-owned **species** metadata with bounded `speed`, `sizes`, `creatureType`, and `traits`. Species selections are snapshotted with the character, so deleting a personal pack does not break its build. Pip's specialist character remains untouched.
- **200/200 Node tests** and **six Chromium workflows** pass, including M17.3 species UI and inherited M17.2/M16/artwork/browser smoke. See `docs/MILESTONE_17_3_RELEASE_NOTES.md` for coverage and caveats.

## [2.0.0-alpha.17.2] — Expanded feats, backgrounds and selectable user sourcebook notes (local build)

- Added metadata for all **16 revised PHB backgrounds**, with 4 SRD entries and 12 clearly labelled PHB references, and increased the builder to **25 feat choices** across Origin, General, Fighting Style and Epic Boon.
- Added selectable +1/+1/+1 background score increases, cap checks, level/score/common Fighting Style prerequisites and distinct background/extra feat recording.
- Added limited sourcebook pack entries to the builder, plus additional official publication reference names, without bundling non-SRD full rules or claiming every official book's options are installed.
- Preserved legacy Pip, previous project data and existing feat IDs. 190/190 Node tests and Chromium M17.2 plus prior regression tests pass.
- See `docs/MILESTONE_17_2_RELEASE_NOTES.md` for remaining limitations.

## [2.0.0-alpha.17.1.1] — One current ruleset (revised Milestone 17.1; local build)

- Replaced the unused 2014/2024 edition selector with a **single revised 2024/SRD 5.2.1 rules baseline**. The bundled SRD can no longer be disabled.
- Kept optional publication references, homebrew metadata-pack import, and library/campaign/character source inheritance. Legacy 2014 user packs are labelled as older references requiring a compatibility review, not an automated rules change.
- Migrated historic 17.1 settings and character backups (`srd-2014` → `srd-2024`, `phb-2014` → `phb-2024`) without changing HP, preparation, spell slots, resources, layout, or undo history; 2014 was never a separate calculation engine in Folio.
- Removed now-misleading 2014-engine warnings and creation blocks. Updated the source manager, migration tests and responsive Chromium checks.
- Newest official option versions are the direction for subsequent catalogue expansions, **not** a claim that full paid book content or every official revision is included today.

## [2.0.0-alpha.16.1] — 339-spell reference guidance (local build; GitHub not updated)

- Added a unique tactical use and caution for **all 339** existing Open5e 2024 SRD spells. The rulebook wording stays visible and distinct from original game advice.
- Every catalogue spell now has a consistent full reference modal, including action/range/components/concentration/ritual metadata, higher-slot scaling, an attack/save cue, and the complete bundled spell text.
- Fixed old Pip-specific Prayer of Healing guidance to match the bundled 2024 version's 1-minute casting time. Made generic catalogue casting-time formatting readable.
- Added `docs/SPELL_GUIDANCE_REGISTER.md`, `docs/SPELL_GUIDANCE_AUDIT.md`, and five automated regression tests; prior M16 and M15.3 browser workflows also pass.
- Limit: this is complete **guidance coverage**, not a guarantee that every spell was independently checked against every official SRD 5.2.1 erratum. Existing preparation rules, spell lists, and saved-set behavior are unchanged.

## [2.0.0-alpha.16] — Spellbook personalization (local build; GitHub not updated)

- Kept the compact **By source** Spellbook as the default, with the existing per-character collapse/expand controls for each group.
- Added **By purpose**, **Folders**, and **Saved sets** views for both Pip and ordinary character-builder characters. Spells can be shown in multiple categories without cloning or changing their rules.
- Added private per-character custom folders/labels and user-assigned purpose tags, with simple File buttons beside each spell.
- Added search and filters for level, school, casting time, concentration, ritual, source and castability. Rows now show prepared/always prepared/cantrip status.
- Added view-only saved spell sets for quick reference (these never change preparation). Existing Pip prepared-spell loadouts continue to work as before.
- Expanded Elementalism's at-the-table details to all five modes, with an official rules link and time limits; show character spell-save DC and spell attack modifier in spell references when applicable.
- New organization data migrates safely from older saves, stays independent across characters, and is included in existing JSON backups. No rules or slot-count changes.
- Validation: **163/163 Node tests**, M16 Chromium UI acceptance (including reload and 390px), inherited Milestone 10 browser smoke. Real Windows `file://` persistence still requires device verification.

## Milestone 15.3 — Token icon shortcut and Sheet layout cleanup

- Added **Use this token as sheet icon** directly beneath the live token preview. It saves the current framed token and artwork settings, returns to the Sheet page, and uses the token beside the character's name instead of the selected emblem (including Pip's butterfly).
- Removed the redundant **Reset layout** button from the normal Sheet page. To reset, choose **Edit layout → Restore default → Save layout**.
- Kept the normal Artwork Studio icon selector, independent library-card artwork settings, and existing user artwork/backups intact. No GitHub changes.

## Milestone 15.2 — Artwork removal persistence hotfix

- **Remove portrait** now persists immediately, so an uploaded portrait does not return after a page reload.
- **Restore book emblem** also saves its removal immediately.
- Other artwork edits remain drafts until **Save artwork**; the app waits for any pending removal before saving those edits.
- Status text confirms that a removal has been saved or reports a storage failure.

## Milestone 15.1 — Artwork & Layout Polish

- Choose the character-sheet icon independently: emblem or saved framed token. The book remains the default.
- Choose what library cards display: portrait, emblem, or token.
- Moved token settings immediately below the live token preview, clarified source descriptions, and added wheel-to-zoom while hovering over the preview.
- Reworked layout dragging to show a destination marker and move on release instead of repeatedly reshuffling panels mid-drag.
- Added Reset layout directly on the normal Sheet page.
- Consolidated six topbar shortcuts into an accessible Options dropdown, keeping Undo visible.
- Preserved existing artwork and layout preferences; new fields default gracefully in older backups. Built-in emblems are embedded for safe token rendering when run from a local file.

# Changelog

Notable project changes are summarized here. Dates are project milestones, not published GitHub release dates.

## [2.0.0-alpha.15] — local development build (GitHub not updated)

- Added **Edit layout** to the main character sheet. Seven panels can be dragged into any of three snap-to columns and reordered with keyboard-accessible directional buttons. Layout changes are opt-in, with Save, Cancel, and Restore Default.
- Each character saves its layout independently, including in library backups and duplicate characters, without adding layout operations to combat Undo history. Collapsed panel preferences stay intact.
- **Changed the default character bookplate to a gold open-book emblem for everyone, including Pip**. The original butterfly remains available as an optional preset in Artwork Studio. Custom uploaded emblems still take priority. The character-library preview and Folio topbar use the matching book branding.
- Added desktop, mobile and migration coverage: 150/150 Node tests and M13, M14 and M15 Chromium acceptance workflows passing. M15 checks real pointer dragging, edit cancellation, saved arrangements, duplicated-character independence, default restoration and 390px responsiveness.
- Scope: seven main Sheet panels; HP/AC banner and separate tabs remain fixed. Card resizing, freely resizable subpanels, and cross-tab layout editing remain potential later features. Offline Windows/browser persistence after a complete restart still requires checking on the user's device.

## [2.0.0-alpha.14] — local development build (GitHub not updated)

- Added the **Artwork Studio** to every character sheet, with offline PNG/JPEG/WebP portrait uploads and an independent custom sheet emblem.
- Added an editable token canvas (circle or rounded-square, ring colour and width, zoom, X/Y sliders and pointer dragging), plus a transparent PNG download.
- Portraits appear on character-library cards; custom emblems appear in the character masthead. The Folio brand uses its book seal; The Folio book is now the default for all characters as of alpha.15; Pip’s butterfly is an optional Artwork Studio preset.
- Compressed artwork and token previews are stored once per library character rather than repeated in the combat Undo stack. Full-library backups, duplicate characters and newer individual-character backups preserve media.
- Compatible with pre-M14 library data and legacy `pip-masquerade-backup` character imports. New individual exports use a media-aware format.
- Added five Node regression tests and a Chromium browser acceptance workflow. 145/145 Node tests and the M14 browser workflow passed.
- Remaining work: standalone portrait cropping/rotation, drag-and-drop file uploads, separate library-thumbnail overrides, and Windows file-origin storage verification.

## [2.0.0-alpha.13] — local development build

- Styled concentration reminder after damage, with pass/fail/later actions and the 2024 DC 30 cap.
- One HP amount field for damage, healing, and temporary HP (0 clears temp HP).
- Character-specific collapsible panel controls, saved locally and included in JSON backups.
- Improved large-coin-value layout and safe-integer protection.
- Generalized spell guidance and character-specific initiative labels.
- Added regression tests for concentration DC and temporary HP.

## [2.0.0-alpha.12] — 2026-11-12

### Added
- Offline 3D polyhedral Quick Roll animation with number-free dice-picker illustrations.
- Windows `Open The Folio.cmd` launcher.
- Reduced-motion handling for the dice animation and updated test coverage.

### Retained
- Multiple characters, campaign folders, character builder, homebrew, spell and weapon catalogues, combat tools, inventory, journal and per-character themes.

### Known limitations
- 3D dice animations do **not** use a rigid-body physics engine.
- Multiclassing and complete class-specific progression remain incomplete.
- Local browser persistence varies by origin; use JSON backups.

## Earlier development milestones

- **11** — Appearance Studio, six presets, custom backgrounds and dice colors.
- **10.1** — Corrected number-free dice reference artwork; clickable Folio logo for Library navigation.
- **10** — Expanded spell/weapon catalogues, casting validation, Quick Roll and reusable homebrew imports.
- **9** — Universal starter builder and reusable homebrew options.
- **8** — Character library, independent saves, optional campaign folders.
- **1–7** — Pip-specific sheet, combat, spellbook, inventory, editor, journal and print flows.

For upcoming work and remaining limitations, see [ROADMAP.md](ROADMAP.md).

## Milestone 17.1 — Former edition preferences & source provenance (superseded by 17.1.1)

- Added Rules & Sources manager: library defaults, per-campaign defaults and per-character overrides/inheritance.
- Added versioned catalogue source metadata, content provenance, implementation flags and reference-only commercial book placeholders.
- Added metadata-only JSON source pack import, validation, backup/merge conflict remapping and deletion.
- Preserved all existing character mechanics and spellbook resources. Explicit 2014 warning: not a rules conversion or supported calculation engine.
- Prevented changing an inheriting character's edition accidentally when moving/deleting a campaign; per-character edition preferences survive normal sheet Undo.
- Added test coverage for rules migration, source pack import, registry indexing, backups, edition inheritance and mobile source manager.
- See `docs/SOURCE_PACKS.md` for the exact scope and known limitations.
