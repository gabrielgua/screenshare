# Pull Request Rules

These rules apply to every branch, commit and pull request in this project.

## 1. Approval first

- Never commit, push or open a pull request without explicit approval from the user.
- Never commit to `main`. Create a branch named `<type>/<short-kebab-description>`, for example
  `feature/discord-sign-in` or `bugfix/button-text-alignment`.

## 2. Always English

- Branch names, commit messages, pull request titles, bodies and screenshot captions are written
  in English.

## 3. Keep the body short

- The title says what the pull request does in a few words: `Add design system foundation`.
- The body is a short description of what the pull request does, a few lines or bullets at most.
  No long explanations, no file-by-file lists, no implementation essays.
- If the pull request touches the frontend, add a before and after screenshot table under the
  description. Nothing else.

Body template for frontend changes:

```markdown
Short description of what this pull request does.

- Main change one
- Main change two

| Before | After |
| --- | --- |
| ![Before](<before image url>) | ![After](<after image url>) |
```

For changes without visible frontend changes, the body is only the description and bullets.

## 4. Screenshots

- Any pull request that changes what the user sees needs before and after screenshots.
- **Before** is the page on `main`. **After** is the page on the pull request branch.
- Capture the same page, the same viewport and the same color scheme in both. Add a mobile row when
  the layout changes on phones.
- Capture with headless Chrome against `pnpm build` plus `pnpm exec vite preview`.
- Screenshots are never committed to feature branches. They live on the orphan branch
  `pr-screenshots`, in a folder named after the pull request branch, for example
  `pr-screenshots:feature/discord-sign-in/after-desktop.png`.
- Reference them in the body with raw URLs:
  `https://raw.githubusercontent.com/gabrielgua/screenshare/pr-screenshots/<branch>/<file>.png`

## 5. Labels

Every pull request gets at least one type label and one area label.

| Label | Kind | Use when |
| --- | --- | --- |
| `feature` | type | Adds new functionality |
| `enhancement` | type | Improves existing functionality |
| `bugfix` | type | Fixes a bug |
| `documentation` | type | Changes docs, rules or `CLAUDE.md` |
| `frontend` | area | Touches `src/` or anything the user sees |
| `backend` | area | Touches Supabase, database, functions or auth configuration |

Apply every label that fits. A pull request can be both `feature` and `documentation`.

## 6. Before opening

- `pnpm build` passes with no type errors.
- No comments in code, following `.claude/rules/clean-code.md`.
