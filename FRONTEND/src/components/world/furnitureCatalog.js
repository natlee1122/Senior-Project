/**
 * Furniture catalog, room presets and pure helpers for the World page.
 *
 * Scene units: the room is drawn on a 960 x 540 canvas. Floor items are
 * positioned by the point where they touch the floor ("bottom" anchor), wall
 * items and rugs by their centre ("center" anchor).
 */
export const ROOM_WIDTH = 960
export const ROOM_HEIGHT = 540
export const FLOOR_TOP = 380

// Free coins every room starts with so the shop can be tried before quests
// have been completed. Set to 0 to disable.
export const STARTER_COINS = 300

const FLOOR_RANGE = [396, 532] // allowed floor contact line for furniture and the avatar
const WALL_BOTTOM = 366

const WOOD = ['#a8734a', '#d9b48a', '#6f5b4a', '#e9e2d3', '#4b5563']
const FABRIC = ['#e08f6f', '#6fa8a0', '#8c78d1', '#f1c65b', '#7a8aa8']
const SOFT = ['#8fb8de', '#e8a1b8', '#a8d5ba', '#f1c65b', '#c9b6e8']

const RAW_FURNITURE = {
  bed: { name: 'Cozy bed', category: 'Bedroom', placement: 'floor', anchor: 'bottom', w: 224, h: 132, price: 180, colors: SOFT, spawn: { x: 170, y: 440 } },
  nightstand: { name: 'Nightstand', category: 'Bedroom', placement: 'floor', anchor: 'bottom', w: 72, h: 100, price: 50, colors: WOOD, spawn: { x: 310, y: 410 } },
  desk: { name: 'Study desk', category: 'Study', placement: 'floor', anchor: 'bottom', w: 190, h: 110, price: 120, colors: WOOD, spawn: { x: 770, y: 420 } },
  bookshelf: { name: 'Bookshelf', category: 'Study', placement: 'floor', anchor: 'bottom', w: 168, h: 270, price: 140, colors: WOOD, spawn: { x: 110, y: 402 } },
  sofa: { name: 'Sofa', category: 'Living room', placement: 'floor', anchor: 'bottom', w: 232, h: 132, price: 160, colors: FABRIC, spawn: { x: 760, y: 430 } },
  rug: { name: 'Round rug', category: 'Living room', placement: 'floor', anchor: 'center', layer: 'rug', w: 244, h: 52, price: 70, colors: ['#7fb7aa', '#e8a1b8', '#8fb8de', '#f1c65b', '#c9b6e8'], spawn: { x: 480, y: 466 } },
  plant: { name: 'Potted plant', category: 'Decor', placement: 'floor', anchor: 'bottom', w: 60, h: 112, price: 40, colors: ['#d98b5f', '#e9e2d3', '#6fa8a0', '#d96f8a', '#8c78d1'], spawn: { x: 900, y: 424 } },
  floorlamp: { name: 'Floor lamp', category: 'Lighting', placement: 'floor', anchor: 'bottom', w: 64, h: 222, price: 60, colors: ['#fff3d0', '#f2c6a0', '#cfe8ee', '#e5d4f5', '#d6e8cf'], spawn: { x: 640, y: 400 } },
  window: { name: 'Window', category: 'Wall', placement: 'wall', anchor: 'center', w: 236, h: 226, price: 90, colors: ['#f2c6a0', '#e8a1b8', '#a8d5ba', '#cfe8ee', '#e5d4f5'], spawn: { x: 420, y: 190 }, label: 'curtain' },
  frame_mountain: { name: 'Mountain print', category: 'Wall', placement: 'wall', anchor: 'center', w: 92, h: 112, price: 30, colors: ['#8c5c3a', '#e9e2d3', '#4b5563', '#d98b5f', '#2f3e46'], rotatable: true, spawn: { x: 760, y: 120 } },
  frame_sun: { name: 'Sunny badge', category: 'Wall', placement: 'wall', anchor: 'center', w: 76, h: 76, price: 30, colors: ['#8c5c3a', '#e9e2d3', '#4b5563', '#d98b5f', '#2f3e46'], rotatable: true, spawn: { x: 880, y: 140 } },
}

export const FURNITURE = Object.fromEntries(
  Object.entries(RAW_FURNITURE).map(([id, def]) => [id, { id, rotatable: false, layer: def.placement === 'wall' ? 'wall' : 'floor', defaultColor: def.colors[0], ...def }]),
)
export const FURNITURE_LIST = Object.values(FURNITURE)
export const CATEGORIES = [...new Set(FURNITURE_LIST.map((def) => def.category))]

export const WALLS = [
  { id: 'sage', label: 'Sage', color: '#e6efe3', shade: '#d6e3d2' },
  { id: 'blush', label: 'Blush', color: '#f6e3e0', shade: '#ecd0cc' },
  { id: 'sky', label: 'Sky', color: '#dcecf3', shade: '#c8dde8' },
  { id: 'cream', label: 'Cream', color: '#f5ecd9', shade: '#e9dcc1' },
  { id: 'slate', label: 'Slate', color: '#cfd6e4', shade: '#b9c2d6' },
]
export const FLOORS = [
  { id: 'oak', label: 'Oak', color: '#c99a6b', line: '#a9794c' },
  { id: 'walnut', label: 'Walnut', color: '#8c5c3a', line: '#6f4a2f' },
  { id: 'birch', label: 'Birch', color: '#e2c9a0', line: '#c9ab7c' },
  { id: 'stone', label: 'Stone', color: '#c9ccd1', line: '#aeb3ba' },
]
export const ROOM_THEMES = [
  { id: 'cozy', label: 'Cozy', wall: 'sage', floor: 'oak', lighting: 'day' },
  { id: 'sunny', label: 'Sunny', wall: 'cream', floor: 'birch', lighting: 'day' },
  { id: 'berry', label: 'Berry', wall: 'blush', floor: 'walnut', lighting: 'sunset' },
  { id: 'midnight', label: 'Midnight', wall: 'slate', floor: 'stone', lighting: 'night' },
]

