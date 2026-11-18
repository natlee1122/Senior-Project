<template>
  <section class="room" aria-label="Your room">
    <svg class="room__svg" viewBox="0 0 960 540" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient :id="id('sky')" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" :stop-color="palette.skyTop" />
          <stop offset="1" :stop-color="palette.skyBottom" />
        </linearGradient>
        <linearGradient :id="id('ceiling')" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#1f2a2a" stop-opacity=".16" />
          <stop offset="1" stop-color="#1f2a2a" stop-opacity="0" />
        </linearGradient>
        <linearGradient :id="id('beam')" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" :stop-color="palette.beam" stop-opacity=".55" />
          <stop offset="1" :stop-color="palette.beam" stop-opacity="0" />
        </linearGradient>
        <filter :id="id('soft')" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="6" /></filter>
        <clipPath :id="id('glass')"><rect x="262" y="107" width="156" height="176" rx="3" /></clipPath>
      </defs>

      <!-- Walls and floor -->
      <rect width="960" height="380" fill="#e6efe3" />
      <rect y="292" width="960" height="90" fill="#d6e3d2" />
      <rect y="288" width="960" height="6" fill="#f7f3ea" />
      <rect width="960" height="120" :fill="url('ceiling')" />
      <rect y="380" width="960" height="160" fill="#c99a6b" />
      <path :d="FLOOR_PATH" fill="none" stroke="#a9794c" stroke-width="2" opacity=".55" />
      <rect y="372" width="960" height="14" fill="#f7f3ea" />
      <rect y="384" width="960" height="3" fill="#1f2a2a" opacity=".12" />

      <!-- Window -->
      <g>
        <rect x="250" y="95" width="180" height="200" rx="6" fill="#a8734a" />
        <g :clip-path="url('glass')">
          <rect x="262" y="107" width="156" height="176" :fill="url('sky')" />
          <template v-if="palette.stars">
            <circle v-for="(s, i) in STARS" :key="`star${i}`" :cx="s[0]" :cy="s[1]" :r="s[2]" fill="#fff" opacity=".85" />
          </template>
          <path v-if="palette.moon" :d="MOON_PATH" fill="#fdf6d8" />
          <circle v-else :cx="palette.sunX" :cy="palette.sunY" r="20" :fill="palette.sunColor" />
          <template v-if="!palette.stars">
            <ellipse cx="300" cy="150" rx="26" ry="8" fill="#fff" opacity=".8" />
            <ellipse cx="318" cy="143" rx="16" ry="7" fill="#fff" opacity=".8" />
          </template>
          <path d="M262 250 Q300 222 340 244 T418 236 V283 H262Z" :fill="palette.hills" />
          <path d="M262 268 Q310 250 360 266 T418 262 V283 H262Z" :fill="palette.hillsFront" />
        </g>
        <rect x="337" y="107" width="6" height="176" fill="#a8734a" />
        <rect x="262" y="192" width="156" height="6" fill="#a8734a" />
        <rect x="240" y="293" width="200" height="14" rx="4" fill="#8c5c3a" />
        <!-- Curtains and rod -->
        <path d="M232 92 L284 92 Q276 200 288 300 L232 300Z" fill="#f2c6a0" />
        <path d="M428 92 L396 92 Q404 200 392 300 L448 300Z" fill="#f2c6a0" />
        <path d="M250 96 Q246 200 252 296 M266 96 Q262 200 270 296 M412 96 Q416 200 410 296 M430 96 Q432 200 428 296" fill="none" stroke="#d9a47c" stroke-width="2" opacity=".7" />
        <rect x="222" y="86" width="236" height="6" rx="3" fill="#8c5c3a" />
        <circle cx="222" cy="89" r="6" fill="#8c5c3a" />
        <circle cx="458" cy="89" r="6" fill="#8c5c3a" />
      </g>
      <!-- Light from the window falls onto the floor -->
      <path d="M262 392 L418 392 L590 528 L360 528Z" :fill="url('beam')" :opacity="palette.beamOpacity" />

      <!-- Bookshelf -->
      <g>
        <rect x="40" y="120" width="160" height="266" rx="4" fill="#a8734a" />
        <rect x="50" y="128" width="140" height="244" fill="#7a4f31" />
        <rect v-for="y in SHELF_BOARDS" :key="`board${y}`" x="48" :y="y" width="144" height="10" fill="#b98558" />
        <rect v-for="(b, i) in BOOKS" :key="`book${i}`" :x="b.x" :y="b.y" :width="b.w" :height="b.h" rx="1.5" :fill="b.fill" />
        <rect v-for="(b, i) in BOOKS" :key="`spine${i}`" :x="b.x + 2" :y="b.y + 6" :width="Math.max(b.w - 4, 2)" height="2" fill="#fff" opacity=".45" />
        <!-- Plant, camera and baskets -->
        <path d="M150 234 Q140 214 148 200 Q158 214 156 234Z M158 234 Q170 212 182 206 Q176 226 164 234Z" fill="#5f9f6b" />
        <rect x="148" y="232" width="30" height="16" rx="3" fill="#d98b5f" />
        <rect x="150" y="284" width="30" height="24" rx="4" fill="#4b5563" />
        <circle cx="165" cy="297" r="7" fill="#9aa5b1" />
        <circle cx="165" cy="297" r="3.5" fill="#3b4350" />
        <rect x="58" y="334" width="56" height="34" rx="5" fill="#c9a36b" />
        <rect x="122" y="334" width="60" height="34" rx="5" fill="#b88c55" />
        <path d="M58 346 H114 M122 346 H182" stroke="#a77a49" stroke-width="2" />
      </g>

      <!-- Wall frames -->
      <g>
        <rect x="712" y="112" width="92" height="112" rx="4" fill="#8c5c3a" />
        <rect x="720" y="120" width="76" height="96" fill="#cfe8ee" />
        <circle cx="770" cy="148" r="11" fill="#ffe5a1" />
        <path d="M720 216 L720 184 L746 160 L762 178 L778 150 L796 180 L796 216Z" fill="#689a91" />
        <rect x="820" y="132" width="76" height="76" rx="4" fill="#8c5c3a" />
        <rect x="828" y="140" width="60" height="60" fill="#fdf1d0" />
        <circle cx="858" cy="170" r="14" fill="#f1c65b" />
        <path d="M858 146 V152 M858 188 V194 M834 170 H840 M876 170 H882 M841 153 L845 157 M871 183 L875 187 M875 153 L871 157 M845 183 L841 187" stroke="#f1c65b" stroke-width="3" stroke-linecap="round" />
      </g>

      <!-- Floor lamp -->
      <g>
        <ellipse cx="648" cy="394" rx="26" ry="6" fill="#1f2a2a" opacity=".18" />
        <rect x="644" y="228" width="8" height="164" rx="3" fill="#8c5c3a" />
        <ellipse cx="648" cy="392" rx="20" ry="5" fill="#6f4a2f" />
        <path d="M618 176 L678 176 L666 232 L630 232Z" fill="#fff3d0" stroke="#e9d49b" stroke-width="2" stroke-linejoin="round" />
      </g>

      <!-- Sofa -->
      <g>
        <ellipse cx="800" cy="394" rx="124" ry="9" fill="#1f2a2a" opacity=".16" />
        <rect x="702" y="372" width="12" height="20" rx="3" fill="#6f4a2f" />
        <rect x="886" y="372" width="12" height="20" rx="3" fill="#6f4a2f" />
        <rect x="706" y="262" width="188" height="86" rx="24" fill="#c9735a" />
        <rect x="690" y="318" width="220" height="58" rx="16" fill="#e08f6f" />
        <rect x="684" y="288" width="34" height="90" rx="16" fill="#d57f61" />
        <rect x="882" y="288" width="34" height="90" rx="16" fill="#d57f61" />
        <rect x="730" y="282" width="62" height="48" rx="14" fill="#f1c65b" />
        <rect x="806" y="286" width="62" height="44" rx="14" fill="#6fa8a0" />
        <path d="M722 346 H878" stroke="#c9735a" stroke-width="2" opacity=".7" />
      </g>

      <!-- Floor plant -->
      <g>
        <ellipse cx="228" cy="396" rx="26" ry="6" fill="#1f2a2a" opacity=".16" />
        <path d="M228 348 Q204 322 212 296 Q226 320 228 348Z M228 348 Q238 312 258 300 Q256 330 228 348Z M228 352 Q222 318 232 290 Q244 322 228 352Z" fill="#5f9f6b" />
        <path d="M206 350 H250 L244 394 H212Z" fill="#d98b5f" />
        <rect x="204" y="344" width="48" height="10" rx="3" fill="#c97a4f" />
      </g>

      <!-- Rug the character stands on -->
      <ellipse cx="480" cy="462" rx="236" ry="50" fill="#7fb7aa" />
      <ellipse cx="480" cy="462" rx="212" ry="40" fill="#9ccbc0" />
      <ellipse cx="480" cy="462" rx="196" ry="35" fill="none" stroke="#fdf1d0" stroke-width="3" stroke-dasharray="10 8" opacity=".85" />
    </svg>

    <!-- The character; sized and placed so the feet land on the rug -->
    <div class="room__actor"><slot /></div>

    <!-- Lighting layers sit above the character so everything shares one light -->
    <div class="room__tint" :style="{ backgroundColor: palette.tint, opacity: palette.tintOpacity }" />
    <div class="room__lamp-glow" :style="{ opacity: palette.glow }" />
    <div class="room__vignette" />
  </section>
