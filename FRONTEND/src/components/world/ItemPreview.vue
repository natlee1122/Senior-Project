<template>
  <svg class="item-preview" :viewBox="viewBox" :width="size" :height="size" aria-hidden="true">
    <FurnitureArt :type="type" :color="color" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import FurnitureArt from './FurnitureArt.vue'
import { FURNITURE, itemBounds } from './furnitureCatalog'

const props = defineProps({
  type: { type: String, required: true },
  color: { type: String, default: null },
  size: { type: Number, default: 88 },
})

// Fit the artwork into a square with some breathing room.
const viewBox = computed(() => {
  const b = itemBounds(FURNITURE[props.type])
  const side = Math.max(b.width, b.height) + 24
  const cx = b.x + b.width / 2
  const cy = b.y + b.height / 2
  return `${cx - side / 2} ${cy - side / 2} ${side} ${side}`
})
</script>
