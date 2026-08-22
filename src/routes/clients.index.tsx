import { createFileRoute } from '@tanstack/react-router'
import styles from '../styles/detail.module.scss'

export const Route = createFileRoute('/clients/')({
  component: NoClientSelected,
})

function NoClientSelected() {
  return <div className={styles.placeholder}>Vyberte klienta ze seznamu.</div>
}
