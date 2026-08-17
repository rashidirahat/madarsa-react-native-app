import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
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
import { useTeacher, useTeacherMutations } from '@/hooks/useTeacher';
import { useTheme } from '@/theme/ThemeProvider';
import { displayGender, displayTeacherStatus, formatDate } from '@/utils/format';

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

export default function TeacherDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const { data: teacher, isLoading, isError, error, refetch } = useTeacher(id);
  const { remove } = useTeacherMutations();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const onDelete = async () => {
    if (!id) return;
    try {
      await remove.mutateAsync(id);
      toast.success('Teacher deleted');
      router.back();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const subjects = teacher?.subjects ?? [];

  return (
    <RequireAuth>
      <Screen scroll>
        <AppHeader
          title="Teacher"
          showBack
          right={
            isAdmin ? (
              <View style={styles.headerActions}>
                <Button
                  title=""
                  icon="create-outline"
                  variant="secondary"
                  size="sm"
                  onPress={() => router.push({ pathname: '/teachers/manage', params: { id } })}
                  accessibilityLabel="Edit teacher"
                />
                <Button
                  title=""
                  icon="trash-outline"
                  variant="ghost"
                  size="sm"
                  onPress={() => setConfirmDelete(true)}
                  accessibilityLabel="Delete teacher"
                />
              </View>
            ) : null
          }
        />

        {isLoading ? (
          <LoadingState />
        ) : isError || !teacher ? (
          <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
        ) : (
          <>
            <View style={styles.hero}>
              <View style={[styles.heroNameWrap, { backgroundColor: colors.brandSoft }]}>
                <Text style={[styles.heroName, { color: colors.brand }]}>
                  {teacher.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={[styles.name, { color: colors.textPrimary }]}>{teacher.name}</Text>
              <Text style={[styles.teacherId, { color: colors.textSecondary }]}>
                Teacher ID: {teacher.teacherId}
              </Text>
              <View style={styles.badges}>
                {teacher.specialization ? <Badge label={teacher.specialization} tone="accent" /> : null}
                <Badge
                  label={displayTeacherStatus(teacher.status)}
                  tone={teacher.status === 'active' ? 'success' : 'neutral'}
                />
              </View>
            </View>

            <Card elevated>
              <DetailRow icon="id-card-outline" label="Teacher ID" value={teacher.teacherId} />
              <DetailRow icon="ribbon-outline" label="Qualification" value={teacher.qualification} />
              <DetailRow icon="school-outline" label="Specialization" value={teacher.specialization} />
              <DetailRow
                icon="calendar-outline"
                label="Teaching experience"
                value={`${teacher.teachingExperience} yr(s)`}
              />
              <DetailRow icon="man-outline" label="Gender" value={displayGender(teacher.gender)} />
              <DetailRow
                icon="shield-checkmark-outline"
                label="Status"
                value={displayTeacherStatus(teacher.status)}
              />
              <DetailRow icon="location-outline" label="Address" value={teacher.address} />
              <DetailRow
                icon="calendar-outline"
                label="Joining date"
                value={formatDate(teacher.joiningDate ?? teacher.createdAt)}
              />
            </Card>

            <Card elevated>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Subjects &amp; classes
              </Text>
              {subjects.length === 0 ? (
                <Text style={[styles.noSubjects, { color: colors.textSecondary }]}>
                  No subjects assigned.
                </Text>
              ) : (
                subjects.map((s, index) => (
                  <View
                    key={`${s.subject}-${index}`}
                    style={[
                      styles.subjectRow,
                      index < subjects.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
                    ]}
                  >
                    <Text style={[styles.subjectName, { color: colors.brand }]} numberOfLines={1}>
                      {s.subject}
                    </Text>
                    <Text style={[styles.subjectClass, { color: colors.textSecondary }]} numberOfLines={1}>
                      {s.className}
                    </Text>
                  </View>
                ))
              )}
            </Card>
          </>
        )}
      </Screen>

      <ConfirmDialog
        visible={confirmDelete}
        title="Delete teacher?"
        message={`This will permanently remove ${teacher?.name ?? 'this teacher'}. This action cannot be undone.`}
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
  teacherId: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  noSubjects: {
    fontSize: 13,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
  subjectClass: {
    fontSize: 13,
    flexShrink: 1,
  },
});
