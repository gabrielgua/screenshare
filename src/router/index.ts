import { createRouter, createWebHistory } from 'vue-router'
import { useCurrentUserStore } from '@/stores/current-user-store'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAdmin?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'home', path: '/', component: () => import('@/views/HomeView.vue') },
    {
      name: 'user-approvals',
      path: '/approvals',
      component: () => import('@/views/UserApprovalsView.vue'),
      meta: { requiresAdmin: true },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (destination) => {
  if (!destination.meta.requiresAdmin) {
    return true
  }
  const currentUserStore = useCurrentUserStore()
  await currentUserStore.waitUntilCurrentUserIsResolved()
  return currentUserStore.isAdmin ? true : { name: 'home' }
})

export default router
