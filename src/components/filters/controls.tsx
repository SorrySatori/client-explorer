import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  codelistQueryOptions,
  COMPANY_RATINGS,
  COMPANY_ROLES,
  COMPANY_STATES,
  usersQueryOptions,
  type CodelistEntity,
} from '../../api/companies'
import { ROLE_LABELS, STATE_LABELS } from '../../constants/labels'
import {
  CODELIST_BY_KEY,
  TEXT_PLACEHOLDERS,
  type FilterKey,
  type FilterValue,
} from './filterConfig'
import styles from './controls.module.scss'

// Picks the right input for a criterion: codelist/enum selects for closed
// value sets, free-text input for the rest
export function FilterControl({
  filterKey,
  value,
  onChange,
}: {
  filterKey: FilterKey
  value: FilterValue
  onChange: (value: FilterValue) => void
}) {
  const codelistEntity = CODELIST_BY_KEY[filterKey]
  if (codelistEntity) {
    return (
      <CodelistSelect
        entity={codelistEntity}
        value={value as number | undefined}
        onChange={onChange}
      />
    )
  }

  switch (filterKey) {
    case 'state':
      return (
        <EnumSelect
          value={value as string | undefined}
          options={COMPANY_STATES.map((state) => [state, STATE_LABELS[state]])}
          onChange={onChange}
        />
      )
    case 'role':
      return (
        <EnumSelect
          value={value as string | undefined}
          options={COMPANY_ROLES.map((role) => [role, ROLE_LABELS[role]])}
          onChange={onChange}
        />
      )
    case 'rating':
      return (
        <EnumSelect
          value={value as string | undefined}
          options={COMPANY_RATINGS.map((rating) => [rating, rating])}
          onChange={onChange}
        />
      )
    case 'person':
      return (
        <EnumSelect
          value={value === undefined ? undefined : String(value)}
          options={[
            ['true', 'Ano'],
            ['false', 'Ne'],
          ]}
          onChange={(next) =>
            onChange(next === undefined ? undefined : next === 'true')
          }
        />
      )
    case 'owner':
      return (
        <OwnerSelect value={value as number | undefined} onChange={onChange} />
      )
    default:
      return (
        <TextFilterInput
          value={value as string | undefined}
          placeholder={TEXT_PLACEHOLDERS[filterKey] ?? ''}
          onCommit={onChange}
        />
      )
  }
}

function CodelistSelect({
  entity,
  value,
  onChange,
}: {
  entity: CodelistEntity
  value: number | undefined
  onChange: (value: number | undefined) => void
}) {
  const { data, isPending } = useQuery(codelistQueryOptions(entity))

  if (isPending) return <LoadingSelect />
  return (
    <EnumSelect
      value={value !== undefined ? String(value) : undefined}
      options={(data?.data ?? []).map((item) => [String(item.id), item.code01])}
      onChange={(next) => onChange(next ? Number(next) : undefined)}
    />
  )
}

function OwnerSelect({
  value,
  onChange,
}: {
  value: number | undefined
  onChange: (value: number | undefined) => void
}) {
  const { data, isPending } = useQuery(usersQueryOptions())

  if (isPending) return <LoadingSelect />
  const persons = (data?.data ?? []).flatMap((user) =>
    user.person ? [user.person] : [],
  )
  return (
    <EnumSelect
      value={value !== undefined ? String(value) : undefined}
      options={persons.map((person) => [String(person.id), person.fullName])}
      onChange={(next) => onChange(next ? Number(next) : undefined)}
    />
  )
}

function LoadingSelect() {
  return (
    <select className={styles.control} disabled>
      <option>Načítám…</option>
    </select>
  )
}

function EnumSelect({
  value,
  options,
  onChange,
}: {
  value: string | undefined
  options: [value: string, label: string][]
  onChange: (value: string | undefined) => void
}) {
  return (
    <select
      className={styles.control}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value || undefined)}
    >
      <option value="">— vyberte —</option>
      {options.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </select>
  )
}

function TextFilterInput({
  value,
  placeholder,
  onCommit,
}: {
  value: string | undefined
  placeholder: string
  onCommit: (value: string | undefined) => void
}) {
  const [draft, setDraft] = useState(value ?? '')
  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    setDraft(value ?? '')
  }

  const commit = () => onCommit(draft.trim() || undefined)

  return (
    <input
      className={styles.control}
      type="text"
      value={draft}
      placeholder={placeholder}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === 'Enter') commit()
      }}
    />
  )
}
