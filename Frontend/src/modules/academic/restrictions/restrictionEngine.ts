import type { AcademicSession, MaintenanceWindow, RoomRule } from '@/domain/types'

type RestrictionCode =
  | 'FATIGUE_LIMIT'
  | 'ROOM_CAPACITY'
  | 'POSITION_CAPACITY'
  | 'SCHEDULE_CONFLICT'
  | 'MAINTENANCE_BLOCK'

export interface RestrictionAlert {
  code: RestrictionCode
  level: 'error' | 'warning'
  message: string
}

export interface RestrictionInput {
  candidateSession: AcademicSession
  sameDaySessions: AcademicSession[]
  roomRule: RoomRule
  consumedHoursByCourse: number
  consumedHoursByInstructor: number
  maintenanceWindows: MaintenanceWindow[]
}

function parseTimeToMinutes(timeValue: string) {
  const [hours, minutes] = timeValue.split(':').map(Number)
  return hours * 60 + minutes
}

function hasTimeOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd
}

function getDurationHours(startTime: string, endTime: string) {
  return (parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime)) / 60
}

function asIsoDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00-05:00`)
}

export function evaluateAcademicRestrictions(input: RestrictionInput): RestrictionAlert[] {
  const alerts: RestrictionAlert[] = []
  const { candidateSession } = input

  const sessionHours = getDurationHours(candidateSession.startTime, candidateSession.endTime)

  if (input.consumedHoursByCourse + sessionHours > 6) {
    alerts.push({
      code: 'FATIGUE_LIMIT',
      level: 'error',
      message: 'Se supera el limite de 6 horas diarias para el curso.',
    })
  }

  if (input.consumedHoursByInstructor + sessionHours > 6) {
    alerts.push({
      code: 'FATIGUE_LIMIT',
      level: 'error',
      message: 'Se supera el limite de 6 horas diarias para el instructor.',
    })
  }

  const totalOccupants = candidateSession.students + candidateSession.pseudopilots

  if (totalOccupants > input.roomRule.maxSeats) {
    alerts.push({
      code: 'ROOM_CAPACITY',
      level: 'error',
      message: `Aforo excedido: ${totalOccupants}/${input.roomRule.maxSeats}.`,
    })
  }

  if (candidateSession.students > input.roomRule.maxPositions) {
    alerts.push({
      code: 'POSITION_CAPACITY',
      level: 'error',
      message: `Posiciones excedidas: ${candidateSession.students}/${input.roomRule.maxPositions}.`,
    })
  }

  const candidateStart = parseTimeToMinutes(candidateSession.startTime)
  const candidateEnd = parseTimeToMinutes(candidateSession.endTime)

  const hasAcademicConflict = input.sameDaySessions.some((existingSession) => {
    const existingStart = parseTimeToMinutes(existingSession.startTime)
    const existingEnd = parseTimeToMinutes(existingSession.endTime)

    const overlaps = hasTimeOverlap(candidateStart, candidateEnd, existingStart, existingEnd)
    const sameRoom = existingSession.roomName === candidateSession.roomName

    return overlaps && sameRoom
  })

  if (hasAcademicConflict) {
    alerts.push({
      code: 'SCHEDULE_CONFLICT',
      level: 'error',
      message: 'Existe cruce horario con otra sesion academica en la misma sala.',
    })
  }

  const candidateStartDate = asIsoDateTime(candidateSession.date, candidateSession.startTime)
  const candidateEndDate = asIsoDateTime(candidateSession.date, candidateSession.endTime)

  const collidesWithMaintenance = input.maintenanceWindows.some((maintenanceItem) => {
    if (maintenanceItem.roomName !== candidateSession.roomName) {
      return false
    }

    if (maintenanceItem.status === 'FINALIZADO') {
      return false
    }

    const maintenanceStart = new Date(maintenanceItem.startsAt)
    const maintenanceEnd = new Date(maintenanceItem.endsAt)

    return candidateStartDate < maintenanceEnd && maintenanceStart < candidateEndDate
  })

  if (collidesWithMaintenance) {
    alerts.push({
      code: 'MAINTENANCE_BLOCK',
      level: 'error',
      message: 'La ventana de mantenimiento bloquea la sesion propuesta.',
    })
  }

  return alerts
}
