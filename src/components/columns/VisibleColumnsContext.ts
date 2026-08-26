import { createContext } from 'react'
import { DEFAULT_COLUMN_KEYS } from './columnConfig'

// The list page owns the column selection (useVisibleColumns); the detail
// route reads it through context so its fields mirror the visible columns
export const VisibleColumnsContext =
  createContext<string[]>(DEFAULT_COLUMN_KEYS)
