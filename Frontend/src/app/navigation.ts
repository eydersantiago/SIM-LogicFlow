import type { RouteModule, UserRole } from '@/domain/types'

export const roleLabels: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  ACADEMIC_COORDINATOR: 'Coord. Academico',
  TECHNICAL_COORDINATOR: 'Coord. Tecnico',
  INSTRUCTOR: 'Instructor',
  PSEUDOPILOT: 'Pseudopiloto',
  STUDENT: 'Estudiante',
}

export const appModules: RouteModule[] = [
  {
    path: '/',
    label: 'Panel General',
    description: 'Resumen de programacion y operacion',
    allowedRoles: [
      'ADMIN',
      'ACADEMIC_COORDINATOR',
      'TECHNICAL_COORDINATOR',
      'INSTRUCTOR',
      'PSEUDOPILOT',
      'STUDENT',
    ],
    visibleInMenu: true,
  },
  {
    path: '/coordinacion/usuarios',
    label: 'Usuarios',
    description: 'Gestion inicial de perfiles y roles',
    allowedRoles: ['ADMIN', 'ACADEMIC_COORDINATOR', 'TECHNICAL_COORDINATOR'],
    visibleInMenu: true,
  },
  {
    path: '/academico/cursos',
    label: 'Cursos ATS',
    description: 'Creacion y ajuste de cursos',
    allowedRoles: ['ADMIN', 'ACADEMIC_COORDINATOR'],
    visibleInMenu: true,
  },
  {
    path: '/academico/programacion',
    label: 'Programacion',
    description: 'Agendamiento y validacion de restricciones',
    allowedRoles: ['ADMIN', 'ACADEMIC_COORDINATOR'],
    visibleInMenu: true,
  },
  {
    path: '/tecnico/mantenimientos',
    label: 'Mantenimientos',
    description: 'Bloqueos preventivos y correctivos',
    allowedRoles: ['ADMIN', 'TECHNICAL_COORDINATOR'],
    visibleInMenu: true,
  },
  {
    path: '/consulta/agenda',
    label: 'Consulta Agenda',
    description: 'Vista semanal o mensual para usuarios finales',
    allowedRoles: [
      'ADMIN',
      'ACADEMIC_COORDINATOR',
      'TECHNICAL_COORDINATOR',
      'INSTRUCTOR',
      'PSEUDOPILOT',
      'STUDENT',
    ],
    visibleInMenu: true,
  },
  {
    path: '/reportes',
    label: 'Reportes',
    description: 'Metricas de uso y operatividad',
    allowedRoles: ['ADMIN', 'ACADEMIC_COORDINATOR', 'TECHNICAL_COORDINATOR'],
    visibleInMenu: true,
  },
]
