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

A Windows desktop app in `desktop/` wraps the same web app in Electron, like Discord does, and
adds a native picker and per app audio. See the Windows desktop app section.

### Delivery plan

1. **Design system** (done): theme tokens, typography, buttons, inputs, icons, dark mode.
2. **Supabase project and Discord sign in** (done).
3. **Account approval** (done): admins approve or deny every new user.
4. **Approval emails**: email users when their account is approved. Not built yet.
5. **Rooms** (done): create rooms, share links, manage names and members, and see who is in
   each room right now with Supabase Realtime presence.
6. **Screen sharing** (done) with `getDisplayMedia` and WebRTC.
7. **Windows desktop app** (current): Electron shell with a window picker and the audio of only
   the shared app.

## Commands

This project uses **pnpm**. Never use npm or yarn, and never create `package-lock.json` or
`yarn.lock`. The pinned version is in the `packageManager` field of `package.json`.

The repository holds three parts: the Vue app in `web/`, the Electron app in `desktop/` and the
Supabase backend in `supabase/`. `web/` and `desktop/` are separate pnpm projects with their own
lock files. The small root `package.json` holds only the Supabase CLI and forwards the everyday
scripts to `web/`, so run these from the root:

```sh
pnpm install          # install the Supabase CLI, then the web app's dependencies
pnpm dev              # start the Vite dev server for web/
pnpm build            # type-check and build web/ for production
pnpm type-check       # run vue-tsc only
pnpm format           # format web/src/ with Prettier
pnpm supabase <args>  # run the Supabase CLI
```

Add web dependencies inside `web/` with `pnpm add <package>`, using `-D` for dev dependencies.

Always run `pnpm build` before declaring work done. It must pass with no type errors.

The desktop app is a separate pnpm project. Run these inside `desktop/`:

```sh
pnpm install          # install Electron, Forge and the native build tools
pnpm build            # compile the native addon, type-check and bundle main and preload
pnpm dev              # open the app against the local Vite dev server
pnpm start            # open the app against production
pnpm make             # build the Squirrel installer in out/make
```

Building the native addon needs the Visual Studio C++ Build Tools and a Windows 10 SDK.

## Project structure

