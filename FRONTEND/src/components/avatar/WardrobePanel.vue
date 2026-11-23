<template>
  <div class="closet">
    <GameTabs v-if="outfits" v-model="view" :tabs="VIEWS" class="mb-4" />

    <WoodCabinet>
      <!-- Brass tags, one per section of the wardrobe -->
      <template v-if="view === 'items'" #tags>
        <button
          v-for="category in categories"
          :key="category.id"
          type="button"
          class="tag"
          :class="{ 'tag--active': slot === category.id }"
          :aria-pressed="slot === category.id"
          @click="slot = category.id"
        >
          <span class="tag-icon">{{ category.icon }}</span>
          <span class="tag-label">{{ category.label }}</span>
          <span class="tag-count">{{ category.count }}</span>
          <span v-if="category.badge" class="tag-dot" aria-label="New items" />
        </button>
      </template>

      <!-- ITEMS: one compartment per piece -->
      <template v-if="view === 'items'">
        <Cubby
          v-for="item in items"
          :key="item.id"
          :name="item.name"
          :hang="hanging"
          :tier="item.price"
          :worn="wardrobe.isWorn(item.id)"
          :locked="!wardrobe.isOwned(item.id)"
          :fresh="Boolean(wardrobe.fresh[item.id])"
          :price="wardrobe.isOwned(item.id) ? 0 : item.price"
          @click="onCell(item)"
        >
          <ItemThumb :item="item" :color="colorFor(item)" :body-type="wardrobe.characterStyle" :size="96" />
        </Cubby>
        <Cubby v-for="n in fillers" :key="`filler${n}`" empty blank />
      </template>

      <!-- OUTFITS: tall compartments, each holding a complete look -->
      <template v-else>
        <Cubby
          v-for="outfit in wardrobe.outfits"
          :key="outfit.id"
          :name="outfit.name"
          tall
          @click="wardrobe.wearOutfit(outfit.id)"
        >
          <AvatarFigure :standalone="false" :width="91" :height="160" view-box="40 28 160 282" :body-type="wardrobe.characterStyle" :equipped="outfit.equipped" />
          <v-btn class="outfit-delete" icon="mdi-close" size="x-small" variant="flat" color="#f3e6c8" :aria-label="`Delete ${outfit.name}`" @click.stop="wardrobe.deleteOutfit(outfit.id)" />
        </Cubby>
        <Cubby v-for="n in emptySlots" :key="`empty${n}`" tall empty />
      </template>

      <template #drawer>
        <template v-if="view === 'items'">
          <div v-if="worn" class="drawer-row mb-2">
            <span class="text-caption font-weight-bold">{{ worn.item.name }}</span>
            <SwatchRow v-if="worn.item.colors.length > 1" :options="colorOptions" :model-value="worn.color" label="Item colour" @update:model-value="wardrobe.setColor(slot, $event)" />
            <v-btn v-if="!SLOTS[slot].required" variant="text" size="x-small" class="ml-auto drawer-btn" @click="wardrobe.unequip(slot)">Take off</v-btn>
          </div>
          <div class="drawer-row">
            <div class="flex-grow-1">
              <div class="d-flex justify-space-between text-caption font-weight-bold mb-1"><span>Collection</span><span>{{ progress.owned }} / {{ progress.total }}</span></div>
              <v-progress-linear :model-value="progress.percent" color="gold" bg-color="#5a3820" height="9" rounded />
            </div>
            <v-btn v-if="outfits" icon="mdi-dice-multiple" size="small" variant="flat" color="#f3e6c8" aria-label="Surprise me" title="Surprise me" @click="wardrobe.shuffle()" />
            <v-chip color="gold" size="small" class="font-weight-bold">● {{ wardrobe.coins }}</v-chip>
          </div>
        </template>
        <div v-else class="drawer-row">
          <v-text-field v-model="outfitName" placeholder="Name this look" maxlength="20" density="compact" variant="solo" bg-color="#f3e6c8" hide-details :disabled="wardrobe.isOutfitFull" />
          <v-btn color="gold" variant="flat" :disabled="wardrobe.isOutfitFull" @click="saveOutfit">Save</v-btn>
        </div>
      </template>
    </WoodCabinet>

    <p v-if="view === 'outfits'" class="text-caption text-medium-emphasis mt-3">Outfits keep your clothes, hair and accessories. Your companion stays as it is.</p>
    <div v-else class="text-center mt-3">
      <v-btn variant="text" size="small" :to="shopLink">Browse this category in the Shop →</v-btn>
    </div>

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
import Cubby from '../game/Cubby.vue'
import GameTabs from '../game/GameTabs.vue'
import { rarityOf } from '../game/rarity'
import WoodCabinet from '../game/WoodCabinet.vue'
import { SLOT_ICONS, sectionOfSlot } from '../shop/shopCatalog'
import SwatchRow from '../world/SwatchRow.vue'
import AvatarFigure from './AvatarFigure.vue'
import ItemThumb from './ItemThumb.vue'
import { SLOTS, itemsForSlot } from './wardrobeCatalog'

