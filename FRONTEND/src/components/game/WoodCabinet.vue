<template>
  <div class="cabinet" :style="{ '--columns': columns }">
    <div class="cabinet-top" />
    <div class="cabinet-frame">
      <!-- Brass tags hang under the cornice, like labels on the doors -->
      <div v-if="$slots.tags" class="cabinet-tags"><slot name="tags" /></div>
      <!-- The compartments: dark recesses separated by wooden dividers -->
      <div class="cabinet-body"><slot /></div>
      <!-- Drawer front with two brass knobs -->
      <div v-if="$slots.drawer" class="cabinet-drawer">
        <span class="knob" aria-hidden="true" />
        <div class="cabinet-drawer-content"><slot name="drawer" /></div>
        <span class="knob" aria-hidden="true" />
      </div>
    </div>
    <div class="cabinet-feet" aria-hidden="true"><span /><span /></div>
  </div>
</template>

<script setup>
defineProps({
  // Compartments per row
  columns: { type: Number, default: 5 },
})
</script>

<style scoped>
/* A free-standing wooden wardrobe: cornice, frame, compartments, drawer and feet */
.cabinet { --wood-light: #b27a43; --wood: #8f5d31; --wood-dark: #5a3820; min-width: 0; }
.cabinet-top { height: 14px; margin: 0 -8px; border-radius: 8px 8px 3px 3px; background: linear-gradient(#c58c52, var(--wood)); box-shadow: 0 3px 0 var(--wood-dark), inset 0 2px 0 rgb(255 255 255 / 25%); }
.cabinet-frame {
  padding: 10px;
  background: repeating-linear-gradient(90deg, rgb(0 0 0 / 5%) 0 2px, transparent 2px 9px), linear-gradient(180deg, #9c6738, var(--wood) 40%, #7d4f29);
  box-shadow: inset 0 0 0 2px rgb(0 0 0 / 18%), inset 4px 0 8px rgb(0 0 0 / 22%), inset -4px 0 8px rgb(0 0 0 / 22%);
}
.cabinet-tags { display: flex; gap: 7px; overflow-x: auto; padding: 4px 2px 11px; scrollbar-width: thin; }
.cabinet-body { display: grid; grid-template-columns: repeat(var(--columns), minmax(0, 1fr)); gap: 6px; padding: 6px; background: var(--wood-dark); border-radius: 4px; box-shadow: inset 0 3px 6px rgb(0 0 0 / 45%); }
@media (max-width: 600px) { .cabinet-body { grid-template-columns: repeat(3, minmax(0, 1fr)); } }

.cabinet-drawer {
  display: flex; align-items: center; gap: 10px; margin-top: 10px; padding: 8px 12px; border-radius: 4px; color: #fbe9c8;
  background: linear-gradient(#a8703d, var(--wood)); box-shadow: inset 0 2px 0 rgb(255 255 255 / 20%), inset 0 -3px 0 rgb(0 0 0 / 28%), 0 2px 0 var(--wood-dark);
}
.cabinet-drawer-content { flex: 1; min-width: 0; }
.knob { flex: 0 0 auto; width: 15px; height: 15px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff1b8, #c9a24a 60%, #8a6b1f); box-shadow: 0 2px 2px rgb(0 0 0 / 45%); }

.cabinet-feet { display: flex; justify-content: space-between; padding: 0 20px; }
.cabinet-feet span { width: 36px; height: 12px; border-radius: 0 0 8px 8px; background: linear-gradient(var(--wood), var(--wood-dark)); }
</style>
