const USERS_KEY = 'lifescape-users-v1'
const TOKEN_KEY = 'lifescape-token'
const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms))

const DEFAULT_QUESTS = [
  {
    id: 'walk',
    title: 'Take a 20 minute walk',
    category: 'Exercise',
    description: 'Get outside and enjoy some fresh air. Walk anywhere you like.',
    duration: '20 min',
    difficulty: 'Easy',
    xp: 50,
    coins: 20,
    theme: 'forest',
  },
  {
    id: 'study',
    title: 'Study for 30 minutes',
    category: 'Study',
    description: 'Focus on one thing that moves your day forward.',
    duration: '30 min',
    difficulty: 'Medium',
    xp: 40,
    coins: 15,
    theme: 'desk',
  },
  {
    id: 'photo',
    title: 'Take a picture of something interesting',
    category: 'Explore',
    description: 'Look around your surroundings and capture something you might otherwise miss.',
    duration: '10 min',
    difficulty: 'Easy',
    xp: 30,
    coins: 10,
    theme: 'camera',
    photoOptional: true,
  },
]

// ---------- helpers (not exported) ----------
function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function readUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}')
  } catch {
    return {}
  }
}

function writeUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function emptyUser(email, firstName = '', lastName = '') {
  const fallback = email.split('@')[0]
  return {
    email,
    firstName: firstName || fallback,
    lastName,
    name: `${firstName} ${lastName}`.trim() || fallback,
    password: '',
    onboardingComplete: false,
    interests: [],
    goal: '',
    xp: 0,
    coins: 0,
    completed: {},
    photos: {},
    createdAt: new Date().toISOString(),
  }
}

function currentEmail() {
  return localStorage.getItem(TOKEN_KEY)
}

function requireUser() {
  const user = readUsers()[currentEmail()]
  if (!user) throw new Error('Please log in again.')
  return user
}

function saveUser(user) {
  const users = readUsers()
  users[user.email] = user
  writeUsers(users)
}

function ensureDemoAccount() {
  const users = readUsers()
  const email = 'demo@lifescape.app'
  if (!users[email]) {
    const user = emptyUser(email, 'Amanda', 'Hsu')
    user.password = 'lifescape'
    user.onboardingComplete = true
    user.interests = ['Exercise', 'Study', 'Explore']
    user.goal = 'Build a consistent daily routine'
    users[email] = user
    writeUsers(users)
  }
  return users[email]
}

// ---------- exported API ----------
export const auth = {
  async register({ email, password, firstName, lastName = '', goal = '', interests = [] }) {
    await delay()
    const normalizedEmail = email.trim().toLowerCase()
    const users = readUsers()
    if (users[normalizedEmail]) {
      throw new Error('An account with that email already exists.')
    }
    const user = emptyUser(normalizedEmail, firstName.trim(), lastName.trim())
    user.password = password
    user.goal = goal
    user.interests = interests
    user.onboardingComplete = true
    users[normalizedEmail] = user
    writeUsers(users)

    localStorage.setItem(TOKEN_KEY, user.email) // log in right after signing up
    return user
  },

  async login({ email, password }) {
    await delay()
    const normalizedEmail = email.trim().toLowerCase()
    const user = readUsers()[normalizedEmail]
    if (!user) throw new Error('No account was found for that email. Create an account first.')
    if (user.password !== password) throw new Error('Incorrect password.')

    localStorage.setItem(TOKEN_KEY, user.email) // fake "token"
    return { token: user.email }
  },

  async demoLogin() {
    await delay()
    const user = ensureDemoAccount()
    localStorage.setItem(TOKEN_KEY, user.email)
    return { token: user.email }
  },

  async logout() {
    localStorage.removeItem(TOKEN_KEY)
  },
}

export const users = {
  async me() {
    await delay()
    return requireUser()
  },

  async stats() {
    await delay()
    const user = requireUser()
    const day = todayKey()

    let completedThisWeek = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      completedThisWeek += Object.keys(user.completed?.[d.toISOString().slice(0, 10)] || {}).length
    }

    return {
      xp: user.xp,
      coins: user.coins,
      level: Math.floor(user.xp / 500) + 1,
      xpIntoLevel: user.xp % 500,
      levelProgress: ((user.xp % 500) / 500) * 100,
      completedToday: Object.keys(user.completed?.[day] || {}).length,
      completedThisWeek,
    }
  },
}

export const quests = {
  async list() {
    await delay()
    return DEFAULT_QUESTS
  },

  async todayCompletions() {
    await delay()
    return requireUser().completed?.[todayKey()] || {}
  },

  async complete(questId, photoData = '') {
    await delay()
    const user = requireUser()
    const quest = DEFAULT_QUESTS.find((q) => q.id === questId)
    if (!quest) throw new Error('Quest not found.')

    const day = todayKey()
    user.completed ||= {}
    user.completed[day] ||= {}

    if (user.completed[day][questId]) {
      return { user, quest, alreadyCompleted: true }
    }

    user.completed[day][questId] = {
      completedAt: new Date().toISOString(),
      xp: quest.xp,
      coins: quest.coins,
      photoAttached: Boolean(photoData),
    }
    user.xp += quest.xp
    user.coins += quest.coins

    if (photoData) {
      user.photos ||= {}
      user.photos[`${day}:${questId}`] = photoData
    }

    saveUser(user)
    return { user, quest, alreadyCompleted: false }
  },
}