<template>
  <div class="brass-tags" role="radiogroup" :aria-label="label">
    <button
      v-if="allowAll"
      type="button"
      role="radio"
      class="tag"
      :class="{ 'tag--active': modelValue === null }"
      :aria-checked="modelValue === null"
      @click="emit('update:modelValue', null)"
    >
      <span class="tag-icon">✨</span>
      <span class="tag-label">All</span>
    </button>
    <button
      v-for="category in categories"
      :key="category.id"
      type="button"
      role="radio"
      class="tag"
      :class="{ 'tag--active': modelValue === category.id }"
      :aria-checked="modelValue === category.id"
      @click="emit('update:modelValue', category.id)"
    >
      <span class="tag-icon">{{ category.icon }}</span>
      <span class="tag-label">{{ category.label }}</span>
      <span v-if="category.count !== undefined" class="tag-count">{{ category.count }}</span>
      <span v-if="category.badge" class="tag-dot" aria-label="New items" />
    </button>
  </div>
</template>

<script setup>
defineProps({
  categories: { type: Array, required: true }, // [{ id, label, icon, count?, badge? }]
  modelValue: { type: String, default: null }, // selected id, or null for "All"
  allowAll: { type: Boolean, default: false },
  label: { type: String, default: 'Section' },
})
const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
/* Brass name plates, meant to sit on the wooden frame of a cabinet */
.brass-tags { display: flex; gap: 8px; overflow-x: auto; max-width: 100%; padding: 2px 2px 10px; scrollbar-width: thin; }
.tag {
  position: relative; flex: 0 0 auto; display: flex; flex-direction: column; align-items: center; gap: 1px; width: 58px; padding: 4px 2px 3px;
  border: 2px solid #8a6b1f; border-radius: 8px; background: linear-gradient(#f1d98a, #c9a24a); color: #4a2f12; cursor: pointer;
  box-shadow: 0 3px 0 #7a5a18; transition: transform 120ms ease;
}
.tag:focus-visible { outline: 2px solid #fff3c4; outline-offset: 2px; }
.tag--active { background: linear-gradient(#ffeaa6, #f1c65b); box-shadow: 0 1px 0 #7a5a18, 0 0 0 2px #fff3c4; transform: translateY(2px); }
.tag-icon { font-size: 20px; line-height: 1.2; }
.tag-label { font-size: 9px; font-weight: 800; line-height: 1.15; text-align: center; }
.tag-count { position: absolute; top: 2px; right: 3px; min-width: 14px; padding: 0 4px; border-radius: 7px; background: #5a3820; color: #fbe9c8; font-size: 9px; font-weight: 700; line-height: 14px; }
.tag-dot { position: absolute; top: 3px; left: 4px; width: 8px; height: 8px; border: 2px solid #fff; border-radius: 50%; background: #ef476f; }
</style>
