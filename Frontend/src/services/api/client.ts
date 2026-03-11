interface RequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined>
  disableAuth?: boolean
  disableAutoRefresh?: boolean
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api').replace(
  /\/$/,
  '',
)

const ACCESS_TOKEN_KEY = 'sim-logicflow-access-token'
const REFRESH_TOKEN_KEY = 'sim-logicflow-refresh-token'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function setAuthTokens(access: string, refresh?: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access)
  if (refresh) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  }
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

function buildUrl(path: string, query?: RequestOptions['query']) {
  const url = new URL(`${API_BASE_URL}${path}`)

  if (!query) {
    return url.toString()
  }

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined) {
      return
    }

    url.searchParams.set(key, String(value))
  })

  return url.toString()
}

async function parseError(response: Response) {
  const payload = await response.text()

  if (!payload) {
    return `Error ${response.status}`
  }

  try {
    const parsed = JSON.parse(payload) as { detail?: string }
    return parsed.detail ?? payload
  } catch {
    return payload
  }
}

async function refreshAccessToken() {
  const refresh = getRefreshToken()

  if (!refresh) {
    return null
  }

  const response = await fetch(buildUrl('/auth/refresh/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  })

  if (!response.ok) {
    clearAuthTokens()
    return null
  }

  const data = (await response.json()) as { access: string }
  setAuthTokens(data.access)
  return data.access
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    query,
    headers,
    disableAuth = false,
    disableAutoRefresh = false,
    ...requestInit
  } = options

  let resolvedHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (headers && !Array.isArray(headers) && !(headers instanceof Headers)) {
    resolvedHeaders = {
      ...resolvedHeaders,
      ...headers,
    }
  }

  const accessToken = getAccessToken()
  if (!disableAuth && accessToken) {
    resolvedHeaders = {
      ...resolvedHeaders,
      Authorization: `Bearer ${accessToken}`,
    }
  }

  let response = await fetch(buildUrl(path, query), {
    ...requestInit,
    headers: resolvedHeaders,
  })

  if (
    response.status === 401 &&
    !disableAuth &&
    !disableAutoRefresh &&
    path !== '/auth/login/' &&
    path !== '/auth/refresh/'
  ) {
    const newAccess = await refreshAccessToken()
    if (newAccess) {
      response = await fetch(buildUrl(path, query), {
        ...requestInit,
        headers: {
          ...resolvedHeaders,
          Authorization: `Bearer ${newAccess}`,
        },
      })
    }
  }

  if (!response.ok) {
    const message = await parseError(response)
    throw new Error(`Error ${response.status}: ${message}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
