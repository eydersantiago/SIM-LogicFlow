import {
  academicSessionsMock,
  maintenanceWindowsMock,
  roomRules,
} from '@/domain/mockData'
import type { AcademicSession } from '@/domain/types'
import { evaluateAcademicRestrictions } from '@/modules/academic/restrictions/restrictionEngine'

const candidateSession: AcademicSession = {
  id: 'draft-001',
  courseCode: 'ATC-501',
  courseName: 'Prueba Restricciones',
  date: '2026-03-11',
  startTime: '10:00',
  endTime: '13:00',
  roomName: 'Sala Radar THA-01',
  simulator: 'THALES',
  instructor: 'Maria Correa',
  students: 9,
  pseudopilots: 4,
}

const selectedRoomRule = roomRules[0]

const alerts = evaluateAcademicRestrictions({
  candidateSession,
  sameDaySessions: academicSessionsMock.filter((sessionItem) => sessionItem.date === candidateSession.date),
  roomRule: selectedRoomRule,
  consumedHoursByCourse: 4,
  consumedHoursByInstructor: 4,
  maintenanceWindows: maintenanceWindowsMock,
})

export function SchedulingPage() {
  return (
    <>
      <header className="page-header">
        <h3>Motor de restricciones y cruces</h3>
        <p>
          Componente base para validar limite de 6 horas, aforo, posiciones y bloqueos por
          mantenimiento.
        </p>
      </header>

      <section className="card stack">
        <h4>Resultado de validacion (ejemplo)</h4>
        {alerts.length > 0 ? (
          <ul className="alert-list">
            {alerts.map((alertItem) => (
              <li key={`${alertItem.code}-${alertItem.message}`} className="status-alert">
                [{alertItem.code}] {alertItem.message}
              </li>
            ))}
          </ul>
        ) : (
          <p className="status-ok">No se detectan conflictos para la sesion propuesta.</p>
        )}
      </section>

      <section className="card stack">
        <h4>Programacion del dia ({candidateSession.date})</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Curso</th>
              <th>Horario</th>
              <th>Sala</th>
              <th>Instructor</th>
              <th>Participantes</th>
            </tr>
          </thead>
          <tbody>
            {academicSessionsMock
              .filter((sessionItem) => sessionItem.date === candidateSession.date)
              .map((sessionItem) => (
                <tr key={sessionItem.id}>
                  <td>{sessionItem.courseCode}</td>
                  <td>
                    {sessionItem.startTime} - {sessionItem.endTime}
                  </td>
                  <td>{sessionItem.roomName}</td>
                  <td>{sessionItem.instructor}</td>
                  <td>{sessionItem.students + sessionItem.pseudopilots}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
