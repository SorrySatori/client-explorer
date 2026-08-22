import { describe, expect, it } from 'vitest'
import { buildCompanyListSearch } from './companies'

describe('buildCompanyListSearch', () => {
  it('returns no params for empty input', () => {
    expect(buildCompanyListSearch({}).toString()).toBe('')
  })

  it('maps all supported params', () => {
    const search = buildCompanyListSearch({
      fulltext: 'raynet',
      rating: 'A',
      state: 'B_ACTUAL',
      role: 'B_PARTNER',
      offset: 50,
      limit: 50,
      sortColumn: 'name',
      sortDirection: 'DESC',
    })
    expect(Object.fromEntries(search)).toEqual({
      fulltext: 'raynet',
      rating: 'A',
      state: 'B_ACTUAL',
      role: 'B_PARTNER',
      offset: '50',
      limit: '50',
      sortColumn: 'name',
      sortDirection: 'DESC',
    })
  })

  it('maps filter params including operator syntax for city', () => {
    const search = buildCompanyListSearch({
      category: 105,
      city: 'Zlín',
      regNumber: '123',
    })
    expect(Object.fromEntries(search)).toEqual({
      category: '105',
      'primaryAddress-address.city[LIKE_NOCASE]': '%Zlín%',
      regNumber: '123',
    })
  })

  it('trims fulltext and drops it when blank', () => {
    expect(
      buildCompanyListSearch({ fulltext: '  raynet  ' }).get('fulltext'),
    ).toBe('raynet')
    expect(buildCompanyListSearch({ fulltext: '   ' }).toString()).toBe('')
  })

  it('keeps offset 0 (falsy but valid)', () => {
    expect(buildCompanyListSearch({ offset: 0 }).get('offset')).toBe('0')
  })

  it('defaults sortDirection to ASC when only sortColumn is given', () => {
    const search = buildCompanyListSearch({ sortColumn: 'name' })
    expect(search.get('sortDirection')).toBe('ASC')
  })

  it('omits sortDirection without sortColumn', () => {
    expect(buildCompanyListSearch({ sortDirection: 'DESC' }).toString()).toBe(
      '',
    )
  })
})
