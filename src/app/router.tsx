import { Navigate, Route, Routes } from 'react-router-dom'

import { ProtectedRoute } from '@/app/guards/ProtectedRoute'
import { AppShell } from '@/components/layout/AppShell'
import { CoursesPage } from '@/modules/academic/pages/CoursesPage'
import { SchedulingPage } from '@/modules/academic/pages/SchedulingPage'
import { LoginPage } from '@/modules/auth/pages/LoginPage'
import { AgendaPage } from '@/modules/consultation/pages/AgendaPage'
import { DashboardPage } from '@/modules/dashboard/pages/DashboardPage'
import { UnauthorizedPage } from '@/modules/common/pages/UnauthorizedPage'
import { ReportsPage } from '@/modules/reports/pages/ReportsPage'
import { MaintenancePage } from '@/modules/technical/pages/MaintenancePage'
import { UsersPage } from '@/modules/users/pages/UsersPage'
import { ProfileSettingsPage } from '@/modules/profile/pages/ProfileSettingsPage'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route
          element={<ProtectedRoute allowedRoles={['COORDINADOR_ACADEMICO', 'COORDINADOR_TECNICO']} />}
        >
          <Route path="perfil/configuracion" element={<ProfileSettingsPage />} />
        </Route>

        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="consulta/agenda" element={<AgendaPage />} />

          <Route
            element={
              <ProtectedRoute allowedRoles={['COORDINADOR_ACADEMICO', 'COORDINADOR_TECNICO']} />
            }
          >
            <Route path="coordinacion/usuarios" element={<UsersPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['COORDINADOR_ACADEMICO']} />}>
            <Route path="academico/cursos" element={<CoursesPage />} />
            <Route path="academico/programacion" element={<SchedulingPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['COORDINADOR_TECNICO']} />}>
            <Route path="tecnico/mantenimientos" element={<MaintenancePage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute
                allowedRoles={['COORDINADOR_ACADEMICO', 'COORDINADOR_TECNICO']}
              />
            }
          >
            <Route path="reportes" element={<ReportsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate replace to="/" />} />
    </Routes>
  )
}
