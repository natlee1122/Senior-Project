<template>
  <section
    class="room"
    :class="{ 'room--editing': editing }"
    :tabindex="editing ? 0 : undefined"
    aria-label="Your room"
    @keydown="onKeydown"
  >
    <svg
      ref="svgEl"
      class="room__svg"
      viewBox="0 0 960 540"
      @pointermove="onPointerMove"
      @pointerup="endDrag"
      @pointercancel="endDrag"
    >
      <defs>
        <linearGradient :id="id('ceiling')" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1f2a2a" stop-opacity=".16" />
          <stop offset="1" stop-color="#1f2a2a" stop-opacity="0" />
        </linearGradient>
        <linearGradient :id="id('beam')" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" :stop-color="light.beam" stop-opacity=".55" />
          <stop offset="1" :stop-color="light.beam" stop-opacity="0" />
        </linearGradient>
        <radialGradient :id="id('glow')">
          <stop offset="0" stop-color="#ffd68c" stop-opacity=".95" />
          <stop offset="1" stop-color="#ffd68c" stop-opacity="0" />
        </radialGradient>
        <radialGradient :id="id('vignette')" cx=".5" cy=".55" r=".75">
          <stop offset=".6" stop-color="#141920" stop-opacity="0" />
          <stop offset="1" stop-color="#141920" stop-opacity=".14" />
        </radialGradient>
      </defs>

      <!-- Walls and floor (clicking them clears the selection) -->
      <g @pointerdown="emit('select', null)">
        <rect width="960" height="380" :fill="wall.color" />
        <rect y="292" width="960" height="90" :fill="wall.shade" />
        <rect y="288" width="960" height="6" fill="#f7f3ea" />
        <rect width="960" height="120" :fill="url('ceiling')" />
        <rect y="380" width="960" height="160" :fill="floor.color" />
        <path :d="FLOOR_PATH" fill="none" :stroke="floor.line" stroke-width="2" opacity=".55" />
        <rect y="372" width="960" height="14" fill="#f7f3ea" />
        <rect y="384" width="960" height="3" fill="#1f2a2a" opacity=".12" />
      </g>

      <!-- Light from each window falls onto the floor -->
      <path
        v-for="item in windows"
        :key="`beam${item.uid}`"
        d="M-78 392 L78 392 L250 528 L20 528Z"
        :transform="`translate(${item.x} 0) scale(${item.flip ? -1 : 1} 1)`"
        :fill="url('beam')"
        :opacity="light.beamOpacity"
        pointer-events="none"
      />

      <!-- Furniture and the avatar, sorted so things nearer the viewer draw on top -->
      <g v-for="entity in entities" :key="entity.key">
        <g
          v-if="entity.kind === 'item'"
          class="entity entity--item"
          :class="{ 'entity--selected': entity.key === selectedKey }"
          :transform="itemTransform(entity.item)"
          @pointerdown.stop="startDrag($event, entity.key, entity.item)"
        >
          <FurnitureArt :type="entity.item.id" :color="entity.item.color" :lighting="light" />
          <rect class="hit" v-bind="entity.bounds" fill="transparent" />
          <rect v-if="entity.key === selectedKey" class="selection" v-bind="entity.bounds" rx="6" fill="none" stroke="#2e8b78" stroke-width="2.5" stroke-dasharray="7 5" />
        </g>

        <g
          v-else
          class="entity entity--avatar"
          :class="{ 'entity--selected': selectedKey === 'avatar' }"
          :transform="`translate(${avatar.x} ${avatar.y})`"
          @pointerdown.stop="startDrag($event, 'avatar', avatar)"
          @click="onAvatarClick"
        >
          <g :ref="setAvatarEl" class="actor">
            <AvatarFigure
              :standalone="false"
              :x="-AVATAR.width / 2"
              :y="-AVATAR.feetOffset"
              :width="AVATAR.width"
              :height="AVATAR.height"
              :body-type="bodyType"
              :equipped="equipped"
            />
          </g>
          <rect class="hit" v-bind="AVATAR.hit" fill="transparent" />
          <rect v-if="selectedKey === 'avatar'" class="selection" v-bind="AVATAR.hit" rx="10" fill="none" stroke="#2e8b78" stroke-width="2.5" stroke-dasharray="7 5" />
        </g>
      </g>

      <!-- Lighting layers sit above everything so the whole room shares one light -->
      <rect width="960" height="540" :fill="light.tint" :opacity="light.tintOpacity" class="blend blend--multiply" pointer-events="none" />
      <circle
        v-for="lamp in lamps"
        :key="`glow${lamp.key}`"
        :cx="lamp.x"
        :cy="lamp.y"
        :r="lamp.radius"
        :fill="url('glow')"
        :opacity="light.glow"
        class="blend blend--screen"
        pointer-events="none"
      />
      <rect width="960" height="540" :fill="url('vignette')" pointer-events="none" />
    </svg>

    <v-tooltip :model-value="Boolean(bubble)" :activator="avatarEl" location="top" :open-on-hover="false" :open-on-click="false" :open-on-focus="false">
      {{ bubble }}
    </v-tooltip>
  </section>
