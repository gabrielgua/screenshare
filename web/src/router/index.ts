import { createRouter, createWebHistory } from 'vue-router'
import { useCurrentUserStore } from '@/stores/current-user-store'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAdmin?: boolean
    requiresApprovedUser?: boolean
    usesFullWidthLayout?: boolean
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { name: 'home', path: '/', component: () => import('@/views/HomeView.vue') },
    {
      name: 'rooms',
      path: '/rooms',
      component: () => import('@/views/RoomsView.vue'),
      meta: { requiresApprovedUser: true },
    },
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
        {
          name: 'admin-rooms',
          path: 'rooms',
          component: () => import('@/views/admin/AdministeredRoomsView.vue'),
        },
        {
          name: 'admin-room-details',
          path: 'rooms/:roomId',
          component: () => import('@/views/admin/RoomDetailsView.vue'),
        },
      ],
    },
    {
      name: 'room',
      path: '/rooms/:roomId',
      component: () => import('@/views/RoomView.vue'),
      meta: { usesFullWidthLayout: true },
    },
    { path: '/approvals', redirect: { name: 'admin-approvals' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (destination) => {
  const requiresAdmin = destination.matched.some((matchedRoute) => matchedRoute.meta.requiresAdmin)
  const requiresApprovedUser = destination.matched.some(
    (matchedRoute) => matchedRoute.meta.requiresApprovedUser,
  )
  if (!requiresAdmin && !requiresApprovedUser) {
    return true
  }
  const currentUserStore = useCurrentUserStore()
  await currentUserStore.waitUntilCurrentUserIsResolved()
  const isAllowed = requiresAdmin ? currentUserStore.isAdmin : currentUserStore.isApproved
  return isAllowed ? true : { name: 'home' }
})

export default router
