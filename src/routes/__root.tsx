import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from '@tanstack/react-router'
import type { ReactNode } from 'react'
import type { QueryClient } from '@tanstack/react-query'
import { Sidebar } from '../components/Sidebar'
import styles from '../styles/layout.module.scss'
import appCss from '../index.scss?url'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      { title: 'client-explorer' },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' },
      { rel: 'stylesheet', href: appCss },
    ],
  }),
  // SPA mode: routes never render on the server (loaders fetch the relative
  // /api proxy, which only a browser can resolve); inherited by all routes
  ssr: false,
  shellComponent: RootDocument,
  component: RootLayout,
})

// The HTML document around the app — replaces the former index.html
function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="cs">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout() {
  return (
    <div className={styles.app}>
      <Sidebar />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