</template>

<script>
// Module-level so every RoomScene instance gets a unique SVG id prefix.
let roomCounter = 0
</script>

<script setup>
import { computed, ref, shallowRef } from 'vue'
import AvatarFigure from '../avatar/AvatarFigure.vue'
import FurnitureArt from './FurnitureArt.vue'
import { FLOORS, FURNITURE, LIGHT_SOURCES, LIGHTING, WALLS, itemBounds } from './furnitureCatalog'

const props = defineProps({
  layout: { type: Object, required: true },
  bodyType: { type: String, default: 'neutral' },
  equipped: { type: Object, default: () => ({}) },
  editing: { type: Boolean, default: false },
  selectedKey: { type: String, default: null },
  bubble: { type: String, default: '' },
})
const emit = defineEmits(['select', 'move', 'avatar-click', 'remove'])

const uid = `room-${roomCounter++}`
const id = (name) => `${uid}-${name}`
const url = (name) => `url(#${id(name)})`

const svgEl = ref(null)
const avatarEl = shallowRef(null)
const setAvatarEl = (el) => { if (el) avatarEl.value = el }

const wall = computed(() => WALLS.find((entry) => entry.id === props.layout.wall) ?? WALLS[0])
const floor = computed(() => FLOORS.find((entry) => entry.id === props.layout.floor) ?? FLOORS[0])
const light = computed(() => LIGHTING[props.layout.lighting] ?? LIGHTING.day)
const avatar = computed(() => props.layout.avatar)

// The avatar canvas is 240 x 330 with its feet at y = 292, so the feet sit
// 292 / 330 of the way down. Positioning by the feet keeps it on the floor.
const AVATAR_HEIGHT = 346
const AVATAR_WIDTH = (AVATAR_HEIGHT * 240) / 330
const AVATAR = {
  width: AVATAR_WIDTH,
  height: AVATAR_HEIGHT,
  feetOffset: (AVATAR_HEIGHT * 292) / 330,
  hit: { x: -62, y: -274, width: 180, height: 280 },
}

// Depth order: wall items, then rugs, then floor items and the avatar by how far down they stand.
const LAYER_ORDER = { wall: 0, rug: 1, floor: 2 }
const entities = computed(() => {
  const list = props.layout.items.map((item) => {
    const def = FURNITURE[item.id]
    return { kind: 'item', key: item.uid, item, bounds: itemBounds(def), layer: LAYER_ORDER[def.layer], depth: item.y }
  })
  list.push({ kind: 'avatar', key: 'avatar', layer: LAYER_ORDER.floor, depth: avatar.value.y + 0.1 })
  return list.sort((a, b) => a.layer - b.layer || a.depth - b.depth)
})

