<template>
  <div class="page">
    <div class="page-heading"><div><span class="eyebrow">YOUR COLLECTION</span><h1>Inventory</h1><p>Everything you've earned along the way.</p></div></div>
    <div class="inventory-grid">
      <div v-for="item in items" :key="item.name" class="item-card card">
        <div class="item-icon">{{ item.icon }}</div><h3>{{ item.name }}</h3><small>{{ item.type }}</small>
      </div>
    </div>
  </div>
</template>
<script setup>
const items = [
  {name:'Fox Companion',type:'Pet',icon:'🦊'},{name:'Explorer Backpack',type:'Item',icon:'🎒'},
  {name:'Green Hoodie',type:'Clothing',icon:'🧥'},{name:'Adventure Camera',type:'Item',icon:'📷'},
  {name:'Sunny Badge',type:'Achievement',icon:'☀️'},{name:'Mountain Sticker',type:'Decoration',icon:'🏔️'}
]
</script>