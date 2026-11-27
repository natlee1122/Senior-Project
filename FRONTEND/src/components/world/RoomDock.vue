<template>
  <aside class="dock" aria-label="Room tools">
    <!-- Icon rail along the left edge of the room -->
    <nav class="dock-rail">
      <button
        v-for="section in SECTIONS"
        :key="section.value"
        type="button"
        class="dock-btn"
        :class="{ 'dock-btn--active': open && tab === section.value }"
        :aria-expanded="open && tab === section.value"
        @click="toggle(section.value)"
      >
        <span class="dock-icon">{{ section.icon }}</span>
        <span class="dock-label">{{ section.label }}</span>
      </button>
      <!-- Leaving edit mode is one tap away, right where you are working -->
      <button v-if="editing" type="button" class="dock-btn dock-btn--done" @click="emit('done')">
        <span class="dock-icon">✓</span>
        <span class="dock-label">Done</span>
      </button>
    </nav>

    <!-- The panel slides out to the right of the rail, over the room -->
    <v-expand-x-transition>
      <section v-show="open" class="dock-panel" :aria-label="current.label">
        <header class="dock-header">
          <span class="font-weight-bold">{{ current.icon }} {{ current.label }}</span>
          <v-btn icon="mdi-close" size="small" variant="text" aria-label="Close panel" @click="open = false" />
        </header>

        <div class="dock-body">
          <!-- Owned furniture: tap to place -->
          <template v-if="tab === 'items'">
            <CategoryBar v-model="category" :categories="categories" label="Furniture category" />
            <div v-if="myItems.length" class="cell-grid">
              <ItemCell
                v-for="row in myItems"
                :key="row.def.id"
                :name="row.def.name"
                :tier="row.def.price"
                :dim="row.available <= 0"
                :caption="row.available <= 0 ? 'All placed' : `${row.available} to place`"
                @click="place(row.def.id)"
              >
                <ItemPreview :type="row.def.id" :size="60" />
              </ItemCell>
            </div>
            <p v-else class="text-body-2 text-medium-emphasis py-4 text-center">Nothing here yet. Visit the Shop.</p>
            <p class="text-caption text-medium-emphasis mt-2">Tap a piece to place it. Removed pieces come back here.</p>
          </template>

          <!-- Shop -->
          <template v-else-if="tab === 'shop'">
            <CategoryBar v-model="category" :categories="categories" label="Furniture category" />
            <div class="cell-grid">
              <ItemCell v-for="def in shopItems" :key="def.id" :name="def.name" :tier="def.price" :price="def.price" @click="confirming = def">
                <ItemPreview :type="def.id" :size="60" />
              </ItemCell>
            </div>
            <v-btn block variant="text" size="small" class="mt-2" to="/inventory?section=furniture">Open the full shop →</v-btn>
          </template>

          <!-- Customisation -->
          <template v-else>
            <div class="text-subtitle-2 font-weight-bold mb-2">Room theme</div>
            <div class="d-flex flex-wrap ga-2 mb-5">
              <v-btn v-for="theme in ROOM_THEMES" :key="theme.id" size="small" variant="tonal" color="primary" @click="room.applyTheme(theme.id)">{{ theme.label }}</v-btn>
            </div>
            <div class="text-subtitle-2 font-weight-bold mb-2">Walls</div>
            <SwatchRow class="mb-5" :options="wallOptions" :model-value="room.state.wall" label="Wall colour" @update:model-value="room.setWall" />
            <div class="text-subtitle-2 font-weight-bold mb-2">Floor</div>
            <SwatchRow class="mb-5" :options="floorOptions" :model-value="room.state.floor" label="Floor" @update:model-value="room.setFloor" />
            <div class="text-subtitle-2 font-weight-bold mb-2">Lighting</div>
            <v-btn-toggle :model-value="room.state.lighting" class="mb-5" color="primary" variant="outlined" density="comfortable" divided mandatory @update:model-value="room.setLighting">
              <v-btn v-for="(preset, key) in LIGHTING" :key="key" :value="key">{{ preset.label }}</v-btn>
            </v-btn-toggle>
            <div><v-btn variant="text" color="error" size="small" @click="confirmReset = true">Reset layout</v-btn></div>
          </template>
        </div>
      </section>
    </v-expand-x-transition>

    <v-dialog :model-value="Boolean(confirming)" max-width="340" @update:model-value="confirming = null">
      <v-card v-if="confirming" rounded="xl" class="pa-6 text-center">
        <div class="d-flex justify-center mb-2"><ItemPreview :type="confirming.id" :size="140" /></div>
        <h3 class="text-h6 mb-4">{{ confirming.name }}</h3>
        <v-btn block size="large" color="primary" :disabled="room.coins < confirming.price" @click="buy(confirming)">Buy for ● {{ confirming.price }}</v-btn>
        <div v-if="room.coins < confirming.price" class="text-caption text-medium-emphasis mt-2">You need {{ confirming.price - room.coins }} more coins.</div>
        <v-btn variant="text" class="mt-2" @click="confirming = null">Not now</v-btn>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmReset" max-width="380">
      <v-card rounded="xl" class="pa-6">
        <h3 class="text-h6 mb-2">Reset your room?</h3>
        <p class="text-body-2 text-medium-emphasis mb-5">Furniture goes back to the starter layout. Everything you bought stays in My items.</p>
        <div class="d-flex justify-end ga-2">
          <v-btn variant="text" @click="confirmReset = false">Cancel</v-btn>
          <v-btn color="error" variant="flat" @click="reset">Reset</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :timeout="3500">
      {{ message }}
      <template v-if="lastBoughtId" #actions>
        <v-btn color="primary-lighten-2" variant="text" @click="placeBought">Place it</v-btn>
      </template>
    </v-snackbar>
  </aside>
