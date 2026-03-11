export type UserRole =
  | 'COORDINADOR_ACADEMICO'
  | 'COORDINADOR_TECNICO'
  | 'INSTRUCTOR'
  | 'PSEUDOPILOTO'
  | 'ESTUDIANTE'

export interface AppUser {
  id: string
  fullName: string
  email: string
  role: UserRole
}

export type SimulatorPlatform = 'THALES' | 'INDRA'

export interface RoomRule {
  roomName: string
  simulator: SimulatorPlatform
  maxSeats: number
  maxPositions: number
}

export interface AcademicSession {
  id: string
  courseCode: string
  courseName: string
  date: string
  startTime: string
  endTime: string
  roomName: string
  simulator: SimulatorPlatform
  instructor: string
  students: number
  pseudopilots: number
}

export interface MaintenanceWindow {
  id: string
  simulator: SimulatorPlatform
  roomName: string
  type: 'PREVENTIVO' | 'CORRECTIVO'
  status: 'PROGRAMADO' | 'EN_PROGRESO' | 'FINALIZADO'
  startsAt: string
  endsAt: string
  owner: string
}

export interface DashboardMetric {
  id: string
  label: string
  value: string
  detail: string
}

export interface RouteModule {
  path: string
  label: string
  description: string
  allowedRoles: UserRole[]
  visibleInMenu: boolean
}

export interface ReportMetric {
  id: string
  label: string
  period: string
  value: string
}
