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

export const COMPANY_SORT_COLUMNS = [
  'id',
  'rowInfo.createdAt',
  'rowInfo.updatedAt',
  'rowInfo.lastModifiedAt',
  'name',
  'regNumber',
] as const

export type CompanySortColumn = (typeof COMPANY_SORT_COLUMNS)[number]

export type SortDirection = 'ASC' | 'DESC'

export const DEFAULT_PAGE_SIZE = 50

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

// codelist-id filters that map 1:1 to a query param
const ID_PARAMS = [
  ['owner', 'owner'],
  ['category', 'category'],
  ['economyActivity', 'economyActivity'],
  ['turnover', 'turnover'],
  ['legalForm', 'legalForm'],
  ['paymentTerm', 'paymentTerm'],
  ['classification1', 'companyClassification1'],
  ['classification2', 'companyClassification2'],
  ['classification3', 'companyClassification3'],
] as const satisfies readonly [keyof CompanyListParams, string][]

export function buildCompanyListSearch(
  params: CompanyListParams,
): URLSearchParams {
  const search = new URLSearchParams()
  const fulltext = params.fulltext?.trim()
  if (fulltext) search.set('fulltext', fulltext)
  // "contains, case-insensitive" — Raynet's LIKE uses % as the wildcard
  if (params.name) search.set('name[LIKE_NOCASE]', `%${params.name}%`)
  if (params.person !== undefined) search.set('person', String(params.person))
  if (params.rating) search.set('rating', params.rating)
  if (params.state) search.set('state', params.state)
  if (params.role) search.set('role', params.role)
  for (const [key, param] of ID_PARAMS) {
    const value = params[key]
    if (value !== undefined) search.set(param, String(value))
  }
  if (params.city)
    search.set('primaryAddress-address.city[LIKE_NOCASE]', `%${params.city}%`)
  if (params.email)
    search.set(
      'primaryAddress-contactInfo.email[LIKE_NOCASE]',
      `%${params.email}%`,
    )
  if (params.regNumber) search.set('regNumber', params.regNumber)
  if (params.taxNumber) search.set('taxNumber', params.taxNumber)
  if (params.tags) search.set('tags', params.tags)
  if (params.offset !== undefined) search.set('offset', String(params.offset))
  if (params.limit !== undefined) search.set('limit', String(params.limit))
  if (params.sortColumn) {
    search.set('sortColumn', params.sortColumn)
    search.set('sortDirection', params.sortDirection ?? 'ASC')
  }
  return search
}

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
