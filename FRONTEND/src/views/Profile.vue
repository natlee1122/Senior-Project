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
                    <svg class="avatar-art" viewBox="0 0 240 330" role="img" :aria-label="`${characterOptions.find(o => o.value === characterStyle)?.label || 'Character'} avatar${equipped.hat ? ', wearing a cap' : ''}${equipped.headphones ? ' with headphones' : ''}${equipped.clothing ? ', wearing a hoodie' : ''}${equipped.shoes ? ', wearing sneakers' : ''}${equipped.backpack ? ' with a backpack' : ''}`">
                      <defs>
                        <linearGradient id="skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5c6a8"/><stop offset="1" stop-color="#d99578"/></linearGradient>
                        <linearGradient id="shirt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8c78d1"/><stop offset="1" stop-color="#6652a9"/></linearGradient>
                        <linearGradient id="cap" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7da7ff"/><stop offset="1" stop-color="#4268d9"/></linearGradient>
                        <linearGradient id="bag" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff8aab"/><stop offset="1" stop-color="#d93673"/></linearGradient>
                      </defs>
                      <!-- backpack sits behind the shoulders -->
                      <g v-if="equipped.backpack" class="wearable backpack-wearable">
                        <path d="M78 112 Q64 120 68 151 L74 186 Q78 197 91 190 L98 132 Z" fill="#bd3e79" stroke="#a72d66" stroke-width="2"/>
                        <path d="M76 137 Q82 126 91 137 L92 178 Q82 185 78 175 Z" fill="url(#bag)"/>
                        <path d="M80 143 L87 143" stroke="#ffd66f" stroke-width="3" stroke-linecap="round"/>
                      </g>
                      <!-- hair and head -->
                      <g v-if="characterStyle !== 'masculine'" fill="#49352f">
                        <path d="M86 55 Q87 29 120 29 Q153 29 154 58 L151 91 Q145 104 136 100 L104 100 Q91 98 87 86 Z"/>
                      </g>
                      <g v-else fill="#49352f"><path d="M88 58 Q89 29 120 29 Q151 29 152 57 L145 70 L95 70 Z"/></g>
                      <path d="M105 89 L105 108 Q120 120 135 108 L135 88 Z" fill="url(#skin)"/>
                      <ellipse cx="120" cy="68" rx="29" ry="34" fill="url(#skin)"/>
                      <!-- ears -->
                      <ellipse cx="91" cy="70" rx="5" ry="8" fill="#e5a58a"/><ellipse cx="149" cy="70" rx="5" ry="8" fill="#e5a58a"/>
                      <!-- fringe -->
                      <path v-if="characterStyle !== 'masculine'" d="M92 58 Q93 35 119 36 Q143 35 148 55 Q133 48 123 51 Q108 62 92 58Z" fill="#49352f"/>
                      <path v-else d="M92 53 Q98 33 121 35 Q141 34 147 51 L132 47 L119 51 L105 47 Z" fill="#49352f"/>
                      <!-- face -->
                      <ellipse cx="109" cy="69" rx="3.3" ry="4.2" fill="#382b2b"/><ellipse cx="131" cy="69" rx="3.3" ry="4.2" fill="#382b2b"/>
                      <circle cx="110" cy="68" r="1" fill="#fff"/><circle cx="132" cy="68" r="1" fill="#fff"/>
                      <path d="M114 84 Q120 88 126 84" fill="none" stroke="#a64e58" stroke-width="2.5" stroke-linecap="round"/>
                      <path d="M116 77 Q120 80 124 77" fill="none" stroke="#cf8e74" stroke-width="1.5" stroke-linecap="round"/>
                      <!-- headphones wrap around the head, behind the cap -->
                      <g v-if="equipped.headphones" class="wearable">
                        <path d="M86 70 A34 35 0 0 1 154 70" fill="none" stroke="#77788d" stroke-width="7" stroke-linecap="round"/>
                        <path d="M86 69 A34 35 0 0 1 154 69" fill="none" stroke="#d9d8e5" stroke-width="3" stroke-linecap="round"/>
                        <rect x="80" y="66" width="13" height="25" rx="5" fill="#8c8ba0"/><rect x="147" y="66" width="13" height="25" rx="5" fill="#8c8ba0"/>
                        <rect x="83" y="70" width="7" height="17" rx="3" fill="#c8c7d4"/><rect x="150" y="70" width="7" height="17" rx="3" fill="#c8c7d4"/>
                      </g>
                      <!-- arms -->
                      <path d="M91 122 Q81 126 78 143 L73 178 Q72 187 79 188 Q84 187 85 179 L91 151Z" fill="url(#skin)"/>
                      <path d="M149 122 Q159 126 162 143 L167 178 Q168 187 161 188 Q156 187 155 179 L149 151Z" fill="url(#skin)"/>
                      <!-- legs -->
                      <path d="M99 190 L119 190 L116 268 L99 268Z" fill="#77728a"/>
                      <path d="M121 190 L141 190 L143 268 L126 268Z" fill="#77728a"/>
                      <!-- default top, replaced visually by hoodie when equipped -->
                      <path v-if="!equipped.clothing" d="M99 111 Q120 120 141 111 L153 125 L146 194 L94 194 L87 125Z" fill="url(#shirt)"/>
                      <g v-else class="wearable hoodie-wearable">
                        <path d="M99 111 Q120 120 141 111 L153 125 L146 194 L94 194 L87 125Z" fill="#d8b27a" stroke="#b88c55" stroke-width="1.5"/>
                        <path d="M105 114 L120 137 L135 114 L141 120 L128 143 L128 194 L112 194 L112 143 L99 120Z" fill="#f0d3a0"/>
                        <path d="M112 143 L128 143" stroke="#b88c55" stroke-width="2"/>
                        <circle cx="124" cy="153" r="1.7" fill="#a77a49"/><circle cx="124" cy="165" r="1.7" fill="#a77a49"/><circle cx="124" cy="177" r="1.7" fill="#a77a49"/>
                      </g>
                      <!-- cap sits naturally on top of the hair -->
                      <g v-if="equipped.hat" class="wearable cap-wearable">
                        <path d="M88 54 Q87 23 119 22 Q151 22 153 54 L153 62 L88 62Z" fill="url(#cap)"/>
                        <path d="M89 53 Q113 48 136 57 Q145 61 154 63 L151 69 Q122 64 101 70 Q87 72 77 66 Q72 62 78 59Z" fill="#4964c7"/>
                        <path d="M120 25 L120 52" stroke="#a9c2ff" stroke-width="2" opacity=".8"/>
                      </g>
                      <!-- shoes are aligned to the feet -->
                      <g v-if="equipped.shoes" class="wearable shoes-wearable">
                        <path d="M96 263 L113 263 L119 278 Q124 283 115 287 L91 287 Q86 285 91 278Z" fill="#8f70d8" stroke="#6c51b5" stroke-width="1.5"/>
                        <path d="M126 263 L143 263 L149 278 Q154 283 145 287 L121 287 Q116 285 121 278Z" fill="#8f70d8" stroke="#6c51b5" stroke-width="1.5"/>
                        <path d="M91 282 L117 282 M121 282 L147 282" stroke="#f7f0ff" stroke-width="3" stroke-linecap="round"/>
                        <path d="M102 269 L110 276 M132 269 L140 276" stroke="#e6dcff" stroke-width="2" stroke-linecap="round"/>
                      </g>
                      <g v-else fill="#51446e"><path d="M99 263 L113 263 L117 276 L103 279 L93 278 Q91 273 99 263Z"/><path d="M128 263 L142 263 L149 276 L138 279 L127 278Z"/></g>
                      <!-- fox companion stands beside the avatar, not on top of the body -->
                      <g v-if="equipped.pet" class="wearable pet-wearable" transform="translate(165 221)">
                        <path d="M7 16 L3 0 L16 8 L28 0 L27 17" fill="#d97935" stroke="#a95728" stroke-width="1.5" stroke-linejoin="round"/>
                        <ellipse cx="17" cy="24" rx="17" ry="19" fill="#e9853d"/>
                        <path d="M5 25 Q17 15 29 25 L25 37 L17 42 L8 36Z" fill="#fff0d9"/>
                        <circle cx="11" cy="22" r="2" fill="#3e3029"/><circle cx="23" cy="22" r="2" fill="#3e3029"/>
                        <path d="M15 28 L19 28 L17 31Z" fill="#4b3029"/>
                        <path d="M29 34 Q42 30 37 43 Q33 48 27 42" fill="none" stroke="#d97935" stroke-width="7" stroke-linecap="round"/>
                      </g>
                    </svg>
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
              <div class="d-flex flex-wrap ga-2 mb-6" role="group" aria-label="Choose character style">
                <v-btn
                  v-for="option in characterOptions"
                  :key="option.value"
                  :variant="characterStyle === option.value ? 'flat' : 'outlined'"
                  :color="characterStyle === option.value ? 'primary' : 'default'"
                  @click="setCharacterStyle(option.value)"
                >{{ option.label }}</v-btn>
              </div>

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

