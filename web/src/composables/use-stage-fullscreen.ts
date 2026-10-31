import { computed, ref, shallowRef, watch } from 'vue'
import { createSharedComposable, useFullscreen } from '@vueuse/core'
import { isTouchOnlyDevice } from '@/media/device-capabilities'
import { lockScreenToLandscape, unlockScreenOrientation } from '@/media/screen-orientation'
import { FALLBACK_SHARE_ASPECT_RATIO } from '@/media/video-shape'

function useStageFullscreenState() {
  const stageElement = shallowRef<HTMLElement | null>(null)
  const focusedShareAspectRatio = ref(FALLBACK_SHARE_ASPECT_RATIO)
  const isFillingWindow = ref(false)
  const {
    isFullscreen: isNativeFullscreen,
    enter: enterNativeFullscreen,
    exit: exitNativeFullscreen,
  } = useFullscreen(stageElement)

  const isFullscreen = computed(() => isNativeFullscreen.value || isFillingWindow.value)
  const isShareWiderThanTall = computed(() => focusedShareAspectRatio.value >= 1)

  async function tryNativeFullscreen() {
    try {
      await enterNativeFullscreen()
    } catch {
      return
    }
  }

  async function enterFullscreen() {
    await tryNativeFullscreen()
    if (!isNativeFullscreen.value) {
      isFillingWindow.value = true
      return
    }
    if (isTouchOnlyDevice() && isShareWiderThanTall.value) {
      await lockScreenToLandscape()
    }
  }

  async function exitFullscreen() {
    isFillingWindow.value = false
    if (isNativeFullscreen.value) {
      await exitNativeFullscreen()
    }
  }

  async function toggleFullscreen() {
    await (isFullscreen.value ? exitFullscreen() : enterFullscreen())
  }

  watch(isNativeFullscreen, (isNowFullscreen) => {
    if (!isNowFullscreen) {
      unlockScreenOrientation()
    }
  })

  return {
    stageElement,
    focusedShareAspectRatio,
    isFullscreen,
    isFillingWindow,
    isShareWiderThanTall,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  }
}

export const useStageFullscreen = createSharedComposable(useStageFullscreenState)