```
web/src/
  theme/
    theme.css              Design tokens: colors, typography, radii, shadows, dark variant
    component-sizes.ts     ControlSize and IconSize unions, shared by many components
    color-variants.ts      ColorVariant, Appearance, FieldStatus and TextTone unions
    app-icons.ts           Every icon the app uses, under a descriptive name
  components/
    button/                BaseButton (owns every button class), BaseIconButton (renders BaseButton
                           inside a BaseTooltip showing its accessible label)
    tooltip/               BaseTooltip: wraps any trigger and shows a short label on hover or
                           keyboard focus, never on touch. `placement` is top, bottom, left or
                           right and `alignment` is start, center or end. It renders in the
                           popover top layer, so scroll areas, tiles, dialogs and full screen
                           never clip it, flips to the opposite side when it would leave the
                           window, and hides on Escape, scroll, press or pointer leave. It
                           matches the theme: white with dark text in light mode, dark gray
                           with light text in dark mode, both with a border and shadow
    form/                  BaseFormField (owns field border classes), BaseInput, BaseTextarea,
                           BaseSlider is horizontal or vertical (`range-vertical` utility),
                           BaseSwitch (labelled on and off switch bound with v-model),
                           BaseSlider (range input for values like volume)
    icon/                  BaseIcon, BaseSpinner, BaseIconCircle
    surface/               BaseCard (padding none, compact or comfortable), BaseLinkCard (a card
                           that links somewhere, with a leading slot and an arrow)
    typography/            BaseText (owns every text class), BaseHeading (renders BaseText)
    avatar/                BaseAvatar (image with an initials fallback), BaseAvatarStack
                           (overlapping avatars with a +N bubble)
    badge/                 BaseBadge (solid count pill or soft labelled badge with an icon)
    chip/                  BaseChip (toggle button), BaseChipGroup (generic multi select chips
                           bound with v-model)
    dialog/                BaseModal (animated native <dialog> shell, compact, regular or wide)
                           BaseDialog (BaseModal with title, body and actions)
                           BaseDrawer (native <dialog> that slides up from the bottom, with a
                           title and a header slot for tabs). It always takes 80% of the screen
                           height and scrolls its content. The panel slides up in 200ms with
                           ease-out and no bounce, and the content bounces in after 200ms.
    menu/                  BaseDropdownMenu (a button that opens a menu panel, closed by
                           Escape or a click outside, with arrow key navigation) and
                           BaseDropdownMenuItem (one menu row with an icon, neutral or danger)
    segmented-control/     BaseSegmentedControl (generic segmented control bound with v-model,
                           as tabs or as single choice options)
    toast/                 BaseToast and ToastViewport (mounted once in App.vue)
    feedback/              ActionFeedbackModal, ConfirmActionModal, AutoCloseCountdownBar,
                           LoadErrorRetry, NoMatchingResults
    admin/                 Admin layout pieces: AdminPanelLink, AdminNavigation and its tabs,
                           AdminPageHeading, AdminRoleLabel, AdminBackLink, and the details page
                           pieces AdminDetailsSection, AdminDetailsInformationRow and
                           AdminDetailsActionRow
    registered-users/      Admin users list: list, link cards, role and status badges, filters
                           (debounced search plus role and status chips), and
                           user-display-details.ts with the label, icon and color of every
                           role and status
    user-details/          Admin user page: header, information, and the management actions
                           with their confirmation and feedback
    administered-rooms/    Admin rooms list: search, link cards and empty state
    room-details/          Admin room page: header, information and actions
    illustration/          IllustrationScene (friendly, blocked and paused moods) and the
                           pending, denied and deactivated illustrations
    authentication/        DiscordSignInButton, SignedInUserAvatar, AccountMenu (the header's
                           account dropdown) and SignedInUserProfileSummary (avatar, name,
                           email and join date, shared by the dropdown and the phone drawer)
    account-status/        AccountStatusNotice and the pending, denied, deactivated and load
                           error notices
    user-approvals/        Admin approvals: list, card and review dialog
    rooms/                 Rooms dashboard section, room name dialog, room page sidebar and
                           compact bar sharing one details panel with share, rename, members
                           and leave buttons, people here now
                           (expanded list and collapsed avatars), presence avatar, live
                           presence summary, stage placeholder, member and blocked user
                           sections, invitation and unavailable notices
    screen-share/          The room's screen sharing area: stage (empty state, side by side or
                           focus layout, immersive full screen), tiles with their video and
                           hover controls, the control bar and the share dialog
    desktop-app/           DesktopAppDownloadButton and DesktopAppPromotionCard, the home page
                           card that says the app works best on the Windows app
    home/                  SignedOutHero and the approved home page: SignedInDashboard,
                           HomeHero (greeting, create or open your room, all rooms, and
                           JoinRoomForm for pasted room links), LiveRoomsSection with
                           LiveRoomCard, and GettingStartedSection for users without rooms
    layout/                AppHeader, AppBrandMark, HeaderNavigationLink, PageContainer (regular or full
                           width), PageLoadingSpinner,
                           PageTransition, StaggeredListTransition
    theme/                 ColorSchemeToggle
  composables/             use-*.ts shared reactive logic
                           use-color-scheme.ts, use-form-field-accessibility.ts,
                           use-native-dialog.ts (open, close, Escape and backdrop handling
                           shared by BaseModal and BaseDrawer),
                           use-room-presence.ts (who is in a room right now) and
                           use-requested-room-presence.ts (the same for the room store's room,
                           reloading members when someone new appears)
  audio/                   notification-sounds.ts: short chimes generated with the Web Audio API
  media/                   Screen capture and WebRTC: quality settings, getDisplayMedia, one
                           peer connection per person (room-peer-link.ts) and the mesh that
                           keeps them in sync with presence (room-peer-mesh.ts).
                           desktop-bridge-contract.ts is the typed contract with the desktop
                           app, desktop-bridge.ts reads it, and application-audio-track.ts
                           turns the desktop app's captured audio into a track through
                           application-audio-worklet.ts
  services/                supabase-client.ts and *-service.ts files that talk to Supabase
  formatting/              Pure display formatters, like date-time.ts and member-count.ts
  stores/                  *-store.ts Pinia stores
                           authentication-store.ts owns the session
                           current-user-store.ts owns the signed in user's role and approval
                           pending-users-store.ts owns the admin's pending list
                           registered-users-store.ts owns the admin's users list and filters
                           user-details-store.ts owns the user shown on the admin user page
                           and its role and activation actions
                           action-feedback-store.ts owns the success and error modal
                           toast-store.ts owns the toasts shown by ToastViewport
                           room-notification-preferences-store.ts owns each user's join and
                           leave notification choices
                           my-rooms-store.ts owns the signed in user's rooms and creation
                           screen-share-store.ts owns your capture, the streams you receive,
                           each share's volume and mute, the layout and the peer mesh
                           room-presence-store.ts owns one Realtime presence channel per room,
                           shared by every component watching it
                           room-store.ts owns the room shown on the room page and the admin
                           room page: preview, room, members, blocked users, actions
                           administered-rooms-store.ts owns the admin's rooms list and search
  views/                   Route views that only compose components
    admin/                 AdminLayoutView and every page under /admin
  router/                  Vue Router setup and the admin route guard
supabase/
  config.toml              Supabase project settings, pushed with the CLI
  migrations/              SQL migrations, applied with pnpm supabase db push
desktop/                   Windows desktop app, its own pnpm project
  source/main/             Electron main process: window, trusted navigation, capture sources,
                           the native audio relay and the bridge handlers
  source/preload/          Exposes window.screenshareDesktop to the app
  source/shared/           IPC channel names shared by main and preload
  native/application-audio/  C++ addon that captures one process tree's audio with WASAPI
                           application loopback
  forge.config.js          Electron Forge packaging and the Squirrel installer
```