const user = ref(null)
const stats = ref({ level: 1, xp: 0, coins: 0, xpIntoLevel: 0, levelProgress: 0, completedThisWeek: 0 })
const initial = computed(() => getInitial(user.value))
const snackbar = ref(false)
const message = ref('')
const activeTab = ref('Avatar')
const tabs = ['Avatar', 'Home', 'Pets', 'Stats']
const characterStyle = ref('feminine')
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
const storageKey = computed(() => `lifescape-avatar-${user.value?.email || user.value?.id || 'guest'}`)

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

watch([characterStyle, equipped, storageKey], () => {
  if (!user.value) return
  try {
    localStorage.setItem(storageKey.value, JSON.stringify({ characterStyle: characterStyle.value, equipped: equipped.value }))
  } catch {
    // Appearance still works for the current page if browser storage is unavailable.
  }
}, { deep: true })

function restoreAppearance() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey.value) || 'null')
    if (!saved) return
    if (characterOptions.some((option) => option.value === saved.characterStyle)) characterStyle.value = saved.characterStyle
    for (const slot of Object.keys(equipped.value)) {
      const savedItem = saved.equipped?.[slot]
      equipped.value[slot] = accessories.find((item) => item.id === savedItem?.id) || null
    }
  } catch {
    // Ignore invalid saved appearance and use the default avatar.
  }
}

function notify(text) {
  message.value = text
  snackbar.value = true
}

function setCharacterStyle(style) {
  characterStyle.value = style
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
.avatar-art { width: min(100%, 300px); height: 100%; overflow: visible; filter: drop-shadow(0 7px 8px rgb(34 49 42 / 9%)); }
.wearable { filter: drop-shadow(0 2px 2px rgb(34 31 48 / 16%)); }
.cap-wearable, .headphones-wearable, .hoodie-wearable, .shoes-wearable, .backpack-wearable { transition: opacity 160ms ease; }
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
  .avatar-art { width: min(100%, 280px); }
  .accessory-grid { grid-template-columns: 1fr; }
}
</style>
