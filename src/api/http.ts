export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export interface ListResponse<T> {
  success: boolean
  totalCount: number
  data: T[]
}

export interface DetailResponse<T> {
  success: boolean
  data: T
}

export async function getJson<T>(
  path: string,
  search?: URLSearchParams,
): Promise<T> {
  const query = search && search.size > 0 ? `?${search}` : ''
  const response = await fetch(`/api/${path}${query}`)

  if (!response.ok) {
    // Raynet errors carry { message, translatedMessage? }; the body may
    // also be non-JSON (e.g. proxy errors), hence the fallback chain
    const body = (await response.json().catch(() => null)) as {
      message?: string
      translatedMessage?: string
      error?: string
    } | null
    const message =
      body?.translatedMessage ??
      body?.message ??
      body?.error ??
      `Request failed with status ${response.status}`
    throw new ApiError(response.status, message)
  }

  return response.json() as Promise<T>
}
