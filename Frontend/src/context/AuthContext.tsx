/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type { AppUser } from '@/domain/types'
import {
  clearAuthTokens,
  getAccessToken,
  setAuthTokens,
} from '@/services/api/client'
import {
  fetchMe,
  login as loginRequest,
  updateMe,
  type ProfileUpdatePayload,
} from '@/services/api/simlogicApi'

const USER_STORAGE_KEY = 'sim-logicflow-user'

interface AuthContextValue {
  user: AppUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  updateProfile: (payload: ProfileUpdatePayload) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function getInitialUser() {
  const payload = localStorage.getItem(USER_STORAGE_KEY)
  if (!payload) {
    return null
  }

  try {
    return JSON.parse(payload) as AppUser
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY)
    return null
  }
}

function persistUser(user: AppUser | null) {
  if (!user) {
    localStorage.removeItem(USER_STORAGE_KEY)
    return
  }
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(getInitialUser)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const logout = useCallback(() => {
    clearAuthTokens()
    persistUser(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const me = await fetchMe()
    persistUser(me)
    setUser(me)
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    const payload = await loginRequest(username, password)
    setAuthTokens(payload.access, payload.refresh)
    persistUser(payload.user)
    setUser(payload.user)
  }, [])

  const updateProfile = useCallback(async (payload: ProfileUpdatePayload) => {
    const updatedUser = await updateMe(payload)
    persistUser(updatedUser)
    setUser(updatedUser)
  }, [])

  useEffect(() => {
    const bootstrap = async () => {
      const accessToken = getAccessToken()
      if (!accessToken) {
        setIsBootstrapping(false)
        return
      }

      try {
        await refreshUser()
      } catch {
        logout()
      } finally {
        setIsBootstrapping(false)
      }
    }

    bootstrap()
  }, [logout, refreshUser])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isBootstrapping,
      login,
      logout,
      refreshUser,
      updateProfile,
    }),
    [isBootstrapping, login, logout, refreshUser, updateProfile, user],
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
