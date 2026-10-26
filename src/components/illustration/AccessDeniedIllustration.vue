<script setup lang="ts">
import IllustrationScene from './IllustrationScene.vue'
</script>

<template>
  <IllustrationScene accessible-label="A locked padlock on a screen next to a note" mood="blocked">
    <template #window-content>
      <path
        d="M109 92 V84 C109 77 114 72 120 72 C126 72 131 77 131 84 V92"
        fill="none"
        class="stroke-danger-600 dark:stroke-danger-300"
        stroke-width="5"
        stroke-linecap="round"
      />
      <rect
        x="101"
        y="90"
        width="38"
        height="30"
        rx="7"
        class="fill-danger-100 stroke-danger-600 dark:fill-danger-900 dark:stroke-danger-300"
        stroke-width="2"
      />
      <circle cx="120" cy="102" r="4" class="fill-danger-600 dark:fill-danger-300" />
      <rect
        x="118.5"
        y="104"
        width="3"
        height="8"
        rx="1.5"
        class="fill-danger-600 dark:fill-danger-300"
      />
    </template>

    <template #floating-accessory>
      <rect
        x="160"
        y="108"
        width="52"
        height="40"
        rx="6"
        class="fill-white stroke-danger-500 dark:fill-neutral-800 dark:stroke-danger-400"
        stroke-width="2"
      />
      <rect
        x="168"
        y="118"
        width="30"
        height="4"
        rx="2"
        class="fill-danger-300 dark:fill-danger-600"
      />
      <rect
        x="168"
        y="126"
        width="36"
        height="4"
        rx="2"
        class="fill-neutral-200 dark:fill-neutral-600"
      />
      <rect
        x="168"
        y="134"
        width="22"
        height="4"
        rx="2"
        class="fill-neutral-200 dark:fill-neutral-600"
      />
    </template>
  </IllustrationScene>
</template>
