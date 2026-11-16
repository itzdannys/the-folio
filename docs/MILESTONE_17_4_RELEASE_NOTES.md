# The Folio — Milestone 17.4: Equipment Overhaul (SRD foundation)

## What is included

- **144 browsable non-weapon entries** in `js/equipment-catalog.js`: 12 suits of armor, one shield, artisan and other tools, gaming sets, instruments, foci and holy symbols, equipment packs, ammunition, adventuring gear, and starter scroll references. Each entry has a group, name, SRD price, weight where listed, and original short use guidance.
- **38 standard weapons** remain available through the existing weapon catalogue, with their damage, range, weapon properties, mastery, cost and weight. Newly added weapons also retain separate price/weight provenance in inventory.
- **Inventory → Browse armor & gear**: searchable and category-filtered list with Details and Add. Adding a catalogue item creates an ordinary editable inventory entry, not an automatic purchase or currency transaction. Existing equipment remains intact.
- **Armor rules:** light/medium/heavy AC formulas and shields retain their prior calculations. This milestone adds the SRD Strength requirement and its *10-foot movement penalty* for equipped heavy armor, and a warning for armor-imposed Stealth disadvantage. No changes are made to characters with no equipped armor. Only one suit of armor and one shield can be equipped.
- **Tools:** named tool variants have the default 2024 ability and common Utilize DCs. Craft references and manual use cues are visible, but tool checks and crafting do not automatically award proficiency, apply resources or create items.
- Source/price/weight/tool/armor restrictions survive inventory edits, JSON backup round-trips, ordinary save migrations, and the existing character Undo mechanism.

## Rules caveats and remaining work

- **Training is not yet fully validated.** The SRD requires armor and shield training: untrained armor restricts spellcasting, and shield training is needed for its AC bonus. Folio displays these reminders, but it currently trusts the *Equipped* flag and does not enforce all training grants across classes, subclasses and feats. Users must check training. A class-aware training engine is planned for Milestone 18.
- **Stealth disadvantage is a reminder**, not a modifier imposed on all user-rolled skill checks. Don/doff times, heavy weapon use, shields' hand occupation, ammunition and equipment pack contents, consumable usage, tool crafting, purchasing and encumbrance are currently manual or partly implemented. Item weights and prices are references, not a complete encumbrance/commerce engine.
- The catalogue is an **SRD 5.2.1 baseline**, not every weapon/item in every official 5e book. Existing personal homebrew equipment imports remain available. Other books need permitted user-provided data and source/version integration; a toggled sourcebook is not an entitlement to unbundled copyrighted descriptions.
- The user's preference for **one modern ruleset with the newest official version of each option** remains unchanged. Older unsuperseded compatible options remain a long-term goal, and every installed entry must be attributed.

## Verification

- `npm test`: **207/207 passing**, including seven new equipment tests (catalogue inventory, searches, penalties, armor formulas, prices/metadata persistence, stowing, and unchanged baseline calculations).
- Chromium interactive check: `python tests/milestone17-4-equipment-browser.py` passed search/filter, armor/tool Details, adding and equipping chain mail and shield, editing armor restrictions, saving, and a 390px mobile catalogue.
- Six inherited Chromium workflows also pass: species M17.3, backgrounds M17.2, Spellbook M16, artwork M15.3, source manager M17.1.1, and the overall browser smoke.
- Browser tests use inlined scripts and in-memory browser storage. They do **not** establish Windows `file://` or IndexedDB migration; verify that locally before retiring an earlier installation.

## Official source

- [SRD 5.2.1](https://www.dndbeyond.com/srd) (Creative Commons BY 4.0).
- [2024 Basic Rules — Equipment](https://www.dndbeyond.com/sources/dnd/br-2024/equipment) (armor, weapons, tool DCs, adventuring gear prices and weights).
- `EQUIPMENT_DATA_LICENSE.md` records the licence and transformations.

## Upgrade

Export a complete **Library JSON backup** from the previous build, extract this complete project into a different folder, run **Open The Folio.cmd**, and inspect Pip's inventory, AC, movement, artwork and other characters. Keep the older folder and backup until you have confirmed everything on your Windows system.
