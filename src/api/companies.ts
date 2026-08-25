import { queryOptions } from '@tanstack/react-query'
import { getJson, type DetailResponse, type ListResponse } from './http'

export const COMPANY_RATINGS = ['A', 'B', 'C'] as const
export type CompanyRating = (typeof COMPANY_RATINGS)[number]

export const COMPANY_STATES = [
  'A_POTENTIAL',
  'B_ACTUAL',
  'C_DEFERRED',
  'D_UNATTRACTIVE',
] as const
export type CompanyState = (typeof COMPANY_STATES)[number]

export const COMPANY_ROLES = [
  'A_SUBSCRIBER',
  'B_PARTNER',
  'C_SUPPLIER',
  'D_RIVAL',
  'E_OWN',
] as const
export type CompanyRole = (typeof COMPANY_ROLES)[number]

// --- Entities ---

export interface EnumRef {
  id: number
  value: string
}

export interface PersonRef {
  id: number
  fullName: string
}

export interface ContactInfo {
  email: string | null
  email2: string | null
  tel1: string | null
  tel1Type: string | null
  tel2: string | null
  tel2Type: string | null
  www: string | null
  otherContact: string | null
}

export interface Address {
  id: number
  name: string | null
  street: string | null
  city: string | null
  province: string | null
  zipCode: string | null
  country: string | null
  lat: number | null
  lng: number | null
}

export interface CompanyAddress {
  id: number
  primary: boolean | null
  contactAddress: boolean | null
  address: Address
  contactInfo: ContactInfo
  territory: EnumRef | null
}

export interface Company {
  id: number
  name: string
  person: boolean
  firstName: string | null
  lastName: string | null
  rating: CompanyRating
  state: CompanyState
  role: CompanyRole
  owner: PersonRef | null
  regNumber: string | null
  taxNumber: string | null
  category: EnumRef | null
  legalForm: EnumRef | null
  economyActivity: EnumRef | null
  turnover: EnumRef | null
  paymentTerm: EnumRef | null
  companyClassification1: EnumRef | null
  companyClassification2: EnumRef | null
  companyClassification3: EnumRef | null
  primaryAddress: CompanyAddress | null
  contactAddress?: CompanyAddress | null
  notice: string | null
  tags: string[]
  'rowInfo.createdAt': string | null
  'rowInfo.updatedAt': string | null
  _version: number
}

export interface FileRef {
  id: number
  contentType: string
  fileName: string
  size: number
}

export interface CompanyDetail extends Company {
  salutation?: string | null
  taxNumber2?: string | null
  taxPayer?: 'YES' | 'NO' | null
  bankAccount?: string | null
  databox?: string | null
  court?: string | null
  birthday?: string | null
  addresses?: CompanyAddress[]
  socialNetworkContact?: Record<string, string | null> | null
  logo?: FileRef | null
}

// --- Auxiliary endpoints (codelists, users, icons) ---

// Codelist entry (e.g. GET /companyCategory/) — code01 is the label,
// code02 an optional color as a hex value without '#'
export interface CodelistItem {
  id: number
  code01: string
  code02: string | null
}

// Codelists used by the client filters
export type CodelistEntity =
  | 'companyCategory'
  | 'economyActivity'
  | 'companyTurnover'
  | 'legalForm'
  | 'paymentTerm'
  | 'companyClassification1'
  | 'companyClassification2'
  | 'companyClassification3'

export interface UserAccount {
  id: number
  username: string
  person: PersonRef | null
}

// GET /icon/{fileId}/ — imgData is a ready-to-use data: URI
export interface IconResponse {
  fileName: string
  contentType: string
  imgData: string
}

// --- List parameters and query construction ---

// Columns the Raynet API itself can sort by (everything else is sorted
// client-side in the table)
export type CompanySortColumn =
  | 'id'
  | 'rowInfo.createdAt'
  | 'rowInfo.updatedAt'
  | 'rowInfo.lastModifiedAt'
  | 'name'
  | 'regNumber'

export type SortDirection = 'ASC' | 'DESC'

