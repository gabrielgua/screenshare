<script setup lang="ts">
import IllustrationScene from './IllustrationScene.vue'
</script>

<template>
  <IllustrationScene accessible-label="A paused screen next to a sleeping note" mood="paused">
    <template #window-content>
      <circle
        cx="120"
        cy="96"
        r="22"
        class="fill-neutral-100 stroke-neutral-500 dark:fill-neutral-700 dark:stroke-neutral-300"
        stroke-width="2"
      />
      <rect
        x="111"
        y="85"
        width="6"
        height="22"
        rx="3"
        class="fill-neutral-500 dark:fill-neutral-300"
      />
      <rect
        x="123"
        y="85"
        width="6"
        height="22"
        rx="3"
        class="fill-neutral-500 dark:fill-neutral-300"
      />
    </template>

    <template #floating-accessory>
      <rect
        x="160"
        y="108"
        width="52"
        height="40"
        rx="6"
        class="fill-white stroke-neutral-400 dark:fill-neutral-800 dark:stroke-neutral-500"
        stroke-width="2"
      />
      <path
        d="M170 120 H182 L170 134 H182"
        fill="none"
        class="stroke-neutral-400 dark:stroke-neutral-400"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M188 116 H196 L188 125 H196"
        fill="none"
        class="stroke-neutral-300 dark:stroke-neutral-500"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </template>
  </IllustrationScene>
</template>
