<template>
  <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-end ga-4 mb-6">
    <div>
      <span class="text-overline text-muted">{{ eyebrow }}</span>
      <h1 class="text-h4 my-1">{{ title }}</h1>
      <p class="text-body-2 text-muted">{{ subtitle }}</p>
    </div>
    <slot />
  </div>
</template>

<script setup>
defineProps({ eyebrow: String, title: String, subtitle: String })
</script>
