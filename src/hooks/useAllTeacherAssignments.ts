import { useQueries } from '@tanstack/react-query';

import { assignedStudentsKey } from '@/hooks/useTeacherAssignment';
import { useTeachers } from '@/hooks/useTeachers';
import { listAssignedStudents } from '@/services/teacherAssignmentService';
import { TeacherAssignedStudent } from '@/types/models';

export interface AllTeacherAssignments {
  byTeacherId: Record<string, TeacherAssignedStudent[]>;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isRefetching: boolean;
  refetch: () => Promise<void>;
}

export function useAllTeacherAssignments(): AllTeacherAssignments {
  const { all: teachers } = useTeachers();

  const results = useQueries({
    queries: teachers.map((t) => ({
      queryKey: assignedStudentsKey(t._id),
      queryFn: () => listAssignedStudents(t._id),
    })),
    combine: (res) => ({
      lists: res.map((r) => r.data ?? []),
      isLoading: res.some((r) => r.isLoading),
      isError: res.some((r) => r.isError),
      error: res.find((r) => r.isError)?.error,
      isRefetching: res.some((r) => r.isFetching),
      refetch: () => Promise.all(res.map((r) => r.refetch())).then(() => undefined),
    }),
  });

  const byTeacherId: Record<string, TeacherAssignedStudent[]> = {};
  teachers.forEach((t, i) => {
    byTeacherId[t._id] = results.lists[i] ?? [];
  });

  return {
    byTeacherId,
    isLoading: results.isLoading,
    isError: results.isError,
    error: results.error,
    isRefetching: results.isRefetching,
    refetch: results.refetch,
  };
}
