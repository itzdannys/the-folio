# Milestone 17.2 — Current rules, sources and selectable personal metadata

The Folio is an **offline, personal character manager**. It uses **one revised D&D 5e rules baseline** implemented from the bundled SRD 5.2.1. There is no edition selector and the SRD baseline is always enabled.

## What works now

- **Rules & Sources** in the library shows the included SRD and optional reference books/personal packs. Campaign and character source references can inherit or override library defaults; this does **not** alter mechanics.
- The source registry records a publication, provenance/licence and implementation status for included builder, spell and weapon entries. Names of commercial sourcebooks are **placeholders only**, not included copies of their content.
- For content we implement later, the desired policy is to use the **latest official version** of an option; older material remains eligible only if not replaced and compatible with the current rules. The present registry does not yet perform a complete cross-book deduplication/errata check.
- User-owned metadata-only JSON packs can be imported locally. They are safe reference entries, **not executable rule modules**. Imported background, feat and species entries can be selected in the builder using basic user-provided metadata. **Milestone 17.5 also accepts personal spell entries** in the spell catalogue, with no automatic rule effects. Complex automation still requires manual sheet entries; Homebrew Library remains the better choice for more extensive custom mechanics.
- Full-library/character exports retain references and settings. Full-library exports also include custom packs. Individual character exports do not bundle pack definitions.

## Migration from earlier 17.1 builds

- Old global/campaign/character `edition` settings are removed during loading/importing because earlier 2014 selection was **reference-only**; it never changed the calculation engine.
- Old core references `srd-2014` and `phb-2014` are mapped to `srd-2024` and `phb-2024`. Other selected publications and personal packs stay referenced.
- Source inheritance on a moved/deleted campaign is preserved, including older character backups. HP, inventory, spellbook, preparation, resources, appearance, and Undo snapshots are not converted.
- Personal packs tagged `2014` remain available as **legacy reference entries** with a compatibility warning. They do not grant older rules or automatically replace newer options.
- To switch installations, first export the entire library as JSON. Keep your previous folder and backup until the new project has loaded correctly.

## Source pack JSON (inert metadata only)

Import from **Library → Rules & Sources → Import source pack**:

```json
{
  "format": "folio-source-pack",
  "version": 1,
  "id": "user-my-campaign",
  "name": "My Campaign Notes",
  "published": "2026-11",
  "license": "User-created",
  "description": "Personal notes and table references",
  "entries": [
    {
      "id": "lantern-rite",
      "name": "Lantern Rite",
      "category": "spell",
      "description": "Original short note; resolved at the table",
      "prerequisites": ["DM approval"]
    }
  ]
}
```

The `edition` field is **optional** and defaults to `current`. Legacy packs may retain `edition: "2014"` as **provenance only**. `2024` and `both` are also accepted for older backup compatibility; none switches the app's rules.

- `id`: lowercase letters/digits/hyphens; must begin with `user-`.
- `category`: `class`, `subclass`, `species`, `background`, `feat`, `spell`, `weapon`, `item`, or `feature`.
- Max 150 entries per pack, 25 imported packs, 512 KB JSON import size.
- Duplicate IDs, malformed data, unknown categories and executable content are rejected/treated as inert text. Display strings are escaped.
- Removing a user pack removes its reference metadata, not a character's selections or saved spellbooks. Missing references remain visible until re-imported.
- Whole-library merge remaps colliding imported pack IDs, including imported campaign/character references. It does not overwrite a previous pack.

## Known limitations

1. There are 16 PHB background metadata entries and 25 feat choices in Milestone 17.2, but no complete paid-book class, subclass, feat or species catalogue is bundled. Selecting *Eberron* does **not** install Changeling; selecting *Heroes of Faerûn* does **not** install Noble Genies.
2. Source preferences are currently informational. Imported background and feat entries become selectable after import, but the builder and spell/weapon catalogues are **not comprehensively filtered** by optional source toggles.
3. Automatically comparing all content across books, recognizing superseded options, supporting all feat selections, checking every erratum, and delivering full level-up automation are follow-up milestones.
4. Some 2024 SRD features are still manual. Earlier spell guidance coverage was not a full independent official 339-spell verification.

## Provenance and rights

Bundled SRD 5.2.1 content is used under **Creative Commons Attribution 4.0**; see `ATTRIBUTION.md` and `SPELL_DATA_LICENSE.md`. Official SRD page: https://www.dndbeyond.com/srd (latest downloadable SRD was 5.2.1 as checked November 2026). Choosing a sourcebook **does not** confer rights to distribute copyrighted book text or install commercial options. Import original notes only when authorized.

## Milestone 17.2: selectable sourcebook notes

