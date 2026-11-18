<template>
  <g>
    <ellipse v-if="def.layer === 'floor'" cx="0" cy="-1" :rx="def.w / 2 - 6" ry="7" fill="#1f2a2a" opacity=".16" />

    <g v-if="type === 'bed'">
      <rect x="-100" y="-132" width="200" height="76" rx="10" :fill="WOOD_DARK" />
      <rect x="-108" y="-84" width="216" height="66" rx="16" :fill="c.base" />
      <rect x="-84" y="-100" width="68" height="28" rx="12" :fill="c.light" />
      <rect x="16" y="-100" width="68" height="28" rx="12" :fill="c.light" />
      <rect x="-108" y="-58" width="216" height="44" rx="14" :fill="c.dark" />
      <rect x="-108" y="-58" width="216" height="10" rx="5" :fill="c.light" opacity=".6" />
      <rect x="-100" y="-20" width="200" height="10" rx="4" :fill="WOOD" />
      <rect x="-94" y="-14" width="10" height="14" rx="2" :fill="WOOD_DARK" />
      <rect x="84" y="-14" width="10" height="14" rx="2" :fill="WOOD_DARK" />
    </g>

    <g v-else-if="type === 'nightstand'">
      <rect x="-26" y="-14" width="8" height="14" rx="2" :fill="c.dark" />
      <rect x="18" y="-14" width="8" height="14" rx="2" :fill="c.dark" />
      <rect x="-30" y="-52" width="60" height="42" rx="4" :fill="c.base" />
      <rect x="-34" y="-56" width="68" height="7" rx="3" :fill="c.light" />
      <path d="M-30 -32 H30" :stroke="c.dark" stroke-width="2" />
      <circle cx="0" cy="-42" r="2.2" :fill="c.dark" />
      <circle cx="0" cy="-22" r="2.2" :fill="c.dark" />
      <rect x="-5" y="-72" width="10" height="16" rx="3" :fill="WOOD_DARK" />
      <path d="M-15 -100 L15 -100 L11 -70 L-11 -70Z" fill="#fff3d0" stroke="#e9d49b" stroke-width="1.5" stroke-linejoin="round" />
    </g>

    <g v-else-if="type === 'desk'">
      <rect x="-84" y="-52" width="9" height="52" rx="2" :fill="c.dark" />
      <rect x="75" y="-52" width="9" height="52" rx="2" :fill="c.dark" />
      <rect x="22" y="-52" width="52" height="38" rx="3" :fill="c.base" />
      <path d="M22 -33 H74" :stroke="c.dark" stroke-width="2" />
      <circle cx="48" cy="-42" r="2.2" :fill="c.dark" />
      <circle cx="48" cy="-24" r="2.2" :fill="c.dark" />
      <rect x="-90" y="-62" width="180" height="11" rx="4" :fill="c.light" />
      <rect x="-46" y="-104" width="46" height="32" rx="3" fill="#3b4350" />
      <rect x="-42" y="-100" width="38" height="24" rx="1.5" fill="#9ed7e8" />
      <rect x="-52" y="-72" width="58" height="9" rx="3" fill="#9aa5b1" />
      <rect x="44" y="-78" width="13" height="16" rx="3" fill="#f1c65b" />
      <path d="M57 -73 Q64 -73 64 -68 Q64 -64 57 -64" fill="none" stroke="#f1c65b" stroke-width="2.5" />
    </g>

    <g v-else-if="type === 'sofa'">
      <rect x="-98" y="-20" width="12" height="20" rx="3" :fill="WOOD_DARK" />
      <rect x="86" y="-20" width="12" height="20" rx="3" :fill="WOOD_DARK" />
      <rect x="-94" y="-130" width="188" height="86" rx="24" :fill="c.dark" />
      <rect x="-110" y="-74" width="220" height="58" rx="16" :fill="c.base" />
      <rect x="-116" y="-104" width="34" height="90" rx="16" :fill="c.light" />
      <rect x="82" y="-104" width="34" height="90" rx="16" :fill="c.light" />
      <rect x="-70" y="-110" width="62" height="48" rx="14" fill="#f1c65b" />
      <rect x="6" y="-106" width="62" height="44" rx="14" fill="#6fa8a0" />
      <path d="M-72 -46 H72" :stroke="c.dark" stroke-width="2" opacity=".7" />
    </g>

    <g v-else-if="type === 'bookshelf'">
      <rect x="-84" y="-270" width="168" height="270" rx="4" :fill="c.base" />
      <rect x="-74" y="-262" width="148" height="244" :fill="c.shadow" />
      <rect v-for="y in BOARDS" :key="`board${y}`" x="-76" :y="y" width="152" height="10" :fill="c.light" />
      <rect v-for="(b, i) in BOOKS" :key="`book${i}`" :x="b.x" :y="b.y" :width="b.w" :height="b.h" rx="1.5" :fill="b.fill" />
      <rect v-for="(b, i) in BOOKS" :key="`spine${i}`" :x="b.x + 2" :y="b.y + 6" :width="Math.max(b.w - 4, 2)" height="2" fill="#fff" opacity=".45" />
      <path d="M26 -190 Q16 -210 24 -224 Q34 -210 32 -190Z M34 -190 Q46 -212 58 -218 Q52 -198 40 -190Z" fill="#5f9f6b" />
      <rect x="24" y="-192" width="30" height="16" rx="3" fill="#d98b5f" />
      <rect x="26" y="-110" width="30" height="24" rx="4" fill="#4b5563" />
      <circle cx="41" cy="-97" r="7" fill="#9aa5b1" />
      <circle cx="41" cy="-97" r="3.5" fill="#3b4350" />
      <rect x="-66" y="-60" width="56" height="34" rx="5" fill="#c9a36b" />
      <rect x="-2" y="-60" width="60" height="34" rx="5" fill="#b88c55" />
      <path d="M-66 -48 H-10 M-2 -48 H58" stroke="#a77a49" stroke-width="2" />
    </g>

    <g v-else-if="type === 'plant'">
      <path d="M0 -46 Q-26 -74 -17 -102 Q-2 -76 0 -46Z" fill="#5f9f6b" />
      <path d="M2 -46 Q20 -80 36 -88 Q32 -62 2 -46Z" fill="#4f8c5c" />
      <path d="M0 -46 Q-6 -84 6 -108 Q16 -80 2 -46Z" fill="#6fb07b" />
      <path d="M-22 -40 H22 L17 0 H-17Z" :fill="c.base" />
      <rect x="-25" y="-46" width="50" height="10" rx="3" :fill="c.dark" />
    </g>

    <g v-else-if="type === 'floorlamp'">
      <rect x="-4" y="-164" width="8" height="164" rx="3" :fill="WOOD_DARK" />
      <ellipse cx="0" cy="-3" rx="20" ry="5" fill="#6f4a2f" />
      <path d="M-30 -218 L30 -218 L18 -160 L-18 -160Z" :fill="c.base" :stroke="c.dark" stroke-width="2" stroke-linejoin="round" />
    </g>

    <g v-else-if="type === 'rug'">
      <ellipse cx="0" cy="0" rx="122" ry="26" :fill="c.dark" />
      <ellipse cx="0" cy="0" rx="108" ry="20" :fill="c.base" />
      <ellipse cx="0" cy="0" rx="94" ry="16" fill="none" stroke="#fdf1d0" stroke-width="3" stroke-dasharray="10 8" opacity=".85" />
    </g>

    <g v-else-if="type === 'window'">
      <rect x="-90" y="-100" width="180" height="200" rx="6" :fill="WOOD" />
      <g :clip-path="`url(#${uid}-glass)`">
        <rect x="-78" y="-88" width="156" height="176" :fill="`url(#${uid}-sky)`" />
        <template v-if="lighting.stars">
          <circle v-for="(s, i) in STARS" :key="`star${i}`" :cx="s[0]" :cy="s[1]" :r="s[2]" fill="#fff" opacity=".85" />
        </template>
        <path v-if="lighting.moon" d="M45 -63 A18 18 0 0 0 45 -27 A22 22 0 0 1 45 -63Z" fill="#fdf6d8" />
        <circle v-else :cx="lighting.sun[0]" :cy="lighting.sun[1]" r="20" :fill="lighting.sunColor" />
        <template v-if="!lighting.stars">
          <ellipse cx="-40" cy="-45" rx="26" ry="8" fill="#fff" opacity=".8" />
          <ellipse cx="-22" cy="-52" rx="16" ry="7" fill="#fff" opacity=".8" />
        </template>
        <path d="M-78 55 Q-40 27 0 49 T78 41 V88 H-78Z" :fill="lighting.hills" />
        <path d="M-78 73 Q-30 55 20 71 T78 67 V88 H-78Z" :fill="lighting.hillsFront" />
      </g>
      <rect x="-3" y="-88" width="6" height="176" :fill="WOOD" />
      <rect x="-78" y="-3" width="156" height="6" :fill="WOOD" />
      <rect x="-100" y="98" width="200" height="14" rx="4" :fill="WOOD_DARK" />
      <path d="M-108 -102 L-56 -102 Q-64 0 -52 100 L-108 100Z" :fill="c.base" />
      <path d="M108 -102 L56 -102 Q64 0 52 100 L108 100Z" :fill="c.base" />
      <path d="M-92 -98 Q-96 0 -90 96 M-76 -98 Q-80 0 -72 96 M92 -98 Q96 0 90 96 M76 -98 Q80 0 72 96" fill="none" :stroke="c.dark" stroke-width="2" opacity=".6" />
      <rect x="-118" y="-109" width="236" height="6" rx="3" :fill="WOOD_DARK" />
      <circle cx="-118" cy="-106" r="6" :fill="WOOD_DARK" />
      <circle cx="118" cy="-106" r="6" :fill="WOOD_DARK" />
    </g>

    <g v-else-if="type === 'frame_mountain'">
      <rect x="-46" y="-56" width="92" height="112" rx="4" :fill="c.base" />
      <rect x="-38" y="-48" width="76" height="96" fill="#cfe8ee" />
      <circle cx="6" cy="-26" r="11" fill="#ffe5a1" />
      <path d="M-38 48 L-38 16 L-12 -8 L4 10 L20 -18 L38 12 L38 48Z" fill="#689a91" />
    </g>

    <g v-else-if="type === 'frame_sun'">
      <rect x="-38" y="-38" width="76" height="76" rx="4" :fill="c.base" />
      <rect x="-30" y="-30" width="60" height="60" fill="#fdf1d0" />
      <circle cx="0" cy="0" r="14" fill="#f1c65b" />
      <path d="M0 -24 V-18 M0 18 V24 M-24 0 H-18 M18 0 H24 M-17 -17 L-13 -13 M13 13 L17 17 M17 -17 L13 -13 M-13 13 L-17 17" stroke="#f1c65b" stroke-width="3" stroke-linecap="round" />
    </g>

    <defs v-if="type === 'window'">
      <linearGradient :id="`${uid}-sky`" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" :stop-color="lighting.skyTop" />
        <stop offset="1" :stop-color="lighting.skyBottom" />
      </linearGradient>
      <clipPath :id="`${uid}-glass`"><rect x="-78" y="-88" width="156" height="176" rx="3" /></clipPath>
    </defs>
  </g>
