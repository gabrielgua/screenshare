<script setup lang="ts">
import { useId } from 'vue'
import BaseBadge from '@/components/badge/BaseBadge.vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseHeading from '@/components/typography/BaseHeading.vue'
import BaseText from '@/components/typography/BaseText.vue'
import {
  type AppIcon,
  ComputerIcon,
  RefreshIcon,
  ShareableWindowIcon,
  ShareScreenIcon,
  SoundOnIcon,
} from '@/theme/app-icons'
import DesktopAppDownloadButton from './DesktopAppDownloadButton.vue'
import DesktopAppFeature from './DesktopAppFeature.vue'

type FloatingIconPlacement = 'top-right' | 'bottom-left'

interface FloatingIcon {
  icon: AppIcon
  placement: FloatingIconPlacement
}

const FLOATING_ICONS: FloatingIcon[] = [
  { icon: SoundOnIcon, placement: 'top-right' },
  { icon: ShareableWindowIcon, placement: 'bottom-left' },
]

const floatingIconPositionClassesByPlacement: Record<FloatingIconPlacement, string> = {
  'top-right': '-top-3 -right-3',
  'bottom-left': '-bottom-3 -left-3',
}

const headingId = useId()
</script>

<template>
  <section
    :aria-labelledby="headingId"
    class="relative overflow-hidden rounded-card border border-brand-200 bg-linear-to-b from-brand-50 via-white to-white px-5 py-10 shadow-card sm:px-10 sm:py-14 dark:border-brand-900 dark:from-brand-950 dark:via-neutral-900 dark:to-neutral-900"
  >
    <div class="mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
      <div
        class="relative grid size-32 place-items-center rounded-card bg-white shadow-card ring-1 ring-brand-100 dark:bg-neutral-900 dark:ring-brand-900"
        aria-hidden="true"
      >
        <span
          class="grid size-16 place-items-center rounded-card bg-brand-600 text-white dark:bg-brand-500"
        >
          <BaseIcon :icon="ShareScreenIcon" size="xl" />
        </span>
        <span
          v-for="floatingIcon in FLOATING_ICONS"
          :key="floatingIcon.placement"
          class="absolute grid size-10 place-items-center rounded-full bg-white text-brand-600 shadow-card ring-1 ring-brand-100 dark:bg-neutral-800 dark:text-brand-300 dark:ring-brand-900"
          :class="floatingIconPositionClassesByPlacement[floatingIcon.placement]"
        >
          <BaseIcon :icon="floatingIcon.icon" size="md" />
        </span>
      </div>
      <div class="flex flex-col items-center gap-3">
        <BaseBadge appearance="soft" :icon="ComputerIcon">Windows app</BaseBadge>
        <BaseHeading :id="headingId" :level="2" size="title">
          Screenshare works best on your computer
        </BaseHeading>
        <BaseText tone="muted" class="max-w-xl">
          Browsers can only share a whole tab or screen with sound. The Windows app shares exactly
          the window you pick, with only that app's sound.
        </BaseText>
      </div>
      <div class="flex flex-col items-center gap-2">
        <DesktopAppDownloadButton variant="primary" appearance="solid" size="lg" />
        <BaseText size="caption" tone="subtle">Free, for Windows 10 or newer</BaseText>
      </div>
      <ul class="grid w-full gap-6 sm:grid-cols-3">
        <DesktopAppFeature
          :icon="SoundOnIcon"
          title="One app's sound"
          description="Share a game or video without your notifications."
        />
        <DesktopAppFeature
          :icon="ShareableWindowIcon"
          title="Live previews"
          description="See every screen and window before you share."
        />
        <DesktopAppFeature
          :icon="RefreshIcon"
          title="Always up to date"
          description="It updates itself in the background."
        />
      </ul>
    </div>
  </section>
</template>