## Supabase

The backend is the Supabase project `screenshare`, reference `xergqwhbwljvbvijbold`, region
`sa-east-1`. The same Supabase account holds unrelated projects, so only ever use this reference.

- **CLI:** installed as a dev dependency. Run it with `pnpm supabase <command>`.
- **Config:** `supabase/config.toml` is the source of truth for project settings. Every value it
  declares overwrites the live project on push. Always run `pnpm supabase config diff` first and
  push only when the diff contains nothing but the intended changes.
- **Frontend env:** the gitignored `web/.env.local` holds `VITE_SUPABASE_URL` and
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
  automatically. Current pages are `/admin/approvals`, `/admin/users`, `/admin/users/:userId`,
  `/admin/rooms` and `/admin/rooms/:roomId`. The old `/approvals` address redirects. The header shows Home and an
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

## Rooms

Approved, active users meet in rooms. A room is shared by sending its link, `/rooms/<room id>`.

- **Tables:** `public.rooms` (name of 1 to 60 characters, owner, timestamps) and
  `public.room_members` (room, user, joined time). Rooms persist forever.
- **Rules:** members can own one room, admins can own any number. Creating a room adds the owner
  as its first member. The owner or any admin can rename a room and remove members. The owner
  can never be removed or quit their own room. Anyone else can quit, which ends their
  membership (the button says Quit room so it is not mistaken for going back home), and can join again with the
  link. Users can join as many rooms as they want. Rooms are never deleted, only renamed.
- **Kicking:** the owner or any admin can kick a member who is in the room right now with
  `public.kick_room_member`. Kicking sends the member home with an explanation and keeps their
  membership, so they can come back. The function sends a `room-member-kicked` broadcast to
  the room's presence channel from the database with `realtime.send`. Clients can never send
  broadcasts, so nobody can fake a kick. `room-presence-store.ts` exposes the kick aimed at the
  current user as `latestKickNotice`, and `useRoomKickRedirect` on the room page acts on it.
