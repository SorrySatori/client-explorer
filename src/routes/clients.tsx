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
import { ActiveFilters, Filters } from '../components/Filters'
import { SearchBox, SEARCH_MIN_LENGTH } from '../components/SearchBox'
import ui from '../styles/ui.module.scss'
import styles from '../styles/clients.module.scss'

interface ClientsSearch {
  q?: string
  state?: CompanyState
  role?: CompanyRole
  rating?: CompanyRating
  category?: number
  city?: string
  regNumber?: string
}

const oneOf = <T extends string>(
  value: unknown,
  allowed: readonly T[],
): T | undefined => (allowed.includes(value as T) ? (value as T) : undefined)

const nonEmpty = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined

const listParams = (search: ClientsSearch): CompanyListParams => ({
  fulltext: search.q,
  state: search.state,
  role: search.role,
  rating: search.rating,
  category: search.category,
  city: search.city,
  regNumber: search.regNumber,
  sortColumn: 'name',
})

export const Route = createFileRoute('/clients')({
  validateSearch: (search: Record<string, unknown>): ClientsSearch => ({
    q:
      typeof search.q === 'string' &&
      search.q.trim().length >= SEARCH_MIN_LENGTH
        ? search.q
        : undefined,
    state: oneOf(search.state, COMPANY_STATES),
    role: oneOf(search.role, COMPANY_ROLES),
    rating: oneOf(search.rating, COMPANY_RATINGS),
    category:
      typeof search.category === 'number' && Number.isInteger(search.category)
        ? search.category
        : undefined,
    city: nonEmpty(search.city),
    regNumber: nonEmpty(search.regNumber),
  }),
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
  const navigate = useNavigate()
  const { clientId } = useParams({ strict: false })
  // Dim the stale table while a slow search navigation is loading new data
  const isNavigating = useRouterState({ select: (state) => state.isLoading })

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Klienti</h1>
        <Filters />
      </div>

      <SearchBox />

      <ActiveFilters />

      <div
        className={`${styles.content}${isNavigating ? ` ${styles.loading}` : ''}`}
      >
        <ClientsTable
          companies={list.data}
          selectedId={clientId ? Number(clientId) : undefined}
          onSelect={(companyId) =>
            navigate({
              to: '/clients/$clientId',
              params: { clientId: String(companyId) },
              search: true,
            })
          }
        />

        <aside className={styles.detail}>
          <Outlet />
        </aside>
      </div>
    </div>
  )
}
