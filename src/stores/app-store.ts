import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  const greeting = ref('Hello World')

  return { greeting }
})
