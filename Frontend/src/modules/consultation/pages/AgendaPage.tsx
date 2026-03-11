import { useEffect, useState } from 'react'

import { useAuth } from '@/context/AuthContext'
import type { CourseSession } from '@/services/api/simlogicApi'
import { fetchMySchedule, fetchSessions } from '@/services/api/simlogicApi'

function formatDate(dateValue: string) {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(`${dateValue}T00:00:00`))
}

export function AgendaPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<CourseSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const isParticipantRole =
    user?.role === 'STUDENT' || user?.role === 'INSTRUCTOR' || user?.role === 'PSEUDOPILOT'

  useEffect(() => {
    const loadAgenda = async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const payload = isParticipantRole ? await fetchMySchedule() : await fetchSessions()
        setSessions(payload)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'No se pudo consultar la agenda.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadAgenda()
  }, [isParticipantRole])

  return (
    <>
      <header className="page-header">
        <h3>Consulta de agenda</h3>
        <p>
          {isParticipantRole
            ? 'Tu agenda personal desde /api/courses/my-schedule/.'
            : 'Agenda global desde /api/courses/sessions/.'}
        </p>
      </header>

      <section className="card stack">
        {isLoading ? <p className="inline-note">Cargando agenda...</p> : null}
        {errorMessage ? <p className="status-alert">{errorMessage}</p> : null}

        {!isLoading && !errorMessage ? (
          <table className="table">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Sala principal</th>
                <th>Sala pseudopilotos</th>
                <th>Fecha inicio</th>
                <th>Fecha fin</th>
                <th>Hora</th>
                <th>Horas/dia</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
    </>
  )
}
