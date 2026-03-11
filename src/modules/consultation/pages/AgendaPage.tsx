import {
  useMemo,
  useState,
  type ChangeEvent,
  type ComponentType,
  type FormEvent,
} from 'react'

import * as AgendfyCore from '@react-agendfy/core'
import '@react-agendfy/core/core.css'

import { academicSessionsMock } from '@/domain/mockData'

type AgendaView = 'SEMANAL' | 'MENSUAL'
type CalendarView = 'week' | 'month'

interface EmbeddedAgendaEvent {
  id: string
  title: string
  start: string
  end: string
  color: string
  isAllDay: boolean
  isMultiDay: boolean
}

interface ResourceOption {
  id: string
  label: string
  icon: 'building' | 'user' | 'monitor'
}

interface NewEventFormData {
  title: string
  start: string
  end: string
  color: string
  isAllDay: boolean
  isMultiDay: boolean
  resources: string[]
}

const eventColors = ['#0d6efd', '#198754', '#d63384', '#fd7e14', '#20c997', '#6f42c1']
const EmbeddedCalendar = (AgendfyCore as unknown as { Calendar?: ComponentType<any> }).Calendar
const resourceOptions: ResourceOption[] = [
  { id: 'r1', label: 'Conference Room', icon: 'building' },
  { id: 'r2', label: 'John Silva', icon: 'user' },
  { id: 'r3', label: 'Projector', icon: 'monitor' },
  { id: 'r4', label: 'Holidays', icon: 'monitor' },
]

function toIso(dateValue: string, hourValue: string) {
  return `${dateValue}T${hourValue}:00-05:00`
}

