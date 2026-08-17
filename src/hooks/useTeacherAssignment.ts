import {
  useMutation,
  useQuery,
  useQueryClient,
  QueryClient,
} from '@tanstack/react-query';

import {
  assignStudent,
  createExam,
  createStudyProgress,
  getAssignedStudent,
  listAssignedStudents,
  unassignStudent,
  updateExam,
  updateStudyProgress,
} from '@/services/teacherAssignmentService';
import {
  ExamInput,
  ExamRecord,
  StudyProgressInput,
  StudyProgressRecord,
  TeacherAssignedStudent,
} from '@/types/models';

export const assignedStudentsKey = (teacherId: string) =>
  ['teachers', teacherId, 'students'] as const;

export const assignedStudentKey = (teacherId: string, studentId: string) =>
  ['teachers', teacherId, 'students', studentId] as const;

export const studentExamsKey = (teacherId: string, studentId: string) =>
  [...assignedStudentKey(teacherId, studentId), 'exams'] as const;

export const studentStudyProgressKey = (teacherId: string, studentId: string) =>
  [...assignedStudentKey(teacherId, studentId), 'study-progress'] as const;

function recordId(record: { _id?: string; id?: string; [key: string]: unknown }, keyId?: string): string {
  return (record._id as string) ?? (record.id as string) ?? keyId ?? '';
}

export function mergeExamRecords(
  api?: ExamRecord[],
  local?: ExamRecord[]
): ExamRecord[] {
  const map = new Map<string, ExamRecord>();
  for (const record of [...(local ?? []), ...(api ?? [])]) {
    map.set(recordId(record), record);
  }
  return [...map.values()];
}

export function mergeStudyProgressRecords(
  api?: StudyProgressRecord[],
  local?: StudyProgressRecord[]
): StudyProgressRecord[] {
  const map = new Map<string, StudyProgressRecord>();
  for (const record of [...(local ?? []), ...(api ?? [])]) {
    map.set(recordId(record), record);
  }
  return [...map.values()];
}

export function useAssignedStudents(teacherId?: string) {
  return useQuery<TeacherAssignedStudent[]>({
    queryKey: teacherId ? assignedStudentsKey(teacherId) : ['teachers', null, 'students'],
    queryFn: () => listAssignedStudents(teacherId as string),
    enabled: !!teacherId,
  });
}

export function useAssignedStudent(teacherId?: string, studentId?: string) {
  return useQuery<TeacherAssignedStudent>({
    queryKey: teacherId && studentId ? assignedStudentKey(teacherId, studentId) : ['teachers', null, 'students', null],
    queryFn: () => getAssignedStudent(teacherId as string, studentId as string),
    enabled: !!teacherId && !!studentId,
  });
}

export function useStudentExams(teacherId?: string, studentId?: string) {
  return useQuery<ExamRecord[]>({
    queryKey: teacherId && studentId ? studentExamsKey(teacherId, studentId) : ['teachers', null, 'students', null, 'exams'],
    queryFn: () => [],
    enabled: !!teacherId && !!studentId,
  });
}

export function useStudentStudyProgress(teacherId?: string, studentId?: string) {
  return useQuery<StudyProgressRecord[]>({
    queryKey:
      teacherId && studentId ? studentStudyProgressKey(teacherId, studentId) : ['teachers', null, 'students', null, 'study-progress'],
    queryFn: () => [],
    enabled: !!teacherId && !!studentId,
  });
}

function upsertLocalRecord<T extends ExamRecord | StudyProgressRecord>(
  queryClient: QueryClient,
  key: readonly unknown[],
  record: T
): void {
  queryClient.setQueryData<T[]>(key, (old) => {
    const current = old ?? [];
    const id = recordId(record);
    if (!id) return [record, ...current];
    const index = current.findIndex((item) => recordId(item) === id);
    if (index === -1) return [record, ...current];
    const next = [...current];
    next[index] = record;
    return next;
  });
}

export function useTeacherAssignmentMutations(teacherId: string) {
  const queryClient = useQueryClient();

  const invalidateAssigned = () =>
    queryClient.invalidateQueries({ queryKey: assignedStudentsKey(teacherId) });

  const assign = useMutation({
    mutationFn: (studentId: string) => assignStudent(teacherId, studentId),
    onSuccess: invalidateAssigned,
  });

  const unassign = useMutation({
    mutationFn: (studentId: string) => unassignStudent(teacherId, studentId),
    onSuccess: (_result, studentId) => {
      invalidateAssigned();
      queryClient.removeQueries({ queryKey: assignedStudentKey(teacherId, studentId) });
    },
  });

  return { assign, unassign };
}

export function useExamMutations(teacherId: string, studentId: string) {
  const queryClient = useQueryClient();
  const key = studentExamsKey(teacherId, studentId);

  const onSuccess = (record: ExamRecord) => {
    upsertLocalRecord(queryClient, key, record);
  };

  const create = useMutation({
    mutationFn: (input: ExamInput) => createExam(teacherId, studentId, input),
    onSuccess,
  });

  const update = useMutation({
    mutationFn: ({ examId, input }: { examId: string; input: ExamInput }) =>
      updateExam(teacherId, studentId, examId, input),
    onSuccess,
  });

  return { create, update };
}

export function useStudyProgressMutations(teacherId: string, studentId: string) {
  const queryClient = useQueryClient();
  const key = studentStudyProgressKey(teacherId, studentId);

  const onSuccess = (record: StudyProgressRecord) => {
    upsertLocalRecord(queryClient, key, record);
  };

  const create = useMutation({
    mutationFn: (input: StudyProgressInput) => createStudyProgress(teacherId, studentId, input),
    onSuccess,
  });

  const update = useMutation({
    mutationFn: ({ studyProgressId, input }: { studyProgressId: string; input: StudyProgressInput }) =>
      updateStudyProgress(teacherId, studentId, studyProgressId, input),
    onSuccess,
  });

  return { create, update };
}
