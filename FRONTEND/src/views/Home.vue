<template>
  <div class="page">
    <section class="welcome">
      <div>
        <h1>Good morning, Amanda! <span>☀️</span></h1>
        <p>Another day, another adventure.</p>
      </div>
    </section>

    <section class="stats-row">
      <div class="card level-card">
        <div class="level-top"><strong>Lv. 3</strong><span>320 / 500 XP</span></div>
        <div class="progress"><span style="width:64%"></span></div>
      </div>
      <div class="card stat-card">
        <span class="coin">●</span>
        <div><strong>420</strong><small>Coins</small></div>
      </div>
      <div class="card stat-card">
        <span class="check">✓</span>
        <div><strong>12</strong><small>Items</small></div>
      </div>
    </section>

    <section class="section-head">
      <div>
        <h2>Today's Quests</h2>
        <p>Small actions. Real progress.</p>
      </div>
      <RouterLink to="/quests">View all →</RouterLink>
    </section>

    <section class="quest-grid">
      <article v-for="quest in quests" :key="quest.title" class="quest-card">
        <div class="quest-image" :class="quest.theme">
          <div class="sun"></div>
          <div class="mountain"></div>
          <div class="hill"></div>
        </div>
        <div class="quest-body">
          <span class="pill">{{ quest.category }}</span>
          <h3>{{ quest.title }}</h3>
          <div class="reward-line">
            <span>★ +{{ quest.xp }} XP</span>
            <span>● +{{ quest.coins }}</span>
          </div>
          <RouterLink :to="'/quests'" class="primary-btn">Start</RouterLink>
        </div>
      </article>
    </section>

    <section class="bottom-grid">
      <div class="card recommendation">
        <div>
          <span class="eyebrow">YOUR NEXT ADVENTURE</span>
          <h2>Make today a little more interesting.</h2>
          <p>Your quests are personalized from your interests and recent activity.</p>
          <RouterLink to="/quests" class="secondary-btn">Explore quests</RouterLink>
        </div>
        <div class="big-pet">🦊</div>
      </div>

      <div class="card weekly">
        <span class="eyebrow">THIS WEEK</span>
        <h3>7 / 10 quests completed</h3>
        <div class="week-bars">
          <span v-for="(n, i) in [2,3,1,3,2,0,1]" :key="i" :style="{height: (n*18+10)+'px'}"></span>
        </div>
        <small>Keep going. Your streak is growing.</small>
      </div>
    </section>
  </div>
</template>

<script setup>
const quests = [
  { title: 'Take a 20 minute walk', category: 'Exercise', xp: 50, coins: 20, theme: 'forest' },
  { title: 'Study for 30 minutes', category: 'Study', xp: 40, coins: 15, theme: 'desk' },
  { title: 'Take a picture of something interesting', category: 'Explore', xp: 30, coins: 10, theme: 'camera' }
]
</script>