## Current release: 18.30.1 — In-person Play Alignment

The Folio is a **personal offline character manager for physical D&D games**, not a digital encounter engine. Digital dice remain optional. Recommended next: 18.31 multiclass character management; later spell and inventory bookkeeping polish (not virtual tabletop development). See the 18.30.1 audit in docs.

## Milestone 18.30 — 2024 PHB General Feats, Fighting Styles & Epic Boons

All 42 General feats, ten standard Fighting Styles and twelve Epic Boons are selectable in the offline single-class builder, in addition to Origin feats from 18.29. Ability-score increases and prerequisites work through Build & Level; feat choices, resources and outcomes appear in expandable Features & Traits cards, and compatible spell grants use the Spellbook. Confirmed defensive feats integrate with Incoming Damage, and deterministic HP/speed/skill/sense/resistance effects update the sheet. 983 automated tests and 17 targeted Chromium suites passed on the working release, with zero registry version conflicts. See `docs/MILESTONE_18_30_FEATS_2024_PHB.md` for what still needs DM adjudication.

**Next proposed stage: 18.31 — Multiclassing.** Remaining outstanding items: complete external spell/creature outcome simulation (not claimed), source/version metadata verification for 605 candidate entries, and other-book content only when validated and permitted. Keep offline, no accounts or hosted services, current launcher, Pip, multi-character folders, campaigns, homebrew, appearance and backups.

## Milestone 18.29 — PHB 24 Backgrounds & Origin Feats sign-off

All sixteen PHB 24 backgrounds now have complete single-class builder selection, associated tools, starting equipment A / 50 GP B, and an interactive Origin-feat panel. Lucky/Magic Initiate/Crafter/Healer/Musician/Skilled/Savage Attacker/Tavern Brawler resources, spell access, inventory and rest/turn tracking are supported where the action is local to the character, and Alert/Tough retain their automatic derived benefits. Other-book choices remain available. Test matrix: 953 Node tests, 16 targeted browser suites and source audit passed. See `docs/MILESTONE_18_29_BACKGROUNDS_ORIGIN_FEATS_SIGNOFF.md` for DM-assisted limitations and exact scope.

**Proposed next milestones:** 18.30 general feats; 18.31 multiclass support; future accessibility/content verification and source consistency.

## Milestone 18.28 — PHB 24 Species & Traits implementation

2024 PHB **ten species integrated for the offline single-class character-sheet scope**: ancestry/lineage choices, active-use counters, rest recovery, relevant passive derived statistics, species spellcasting and a polished Features & Traits panel. The existing other-book species remain selectable in Identity, with their older reference-only boundaries. Visible 2024 source labels consistently read **PHB 24** while internal licensing identifiers remain distinct. Incoming Damage is now a cleaner dialog. See `docs/MILESTONE_18_28_SPECIES_2024_PHB_SIGNOFF.md` for exact capabilities and DM-assisted limitations. Next candidate focus: **backgrounds and origin feats**, followed by general feats and multiclassing.

## Milestone 18.27 — Interface polish complete

The 12/12 2024 PHB **single-class** checkpoint from 18.26 is retained. New changes: uncluttered damage HP bar with manual type/resistance dialog, collapsed Spellbook filter-and-grouping panel, Homebrew spell import grouped under Custom spell, unified **PHB 24** public-facing source labels (internal SRD/PHB IDs and licensing preserved), removed fake **Pip’s personal list** source option without deleting character data, class-specific subclass dropdown in the creation/editor form. Automated and browser regression suites are tracked in `docs/MILESTONE_18_27_UI_POLISH.md`. Remaining roadmap work: multiclassing; 560 candidate rules references requiring source/version verification; deeper automation only when rules are verified; further accessibility/usability improvements. Preserve local-first architecture and backups.

## Milestone 18.26 — 2024 PHB Wizard signed off; class checkpoint complete

**12/12 2024 PHB classes** now have signed-off single-class offline character-sheet implementations. Wizard levels 1–20 includes Abjurer/Diviner/Evoker/Illusionist, a distinct persistent spellbook, spellbook copying, school Savant, Arcane Recovery and all high-level Wizard spell choices, interactive resources and tracked combat turns. **923 Node tests and 13 named browser suites pass.** See `docs/MILESTONE_18_26_WIZARD_2024_PHB_SIGNOFF.md` for manual outcomes and limits. Suggested separate next stages: multiclassing; source/version review (560 unreviewed entries); custom spell/creature automation where authorized and possible; design polish and backups.

## Milestone 18.25 — 2024 PHB Warlock single-class sheet sign-off

**11 of 12 classes now signed off.** Levels 1–20, all four Warlock patrons, 28 Invocations, Pact of Blade/Chain/Tome, Pact Magic, free casting, Mystic Arcanum, original features and save/reopen/mobile browser checks verified. **896 automated tests; 12 browser suites; 600 read-only registry records (557 pending source/version review).** Next: **Wizard 18.26**; multiclassing, all creature/spell resolution and later rulebooks remain separate. See `docs/MILESTONE_18_25_WARLOCK_2024_PHB_SIGNOFF.md`.

## Milestone 18.24 — Sorcerer (2024 PHB single-class character-sheet sign-off)

Sorcerer levels 1–20 and all four 2024 PHB subclasses have interactive class controls, stored resources, Metamagic spellcasting, subclass spells and DM-confirmed outside-creature outcomes. **Next: Warlock and Wizard.** Keep the existing app, Pip, offline saves, campaigns, homebrew, artwork and launcher intact.

**Verification:** `npm test` (876 passing); `python tests/milestone18-24-sorcerer-browser.py` (four subclasses, Spellbook casts, persistence, mobile); read-only registry audit 597 records / zero ID conflicts. Detailed sign-off and manual effect boundaries: [`docs/MILESTONE_18_24_SORCERER_2024_PHB_SIGNOFF.md`](docs/MILESTONE_18_24_SORCERER_2024_PHB_SIGNOFF.md).

## Milestone 18.23 — Druid (2024 PHB single-class sign-off)

