<template>
  <div class="login-page d-flex align-center justify-center px-3 py-10">
    <v-card max-width="520" width="100%" rounded="xxl" class="login-card pa-8 pa-sm-10">
      <div class="d-flex align-center justify-center ga-3 mb-7 text-h5">
        <v-avatar color="primary" rounded="lg" size="38">⌁</v-avatar>
        <span>Lifescape</span>
      </div>

      <div class="text-center">
        <p class="text-overline text-primary-dark mb-2">START YOUR JOURNEY</p>
        <h1 class="text-h4">Create your account</h1>
        <p class="text-body-2 text-muted mt-3">Set up your profile and choose what kinds of quests you enjoy.</p>
      </div>

      <v-form class="mt-7" @submit.prevent="create">
        <v-row dense>
          <v-col cols="12" sm="6">
            <label class="field-label">First name</label>
            <v-text-field v-model="firstName" placeholder="First name" :rules="[v => !!v || 'Please enter your first name.']" />
          </v-col>
          <v-col cols="12" sm="6">
            <label class="field-label">Last name</label>
            <v-text-field v-model="lastName" placeholder="Last name (optional)" />
          </v-col>
        </v-row>

        <label class="field-label mt-3">Email</label>
        <v-text-field v-model="email" type="email" placeholder="you@example.com" :rules="[emailRule]" />

        <label class="field-label mt-3">Password</label>
        <v-text-field v-model="password" type="password" placeholder="At least 4 characters" :rules="[passwordRule]" />

        <label class="field-label mt-4">Your main goal</label>
        <v-select v-model="goal" :items="goals" placeholder="Choose a goal" />

        <label class="field-label mt-4">Quest interests</label>
        <v-chip-group v-model="interests" multiple selected-class="text-primary font-weight-bold">
          <v-chip v-for="interest in interestOptions" :key="interest" :value="interest" filter border>{{ interest }}</v-chip>
        </v-chip-group>

        <v-alert v-if="error" color="error" variant="tonal" density="compact" class="mt-5">{{ error }}</v-alert>

        <v-btn type="submit" block height="48" color="primary" class="mt-6 text-body-2 font-weight-black">Create Account</v-btn>
      </v-form>

      <p class="text-body-2 text-muted text-center mt-6">
        Already have an account?
        <v-btn variant="text" size="small" color="primary-dark" min-width="0" class="px-1" @click="router.push('/login')">Log in</v-btn>
      </p>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api'

const router = useRouter()
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const goal = ref('')
const interests = ref([])
const error = ref('')

const goals = ['Build a consistent daily routine', 'Be more active', 'Learn something new', 'Explore my surroundings']
const interestOptions = ['Exercise', 'Study', 'Explore', 'Creative']
const emailRule = (v) => (v && v.includes('@')) || 'Please enter a valid email address.'
const passwordRule = (v) => (v && v.length >= 4) || 'Password must be at least 4 characters.'

async function create() {
  error.value = ''
  if (!firstName.value.trim()) { error.value = 'Please enter your first name.'; return }
  if (!email.value.includes('@')) { error.value = 'Please enter a valid email address.'; return }
  if (password.value.length < 4) { error.value = 'Password must be at least 4 characters.'; return }

  try {
    await api.auth.register({
      email: email.value,
      password: password.value,
      firstName: firstName.value,
      lastName: lastName.value,
      goal: goal.value,
      interests: interests.value,
    })
    router.push('/')
  } catch (err) {
    error.value = err.message
  }
}
</script>

<style scoped>
.login-page { min-height: 100vh; background: #fbfaf6; }
.login-card { background: rgba(255,255,255,.96); box-shadow: 0 24px 70px rgba(24,52,58,.12); }
.field-label { display:block; margin-bottom:8px; font-size:13px; font-weight:700; }
</style>