import { dashboardMetrics, maintenanceWindowsMock } from '@/domain/mockData'

export function DashboardPage() {
  return (
    <>
      <header className="page-header">
        <h3>Panel general</h3>
        <p>
          Vista consolidada para seguimiento de programacion academica, disponibilidad tecnica y
          cumplimiento operativo.
        </p>
      </header>

      <section className="card-grid">
        {dashboardMetrics.map((metricItem) => (
          <article key={metricItem.id} className="card">
            <span className="label">{metricItem.label}</span>
            <p className="metric-value">{metricItem.value}</p>
            <p className="inline-note">{metricItem.detail}</p>
          </article>
        ))}
      </section>

      <section className="card stack">
        <h4>Mantenimientos activos / programados</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Simulador</th>
              <th>Sala</th>
              <th>Tipo</th>
              <th>Estado</th>
              <th>Ventana</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceWindowsMock.map((maintenanceItem) => (
              <tr key={maintenanceItem.id}>
                <td>{maintenanceItem.simulator}</td>
                <td>{maintenanceItem.roomName}</td>
                <td>{maintenanceItem.type}</td>
                <td>{maintenanceItem.status}</td>
                <td>
                  {maintenanceItem.startsAt.slice(0, 16).replace('T', ' ')} -{' '}
                  {maintenanceItem.endsAt.slice(11, 16)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  )
}
