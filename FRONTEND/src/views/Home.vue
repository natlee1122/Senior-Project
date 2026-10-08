<template>
  <div>
    <h1 class="text-h4 mb-1">Welcome, {{ firstName || 'Adventurer' }}! <span>☀️</span></h1>
    <p class="text-body-2 text-muted">Another day, another adventure.</p>

    <v-row dense class="mt-5 mb-8">
      <v-col cols="12" md>
        <v-card class="px-6 py-5 h-100">
          <div class="d-flex justify-space-between text-body-2 mb-3">
            <strong>Lv. {{ stats.level }}</strong><span class="text-muted">{{ stats.xpIntoLevel }} / 500 XP</span>
          </div>
          <v-progress-linear :model-value="stats.levelProgress" color="primary" bg-color="#edf1ef" bg-opacity="1" height="8" rounded />
        </v-card>
      </v-col>
      <v-col v-for="stat in statCards" :key="stat.label" cols="12" sm="6" md="auto">
        <v-card :width="mdAndUp ? 180 : undefined" class="pa-5 d-flex align-center ga-3 h-100">
          <v-avatar :color="stat.color" rounded="lg" size="36">{{ stat.icon }}</v-avatar>
          <div>
            <div class="text-h6 font-weight-bold">{{ stat.value }}</div>
            <div class="text-caption text-muted">{{ stat.label }}</div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <div class="d-flex justify-space-between align-end mb-4">
      <div>
        <h2 class="text-h5 mb-1">Today's Quests</h2>
        <p class="text-body-2 text-muted">{{ stats.completedToday }} of {{ quests.length }} completed today.</p>
      </div>
      <v-btn variant="text" color="primary-dark" class="px-0" min-width="0" @click="goToQuests">View all →</v-btn>
    </div>

    <v-row dense>
      <v-col v-for="quest in quests" :key="quest.id" cols="12" sm="6" md="4">
        <v-card class="h-100">
          <QuestScene :theme="quest.theme" height="145" />
          <div class="pa-4">
            <div class="d-flex justify-space-between align-center">
              <v-chip size="x-small" class="font-weight-bold">{{ quest.category }}</v-chip>
              <span v-if="completions[quest.id]" class="text-caption text-primary font-weight-bold">✓ Done</span>
            </div>
            <h3 class="text-h6 my-2">{{ quest.title }}</h3>
            <div class="d-flex ga-3 text-caption font-weight-bold text-muted my-3">
              <span>★ +{{ quest.xp }} XP</span><span>● +{{ quest.coins }}</span>
            </div>
            <v-btn block size="large" :color="completions[quest.id] ? 'secondary' : 'primary'" :disabled="Boolean(completions[quest.id])" @click="goToQuests">
              {{ completions[quest.id] ? 'Completed' : 'Start' }}
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-row dense class="mt-1">
      <v-col cols="12" md="7">
        <v-card class="recommendation pa-6 d-flex align-center justify-space-between h-100">
          <div>
            <span class="text-overline text-muted">YOUR NEXT ADVENTURE</span>
            <h2 class="text-h5 my-2 recommendation-title">Make today a little more interesting.</h2>
            <p class="text-body-2 text-muted mb-4">Complete quests, collect rewards, and watch your progress persist.</p>
            <v-btn size="large" color="secondary" @click="goToQuests">Explore quests</v-btn>
          </div>
          <div class="big-pet mx-6">🦊</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card class="pa-6 h-100">
          <span class="text-overline text-muted">THIS WEEK</span>
          <h3 class="text-h6 mt-2 mb-5">{{ stats.completedThisWeek }} quests completed</h3>
          <div class="d-flex align-end ga-2 week-bars">
            <span v-for="(n, i) in weekly" :key="i" class="bar" :style="{ height: Math.min(70, n * 18 + 10) + 'px' }" />
          </div>
          <small class="text-muted">Your completed quests are saved to your account.</small>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import QuestScene from '../components/QuestScene.vue'
import api from '../api'
import { getFirstName } from '../utils/user'

const router = useRouter()
const { mdAndUp } = useDisplay()

// Data now arrives asynchronously, so start with safe defaults.
const quests = ref([])
const user = ref(null)
const completions = ref({})
const stats = ref({
  xp: 0,
  coins: 0,
  level: 1,
  xpIntoLevel: 0,
  levelProgress: 0,
  completedToday: 0,
  completedThisWeek: 0,
})

onMounted(async () => {
  try {
    const [questList, me, statData, todayDone] = await Promise.all([
      api.quests.list(),
      api.users.me(),
      api.users.stats(),
      api.quests.todayCompletions(),
    ])
    quests.value = questList
    user.value = me
    stats.value = statData
    completions.value = todayDone
  } catch (err) {
    console.error('Failed to load home data:', err)
  }
})

const firstName = computed(() => getFirstName(user.value))

const statCards = computed(() => [
  { label: 'Coins', value: stats.value.coins, icon: '●', color: 'gold' },
  { label: 'Quests today', value: stats.value.completedToday, icon: '✓', color: 'secondary' },
])

const weekly = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    return Object.keys(user.value?.completed?.[date.toISOString().slice(0, 10)] || {}).length
  }),
)

const goToQuests = () => router.push('/quests')
</script>

<style scoped>
.recommendation { background: linear-gradient(120deg, #f3fbf7, #fff); }
.recommendation-title { max-width: 470px; }
.big-pet { font-size: 72px; }
.week-bars { height: 80px; align-items: end; }
.bar { width: 22px; background: #83c5b9; border-radius: 7px 7px 2px 2px; }
</style>