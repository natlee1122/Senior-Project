<template>
  <div class="page">
    <div class="page-heading">
      <div>
        <span class="eyebrow">DAILY ADVENTURES</span>
        <h1>Quests</h1>
        <p>Complete small real-world activities and earn rewards.</p>
      </div>
      <button class="secondary-btn">＋ Custom quest</button>
    </div>

    <div class="filters">
      <button class="filter active">All</button>
      <button class="filter">Exercise</button>
      <button class="filter">Study</button>
      <button class="filter">Explore</button>
      <button class="filter">Creative</button>
    </div>

    <section class="large-quest-list">
      <article v-for="quest in quests" :key="quest.title" class="large-quest card">
        <div class="quest-image" :class="quest.theme">
          <div class="sun"></div><div class="mountain"></div><div class="hill"></div>
        </div>
        <div class="large-quest-content">
          <span class="pill">{{ quest.category }}</span>
          <h2>{{ quest.title }}</h2>
          <p>{{ quest.description }}</p>
          <div class="quest-meta"><span>◷ {{ quest.duration }}</span><span>◆ {{ quest.difficulty }}</span></div>
          <div class="reward-line"><span>★ +{{ quest.xp }} XP</span><span>● +{{ quest.coins }} coins</span></div>
          <button class="primary-btn" @click="complete(quest)">Start Quest</button>
        </div>
      </article>
    </section>

    <div v-if="message" class="toast">{{ message }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('')
const quests = [
  { title:'Take a 20 minute walk', category:'Exercise', description:'Get outside and enjoy some fresh air. Walk anywhere you like.', duration:'20 min', difficulty:'Easy', xp:50, coins:20, theme:'forest' },
  { title:'Study for 30 minutes', category:'Study', description:'Focus on one thing that moves your day forward.', duration:'30 min', difficulty:'Medium', xp:40, coins:15, theme:'desk' },
  { title:'Take a picture of something interesting', category:'Explore', description:'Look around your surroundings and capture something you might otherwise miss.', duration:'10 min', difficulty:'Easy', xp:30, coins:10, theme:'camera' }
]
function complete(q) {
  message.value = `Quest started: ${q.title}`
  setTimeout(() => message.value = '', 2200)
}
</script>