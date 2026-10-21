<script setup lang="ts">
export type IllustrationMood = 'friendly' | 'blocked' | 'paused'

interface IllustrationSceneProps {
  accessibleLabel: string
  mood?: IllustrationMood
}

withDefaults(defineProps<IllustrationSceneProps>(), {
  mood: 'friendly',
})

const backdropClassesByMood: Record<IllustrationMood, string> = {
  friendly: 'fill-brand-100 dark:fill-brand-950',
  blocked: 'fill-danger-100 dark:fill-danger-950',
  paused: 'fill-neutral-200 dark:fill-neutral-800',
}

const windowHeaderClassesByMood: Record<IllustrationMood, string> = {
  friendly: 'fill-brand-500',
  blocked: 'fill-danger-500',
  paused: 'fill-neutral-500',
}

const accentSparkleClassesByMood: Record<IllustrationMood, string> = {
  friendly: 'fill-success-400',
  blocked: 'fill-danger-400',
  paused: 'fill-neutral-400',
}

const confettiClassesByMood: Record<IllustrationMood, string> = {
  friendly: 'fill-brand-300 dark:fill-brand-700',
  blocked: 'fill-danger-300 dark:fill-danger-700',
  paused: 'fill-neutral-300 dark:fill-neutral-600',
}
</script>

<template>
  <svg viewBox="0 0 240 180" class="h-auto w-56 sm:w-64" role="img" :aria-label="accessibleLabel">
    <circle cx="120" cy="92" r="78" :class="backdropClassesByMood[mood]" />

    <rect
      x="52"
      y="38"
      width="136"
      height="96"
      rx="14"
      class="fill-white stroke-neutral-200 dark:fill-neutral-800 dark:stroke-neutral-700"
      stroke-width="2"
    />
    <rect x="52" y="38" width="136" height="22" rx="14" :class="windowHeaderClassesByMood[mood]" />
    <rect x="52" y="50" width="136" height="10" :class="windowHeaderClassesByMood[mood]" />
    <circle cx="66" cy="49" r="3.5" class="fill-white/80" />
    <circle cx="78" cy="49" r="3.5" class="fill-white/60" />
    <circle cx="90" cy="49" r="3.5" class="fill-white/40" />

    <slot name="window-content" />

    <slot name="floating-accessory" />

    <path
      d="M34 54 L37 62 L45 65 L37 68 L34 76 L31 68 L23 65 L31 62 Z"
      class="fill-warning-400 motion-safe:animate-pulse"
    />
    <path
      d="M200 28 L202 33 L207 35 L202 37 L200 42 L198 37 L193 35 L198 33 Z"
      class="motion-safe:animate-pulse"
      :class="accentSparkleClassesByMood[mood]"
    />
    <circle cx="44" cy="134" r="4" :class="confettiClassesByMood[mood]" />
    <circle cx="214" cy="80" r="3" :class="confettiClassesByMood[mood]" />
  </svg>
</template>
