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
  </div>
</template>

<script setup>
import PageHeading from '../components/PageHeading.vue'

const items = [
  { name: 'Fox Companion', type: 'Pet', icon: '🦊' },
  { name: 'Explorer Backpack', type: 'Item', icon: '🎒' },
  { name: 'Green Hoodie', type: 'Clothing', icon: '🧥' },
  { name: 'Adventure Camera', type: 'Item', icon: '📷' },
  { name: 'Sunny Badge', type: 'Achievement', icon: '☀️' },
  { name: 'Mountain Sticker', type: 'Decoration', icon: '🏔️' },
]
</script>

<style scoped>
.item-icon { font-size: 68px; }
</style>
