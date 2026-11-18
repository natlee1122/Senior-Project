<template>
  <div>
    <PageHeading eyebrow="YOUR COLLECTION" title="Inventory" subtitle="Everything you've earned along the way." />

    <v-row dense>
      <v-col v-for="item in items" :key="item.name" cols="12" sm="4">
        <v-card class="pa-8 text-center">
          <v-sheet color="#f5faf8" rounded="lg" height="120" class="item-icon d-flex align-center justify-center mb-4">{{ item.icon }}</v-sheet>
          <h3 class="text-h6 my-1">{{ item.name }}</h3>
          <small class="text-muted">{{ item.type }}</small>
        </v-card>
      </v-col>
    </v-row>

    <div class="d-flex justify-space-between align-end mt-10 mb-4">
      <div>
        <h2 class="text-h5 mb-1">Furniture</h2>
        <p class="text-body-2 text-muted">Pieces you own for your room.</p>
      </div>
      <v-btn variant="text" color="primary-dark" class="px-0" min-width="0" to="/world">Open World →</v-btn>
    </div>

    <v-row dense>
      <v-col v-for="row in room.inventory" :key="row.def.id" cols="12" sm="4">
        <v-card class="pa-8 text-center">
          <v-sheet color="#f5faf8" rounded="lg" height="120" class="d-flex align-center justify-center mb-4">
            <ItemPreview :type="row.def.id" :size="96" />
          </v-sheet>
          <h3 class="text-h6 my-1">{{ row.def.name }}</h3>
          <small class="text-muted">Furniture · Owned {{ row.owned }} · In room {{ row.placed }}</small>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { onMounted, reactive } from 'vue'
import api from '../api'
import PageHeading from '../components/PageHeading.vue'
import ItemPreview from '../components/world/ItemPreview.vue'
import { useRoom } from '../composables/useRoom'

const items = [
  { name: 'Fox Companion', type: 'Pet', icon: '🦊' },
  { name: 'Explorer Backpack', type: 'Item', icon: '🎒' },
  { name: 'Green Hoodie', type: 'Clothing', icon: '🧥' },
  { name: 'Adventure Camera', type: 'Item', icon: '📷' },
  { name: 'Sunny Badge', type: 'Achievement', icon: '☀️' },
  { name: 'Mountain Sticker', type: 'Decoration', icon: '🏔️' },
]

const room = reactive(useRoom())

onMounted(async () => {
  let user = null
  try {
    user = await api.users.me()
  } catch {
    // Fall back to the guest room when the API is unavailable.
  }
  await room.load(user)
})
</script>

<style scoped>
.item-icon { font-size: 68px; }
</style>
