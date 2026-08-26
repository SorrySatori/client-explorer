import { Fragment, useContext } from 'react'
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import DOMPurify from 'dompurify'
import {
  companyDetailQueryOptions,
  companyLogoQueryOptions,
} from '../api/companies'
import { ApiError } from '../api/http'
import { ALL_COLUMNS, VisibleColumnsContext } from '../components/columns'
import { CategoryChip } from '../components/CategoryChip'
import { ClientState } from '../components/ClientState'
import styles from '../styles/detail.module.scss'

// column keys that have a dedicated slot in the card layout (name is
// the heading, state/category the header chips, owner the footer line,
// address fields the ADRESA block) — the generic field list skips them
// so nothing renders twice
const FIELDS_WITH_DEDICATED_SLOT = new Set([
  'name',
  'state',
  'category',
  'owner',
  'street',
  'city',
  'zipCode',
  'country',
])

export const Route = createFileRoute('/clients/$clientId')({
  params: {
    parse: (params) => {
      const clientId = Number(params.clientId)
      // reject /clients/foo up front instead of burning a rate-limited
      // API request on company/NaN/
      if (!Number.isInteger(clientId) || clientId <= 0) {
        throw notFound()
      }
      return { clientId }
    },
    stringify: (params) => ({ clientId: String(params.clientId) }),
  },
  loader: async ({ context: { queryClient }, params }) => {
    try {
      return await queryClient.ensureQueryData(
        companyDetailQueryOptions(params.clientId),
      )
    } catch (error) {
      // a well-formed id the API doesn't know is a 404, not a failure
      if (error instanceof ApiError && error.status === 404) throw notFound()
      throw error
    }
  },
  errorComponent: DetailError,
  notFoundComponent: DetailNotFound,
  component: ClientDetailPanel,
})

function DetailNotFound() {
  return <div className={styles.placeholder}>Klient nenalezen.</div>
}

function ClientDetailPanel() {
  const { clientId } = Route.useParams()
  const { data: client } = useSuspenseQuery(companyDetailQueryOptions(clientId))
  const address = client.primaryAddress?.address
  // mirror the user's column selection: whatever is visible in the table
  // shows as a field here (the column config provides label + rendering)
  const visibleKeys = useContext(VisibleColumnsContext)
  const detailFields = ALL_COLUMNS.filter(
    (column) =>
      visibleKeys.includes(column.key) &&
      !FIELDS_WITH_DEDICATED_SLOT.has(column.key),
  )

  return (
    <article className={styles.card}>
      <header className={styles.header}>
        {client.category && <CategoryChip category={client.category} />}
        <ClientState state={client.state} />
        <Link
          to="/clients"
          search={true}
          className={styles.close}
          aria-label="Zavřít detail"
        >
          ✕
        </Link>
      </header>

      <h2 className={styles.name}>{client.name}</h2>

      <div className={styles.meta}>
        {client.logo && <CompanyLogo fileId={client.logo.id} />}
        <dl className={styles.info}>
          {detailFields.map((column) => (
            <Fragment key={column.key}>
              <dt>{column.label}</dt>
              <dd>{column.render(client)}</dd>
            </Fragment>
          ))}
          {address && (
            <>
              <dt>Adresa</dt>
              <dd>
                {address.street && <div>{address.street}</div>}
                {(address.zipCode || address.city) && (
                  <div>
                    {[address.zipCode, address.city].filter(Boolean).join(' ')}
                  </div>
                )}
                {address.country && <div>{address.country}</div>}
                <a
                  href={mapsUrl(address)}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.mapLink}
                >
                  Zobrazit na mapě
                </a>
              </dd>
            </>
          )}
        </dl>
      </div>

      {client.notice && (
        // Raynet stores the note as rich-text HTML; sanitize before rendering
        <div
          className={styles.notice}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(client.notice),
          }}
        />
      )}

      {client.owner && (
        <p className={styles.owner}>
          Vlastník: <strong>{client.owner.fullName}</strong>
        </p>
      )}
    </article>
  )
}

function mapsUrl(address: {
  street: string | null
  city: string | null
  zipCode: string | null
  country: string | null
}) {
  const query = [address.street, address.zipCode, address.city, address.country]
    .filter(Boolean)
    .join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

function CompanyLogo({ fileId }: { fileId: number }) {
  const { data } = useQuery(companyLogoQueryOptions(fileId))
  if (!data) return null
  return <img className={styles.logo} src={data.imgData} alt="Logo klienta" />
}

function DetailError() {
  return <div className={styles.placeholder}>Klienta se nepodařilo načíst.</div>
}
