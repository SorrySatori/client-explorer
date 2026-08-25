import styles from './Sidebar.module.scss'

// Only the section that actually exists in this app — decorative icons for
// features we don't have (calendar, documents, settings…) would be confusing
export function Sidebar() {
  return (
    <nav className={styles.sidebar} aria-label="Hlavní navigace">
      <img className={styles.logo} src="/logo.svg" alt="" />

      <span className={styles.iconActive} title="Adresář">
        <UsersIcon />
      </span>
    </nav>
  )
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

function UsersIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20c0-3.5 3-5.5 6.5-5.5s6.5 2 6.5 5.5" />
      <circle cx="17.5" cy="9" r="2.5" />
      <path d="M16.5 14.7c2.8.3 5 2 5 4.8" />
    </svg>
  )
}
