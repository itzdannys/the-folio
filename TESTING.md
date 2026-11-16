## Milestone 18.30.1 (In-person Play Alignment)

Run `npm test` (adds `tests/milestone18-30-1-physical-play.test.cjs`) and `python tests/milestone18-30-1-in-person-browser.py` to verify manual initiative, roll-free weapon use, optional attack calculator, and mobile layout. The previously available digital workflows are tested by explicitly opening their optional panels. `npm run audit:rules` audits source metadata without changing it. See `docs/MILESTONE_18_30_1_IN_PERSON_PLAY_ALIGNMENT.md`.

## Milestone 18.30 — PHB 24 Feats

From the extracted `The Folio` directory, use `npm test` to run all **983 automated tests**, including `tests/milestone18-30-feats.test.cjs` for PHB feat catalogue counts, prerequisite validation, builder progression and score bonuses, saved feat choices, free casting, once-per-turn/Long Rest resources, Boon of Recovery incoming-damage interception, Heavy and Medium Armor Master, poison crafting, Fate and elemental resistance. Run `npm run audit:rules` for the read-only rules registry, currently **648 candidates**, **605 needing source/version checks**, **zero version conflicts**.

Run `python tests/milestone18-30-feats-browser.py` for character creation, feat selection, configuration, use counters, save/reopen and 390px mobile layout. Regress all twelve signed-off class scripts (`milestone18-15i-paladin-signoff-browser.py` to `milestone18-26-wizard-browser.py`) and the source, 18.27 polish, 18.28 species and 18.29 backgrounds tests: **17 named suites passed**. The clean-extracted full ZIP is tested separately before release. Actual Windows `.cmd` execution is not tested in this Linux browser environment, but the launcher remains in the archive unchanged.

## Milestone 18.29 — PHB 24 Backgrounds and Origin Feats

Run `npm test` (953 passing) and `npm run audit:rules` (zero conflicts). Run `python tests/milestone18-29-origins-browser.py` with Playwright and local Chromium to verify character creation, equipment A/B, tool choice, Magic Initiate spells, Lucky resources, save/reopen and mobile. Regress all 12 signed-off class browser scripts plus `milestone18-15b-rules-registry-browser.py`, `milestone18-27-polish-browser.py` and `milestone18-28-species-browser.py`: 16 targeted Chromium suites passed. The full ZIP was checked after clean extraction. See `docs/MILESTONE_18_29_BACKGROUNDS_ORIGIN_FEATS_SIGNOFF.md` for implementation boundaries.

## Milestone 18.28 — PHB 24 Species & Traits

From the extracted `The Folio` directory run `node --test` (936 tests passed on the build) and `python tests/milestone18-28-species-browser.py` (Playwright / local Chromium). Confirm that all 10 PHB 24 species can be selected and the Features & Traits page provides active ability controls; retain the older-book species references. Check resource spending, short/long rest recharge, lineage spells in the shared Spellbook, save/reopen, legacy-source display PHB 24 (including Oath of Devotion), damage dialog and narrow-screen layout.

Targeted browser scripts: 15 passed on the source tree, covering all 12 PHB classes, 18.27 polish, source registry and 18.28 species UI. Explicit DM-controlled effects remain a manual check and should not be marked as independently adjudicated by the app. Original internal source/license identifiers are intentionally unchanged.

## Milestone 18.26 — Wizard / all 12 PHB classes

From the extracted `The Folio` directory:

```bash
npm test
npm run audit:rules
python tests/milestone18-26-wizard-browser.py
python tests/milestone18-25-warlock-browser.py
python tests/milestone18-24-sorcerer-browser.py
python tests/milestone18-23-druid-browser.py
python tests/milestone18-22-bard-browser.py
python tests/milestone18-21-cleric-browser.py
python tests/milestone18-20-ranger-browser.py
python tests/milestone18-19-monk-browser.py
python tests/milestone18-18-rogue-browser.py
python tests/milestone18-17-barbarian-browser.py
python tests/milestone18-16c-fighter-browser.py
python tests/milestone18-15i-paladin-signoff-browser.py
python tests/milestone18-15b-rules-registry-browser.py
```

**Result: 923/923 Node tests pass; 13/13 named Chromium browser scripts pass.** Browser tests cover class actions, source registry, save and reopen, and mobile layout. Read-only source audit: 603 records, zero conflicts/duplicate revision IDs, 560 pending source/version verification. Windows .cmd cannot itself be executed in Linux; the launcher has been verified in the ZIP and starts `index.html` without a server. See `docs/MILESTONE_18_26_WIZARD_2024_PHB_SIGNOFF.md`.

## Milestone 18.25 — Warlock 2024 PHB full verification

From the extracted **The Folio** directory:

```bash
npm test
npm run audit:rules
python tests/milestone18-25-warlock-browser.py
python tests/milestone18-24-sorcerer-browser.py
python tests/milestone18-23-druid-browser.py
python tests/milestone18-22-bard-browser.py
python tests/milestone18-21-cleric-browser.py
python tests/milestone18-20-ranger-browser.py
python tests/milestone18-19-monk-browser.py
python tests/milestone18-18-rogue-browser.py
python tests/milestone18-17-barbarian-browser.py
python tests/milestone18-16c-fighter-browser.py
python tests/milestone18-15i-paladin-signoff-browser.py
python tests/milestone18-15b-rules-registry-browser.py
```

Results: **896 / 896 Node tests**, including 20 targeted Warlock tests; Warlock browser exercise of all four patrons, Spellbook free cast, resource/Invocation options, persistence and mobile; and the other **11/11 browser regressions** passing. Rule audit **600 total records, zero version conflicts and duplicate revision IDs; 557 pending manual source review**. Full ZIP cleanly extracts, with a preserved offline Windows launcher. See `docs/MILESTONE_18_25_WARLOCK_2024_PHB_SIGNOFF.md` for exact boundaries.

## Milestone 18.24 — Sorcerer 2024 PHB single-class sheet

From the extracted **The Folio** directory:

```bash
npm test
npm run audit:rules
python tests/milestone18-24-sorcerer-browser.py
python tests/milestone18-23-druid-browser.py
python tests/milestone18-22-bard-browser.py
python tests/milestone18-21-cleric-browser.py
python tests/milestone18-20-ranger-browser.py
python tests/milestone18-19-monk-browser.py
python tests/milestone18-18-rogue-browser.py
python tests/milestone18-17-barbarian-browser.py
python tests/milestone18-16c-fighter-browser.py
python tests/milestone18-15i-paladin-signoff-browser.py
python tests/milestone18-15b-rules-registry-browser.py
```

