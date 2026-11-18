<template>
  <svg class="avatar-figure" :viewBox="VIEW_BOX" role="img" :aria-label="ariaLabel">
    <defs>
      <linearGradient v-for="g in GRADIENTS" :id="id(g.name)" :key="g.name" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" :stop-color="g.from" />
        <stop offset="1" :stop-color="g.to" />
      </linearGradient>
      <!-- Darkens the outer edges of garments so they read as rounded -->
      <linearGradient :id="id('edge')" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#1f1a2e" stop-opacity=".1" />
        <stop offset=".25" stop-color="#1f1a2e" stop-opacity="0" />
        <stop offset=".72" stop-color="#1f1a2e" stop-opacity="0" />
        <stop offset="1" stop-color="#1f1a2e" stop-opacity=".22" />
      </linearGradient>
      <filter :id="id('soft')" x="-40%" y="-40%" width="180%" height="180%">
        <feGaussianBlur stdDeviation="2.4" />
      </filter>
      <clipPath :id="id('head')"><path :d="fig.head.path" /></clipPath>
      <clipPath :id="id('neck')"><path :d="fig.neck" /></clipPath>
      <clipPath :id="id('torso')"><path :d="fig.torso" /></clipPath>
      <clipPath :id="id('legs')"><path v-for="leg in fig.legs" :key="leg.side" :d="leg.path" /></clipPath>
      <clipPath v-for="arm in fig.arms" :id="id(`arm${arm.side}`)" :key="arm.side"><path :d="arm.skin" /></clipPath>
    </defs>

    <ellipse v-bind="fig.ground" fill="#22312a" opacity=".16" :filter="url('soft')" />

    <!-- Fox companion sits on the ground beside the avatar -->
    <g v-if="fig.pet" :transform="fig.pet.transform">
      <ellipse cx="18" cy="59" rx="20" ry="3.5" fill="#22312a" opacity=".15" :filter="url('soft')" />
      <path d="M31 50 Q47 52 45 36" fill="none" stroke="#d97935" stroke-width="9" stroke-linecap="round" />
      <circle cx="45" cy="36" r="4.6" fill="#fff0d9" />
      <ellipse cx="18" cy="48" rx="14" ry="10" fill="#e9853d" />
      <ellipse cx="18" cy="51" rx="7" ry="7" fill="#fff0d9" />
      <ellipse cx="11" cy="57" rx="5" ry="3" fill="#6b3b22" />
      <ellipse cx="25" cy="57" rx="5" ry="3" fill="#6b3b22" />
      <path d="M7 16 L3 0 L16 8 L28 0 L27 17" fill="#d97935" stroke="#a95728" stroke-width="1.5" stroke-linejoin="round" />
      <ellipse cx="17" cy="24" rx="17" ry="19" fill="#e9853d" />
      <path d="M5 25 Q17 15 29 25 L25 37 L17 42 L8 36Z" fill="#fff0d9" />
      <circle cx="11" cy="22" r="2" fill="#3e3029" />
      <circle cx="23" cy="22" r="2" fill="#3e3029" />
      <path d="M15 28 L19 28 L17 31Z" fill="#4b3029" />
    </g>

    <!-- Backpack body sits behind the torso -->
    <g v-if="fig.backpack">
      <path :d="fig.backpack.body" :fill="url('bag')" stroke="#a72d66" stroke-width="2" stroke-linejoin="round" />
      <path :d="fig.backpack.seams" fill="none" stroke="#ffd66f" stroke-width="1.6" stroke-dasharray="3 3" opacity=".75" />
    </g>

    <path v-if="fig.hair.back" :d="fig.hair.back" :fill="HAIR" />
    <path v-if="fig.details" :d="fig.details.hood" :fill="url('hoodieDark')" stroke="#b88c55" stroke-width="1.5" stroke-linejoin="round" />

    <g :clip-path="url('neck')">
      <path :d="fig.neck" :fill="url('skin')" />
      <ellipse v-bind="fig.neckShadow" fill="#8a4a3c" opacity=".3" :filter="url('soft')" />
    </g>

    <g v-for="shoe in fig.shoes" :key="`shoe${shoe.side}`">
      <path :d="shoe.body" :fill="fig.sneakers ? '#8f70d8' : '#51446e'" :stroke="fig.sneakers ? '#6c51b5' : 'none'" stroke-width="1.5" stroke-linejoin="round" />
      <template v-if="fig.sneakers">
        <path :d="shoe.sole" fill="none" stroke="#f7f0ff" stroke-width="4.5" stroke-linecap="round" />
        <path :d="shoe.laces" fill="none" stroke="#e6dcff" stroke-width="2" stroke-linecap="round" />
      </template>
    </g>

    <path v-for="leg in fig.legs" :key="`leg${leg.side}`" :d="leg.path" :fill="url('pants')" />
    <!-- The hem casts a soft shadow onto the trousers -->
    <g :clip-path="url('legs')">
      <ellipse v-bind="fig.hemShadow" fill="#1f1a2e" opacity=".3" :filter="url('soft')" />
    </g>

    <g>
      <path :d="fig.torso" :fill="url(fig.details ? 'hoodie' : 'tee')" :stroke="fig.details ? '#b88c55' : 'rgb(60 40 110 / 35%)'" stroke-width="1.5" stroke-linejoin="round" />
      <g :clip-path="url('torso')">
        <template v-if="fig.details">
          <path :d="fig.details.placket" fill="#f0d3a0" />
          <path :d="fig.details.zipper" stroke="#b88c55" stroke-width="2" />
          <circle v-bind="fig.details.pull" r="2" fill="#a77a49" />
          <path v-for="(d, i) in fig.details.strings" :key="`string${i}`" :d="d" stroke="#f5e8cc" stroke-width="2" stroke-linecap="round" />
          <path v-for="(d, i) in fig.details.pockets" :key="`pocket${i}`" :d="d" stroke="#b88c55" stroke-width="1.6" stroke-linecap="round" opacity=".8" />
          <rect x="0" width="240" :y="fig.details.hem.y" :height="fig.details.hem.height" fill="#c99e63" />
        </template>
        <path :d="fig.torso" :fill="url('edge')" />
        <!-- Arms cast a soft shadow onto the garment -->
        <path v-for="arm in fig.arms" :key="`armShadow${arm.side}`" :d="arm.skin" fill="#1f1a2e" opacity=".16" :filter="url('soft')" :transform="`translate(${-arm.side * 3} 2)`" />
      </g>
      <path :d="fig.neckline" fill="none" :stroke="fig.details ? '#c99e63' : '#5b4a9a'" :stroke-width="fig.details ? 6 : 3" stroke-linecap="round" />
    </g>

    <g v-if="fig.backpack" fill="none" stroke-linecap="round">
      <path v-for="(d, i) in fig.backpack.straps" :key="`strap${i}`" :d="d" stroke="#a72d66" stroke-width="5" />
      <path v-for="(d, i) in fig.backpack.straps" :key="`strapShine${i}`" :d="d" stroke="#e0558a" stroke-width="1.6" />
    </g>

    <g v-for="arm in fig.arms" :key="`arm${arm.side}`">
      <path :d="arm.skin" :fill="url('skin')" />
      <circle v-bind="arm.hand" :fill="url('skin')" />
      <!-- Sleeve shadow on the skin underneath -->
      <g :clip-path="url(`arm${arm.side}`)">
        <path :d="arm.sleeve" fill="#1f1a2e" opacity=".25" :filter="url('soft')" transform="translate(0 3)" />
      </g>
      <path :d="arm.sleeve" :fill="url(fig.details ? 'hoodie' : 'tee')" :stroke="fig.details ? '#b88c55' : 'rgb(60 40 110 / 35%)'" stroke-width="1.2" stroke-linejoin="round" />
      <path v-if="arm.cuff" :d="arm.cuff" fill="#c99e63" stroke="#b88c55" stroke-width="1" />
    </g>

    <ellipse v-for="ear in fig.head.ears" :key="`ear${ear.cx}`" v-bind="ear" fill="#e5a58a" />
    <path :d="fig.head.path" :fill="url('skin')" />

    <g class="face">
      <ellipse v-for="(b, i) in fig.face.blush" :key="`blush${i}`" :cx="b.cx" :cy="b.cy" rx="5" ry="3.2" fill="#e57f84" opacity=".22" />
      <template v-for="(eye, i) in fig.face.eyes" :key="`eye${i}`">
        <ellipse v-bind="eye" fill="#382b2b" />
        <circle :cx="eye.cx + 1" :cy="eye.cy - 1" r="1" fill="#fff" />
      </template>
      <path v-for="(d, i) in fig.face.brows" :key="`brow${i}`" :d="d" fill="none" :stroke="HAIR" :stroke-width="fig.face.browWidth" stroke-linecap="round" />
      <path v-for="(d, i) in fig.face.lashes" :key="`lash${i}`" :d="d" fill="none" stroke="#382b2b" stroke-width="1.6" stroke-linecap="round" />
      <path :d="fig.face.nose" fill="none" stroke="#cf8e74" stroke-width="1.5" stroke-linecap="round" />
      <path :d="fig.face.mouth" fill="none" stroke="#a64e58" stroke-width="2.5" stroke-linecap="round" />
    </g>

    <!-- The cap shades the forehead -->
    <g v-if="fig.cap" :clip-path="url('head')">
      <ellipse :cx="120" :cy="fig.cap.edge + 9" :rx="fig.cap.halfWidth" ry="9" fill="#4a2f2f" opacity=".3" :filter="url('soft')" />
    </g>

    <path :d="fig.hair.front" :fill="HAIR" />

    <g v-if="fig.cap">
      <path :d="fig.cap.dome" :fill="url('cap')" />
      <path :d="fig.cap.seams" fill="none" stroke="#a9c2ff" stroke-width="1.6" stroke-linecap="round" opacity=".7" />
      <circle v-bind="fig.cap.button" r="2.4" fill="#4268d9" />
      <path :d="fig.cap.brim" fill="#4964c7" stroke="#3a52a8" stroke-width="1" stroke-linejoin="round" />
    </g>

    <g v-if="fig.headphones">
      <path :d="fig.headphones.band" fill="none" stroke="#77788d" stroke-width="6" stroke-linecap="round" />
      <path :d="fig.headphones.band" fill="none" stroke="#d9d8e5" stroke-width="2.4" stroke-linecap="round" transform="translate(0 -.8)" />
      <g v-for="cup in fig.headphones.cups" :key="cup.x">
        <rect :x="cup.x" :y="cup.y" :width="cup.w" :height="cup.h" rx="5.5" fill="#8c8ba0" />
        <rect :x="cup.x + 2.5" :y="cup.y + 4" :width="cup.w - 5" :height="cup.h - 8" rx="3" fill="#c8c7d4" />
      </g>
    </g>
  </svg>
