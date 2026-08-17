import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { AppHeader } from '@/components/AppHeader';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ExamItem } from '@/components/ExamItem';
import { LoadingState } from '@/components/LoadingState';
import { ProgressItem } from '@/components/ProgressItem';
import { RequireAuth } from '@/components/RequireAuth';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/context/ToastProvider';
import {
  mergeExamRecords,
  mergeStudyProgressRecords,
  useAssignedStudent,
  useStudentExams,
  useStudentStudyProgress,
  useTeacherAssignmentMutations,
} from '@/hooks/useTeacherAssignment';
import { useTheme } from '@/theme/ThemeProvider';

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.detailRow}>
      <View style={[styles.detailIcon, { backgroundColor: colors.surface }]}>
        <Ionicons name={icon} size={16} color={colors.textSecondary} />
      </View>
      <View style={styles.detailBody}>
        <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.detailValue, { color: colors.textPrimary }]}>{value || '—'}</Text>
      </View>
    </View>
  );
}

export default function AssignedStudentDetailScreen() {
  const { id, studentId } = useLocalSearchParams<{ id: string; studentId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const { isAdmin } = useAuth();

  const { data: student, isLoading, isError, error, refetch } = useAssignedStudent(id, studentId);
  const localExams = useStudentExams(id, studentId);
  const localProgress = useStudentStudyProgress(id, studentId);
  const { unassign } = useTeacherAssignmentMutations(id);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const exams = useMemo(
    () => mergeExamRecords(student?.exams, localExams.data),
    [student?.exams, localExams.data]
  );
  const progress = useMemo(
    () => mergeStudyProgressRecords(student?.studyProgress, localProgress.data),
    [student?.studyProgress, localProgress.data]
  );

  const displayId = student?.studentId ?? student?._id ?? student?.id ?? studentId;

  const onRemove = async () => {
    try {
      await unassign.mutateAsync(studentId);
      toast.success('Student assignment removed');
      router.back();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const goExamForm = (examId?: string) =>
    router.push({
      pathname: '/teachers/[id]/students/[studentId]/exams/manage',
      params: { id, studentId, ...(examId ? { examId } : {}) },
    });

  const goProgressForm = (studyProgressId?: string) =>
    router.push({
      pathname: '/teachers/[id]/students/[studentId]/study-progress/manage',
      params: { id, studentId, ...(studyProgressId ? { studyProgressId } : {}) },
    });

  return (
    <RequireAuth>
      <Screen scroll>
        <AppHeader title="Assigned student" showBack />

        {isLoading ? (
          <LoadingState label="Loading student details…" />
        ) : isError || !student ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
        ) : (
          <View style={styles.content}>
            <View style={styles.hero}>
              <View style={[styles.heroNameWrap, { backgroundColor: colors.brandSoft }]}>
                <Text style={[styles.heroName, { color: colors.brand }]}>
                  {(student.name ?? '?').charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.name, { color: colors.textPrimary }]}>
                {student.name ?? 'Unnamed student'}
              </Text>
              {displayId ? (
                <Text style={[styles.studentId, { color: colors.textSecondary }]}>
                  Student ID: {displayId}
                </Text>
              ) : null}
              {student.className ? <Badge label={student.className} tone="brand" /> : null}
            </View>

            <Card elevated>
              <DetailRow icon="school-outline" label="Class" value={student.className ?? ''} />
              <DetailRow icon="person-outline" label="Guardian" value={student.guardianName ?? ''} />
              <DetailRow icon="call-outline" label="Phone" value={student.phone ?? ''} />
              <DetailRow icon="location-outline" label="Address" value={student.address ?? ''} />
            </Card>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Exams</Text>
                {isAdmin ? (
                  <Button
                    title="Add exam"
                    icon="add"
                    variant="secondary"
                    size="sm"
                    onPress={() => goExamForm()}
                  />
                ) : null}
              </View>
              <Card elevated style={styles.sectionCard}>
                {exams.length === 0 ? (
                  <EmptyState
                    icon="document-text-outline"
                    title="No exams yet"
                    message="Add an exam to track this student's performance."
                  />
                ) : (
                  <View style={styles.records}>
                    {exams.map((exam) => (
                      <ExamItem
                        key={exam._id ?? exam.id ?? `${exam.examName}-${exam.examDate}`}
                        exam={exam}
                        onEdit={
                          isAdmin
                            ? () => goExamForm(exam._id ?? exam.examId ?? exam.id ?? '')
                            : undefined
                        }
                      />
                    ))}
                  </View>
                )}
              </Card>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  Study progress
                </Text>
                {isAdmin ? (
                  <Button
                    title="Add progress"
                    icon="add"
                    variant="secondary"
                    size="sm"
                    onPress={() => goProgressForm()}
                  />
                ) : null}
              </View>
              <Card elevated style={styles.sectionCard}>
                {progress.length === 0 ? (
                  <EmptyState
                    icon="analytics-outline"
                    title="No study progress"
                    message="Add study progress to track how this student is learning."
                  />
                ) : (
                  <View style={styles.records}>
                    {progress.map((item) => (
                      <ProgressItem
                        key={item._id ?? item.id ?? `${item.subject}-${item.topic}`}
                        progress={item}
                        onEdit={
                          isAdmin
                            ? () =>
                                goProgressForm(
                                  item._id ?? item.studyProgressId ?? item.id ?? ''
                                )
                            : undefined
                        }
                      />
                    ))}
                  </View>
                )}
              </Card>
            </View>

            {isAdmin ? (
              <Button
                title="Remove assignment"
                icon="person-remove-outline"
                variant="danger"
                onPress={() => setConfirmRemove(true)}
                loading={unassign.isPending}
                fullWidth
              />
            ) : null}
          </View>
        )}
      </Screen>

      <ConfirmDialog
        visible={confirmRemove}
        title="Remove assignment?"
        message={`This will unassign ${student?.name ?? 'this student'} from the teacher. Exams and study progress for this assignment may be lost.`}
        confirmLabel="Remove"
        loading={unassign.isPending}
        onConfirm={onRemove}
        onCancel={() => setConfirmRemove(false)}
      />
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    paddingBottom: 32,
    gap: 24,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 6,
  },
  heroNameWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  heroName: {
    fontSize: 30,
    fontWeight: '800',
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
  },
  studentId: {
    fontSize: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBody: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 1,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionCard: {
    gap: 12,
  },
  records: {
    gap: 10,
  },
});
