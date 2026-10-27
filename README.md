# Screenshare

A browser-only screen sharing app inspired by Discord's Go Live. Sign in with Discord, get approved
by an admin, create or join rooms by link, and share screens with everyone in the room over WebRTC.

## Stack

Vue 3, TypeScript, Vite, Tailwind CSS v4, Pinia and Vue Router on the frontend. Supabase handles
auth (Discord), Postgres and Realtime, which carries presence and WebRTC signalling.

## Run it locally

The web app lives in `web/`, the Windows app in `desktop/` and the backend in `supabase/`.

1. Install dependencies with `pnpm install` at the root. This project uses pnpm only.
2. Copy `web/.env.example` to `web/.env.local` and fill in the Supabase project URL and
   publishable key.
3. Start the dev server with `pnpm dev`.

`pnpm build` type-checks and builds for production. It stops if the environment variables are
missing.

## Deploy

The frontend deploys to Vercel as a static site. Import the repository in Vercel, set its Root
Directory to `web`, add
`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as environment variables, and deploy.
`web/vercel.json` already sets the build, the single page app rewrite and the headers. Then add the
production address to the Supabase auth redirect settings.

## Windows app

`desktop/` holds an Electron app for Windows that loads the same site and adds a window picker
and per app audio: sharing a window sends only that app's sound. Run `pnpm install` and
`pnpm dev` inside `desktop/` with the Visual Studio C++ Build Tools installed. Each release ships
`ScreenshareSetup.exe`.

## Releases

Merging `homolog` into `main` publishes a GitHub release with notes grouped by pull request label.
