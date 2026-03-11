import { reportMetrics } from '@/domain/mockData'

export function ReportsPage() {
  return (
    <>
      <header className="page-header">
        <h3>Reportes estadisticos</h3>
        <p>
          Estructura inicial para metricas de uso, tiempo fuera de servicio y poblacion capacitada.
        </p>
      </header>

      <section className="card-grid">
        {reportMetrics.map((metricItem) => (
          <article key={metricItem.id} className="card">
            <span className="label">{metricItem.label}</span>
            <p className="metric-value">{metricItem.value}</p>
            <p className="inline-note">{metricItem.period}</p>
          </article>
        ))}
      </section>

      <section className="card stack">
        <h4>Siguiente paso sugerido</h4>
        <ul className="list">
          <li>Crear endpoint de agregacion en DRF para periodos semanales y mensuales.</li>
          <li>Conectar modulo a libreria de graficas para tendencias por simulador.</li>
          <li>Exportar consolidado a CSV/PDF para comites de seguimiento del PIC.</li>
        </ul>
      </section>
    </>
  )
}
