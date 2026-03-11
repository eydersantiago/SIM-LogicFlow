import { useEffect, useMemo, useState } from 'react'

import { useAuth } from '@/context/AuthContext'
import type { CourseSession, SupportRecord } from '@/services/api/simlogicApi'
import {
  fetchMySchedule,
  fetchSessions,
  fetchSupportRecords,
} from '@/services/api/simlogicApi'

const openSupportStatuses = new Set(['PENDING', 'IN_PROGRESS'])

export function DashboardPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<CourseSession[]>([])
  const [supportRecords, setSupportRecords] = useState<SupportRecord[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const isParticipant =
    user?.role === 'STUDENT' || user?.role === 'INSTRUCTOR' || user?.role === 'PSEUDOPILOT'
  const canReadSupport = user?.role === 'ADMIN' || user?.role === 'TECHNICAL_COORDINATOR'

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true)
      setErrorMessage('')

      try {
        const sessionsData = isParticipant ? await fetchMySchedule() : await fetchSessions()
        setSessions(sessionsData)

        if (canReadSupport) {
          const supportData = await fetchSupportRecords()
          setSupportRecords(supportData)
        } else {
          setSupportRecords([])
        }
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'No se pudo cargar el tablero principal.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboard()
  }, [canReadSupport, isParticipant])

  const metrics = useMemo(() => {
    const scheduledCourses = sessions.length
    const simulationHours = sessions.reduce((total, session) => total + session.daily_simulation_hours, 0)
    const activeMaintenances = supportRecords.filter((record) => openSupportStatuses.has(record.status)).length
    const inactiveSessions = sessions.filter((session) => !session.is_active).length

    return [
      { id: 'm-1', label: 'Cursos programados', value: String(scheduledCourses), detail: 'Total actual' },
      {
        id: 'm-2',
        label: 'Horas simulacion',
        value: `${simulationHours} h`,
        detail: 'Suma diaria de sesiones',
      },
      {
        id: 'm-3',
        label: 'Mantenimientos abiertos',
        value: canReadSupport ? String(activeMaintenances) : 'N/A',
        detail: canReadSupport ? 'PENDING + IN_PROGRESS' : 'No aplica para tu rol',
      },
      { id: 'm-4', label: 'Sesiones inactivas', value: String(inactiveSessions), detail: 'Control operativo' },
    ]
  }, [canReadSupport, sessions, supportRecords])

  return (
    <>
      <header className="page-header">
        <h3>Panel general</h3>
        <p>Vista consolidada consumiendo rutas reales del backend.</p>
      </header>

      {isLoading ? <p className="inline-note">Cargando tablero...</p> : null}
      {errorMessage ? <p className="status-alert">{errorMessage}</p> : null}

      {!isLoading && !errorMessage ? (
        <>
          <section className="card-grid">
            {metrics.map((metric) => (
              <article key={metric.id} className="card">
                <span className="label">{metric.label}</span>
                <p className="metric-value">{metric.value}</p>
                <p className="inline-note">{metric.detail}</p>
              </article>
            ))}
          </section>

          {canReadSupport ? (
            <section className="card stack">
              <h4>Mantenimientos activos / programados</h4>
              <table className="table">
                <thead>
                  <tr>
                    <th>Sala</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {supportRecords.map((record) => (
                    <tr key={record.id}>
                      <td>{record.room_detail.name}</td>
                      <td>{record.maintenance_type_name}</td>
                      <td>{record.status}</td>
                      <td>{record.scheduled_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}
        </>
      ) : null}
    </>
  )
}