const windows = computed(() => props.layout.items.filter((item) => item.id === 'window'))
const lamps = computed(() => props.layout.items
  .filter((item) => LIGHT_SOURCES[item.id])
  .map((item) => ({ key: item.uid, x: item.x, y: item.y + LIGHT_SOURCES[item.id].dy, radius: LIGHT_SOURCES[item.id].radius })))

const itemTransform = (item) => `translate(${item.x} ${item.y}) rotate(${item.rotation}) scale(${item.flip ? -1 : 1} 1)`

// --- Dragging -----------------------------------------------------------------

let drag = null

function toScene(event) {
  const svg = svgEl.value
  const point = svg.createSVGPoint()
  point.x = event.clientX
  point.y = event.clientY
  return point.matrixTransform(svg.getScreenCTM().inverse())
}

function startDrag(event, key, target) {
  if (!props.editing) return
  emit('select', key)
  const p = toScene(event)
  drag = { key, dx: target.x - p.x, dy: target.y - p.y }
  svgEl.value.setPointerCapture(event.pointerId)
}

function onPointerMove(event) {
  if (!drag) return
  const p = toScene(event)
  emit('move', { key: drag.key, x: p.x + drag.dx, y: p.y + drag.dy })
}

function endDrag() {
  drag = null
}

function onAvatarClick() {
  if (!props.editing) emit('avatar-click')
}

// Arrow keys nudge the selection; Delete removes it. Keeps editing usable without a mouse.
function onKeydown(event) {
  if (!props.editing || !props.selectedKey) return
  const step = event.shiftKey ? 24 : 8
  const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
  if (moves[event.key]) {
    event.preventDefault()
    const target = props.selectedKey === 'avatar' ? avatar.value : props.layout.items.find((item) => item.uid === props.selectedKey)
    if (target) emit('move', { key: props.selectedKey, x: target.x + moves[event.key][0], y: target.y + moves[event.key][1] })
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    event.preventDefault()
    emit('remove')
  }
}

// Floor planks: seams get further apart toward the viewer for a hint of depth.
const FLOOR_ROWS = [412, 448, 488, 530]
const FLOOR_PATH = FLOOR_ROWS.map((y, i) => {
  const top = i === 0 ? 380 : FLOOR_ROWS[i - 1]
  const step = 130 + i * 20
  let seams = ''
  for (let x = i % 2 ? step / 2 : step; x < 960; x += step) seams += `M${x} ${top} V${y} `
  return `M0 ${y} H960 ${seams}`
}).join(' ')
</script>

<style scoped>
.room { position: relative; aspect-ratio: 16 / 9; overflow: hidden; background: #e6efe3; outline: none; }
.room--editing:focus-visible { box-shadow: inset 0 0 0 3px rgb(var(--v-theme-primary)); }
.room__svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; isolation: isolate; }
.room--editing .room__svg { touch-action: none; user-select: none; }

.blend--multiply { mix-blend-mode: multiply; transition: opacity 400ms ease, fill 400ms ease; }
.blend--screen { mix-blend-mode: screen; transition: opacity 400ms ease; }

/* Furniture only reacts to the pointer while editing; the avatar can always be clicked. */
.entity--item { pointer-events: none; }
.room--editing .entity--item { pointer-events: all; cursor: grab; }
.room--editing .entity--item:active, .room--editing .entity--avatar:active { cursor: grabbing; }
.entity--avatar { cursor: pointer; }
.room--editing .entity--avatar { cursor: grab; }
.selection { stroke: rgb(var(--v-theme-primary)); pointer-events: none; }

@media (prefers-reduced-motion: no-preference) {
  .actor { transform-box: fill-box; transform-origin: 50% 100%; animation: breathe 4.2s ease-in-out infinite; }
}
@keyframes breathe { 50% { transform: scaleY(1.008); } }
</style>
