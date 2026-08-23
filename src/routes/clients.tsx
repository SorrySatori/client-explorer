import { useState } from 'react'
import {
  createFileRoute,
  Outlet,
  useNavigate,
  useParams,
  useRouter,
  useRouterState,
} from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import {
  companyCategoriesQueryOptions,
  companyListQueryOptions,
  COMPANY_RATINGS,
  COMPANY_ROLES,
  COMPANY_STATES,
  type CompanyListParams,
  type CompanyRating,
  type CompanyRole,
  type CompanyState,
} from '../api/companies'
import { ClientsTable } from '../components/ClientsTable'
import {
  ALL_COLUMNS,
  ColumnsModal,
  useVisibleColumns,
} from '../components/columns'
import { ActiveFilters, Filters } from '../components/filters'
import { SearchBox, SEARCH_MIN_LENGTH } from '../components/SearchBox'
import ui from '../styles/ui.module.scss'
import styles from '../styles/clients.module.scss'

interface ClientsSearch {
  q?: string
  name?: string
  person?: boolean
  state?: CompanyState
  role?: CompanyRole
  rating?: CompanyRating
  owner?: number
  economyActivity?: number
  turnover?: number
  legalForm?: number
  paymentTerm?: number
  city?: string
  email?: string
  regNumber?: string
  taxNumber?: string
  category?: number
  classification1?: number
  classification2?: number
  classification3?: number
  tags?: string
  // client-side table sorting (column key from the columns config)
  sort?: string
  sortDir?: 'desc' | 'asc'
}

const oneOf = <T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined => (allowed.includes(value as T) ? (value as T) : undefined)

const nonEmpty = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined

const intId = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isInteger(value) ? value : undefined

const listParams = (search: ClientsSearch): CompanyListParams => ({
  fulltext: search.q,
  name: search.name,
  person: search.person,
  state: search.state,
  role: search.role,
  rating: search.rating,
  owner: search.owner,
  economyActivity: search.economyActivity,
  turnover: search.turnover,
  legalForm: search.legalForm,
  paymentTerm: search.paymentTerm,
  city: search.city,
  email: search.email,
  regNumber: search.regNumber,
  taxNumber: search.taxNumber,
  category: search.category,
  classification1: search.classification1,
  classification2: search.classification2,
  classification3: search.classification3,
  tags: search.tags,
  sortColumn: 'name',
})

export const Route = createFileRoute('/clients')({
  validateSearch: (search: Record<string, unknown>): ClientsSearch => {
    const sort = ALL_COLUMNS.some((column) => column.key === search.sort)
      ? (search.sort as string)
      : undefined
    return {
      sort,
      sortDir: sort
        ? (oneOf(search.sortDir, ['desc', 'asc']) ?? 'desc')
        : undefined,
      q:
        typeof search.q === 'string' &&
        search.q.trim().length >= SEARCH_MIN_LENGTH
          ? search.q
          : undefined,
      name: nonEmpty(search.name),
      person: typeof search.person === 'boolean' ? search.person : undefined,
      state: oneOf(search.state, COMPANY_STATES),
      role: oneOf(search.role, COMPANY_ROLES),
      rating: oneOf(search.rating, COMPANY_RATINGS),
      owner: intId(search.owner),
      economyActivity: intId(search.economyActivity),
      turnover: intId(search.turnover),
      legalForm: intId(search.legalForm),
      paymentTerm: intId(search.paymentTerm),
      city: nonEmpty(search.city),
      email: nonEmpty(search.email),
      regNumber: nonEmpty(search.regNumber),
      taxNumber: nonEmpty(search.taxNumber),
      category: intId(search.category),
      classification1: intId(search.classification1),
      classification2: intId(search.classification2),
      classification3: intId(search.classification3),
      tags: nonEmpty(search.tags),
    }
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(companyListQueryOptions(listParams(deps))),
      queryClient.ensureQueryData(companyCategoriesQueryOptions()),
    ]),
  component: ClientsPage,
  errorComponent: ClientsError,
})

function ClientsError() {
  const router = useRouter()
  return (
    <div className={styles.error}>
      <p>Data klientů se nepodařilo načíst.</p>
      <button
        type="button"
        className={ui.buttonFilter}
        onClick={() => router.invalidate()}
      >
        Zkusit znovu
      </button>
    </div>
  )
}

function ClientsPage() {
  const search = Route.useSearch()
  const { data: list } = useSuspenseQuery(
    companyListQueryOptions(listParams(search)),
  )
  const { visibleKeys, toggleColumn, resetColumns } = useVisibleColumns()
  const [columnsOpen, setColumnsOpen] = useState(false)
  const navigate = useNavigate()
  // number thanks to params.parse on the detail route; undefined = no selection
  const { clientId: selectedId } = useParams({ strict: false })
  // Dim the stale table while a slow search navigation is loading new data
  const isNavigating = useRouterState({ select: (state) => state.isLoading })

  const toggleSelectedClient = (companyId: number) =>
    companyId === selectedId
      ? navigate({ to: '/clients', search: true })
      : navigate({
          to: '/clients/$clientId',
          params: { clientId: companyId },
          search: true,
        })

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Klienti</h1>
        <Filters />
      </div>

      {columnsOpen && (
        <ColumnsModal
          visibleKeys={visibleKeys}
          onToggle={toggleColumn}
          onReset={resetColumns}
          onClose={() => setColumnsOpen(false)}
        />
      )}

      <SearchBox />

      <ActiveFilters />

      <div
        className={`${styles.content}${isNavigating ? ` ${styles.loading}` : ''}`}
      >
        <ClientsTable
          companies={list.data}
          visibleColumnKeys={visibleKeys}
          selectedId={selectedId}
          onSelect={toggleSelectedClient}
          onEditColumns={() => setColumnsOpen(true)}
        />

        <aside className={styles.detail}>
          <Outlet />
        </aside>
      </div>
    </div>
  )
}
