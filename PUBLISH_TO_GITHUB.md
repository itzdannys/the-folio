# Publish The Folio to GitHub — Windows walkthrough

**Repository owner:** [@itzdannys](https://github.com/itzdannys)  
**Suggested repository name:** `the-folio`  
**Recommended initial visibility:** **Private** until all artwork and third-party reuse rights are confirmed.

## Option A — GitHub Desktop (no terminal needed)

1. Install [GitHub Desktop](https://desktop.github.com/) and sign into the GitHub account `itzdannys`.
2. Extract this ZIP. Keep the source files together in the `the-folio` folder.
3. In GitHub Desktop choose **File → Add local repository → Choose** and select the `the-folio` folder. If prompted, click **Create a repository here**.
4. Set repository name to **`the-folio`**, use the folder containing `README.md` and `index.html`, and leave **Initialize with a README** unchecked if GitHub Desktop provides that choice (the README already exists).
5. Review **Changes**. Confirm there are **no personal JSON backups, sourcebook PDFs, private notes, or `.env` files**.
6. Make an initial commit, e.g. `Initial import: The Folio 2.0 alpha`.
7. Click **Publish repository**; choose **Private**. Confirm the account is `itzdannys`.
8. Verify the online repository shows the banner, screenshots, README, and `tests.yml` GitHub Actions workflow.

> GitHub Desktop may label the action **Create a Repository** instead of **Create repository here**, depending on version. The result should be a Git repository with the app files at its root.

## Option B — Git command line

First create an **empty private** repository called `the-folio` under your account at https://github.com/new. Do **not** add a GitHub-generated README, license, or `.gitignore` (this project includes them where appropriate).

In VS Code open the folder containing `index.html`. Open **Terminal → New Terminal** and run:

```powershell
git init
git add .
git status
git commit -m "Initial import: The Folio 2.0 alpha"
git branch -M main
git remote add origin https://github.com/itzdannys/the-folio.git
git push -u origin main
```

GitHub may ask you to sign in via your browser or credential manager. Use your own account; do not put a password or token in the repository.

If `git commit` asks you to identify the author, run:

```powershell
git config --global user.name "Danny"
git config --global user.email "YOUR_GITHUB_EMAIL_OR_NOREPLY_ADDRESS"
```

Replace the placeholder with your own verified GitHub email or GitHub-provided no-reply address. Then retry the commit. **Do not invent or copy someone else's email address.**

## Recommended repository settings

Open your new repository's main page and configure **About**:

- **Description:** `Offline-first D&D character-sheet companion with campaign folders, homebrew, custom themes, and animated 3D dice.`
- **Topics:** `dnd`, `dungeons-and-dragons`, `character-sheet`, `tabletop-rpg`, `offline-first`, `javascript`, `homebrew`, `dice-roller`
- **Website:** leave blank (there is no hosted site).
- **Visibility:** Private initially. Public is optional after rights/data review.

### Optional repository social preview

In your repository go to **Settings → General → Social preview** (if available) and upload `docs/assets/social-preview.png`. This image is included in the project and does not contain personal character data.

### After publishing

- Open **Actions → Source tests**. The workflow runs Node source tests on GitHub after pushes to `main`.
- Keep personal game backups outside the project folder. Changes pushed to GitHub do not upload browser-saved character progress.
- Before any upgrade, export your library and save it separately.
- Consider creating a release tag like `v2.0.0-alpha.12` after verifying the repository.

If you're currently using the extracted app, **do not move or delete its folder** until you have exported a library backup. A new clone/location may use a different browser-storage origin, and desktop shortcuts may point to the previous folder.
