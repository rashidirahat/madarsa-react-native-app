import { useQueries } from '@tanstack/react-query';

import { getStudent } from '@/services/studentService';
import { useStudents } from '@/hooks/useStudents';
import { Student } from '@/types/models';

export interface AllStudentPerformance {
  studentsById: Record<string, Student>;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isRefetching: boolean;
  refetch: () => Promise<void>;
}

export function useAllStudentPerformance(): AllStudentPerformance {
  const { all } = useStudents();
  const needingDetail = all.filter((s) => !s.exams && !s.studyProgress);
  const results = useQueries({
    queries: needingDetail.map((s) => ({
      queryKey: ['students', s._id],
      queryFn: () => getStudent(s._id),
    })),
    combine: (res) => ({
      details: res
        .map((r) => r.data)
        .filter((d): d is Student => !!d && typeof d === 'object' && '_id' in d),
      isLoading: res.some((r) => r.isLoading),
      isError: res.some((r) => r.isError),
      error: res.find((r) => r.isError)?.error,
      isRefetching: res.some((r) => r.isFetching),
      refetch: () => Promise.all(res.map((r) => r.refetch())).then(() => undefined),
    }),
  });

  const studentsById: Record<string, Student> = {};
  for (const s of all) studentsById[s._id] = s;
  for (const d of results.details) studentsById[d._id] = d;

  return {
    studentsById,
    isLoading: results.isLoading,
    isError: results.isError,
    error: results.error,
    isRefetching: results.isRefetching,
    refetch: results.refetch,
  };
}
