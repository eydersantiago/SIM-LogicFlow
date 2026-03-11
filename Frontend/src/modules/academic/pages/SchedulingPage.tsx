import { useEffect, useState } from 'react'

import type { CourseSession } from '@/services/api/simlogicApi'
import { fetchSessions } from '@/services/api/simlogicApi'

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(`${dateValue}T00:00:00`))
}

export function SchedulingPage() {
  const [sessions, setSessions] = useState<CourseSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadSessions = async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const payload = await fetchSessions()
        setSessions(payload)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'No se pudo cargar la programacion.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadSessions()
  }, [])

  return (
    <>
      <header className="page-header">
        <h3>Programacion de sesiones</h3>
        <p>Vista conectada a `/api/courses/sessions/`.</p>
      </header>

      <section className="card stack">
        {isLoading ? <p className="inline-note">Cargando sesiones...</p> : null}
        {errorMessage ? <p className="status-alert">{errorMessage}</p> : null}

        {!isLoading && !errorMessage ? (
          <table className="table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Sala principal</th>
                <th>Sala pseudopilotos</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Hora</th>
                <th>Horas/dia</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.course_detail.name}</td>
                  <td>{session.main_room_detail.name}</td>
                  <td>{session.pseudopilot_room_detail.name}</td>
                  <td>{formatDate(session.start_date)}</td>
                  <td>{formatDate(session.end_date)}</td>
                  <td>{session.schedule_time.slice(0, 5)}</td>
                  <td>{session.daily_simulation_hours}</td>
                  <td>{session.is_active ? 'Activa' : 'Inactiva'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
    </>
  )
}
