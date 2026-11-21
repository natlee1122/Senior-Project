<template>
  <svg class="pet-figure" viewBox="-6 -16 72 84" overflow="visible" role="img" :aria-label="label">
    <ShapeLayers :layers="layers" :uid="uid" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { buildPetShapes } from './petGeometry'
import ShapeLayers from './ShapeLayers.vue'
import { nextUid } from './shapes'
import { resolveOutfit } from './wardrobeCatalog'

const props = defineProps({
  // Worn items as { pet, petHat, petNeck }, each { id, color }
  equipped: { type: Object, default: () => ({}) },
})

const uid = nextUid()
const outfit = computed(() => resolveOutfit(props.equipped, false))
const layers = computed(() => {
  const { pet, petHat, petNeck } = outfit.value
  if (!pet) return []
  return [{ key: 'pet', shapes: buildPetShapes({ species: pet.item, color: pet.color, hat: petHat, neck: petNeck }) }]
})
const label = computed(() => `${outfit.value.pet?.item.name ?? 'No'} companion`)
</script>

<style scoped>
.pet-figure { width: 100%; height: 100%; }
</style>
