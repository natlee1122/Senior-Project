<template>
  <PetFigure v-if="meta.pet" :equipped="petOutfit" :style="{ width: `${size}px`, height: `${size}px` }" />
  <AvatarFigure
    v-else
    :standalone="false"
    :width="size"
    :height="size"
    :view-box="meta.focus"
    :body-type="bodyType"
    :equipped="outfit"
    flat
    :mannequin="isHair"
    :use-defaults="false"
  />
</template>

<script setup>
import { computed } from 'vue'
import AvatarFigure from './AvatarFigure.vue'
import PetFigure from './PetFigure.vue'
import { SLOTS } from './wardrobeCatalog'

const props = defineProps({
  item: { type: Object, required: true },
  color: { type: String, default: null },
  bodyType: { type: String, default: 'neutral' },
  size: { type: Number, default: 84 },
})

const meta = computed(() => SLOTS[props.item.slot])
// Garments are drawn alone like icons; hair is shown on a plain head.
const isHair = computed(() => props.item.slot === 'hair')
const entry = computed(() => ({ id: props.item.id, color: props.color ?? props.item.defaultColor }))
const outfit = computed(() => ({ [props.item.slot]: entry.value }))
// Pet accessories are previewed on a fox.
const petOutfit = computed(() => (props.item.slot === 'pet' ? { pet: entry.value } : { pet: { id: 'pet_fox' }, [props.item.slot]: entry.value }))
</script>
