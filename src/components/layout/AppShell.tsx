import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { appModules, roleLabels } from '@/app/navigation'
import { useAuth } from '@/context/AuthContext'

export function AppShell() {
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()

  if (!user) {
    return null
  }

  const isCoordinatorRole =
    user.role === 'COORDINADOR_ACADEMICO' || user.role === 'COORDINADOR_TECNICO'

  const availableModules = appModules.filter(
    (moduleItem) => moduleItem.visibleInMenu && moduleItem.allowedRoles.includes(user.role),
  )

  const todayLabel = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  if (isCoordinatorRole) {
    const topbarModules = availableModules.filter((moduleItem) => moduleItem.path !== '/')

    return (
      <div className={`coordinator-shell${mobileMenuOpen ? ' menu-open' : ''}`}>
        <header className="coordinator-topbar">
          <div className="coordinator-top-row coordinator-top-row-primary">
            <div className="coordinator-greeting">
              <h2>Bienvenido {roleLabels[user.role]}</h2>
              <p>{user.fullName}</p>
            </div>
            <img alt="SIM LogicFlow" className="coordinator-logo" src="/logoSIMLogic.png" />
          </div>

          <div className="coordinator-top-row coordinator-top-row-secondary">
            <nav aria-label="Menu principal coordinador" className="coordinator-menu">
              {topbarModules.map((moduleItem) => (
                <NavLink
                  key={moduleItem.path}
                  className={({ isActive }) =>
                    `coordinator-menu-link${isActive ? ' coordinator-menu-link-active' : ''}`
                  }
                  to={moduleItem.path}
                >
                  {moduleItem.label}
                </NavLink>
              ))}
            </nav>

            <div className="coordinator-action-buttons">
              <button
                className="button button-muted coordinator-mobile-toggle"
                onClick={() => setMobileMenuOpen(true)}
                type="button"
              >
                Menu
              </button>
              <button
                className="button button-muted coordinator-icon-button"
                onClick={() => navigate('/perfil/configuracion')}
                title="Configuracion de perfil"
                type="button"
              >
                <svg aria-hidden="true" className="coordinator-icon" viewBox="0 0 24 24">
                  <path
                    d="M19.14 12.94a7.77 7.77 0 0 0 .05-.94 7.77 7.77 0 0 0-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.06 7.06 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 2h-3.8a.5.5 0 0 0-.49.42l-.36 2.54c-.58.23-1.13.54-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.48a.5.5 0 0 0 .12.64l2.03 1.58a7.77 7.77 0 0 0-.05.94 7.77 7.77 0 0 0 .05.94L2.83 14.16a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.4 1.05.71 1.63.94l.36 2.54a.5.5 0 0 0 .49.42h3.8a.5.5 0 0 0 .49-.42l.36-2.54c.58-.23 1.13-.54 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64Zm-7.14 2.31A3.25 3.25 0 1 1 15.25 12 3.26 3.26 0 0 1 12 15.25Z"
                    fill="currentColor"
                  />
                </svg>
                Perfil
              </button>
              <button
                className="button button-muted coordinator-icon-button coordinator-logout-button"
                onClick={logout}
                title="Cerrar sesion"
                type="button"
              >
                <svg aria-hidden="true" className="coordinator-icon" viewBox="0 0 24 24">
                  <path
                    d="M12 2a10 10 0 1 0 10 10 .75.75 0 0 0-1.5 0A8.5 8.5 0 1 1 12 3.5a.75.75 0 0 0 0-1.5Zm-.75 4.5v6a.75.75 0 0 0 1.5 0v-6a.75.75 0 0 0-1.5 0Z"
                    fill="currentColor"
                  />
                </svg>
                Cerrar sesion
              </button>
            </div>
          </div>
        </header>

        <aside className="coordinator-drawer">
          <div className="coordinator-drawer-head">
            <strong>Menu</strong>
            <button
              className="button button-muted coordinator-drawer-close"
              onClick={() => setMobileMenuOpen(false)}
              type="button"
            >
              Cerrar
            </button>
          </div>

          <nav aria-label="Menu lateral">
            <ul className="nav-list">
              {availableModules.map((moduleItem) => (
                <li key={moduleItem.path}>
                  <NavLink
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                    onClick={() => setMobileMenuOpen(false)}
                    to={moduleItem.path}
                  >
                    {moduleItem.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <button
          aria-label="Cerrar menu lateral"
          className="coordinator-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          type="button"
        />

        <main className="content coordinator-content">
          <p className="inline-note">{todayLabel}</p>
          <Outlet />
        </main>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>SIM LogicFlow</h1>
          <p>Programacion academica y tecnica</p>
        </div>

        <nav>
          <ul className="nav-list">
            {availableModules.map((moduleItem) => (
              <li key={moduleItem.path}>
                <NavLink
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  to={moduleItem.path}
                >
                  {moduleItem.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div>
            <h2>Centro de Estudios Aeronauticos (CEA)</h2>
            <p className="inline-note">{todayLabel}</p>
          </div>
          <div className="topbar-right">
            <span className="role-chip">{roleLabels[user.role]}</span>
            <strong>{user.fullName}</strong>
            <button className="button button-muted" onClick={logout} type="button">
              Cerrar sesion
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
