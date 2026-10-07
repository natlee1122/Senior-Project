<template>
  <div>
    <PageHeading eyebrow="PHASE II" title="World" subtitle="Build your own little place and visit friends.">
      <v-btn size="large" color="secondary" @click="customize">Customize</v-btn>
    </PageHeading>

    <v-card rounded="xxl">
      <v-row no-gutters>
        <v-col cols="12" md="7">
          <div class="world-art">
            <div class="world-sun" /><div class="world-mountain" /><div class="world-house">⌂</div>
          </div>
        </v-col>
        <v-col cols="12" md="5" class="pa-8 pa-md-14 d-flex flex-column justify-center">
          <div><v-chip size="x-small" class="font-weight-bold">MY HOME</v-chip></div>
          <h2 class="text-h4 my-3">A quiet place to come back to.</h2>
          <p class="text-body-1 text-muted mb-3 world-text">Customize your home, collect items, and eventually visit friends.</p>
          <v-btn size="large" color="primary" width="180" @click="customize">Customize home</v-btn>
        </v-col>
      </v-row>
    </v-card>

    <v-snackbar v-model="snackbar" :timeout="2200">World customization is coming soon.</v-snackbar>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import PageHeading from '../components/PageHeading.vue'

const snackbar = ref(false)
const customize = () => { snackbar.value = true }
</script>

<style scoped>
.world-art { position: relative; min-height: 430px; height: 100%; background: linear-gradient(#9ed7e8 0 50%, #84bd7d 50%); }
.world-sun { position: absolute; top: 65px; right: 100px; width: 80px; height: 80px; border-radius: 50%; background: #ffe5a1; }
.world-mountain { position: absolute; bottom: 85px; left: 8%; width: 85%; height: 180px; background: #689a91; clip-path: polygon(0 100%, 20% 40%, 37% 65%, 57% 5%, 75% 55%, 100% 100%); }
.world-house { position: absolute; bottom: 70px; left: 43%; font-size: 105px; line-height: 1; color: #8c5c43; }
.world-text { line-height: 1.7; }
</style>
