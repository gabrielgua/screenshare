<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { onKeyStroke, useEventListener, useTimeoutFn } from '@vueuse/core'
import BaseText from '@/components/typography/BaseText.vue'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'
export type TooltipAlignment = 'start' | 'center' | 'end'

interface BaseTooltipProps {
  text: string
  placement?: TooltipPlacement
  alignment?: TooltipAlignment
  isDisabled?: boolean
}

interface TooltipPosition {
  top: number
  left: number
}

const props = withDefaults(defineProps<BaseTooltipProps>(), {
  placement: 'top',
  alignment: 'center',
  isDisabled: false,
})

const TOOLTIP_GAP_PIXELS = 8
const VIEWPORT_MARGIN_PIXELS = 8
const SHOW_DELAY_MILLISECONDS = 250

const oppositePlacementByPlacement: Record<TooltipPlacement, TooltipPlacement> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
}

const triggerElement = ref<HTMLElement>()
const tooltipElement = ref<HTMLElement>()
const isVisible = ref(false)

const { start: scheduleShowing, stop: cancelShowing } = useTimeoutFn(
  showTooltip,
  SHOW_DELAY_MILLISECONDS,
  { immediate: false },
)

function alignAlongAxis(startEdge: number, triggerLength: number, tooltipLength: number): number {
  if (props.alignment === 'start') {
    return startEdge
  }
  if (props.alignment === 'end') {
    return startEdge + triggerLength - tooltipLength
  }
  return startEdge + (triggerLength - tooltipLength) / 2
}

function calculatePosition(
  placement: TooltipPlacement,
  triggerBox: DOMRect,
  tooltipWidth: number,
  tooltipHeight: number,
): TooltipPosition {
  if (placement === 'top' || placement === 'bottom') {
    return {
      top:
        placement === 'top'
          ? triggerBox.top - tooltipHeight - TOOLTIP_GAP_PIXELS
          : triggerBox.bottom + TOOLTIP_GAP_PIXELS,
      left: alignAlongAxis(triggerBox.left, triggerBox.width, tooltipWidth),
    }
  }
  return {
    top: alignAlongAxis(triggerBox.top, triggerBox.height, tooltipHeight),
    left:
      placement === 'left'
        ? triggerBox.left - tooltipWidth - TOOLTIP_GAP_PIXELS
        : triggerBox.right + TOOLTIP_GAP_PIXELS,
  }
}

function fitsInViewport(position: TooltipPosition, tooltipWidth: number, tooltipHeight: number) {
  return (
    position.top >= VIEWPORT_MARGIN_PIXELS &&
    position.left >= VIEWPORT_MARGIN_PIXELS &&
    position.top + tooltipHeight <= window.innerHeight - VIEWPORT_MARGIN_PIXELS &&
    position.left + tooltipWidth <= window.innerWidth - VIEWPORT_MARGIN_PIXELS
  )
}

function keepInsideViewport(edge: number, length: number, viewportLength: number): number {
  const lastAllowedEdge = viewportLength - VIEWPORT_MARGIN_PIXELS - length
  return Math.max(VIEWPORT_MARGIN_PIXELS, Math.min(edge, lastAllowedEdge))
}

function placeTooltip() {
  const trigger = triggerElement.value
  const tooltip = tooltipElement.value
  if (!trigger || !tooltip) {
    return
  }
  const triggerBox = trigger.getBoundingClientRect()
  const { offsetWidth: tooltipWidth, offsetHeight: tooltipHeight } = tooltip
  const preferredPosition = calculatePosition(
    props.placement,
    triggerBox,
    tooltipWidth,
    tooltipHeight,
  )
  const chosenPosition = fitsInViewport(preferredPosition, tooltipWidth, tooltipHeight)
    ? preferredPosition
    : calculatePosition(
        oppositePlacementByPlacement[props.placement],
        triggerBox,
        tooltipWidth,
        tooltipHeight,
      )
  tooltip.style.top = `${keepInsideViewport(chosenPosition.top, tooltipHeight, window.innerHeight)}px`
  tooltip.style.left = `${keepInsideViewport(chosenPosition.left, tooltipWidth, window.innerWidth)}px`
}

function showTooltip() {
  const tooltip = tooltipElement.value
  if (props.isDisabled || !tooltip || isVisible.value) {
    return
  }
  tooltip.showPopover()
  isVisible.value = true
  placeTooltip()
}

function hideTooltip() {
  cancelShowing()
  if (!isVisible.value) {
    return
  }
  tooltipElement.value?.hidePopover()
  isVisible.value = false
}

function handlePointerEnter(pointerEvent: PointerEvent) {
  if (pointerEvent.pointerType !== 'touch') {
    scheduleShowing()
  }
}

function handleFocusIn(focusEvent: FocusEvent) {
  if (focusEvent.target instanceof HTMLElement && focusEvent.target.matches(':focus-visible')) {
    scheduleShowing()
  }
}

onKeyStroke('Escape', hideTooltip)
useEventListener(window, 'scroll', hideTooltip, { capture: true, passive: true })

watch(
  () => props.text,
  async () => {
    if (!isVisible.value) {
      return
    }
    await nextTick()
    placeTooltip()
  },
)

watch(
  () => props.isDisabled,
  (isNowDisabled) => {
    if (isNowDisabled) {
      hideTooltip()
    }
  },
)

onBeforeUnmount(hideTooltip)
</script>

<template>
  <span
    ref="triggerElement"
    class="inline-flex"
    @pointerenter="handlePointerEnter"
    @pointerleave="hideTooltip"
    @pointerdown="hideTooltip"
    @focusin="handleFocusIn"
    @focusout="hideTooltip"
  >
    <slot />
    <span
      ref="tooltipElement"
      popover="manual"
      aria-hidden="true"
      class="pointer-events-none fixed inset-auto m-0 max-w-64 scale-100 rounded-control border border-neutral-200 bg-white px-2.5 py-1.5 opacity-100 shadow-card transition duration-200 ease-bounce starting:scale-95 starting:opacity-0 motion-reduce:transition-none dark:border-neutral-700 dark:bg-neutral-800"
    >
      <BaseText as="span" size="caption" weight="semibold">{{ text }}</BaseText>
    </span>
  </span>
</template>