**9 of 12 PHB classes signed off:** Paladin, Fighter, Barbarian, Rogue, Monk, Ranger, Cleric, Bard, Druid. Land/Moon/Sea/Stars use the actual Druid class-sheet rules engine, with verified Beast forms, resources, attacks and spellbook integration. See `docs/MILESTONE_18_23_DRUID_2024_PHB_SIGNOFF.md`. 853 automated tests and 10 named browser suites pass; see TESTING.md. Source/version registry remains read-only and contains 551 records requiring manual verification.

**Next:** Sorcerer (all four 2024 PHB subclasses), then Warlock and Wizard. Multiclassing and later books remain separate phases.

## Milestone 18.22 — Bard (2024 PHB single-class sign-off)

**8 of 12 PHB classes signed off:** Paladin, Fighter, Barbarian, Rogue, Monk, Ranger, Cleric, Bard. All Bard levels and Dance, Glamour, Lore, Valor have verified character-sheet mechanics; 816 Node tests and nine browser scripts pass. See `docs/MILESTONE_18_22_BARD_2024_PHB_SIGNOFF.md`.

**Next:** Druid, Sorcerer, Warlock or Wizard in complete class-focused batches. Source/version verification, non-PHB content and multiclassing remain separate.

## Milestone 18.21 — Cleric (2024 PHB single class)

Signed off for the Folio character-sheet scope: Life, Light, Trickery and War domains; level 1–20 mechanics and resources; Spellbook and attack controls; 783 automated tests and eight browser checks. Multiclassing, non-PHB options and full monster/spell effect automation remain separate work. The rules version catalogue remains audit-only.

## 18.20 — 2024 PHB Ranger character-sheet sign-off

Ranger levels 1–20 and Hunter/Beast Master/Fey Wanderer/Gloom Stalker signed off for our offline single-class sheet scope. Companion HP and attacks, expertise/languages, spell/attack budgets, Gloom/Fey damage, initiative, Hunter features, and level-dependent bonuses are integrated and tested. **758/758 Node tests**, seven Chromium suites and the read-only source audit passed. See `docs/MILESTONE_18_20_RANGER_2024_PHB_SIGNOFF.md`. Five prior class sign-offs retained. Next: another unfinished 2024 PHB class; broader source/version review, all spell simulations and multiclassing remain separate work.

Registry: 585 entries; 547 source candidates and 38 pending. The registry does not silently override old saves or activate unaudited sourcebooks.

## Current class completion checkpoint — 18.19 (2024 PHB Monk signed off)

2024 PHB Monk levels 1–20, Warrior of Mercy, Warrior of Shadow, Warrior of the Elements, and Warrior of the Open Hand have integrated Focus/attack/defense/subclass mechanics and verified builder flows. The existing Rogue, Barbarian, Fighter and Paladin sign-offs are preserved. **728/728** automated tests passed. See `docs/MILESTONE_18_19_MONK_2024_PHB_SIGNOFF.md`.

Next: complete another 2024 PHB class; separately validate current publication versions for the broader rules database, multiclassing and arbitrary spell/creature effects. Read-only registry: 581 entries, 538 pending manual source/version review.

## Current class completion checkpoint — 18.17 (Barbarian, signed off for 2024 PHB single-class sheets)

2024 PHB Barbarian levels 1–20 and Berserker/Wild Heart/World Tree/Zealot now have integrated sheet mechanics, level eligibility, resources, damage/conditions tracking and player-confirmed creature effects. Full 2024 PHB *single-class character sheet* scope signed off: **669/669 automated tests** and six relevant Chromium browser checks passed. Fighter 18.16C and Paladin 18.15I retain their sign-offs. See `docs/MILESTONE_18_17_BARBARIAN_2024_PHB_SIGNOFF.md`.

**Next:** Choose another 2024 PHB class not yet complete; separately advance the official source-version review, multiclassing and broader spell engine. The rules registry is still read-only; 532 records await manual publication/source verification. Do not call all-sourcebooks/creature automation complete.

## Current Fighter checkpoint — 18.16C (2024 PHB single-class Fighter signed off)

The Fighter level 1–20 character-sheet progression and all four 2024 PHB subclasses (Champion, Battle Master, Eldritch Knight, Psi Warrior) are signed off for the agreed offline sheet scope. Fighter attack-linked options and spell/action resource use are tested; enemy/ally sheets, tactical movement, DM outcomes and arbitrary spell effects remain table-confirmed. 634/634 automated tests and seven focused browser suites passed. See `docs/MILESTONE_18_16C_FIGHTER_2024_PHB_SIGNOFF.md`.

**Next development priority:** the next 2024 PHB class, while keeping Fighter and Paladin regression checks; 2025–2026 published books, multiclassing and the unreviewed 529 rules-source candidates are separate cross-project phases.

## Current implementation checkpoint — 18.16B (Fighter attack-linked mechanics, PARTIAL)

The existing Fighter subclass and resource engine now resolves seven Battle Master hit maneuvers and Psi Warrior Psionic Strike as part of actual weapon attacks. The external `dnd-data-main.zip` source was audited **without importing** its raw copyrighted descriptions. Next: Precision Attack / other maneuver trigger integration and Eldritch Knight War Magic atomic spell/attack casting, followed by level-by-level verification. Fighter is **not signed off**. See `docs/MILESTONE_18_16B_FIGHTER_ATTACK_LINKS_AND_DATA_AUDIT.md`.

## Previous implementation checkpoint — 18.16A (2024 PHB Fighter, PARTIAL)

Fighter’s four 2024 PHB subclasses are now selectable, with substantial resource, attack and subclass mechanics implemented and tested. Finish atomic Battle Master attack/maneuver integration, Psi hit effects, Eldritch Knight War Magic spell/attack integration and complete 1–20 behavior validation before calling Fighter finished. Paladin 18.15I remains signed off. See `docs/MILESTONE_18_16A_FIGHTER_2024_PARTIAL.md`.

## Current checkpoint — 18.15I (2024 PHB Paladin character-sheet SIGNED OFF)

