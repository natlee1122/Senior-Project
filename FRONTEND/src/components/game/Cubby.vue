<template>
  <button
    type="button"
    class="cubby"
    :class="{ 'cubby--hang': hang, 'cubby--lit': worn || lit, 'cubby--locked': locked }"
    :style="{ '--rarity': rarity.color }"
    :aria-pressed="worn || lit"
    :disabled="blank"
    :title="rarity.label"
    @click="emit('click')"
  >
    <template v-if="!blank">
      <!-- Clothes hang from a brass rod; everything else stands on the shelf -->
      <span v-if="hang" class="rod" aria-hidden="true"><span class="hook" /></span>
      <span v-if="fresh" class="ribbon">NEW</span>
      <span v-if="worn" class="badge" aria-label="Wearing">✓</span>
      <span v-else-if="locked" class="badge badge--lock" aria-hidden="true">🔒</span>
      <span v-else-if="stamp" class="stamp">{{ stamp }}</span>
      <span class="art"><slot /></span>
      <span class="label">{{ name }}</span>
      <span v-if="price" class="price">● {{ price }}</span>
    </template>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { rarityOf } from './rarity'

const props = defineProps({
  name: { type: String, default: '' },
  hang: { type: Boolean, default: false },
  worn: { type: Boolean, default: false },
  lit: { type: Boolean, default: false }, // lit up like a worn piece, used for the current selection
  locked: { type: Boolean, default: false },
  fresh: { type: Boolean, default: false },
  blank: { type: Boolean, default: false }, // an empty compartment, used to fill out a row
  stamp: { type: String, default: '' }, // small tag such as "OWNED"
  price: { type: Number, default: 0 }, // shown as a price tag
  tier: { type: Number, default: 0 }, // price used to pick the rarity colour of the top edge
})
const emit = defineEmits(['click'])

const rarity = computed(() => rarityOf(props.tier))
</script>

<style scoped>
.cubby {
  position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 2px; width: 100%; aspect-ratio: 1 / 1.1; padding: 6px 3px 12px;
  border: 0; border-top: 3px solid var(--rarity); border-radius: 3px; color: #fbe9c8; cursor: pointer; overflow: hidden;
  background: linear-gradient(180deg, #34200f 0%, #4a2f1a 65%, #5a3a22 100%);
  box-shadow: inset 0 6px 9px rgb(0 0 0 / 55%), inset 6px 0 8px rgb(0 0 0 / 38%), inset -6px 0 8px rgb(0 0 0 / 38%);
  transition: filter 140ms ease;
}
/* The front edge of the shelf board */
.cubby::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 7px; background: linear-gradient(#c58a4e, #8f5d31); box-shadow: 0 -2px 3px rgb(0 0 0 / 35%); }
.cubby:hover:not(:disabled) { filter: brightness(1.2); }
.cubby:focus-visible { outline: 3px solid #ffd166; outline-offset: -3px; }
.cubby:disabled { cursor: default; }

.art { display: flex; align-items: center; justify-content: center; margin-bottom: 2px; filter: drop-shadow(0 3px 2px rgb(0 0 0 / 55%)); }
.cubby--hang .art { margin-top: 10px; }

.label { max-width: 100%; padding: 0 5px; overflow: hidden; border-radius: 3px; background: #f3e6c8; color: #5a3a1a; font-size: 10px; font-weight: 800; line-height: 1.35; text-overflow: ellipsis; white-space: nowrap; box-shadow: 0 1px 0 rgb(0 0 0 / 35%); }
.price { padding: 0 7px; border-radius: 8px; background: rgb(var(--v-theme-gold, 242, 181, 59)); color: #4a3200; font-size: 10px; font-weight: 800; line-height: 1.5; }

/* Brass rod with a hook, for hanging clothes */
.rod { position: absolute; top: 9px; left: 6%; right: 6%; height: 4px; border-radius: 3px; background: linear-gradient(#f1d98a, #b99339); box-shadow: 0 2px 3px rgb(0 0 0 / 55%); }
.hook { position: absolute; top: 3px; left: 50%; width: 2px; height: 12px; background: #d9b45a; transform: translateX(-50%); }

/* Worn or selected pieces sit under a warm light */
.cubby--lit { box-shadow: inset 0 0 0 2px #ffd166, inset 0 0 22px rgb(255 209 102 / 38%), inset 0 6px 9px rgb(0 0 0 / 35%); background: linear-gradient(180deg, #5a3b1c 0%, #6b4724 65%, #7a5229 100%); }
.cubby--locked .art { filter: brightness(0.3) grayscale(1) drop-shadow(0 3px 2px rgb(0 0 0 / 60%)); }

.badge { position: absolute; top: 5px; right: 5px; z-index: 1; display: flex; align-items: center; justify-content: center; width: 19px; height: 19px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #ffe9a0, #e0a92e); color: #5a3a00; font-size: 11px; font-weight: 800; box-shadow: 0 2px 3px rgb(0 0 0 / 50%); }
.badge--lock { background: radial-gradient(circle at 35% 30%, #f1e0b0, #b99339); font-size: 10px; }
.stamp { position: absolute; top: 5px; right: 3px; z-index: 1; padding: 0 4px; border-radius: 3px; background: #e9d49b; color: #5a3a1a; font-size: 8px; font-weight: 800; letter-spacing: 0.04em; box-shadow: 0 1px 2px rgb(0 0 0 / 45%); }
.ribbon { position: absolute; top: 7px; left: -2px; z-index: 1; padding: 0 6px 0 5px; border-radius: 0 5px 5px 0; background: #ef476f; color: #fff; font-size: 9px; font-weight: 800; letter-spacing: 0.05em; box-shadow: 0 2px 3px rgb(0 0 0 / 45%); }

@media (prefers-reduced-motion: no-preference) {
  .cubby--lit .art { animation: pop 320ms ease; }
}
@keyframes pop { 40% { transform: scale(1.1); } }
</style>
