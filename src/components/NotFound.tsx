import { Link } from '@tanstack/react-router'
import ui from '../styles/ui.module.scss'
import styles from './NotFound.module.scss'

export function NotFound() {
  return (
    <div className={styles.notFound}>
      <p className={styles.code}>404</p>
      <p>Stránka nenalezena.</p>
      <Link to="/clients" className={`${ui.buttonFilter} ${styles.backLink}`}>
        Zpět na klienty
      </Link>
    </div>
  )
}
