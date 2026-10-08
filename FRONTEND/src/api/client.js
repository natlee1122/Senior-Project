const TOKEN_KEY = 'lifescape-token'

export async function request(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem(TOKEN_KEY)
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) localStorage.removeItem(TOKEN_KEY)
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Request failed')
  }
  return res.json()
}