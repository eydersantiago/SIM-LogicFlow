import { Navigate, Outlet } from 'react-router-dom'

import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/domain/types'

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isBootstrapping, user } = useAuth()

  if (isBootstrapping) {
    return null
  }

  if (!isAuthenticated || !user) {
    return <Navigate replace to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate replace to="/unauthorized" />
  }

  return <Outlet />
}
