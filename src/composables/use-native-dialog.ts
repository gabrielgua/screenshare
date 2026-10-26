import { ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'

export function useNativeDialog(isOpen: Ref<boolean>, isCloseBlocked: MaybeRefOrGetter<boolean>) {
  const dialogElement = ref<HTMLDialogElement>()

  watch(
    [isOpen, dialogElement],
    ([shouldBeOpen, element]) => {
      if (!element) {
        return
      }
      if (shouldBeOpen && !element.open) {
        element.showModal()
      }
      if (!shouldBeOpen && element.open) {
        element.close()
      }
    },
    { immediate: true },
  )

  function closeDialog() {
    if (!toValue(isCloseBlocked)) {
      isOpen.value = false
    }
  }

  function handleNativeCancel(cancelEvent: Event) {
    cancelEvent.preventDefault()
    closeDialog()
  }

  function handleBackdropClick(clickEvent: MouseEvent) {
    if (clickEvent.target === dialogElement.value) {
      closeDialog()
    }
  }

  return { dialogElement, closeDialog, handleNativeCancel, handleBackdropClick }
}
