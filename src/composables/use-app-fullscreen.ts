import { createSharedComposable, useFullscreen } from '@vueuse/core'

function useAppFullscreenState() {
  return useFullscreen(document.documentElement)
}

export const useAppFullscreen = createSharedComposable(useAppFullscreenState)