export interface CompanyListParams {
  fulltext?: string
  name?: string
  person?: boolean
  rating?: CompanyRating
  state?: CompanyState
  role?: CompanyRole
  owner?: number
  category?: number
  economyActivity?: number
  turnover?: number
  legalForm?: number
  paymentTerm?: number
  classification1?: number
  classification2?: number
  classification3?: number
  city?: string
  email?: string
  regNumber?: string
  taxNumber?: string
  tags?: string
  offset?: number
  limit?: number
  sortColumn?: CompanySortColumn
  sortDirection?: SortDirection
}

const contains = (value: string) => (value ? `%${value}%` : undefined)
const nonEmpty = (value: string) => value || undefined

type FilterKey = keyof Omit<CompanyListParams, 'sortColumn' | 'sortDirection'>

// How each filter maps to a Raynet query param. A serializer returning
// undefined skips the param (empty or whitespace-only input). The mapped
// type is exhaustive: a new key in CompanyListParams fails to compile
// until it gets a mapping here.
const QUERY_PARAMS: {
  [K in FilterKey]-?: readonly [
    param: string,
    serialize: (value: NonNullable<CompanyListParams[K]>) => string | undefined,
  ]
} = {
  fulltext: ['fulltext', (value) => value.trim() || undefined],
  name: ['name[LIKE_NOCASE]', contains],
  person: ['person', String],
  rating: ['rating', String],
  state: ['state', String],
  role: ['role', String],
  owner: ['owner', String],
  category: ['category', String],
  economyActivity: ['economyActivity', String],
  turnover: ['turnover', String],
  legalForm: ['legalForm', String],
  paymentTerm: ['paymentTerm', String],
  classification1: ['companyClassification1', String],
  classification2: ['companyClassification2', String],
  classification3: ['companyClassification3', String],
  city: ['primaryAddress-address.city[LIKE_NOCASE]', contains],
  email: ['primaryAddress-contactInfo.email[LIKE_NOCASE]', contains],
  regNumber: ['regNumber', nonEmpty],
  taxNumber: ['taxNumber', nonEmpty],
  tags: [
    'tags',
    (value) =>
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
        .join(',') || undefined,
  ],
  offset: ['offset', String],
  limit: ['limit', String],
}

export function buildCompanyListSearch(
  params: CompanyListParams,
): URLSearchParams {
  const search = new URLSearchParams()

  for (const key of Object.keys(QUERY_PARAMS) as FilterKey[]) {
    const value = params[key]
    if (value === undefined) continue
    const [param, serialize] = QUERY_PARAMS[key]
    // TS cannot correlate a value with its own serializer across the union
    const serialized = (serialize as (value: unknown) => string | undefined)(
      value,
    )
    if (serialized !== undefined) search.set(param, serialized)
  }

  // sorting is the one pair that travels together
  if (params.sortColumn) {
    search.set('sortColumn', params.sortColumn)
    search.set('sortDirection', params.sortDirection ?? 'ASC')
  }

  return search
}

// --- Query options ---

export const companyListQueryOptions = (params: CompanyListParams = {}) =>
  queryOptions({
    queryKey: ['companies', 'list', params],
    queryFn: () =>
      getJson<ListResponse<Company>>(
        'company/',
        buildCompanyListSearch(params),
      ),
  })

export const companyDetailQueryOptions = (companyId: number) =>
  queryOptions({
    queryKey: ['companies', 'detail', companyId],
    queryFn: async () => {
      const response = await getJson<DetailResponse<CompanyDetail>>(
        `company/${companyId}/`,
      )
      return response.data
    },
  })

// Codelists change rarely — cache them for the whole session
export const codelistQueryOptions = (entity: CodelistEntity) =>
  queryOptions({
    queryKey: ['codelist', entity],
    queryFn: () => getJson<ListResponse<CodelistItem>>(`${entity}/`),
    staleTime: Infinity,
  })

export const companyCategoriesQueryOptions = () =>
  codelistQueryOptions('companyCategory')

export const usersQueryOptions = () =>
  queryOptions({
    queryKey: ['users'],
    queryFn: () => getJson<ListResponse<UserAccount>>('userAccount/'),
    staleTime: Infinity,
  })

export const companyLogoQueryOptions = (fileId: number) =>
  queryOptions({
    queryKey: ['icon', fileId],
    queryFn: () => getJson<IconResponse>(`icon/${fileId}/`),
    staleTime: Infinity,
  })