The source manager now accepts optional **simple, bounded mechanical metadata** for `background`, `feat` and `species` entries in user-owned JSON packs, which then appear in the character builder. This makes the system extensible beyond the hard-coded list of officially named references.

- `background`: optional `abilities` (up to three lower-case `str`, `dex`, `con`, `int`, `wis`, `cha` values), `skills` (up to eight names), `tool` and `feat` (short labels). Without an ability list, the app won't invent background increases.
- `feat`: optional `featCategory` (`Origin`, `General`, `Fighting Style`, `Epic Boon`) and `minLevel` (1–20). Other prerequisites are notes only and require verification. Complex effects are not automated.
- Every imported entry is labelled **user-entered** with its pack source. Removing the optional pack doesn't remove an existing character: its selected option is stored in the character's build snapshot.
- Example template: [`example-source-pack.json`](example-source-pack.json). You can import that file using **Library → Rules & Sources → Import source pack** and then replace its fictitious entries with your own lawful notes. A source pack is neither an official digital entitlement nor a way to extract content from D&D Beyond.

Limitations: Some official sourcebooks contain mechanically equivalent or superseded options, and imported notes aren't automatically deduplicated against new revisions; resolve these manually until the future version-resolution milestone.

## Milestone 17.3: selectable species metadata

Source packs can now also provide **species** options to the character builder. A `species` entry may contain these optional fields in addition to `id`, `category`, `name` and `description`:

- `speed`: integer from 0 to 120 (feet). If omitted, the builder requires a manual speed from the book. It will **not** assume 30 feet.
- `sizes`: unique list containing `Small`, `Medium` (up to two values). Empty means the user must confirm the actual allowed sizes from the sourcebook.
- `creatureType`: label up to 60 characters (for example `Fey` or `Humanoid`). It remains descriptive; type-specific spell rules are not automatically enforced.
- `traits`: up to 12 short trait names (100 characters each). The builder creates separate reference feature rows for those traits, but will not fabricate triggered effects or spell grants.

Example (original fictional species, not a published D&D option):

```json
{
  "id": "moonling",
  "category": "species",
  "name": "Moonling",
  "speed": 35,
  "sizes": ["Small"],
  "creatureType": "Fey",
  "traits": ["Moon Step", "Night-Sight"],
  "description": "Personal, original campaign reference."
}
```

Species content is **user-entered and inert**; data imports are not official entitlements or executable code. The chosen species and its known metadata are snapshotted on each character, so deleting a pack later does not invalidate an existing build. Switching away from a newly-created species removes previously tracked automatic skill grants, while preserving separately recorded manual skills. Older builds without grant provenance may retain some former proficiencies for manual review.

The bundled 2025 Eberron Changeling is a selectable **reference record** with the two skill choices publicly described by D&D Beyond; full transformation state tracking and active advantages remain future work. Later 2026 species records are names and feature titles only until licensed or personally supplied mechanics are available.

## Personal spell references (Milestone 17.5)

In your own pack's `entries` array, add an entry such as:

```json
{
  "id": "star-song",
  "category": "spell",
  "name": "Star Song (original example)",
  "level": 2,
  "classes": ["Bard", "Wizard"],
  "school": "Illusion",
  "castingTime": "Action",
  "range": "60 feet",
  "components": "V, S",
  "duration": "Instantaneous",
  "concentration": null,
  "ritual": null,
  "description": "Fictional spell. Use my own handwritten rules at the table."
}
```

Choose level 0–9, at least one valid class (`Bard`, `Cleric`, `Druid`, `Paladin`, `Ranger`, `Sorcerer`, `Warlock`, `Wizard`, `Artificer`), and optionally enter your own metadata. A missing concentration/ritual value should be `null` (unknown). Source pack imports never run custom code. The content is labeled **manual rules** even when all optional metadata is supplied. Only the name, level and class list are needed to show the entry in spell selection. `Artificer` is accepted for future compatibility, but the current builder has no automated Artificer spell list yet.

A selected personal spell is snapshotted into its character's Spellbook so removing the pack does not break the existing character; its full unselected catalogue entry is no longer available afterward. Use a full-Library backup to preserve packs themselves. The sourcebook selector is metadata organization, not a legally authorized distribution mechanism for commercial text.

## Official supplemental spell references (Milestone 17.6)

The unified catalogue now includes 39 **names and metadata only** from four official supplements beyond the PHB. The names appear alongside SRD spells in class-eligible selections and can be filtered by source. This does **not** import paid spell text, validate all 2024 compatibility questions, or make whole books available. For a personal rules note, continue to use a local user-owned source pack.

Wildemount Dunamancy is conservatively gated to suitable Wizard traditions; use a personal reference or DM override for special permissions until character advancement and access grants are modeled more completely.

See `SUPPLEMENT_SPELL_INDEX_AUDIT.md` for the indexed entries and official publication links.
