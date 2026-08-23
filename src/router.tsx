import { StrictMode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

// TanStack Start convention: called once per pageload to build the router
export function getRouter() {
  // Raynet API is rate-limited (24k requests/day, 4 concurrent connections),
  // so keep data fresh for a minute and avoid aggressive retries.
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
      },
    },
  })

  return createRouter({
    routeTree,
    context: { queryClient },
    defaultPreload: 'intent',
    Wrap: ({ children }) => (
      <StrictMode>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </StrictMode>
    ),
  })
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
