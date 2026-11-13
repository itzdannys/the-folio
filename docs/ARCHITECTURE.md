# Architecture

The Folio is a **client-side, offline-first application** that works from a local `index.html` file. It does not require the optional development server for normal use.

## Runtime flow

1. `index.html` loads the JavaScript modules in order, followed by the main app bootstrap.
2. The Library manages independent character stacks and campaign folders (`js/library.js`, `js/library-ui.js`).
3. Character and rules modules derive displayed stats, resources, spell access, and weapon actions (`js/character*.js`, `js/core.js`, `js/builder*.js`, `js/rules-*.js`).
4. UI modules render the Sheet, Combat, Spellbook, Inventory, Journal, Appearance and Quick Roll.
5. `js/storage.js` handles local persistence. Use exported JSON as the portable recovery format.

## Important modules

| Area | Main files |
| --- | --- |
| App orchestration | `js/main.js`, `js/ui.js` |
| Character library & campaigns | `js/library.js`, `js/library-ui.js` |
| Character building & homebrew | `js/builder.js`, `js/builder-ui.js`, `js/homebrew-bridge.js` |
| Stats, inventory, journal | `js/core.js`, `js/character.js`, `js/inventory*.js`, `js/journal*.js` |
| Spells, catalogues and rules | `js/spell-catalog.js`, `js/spells.js`, `js/rules-engine.js`, `js/rules-ui.js` |
| Weapon mechanics | `js/weapon-catalog.js`, `js/weapon-rules.js` |
| Random dice results and 3D drawing | `js/dice.js`, `js/dice-3d.js`, `js/dice-geometry.js` |
| Appearance & themes | `js/appearance.js`, `js/appearance-ui.js` |
| Local storage | `js/storage.js` |

## Working on the project

- Preserve **per-character data isolation**. Do not let switching characters share a mutable active-resource object.
- Preserve the **compact grouped Spellbook** as the everyday view; the larger catalogue belongs inside preparation management.
- Preserve direct offline operation: do not introduce runtime network dependencies.
- Keep actual random dice calculations independent from the 3D animation.
- Update `TESTING.md` and add regression tests for changes affecting character state, imports, or calculations.

See the main [README](../README.md) for launch and testing instructions.
