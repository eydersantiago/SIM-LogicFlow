import type { AppUser, UserRole } from '@/domain/types'

import { apiRequest } from '@/services/api/client'
import { API_ENDPOINTS } from '@/services/api/endpoints'

interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

function unwrapListResponse<T>(payload: PaginatedResponse<T> | T[]) {
  if (Array.isArray(payload)) {
    return payload
  }
  return payload.results
}

interface BackendUser {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  phone?: string | null
  created_at?: string
  is_active: boolean
}

interface LoginResponse {
  access: string
  refresh: string
  user: BackendUser
}

export interface CourseSession {
  id: number
  course: number
  course_detail: {
    id: number
    name: string
    course_type: 'RADAR' | 'AERODROME'
  }
  coordinator: number
  main_room: number
  main_room_detail: {
    id: number
    name: string
    room_type: string
    simulator_name: string
  }
  pseudopilot_room: number
  pseudopilot_room_detail: {
    id: number
    name: string
    room_type: string
    simulator_name: string
  }
  students: number[]
  instructors: number[]
  pseudopilots: number[]
  start_date: string
  end_date: string
  schedule_time: string
  daily_simulation_hours: number
  is_active: boolean
}

export interface CourseItem {
  id: number
  name: string
  description: string
  course_type: 'RADAR' | 'AERODROME'
  min_simulation_hours: number
  is_active: boolean
  created_at?: string
  updated_at?: string
  max_students?: number
  max_instructors?: number
  max_pseudopilots?: number
}

export interface SupportRecord {
  id: number
  support_person: number
  support_person_username: string
  room: number
  room_detail: {
    id: number
    name: string
    room_type: string
    simulator_name: string
  }
  maintenance_type: number
  maintenance_type_name: string
  scheduled_date: string
  completed_date: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  notes: string
}

export interface ProfileUpdatePayload {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
}

export interface UserCreatePayload {
  username: string
  email: string
  first_name: string
  last_name: string
  role: UserRole
  phone?: string
  is_active?: boolean
  password: string
  password_confirm: string
}

export interface UserUpdatePayload {
  username?: string
  email?: string
  first_name?: string
  last_name?: string
  role?: UserRole
  phone?: string
  is_active?: boolean
  password?: string
  password_confirm?: string
}

export interface CreateCoursePayload {
  name: string
  description: string
  course_type: 'RADAR' | 'AERODROME'
  min_simulation_hours: number
}

export interface UpdateCoursePayload {
  name?: string
  description?: string
  course_type?: 'RADAR' | 'AERODROME'
  min_simulation_hours?: number
  is_active?: boolean
}

function toAppUser(user: BackendUser): AppUser {
  return {
    id: user.id,
    username: user.username,
    firstName: user.first_name,
    lastName: user.last_name,
    fullName: `${user.first_name} ${user.last_name}`.trim() || user.username,
    email: user.email,
    role: user.role,
    phone: user.phone ?? '',
    createdAt: user.created_at,
    isActive: user.is_active,
  }
}

export async function login(username: string, password: string) {
  const payload = await apiRequest<LoginResponse>(API_ENDPOINTS.auth.login, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    disableAuth: true,
    disableAutoRefresh: true,
  })

  return {
    access: payload.access,
    refresh: payload.refresh,
    user: toAppUser(payload.user),
  }
}

export async function fetchMe() {
  const user = await apiRequest<BackendUser>(API_ENDPOINTS.auth.me)
  return toAppUser(user)
}

export async function updateMe(payload: ProfileUpdatePayload) {
  const user = await apiRequest<BackendUser>(API_ENDPOINTS.auth.me, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return toAppUser(user)
}

export async function fetchUsers() {
  const payload = await apiRequest<PaginatedResponse<BackendUser> | BackendUser[]>(
    API_ENDPOINTS.auth.users,
  )
  return unwrapListResponse(payload).map(toAppUser)
}

export async function createUser(payload: UserCreatePayload) {
  const created = await apiRequest<BackendUser>(API_ENDPOINTS.auth.users, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return toAppUser(created)
}

export async function updateUser(id: number, payload: UserUpdatePayload) {
  const updated = await apiRequest<BackendUser>(API_ENDPOINTS.auth.userDetail(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
  return toAppUser(updated)
}

export async function deleteUser(id: number) {
  return apiRequest<void>(API_ENDPOINTS.auth.userDetail(id), {
    method: 'DELETE',
  })
}

export async function fetchCourses() {
  const payload = await apiRequest<PaginatedResponse<CourseItem> | CourseItem[]>(
    API_ENDPOINTS.courses.courses,
  )
  return unwrapListResponse(payload)
}

export async function createCourse(payload: CreateCoursePayload) {
  return apiRequest<CourseItem>(API_ENDPOINTS.courses.courses, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function updateCourse(id: number, payload: UpdateCoursePayload) {
  return apiRequest<CourseItem>(API_ENDPOINTS.courses.courseDetail(id), {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteCourse(id: number) {
  return apiRequest<void>(API_ENDPOINTS.courses.courseDetail(id), {
    method: 'DELETE',
  })
}

export async function fetchSessions() {
  const payload = await apiRequest<PaginatedResponse<CourseSession> | CourseSession[]>(
    API_ENDPOINTS.courses.sessions,
  )
  return unwrapListResponse(payload)
}

export async function fetchMySchedule() {
  const payload = await apiRequest<PaginatedResponse<CourseSession> | CourseSession[]>(
    API_ENDPOINTS.courses.mySchedule,
  )
  return unwrapListResponse(payload)
}

export async function fetchSupportRecords(path = API_ENDPOINTS.support.records) {
  const payload = await apiRequest<PaginatedResponse<SupportRecord> | SupportRecord[]>(path)
  return unwrapListResponse(payload)
}
