<template>
  <div>
    <PageHeading eyebrow="SHOP" title="Shop" subtitle="Spend your coins on outfits, companions and furniture.">
      <div class="d-flex align-center ga-2">
        <v-btn variant="text" to="/profile" prepend-icon="mdi-wardrobe-outline">Closet</v-btn>
        <v-btn variant="text" to="/world" prepend-icon="mdi-home-edit-outline">Room</v-btn>
        <v-chip color="gold" size="large" class="font-weight-bold">● {{ wardrobe.coins }}</v-chip>
      </div>
    </PageHeading>

    <v-card rounded="xxl" class="overflow-hidden">
      <GameTabs v-model="tab" :tabs="SHOP_TABS" class="px-4 pt-4" />
      <v-row no-gutters>
        <v-col cols="12" md class="pa-5 pa-md-6 shop-main">
          <div class="d-flex align-center flex-wrap ga-3 mb-3">
            <v-btn-toggle v-model="section" mandatory color="primary" variant="outlined" divided density="comfortable" aria-label="Shop section">
              <v-btn v-for="option in SECTIONS" :key="option.id" :value="option.id">{{ option.label }}</v-btn>
            </v-btn-toggle>
            <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" placeholder="Search the catalog…" variant="outlined" density="comfortable" hide-details clearable class="shop-search" />
          </div>
          <CategoryBar v-model="category" :categories="categories" />
          <v-switch v-if="tab === 'catalog'" v-model="hideOwned" label="Hide items I own" density="compact" color="primary" hide-details class="mb-2" />

          <div v-if="!ready" class="text-body-2 text-medium-emphasis py-8 text-center">Loading…</div>
          <div v-else-if="visible.length" class="shop-grid">
            <ItemCell
              v-for="entry in visible"
              :key="entry.key"
              :name="entry.name"
              :tier="entry.price"
              :selected="entry.key === selectedKey"
              :worn="entry.section !== 'furniture' && wardrobe.isWorn(entry.id)"
              :fresh="entry.section !== 'furniture' && Boolean(wardrobe.fresh[entry.id])"
              :price="isOwned(entry) ? null : entry.price"
              :caption="caption(entry)"
              @click="select(entry)"
            >
              <ItemPreview v-if="entry.section === 'furniture'" :type="entry.id" :size="88" />
              <ItemThumb v-else :item="entry.def" :body-type="wardrobe.characterStyle" :size="88" />
            </ItemCell>
          </div>
          <v-card v-else variant="tonal" rounded="lg" class="pa-6 text-center text-body-2">
            {{ tab === 'inventory' ? 'Nothing here yet. Browse the Catalog to find something you like.' : 'No items match your search.' }}
          </v-card>
        </v-col>

        <v-col cols="12" md="4" class="pa-5 pa-md-6 detail-col">
          <ShopItemDetail
            :entry="selected"
            :wardrobe="wardrobe"
            :room="room"
            :coins="wardrobe.coins"
            :color="previewColor"
            :preview-body="previewBody"
            @update:color="onColor"
            @update:preview-body="previewBody = $event"
            @buy="buy(selected)"
            @wear="wear(selected)"
            @take-off="wardrobe.unequip(selected.category)"
          />
        </v-col>
      </v-row>
    </v-card>

    <v-snackbar v-model="snackbar" :timeout="3200">
      {{ message }}
      <template v-if="boughtEntry" #actions>
        <v-btn color="primary-lighten-2" variant="text" @click="wearBought">Wear it</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'
import PageHeading from '../components/PageHeading.vue'
import ItemThumb from '../components/avatar/ItemThumb.vue'
import CategoryBar from '../components/game/CategoryBar.vue'
import GameTabs from '../components/game/GameTabs.vue'
import ItemCell from '../components/game/ItemCell.vue'
import ShopItemDetail from '../components/shop/ShopItemDetail.vue'
import { SECTIONS, entriesFor } from '../components/shop/shopCatalog'
import ItemPreview from '../components/world/ItemPreview.vue'
import { useRoom } from '../composables/useRoom'
import { useWardrobe } from '../composables/useWardrobe'

const route = useRoute()
const room = reactive(useRoom())
const wardrobe = reactive(useWardrobe())

