import { useEffect, useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import styles from './SearchBox.module.scss'

const route = getRouteApi('/clients')

// Raynet's fulltext silently returns zero results for queries shorter than
// 3 characters, so shorter input is treated as "no filter yet"
export const SEARCH_MIN_LENGTH = 3

const SEARCH_DEBOUNCE_MS = 300

export function SearchBox() {
  const { q } = route.useSearch()
  const navigate = useNavigate()
  const [value, setValue] = useState(q ?? '')

  const [lastQ, setLastQ] = useState(q)
  if (q !== lastQ) {
    setLastQ(q)
    const trimmed = value.trim()
    const derivedFromInput =
      trimmed.length >= SEARCH_MIN_LENGTH ? trimmed : undefined
    if (derivedFromInput !== q) {
      setValue(q ?? '')
    }
  }

  // Debounce typing into the URL (which drives the API query)
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = value.trim()
      const next = trimmed.length >= SEARCH_MIN_LENGTH ? trimmed : undefined
      if (next !== q) {
        navigate({
          to: '.',
          search: (prev: { q?: string }) => ({ ...prev, q: next }),
          replace: true,
        })
      }
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [value, q, navigate])

  const tooShort =
    value.trim().length > 0 && value.trim().length < SEARCH_MIN_LENGTH

  return (
    <div className={styles.search}>
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16" y2="16" />
      </svg>
      <input
        type="search"
        placeholder="Hledat…"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        aria-label="Fulltextové vyhledávání klientů"
      />
      {tooShort && (
        <span className={styles.searchHint}>
          Zadejte alespoň {SEARCH_MIN_LENGTH} znaky
        </span>
      )}
    </div>
  )
}
