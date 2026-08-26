import { useNavigate } from '@tanstack/react-router'
import { FILTER_KEYS } from './filterConfig'

// Clears all filter params from the URL (keeps fulltext and selection)
export function useClearFilters() {
  const navigate = useNavigate()
  return () =>
    navigate({
      to: '.',
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        ...Object.fromEntries(FILTER_KEYS.map((key) => [key, undefined])),
        page: undefined,
      }),
      replace: true,
    })
}
