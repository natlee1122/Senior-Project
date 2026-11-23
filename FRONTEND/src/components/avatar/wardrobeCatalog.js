/**
 * Everything the avatar can wear or keep as a companion.
 *
 * Items are not tied to a body type: any body can wear any item, and the
 * geometry code fits each piece to the body it is on. `style` holds the
 * numbers that shape the item (see garments.js and headwear.js).
 */
export const SLOT_ORDER = ['top', 'outer', 'bottom', 'neck', 'shoes', 'hat', 'glasses', 'headphones', 'bag', 'hair', 'pet', 'petHat', 'petNeck']

// Viewbox used for thumbnails (on the 240 x 330 avatar canvas) and whether a slot may be empty.
export const SLOTS = {
  top: { label: 'Tops', focus: '58 98 124 124', required: true },
  outer: { label: 'Outerwear', focus: '58 98 124 124' },
  bottom: { label: 'Bottoms', focus: '56 158 128 128', required: true },
  neck: { label: 'Neckwear', focus: '82 106 76 76' },
  shoes: { label: 'Shoes', focus: '82 244 76 76', required: true },
  hat: { label: 'Hats', focus: '68 -12 104 104' },
  glasses: { label: 'Glasses', focus: '86 42 68 68' },
  headphones: { label: 'Headphones', focus: '78 20 84 84' },
  bag: { label: 'Bags', focus: '60 98 120 120' },
  hair: { label: 'Hair', focus: '56 24 128 128' },
  pet: { label: 'Companions', pet: true },
  petHat: { label: 'Pet hats', pet: true },
  petNeck: { label: 'Pet neckwear', pet: true },
}

const BRIGHT = ['#8c78d1', '#5f8fcf', '#6fa8a0', '#e08f6f', '#f1c65b', '#d96f8a', '#f4efe8', '#3b4350']
const SUIT = ['#2f3e56', '#3b4350', '#1f2937', '#8a7f72', '#7a2e3a', '#e9e2d3']
const DENIM = ['#5f86b8', '#3f5f8a', '#8fb0d6', '#2d3a4f', '#1f2937']
const PANTS = ['#77728a', '#3b4350', '#c9b79c', '#e9e2d3', '#7a8a6a', '#5a4636']
const SKIRT = ['#d96f8a', '#3b4350', '#5f8fcf', '#f1c65b', '#8c78d1', '#e9e2d3', '#6fa8a0']
const SNEAKER = ['#8f70d8', '#e9e2d3', '#5f8fcf', '#e08f6f', '#3b4350', '#d96f8a']
const LEATHER = ['#3a2a22', '#1f1f24', '#7a4b2a', '#a8734a', '#7a2e3a']
const SANDAL = ['#c9a37a', '#e9e2d3', '#e08f6f', '#5f8fcf', '#3b4350']
const HAT = ['#4268d9', '#e08f6f', '#3b4350', '#6fa8a0', '#f1c65b', '#d96f8a', '#e9e2d3', '#7a2e3a']
const TIE = ['#c0392b', '#2f3e56', '#6fa8a0', '#f1c65b', '#8c78d1', '#3b4350', '#e08f6f']
const HAIR = ['#49352f', '#2b2623', '#d9b46c', '#b5532f', '#b9bfc7', '#e08fb0', '#5f8fcf']
const FRAME = ['#3b4350', '#a8734a', '#e9e2d3', '#d96f8a', '#f1c65b']
const PHONES = ['#8c8ba0', '#d96f8a', '#3b4350', '#e9e2d3', '#5f8fcf']
const BAG = ['#d93673', '#5f8fcf', '#6fa8a0', '#f1c65b', '#3b4350', '#e08f6f']
const FESTIVE = ['#e08f6f', '#5f8fcf', '#d96f8a', '#f1c65b', '#6fa8a0', '#8c78d1']

const make = (id, slot, name, price, colors, style = {}) => ({ id, slot, name, price, colors, style, defaultColor: colors[0] })

