<template>
  <div class="game-tabs" :class="{ 'game-tabs--fill': fill }" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      type="button"
      role="tab"
      class="game-tab"
      :class="{ 'game-tab--active': tab.value === modelValue }"
      :aria-selected="tab.value === modelValue"
      @click="emit('update:modelValue', tab.value)"
    >
      <span v-if="tab.icon" class="game-tab-icon" aria-hidden="true">{{ tab.icon }}</span>
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  tabs: { type: Array, required: true }, // [{ value, label, icon? }]
  modelValue: { type: String, required: true },
  // Stretch the tabs to share the full width (for narrow side panels)
  fill: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
/* Chunky folder tabs sitting on a coloured bar */
.game-tabs { display: flex; align-items: flex-end; gap: 6px; border-bottom: 4px solid rgb(var(--v-theme-primary)); }
.game-tab {
  padding: 8px 16px 6px; border: 2px solid rgb(var(--v-theme-primary), 0.3); border-bottom: 0; border-radius: 14px 14px 0 0;
  background: rgb(var(--v-theme-primary), 0.12); color: rgb(var(--v-theme-primary)); cursor: pointer;
  font-size: 13px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap;
  transition: background-color 120ms ease, padding 120ms ease;
}
.game-tab:hover { background: rgb(var(--v-theme-primary), 0.22); }
.game-tab--active { padding-top: 12px; padding-bottom: 8px; background: rgb(var(--v-theme-primary)); border-color: rgb(var(--v-theme-primary)); color: #fff; }
.game-tab:focus-visible { outline: 2px solid rgb(var(--v-theme-primary)); outline-offset: 2px; }
.game-tabs--fill .game-tab { flex: 1 1 0; min-width: 0; padding-inline: 6px; font-size: 12px; letter-spacing: 0.03em; }
.game-tab-icon { margin-right: 4px; }
</style>
