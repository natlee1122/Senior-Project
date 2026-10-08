<template>
  <div>
    <PageHeading eyebrow="DAILY ADVENTURES" title="Quests" subtitle="Complete small real-world activities and earn rewards.">
      <div class="d-flex align-center ga-3">
        <v-chip color="secondary" size="large" class="font-weight-bold">{{ stats.completedToday }} / {{ quests.length }} today</v-chip>
        <v-btn color="primary" @click="openAdd">+ Add quest</v-btn>
      </div>
    </PageHeading>

    <v-alert color="secondary" variant="tonal" class="mb-5">
      <strong>Rewards persist.</strong> Completing a quest adds its XP and coins to your account and stays saved when you leave and return.
    </v-alert>

    <div class="d-flex flex-wrap ga-2 mb-5">
      <v-chip
        v-for="filter in filters"
        :key="filter"
        size="large"
        :color="selectedFilter === filter ? 'primary' : 'surface'"
        :border="selectedFilter !== filter"
        :class="{ 'text-muted': selectedFilter !== filter }"
        @click="selectedFilter = filter"
      >{{ filter }}</v-chip>
    </div>

    <div class="d-flex flex-column ga-4">
      <v-card v-for="quest in filteredQuests" :key="quest.id" class="d-flex flex-column flex-md-row overflow-hidden">
        <QuestScene :theme="quest.theme" :width="mdAndUp ? 290 : '100%'" :min-height="mdAndUp ? 245 : 160" class="flex-shrink-0" />
        <div class="pa-7 flex-grow-1">
          <div class="d-flex align-center justify-space-between ga-3">
            <v-chip size="x-small" class="font-weight-bold">{{ quest.category }}</v-chip>
            <v-chip v-if="completions[quest.id]" size="small" color="secondary">✓ Completed today</v-chip>
          </div>
          <h2 class="text-h5 mt-3 mb-2">{{ quest.title }}</h2>
          <p class="text-body-1 text-muted mb-4 quest-desc">{{ quest.description }}</p>
          <div class="d-flex ga-5 text-caption text-muted">
            <span>◷ {{ quest.duration }}</span><span>◆ {{ quest.difficulty }}</span>
          </div>
          <div class="d-flex flex-wrap ga-4 text-caption font-weight-bold text-muted my-3">
            <span>★ +{{ quest.xp }} XP</span><span>● +{{ quest.coins }} coins</span>
            <span v-if="quest.photoOptional">📷 Photo optional</span>
          </div>
          <v-btn
            size="large"
            :color="completions[quest.id] ? 'secondary' : 'primary'"
            width="210"
            class="mt-1"
            :disabled="Boolean(completions[quest.id])"
            @click="openCompletion(quest)"
          >{{ completions[quest.id] ? 'Completed' : 'Complete Quest' }}</v-btn>
          <v-btn variant="outlined" color="primary-dark" class="mt-1 ml-2 font-weight-bold" @click="openEdit(quest)">Edit</v-btn>
          <v-btn variant="text" color="error" class="mt-1 ml-2" @click="askDelete(quest)">Delete</v-btn>
        </div>
      </v-card>
    </div>

    <v-alert v-if="loaded && !filteredQuests.length" color="secondary" variant="tonal" class="mt-2">
      No quests here yet. Use “+ Add quest” to create one.
    </v-alert>

    <v-dialog v-model="dialog" max-width="520">
      <v-card rounded="xl">
        <v-card-title class="text-h5 pt-6 px-6">Confirm completion</v-card-title>
        <v-card-text class="px-6">
          <p class="text-body-1">Did you complete <strong>{{ selectedQuest?.title }}</strong>?</p>
          <p class="text-body-2 text-muted mt-2">You'll receive <strong>+{{ selectedQuest?.xp }} XP</strong> and <strong>+{{ selectedQuest?.coins }} coins</strong>. This can only be claimed once today.</p>

          <v-file-input
            v-model="photo"
            class="mt-5"
            label="Optional photo"
            accept="image/*"
            prepend-icon="mdi-camera"
            show-size
            clearable
            hint="Attach a photo as completion evidence (optional)."
            persistent-hint
          />

          <v-img v-if="photoPreview" :src="photoPreview" max-height="220" rounded="lg" cover class="mt-4" />
        </v-card-text>
        <v-card-actions class="px-6 pb-6">
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancel</v-btn>
          <v-btn color="primary" :loading="saving" @click="confirmCompletion">Confirm & Earn</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <QuestFormDialog v-model="formDialog" :quest="editTarget" @saved="onChanged" />
    <QuestDeleteDialog v-model="deleteDialog" :quest="questToDelete" @deleted="onChanged" />

    <v-snackbar v-model="snackbar" :timeout="2800">{{ message }}</v-snackbar>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useDisplay } from 'vuetify'
