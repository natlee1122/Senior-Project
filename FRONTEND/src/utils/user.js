// Small helpers for showing user info. Works for old accounts that only have `name`.
export function getFirstName(user) {
  if (!user) return ''
  return user.firstName || (user.name || '').trim().split(' ')[0] || ''
}

export function getInitial(user) {
  return (getFirstName(user)[0] || '?').toUpperCase()
}