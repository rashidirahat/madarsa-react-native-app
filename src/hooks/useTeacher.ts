import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createTeacher,
  deleteTeacher,
  getTeacher,
  updateTeacher,
} from '@/services/teacherService';
import { TeacherInput } from '@/types/models';

export function useTeacher(id?: string) {
  return useQuery({
    queryKey: ['teachers', id],
    queryFn: () => getTeacher(id as string),
    enabled: !!id,
  });
}

export function useTeacherMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['teachers'] }),
      queryClient.invalidateQueries({ queryKey: ['history'] }),
    ]);

  const create = useMutation({
    mutationFn: (input: TeacherInput) => createTeacher(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: TeacherInput }) =>
      updateTeacher(id, input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTeacher(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