import PageHeading from '../components/PageHeading.vue'
import QuestScene from '../components/QuestScene.vue'
import QuestFormDialog from '../components/QuestFormDialog.vue'
import QuestDeleteDialog from '../components/QuestDeleteDialog.vue'
import api from '../api'

const { mdAndUp } = useDisplay()
const filters = ['All', 'Exercise', 'Study', 'Explore', 'Creative']
const selectedFilter = ref('All')
const dialog = ref(false)
const selectedQuest = ref(null)
const photo = ref(null)
const photoPreview = ref('')
const saving = ref(false)
const snackbar = ref(false)
const message = ref('')

// Data arrives asynchronously, so start with safe defaults.
const quests = ref([])
const completions = ref({})
const stats = ref({ completedToday: 0 })
const loaded = ref(false)

onMounted(async () => {
  try {
    const [questList, statData, todayDone] = await Promise.all([
      api.quests.list(),
      api.users.stats(),
      api.quests.todayCompletions(),
    ])
    quests.value = questList
    stats.value = statData
    completions.value = todayDone
  } catch (err) {
    message.value = err.message
    snackbar.value = true
  } finally {
    loaded.value = true
  }
})

const formDialog = ref(false)
const editTarget = ref(null)
const deleteDialog = ref(false)
const questToDelete = ref(null)

async function refresh() {
  const [questList, statData, todayDone] = await Promise.all([
    api.quests.list(),
    api.users.stats(),
    api.quests.todayCompletions(),
  ])
  quests.value = questList
  stats.value = statData
  completions.value = todayDone
}

function openAdd() {
  editTarget.value = null
  formDialog.value = true
}

function openEdit(quest) {
  editTarget.value = quest
  formDialog.value = true
}

function askDelete(quest) {
  questToDelete.value = quest
  deleteDialog.value = true
}

async function onChanged(msg) {
  try {
    await refresh()
  } catch (err) {
    msg = err.message
  }
  message.value = msg
  snackbar.value = true
}

const filteredQuests = computed(() =>
  selectedFilter.value === 'All'
    ? quests.value
    : quests.value.filter((q) => q.category === selectedFilter.value),
)

watch(photo, async (file) => {
  const selected = Array.isArray(file) ? file[0] : file
  try {
    photoPreview.value = selected ? await compressImage(selected) : ''
  } catch (err) {
    photoPreview.value = ''
    message.value = err.message
    snackbar.value = true
  }
})

function openCompletion(quest) {
  selectedQuest.value = quest
  photo.value = null
  photoPreview.value = ''
  dialog.value = true
}

function closeDialog() {
  dialog.value = false
  selectedQuest.value = null
  photo.value = null
  photoPreview.value = ''
}

async function confirmCompletion() {
  if (!selectedQuest.value) return
  saving.value = true
  try {
    const result = await api.quests.complete(selectedQuest.value.id, photoPreview.value)
    stats.value = await api.users.stats()
    completions.value = await api.quests.todayCompletions()
    message.value = result.alreadyCompleted
      ? 'This quest was already completed today.'
      : `Quest complete! +${result.quest.xp} XP and +${result.quest.coins} coins earned.`
    snackbar.value = true
    closeDialog()
  } catch (err) {
    message.value = err.message
    snackbar.value = true
  } finally {
    saving.value = false
  }
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select an image.'))
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const max = 900
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.72))
      }
      img.onerror = () => reject(new Error('Could not read the image.'))
      img.src = reader.result
    }
    reader.onerror = () => reject(new Error('Could not read the image.'))
    reader.readAsDataURL(file)
  })
}
</script>

<style scoped>
.quest-desc { max-width: 700px; line-height: 1.6; }
</style>