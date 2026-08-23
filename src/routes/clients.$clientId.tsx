import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import DOMPurify from 'dompurify'
import {
  companyDetailQueryOptions,
  companyLogoQueryOptions,
} from '../api/companies'
import { CategoryChip } from '../components/CategoryChip'
import { ClientState } from '../components/ClientState'
import styles from '../styles/detail.module.scss'

export const Route = createFileRoute('/clients/$clientId')({
  params: {
    parse: (params) => ({ clientId: Number(params.clientId) }),
    stringify: (params) => ({ clientId: String(params.clientId) }),
  },
  loader: ({ context: { queryClient }, params }) =>
    queryClient.ensureQueryData(companyDetailQueryOptions(params.clientId)),
  errorComponent: DetailError,
  component: ClientDetailPanel,
})

function ClientDetailPanel() {
  const { clientId } = Route.useParams()
  const { data: client } = useSuspenseQuery(companyDetailQueryOptions(clientId))
  const address = client.primaryAddress?.address

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
          {client.regNumber && (
            <>
              <dt>IČ</dt>
              <dd>{client.regNumber}</dd>
            </>
          )}
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
