import { useState } from 'react'

import { createCourse } from '@/services/api/simlogicApi'

import { CourseForm, type CourseFormValues } from '../form/CourseForm'

interface CreateCourseSectionProps {
  onCreated: () => Promise<void> | void
}

const initialValues: CourseFormValues = {
  name: '',
  description: '',
  course_type: 'RADAR',
  min_simulation_hours: 20,
  is_active: true,
}

export function CreateCourseSection({ onCreated }: CreateCourseSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formKey, setFormKey] = useState(0)

  const handleSubmit = async (values: CourseFormValues) => {
    setIsSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      await createCourse({
        name: values.name.trim(),
        description: values.description.trim(),
        course_type: values.course_type,
        min_simulation_hours: values.min_simulation_hours,
      })
      setSuccessMessage('Curso creado correctamente.')
      setFormKey((prev) => prev + 1)
      await onCreated()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo crear el curso.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="card stack">
      <h4>Crear curso</h4>
      <CourseForm
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        key={formKey}
        mode="create"
        onSubmit={handleSubmit}
        submitLabel="Crear curso"
      />
      {successMessage ? <p className="status-ok">{successMessage}</p> : null}
      {errorMessage ? <p className="status-alert">{errorMessage}</p> : null}
    </section>
  )
}