</template>

<script setup>
import { computed, ref } from 'vue'
import CategoryBar from '../game/CategoryBar.vue'
import ItemCell from '../game/ItemCell.vue'
import { SECTIONS as SHOP_SECTIONS } from '../shop/shopCatalog'
import ItemPreview from './ItemPreview.vue'
import SwatchRow from './SwatchRow.vue'
import { FLOORS, FURNITURE_LIST, LIGHTING, ROOM_THEMES, WALLS } from './furnitureCatalog'

const props = defineProps({
  // The object returned by useRoom(), wrapped in reactive()
  room: { type: Object, required: true },
  editing: { type: Boolean, default: false },
})
// 'start' fires when a section is opened (the page switches to edit mode); 'done' leaves edit mode
const emit = defineEmits(['start', 'done'])
const open = defineModel('open', { type: Boolean, default: true })
const tab = defineModel('tab', { type: String, default: 'items' })

const SECTIONS = [
  { value: 'items', label: 'My items', icon: '🛋️' },
  { value: 'shop', label: 'Shop', icon: '🛍️' },
  { value: 'style', label: 'Style', icon: '🎨' },
]

const category = ref(null) // selected furniture category, or null for all
const confirming = ref(null) // furniture being bought
const confirmReset = ref(false)
const snackbar = ref(false)
const message = ref('')
const lastBoughtId = ref(null)

const current = computed(() => SECTIONS.find((section) => section.value === tab.value) ?? SECTIONS[0])
const categories = SHOP_SECTIONS.find((section) => section.id === 'furniture').categories
const wallOptions = WALLS.map((wall) => ({ value: wall.id, label: wall.label, color: wall.color }))
const floorOptions = FLOORS.map((floor) => ({ value: floor.id, label: floor.label, color: floor.color }))
const shopItems = computed(() => FURNITURE_LIST.filter((def) => !category.value || def.category === category.value))
const myItems = computed(() => props.room.inventory.filter((row) => !category.value || row.def.category === category.value))

// Tapping the active icon folds the panel away; any other icon opens its section.
function toggle(value) {
  if (open.value && tab.value === value) {
    open.value = false
    return
  }
  tab.value = value
  open.value = true
  emit('start')
}

// The panel gets out of the way once a piece is placed, so you can see and move it straight away.
function place(id) {
  if (props.room.place(id)) open.value = false
}

function buy(def) {
  const result = props.room.buy(def.id)
  lastBoughtId.value = result.ok ? def.id : null
  message.value = result.ok ? `Bought ${def.name}.` : 'Not enough coins yet. Complete more quests!'
  snackbar.value = true
  confirming.value = null
}

function placeBought() {
  if (lastBoughtId.value) place(lastBoughtId.value)
  snackbar.value = false
}

function reset() {
  props.room.resetLayout()
  confirmReset.value = false
}
</script>

<style scoped>
.dock { position: absolute; top: 12px; bottom: 12px; left: 12px; z-index: 5; display: flex; gap: 8px; max-width: calc(100% - 24px); pointer-events: none; }
.dock-rail, .dock-panel { pointer-events: auto; background: rgb(var(--v-theme-surface), 0.95); box-shadow: 0 4px 16px rgb(0 0 0 / 20%); backdrop-filter: blur(6px); }

.dock-rail { align-self: flex-start; display: flex; flex-direction: column; gap: 6px; padding: 8px; border-radius: 20px; }
.dock-btn { display: flex; flex-direction: column; align-items: center; gap: 1px; width: 60px; padding: 7px 2px 5px; border: 2px solid transparent; border-radius: 14px; background: none; color: inherit; cursor: pointer; transition: background-color 120ms ease; }
.dock-btn:hover { background: rgb(var(--v-theme-primary), 0.1); }
.dock-btn:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 1px; }
.dock-btn--active { border-color: rgb(var(--v-theme-primary)); background: rgb(var(--v-theme-primary), 0.14); }
.dock-btn--done { margin-top: 4px; border-color: rgb(var(--v-theme-primary)); background: rgb(var(--v-theme-primary)); color: #fff; }
.dock-btn--done:hover { background: rgb(var(--v-theme-primary)); filter: brightness(1.08); }
.dock-icon { font-size: 24px; line-height: 1.2; }
.dock-label { font-size: 10px; font-weight: 700; line-height: 1.15; text-align: center; }

.dock-panel { display: flex; flex-direction: column; width: 300px; max-width: calc(100vw - 112px); overflow: hidden; border-radius: 20px; }
.dock-header { display: flex; align-items: center; justify-content: space-between; padding: 10px 8px 4px 16px; }
.dock-body { flex: 1; min-height: 0; padding: 4px 14px 14px; overflow-y: auto; }
.cell-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(84px, 1fr)); gap: 8px; padding: 2px 2px 8px; }
</style>