Results: **876 / 876 automated Node tests** (23 focused Sorcerer cases) and a passing Sorcerer Chromium test for four subclasses, casting, save/reopen, and mobile. Read-only registry audit: **597 records, 0 conflicts or duplicate revision IDs, 554 pending review**. Source details, intentional DM-confirmations and known automatic-effect limitations are documented in `docs/MILESTONE_18_24_SORCERER_2024_PHB_SIGNOFF.md`. The delivered full ZIP is checked for integrity and tested after clean extraction.

## 18.23 — Druid 2024 PHB sign-off

From the extracted **The Folio** directory run `npm test`, `npm run audit:rules` and the following Chromium-based browser scripts: 

```bash
python tests/milestone18-23-druid-browser.py
python tests/milestone18-22-bard-browser.py
python tests/milestone18-21-cleric-browser.py
python tests/milestone18-20-ranger-browser.py
python tests/milestone18-19-monk-browser.py
python tests/milestone18-18-rogue-browser.py
python tests/milestone18-17-barbarian-browser.py
python tests/milestone18-16c-fighter-browser.py
python tests/milestone18-15i-paladin-signoff-browser.py
python tests/milestone18-15b-rules-registry-browser.py
```

Pre-packaging results: **853/853 Node tests**, **10/10 listed browser suites** and the read-only audit (**594 candidates, zero conflicts/duplicate revisions**) passed. The Druid test verifies four circles, known forms, live controls, save/reopen, and mobile layout. The Druid unit suite covers 37 additional cases, including verified form AC/speed, short/long-rest behavior, Moon/Sea/Stars resource costs, resistance, Primal Strike atomic weapon damage, and the base progression. After packaging, verify ZIP integrity and rerun `npm test` and the Druid browser suite from a clean extraction.

## 18.22 — Bard 2024 PHB sign-off

From extracted `The Folio`:

```bash
npm test
npm run audit:rules
python tests/milestone18-22-bard-browser.py
python tests/milestone18-21-cleric-browser.py
python tests/milestone18-20-ranger-browser.py
python tests/milestone18-19-monk-browser.py
python tests/milestone18-18-rogue-browser.py
python tests/milestone18-17-barbarian-browser.py
python tests/milestone18-16c-fighter-browser.py
python tests/milestone18-15i-paladin-signoff-browser.py
python tests/milestone18-15b-rules-registry-browser.py
```

Results: **816/816 Node tests; 9/9 independently run browser scripts; no version conflicts/duplicate revision IDs in 591-record read-only audit.** The ZIP passes clean-extraction checks. Other creatures and third-party book data remain unverified.

## Milestone 18.21 — Cleric validation

- `node --test --test-concurrency=3`: 783/783 passed.
- `python tests/milestone18-21-cleric-browser.py`: passed for all four Cleric domains, save/reopen, mobile layout.
- Browser regressions passed individually: Ranger 18.20, Monk 18.19, Fighter 18.16C, Barbarian 18.17, Rogue 18.18, Paladin 18.15I, and version registry 18.15B.
- `npm run audit:rules`: 588 candidate entries, 0 version conflicts or duplicate revision IDs; 545 candidates still awaiting source verification.
- Packaged zip validated with clean extraction and re-run of automated tests and Cleric browser checks.
- Full feature checklist and explicit manual boundaries: `docs/MILESTONE_18_21_CLERIC_2024_PHB_SIGNOFF.md`.

## 18.20 — Ranger 2024 PHB single-class sign-off

Run from the extracted `The Folio` directory:

```bash
node --test --test-concurrency=4
node scripts/audit-rules.cjs
python tests/milestone18-20-ranger-browser.py
python tests/milestone18-19-monk-browser.py
python tests/milestone18-16c-fighter-browser.py
python tests/milestone18-18-rogue-browser.py
python tests/milestone18-17-barbarian-browser.py
python tests/milestone18-15i-paladin-signoff-browser.py
python tests/milestone18-15b-rules-registry-browser.py
```

**758/758 Node tests**, 30 Ranger-focused tests, and seven Chromium browser suites passed. Actual Windows filesystem permissions, third-party content packs, every enemy spell and live user saves remain outside automated coverage. See `docs/MILESTONE_18_20_RANGER_2024_PHB_SIGNOFF.md`.

## 18.19 — Monk 2024 PHB single-class sign-off

Run from the extracted `The Folio` directory:

```bash
node --test
node scripts/audit-rules.cjs
python tests/milestone18-19-monk-browser.py
python tests/milestone18-18-rogue-browser.py
python tests/milestone18-17-barbarian-browser.py
python tests/milestone18-16c-fighter-browser.py
python tests/milestone18-15i-paladin-signoff-browser.py
python tests/milestone18-15b-rules-registry-browser.py
```

- **728/728 automated tests passed**, inherited 704 plus 24 dedicated Monk tests.
- Monk Chromium browser suite covers all four subclasses, Focus/attacks, saving and reopening, Monk weapon dialog and mobile layout. The shared weapon modal was checked with Fighter’s regression after a discovered rendering error was corrected.
- Registry has 581 candidate entries, no version-ID duplicates/conflicts; 538 still awaiting manual source/version review. This audit does not automatically select or replace rules.
- All browser harnesses use temporary localStorage/IndexedDB stubs. Live Windows user saves and every possible third-party source pack are not simulated. No save schema migration was introduced.
- See `docs/MILESTONE_18_19_MONK_2024_PHB_SIGNOFF.md` for manual target/DM boundaries and class coverage.

## 18.17 Barbarian final sign-off — verified 2026-11-15

- `npm test` — **669/669** passing.
- Browser: `python tests/milestone18-17-barbarian-browser.py`, `tests/milestone18-10-barbarian-browser.py`, `tests/milestone18-16c-fighter-browser.py`, `tests/milestone18-15i-paladin-signoff-browser.py`, `tests/milestone18-6-rogue-browser.py`, and `tests/milestone18-15b-rules-registry-browser.py` all individually passed.
- `npm run audit:rules` reports 575 candidate entries, zero duplicate revision IDs/conflicts, and 532 candidate options pending manual source/version verification.
- Packaging: fresh directory extraction, rerun `npm test`, smoke test from extracted application and read-only audit; see release verification summary below.
- Scope: signed-off 2024 PHB Barbarian sheet mechanics, with external creature outcomes and full arbitrary spell effects left to table confirmation; multiclassing remains separate.

