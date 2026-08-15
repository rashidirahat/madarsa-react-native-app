import { useQuery } from '@tanstack/react-query';

import { listTeachers } from '@/services/teacherService';
import { Teacher } from '@/types/models';

export interface TeacherFilter {
  search?: string;
}

export function useTeachers(filter: TeacherFilter = {}) {
  const query = useQuery({
    queryKey: ['teachers'],
    queryFn: listTeachers,
  });

  const all = query.data ?? [];

  const data = (() => {
    const search = filter.search?.trim().toLowerCase();
    if (!search) return all;
    const subjectMatches = (t: Teacher) =>
      t.subjects?.some((s) =>
        `${s.subject} ${s.className}`.toLowerCase().includes(search)
      );
    return all.filter(
      (t) =>
        [t.name, t.teacherId, t.specialization, t.qualification, t.address]
          .map((v) => (v ?? '').toLowerCase())
          .some((v) => v.includes(search)) || subjectMatches(t)
    );
  })();

  return { ...query, data, all };
}

export function isTeacher(value: unknown): value is Teacher {
  return !!value && typeof value === 'object' && '_id' in value;
}
