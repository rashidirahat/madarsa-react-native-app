import { apiFetch } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { unwrapData } from '@/api/response';
import {
  ExamInput,
  ExamRecord,
  StudyProgressInput,
  StudyProgressRecord,
  TeacherAssignedStudent,
} from '@/types/models';

export async function listAssignedStudents(
  teacherId: string
): Promise<TeacherAssignedStudent[]> {
  const raw = await apiFetch(ENDPOINTS.teachers.assignedStudents(teacherId));
  const data = unwrapData<
    TeacherAssignedStudent[] | { students?: TeacherAssignedStudent[] }
  >(raw);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.students)) return data.students;
  return [];
}

export async function getAssignedStudent(
  teacherId: string,
  studentId: string
): Promise<TeacherAssignedStudent> {
  const raw = await apiFetch(ENDPOINTS.teachers.assignedStudent(teacherId, studentId));
  return unwrapData<TeacherAssignedStudent>(raw);
}

export async function assignStudent(
  teacherId: string,
  studentId: string
): Promise<unknown> {
  return apiFetch(ENDPOINTS.teachers.assignedStudents(teacherId), {
    method: 'POST',
    body: { studentId },
  });
}

export async function unassignStudent(
  teacherId: string,
  studentId: string
): Promise<void> {
  await apiFetch<void>(ENDPOINTS.teachers.assignedStudent(teacherId, studentId), {
    method: 'DELETE',
  });
}

export async function createExam(
  teacherId: string,
  studentId: string,
  input: ExamInput
): Promise<ExamRecord> {
  const raw = await apiFetch(ENDPOINTS.teachers.exams(teacherId, studentId), {
    method: 'POST',
    body: input,
  });
  return unwrapData<ExamRecord>(raw);
}

export async function updateExam(
  teacherId: string,
  studentId: string,
  examId: string,
  input: ExamInput
): Promise<ExamRecord> {
  const raw = await apiFetch(
    ENDPOINTS.teachers.exam(teacherId, studentId, examId),
    { method: 'PUT', body: input }
  );
  return unwrapData<ExamRecord>(raw);
}

export async function createStudyProgress(
  teacherId: string,
  studentId: string,
  input: StudyProgressInput
): Promise<StudyProgressRecord> {
  const raw = await apiFetch(ENDPOINTS.teachers.studyProgress(teacherId, studentId), {
    method: 'POST',
    body: input,
  });
  return unwrapData<StudyProgressRecord>(raw);
}

export async function updateStudyProgress(
  teacherId: string,
  studentId: string,
  studyProgressId: string,
  input: StudyProgressInput
): Promise<StudyProgressRecord> {
  const raw = await apiFetch(
    ENDPOINTS.teachers.studyProgressItem(teacherId, studentId, studyProgressId),
    { method: 'PUT', body: input }
  );
  return unwrapData<StudyProgressRecord>(raw);
}