## Milestone 18.16C — Fighter 2024 PHB sign-off

From the extracted application directory:

```sh
npm test
npm run audit:rules
python tests/milestone18-16c-fighter-browser.py
python tests/milestone18-16a-fighter-browser.py
python tests/milestone18-16b-fighter-attack-browser.py
python tests/milestone18-15i-paladin-signoff-browser.py
python tests/milestone18-6-rogue-browser.py
python tests/milestone18-15b-rules-registry-browser.py
python tests/milestone17-sources-browser.py
```

- **634/634 automated tests passed**, including 27 new tests in `milestone18-16c-fighter-signoff.test.cjs`. The inherited 607 tests still pass.
- The seven Chromium scripts above passed, covering Fighter subclasses and weapon attacks, new UI controls and save/reopen, Paladin, Rogue, Pip/registry, sources and mobile layout.
- A previously intermittent broad `milestone18-batch-browser.py` script was not counted as a pass in this milestone.
- The new Fighter browser script found and drove a fix to apostrophe escaping in `builder-ui.js`, previously displaying `Smithundefineds Tools` and breaking a saved proficiency choice.
- Registry audit inventories 572 entries with zero detected duplicate revision IDs or conflicts; 529 option identities still require manual source/revision review.
- Browser tests stub localStorage and IndexedDB. Live preexisting Windows character records, complete IndexedDB migration, Windows launcher behavior and DM-controlled enemies were not directly verified. Existing file/data schemas have not intentionally changed.
- Clean extraction of this milestone's ZIP is separately checked before release.

## Milestone 18.16B — 2024 PHB Fighter hit integrations

```sh
npm test
npm run audit:rules
python tests/milestone18-16b-fighter-attack-browser.py
# Optional, when you have your own extracted copy of the uploaded archive:
node scripts/audit-external-dnd-data.cjs /path/to/dnd-data-main/data
```

- **607/607** automated tests passed (14 new 18.16B checks, 593 inherited).
- **7 completed browser suites** passed, including Fighter linked attacks, 18.16A Fighter, 18.9 Champion, 18.15I Paladin, 18.15B registry/Pip, M17 source packs, and 18.6 Rogue. The broad `browser-smoke.py` stalled and is not counted.
- Tests for confirmed hit/miss, critical hit die doubling for maneuvers, resource costs, insufficient pool, unlearned maneuvers, Relentless use, Psi Warrior once-per-turn, storage/clone compatibility and mobile UI.
- Browser tests use stubbed localStorage. Actual Windows launcher and production IndexedDB migrations not verified here. Data archive inspected read-only and **not bundled**.

## Milestone 18.16A — Fighter 2024 PHB (PARTIAL)

From the extracted app folder:

```sh
npm test
npm run audit:rules
python tests/milestone18-16a-fighter-browser.py
```

- **593/593** Node tests passed, including **21** new Fighter-specific cases.
- The new Fighter browser script passed, as did the earlier Champion, 18.15I Paladin sign-off, source registry, Rogue, source packs and general browser smoke scripts (**7 completed** browser suites).
- `milestone18-batch-browser.py` and `milestone18-15g-paladin-turn-budget-browser.py` stalled and were **not verified** during this run.
- Source audit: 572 entries, 0 conflicts, 0 duplicated revision IDs; 529 items still need manual source/version review. Read-only, no changes to user data.
- No real Windows launcher or existing IndexedDB data were used in these automated checks. See `docs/MILESTONE_18_16A_FIGHTER_2024_PARTIAL.md` for detailed scope and limits.

## Milestone 18.15I — 2024 PHB Paladin sign-off (2026-11-15)

Run from the extracted project root:

```
npm test
npm run audit:rules
python tests/milestone18-15i-paladin-signoff-browser.py
```

- **572/572** Node tests passed (18 18.15I tests, 554 inherited).
- **9/9** Chromium browser scripts passed:
  - `tests/milestone18-15i-paladin-signoff-browser.py` — Find Steed cast, companion HP/state, persistence, Glory power timer, mobile
  - `tests/milestone18-15d-paladin-followups-browser.py`
  - `tests/milestone18-15e-paladin-channel-reroll-browser.py`
  - `tests/milestone18-15f-paladin-ally-auras-browser.py`
  - `tests/milestone18-15g-paladin-turn-budget-browser.py`
  - `tests/milestone18-15h-paladin-closure-browser.py`
  - `tests/milestone18-8-paladin-browser.py`
  - `tests/milestone18-batch-browser.py`
  - `tests/milestone17-sources-browser.py`
- Rules audit: **569 records**, **0 version conflicts**, **0 duplicate revision IDs**, 5 explicitly reviewed Paladin/oath source identities; many other source records remain unverified. Audit is read-only.
- Tests run in headless Chromium with stubbed localStorage. **Physical Windows launcher behavior and existing user IndexedDB migration were not exercised.** Run local backups before replacing your installed app.
- Sign-off is for **2024 PHB Paladin character-sheet features**, not autonomous creatures/encounters, all official Paladin options outside the PHB, or all spell effects.

## Milestone 18.15H — Paladin combat/feature completion pass

- `npm test` — **554/554** passing Node tests: previous 529 plus 25 new Paladin combat, 1–20 progression, enemy-condition, style/cantrip and persistence cases.
- `python tests/milestone18-15h-paladin-closure-browser.py` — new complete end-to-end browser regression; normal save/reopen in a localStorage stub and 390px mobile viewport.
- Earlier 18.15B–G browser suites and full 18.15 PHB Paladin browser regression: passed after updating catalogue count and separating distinct Opportunity Attack checkbox names.
- `npm run audit:rules` — 563 entries inventoried; audit is read-only, with only five reviewed Paladin/oath identities.
- Browser tests **do not** verify the Windows launcher or real IndexedDB storage migration. See `docs/MILESTONE_18_15H_PALADIN_COMPLETION_AUDIT.md` for exact coverage.

