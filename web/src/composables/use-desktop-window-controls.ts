import { watch } from 'vue'
import { useColorScheme } from '@/composables/use-color-scheme'
import { readDesktopBridge } from '@/media/desktop-bridge'

export function useDesktopWindowControls() {
  const desktopBridge = readDesktopBridge()
  if (!desktopBridge?.setWindowControlsColorScheme) {
    return
  }
  const { colorSchemeName } = useColorScheme()
  watch(
    colorSchemeName,
    (currentColorScheme) => void desktopBridge.setWindowControlsColorScheme?.(currentColorScheme),
    { immediate: true },
  )
}
