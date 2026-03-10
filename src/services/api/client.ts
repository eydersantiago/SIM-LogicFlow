interface RequestOptions extends RequestInit {
  query?: Record<string, string | number | boolean | undefined>
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

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

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { query, headers, ...requestInit } = options
  const response = await fetch(buildUrl(path, query), {
    ...requestInit,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  })

  if (!response.ok) {
    const responseText = await response.text()
    throw new Error(`Error ${response.status}: ${responseText || 'fallo de API'}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}
