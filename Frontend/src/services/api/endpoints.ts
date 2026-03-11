export const API_ENDPOINTS = {
  auth: {
    register: '/auth/register/',
    login: '/auth/login/',
    refresh: '/auth/refresh/',
    me: '/auth/me/',
    users: '/auth/users/',
    userDetail: (id: number | string) => `/auth/users/${id}/`,
  },
  courses: {
    simulators: '/courses/simulators/',
    rooms: '/courses/rooms/',
    courses: '/courses/',
    courseDetail: (id: number | string) => `/courses/${id}/`,
    sessions: '/courses/sessions/',
    mySchedule: '/courses/my-schedule/',
  },
  support: {
    maintenanceTypes: '/support/maintenance-types/',
    records: '/support/records/',
    myRecords: '/support/my-records/',
  },
}
