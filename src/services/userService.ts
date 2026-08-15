import { apiFetch } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { unwrapData } from '@/api/response';
import {
  ApiError,
  UserListUnavailableError,
  getErrorMessage,
} from '@/api/errors';
import { Role, User } from '@/types/models';

/**
 * Isolated data source for the user selector.
 *
 * No user-list endpoint was documented, so this function is kept isolated and
 * easy to switch on. Flip USER_LIST_ENDPOINT_AVAILABLE to true (and confirm the
 * endpoint shape) once the backend provides it. Until then the UI shows a clear
 * empty state instead of inventing an API.
 */
export const USER_LIST_ENDPOINT_AVAILABLE = false;

export async function fetchUsers(): Promise<User[]> {
  if (!USER_LIST_ENDPOINT_AVAILABLE) {
    throw new UserListUnavailableError();
  }
  const raw = await apiFetch(ENDPOINTS.users.list);
  const data = unwrapData<User[] | { users?: User[] }>(raw);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.users)) return data.users;
  return [];
}

export async function updateUserRole(userId: string, role: Role): Promise<User> {
  try {
    const raw = await apiFetch(ENDPOINTS.users.role(userId), {
      method: 'PATCH',
      body: { role },
    });
    return unwrapData<User>(raw);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error(getErrorMessage(error));
  }
}
