import { useQuery } from '@tanstack/react-query';

import { listStudents } from '@/services/studentService';
import { Student, StudentType } from '@/types/models';

export interface StudentFilter {
  type?: StudentType | 'all';
  search?: string;
}

export function useStudents(filter: StudentFilter = {}) {
  const query = useQuery({
    queryKey: ['students'],
    queryFn: listStudents,
  });

  const all = query.data ?? [];

  const data = (() => {
    let list = all;
    if (filter.type && filter.type !== 'all') {
      list = list.filter((s) => s.studentType === filter.type);
    }
    const search = filter.search?.trim().toLowerCase();
    if (search) {
      list = list.filter((s) =>
        [s.name, s.studentId, s.className, s.guardianName, s.phone]
          .map((v) => (v ?? '').toLowerCase())
          .some((v) => v.includes(search))
      );
    }
    return list;
  })();

  return { ...query, data, all };
}

export function isStudent(value: unknown): value is Student {
  return !!value && typeof value === 'object' && '_id' in value;
}
