import { useMemo, useState } from 'react'

import { updateCourse, type CourseItem } from '@/services/api/simlogicApi'

import { CourseForm, type CourseFormValues } from '../form/CourseForm'

interface EditCourseSectionProps {
  course: CourseItem | null
  onCancel: () => void
  onUpdated: () => Promise<void> | void
}

function getInitialValues(course: CourseItem): CourseFormValues {
  return {
    name: course.name,
    description: course.description,
    course_type: course.course_type,
    min_simulation_hours: course.min_simulation_hours,
    is_active: course.is_active,
  }
}

export function EditCourseSection({ course, onCancel, onUpdated }: EditCourseSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const initialValues = useMemo(() => (course ? getInitialValues(course) : null), [course])

  if (!course || !initialValues) {
    return null
  }

  const handleSubmit = async (values: CourseFormValues) => {
    setIsSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      await updateCourse(course.id, {
        name: values.name.trim(),
        description: values.description.trim(),
        course_type: values.course_type,
        min_simulation_hours: values.min_simulation_hours,
        is_active: values.is_active,
      })
      setSuccessMessage('Curso actualizado correctamente.')
      await onUpdated()
      onCancel()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo actualizar el curso.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="agenda-modal-overlay" onClick={onCancel}>
      <section
        aria-modal="true"
        className="modal-content stack"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <h4>Editar curso: {course.name}</h4>
        <CourseForm
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          key={course.id}
          mode="edit"
          onCancel={onCancel}
          onSubmit={handleSubmit}
          submitLabel="Guardar cambios"
        />
        {successMessage ? <p className="status-ok">{successMessage}</p> : null}
        {errorMessage ? <p className="status-alert">{errorMessage}</p> : null}
      </section>
    </div>
  )
}
