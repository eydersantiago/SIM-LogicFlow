import { useEffect, useMemo, useState } from 'react'

import type { CourseSession, SupportRecord } from '@/services/api/simlogicApi'
import { fetchSessions, fetchSupportRecords } from '@/services/api/simlogicApi'

const activeStatuses = new Set(['PENDING', 'IN_PROGRESS'])

export function ReportsPage() {
  const [sessions, setSessions] = useState<CourseSession[]>([])
  const [records, setRecords] = useState<SupportRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const [sessionsData, recordsData] = await Promise.all([
          fetchSessions(),
          fetchSupportRecords(),
        ])
        setSessions(sessionsData)
        setRecords(recordsData)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'No se pudieron cargar reportes.')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const metrics = useMemo(() => {
    const activeSessions = sessions.filter((session) => session.is_active).length
    const radarSessions = sessions.filter((session) => session.course_detail.course_type === 'RADAR').length
    const aerodromeSessions = sessions.filter(
      (session) => session.course_detail.course_type === 'AERODROME',
    ).length
    const openMaintenances = records.filter((record) => activeStatuses.has(record.status)).length

    return [
      { id: 'r1', label: 'Sesiones activas', value: String(activeSessions), period: 'Corte actual' },
      { id: 'r2', label: 'Sesiones RADAR', value: String(radarSessions), period: 'Corte actual' },
      { id: 'r3', label: 'Sesiones AERODROME', value: String(aerodromeSessions), period: 'Corte actual' },
      {
        id: 'r4',
        label: 'Mantenimientos abiertos',
        value: String(openMaintenances),
        period: 'PENDING + IN_PROGRESS',
      },
    ]
  }, [records, sessions])

  return (
    <>
      <header className="page-header">
        <h3>Reportes estadisticos</h3>
        <p>Resumen construido con datos reales de cursos y soporte tecnico.</p>
      </header>

      {isLoading ? <p className="inline-note">Cargando metricas...</p> : null}
      {errorMessage ? <p className="status-alert">{errorMessage}</p> : null}

      {!isLoading && !errorMessage ? (
        <section className="card-grid">
          {metrics.map((metricItem) => (
            <article key={metricItem.id} className="card">
              <span className="label">{metricItem.label}</span>
              <p className="metric-value">{metricItem.value}</p>
              <p className="inline-note">{metricItem.period}</p>
            </article>
          ))}
        </section>
      ) : null}
    </>
  )
}
