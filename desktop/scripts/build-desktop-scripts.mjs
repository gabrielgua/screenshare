import { build } from 'esbuild'

const SHARED_BUILD_OPTIONS = {
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node22',
  external: ['electron'],
  sourcemap: false,
  logLevel: 'info',
}

await build({
  ...SHARED_BUILD_OPTIONS,
  entryPoints: ['source/main/main.ts'],
  outfile: 'build/main.cjs',
})

await build({
  ...SHARED_BUILD_OPTIONS,
  entryPoints: ['source/preload/screenshare-desktop-preload.ts'],
  outfile: 'build/preload.cjs',
})
