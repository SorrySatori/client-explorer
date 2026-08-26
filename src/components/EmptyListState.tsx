import { useNavigate } from '@tanstack/react-router'
import { FILTER_KEYS } from './filters/filterConfig'
import styles from './EmptyListState.module.scss'

export function EmptyListState({
  hasActiveCriteria,
}: {
  hasActiveCriteria: boolean
}) {
  const navigate = useNavigate()

  const clearEverything = () =>
    navigate({
      to: '.',
      search: (prev: Record<string, unknown>) => ({
        ...prev,
        ...Object.fromEntries(FILTER_KEYS.map((key) => [key, undefined])),
        q: undefined,
        page: undefined,
      }),
      replace: true,
    })

  return (
    <div className={styles.placeholder}>
      <img src="/empty-list.svg" alt="" />
      {hasActiveCriteria ? (
        <>
          <p>Filtr nevyhovuje žádným záznamům</p>
          <button type="button" onClick={clearEverything}>
            Vyčistit filtry
          </button>
        </>
      ) : (
        <p>Žádní klienti nenalezeni.</p>
      )}
    </div>
  )
}
