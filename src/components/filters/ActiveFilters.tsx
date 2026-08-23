import { getRouteApi, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { codelistQueryOptions, usersQueryOptions } from '../../api/companies'
import { ROLE_LABELS, STATE_LABELS } from '../../constants/labels'
import {
  CODELIST_BY_KEY,
  FILTER_KEYS,
  FILTER_LABELS,
  type FilterKey,
  type FilterValue,
} from './filterConfig'
import { useClearFilters } from './useClearFilters'
import styles from './ActiveFilters.module.scss'

const route = getRouteApi('/clients')

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
