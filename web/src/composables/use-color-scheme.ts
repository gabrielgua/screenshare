import { computed } from 'vue'
import { createSharedComposable, useDark, useToggle } from '@vueuse/core'
import { DarkModeIcon, LightModeIcon } from '@/theme/app-icons'

const COLOR_SCHEME_STORAGE_KEY = 'screenshare-color-scheme'

function useColorSchemeState() {
  const isDarkModeEnabled = useDark({ storageKey: COLOR_SCHEME_STORAGE_KEY })
  const toggleColorScheme = useToggle(isDarkModeEnabled)
  const colorSchemeName = computed(() => (isDarkModeEnabled.value ? 'dark' : 'light'))
  const switchColorSchemeIcon = computed(() =>
    isDarkModeEnabled.value ? LightModeIcon : DarkModeIcon,
  )
  const switchColorSchemeLabel = computed(() =>
    isDarkModeEnabled.value ? 'Switch to light mode' : 'Switch to dark mode',
  )

  return {
    isDarkModeEnabled,
    colorSchemeName,
    switchColorSchemeIcon,
    switchColorSchemeLabel,
    toggleColorScheme,
  }
}

export const useColorScheme = createSharedComposable(useColorSchemeState)
