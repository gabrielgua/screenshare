# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Read the rules first

**All code in this project must follow [`.claude/rules/clean-code.md`](.claude/rules/clean-code.md).**
Read it before writing or reviewing any code. The most important points:

- **Never write comments in code.** Names must explain everything.
- **Componentize everything.** Anything used twice becomes a component, composable or constant.
- **Descriptive names everywhere:** variables, functions, constants, files, props and tokens.
- **Use the design system.** Theme tokens, `Base*` components and `app-icons.ts`. No raw colors.
- **Dark mode and mobile first** for every component.
- **Variant types are plain unions:** `export type ButtonType = 'button' | 'submit' | 'reset'`.
  Never derive types from `as const` arrays, and never use `DEFAULT_*` constants.
- **One `<script setup lang="ts">` per component.** Component-owned types are exported from inside
  it. Never add a second `<script lang="ts">` block.
- **Classes live in the component's `.vue` file.** Shared classes go straight on the element's
  `class` attribute. Variant maps hold only what varies, never a class repeated in every entry.

## What this project is

A browser-only screen sharing app inspired by Discord's Go Live feature. It must work well on
phones and desktops. Users sign in with their Discord account.

Research on how Discord implements screen sharing lives in
[`docs/discord-screenshare-research.md`](docs/discord-screenshare-research.md). Read it before
working on capture, streaming or signalling features.

### Planned architecture

| Concern | Choice |
| --- | --- |
| Frontend | Vue 3, TypeScript, Vite, Tailwind CSS v4, Pinia, Vue Router, VueUse |
| Icons | Hugeicons (`@hugeicons/vue` with `@hugeicons/core-free-icons`) |
| Backend | Supabase (Auth, Postgres, Realtime), deployed with the Supabase CLI |
| Sign in | Supabase Auth with the Discord OAuth provider |
| Screen capture | `navigator.mediaDevices.getDisplayMedia` |
| Media transport | WebRTC peer connections, signalled through Supabase Realtime channels |

Mobile browsers cannot capture the screen, so phones can watch streams but not share.

### Delivery plan

1. **Design system** (done): theme tokens, typography, buttons, inputs, icons, dark mode.
2. **Supabase project and Discord sign in** (current).
3. **Rooms and presence** with Supabase Realtime.
4. **Screen sharing** with `getDisplayMedia` and WebRTC.

## Commands

This project uses **pnpm**. Never use npm or yarn, and never create `package-lock.json` or
`yarn.lock`. The pinned version is in the `packageManager` field of `package.json`.

```sh
pnpm install          # install dependencies
pnpm dev              # start the Vite dev server
pnpm build            # type-check and build for production
pnpm type-check       # run vue-tsc only
pnpm format           # format src/ with Prettier
pnpm add <package>    # add a dependency, use -D for dev dependencies
```

Always run `pnpm build` before declaring work done. It must pass with no type errors.

## Project structure

```
src/
  theme/
    theme.css              Design tokens: colors, typography, radii, shadows, dark variant
    component-sizes.ts     ControlSize and IconSize unions, shared by many components
    color-variants.ts      ColorVariant, Appearance, FieldStatus and TextTone unions
    app-icons.ts           Every icon the app uses, under a descriptive name
  components/
    button/                BaseButton (owns every button class), BaseIconButton (renders BaseButton)
    form/                  BaseFormField (owns field border classes), BaseInput, BaseTextarea
    icon/                  BaseIcon, BaseSpinner
    surface/               BaseCard
    typography/            BaseText (owns every text class), BaseHeading (renders BaseText)
    avatar/                BaseAvatar (image with an initials fallback)
    authentication/        DiscordSignInButton, SignedInUserMenu, SignedInUserAvatar
    home/                  SignedOutHero, SignedInWelcome
    layout/                AppHeader, AppBrandMark, PageContainer
    theme/                 ColorSchemeToggle
  composables/             use-*.ts shared reactive logic
                           use-color-scheme.ts, use-form-field-accessibility.ts
  services/                supabase-client.ts, the single Supabase client instance
  stores/                  *-store.ts Pinia stores, authentication-store.ts owns the session
supabase/
  config.toml              Supabase project settings, pushed with the CLI
  views/                   Route views that only compose components
  router/                  Vue Router setup
```

## Supabase

The backend is the Supabase project `screenshare`, reference `xergqwhbwljvbvijbold`, region
`sa-east-1`. The same Supabase account holds unrelated projects, so only ever use this reference.

- **CLI:** installed as a dev dependency. Run it with `pnpm supabase <command>`.
- **Config:** `supabase/config.toml` is the source of truth for project settings. Every value it
  declares overwrites the live project on push. Always run `pnpm supabase config diff` first and
  push only when the diff contains nothing but the intended changes.
- **Frontend env:** the gitignored `.env.local` holds `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_PUBLISHABLE_KEY`. Get the key with
  `pnpm supabase projects api-keys --project-ref xergqwhbwljvbvijbold`.
