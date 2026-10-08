import { request } from './client'

export const auth = {
  register: (data) => request('/auth/register', { method: 'POST', body: data }),
  login: async (data) => {
    const result = await request('/auth/login', { method: 'POST', body: data })  // doesn't exist yet
    localStorage.setItem('lifescape-token', result.token)
    return result
  },
  logout: async () => localStorage.removeItem('lifescape-token'),
}

export const users = {
  me: () => request('/users/me'),   // doesn't exist yet
}

export const quests = {
  list: () => request('/quests'),
  complete: (id) => request(`/quests/${id}/complete`, { method: 'POST' }),  // doesn't exist yet
}