- **Blocking:** blocking a member (`remove_room_member`) removes their membership, kicks them
  out of the room live with the reason `blocked`, and adds them to `public.room_blocked_users`, with who blocked
  them and when. Blocked users see a notice instead of the invitation, and `join_room` refuses
  them. The owner or any admin can unblock them, which lets them join again with the link but
  does not add them back.
- **Reading:** row level security lets approved users read only rooms and memberships of rooms
  they belong to, and admins read all of them. Users rows stay private, so member names and
  avatars come from `public.list_room_members`, which never returns emails.
- **Functions:** `create_room`, `rename_room`, `join_room`, `leave_room`, `remove_room_member`,
  `get_room_preview` (the invitation shown before joining, including whether the caller is
  blocked), `list_room_members`, `list_my_rooms`, `list_blocked_room_users`,
  `unblock_room_user` and the admin only `list_all_rooms`. They all call `private.ensure_caller_is_approved()`. Room management goes
  through `private.find_room_the_caller_can_manage()`.
- **Presence:** each room has a private Realtime channel named `room-presence:<room id>`, keyed
  by user id. Members on the room page share their name, avatar and arrival time. Room cards on
  the dashboard and the admin list, the room page and the admin room page only watch. Admins
  watching from the admin pages are never counted. Policies on `realtime.messages` call
  `private.can_use_room_presence_topic()`, so only approved members of that room and admins can
  join. Joining needs read access to both `presence` and `broadcast`, otherwise Realtime refuses
  the channel, while writing is allowed for `presence` only. The client must bind a presence
  listener before subscribing, or it never receives presence. `supabaseClient.channel()` returns
  the existing channel for a topic, which is why `room-presence-store.ts` counts watchers instead
  of letting components open channels themselves. Presence payloads come from the client, and a
  removed member who keeps the page open stays visible until they leave it.
- **Room details panel:** the sidebar and the phone drawer's Room tab show, top to bottom, the
  share and manage buttons, Here now (with a kick button next to each person for managers),
  Notifications, and Membership with Quit room for members who are not the owner.
  Notifications and Membership are `RoomCollapsibleSection`s, closed on every visit and pinned to
  the bottom. Inside Here now only the list scrolls, while its heading stays put. That works because routes
  with `meta.usesFullWidthLayout` pin `App.vue` to the window height (`lg:h-dvh`) on large
  screens, so the height limit reaches the sidebar instead of the page growing.
- **Join and leave notifications:** `useRoomArrivalNotifications` on the room page compares who
  is present before and after every presence update and shows a toast and plays a chime for
  each arrival and departure. It ignores your own changes, and it treats the first two seconds
  after you appear as the room's starting state, because presence can arrive in pieces. Admins
  watching from the admin pages get no notifications. Each user can turn the toasts and the sound
  off separately with the switches in the room's details panel. The choice is stored per user in
  local storage by `room-notification-preferences-store.ts`, so it applies to that device only.
  Keep shared preferences in a Pinia store: separate `useLocalStorage` copies of the same key
  drift apart.
- **Links while signed out:** Discord sign in returns to the page it started from, so a shared
  room link survives sign in. The Supabase config allows `http://localhost:5173/**` as a
  redirect for that. Add the production address with `/**` once deployed.
- **Home page:** a launchpad, not a room list. The hero greets the user and offers Create a room
  (or Open your room once a member owns one), All your rooms and a field that joins any pasted
  room link. Below it the centered Windows app card, on Windows only. Then Live now lists only
  the user's rooms that have people in them right now, sharers first, with who is sharing
  (`useRoomsPresence` watches every room at once). Users without rooms see How it works instead.
- **Rooms page:** `/rooms` lists every room the user created or joined, with Create a room. It
  needs an approved user (`meta.requiresApprovedUser`), and the header and the phone menu link
  to it.