The 2024 PHB **Paladin base class (levels 1–20) and four PHB oaths** have been through the feature/progression test matrix, dedicated UI smoke tests, save/reopen checks and a final rules audit. Existing mechanics for attacks, auras, smites, class resources and subclass features are now supplemented by timed effects, all Fighting Style choices and a tracked Faithful Steed companion. **Class-sheet implementation is complete for this defined PHB scope**, with DM-confirmed external creature/mount/spell outcomes remaining manual by design. This does **not** certify all official Paladin subclasses from later/older supplements or all spells and multiclass interactions. Detailed evidence: `docs/MILESTONE_18_15I_PALADIN_SIGNOFF.md`.

**Next development priority:** implement Fighter base class and four 2024 PHB subclasses using the same class-completion protocol, while separately extending official rules source/version verification and reusable spell/effect infrastructure.

## Current checkpoint — 18.15H (Paladin feature completion pass; external effects PARTIAL)

The core 2024 PHB Paladin level progression and four 2024 oaths have new shared combat/turn-budget coverage: Extra Attack, Light/Nick/Opportunity, Unarmed Strike, enemy event calculators for Ancients/Devotion/Vengeance, Glory ally speed, Elder Champion Swift Spells, and Blessed Warrior. **Do not treat this as total automated combat or complete official content coverage.** See `docs/MILESTONE_18_15H_PALADIN_COMPLETION_AUDIT.md` for what is implemented and what still needs confirmed DM input. Unit suite: **554/554**; registry: **563 entries**, still audit-only.

Next broader milestones: full spell-effect integration where licensing/data allows, external-entity/companion model, multiclass Paladin integration, verified sourcebook expansion; don't switch class before checking these boundaries against project goals.

**Current checkpoint (18.15F, PARTIAL):** Ally aura resolution for Paladin saving throws, Devotion Half Cover, Ancients typed resistance and Courage/Devotion condition immunity; self Aura deactivates at 0 HP. Remaining Paladin action economy and creature-state effects are **not complete**. See `docs/MILESTONE_18_15F_PARTIAL_PALADIN_ALLY_AURAS.md`.

**Current implemented checkpoint (18.15E, PARTIAL):** Paladin Divine Sense, Abjure Foes and Glory Living Legend save reroll use existing shared Channel Divinity/Reaction and saving-throw calculations. The 2024 Paladin, all subclasses, companion/enemy state and full sourcebook integration are **not complete**. See `docs/MILESTONE_18_15E_PARTIAL_PALADIN_CHANNEL_AND_REROLL.md`.

**Current checkpoint (18.15D, PARTIAL):** Glory Glorious Defense follow-up attack, Living Legend Unerring Strike, and Vengeance Relentless Avenger Opportunity Attack implemented using the existing weapon roller. Source registry remains read-only; Paladin, class progression and entire PHB are **not complete**. See `docs/MILESTONE_18_15D_PARTIAL_PALADIN_FOLLOWUPS.md`.

**Current implemented checkpoint (18.15C, PARTIAL):** Devotion Smite of Protection and Vengeance Soul of Vengeance are now connected to the combat/rules engine, with browser and Node regressions. This does not finish the Paladin class or any oath. See `docs/MILESTONE_18_15C_PARTIAL_PALADIN_REACTIONS.md`.

**Current PHB class-focused increment (18.15, PARTIAL):** Four 2024 PHB Paladin oaths selectable with ten oath-granted spells each; partial working combat and resource support for Glory, Ancients and Vengeance. This does **not** complete Paladin or the PHB. See `docs/MILESTONE_18_15_PARTIAL_PHB_PALADIN_OATHS.md`.

**Previous PARTIAL milestone (18.14):** Oath of Devotion, Hunter Ranger and Warrior of the Open Hand subclass ability batch. Added real attack bonuses, Colossus Slayer damage, Wholeness/Quivering Palm Focus and temporary defense, with persistent class choices. This is not completion of these subclasses, the PHB or all official sourcebooks. See `docs/MILESTONE_18_14_PARTIAL_SRD_SUBCLASSES.md`.

**Latest PARTIAL milestone (18.13):** Connected SRD College of Lore, Circle of the Land, and Evoker subclass mechanics, with class resources, spell grants, saving and targeting safeguards. **Still incomplete:** many base class/subclass mechanics, full PHB and all-book integration. See `docs/MILESTONE_18_13_PARTIAL_SUBCLASS_BATCH.md`.

**Latest PARTIAL milestone (18.12):** Life Domain Preserve Life; Fiend Patron Blessing, Luck and typed Resilience; Draconic Sorcery HP/AC and Dragon Wings; SRD subclass always-prepared spells. **Still incomplete:** healing spell integration, many class/subclass features, target conditions, PHB, and all-book support. See `docs/MILESTONE_18_12_PARTIAL_SUBCLASS_BATCH.md`.

**Latest partial rules-engine build (18.11):** Batch implementation across Barbarian, Rogue, Bard, Champion and shared combat/check math: Brutal Strike, Relentless Rage, Reliable Talent, Countercharm, Jack of All Trades, Primal Knowledge, Indomitable Might, real Initiative rolls, Feral Instinct and Champion Advantage. This is **partial**. The complete 2024 PHB, other base classes/subclasses and all official sourcebooks remain unfinished. See [`docs/MILESTONE_18_11_PARTIAL_CROSS_CLASS_BATCH.md`](docs/MILESTONE_18_11_PARTIAL_CROSS_CLASS_BATCH.md).

**Latest partial rules-engine build (18.10):** Implemented and tested Barbarian Reckless Attack and Berserker Frenzy, Mindless Rage, Retaliation and Intimidating Presence in actual class/weapon controls. Explicit turn confirmation and target/DM decisions remain necessary. **Milestone 18, the full Barbarian class, the PHB, and all-official-sourcebooks support remain incomplete.** See [`docs/MILESTONE_18_10_PARTIAL_BARBARIAN_BERSERKER.md`](docs/MILESTONE_18_10_PARTIAL_BARBARIAN_BERSERKER.md).

# The Folio — Development Roadmap

