import type { Company } from '../api/companies'
import { ALL_COLUMNS, useTableSort, type TableSort } from './columns'
import styles from './ClientsTable.module.scss'

interface ClientsTableProps {
  companies: Company[]
  visibleColumnKeys: string[]
  selectedId?: number
  onSelect: (companyId: number) => void
  onEditColumns: () => void
}

// numeric: "123" < "26843820"; base sensitivity: case/accent-insensitive
const collator = new Intl.Collator('cs', {
  numeric: true,
  sensitivity: 'base',
})

// Sorts what the user sees (column sortValue accessors); the list is loaded
// as a single page capped at MAX_PAGE_SIZE, so client-side sorting covers
// every loaded row — the API itself can only sort by a handful of fields
function sortCompanies(companies: Company[], sort: TableSort): Company[] {
  const column = ALL_COLUMNS.find((item) => item.key === sort.key)
  if (!column) return companies

  return [...companies].sort((x, y) => {
    const a = column.sortValue(x)
    const b = column.sortValue(y)
    // missing values go last in both directions
    if (a === null && b === null) return 0
    if (a === null) return 1
    if (b === null) return -1
    const result =
      typeof a === 'number' && typeof b === 'number'
        ? a - b
        : collator.compare(String(a), String(b))
    return sort.direction === 'desc' ? -result : result
  })
}

export function ClientsTable({
  companies,
  visibleColumnKeys,
  selectedId,
  onSelect,
  onEditColumns,
}: ClientsTableProps) {
  const { sort, cycleSort } = useTableSort()

  // config order determines column order, the picker only says which
  const columns = ALL_COLUMNS.filter(
    (column) => column.alwaysOn || visibleColumnKeys.includes(column.key),
  )
  const rows = sort ? sortCompanies(companies, sort) : companies

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                aria-sort={
                  sort?.key === column.key
                    ? sort.direction === 'desc'
                      ? 'descending'
                      : 'ascending'
                    : undefined
                }
              >
                <button
                  type="button"
                  className={styles.sortButton}
                  onClick={() => cycleSort(column.key)}
                >
                  {column.label}
                  {sort?.key === column.key && (
                    <span className={styles.sortArrow} aria-hidden="true">
                      {sort.direction === 'desc' ? '▼' : '▲'}
                    </span>
                  )}
                </button>
              </th>
            ))}
            <th className={styles.editColumns}>
              <button
                type="button"
                onClick={onEditColumns}
                aria-label="Upravit sloupce"
                title="Upravit sloupce"
              >
                <PencilIcon />
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((company) => (
            <tr
              key={company.id}
              className={
                company.id === selectedId ? styles.rowSelected : undefined
              }
              onClick={() => onSelect(company.id)}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={column.key === 'name' ? styles.name : undefined}
                >
                  {column.render(company)}
                </td>
              ))}
              <td />
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length + 1} className={styles.empty}>
                Žádní klienti nenalezeni.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

function PencilIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 3a2.8 2.8 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  )
}
