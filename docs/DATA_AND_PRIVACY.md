# Data, backups and privacy

The Folio is built for **personal, local use**. No sign-in, cloud database, or API key is needed to play. Source files and application assets are included in the project.

## Where data lives

Character state is stored by the browser for the app's origin (using IndexedDB or a fallback where available). This storage is **not part of the checked-in repository**. There is no automatic synchronization with GitHub or another computer.

- Different browsers, profile modes, and project locations can have separate save stores.
- Clearing browser site data can erase locally saved characters.
- Keeping GitHub source in sync is **not** the same as backing up saved character data.

## Backups

1. Open the Library and select **Export library**.
2. Store the downloaded JSON somewhere safe **outside the repository** (for example, a separate backup folder).
3. Keep occasional dated copies, especially before updating the application.
4. If restoring, use **Import backup**, then verify several characters and themes manually.

Do not commit backup JSON, personal notes, private character sheets, screenshots containing personal information, or sourcebook scans. The repository `.gitignore` excludes typical backup names, but you should always review `git status` before publishing.

## Custom backgrounds

Uploaded images are processed locally and saved with the character. They can make JSON exports larger. Include your character's exported backup if you want to preserve that custom background elsewhere.

## Privacy scope

This application is not a security vault. Anyone with access to your Windows account and browser profile may be able to see your local characters. Avoid storing passwords, sensitive personal records, or private account tokens in character notes.