**18.15G testing:** `npm test` runs **529 passing tests** (12 new). `python tests/milestone18-15g-paladin-turn-budget-browser.py` passes the real UI flows, save/reopen and mobile, including known-time spell casts. Earlier 18.15F/E/D/C/B and M17 sources browser checks pass. The broader 18.15 PHB Paladin browser regression stalled; it is not counted. Chrome tests use stubbed localStorage, not the real Windows launcher or a user's IndexedDB. See `docs/MILESTONE_18_15G_PARTIAL_PALADIN_TURN_BUDGET.md`.

**18.15F test status:** `npm test` runs **517 passing tests** (including 16 new ally aura/self aura cases). New Chromium test: `python tests/milestone18-15f-paladin-ally-auras-browser.py`, including save/reopen and 390px viewport. Earlier Paladin/source and broad browser smoke tests pass. Browser tests mock localStorage and are not Windows launcher/IndexedDB verification. See `docs/MILESTONE_18_15F_PARTIAL_PALADIN_ALLY_AURAS.md`.

## Milestone 18.15E — Paladin shared Channel Divinity and Living Legend reroll

- `npm test` — **501/501** Node tests, 13 new.
- `python tests/milestone18-15e-paladin-channel-reroll-browser.py` — PASS (actual UI, local save/reopen, mobile).
- `python tests/milestone18-15d-paladin-followups-browser.py` — PASS.
- `python tests/milestone18-15c-paladin-reactions-browser.py` — PASS.
- `python tests/milestone18-15-phb-paladin-browser.py` — PASS.
- `python tests/milestone18-15b-rules-registry-browser.py` — PASS.
- `python tests/milestone17-sources-browser.py` — PASS.
- `python tests/browser-smoke.py` — PASS (base spellbook / weapons / Pip / mobile).
- Browser tests use mocked localStorage; **real Windows launcher and IndexedDB migration not verified**. Paladin mechanics remain partial.
- Detailed limitations: `docs/MILESTONE_18_15E_PARTIAL_PALADIN_CHANNEL_AND_REROLL.md`.

## Milestone 18.15D — Paladin follow-up attacks

- `npm test`: **488/488** Node tests (474 inherited + 14 focused).
- `python tests/milestone18-15d-paladin-followups-browser.py`: **passed**; real attack UI, persisted Reaction/strike state, 390px mobile.
- 18.15C Paladin, 18.15 PHB Paladin, M17 source packs, and M18.15B registry browser checks: **passed**.
- Broad `python tests/browser-smoke.py` was not confirmed within this batch. Windows launcher and real IndexedDB are not exercised by stubbed localStorage browser tests.
- See `docs/MILESTONE_18_15D_PARTIAL_PALADIN_FOLLOWUPS.md`; this is not full Paladin completeness.

## Milestone 18.15C — Paladin reaction/protection integration

From the extracted project root, run `npm test` (474 automated tests) and `python tests/milestone18-15c-paladin-reactions-browser.py` (offline Chromium). Also rerun the existing browser smokes: `tests/milestone18-15-phb-paladin-browser.py`, `tests/milestone17-sources-browser.py`, `tests/milestone18-15b-rules-registry-browser.py` and `tests/browser-smoke.py`. Reference: `docs/MILESTONE_18_15C_PARTIAL_PALADIN_REACTIONS.md`.

## Milestone 18.15B — rules audit regression

- `npm test`: 462/462 passed (original 438 + 24 registry/integration tests).
- `npm run audit:rules`: deterministic read-only source inventory; 562 entries, 524 date-qualified audit candidates, five reviewed Paladin-related identities (mechanics still partial).
- `python tests/milestone18-15-phb-paladin-browser.py`: passed.
- `python tests/milestone17-sources-browser.py`: passed.
- `python tests/browser-smoke.py`: passed.
- `python tests/milestone18-15b-rules-registry-browser.py`: passed.
- No production rules or saved-data migrations were performed.

### Milestone 18.15 — PHB Paladin Oaths (PARTIAL)

- `node --test --test-reporter=spec`: verify **25 new Paladin-oath tests** plus all previous tests.
- `python tests/milestone18-15-phb-paladin-browser.py`: all 3 newly available oaths, Vengeance Spellbook cast + Vow, Glory activations, Ancients damage resistance, save/reopen and mobile viewport.
- See `docs/MILESTONE_18_15_PARTIAL_PHB_PALADIN_OATHS.md` for supported versus manual behaviour. Do not label complete Paladin/PHB support based only on these tests.

### Milestone 18.13 partial subclass batch

- `npm test`: **396/396** Node tests passing (17 new cases for Lore, Land and Evoker).
- `python tests/milestone18-13-subclass-batch-browser.py`: new interactive browser integration, save/reopen, Circle grants, and mobile viewport.
- Prior checks verified: M18.12 subclasses, M18.11 batch, M18.8 Paladin and M18.1 typed damage.
- Rules not yet implemented are explicitly listed in `docs/MILESTONE_18_13_PARTIAL_SUBCLASS_BATCH.md`.

### Milestone 18.11 cross-class batch (partial)

- `npm test` — **367/367 passing** after implementation and from the clean release ZIP.
- `python tests/milestone18-batch-browser.py` — creates Barbarian 17, Bard 7 and Rogue 7; verifies UI controls, attacks, saving/reopening, actual Initiative start, Countercharm, Reliable Talent, and 390px mobile view.
- Ten Chromium workflows were confirmed with successful exit status, including M18.10/18.9/18.8/18.7/18.6/18.2/18.1/M16/M15.3. The older M17.6 supplement script printed PASS but its wrapper timed out, so it is not included in the successful exit count.
- Tested code is not proof of complete official-book coverage. See `docs/MILESTONE_18_11_PARTIAL_CROSS_CLASS_BATCH.md`.

## Milestone 18.10 — Barbarian / Berserker (partial)

- `node --test`: 343/343 tests passing, including 13 new Barbarian/Berserker checks.
- `python tests/milestone18-10-barbarian-browser.py`: passed (level 6 and 14, weapon rolls, resource state, persistence, mobile).
- Previously passing browser regressions rerun: Fighter, Paladin, Ranger, Rogue, typed damage, supplement-spell index.
- This is a partial SRD rules-engine increment, **not** evidence of complete class, PHB or official sourcebook coverage.

# Milestone 18.9 — Fighter / Champion mechanics (PARTIAL)

