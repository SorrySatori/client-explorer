import styles from './Sidebar.module.scss'

export function Sidebar() {
  return (
    <nav className={styles.sidebar} aria-label="Hlavní navigace">
      <div className={styles.logo} aria-hidden="true">
        R
      </div>

      <span className={styles.icon} title="Vyhledávání">
        <SearchIcon />
      </span>
      <span className={styles.iconActive} title="Adresář">
        <UsersIcon />
      </span>
      <span className={styles.icon} title="Kalendář">
        <CalendarIcon />
      </span>
      <span className={styles.icon} title="Dokumenty">
        <DocumentIcon />
      </span>

      <span className={styles.spacer} />

      <span className={styles.icon} title="Nastavení">
        <GearIcon />
      </span>
    </nav>
  )
}

const iconProps = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

function SearchIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16" y2="16" />
    </svg>
  )
}

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

function CalendarIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="8" y1="3" x2="8" y2="7" />
      <line x1="16" y1="3" x2="16" y2="7" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg {...iconProps}>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4" />
      <line x1="9" y1="12" x2="16" y2="12" />
      <line x1="9" y1="16" x2="16" y2="16" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1" />
    </svg>
  )
}
