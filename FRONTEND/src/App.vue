<template>
  <div v-if="isLoginPage" class="login-shell">
    <RouterView />
  </div>

  <div v-else class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">⌁</div>
        <span>Lifescape</span>
      </div>

      <nav class="nav">
        <RouterLink to="/" class="nav-item">
          <span class="nav-icon">⌂</span><span>Home</span>
        </RouterLink>
        <RouterLink to="/quests" class="nav-item">
          <span class="nav-icon">✓</span><span>Quests</span>
        </RouterLink>
        <RouterLink to="/world" class="nav-item">
          <span class="nav-icon">◉</span><span>World</span>
        </RouterLink>
        <RouterLink to="/inventory" class="nav-item">
          <span class="nav-icon">◇</span><span>Inventory</span>
        </RouterLink>
        <RouterLink to="/profile" class="nav-item">
          <span class="nav-icon">○</span><span>Profile</span>
        </RouterLink>
      </nav>

      <div class="sidebar-bottom">
        <div class="streak-card">
          <div class="streak-title">🔥 Today's Streak</div>
          <strong>3 days</strong>
          <div class="mini-pet">🦊</div>
        </div>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <div></div>
        <div class="top-actions">
          <button>⌕</button>
          <button>♧</button>
          <div class="avatar">A</div>
        </div>
      </header>

      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isLoginPage = computed(() => route.path === '/login')
</script>
