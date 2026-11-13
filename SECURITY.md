# Security and data safety

The Folio is an **offline personal application**. It does not include accounts, online sharing, or a hosted character database.

## Reporting concerns

If the repository is public, avoid posting private character backups, personal data, or security-sensitive details in a public issue. Contact the maintainer through their [GitHub profile](https://github.com/itzdannys) instead.

## Local-data risks

- The project stores character data in the browser for the current origin; clearing the browser's site data can erase it.
- Source-code commits do **not** back up live character data. Export and keep JSON backups separately.
- Avoid using untrusted modified copies of this app, especially if they include additional scripts or external assets.
- Treat imported character JSON and custom images as untrusted data. Keep backups of your original library before importing.

This is a personal, non-networked app, not an audited secure storage system.
