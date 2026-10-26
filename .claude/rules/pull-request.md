# Pull Request Rules

These rules apply to every branch, commit and pull request in this project.

## 1. Branches

- `main` is production. It is protected: nobody can push to it directly, admins included. It only
  changes by merging a pull request from `homolog`.
- `homolog` is the integration branch. **Every pull request targets `homolog`**, never `main`.
- Create feature branches from `homolog`, named `<type>/<short-kebab-description>`, for example
  `feature/discord-sign-in` or `bugfix/button-text-alignment`.
- Open pull requests with `gh pr create --base homolog`.
- Promoting to production is a separate pull request from `homolog` into `main`, opened only when
  the user asks.

## 2. Approval first

- Never commit, push or open a pull request without explicit approval from the user.

## 3. Always English

- Branch names, commit messages, pull request titles, bodies and screenshot captions are written
  in English.

## 4. Keep the body short

- The title says what the pull request does in a few words: `Add design system foundation`.
- The body is a short description of what the pull request does, a few lines or bullets at most.
  No long explanations, no file-by-file lists, no implementation essays.
- If the pull request touches the frontend, the body also gets a before and after screenshot
  table. Nothing else.

Body template:

```markdown
Short description of what this pull request does.

- Main change one
- Main change two
```

## 5. Screenshots

- Any pull request that changes what the user sees needs before and after screenshots.
- **Before** is the page on `homolog`. **After** is the page on the pull request branch.
- Capture the same page, the same viewport and the same color scheme in both. Capture desktop, and
  phone width when the layout changes on phones.
- Capture with headless Chrome against `pnpm build` plus `pnpm exec vite preview`.
- **Screenshots never go to the remote repository.** No screenshot branches and no committed images.
  Save them locally in the gitignored `.pr-screenshots/<branch-name>/` folder, named
  `before-desktop.png`, `after-desktop.png`, `before-mobile.png`, `after-mobile.png`.
- **Claude uploads the screenshots itself with `gh pr create --attach` or `gh pr edit --attach`.**
  GitHub hosts the uploaded files, so nothing is pushed to the repository. This needs GitHub CLI
  2.102.1 or newer. Update it with `winget upgrade --id GitHub.cli` if `--attach` is missing.
- Write the body with image references pointing at the local files, run the command from the
  repository root, and pass one `--attach` per file. The CLI rewrites each local reference to the
  uploaded asset.

```markdown
| | Before | After |
| --- | --- | --- |
| Desktop | ![Before desktop](./.pr-screenshots/<branch>/before-desktop.png) | ![After desktop](./.pr-screenshots/<branch>/after-desktop.png) |
| Mobile | ![Before mobile](./.pr-screenshots/<branch>/before-mobile.png) | ![After mobile](./.pr-screenshots/<branch>/after-mobile.png) |
```

```sh
gh pr create --base homolog --title "..." --label frontend --body-file body.md \
  --attach ./.pr-screenshots/<branch>/before-desktop.png \
  --attach ./.pr-screenshots/<branch>/after-desktop.png \
  --attach ./.pr-screenshots/<branch>/before-mobile.png \
  --attach ./.pr-screenshots/<branch>/after-mobile.png
```

- If an upload fails, the command exits with a non-zero status but still prints the pull request
  link. Check the body on GitHub and re-run `gh pr edit --attach` for the missing files.

## 6. Labels

Every pull request gets at least one type label and one area label.

| Label | Kind | Use when |
| --- | --- | --- |
| `feature` | type | Adds new functionality |
| `enhancement` | type | Improves existing functionality |
| `bugfix` | type | Fixes a bug |
| `documentation` | type | Changes docs, rules or `CLAUDE.md` |
| `refactor` | type | Restructures code without changing behavior |
| `breaking` | type | Breaks existing behavior, bumps the major version |
| `release` | type | The `homolog` to `main` pull request, left out of release notes |
| `frontend` | area | Touches `src/` or anything the user sees |
| `backend` | area | Touches Supabase, database, functions or auth configuration |

Labels decide where a pull request lands in the GitHub release notes and which version number
the release gets, so label every pull request accurately.

Apply every label that fits. A pull request can be both `feature` and `documentation`. A change
that only touches docs, rules or repository settings gets `documentation` alone.

## 7. Before opening

- `pnpm build` passes with no type errors.
- No comments in code, following `.claude/rules/clean-code.md`.