**Planning baseline:** November 2026. Milestones 13–15 delivered as local alpha builds; later milestones are planned. This document describes planned work, not completed features. Keep the project offline-first, single-user, multi-character, account-free, and browser/local-file compatible unless a later milestone explicitly changes that policy.

## Current implemented checkpoint — 18.15G (PARTIAL)

Paladin has opt-in, test-covered turn-budget checks for documented class Actions, Bonus Actions and slot-based spellcasting. The generic weapon/Attack action model, off-turn spell casting, external creature state, full spell effects, other class completion and latest official sourcebook coverage remain incomplete. The versioned rules registry is still read-only; finish Paladin before the next class. See `docs/MILESTONE_18_15G_PARTIAL_PALADIN_TURN_BUDGET.md`.

## Product principles

1. **Familiar first.** Preserve the standard tabletop character-sheet arrangement as the default. User customization is opt-in, not compulsory.
2. **Per-character identity.** Pip's art, butterfly, Noble Genies rules, and playbook must never leak into unrelated characters.
3. **Rules before automation.** Show source/edition, explain calculations, and permit manual overrides. A feature should not claim to enforce rules it merely displays.
4. **Offline and portable.** No account, cloud sync, hosting, subscriptions, or server requirement. Character artwork, layouts, and custom content must survive full library export/import.
5. **Source-sensitive content.** Use SRD 5.2.1 content with proper attribution. Do not copy non-SRD Player's Handbook, Forgotten Realms, or Eberron text wholesale into a public repository without permission. Offer original summaries, source references, and user-supplied personal entries.
6. **Maintain quality.** Include keyboard accessibility, small-screen compatibility, data migrations, undo where appropriate, and regression tests.

## Existing milestones — maintain, do not rebuild

| Milestone | Baseline | Status / important limitations |
|---|---|---|
| 1–7 | Pip character sheet, combat, spellbook, inventory, notes, print, backup | Existing Pip-focused workflows |
| 8 | Multi-character library, optional campaign folders, unassigned characters | Implemented |
| 9 | Reusable homebrew builder for classes, subclasses, species, feats, spells, weapons and items | Implemented foundation; complex automation missing |
| 10 | 339 SRD spells, 38 weapons, advanced preparation and Quick Roll | Existing catalogue; not entire 2024 PHB |
| 11 | Appearance Studio, presets, custom backgrounds, per-character themes | Implemented; portrait/token tools delivered in M14 |
| 12 | Animated 3D dice, Windows launcher, repository/release hardening | Current alpha; animation is not rigid-body physics |

## Long-term ruleset and sourcebook policy (added November 14, 2026)

The Folio is **not limited to one Player's Handbook**. It will support modular content libraries while preserving its personal, offline-first model. Distinguish these three separate concepts:

1. **Rules baseline:** Use the most current official revised D&D 5e rules (SRD 5.2.1 plus newer official errata where verified). This is **one current rules engine**, not separate 2014 and 2024 modes. Prefer the newest official version of an option; older options remain available only when they have not been superseded and are compatible.
2. **Sourcebooks / expansions:** Choose which licensed or user-entered content packs are visible, e.g. PHB, Tasha's, Xanathar's, Eberron, Forgotten Realms, SRD and third-party/homebrew packs. A toggle controls eligibility and discovery; it does not imply every option in a commercial publication is shipped with the app.
3. **House rules / compatibility:** Permit user-provided, compatible legacy options and house rules as explicitly marked exceptions, with calculation overrides. Do not silently apply outdated mechanics when a newer official version exists.

### Proposed rules and sources settings

- One current-rules engine for newly created characters; globally or per-character configurable `enabledSourceIds`, without an edition dropdown.
- Optional campaign defaults, with visible inheritance and an override choice for each character.
- For every entry (spell, class, feat, species, background, item, feature): a stable ID, title, category, source pack, publication/rules date, compatible editions, license/provenance, dependencies, prerequisites, details, and implementation status.
- Same-named options with multiple published revisions retain **distinct version metadata**, while Folio presents the latest compatible official version by default. Mark unavailable sources without silently deleting saved character selections.
- Source manager shows **Included locally**, **User-entered**, **Reference only**, and **Unavailable** as different statuses. Allow lawful user-created/imported packs with JSON validation, compatibility labels, rollback and backup. Content imported by a user should not automatically be included in published GitHub assets.
- Official source/rule revision upgrades must create a backup or duplicate, present a change preview, and never silently rewrite class progression, feats or known spells.
- Offline-first: bundle approved open data; import optional packs locally. Never require web/API calls during character creation or gameplay.
- Publish only SRD content and other content permitted by its actual license. GitHub repositories of commercial PDF books are **not** proof of permission to rehost or distribute their text. Use original summaries, citations/links, homebrew and opt-in personal data where lawful. Respect both content licenses and software licenses individually.

### Vetted starting resources

- Official SRDs and CC BY 4.0 attribution: https://www.dndbeyond.com/srd
- D&D 5e SRD API documentation (2014 and 2024 datasets): https://docs.dnd5eapi.co/2024/introduction and https://docs.dnd5eapi.co/introduction
- Open5e, open-licensed third-party content with document metadata: https://open5e.com/ and https://open5e.com/api-docs/
- User suggestions reviewed: `nazdridoy/dnd-public` (contents/license not sufficiently verified); `EllatharTheHalfling/DnD-Books` and `GingerHuang/DnD-Manuals` (rulebook PDF collections, not an authorized redistribution basis).

## Milestone 13 — Reliability and at-the-table fixes (delivered locally)

**Objective:** Resolve day-to-day interruptions before adding large features.