const props = defineProps({
  // The object returned by useWardrobe(), wrapped in reactive()
  wardrobe: { type: Object, required: true },
  // Which sections to show, in order
  slots: { type: Array, required: true },
  // Show the Outfits tab and the shuffle button (they apply to clothing, not companions)
  outfits: { type: Boolean, default: false },
})

const VIEWS = [
  { value: 'items', label: 'Items', icon: '👕' },
  { value: 'outfits', label: 'Outfits', icon: '✨' },
]
const HANGING = ['top', 'outer', 'bottom', 'neck']
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
const hanging = computed(() => HANGING.includes(slot.value))
// Owned pieces come first, then what can still be unlocked, cheapest first.
const items = computed(() => [...slotItems(slot.value)].sort((a, b) => Number(props.wardrobe.isOwned(b.id)) - Number(props.wardrobe.isOwned(a.id)) || a.price - b.price))
const worn = computed(() => props.wardrobe.wornEntry(slot.value))
const colorOptions = computed(() => (worn.value?.item.colors ?? []).map((color) => ({ value: color, label: color, color })))
const shopLink = computed(() => `/inventory?section=${sectionOfSlot(slot.value)}&category=${slot.value}`)
const targetRarity = computed(() => rarityOf(target.value?.price ?? 0))
// Pad the last row so the cabinet always looks full
const fillers = computed(() => (3 - (items.value.length % 3)) % 3)
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

/* Brass name plates under the cornice */
.tag {
  position: relative; flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; gap: 1px; width: 62px; padding: 5px 2px 4px;
  border: 2px solid #8a6b1f; border-radius: 8px; background: linear-gradient(#f1d98a, #c9a24a); color: #4a2f12; cursor: pointer;
  box-shadow: 0 3px 0 #7a5a18; transition: transform 120ms ease;
}
.tag:focus-visible { outline: 2px solid #fff3c4; outline-offset: 2px; }
.tag--active { background: linear-gradient(#ffeaa6, #f1c65b); box-shadow: 0 1px 0 #7a5a18, 0 0 0 2px #fff3c4; transform: translateY(2px); }
.tag-icon { font-size: 22px; line-height: 1.2; }
.tag-label { font-size: 10px; font-weight: 800; line-height: 1.15; text-align: center; }
.tag-count { position: absolute; top: 2px; right: 3px; min-width: 15px; padding: 0 4px; border-radius: 8px; background: #5a3820; color: #fbe9c8; font-size: 10px; font-weight: 700; line-height: 15px; }
.tag-dot { position: absolute; top: 3px; left: 4px; width: 9px; height: 9px; border: 2px solid #fff; border-radius: 50%; background: #ef476f; }

.drawer-row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.drawer-btn { color: #fbe9c8; }
.outfit-delete { position: absolute; top: 4px; right: 4px; z-index: 2; }
</style>
