<template>
  <div class="login-page d-flex align-center justify-center px-3 py-10">
    <div class="shape shape-one" /><div class="shape shape-two" />

    <v-card max-width="450" width="100%" rounded="xxl" class="login-card pa-8 pa-sm-10">
      <div class="d-flex align-center justify-center ga-3 mb-8 text-h5">
        <v-avatar color="primary" rounded="lg" size="38">⌁</v-avatar>
        <span>Lifescape</span>
      </div>

      <div class="text-center">
        <p class="text-overline text-primary-dark mb-2">WELCOME BACK</p>
        <h1 class="text-h4">Log in to your Lifescape</h1>
        <p class="text-body-2 text-muted mx-auto mt-3 login-subtitle">Continue your journey, complete quests, and build your world.</p>
      </div>

      <v-form class="mt-7" @submit.prevent="handleLogin">
        <label for="email" class="field-label">Email</label>
        <v-text-field id="email" v-model="email" type="email" autocomplete="email" placeholder="you@example.com" :rules="[emailRule]" />

        <div class="d-flex align-center justify-space-between mt-4">
          <label for="password" class="field-label">Password</label>
          <v-btn variant="text" size="small" color="primary-dark" class="px-0 mb-2" min-width="0" @click="forgotPassword">Forgot password?</v-btn>
        </div>
        <v-text-field
          id="password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          placeholder="Enter your password"
          :rules="[passwordRule]"
        >
          <template #append-inner>
            <v-btn variant="text" size="small" color="primary-dark" min-width="0" @click="showPassword = !showPassword">{{ showPassword ? 'Hide' : 'Show' }}</v-btn>
          </template>
        </v-text-field>

        <v-checkbox v-model="rememberMe" label="Remember me" density="compact" color="primary" hide-details class="mt-2 remember" />

        <v-alert v-if="error" color="error" variant="tonal" density="compact" class="mt-3 text-caption">{{ error }}</v-alert>

        <v-btn type="submit" block height="48" color="primary" class="mt-5 text-body-2 font-weight-black">Log In</v-btn>
      </v-form>

      <div class="d-flex align-center ga-3 my-6 text-caption text-muted">
        <v-divider color="line" /><span>or</span><v-divider color="line" />
      </div>

      <v-btn block height="48" color="secondary" border class="text-body-2 font-weight-black" @click="demoLogin">Continue with Demo Account</v-btn>

      <p class="text-body-2 text-muted text-center mt-6">
        Don't have an account?
        <v-btn variant="text" size="small" color="primary-dark" min-width="0" class="px-1" @click="goToSignup">Create one</v-btn>
      </p>
      <p class="text-center mt-4 demo-note">Frontend demo: any valid email + 4+ character password will work.</p>
    </v-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const password = ref('')
const rememberMe = ref(true)
const showPassword = ref(false)
const error = ref('')

const emailRule = (v) => (v && v.includes('@')) || 'Please enter a valid email address.'
const passwordRule = (v) => (v && v.length >= 4) || 'Password must be at least 4 characters.'

function finishLogin(userEmail) {
  const storage = rememberMe.value ? localStorage : sessionStorage
  storage.setItem('lifescape-auth', 'true')
  storage.setItem('lifescape-user', userEmail)
  router.push('/')
}
function handleLogin() {
  error.value = ''
  if (!email.value.includes('@')) { error.value = 'Please enter a valid email address.'; return }
  if (password.value.length < 4) { error.value = 'Password must be at least 4 characters.'; return }
  finishLogin(email.value)
}
function demoLogin() {
  email.value = 'demo@lifescape.app'
  password.value = 'lifescape'
  finishLogin(email.value)
}
const forgotPassword = () => { error.value = 'Password reset will be connected to the backend later.' }
const goToSignup = () => { error.value = 'Sign-up is the next frontend flow to add.' }
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 15% 15%, rgba(47, 157, 145, .12), transparent 30%),
    radial-gradient(circle at 85% 80%, rgba(232, 245, 240, .95), transparent 34%),
    #fbfaf6;
}
.shape { position: absolute; border-radius: 999px; pointer-events: none; }
.shape-one { width: 320px; height: 320px; right: -120px; top: -100px; background: rgba(47, 157, 145, .08); }
.shape-two { width: 260px; height: 260px; left: -110px; bottom: -100px; background: rgba(47, 157, 145, .07); }
.login-card { position: relative; z-index: 1; background: rgba(255, 255, 255, .96); box-shadow: 0 24px 70px rgba(24, 52, 58, .12); }
.login-subtitle { max-width: 340px; line-height: 1.6; }
.field-label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 700; }
.remember :deep(.v-label) { font-size: 12px; font-weight: 600; color: #66767b; opacity: 1; }
.demo-note { font-size: 10px; color: #a0abad; line-height: 1.5; }
</style>
