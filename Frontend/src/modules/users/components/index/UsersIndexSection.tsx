import { roleLabels } from '@/app/navigation'
import type { AppUser } from '@/domain/types'

interface UsersIndexSectionProps {
  users: AppUser[]
  isLoading: boolean
  errorMessage: string
  deletingUserId: number | null
  canDelete: boolean
  onEdit: (user: AppUser) => void
  onDelete: (user: AppUser) => void
}

export function UsersIndexSection({
  users,
  isLoading,
  errorMessage,
  deletingUserId,
  canDelete,
  onEdit,
  onDelete,
}: UsersIndexSectionProps) {
  return (
    <section className="card stack">
      <h4>Usuarios existentes</h4>
      {isLoading ? <p className="inline-note">Cargando usuarios...</p> : null}
      {errorMessage ? <p className="status-alert">{errorMessage}</p> : null}
      {!isLoading && !errorMessage && users.length === 0 ? (
        <p className="inline-note">No hay usuarios para mostrar.</p>
      ) : null}

      {!isLoading && !errorMessage && users.length > 0 ? (
        <table className="table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
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
                <td>
                  <div className="modal-actions">
                    <button className="btn-cancel" onClick={() => onEdit(userItem)} type="button">
                      Editar
                    </button>
                    {canDelete ? (
                      <button
                        className="btn-submit"
                        disabled={deletingUserId === userItem.id}
                        onClick={() => onDelete(userItem)}
                        type="button"
                      >
                        {deletingUserId === userItem.id ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  )
}
