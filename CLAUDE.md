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
2. **Supabase project and Discord sign in** (done).
3. **Account approval** (current): admins approve or deny every new user.
4. **Approval emails**: email users when their account is approved. Not built yet.
5. **Rooms and presence** with Supabase Realtime.
6. **Screen sharing** with `getDisplayMedia` and WebRTC.

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
    icon/                  BaseIcon, BaseSpinner, BaseIconCircle
    surface/               BaseCard (padding none, compact or comfortable)
    typography/            BaseText (owns every text class), BaseHeading (renders BaseText)
    avatar/                BaseAvatar (image with an initials fallback)
    badge/                 BaseBadge (solid count pill or soft labelled badge with an icon)
    chip/                  BaseChip (toggle button), BaseChipGroup (generic multi select chips
                           bound with v-model)
    dialog/                BaseModal (animated native <dialog> shell)
                           BaseDialog (BaseModal with title, body and actions)
    feedback/              ActionFeedbackModal, ConfirmActionModal, AutoCloseCountdownBar,
                           LoadErrorRetry
    admin/                 Admin layout pieces: AdminPanelLink, AdminNavigation and its tabs,
                           AdminPageHeading, AdminRoleLabel
    registered-users/      Admin users list: list, link cards, role and status badges, filters
                           (debounced search plus role and status chips), and
                           user-display-details.ts with the label, icon and color of every
                           role and status
    user-details/          Admin user page: header, information rows, and the management
                           actions with their confirmation and feedback
    illustration/          IllustrationScene (friendly, blocked and paused moods) and the
                           pending, denied and deactivated illustrations
    authentication/        DiscordSignInButton, SignedInUserMenu, SignedInUserAvatar,
                           SignOutButton
    account-status/        AccountStatusNotice and the pending, denied, deactivated and load
                           error notices
    user-approvals/        Admin approvals: list, card and review dialog
    home/                  SignedOutHero, SignedInWelcome
    layout/                AppHeader, AppBrandMark, HomeLink, PageContainer, PageLoadingSpinner,
                           PageTransition, StaggeredListTransition
    theme/                 ColorSchemeToggle
  composables/             use-*.ts shared reactive logic
                           use-color-scheme.ts, use-form-field-accessibility.ts
  services/                supabase-client.ts and *-service.ts files that talk to Supabase
  formatting/              Pure display formatters, like date-time.ts
  stores/                  *-store.ts Pinia stores
                           authentication-store.ts owns the session
                           current-user-store.ts owns the signed in user's role and approval
                           pending-users-store.ts owns the admin's pending list
                           registered-users-store.ts owns the admin's users list and filters
                           user-details-store.ts owns the user shown on the admin user page
                           and its role and activation actions
                           action-feedback-store.ts owns the success and error modal
  views/                   Route views that only compose components
    admin/                 AdminLayoutView and every page under /admin
  router/                  Vue Router setup and the admin route guard
supabase/
  config.toml              Supabase project settings, pushed with the CLI
  migrations/              SQL migrations, applied with pnpm supabase db push
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
- **Migrations:** create them with `pnpm supabase migration new <descriptive_name>`, write plain
  SQL without comments, preview with `pnpm supabase db push --linked --dry-run`, then apply with
  `pnpm supabase db push --linked`. No database password is needed. Never edit a migration that
  was already pushed: add a new one.
- **Ad hoc SQL:** `pnpm supabase db query --linked "<sql>"` runs SQL through the Management API.
- **Advisors:** run `pnpm supabase db advisors --linked` after every migration and fix new warnings.

## Account approval

Every user who signs in with Discord must be approved by an admin before using the platform.

- **Table:** `public.users` holds one row per `auth.users` row: display name, avatar, email,
  `role` (`member` or `admin`) and `approval_status` (`pending`, `approved` or `denied`), plus the
  `review_message`, reviewer and review time. The review message is a welcome message for
  approved users and a reason for denied users. `is_active` turns an account off without deleting
  anything. Users are never hard deleted.
- **Sign up:** the `create_user_after_sign_up` trigger on `auth.users` inserts a `pending` row.
- **Reading:** row level security lets users read only their own row. Admins read every row.
  Nobody can insert, update or delete rows from the API.
- **Reviewing:** admins call `public.review_user(target_user_id, decision, message)`. It checks
  that the caller is an approved admin, refuses self reviews, and stores the optional message.
- **Managing users:** admins call `public.set_user_active(target_user_id, should_be_active)` and
  `public.set_user_role(target_user_id, new_role)`. Both refuse non admins and refuse changes to
  the caller's own account, so the last admin can never lock everyone out. Only approved and
  active users can become admins. Pending users cannot be activated or deactivated: they must be
  approved or denied first, so their card only links to the approvals page.
- **Helpers:** `private.is_admin()` and `private.is_approved_user()` live in the `private`
  schema, which the API does not expose. Both require `is_active`. Use
  `private.is_approved_user()` in row level security policies of future tables so only approved,
  active users can use them.