- **Secrets:** secrets are stored in the Supabase dashboard, never on disk. Never write a secret
  into a tracked file, a local env file or a chat message.
- **Discord sign in:** the Discord provider, its client ID `1562489519557836874` and its secret are
  configured in the dashboard, under Authentication, Sign In / Providers, Discord.
  `config.toml` deliberately has no `[auth.external.discord]` section: the CLI requires a secret
  whenever that section exists, and leaving it out keeps pushes from touching the dashboard
  values. The Discord application must list
  `https://xergqwhbwljvbvijbold.supabase.co/auth/v1/callback` as an OAuth2 redirect.
- **Redirects:** sign in returns to the app origin, which must be in `site_url` or
  `additional_redirect_urls`. Add the production address there once the app is deployed.

## Design system

There is no design system page. The components and their props below are the reference.

### Theme tokens

Defined in `src/theme/theme.css` with Tailwind v4 `@theme`. Use them as normal Tailwind classes.

- **Colors:** `brand`, `neutral`, `danger`, `success`, `warning`, each with a `50` to `950` scale.
  Examples: `bg-brand-600`, `text-neutral-500`, `border-danger-500`.
- **Typography:** `font-sans` is Onest, loaded from Google Fonts in `index.html`. Extra sizes
  `text-display`, `text-title`, `text-subtitle` and `text-caption` complement Tailwind's
  defaults.
- **Why Onest:** its vertical metrics are balanced, so text looks centered inside buttons and
  inputs. Plus Jakarta Sans was dropped because its tall ascent made lowercase labels sit about
  2px low. Before switching fonts, measure the new font's offset in Chrome.
- **Radii:** `rounded-control` for buttons and inputs, `rounded-card` for panels.
- **Shadows:** `shadow-card` for raised surfaces.

### Dark mode

- `useColorScheme` in `src/composables/use-color-scheme.ts` wraps VueUse `useDark`. It adds the
  `dark` class on `<html>` and remembers the choice in local storage.
- Tailwind's `dark:` variant is bound to that class in `theme.css` with `@custom-variant`.
- Every component writes its dark styles inline with `dark:` classes.

### Component variations

| Prop | Values | Used by |
| --- | --- | --- |
| `size` | `sm`, `md`, `lg` | buttons, icon buttons, inputs, textarea |
| `variant` | `primary`, `neutral`, `danger`, `success`, `warning` | buttons, icon buttons |
| `appearance` | `solid`, `outlined`, `ghost` | buttons, icon buttons |
| `status` | `default`, `danger`, `success`, `warning` | inputs, textarea |
| `size` | `xs`, `sm`, `md`, `lg`, `xl` | `BaseIcon` |

Typography:

- `BaseHeading` takes `level` (1 to 4) for the semantic tag and an optional `size` to decouple
  the look from the tag.
- `BaseText` takes `size`, `tone` and `weight`, plus `as` to pick the rendered tag.

### Adding a new component

1. Put design system components in `src/components/<group>/` with the `Base` prefix. There is no
   `base/` folder.
2. Write variation types as plain unions. Export component-owned ones from inside its single
   `<script setup lang="ts">`, like `export type ButtonShape = 'rounded' | 'circle'`. Only types
   shared by unrelated components go in `src/theme/`.
3. Write defaults as literals in `withDefaults`.
4. Put shared classes straight on the element's `class` attribute. Map only what varies with a
   `Record`, and never repeat a class in every entry. Never create separate `*-classes.ts` files.
5. Add light and dark styles with `dark:` variants.
6. No comments. Re-read `.claude/rules/clean-code.md` if unsure.

## Pull requests

Follow [`.claude/rules/pull-request.md`](.claude/rules/pull-request.md) for every pull request:
English only, a short description, labels, and before and after screenshots for frontend changes.

- **Every pull request targets `homolog`.** Branch from `homolog`, open with
  `gh pr create --base homolog`.
- **`main` is protected.** No direct pushes, admins included. It only changes through a pull
  request from `homolog`.
- **Screenshots stay local** in the gitignored `.pr-screenshots/<branch-name>/` folder. Never push
  them to the repository. Claude uploads them into the pull request body with `gh pr create --attach`
  or `gh pr edit --attach`, which needs GitHub CLI 2.102.1 or newer.

### Adding an icon

Import it from `@hugeicons/core-free-icons` inside `src/theme/app-icons.ts` and export it under a
name that describes its meaning in the app, like `ShareScreenIcon`. Components import icons only
from `app-icons.ts`.

## Workflow rules

- **Never commit, push or open pull requests without explicit approval from the user.**
- **Never commit to `main` or `homolog` directly.** Work on a feature branch from `homolog`.
- Keep each pull request focused on one step of the delivery plan.
- Supabase: the user installs the CLI and creates the account. Claude then creates and configures
  the project through the CLI.
