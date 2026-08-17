/**
 * Centralized endpoint paths. Change them here if the backend moves.
 */
export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    forgotPassword: '/auth/forgot-password',
    refreshToken: '/auth/refresh-token',
    logout: '/auth/logout',
  },
  students: {
    list: '/students',
    detail: (id: string) => `/students/${id}`,
  },
  teachers: {
    list: '/teachers',
    detail: (id: string) => `/teachers/${id}`,
    assignedStudents: (teacherId: string) => `/teachers/${teacherId}/students`,
    assignedStudent: (teacherId: string, studentId: string) =>
      `/teachers/${teacherId}/students/${studentId}`,
    exams: (teacherId: string, studentId: string) =>
      `/teachers/${teacherId}/students/${studentId}/exams`,
    exam: (teacherId: string, studentId: string, examId: string) =>
      `/teachers/${teacherId}/students/${studentId}/exams/${examId}`,
    studyProgress: (teacherId: string, studentId: string) =>
      `/teachers/${teacherId}/students/${studentId}/study-progress`,
    studyProgressItem: (teacherId: string, studentId: string, studyProgressId: string) =>
      `/teachers/${teacherId}/students/${studentId}/study-progress/${studyProgressId}`,
  },
  expenses: {
    get: '/expenses',
    add: '/expenses/add',
    spend: '/expenses/spend',
  },
  history: {
    list: '/history',
  },
  users: {
    list: '/users',
    role: (id: string) => `/users/${id}/role`,
  },
  donations: {
    create: '/donations',
    totals: '/donations/totals',
  },
} as const;

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://madarsa-app.rahats.in/api/v1';
