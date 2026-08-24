import styles from './PendingFallback.module.scss'

// Router-level pending fallback: in SPA mode the first visit has no data at
// all, so without this the content area would stay blank for the whole
// initial fetch
export function PendingFallback() {
  return (
    <div className={styles.pending} role="status">
      <span className={styles.spinner} aria-hidden="true" />
      Načítám data…
    </div>
  )
}
