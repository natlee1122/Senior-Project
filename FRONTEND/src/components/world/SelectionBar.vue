<template>
  <div v-if="room.selectedKey" class="bar" :style="{ left: `calc(50% + ${(offset - HUD_WIDTH) / 2}px)`, maxWidth: `calc(100% - ${offset + HUD_WIDTH}px)` }">
    <span class="font-weight-bold">{{ name }}</span>
    <template v-if="!isAvatar">
      <v-btn size="small" variant="tonal" prepend-icon="mdi-flip-horizontal" @click="room.flipSelected()">Flip</v-btn>
      <v-btn size="small" variant="tonal" icon="mdi-rotate-left" :disabled="!room.selectedDef?.rotatable" aria-label="Rotate left" @click="room.rotateSelected(-1)" />
      <v-btn size="small" variant="tonal" icon="mdi-rotate-right" :disabled="!room.selectedDef?.rotatable" aria-label="Rotate right" @click="room.rotateSelected(1)" />
      <SwatchRow :options="colorOptions" :model-value="room.selectedItem?.color" label="Item colour" @update:model-value="room.recolorSelected" />
      <v-btn size="small" variant="tonal" color="error" prepend-icon="mdi-delete-outline" @click="room.removeSelected()">Remove</v-btn>
    </template>
    <span v-else class="text-caption">Drag to move your character</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SwatchRow from './SwatchRow.vue'

const props = defineProps({
  // The object returned by useRoom(), wrapped in reactive()
  room: { type: Object, required: true },
  // Width taken by the dock on the left, so the bar centres itself in the free space
  offset: { type: Number, default: 0 },
})

// Space taken by the save status and coins at the top right; the bar stays clear of them
const HUD_WIDTH = 190

const isAvatar = computed(() => props.room.selectedKey === 'avatar')
const name = computed(() => (isAvatar.value ? 'You' : props.room.selectedDef?.name ?? ''))
const colorOptions = computed(() => (props.room.selectedDef?.colors ?? []).map((color) => ({ value: color, label: color, color })))
</script>

<style scoped>
/* A floating toolbar along the top of the room, where it never covers the furniture on the floor */
.bar { position: absolute; top: 14px; z-index: 5; width: max-content; transform: translateX(-50%); border-radius: 22px; background: rgb(var(--v-theme-surface), 0.95); box-shadow: 0 4px 16px rgb(0 0 0 / 20%); backdrop-filter: blur(6px); }
.bar { display: flex; align-items: center; flex-wrap: wrap; justify-content: center; gap: 10px; padding: 8px 16px; }
</style>
