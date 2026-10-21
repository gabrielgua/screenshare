<script setup lang="ts">
import { computed } from 'vue'
import type { TextTone } from '@/theme/color-variants'
import BaseText, { type TextElement, type TextWeight } from './BaseText.vue'

export type HeadingLevel = 1 | 2 | 3 | 4

export type HeadingSize = 'display' | 'title' | 'subtitle' | 'section'

interface BaseHeadingProps {
  level?: HeadingLevel
  size?: HeadingSize
  tone?: TextTone
}

const props = withDefaults(defineProps<BaseHeadingProps>(), {
  level: 2,
  size: undefined,
  tone: 'default',
})

const elementByLevel: Record<HeadingLevel, TextElement> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
}

const sizeByLevel: Record<HeadingLevel, HeadingSize> = {
  1: 'display',
  2: 'title',
  3: 'subtitle',
  4: 'section',
}

const weightBySize: Record<HeadingSize, TextWeight> = {
  display: 'extrabold',
  title: 'bold',
  subtitle: 'semibold',
  section: 'semibold',
}

const visualSize = computed(() => props.size ?? sizeByLevel[props.level])
</script>

<template>
  <BaseText
    :as="elementByLevel[level]"
    :size="visualSize"
    :weight="weightBySize[visualSize]"
    :tone="tone"
  >
    <slot />
  </BaseText>
</template>
