import type { ReactNode } from 'react'
import type { Company, EnumRef } from '../../api/companies'
import { ROLE_LABELS } from '../../constants/labels'
import { CategoryChip } from '../CategoryChip'
import { ClientState } from '../ClientState'

export interface ColumnDef {
  key: string
  label: string
  render: (company: Company) => ReactNode
  alwaysOn?: boolean
}

const dash = (value: string | null | undefined) => value ?? '—'
const enumValue = (ref: EnumRef | null) => ref?.value ?? '—'

export const COLUMN_GROUPS: [label: string, columns: ColumnDef[]][] = [
  [
    'Základní údaje',
    [
      {
        key: 'name',
        label: 'Název/Jméno',
        render: (company) => company.name,
        alwaysOn: true,
      },
      {
        key: 'state',
        label: 'Stav',
        render: (company) => <ClientState state={company.state} />,
      },
      {
        key: 'role',
        label: 'Vztah',
        render: (company) => ROLE_LABELS[company.role],
      },
      { key: 'rating', label: 'Rating', render: (company) => company.rating },
      {
        key: 'owner',
        label: 'Vlastník',
        render: (company) => dash(company.owner?.fullName),
      },
      {
        key: 'economyActivity',
        label: 'Obor',
        render: (company) => enumValue(company.economyActivity),
      },
      {
        key: 'createdAt',
        label: 'Zaevidováno',
        render: (company) => dash(company['rowInfo.createdAt']),
      },
      {
        key: 'updatedAt',
        label: 'Naposledy změněno',
        render: (company) => dash(company['rowInfo.updatedAt']),
      },
    ],
  ],
  [
    'Adresy a kontakty',
    [
      {
        key: 'email',
        label: 'E-mail',
        render: (company) => dash(company.primaryAddress?.contactInfo.email),
      },
      {
        key: 'tel',
        label: 'Telefon',
        render: (company) => dash(company.primaryAddress?.contactInfo.tel1),
      },
      {
        key: 'www',
        label: 'Www',
        render: (company) => dash(company.primaryAddress?.contactInfo.www),
      },
      {
        key: 'street',
        label: 'Ulice',
        render: (company) => dash(company.primaryAddress?.address.street),
      },
      {
        key: 'city',
        label: 'Město',
        render: (company) => dash(company.primaryAddress?.address.city),
      },
      {
        key: 'zipCode',
        label: 'PSČ',
        render: (company) => dash(company.primaryAddress?.address.zipCode),
      },
      {
        key: 'country',
        label: 'Země',
        render: (company) => dash(company.primaryAddress?.address.country),
      },
    ],
  ],
  [
    'Zařazení',
    [
      {
        key: 'category',
        label: 'Kategorie',
        render: (company) =>
          company.category && <CategoryChip category={company.category} />,
      },
      {
        key: 'classification1',
        label: 'Klasifikace 1',
        render: (company) => enumValue(company.companyClassification1),
      },
      {
        key: 'classification2',
        label: 'Klasifikace 2',
        render: (company) => enumValue(company.companyClassification2),
      },
      {
        key: 'classification3',
        label: 'Klasifikace 3',
        render: (company) => enumValue(company.companyClassification3),
      },
      {
        key: 'tags',
        label: 'Štítky',
        render: (company) =>
          company.tags.length > 0 ? company.tags.join(', ') : '—',
      },
    ],
  ],
  [
    'Další údaje',
    [
      {
        key: 'regNumber',
        label: 'IČO',
        render: (company) => dash(company.regNumber),
      },
      {
        key: 'taxNumber',
        label: 'DIČ',
        render: (company) => dash(company.taxNumber),
      },
      {
        key: 'person',
        label: 'Fyzická osoba',
        render: (company) => (company.person ? 'Ano' : 'Ne'),
      },
      {
        key: 'legalForm',
        label: 'Právní forma',
        render: (company) => enumValue(company.legalForm),
      },
      {
        key: 'turnover',
        label: 'Obrat',
        render: (company) => enumValue(company.turnover),
      },
      {
        key: 'paymentTerm',
        label: 'Platební podmínky',
        render: (company) => enumValue(company.paymentTerm),
      },
    ],
  ],
]

export const ALL_COLUMNS: ColumnDef[] = COLUMN_GROUPS.flatMap(
  ([, columns]) => columns,
)

// the table as it looked before columns became configurable
export const DEFAULT_COLUMN_KEYS = [
  'name',
  'state',
  'role',
  'rating',
  'owner',
  'regNumber',
  'city',
  'category',
]
