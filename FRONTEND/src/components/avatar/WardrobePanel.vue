<template>
  <div class="closet">
    <GameTabs v-if="outfits" v-model="view" :tabs="VIEWS" class="mb-4" />

    <!-- ITEMS: everything in a category; items you do not own yet are locked -->
    <template v-if="view === 'items'">
      <div class="d-flex align-center ga-3 mb-2">
        <div class="flex-grow-1">
          <div class="d-flex justify-space-between text-caption font-weight-bold mb-1">
            <span>Collection</span><span>{{ progress.owned }} / {{ progress.total }}</span>
          </div>
          <v-progress-linear :model-value="progress.percent" color="gold" bg-color="surface-variant" height="10" rounded />
        </div>
        <v-btn v-if="outfits" icon="mdi-dice-multiple" variant="tonal" color="primary" size="small" aria-label="Surprise me" title="Surprise me" @click="wardrobe.shuffle()" />
        <v-chip color="gold" size="small" class="font-weight-bold">● {{ wardrobe.coins }}</v-chip>
      </div>

      <CategoryBar v-model="slot" :categories="categories" :allow-all="false" label="Closet category" />

      <div v-if="worn" class="d-flex align-center flex-wrap ga-3 mb-3">
        <span class="text-caption font-weight-bold">{{ worn.item.name }}</span>
        <SwatchRow v-if="worn.item.colors.length > 1" :options="colorOptions" :model-value="worn.color" label="Item colour" @update:model-value="wardrobe.setColor(slot, $event)" />
        <v-btn v-if="!SLOTS[slot].required" variant="text" size="small" class="ml-auto" @click="wardrobe.unequip(slot)">Take off</v-btn>
      </div>

      <div class="cell-grid">
        <ItemCell
          v-for="item in items"
          :key="item.id"
          :name="item.name"
          :tier="item.price"
          :worn="wardrobe.isWorn(item.id)"
          :locked="!wardrobe.isOwned(item.id)"
          :fresh="Boolean(wardrobe.fresh[item.id])"
          :price="wardrobe.isOwned(item.id) ? null : item.price"
          :caption="wardrobe.isWorn(item.id) ? 'Wearing' : ''"
          @click="onCell(item)"
        >
          <ItemThumb :item="item" :color="colorFor(item)" :body-type="wardrobe.characterStyle" :size="88" />
        </ItemCell>
      </div>
      <div class="text-center mt-3">
        <v-btn variant="text" size="small" :to="shopLink">Browse this category in the Shop →</v-btn>
      </div>
    </template>

    <!-- OUTFITS: save the current look and swap between looks in one tap -->
    <template v-else>
      <div class="d-flex ga-2 mb-4">
        <v-text-field v-model="outfitName" label="Name this look" maxlength="20" density="comfortable" variant="outlined" hide-details :disabled="wardrobe.isOutfitFull" />
        <v-btn color="primary" size="large" :disabled="wardrobe.isOutfitFull" @click="saveOutfit">Save</v-btn>
      </div>
      <div class="cell-grid cell-grid--outfits">
        <div v-for="outfit in wardrobe.outfits" :key="outfit.id" class="outfit-card">
          <button type="button" class="outfit-wear" :aria-label="`Wear ${outfit.name}`" @click="wardrobe.wearOutfit(outfit.id)">
            <AvatarFigure :standalone="false" :width="91" :height="160" view-box="40 28 160 282" :body-type="wardrobe.characterStyle" :equipped="outfit.equipped" />
            <span class="text-caption font-weight-bold">{{ outfit.name }}</span>
          </button>
          <v-btn class="outfit-delete" icon="mdi-close" size="x-small" variant="text" :aria-label="`Delete ${outfit.name}`" @click="wardrobe.deleteOutfit(outfit.id)" />
        </div>
        <div v-for="n in emptySlots" :key="`empty${n}`" class="outfit-card outfit-card--empty">Empty</div>
      </div>
      <p class="text-caption text-medium-emphasis mt-3">Outfits keep your clothes, hair and accessories. Your companion stays as it is.</p>
    </template>

    <!-- Unlock a locked item without leaving the closet -->
    <v-dialog v-model="unlocking" max-width="340">
      <v-card v-if="target" rounded="xl" class="pa-6 text-center">
        <v-chip size="x-small" class="mb-3" :style="{ background: targetRarity.color, color: '#fff' }">{{ targetRarity.label }}</v-chip>
        <div class="d-flex justify-center mb-2"><ItemThumb :item="target" :body-type="wardrobe.characterStyle" :size="150" /></div>
        <h3 class="text-h6">{{ target.name }}</h3>
        <p class="text-body-2 text-medium-emphasis mb-4">Unlock it to add it to your collection.</p>
        <v-btn block size="large" color="primary" :disabled="wardrobe.coins < target.price" @click="unlock">Unlock &amp; wear · ● {{ target.price }}</v-btn>
        <div v-if="wardrobe.coins < target.price" class="text-caption text-medium-emphasis mt-2">You need {{ target.price - wardrobe.coins }} more coins.</div>
        <v-btn variant="text" class="mt-2" @click="unlocking = false">Not now</v-btn>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar" :timeout="2400">{{ message }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import CategoryBar from '../game/CategoryBar.vue'
