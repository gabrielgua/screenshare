import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

const REQUIRED_PUBLIC_ENVIRONMENT_VARIABLE_NAMES = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
]

export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    const publicEnvironmentVariables = loadEnv(mode, process.cwd(), 'VITE_')
    const missingVariableNames = REQUIRED_PUBLIC_ENVIRONMENT_VARIABLE_NAMES.filter(
      (variableName) => !publicEnvironmentVariables[variableName]?.trim(),
    )
    if (missingVariableNames.length > 0) {
      throw new Error(
        `Missing environment variables: ${missingVariableNames.join(', ')}. Set them in .env.local or in the hosting provider before building.`,
      )
    }
  }

  return {
    plugins: [vue(), vueDevTools(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
