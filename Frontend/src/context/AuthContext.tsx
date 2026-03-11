import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

import { usersMock } from '@/domain/mockData'
import type { AppUser, UserRole } from '@/domain/types'

const SESSION_STORAGE_KEY = 'sim-logicflow-session'

interface AuthContextValue {
  user: AppUser | null
  isAuthenticated: boolean
  loginAsRole: (role: UserRole) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function getInitialUser(): AppUser | null {
  const rawUser = localStorage.getItem(SESSION_STORAGE_KEY)

  if (!rawUser) {
    return null
  }

  try {
    const parsedUser = JSON.parse(rawUser) as AppUser
    return parsedUser
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(getInitialUser)

  const loginAsRole = (role: UserRole) => {
    const selectedUser = usersMock.find((item) => item.role === role)

    if (!selectedUser) {
      return
    }

    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(selectedUser))
    setUser(selectedUser)
  }

  const logout = () => {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    setUser(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loginAsRole,
      logout,
    }),
    [user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}
