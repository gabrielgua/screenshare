<template>
  <svg
    viewBox="0 0 240 180"
    class="h-auto w-56 sm:w-64"
    role="img"
    aria-label="An hourglass on a screen next to an envelope"
  >
    <circle cx="120" cy="92" r="78" class="fill-brand-100 dark:fill-brand-950" />

    <rect
      x="52"
      y="38"
      width="136"
      height="96"
      rx="14"
      class="fill-white stroke-neutral-200 dark:fill-neutral-800 dark:stroke-neutral-700"
      stroke-width="2"
    />
    <rect x="52" y="38" width="136" height="22" rx="14" class="fill-brand-500" />
    <rect x="52" y="50" width="136" height="10" class="fill-brand-500" />
    <circle cx="66" cy="49" r="3.5" class="fill-white/80" />
    <circle cx="78" cy="49" r="3.5" class="fill-white/60" />
    <circle cx="90" cy="49" r="3.5" class="fill-white/40" />

    <g class="origin-center">
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
    </g>

    <g class="motion-safe:animate-bounce">
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
    </g>

    <path
      d="M34 54 L37 62 L45 65 L37 68 L34 76 L31 68 L23 65 L31 62 Z"
      class="fill-warning-400 motion-safe:animate-pulse"
    />
    <path
      d="M200 28 L202 33 L207 35 L202 37 L200 42 L198 37 L193 35 L198 33 Z"
      class="fill-success-400 motion-safe:animate-pulse"
    />
    <circle cx="44" cy="134" r="4" class="fill-brand-300 dark:fill-brand-700" />
    <circle cx="214" cy="80" r="3" class="fill-brand-300 dark:fill-brand-700" />
  </svg>
</template>
