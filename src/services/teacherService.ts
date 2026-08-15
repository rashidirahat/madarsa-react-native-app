import { apiFetch } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { unwrapData } from '@/api/response';
import { Teacher, TeacherInput } from '@/types/models';

export async function listTeachers(): Promise<Teacher[]> {
  const raw = await apiFetch(ENDPOINTS.teachers.list);
  const data = unwrapData<Teacher[] | { teachers?: Teacher[] }>(raw);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.teachers)) return data.teachers;
  return [];
}

export async function getTeacher(id: string): Promise<Teacher> {
  const raw = await apiFetch(ENDPOINTS.teachers.detail(id));
  return unwrapData<Teacher>(raw);
}

export async function createTeacher(input: TeacherInput): Promise<Teacher> {
  const raw = await apiFetch(ENDPOINTS.teachers.list, {
    method: 'POST',
    body: input,
  });
  return unwrapData<Teacher>(raw);
}

export async function updateTeacher(id: string, input: TeacherInput): Promise<Teacher> {
  const raw = await apiFetch(ENDPOINTS.teachers.detail(id), {
    method: 'PUT',
    body: input,
  });
  return unwrapData<Teacher>(raw);
}

export async function deleteTeacher(id: string): Promise<void> {
  await apiFetch<void>(ENDPOINTS.teachers.detail(id), { method: 'DELETE' });
}