- **Concentration popup:** When `Damage` is applied and a character is concentrating, immediately open a polished non-blocking dialog with the spell/effect name, damage amount, Constitution saving throw DC, effective save modifier, and `Roll`, `I passed`, `I failed`, and `Dismiss` actions. Do not silently end concentration; end it when failure is recorded. Ensure keyboard access and a concise option for physical dice users.
- **Correct DC calculation:** Use `max(10, floor(damageTaken/2))`, **capped at 30**, after any applicable damage processing. A character can still be required to check if damage is absorbed by temporary HP. Never trigger a check for zero damage.
- **Unified HP input:** Keep one number field, with adjacent `Damage`, `Heal`, and `Set temp HP` buttons. Remove the browser `prompt()` for temporary HP. When new temporary HP is granted, follow the non-stacking keep-or-replace choice. Show what was absorbed and what reached normal HP.
- **Currency overflow:** Display long amounts with digit-group separators and a responsive, wrapping layout. Keep exact integer values; do not truncate or silently round, and show an explicit reason for the app's supported numeric/transaction limits.
- **Hard-coded text audit:** Replace Pip-specific rule descriptions and cached numbers in shared views with character-driven calculations. Preserve intentionally Pip-specific playbook notes only on Pip's sheet. Also audit battle labels, defaults, and error messages.
- **Universal panel collapse:** Turn the small top-left panel icon into a real accessible collapse/expand button. Keep the panel heading when collapsed, animate gently, remember the state per character and view, and provide `Expand all`/`Collapse all`. Do not interfere with other action buttons in the header.
- **Acceptance:** Tests for concentration DC 10, higher DC, max 30, temporary HP absorption, successful/failed reminders, zero damage, long currency, and non-Pip character wording. Verify existing 136 source tests continue to pass.

## Milestone 14 — Character artwork, sheet emblem and token studio (core delivered locally)

**Delivered in alpha.14:** Per-character portrait and independent emblem uploads; token canvas with circular/rounded-square mask, adjustable ring/zoom/position, pointer dragging, downloadable PNG; compressed offline media and per-character persistence; portrait library thumbnails; duplication and JSON backup migration. M13 and pre-M14 saves remain readable. Five new Node tests and browser checks passed.

**Follow-on polish:** File drag-and-drop, standalone portrait crop/rotate, independent library-thumb override, alternate token backgrounds, and verification of `file://` persistence on Windows still need work. The original checklist below remains the full target.


**Objective:** Let each character look unique without forcing a theme or relying on a remote image host.

- Allow a local PNG/JPG/WebP upload or drag-and-drop character portrait; offer zoom, reposition, crop, rotate, remove, and replace.
- Offer independently selectable **portrait**, **sheet emblem** (replaces the universal Folio book default), **library thumbnail**, and **tabletop token**. One image can be reused for all roles or each can be set separately.
- Build a token maker with circular/square mask, frame/ring palette, border thickness, optional second rim, transparent/solid background, live preview, and export as PNG.
- Default avatar/emblem must remain attractive if no image is uploaded. Keep the original butterfly as Pip's own option, not a global default.
- Introduce reliable image storage, compression and dimension/file-size guards *before* enabling large uploads. Account for `file://` browser storage quirks and quota failures. Include uploaded images/tokens in full library backups, and test restore on another browser/Windows machine.
- **Acceptance:** Create two characters with different uploaded imagery, restart the app, export/import a library, confirm every image returns, and confirm the default Folio book emblem still works.

### Milestones 15.1–15.3 — Artwork and layout usability polish (delivered locally)

- Independent per-character sheet-icon and library-card artwork choices (emblem, portrait or token as appropriate). Milestone 15.3 adds **Use this token as sheet icon** beneath the live token preview to save and apply it immediately.
- Token controls below preview, clear source naming, and drag-to-reposition or mouse-wheel zoom.
- Stable drop-marker dragging without continuous mid-drag panel rearrangement.
- Milestone 15.3 removed the redundant Reset layout button on the normal Sheet view; Restore default remains inside Edit Layout, followed by Save layout.
- Consolidated topbar Options menu with always-visible Undo.

## Milestone 15 — Edit Layout and magnetic panel arrangement (core delivered locally)

**Delivered in alpha.15:** Edit Layout mode on the Sheet tab; drag handles and arrow-keyboard accessible buttons; three snap-to columns and reorderable major panels; Save, Cancel and Restore Default; independent saved layouts for each character and compatible older save migration; desktop/tablet/mobile rendering; default Folio book emblem for everyone with Pip’s butterfly available as an optional Artwork Studio preset; passing Node and Chromium tests. The HP/AC masthead remains pinned.

**Follow-on improvements:** Optional resizing; moving smaller subcards and toolbar blocks; animated panel transitions; configurable mobile-only layout; future cross-tab editing (without hiding essential combat controls). The checklist below captures the longer-term design, including polish still pending.

**Objective:** Familiar by default; completely rearrangeable when the user chooses.

- Add an **Edit Layout** button to the Sheet page heading, adjacent to `Edit character` but distinct from Appearance Studio.
- **Normal mode:** The sheet looks and behaves exactly as before. No accidental dragging. Header icons still collapse sections.
- **Edit mode:** Show a dotted slot grid and visible drag handles. Drag a card to a target position, highlight its landing slot, and eventually animate neighboring cards out of the way, like rearranging apps on a phone. Use slot insertion/reordering, *not freeform absolute positioning* that causes overlaps.
- Permit cards such as Ability Scores, Saving Throws, Skills, Attacks, Features & Traits, Conditions & Concentration, Resources, and future tool/proficiency panels to move. Keep essential HP/AC information readily visible; optionally let the player pin vital cards.
- Offer `Save layout`, `Cancel`, and `Restore default`; support keyboard move controls and a touch-friendly editing mode. Save different layouts per character, and provide sensible breakpoints for desktop/tablet/mobile.
- Preserve collapse state and grid order through saves, undo where sensible, and export/import. Optional card resizing can be a follow-on rather than a requirement for initial release.
- **Acceptance:** Reorder all representative cards without content loss, refresh, resize to phone width, export/import, and restore default.

## Milestone 16 — Spellbook personalization and complete spell help (guidance coverage delivered locally)

**M16.1 follow-up:** All 339 source-catalogue spells now have tailored at-the-table advice plus full visible source text and metadata. Automated coverage and UI regression checks pass. Full independent official-errata cross-check remains a separate editorial task. See `docs/SPELL_GUIDANCE_AUDIT.md`.