import GameTabs from '../game/GameTabs.vue'
import ItemCell from '../game/ItemCell.vue'
import { rarityOf } from '../game/rarity'
import { SLOT_ICONS, sectionOfSlot } from '../shop/shopCatalog'
import SwatchRow from '../world/SwatchRow.vue'
import AvatarFigure from './AvatarFigure.vue'
import ItemThumb from './ItemThumb.vue'
import { SLOTS, itemsForSlot } from './wardrobeCatalog'

const props = defineProps({
  // The object returned by useWardrobe(), wrapped in reactive()
  wardrobe: { type: Object, required: true },
  // Which categories to show, in order
  slots: { type: Array, required: true },
  // Show the Outfits tab and the shuffle button (they apply to clothing, not companions)
  outfits: { type: Boolean, default: false },
})

const VIEWS = [
  { value: 'items', label: 'Items', icon: '👕' },
  { value: 'outfits', label: 'Outfits', icon: '✨' },
]
const OUTFIT_SLOTS = 6

const view = ref('items')
const slot = ref(props.slots[0])
const outfitName = ref('')
const unlocking = ref(false)
const target = ref(null)
const snackbar = ref(false)
const message = ref('')

watch(() => props.slots, (value) => { if (!value.includes(slot.value)) slot.value = value[0] })

const slotItems = (key) => itemsForSlot(key)
// Owned items first, then by price, so what you can wear comes before what you can unlock.
const items = computed(() => [...slotItems(slot.value)].sort((a, b) => Number(props.wardrobe.isOwned(b.id)) - Number(props.wardrobe.isOwned(a.id)) || a.price - b.price))
const worn = computed(() => props.wardrobe.wornEntry(slot.value))
const colorOptions = computed(() => (worn.value?.item.colors ?? []).map((color) => ({ value: color, label: color, color })))
const shopLink = computed(() => `/inventory?section=${sectionOfSlot(slot.value)}&category=${slot.value}`)
const targetRarity = computed(() => rarityOf(target.value?.price ?? 0))
const emptySlots = computed(() => Math.max(0, OUTFIT_SLOTS - props.wardrobe.outfits.length))

const categories = computed(() => props.slots.map((key) => ({
  id: key,
  label: SLOTS[key].label,
  icon: SLOT_ICONS[key],
  count: slotItems(key).filter((item) => props.wardrobe.isOwned(item.id)).length,
  badge: slotItems(key).some((item) => props.wardrobe.fresh[item.id]),
})))

const progress = computed(() => {
  const all = props.slots.flatMap(slotItems)
  const owned = all.filter((item) => props.wardrobe.isOwned(item.id)).length
  return { owned, total: all.length, percent: all.length ? (owned / all.length) * 100 : 0 }
})

// Thumbnails show the colour you picked for the piece you are wearing.
const colorFor = (item) => (props.wardrobe.isWorn(item.id) ? worn.value.color : item.defaultColor)

function onCell(item) {
  if (props.wardrobe.isOwned(item.id)) {
    props.wardrobe.toggle(item.id)
    return
  }
  target.value = item
  unlocking.value = true
}

function unlock() {
  const result = props.wardrobe.buy(target.value.id)
  if (result.ok) {
    props.wardrobe.equip(target.value.id)
    message.value = `Unlocked ${target.value.name}!`
    snackbar.value = true
  }
  unlocking.value = false
}

function saveOutfit() {
  const result = props.wardrobe.saveOutfit(outfitName.value)
  message.value = result.ok ? 'Outfit saved.' : 'All outfit slots are full. Delete one first.'
  snackbar.value = true
  if (result.ok) outfitName.value = ''
}
</script>

<style scoped>
.closet { min-width: 0; }
.cell-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 10px; }
.cell-grid--outfits { grid-template-columns: repeat(auto-fill, minmax(104px, 1fr)); }

.outfit-card { position: relative; display: flex; align-items: center; justify-content: center; min-height: 196px; border: 2px solid rgb(var(--v-theme-on-surface), 0.1); border-radius: 18px; background: rgb(var(--v-theme-surface)); box-shadow: 0 3px 0 rgb(var(--v-theme-on-surface), 0.08); }
.outfit-card--empty { border-style: dashed; box-shadow: none; color: rgb(var(--v-theme-on-surface), 0.35); font-size: 12px; font-weight: 700; }
.outfit-wear { display: flex; flex-direction: column; align-items: center; gap: 2px; width: 100%; padding: 8px 4px; border: 0; background: none; color: inherit; cursor: pointer; }
.outfit-wear:hover { transform: translateY(-2px); }
.outfit-wear:focus-visible { outline: 3px solid rgb(var(--v-theme-primary)); outline-offset: 2px; border-radius: 16px; }
.outfit-delete { position: absolute; top: 2px; right: 2px; }
</style>
