export const ACCESS_TOKEN_STORAGE_KEY = 'access_token'

const AUTH_CHANGE_EVENT = 'auth-token-changed'

const base64UrlDecode = (value) => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return window.atob(padded)
}

export function readAccessToken() {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || ''
}

export function decodeAccessToken(token = readAccessToken()) {
  if (!token) return null

  try {
    const [, payload] = token.split('.')
    if (!payload) return null
    return JSON.parse(base64UrlDecode(payload))
  } catch {
    return null
  }
}

export function hasValidAccessToken(token = readAccessToken()) {
  const payload = decodeAccessToken(token)
  if (!payload?.exp) return false
  return payload.exp * 1000 > Date.now()
}

function notifyAuthChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_CHANGE_EVENT))
  }
}

export function saveAccessToken(token) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token)
  notifyAuthChange()
}

export function clearAccessToken() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY)
  notifyAuthChange()
}

export function subscribeToAuthChanges(listener) {
  if (typeof window === 'undefined') return () => {}

  const handleChange = () => listener(hasValidAccessToken())

  window.addEventListener(AUTH_CHANGE_EVENT, handleChange)
  window.addEventListener('storage', handleChange)

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, handleChange)
    window.removeEventListener('storage', handleChange)
  }
}
