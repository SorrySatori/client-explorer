import { useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  companyCategoriesQueryOptions,
  COMPANY_RATINGS,
  COMPANY_ROLES,
  COMPANY_STATES,
} from '../api/companies'
import { ROLE_LABELS, STATE_LABELS } from '../labels'
import ui from '../styles/ui.module.scss'
import styles from './Filters.module.scss'

const route = getRouteApi('/clients')

const FILTER_KEYS = [
  'state',
  'role',
  'rating',
  'category',
  'city',
  'regNumber',
] as const

type FilterKey = (typeof FILTER_KEYS)[number]

const FILTER_LABELS: Record<FilterKey, string> = {
  state: 'Stav',
  role: 'Vztah',
  rating: 'Rating',
  category: 'Kategorie',
  city: 'Město',
  regNumber: 'IČO',
}

type FilterValue = string | number | undefined

function useClearFilters() {
  const navigate = useNavigate()
  return () =>
    navigate({
      to: '.',
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        ...Object.fromEntries(FILTER_KEYS.map((key) => [key, undefined])),
      }),
      replace: true,
    })
}

export function Filters() {
  const search = route.useSearch()
  const navigate = useNavigate()
  const clearFilters = useClearFilters()
  const [open, setOpen] = useState(false)
  const [draftKeys, setDraftKeys] = useState<FilterKey[]>([])

  const activeKeys = FILTER_KEYS.filter((key) => search[key] !== undefined)
  const visibleKeys = FILTER_KEYS.filter(
    (key) => activeKeys.includes(key) || draftKeys.includes(key),
  )
  const addableKeys = FILTER_KEYS.filter((key) => !visibleKeys.includes(key))

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

            {addableKeys.length > 0 && (
              <select
                className={styles.addSelect}
                value=""
                onChange={(event) => {
                  const key = event.target.value as FilterKey
                  if (key) setDraftKeys((keys) => [...keys, key])
                }}
              >
                <option value="">+ Přidat podmínku</option>
                {addableKeys.map((key) => (
                  <option key={key} value={key}>
                    {FILTER_LABELS[key]}
                  </option>
                ))}
              </select>
            )}
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

export function ActiveFilters() {
  const search = route.useSearch()
  const navigate = useNavigate()
  const clearFilters = useClearFilters()
  const { data: categories } = useSuspenseQuery(companyCategoriesQueryOptions())

  const activeKeys = FILTER_KEYS.filter((key) => search[key] !== undefined)
  if (activeKeys.length === 0) return null

  const valueLabel = (key: FilterKey): string => {
    const value = search[key]
    switch (key) {
      case 'state':
        return STATE_LABELS[value as keyof typeof STATE_LABELS]
      case 'role':
        return ROLE_LABELS[value as keyof typeof ROLE_LABELS]
      case 'category':
        return (
          categories.data.find((item) => item.id === value)?.code01 ??
          String(value)
        )
      default:
        return String(value)
    }
  }

  return (
    <div className={styles.active}>
      <span className={styles.filteredBadge}>Filtrováno</span>
      {activeKeys.map((key) => (
        <button
          key={key}
          type="button"
          className={styles.activeChip}
          onClick={() =>
            navigate({
              to: '.',
              search: (prev: Record<string, unknown>) => ({
                ...prev,
                [key]: undefined,
              }),
              replace: true,
            })
          }
          title="Odebrat filtr"
        >
          {FILTER_LABELS[key]}: <strong>{valueLabel(key)}</strong>
          <span aria-hidden="true"> ✕</span>
        </button>
      ))}
      <button
        type="button"
        className={styles.clearInline}
        onClick={clearFilters}
      >
        ✕ Vyčistit filtry
      </button>
    </div>
  )
}

function FilterControl({
  filterKey,
  value,
  onChange,
}: {
  filterKey: FilterKey
  value: FilterValue
  onChange: (value: FilterValue) => void
}) {
  const { data: categories } = useSuspenseQuery(companyCategoriesQueryOptions())

  switch (filterKey) {
    case 'state':
      return (
        <EnumSelect
          value={value as string | undefined}
          options={COMPANY_STATES.map((state) => [state, STATE_LABELS[state]])}
          onChange={onChange}
        />
      )
    case 'role':
      return (
        <EnumSelect
          value={value as string | undefined}
          options={COMPANY_ROLES.map((role) => [role, ROLE_LABELS[role]])}
          onChange={onChange}
        />
      )
    case 'rating':
      return (
        <EnumSelect
          value={value as string | undefined}
          options={COMPANY_RATINGS.map((rating) => [rating, rating])}
          onChange={onChange}
        />
      )
    case 'category':
      return (
        <EnumSelect
          value={value !== undefined ? String(value) : undefined}
          options={categories.data.map((item) => [
            String(item.id),
            item.code01,
          ])}
          onChange={(next) => onChange(next ? Number(next) : undefined)}
        />
      )
    case 'city':
      return (
        <TextFilterInput
          value={value as string | undefined}
          placeholder="Obsahuje…"
          onCommit={onChange}
        />
      )
    case 'regNumber':
      return (
        <TextFilterInput
          value={value as string | undefined}
          placeholder="Přesná shoda"
          onCommit={onChange}
        />
      )
  }
}

function EnumSelect({
  value,
  options,
  onChange,
}: {
  value: string | undefined
  options: [value: string, label: string][]
  onChange: (value: string | undefined) => void
}) {
  return (
    <select
      className={styles.control}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value || undefined)}
    >
      <option value="">— vyberte —</option>
      {options.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </select>
  )
}

// Text criteria commit on blur / Enter so we don't fire an API request
// per keystroke
function TextFilterInput({
  value,
  placeholder,
  onCommit,
}: {
  value: string | undefined
  placeholder: string
  onCommit: (value: string | undefined) => void
}) {
  const [draft, setDraft] = useState(value ?? '')
  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    setDraft(value ?? '')
  }

  const commit = () => onCommit(draft.trim() || undefined)

  return (
    <input
      className={styles.control}
      type="text"
      value={draft}
      placeholder={placeholder}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') commit()
      }}
    />
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
