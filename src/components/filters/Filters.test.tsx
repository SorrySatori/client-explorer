import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Filters } from './Filters'
import { ActiveFilters } from './ActiveFilters'

// Mounts Filters + ActiveFilters on a minimal in-memory /clients route so
// the components talk to a real router (URL search params are their state)
function setup(initialSearch = '') {
  const rootRoute = createRootRoute()
  const clientsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/clients',
    component: () => (
      <>
        <Filters />
        <ActiveFilters />
      </>
    ),
  })
  const router = createRouter({
    routeTree: rootRoute.addChildren([clientsRoute]),
    history: createMemoryHistory({
      initialEntries: [`/clients${initialSearch}`],
    }),
  })
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { router, user: userEvent.setup() }
}

const openPanel = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('button', { name: /filtrování/i }))
}

describe('Filters', () => {
  it('applies an enum criterion to the URL and shows it as an active chip', async () => {
    const { router, user } = setup()
    await openPanel(user)

    await user.selectOptions(
      screen.getByDisplayValue('+ Přidat podmínku'),
      'state',
    )
    await user.selectOptions(screen.getByDisplayValue('— vyberte —'), 'B_ACTUAL')

    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({
        state: 'B_ACTUAL',
      }),
    )
    // count badge on the trigger + human-readable chip
    expect(
      screen.getByRole('button', { name: /filtrování\s*1/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /stav:\s*aktuální/i }),
    ).toBeInTheDocument()
  })

  it('commits a text criterion on Enter', async () => {
    const { router, user } = setup()
    await openPanel(user)

    await user.selectOptions(
      screen.getByDisplayValue('+ Přidat podmínku'),
      'name',
    )
    await user.type(screen.getByPlaceholderText('Obsahuje…'), 'raynet{Enter}')

    await waitFor(() =>
      expect(router.state.location.search).toMatchObject({ name: 'raynet' }),
    )
  })

  it('removes a single filter via its active chip', async () => {
    const { router, user } = setup('?state=B_ACTUAL')

    await user.click(
      await screen.findByRole('button', { name: /stav:\s*aktuální/i }),
    )

    await waitFor(() =>
      expect(router.state.location.search).not.toHaveProperty('state'),
    )
    expect(screen.queryByText('Filtrováno')).not.toBeInTheDocument()
  })

  it('clears all filters but keeps the fulltext query', async () => {
    const { router, user } = setup('?state=B_ACTUAL&name=raynet&q=test')
    await openPanel(user)

    await user.click(
      screen.getByRole('button', { name: /^vyčistit filtr$/i }),
    )

    await waitFor(() => {
      expect(router.state.location.search).not.toHaveProperty('state')
      expect(router.state.location.search).not.toHaveProperty('name')
    })
    expect(router.state.location.search).toMatchObject({ q: 'test' })
  })

  it('keeps a URL-applied criterion row visible in the panel', async () => {
    const { user } = setup('?state=B_ACTUAL')
    await openPanel(user)

    expect(
      screen.getByRole('button', { name: 'Odebrat podmínku Stav' }),
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue('Aktuální')).toBeInTheDocument()
  })
})