export const ITEMS = [
  // Tops (sleeve = share of the arm covered, ease = looseness, hem = length below the hip, depth = neckline)
  make('top_tee', 'top', 'Basic tee', 0, BRIGHT, { kind: 'tee', sleeve: 0.34, ease: 1.5, hem: 9, depth: 6 }),
  make('top_tank', 'top', 'Tank top', 25, BRIGHT, { kind: 'tank', sleeve: 0, ease: 1.2, hem: 8, depth: 13 }),
  make('top_stripe', 'top', 'Striped tee', 35, ['#5f8fcf', '#d96f8a', '#3b4350', '#6fa8a0', '#f1c65b'], { kind: 'stripe', sleeve: 0.34, ease: 1.5, hem: 9, depth: 6 }),
  make('top_sweater', 'top', 'Knit sweater', 55, ['#e9e2d3', '#c0392b', '#6fa8a0', '#8c78d1', '#3b4350', '#e08f6f'], { kind: 'sweater', sleeve: 0.9, ease: 2.6, hem: 13, depth: 5 }),
  make('top_shirt', 'top', 'Dress shirt', 50, ['#f4efe8', '#cfe3f3', '#f2c6d0', '#3b4350', '#cfe8d8'], { kind: 'shirt', sleeve: 0.9, ease: 2, hem: 11, depth: 4 }),
  make('top_hoodie', 'top', 'Zip hoodie', 60, ['#d8b27a', '#6fa8a0', '#8c78d1', '#3b4350', '#d96f8a', '#5f8fcf'], { kind: 'hoodie', sleeve: 0.9, ease: 3.5, hem: 15, depth: 3 }),
  // Outerwear (open at the front so tops and ties show through)
  make('outer_blazer', 'outer', 'Suit jacket', 150, SUIT, { kind: 'blazer', ease: 3, hem: 17, gap: 3, vDrop: 14, sleeve: 0.92 }),
  make('outer_vest', 'outer', 'Waistcoat', 80, SUIT, { kind: 'vest', ease: 1.8, hem: 11, gap: 3, vDrop: 24, sleeve: 0 }),
  make('outer_jacket', 'outer', 'Denim jacket', 90, DENIM, { kind: 'jacket', ease: 3.2, hem: 8, gap: 5, vDrop: 4, sleeve: 0.92 }),
  // Bottoms (any body can wear any of them)
  make('bottom_pants', 'bottom', 'Basic pants', 0, PANTS, { kind: 'pants', width: 1, reach: 1 }),
  make('bottom_jeans', 'bottom', 'Jeans', 50, DENIM, { kind: 'jeans', width: 1.02, reach: 1 }),
  make('bottom_trousers', 'bottom', 'Suit trousers', 70, SUIT, { kind: 'trousers', width: 1, reach: 1 }),
  make('bottom_shorts', 'bottom', 'Shorts', 40, ['#c9b79c', '#5f86b8', '#3b4350', '#e08f6f', '#6fa8a0', '#f1c65b'], { kind: 'shorts', width: 1.12, reach: 0.4 }),
  make('bottom_mini', 'bottom', 'Mini skirt', 50, SKIRT, { kind: 'skirt', hem: 38, flare: 14, pleats: false }),
  make('bottom_midi', 'bottom', 'Pleated skirt', 70, SKIRT, { kind: 'skirt', hem: 70, flare: 24, pleats: true }),
  // Neckwear
  make('neck_tie', 'neck', 'Necktie', 30, TIE, { kind: 'tie' }),
  make('neck_bowtie', 'neck', 'Bow tie', 30, TIE, { kind: 'bowtie' }),
  make('neck_scarf', 'neck', 'Scarf', 40, ['#c0392b', '#5f8fcf', '#f1c65b', '#6fa8a0', '#d96f8a', '#3b4350'], { kind: 'scarf' }),
  // Shoes
  make('shoes_basic', 'shoes', 'Plain shoes', 0, ['#51446e', '#3b4350', '#7a4b2a', '#e9e2d3'], { kind: 'basic' }),
  make('shoes_sneakers', 'shoes', 'Sneakers', 60, SNEAKER, { kind: 'sneakers' }),
  make('shoes_leather', 'shoes', 'Leather shoes', 80, LEATHER, { kind: 'leather' }),
  make('shoes_sandals', 'shoes', 'Sandals', 40, SANDAL, { kind: 'sandals' }),
  make('shoes_boots', 'shoes', 'Boots', 90, ['#7a4b2a', '#3a2a22', '#3b4350', '#c9a37a', '#7a2e3a'], { kind: 'boots' }),
  // Hats
  make('hat_cap', 'hat', 'Cap', 40, HAT, { kind: 'cap' }),
  make('hat_beanie', 'hat', 'Beanie', 35, HAT, { kind: 'beanie' }),
  make('hat_bucket', 'hat', 'Bucket hat', 45, ['#e9e2d3', '#6fa8a0', '#3b4350', '#f1c65b', '#d96f8a', '#5f8fcf'], { kind: 'bucket' }),
  make('hat_tophat', 'hat', 'Top hat', 90, ['#2b2630', '#7a2e3a', '#2f3e56', '#e9e2d3'], { kind: 'tophat' }),
  make('hat_bow', 'hat', 'Hair bow', 25, ['#d96f8a', '#c0392b', '#5f8fcf', '#f1c65b', '#8c78d1', '#e9e2d3'], { kind: 'bow' }),
  // Face and ears
  make('glasses_round', 'glasses', 'Round glasses', 40, FRAME, { kind: 'round' }),
  make('glasses_sun', 'glasses', 'Sunglasses', 50, ['#2b2630', '#7a2e3a', '#2f3e56', '#d96f8a', '#e08f6f'], { kind: 'sun' }),
  make('headphones_over', 'headphones', 'Headphones', 80, PHONES, { kind: 'over' }),
  // Bags
  make('bag_backpack', 'bag', 'Backpack', 70, BAG, { kind: 'backpack' }),
  make('bag_messenger', 'bag', 'Shoulder bag', 60, ['#a8734a', '#3b4350', '#d96f8a', '#5f8fcf', '#6fa8a0', '#f1c65b'], { kind: 'messenger' }),
  // Hair (free; choose any style on any body)
  make('hair_long', 'hair', 'Long hair', 0, HAIR, { kind: 'long' }),
  make('hair_short', 'hair', 'Short hair', 0, HAIR, { kind: 'short' }),
  make('hair_bob', 'hair', 'Bob cut', 0, HAIR, { kind: 'medium' }),
  // Companions
  make('pet_fox', 'pet', 'Fox', 0, ['#e9853d', '#c9693a', '#d9a066', '#9aa5b1'], { kind: 'fox' }),
  make('pet_cat', 'pet', 'Cat', 100, ['#e9a15a', '#9aa5b1', '#3f3d4a', '#f4efe8', '#c9a37a'], { kind: 'cat' }),
  make('pet_dog', 'pet', 'Puppy', 100, ['#c98f5a', '#f0d9b0', '#8d8d99', '#3d3a3a'], { kind: 'dog' }),
  make('pet_bunny', 'pet', 'Bunny', 120, ['#f4efe8', '#9aa5b1', '#c9a37a', '#3f3d4a'], { kind: 'bunny' }),
  make('pet_panda', 'pet', 'Panda', 150, ['#f7f5ef'], { kind: 'panda' }),
  // Pet accessories
  make('petHat_party', 'petHat', 'Party hat', 30, FESTIVE, { kind: 'party' }),
  make('petHat_crown', 'petHat', 'Tiny crown', 50, ['#f1c65b', '#d9d9e3', '#e08f6f'], { kind: 'crown' }),
  make('petHat_ribbon', 'petHat', 'Ribbon', 25, FESTIVE, { kind: 'ribbon' }),
  make('petNeck_collar', 'petNeck', 'Bell collar', 25, ['#c0392b', '#5f8fcf', '#6fa8a0', '#d96f8a', '#3b4350'], { kind: 'collar' }),
  make('petNeck_bandana', 'petNeck', 'Bandana', 30, FESTIVE, { kind: 'bandana' }),
  make('petNeck_bow', 'petNeck', 'Bow tie', 30, FESTIVE, { kind: 'bowtie' }),
]

