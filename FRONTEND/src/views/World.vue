<template>
  <div>
    <PageHeading eyebrow="PHASE II" title="World" subtitle="Build your own little place and visit friends." />

    <v-card rounded="xxl" class="overflow-hidden">
      <v-row no-gutters>
        <v-col cols="12" md="8">
          <RoomScene :theme="theme">
            <button type="button" class="actor-hit" :aria-label="`Say hello to ${displayName}`" @click="greet">
              <AvatarFigure :body-type="bodyType" :equipped="equipped" />
              <v-tooltip
                :model-value="bubbleOpen"
                activator="parent"
                location="top"
                :open-on-hover="false"
                :open-on-click="false"
                :open-on-focus="false"
              >{{ greeting }}</v-tooltip>
            </button>
          </RoomScene>
        </v-col>

        <v-col cols="12" md="4" class="pa-6 pa-md-10 d-flex flex-column justify-center">
          <div><v-chip size="x-small" class="font-weight-bold">MY HOME</v-chip></div>
          <h2 class="text-h5 my-3">{{ displayName }}'s little place</h2>
          <p class="text-body-2 text-muted world-text mb-6">A quiet place to come back to. Tap your character to say hi.</p>

          <div class="text-subtitle-2 font-weight-bold mb-2">Time of day</div>
          <v-btn-toggle v-model="theme" class="mb-6" color="primary" variant="outlined" density="comfortable" divided mandatory aria-label="Choose time of day">
            <v-btn v-for="option in themeOptions" :key="option.value" :value="option.value">{{ option.label }}</v-btn>
          </v-btn-toggle>

          <v-list density="compact" class="pa-0 mb-6 bg-transparent">
            <v-list-item v-for="row in details" :key="row.label" :title="row.label" :subtitle="row.value" class="px-0">
              <template #prepend><span class="detail-icon">{{ row.icon }}</span></template>
            </v-list-item>
          </v-list>

          <div class="d-flex flex-wrap ga-3">
            <v-btn size="large" color="primary" to="/profile">Change outfit</v-btn>
            <v-btn size="large" variant="outlined" color="primary-dark" @click="notify('Furniture editing is coming soon.')">Edit furniture</v-btn>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-snackbar v-model="snackbar" :timeout="2200">{{ message }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import api from '../api'
import PageHeading from '../components/PageHeading.vue'
import AvatarFigure from '../components/avatar/AvatarFigure.vue'
import RoomScene from '../components/world/RoomScene.vue'
import { BODY_PRESETS } from '../components/avatar/avatarBodies'
import { DEFAULT_BODY_TYPE, readAppearance } from '../components/avatar/avatarStorage'

const THEME_KEY = 'lifescape-world-theme'
const themeOptions = [
  { label: 'Day', value: 'day' },
  { label: 'Sunset', value: 'sunset' },
  { label: 'Night', value: 'night' },
]

const user = ref(null)
const stats = ref({ level: 1, coins: 0 })
const bodyType = ref(DEFAULT_BODY_TYPE)
const equipped = ref({})
const theme = ref('day')

const snackbar = ref(false)
const message = ref('')
const bubbleOpen = ref(false)
const greetingIndex = ref(0)
let bubbleTimer

const firstName = computed(() => user.value?.name?.trim().split(/\s+/)[0] || '')
const displayName = computed(() => firstName.value || 'Adventurer')
const outfitCount = computed(() => Object.values(equipped.value).filter(Boolean).length)

const details = computed(() => [
  { icon: '★', label: 'Level', value: stats.value.level },
  { icon: '●', label: 'Coins', value: stats.value.coins ?? 0 },
  { icon: '🧥', label: 'Outfit', value: outfitCount.value ? `${outfitCount.value} item${outfitCount.value > 1 ? 's' : ''} equipped` : 'Nothing equipped' },
  { icon: '🦊', label: 'Companion', value: equipped.value.pet?.label || 'None yet' },
])

const greetings = computed(() => [
  'Ready for today’s quest?',
  'This room is so cozy.',
  equipped.value.pet ? 'The fox says hi!' : 'I wonder who I should meet next.',
  'Let’s go outside soon.',
])
const greeting = computed(() => greetings.value[greetingIndex.value % greetings.value.length])

onMounted(async () => {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY)
    if (themeOptions.some((option) => option.value === savedTheme)) theme.value = savedTheme
  } catch {
    // Fall back to the default time of day.
  }

  // Show the character right away, then refresh once the user is known.
  applyAppearance()
  try {
    const [me, statData] = await Promise.all([api.users.me(), api.users.stats()])
    user.value = me
    stats.value = { ...stats.value, ...statData }
    applyAppearance()
  } catch (err) {
    notify(err?.message || 'Unable to load your world.')
  }
})

onBeforeUnmount(() => clearTimeout(bubbleTimer))

watch(theme, (value) => {
  try {
    localStorage.setItem(THEME_KEY, value)
  } catch {
    // The choice still applies for this visit.
  }
})

function applyAppearance() {
  const saved = readAppearance(user.value)
  bodyType.value = Object.hasOwn(BODY_PRESETS, saved?.characterStyle) ? saved.characterStyle : DEFAULT_BODY_TYPE
  equipped.value = saved?.equipped ?? {}
}

function greet() {
  clearTimeout(bubbleTimer)
  greetingIndex.value += 1
  bubbleOpen.value = true
  bubbleTimer = setTimeout(() => { bubbleOpen.value = false }, 2800)
}

function notify(text) {
  message.value = text
  snackbar.value = true
}
</script>

<style scoped>
.actor-hit { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: none; cursor: pointer; }
.actor-hit:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 4px; border-radius: 16px; }
.world-text { line-height: 1.7; }
.detail-icon { display: inline-block; width: 28px; text-align: center; font-size: 17px; }
</style>
