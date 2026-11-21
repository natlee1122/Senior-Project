<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <div class="text-subtitle-1 font-weight-bold">Room editor</div>
      <div class="d-flex align-center ga-2">
        <v-chip size="small" variant="text" :prepend-icon="room.saveStatus === 'saving' ? 'mdi-sync' : 'mdi-check'">
          {{ room.saveStatus === 'saving' ? 'Saving…' : 'Saved' }}
        </v-chip>
        <v-chip color="gold" size="small" class="font-weight-bold">● {{ room.coins }}</v-chip>
      </div>
    </div>

    <!-- Selection tools -->
    <v-card variant="tonal" rounded="lg" class="pa-3 mb-4">
      <template v-if="room.selectedKey">
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="font-weight-bold">{{ selectedName }}</span>
          <span class="text-caption text-muted">Drag in the room, or use the arrow keys</span>
        </div>
        <template v-if="!isAvatar">
          <div class="d-flex flex-wrap ga-2 mb-3">
            <v-btn size="small" variant="outlined" prepend-icon="mdi-flip-horizontal" @click="room.flipSelected()">Flip</v-btn>
            <v-btn size="small" variant="outlined" icon="mdi-rotate-left" :disabled="!room.selectedDef?.rotatable" aria-label="Rotate left" @click="room.rotateSelected(-1)" />
            <v-btn size="small" variant="outlined" icon="mdi-rotate-right" :disabled="!room.selectedDef?.rotatable" aria-label="Rotate right" @click="room.rotateSelected(1)" />
            <v-btn size="small" variant="outlined" color="error" prepend-icon="mdi-delete-outline" @click="room.removeSelected()">Remove</v-btn>
          </div>
          <SwatchRow :options="colorOptions" :model-value="room.selectedItem?.color" label="Item colour" @update:model-value="room.recolorSelected" />
        </template>
      </template>
      <div v-else class="text-body-2">Select something in the room to move or recolour it, or place a piece from My items.</div>
    </v-card>

    <GameTabs v-model="tab" :tabs="TABS" fill />

    <v-window v-model="tab" class="mt-3">
      <!-- Owned furniture: tap to place -->
      <v-window-item value="items">
        <CategoryBar v-model="category" :categories="categories" label="Furniture category" />
        <div v-if="myItems.length" class="cell-grid">
          <ItemCell
            v-for="row in myItems"
            :key="row.def.id"
            :name="row.def.name"
            :tier="row.def.price"
            :locked="row.available <= 0"
            :caption="`Owned ${row.owned} · In room ${row.placed}`"
            @click="room.place(row.def.id)"
          >
            <ItemPreview :type="row.def.id" :size="76" />
          </ItemCell>
        </div>
        <p v-else class="text-body-2 text-medium-emphasis py-4 text-center">Nothing here yet. Visit the Shop tab.</p>
        <p class="text-caption text-muted mt-2">Tap a piece to place it. Removed pieces come back here.</p>
      </v-window-item>

      <!-- Shop -->
      <v-window-item value="shop">
        <CategoryBar v-model="category" :categories="categories" label="Furniture category" />
        <div class="cell-grid">
          <ItemCell
            v-for="def in shopItems"
            :key="def.id"
            :name="def.name"
            :tier="def.price"
            :price="def.price"
            @click="confirming = def"
          >
            <ItemPreview :type="def.id" :size="76" />
          </ItemCell>
        </div>
        <v-btn block variant="text" size="small" class="mt-2" to="/inventory?section=furniture">Open the full shop →</v-btn>
      </v-window-item>

      <!-- Customisation -->
      <v-window-item value="style">
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
      </v-window-item>
    </v-window>

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
        <p class="text-body-2 text-muted mb-5">Furniture goes back to the starter layout. Everything you bought stays in My items.</p>
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
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import CategoryBar from '../game/CategoryBar.vue'
import GameTabs from '../game/GameTabs.vue'
import ItemCell from '../game/ItemCell.vue'
import { SECTIONS } from '../shop/shopCatalog'
import ItemPreview from './ItemPreview.vue'
import SwatchRow from './SwatchRow.vue'
import { FLOORS, FURNITURE_LIST, LIGHTING, ROOM_THEMES, WALLS } from './furnitureCatalog'

const props = defineProps({
  // The object returned by useRoom(), wrapped in reactive()
  room: { type: Object, required: true },
})
const tab = defineModel('tab', { type: String, default: 'items' })

const TABS = [
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

const isAvatar = computed(() => props.room.selectedKey === 'avatar')
const selectedName = computed(() => (isAvatar.value ? 'You' : props.room.selectedDef?.name ?? ''))
const colorOptions = computed(() => (props.room.selectedDef?.colors ?? []).map((color) => ({ value: color, label: color, color })))
const wallOptions = WALLS.map((wall) => ({ value: wall.id, label: wall.label, color: wall.color }))
const floorOptions = FLOORS.map((floor) => ({ value: floor.id, label: floor.label, color: floor.color }))

const categories = SECTIONS.find((section) => section.id === 'furniture').categories
const shopItems = computed(() => FURNITURE_LIST.filter((def) => !category.value || def.category === category.value))
const myItems = computed(() => props.room.inventory.filter((row) => !category.value || row.def.category === category.value))

function buy(def) {
  const result = props.room.buy(def.id)
  lastBoughtId.value = result.ok ? def.id : null
  message.value = result.ok ? `Bought ${def.name}.` : 'Not enough coins yet. Complete more quests!'
  snackbar.value = true
  confirming.value = null
}

function placeBought() {
  if (lastBoughtId.value) props.room.place(lastBoughtId.value)
  snackbar.value = false
}

function reset() {
  props.room.resetLayout()
  confirmReset.value = false
}
</script>

<style scoped>
.cell-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); gap: 10px; max-height: 430px; overflow-y: auto; padding: 4px 4px 10px; }
</style>
