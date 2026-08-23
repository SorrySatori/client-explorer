import { getRouteApi, useNavigate } from '@tanstack/react-router'

export interface TableSort {
  key: string
  direction: 'desc' | 'asc'
}

const route = getRouteApi('/clients')

// Sorting is query state like the filters — it belongs to "what am I looking
// at", so it lives in the URL (?sort=…&sortDir=…) and shared links reproduce
// the same row order.
export function useTableSort() {
  const { sort, sortDir } = route.useSearch()
  const navigate = useNavigate()

  const current: TableSort | null = sort
    ? { key: sort, direction: sortDir ?? 'desc' }
    : null

  const cycleSort = (key: string) => {
    const next =
      current?.key !== key
        ? { sort: key, sortDir: 'desc' as const }
        : current.direction === 'desc'
          ? { sort: key, sortDir: 'asc' as const }
          : { sort: undefined, sortDir: undefined }
    navigate({
      to: '.',
      search: (prev: Record<string, unknown>) => ({ ...prev, ...next }),
      replace: true,
    })
  }

  return { sort: current, cycleSort }
}
