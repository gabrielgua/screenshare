# Screenshare

A browser-only screen sharing app inspired by Discord's Go Live. Sign in with Discord, get approved
by an admin, create or join rooms by link, and share screens with everyone in the room over WebRTC.

## Stack

Vue 3, TypeScript, Vite, Tailwind CSS v4, Pinia and Vue Router on the frontend. Supabase handles
auth (Discord), Postgres and Realtime, which carries presence and WebRTC signalling.

## Run it locally

1. Install dependencies with `pnpm install`. This project uses pnpm only.
2. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and publishable key.
3. Start the dev server with `pnpm dev`.

`pnpm build` type-checks and builds for production. It stops if the environment variables are
missing.

## Deploy

The frontend deploys to Vercel as a static site. Import the repository in Vercel, add
`VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` as environment variables, and deploy.
`vercel.json` already sets the build, the single page app rewrite and the headers. Then add the
production address to the Supabase auth redirect settings.

## Releases

Merging `homolog` into `main` publishes a GitHub release with notes grouped by pull request label.
