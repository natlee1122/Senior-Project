<template>
  <div class="profile-page">
    <v-card class="profile-card" rounded="xl" border elevation="0">
      <div class="cover" />
      <div class="d-flex align-end ga-5 px-5 px-sm-8 pb-5 profile-main">
        <v-avatar color="sand" size="100" class="profile-avatar text-h4">{{ initial }}</v-avatar>
        <div class="profile-heading">
          <h1 class="text-h4">{{ user?.name || 'Adventurer' }}</h1>
          <p class="text-muted mt-1 mb-3">Level {{ stats.level }} · {{ stats.xpIntoLevel }} / 500 XP</p>
          <v-btn size="large" color="secondary" @click="notify('Profile editing is coming soon.')">Edit Profile</v-btn>
        </div>
      </div>

      <v-tabs v-model="activeTab" color="primary-dark" slider-color="primary" class="px-4 px-sm-8 border-b profile-tabs" show-arrows>
        <v-tab v-for="tab in tabs" :key="tab" :value="tab" min-width="0" class="px-2 mr-3 text-body-2">{{ tab }}</v-tab>
      </v-tabs>

      <v-window v-model="activeTab" :touch="false">
        <v-window-item value="Avatar">
          <v-row class="pa-5 pa-md-10 ga-0" align="center">
            <v-col cols="12" md="6" class="d-flex justify-center">
              <div class="avatar-preview-wrap">
                <div class="avatar-stage" aria-label="Avatar preview">
                  <div class="avatar-scene">
                    <AvatarFigure :body-type="characterStyle" :equipped="equipped" />
                  </div>
                </div>
                <div class="text-center mt-3">
                  <div class="text-subtitle-1 font-weight-bold">Your avatar</div>
                  <div class="text-body-2 text-medium-emphasis">Choose a style and equip items below.</div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6" class="pt-6 pt-md-0">
              <div class="text-subtitle-1 font-weight-bold mb-2">Character style</div>
              <v-btn-toggle v-model="characterStyle" class="mb-6" color="primary" variant="outlined" divided mandatory aria-label="Choose character style">
                <v-btn v-for="option in characterOptions" :key="option.value" :value="option.value">{{ option.label }}</v-btn>
              </v-btn-toggle>

              <div class="d-flex align-center justify-space-between mb-3">
                <div>
                  <div class="text-subtitle-1 font-weight-bold">Accessories</div>
                  <div class="text-body-2 text-medium-emphasis">Select an item to wear it. Select it again to remove it.</div>
                </div>
                <v-btn variant="text" size="small" @click="clearEquipment">Clear all</v-btn>
              </div>
              <div class="accessory-grid">
                <v-btn
                  v-for="item in accessories"
                  :key="item.id"
                  class="accessory-option"
                  :class="{ 'accessory-option--selected': equipped[item.slot]?.id === item.id }"
                  :variant="equipped[item.slot]?.id === item.id ? 'tonal' : 'outlined'"
                  :color="equipped[item.slot]?.id === item.id ? 'primary' : 'default'"
                  @click="toggleAccessory(item)"
                >
                  <span class="accessory-icon">{{ item.icon }}</span>
                  <span class="accessory-label">{{ item.label }}</span>
                  <v-icon v-if="equipped[item.slot]?.id === item.id" icon="mdi-check-circle" size="small" class="ml-auto" />
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item value="Home">
          <div class="tab-content">
            <div class="text-h6 mb-1">Your journey</div>
            <p class="text-body-2 text-medium-emphasis mb-5">A quick look at what you are working toward.</p>
            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="tonal" color="secondary" rounded="lg" class="pa-4 h-100">
                  <div class="text-overline">CURRENT GOAL</div>
                  <div class="text-h6 mt-1">{{ user?.goal || 'Choose a goal to get started' }}</div>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="tonal" color="primary" rounded="lg" class="pa-4 h-100">
                  <div class="text-overline">INTERESTS</div>
                  <div v-if="user?.interests?.length" class="d-flex flex-wrap ga-2 mt-2">
                    <v-chip v-for="interest in user.interests" :key="interest" size="small">{{ interest }}</v-chip>
                  </div>
                  <div v-else class="text-body-1 mt-1">No interests added yet.</div>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </v-window-item>

        <v-window-item value="Pets">
          <div class="tab-content">
            <div class="text-h6 mb-1">Your companions</div>
            <p class="text-body-2 text-medium-emphasis mb-5">Companions you choose here can also appear beside your avatar.</p>
            <v-card v-if="equipped.pet" rounded="lg" border elevation="0" class="pa-4 d-flex align-center ga-4">
              <v-avatar color="surface-variant" size="68" class="text-h4">{{ equipped.pet.icon }}</v-avatar>
              <div class="flex-grow-1">
                <div class="text-subtitle-1 font-weight-bold">{{ equipped.pet.label }}</div>
                <div class="text-body-2 text-medium-emphasis">Equipped companion</div>
              </div>
              <v-btn variant="text" @click="toggleAccessory(equipped.pet)">Unequip</v-btn>
            </v-card>
            <v-card v-else rounded="lg" border elevation="0" class="pa-8 text-center">
              <div class="text-h2 mb-3">🐾</div>
              <div class="text-subtitle-1 font-weight-bold">No companion equipped</div>
              <p class="text-body-2 text-medium-emphasis mt-1 mb-4">Choose the fox companion in Avatar accessories to see it here.</p>
              <v-btn color="primary" @click="activeTab = 'Avatar'">Browse accessories</v-btn>
            </v-card>
          </div>
        </v-window-item>

        <v-window-item value="Stats">
          <div class="tab-content">
            <div class="text-h6 mb-1">Your stats</div>
            <p class="text-body-2 text-medium-emphasis mb-5">Progress earned on your Lifescape journey.</p>
            <v-row>
              <v-col cols="12" sm="6" md="3">
                <v-card rounded="lg" border elevation="0" class="pa-4 h-100">
                  <div class="text-body-2 text-medium-emphasis">Level</div>
                  <div class="text-h4 font-weight-bold mt-2">{{ stats.level }}</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card rounded="lg" border elevation="0" class="pa-4 h-100">
                  <div class="text-body-2 text-medium-emphasis">Total XP</div>
                  <div class="text-h4 font-weight-bold mt-2">{{ stats.xp ?? 0 }}</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card rounded="lg" border elevation="0" class="pa-4 h-100">
                  <div class="text-body-2 text-medium-emphasis">Coins</div>
                  <div class="text-h4 font-weight-bold mt-2">{{ stats.coins ?? 0 }}</div>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" md="3">
                <v-card rounded="lg" border elevation="0" class="pa-4 h-100">
                  <div class="text-body-2 text-medium-emphasis">Completed this week</div>
                  <div class="text-h4 font-weight-bold mt-2">{{ stats.completedThisWeek ?? 0 }}</div>
                </v-card>
              </v-col>
            </v-row>
            <div class="mt-6 mb-2 d-flex justify-space-between text-body-2">
              <span>Progress to Level {{ stats.level + 1 }}</span>
              <span>{{ stats.xpIntoLevel }} / 500 XP</span>
            </div>
            <v-progress-linear :model-value="stats.levelProgress ?? (stats.xpIntoLevel / 500) * 100" color="primary" height="10" rounded />
          </div>
        </v-window-item>
      </v-window>
    </v-card>

    <v-snackbar v-model="snackbar" :timeout="1800">{{ message }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import api from '../api'
import { getInitial } from '../utils/user'
import AvatarFigure from '../components/avatar/AvatarFigure.vue'
import { DEFAULT_BODY_TYPE, readAppearance, writeAppearance } from '../components/avatar/avatarStorage'

const user = ref(null)
const stats = ref({ level: 1, xp: 0, coins: 0, xpIntoLevel: 0, levelProgress: 0, completedThisWeek: 0 })
const initial = computed(() => getInitial(user.value))
const snackbar = ref(false)
const message = ref('')
const activeTab = ref('Avatar')
const tabs = ['Avatar', 'Home', 'Pets', 'Stats']
const characterStyle = ref(DEFAULT_BODY_TYPE)
const characterOptions = [
  { label: 'Feminine', value: 'feminine' },
  { label: 'Masculine', value: 'masculine' },
  { label: 'Neutral', value: 'neutral' },
]
const accessories = [
  { id: 'cap', label: 'Cap', icon: '🧢', slot: 'hat' },
  { id: 'hoodie', label: 'Hoodie', icon: '🧥', slot: 'clothing' },
  { id: 'headphones', label: 'Headphones', icon: '🎧', slot: 'headphones' },
  { id: 'fox', label: 'Fox companion', icon: '🦊', slot: 'pet' },
  { id: 'sneakers', label: 'Sneakers', icon: '👟', slot: 'shoes' },
  { id: 'backpack', label: 'Backpack', icon: '🎒', slot: 'backpack' },
]
const equipped = ref({ hat: null, clothing: null, headphones: null, pet: null, shoes: null, backpack: null })

onMounted(async () => {
  try {
    const [me, statData] = await Promise.all([api.users.me(), api.users.stats()])
    user.value = me
    stats.value = { ...stats.value, ...statData }
    restoreAppearance()
  } catch (err) {
    notify(err?.message || 'Unable to load profile data.')
  }
})

watch([characterStyle, equipped], () => {
  if (!user.value) return
  writeAppearance(user.value, { characterStyle: characterStyle.value, equipped: equipped.value })
}, { deep: true })

function restoreAppearance() {
  const saved = readAppearance(user.value)
  if (!saved) return
  if (characterOptions.some((option) => option.value === saved.characterStyle)) characterStyle.value = saved.characterStyle
  for (const slot of Object.keys(equipped.value)) {
    const savedItem = saved.equipped?.[slot]
    equipped.value[slot] = accessories.find((item) => item.id === savedItem?.id) || null
  }
}

function notify(text) {
  message.value = text
  snackbar.value = true
}

function toggleAccessory(item) {
  const slot = item.slot
  equipped.value[slot] = equipped.value[slot]?.id === item.id ? null : item
  notify(equipped.value[slot] ? `${item.label} equipped` : `${item.label} removed`)
}

function clearEquipment() {
  for (const slot of Object.keys(equipped.value)) equipped.value[slot] = null
  notify('All accessories removed')
}
</script>

<style scoped>
.cover { height: 210px; background: linear-gradient(135deg, #9bd3df, #b9d8ad 50%, #e8d8b9); }
.profile-main { margin-top: -50px; }
.profile-avatar { border: 6px solid #fff; flex-shrink: 0; }
.profile-heading { min-width: 0; padding-bottom: 2px; }
.profile-tabs { overflow: hidden; }
.tab-content { padding: 32px clamp(20px, 5vw, 44px) 40px; }
.avatar-preview-wrap { width: 100%; display: flex; flex-direction: column; align-items: center; }
.avatar-stage { width: min(100%, 390px); height: 430px; position: relative; display: flex; align-items: center; justify-content: center; border-radius: 24px; background: radial-gradient(ellipse at 50% 75%, #e7f0e9 0%, #f7faf7 58%, #fbfcfb 100%); overflow: hidden; }
.avatar-scene { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.avatar-preview-wrap { max-width: 100%; }

.accessory-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.accessory-option { min-height: 78px; height: auto; padding: 10px 12px; justify-content: flex-start; text-transform: none; letter-spacing: normal; }
.accessory-icon { font-size: 27px; margin-right: 10px; }
.accessory-label { white-space: normal; text-align: left; font-size: 13px; }
@media (max-width: 600px) {
  .cover { height: 150px; }
  .profile-main { align-items: flex-end; gap: 14px !important; }
  .profile-avatar { width: 76px !important; height: 76px !important; }
  .profile-heading h1 { font-size: 1.35rem !important; line-height: 1.3; }
  .profile-heading p { font-size: 0.8rem; }
  .avatar-stage { height: 390px; }
  .accessory-grid { grid-template-columns: 1fr; }
}
</style>
