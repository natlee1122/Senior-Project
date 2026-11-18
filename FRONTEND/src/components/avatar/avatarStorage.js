/**
 * Shared persistence for the avatar appearance. Profile writes it and World
 * reads it, so both pages must agree on the storage key and data shape.
 */
export const DEFAULT_BODY_TYPE = 'feminine'

export const appearanceKey = (user) => `lifescape-avatar-${user?.email || user?.id || 'guest'}`

/** Returns { characterStyle, equipped } or null when nothing valid is saved. */
export function readAppearance(user) {
  try {
    const saved = JSON.parse(localStorage.getItem(appearanceKey(user)) || 'null')
    return saved && typeof saved === 'object' ? saved : null
  } catch {
    return null
  }
}

export function writeAppearance(user, appearance) {
  try {
    localStorage.setItem(appearanceKey(user), JSON.stringify(appearance))
  } catch {
    // Appearance still works for the current page if browser storage is unavailable.
  }
}
