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
  type CompanyListParams,
} from '../api/companies'
import { ClientsTable } from '../components/ClientsTable'
import { SearchBox, SEARCH_MIN_LENGTH } from '../components/SearchBox'
import ui from '../styles/ui.module.scss'
import styles from '../styles/clients.module.scss'

interface ClientsSearch {
  q?: string
}

const listParams = (q?: string): CompanyListParams => ({
  fulltext: q,
  sortColumn: 'name',
})

export const Route = createFileRoute('/clients')({
  validateSearch: (search: Record<string, unknown>): ClientsSearch => ({
    q:
      typeof search.q === 'string' &&
      search.q.trim().length >= SEARCH_MIN_LENGTH
        ? search.q
        : undefined,
  }),
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ context: { queryClient }, deps }) =>
    Promise.all([
      queryClient.ensureQueryData(companyListQueryOptions(listParams(deps.q))),
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
  const { q } = Route.useSearch()
  const { data: list } = useSuspenseQuery(
    companyListQueryOptions(listParams(q)),
  )
  const navigate = useNavigate()
  const { clientId } = useParams({ strict: false })
  const isNavigating = useRouterState({ select: (state) => state.isLoading })

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Klienti</h1>

      <SearchBox />

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
