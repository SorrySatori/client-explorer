import type { CSSProperties } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { companyCategoriesQueryOptions, type EnumRef } from '../api/companies'
import styles from './CategoryChip.module.scss'

// Raynet derives the chip background/text from the stored category color in
// a way no single color-mix reproduces (measured against the real UI —
// most likely a palette lookup on their side). Pin the palette colors we
// know; anything else falls back to a color-mix derivation in the SCSS.
const RAYNET_CHIP_COLORS: Record<string, { bg: string; text: string }> = {
  CABC00: { bg: 'rgb(245, 235, 156)', text: 'rgb(101, 93, 0)' },
  '8EA500': { bg: 'rgb(222, 240, 164)', text: 'rgb(84, 98, 0)' },
  '519CFF': { bg: 'rgb(205, 225, 255)', text: 'rgb(46, 92, 154)' },
}

function chipStyle(
  color: string | null | undefined,
): CSSProperties | undefined {
  if (!color) return undefined
  const exact = RAYNET_CHIP_COLORS[color.toUpperCase()]
  if (exact) {
    return { '--chip-bg': exact.bg, '--chip-text': exact.text } as CSSProperties
  }
  return { '--chip-color': `#${color}` } as CSSProperties
}

export function CategoryChip({ category }: { category: EnumRef }) {
  const { data: categories } = useSuspenseQuery(companyCategoriesQueryOptions())
  const color = categories.data.find((item) => item.id === category.id)?.code02

  return (
    <span className={styles.chip} style={chipStyle(color)}>
      {category.value}
    </span>
  )
}
