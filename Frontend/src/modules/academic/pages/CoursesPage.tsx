import { useEffect, useState, type FormEvent } from 'react'

import type { CourseItem } from '@/services/api/simlogicApi'
import { createCourse, fetchCourses } from '@/services/api/simlogicApi'

export function CoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [courseType, setCourseType] = useState<'RADAR' | 'AERODROME'>('RADAR')
  const [minHours, setMinHours] = useState(20)

  const loadCourses = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const payload = await fetchCourses()
      setCourses(payload)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo cargar cursos.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitMessage('')
    setErrorMessage('')

    try {
      await createCourse({
        name: name.trim(),
        description: description.trim(),
        course_type: courseType,
        min_simulation_hours: minHours,
      })
      setName('')
      setDescription('')
      setCourseType('RADAR')
      setMinHours(20)
      setSubmitMessage('Curso creado correctamente.')
      await loadCourses()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo crear el curso.')
    }
  }

  return (
    <>
      <header className="page-header">
        <h3>Modulo de Programacion Academica ATS</h3>
        <p>Gestion real de cursos usando `/api/courses/`.</p>
      </header>

      <section className="card stack">
        <h4>Crear curso</h4>
        <form className="stack" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="course-name">Nombre</label>
            <input
              id="course-name"
              onChange={(event) => setName(event.target.value)}
              required
              type="text"
              value={name}
            />
          </div>

          <div className="field">
            <label htmlFor="course-description">Descripcion</label>
            <textarea
              id="course-description"
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </div>

          <div className="field">
            <label htmlFor="course-type">Tipo</label>
            <select
              id="course-type"
              onChange={(event) => setCourseType(event.target.value as 'RADAR' | 'AERODROME')}
              value={courseType}
            >
              <option value="RADAR">RADAR</option>
              <option value="AERODROME">AERODROME</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="min-hours">Horas minimas simulacion</label>
            <input
              id="min-hours"
              min={1}
              onChange={(event) => setMinHours(Number(event.target.value))}
              required
              type="number"
              value={minHours}
            />
          </div>

          <button className="button button-primary" type="submit">
            Crear curso
          </button>
        </form>
        {submitMessage ? <p className="status-ok">{submitMessage}</p> : null}
      </section>

      <section className="card stack">
        <h4>Cursos existentes</h4>
        {isLoading ? <p className="inline-note">Cargando cursos...</p> : null}
        {errorMessage ? <p className="status-alert">{errorMessage}</p> : null}

        {!isLoading && !errorMessage ? (
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Horas minimas</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td>{course.name}</td>
                  <td>{course.course_type}</td>
                  <td>{course.min_simulation_hours}</td>
                  <td>{course.is_active ? 'Activo' : 'Inactivo'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
    </>
  )
}
