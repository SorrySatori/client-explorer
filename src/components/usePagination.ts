import { useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'

const route = getRouteApi('/clients')

const STORAGE_KEY = 'client-explorer.pageSize'
const DEFAULT_PAGE_SIZE = 20

export const PAGE_SIZES = [20, 50, 100] as const

const readStoredSize = (): number => {
  try {
    const parsed = Number(localStorage.getItem(STORAGE_KEY))
    return (PAGE_SIZES as readonly number[]).includes(parsed)
      ? parsed
      : DEFAULT_PAGE_SIZE
  } catch (error) {
    // unavailable storage (private mode) — fall back for this session
    console.warn('Could not read the stored page size:', error)
    return DEFAULT_PAGE_SIZE
  }
}

// Client-side pagination over the already-loaded list. The page number is
// URL state (a shared link shows the same page); the page size is a
// personal view preference (localStorage), like the visible columns.
export function usePagination(totalRows: number) {
  const { page: rawPage } = route.useSearch()
  const navigate = useNavigate()
  const [pageSize, setPageSizeState] = useState(readStoredSize)

  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize))
  const page = Math.min(rawPage ?? 1, pageCount)

  const setPage = (next: number) =>
    navigate({
      to: '.',
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        page: next >= 2 ? next : undefined,
      }),
      replace: true,
    })

  const setPageSize = (next: number) => {
    setPageSizeState(next)
    try {
      localStorage.setItem(STORAGE_KEY, String(next))
    } catch (error) {
      console.warn('Could not persist the page size:', error)
    }
    setPage(1)
  }

  return { page, pageSize, pageCount, setPage, setPageSize }
}
