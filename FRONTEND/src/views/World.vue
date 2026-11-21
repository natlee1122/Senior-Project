<template>
  <div>
    <PageHeading eyebrow="PHASE II" title="World" subtitle="Build your own little place and visit friends.">
      <v-btn v-if="!editing" color="primary" size="large" prepend-icon="mdi-pencil-outline" @click="startEditing()">Edit room</v-btn>
      <v-btn v-else color="primary" size="large" prepend-icon="mdi-check" @click="stopEditing">Done</v-btn>
    </PageHeading>

    <v-card rounded="xxl" class="overflow-hidden">
      <v-row no-gutters>
        <v-col cols="12" md="8">
          <v-skeleton-loader v-if="!room.ready" type="image" class="room-skeleton" />
          <RoomScene
            v-else
            :layout="room.state"
            :body-type="bodyType"
            :equipped="equipped"
            :editing="editing"
            :selected-key="room.selectedKey"
            :bubble="bubbleOpen ? greeting : ''"
            @select="room.select"
            @move="({ key, x, y }) => room.moveEntity(key, x, y)"
            @remove="room.removeSelected"
            @avatar-click="greet"
          />
        </v-col>

        <v-col cols="12" md="4" class="pa-6 pa-md-8">
          <RoomEditorPanel v-if="editing" v-model:tab="editorTab" :room="room" />

          <div v-else class="d-flex flex-column justify-center h-100">
            <div><v-chip size="x-small" class="font-weight-bold">MY HOME</v-chip></div>
            <h2 class="text-h5 my-3">{{ displayName }}'s little place</h2>
            <p class="text-body-2 text-muted world-text mb-6">A quiet place to come back to. Tap your character to say hi, or edit the room to make it yours.</p>

            <div class="text-subtitle-2 font-weight-bold mb-2">Time of day</div>
            <v-btn-toggle :model-value="room.state.lighting" class="mb-6" color="primary" variant="outlined" density="comfortable" divided mandatory aria-label="Choose time of day" @update:model-value="room.setLighting">
              <v-btn v-for="(preset, key) in LIGHTING" :key="key" :value="key">{{ preset.label }}</v-btn>
            </v-btn-toggle>

            <v-list density="compact" class="pa-0 mb-6 bg-transparent">
              <v-list-item v-for="row in details" :key="row.label" :title="row.label" :subtitle="row.value" class="px-0">
                <template #prepend><span class="detail-icon">{{ row.icon }}</span></template>
              </v-list-item>
            </v-list>

            <div class="d-flex flex-wrap ga-3">
              <v-btn size="large" color="primary" @click="startEditing('shop')">Furniture shop</v-btn>
              <v-btn size="large" variant="outlined" color="primary-dark" to="/profile">Change outfit</v-btn>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-snackbar v-model="snackbar" :timeout="2200">{{ message }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import api from '../api'
import PageHeading from '../components/PageHeading.vue'
import RoomEditorPanel from '../components/world/RoomEditorPanel.vue'
import RoomScene from '../components/world/RoomScene.vue'
import { BODY_PRESETS } from '../components/avatar/avatarBodies'
import { DEFAULT_BODY_TYPE, readAppearance } from '../components/avatar/avatarStorage'
import { ITEMS_BY_ID, upgradeEquipped } from '../components/avatar/wardrobeCatalog'
import { LIGHTING } from '../components/world/furnitureCatalog'
import { useRoom } from '../composables/useRoom'

const room = reactive(useRoom())

const user = ref(null)
const stats = ref({ level: 1, coins: 0 })
const bodyType = ref(DEFAULT_BODY_TYPE)
const equipped = ref({})

const editing = ref(false)
const editorTab = ref('items')

const snackbar = ref(false)
const message = ref('')
const bubbleOpen = ref(false)
const greetingIndex = ref(0)
let bubbleTimer

const displayName = computed(() => user.value?.name?.trim().split(/\s+/)[0] || 'Adventurer')
const outfitCount = computed(() => Object.keys(equipped.value).filter((slot) => !slot.startsWith('pet')).length)

const details = computed(() => [
  { icon: '★', label: 'Level', value: stats.value.level },
  { icon: '●', label: 'Coins', value: room.coins },
  { icon: '🛋️', label: 'Furniture', value: `${room.state.items.length} pieces in your room` },
  { icon: '🧥', label: 'Outfit', value: outfitCount.value ? `${outfitCount.value} item${outfitCount.value > 1 ? 's' : ''} worn` : 'Basic outfit' },
  { icon: '🦊', label: 'Companion', value: ITEMS_BY_ID[equipped.value.pet?.id]?.name || 'None yet' },
])

const greetings = computed(() => [
  'Ready for today’s quest?',
  'This room is so cozy.',
  equipped.value.pet ? 'The fox says hi!' : 'I wonder who I should meet next.',
  'Let’s go outside soon.',
])
const greeting = computed(() => greetings.value[greetingIndex.value % greetings.value.length])

onMounted(async () => {
  let me = null
  try {
    const [profile, statData] = await Promise.all([api.users.me(), api.users.stats()])
    me = profile
    stats.value = { ...stats.value, ...statData }
  } catch (err) {
    notify(err?.message || 'Unable to load your profile.')
  }
  user.value = me
  applyAppearance()
  // The room loads even when the API is down, using the guest slot.
  await room.load(me, stats.value.coins ?? 0)
})

onBeforeUnmount(() => {
  clearTimeout(bubbleTimer)
  room.flushSave()
})

function applyAppearance() {
  const saved = readAppearance(user.value)
  bodyType.value = Object.hasOwn(BODY_PRESETS, saved?.characterStyle) ? saved.characterStyle : DEFAULT_BODY_TYPE
  equipped.value = upgradeEquipped(saved?.equipped)
}

function startEditing(tab = 'items') {
  editorTab.value = tab
  bubbleOpen.value = false
  editing.value = true
}

async function stopEditing() {
  editing.value = false
  room.select(null)
  await room.flushSave()
  notify('Room saved.')
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
.room-skeleton { aspect-ratio: 16 / 9; width: 100%; }
.world-text { line-height: 1.7; }
.detail-icon { display: inline-block; width: 28px; text-align: center; font-size: 17px; }
</style>
