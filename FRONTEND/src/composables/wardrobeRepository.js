import { ITEMS_BY_ID, SLOTS, STARTER_OWNED, upgradeEquipped } from '../components/avatar/wardrobeCatalog'

/**
 * Persistence for which wardrobe items a user owns and how many coins they
 * spent on them. What is currently worn lives in avatarStorage.js, because the
 * World page reads that too. Async so it can be swapped for API calls later.
 */
export const MAX_OUTFITS = 8
const wardrobeKey = (user) => `lifescape-wardrobe-${user?.email || user?.id || 'guest'}`

function sanitize(raw) {
  const owned = Object.fromEntries(STARTER_OWNED.map((id) => [id, true]))
  for (const id of Object.keys(raw?.owned ?? {})) if (ITEMS_BY_ID[id] && raw.owned[id]) owned[id] = true
  const fresh = Object.fromEntries(Object.keys(raw?.fresh ?? {}).filter((id) => owned[id] && ITEMS_BY_ID[id]).map((id) => [id, true]))
  // Saved outfits only keep clothing slots; companions are not part of an outfit.
  const outfits = (Array.isArray(raw?.outfits) ? raw.outfits : []).slice(0, MAX_OUTFITS).map((outfit, index) => ({
    id: typeof outfit?.id === 'string' ? outfit.id : `outfit-${index}`,
    name: String(outfit?.name ?? `Outfit ${index + 1}`).slice(0, 20),
    equipped: Object.fromEntries(Object.entries(upgradeEquipped(outfit?.equipped)).filter(([slot]) => !SLOTS[slot].pet)),
  }))
  return { owned, fresh, outfits, spent: Number.isFinite(raw?.spent) ? Math.max(0, raw.spent) : 0 }
}

export async function loadWardrobe(user) {
  try {
    return sanitize(JSON.parse(localStorage.getItem(wardrobeKey(user)) || 'null'))
  } catch {
    return sanitize(null)
  }
}

export async function saveWardrobe(user, data) {
  try {
    localStorage.setItem(wardrobeKey(user), JSON.stringify(data))
  } catch {
    // Items stay usable for this visit if browser storage is unavailable.
  }
}
