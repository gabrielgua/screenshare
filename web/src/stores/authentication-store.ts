import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Session } from '@supabase/supabase-js'
import { supabaseClient } from '@/services/supabase-client'

interface DiscordUserMetadata {
  full_name?: string
  avatar_url?: string
  custom_claims?: {
    global_name?: string
  }
}

const FALLBACK_DISPLAY_NAME = 'Discord user'

export const useAuthenticationStore = defineStore('authentication', () => {
  const session = ref<Session | null>(null)
  const isRestoringSession = ref(true)
  const isRedirectingToDiscord = ref(false)
  const signInErrorMessage = ref<string>()

  const signedInUser = computed(() => session.value?.user ?? null)
  const isSignedIn = computed(() => signedInUser.value !== null)
  const discordMetadata = computed(
    () => (signedInUser.value?.user_metadata ?? {}) as DiscordUserMetadata,
  )
  const displayName = computed(
    () =>
      discordMetadata.value.custom_claims?.global_name ??
      discordMetadata.value.full_name ??
      FALLBACK_DISPLAY_NAME,
  )
  const avatarUrl = computed(() => discordMetadata.value.avatar_url)

  async function restoreSession() {
    supabaseClient.auth.onAuthStateChange((_event, changedSession) => {
      session.value = changedSession
    })
    const { data } = await supabaseClient.auth.getSession()
    session.value = data.session
    isRestoringSession.value = false
  }

  async function signInWithDiscord() {
    isRedirectingToDiscord.value = true
    signInErrorMessage.value = undefined
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: 'discord',
      options: { redirectTo: window.location.href },
    })
    if (error) {
      signInErrorMessage.value = error.message
      isRedirectingToDiscord.value = false
    }
  }

  async function signOut() {
    await supabaseClient.auth.signOut()
  }

  return {
    isRestoringSession,
    isRedirectingToDiscord,
    signInErrorMessage,
    signedInUser,
    isSignedIn,
    displayName,
    avatarUrl,
    restoreSession,
    signInWithDiscord,
    signOut,
  }
})
