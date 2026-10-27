<script setup lang="ts">
import { nextTick, ref, useId, watch } from 'vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'

export type DropdownMenuAlignment = 'start' | 'end'

interface BaseDropdownMenuProps {
  accessibleLabel: string
  alignment?: DropdownMenuAlignment
}

withDefaults(defineProps<BaseDropdownMenuProps>(), {
  alignment: 'end',
})

const isOpen = defineModel<boolean>('open', { default: false })

const MENU_ITEM_SELECTOR = '[role="menuitem"]:not(:disabled)'

const menuId = useId()
const containerElement = ref<HTMLElement>()
const menuElement = ref<HTMLElement>()
const wasOpenedWithKeyboard = ref(false)

const panelPositionClassesByAlignment: Record<DropdownMenuAlignment, string> = {
  start: 'left-0 origin-top-left',
  end: 'right-0 origin-top-right',
}

function readMenuItems(): HTMLElement[] {
  return [...(menuElement.value?.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR) ?? [])]
}

function focusTrigger() {
  containerElement.value?.querySelector<HTMLElement>('[aria-haspopup="menu"]')?.focus()
}

function toggleMenu(triggerEvent?: MouseEvent) {
  wasOpenedWithKeyboard.value = triggerEvent?.detail === 0
  isOpen.value = !isOpen.value
}

function closeMenu() {
  isOpen.value = false
}

function moveFocus(step: number) {
  const menuItems = readMenuItems()
  if (menuItems.length === 0) {
    return
  }
  const focusedPosition = menuItems.indexOf(document.activeElement as HTMLElement)
  const nextPosition = (focusedPosition + step + menuItems.length) % menuItems.length
  menuItems[nextPosition]?.focus()
}

function handleMenuKeydown(keyboardEvent: KeyboardEvent) {
  if (keyboardEvent.key === 'ArrowDown') {
    keyboardEvent.preventDefault()
    moveFocus(1)
  }
  if (keyboardEvent.key === 'ArrowUp') {
    keyboardEvent.preventDefault()
    moveFocus(-1)
  }
  if (keyboardEvent.key === 'Tab') {
    closeMenu()
  }
}

onClickOutside(containerElement, closeMenu)

onKeyStroke('Escape', () => {
  if (!isOpen.value) {
    return
  }
  closeMenu()
  focusTrigger()
})

watch(isOpen, async (isNowOpen) => {
  if (!isNowOpen) {
    return
  }
  await nextTick()
  if (wasOpenedWithKeyboard.value) {
    readMenuItems()[0]?.focus()
    return
  }
  menuElement.value?.focus()
})
</script>

<template>
  <div ref="containerElement" class="relative">
    <slot name="trigger" :is-open="isOpen" :menu-id="menuId" :toggle-menu="toggleMenu" />
    <Transition
      enter-from-class="-translate-y-1 scale-95 opacity-0"
      enter-active-class="transition duration-300 ease-bounce motion-reduce:transition-none"
      leave-active-class="transition duration-150 ease-in motion-reduce:transition-none"
      leave-to-class="-translate-y-1 scale-95 opacity-0"
    >
      <div
        v-if="isOpen"
        :id="menuId"
        ref="menuElement"
        role="menu"
        tabindex="-1"
        :aria-label="accessibleLabel"
        class="absolute top-full z-30 mt-2 w-80 overflow-hidden rounded-card border border-neutral-200 bg-white shadow-card outline-none dark:border-neutral-800 dark:bg-neutral-900"
        :class="panelPositionClassesByAlignment[alignment]"
        @keydown="handleMenuKeydown"
      >
        <slot :close-menu="closeMenu" />
      </div>
    </Transition>
  </div>
</template>
