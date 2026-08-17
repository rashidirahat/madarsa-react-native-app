import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { AppHeader } from '@/components/AppHeader';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { RequireAuth } from '@/components/RequireAuth';
import { Screen } from '@/components/Screen';
import { useAssignedStudents } from '@/hooks/useTeacherAssignment';
import { useTheme } from '@/theme/ThemeProvider';
import { TeacherAssignedStudent } from '@/types/models';
import { displayGender, displayStudentType } from '@/utils/format';

function AssignedStudentRow({
  student,
  onPress,
}: {
  student: TeacherAssignedStudent;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const studentId = student.studentId ?? student._id ?? student.id ?? '';
  const badges: { label: string; tone: 'brand' | 'accent' | 'neutral' }[] = [];
  if (student.className) badges.push({ label: student.className, tone: 'brand' });
  if (student.studentType) {
    badges.push({
      label: displayStudentType(String(student.studentType)),
      tone: student.studentType === 'hostel' ? 'accent' : 'neutral',
    });
  }
  if (student.gender) badges.push({ label: displayGender(String(student.gender)), tone: 'neutral' });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${student.name ?? 'Unnamed student'}, view details`}
    >
      <Avatar name={student.name} size={44} />
      <View style={styles.rowBody}>
        <Text style={[styles.rowName, { color: colors.textPrimary }]} numberOfLines={1}>
          {student.name ?? 'Unnamed student'}
        </Text>
        {studentId ? (
          <Text style={[styles.rowId, { color: colors.textSecondary }]}>
            StudentID: {studentId}
          </Text>
        ) : null}
        {badges.length > 0 ? (
          <View style={styles.badges}>
            {badges.map((b) => (
              <Badge key={b.label} label={b.label} tone={b.tone} />
            ))}
          </View>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

export default function AssignedStudentsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const { data: queryData, isLoading, isError, error, refetch, isRefetching } = useAssignedStudents(id);
  const data = queryData ?? [];

  const goToAssign = () => router.push({ pathname: '/teachers/[id]/students/assign', params: { id } });

  return (
    <RequireAuth>
      <Screen
        scroll
        padded={false}
        refreshing={isRefetching}
        onRefresh={() => refetch()}
      >
        <AppHeader
          title="Assigned students"
          showBack
          right={
            <Button
              title="Assign"
              icon="person-add-outline"
              variant="secondary"
              size="sm"
              onPress={goToAssign}
              accessibilityLabel="Assign a student to this teacher"
            />
          }
        />
        <View style={styles.content}>
          {isLoading ? (
            <LoadingState label="Loading assigned students…" />
          ) : isError ? (
            <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
          ) : data.length === 0 ? (
            <EmptyState
              icon="people-outline"
              title="No students assigned"
              message="Assign students to this teacher to track their exams and study progress."
              actionLabel="Assign a student"
              onAction={goToAssign}
            />
          ) : (
            <View style={styles.list}>
              <Text style={[styles.count, { color: colors.textSecondary }]}>
                {data.length} student{data.length === 1 ? '' : 's'} assigned
              </Text>
              {data.map((student) => {
                const studentId = student._id ?? student.id ?? student.studentId ?? '';
                return (
                  <AssignedStudentRow
                    key={studentId || `${student.name}-${student.className}`}
                    student={student}
                    onPress={() =>
                      router.push({
                        pathname: '/teachers/[id]/students/[studentId]',
                        params: { id, studentId },
                      })
                    }
                  />
                );
              })}
            </View>
          )}
        </View>
      </Screen>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 14,
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 12,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 16,
    fontWeight: '700',
  },
  rowId: {
    fontSize: 13,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
});