</template>

<script setup>
import { computed } from 'vue'
import { VIEW_BOX } from './avatarBodies'
import { buildFigure, nextUid } from './avatarGeometry'

const props = defineProps({
  bodyType: { type: String, default: 'neutral' },
  // Equipped items keyed by slot (hat, clothing, headphones, pet, shoes, backpack)
  equipped: { type: Object, default: () => ({}) },
})

const HAIR = '#49352f'
const GRADIENTS = [
  { name: 'skin', from: '#f5c6a8', to: '#d99578' },
  { name: 'tee', from: '#8c78d1', to: '#6652a9' },
  { name: 'hoodie', from: '#e0bb85', to: '#cfa56b' },
  { name: 'hoodieDark', from: '#cfa56b', to: '#b88c55' },
  { name: 'pants', from: '#837e98', to: '#6b667e' },
  { name: 'cap', from: '#7da7ff', to: '#4268d9' },
  { name: 'bag', from: '#ff8aab', to: '#d93673' },
]

// SVG ids are document-global, so each instance gets its own prefix.
const uid = nextUid()
const id = (name) => `${uid}-${name}`
const url = (name) => `url(#${id(name)})`

const worn = computed(() => Object.fromEntries(Object.entries(props.equipped).map(([slot, item]) => [slot, Boolean(item)])))
const fig = computed(() => buildFigure(props.bodyType, worn.value))

const ariaLabel = computed(() => {
  const parts = [`${props.bodyType} avatar`]
  if (worn.value.hat) parts.push('wearing a cap')
  if (worn.value.headphones) parts.push('with headphones')
  if (worn.value.clothing) parts.push('wearing a hoodie')
  if (worn.value.shoes) parts.push('wearing sneakers')
  if (worn.value.backpack) parts.push('with a backpack')
  if (worn.value.pet) parts.push('next to a fox')
  return parts.join(', ')
})
</script>

<style scoped>
.avatar-figure { width: min(100%, 300px); height: 100%; overflow: visible; }
@media (max-width: 600px) {
  .avatar-figure { width: min(100%, 280px); }
}
</style>
