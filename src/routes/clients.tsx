import { createFileRoute } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { companyListQueryOptions } from '../api/companies'

export const Route = createFileRoute('/clients')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(companyListQueryOptions()),
  component: ClientsPage,
})

function ClientsPage() {
  const { data: response } = useSuspenseQuery(companyListQueryOptions())

  return (
    <div>
      <h1>Clients ({response.totalCount})</h1>
      <ul>
        {response.data.map((company) => (
          <li key={company.id}>
            #{company.id} <strong>{company.name}</strong> — rating:{' '}
            {company.rating}, state: {company.state}, role: {company.role},
            city: {company.primaryAddress?.address.city ?? '—'}, email:{' '}
            {company.primaryAddress?.contactInfo.email ?? '—'}
          </li>
        ))}
      </ul>

      <h2>Raw response</h2>
      <pre>{JSON.stringify(response, null, 2)}</pre>
    </div>
  )
}
