<template>
  <div class="swatches" role="radiogroup" :aria-label="label">
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="radio"
      class="swatch"
      :class="{ 'swatch--active': option.value === modelValue }"
      :style="{ backgroundColor: option.color }"
      :aria-checked="option.value === modelValue"
      :aria-label="option.label"
      :title="option.label"
      @click="emit('update:modelValue', option.value)"
    />
  </div>
</template>

<script setup>
defineProps({
  options: { type: Array, required: true }, // [{ value, label, color }]
  modelValue: { type: String, default: null },
  label: { type: String, default: 'Colour' },
})
const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
.swatches { display: flex; flex-wrap: wrap; gap: 10px; }
.swatch { width: 30px; height: 30px; border-radius: 50%; border: 2px solid rgb(0 0 0 / 12%); cursor: pointer; transition: transform 120ms ease; }
.swatch:hover { transform: scale(1.08); }
.swatch--active { box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgb(var(--v-theme-primary)); }
.swatch:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 3px; }
</style>
