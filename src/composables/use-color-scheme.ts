import { computed } from 'vue'
import { createSharedComposable, useDark, useToggle } from '@vueuse/core'

const COLOR_SCHEME_STORAGE_KEY = 'screenshare-color-scheme'

function useColorSchemeState() {
  const isDarkModeEnabled = useDark({ storageKey: COLOR_SCHEME_STORAGE_KEY })
  const toggleColorScheme = useToggle(isDarkModeEnabled)
  const colorSchemeName = computed(() => (isDarkModeEnabled.value ? 'dark' : 'light'))

  return { isDarkModeEnabled, colorSchemeName, toggleColorScheme }
}

export const useColorScheme = createSharedComposable(useColorSchemeState)
