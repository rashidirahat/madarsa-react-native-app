export type Role = 'user' | 'admin' | 'teacher';

export type StudentType = 'day' | 'hostel';

export const STUDENT_TYPES: { label: string; value: StudentType }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Hostel', value: 'hostel' },
];

export const GENDERS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
] as const;

export type Gender = (typeof GENDERS)[number]['value'];

export const CLASS_OPTIONS = [
  'Qaida',
  'Amma-para',
  'Hifz-e-Quran',
  'Tajweed',
  'Deenyat',
] as const;

export type ClassName = (typeof CLASS_OPTIONS)[number];

export interface Student {
  _id: string;
  studentId: string;
  name: string;
  age: number;
  address: string;
  gender?: string;
  guardianName: string;
  className: string;
  studentType: StudentType;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
  exams?: ExamRecord[];
  studyProgress?: StudyProgressRecord[];
  overallExamAverage?: number;
  studyProgressSummary?: {
    total: number;
    notStarted: number;
    inProgress: number;
    completed: number;
    averageProgressPercentage: number;
  };
}

export interface StudentInput {
  name: string;
  age: number;
  gender: Gender;
  className: string;
  studentType: StudentType;
  guardianName: string;
  address: string;
  phone: string;
}

export interface AuthUser {
  id?: string;
  name?: string;
  email?: string;
  role?: Role;
  [key: string]: unknown;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface ExpenseBalance {
  currentAmount: number;
}

export interface FundTransactionInput {
  amount: number;
  description: string;
}

export type HistoryAction =
  | 'ADD_FUND'
  | 'SPEND_FUND'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | string;

export interface FieldChange {
  before?: unknown;
  after?: unknown;
}

export interface HistoryRecord {
  _id?: string;
  id?: string;
  action: HistoryAction;
  userName?: string;
  email?: string;
  role?: string;
  entityType?: string;
  entityName?: string;
  targetName?: string;
  target?: string;
  description?: string;
  amount?: number;
  createdAt?: string;
  date?: string;
  timestamp?: string;
  changes?: Record<string, FieldChange>;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface HistoryPage {
  records: HistoryRecord[];
  page?: number;
  pages?: number;
  limit?: number;
  total?: number;
  hasMore: boolean;
}

export interface User {
  _id: string;
  id?: string;
  name?: string;
  email?: string;
  role?: Role;
}

export interface Profile {
  name: string;
  photoUri?: string | null;
}

export type DonationCategory = 'zakat' | 'sadaqah';

export interface DonationRecord {
  _id?: string;
  id?: string;
  user?: string;
  category?: string;
  amount?: number;
  year?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface DonationTotals {
  year?: number;
  zakat: number;
  sadaqah: number;
  total: number;
  records: DonationRecord[];
}

export interface DonationInput {
  amount: number;
  category: DonationCategory;
  year: string;
  description: string;
}

export const TEACHER_SUBJECTS = [
  'Urdu',
  'Arabic',
  'English',
  'Hindi',
  'Math',
  'Science',
] as const;

export type TeacherSubject = (typeof TEACHER_SUBJECTS)[number];

export const TEACHER_SUBJECT_OPTIONS: { label: TeacherSubject; value: string }[] =
  TEACHER_SUBJECTS.map((s) => ({ label: s, value: s }));

export const TEACHER_GENDERS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
] as const;

export type TeacherGender = (typeof TEACHER_GENDERS)[number]['value'];

export interface TeacherSubjectAssignment {
  subject: string;
  className: string;
}

export interface Teacher {
  _id: string;
  teacherId: string;
  name: string;
  address: string;
  qualification: string;
  specialization: string;
  joiningDate?: string;
  teachingExperience: number;
  gender: string;
  status: string;
  subjects: TeacherSubjectAssignment[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TeacherInput {
  name: string;
  address: string;
  qualification: string;
  specialization: string;
  teachingExperience: number;
  gender: string;
  status: string;
  joiningDate?: string;
  subjects: TeacherSubjectAssignment[];
}

export interface ExamRecord {
  _id?: string;
  examId?: string;
  id?: string;
  examName: string;
  subject: string;
  examDate: string;
  totalMarks: number;
  obtainedMarks: number;
  grade?: string;
  remarks?: string;
  [key: string]: unknown;
}

export interface ExamInput {
  examName: string;
  subject: string;
  examDate: string;
  totalMarks: number;
  obtainedMarks: number;
  grade?: string;
  remarks?: string;
}

export const STUDY_PROGRESS_STATUSES = ['not_started', 'in_progress', 'completed'] as const;

export type StudyProgressStatus = (typeof STUDY_PROGRESS_STATUSES)[number];

export const STUDY_PROGRESS_STATUS_OPTIONS: { label: string; value: StudyProgressStatus }[] = [
  { label: 'Not started', value: 'not_started' },
  { label: 'In progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
];

export interface StudyProgressRecord {
  _id?: string;
  studyProgressId?: string;
  id?: string;
  subject: string;
  topic: string;
  status: StudyProgressStatus;
  progressPercentage: number;
  notes?: string;
  [key: string]: unknown;
}

export interface StudyProgressInput {
  subject: string;
  topic: string;
  status: StudyProgressStatus;
  progressPercentage: number;
  notes?: string;
}

export interface TeacherAssignedStudent {
  _id?: string;
  id?: string;
  studentId?: string;
  name?: string;
  className?: string;
  guardianName?: string;
  phone?: string;
  address?: string;
  exams?: ExamRecord[];
  studyProgress?: StudyProgressRecord[];
  [key: string]: unknown;
}
