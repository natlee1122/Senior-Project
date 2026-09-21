import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

const routes = [
  { path: '/login', component: () => import('./views/Login.vue') },
  { path: '/', component: () => import('./views/Home.vue') },
  { path: '/quests', component: () => import('./views/Quests.vue') },
  { path: '/world', component: () => import('./views/World.vue') },
  { path: '/inventory', component: () => import('./views/Inventory.vue') },
  { path: '/profile', component: () => import('./views/Profile.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to) => {
  const isLoggedIn =
    localStorage.getItem('lifescape-auth') === 'true' ||
    sessionStorage.getItem('lifescape-auth') === 'true'

  if (to.path !== '/login' && !isLoggedIn) {
    return '/login'
  }

  if (to.path === '/login' && isLoggedIn) {
    return '/'
  }
})

createApp(App).use(router).mount('#app')
