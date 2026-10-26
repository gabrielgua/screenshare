<script setup lang="ts">
import { useId } from 'vue'
import BaseIcon from '@/components/icon/BaseIcon.vue'
import BaseText from '@/components/typography/BaseText.vue'
import type { AppIcon } from '@/theme/app-icons'

interface BaseSwitchProps {
  label: string
  icon?: AppIcon
}

withDefaults(defineProps<BaseSwitchProps>(), {
  icon: undefined,
})

const isOn = defineModel<boolean>({ required: true })

const labelId = `switch-label-${useId()}`

function handleSwitchClick() {
  isOn.value = !isOn.value
}
</script>

<template>
  <div class="flex min-h-10 items-center gap-3">
    <BaseIcon
      v-if="icon"
      :icon="icon"
      size="sm"
      class="shrink-0 text-neutral-500 dark:text-neutral-400"
    />
    <BaseText :id="labelId" as="span" size="sm" weight="medium" class="min-w-0 flex-1">
      {{ label }}
    </BaseText>
    <button
      type="button"
      role="switch"
      :aria-checked="isOn"
      :aria-labelledby="labelId"
      class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      :class="isOn ? 'bg-brand-600 dark:bg-brand-500' : 'bg-neutral-300 dark:bg-neutral-700'"
      @click="handleSwitchClick"
    >
      <span
        class="inline-block size-5 rounded-full bg-white shadow-card transition-transform duration-300 ease-bounce motion-reduce:transition-none"
        :class="isOn ? 'translate-x-5.5' : 'translate-x-0.5'"
      />
    </button>
  </div>
</template>
