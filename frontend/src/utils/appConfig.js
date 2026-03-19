import { supportedLanguages } from '../assets/strings'

const STORAGE_KEY = 'app_config'

const DEFAULT_LANGUAGE = (import.meta.env.VITE_APP_LANGUAGE || 'es').toLowerCase()
const DEFAULT_API_BASE_URL =
import.meta.env.VITE_API_BASE_URL?.trim() 

const sanitizeLanguage = (value) => {
  const normalized = String(value || '').trim().toLowerCase()
  return supportedLanguages.includes(normalized) ? normalized : DEFAULT_LANGUAGE
}

const sanitizeApiBaseUrl = (value) => String(value || '').trim()

export function getDefaultAppConfig() {
  return {
    language: sanitizeLanguage(DEFAULT_LANGUAGE),
    apiBaseUrl: DEFAULT_API_BASE_URL
  }
}

export function getStoredAppConfig() {
  if (typeof window === 'undefined') return {}

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw)
    return {
      language: parsed?.language,
      apiBaseUrl: parsed?.apiBaseUrl
    }
  } catch {
    return {}
  }
}

export function getAppConfig() {
  const defaults = getDefaultAppConfig()
  const stored = getStoredAppConfig()

  return {
    language: sanitizeLanguage(stored.language || defaults.language),
    apiBaseUrl: sanitizeApiBaseUrl(stored.apiBaseUrl) || defaults.apiBaseUrl
  }
}

export function saveAppConfig(nextConfig) {
  const defaults = getDefaultAppConfig()
  const merged = {
    language: sanitizeLanguage(nextConfig?.language || defaults.language),
    apiBaseUrl: sanitizeApiBaseUrl(nextConfig?.apiBaseUrl) || defaults.apiBaseUrl
  }

  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged))
  }

  return merged
}
