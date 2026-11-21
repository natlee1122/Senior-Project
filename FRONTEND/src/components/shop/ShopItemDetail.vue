<template>
  <div v-if="entry">
    <div class="d-flex align-start justify-space-between mb-3">
      <div>
        <h3 class="text-h6">{{ entry.name }}</h3>
        <v-chip size="x-small" class="mt-1">{{ categoryLabel }}</v-chip>
      </div>
      <v-chip v-if="owned" color="success" size="small" variant="tonal" prepend-icon="mdi-check">Owned</v-chip>
      <v-chip v-else color="gold" size="small" class="font-weight-bold">{{ entry.price ? `● ${entry.price}` : 'Free' }}</v-chip>
    </div>

    <!-- Try-on stage: the item is shown on your current outfit and is not saved -->
    <div class="stage mb-3">
      <AvatarFigure v-if="entry.section === 'clothing'" :body-type="previewBody" :equipped="tryOn" />
      <PetFigure v-else-if="entry.section === 'companions'" class="stage-pet" :equipped="petTryOn" />
      <ItemPreview v-else :type="entry.id" :size="190" />
    </div>

    <v-btn-toggle
      v-if="entry.section === 'clothing'"
      :model-value="previewBody"
      class="mb-3 w-100"
      color="primary"
      variant="outlined"
      density="compact"
      divided
      mandatory
      aria-label="Try on as"
      @update:model-value="emit('update:previewBody', $event)"
    >
      <v-btn v-for="option in BODIES" :key="option.value" :value="option.value" class="flex-grow-1">{{ option.label }}</v-btn>
    </v-btn-toggle>

    <div v-if="entry.section !== 'furniture' && entry.def.colors.length > 1" class="mb-4">
      <div class="text-caption text-medium-emphasis mb-1">Colour</div>
      <SwatchRow :options="colorOptions" :model-value="color" label="Item colour" @update:model-value="emit('update:color', $event)" />
    </div>

    <template v-if="!owned">
      <v-btn block size="large" color="primary" :disabled="coins < entry.price" @click="emit('buy')">Buy for ● {{ entry.price }}</v-btn>
      <div v-if="coins < entry.price" class="text-caption text-medium-emphasis mt-2">You need {{ entry.price - coins }} more coins. Complete quests to earn them.</div>
    </template>
    <template v-else-if="entry.section === 'furniture'">
      <div class="text-body-2 mb-3">Owned {{ ownedCount }} · In your room {{ placedCount }}</div>
      <v-btn block size="large" color="primary" to="/world">Place it in your room</v-btn>
    </template>
    <template v-else>
      <v-btn v-if="!worn" block size="large" color="primary" @click="emit('wear')">Wear it</v-btn>
      <v-btn v-else-if="!required" block size="large" variant="outlined" color="primary-dark" @click="emit('take-off')">Take it off</v-btn>
      <v-btn v-else block size="large" variant="tonal" disabled>Wearing</v-btn>
    </template>
  </div>
  <div v-else class="d-flex flex-column align-center justify-center text-center text-medium-emphasis h-100 py-10">
    <div class="text-h3 mb-2">👆</div>
    <div class="text-subtitle-1 font-weight-bold">Pick something</div>
    <div class="text-body-2">See it on your character before you buy.</div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import AvatarFigure from '../avatar/AvatarFigure.vue'
import PetFigure from '../avatar/PetFigure.vue'
import { SLOTS } from '../avatar/wardrobeCatalog'
import ItemPreview from '../world/ItemPreview.vue'
import SwatchRow from '../world/SwatchRow.vue'

const props = defineProps({
  entry: { type: Object, default: null }, // see entriesFor() in shopCatalog.js
  wardrobe: { type: Object, required: true },
  room: { type: Object, required: true },
  previewBody: { type: String, default: 'neutral' },
  color: { type: String, default: null },
  coins: { type: Number, default: 0 },
})
const emit = defineEmits(['buy', 'wear', 'take-off', 'update:color', 'update:previewBody'])

const BODIES = [
  { label: 'Feminine', value: 'feminine' },
  { label: 'Masculine', value: 'masculine' },
  { label: 'Neutral', value: 'neutral' },
]

const isFurniture = computed(() => props.entry?.section === 'furniture')
const owned = computed(() => (isFurniture.value ? props.room.ownedCount(props.entry.id) > 0 : props.wardrobe.isOwned(props.entry.id)))
const ownedCount = computed(() => props.room.ownedCount(props.entry.id))
const placedCount = computed(() => props.room.placedCount(props.entry.id))
const worn = computed(() => !isFurniture.value && props.wardrobe.isWorn(props.entry.id))
const required = computed(() => Boolean(SLOTS[props.entry.category]?.required))
const categoryLabel = computed(() => SLOTS[props.entry.category]?.label ?? props.entry.category)
const colorOptions = computed(() => (props.entry.def.colors ?? []).map((value) => ({ value, label: value, color: value })))

// Preview what you would look like wearing the item, on top of what you wear now.
const picked = computed(() => ({ id: props.entry.id, color: props.color ?? props.entry.def.defaultColor }))
const tryOn = computed(() => ({ ...props.wardrobe.equipped, [props.entry.category]: picked.value }))
const petTryOn = computed(() => {
  const current = props.wardrobe.equipped
  if (props.entry.category === 'pet') return { pet: picked.value, petHat: current.petHat, petNeck: current.petNeck }
  return { pet: current.pet ?? { id: 'pet_fox' }, petHat: current.petHat, petNeck: current.petNeck, [props.entry.category]: picked.value }
})
</script>

<style scoped>
.stage { display: flex; align-items: center; justify-content: center; height: 300px; border-radius: 20px; overflow: hidden; background: linear-gradient(160deg, #fbfcfa, #ecf2ee); }
.stage :deep(.avatar-figure) { height: 100%; }
.stage-pet { width: 72%; height: 72%; }
</style>
