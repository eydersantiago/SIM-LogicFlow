import { useMemo, useState } from 'react'

import type { AppUser } from '@/domain/types'
import { updateUser } from '@/services/api/simlogicApi'

import { UserForm, type UserFormValues } from '../form/UserForm'

interface EditUserSectionProps {
  user: AppUser | null
  onCancel: () => void
  onUpdated: () => Promise<void> | void
}

function getInitialValues(user: AppUser): UserFormValues {
  const splitName = user.fullName.trim().split(/\s+/)
  const firstName = user.firstName ?? splitName[0] ?? ''
  const lastName = user.lastName ?? splitName.slice(1).join(' ')

  return {
    username: user.username,
    email: user.email,
    first_name: firstName,
    last_name: lastName,
    role: user.role,
    phone: user.phone ?? '',
    is_active: user.isActive ?? true,
    password: '',
    password_confirm: '',
  }
}

export function EditUserSection({ user, onCancel, onUpdated }: EditUserSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const initialValues = useMemo(() => (user ? getInitialValues(user) : null), [user])

  if (!user || !initialValues) {
    return null
  }

  const handleSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      await updateUser(user.id, {
        username: values.username.trim(),
        email: values.email.trim(),
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        role: values.role,
        phone: values.phone.trim(),
        is_active: values.is_active,
        ...(values.password
          ? {
              password: values.password,
              password_confirm: values.password_confirm,
            }
          : {}),
      })
      setSuccessMessage('Usuario actualizado correctamente.')
      await onUpdated()
      onCancel()
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo actualizar el usuario.',
      )
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
        <h4>Editar usuario: {user.username}</h4>
        <UserForm
          initialValues={initialValues}
          isSubmitting={isSubmitting}
          key={user.id}
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
