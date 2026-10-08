<template>
  <v-dialog :model-value="modelValue" max-width="420" @update:model-value="emit('update:modelValue', $event)">
    <v-card rounded="xl">
      <v-card-title class="text-h5 pt-6 px-6">Delete quest?</v-card-title>
      <v-card-text class="px-6">
        <strong>{{ quest?.title }}</strong> will be removed. XP and coins you already earned are kept.
        <v-alert v-if="error" color="error" variant="tonal" density="compact" class="mt-4">{{ error }}</v-alert>
      </v-card-text>
      <v-card-actions class="px-6 pb-6">
        <v-spacer />
        <v-btn variant="text" @click="emit('update:modelValue', false)">Cancel</v-btn>
        <v-btn color="error" :loading="deleting" @click="confirm">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import api from '../api'

const props = defineProps({
  modelValue: Boolean,
  quest: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'deleted'])

const deleting = ref(false)
const error = ref('')

watch(() => props.modelValue, (open) => { if (open) error.value = '' })

async function confirm() {
  if (!props.quest) return
  error.value = ''
  deleting.value = true
  try {
    await api.quests.remove(props.quest.id)
    emit('deleted', 'Quest deleted.')
    emit('update:modelValue', false)
  } catch (err) {
    error.value = err.message
  } finally {
    deleting.value = false
  }
}
</script>