import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { RequireAuth } from '@/components/RequireAuth';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/context/ToastProvider';
import { useStudent, useStudentMutations } from '@/hooks/useStudent';
import { useTheme } from '@/theme/ThemeProvider';
import { displayGender, displayStudentType } from '@/utils/format';
import { getErrorMessage } from '@/api/errors';

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

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const { data: student, isLoading, isError, error, refetch } = useStudent(id);
  const { remove } = useStudentMutations();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const onDelete = async () => {
    if (!id) return;
    try {
      await remove.mutateAsync(id);
      toast.success('Student deleted');
      router.back();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <RequireAuth>
      <Screen scroll>
        <AppHeader
          title="Student"
          showBack
          right={
            isAdmin ? (
              <View style={styles.headerActions}>
                <Button
                  title=""
                  icon="create-outline"
                  variant="secondary"
                  size="sm"
                  onPress={() => router.push({ pathname: '/students/manage', params: { id } })}
                  accessibilityLabel="Edit student"
                />
                <Button
                  title=""
                  icon="trash-outline"
                  variant="ghost"
                  size="sm"
                  onPress={() => setConfirmDelete(true)}
                  accessibilityLabel="Delete student"
                />
              </View>
            ) : null
          }
        />

        {isLoading ? (
          <LoadingState />
        ) : isError || !student ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
        ) : (
          <>
            <View style={styles.hero}>
              <View style={[styles.heroNameWrap, { backgroundColor: colors.brandSoft }]}>
                <Text style={[styles.heroName, { color: colors.brand }]}>
                  {student.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.name, { color: colors.textPrimary }]}>{student.name}</Text>
              <Text style={[styles.studentId, { color: colors.textSecondary }]}>
                Student ID: {student.studentId}
              </Text>
              <View style={styles.badges}>
                {student.className ? <Badge label={student.className} tone="brand" /> : null}
                <Badge
                  label={displayStudentType(student.studentType)}
                  tone={student.studentType === 'hostel' ? 'accent' : 'neutral'}
                />
              </View>
            </View>

            <Card elevated>
              <DetailRow icon="id-card-outline" label="Student ID" value={student.studentId} />
              <DetailRow icon="calendar-outline" label="Age" value={String(student.age ?? '')} />
              <DetailRow icon="man-outline" label="Gender" value={displayGender(student.gender)} />
              <DetailRow icon="school-outline" label="Class" value={student.className} />
              <DetailRow
                icon="person-outline"
                label="Type"
                value={displayStudentType(student.studentType)}
              />
              <DetailRow icon="shield-checkmark-outline" label="Guardian" value={student.guardianName} />
              <DetailRow icon="location-outline" label="Address" value={student.address} />
              <DetailRow icon="call-outline" label="Phone" value={student.phone} />
            </Card>
          </>
        )}
      </Screen>

      <ConfirmDialog
        visible={confirmDelete}
        title="Delete student?"
        message={`This will permanently remove ${student?.name ?? 'this student'}. This action cannot be undone.`}
        confirmLabel="Delete"
        loading={remove.isPending}
        onConfirm={onDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 24,
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
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
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
});