export const ITEMS_BY_ID = Object.fromEntries(ITEMS.map((item) => [item.id, item]))
export const itemsForSlot = (slot) => ITEMS.filter((item) => item.slot === slot)

// What a body wears when nothing else is chosen. These slots can never be empty.
const DEFAULT_ITEM_IDS = { top: 'top_tee', bottom: 'bottom_pants', shoes: 'shoes_basic' }
export const STARTER_OWNED = ['top_tee', 'bottom_pants', 'shoes_basic', 'hair_long', 'hair_short', 'hair_bob', 'pet_fox']

// Items saved by the first version of the avatar page used these ids.
const LEGACY_IDS = { cap: 'hat_cap', hoodie: 'top_hoodie', headphones: 'headphones_over', fox: 'pet_fox', sneakers: 'shoes_sneakers', backpack: 'bag_backpack' }

/** Normalises saved data into { slot: { id, color } }, accepting the old format too. */
export function upgradeEquipped(raw) {
  const result = {}
  for (const entry of Object.values(raw && typeof raw === 'object' ? raw : {})) {
    const item = ITEMS_BY_ID[LEGACY_IDS[entry?.id] ?? entry?.id]
    if (!item) continue
    result[item.slot] = { id: item.id, color: item.colors.includes(entry.color) ? entry.color : item.defaultColor }
  }
  return result
}

/** The final outfit for rendering: { slot: { item, color } | null }, with the required basics filled in. */
export function resolveOutfit(raw, useDefaults = true) {
  const saved = upgradeEquipped(raw)
  return Object.fromEntries(SLOT_ORDER.map((slot) => {
    const entry = saved[slot] ?? (useDefaults && DEFAULT_ITEM_IDS[slot] ? { id: DEFAULT_ITEM_IDS[slot] } : null)
    const item = entry && ITEMS_BY_ID[entry.id]
    return [slot, item ? { item, color: entry.color ?? item.defaultColor } : null]
  }))
}
