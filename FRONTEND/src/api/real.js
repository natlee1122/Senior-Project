import { request } from './client'

const saveToken = (result) => {
  localStorage.setItem('lifescape-token', result.token)
  return result
}

export const auth = {
  // Backend returns { token, tokenType, user } and logs the user in right after sign-up.
  register: async (data) => saveToken(await request('/auth/register', { method: 'POST', body: data })),
  login: async (data) => saveToken(await request('/auth/login', { method: 'POST', body: data })),
  demoLogin: async () => saveToken(await request('/auth/demo', { method: 'POST' })),
  logout: async () => localStorage.removeItem('lifescape-token'),
}

export const users = {
  me: () => request('/users/me'),
  update: (data) => request('/users/me', { method: 'PATCH', body: data }),
  stats: () => request('/users/me/stats'),
}

export const quests = {
  list: () => request('/quests'),
  create: (data) => request('/quests', { method: 'POST', body: data }),
  update: (id, data) => request(`/quests/${id}`, { method: 'PATCH', body: data }),
  remove: (id) => request(`/quests/${id}`, { method: 'DELETE' }),
  todayCompletions: () => request('/quests/today-completions'),
  complete: (id) => request(`/quests/${id}/complete`, { method: 'POST' }),
}