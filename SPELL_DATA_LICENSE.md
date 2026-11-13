# Spell data attribution

This work includes material from the System Reference Document 5.2 ("SRD 5.2") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

The bundled 339-entry catalogue in `js/spell-catalog.js` contains the SRD 5.2 spell dataset supplied by Open5e (https://open5e.com), fetched from https://api.open5e.com/v2/spells/?document__key=srd-2024&limit=500 on November 11, 2026. No paid-book or third-party spell catalogues are included.

Changes: the data was converted into a browser-ready JavaScript catalogue; fields are renamed/reorganized for class and spell-level filtering, preparation limits, spell details, and casting controls. Descriptions are displayed from the bundled source data. The app uses this checked-in snapshot and makes no external requests while playing.

The dataset may contain upstream corrections or omissions; review Open5e/SRD updates before refreshing it. This notice applies to included SRD content, not application code.
