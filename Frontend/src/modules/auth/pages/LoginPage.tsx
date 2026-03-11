import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'

export function LoginPage() {
  const { isAuthenticated, isBootstrapping, login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isBootstrapping) {
    return null
  }

  if (isAuthenticated) {
    return <Navigate replace to="/" />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessage('')
    setIsSubmitting(true)

    try {
      await login(username.trim(), password)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudo iniciar sesion. Intenta de nuevo.',
      )
    } finally {
      setIsSubmitting(false)
    }
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
              <p>Ingresa con tus credenciales del backend</p>
            </div>
          </div>
        </aside>

        <main className="login-form-panel">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>Inicio de Sesion</h2>

            <div className="field login-field">
              <label htmlFor="username">Usuario</label>
              <input
                autoComplete="username"
                id="username"
                onChange={(event) => setUsername(event.target.value)}
                placeholder="admin"
                required
                type="text"
                value={username}
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

            {errorMessage ? <p className="status-alert">{errorMessage}</p> : null}

            <button className="button button-primary login-submit" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>
        </main>
      </article>
    </section>
  )
}
