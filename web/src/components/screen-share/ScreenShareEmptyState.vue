<script setup lang="ts">
import BaseIconCircle from '@/components/icon/BaseIconCircle.vue'
import BaseText from '@/components/typography/BaseText.vue'
import { canCaptureScreen } from '@/media/screen-capture'
import { useScreenShareStore } from '@/stores/screen-share-store'
import { ShareScreenIcon } from '@/theme/app-icons'

const canShareFromThisDevice = canCaptureScreen()
const screenShareStore = useScreenShareStore()
</script>

<template>
  <section
    aria-label="Screen sharing"
    class="flex size-full flex-col items-center justify-center gap-3 rounded-card border-2 border-dashed border-neutral-300 bg-neutral-100 p-6 text-center dark:border-neutral-700 dark:bg-neutral-900"
  >
    <BaseIconCircle :icon="ShareScreenIcon" size="lg" />
    <BaseText weight="semibold">
      {{
        screenShareStore.isOwnShareHidden
          ? 'Your screen is hidden for you'
          : 'Nobody is sharing yet'
      }}
    </BaseText>
    <BaseText size="sm" tone="muted" class="max-w-sm">
      {{
        screenShareStore.isOwnShareHidden
          ? 'Everyone else still sees it. Use the eye button below to show it again.'
          : canShareFromThisDevice
            ? 'Press the share button below to show your screen to everyone here.'
            : 'Screens shared by others show up here. Sharing needs a desktop browser.'
      }}
    </BaseText>
  </section>
</template>