**Delivered in alpha.16:** Shared Spellbook organization for Pip and new characters, retaining the original grouped-by-source default; existing per-character collapse controls; By purpose, folder, and saved-set views; custom labels and multiple user-assigned purposes; favorites; level, school, action, concentration, ritual, source and availability filters; clearer spell status; Elementalism's five named modes and official source; per-character organizer persistence in library/character backup data. New saved sets are **view-only reference collections**, not automatic preparation changes; Pip's older preparation loadouts remain intact in the Change Preparations workspace.

**Follow-on polish:** Independent official-SRD errata verification of all 339 original source texts and guidance details; improved source/edition tagging once M17's source registry is built; and real Windows `file://` storage checks across browser restarts.


**Objective:** Keep the known Spellbook workflow while improving retrieval during play.

- Keep current source-based sections such as `Prepared Paladin`, `Always Prepared`, and subclass/feat-granted groups; make each collapsible using its top-left icon.
- Add a **By purpose** view with flexible groups: **Offense**, **Defense**, **Healing**, **Control**, **Utility**, **Exploration**, **Social**, and **Ritual**. These are discovery labels, not D&D rule-defined categories; spells can belong to several.
- Allow users to assign/remove custom categories, create folders, pin favorites, and define reusable spell loadouts. Do not alter actual preparation/casting eligibility just because a spell is filed somewhere.
- Add useful filters: spell level, school, action type, concentration, ritual, class/source, and availability; show at-a-glance prepared/always prepared/expended status.
- Use a consistent **Details** drawer: what the effect does, range, components, duration, saving throw/attack and character-specific modifier, upcasting, concentration, targeting, and an original short "At the table" explanation.
- **Elementalism:** Provide the full set of five named modes with accurate summaries: Beckon Air, Beckon Earth, Beckon Fire, Beckon Water, and Sculpt Element. Action, 30-ft range, V/S components, instantaneous spell; the sculpted shape persists one hour, and created water disappears after one minute. These are minor utility effects, not direct damage spells. Link to the official rule source and SRD license.
- **Acceptance:** A spell can appear in several user groups without cloning its record, and collection edits cannot alter spell slot counts.

**Milestone 17.1 revised delivered:** one current rules baseline (revised 2024/SRD 5.2.1), no edition selector; library/campaign/character *source reference* inheritance, metadata provenance, user-owned metadata packs and safe migration of older 17.1 backups. Newer official versions take precedence when actually implemented, and older compatible options may remain. The full book catalogues and automatic newest-version resolution across expansions are **not** included yet. See `docs/SOURCE_PACKS.md`.

## Milestone 17 — Current-rule content registry and catalogue expansion

**Current progress — Milestone 17.6 (November 2026):** M17.2 expanded backgrounds and feat selections; M17.3 introduced 26 species reference records; M17.4 added 144 SRD-based non-weapon equipment records (plus 38 existing weapons). **M17.5 now reconciles the 339 bundled SRD spells against the 391-name 2024 PHB index** with 52 explicitly reference-only names and 17 PHB naming aliases; supports source-filtered lookup, spell-specific manual reference details, and personal spell entries imported from local packs. The SRD rules stay available as before; **PHB-only mechanics and other commercial sourcebook spells are not installed**, and casting a reference is a manual tracking action. See `docs/MILESTONE_17_5_RELEASE_NOTES.md` and `docs/PHB_2024_SPELL_INDEX_AUDIT.md`. **M17.6 adds 39 more reference-only spell names** from Wildemount, Strixhaven, Tasha’s, and Fizban’s (430 total spell names), with source filters and conservative Wildemount subclass gates. See `docs/SUPPLEMENT_SPELL_INDEX_AUDIT.md`. M17 still needs broad official-sourcebook coverage, further compatibility/errata checks, and full paid-book mechanics; M18 adds deeper class/rules automation.

**Objective:** Maintain **one revised D&D 5e ruleset** (2024/SRD 5.2.1 baseline) and prefer the **newest officially published version** of each class, species, spell, feat, background and equipment option when implemented. Keep older options with no replacement if compatible, and preserve provenance, rights, content availability and implementation status. Source packs are reference and provenance selectors, **not an edition switch**.

- Maintain a source-labelled content registry: source, publication/revision, license/provenance, category, prerequisites, choices, effects, superseded-by mapping where known, and implementation status (`automated`, `partially automated`, `reference only`, `user-entered`). Do not represent a sourcebook toggle as installing its unbundled options.
- **Feats:** Replace the 8-option starter list. Work toward complete 2024 PHB feat *selection coverage* across Origin, General, Fighting Style, and Epic Boon; model prerequisites, repeatability, level eligibility, ability-score increases and selectable subchoices. Automate straightforward mechanical effects; label complex effects as manual until implemented. 2024 PHB contains 75 feats, but not all are licensed for bulk reproduction.
- **Backgrounds:** Extend 4 starters toward all 16 2024 PHB choices with skills, languages/tools, ability bonuses, starting equipment, origin feats, and meaningful selections.
- **Species:** Extend 9 included SRD species toward the 10 in the 2024 PHB, respecting content rights; model all traits, size/speed, senses, choices, sub-options, innate spells and limited-use powers. Source-specific species such as Changeling sit in an expansion layer rather than being mislabelled SRD.
- **Equipment:** Complete mundane armor and shields, simple and martial weapons, tools, artisan's supplies, musical instruments, gaming sets, adventuring gear, packs, costs, weight, AC/Strength/Stealth requirements, equip state, and key Utilize/Craft information.
- **Details buttons:** Every feat, species trait, tool, weapon mastery, armor type, item, and class feature with meaningful rules has a small `Details` action with a concise original use-case, calculation, source, and limitations.
- **Spells:** M17.5 adds 52 PHB-only spell references (391 index total) and 17 name aliases; M17.6 adds 39 supplement spell references (430 total), imported spell metadata, filtering and clear manual-rules limitations. Verify remaining official sourcebooks, current-rules compatibility, individual mechanics, and errata separately.
- **Acceptance:** Comprehensive audit checklist covers every defined content option and distinguishes catalogue availability from rules automation.