</template>

<script>
// Module-level so every instance gets a unique SVG id prefix.
let artCounter = 0
</script>

<script setup>
import { computed } from 'vue'
import { FURNITURE, LIGHTING, shade } from './furnitureCatalog'

const props = defineProps({
  type: { type: String, required: true },
  color: { type: String, default: null },
  lighting: { type: Object, default: () => LIGHTING.day },
})

const WOOD = '#a8734a'
const WOOD_DARK = '#8c5c3a'
const uid = `art-${artCounter++}`

const def = computed(() => FURNITURE[props.type])
const c = computed(() => {
  const base = props.color || def.value.defaultColor
  return { base, dark: shade(base, -16), light: shade(base, 22), shadow: shade(base, -38) }
})

const STARS = [[-55, -70, 1.6], [-28, -32, 1.2], [10, -72, 1.4], [32, -24, 1.1], [62, 18, 1.5], [-58, 28, 1.2], [-10, 10, 1.1]]

// Books are generated from a fixed pattern so the shelf looks the same every time.
const BOARDS = [-198, -138, -78, -18]
const BOOK_COLORS = ['#e08f6f', '#6fa8a0', '#f1c65b', '#8c78d1', '#d96f8a', '#5f8fcf', '#9bbf7a']
const BOOK_SIZES = [[9, 38], [7, 44], [11, 34], [8, 48], [10, 40], [7, 36], [9, 46], [12, 32]]
const SHELF_ROWS = [{ base: -198, end: 68 }, { base: -138, end: 22 }, { base: -78, end: 26 }]
const BOOKS = SHELF_ROWS.flatMap((row, r) => {
  const books = []
  let x = -64
  for (let i = 0; x < row.end; i++) {
    const [w, h] = BOOK_SIZES[(i + r * 3) % BOOK_SIZES.length]
    books.push({ x, y: row.base - h, w, h, fill: BOOK_COLORS[(i + r * 2) % BOOK_COLORS.length] })
    x += w + 1.5
  }
  return books
})
</script>
