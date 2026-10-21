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
- After opening the pull request, give the user the full local paths of the screenshots. The user
  drags them into the pull request description on GitHub, which hosts them. Use this table layout:

```markdown
| | Before | After |
| --- | --- | --- |
| Desktop | before-desktop.png | after-desktop.png |
| Mobile | before-mobile.png | after-mobile.png |
```

## 6. Labels

Every pull request gets at least one type label and one area label.

| Label | Kind | Use when |
| --- | --- | --- |
| `feature` | type | Adds new functionality |
| `enhancement` | type | Improves existing functionality |
| `bugfix` | type | Fixes a bug |
| `documentation` | type | Changes docs, rules or `CLAUDE.md` |
| `frontend` | area | Touches `src/` or anything the user sees |
| `backend` | area | Touches Supabase, database, functions or auth configuration |

Apply every label that fits. A pull request can be both `feature` and `documentation`. A change
that only touches docs, rules or repository settings gets `documentation` alone.

## 7. Before opening

- `pnpm build` passes with no type errors.
- No comments in code, following `.claude/rules/clean-code.md`.
