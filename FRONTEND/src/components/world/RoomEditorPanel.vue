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

    <v-tabs v-model="tab" color="primary" grow density="comfortable">
      <v-tab value="items">My items</v-tab>
      <v-tab value="shop">Shop</v-tab>
      <v-tab value="style">Style</v-tab>
    </v-tabs>

    <v-window v-model="tab" class="mt-3">
      <!-- Owned furniture -->
      <v-window-item value="items">
        <v-list lines="two" density="comfortable" class="pa-0 bg-transparent">
          <v-list-item v-for="row in room.inventory" :key="row.def.id" :title="row.def.name" :subtitle="`Owned ${row.owned} · In room ${row.placed}`" class="px-0">
            <template #prepend><ItemPreview :type="row.def.id" :size="52" class="mr-3" /></template>
            <template #append>
              <v-btn size="small" variant="tonal" color="primary" :disabled="row.available <= 0" @click="room.place(row.def.id)">Place</v-btn>
            </template>
          </v-list-item>
        </v-list>
        <p class="text-caption text-muted mt-2">Removed pieces come back here. Buy more in the Shop.</p>
      </v-window-item>

      <!-- Shop -->
      <v-window-item value="shop">
        <v-chip-group v-model="category" mandatory selected-class="text-primary" class="mb-2">
          <v-chip v-for="name in ['All', ...CATEGORIES]" :key="name" :value="name" size="small" filter>{{ name }}</v-chip>
        </v-chip-group>
        <v-row dense>
          <v-col v-for="def in shopItems" :key="def.id" cols="6">
            <v-card variant="outlined" rounded="lg" class="pa-3 h-100 d-flex flex-column">
              <v-sheet color="#f5faf8" rounded="lg" class="d-flex align-center justify-center mb-2 py-2">
                <ItemPreview :type="def.id" :size="72" />
              </v-sheet>
              <div class="text-body-2 font-weight-bold">{{ def.name }}</div>
              <div class="text-caption text-muted mb-2">{{ room.ownedCount(def.id) ? `Owned ${room.ownedCount(def.id)}` : def.category }}</div>
              <v-btn class="mt-auto" size="small" color="primary" variant="flat" :disabled="room.coins < def.price" @click="buy(def)">● {{ def.price }}</v-btn>
            </v-card>
          </v-col>
        </v-row>
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
import ItemPreview from './ItemPreview.vue'
import SwatchRow from './SwatchRow.vue'
import { CATEGORIES, FLOORS, FURNITURE, FURNITURE_LIST, LIGHTING, ROOM_THEMES, WALLS } from './furnitureCatalog'

const props = defineProps({
  // The object returned by useRoom(), wrapped in reactive()
  room: { type: Object, required: true },
})
const tab = defineModel('tab', { type: String, default: 'items' })

const category = ref('All')
const confirmReset = ref(false)
const snackbar = ref(false)
const message = ref('')
const lastBoughtId = ref(null)

const isAvatar = computed(() => props.room.selectedKey === 'avatar')
const selectedName = computed(() => (isAvatar.value ? 'You' : props.room.selectedDef?.name ?? ''))
const colorOptions = computed(() => (props.room.selectedDef?.colors ?? []).map((color) => ({ value: color, label: color, color })))
const wallOptions = WALLS.map((wall) => ({ value: wall.id, label: wall.label, color: wall.color }))
const floorOptions = FLOORS.map((floor) => ({ value: floor.id, label: floor.label, color: floor.color }))
const shopItems = computed(() => FURNITURE_LIST.filter((def) => category.value === 'All' || def.category === category.value))

function buy(def) {
  const result = props.room.buy(def.id)
  lastBoughtId.value = result.ok ? def.id : null
  message.value = result.ok ? `Bought ${def.name}.` : 'Not enough coins yet. Complete more quests!'
  snackbar.value = true
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
