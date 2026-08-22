// Czech labels for Raynet enums (matching Raynet's own UI wording)
import type { CompanyRole, CompanyState } from './api/companies'

export const STATE_LABELS: Record<CompanyState, string> = {
  A_POTENTIAL: 'Potenciální',
  B_ACTUAL: 'Aktuální',
  C_DEFERRED: 'Odložený',
  D_UNATTRACTIVE: 'Nezajímavý',
}

export const ROLE_LABELS: Record<CompanyRole, string> = {
  A_SUBSCRIBER: 'Odběratel',
  B_PARTNER: 'Partner',
  C_SUPPLIER: 'Dodavatel',
  D_RIVAL: 'Konkurent',
  E_OWN: 'Vlastní firma',
}
