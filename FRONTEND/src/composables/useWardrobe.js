import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { DEFAULT_BODY_TYPE, readAppearance, writeAppearance } from '../components/avatar/avatarStorage'
import { ITEMS, ITEMS_BY_ID, SLOTS, SLOT_ORDER, itemsForSlot, resolveOutfit, upgradeEquipped } from '../components/avatar/wardrobeCatalog'
import { BODY_PRESETS } from '../components/avatar/avatarBodies'
import { STARTER_COINS } from '../components/world/furnitureCatalog'
import { loadRoom } from './roomRepository'
import { MAX_OUTFITS, loadWardrobe, saveWardrobe } from './wardrobeRepository'

/**
 * State and actions for the avatar's wardrobe: which items are owned, what is
 * worn, and the shop. Wrap the result in reactive() to unwrap the refs.
 */
export function useWardrobe() {
  const characterStyle = ref(DEFAULT_BODY_TYPE)
  const equipped = ref({}) // { slot: { id, color } }; required slots fall back to the basics
  const owned = ref({})
  const fresh = ref({}) // bought but not worn yet, shown with a NEW tag
  const outfits = ref([]) // saved looks
  const spent = ref(0)
  const roomSpent = ref(0) // coins spent in the furniture shop, which shares this balance
  const earnedCoins = ref(0)
  const ready = ref(false)

  let owner = null
  let loading = false
  let saveTimer = null

  const coins = computed(() => Math.max(0, earnedCoins.value + STARTER_COINS - spent.value - roomSpent.value))
  const outfit = computed(() => resolveOutfit(equipped.value))
  const ownedItems = computed(() => ITEMS.filter((item) => owned.value[item.id]))

  async function load(user, coinsFromServer = 0) {
    owner = user
    earnedCoins.value = coinsFromServer
    loading = true
    const [wardrobe, room] = await Promise.all([loadWardrobe(user), loadRoom(user)])
    const saved = readAppearance(user)
    characterStyle.value = Object.hasOwn(BODY_PRESETS, saved?.characterStyle) ? saved.characterStyle : DEFAULT_BODY_TYPE
    equipped.value = upgradeEquipped(saved?.equipped)
    owned.value = wardrobe.owned
    fresh.value = wardrobe.fresh
    outfits.value = wardrobe.outfits
    for (const entry of Object.values(equipped.value)) owned.value[entry.id] = true // anything already worn counts as owned
    spent.value = wardrobe.spent
    roomSpent.value = room.spent
    await nextTick() // let the save watcher see (and ignore) the freshly loaded state
    loading = false
    ready.value = true
  }

  watch([characterStyle, equipped, owned, fresh, outfits, spent], () => {
    if (loading) return
    clearTimeout(saveTimer)
    saveTimer = setTimeout(flushSave, 300)
  }, { deep: true })

  async function flushSave() {
    clearTimeout(saveTimer)
    writeAppearance(owner, { characterStyle: characterStyle.value, equipped: equipped.value })
    await saveWardrobe(owner, { owned: owned.value, fresh: fresh.value, outfits: outfits.value, spent: spent.value })
  }

  onBeforeUnmount(() => { if (saveTimer) flushSave() })

  const isOwned = (id) => Boolean(owned.value[id])
  const isWorn = (id) => outfit.value[ITEMS_BY_ID[id]?.slot]?.item.id === id
  const wornEntry = (slot) => outfit.value[slot]

  function buy(id) {
    const item = ITEMS_BY_ID[id]
    if (!item) return { ok: false, reason: 'unknown' }
    if (isOwned(id)) return { ok: false, reason: 'owned' }
    if (coins.value < item.price) return { ok: false, reason: 'coins' }
    spent.value += item.price
    owned.value[id] = true
    if (item.price > 0) fresh.value[id] = true
    return { ok: true }
  }

  /** Wears an owned item. Keeps the chosen colour when re-wearing the same piece, unless one is given. */
  function equip(id, color) {
    const item = ITEMS_BY_ID[id]
    if (!item || !isOwned(id)) return false
    const current = equipped.value[item.slot]
    const kept = current?.id === id ? current.color : item.defaultColor
    equipped.value[item.slot] = { id, color: item.colors.includes(color) ? color : kept }
    delete fresh.value[id]
    return true
  }

  function unequip(slot) {
    if (SLOTS[slot]?.required) return false
    delete equipped.value[slot]
    return true
  }

  function toggle(id) {
    const item = ITEMS_BY_ID[id]
    return isWorn(id) && !SLOTS[item.slot].required ? unequip(item.slot) : equip(id)
  }

  function setColor(slot, color) {
    const entry = outfit.value[slot]
    if (entry?.item.colors.includes(color)) equipped.value[slot] = { id: entry.item.id, color }
  }

  // --- Outfits and surprises -------------------------------------------------------

  const clothingSlots = SLOT_ORDER.filter((slot) => !SLOTS[slot].pet)
  const isOutfitFull = computed(() => outfits.value.length >= MAX_OUTFITS)

  /** Saves what you are wearing (clothing only) into a free outfit slot. */
  function saveOutfit(name) {
    if (isOutfitFull.value) return { ok: false, reason: 'full' }
    const snapshot = Object.fromEntries(clothingSlots.filter((slot) => equipped.value[slot]).map((slot) => [slot, { ...equipped.value[slot] }]))
    outfits.value.push({ id: `outfit-${Date.now().toString(36)}`, name: name.trim().slice(0, 20) || `Outfit ${outfits.value.length + 1}`, equipped: snapshot })
    return { ok: true }
  }

  function wearOutfit(id) {
    const outfit = outfits.value.find((entry) => entry.id === id)
    if (!outfit) return false
    for (const slot of clothingSlots) {
      const entry = outfit.equipped[slot]
      if (entry && isOwned(entry.id)) equipped.value[slot] = { ...entry }
      else delete equipped.value[slot]
      if (entry) delete fresh.value[entry.id]
    }
    return true
  }

  const deleteOutfit = (id) => { outfits.value = outfits.value.filter((entry) => entry.id !== id) }

  /** Picks a random look from what you own. Required slots always get something; the rest are a coin flip. */
  function shuffle() {
    const pick = (list) => list[Math.floor(Math.random() * list.length)]
    for (const slot of clothingSlots) {
      const choices = itemsForSlot(slot).filter((item) => isOwned(item.id))
      if (!choices.length || (!SLOTS[slot].required && slot !== 'hair' && Math.random() < 0.5)) {
        if (!SLOTS[slot].required) delete equipped.value[slot]
        continue
      }
      const item = pick(choices)
      equipped.value[slot] = { id: item.id, color: pick(item.colors) }
      delete fresh.value[item.id]
    }
  }

  const collection = computed(() => ({ owned: ownedItems.value.length, total: ITEMS.length }))

  const setBody = (style) => { if (Object.hasOwn(BODY_PRESETS, style)) characterStyle.value = style }
  // Back to the basics; the companion is not part of an outfit and stays.
  const resetOutfit = () => { for (const slot of clothingSlots) delete equipped.value[slot] }
  // The furniture shop draws from the same coins; the shop page keeps both in sync after each purchase.
  const setRoomSpent = (value) => { roomSpent.value = value }

  return {
    characterStyle, equipped, owned, fresh, outfits, spent, ready, collection, isOutfitFull, coins, outfit, ownedItems,
    load, flushSave, buy, equip, unequip, toggle, setColor, setBody, resetOutfit, saveOutfit, wearOutfit, deleteOutfit, shuffle, setRoomSpent, isOwned, isWorn, wornEntry,
  }
}