- **Frontend:** `/rooms/:roomId` shows a sign in
  prompt, an approval notice, a not found notice, a blocked notice, the join invitation or the
  room itself. The room page uses the full width of the screen: the stage, where screen sharing
  will go, fills the left, and `RoomSidebar` sits on the right. The sidebar holds the room name,
  share link, rename, leave, and the people here now. The full member list, with remove and the
  blocked users, opens in a modal from the Members button. On large screens the sidebar
  collapses to a column of avatars of the people here now, and the choice is remembered in local
  storage. Below the `lg` breakpoint the sidebar is hidden. `RoomCompactBar` becomes a second
  header under the app header with the room name, the people here now, a copy link button and a
  details button. That button opens a `BaseDrawer` with two tabs: Room, with the same
  `RoomDetailsPanel` the sidebar uses minus its Members button, and Members, with the member
  list, its remove actions and the blocked users. The stage is centered in the space left. Both
  layouts are rendered at once and CSS hides one, so ids inside them must come from `useId()`.
  Never use negative margins inside a scroll container: `overflow-y-auto` also scrolls
  sideways, so the extra width shows a horizontal scrollbar. Scroll areas that hold animated
  lists also get `overflow-x-hidden`, because pop in animations briefly make items wider.
- **Sidebar animation:** the sidebar card animates its width, while its expanded and collapsed
  contents keep a fixed width (`w-80` and `w-20`, with `box-content` on the card) and are
  clipped. That way nothing reflows or shows scrollbars mid animation.
- **Header:** from `sm` up the header shows the brand, Home, Rooms and Admin, and one account button
  with the avatar and name. It opens `AccountMenu`, a `BaseDropdownMenu` with the profile summary
  (email and join date), the color scheme switch, Get the Windows app on Windows and Sign out.
  Keep the header to these pieces so it never gets crowded.
- **Phone header:** below `sm` the app header shows only the brand, the avatar and a menu
  button. `AppMobileMenu` opens a `BaseDrawer` with the same profile summary, Home, Admin with
  the pending count, the color scheme switch and Sign out.
- **Full width pages:** routes with `meta.usesFullWidthLayout` widen the header, and their view
  passes `width="full"` to `PageContainer`.
- **Admin rooms:** the dashboard shows admins only their own rooms. `/admin/rooms` lists every
  room with a debounced search by room or owner name, and each card opens
  `/admin/rooms/:roomId`. That page shows the room's details, renames it, removes members and
  unblocks users. It reuses `room-store.ts` and the room page's member and blocked sections.

## Screen sharing

- **Transport:** a mesh of WebRTC peer connections, one per pair of people in the room, using
  public Google STUN servers only. There is no TURN server yet, so people behind strict NATs may
  fail to connect. Each person can share one screen, so a room has up to one share per person.
- **Signalling:** each room has a second private Realtime channel, `room-signaling:<room id>`,
  where members and admins may send broadcasts (`private.can_use_room_signaling_topic()`). It
  is separate from the presence channel so clients still cannot fake kicks there. Messages
  carry descriptions, batched ICE candidates and view preferences, addressed by user id. ICE
  candidates are batched every 200ms because Realtime limits how many messages a client can
  send per second, and dropped candidates made connections hang in checking.
- **Negotiation:** `RoomPeerLink` follows the perfect negotiation pattern. The person with the
  smaller user id is polite. Signals for a link run one after another through a promise chain.
- **Presence:** sharers set `isSharingScreen` on their presence, so tiles appear right away and
  show Connecting until the video arrives. The sidebar marks sharers with a screen badge on their
  avatar (expanded and collapsed) and a Sharing their screen line, and each tile shows the
  sharer's avatar next to their name.
