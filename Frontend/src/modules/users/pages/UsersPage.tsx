import { useEffect, useState } from 'react'

import { roleLabels } from '@/app/navigation'
import type { AppUser } from '@/domain/types'
import { fetchUsers } from '@/services/api/simlogicApi'

export function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true)
      setErrorMessage('')
      try {
        const payload = await fetchUsers()
        setUsers(payload)
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'No se pudo cargar el listado de usuarios.',
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadUsers()
  }, [])

  return (
    <>
      <header className="page-header">
        <h3>Administracion de usuarios</h3>
        <p>Listado en tiempo real desde el backend.</p>
      </header>

      <section className="card stack">
        {isLoading ? <p className="inline-note">Cargando usuarios...</p> : null}
        {errorMessage ? <p className="status-alert">{errorMessage}</p> : null}

        {!isLoading && !errorMessage ? (
          <table className="table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userItem) => (
                <tr key={userItem.id}>
                  <td>{userItem.username}</td>
                  <td>{userItem.fullName}</td>
                  <td>{userItem.email}</td>
                  <td>{roleLabels[userItem.role]}</td>
                  <td>
                    <span className="badge">{userItem.isActive ? 'Activo' : 'Inactivo'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </section>
    </>
  )
}
