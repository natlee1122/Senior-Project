<template>
  <button
    type="button"
    class="cell"
    :class="{ 'cell--worn': worn, 'cell--locked': locked, 'cell--selected': selected }"
    :style="{ '--rarity': rarity.color }"
    :aria-pressed="worn || selected"
    :title="rarity.label"
    @click="emit('click')"
  >
    <span v-if="fresh" class="cell-new">NEW</span>
    <span v-if="worn" class="cell-check" aria-label="Wearing">✓</span>
    <span class="cell-icon"><slot /></span>
    <span class="cell-name">{{ name }}</span>
    <span v-if="locked" class="cell-lock" aria-hidden="true">🔒</span>
    <span v-if="price !== null" class="cell-price" :class="{ 'cell-price--free': price === 0 }">{{ price === 0 ? 'FREE' : `● ${price}` }}</span>
    <span v-else class="cell-caption">{{ caption || '\u00a0' }}</span>
  </button>
</template>

<script setup>
import { rarityOf } from './rarity'
import { computed } from 'vue'

const props = defineProps({
  name: { type: String, required: true },
  price: { type: Number, default: null }, // shows a price tag instead of the caption
  caption: { type: String, default: '' },
  tier: { type: Number, default: 0 }, // price used to pick the rarity colour
  worn: { type: Boolean, default: false },
  locked: { type: Boolean, default: false },
  fresh: { type: Boolean, default: false },
  selected: { type: Boolean, default: false },
})
const emit = defineEmits(['click'])

const rarity = computed(() => rarityOf(props.tier))
</script>

<style scoped>
.cell {
  position: relative; display: flex; flex-direction: column; align-items: center; gap: 2px; width: 100%; padding: 8px 4px 10px;
  border: 2px solid var(--rarity); border-radius: 18px; background: rgb(var(--v-theme-surface)); color: inherit; cursor: pointer; overflow: hidden;
  box-shadow: 0 3px 0 rgb(var(--v-theme-on-surface), 0.08); transition: transform 120ms ease, box-shadow 120ms ease;
}
/* A strip in the rarity colour along the bottom edge */
.cell::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 5px; background: var(--rarity); opacity: 0.8; }
.cell:hover { transform: translateY(-2px); box-shadow: 0 5px 0 rgb(var(--v-theme-on-surface), 0.1); }
.cell:active { transform: translateY(1px); box-shadow: 0 1px 0 rgb(var(--v-theme-on-surface), 0.1); }
.cell:focus-visible { outline: 3px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }

.cell--worn, .cell--selected { border-color: rgb(var(--v-theme-primary)); background: rgb(var(--v-theme-primary), 0.08); box-shadow: 0 0 0 3px rgb(var(--v-theme-primary), 0.25), 0 3px 0 rgb(var(--v-theme-primary), 0.4); }
.cell--locked .cell-icon { filter: grayscale(1) opacity(0.5); }

.cell-icon { display: flex; align-items: center; justify-content: center; min-height: 88px; }
.cell-name { font-size: 12px; font-weight: 700; line-height: 1.2; text-align: center; }
.cell-caption { font-size: 11px; font-weight: 700; color: rgb(var(--v-theme-primary)); }
.cell-price { padding: 1px 9px; border-radius: 10px; background: rgb(var(--v-theme-gold, 255, 209, 102)); color: #5a4300; font-size: 11px; font-weight: 800; }
.cell-price--free { background: rgb(var(--v-theme-primary), 0.18); color: rgb(var(--v-theme-primary)); }

.cell-check { position: absolute; top: 6px; right: 6px; display: flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 50%; background: rgb(var(--v-theme-primary)); color: #fff; font-size: 13px; font-weight: 800; }
.cell-new { position: absolute; top: 8px; left: -2px; padding: 0 8px 0 6px; border-radius: 0 8px 8px 0; background: #ef476f; color: #fff; font-size: 10px; font-weight: 800; letter-spacing: 0.05em; }
.cell-lock { position: absolute; top: 6px; right: 8px; font-size: 14px; }

@media (prefers-reduced-motion: no-preference) {
  .cell--worn .cell-icon { animation: pop 320ms ease; }
}
@keyframes pop { 40% { transform: scale(1.12); } }
</style>
