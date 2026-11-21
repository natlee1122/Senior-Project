<template>
  <div class="category-bar" role="radiogroup" :aria-label="label">
    <button
      v-if="allowAll"
      type="button"
      role="radio"
      class="cat"
      :class="{ 'cat--active': modelValue === null }"
      :aria-checked="modelValue === null"
      @click="emit('update:modelValue', null)"
    >
      <span class="cat-icon">✨</span>
      <span class="cat-label">All</span>
    </button>
    <button
      v-for="category in categories"
      :key="category.id"
      type="button"
      role="radio"
      class="cat"
      :class="{ 'cat--active': modelValue === category.id }"
      :aria-checked="modelValue === category.id"
      @click="emit('update:modelValue', category.id)"
    >
      <span class="cat-icon">{{ category.icon }}</span>
      <span class="cat-label">{{ category.label }}</span>
      <span v-if="category.badge" class="cat-dot" aria-label="New items" />
      <span v-if="category.count !== undefined" class="cat-count">{{ category.count }}</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  categories: { type: Array, required: true }, // [{ id, label, icon, count?, badge? }]
  modelValue: { type: String, default: null }, // selected id, or null for "All"
  allowAll: { type: Boolean, default: true },
  label: { type: String, default: 'Category' },
})
const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
/* One scrollable row of icon buttons, like the category strip of a dress-up game */
.category-bar { max-width: 100%; display: flex; gap: 8px; overflow-x: auto; padding: 8px 4px 12px; scroll-snap-type: x proximity; scrollbar-width: thin; }
.cat {
  position: relative; flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; gap: 1px; width: 64px; padding: 6px 2px 5px;
  border: 2px solid rgb(var(--v-theme-on-surface), 0.1); border-radius: 16px; background: rgb(var(--v-theme-surface)); cursor: pointer;
  box-shadow: 0 3px 0 rgb(var(--v-theme-on-surface), 0.08); scroll-snap-align: start;
  transition: transform 120ms ease, border-color 120ms ease, background-color 120ms ease;
}
.cat:hover { transform: translateY(-1px); }
.cat--active { border-color: rgb(var(--v-theme-primary)); background: rgb(var(--v-theme-primary), 0.14); box-shadow: 0 3px 0 rgb(var(--v-theme-primary), 0.4); transform: translateY(-2px); }
.cat:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }
.cat-icon { font-size: 26px; line-height: 1.25; }
.cat-label { font-size: 10px; font-weight: 700; line-height: 1.2; text-align: center; }
.cat-count { position: absolute; top: 2px; right: 4px; min-width: 16px; padding: 0 4px; border-radius: 8px; font-size: 10px; font-weight: 700; line-height: 16px; background: rgb(var(--v-theme-on-surface), 0.08); color: rgb(var(--v-theme-on-surface), 0.7); }
.cat-dot { position: absolute; top: 4px; left: 6px; width: 10px; height: 10px; border: 2px solid #fff; border-radius: 50%; background: #ef476f; }
</style>
