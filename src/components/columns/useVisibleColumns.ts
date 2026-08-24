import { useState } from 'react'
import { ALL_COLUMNS, DEFAULT_COLUMN_KEYS } from './columnConfig'

const STORAGE_KEY = 'client-explorer.columns'

function readStored(): string[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    // drop keys that no longer exist (stale storage after a code change)
    const valid = parsed.filter((key) =>
      ALL_COLUMNS.some((column) => column.key === key),
    )
    // a saved selection where every key went stale means defaults,
    // not an empty table
    if (parsed.length > 0 && valid.length === 0) return null
    return valid
  } catch {
    // unavailable storage (private mode) or corrupted JSON — use defaults
    return null
  }
}

export function useVisibleColumns() {
  const [visibleKeys, setVisibleKeys] = useState<string[]>(
    () => readStored() ?? DEFAULT_COLUMN_KEYS,
  )

  const update = (keys: string[]) => {
    setVisibleKeys(keys)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keys))
    } catch {
      // storage full or unavailable — the selection still works in-memory
    }
  }

  const toggleColumn = (key: string) =>
    update(
      visibleKeys.includes(key)
        ? visibleKeys.filter((item) => item !== key)
        : [...visibleKeys, key],
    )

  const resetColumns = () => update(DEFAULT_COLUMN_KEYS)

  return { visibleKeys, toggleColumn, resetColumns }
}
