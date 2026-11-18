import { sanitizeRoom } from '../components/world/furnitureCatalog'

/**
 * Persistence for a user's room. This is the only file that knows where the
 * data lives. Both functions are async so they can be swapped for API calls
 * later without touching any component.
 */
const roomKey = (user) => `lifescape-room-${user?.email || user?.id || 'guest'}`

export async function loadRoom(user) {
  try {
    return sanitizeRoom(JSON.parse(localStorage.getItem(roomKey(user)) || 'null'))
  } catch {
    return sanitizeRoom(null)
  }
}

export async function saveRoom(user, room) {
  try {
    localStorage.setItem(roomKey(user), JSON.stringify(room))
  } catch {
    // The room still works for this visit if browser storage is unavailable.
  }
}
