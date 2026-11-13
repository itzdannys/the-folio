# Contributing

The Folio is a personal project maintained by **[Danny (@itzdannys)](https://github.com/itzdannys)**. Ideas, bug reports, and small improvements are welcome when the repository is open to collaborators.

## Before making changes

1. Open an issue describing the problem or intended feature, where applicable.
2. Confirm the proposed behavior is consistent with the supported D&D rules **and** the app's documented limitations.
3. Preserve existing saved data and the ability to run without a server.
4. Do not include personal exports, scanned books, restricted sourcebook text, or third-party art without permission.

## Local validation

```bash
node --test
```

When changing UI workflows, additionally run and inspect the relevant optional browser tests in `tests/` and verify the desktop/mobile layout yourself. Browser checks need Python/Playwright/Chromium separately; they are not included in basic Node CI.

## Pull requests

Describe the change, link the relevant issue if any, outline tests performed, and attach sanitized screenshots for UI changes. Avoid using a different character's saved data to change Pip's specialized mechanics.

## Licensing

This repository does not currently offer a general open-source license. Contributions are subject to an explicit agreement with the maintainer; opening a pull request does not silently relicense existing SRD or third-party material. See [RIGHTS.md](RIGHTS.md).
