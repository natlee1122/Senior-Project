<template>
  <div>
    <PageHeading eyebrow="DAILY ADVENTURES" title="Quests" subtitle="Complete small real-world activities and earn rewards.">
      <v-btn size="large" color="secondary" @click="notify('Custom quests are coming soon.')">＋ Custom quest</v-btn>
    </PageHeading>

    <div class="d-flex flex-wrap ga-2 mb-5">
      <v-chip
        v-for="filter in filters"
        :key="filter"
        size="large"
        :color="selectedFilter === filter ? 'primary' : 'surface'"
        :border="selectedFilter !== filter"
        :class="{ 'text-muted': selectedFilter !== filter }"
        @click="selectedFilter = filter"
      >{{ filter }}</v-chip>
    </div>

    <div class="d-flex flex-column ga-4">
      <v-card v-for="quest in filteredQuests" :key="quest.title" class="d-flex flex-column flex-md-row">
        <QuestScene :theme="quest.theme" :width="mdAndUp ? 290 : '100%'" :min-height="mdAndUp ? 245 : 160" class="flex-shrink-0" />
        <div class="pa-7">
          <v-chip size="x-small" class="font-weight-bold">{{ quest.category }}</v-chip>
          <h2 class="text-h5 mt-3 mb-2">{{ quest.title }}</h2>
          <p class="text-body-1 text-muted mb-4 quest-desc">{{ quest.description }}</p>
          <div class="d-flex ga-5 text-caption text-muted">
            <span>◷ {{ quest.duration }}</span><span>◆ {{ quest.difficulty }}</span>
          </div>
          <div class="d-flex ga-3 text-caption font-weight-bold text-muted my-3">
            <span>★ +{{ quest.xp }} XP</span><span>● +{{ quest.coins }} coins</span>
          </div>
          <v-btn size="large" color="primary" width="180" class="mt-1" @click="notify(`Quest started: ${quest.title}`)">Start Quest</v-btn>
        </div>
      </v-card>
    </div>

    <v-snackbar v-model="snackbar" :timeout="2200">{{ message }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useDisplay } from 'vuetify'
import PageHeading from '../components/PageHeading.vue'
import QuestScene from '../components/QuestScene.vue'

const { mdAndUp } = useDisplay()
const message = ref('')
const snackbar = ref(false)
const selectedFilter = ref('All')

const filters = ['All', 'Exercise', 'Study', 'Explore', 'Creative']
const quests = [
  { title: 'Take a 20 minute walk', category: 'Exercise', description: 'Get outside and enjoy some fresh air. Walk anywhere you like.', duration: '20 min', difficulty: 'Easy', xp: 50, coins: 20, theme: 'forest' },
  { title: 'Study for 30 minutes', category: 'Study', description: 'Focus on one thing that moves your day forward.', duration: '30 min', difficulty: 'Medium', xp: 40, coins: 15, theme: 'desk' },
  { title: 'Take a picture of something interesting', category: 'Explore', description: 'Look around your surroundings and capture something you might otherwise miss.', duration: '10 min', difficulty: 'Easy', xp: 30, coins: 10, theme: 'camera' },
]

const filteredQuests = computed(() =>
  selectedFilter.value === 'All' ? quests : quests.filter((q) => q.category === selectedFilter.value),
)

function notify(text) {
  message.value = text
  snackbar.value = true
}
</script>

<style scoped>
.quest-desc { max-width: 700px; line-height: 1.6; }
</style>