- New focused rules test: `node --test tests/milestone18-9-fighter-champion.test.cjs` (11 test cases).
- Full suite: `node --test` (330 tests, verified in working tree; verified again after extracting the ZIP).
- New browser integration: `python tests/milestone18-9-fighter-browser.py` (Champion two styles, Fighter actions, weapon critical, persistence, mobile).
- Prior browser regression runs: 18.8, 18.7, 18.6, 18.5, 18.4, 18.2, 18.1, 17.6, 16 spell audit, 15.3 all passed.
- **Unfinished scope:** full Fighter feature set; Champion Athletics/post-critical movement and most other Fighting Style effects; multiclassing; PHB completion; all-sourcebooks completion. See `docs/MILESTONE_18_9_PARTIAL_FIGHTER_CHAMPION.md`.

# Milestone 18.8 — Paladin combat and spell grants (partial)

- `npm test` / `node --test`: **319 tests passed** (14 new Paladin rules tests).
- `python tests/milestone18-8-paladin-browser.py`: Paladin create, Smite, Radiant Strikes, save/reopen, Touch, Spellbook class grants and Faithful Steed, 390px viewport.
- Prior browser regression workflows: 18.7 Ranger; 18.6 Rogue; 18.5 Bard/Fighter/Monk; 18.4 Wizard/Druid/Cleric; 18.3 defenses; 18.2 advancement; 18.1 typed damage; 17.6 supplements; 16.1 spell guides; 15.3 artwork. All passed in this build.
- Full limits and unimplemented features: `docs/MILESTONE_18_8_PARTIAL_PALADIN.md`.

# Milestone 18.7 — Ranger mechanics (partial)

- `node --test`: 305/305 passing (12 new Ranger mechanic cases).
- `python tests/milestone18-7-ranger-browser.py`: Ranger class / Spellbook Mark casting, weapon hit, save/reopen, Tireless, Nature’s Veil and mobile.
- The M18.6 / M18.5 / M18.4 / M18.3 / M18.2 / M17.6 / M17.3 / M16.1 / M15 browser scripts passed. Older M18.1 typed-damage browser script stalled and remains unverified.
- Partial release. Current all-sourcebook coverage and engine correctness are not complete.

---

# Milestone 18.0 — partial class mechanics foundation

- `npm test`: **233/233 passing** (12 new class-resource / passive / action / migration tests).
- `python tests/milestone18-class-mechanics-browser.py`: Chromium Fighter, Barbarian, Paladin and Sorcerer resource controls, rest handling, and mobile-width rendering.
- Inherited Chromium workflows pass for browser smoke, spellbook, backgrounds, species, equipment, supplement spells and M15.3 artwork.
- **Limitations:** in-memory browser storage is not proof of Windows persistence, and these tests do not establish completion of all 12 classes, 48 PHB subclasses, complete spell effects, or all official books.

---

# Milestone 17.6 — Official supplement spell references acceptance

- `npm test`: **221/221 passing** (five new source/index/access/manual-cast tests).
- `python tests/milestone17-6-supplements-browser.py`: UI source filter, reference details, manual cast modal, mobile layout.
- Inherited Chromium suites passed: M17.5 spells, M17.4 equipment, M17.3 species, M17.2 backgrounds, M16 Spellbook, M16.1 spell audit.
- The four supplemental books are not fully imported. Their 39 entries are **reference-only** and were published pre-2024; full current-rules compatibility, errata, mechanical automation, all-books indexing, and Windows persistence remain open. See `docs/SUPPLEMENT_SPELL_INDEX_AUDIT.md`.

---

# Milestone 17.5 — Unified spell references acceptance

- `npm test`: **216/216 Node tests** passing, including nine new cases for 391 unique PHB spell names, level distribution, aliases, source/class filters, reference-only mechanics, safe cast logging, personal spell pack import/removal and validation.
- `python tests/milestone17-5-spells-browser.py`: Chromium UI validates the wizard spell catalogue, source filters, PHB-only details, SRD full descriptions, initial spell selection, reference-only cast warning and 390px mobile layout.
- Inherited browser checks passing: `milestone16-browser.py`, `milestone16-spell-audit-browser.py`, `milestone17-2-origins-browser.py`, `milestone17-3-species-browser.py`, `milestone17-4-equipment-browser.py`.
- Additional Windows verification still required: save a new character's reference spell, close and reopen `Open The Folio.cmd`, export/import a full Library JSON backup, and confirm the spell ID and source survive; verify no auto concentration change when tracking a PHB-only cast.
- **Important:** 391 counts distinct *indexed PHB names*, not 391 spells with complete rules or mechanics. SRD rule text is bundled for 339; 52 PHB-only records are informational and legal personal imports are opt-in. Other commercial books' spells are not automatically included.

---

# Milestone 17.4 — Equipment and armor acceptance

- `npm test`: **207/207 Node tests** passed, including seven new dedicated equipment cases.
- `python tests/milestone17-4-equipment-browser.py`: catalogue browse/filter/details, add and equip armor/shield, speed and Stealth reminders, edit/save restrictions, tool DC descriptions, 390px mobile layout passed.
- Inherited browser suites passed: M17.3 species, M17.2 origins, M17.1 sources, M16 Spellbook, M15.3 artwork and browser-smoke.
- The browser harness uses inline HTML and memory storage; real Windows persistence and backup restore still require manual checks. Check source/licence and the remaining unimplemented rules in `docs/MILESTONE_17_4_RELEASE_NOTES.md`.

---

# Milestone 17.3 — Expanded species & trait references

- **200/200 automated Node tests** pass (`npm test`). Ten dedicated Milestone 17.3 checks cover sources, unique Changeling, species choices, invalid combinations, unknown speed, SRD passive calculations, saved features, full-library backups, user-provided species packs, and preventing modification of Pip's specialist sheet.
- **Six Chromium test workflows** pass: `milestone17-3-species-browser.py`, `milestone17-2-origins-browser.py`, `milestone16-browser.py`, `milestone15-browser.py`, `milestone15-3-browser.py`, and `browser-smoke.py`. These verify character creation, source labels, selected Changeling skills, missing-speed handling, safe source pack import, mobile width and previous functionality.
- These browser harnesses simulate local storage in memory. Windows `file://` persistence, sourcebook rights and complete official errata verification are **not** established by them. Check actual saved characters and backups using the local launcher before replacing the previous installation.
- Official non-SRD species records intentionally contain trait *names* and brief original source summaries, not copied commercial full rules or automated powers. See `docs/MILESTONE_17_3_RELEASE_NOTES.md` for limitations.

---

## Milestone 17.2 acceptance (November 2026)

