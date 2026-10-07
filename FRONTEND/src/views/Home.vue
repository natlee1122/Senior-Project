<template>
  <div>
    <h1 class="text-h4 mb-1">Good morning, Amanda! <span>☀️</span></h1>
    <p class="text-body-2 text-muted">Another day, another adventure.</p>

    <v-row dense class="mt-5 mb-8">
      <v-col cols="12" md>
        <v-card class="px-6 py-5 h-100">
          <div class="d-flex justify-space-between text-body-2 mb-3">
            <strong>Lv. 3</strong><span class="text-muted">320 / 500 XP</span>
          </div>
          <v-progress-linear model-value="64" color="primary" bg-color="#edf1ef" bg-opacity="1" height="8" rounded />
        </v-card>
      </v-col>
      <v-col v-for="stat in stats" :key="stat.label" cols="12" sm="6" md="auto">
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
        <p class="text-body-2 text-muted">Small actions. Real progress.</p>
      </div>
      <v-btn variant="text" color="primary-dark" class="px-0" min-width="0" @click="goToQuests">View all →</v-btn>
    </div>

    <v-row dense>
      <v-col v-for="quest in quests" :key="quest.title" cols="12" sm="6" md="4">
        <v-card class="h-100">
          <QuestScene :theme="quest.theme" height="145" />
          <div class="pa-4">
            <v-chip size="x-small" class="font-weight-bold">{{ quest.category }}</v-chip>
            <h3 class="text-h6 my-2">{{ quest.title }}</h3>
            <div class="d-flex ga-3 text-caption font-weight-bold text-muted my-3">
              <span>★ +{{ quest.xp }} XP</span><span>● +{{ quest.coins }}</span>
            </div>
            <v-btn block size="large" color="primary" @click="goToQuests">Start</v-btn>
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
            <p class="text-body-2 text-muted mb-4">Your quests are personalized from your interests and recent activity.</p>
            <v-btn size="large" color="secondary" @click="goToQuests">Explore quests</v-btn>
          </div>
          <div class="big-pet mx-6">🦊</div>
        </v-card>
      </v-col>
      <v-col cols="12" md="5">
        <v-card class="pa-6 h-100">
          <span class="text-overline text-muted">THIS WEEK</span>
          <h3 class="text-h6 mt-2 mb-5">7 / 10 quests completed</h3>
          <div class="d-flex align-end ga-2 week-bars">
            <span v-for="(n, i) in weekly" :key="i" class="bar" :style="{ height: n * 18 + 10 + 'px' }" />
          </div>
          <small class="text-muted">Keep going. Your streak is growing.</small>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import QuestScene from '../components/QuestScene.vue'

const router = useRouter()
const { mdAndUp } = useDisplay()
const goToQuests = () => router.push('/quests')

const stats = [
  { label: 'Coins', value: 420, icon: '●', color: 'gold' },
  { label: 'Items', value: 12, icon: '✓', color: 'secondary' },
]
const quests = [
  { title: 'Take a 20 minute walk', category: 'Exercise', xp: 50, coins: 20, theme: 'forest' },
  { title: 'Study for 30 minutes', category: 'Study', xp: 40, coins: 15, theme: 'desk' },
  { title: 'Take a picture of something interesting', category: 'Explore', xp: 30, coins: 10, theme: 'camera' },
]
const weekly = [2, 3, 1, 3, 2, 0, 1]
</script>

<style scoped>
.recommendation { background: linear-gradient(120deg, #f3fbf7, #fff); }
.recommendation-title { max-width: 470px; }
.big-pet { font-size: 72px; }
.week-bars { height: 80px; }
.bar { width: 22px; background: #83c5b9; border-radius: 7px 7px 2px 2px; }
</style>
