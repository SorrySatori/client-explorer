import type { CodelistEntity } from '../../api/companies'

export const FILTER_KEYS = [
  'name',
  'person',
  'state',
  'role',
  'rating',
  'owner',
  'economyActivity',
  'turnover',
  'legalForm',
  'paymentTerm',
  'city',
  'email',
  'regNumber',
  'taxNumber',
  'category',
  'classification1',
  'classification2',
  'classification3',
  'tags',
] as const

export type FilterKey = (typeof FILTER_KEYS)[number]

export type FilterValue = string | number | boolean | undefined

export const FILTER_LABELS: Record<FilterKey, string> = {
  name: 'Název',
  person: 'Fyzická osoba',
  state: 'Stav',
  role: 'Vztah',
  rating: 'Rating',
  owner: 'Vlastník',
  economyActivity: 'Obor',
  turnover: 'Obrat',
  legalForm: 'Právní forma',
  paymentTerm: 'Platební podmínky',
  city: 'Město',
  email: 'E-mail',
  regNumber: 'IČO',
  taxNumber: 'DIČ',
  category: 'Kategorie',
  classification1: 'Klasifikace 1',
  classification2: 'Klasifikace 2',
  classification3: 'Klasifikace 3',
  tags: 'Štítky',
}

export const FILTER_GROUPS: [label: string, keys: FilterKey[]][] = [
  ['Základní kritéria', ['name', 'person', 'state', 'role', 'rating', 'owner']],
  [
    'Ekonomická kritéria',
    ['economyActivity', 'turnover', 'legalForm', 'paymentTerm'],
  ],
  ['Adresy a kontakty', ['city', 'email']],
  ['Identifikátory', ['regNumber', 'taxNumber']],
  [
    'Zařazení',
    [
      'category',
      'classification1',
      'classification2',
      'classification3',
      'tags',
    ],
  ],
]

// criteria whose value is an id from a Raynet codelist
export const CODELIST_BY_KEY: Partial<Record<FilterKey, CodelistEntity>> = {
  category: 'companyCategory',
  economyActivity: 'economyActivity',
  turnover: 'companyTurnover',
  legalForm: 'legalForm',
  paymentTerm: 'paymentTerm',
  classification1: 'companyClassification1',
  classification2: 'companyClassification2',
  classification3: 'companyClassification3',
}

// criteria with a free-text value (matched as "contains" unless noted)
export const TEXT_PLACEHOLDERS: Partial<Record<FilterKey, string>> = {
  name: 'Obsahuje…',
  city: 'Obsahuje…',
  email: 'Obsahuje…',
  regNumber: 'Přesná shoda',
  taxNumber: 'Přesná shoda',
  tags: 'Více štítků oddělte čárkou',
}