// Lighting presets. The sun and moon positions are relative to the window centre.
export const LIGHTING = {
  day: { label: 'Day', skyTop: '#9ed7e8', skyBottom: '#dff3f5', sun: [45, -45], sunColor: '#ffe5a1', hills: '#8fc29a', hillsFront: '#74ad82', beam: '#fff3c4', beamOpacity: 0.55, tint: '#ffffff', tintOpacity: 0, glow: 0 },
  sunset: { label: 'Sunset', skyTop: '#f09a73', skyBottom: '#ffd9a0', sun: [-10, 41], sunColor: '#fff0c2', hills: '#b38a7a', hillsFront: '#8f6f6b', beam: '#ffb978', beamOpacity: 0.7, tint: '#ffb27a', tintOpacity: 0.3, glow: 0.2 },
  night: { label: 'Night', skyTop: '#1f2a55', skyBottom: '#4a5a96', moon: true, stars: true, hills: '#34406f', hillsFront: '#2a3560', beam: '#a9b9ff', beamOpacity: 0.3, tint: '#3b4a96', tintOpacity: 0.5, glow: 0.65 },
}

/** Lamps that light up at dusk and night: bulb position relative to the item, and glow radius. */
export const LIGHT_SOURCES = { floorlamp: { dy: -190, radius: 150 }, nightstand: { dy: -84, radius: 95 } }

export const AVATAR_SPAWN = { x: 480, y: 456 }
const AVATAR_RANGE = { x: [130, 830], y: FLOOR_RANGE }

const clamp = (value, [min, max]) => Math.min(max, Math.max(min, value))

export function itemBounds(def) {
  return def.anchor === 'bottom'
    ? { x: -def.w / 2, y: -def.h, width: def.w, height: def.h }
    : { x: -def.w / 2, y: -def.h / 2, width: def.w, height: def.h }
}

/** Keeps an item fully inside the part of the room it belongs to. */
export function clampPosition(def, x, y) {
  const xRange = [def.w / 2 - 12, ROOM_WIDTH - def.w / 2 + 12]
  let yRange
  if (def.placement === 'wall') yRange = [def.h / 2 + 24, WALL_BOTTOM - def.h / 2]
  else if (def.anchor === 'center') yRange = [FLOOR_TOP + def.h / 2 + 10, ROOM_HEIGHT - def.h / 2 - 4]
  else yRange = FLOOR_RANGE
  return { x: clamp(x, xRange), y: clamp(y, yRange) }
}

export const clampAvatarPosition = (x, y) => ({ x: clamp(x, AVATAR_RANGE.x), y: clamp(y, AVATAR_RANGE.y) })

export { shade } from '../../utils/color'

export const newUid = (id) => `${id}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

const makeItem = (id, x, y, uid = `starter-${id}`) => ({ uid, id, x, y, flip: false, rotation: 0, color: FURNITURE[id].defaultColor })

/** A new room: the basics (window, bed, desk, rug) are owned and already placed. */
export function createDefaultRoom() {
  const starter = ['window', 'bed', 'desk', 'rug']
  return {
    version: 1,
    wall: 'sage',
    floor: 'oak',
    lighting: 'day',
    spent: 0,
    owned: Object.fromEntries(starter.map((id) => [id, 1])),
    items: starter.map((id) => makeItem(id, FURNITURE[id].spawn.x, FURNITURE[id].spawn.y)),
    avatar: { ...AVATAR_SPAWN },
  }
}

/** Turns anything read from storage into a valid room, dropping unknown or broken data. */
export function sanitizeRoom(raw) {
  const base = createDefaultRoom()
  if (!raw || typeof raw !== 'object') return base

  const pick = (list, id, fallback) => (list.some((option) => option.id === id) ? id : fallback)
  const number = (value, fallback) => (Number.isFinite(value) ? value : fallback)

  const items = (Array.isArray(raw.items) ? raw.items : []).flatMap((item) => {
    const def = FURNITURE[item?.id]
    if (!def) return []
    const { x, y } = clampPosition(def, number(item.x, def.spawn.x), number(item.y, def.spawn.y))
    return [{
      uid: typeof item.uid === 'string' ? item.uid : newUid(def.id),
      id: def.id,
      x,
      y,
      flip: Boolean(item.flip),
      rotation: def.rotatable ? clamp(number(item.rotation, 0), [-45, 45]) : 0,
      color: def.colors.includes(item.color) ? item.color : def.defaultColor,
    }]
  })

  const owned = {}
  for (const def of FURNITURE_LIST) {
    const placed = items.filter((item) => item.id === def.id).length
    owned[def.id] = Math.max(placed, Math.floor(number(raw.owned?.[def.id], 0)))
  }

  return {
    version: 1,
    wall: pick(WALLS, raw.wall, base.wall),
    floor: pick(FLOORS, raw.floor, base.floor),
    lighting: Object.hasOwn(LIGHTING, raw.lighting) ? raw.lighting : base.lighting,
    spent: Math.max(0, number(raw.spent, 0)),
    owned,
    items,
    avatar: clampAvatarPosition(number(raw.avatar?.x, AVATAR_SPAWN.x), number(raw.avatar?.y, AVATAR_SPAWN.y)),
  }
}
