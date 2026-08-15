import { apiFetch } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { unwrapData } from '@/api/response';
import { Student, StudentInput } from '@/types/models';

export async function listStudents(): Promise<Student[]> {
  const raw = await apiFetch(ENDPOINTS.students.list);
  const data = unwrapData<Student[] | { students?: Student[] }>(raw);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.students)) return data.students;
  return [];
}

export async function getStudent(id: string): Promise<Student> {
  const raw = await apiFetch(ENDPOINTS.students.detail(id));
  return unwrapData<Student>(raw);
}

export async function createStudent(input: StudentInput): Promise<Student> {
  const raw = await apiFetch(ENDPOINTS.students.list, {
    method: 'POST',
    body: input,
  });
  return unwrapData<Student>(raw);
}

export async function updateStudent(id: string, input: StudentInput): Promise<Student> {
  const raw = await apiFetch(ENDPOINTS.students.detail(id), {
    method: 'PUT',
    body: input,
  });
  return unwrapData<Student>(raw);
}

export async function deleteStudent(id: string): Promise<void> {
  await apiFetch<void>(ENDPOINTS.students.detail(id), { method: 'DELETE' });
}
