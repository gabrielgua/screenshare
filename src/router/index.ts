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
      path: '/admin',
      component: () => import('@/views/admin/AdminLayoutView.vue'),
      meta: { requiresAdmin: true },
      redirect: { name: 'admin-approvals' },
      children: [
        {
          name: 'admin-approvals',
          path: 'approvals',
          component: () => import('@/views/admin/UserApprovalsView.vue'),
        },
        {
          name: 'admin-users',
          path: 'users',
          component: () => import('@/views/admin/RegisteredUsersView.vue'),
        },
        {
          name: 'admin-user-details',
          path: 'users/:userId',
          component: () => import('@/views/admin/UserDetailsView.vue'),
        },
      ],
    },
    { path: '/approvals', redirect: { name: 'admin-approvals' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (destination) => {
  const requiresAdmin = destination.matched.some((matchedRoute) => matchedRoute.meta.requiresAdmin)
  if (!requiresAdmin) {
    return true
  }
  const currentUserStore = useCurrentUserStore()
  await currentUserStore.waitUntilCurrentUserIsResolved()
  return currentUserStore.isAdmin ? true : { name: 'home' }
})

export default router
