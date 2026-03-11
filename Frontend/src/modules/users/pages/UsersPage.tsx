import { roleLabels } from '@/app/navigation'
import { usersMock } from '@/domain/mockData'

export function UsersPage() {
  return (
    <>
      <header className="page-header">
        <h3>Administracion de usuarios</h3>
        <p>
          Estructura base para HU-09 (gestion de perfiles). La conexion con API queda preparada en
          `src/services/api`.
        </p>
      </header>

      <section className="card stack">
        <table className="table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {usersMock.map((userItem) => (
              <tr key={userItem.id}>
                <td>{userItem.fullName}</td>
                <td>{userItem.email}</td>
                <td>{roleLabels[userItem.role]}</td>
                <td>
                  <span className="badge">Activo</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
