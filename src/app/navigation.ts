import type { RouteModule, UserRole } from '@/domain/types'

export const roleLabels: Record<UserRole, string> = {
  COORDINADOR_ACADEMICO: 'Coord. Academico',
  COORDINADOR_TECNICO: 'Coord. Tecnico',
  INSTRUCTOR: 'Instructor',
  PSEUDOPILOTO: 'Pseudopiloto',
  ESTUDIANTE: 'Estudiante',
}

export const appModules: RouteModule[] = [
  {
    path: '/',
    label: 'Panel General',
    description: 'Resumen de programacion y operacion',
    allowedRoles: [
      'COORDINADOR_ACADEMICO',
      'COORDINADOR_TECNICO',
      'INSTRUCTOR',
      'PSEUDOPILOTO',
      'ESTUDIANTE',
    ],
    visibleInMenu: true,
  },
  {
    path: '/coordinacion/usuarios',
    label: 'Usuarios',
    description: 'Gestion inicial de perfiles y roles',
    allowedRoles: ['COORDINADOR_ACADEMICO', 'COORDINADOR_TECNICO'],
    visibleInMenu: true,
  },
  {
    path: '/academico/cursos',
    label: 'Cursos ATS',
    description: 'Creacion y ajuste de cursos',
    allowedRoles: ['COORDINADOR_ACADEMICO'],
    visibleInMenu: true,
  },
  {
    path: '/academico/programacion',
    label: 'Programacion',
    description: 'Agendamiento y validacion de restricciones',
    allowedRoles: ['COORDINADOR_ACADEMICO'],
    visibleInMenu: true,
  },
  {
    path: '/tecnico/mantenimientos',
    label: 'Mantenimientos',
    description: 'Bloqueos preventivos y correctivos',
    allowedRoles: ['COORDINADOR_TECNICO'],
    visibleInMenu: true,
  },
  {
    path: '/consulta/agenda',
    label: 'Consulta Agenda',
    description: 'Vista semanal o mensual para usuarios finales',
    allowedRoles: [
      'COORDINADOR_ACADEMICO',
      'COORDINADOR_TECNICO',
      'INSTRUCTOR',
      'PSEUDOPILOTO',
      'ESTUDIANTE',
    ],
    visibleInMenu: true,
  },
  {
    path: '/reportes',
    label: 'Reportes',
    description: 'Metricas de uso y operatividad',
    allowedRoles: ['COORDINADOR_ACADEMICO', 'COORDINADOR_TECNICO'],
    visibleInMenu: true,
  },
]
