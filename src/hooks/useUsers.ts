import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { UserListUnavailableError } from '@/api/errors';
import { fetchUsers, updateUserRole } from '@/services/userService';
import { Role } from '@/types/models';

export function useUsers() {
  const query = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    retry: false,
  });

  return {
    ...query,
    data: query.data ?? [],
    unavailable: query.error instanceof UserListUnavailableError,
  };
}

export function useRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: Role }) =>
      updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
