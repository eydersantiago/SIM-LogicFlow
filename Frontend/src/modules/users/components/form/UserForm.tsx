import { useState, type FormEvent } from 'react'

import { roleLabels } from '@/app/navigation'
import type { UserRole } from '@/domain/types'

export interface UserFormValues {
  username: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  phone: string
  is_active: boolean
  password: string
  password_confirm: string
}

interface UserFormProps {
  mode: 'create' | 'edit'
  initialValues: UserFormValues
  submitLabel: string
  isSubmitting?: boolean
  onSubmit: (values: UserFormValues) => Promise<void> | void
  onCancel?: () => void
}

const roleOptions: UserRole[] = [
  'ADMIN',
  'ACADEMIC_COORDINATOR',
  'TECHNICAL_COORDINATOR',
  'INSTRUCTOR',
  'PSEUDOPILOT',
  'STUDENT',
]

export function UserForm({
  mode,
  initialValues,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const [formValues, setFormValues] = useState<UserFormValues>(initialValues)
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLocalError('')

    if (mode === 'create' && !formValues.password) {
      setLocalError('La contraseña es obligatoria para crear usuarios.')
      return
    }

    if (formValues.password || formValues.password_confirm) {
      if (!formValues.password || !formValues.password_confirm) {
        setLocalError('Debes completar contraseña y confirmación.')
        return
      }
      if (formValues.password !== formValues.password_confirm) {
        setLocalError('Las contraseñas no coinciden.')
        return
      }
    }

    await onSubmit(formValues)
  }

  return (
    <form className="stack" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor={`user-${mode}-username`}>Usuario</label>
        <input
          id={`user-${mode}-username`}
          onChange={(event) =>
            setFormValues((prev) => ({
              ...prev,
              username: event.target.value,
            }))
          }
          required
          type="text"
          value={formValues.username}
        />
      </div>

      <div className="field">
        <label htmlFor={`user-${mode}-email`}>Email</label>
        <input
          id={`user-${mode}-email`}
          onChange={(event) =>
            setFormValues((prev) => ({
              ...prev,
              email: event.target.value,
            }))
          }
          required
          type="email"
          value={formValues.email}
        />
      </div>

      <div className="field">
        <label htmlFor={`user-${mode}-first-name`}>Nombre</label>
        <input
          id={`user-${mode}-first-name`}
          onChange={(event) =>
            setFormValues((prev) => ({
              ...prev,
              first_name: event.target.value,
            }))
          }
          required
          type="text"
          value={formValues.first_name}
        />
      </div>

      <div className="field">
        <label htmlFor={`user-${mode}-last-name`}>Apellido</label>
        <input
          id={`user-${mode}-last-name`}
          onChange={(event) =>
            setFormValues((prev) => ({
              ...prev,
              last_name: event.target.value,
            }))
          }
          required
          type="text"
          value={formValues.last_name}
        />
      </div>

      <div className="field">
        <label htmlFor={`user-${mode}-role`}>Rol</label>
        <select
          id={`user-${mode}-role`}
          onChange={(event) =>
            setFormValues((prev) => ({
              ...prev,
              role: event.target.value as UserRole,
            }))
          }
          value={formValues.role}
        >
          {roleOptions.map((roleOption) => (
            <option key={roleOption} value={roleOption}>
              {roleLabels[roleOption]}
            </option>
          ))}
        </select>
      </div>

      <div className="field">
        <label htmlFor={`user-${mode}-phone`}>Teléfono</label>
        <input
          id={`user-${mode}-phone`}
          onChange={(event) =>
            setFormValues((prev) => ({
              ...prev,
              phone: event.target.value,
            }))
          }
          type="text"
          value={formValues.phone}
        />
      </div>

      <div className="checkbox-group">
        <input
          checked={formValues.is_active}
          id={`user-${mode}-active`}
          onChange={(event) =>
            setFormValues((prev) => ({
              ...prev,
              is_active: event.target.checked,
            }))
          }
          type="checkbox"
        />
        <label htmlFor={`user-${mode}-active`}>Usuario activo</label>
      </div>

      <div className="field">
        <label htmlFor={`user-${mode}-password`}>
          {mode === 'create' ? 'Contraseña' : 'Nueva contraseña (opcional)'}
        </label>
        <input
          id={`user-${mode}-password`}
          onChange={(event) =>
            setFormValues((prev) => ({
              ...prev,
              password: event.target.value,
            }))
          }
          required={mode === 'create'}
          type="password"
          value={formValues.password}
        />
      </div>

      <div className="field">
        <label htmlFor={`user-${mode}-password-confirm`}>
          {mode === 'create' ? 'Confirmar contraseña' : 'Confirmar nueva contraseña'}
        </label>
        <input
          id={`user-${mode}-password-confirm`}
          onChange={(event) =>
            setFormValues((prev) => ({
              ...prev,
              password_confirm: event.target.value,
            }))
          }
          required={mode === 'create'}
          type="password"
          value={formValues.password_confirm}
        />
      </div>

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
