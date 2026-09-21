<template>
  <div class="login-page">
    <div class="login-background-shape shape-one"></div>
    <div class="login-background-shape shape-two"></div>

    <div class="login-card">
      <div class="login-brand">
        <div class="login-brand-mark">⌁</div>
        <span>Lifescape</span>
      </div>

      <div class="login-heading">
        <p class="eyebrow">WELCOME BACK</p>
        <h1>Log in to your Lifescape</h1>
        <p class="login-subtitle">Continue your journey, complete quests, and build your world.</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <label for="email">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          autocomplete="email"
          placeholder="you@example.com"
          required
        />

        <div class="password-row">
          <label for="password">Password</label>
          <button type="button" class="forgot-button" @click="forgotPassword">
            Forgot password?
          </button>
        </div>
        <div class="password-input-wrap">
          <input
            id="password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            placeholder="Enter your password"
            required
            minlength="4"
          />
          <button
            type="button"
            class="password-toggle"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="showPassword = !showPassword"
          >
            {{ showPassword ? 'Hide' : 'Show' }}
          </button>
        </div>

        <label class="remember-row">
          <input v-model="rememberMe" type="checkbox" />
          <span>Remember me</span>
        </label>

        <p v-if="error" class="login-error">{{ error }}</p>

        <button class="login-button" type="submit">Log In</button>
      </form>

      <div class="login-divider"><span>or</span></div>

      <button class="demo-button" type="button" @click="demoLogin">
        Continue with Demo Account
      </button>

      <p class="signup-text">
        Don't have an account?
        <button type="button" @click="goToSignup">Create one</button>
      </p>

      <p class="demo-note">Frontend demo: any valid email + 4+ character password will work.</p>
    </div>
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

function finishLogin(userEmail) {
  const storage = rememberMe.value ? localStorage : sessionStorage
  storage.setItem('lifescape-auth', 'true')
  storage.setItem('lifescape-user', userEmail)
  router.push('/')
}

function handleLogin() {
  error.value = ''

  if (!email.value.includes('@')) {
    error.value = 'Please enter a valid email address.'
    return
  }

  if (password.value.length < 4) {
    error.value = 'Password must be at least 4 characters.'
    return
  }

  finishLogin(email.value)
}

function demoLogin() {
  email.value = 'demo@lifescape.app'
  password.value = 'lifescape'
  finishLogin(email.value)
}

function forgotPassword() {
  error.value = 'Password reset will be connected to the backend later.'
}

function goToSignup() {
  error.value = 'Sign-up is the next frontend flow to add.'
}
</script>
