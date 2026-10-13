import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginView from '@/views/LoginView.vue'
import DashboardView from '@/views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'dashboard', component: DashboardView, meta: { auth: true } },
    { path: '/login', name: 'login', component: LoginView, meta: { guest: true } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  await auth.waitReady()
  if (to.meta.auth && !auth.isLoggedIn) return { name: 'login' }
  if (to.meta.guest && auth.isLoggedIn) return { name: 'dashboard' }
  return true
})

export default router