- `npm test`: 190/190 Node tests passing, including seven initial origin-catalogue tests and two additional source pack selection/validation tests.
- `python tests/milestone17-2-origins-browser.py`: background/feat selection, prerequisite messages, +1/+1/+1 method, imported sourcebook background selection, mobile width.
- Additional passed browser suites: `milestone17-sources-browser.py`, `browser-smoke.py`, `milestone16-spell-audit-browser.py`, `milestone15-3-browser.py`.
- Still needs verification on Windows with real local saves and the launcher. No legal/proprietary sourcebook text was bulk imported.

## Milestone 17.1.1 — single current-rules baseline (revised)

- `node --test` — 181 Node tests including migration of older 17.1 `2014` settings, old character/library JSON backup import, safe source pack merging, disabled SRD checkbox, and preservation of combat resources and character Undo history.
- `python tests/milestone17-sources-browser.py` — Chromium UI: no edition select, always-on SRD 5.2.1, optional publication references, user-pack import, character sources, Undo, 390px responsive manager.
- Existing Milestone 15.3/16/16.1 Chromium regressions should continue to pass.
- Sourcebook labels are informational. Expanded character options and complete official errata audits require separate implementation/testing.

# Milestone 16.1 spell guidance acceptance

- **168/168 Node tests pass**, including five new tests for 339-entry coverage, source fidelity, old rules distinctions, non-mutating reference views, and HTML escaping.
- Chromium: `python tests/milestone16-spell-audit-browser.py` passes (source text and tips, 2024 distinctions, details open/close, 390px mobile).
- Chromium: `python tests/milestone16-browser.py` and `python tests/milestone15-3-browser.py` continue passing.
- Reference implementation: `js/spell-audit.js`; editorial ledger: `docs/SPELL_GUIDANCE_REGISTER.md`; limits: `docs/SPELL_GUIDANCE_AUDIT.md`.

# Milestone 16 — Spellbook personalization checks

- **163/163 Node tests pass** (`npm test`) including eight new checks for collections, multiple purpose tags, safe naming, filters, backup migration, independence, cross-character UI, and Elementalism.
- **Chromium M16 browser acceptance passes** (`python tests/milestone16-browser.py`): source groups/collapse, new folder and label, filing spells, by-purpose group, filtering, saved spell sets, Elementalism's five effects, per-character data surviving a fresh load, and 390px mobile layout with no horizontal overflow.
- **Inherited browser smoke passes** (`python tests/browser-smoke.py`), including SRD spells and casting. Browser harness uses inline offline HTML with memory storage; it is not a Windows `file://` persistence test.
- On Windows, **export a full Library backup before upgrading**. Open your original folio, write down Pip's current spell slots/prepared list, extract this build into a new folder, then open it and check both values are unchanged. Create a custom folder and tag; refresh and fully close/reopen the browser; export/import a full Library backup and verify the spell organization returns for the correct character.
- **Known limitations:** saved sets are view-only reference collections, not preparation switches; Pip's existing prepared-spell loadouts remain in Change preparations. M16.1 includes unique guidance coverage for all 339 spells; a line-by-line comparison against official SRD errata remains editorial follow-up. The planned M17 modular sourcebooks are not implemented in this milestone.

---

# Milestone 15.3 — Token-to-icon action and layout cleanup

- **155/155 Node tests passed** (`node --test`).
- Chromium integration (`python tests/milestone15-3-browser.py`) passes: remove duplicate reset from normal sheet, keep Restore default in layout edit mode, upload a portrait, choose butterfly as base emblem, click **Use this token as sheet icon**, and confirm the generated WebP image replaces the bookplate and persists across a fresh application load.
- Previous Milestone 15.1 layout/artwork browser test and Milestone 15.2 immediate portrait/emblem removal regression test pass.
- Windows `file://` persistence still needs real device verification; do a full library backup before installing.

# Milestone 15.1 — Local acceptance and verification

- **155/155 Node tests pass** (`node --test`) including five new checks for independent sheet icon/library art choices, safe defaults for old character artwork, and token source handling.
- Chromium browser checks pass for Milestones 13, 14, 15 and 15.1. New M15.1 check verifies the Options menu, book-based token rendering, wheel zoom, saved icon/card choices, stable drag-preview-then-drop, and the in-editor Restore default control.
- Chromium checks use a fully inlined page (no network requests) and memory-backed browser storage. The sandbox blocked direct `file://` navigation, so real Windows local-file behavior remains to be confirmed on the user's machine.
- Before installing, export your library backup. On Windows, test the token from a built-in book icon (without first uploading a portrait), save it as the sheet icon, close and reopen the browser, and confirm it persists. Also verify the library card choices and layout reset on the same local launcher.

---

# Milestone 15 — Local acceptance and verification

- **150/150 Node tests pass** (`node --test`). Five new regression tests cover universal book fallback, optional Pip butterfly, safe layout normalization, cross-column movement, character backup migration and isolation.
- **Milestone 15 Chromium browser workflow passed** (`python tests/milestone15-browser.py`): Sheet opens with unchanged default column positions; both book and optional butterfly presets render; layout editor exposes seven draggable panels; buttons move panels across columns; Cancel discards the draft; Save survives tab navigation and library backup export; duplicate characters preserve independent layouts; Restore Default removes saved custom order; real pointer drag works; mobile layout at 390 px shows no horizontal overflow. No uncaught browser errors.
- **Earlier Milestone 13 and 14 Chromium acceptance workflows also pass**. Automated tests use inlined local scripts with a simulated browser storage layer; no backend or cloud service is required.
- **Important on-device check:** In your Windows browser, export a full Library backup first, use the new build, customize a character’s layout, close and reopen the same local file or launcher, verify persistence, then import the backup into a fresh browser profile and confirm the layout and artwork. Full Windows `file://` persistence was not tested in the sandbox.
- Dragging moves the seven main character-sheet cards among three columns only. The HP/AC masthead is intentionally fixed. Resize/individual sub-panels, full animation of surrounding panels and cross-tab layout edits are future extensions.

---

# Milestone 14 — Local validation

