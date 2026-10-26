import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ActionFeedbackKind = 'success' | 'error'

export interface ActionFeedback {
  id: number
  kind: ActionFeedbackKind
  title: string
  message?: string
  shouldAutoClose: boolean
  autoCloseAfterMilliseconds: number
}

export interface ActionFeedbackOptions {
  shouldAutoClose?: boolean
}

const SUCCESS_AUTO_CLOSE_MILLISECONDS = 2500
const ERROR_AUTO_CLOSE_MILLISECONDS = 4500

const autoCloseMillisecondsByKind: Record<ActionFeedbackKind, number> = {
  success: SUCCESS_AUTO_CLOSE_MILLISECONDS,
  error: ERROR_AUTO_CLOSE_MILLISECONDS,
}

export const useActionFeedbackStore = defineStore('action-feedback', () => {
  const visibleFeedback = ref<ActionFeedback>()
  const isFeedbackOpen = ref(false)

  let nextFeedbackId = 1
  let autoCloseTimer: ReturnType<typeof setTimeout> | undefined

  function cancelAutoClose() {
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer)
      autoCloseTimer = undefined
    }
  }

  function closeFeedback() {
    cancelAutoClose()
    isFeedbackOpen.value = false
  }

  function showFeedback(
    kind: ActionFeedbackKind,
    title: string,
    message?: string,
    { shouldAutoClose = true }: ActionFeedbackOptions = {},
  ) {
    cancelAutoClose()
    const autoCloseAfterMilliseconds = autoCloseMillisecondsByKind[kind]
    visibleFeedback.value = {
      id: nextFeedbackId++,
      kind,
      title,
      message,
      shouldAutoClose,
      autoCloseAfterMilliseconds,
    }
    isFeedbackOpen.value = true
    if (shouldAutoClose) {
      autoCloseTimer = setTimeout(closeFeedback, autoCloseAfterMilliseconds)
    }
  }

  function showSuccessFeedback(title: string, message?: string, options?: ActionFeedbackOptions) {
    showFeedback('success', title, message, options)
  }

  function showErrorFeedback(title: string, message?: string, options?: ActionFeedbackOptions) {
    showFeedback('error', title, message, options)
  }

  return {
    visibleFeedback,
    isFeedbackOpen,
    showSuccessFeedback,
    showErrorFeedback,
    closeFeedback,
  }
})
