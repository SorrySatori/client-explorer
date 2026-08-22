import { useState } from 'react'
import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  codelistQueryOptions,
  COMPANY_RATINGS,
  COMPANY_ROLES,
  COMPANY_STATES,
  usersQueryOptions,
  type CodelistEntity,
} from '../api/companies'
import { ROLE_LABELS, STATE_LABELS } from '../labels'
import ui from '../styles/ui.module.scss'
import styles from './Filters.module.scss'

const route = getRouteApi('/clients')

// Filter criteria supported by the app — the subset of Raynet's
// "Kritéria klientů" that the company list API can filter server-side.
// Saved filters and smart filters are out of scope.
const FILTER_KEYS = [
  'name',
  'person',
  'state',
  'role',
  'rating',
  'owner',
  'economyActivity',
  'turnover',
  'legalForm',
  'paymentTerm',
  'city',
  'email',
  'regNumber',
  'taxNumber',
  'category',
  'classification1',
  'classification2',
  'classification3',
  'tags',
] as const

type FilterKey = (typeof FILTER_KEYS)[number]

const FILTER_LABELS: Record<FilterKey, string> = {
  name: 'Název',
  person: 'Fyzická osoba',
  state: 'Stav',
  role: 'Vztah',
  rating: 'Rating',
  owner: 'Vlastník',
  economyActivity: 'Obor',
  turnover: 'Obrat',
  legalForm: 'Právní forma',
  paymentTerm: 'Platební podmínky',
  city: 'Město',
  email: 'E-mail',
  regNumber: 'IČO',
  taxNumber: 'DIČ',
  category: 'Kategorie',
  classification1: 'Klasifikace 1',
  classification2: 'Klasifikace 2',
  classification3: 'Klasifikace 3',
  tags: 'Štítky',
}

// Grouping of the "+ Přidat podmínku" combobox, mirroring Raynet's sections
const FILTER_GROUPS: [label: string, keys: FilterKey[]][] = [
  ['Základní kritéria', ['name', 'person', 'state', 'role', 'rating', 'owner']],
  [
    'Ekonomická kritéria',
    ['economyActivity', 'turnover', 'legalForm', 'paymentTerm'],
  ],
  ['Adresy a kontakty', ['city', 'email']],
  ['Identifikátory', ['regNumber', 'taxNumber']],
  [
    'Zařazení',
    [
      'category',
      'classification1',
      'classification2',
      'classification3',
      'tags',
    ],
  ],
]

// criteria whose value is an id from a Raynet codelist
const CODELIST_BY_KEY: Partial<Record<FilterKey, CodelistEntity>> = {
  category: 'companyCategory',
  economyActivity: 'economyActivity',
  turnover: 'companyTurnover',
  legalForm: 'legalForm',
  paymentTerm: 'paymentTerm',
  classification1: 'companyClassification1',
  classification2: 'companyClassification2',
  classification3: 'companyClassification3',
}

// criteria with a free-text value (matched as "contains" unless noted)
const TEXT_PLACEHOLDERS: Partial<Record<FilterKey, string>> = {
  name: 'Obsahuje…',
  city: 'Obsahuje…',
  email: 'Obsahuje…',
  regNumber: 'Přesná shoda',
  taxNumber: 'Přesná shoda',
  tags: 'Více štítků oddělte čárkou',
}

type FilterValue = string | number | boolean | undefined

// Clears all filter params from the URL (keeps fulltext and selection)
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

// "Filtrováno" indicator + removable chips with the currently applied
// criteria + "Vyčistit filtry", shown above the table (as in Raynet)
export function ActiveFilters() {
  const search = route.useSearch()
  const navigate = useNavigate()
  const clearFilters = useClearFilters()

  const activeKeys = FILTER_KEYS.filter((key) => search[key] !== undefined)
  if (activeKeys.length === 0) return null

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
          {FILTER_LABELS[key]}:{' '}
          <strong>
            <FilterValueLabel filterKey={key} value={search[key]} />
          </strong>
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

// Human-readable value of an applied criterion (resolves codelist ids and
// user ids to names; falls back to the raw value while lists load)
function FilterValueLabel({
  filterKey,
  value,
}: {
  filterKey: FilterKey
  value: FilterValue
}) {
  const codelistEntity = CODELIST_BY_KEY[filterKey]
  const codelist = useQuery({
    ...codelistQueryOptions(codelistEntity ?? 'companyCategory'),
    enabled: codelistEntity !== undefined,
  })
  const users = useQuery({
    ...usersQueryOptions(),
    enabled: filterKey === 'owner',
  })

  if (codelistEntity) {
    return (
      codelist.data?.data.find((item) => item.id === value)?.code01 ??
      String(value)
    )
  }

  switch (filterKey) {
    case 'person':
      return value ? 'Ano' : 'Ne'
    case 'state':
      return STATE_LABELS[value as keyof typeof STATE_LABELS]
    case 'role':
      return ROLE_LABELS[value as keyof typeof ROLE_LABELS]
    case 'owner':
      return (
        users.data?.data.find((user) => user.person?.id === value)?.person
          ?.fullName ?? String(value)
      )
    default:
      return String(value)
  }
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
  const codelistEntity = CODELIST_BY_KEY[filterKey]
  if (codelistEntity) {
    return (
      <CodelistSelect
        entity={codelistEntity}
        value={value as number | undefined}
        onChange={onChange}
      />
    )
  }

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
    case 'person':
      return (
        <EnumSelect
          value={value === undefined ? undefined : String(value)}
          options={[
            ['true', 'Ano'],
            ['false', 'Ne'],
          ]}
          onChange={(next) =>
            onChange(next === undefined ? undefined : next === 'true')
          }
        />
      )
    case 'owner':
      return (
        <OwnerSelect value={value as number | undefined} onChange={onChange} />
      )
    default:
      return (
        <TextFilterInput
          value={value as string | undefined}
          placeholder={TEXT_PLACEHOLDERS[filterKey] ?? ''}
          onCommit={onChange}
        />
      )
  }
}

function CodelistSelect({
  entity,
  value,
  onChange,
}: {
  entity: CodelistEntity
  value: number | undefined
  onChange: (value: number | undefined) => void
}) {
  const { data, isPending } = useQuery(codelistQueryOptions(entity))

  if (isPending) return <LoadingSelect />
  return (
    <EnumSelect
      value={value !== undefined ? String(value) : undefined}
      options={(data?.data ?? []).map((item) => [String(item.id), item.code01])}
      onChange={(next) => onChange(next ? Number(next) : undefined)}
    />
  )
}

function OwnerSelect({
  value,
  onChange,
}: {
  value: number | undefined
  onChange: (value: number | undefined) => void
}) {
  const { data, isPending } = useQuery(usersQueryOptions())

  if (isPending) return <LoadingSelect />
  const persons = (data?.data ?? []).flatMap((user) =>
    user.person ? [user.person] : [],
  )
  return (
    <EnumSelect
      value={value !== undefined ? String(value) : undefined}
      options={persons.map((person) => [String(person.id), person.fullName])}
      onChange={(next) => onChange(next ? Number(next) : undefined)}
    />
  )
}

function LoadingSelect() {
  return (
    <select className={styles.control} disabled>
      <option>Načítám…</option>
    </select>
  )
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