- **145/145 Node tests passed** using `npm test`. Includes five new M14 tests for safe raster data, token settings, backward-compatible character normalization, per-character media isolation, full/single backup export/import, and duplication.
- **Chromium UI test passed** using `python tests/milestone14-browser.py`: portrait upload, individual sheet emblem upload, ring and token controls, PNG token download, save, character-library portrait preview, full library export containing artwork, duplicate character and independent emblems; no uncaught page JavaScript errors.
- The browser harness inlines local scripts and uses an **in-memory localStorage substitute** because direct `localhost` navigation is restricted in the test environment. The test does **not** prove persistent Windows `file://` or IndexedDB behavior after restarting the browser.
- **Manual Windows verification required:** export a full library backup from M13, extract this build to a new folder, import if necessary, upload images, save, close and restart the browser, and verify art persists. Export/import on another Windows browser to verify real migration before deleting the old folder.
- Test command: `npm test` (Node 18+) and optional `python tests/milestone14-browser.py` with Playwright/Chromium/Pillow. The optional browser test is not part of GitHub Actions.

---

# Milestone 13 — Local validation

- **140/140 automated Node tests passed**, including 4 new Milestone 13 regression cases.
- **Milestone 13 Chromium browser acceptance test passed** using a local inlined test harness: collapsible sections, collapse persistence across tabs, unified HP input and zero temporary HP, concentration DC and pass/fail, currency overflow, zero uncaught page exceptions.
- Testing did not verify Chrome/Edge `file://` persistence after restart on Windows; follow the manual backup/import checks below.
- Run `node --test`, and optionally `python tests/milestone13-browser.py` with Playwright and Chromium installed.

---

# Milestone 12 — Validation and Windows checklist

## Verified in this build

- Automated Node tests: **136 / 136 pass**, including 131 inherited test cases and five dedicated polyhedron/animation cases.
- Inherited Milestone 10 browser smoke: **pass** (character creation/homebrew, spells/casting, weapons/attack, Quick Roll, progression, Pip isolation, mobile).
- Inherited Milestone 11 appearance browser workflow: **pass** (themes, custom backgrounds, backups, Undo, mobile).
- Milestone 12 browser workflow: **pass** (unnumbered SVG picker, 3D canvas renders and visibly changes frames mid-roll, 2d6+3 result range, d20 Advantage, Escape and focus, result history, Pip stats unchanged, spellbook navigation, 390px screen with no horizontal overflow). Zero uncaught browser exceptions observed.
- Packaged ZIP was extracted into a fresh directory and Node tests rerun; source and asset counts confirmed.

## What the 3D roller is and is not

The picker icons are **SVG silhouettes of real polyhedra**. The animated dice in the new tray use complete 3D vertex/face meshes projected by a lightweight local canvas renderer. Random numbers are generated by the existing unbiased dice engine, then animated meshes orient to the corresponding outcome. **This is not a physical force/collision simulation** and the displayed numerals are the authoritative result. A fully physics-driven dice simulator is feasible using Three.js + Cannon-ES or BabylonJS + AmmoJS, but its engine and offline asset handling have not been shipped.

## Manual Windows checks (not verifiable inside this container)

1. **Export library** in the previous version; keep JSON outside the downloaded ZIP folder.
2. Extract this repository into a *new* folder. Open `the-folio/Open The Folio.cmd`, or double-click `index.html`. Confirm Chrome/Edge opens without starting a server.
3. If characters do not appear, use Library → Import backup, then confirm Pip's HP, prepared spells, campaigns, appearance, and custom backgrounds.
4. Open Quick Roll and verify all six shape-only icons, 3D visual tumble, totals, history, modifier, multiple dice and Advantage/Disadvantage. Try system **Reduce Motion**.
5. Apply a new theme with a background image. Refresh then close and restart the browser; confirm it persists. This specifically tests real IndexedDB/file:// storage, which the sandbox does not prove.
6. Export the whole Library again. Open in another Chrome profile or on another PC and import the JSON file; confirm themes and backgrounds restore.
7. Print the character sheet from the Journal and inspect readability in light and dark themes. Test keyboard navigation and Escape on your screen reader if applicable.

No server, login or subscription is used. This is not a compiled Windows `.exe`; the optional `.cmd` launcher opens a local HTML document in the system browser. Browser storage is origin-dependent, so continue exporting library backups.

---

# Milestone 11 — Verification Report

## Results

- **131/131 automated Node tests passed** from `node --test` (including the 122 inherited tests).
- **Inherited Milestone 10 browser smoke passed**, covering spell selection/casting, homebrew, weapon attacks, Quick Roll, levels, Pip isolation, and mobile width.
- **Milestone 11 browser workflow passed**, covering the Appearance form; default presets for Pip and a new character; live preset and dice-colour previews; Apply; Undo; original HP unchanged; saved reusable theme loading between two characters; safe PNG-to-WebP local conversion and background positioning; actual JSON download containing theme/image data; responsive 390px mobile layout; zero uncaught JavaScript errors.
- Tested safe palette normalization, invalid background data rejection, contrast calculation, numbered custom-colour dice, existing v6 backup migration, and full-library theme export/import with duplicate ID handling.
- Browser harness uses Chromium with local scripts/assets inlined and **simulated browser localStorage**. Real `file://` navigation, independent Chrome/Edge Windows double-click opening, and IndexedDB persistence across browser restarts were **not verified** because the test environment blocks direct local navigation. Screenshots are in the optional `test-output/` folder when the browser tests run.

## Manual Windows checks to perform

1. Export a **full Library JSON backup** in the old Milestone 10.1 app and keep it outside the project folder.
2. Extract the previous version into a new folder. Double-click its `index.html`, import your old Library backup and confirm all old characters remain.
3. Open Pip → Appearance. Check Midnight Masquerade and the old AC/HP; try Enchanted Forest, apply and Undo.
4. Create a new character and confirm Classic Parchment. Save and load a reusable theme between characters.
5. Select a private image and choose position/overlay; Apply, refresh, then restart the browser. Confirm image and theme remain and no Save Failed warning appears.
6. Open Quick Roll, choose a different die material/colours, and roll d6 and d20. Check dice values and that rolls are unaffected.
7. Export full library backup, close app, then import a copy into a clean browser profile. Confirm artwork, saved themes, campaigns, homebrew and character data restore.
8. Verify small-screen text/contrast and print layout with your own device.

## Limitations

