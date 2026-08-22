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
    let message = `Request failed with status ${response.status}`
    try {
      const body = (await response.json()) as {
        message?: string
        translatedMessage?: string
        error?: string
      }
      message = body.translatedMessage ?? body.message ?? body.error ?? message
    } catch {
    }
    throw new ApiError(response.status, message)
  }

  return response.json() as Promise<T>
}
