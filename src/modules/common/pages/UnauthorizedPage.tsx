import { Link } from 'react-router-dom'

export function UnauthorizedPage() {
  return (
    <section className="auth-page">
      <article className="auth-card stack">
        <span className="badge">Acceso restringido</span>
        <div className="page-header">
          <h3>No tienes permisos para este modulo</h3>
          <p>Solicita acceso a coordinacion o vuelve al panel principal.</p>
        </div>
        <Link className="button button-primary" to="/">
          Ir al panel
        </Link>
      </article>
    </section>
  )
}
