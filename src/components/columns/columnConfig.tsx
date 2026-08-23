import type { ReactNode } from 'react'
import type { Company, EnumRef } from '../../api/companies'
import { ROLE_LABELS, STATE_LABELS } from '../../constants/labels'
import { CategoryChip } from '../CategoryChip'
import { ClientState } from '../ClientState'

type SortValue = string | number | null

export interface ColumnDef {
  key: string
  label: string
  render: (company: Company) => ReactNode
  sortValue: (company: Company) => SortValue
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
        sortValue: (company) => company.name,
        alwaysOn: true,
      },
      {
        key: 'state',
        label: 'Stav',
        render: (company) => <ClientState state={company.state} />,
        sortValue: (company) => STATE_LABELS[company.state],
      },
      {
        key: 'role',
        label: 'Vztah',
        render: (company) => ROLE_LABELS[company.role],
        sortValue: (company) => ROLE_LABELS[company.role],
      },
      {
        key: 'rating',
        label: 'Rating',
        render: (company) => company.rating,
        sortValue: (company) => company.rating,
      },
      {
        key: 'owner',
        label: 'Vlastník',
        render: (company) => dash(company.owner?.fullName),
        sortValue: (company) => company.owner?.fullName ?? null,
      },
      {
        key: 'economyActivity',
        label: 'Obor',
        render: (company) => enumValue(company.economyActivity),
        sortValue: (company) => company.economyActivity?.value ?? null,
      },
      {
        key: 'createdAt',
        label: 'Zaevidováno',
        render: (company) => dash(company['rowInfo.createdAt']),
        // "YYYY-MM-DD HH:mm" sorts correctly as text
        sortValue: (company) => company['rowInfo.createdAt'],
      },
      {
        key: 'updatedAt',
        label: 'Naposledy změněno',
        render: (company) => dash(company['rowInfo.updatedAt']),
        sortValue: (company) => company['rowInfo.updatedAt'],
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
        sortValue: (company) =>
          company.primaryAddress?.contactInfo.email ?? null,
      },
      {
        key: 'tel',
        label: 'Telefon',
        render: (company) => dash(company.primaryAddress?.contactInfo.tel1),
        sortValue: (company) =>
          company.primaryAddress?.contactInfo.tel1 ?? null,
      },
      {
        key: 'www',
        label: 'Www',
        render: (company) => dash(company.primaryAddress?.contactInfo.www),
        sortValue: (company) => company.primaryAddress?.contactInfo.www ?? null,
      },
      {
        key: 'street',
        label: 'Ulice',
        render: (company) => dash(company.primaryAddress?.address.street),
        sortValue: (company) => company.primaryAddress?.address.street ?? null,
      },
      {
        key: 'city',
        label: 'Město',
        render: (company) => dash(company.primaryAddress?.address.city),
        sortValue: (company) => company.primaryAddress?.address.city ?? null,
      },
      {
        key: 'zipCode',
        label: 'PSČ',
        render: (company) => dash(company.primaryAddress?.address.zipCode),
        sortValue: (company) => company.primaryAddress?.address.zipCode ?? null,
      },
      {
        key: 'country',
        label: 'Země',
        render: (company) => dash(company.primaryAddress?.address.country),
        sortValue: (company) => company.primaryAddress?.address.country ?? null,
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
        sortValue: (company) => company.category?.value ?? null,
      },
      {
        key: 'classification1',
        label: 'Klasifikace 1',
        render: (company) => enumValue(company.companyClassification1),
        sortValue: (company) => company.companyClassification1?.value ?? null,
      },
      {
        key: 'classification2',
        label: 'Klasifikace 2',
        render: (company) => enumValue(company.companyClassification2),
        sortValue: (company) => company.companyClassification2?.value ?? null,
      },
      {
        key: 'classification3',
        label: 'Klasifikace 3',
        render: (company) => enumValue(company.companyClassification3),
        sortValue: (company) => company.companyClassification3?.value ?? null,
      },
      {
        key: 'tags',
        label: 'Štítky',
        render: (company) =>
          company.tags.length > 0 ? company.tags.join(', ') : '—',
        sortValue: (company) =>
          company.tags.length > 0 ? company.tags.join(', ') : null,
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
        sortValue: (company) => company.regNumber,
      },
      {
        key: 'taxNumber',
        label: 'DIČ',
        render: (company) => dash(company.taxNumber),
        sortValue: (company) => company.taxNumber,
      },
      {
        key: 'person',
        label: 'Fyzická osoba',
        render: (company) => (company.person ? 'Ano' : 'Ne'),
        sortValue: (company) => (company.person ? 'Ano' : 'Ne'),
      },
      {
        key: 'legalForm',
        label: 'Právní forma',
        render: (company) => enumValue(company.legalForm),
        sortValue: (company) => company.legalForm?.value ?? null,
      },
      {
        key: 'turnover',
        label: 'Obrat',
        render: (company) => enumValue(company.turnover),
        sortValue: (company) => company.turnover?.value ?? null,
      },
      {
        key: 'paymentTerm',
        label: 'Platební podmínky',
        render: (company) => enumValue(company.paymentTerm),
        sortValue: (company) => company.paymentTerm?.value ?? null,
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