**Progress, November 15 2026 — M18.2 PARTIAL:** Fighter/Rogue/core feat-award levels and actual selected Ability Score Improvement boosts are now recorded in the builder; Fighter/Paladin/Ranger can record a class-granted Fighting Style, with Defense and Archery passive bonuses; Alert/Tough bonuses apply where granted. This is **not** completion of the 12-class feature engine, subclasses, all feats or expanded official-sourcebook mechanics. See `docs/MILESTONE_18_2_PARTIAL_ADVANCEMENT.md`.

**Progress, November 15 2026 — M18.2 PARTIAL:** Fighter/Rogue/core feat-award levels and actual selected Ability Score Improvement boosts are now recorded in the builder; Fighter/Paladin/Ranger can record a class-granted Fighting Style, with Defense and Archery passive bonuses; Alert/Tough bonuses apply where granted. This is **not** completion of the 12-class feature engine, subclasses, all feats, or expanded official-sourcebook mechanics. See `docs/MILESTONE_18_2_PARTIAL_ADVANCEMENT.md`.

**Progress, November 15 2026 — M18.3 PARTIAL:** Paladin self Aura of Protection saves, Sorcerer Innate Sorcery +1 spell save DC and usage, Rogue Uncanny Dodge, Monk Deflect Attacks and qualifying Evasion damage resolution have actual code paths, but require explicit in-game trigger confirmations and manual timer/turn management. Class, subclass and sourcebook coverage remain incomplete. See `docs/MILESTONE_18_3_PARTIAL_CLASS_DEFENSES.md`.

**Progress, November 15 2026 — M18.4 PARTIAL:** Wizard Arcane Recovery, Druid Wild Resurgence and Cleric Divine Spark have tested rules-backed actions rather than merely counters. Targets, time/turn limits and book-specific effects outside this scope remain manual; PHB and all-official-book support remain incomplete. See `docs/MILESTONE_18_4_PARTIAL_CLASS_ABILITIES.md`.

## Milestone 18 — Genuine level-up, subclass, species and rules engine

**Objective:** All 12 classes should progress accurately from level 1–20, not just receive numerical updates.

- Design data-driven level milestones, class/subclass feature grants, limited-use resources and rest resets; apply selections and later changes safely.
- Model class spell lists and granted spells separately, proper spell preparation and replacement, spellcasting ability, attack/DC changes, class resources, armor training, skill proficiency, and class-specific actions.
- Model species traits as actionable features (rather than a plain description). Include feature-level `Details`, tracking, and manual override controls.
- Extend the **2025 Eberron Changeling** metadata-and-skill selection added in M17.3 into full active Shape-Shifter form/appearance tracking, size and eligible-change rules, advantage on relevant Charisma checks while transformed, chosen proficiencies, and separate appearance portraits/forms where useful. Do not claim that reshaping grants another species' powers or changes equipment.
- Integrate 2024 weapon mastery, fighting styles, attack sequences, and conditional effects. Auto-resolve what can be computed; request table decisions when context matters.
- **Acceptance:** Level several representative characters of different classes; confirm gained features/resources and absence of unrelated Pip defaults. Include advancement/migration tests.

## Milestone 19 — Oath of the Noble Genies, fully implemented

**Objective:** Make Pip's signature subclass work in the general builder, for any eligible Paladin, through level 20.

- Add the official Oath of the Noble Genies as a source-labelled subclass option rather than a Pip-only template.
- **Level 3:** Genie Spells and grants, Genie’s Splendor, and all four Elemental Smite options (Dao's Crush, Djinni's Escape, Efreeti's Fury, Marid's Surge); accurate triggers, targets, durations, saving throws, movement and Channel Divinity spending.
- **Level 7:** Aura of Elemental Shielding with selectable resistance, change timing, allies in Aura of Protection, and visible aura status.
- **Level 15:** Elemental Rebuke reaction, damage reduction/retaliation, resource and reaction tracking.
- **Level 20:** Noble Scion, applicable duration and benefits, flight where relevant, Minor Wish/reaction functionality, and once-per-round gating where applicable.
- Use the official **Dexterity + Charisma** version of Genie’s Splendor (a published erratum corrected an incorrect Constitution reference), plus lawful equipment/shield interactions.
- Validate prepared subclass spells and scaling by level against the published *Forgotten Realms: Heroes of Faerûn* rules, not solely the earlier Unearthed Arcana draft. Store source citations/original descriptions without republishing copyrighted rulebook text.
- **Acceptance:** A newly made level-7 Noble Genies Paladin has the same eligible subclass features as Pip, but retains its own name, feats, art and scores. Test levels 3/7/15/20 and resource resets.

## Milestone 20 — Multiclassing and advanced combat logic

**Objective:** Support difficult but common builds with visible rules provenance.

- Multiclass prerequisites, per-class levels, hit dice, proficiency rules, multiclass spell slot table, Pact Magic interactions, shared/independent spellcasting, and overlapping features.
- Active effects with duration, concentration, stacking/resistance and resource cost; multiple ongoing conditions, round reminders, expiring effects, and more complete turn/action economy checks.
- Improve attack and damage automation, weapon mastery, reaction use, advantage/disadvantage, and inspectable calculations. Include DM/manual overrides and a reliable undo action for mistakes.
- **Acceptance:** Test tricky multiclass spell slots and non-stacking effects; prevent rules from being silently applied twice.

## Milestone 21 — Export, recovery, accessibility, responsive polish

**Objective:** Make The Folio dependable as a long-lived local app.

- Robust versioned JSON backups for art, layouts, categories, homebrew and character states; import previews, duplicate detection, corruption warnings, and restore tests.
- Thorough Windows/Chrome/Edge/Firefox testing, including differing file paths/origins. Clear storage diagnostics and recovery guidance.
- Keyboard navigation, reduced-motion options, accessible contrast, touch-friendly hit areas, mobile sheet editing, screen reader labels, and print-friendly layouts with sensible section ordering.
- Keep tests and documentation updated and verify GitHub Actions.

## Milestone 22+ — Optional, separately scoped experiments

