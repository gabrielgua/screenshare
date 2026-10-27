<script setup lang="ts">
export type SliderOrientation = 'horizontal' | 'vertical'

interface BaseSliderProps {
  accessibleLabel: string
  minimum?: number
  maximum?: number
  step?: number
  orientation?: SliderOrientation
  isDisabled?: boolean
}

withDefaults(defineProps<BaseSliderProps>(), {
  minimum: 0,
  maximum: 1,
  step: 0.01,
  orientation: 'horizontal',
  isDisabled: false,
})

const sliderValue = defineModel<number>({ required: true })

const shapeClassesByOrientation: Record<SliderOrientation, string> = {
  horizontal: 'h-1.5 w-24',
  vertical: 'range-vertical h-24 w-1.5',
}

function handleSliderInput(inputEvent: Event) {
  sliderValue.value = Number((inputEvent.target as HTMLInputElement).value)
}
</script>

<template>
  <input
    type="range"
    :min="minimum"
    :max="maximum"
    :step="step"
    :value="sliderValue"
    :aria-label="accessibleLabel"
    :aria-orientation="orientation"
    :disabled="isDisabled"
    class="cursor-pointer accent-brand-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
    :class="shapeClassesByOrientation[orientation]"
    @input="handleSliderInput"
  />
</template>
