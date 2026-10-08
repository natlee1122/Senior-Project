<template>
  <v-app>
    <router-view v-if="isLoginPage" />

    <template v-else>
      <v-navigation-drawer v-if="!xs" permanent :rail="smAndDown" :width="230" :rail-width="76" border="e" class="px-2">
        <template #prepend>
          <div class="d-flex align-center ga-3 pt-7 pb-8 px-2" :class="{ 'justify-center': smAndDown }">
            <v-avatar color="secondary" rounded="lg" size="31" class="text-h5">⌁</v-avatar>
            <span v-if="!smAndDown" class="text-h5">Lifescape</span>
          </div>
        </template>

        <v-list nav class="pa-0 d-flex flex-column ga-1" base-color="#6d8084" color="primary-dark">
          <v-list-item
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            exact
            rounded="lg"
            min-height="44"
            class="font-weight-bold"
          >
            <template #prepend><span class="nav-icon" :class="{ 'nav-icon--gap': !smAndDown }">{{ item.symbol }}</span></template>
            <v-list-item-title v-if="!smAndDown" class="text-body-2 font-weight-bold">{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <template v-if="!smAndDown" #append>
          <v-card color="cream" rounded="lg" class="streak position-relative pa-3 ma-0 mb-5 text-caption">
            <div>🔥 Today's Streak</div>
            <div class="text-subtitle-1 font-weight-bold text-ink mt-1">3 days</div>
            <div class="streak-pet">🦊</div>
          </v-card>
        </template>
      </v-navigation-drawer>

      <v-app-bar flat border="b" height="72" color="rgba(255,255,255,.86)" class="topbar px-md-10 px-4">
        <v-spacer />
        <div class="d-flex align-center ga-4">
          <v-btn icon variant="text" size="32" color="muted" aria-label="Search" @click="showNotice('Search is coming soon.')">
            <span class="text-h6">⌕</span>
          </v-btn>
          <v-btn icon variant="text" size="32" color="muted" aria-label="Notifications" @click="showNotice('No new notifications.')">
            <span class="text-h6">♧</span>
          </v-btn>
          <v-avatar color="sand" size="34" class="font-weight-bold cursor-pointer" role="button" tabindex="0" @click="$router.push('/profile')">{{ initial }}</v-avatar>
          <v-btn variant="text" size="small" color="primary-dark" @click="handleLogout">Log out</v-btn>
        </div>
      </v-app-bar>

      <v-main>
        <v-container max-width="1280" class="px-4 px-sm-7 px-md-11 pt-6 pt-sm-7 pt-md-10 pb-15">
          <router-view />
        </v-container>
      </v-main>

      <v-snackbar v-model="noticeOpen" :timeout="1800">{{ notice }}</v-snackbar>
    </template>
  </v-app>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import api from './api'
import { getInitial } from './utils/user'

const route = useRoute()
const router = useRouter()
const { xs, smAndDown } = useDisplay()

const isLoginPage = computed(() => ['/login', '/signup'].includes(route.path))
const user = ref(null)
const initial = computed(() => (user.value ? getInitial(user.value) : ''))

// App.vue stays mounted while you move between pages, so load the user once
// after login (when we leave /login or /signup) and clear it on those pages.
watch(
  () => route.path,
  async () => {
    if (isLoginPage.value) {
      user.value = null
    } else if (!user.value) {
      try {
        user.value = await api.users.me()
      } catch {
        user.value = null
      }
    }
  },
  { immediate: true },
)

const notice = ref('')
const noticeOpen = ref(false)

const navItems = [
  { title: 'Home', to: '/', symbol: '⌂' },
  { title: 'Quests', to: '/quests', symbol: '✓' },
  { title: 'World', to: '/world', symbol: '◉' },
  { title: 'Inventory', to: '/inventory', symbol: '◇' },
  { title: 'Profile', to: '/profile', symbol: '○' },
]

function showNotice(message) {
  notice.value = message
  noticeOpen.value = true
}

async function handleLogout() {
  await api.auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.nav-icon { display: inline-block; width: 20px; text-align: center; font-size: 17px; }
.nav-icon--gap { margin-inline-end: 13px; }
.topbar { backdrop-filter: blur(12px); }
.streak-pet { position: absolute; right: 12px; bottom: 8px; font-size: 28px; }
</style>