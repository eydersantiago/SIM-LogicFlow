import { useState, type FormEvent } from 'react'

export interface CourseFormValues {
  name: string
  description: string
  course_type: 'RADAR' | 'AERODROME'
  min_simulation_hours: number
  is_active: boolean
}

interface CourseFormProps {
  mode: 'create' | 'edit'
  initialValues: CourseFormValues
  submitLabel: string
  isSubmitting?: boolean
  onSubmit: (values: CourseFormValues) => Promise<void> | void
  onCancel?: () => void
}

export function CourseForm({
  mode,
  initialValues,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: CourseFormProps) {
  const [formValues, setFormValues] = useState<CourseFormValues>(initialValues)
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError('')

    if (formValues.min_simulation_hours <= 0) {
      setLocalError('Las horas mínimas deben ser mayores a cero.')
      return
    }

    await onSubmit(formValues)
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor={`course-${mode}-name`}>Nombre</label>
        <input
          id={`course-${mode}-name`}
          onChange={(event) =>
            setFormValues((prev) => ({
              ...prev,
              name: event.target.value,
            }))
          }
          required
          type="text"
          value={formValues.name}
        />
      </div>

      <div className="field">
        <label htmlFor={`course-${mode}-description`}>Descripción</label>
        <textarea
          id={`course-${mode}-description`}
          onChange={(event) =>
            setFormValues((prev) => ({
              ...prev,
              description: event.target.value,
            }))
          }
          value={formValues.description}
        />
      </div>

      <div className="field">
        <label htmlFor={`course-${mode}-type`}>Tipo</label>
        <select
          id={`course-${mode}-type`}
          onChange={(event) =>
            setFormValues((prev) => ({
              ...prev,
              course_type: event.target.value as 'RADAR' | 'AERODROME',
            }))
          }
          value={formValues.course_type}
        >
          <option value="RADAR">RADAR</option>
          <option value="AERODROME">AERODROME</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor={`course-${mode}-hours`}>Horas mínimas</label>
        <input
          id={`course-${mode}-hours`}
          min={1}
          onChange={(event) =>
            setFormValues((prev) => ({
              ...prev,
              min_simulation_hours: Number(event.target.value),
            }))
          }
          required
          type="number"
          value={formValues.min_simulation_hours}
        />
      </div>

      {mode === 'edit' ? (
        <div className="checkbox-group">
          <input
            checked={formValues.is_active}
            id={`course-${mode}-active`}
            onChange={(event) =>
              setFormValues((prev) => ({
                ...prev,
                is_active: event.target.checked,
              }))
            }
            type="checkbox"
          />
          <label htmlFor={`course-${mode}-active`}>Curso activo</label>
        </div>
      ) : null}

      {localError ? <p className="status-alert">{localError}</p> : null}

      <div className="modal-actions">
        {onCancel ? (
          <button className="btn-cancel" onClick={onCancel} type="button">
            Cancelar
          </button>
        ) : null}
        <button className="btn-submit" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
