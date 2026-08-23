import { useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import ui from '../../styles/ui.module.scss'
import {
  FILTER_GROUPS,
  FILTER_KEYS,
  FILTER_LABELS,
  type FilterKey,
  type FilterValue,
} from './filterConfig'
import { FilterControl } from './controls'
import { useClearFilters } from './useClearFilters'
import styles from './Filters.module.scss'

const route = getRouteApi('/clients')

// "Filtrování" button + the "Pokročilý filtr" dropdown panel where
// criteria are added and edited (modeled after Raynet's own filter)
export function Filters() {
  const search = route.useSearch()
  const navigate = useNavigate()
  const clearFilters = useClearFilters()
  const [open, setOpen] = useState(false)
  // criteria added in the panel that don't have a value (yet)
  const [draftKeys, setDraftKeys] = useState<FilterKey[]>([])

  const activeKeys = FILTER_KEYS.filter((key) => search[key] !== undefined)
  const visibleKeys = FILTER_KEYS.filter(
    (key) => activeKeys.includes(key) || draftKeys.includes(key),
  )

  const setFilter = (key: FilterKey, value: FilterValue) => {
    navigate({
      to: '.',
      search: (prev: Record<string, unknown>) => ({ ...prev, [key]: value }),
      replace: true,
    })
  }

  const removeFilter = (key: FilterKey) => {
    setDraftKeys((keys) => keys.filter((item) => item !== key))
    setFilter(key, undefined)
  }

  const clearAll = () => {
    setDraftKeys([])
    clearFilters()
  }

  return (
    <div className={styles.filters}>
      <button
        type="button"
        className={ui.buttonFilter}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        <FilterIcon />
        Filtrování
        {activeKeys.length > 0 && (
          <span className={styles.badge}>{activeKeys.length}</span>
        )}
      </button>

      {open && (
        <div className={styles.panel}>
          <header className={styles.panelHeader}>
            <FilterIcon />
            <span>Pokročilý filtr</span>
            <button
              type="button"
              className={styles.close}
              onClick={() => setOpen(false)}
              aria-label="Zavřít filtr"
            >
              ✕
            </button>
          </header>

          <div className={styles.section}>Kritéria klientů</div>

          <div className={styles.rows}>
            {visibleKeys.map((key) => (
              <div key={key} className={styles.row}>
                <div className={styles.rowHeader}>
                  <span>{FILTER_LABELS[key]}</span>
                  <button
                    type="button"
                    className={styles.remove}
                    onClick={() => removeFilter(key)}
                    aria-label={`Odebrat podmínku ${FILTER_LABELS[key]}`}
                  >
                    ✕
                  </button>
                </div>
                <FilterControl
                  filterKey={key}
                  value={search[key]}
                  onChange={(value) => setFilter(key, value)}
                />
              </div>
            ))}

            <select
              className={styles.addSelect}
              value=""
              onChange={(event) => {
                const key = event.target.value as FilterKey
                if (key) setDraftKeys((keys) => [...keys, key])
              }}
            >
              <option value="">+ Přidat podmínku</option>
              {FILTER_GROUPS.map(([label, keys]) => {
                const addable = keys.filter((key) => !visibleKeys.includes(key))
                if (addable.length === 0) return null
                return (
                  <optgroup key={label} label={label}>
                    {addable.map((key) => (
                      <option key={key} value={key}>
                        {FILTER_LABELS[key]}
                      </option>
                    ))}
                  </optgroup>
                )
              })}
            </select>
          </div>

          <footer className={styles.panelFooter}>
            <button
              type="button"
              className={styles.clear}
              onClick={clearAll}
              disabled={activeKeys.length === 0 && draftKeys.length === 0}
            >
              Vyčistit filtr
            </button>
          </footer>
        </div>
      )}
    </div>
  )
}

function FilterIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="7" y1="12" x2="17" y2="12" />
      <line x1="10" y1="17" x2="14" y2="17" />
    </svg>
  )
}
