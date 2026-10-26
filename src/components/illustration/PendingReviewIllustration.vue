<script setup lang="ts">
import IllustrationScene from './IllustrationScene.vue'
</script>

<template>
  <IllustrationScene
    accessible-label="An hourglass on a screen next to an envelope"
    mood="friendly"
  >
    <template #window-content>
      <rect
        x="104"
        y="70"
        width="32"
        height="5"
        rx="2.5"
        class="fill-brand-700 dark:fill-brand-300"
      />
      <rect
        x="104"
        y="117"
        width="32"
        height="5"
        rx="2.5"
        class="fill-brand-700 dark:fill-brand-300"
      />
      <path
        d="M108 75 H132 C132 88 124 92 120 96 C116 92 108 88 108 75 Z"
        class="fill-brand-100 stroke-brand-600 dark:fill-brand-900 dark:stroke-brand-300"
        stroke-width="2"
      />
      <path
        d="M108 117 H132 C132 104 124 100 120 96 C116 100 108 104 108 117 Z"
        class="fill-brand-100 stroke-brand-600 dark:fill-brand-900 dark:stroke-brand-300"
        stroke-width="2"
      />
      <path
        d="M113 80 H127 C126 86 122 89 120 91 C118 89 114 86 113 80 Z"
        class="fill-warning-400"
      />
      <path
        d="M112 116 H128 C127 110 123 108 120 107 C117 108 113 110 112 116 Z"
        class="fill-warning-400"
      />
      <rect
        x="119"
        y="94"
        width="2"
        height="12"
        rx="1"
        class="fill-warning-400 motion-safe:animate-pulse"
      />
    </template>

    <template #floating-accessory>
      <rect
        x="160"
        y="112"
        width="52"
        height="36"
        rx="6"
        class="fill-white stroke-brand-500 dark:fill-neutral-800 dark:stroke-brand-400"
        stroke-width="2"
      />
      <path
        d="M162 116 L186 133 L210 116"
        fill="none"
        class="stroke-brand-500 dark:stroke-brand-400"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </template>
  </IllustrationScene>
</template>