// The closet and the room editor link here with ?section=…&category=…
const startSection = SECTIONS.some((s) => s.id === route.query.section) ? route.query.section : 'clothing'
const SHOP_TABS = [
  { value: 'catalog', label: 'Catalog', icon: '🛍️' },
  { value: 'inventory', label: 'Inventory', icon: '🎒' },
]
const tab = ref('catalog')
const section = ref(startSection)
const category = ref(SECTIONS.find((s) => s.id === startSection).categories.some((c) => c.id === route.query.category) ? route.query.category : null)
const search = ref('')
const hideOwned = ref(false)
const ready = computed(() => wardrobe.ready && room.ready)

const selectedKey = ref(null)
const previewColor = ref(null)
const previewBody = ref(wardrobe.characterStyle)

const snackbar = ref(false)
const message = ref('')
const boughtEntry = ref(null)

const isOwned = (entry) => (entry.section === 'furniture' ? room.ownedCount(entry.id) > 0 : wardrobe.isOwned(entry.id))
const sectionEntries = computed(() => entriesFor(section.value))
// Entries that belong to the current tab, before category and search are applied
const tabEntries = computed(() => sectionEntries.value.filter((entry) => tab.value === 'catalog' || isOwned(entry)))

const categories = computed(() => SECTIONS.find((s) => s.id === section.value).categories
  .map((c) => ({ ...c, count: tabEntries.value.filter((entry) => entry.category === c.id).length, badge: sectionEntries.value.some((entry) => entry.category === c.id && entry.section !== 'furniture' && wardrobe.fresh[entry.id]) })))

const visible = computed(() => {
  const text = (search.value ?? '').trim().toLowerCase()
  return tabEntries.value.filter((entry) => (!category.value || entry.category === category.value)
    && (!text || entry.name.toLowerCase().includes(text))
    && !(tab.value === 'catalog' && hideOwned.value && isOwned(entry)))
})

const selected = computed(() => sectionEntries.value.find((entry) => entry.key === selectedKey.value) ?? null)

function caption(entry) {
  if (tab.value === 'inventory' && entry.section === 'furniture') return `×${room.ownedCount(entry.id)} · ${room.placedCount(entry.id)} in room`
  if (entry.section !== 'furniture' && wardrobe.isWorn(entry.id)) return 'Wearing'
  return isOwned(entry) ? 'Owned' : ''
}

watch(section, () => {
  category.value = null
  selectedKey.value = null
})
watch(tab, () => { selectedKey.value = null })

function select(entry) {
  selectedKey.value = entry.key
  const worn = entry.section !== 'furniture' && wardrobe.isWorn(entry.id)
  previewColor.value = worn ? wardrobe.wornEntry(entry.category).color : entry.def.defaultColor
}

function onColor(color) {
  previewColor.value = color
  if (selected.value && wardrobe.isWorn(selected.value.id)) wardrobe.setColor(selected.value.category, color)
}

function wear(entry) {
  wardrobe.equip(entry.id, previewColor.value)
}

function buy(entry) {
  const result = entry.section === 'furniture' ? room.buy(entry.id) : wardrobe.buy(entry.id)
  // Both shops spend the same coins, so keep each one aware of the other's spending.
  wardrobe.setRoomSpent(room.state.spent)
  room.setWardrobeSpent(wardrobe.spent)
  boughtEntry.value = result.ok && entry.section !== 'furniture' ? entry : null
  message.value = result.ok ? `Bought ${entry.name}.` : 'Not enough coins yet. Complete more quests!'
  snackbar.value = true
}

function wearBought() {
  if (boughtEntry.value) wear(boughtEntry.value)
  snackbar.value = false
}

onMounted(async () => {
  let user = null
  let earned = 0
  try {
    const [me, stats] = await Promise.all([api.users.me(), api.users.stats()])
    user = me
    earned = stats?.coins ?? 0
  } catch {
    // Browse with the guest slot when the API is unavailable.
  }
  await Promise.all([wardrobe.load(user, earned), room.load(user, earned)])
  wardrobe.setRoomSpent(room.state.spent)
  room.setWardrobeSpent(wardrobe.spent)
  previewBody.value = wardrobe.characterStyle
})
</script>

<style scoped>
.shop-main { min-width: 0; }
.shop-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(116px, 1fr)); gap: 10px; }
.shop-search { max-width: 320px; min-width: 200px; }
.detail-col { border-inline-start: 1px solid rgb(var(--v-theme-on-surface), 0.08); }
@media (max-width: 959px) { .detail-col { border-inline-start: 0; border-block-start: 1px solid rgb(var(--v-theme-on-surface), 0.08); } }
</style>
