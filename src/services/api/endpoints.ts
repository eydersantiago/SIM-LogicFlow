export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login/',
    refresh: '/auth/refresh/',
  },
  users: {
    list: '/users/',
    detail: (id: string) => `/users/${id}/`,
  },
  academic: {
    courses: '/academic/courses/',
    sessions: '/academic/sessions/',
    restrictions: '/academic/restrictions/validate/',
  },
  technical: {
    maintenances: '/technical/maintenances/',
  },
  reports: {
    summary: '/reports/summary/',
  },
}
