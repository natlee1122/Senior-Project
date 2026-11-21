import { ITEMS, SLOT_ORDER, SLOTS } from '../avatar/wardrobeCatalog'
import { CATEGORIES, FURNITURE_LIST } from '../world/furnitureCatalog'

/** One catalog view over clothing, companions and furniture, so the shop and closet share categories. */
export const SLOT_ICONS = {
  top: '👕', outer: '🧥', bottom: '👖', neck: '👔', shoes: '👟', hat: '🎩', glasses: '👓', headphones: '🎧', bag: '🎒', hair: '💇',
  pet: '🐾', petHat: '👑', petNeck: '🎀',
}
export const FURNITURE_ICONS = { Bedroom: '🛏️', 'Living room': '🛋️', Study: '📚', Decor: '🪴', Lighting: '💡', Wall: '🖼️' }

const slotCategories = (pets) => SLOT_ORDER
  .filter((slot) => Boolean(SLOTS[slot].pet) === pets)
  .map((slot) => ({ id: slot, label: SLOTS[slot].label, icon: SLOT_ICONS[slot] }))

export const SECTIONS = [
  { id: 'clothing', label: 'Clothing', categories: slotCategories(false) },
  { id: 'companions', label: 'Companions', categories: slotCategories(true) },
  { id: 'furniture', label: 'Furniture', categories: CATEGORIES.map((name) => ({ id: name, label: name, icon: FURNITURE_ICONS[name] ?? '📦' })) },
]

export const sectionOfSlot = (slot) => (SLOTS[slot]?.pet ? 'companions' : 'clothing')

/** Catalog entries for one section, in a shape the shop can render without caring what they are. */
export function entriesFor(sectionId) {
  if (sectionId === 'furniture') {
    return FURNITURE_LIST.map((def) => ({ key: `furniture:${def.id}`, section: 'furniture', id: def.id, name: def.name, category: def.category, price: def.price, def }))
  }
  const pets = sectionId === 'companions'
  return ITEMS
    .filter((item) => Boolean(SLOTS[item.slot].pet) === pets)
    .map((item) => ({ key: `${sectionId}:${item.id}`, section: sectionId, id: item.id, name: item.name, category: item.slot, price: item.price, def: item }))
}
