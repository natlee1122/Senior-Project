import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import {
  FLOORS, FURNITURE, FURNITURE_LIST, ROOM_THEMES, STARTER_COINS, WALLS,
  clampAvatarPosition, clampPosition, createDefaultRoom, newUid,
} from '../components/world/furnitureCatalog'
import { loadRoom, saveRoom } from './roomRepository'

const ROTATION_STEP = 15
const ROTATION_LIMIT = 45

/**
 * State and actions for one user's room: purchases, placement, styling and
 * auto-save. Wrap the result in reactive() if you want refs unwrapped.
 */
export function useRoom() {
  const state = ref(createDefaultRoom())
  const ready = ref(false)
  const saveStatus = ref('saved') // 'saved' | 'saving'
  const earnedCoins = ref(0)
  const selectedKey = ref(null) // an item uid, 'avatar', or null

  let owner = null
  let loading = false
  let saveTimer = null

  const coins = computed(() => Math.max(0, earnedCoins.value + STARTER_COINS - state.value.spent))
  const ownedCount = (id) => state.value.owned[id] ?? 0
  const placedCount = (id) => state.value.items.filter((item) => item.id === id).length
  const availableCount = (id) => ownedCount(id) - placedCount(id)

  const inventory = computed(() => FURNITURE_LIST
    .filter((def) => ownedCount(def.id) > 0)
    .map((def) => ({ def, owned: ownedCount(def.id), placed: placedCount(def.id), available: availableCount(def.id) })))
  const selectedItem = computed(() => state.value.items.find((item) => item.uid === selectedKey.value) ?? null)
  const selectedDef = computed(() => (selectedItem.value ? FURNITURE[selectedItem.value.id] : null))

  async function load(user, coinsFromServer = 0) {
    owner = user
    earnedCoins.value = coinsFromServer
    loading = true
    state.value = await loadRoom(user)
    selectedKey.value = null
    await nextTick() // let the save watcher see (and ignore) the freshly loaded state
    loading = false
    ready.value = true
  }

  watch(state, () => {
    if (loading) return
    saveStatus.value = 'saving'
    clearTimeout(saveTimer)
    saveTimer = setTimeout(flushSave, 400)
  }, { deep: true })

  async function flushSave() {
    clearTimeout(saveTimer)
    await saveRoom(owner, state.value)
    saveStatus.value = 'saved'
  }

  onBeforeUnmount(() => { if (saveStatus.value === 'saving') flushSave() })

  // --- Shop and inventory ---------------------------------------------------

  function buy(id) {
    const def = FURNITURE[id]
    if (!def) return { ok: false, reason: 'unknown' }
    if (coins.value < def.price) return { ok: false, reason: 'coins' }
    state.value.spent += def.price
    state.value.owned[id] = ownedCount(id) + 1
    return { ok: true }
  }

  // --- Editing ----------------------------------------------------------------

  /** Puts an owned, unplaced piece into the room and selects it. */
  function place(id) {
    const def = FURNITURE[id]
    if (!def || availableCount(id) <= 0) return null
    const n = placedCount(id)
    const { x, y } = clampPosition(def, def.spawn.x + n * 28, def.spawn.y + (def.anchor === 'bottom' ? n * 10 : 0))
    const item = { uid: newUid(id), id, x, y, flip: false, rotation: 0, color: def.defaultColor }
    state.value.items.push(item)
    selectedKey.value = item.uid
    return item.uid
  }

  function moveEntity(key, x, y) {
    if (key === 'avatar') {
      Object.assign(state.value.avatar, clampAvatarPosition(x, y))
      return
    }
    const item = state.value.items.find((entry) => entry.uid === key)
    if (item) Object.assign(item, clampPosition(FURNITURE[item.id], x, y))
  }

  function nudgeSelected(dx, dy) {
    const target = selectedKey.value === 'avatar' ? state.value.avatar : selectedItem.value
    if (target) moveEntity(selectedKey.value, target.x + dx, target.y + dy)
  }

  function flipSelected() {
    if (selectedItem.value) selectedItem.value.flip = !selectedItem.value.flip
  }

  /** Rotates in 15 degree steps and wraps around at the limit. */
  function rotateSelected(direction) {
    const item = selectedItem.value
    if (!item || !selectedDef.value.rotatable) return
    const next = item.rotation + direction * ROTATION_STEP
    item.rotation = Math.abs(next) > ROTATION_LIMIT ? -Math.sign(next) * ROTATION_LIMIT : next
  }

  function recolorSelected(color) {
    if (selectedItem.value && selectedDef.value.colors.includes(color)) selectedItem.value.color = color
  }

  /** Takes the piece out of the room; it stays owned and returns to the inventory. */
  function removeSelected() {
    const index = state.value.items.findIndex((item) => item.uid === selectedKey.value)
    if (index >= 0) state.value.items.splice(index, 1)
    selectedKey.value = null
  }

  // --- Style ------------------------------------------------------------------

  const setWall = (id) => { if (WALLS.some((wall) => wall.id === id)) state.value.wall = id }
  const setFloor = (id) => { if (FLOORS.some((floor) => floor.id === id)) state.value.floor = id }
  const setLighting = (id) => { state.value.lighting = id }
  function applyTheme(id) {
    const theme = ROOM_THEMES.find((entry) => entry.id === id)
    if (theme) Object.assign(state.value, { wall: theme.wall, floor: theme.floor, lighting: theme.lighting })
  }

  /** Restores the starter layout and style. Purchases and coins are kept. */
  function resetLayout() {
    const fresh = createDefaultRoom()
    for (const id of Object.keys(fresh.owned)) state.value.owned[id] = Math.max(ownedCount(id), 1)
    Object.assign(state.value, { wall: fresh.wall, floor: fresh.floor, lighting: fresh.lighting, items: fresh.items, avatar: fresh.avatar })
    selectedKey.value = null
  }

  return {
    state, ready, saveStatus, coins, selectedKey, selectedItem, selectedDef, inventory,
    load, flushSave, buy, place, moveEntity, nudgeSelected, flipSelected, rotateSelected, recolorSelected,
    removeSelected, setWall, setFloor, setLighting, applyTheme, resetLayout,
    select: (key) => { selectedKey.value = key },
    setEarnedCoins: (value) => { earnedCoins.value = value },
    availableCount, ownedCount, placedCount,
  }
}
