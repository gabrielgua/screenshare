import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastTone = 'success' | 'neutral'

export interface ToastPerson {
  name: string
  imageUrl?: string
}

export interface Toast {
  id: number
  title: string
  description?: string
  tone: ToastTone
  person?: ToastPerson
}

export type ToastContent = Omit<Toast, 'id'>

const TOAST_VISIBLE_MILLISECONDS = 4000
const MAXIMUM_VISIBLE_TOASTS = 4

export const useToastStore = defineStore('toast', () => {
  const visibleToasts = ref<Toast[]>([])

  let nextToastId = 1

  function dismissToast(toastId: number) {
    visibleToasts.value = visibleToasts.value.filter((visibleToast) => visibleToast.id !== toastId)
  }

  function showToast(toastContent: ToastContent) {
    const toastId = nextToastId++
    visibleToasts.value = [{ ...toastContent, id: toastId }, ...visibleToasts.value].slice(
      0,
      MAXIMUM_VISIBLE_TOASTS,
    )
    setTimeout(() => dismissToast(toastId), TOAST_VISIBLE_MILLISECONDS)
  }

  return { visibleToasts, showToast, dismissToast }
})