function toDateTimeLocalValue(dateValue: Date) {
  const year = dateValue.getFullYear()
  const month = String(dateValue.getMonth() + 1).padStart(2, '0')
  const day = String(dateValue.getDate()).padStart(2, '0')
  const hours = String(dateValue.getHours()).padStart(2, '0')
  const minutes = String(dateValue.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

function plusOneHour(dateValue: Date) {
  const result = new Date(dateValue)
  result.setHours(result.getHours() + 1)
  return result
}

function coerceDate(candidate: unknown) {
  if (candidate instanceof Date && !Number.isNaN(candidate.getTime())) {
    return candidate
  }

  if (typeof candidate === 'string' || typeof candidate === 'number') {
    const parsed = new Date(candidate)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed
    }
  }

  return new Date()
}

function ResourceIcon({ type }: { type: ResourceOption['icon'] }) {
  if (type === 'building') {
    return (
      <svg
        aria-hidden="true"
        className="agenda-resource-icon"
        fill="none"
        height="16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="16"
      >
        <path d="M12 10h.01" />
        <path d="M12 14h.01" />
        <path d="M12 6h.01" />
        <path d="M16 10h.01" />
        <path d="M16 14h.01" />
        <path d="M16 6h.01" />
        <path d="M8 10h.01" />
        <path d="M8 14h.01" />
        <path d="M8 6h.01" />
        <path d="M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
        <rect height="20" rx="2" width="16" x="4" y="2" />
      </svg>
    )
  }

  if (type === 'user') {
    return (
      <svg
        aria-hidden="true"
        className="agenda-resource-icon"
        fill="none"
        height="16"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="16"
      >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )
  }

  return (
    <svg
      aria-hidden="true"
      className="agenda-resource-icon"
      fill="none"
      height="16"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="16"
    >
      <rect height="14" rx="2" width="20" x="2" y="3" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </svg>
  )
}

export function AgendaPage() {
  const [view, setView] = useState<AgendaView>('SEMANAL')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [calendarEvents, setCalendarEvents] = useState<EmbeddedAgendaEvent[]>(
    academicSessionsMock.map((sessionItem, index) => ({
      id: sessionItem.id,
      title: `${sessionItem.courseCode} - ${sessionItem.courseName}`,
      start: toIso(sessionItem.date, sessionItem.startTime),
      end: toIso(sessionItem.date, sessionItem.endTime),
      color: eventColors[index % eventColors.length],
      isAllDay: false,
      isMultiDay: false,
    })),
  )
  const [newEventForm, setNewEventForm] = useState<NewEventFormData>(() => {
    const nowDate = new Date()
    return {
      title: '',
      start: toDateTimeLocalValue(nowDate),
      end: toDateTimeLocalValue(plusOneHour(nowDate)),
      color: '#3490dc',
      isAllDay: false,
      isMultiDay: false,
      resources: [],
    }
  })

  const openCreateEventModal = (baseDate?: Date) => {
    const selectedDate = baseDate ?? new Date()
    setNewEventForm({
      title: '',
      start: toDateTimeLocalValue(selectedDate),
      end: toDateTimeLocalValue(plusOneHour(selectedDate)),
      color: '#3490dc',
      isAllDay: false,
      isMultiDay: false,
      resources: [],
    })
    setIsModalOpen(true)
  }

  const handleFormInput =
    (field: keyof NewEventFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const target = event.target as HTMLInputElement
      const value = target.type === 'checkbox' ? target.checked : target.value

      setNewEventForm((prevForm) => ({
        ...prevForm,
        [field]: value,
      }))
    }

  const handleResourceToggle = (resourceId: string) => {
    setNewEventForm((prevForm) => {
      const hasResource = prevForm.resources.includes(resourceId)
      return {
        ...prevForm,
        resources: hasResource
          ? prevForm.resources.filter((resourceItem) => resourceItem !== resourceId)
          : [...prevForm.resources, resourceId],
      }
    })
  }

  const handleSubmitNewEvent = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const newEvent: EmbeddedAgendaEvent = {
      id: `custom-${Date.now()}`,
      title: newEventForm.title.trim() || 'Nuevo evento',
      start: new Date(newEventForm.start).toISOString(),
      end: new Date(newEventForm.end).toISOString(),
      color: newEventForm.color,
      isAllDay: newEventForm.isAllDay,
      isMultiDay: newEventForm.isMultiDay,
    }

    setCalendarEvents((prevEvents) => [...prevEvents, newEvent])
    setIsModalOpen(false)
  }

  const initialView = useMemo<CalendarView>(() => (view === 'SEMANAL' ? 'week' : 'month'), [view])

  const agendaConfig = useMemo(
    () => ({
      timezone: 'America/Bogota',
      defaultView: initialView,
      slotDuration: 30,
      slotLabelFormat: 'HH:mm',
      slotMin: '06:00',
      slotMax: '22:00',
      lang: 'es',
      today: 'Hoy',
      monthView: 'Mes',
      weekView: 'Semana',
      dayView: 'Dia',
      listView: 'Lista',
      all_day: 'Todo el dia',
      clear_filter: 'Limpiar filtros',
      filter_resources: 'Filtrar recursos',
    }),
    [initialView],
  )

  return (
    <>
      <header className="page-header">
        <h3>Consulta de agenda</h3>
        <p>Agenda embebida para instructores, pseudopilotos y estudiantes.</p>
      </header>

      <section className="card stack agenda-embedded-card">
        <div className="topbar-right">
          <button className="button button-primary" onClick={() => openCreateEventModal()} type="button">
            Crear evento
          </button>
          <button
            className={`button ${view === 'SEMANAL' ? 'button-primary' : 'button-muted'}`}
            onClick={() => setView('SEMANAL')}
            type="button"
          >
            Semanal
          </button>
          <button
            className={`button ${view === 'MENSUAL' ? 'button-primary' : 'button-muted'}`}
            onClick={() => setView('MENSUAL')}
            type="button"
          >
            Mensual
          </button>
        </div>

        <div className="agenda-embedded-wrapper">
          {EmbeddedCalendar ? (
            <EmbeddedCalendar
              key={`calendar-${view}`}
              config={agendaConfig}
              events={calendarEvents}
              onDayClick={(dayDate: unknown) => openCreateEventModal(coerceDate(dayDate))}
              onSlotClick={(slotDate: unknown) => openCreateEventModal(coerceDate(slotDate))}
            />
          ) : (
            <p className="inline-note">
              No fue posible cargar la agenda embebida en este entorno.
            </p>
          )}
        </div>
      </section>

      {isModalOpen ? (
        <div
          className="agenda-modal-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setIsModalOpen(false)
            }
          }}
          role="presentation"
        >
          <div className="modal-content" role="dialog">
            <h2>Create New Event</h2>
            <form onSubmit={handleSubmitNewEvent}>
              <div className="form-group">
                <label htmlFor="title">Event Title</label>
                <input
                  id="title"
                  name="title"
                  onChange={handleFormInput('title')}
                  placeholder="Ex: Team Meeting"
                  type="text"
                  value={newEventForm.title}
                />
              </div>

              <div className="form-group">
                <label htmlFor="start">Start</label>
                <input
                  id="start"
                  name="start"
                  onChange={handleFormInput('start')}
                  type="datetime-local"
                  value={newEventForm.start}
                />
              </div>

              <div className="form-group">
                <label htmlFor="end">End</label>
                <input
                  id="end"
                  name="end"
                  onChange={handleFormInput('end')}
                  type="datetime-local"
                  value={newEventForm.end}
                />
              </div>

              <div className="form-group-inline">
                <div className="form-group">
                  <label htmlFor="color">Event Color</label>
                  <input
                    className="color-input"
                    id="color"
                    name="color"
                    onChange={handleFormInput('color')}
                    type="color"
                    value={newEventForm.color}
                  />
                </div>

                <div className="form-group checkbox-group">
                  <input
                    checked={newEventForm.isAllDay}
                    id="isAllDay"
                    name="isAllDay"
                    onChange={handleFormInput('isAllDay')}
                    type="checkbox"
                  />
                  <label htmlFor="isAllDay">All Day</label>
                </div>

                <div className="form-group checkbox-group">
                  <input
                    checked={newEventForm.isMultiDay}
                    id="isMultiDay"
                    name="isMultiDay"
                    onChange={handleFormInput('isMultiDay')}
                    type="checkbox"
                  />
                  <label htmlFor="isMultiDay">Multi-Day</label>
                </div>
              </div>

              <div className="form-group">
                <label>Resources</label>
                <div className="resource-selection-container">
                  {resourceOptions.map((resourceItem) => (
                    <label key={resourceItem.id} className="resource-option">
                      <input
                        checked={newEventForm.resources.includes(resourceItem.id)}
                        onChange={() => handleResourceToggle(resourceItem.id)}
                        type="checkbox"
                        value={resourceItem.id}
                      />
                      <ResourceIcon type={resourceItem.icon} />
                      <span>{resourceItem.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={() => setIsModalOpen(false)} type="button">
                  Cancel
                </button>
                <button className="btn-submit" type="submit">
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
