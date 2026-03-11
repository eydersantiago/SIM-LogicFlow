import { useEffect, useState } from 'react'

import type { SupportRecord } from '@/services/api/simlogicApi'
import { fetchSupportRecords } from '@/services/api/simlogicApi'

function formatDate(dateValue: string | null) {
  if (!dateValue) {
    return '-'
  }
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(`${dateValue}T00:00:00`))
}

export function MaintenancePage() {
  const [records, setRecords] = useState<SupportRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadRecords = async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const payload = await fetchSupportRecords()
        setRecords(payload)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'No se pudo cargar mantenimientos.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadRecords()
  }, [])

  return (
    <>
      <header className="page-header">
        <h3>Panel de Gestion Tecnica</h3>
        <p>Registros de mantenimiento desde `/api/support/records/`.</p>
      </header>

      <section className="card stack">
        {isLoading ? <p className="inline-note">Cargando mantenimientos...</p> : null}
        {errorMessage ? <p className="status-alert">{errorMessage}</p> : null}

        {!isLoading && !errorMessage ? (
          <table className="table">
            <thead>
              <tr>
                <th>Sala</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Fecha programada</th>
                <th>Fecha completado</th>
                <th>Responsable</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  <td>{record.room_detail.name}</td>
                  <td>{record.maintenance_type_name}</td>
                  <td>{record.status}</td>
                  <td>{formatDate(record.scheduled_date)}</td>
                  <td>{formatDate(record.completed_date)}</td>
                  <td>{record.support_person_username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
    </>
  )
}
