<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'

interface ScreenShareVideoProps {
  stream: MediaStream
  volume?: number
  isMuted?: boolean
}

const props = withDefaults(defineProps<ScreenShareVideoProps>(), {
  volume: 1,
  isMuted: false,
})

const videoElement = ref<HTMLVideoElement>()

watch(
  [videoElement, () => props.stream],
  ([element, stream]) => {
    if (!element || element.srcObject === stream) {
      return
    }
    element.srcObject = stream
    element.play().catch(() => {
      element.muted = true
      element.play().catch(() => undefined)
    })
  },
  { immediate: true },
)

watchEffect(() => {
  if (videoElement.value) {
    videoElement.value.volume = props.volume
    videoElement.value.muted = props.isMuted
  }
})
</script>

<template>
  <video
    ref="videoElement"
    autoplay
    playsinline
    disablepictureinpicture
    class="size-full bg-neutral-950 object-contain"
  />
</template>
