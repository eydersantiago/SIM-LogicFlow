import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'

import { roleLabels } from '@/app/navigation'
import { useAuth } from '@/context/AuthContext'
import { usersMock } from '@/domain/mockData'
import type { UserRole } from '@/domain/types'

const roleOptions = Array.from(new Set(usersMock.map((userItem) => userItem.role)))

export function LoginPage() {
  const { isAuthenticated, loginAsRole } = useAuth()
  const [selectedRole, setSelectedRole] = useState<UserRole>('COORDINADOR_ACADEMICO')
  const [showRolePicker, setShowRolePicker] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (isAuthenticated) {
    return <Navigate replace to="/" />
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    loginAsRole(selectedRole)
  }

  return (
    <section className="login-page">
      <article className="login-split">
        <aside className="login-brand-panel">
          <div className="login-brand-content">
            <div className="login-brand-card">
              <img alt="SIM LogicFlow" src="/logoSIMLogic.png" />
            </div>
            <div className="login-brand-copy">
              <h1>Bienvenido</h1>
              <p>Que bueno tenerte nuevamente</p>
            </div>
          </div>
        </aside>

        <main className="login-form-panel">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>Inicio de Sesion</h2>

            <div className="field login-field">
              <label htmlFor="email">Correo</label>
              <input
                autoComplete="email"
                id="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="usuario@cea.gov.co"
                required
                type="email"
                value={email}
              />
            </div>

            <div className="field login-field">
              <label htmlFor="password">Contrasena</label>
              <input
                autoComplete="current-password"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                placeholder="***********"
                required
                type="password"
                value={password}
              />
            </div>

            <button className="button button-primary login-submit" type="submit">
              Entrar
            </button>

            <button
              className="login-role-toggle"
              onClick={() => setShowRolePicker((value) => !value)}
              type="button"
            >
              Modo demo
            </button>

            {showRolePicker ? (
              <div className="field login-role-picker">
                <label htmlFor="role">Perfil temporal</label>
                <select
                  id="role"
                  onChange={(event) => setSelectedRole(event.target.value as UserRole)}
                  value={selectedRole}
                >
                  {roleOptions.map((roleOption) => (
                    <option key={roleOption} value={roleOption}>
                      {roleLabels[roleOption]}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </form>
        </main>
      </article>
    </section>
  )
}
