import type { CSSProperties } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { companyCategoriesQueryOptions, type EnumRef } from '../api/companies'
import styles from './CategoryChip.module.scss'

export function CategoryChip({ category }: { category: EnumRef }) {
  const { data: categories } = useSuspenseQuery(companyCategoriesQueryOptions())
  const color = categories.data.find((item) => item.id === category.id)?.code02

  return (
    <span
      className={styles.chip}
      style={
        color ? ({ '--chip-color': `#${color}` } as CSSProperties) : undefined
      }
    >
      {category.value}
    </span>
  )
}