- **True 3D physics dice:** collision, bounce and face-reading, distinct from the existing cosmetic 3D animation.
- **Optional native Windows wrapper:** offline desktop packaging without accounts or hosted services; migration from browser saves must be explicit and safe.
- **Further reference catalogues:** user-importable source packs, licensed content extensions, custom compendium authoring, and improved homebrew rules builder.
- **Quality-of-life extensions:** reusable combat loadouts, timelines, richer notes/links, and session summaries, without adding multiplayer or mandatory cloud features.

## Progress note — November 15, 2026 (no implied milestone completion)

- **Milestone 17:** Catalogue/source-reference expansions landed through 17.6; **all official book coverage remains incomplete**.
- **Milestone 18.1:** Typed damage, correct SRD resistance/vulnerability ordering, and functioning Barbarian Rage resistance were added in another **partial** build. See [`docs/MILESTONE_18_1_PARTIAL_TYPED_DAMAGE.md`](docs/MILESTONE_18_1_PARTIAL_TYPED_DAMAGE.md). This does **not** complete the rules engine.
- **Milestone 18:** Work has begun in the separate **18.0 partial build**. It adds some usable SRD class-resource and passive mechanics, not the full class/subclass feature system. See [`docs/MILESTONE_18_0_PARTIAL_RULES_ENGINE.md`](docs/MILESTONE_18_0_PARTIAL_RULES_ENGINE.md) for a precise working/manual/missing inventory.
- **Milestones 19–21:** Not completed. The overall objective of all official options with real mechanics is still open.

## Recommended shipping sequence

**First:** 13 → 14 → 15 → 16 for an immediate step up in daily usability and personalization.  
**Next:** 17 → 18 → 19 for real character-creation breadth and subclass correctness.  
**Then:** 20 → 21 for difficult rules and durability.  
**Later:** 22+ only if it adds enough value to justify maintenance.

## Audited implementation notes (Milestone 12 ZIP)

- `js/builder.js` currently defines 12 classes, 9 SRD species, 4 backgrounds, 8 feat entries, and 12 starter subclasses. Species traits and many feat effects are not automated.
- `js/ui.js` generates spell-resolution caster name and DC dynamically, but `js/data.js` and `js/spell-guides.js` still include Pip-specific descriptions and sample numbers.
- `js/core.js` records concentration checks from damage; `js/ui.js` renders an inline reminder; `js/main.js` uses a separate `prompt()` for temporary HP.
- Currency is tracked as integer coin counts in `js/inventory.js`, while `js/inventory-ui.js` renders balances in a fixed coin grid; optimize display for large values.
- `js/ui.js` renders fixed sheet columns; `panel()` produces static headings with decorative icons. Sheet reorder and universal collapse are not currently implemented.
- Existing source tests passed: **136/136** as checked against the locally available cleaned alpha repository; future changes need new regression tests.

## Official reference sources

- SRD 5.2.1 and permitted reuse: https://www.dndbeyond.com/srd
- 2024 PHB content overview (16 backgrounds, 10 species, 75 feats, 391 spells): https://www.dndbeyond.com/posts/1810-updates-in-the-players-handbook-2024
- 2024 concentration rules: https://www.dndbeyond.com/sources/dnd/br-2024/rules-glossary
- 2024 temporary hit points: https://www.dndbeyond.com/sources/dnd/br-2024/playing-the-game
- Elementalism: https://www.dndbeyond.com/spells/2618834-elementalism
- Oath of the Noble Genies: https://www.dndbeyond.com/posts/2087-lets-build-an-oath-of-the-noble-genies-paladin
- Noble Genies erratum: https://www.dndbeyond.com/forums/d-d-beyond-general/release-issues-support/231469-forgotten-realms-heroes-of-faerun-issues-and
- Updated Eberron Changeling: https://www.dndbeyond.com/posts/2017-how-eberron-forge-of-the-artificer-reimagines

**Progress, November 15 2026 — M18.5 PARTIAL:** Added tested class-action resource rules for Bard, Fighter and Monk, including correct wasted-check refunds, level-based Monk bonuses, and initiative-triggered recovery. No turn or ally model exists yet; PHB and all-official-books mechanics still remain incomplete. See `docs/MILESTONE_18_5_PARTIAL_CLASS_ACTIONS.md`.

**Progress, November 15 2026 — M18.6 PARTIAL:** Added Rogue Sneak Attack and Cunning Strike to real weapon attack resolution with legal prerequisites, dice costs, critical damage, target save DCs, once-per-turn tracking and saved state. No complete encounter model or cross-class coverage yet; see `docs/MILESTONE_18_6_PARTIAL_ROGUE_ATTACKS.md`.

**Progress, November 15 2026 — M18.8 PARTIAL:** Paladin weapon hits now support confirmed-hit Divine Smite with free/slot cost and level-11 Radiant Strikes, alongside self-only Lay On Hands condition removal and always-prepared Divine Smite / Find Steed. All 319 Node and 11 browser workflows pass. This is still **partial**: multiple class/subclass features, the PHB, and all-sourcebooks coverage are unfinished; see `docs/MILESTONE_18_8_PARTIAL_PALADIN.md`.

**Progress, November 15 2026 — M18.7 PARTIAL:** Implemented Ranger Hunter’s Mark free/slot casting, tracked target, confirmed-hit Force damage, criticals, level-13 concentration protection, level-17 attack Advantage and level-20 Foe Slayer die; also Tireless temp HP and Nature’s Veil use tracking. Range/target, turn timing and conditions require confirmation; see `docs/MILESTONE_18_7_PARTIAL_RANGER.md`. The full Ranger, PHB and all-books goals remain open.

**Progress, November 15 2026 — M18.9 PARTIAL:** Added Fighter Action Surge once-per-turn resource spending, Indomitable saving throw rerolls, and working Champion improved critical hits, initiative Advantage, Heroic Warrior, Survivor, Defy Death and second Fighting Style selection. Some target-dependent features remain manual. The Fighter, Champion, PHB and all-sourcebook goals are **not complete**; see `docs/MILESTONE_18_9_PARTIAL_FIGHTER_CHAMPION.md`.
