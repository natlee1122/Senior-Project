<template>
  <g>
    <defs>
      <linearGradient v-for="hex in gradients" :id="`${uid}-g${hex.slice(1)}`" :key="hex" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" :stop-color="gradientStops(hex)[0]" />
        <stop offset="1" :stop-color="gradientStops(hex)[1]" />
      </linearGradient>
      <!-- Darkens the outer edges of garments so they read as rounded -->
      <linearGradient :id="`${uid}-edge`" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#1f1a2e" stop-opacity=".1" />
        <stop offset=".25" stop-color="#1f1a2e" stop-opacity="0" />
        <stop offset=".72" stop-color="#1f1a2e" stop-opacity="0" />
        <stop offset="1" stop-color="#1f1a2e" stop-opacity=".22" />
      </linearGradient>
      <filter :id="`${uid}-soft`" filterUnits="userSpaceOnUse" x="-80" y="-80" width="420" height="520">
        <feGaussianBlur stdDeviation="2.4" />
      </filter>
      <clipPath v-for="(paths, name) in clips" :id="`${uid}-clip-${name}`" :key="name">
        <path v-for="(d, i) in paths" :key="i" :d="d" />
      </clipPath>
    </defs>
    <g v-for="layer in rendered" :key="layer.key" :clip-path="layer.clipPath" :transform="layer.tf">
      <component :is="shape.tag" v-for="(shape, i) in layer.shapes" :key="i" v-bind="shape.attrs" />
    </g>
  </g>
</template>

<script setup>
import { computed } from 'vue'
import { gradientColors, gradientStops, toElement } from './shapes'

const props = defineProps({
  layers: { type: Array, required: true },
  clips: { type: Object, default: () => ({}) },
  uid: { type: String, required: true },
})

const gradients = computed(() => gradientColors(props.layers))
const rendered = computed(() => props.layers.map((layer) => ({
  key: layer.key,
  tf: layer.tf,
  clipPath: layer.clip ? `url(#${props.uid}-clip-${layer.clip})` : undefined,
  shapes: layer.shapes.map((shape) => toElement(shape, props.uid)),
})))
</script>
