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
        <v-card class="h-100 position-relative">
          <v-btn icon rounded="circle" size="small" color="surface" class="quest-delete" aria-label="Delete quest" @click="askDelete(quest)">
            <span class="text-body-2 font-weight-bold">✕</span>
          </v-btn>
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
            <div class="d-flex ga-2">
              <v-btn class="flex-grow-1" size="large" :color="completions[quest.id] ? 'secondary' : 'primary'" :disabled="Boolean(completions[quest.id])" @click="goToQuests">
                {{ completions[quest.id] ? 'Completed' : 'Start' }}
              </v-btn>
              <v-btn size="large" variant="outlined" color="primary-dark" class="font-weight-bold" @click="askEdit(quest)">Edit</v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-alert v-if="!quests.length" color="secondary" variant="tonal" class="mb-4">
      You have no quests right now. Head to Quests to add one.
    </v-alert>

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

    <!-- Floating add button: stays in the bottom-right corner while scrolling -->
    <v-btn color="primary" size="large" rounded="pill" class="add-fab font-weight-bold" aria-label="Add quest" @click="openAdd">
      <span class="text-h6 mr-2">+</span>Add quest
    </v-btn>

    <QuestFormDialog v-model="editDialog" :quest="editTarget" @saved="onChanged" />
    <QuestDeleteDialog v-model="deleteDialog" :quest="deleteTarget" @deleted="onChanged" />
    <v-snackbar v-model="snackbar" :timeout="2400" location="bottom center">{{ message }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import QuestScene from '../components/QuestScene.vue'
import QuestFormDialog from '../components/QuestFormDialog.vue'
import QuestDeleteDialog from '../components/QuestDeleteDialog.vue'
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

async function load() {
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
}

onMounted(load)

const editDialog = ref(false)
const editTarget = ref(null)
const deleteDialog = ref(false)
const deleteTarget = ref(null)
const snackbar = ref(false)
const message = ref('')

function openAdd() {
  editTarget.value = null
  editDialog.value = true
}

function askEdit(quest) {
  editTarget.value = quest
  editDialog.value = true
}

function askDelete(quest) {
  deleteTarget.value = quest
  deleteDialog.value = true
}

async function onChanged(msg) {
  await load()
  message.value = msg
  snackbar.value = true
}

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
.add-fab { position: fixed; right: 28px; bottom: 28px; z-index: 1000; box-shadow: 0 6px 18px rgba(24, 52, 58, .28); }
.quest-delete { position: absolute; top: 8px; right: 8px; z-index: 2; opacity: .92; box-shadow: 0 1px 4px rgba(24, 52, 58, .25); }
.quest-delete:hover { opacity: 1; }
.week-bars { height: 80px; align-items: end; }
.bar { width: 22px; background: #83c5b9; border-radius: 7px 7px 2px 2px; }
</style>