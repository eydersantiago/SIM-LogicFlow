export type UserRole =
  | 'ADMIN'
  | 'ACADEMIC_COORDINATOR'
  | 'TECHNICAL_COORDINATOR'
  | 'INSTRUCTOR'
  | 'PSEUDOPILOT'
  | 'STUDENT'

export interface AppUser {
  id: number
  username: string
  firstName?: string
  lastName?: string
  fullName: string
  email: string
  role: UserRole
  phone?: string | null
  createdAt?: string
  isActive?: boolean
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
