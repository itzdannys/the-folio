# Windows: start here

1. Right-click the downloaded Milestone 12 ZIP → **Extract All**. Don't run files from inside the ZIP.
2. Open the extracted **the-folio** folder.
3. Double-click **Open The Folio.cmd** (or **index.html**) to open in Chrome/Edge. This starts no server, uses no internet, and requires no installation.
4. In the Character Library, open Pip or create a new character. **THE FOLIO** logo returns to the Library.
5. Open **Roll** at bottom left: the button row contains number-free d4/d6/d8/d10/d12/d20 shapes; clicking one opens a genuine 3D mesh animation in a small tray, then reports the numeric roll below it. To change dice colors, use **Appearance**. Press **Escape** to close the tray.
6. Your edits autosave locally. **Export library** regularly. A new folder or browser may have a different storage location; use **Import backup** if previous characters are missing.
7. For source editing, open this folder in VS Code. Node is optional for tests (`node --test`); it is not required for play.

### Does the dice tray run real physics?

It draws and rotates real three-dimensional polyhedral meshes using offline canvas. The bounce/tumble is animated, but not a full rigid-body collision simulation. Numerical results come from the unbiased dice randomizer. A future physically simulated version would need a dedicated physics engine and additional offline packaging.

### Data safety

Export the full library before upgrading. Don't put JSON backups, private notes, or copyrighted source PDFs in your Git repository. No sharing, login or cloud sync exists.
