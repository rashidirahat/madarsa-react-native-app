import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { useAuth } from '@/context/AuthProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { TeacherAssignedStudent } from '@/types/models';
import { displayStudentType } from '@/utils/format';

interface TeacherAssignmentsFooterProps {
  teacherId: string;
  students: TeacherAssignedStudent[];
}

export function TeacherAssignmentsFooter({ teacherId, students }: TeacherAssignmentsFooterProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { isAdmin } = useAuth();

  return (
    <>
      <View style={styles.row}>
        <Pressable
          onPress={() =>
            router.push({ pathname: '/teachers/[id]/students', params: { id: teacherId } })
          }
          accessibilityRole="button"
          accessibilityLabel={`${students.length} student${students.length === 1 ? '' : 's'} assigned, view assigned students`}
          style={({ pressed }) => [
            styles.chip,
            { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
            pressed && { opacity: 0.7 },
          ]}
        >
          <Ionicons name="people-outline" size={15} color={colors.brand} />
          <Text style={[styles.count, { color: colors.textPrimary }]}>{students.length}</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>assigned</Text>
        </Pressable>
        {isAdmin ? (
          <Button
            title="Assign Student"
            icon="person-add-outline"
            variant="secondary"
            size="sm"
            onPress={() =>
              router.push({
                pathname: '/teachers/[id]/students/assign',
                params: { id: teacherId },
              })
            }
            style={styles.assignButton}
          />
        ) : null}
      </View>

      <View style={styles.studentsArea}>
        {students.length === 0 ? (
          <Text style={[styles.empty, { color: colors.textSecondary }]}>
            No students assigned yet.
          </Text>
        ) : (
          <View style={styles.list}>
            {students.map((student) => {
              const studentId = student._id ?? student.id ?? student.studentId ?? '';
              const exams = student.exams ?? [];
              const progress = student.studyProgress ?? [];
              const parts: string[] = [];
              if (exams.length) parts.push(`${exams.length} exam${exams.length === 1 ? '' : 's'}`);
              if (progress.length)
                parts.push(`${progress.length} progress item${progress.length === 1 ? '' : 's'}`);

              return (
                <Pressable
                  key={studentId || `${student.name}-${student.className}`}
                  onPress={() =>
                    router.push({
                      pathname: '/teachers/[id]/students/[studentId]',
                      params: { id: teacherId, studentId },
                    })
                  }
                  style={({ pressed }) => [
                    styles.studentRow,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    pressed && { opacity: 0.7 },
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${student.name ?? 'Unnamed student'}, view details`}
                >
                  <Avatar name={student.name} size={36} />
                  <View style={styles.studentBody}>
                    <Text style={[styles.studentName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {student.name ?? 'Unnamed student'}
                    </Text>
                    {studentId ? (
                      <Text style={[styles.studentId, { color: colors.textSecondary }]}>
                        StudentID: {studentId}
                      </Text>
                    ) : null}
                    <View style={styles.badges}>
                      {student.className ? <Badge label={student.className} tone="brand" /> : null}
                      {student.studentType ? (
                        <Badge
                          label={displayStudentType(String(student.studentType))}
                          tone={student.studentType === 'hostel' ? 'accent' : 'neutral'}
                        />
                      ) : null}
                    </View>
                    {parts.length > 0 ? (
                      <Text style={[styles.summary, { color: colors.textSecondary }]}>
                        {parts.join(' · ')}
                      </Text>
                    ) : null}
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  count: {
    fontSize: 15,
    fontWeight: '700',
  },
  hint: {
    fontSize: 13,
  },
  assignButton: {
    flex: 1,
  },
  studentsArea: {
    gap: 10,
    marginTop: 10,
  },
  empty: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  list: {
    gap: 8,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  studentBody: {
    flex: 1,
    gap: 2,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '700',
  },
  studentId: {
    fontSize: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  summary: {
    fontSize: 12,
    marginTop: 2,
  },
});
