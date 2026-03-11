import type { CourseItem } from '@/services/api/simlogicApi'

interface CoursesIndexSectionProps {
  courses: CourseItem[]
  isLoading: boolean
  errorMessage: string
  deletingCourseId: number | null
  onEdit: (course: CourseItem) => void
  onDelete: (course: CourseItem) => void
}

export function CoursesIndexSection({
  courses,
  isLoading,
  errorMessage,
  deletingCourseId,
  onEdit,
  onDelete,
}: CoursesIndexSectionProps) {
  return (
    <section className="card stack">
      <h4>Cursos existentes</h4>
      {isLoading ? <p className="inline-note">Cargando cursos...</p> : null}
      {errorMessage ? <p className="status-alert">{errorMessage}</p> : null}
      {!isLoading && !errorMessage && courses.length === 0 ? (
        <p className="inline-note">No hay cursos registrados.</p>
      ) : null}

      {!isLoading && !errorMessage && courses.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Tipo</th>
              <th>Horas mínimas</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id}>
                <td>{course.name}</td>
                <td>{course.course_type}</td>
                <td>{course.min_simulation_hours}</td>
                <td>{course.is_active ? 'Activo' : 'Inactivo'}</td>
                <td>
                  <div className="modal-actions">
                    <button className="btn-cancel" onClick={() => onEdit(course)} type="button">
                      Editar
                    </button>
                    <button
                      className="btn-submit"
                      disabled={deletingCourseId === course.id}
                      onClick={() => onDelete(course)}
                      type="button"
                    >
                      {deletingCourseId === course.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  )
}
