# Milestone 18.14 — Partial SRD subclass mechanics batch

**STATUS: PARTIAL.** This is a tested addition to The Folio, not completion of Milestone 18, the 2024 Player's Handbook, or the goal of supporting all official D&D 5e sourcebooks. Nothing from paid manuals is newly bundled here.

## Rules source

Wizards of the Coast, *System Reference Document 5.2.1* (CC BY 4.0), pp. 52 (Warrior of the Open Hand), 56–57 (Oath of Devotion), 61 (Hunter). Verified using the owner-supplied official PDF. See `ATTRIBUTION.md` for required attribution. Entries are implementation logic, not a claim to distribute full commercial sourcebooks.

## Functioning, tested features

### Oath of Devotion (Paladin)

- **Sacred Weapon (level 3):** Select an equipped Melee weapon, expend one Channel Divinity use and record a 10-minute effect. The specific weapon's attack rolls receive Charisma modifier (minimum +1), including the weapon roller's actual hit result; it never affects other weapons. End it manually, or it expires on a Short Rest. The option to deal Radiant instead of normal weapon damage remains a manual DM/player choice; Folio does not change that damage type automatically.
- **Oath spells:** Ten level-gated, always-prepared SRD spells (two each at levels 3, 5, 9, 13, 17), without counting against regular preparations. All 10 names resolve to actual SRD catalogue records.
- **Aura of Devotion (level 7):** Blocks applying the Charmed condition to the character while the aura is active (not Incapacitated). Allied-character auras and an already present condition must still be handled manually.
- **Holy Nimbus (level 20):** A once-per-Long-Rest activation, or a level 5 slot to activate again after its free use. Manual dismissal and rest expiry. Enemy start-of-turn damage, allied positions, Fiend/Undead saves, sunlight range, and the 10-minute duration are shown for manual resolution.
- **Smite of Protection (level 15):** Reference reminder only; the +2 Half Cover effect for the character and allies is not yet automatically added to AC or saves after Smite.

### Hunter (Ranger)

- **Hunter's Prey:** Persistent selectable Colossus Slayer or Horde Breaker after a confirmed Short or Long Rest. If Colossus Slayer is selected, confirm a wounded target and use a target AC in the weapon roller to apply **1d8 extra weapon-type damage** once per tracked turn, including critical-hit doubling. Misses cost no use. Reset via the new-turn button, or at the start of the player's tracked initiative turn.
- **Defensive Tactics (level 7):** Persistent choice of Escape the Horde or Multiattack Defense, both recorded for reference; adversarial attacks remain manually resolved.
- **Superior Hunter's Defense (level 15):** Spend a tracked Reaction and select the incoming damage type to activate Resistance. Typed damage then applies that Resistance in the correct order; explicitly end the effect when the current turn ends, or at a rest. It cannot automatically identify the attacker or the triggering hit.
- **Hunter's Lore** and **Superior Hunter's Prey (level 11):** The character sheet describes them, but Folio does not yet inspect enemies' resistances or apply a secondary Hunter's Mark hit to another creature.
- **Horde Breaker:** Described, but the bonus attack and its eligible secondary target are **not** automatically rolled.

### Warrior of the Open Hand (Monk)

- **Open Hand Technique (level 3):** After spending Focus to activate Flurry of Blows, the player can confirm up to the recorded number of Flurry strikes that hit, then apply Addle, Push or Topple. Saves use calculated Monk Wisdom DC. The DM still applies target conditions, movement and saves.
- **Wholeness of Body (level 6):** Roll Martial Arts die, add Wisdom modifier, restore the Monk's actual HP (max HP enforced), consume 1 of Wisdom-modifier uses (min 1), with Long Rest recovery.
- **Quivering Palm (level 17):** Confirm an Unarmed Strike hit and target, spend 4 Focus Points, save the marked target across reopening and rests, release and roll **10d12 Force**, with half damage on a confirmed successful Constitution save. The DM applies damage and verifies same-plane targeting and timing.
- **Fleet Step (level 11):** Reminder only; an action/bonus-action scheduler does not yet exist.

## Shared improvements

- Short Rest now expires timed Sacred Weapon, Holy Nimbus, Hunter's temporary damage resistance and pending Open Hand Flurry hits.
- Long Rest preserves Hunter's selected tactics, Fiend's chosen damage resistance and active Quivering Palm vibrations (which may last days); free-use resources recover normally. Changing subclasses clears incompatible class-state choices.
- Existing weapon damage decomposition includes Colossus Slayer's additional damage in the correct weapon-type component.
- Existing class progression, Spellbook, art, other subclass mechanics, characters, layout, backups and offline functionality are retained.

## Not complete / missing

- No complete 2024 PHB or all-official-sourcebook rules catalogue. Many PHB feats, species abilities, subclasses and spells remain incomplete or reference-only.
- Additional Oath of Devotion, Hunter and Open Hand features marked as manual above are not automated. No universal enemy HP/conditions/position model, turn action economy, automated durations, ally aura application, or encounter target saving throws.
- SRD class/subclass audit and paid-book content implementation remain unfinished. These three subclasses are **partially implemented**, not finished.

## Verification (local Linux/Chromium)

- **413 / 413 Node tests passed** (396 previous + 17 new dedicated tests covering subclass access, spells, resource costs, damage, critical hits, missed attacks, choice persistence and rest flags).
- New Chromium workflow: Oath of Devotion Sacred Weapon and Holy Nimbus, Hunter choice/Defense, Open Hand healing/Flurry/Quivering Palm, saved-character reopening and 390px mobile.
- Earlier regression scripts checked: 18.13 Lore/Land/Evoker, 18.12 Life/Fiend/Draconic, cross-class mechanics, Paladin Smite, Ranger Hunter's Mark, Rogue Sneak Attack, typed damage, Spellbook reference, and artwork/token hotfix.
- Does not validate all D&D interactions, actual Windows `file://` persistence or every official option. A Windows user should backup and verify their own existing library on a copied installation.

## Upgrade

Export a full **Library JSON backup** from your previous Folio, unzip this release into a **new folder**, run `Open The Folio.cmd` and verify character sheets, Spellbook, resources and saved art. Retain the previous build as a rollback.
