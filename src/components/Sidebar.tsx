import styles from './Sidebar.module.scss'

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

function UsersIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M9 13c2.67 0 8 1.34 8 4v3H1v-3c0-2.66 5.33-4 8-4zm7.67.13c2.76.4 6.33 1.69 6.33 3.87v3h-4v-3c0-1.68-.96-2.94-2.33-3.87zM9 15c-2.7 0-5.8 1.29-6 2.01V18h12v-1c-.2-.71-3.3-2-6-2zm6-11c2.21 0 4 1.79 4 4s-1.79 4-4 4c-.47 0-.91-.1-1.33-.24a5.98 5.98 0 000-7.52C14.09 4.1 14.53 4 15 4zM9 4c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"
      />
    </svg>
  )
}
