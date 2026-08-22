import { queryOptions } from '@tanstack/react-query'
import { getJson, type DetailResponse, type ListResponse } from './http'

export type CompanyRating = 'A' | 'B' | 'C'

export type CompanyState =
  'A_POTENTIAL' | 'B_ACTUAL' | 'C_DEFERRED' | 'D_UNATTRACTIVE'

export type CompanyRole =
  'A_SUBSCRIBER' | 'B_PARTNER' | 'C_SUPPLIER' | 'D_RIVAL' | 'E_OWN'

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

// Codelist entry (GET /companyCategory/) — code01 is the label,
// code02 the category color as a hex value without '#'
export interface CompanyCategoryItem {
  id: number
  code01: string
  code02: string | null
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
  rating?: CompanyRating
  state?: CompanyState
  role?: CompanyRole
  offset?: number
  limit?: number
  sortColumn?: CompanySortColumn
  sortDirection?: SortDirection
}

export function buildCompanyListSearch(
  params: CompanyListParams,
): URLSearchParams {
  const search = new URLSearchParams()
  const fulltext = params.fulltext?.trim()
  if (fulltext) search.set('fulltext', fulltext)
  if (params.rating) search.set('rating', params.rating)
  if (params.state) search.set('state', params.state)
  if (params.role) search.set('role', params.role)
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

// Categories change rarely — cache them for the whole session
export const companyCategoriesQueryOptions = () =>
  queryOptions({
    queryKey: ['companyCategories'],
    queryFn: () =>
      getJson<ListResponse<CompanyCategoryItem>>('companyCategory/'),
    staleTime: Infinity,
  })

export const companyLogoQueryOptions = (fileId: number) =>
  queryOptions({
    queryKey: ['icon', fileId],
    queryFn: () => getJson<IconResponse>(`icon/${fileId}/`),
    staleTime: Infinity,
  })