</template>

<script>
// Module-level so every RoomScene instance gets a unique SVG id prefix.
let roomCounter = 0
</script>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  theme: { type: String, default: 'day' },
})

const THEMES = {
  day: { skyTop: '#9ed7e8', skyBottom: '#dff3f5', sunX: 385, sunY: 150, sunColor: '#ffe5a1', hills: '#8fc29a', hillsFront: '#74ad82', beam: '#fff3c4', beamOpacity: 0.55, tint: '#ffffff', tintOpacity: 0, glow: 0 },
  sunset: { skyTop: '#f09a73', skyBottom: '#ffd9a0', sunX: 330, sunY: 236, sunColor: '#fff0c2', hills: '#b38a7a', hillsFront: '#8f6f6b', beam: '#ffb978', beamOpacity: 0.7, tint: '#ffb27a', tintOpacity: 0.3, glow: 0.2 },
  night: { skyTop: '#1f2a55', skyBottom: '#4a5a96', stars: true, moon: true, hills: '#34406f', hillsFront: '#2a3560', beam: '#a9b9ff', beamOpacity: 0.3, tint: '#3b4a96', tintOpacity: 0.5, glow: 0.65 },
}
const palette = computed(() => THEMES[props.theme] ?? THEMES.day)

// SVG ids are document-global, so each instance gets its own prefix.
const uid = `room-${roomCounter++}`
const id = (name) => `${uid}-${name}`
const url = (name) => `url(#${id(name)})`