- Uploaded backgrounds are compressed to preserve local storage/backups; detailed art may lose quality. Storage is browser-local; neither sharing nor cloud sync is provided.
- The dice are correctly numbered, coloured **SVG illustrations**, not real-time 3D dice and do not offer texture-map uploads or a physics engine. Only appearance changes; Quick Roll's random-number logic is unchanged.
- Custom colours may result in poor contrast; the editor warns but allows the user to decide.
- No full cross-class/multiclass rules engine, automatic Wizard acquired-spellbook logic, or universal spell/feature simulation yet. Old level 7–8 Pip progression limit remains.
- No real Chrome/Edge browser restart/IndexedDB test was possible in this environment. Recommend exporting JSON backups regularly.

---

# Historical Milestone 10 — Verification report

## Automated tests

- Run from `the-folio`: `node --test` (Node 18+).
- **119 / 119 passing**, zero failures in the final source run.
- The original 104 baseline tests remained passing. Added tests for preparation/access rules, queued swaps, mastery caps, unknown AC and Pip spell levels; then six more for Homebrew Library spell/weapon/item import, invalid data, duplicate detection, escaping, and source immutability.

## Browser interaction smoke test

Run `python tests/browser-smoke.py` with Playwright Chromium installed.

**Passed**, with no uncaught JavaScript exceptions. Verified:

1. Created a homebrew species, spell and weapon in the Library; built a level-5 Wizard using the species.
2. Imported the saved custom spell into the Wizard's Spellbook, and custom weapon into Inventory.
3. Opened the class-filtered 339-spell catalogue, selected a valid initial list, recorded slot spending and concentration.
4. Opened bottom-left Quick Roll, confirmed animated rolling, 2d6+3 range and history/result display.
5. Opened the 38-weapon catalogue, added/equipped a Longsword, and used Attack / Roll against an entered AC.
6. Spent and undid a Wizard spell slot, leveled the Wizard to 9, switched to Pip and verified Pip's 60 HP/AC 17 and specialist spell layout.
7. Verified library and builder at a 390-pixel mobile width without page-level horizontal overflow.

This harness **inlines local assets into Chromium and uses simulated localStorage**. Browser navigation directly to local `file://` files or local HTTP URLs was blocked by the execution environment. Thus these tests do **not** establish real Chrome/Edge double-click launch or IndexedDB durability across browser restarts.

## Rules review

Verified against D&D Beyond's published 2024 Basic Rules and SRD 5.2.1: level-dependent slots; concentration and ritual metadata; Paladin/Ranger one spell replacement after a Long Rest versus the more flexible Cleric/Druid/Wizard preparation changes; single spell-slot expenditure limit per turn; weapon mastery class-count restrictions. Some special-case handling remains intentionally manual and is explained in the user interface and README. See `ATTRIBUTION.md` and the bundled data license documents.

## Manual Windows checks still needed

1. Export **Milestone 9 Library JSON** before replacing anything. Extract this ZIP as a new folder, double-click `index.html`, and confirm Pip opens.
2. Create a Wizard, select spells, cast one, refresh the browser, verify that the slot was spent, and Undo.
3. Create a homebrew weapon/spell in the Library, import it into a character, edit its details, and confirm the original reusable entry didn't change.
4. Roll a d20 and 2d6+3 from the bottom-left Quick Roll window. Close and reopen the roller.
5. Test ammunition usage with a bow and make sure the inventory quantity changes only on a recorded shot.
6. Close and reopen the browser (same file location/profile); confirm characters, saves and campaigns remain. Export the library again.
7. Compare a few spell/weapon outcomes with your DM and sources, particularly class-specific and homebrew exceptions.

## Known limitations

- Not every 2024 class feature, subclass action, feat, spell effect, attack target resolution, or weapon mastery trigger is implemented automatically.
- Wizard spellbook ownership/learning and a complete per-turn action-economy engine are not implemented; individual casting actions still require user judgment.
- Published sourcebooks beyond the SRD 5.2.1 have no guaranteed full catalogue coverage.
- Not tested: actual native Windows `file://` startup, IndexedDB across browser restarts, independent screen reader testing, low-performance phones, or printer hardware.

## Milestone 10.1 focused checks

- Six SVG dice load and show numbered, distinct polyhedral facets in Quick Roll, including d6 and d20. The asset generator asserts the true total mesh face count before drawing camera-facing polygons.
- Quick Roll still gives valid random totals with count/modifier and Advantage/Disadvantage.
- Clicking the Folio brand from a character returns to the Library and the old top-bar Library button is absent.
- Paladin spell level progression: level 7→max spell level 2, level 9→3, level 13→4, level 17→5. Pip's original build has separate level-7/8-only restrictions.
- Multiclassing is *not* implemented; no cross-class rules were simulated.


### Milestone 18.1 — Damage regression

- `node --test tests/milestone18-1-damage.test.cjs` checks Rage physical resistances, untyped/nonphysical fallback, nonstacking resistance, vulnerability after resistance, immunity, temporary HP, concentration DC, invalid input, and saved audit metadata.
- `python tests/milestone18-1-damage-browser.py` checks the actual class+HP user flows, Undo, manual per-hit switches, and mobile UI.
- All other automated and documented browser tests should remain green. This does not prove full class/subclass rules coverage or Windows installation persistence.

### Partial M18.5 verification
- `npm test`: 283 passing tests, including 15 new targeted Bard/Fighter/Monk actions cases.
- `python tests/milestone18-5-class-actions-browser.py`: create, apply, save/reopen and 390px test.
- Manual Windows deployment, every class feature, and all commercial sourcebook content remain unverified.

### Partial M18.6 verification

- `node --test tests/milestone18-6-rogue-strikes.test.cjs`: validated Rogue Sneak Attack hit/miss, criticals, eligibility, Cunning Strike costs/requirements and persistent state shapes.
- `python tests/milestone18-6-rogue-browser.py`: created a new Rogue, equipped a Dagger, applied real Sneak Attack/Cunning Strike damage, saved/reopened, reset on new turn, and checked mobile UI.

### Partial M18.14 verification

- `node --test tests/milestone18-14-srd-subclasses.test.cjs`: 17 new checks for Devotion, Hunter and Open Hand trigger restrictions, hit/miss/critical damage, resources, persistence and rest behavior.
- `node --test`: **413 passing** automated tests in the development tree.
- `python tests/milestone18-14-subclasses-browser.py`: end-to-end subclass UI and 390px mobile checks.
- Earlier 18.13, 18.12, 18.11, Paladin, Ranger, Rogue, typed damage, Spellbook and artwork browser regressions were rerun locally. Windows installation/persistence and full PHB mechanical coverage remain unverified.