- **Quality:** the share dialog picks 480p, 720p or 1080p, 30 or 60 fps, and audio. Choosing the
  screen, window or tab is left to the browser's own picker, which a web page cannot replace. Each pair has a bitrate cap (`screen-share-quality.ts`), 60 fps
  uses the `motion` content hint and keeps the frame rate under pressure, and 30 fps uses
  `detail` and keeps the resolution. H264 is preferred first for hardware encoding, High
  profile before Main and Baseline, then VP9 and VP8. Measured with WebRTC stats, every captured
  frame is encoded, sent and decoded at 60 fps settings, with no drops and no quality limits. A tile narrower than 420px tells the sharer it is a thumbnail, and the sharer then sends
  that person a 320px wide, 15 fps, 300 kbps version.
- **Audio:** browsers give one mixed audio track and never one app's sound. A tab shares only
  its own audio, the entire screen shares all system audio where the system allows it, and a
  window shares no audio at all. The dialog says so. Capture asks for `restrictOwnAudio`, so the
  app's own sounds, like the join chime, stay out of the share where Chrome supports it.
- **Controls:** the bar under the stage has mute or unmute everyone (unmute
  keeps each share's volume), the big round share button that turns into stop, change what you
  share, app full screen (hides the header), and leave the room (goes home, with an exit icon rather than a hang up icon, since it is a
  room and not a call). Switching layouts happens by clicking a share, so there is no layout button.
  Your own share is always muted for you and has no volume controls. Its tile says whether you
  are sharing with or without audio. An eye button, on the tile and in the bar, hides your own
  share only for you while everyone else keeps seeing it. Each tile has mute,
  a vertical volume slider that opens on hover over the mute button (disabled when the share
  has no audio), focus and full screen, all on hover. Clicking a share focuses it, and clicking
  the focused share goes back to side by side. On touch screens, which have no hover, tapping a share
  shows its controls instead and they hide after 4 seconds. The focus button in the controls
  toggles focus and side by side. Hidden controls ignore taps. Which share has its controls
  showing lives in `screen-share-store.ts`, so it survives the tile being rebuilt when the layout
  changes. Full screen on a tile makes the stage full screen in
  the focus layout, with the other shares as thumbnails that show on hover.
- **Phones** cannot capture the screen, so `canCaptureScreen()` also rules out touch only devices
  (no hover and a coarse pointer) and the share button is not shown there at all. Phones watch.
- **Fitting the stage:** the stage area is a size container (`stage-fit-area`) and the stage uses
  `video-fit-frame`, which takes the largest 16:9 box that fits both its width and height. The
  area's grid has one `minmax(0, 1fr)` row and column (`grid-rows-1 grid-cols-1`), so the stage's
  full size is the area's size and never the video's: without it a tall shared window, like
  Spotify, grew past the screen and covered the room bar. The 16:9 box is only for a single
  share: with two or more, side by side or focused, the stage fills the whole area, so narrow
  windows and phones stack full width shares instead of squeezing them into one small box. In
  short landscape the focus layout's thumbnail strip shrinks to `h-16`. Room
  pages are pinned to the window height (`h-dvh`) on every screen size so that box always fits.
  Phones held sideways match the `short-landscape` variant (landscape and at most 500px tall):
  the app header hides on the room page, the room bar puts the name and presence on one line,
  and the spacing tightens, so the whole share stays visible.

## Windows desktop app

- **Why:** browsers give one mixed audio track and never one app's sound. Discord's desktop app
  captures a single app's audio natively, so we do the same. The research is in
  `docs/discord-screenshare-research.md`.
- **Shell:** Electron loads the production site, or `SCREENSHARE_APP_URL` when set, so the
  desktop app always runs the deployed web app. Context isolation and the sandbox are on. Only the
  app origin, `discord.com` and `*.supabase.co` open inside the window, for Discord sign in.
  Everything else opens in the default browser.
- **Bridge:** the preload exposes `window.screenshareDesktop`, typed by
  `web/src/media/desktop-bridge-contract.ts`. The main process answers only when the request comes
  from the app origin. The web app checks for it with `readDesktopBridge()`, so the browser
  version is unchanged.
- **Picker:** the share dialog shows `DesktopSourcePicker`, with Screens and Windows tabs, live
  thumbnails and app icons from `desktopCapturer`. Screenshare's own window is left out. The
  chosen source is handed to `setDisplayMediaRequestHandler`, and `getDisplayMedia` then returns
  it without the browser picker.
- **Audio:** the native addon activates `VIRTUAL_AUDIO_DEVICE_PROCESS_LOOPBACK` with
  `ActivateAudioInterfaceAsync`, the same Windows API Discord's voice engine uses. A window
  captures its process tree only. A screen captures every app except Screenshare's own process
  tree, so viewers never hear their own sound back. Samples are 48 kHz stereo floats. They travel
  from the main process through a `MessagePort` straight into an AudioWorklet, which plays them
  into a `MediaStreamTrack` that WebRTC sends like any other track. The worklet keeps 40 to
  200ms of audio buffered.
- **Title bar:** the window hides the Windows title bar (`titleBarStyle: 'hidden'`) and keeps only
  the native minimize, maximize and close buttons, drawn over the page at the header's 64px
  height. `AppHeader` is the top bar: `window-drag-region` lets you drag the window by it while
  links and buttons stay clickable, and `window-controls-clearance` leaves room for the buttons
  through the `titlebar-area-*` environment values, which are zero in browsers. Open dialogs are
  never drag regions. `useDesktopWindowControls` sends the color scheme to the main process,
  which paints the buttons with the body colors of light and dark mode. In the desktop app the
  header always spans the full window width.
- **Older sites:** when a page asks for a capture without picking a source, which is what a site
  without the desktop picker does, the main process shares the main screen, with system audio if
  it was requested, instead of failing.
- **Captures by id:** every audio capture gets an id. Stopping an old share never stops the one
  that replaced it.
- **Limits:** Windows 10 version 2004 or newer. Apps whose window and audio live in unrelated
  processes, like some Store apps, may share no sound. Capture failures are logged by the main
  process, and the share continues without sound.
- **Downloads:** Windows browsers that are not touch only see the home page card, the item in
  the account menu and the hint in the share dialog. Phones, tablets and the desktop app itself
  never show them (`canInstallDesktopApp()`). They all link to
  `ScreenshareSetup.exe` on the latest GitHub release. The installer is unsigned, so Windows
  SmartScreen warns on first run until it is code signed.
- **Updates:** the installed app checks `update.electronjs.org` against this public repository's
  releases with `update-electron-app`, and Squirrel installs new versions on restart.

## Releases

- **When:** every push to `main`, which only happens by merging the `homolog` to `main` pull
  request, runs `.github/workflows/release.yml` and publishes a GitHub release. It can also be run
  by hand from the Actions tab.
- **Notes:** GitHub generates them from the pull requests merged since the last release, grouped
  by label as configured in `.github/release.yml`: Breaking changes, Features, Enhancements, Bug
  fixes, Refactors, Documentation and Other changes. The promotion pull request carries the
  `release` label and is left out.
- **Version:** `.github/scripts/decide-next-release-version.sh` reads the labels of the merged pull
  requests. `breaking` bumps the major version, `feature` the minor version and anything else
  the patch version. The first release is `v0.1.0`.
- **Windows app:** after the release is created, the `windows-app` job builds the desktop app on
  a Windows runner with the release version and uploads `ScreenshareSetup.exe`, the `.nupkg` and
  `RELEASES` to it. Those files are what the download link and the auto updater use.

## Deployment

- **Host:** the frontend is a static Vite build deployed on Vercel, with the project's Root
  Directory set to `web`. `web/vercel.json` sets the pnpm
  install and build commands, the `dist` output, a rewrite to `index.html` so room links work on
  refresh, long caching for hashed assets, and security headers that still allow screen capture
  and full screen.
- **Configuration, not secrets:** the build needs `VITE_SUPABASE_URL` and
  `VITE_SUPABASE_PUBLISHABLE_KEY`. The publishable key is designed to be public, since row level
  security protects the data, but neither value lives in the repository. Set them in Vercel's
  project environment variables, or in `.env.local` locally, using `.env.example` as the
  template. `vite.config.ts` stops a build when either is missing, and
  `web/src/services/public-environment.ts` reads them with a clear error. The Supabase secret key is
  never used by the frontend.
- **Project:** Vercel project `screenshare` in the personal scope `gabrielguas-projects`, linked
  to the GitHub repository. Pushes to `main` deploy production at
  `https://screenshare.gabrielgua.com.br`, and every other branch gets a preview. `homolog` always
  has `https://screenshare-git-homolog-gabrielguas-projects.vercel.app`. The subdomain's DNS lives
  at Hostinger as a CNAME from `screenshare` to the target Vercel gives in
  `vercel domains verify screenshare.gabrielgua.com.br`. Previews sit behind Vercel's login by
  default, and production is public.
- **Sign in redirects:** `site_url` is the production address, and `additional_redirect_urls`
  holds the production address and the `homolog` preview with `/**`, plus localhost. The Vercel
  CLI writes a short lived `VERCEL_OIDC_TOKEN` into `.env.local` when linking. Delete that line,
  since local env files never hold tokens. Never allow
  `*.vercel.app` as a whole: anyone can host there, so it would let other sites receive sign in
  tokens.

## Design system

There is no design system page. The components and their props below are the reference.

### Theme tokens

Defined in `web/src/theme/theme.css` with Tailwind v4 `@theme`. Use them as normal Tailwind classes.

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
- **Scrollbars:** `scrollbar-thin-on-hover` (an `@utility` in `theme.css`) gives a scroll area a
  thin scrollbar that is transparent until the pointer is over it. Use it on lists that scroll
  inside a panel, like Here now. Pair it with `scrollbar-gutter-stable` so the content does not
  shift when the scrollbar appears, or with `scrollbar-gutter-balanced` to keep centered content
  centered. Both sidebar lists stretch to the card's right edge so the scrollbar sits against it.
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
- **Drawers:** the panel moves without bounce and only its content bounces, starting as the
  panel lands. Content inside a native dialog animates in with `starting:` because it gets its
  first style when the dialog opens.
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
4.5 seconds, with a countdown bar. Short, non blocking notices like someone joining a room
use `useToastStore().showToast()` instead: toasts sit at the top center on desktop and the
bottom on phones, and close themselves after 4 seconds. Pass `{ shouldAutoClose: false }` as the third argument when
the reader needs time, like a link to copy by hand: the bar is replaced by a Close button. Turn unknown errors into text with `describeError` from
`web/src/services/describe-error.ts`.

### Dark mode

- `useColorScheme` in `web/src/composables/use-color-scheme.ts` wraps VueUse `useDark`. It adds the
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

1. Put design system components in `web/src/components/<group>/` with the `Base` prefix. There is no
   `base/` folder.
2. Write variation types as plain unions. Export component-owned ones from inside its single
   `<script setup lang="ts">`, like `export type ButtonShape = 'rounded' | 'circle'`. Only types
   shared by unrelated components go in `web/src/theme/`.
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
- **Screenshots never show real users' private data.** The repository is public. Capture with
  test users on `example.com` addresses, and mask any other email before capturing. Check every
  screenshot before attaching it.

### Adding an icon

`BaseIcon` draws every icon with a stroke width of 2 instead of Hugeicons' default 1.5. At small
sizes the default stroke shrinks to about 1px, lands between screen pixels and looks fuzzy next to
semibold text. Never render `HugeiconsIcon` directly, so every icon keeps this weight.

Import it from `@hugeicons/core-free-icons` inside `web/src/theme/app-icons.ts` and export it under a
name that describes its meaning in the app, like `ShareScreenIcon`. Components import icons only
from `app-icons.ts`.

## Workflow rules

- **Never commit, push or open pull requests without explicit approval from the user.**
- **Never commit to `main` or `homolog` directly.** Work on a feature branch from `homolog`.
- Keep each pull request focused on one step of the delivery plan.
- Supabase: the user installs the CLI and creates the account. Claude then creates and configures
  the project through the CLI.
