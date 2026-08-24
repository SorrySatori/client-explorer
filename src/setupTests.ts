import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// vitest runs without injected globals, so testing-library cannot register
// its own afterEach — unmount between tests explicitly
afterEach(cleanup)

// TanStack Router restores scroll on navigation; jsdom has no scrollTo
window.scrollTo = () => {}
