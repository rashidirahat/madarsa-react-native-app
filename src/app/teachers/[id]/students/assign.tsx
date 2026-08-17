import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { RequireAuth } from '@/components/RequireAuth';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { useToast } from '@/context/ToastProvider';
import { useStudents } from '@/hooks/useStudents';
import { useAssignedStudents, useTeacherAssignmentMutations } from '@/hooks/useTeacherAssignment';
import { useTheme } from '@/theme/ThemeProvider';

export default function AssignStudentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const studentsQuery = useStudents({ search });
  const assignedQuery = useAssignedStudents(id);
  const { assign } = useTeacherAssignmentMutations(id);

  const assignedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const item of assignedQuery.data ?? []) {
      for (const key of [item._id, item.id, item.studentId]) {
        if (key) ids.add(String(key));
      }
    }
    return ids;
  }, [assignedQuery.data]);

  const selectedStudent = studentsQuery.data.find((s) => s._id === selectedId) ?? null;

  const onAssign = async () => {
    if (!selectedStudent) return;
    try {
      await assign.mutateAsync(selectedStudent._id);
      toast.success(`Assigned ${selectedStudent.name} to this teacher`);
      router.back();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <RequireAuth>
      <Screen padded={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Close">
                <Ionicons name="close" size={26} color={colors.textPrimary} />
              </Pressable>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                Assign a student
              </Text>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <SearchBar
              placeholder="Search students"
              value={search}
              onChangeText={setSearch}
            />

            {studentsQuery.isLoading ? (
              <LoadingState label="Loading students…" />
            ) : studentsQuery.isError ? (
              <ErrorState
                message={getErrorMessage(studentsQuery.error)}
                onRetry={() => studentsQuery.refetch()}
              />
            ) : studentsQuery.data.length === 0 ? (
              <EmptyState
                icon={search ? 'search-outline' : 'people-outline'}
                title={search ? 'No matching students' : 'No students to assign'}
                message={
                  search
                    ? 'Try a different search term.'
                    : 'Add students before assigning them to a teacher.'
                }
              />
            ) : (
              <View style={styles.list}>
                <Text style={[styles.count, { color: colors.textSecondary }]}>
                  {studentsQuery.data.length} student{studentsQuery.data.length === 1 ? '' : 's'}
                </Text>
                {studentsQuery.data.map((student) => {
                  const already = assignedIds.has(student._id) || (!!student.studentId && assignedIds.has(student.studentId));
                  const active = selectedId === student._id;
                  return (
                    <Pressable
                      key={student._id}
                      disabled={already}
                      onPress={() => setSelectedId(student._id)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active, disabled: already }}
                      accessibilityLabel={`${student.name}, ${already ? 'already assigned' : active ? 'selected' : 'select'}`}
                      style={({ pressed }) => [
                        styles.row,
                        {
                          backgroundColor: active ? colors.brandSoft : colors.surface,
                          borderColor: active ? colors.brand : colors.border,
                          opacity: already ? 0.55 : pressed ? 0.8 : 1,
                        },
                      ]}
                    >
                      <View style={styles.rowBody}>
                        <Text style={[styles.rowName, { color: colors.textPrimary }]} numberOfLines={1}>
                          {student.name}
                        </Text>
                        <Text style={[styles.rowMeta, { color: colors.textSecondary }]} numberOfLines={1}>
                          {student.studentId}
                          {student.className ? ` · ${student.className}` : ''}
                        </Text>
                      </View>
                      {already ? (
                        <Text style={[styles.assignedTag, { color: colors.brand }]}>Assigned</Text>
                      ) : (
                        <Ionicons
                          name={active ? 'checkmark-circle' : 'ellipse-outline'}
                          size={22}
                          color={active ? colors.brand : colors.textSecondary}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ScrollView>

          <View style={[styles.footer, { backgroundColor: colors.surfaceElevated, borderTopColor: colors.border }]}>
            <Button
              title="Assign student"
              icon="person-add-outline"
              onPress={onAssign}
              loading={assign.isPending}
              disabled={!selectedStudent}
              fullWidth
            />
          </View>
        </KeyboardAvoidingView>
      </Screen>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  rowBody: {
    flex: 1,
    gap: 2,
  },
  rowName: {
    fontSize: 15,
    fontWeight: '700',
  },
  rowMeta: {
    fontSize: 13,
  },
  assignedTag: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
});
