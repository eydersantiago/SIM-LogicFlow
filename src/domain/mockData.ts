import type {
  AcademicSession,
  AppUser,
  DashboardMetric,
  MaintenanceWindow,
  ReportMetric,
  RoomRule,
} from '@/domain/types'

export const usersMock: AppUser[] = [
  {
    id: 'u-001',
    fullName: 'Paula Mendoza',
    email: 'paula.mendoza@cea.gov.co',
    role: 'COORDINADOR_ACADEMICO',
  },
  {
    id: 'u-002',
    fullName: 'Carlos Pardo',
    email: 'carlos.pardo@cea.gov.co',
    role: 'COORDINADOR_TECNICO',
  },
  {
    id: 'u-003',
    fullName: 'Maria Correa',
    email: 'maria.correa@cea.gov.co',
    role: 'INSTRUCTOR',
  },
  {
    id: 'u-004',
    fullName: 'Diego Suarez',
    email: 'diego.suarez@cea.gov.co',
    role: 'PSEUDOPILOTO',
  },
  {
    id: 'u-005',
    fullName: 'Laura Rojas',
    email: 'laura.rojas@cea.gov.co',
    role: 'ESTUDIANTE',
  },
]

export const dashboardMetrics: DashboardMetric[] = [
  {
    id: 'm-001',
    label: 'Cursos programados',
    value: '18',
    detail: 'Semana actual',
  },
  {
    id: 'm-002',
    label: 'Horas de simulador',
    value: '94 h',
    detail: 'Acumulado mensual',
  },
  {
    id: 'm-003',
    label: 'Mantenimientos abiertos',
    value: '3',
    detail: 'Preventivos + correctivos',
  },
  {
    id: 'm-004',
    label: 'Conflictos detectados',
    value: '5',
    detail: 'Cruces por resolver',
  },
]

export const roomRules: RoomRule[] = [
  {
    roomName: 'Sala Radar THA-01',
    simulator: 'THALES',
    maxSeats: 14,
    maxPositions: 8,
  },
  {
    roomName: 'Sala Torre IND-02',
    simulator: 'INDRA',
    maxSeats: 12,
    maxPositions: 6,
  },
]

export const academicSessionsMock: AcademicSession[] = [
  {
    id: 's-001',
    courseCode: 'ATC-101',
    courseName: 'Radar Basico',
    date: '2026-03-11',
    startTime: '08:00',
    endTime: '11:00',
    roomName: 'Sala Radar THA-01',
    simulator: 'THALES',
    instructor: 'Maria Correa',
    students: 6,
    pseudopilots: 2,
  },
  {
    id: 's-002',
    courseCode: 'ATC-205',
    courseName: 'Torre Intermedia',
    date: '2026-03-11',
    startTime: '10:30',
    endTime: '13:30',
    roomName: 'Sala Torre IND-02',
    simulator: 'INDRA',
    instructor: 'Ernesto Paz',
    students: 5,
    pseudopilots: 1,
  },
  {
    id: 's-003',
    courseCode: 'ATC-330',
    courseName: 'Escenarios de Emergencia',
    date: '2026-03-12',
    startTime: '14:00',
    endTime: '17:00',
    roomName: 'Sala Radar THA-01',
    simulator: 'THALES',
    instructor: 'Felipe Gomez',
    students: 7,
    pseudopilots: 2,
  },
]

export const maintenanceWindowsMock: MaintenanceWindow[] = [
  {
    id: 'mt-001',
    simulator: 'THALES',
    roomName: 'Sala Radar THA-01',
    type: 'PREVENTIVO',
    status: 'PROGRAMADO',
    startsAt: '2026-03-11T10:00:00-05:00',
    endsAt: '2026-03-11T12:00:00-05:00',
    owner: 'Carlos Pardo',
  },
  {
    id: 'mt-002',
    simulator: 'INDRA',
    roomName: 'Sala Torre IND-02',
    type: 'CORRECTIVO',
    status: 'EN_PROGRESO',
    startsAt: '2026-03-12T09:00:00-05:00',
    endsAt: '2026-03-12T11:30:00-05:00',
    owner: 'Mantenimiento CEA',
  },
]

export const reportMetrics: ReportMetric[] = [
  {
    id: 'r-001',
    label: 'Uso THALES',
    period: 'Ultimos 30 dias',
    value: '72%',
  },
  {
    id: 'r-002',
    label: 'Uso INDRA',
    period: 'Ultimos 30 dias',
    value: '64%',
  },
  {
    id: 'r-003',
    label: 'Tiempo fuera de servicio',
    period: 'Ultimos 30 dias',
    value: '11 h',
  },
  {
    id: 'r-004',
    label: 'Personal capacitado',
    period: 'Trimestre',
    value: '126',
  },
]
