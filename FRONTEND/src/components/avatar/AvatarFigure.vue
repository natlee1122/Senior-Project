<template>
  <svg :class="{ 'avatar-figure': standalone }" :viewBox="viewBox" overflow="visible" role="img" :aria-label="label">
    <ShapeLayers :layers="figure.layers" :clips="figure.clips" :uid="uid" />
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { VIEW_BOX } from './avatarBodies'
import { buildAvatar } from './avatarGeometry'
import ShapeLayers from './ShapeLayers.vue'
import { nextUid } from './shapes'
import { resolveOutfit } from './wardrobeCatalog'

const props = defineProps({
  bodyType: { type: String, default: 'neutral' },
  // Worn items as { slot: { id, color } }. Saved data from the first version is upgraded automatically.
  equipped: { type: Object, default: () => ({}) },
  // Set to false when nested inside another <svg>, which then controls the size
  standalone: { type: Boolean, default: true },
  viewBox: { type: String, default: VIEW_BOX },
  // Thumbnail mode: a plain grey figure that shows only the items passed in
  mannequin: { type: Boolean, default: false },
  // Icon mode: draw only the garments, without a body (used for item thumbnails)
  flat: { type: Boolean, default: false },
  // Fill in the basic top, trousers and shoes when none are chosen
  useDefaults: { type: Boolean, default: true },
})

// SVG ids are document-global, so each instance gets its own prefix.
const uid = nextUid()
const figure = computed(() => buildAvatar(props.bodyType, props.equipped, { mannequin: props.mannequin, useDefaults: props.useDefaults, flat: props.flat }))

const label = computed(() => {
  const names = Object.values(resolveOutfit(props.equipped, props.useDefaults)).filter(Boolean).map((entry) => entry.item.name.toLowerCase())
  return `${props.bodyType} avatar wearing ${names.join(', ')}`
})
</script>

<style scoped>
.avatar-figure { width: min(100%, 300px); height: 100%; overflow: visible; }
@media (max-width: 600px) {
  .avatar-figure { width: min(100%, 280px); }
}
</style>
