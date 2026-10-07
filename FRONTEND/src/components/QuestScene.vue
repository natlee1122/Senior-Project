<!-- Picture for tasks -->
<template>
  <v-sheet :class="['scene', theme]" color="transparent" rounded="0">
    <div class="sun" />
    <div class="mountain" />
    <div class="hill" />
  </v-sheet>
</template>

<script setup>
defineProps({ theme: { type: String, default: 'forest' } })
</script>

<style scoped>
.scene { position: relative; overflow: hidden; }
.forest { background: linear-gradient(#9ed5e5 0 43%, #6fb18a 43% 68%, #477e5f 68%); }
.desk { background: linear-gradient(135deg, #e7dcc7, #a5c8c0); }
.camera { background: linear-gradient(#9ccfe0 0 48%, #a9cf91 48% 100%); }
.sun { position: absolute; right: 27px; top: 22px; width: 54px; height: 54px; border-radius: 50%; background: #ffe7a4; box-shadow: 0 0 35px rgba(255, 231, 164, .8); }
.mountain { position: absolute; bottom: 38px; left: 15%; width: 70%; height: 72px; background: #7ca89b; clip-path: polygon(0 100%, 34% 20%, 52% 57%, 68% 0, 100% 100%); }
.hill { position: absolute; bottom: -1px; left: -10%; width: 125%; height: 62px; background: #55946d; border-radius: 50% 50% 0 0; }
</style>
