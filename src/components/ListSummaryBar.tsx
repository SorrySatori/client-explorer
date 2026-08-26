import { PAGE_SIZES } from './usePagination'
import styles from './ListSummaryBar.module.scss'

interface ListSummaryBarProps {
  totalCount: number
  page: number
  pageCount: number
  pageSize: number
  setPage: (page: number) => void
  setPageSize: (size: number) => void
}

export function ListSummaryBar({
  totalCount,
  page,
  pageCount,
  pageSize,
  setPage,
  setPageSize,
}: ListSummaryBarProps) {
  return (
    <div className={styles.bar}>
      <span>
        Počet <strong>{totalCount}</strong>
      </span>

      <span className={styles.pager}>
        Na stránce
        <select
          value={pageSize}
          onChange={(event) => setPageSize(Number(event.target.value))}
          aria-label="Počet položek na stránce"
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>
              {size} položek
            </option>
          ))}
        </select>
        <span className={styles.pageInfo}>
          Stránka <strong>{page}</strong> z {pageCount}
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page <= 1}
            aria-label="Předchozí stránka"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={page >= pageCount}
            aria-label="Další stránka"
          >
            ›
          </button>
        </span>
      </span>
    </div>
  )
}