- **First admin:** when there is no admin yet, promote one directly:

  ```sh
  pnpm supabase db query --linked "update public.users set role = 'admin', approval_status = 'approved' where id = '<user id>'"
  ```

- **Frontend:** deactivated users see `AccountDeactivatedNotice`, pending users see
  `PendingApprovalNotice`, denied users see `AccessDeniedNotice` with the reason, and approved
  users see the welcome message on `SignedInWelcome`. Every signed in user rechecks their account
  whenever the window regains focus, so deactivation and approvals apply without a reload.
- **Admin area:** every admin page lives under `/admin` and renders inside `AdminLayoutView`,
  which shows the `AdminNavigation` tabs. The `/admin` route carries `meta.requiresAdmin`, and the
  guard in `router/index.ts` checks every matched route, so new child pages are protected
  automatically. Current pages are `/admin/approvals`, `/admin/users` and
  `/admin/users/:userId`. The old `/approvals` address redirects. The header shows Home and an
  "Admin" link with the pending count, and an `(Admin)` label next to the admin's name.
- **Users list and user page:** `/admin/users` is a read only list of link cards, with "(You)" on
  the admin's own card. Each card opens `/admin/users/:userId`, which shows every detail of the
  user, including who reviewed them and when, plus the actions. Admin role and activation
  changes go through `ConfirmActionModal` and then the feedback modal. Pending users only get a
  link to approvals, and the admin's own page explains they cannot change their own account.
- **Reviewer join:** the user page reads the reviewer's name with the PostgREST embed
  `reviewer:reviewed_by(display_name)`. Use the column name as the hint for this self reference.
  `users!reviewed_by` follows the relationship backwards and returns an empty list.
- **Emails:** the pending screen promises an email when the account is ready, but sending it is
  not built yet. It needs an email provider and is the next step of the delivery plan.

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
- **Motion:** `ease-bounce` is the overshooting curve every entering animation uses.
  `animate-pop-in` pops an element in with that curve. `animate-shrink-to-start` shrinks a bar
  to its left edge, with the duration set per use through `animation-duration`.

### Animations

The app feels bouncy on purpose. Every animation follows the same pattern:

- **Entering is bouncy:** use `ease-bounce` with a longer duration, around 300 to 500ms.
- **Leaving is quick:** use `ease-in` with a short duration, around 150ms, and no bounce.
- **Pages and screens:** wrap anything that swaps content in `PageTransition`. `App.vue` already
  wraps every route, and views use it when they switch between states.
- **Lists:** render lists through `StaggeredListTransition`, passing the list element as `tag`
  and giving each item a `data-stagger-index` with its position. Items pop in one after another,
  leaving items fade out, and the rest slide into place.
- **Modals:** always build on `BaseModal`. It animates the native dialog and its backdrop in and
  out with `starting:` and `transition-discrete`.
- **Reduced motion:** every animation also gets `motion-reduce:transition-none` or
  `motion-reduce:animate-none`.
- **Illustrations stay still.** Only small sparkles may pulse.

### Confirmations

Every action that changes data asks first with `ConfirmActionModal`, built on `BaseModal`, and
then confirms its result with the shared feedback modal. Never build a one-off confirmation,
success or error message. `ConfirmActionModal` takes a title, description, confirm label, icon
and color variant, shows a spinner on the confirm button while `isSubmitting`, and cannot be
closed until the action finishes.

```ts
const actionFeedbackStore = useActionFeedbackStore()
actionFeedbackStore.showSuccessFeedback('Jamie is in!', 'They can use the platform now.')
actionFeedbackStore.showErrorFeedback('Could not save this review', describeError(error, 'Try again.'))
```

The modal is mounted once in `App.vue`. Success closes itself after 2.5 seconds and errors after
4.5 seconds, with a countdown bar. Turn unknown errors into text with `describeError` from
`src/services/describe-error.ts`.

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
  them to the remote. The user drags them into the pull request on GitHub.
- **Screenshots never show real users' private data.** The repository is public. Capture with
  test users on `example.com` addresses, and mask any other email before capturing. Check every
  screenshot before attaching it.

### Adding an icon

`BaseIcon` draws every icon with a stroke width of 2 instead of Hugeicons' default 1.5. At small
sizes the default stroke shrinks to about 1px, lands between screen pixels and looks fuzzy next to
semibold text. Never render `HugeiconsIcon` directly, so every icon keeps this weight.

Import it from `@hugeicons/core-free-icons` inside `src/theme/app-icons.ts` and export it under a
name that describes its meaning in the app, like `ShareScreenIcon`. Components import icons only
from `app-icons.ts`.

## Workflow rules

- **Never commit, push or open pull requests without explicit approval from the user.**
- **Never commit to `main` or `homolog` directly.** Work on a feature branch from `homolog`.
- Keep each pull request focused on one step of the delivery plan.
- Supabase: the user installs the CLI and creates the account. Claude then creates and configures
  the project through the CLI.
