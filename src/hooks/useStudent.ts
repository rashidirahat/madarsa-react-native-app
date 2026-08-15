import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createStudent,
  deleteStudent,
  getStudent,
  updateStudent,
} from '@/services/studentService';
import { StudentInput } from '@/types/models';

export function useStudent(id?: string) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => getStudent(id as string),
    enabled: !!id,
  });
}

export function useStudentMutations() {
  const queryClient = useQueryClient();

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['students'] }),
      queryClient.invalidateQueries({ queryKey: ['history'] }),
    ]);

  const create = useMutation({
    mutationFn: (input: StudentInput) => createStudent(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, input }: { id: string; input: StudentInput }) =>
      updateStudent(id, input),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteStudent(id),
    onSuccess: invalidate,
  });

  return { create, update, remove };
}
