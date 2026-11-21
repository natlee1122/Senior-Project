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
                    <AvatarFigure :body-type="wardrobe.characterStyle" :equipped="wardrobe.equipped" />
                  </div>
                </div>
                <div class="text-center mt-3">
                  <div class="text-subtitle-1 font-weight-bold">Your avatar</div>
                  <div class="text-body-2 text-medium-emphasis">Pick a body, then dress it from the wardrobe.</div>
                </div>
              </div>
            </v-col>

            <v-col cols="12" md="6" class="pt-6 pt-md-0">
              <div class="d-flex align-center justify-space-between mb-2">
                <div class="text-subtitle-1 font-weight-bold">Character style</div>
                <v-btn variant="text" size="small" @click="wardrobe.resetOutfit()">Reset outfit</v-btn>
              </div>
              <v-btn-toggle :model-value="wardrobe.characterStyle" class="mb-6" color="primary" variant="outlined" divided mandatory aria-label="Choose character style" @update:model-value="wardrobe.setBody">
                <v-btn v-for="option in characterOptions" :key="option.value" :value="option.value">{{ option.label }}</v-btn>
              </v-btn-toggle>
              <WardrobePanel :wardrobe="wardrobe" :slots="avatarSlots" outfits />
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
          <v-row class="pa-5 pa-md-10 ga-0" align="center">
            <v-col cols="12" md="5" class="d-flex justify-center">
              <div class="avatar-preview-wrap">
                <div class="avatar-stage pet-stage" aria-label="Companion preview">
                  <PetFigure v-if="wardrobe.equipped.pet" class="pet-preview" :equipped="petEquipped" />
                  <div v-else class="text-center px-6">
                    <div class="text-h2 mb-2">🐾</div>
                    <div class="text-subtitle-1 font-weight-bold">No companion yet</div>
                    <p class="text-body-2 text-medium-emphasis mt-1">Pick one from the list. It will also appear beside your avatar.</p>
                  </div>
                </div>
                <div v-if="wardrobe.equipped.pet" class="text-center mt-3">
                  <div class="text-subtitle-1 font-weight-bold">{{ wardrobe.wornEntry('pet')?.item.name }}</div>
                  <div class="text-body-2 text-medium-emphasis">Your companion</div>
                </div>
              </div>
            </v-col>
            <v-col cols="12" md="7" class="pt-6 pt-md-0">
              <WardrobePanel :wardrobe="wardrobe" :slots="petSlots" />
            </v-col>
          </v-row>
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
import { computed, onMounted, reactive, ref } from 'vue'
import api from '../api'
import { getInitial } from '../utils/user'
import AvatarFigure from '../components/avatar/AvatarFigure.vue'
import PetFigure from '../components/avatar/PetFigure.vue'
import WardrobePanel from '../components/avatar/WardrobePanel.vue'
import { SLOT_ORDER, SLOTS } from '../components/avatar/wardrobeCatalog'
import { useWardrobe } from '../composables/useWardrobe'

const user = ref(null)
const stats = ref({ level: 1, xp: 0, coins: 0, xpIntoLevel: 0, levelProgress: 0, completedThisWeek: 0 })
const initial = computed(() => getInitial(user.value))
const snackbar = ref(false)
const message = ref('')
const activeTab = ref('Avatar')
const tabs = ['Avatar', 'Home', 'Pets', 'Stats']
const characterOptions = [
  { label: 'Feminine', value: 'feminine' },
  { label: 'Masculine', value: 'masculine' },
  { label: 'Neutral', value: 'neutral' },
]

// Wardrobe state (owned items, what is worn, coins) and its auto-save live in the composable.
const wardrobe = reactive(useWardrobe())
const avatarSlots = SLOT_ORDER.filter((slot) => !SLOTS[slot].pet)
const petSlots = SLOT_ORDER.filter((slot) => SLOTS[slot].pet)
const petEquipped = computed(() => ({ pet: wardrobe.equipped.pet, petHat: wardrobe.equipped.petHat, petNeck: wardrobe.equipped.petNeck }))

onMounted(async () => {
  let me = null
  try {
    const [profile, statData] = await Promise.all([api.users.me(), api.users.stats()])
    me = profile
    user.value = profile
    stats.value = { ...stats.value, ...statData }
  } catch (err) {
    notify(err?.message || 'Unable to load profile data.')
  }
  // The wardrobe still loads when the API is down, using the guest slot.
  await wardrobe.load(me, stats.value.coins ?? 0)
})

function notify(text) {
  message.value = text
  snackbar.value = true
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

.pet-stage { height: 380px; }
.pet-preview { width: 70%; height: 70%; }
@media (max-width: 600px) {
  .cover { height: 150px; }
  .profile-main { align-items: flex-end; gap: 14px !important; }
  .profile-avatar { width: 76px !important; height: 76px !important; }
  .profile-heading h1 { font-size: 1.35rem !important; line-height: 1.3; }
  .profile-heading p { font-size: 0.8rem; }
  .avatar-stage { height: 390px; }
}
</style>
