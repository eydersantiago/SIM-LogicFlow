import { maintenanceWindowsMock } from '@/domain/mockData'

export function MaintenancePage() {
  return (
    <>
      <header className="page-header">
        <h3>Panel de Gestion Tecnica</h3>
        <p>
          Base para HU-15 a HU-18: programar, modificar y consultar mantenimientos preventivos y
          correctivos.
        </p>
      </header>

      <section className="card stack">
        <table className="table">
          <thead>
            <tr>
              <th>Simulador</th>
              <th>Sala</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Inicio</th>
              <th>Fin</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceWindowsMock.map((maintenanceItem) => (
              <tr key={maintenanceItem.id}>
                <td>{maintenanceItem.simulator}</td>
                <td>{maintenanceItem.roomName}</td>
                <td>{maintenanceItem.type}</td>
                <td>{maintenanceItem.status}</td>
                <td>{maintenanceItem.startsAt.slice(0, 16).replace('T', ' ')}</td>
                <td>{maintenanceItem.endsAt.slice(0, 16).replace('T', ' ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
