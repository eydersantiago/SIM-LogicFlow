import { useEffect, useState } from 'react'

import { CreateCourseSection } from '@/modules/academic/components/courses/create/CreateCourseSection'
import { EditCourseSection } from '@/modules/academic/components/courses/edit/EditCourseSection'
import { CoursesIndexSection } from '@/modules/academic/components/courses/index/CoursesIndexSection'
import type { CourseItem } from '@/services/api/simlogicApi'
import { deleteCourse, fetchCourses } from '@/services/api/simlogicApi'

export function CoursesPage() {
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null)
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null)

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

  const handleDelete = async (course: CourseItem) => {
    const confirmed = window.confirm(`¿Deseas eliminar el curso "${course.name}"?`)
    if (!confirmed) {
      return
    }

    setDeletingCourseId(course.id)
    setStatusMessage('')
    setErrorMessage('')

    try {
      await deleteCourse(course.id)
      setStatusMessage('Curso eliminado correctamente.')
      if (selectedCourse?.id === course.id) {
        setSelectedCourse(null)
      }
      await loadCourses()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo eliminar el curso.')
    } finally {
      setDeletingCourseId(null)
    }
  }

  return (
    <>
      <header className="page-header">
        <h3>Modulo de Programacion Academica ATS</h3>
        <p>CRUD completo con estructura `index/create/edit/form`.</p>
      </header>

      <CreateCourseSection onCreated={loadCourses} />
      {statusMessage ? <p className="status-ok">{statusMessage}</p> : null}
      <CoursesIndexSection
        courses={courses}
        deletingCourseId={deletingCourseId}
        errorMessage={errorMessage}
        isLoading={isLoading}
        onDelete={handleDelete}
        onEdit={setSelectedCourse}
      />
      <EditCourseSection
        course={selectedCourse}
        onCancel={() => setSelectedCourse(null)}
        onUpdated={loadCourses}
      />
    </>
  )
}
