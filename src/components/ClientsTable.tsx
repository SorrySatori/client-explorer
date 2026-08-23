import type { Company } from '../api/companies'
import { ALL_COLUMNS } from './columns'
import styles from './ClientsTable.module.scss'

interface ClientsTableProps {
  companies: Company[]
  visibleColumnKeys: string[]
  selectedId?: number
  onSelect: (companyId: number) => void
  onEditColumns: () => void
}

export function ClientsTable({
  companies,
  visibleColumnKeys,
  selectedId,
  onSelect,
  onEditColumns,
}: ClientsTableProps) {
  const columns = ALL_COLUMNS.filter(
    (column) => column.alwaysOn || visibleColumnKeys.includes(column.key),
  )

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
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
          {companies.map((company) => (
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
          {companies.length === 0 && (
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
