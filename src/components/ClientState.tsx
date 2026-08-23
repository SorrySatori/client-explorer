import type { CompanyState } from '../api/companies'
import { STATE_LABELS } from '../constants/labels'
import styles from './ClientState.module.scss'

const STATE_CLASS: Record<CompanyState, string> = {
  A_POTENTIAL: styles.potential,
  B_ACTUAL: styles.actual,
  C_DEFERRED: styles.deferred,
  D_UNATTRACTIVE: styles.unattractive,
}

export function ClientState({ state }: { state: CompanyState }) {
  return <span className={STATE_CLASS[state]}>{STATE_LABELS[state]}</span>
}
