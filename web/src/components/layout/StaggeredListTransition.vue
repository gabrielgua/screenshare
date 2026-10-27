<script setup lang="ts">
interface StaggeredListTransitionProps {
  tag?: string
  delayBetweenItemsInMilliseconds?: number
}

const props = withDefaults(defineProps<StaggeredListTransitionProps>(), {
  tag: 'ul',
  delayBetweenItemsInMilliseconds: 80,
})

function readStaggerIndex(element: HTMLElement): number {
  const staggerIndex = Number(element.dataset.staggerIndex)
  return Number.isFinite(staggerIndex) ? staggerIndex : 0
}

function handleBeforeEnter(element: Element) {
  const listItem = element as HTMLElement
  const enterDelay = readStaggerIndex(listItem) * props.delayBetweenItemsInMilliseconds
  listItem.style.transitionDelay = `${enterDelay}ms`
}

function clearEnterDelay(element: Element) {
  ;(element as HTMLElement).style.transitionDelay = ''
}
</script>

<template>
  <TransitionGroup
    :tag="tag"
    appear
    class="relative"
    enter-active-class="transition duration-500 ease-bounce motion-reduce:transition-none"
    enter-from-class="translate-y-4 scale-95 opacity-0"
    leave-active-class="absolute inset-x-0 transition duration-200 ease-in motion-reduce:transition-none"
    leave-to-class="scale-95 opacity-0"
    move-class="transition-transform duration-500 ease-bounce motion-reduce:transition-none"
    @before-enter="handleBeforeEnter"
    @after-enter="clearEnterDelay"
    @enter-cancelled="clearEnterDelay"
  >
    <slot />
  </TransitionGroup>
</template>
