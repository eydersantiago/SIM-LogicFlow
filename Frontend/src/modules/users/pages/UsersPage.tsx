import { useEffect, useState } from 'react'

import { useAuth } from '@/context/AuthContext'
import type { AppUser } from '@/domain/types'
import { deleteUser, fetchUsers } from '@/services/api/simlogicApi'

import { CreateUserSection } from '../components/create/CreateUserSection'
import { EditUserSection } from '../components/edit/EditUserSection'
import { UsersIndexSection } from '../components/index/UsersIndexSection'

export function UsersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<AppUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null)
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null)

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

  useEffect(() => {
    loadUsers()
  }, [])

  const handleDelete = async (user: AppUser) => {
    const confirmed = window.confirm(`¿Deseas eliminar al usuario "${user.username}"?`)
    if (!confirmed) {
      return
    }

    setDeletingUserId(user.id)
    setStatusMessage('')
    setErrorMessage('')
    try {
      await deleteUser(user.id)
      setStatusMessage('Usuario eliminado correctamente.')
      if (selectedUser?.id === user.id) {
        setSelectedUser(null)
      }
      await loadUsers()
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo eliminar el usuario.')
    } finally {
      setDeletingUserId(null)
    }
  }

  return (
    <>
      <header className="page-header">
        <h3>Administracion de usuarios</h3>
        <p>CRUD completo con estructura `index/create/edit/form`.</p>
      </header>

      <CreateUserSection onCreated={loadUsers} />
      {statusMessage ? <p className="status-ok">{statusMessage}</p> : null}
      <UsersIndexSection
        canDelete={currentUser?.role === 'ADMIN'}
        deletingUserId={deletingUserId}
        errorMessage={errorMessage}
        isLoading={isLoading}
        onDelete={handleDelete}
        onEdit={setSelectedUser}
        users={users}
      />
      <EditUserSection onCancel={() => setSelectedUser(null)} onUpdated={loadUsers} user={selectedUser} />
    </>
  )
}
