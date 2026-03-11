import { useState } from 'react'

import type { UserRole } from '@/domain/types'
import { createUser } from '@/services/api/simlogicApi'

import { UserForm, type UserFormValues } from '../form/UserForm'

interface CreateUserSectionProps {
  onCreated: () => Promise<void> | void
}

const initialValues: UserFormValues = {
  username: '',
  email: '',
  first_name: '',
  last_name: '',
  role: 'STUDENT' as UserRole,
  phone: '',
  is_active: true,
  password: '',
  password_confirm: '',
}

export function CreateUserSection({ onCreated }: CreateUserSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [formKey, setFormKey] = useState(0)

  const handleSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      await createUser({
        username: values.username.trim(),
        email: values.email.trim(),
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        role: values.role,
        phone: values.phone.trim(),
        is_active: values.is_active,
        password: values.password,
        password_confirm: values.password_confirm,
      })
      setSuccessMessage('Usuario creado correctamente.')
      setFormKey((prev) => prev + 1)
      await onCreated()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo crear el usuario.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="card stack">
      <h4>Crear usuario</h4>
      <UserForm
        initialValues={initialValues}
        isSubmitting={isSubmitting}
        key={formKey}
        mode="create"
        onSubmit={handleSubmit}
        submitLabel="Crear usuario"
      />
      {successMessage ? <p className="status-ok">{successMessage}</p> : null}
      {errorMessage ? <p className="status-alert">{errorMessage}</p> : null}
    </section>
  )
}
