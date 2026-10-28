<script setup lang="ts">
interface FittedVideoFrameProps {
  aspectRatio: number
}

defineProps<FittedVideoFrameProps>()
</script>

<template>
  <div class="stage-fit-area grid size-full place-items-center">
    <div
      class="shape-fit-frame @container/video-frame relative"
      :style="{ '--frame-aspect-ratio': aspectRatio }"
    >
      <slot />
    </div>
  </div>
</template>
