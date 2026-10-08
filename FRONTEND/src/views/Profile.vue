<template>
  <div>
    <v-card>
      <div class="cover" />
      <div class="d-flex align-end ga-5 px-8 pb-5 profile-main">
        <v-avatar color="sand" size="100" class="profile-avatar text-h4">{{ initial }}</v-avatar>
        <div>
          <h1 class="text-h4">{{ user?.name || 'Adventurer' }}</h1>
          <p class="text-muted mt-1 mb-3">Level {{ stats.level }} · {{ stats.xpIntoLevel }} / 500 XP</p>
          <v-btn size="large" color="secondary" @click="notify('Profile editing is coming soon.')">Edit Profile</v-btn>
        </div>
      </div>

      <v-tabs v-model="activeTab" color="primary-dark" slider-color="primary" class="px-8 border-b">
        <v-tab v-for="tab in tabs" :key="tab" :value="tab" min-width="0" class="px-1 mr-7 text-body-2">{{ tab }}</v-tab>
      </v-tabs>

      <v-row class="pa-8 pa-md-11 ga-0" align="center">
        <v-col cols="12" md="6" class="text-center character">{{ selectedChoice }}</v-col>
        <v-col cols="12" md="6" class="d-flex justify-center">
          <div class="choices d-flex flex-wrap ga-4">
            <v-btn
              v-for="choice in choices"
              :key="choice"
              width="80"
              height="80"
              min-width="0"
              color="#fafcfa"
              border
              class="text-h4"
              @click="choose(choice)"
            >{{ choice }}</v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-snackbar v-model="snackbar" :timeout="1600">{{ message }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '../api'
import { getInitial } from '../utils/user'

const user = ref(null)
const stats = ref({ level: 1, xpIntoLevel: 0 })
const initial = computed(() => getInitial(user.value))

onMounted(async () => {
  try {
    const [me, statData] = await Promise.all([api.users.me(), api.users.stats()])
    user.value = me
    stats.value = statData
  } catch (err) {
    notify(err.message)
  }
})

const snackbar = ref(false)
const message = ref('')
const selectedChoice = ref('🧍🏻‍♀️')
const activeTab = ref('Avatar')
const tabs = ['Avatar', 'Home', 'Pets', 'Stats']
const choices = ['🧢', '🧥', '🎧', '🦊', '👟', '🎒']

function notify(text) {
  message.value = text
  snackbar.value = true
}
function choose(choice) {
  selectedChoice.value = choice
  notify(`Selected ${choice}`)
}
</script>

<style scoped>
.cover { height: 210px; background: linear-gradient(135deg, #9bd3df, #b9d8ad 50%, #e8d8b9); }
.profile-main { margin-top: -50px; }
.profile-avatar { border: 6px solid #fff; }
.character { font-size: 150px; line-height: 1.2; }
.choices { width: 272px; }
</style>