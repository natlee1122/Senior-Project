import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/login', component: () => import('./views/Login.vue') },
  { path: '/signup', component: () => import('./views/Signup.vue') },
  { path: '/', component: () => import('./views/Home.vue') },
  { path: '/quests', component: () => import('./views/Quests.vue') },
  { path: '/world', component: () => import('./views/World.vue') },
  { path: '/inventory', component: () => import('./views/Inventory.vue') },
  { path: '/profile', component: () => import('./views/Profile.vue') },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const isLoggedIn = Boolean(localStorage.getItem('lifescape-token'))
  if (!['/login', '/signup'].includes(to.path) && !isLoggedIn) return '/login'
  if (['/login', '/signup'].includes(to.path) && isLoggedIn) return '/'
})

export default router