const STARS = [[285, 130, 1.6], [312, 168, 1.2], [350, 128, 1.4], [372, 176, 1.1], [402, 214, 1.5], [282, 222, 1.2], [330, 205, 1.1]]
const MOON_PATH = 'M385 132 A18 18 0 0 0 385 168 A22 22 0 0 1 385 132Z'

// Floor planks: seams get further apart toward the viewer for a hint of depth.
const FLOOR_ROWS = [412, 448, 488, 530]
const FLOOR_PATH = FLOOR_ROWS.map((y, i) => {
  const top = i === 0 ? 380 : FLOOR_ROWS[i - 1]
  const step = 130 + i * 20
  let seams = ''
  for (let x = i % 2 ? step / 2 : step; x < 960; x += step) seams += `M${x} ${top} V${y} `
  return `M0 ${y} H960 ${seams}`
}).join(' ')

// Books are generated from a fixed pattern so the shelf looks the same on every render.
const SHELF_BOARDS = [188, 248, 308, 368]
const BOOK_COLORS = ['#e08f6f', '#6fa8a0', '#f1c65b', '#8c78d1', '#d96f8a', '#5f8fcf', '#9bbf7a']
const BOOK_SIZES = [[9, 38], [7, 44], [11, 34], [8, 48], [10, 40], [7, 36], [9, 46], [12, 32]]
const SHELF_ROWS = [{ base: 188, end: 188 }, { base: 248, end: 142 }, { base: 308, end: 146 }]
const BOOKS = SHELF_ROWS.flatMap((row, r) => {
  const books = []
  let x = 56
  for (let i = 0; x < row.end; i++) {
    const [w, h] = BOOK_SIZES[(i + r * 3) % BOOK_SIZES.length]
    books.push({ x, y: row.base - h, w, h, fill: BOOK_COLORS[(i + r * 2) % BOOK_COLORS.length] })
    x += w + 1.5
  }
  return books
})
</script>

<style scoped>
.room { position: relative; aspect-ratio: 16 / 9; overflow: hidden; isolation: isolate; background: #e6efe3; }
.room__svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; }

/*
 * The avatar canvas is 240 x 330 and its feet touch the ground at y = 292, so
 * the feet sit 11.5% of the avatar height above its bottom edge. --feet-y is
 * where the feet should land inside the room, measured from the room bottom.
 */
.room__actor {
  --actor-height: 64%;
  --feet-y: 15.7%;
  position: absolute;
  left: 50%;
  bottom: calc(var(--feet-y) - var(--actor-height) * 0.115);
  height: var(--actor-height);
  aspect-ratio: 240 / 330;
  transform: translateX(-50%);
  transform-origin: 50% 100%;
}

.room__tint, .room__lamp-glow, .room__vignette { position: absolute; inset: 0; pointer-events: none; }
.room__tint { mix-blend-mode: multiply; transition: background-color 400ms ease, opacity 400ms ease; }
.room__lamp-glow {
  background: radial-gradient(circle at 67.5% 36%, rgb(255 214 140 / 90%) 0, rgb(255 214 140 / 0%) 24%);
  mix-blend-mode: screen;
  transition: opacity 400ms ease;
}
.room__vignette { background: radial-gradient(ellipse at 50% 55%, transparent 55%, rgb(20 25 30 / 14%) 100%); }

@media (prefers-reduced-motion: no-preference) {
  .room__actor { animation: breathe 4.2s ease-in-out infinite; }
}
@keyframes breathe {
  50% { transform: translateX(-50%) scaleY(1.008); }
}
</style>
