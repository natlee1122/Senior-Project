<template>
  <v-dialog :model-value="modelValue" max-width="520" @update:model-value="emit('update:modelValue', $event)">
    <v-card rounded="xl">
      <v-card-title class="text-h5 pt-6 px-6">{{ isEdit ? 'Edit quest' : 'Add a quest' }}</v-card-title>
      <v-card-text class="px-6">
        <v-text-field v-model="form.title" label="Title" maxlength="80" counter />
        <v-select v-model="form.category" :items="categories" label="Category" />
        <v-textarea v-model="form.description" label="Description (optional)" rows="2" auto-grow />
        <v-text-field v-model="form.duration" label="Duration (optional)" placeholder="e.g. 20 min" />
        <v-select
          v-if="!isEdit || quest?.custom"
          v-model="form.difficulty"
          :items="difficulties"
          label="Difficulty"
          hint="Harder quests earn more XP and coins."
          persistent-hint
        />
        <v-alert v-if="error" color="error" variant="tonal" density="compact" class="mt-4">{{ error }}</v-alert>
      </v-card-text>
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="text" @click="emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="primary" :loading="saving" @click="save">{{ isEdit ? 'Save changes' : 'Add quest' }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import api from '../api'

// Add a quest (no `quest` prop) or edit one (pass the quest).
const props = defineProps({
  modelValue: Boolean,
  quest: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved'])

const categories = ['Exercise', 'Study', 'Explore', 'Creative']
const difficulties = ['Easy', 'Medium', 'Hard']
const isEdit = computed(() => Boolean(props.quest))

const form = ref(blankForm())
const saving = ref(false)
const error = ref('')

function blankForm() {
  return { title: '', category: 'Exercise', description: '', duration: '', difficulty: 'Easy' }
}

// Reset the form every time the dialog opens.
watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    error.value = ''
    form.value = props.quest
      ? {
          title: props.quest.title,
          category: props.quest.category,
          description: props.quest.description || '',
          duration: props.quest.duration || '',
          difficulty: props.quest.difficulty || 'Easy',
        }
      : blankForm()
  },
)

async function save() {
  error.value = ''
  saving.value = true
  try {
    const result = isEdit.value
      ? await api.quests.update(props.quest.id, { ...form.value })
      : await api.quests.create({ ...form.value })
    emit('saved', isEdit.value ? `Updated "${result.title}".` : `Added "${result.title}".`)
    emit('update:modelValue', false)
  } catch (err) {
    error.value = err.message
  } finally {
    saving.value = false
  }
}
</script>