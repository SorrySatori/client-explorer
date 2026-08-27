import { useEffect, useRef } from 'react'
import { COLUMN_GROUPS } from './columnConfig'
import styles from './ColumnsModal.module.scss'

interface ColumnsModalProps {
  visibleKeys: string[]
  onToggle: (key: string) => void
  onReset: () => void
  onClose: () => void
}

export function ColumnsModal({
  visibleKeys,
  onToggle,
  onReset,
  onClose,
}: ColumnsModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    // guard: StrictMode runs effects twice and showModal throws on an
    // already-open dialog
    if (!dialogRef.current?.open) dialogRef.current?.showModal()
  }, [])

  return (
    <dialog
      ref={dialogRef}
      className={styles.modal}
      aria-label="Výběr sloupců"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className={styles.body}>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label="Zavřít výběr sloupců"
        >
          ✕
        </button>

        <h2 className={styles.title}>Vyberte si sloupce</h2>

        <div className={styles.groups}>
          {COLUMN_GROUPS.map(([label, columns]) => (
            <section key={label}>
              <h3 className={styles.groupTitle}>{label}</h3>
              {columns.map((column) => (
                <label key={column.key} className={styles.option}>
                  <input
                    type="checkbox"
                    checked={
                      column.alwaysOn || visibleKeys.includes(column.key)
                    }
                    disabled={column.alwaysOn}
                    onChange={() => onToggle(column.key)}
                  />
                  {column.label}
                </label>
              ))}
            </section>
          ))}
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.reset} onClick={onReset}>
            Obnovit výchozí nastavení sloupců
          </button>
        </footer>
      </div>
    </dialog>
  )
}
