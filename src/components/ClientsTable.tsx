import type { Company } from '../api/companies'
import { ROLE_LABELS } from '../constants/labels'
import { CategoryChip } from './CategoryChip'
import { ClientState } from './ClientState'
import styles from './ClientsTable.module.scss'

interface ClientsTableProps {
  companies: Company[]
  selectedId?: number
  onSelect: (companyId: number) => void
}

export function ClientsTable({
  companies,
  selectedId,
  onSelect,
}: ClientsTableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Název/Jméno</th>
            <th>Stav</th>
            <th>Vztah</th>
            <th>Rating</th>
            <th>Vlastník</th>
            <th>IČ</th>
            <th>Město</th>
            <th>Kategorie</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr
              key={company.id}
              className={
                company.id === selectedId ? styles.rowSelected : undefined
              }
              onClick={() => onSelect(company.id)}
            >
              <td className={styles.name}>{company.name}</td>
              <td>
                <ClientState state={company.state} />
              </td>
              <td>{ROLE_LABELS[company.role]}</td>
              <td>{company.rating}</td>
              <td>{company.owner?.fullName ?? '—'}</td>
              <td>{company.regNumber ?? '—'}</td>
              <td>{company.primaryAddress?.address.city ?? '—'}</td>
              <td>
                {company.category && (
                  <CategoryChip category={company.category} />
                )}
              </td>
            </tr>
          ))}
          {companies.length === 0 && (
            <tr>
              <td colSpan={8} className={styles.empty}>
                Žádní klienti nenalezeni.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
