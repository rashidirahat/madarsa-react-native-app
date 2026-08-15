import { Ionicons } from '@expo/vector-icons';
import { Redirect, useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { FundSheet } from '@/components/FundSheet';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { Select } from '@/components/Select';
import { StudentCard } from '@/components/StudentCard';
import { TeacherCard } from '@/components/TeacherCard';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/context/ToastProvider';
import { useExpenses } from '@/hooks/useExpenses';
import { useStudentMutations } from '@/hooks/useStudent';
import { useStudents } from '@/hooks/useStudents';
import { useTeacherMutations } from '@/hooks/useTeacher';
import { useTeachers } from '@/hooks/useTeachers';
import { useRoleMutation, useUsers } from '@/hooks/useUsers';
import { useTheme } from '@/theme/ThemeProvider';
import { Role, Student, Teacher } from '@/types/models';
import { formatCurrency } from '@/utils/format';

function SectionCard({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color={colors.brand} />
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{title}</Text>
      </View>
      <Card style={styles.sectionCard} elevated>
        {children}
      </Card>
    </View>
  );
}

function StudentsSection() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const { remove } = useStudentMutations();
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);

  const { data, isLoading, isError, error, refetch } = useStudents({ search });

  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync(deleteTarget._id);
      toast.success('Student deleted');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
      setDeleteTarget(null);
    }
  };

  return (
    <SectionCard title="Student management" icon="people-outline">
      <Button
        title="Add student"
        icon="add"
        onPress={() => router.push('/students/manage')}
        fullWidth
        style={styles.addButton}
      />
      <SearchBar placeholder="Search students" value={search} onChangeText={setSearch} />

      {isLoading ? (
        <LoadingState label="Loading students…" />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={search ? 'search-outline' : 'people-outline'}
          title={search ? 'No matching students' : 'No students yet'}
          message={search ? 'Try a different search term.' : 'Add your first student to get started.'}
        />
      ) : (
        <View style={styles.studentList}>
          {data.map((student) => (
            <StudentCard
              key={student._id}
              student={student}
              onPress={() => router.push({ pathname: '/students/[id]', params: { id: student._id } })}
              right={
                <View style={styles.rowActions}>
                  <Pressable
                    hitSlop={6}
                    onPress={() => router.push({ pathname: '/students/manage', params: { id: student._id } })}
                    accessibilityLabel={`Edit ${student.name}`}
                    style={[styles.actionButton, { backgroundColor: colors.brandSoft }]}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.brand} />
                  </Pressable>
                  <Pressable
                    hitSlop={6}
                    onPress={() => setDeleteTarget(student)}
                    accessibilityLabel={`Delete ${student.name}`}
                    style={[styles.actionButton, { backgroundColor: colors.dangerSoft }]}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                </View>
              }
            />
          ))}
        </View>
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete student?"
        message={`This will permanently remove ${deleteTarget?.name ?? 'this student'}.`}
        confirmLabel="Delete"
        loading={remove.isPending}
        onConfirm={onDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </SectionCard>
  );
}

function TeachersSection() {
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const { remove } = useTeacherMutations();
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  const { data, isLoading, isError, error, refetch } = useTeachers({ search });

  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync(deleteTarget._id);
      toast.success('Teacher deleted');
      setDeleteTarget(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
      setDeleteTarget(null);
    }
  };

  return (
    <SectionCard title="Teacher management" icon="school-outline">
      <Button
        title="Add teacher"
        icon="add"
        onPress={() => router.push('/teachers/manage')}
        fullWidth
        style={styles.addButton}
      />
      <SearchBar placeholder="Search teachers" value={search} onChangeText={setSearch} />

      {isLoading ? (
        <LoadingState label="Loading teachers…" />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : data.length === 0 ? (
        <EmptyState
          icon={search ? 'search-outline' : 'school-outline'}
          title={search ? 'No matching teachers' : 'No teachers yet'}
          message={search ? 'Try a different search term.' : 'Add your first teacher to get started.'}
        />
      ) : (
        <View style={styles.studentList}>
          {data.map((teacher) => (
            <TeacherCard
              key={teacher._id}
              teacher={teacher}
              onPress={() => router.push({ pathname: '/teachers/[id]', params: { id: teacher._id } })}
              right={
                <View style={styles.rowActions}>
                  <Pressable
                    hitSlop={6}
                    onPress={() => router.push({ pathname: '/teachers/manage', params: { id: teacher._id } })}
                    accessibilityLabel={`Edit ${teacher.name}`}
                    style={[styles.actionButton, { backgroundColor: colors.brandSoft }]}
                  >
                    <Ionicons name="create-outline" size={18} color={colors.brand} />
                  </Pressable>
                  <Pressable
                    hitSlop={6}
                    onPress={() => setDeleteTarget(teacher)}
                    accessibilityLabel={`Delete ${teacher.name}`}
                    style={[styles.actionButton, { backgroundColor: colors.dangerSoft }]}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                </View>
              }
            />
          ))}
        </View>
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title="Delete teacher?"
        message={`This will permanently remove ${deleteTarget?.name ?? 'this teacher'}.`}
        confirmLabel="Delete"
        loading={remove.isPending}
        onConfirm={onDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </SectionCard>
  );
}

function ExpensesSection() {
  const { colors } = useTheme();
  const { data, isLoading, isError, error, refetch } = useExpenses();
  const [sheet, setSheet] = useState<'add' | 'spend' | null>(null);

  const balance = data?.currentAmount ?? 0;

  return (
    <SectionCard title="Expense management" icon="wallet-outline">
      <View style={[styles.balanceBox, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}>
        <Text style={[styles.balanceLabel, { color: colors.textSecondary }]}>Available balance</Text>
        <Text style={[styles.balanceValue, { color: colors.accent }]}>
          {isLoading ? '…' : formatCurrency(balance)}
        </Text>
      </View>

      {isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : null}

      <View style={styles.fundActions}>
        <Button
          title="Add funds"
          icon="add"
          variant="primary"
          onPress={() => setSheet('add')}
          style={styles.fundButton}
        />
        <Button
          title="Spend funds"
          icon="remove"
          variant="danger"
          onPress={() => setSheet('spend')}
          style={styles.fundButton}
        />
      </View>

      <FundSheet
        visible={sheet === 'add' || sheet === 'spend'}
        mode={sheet === 'add' ? 'add' : 'spend'}
        onClose={() => setSheet(null)}
      />
    </SectionCard>
  );
}

const ROLE_OPTIONS: { label: string; value: string }[] = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' },
  { label: 'Teacher', value: 'teacher' },
];

function RolesSection() {
  const { colors } = useTheme();
  const toast = useToast();
  const { data: users, unavailable, isLoading } = useUsers();
  const roleMutation = useRoleMutation();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [role, setRole] = useState<Role>('user');

  const applyRole = async () => {
    if (!selectedUserId.trim()) {
      toast.error('Enter or select a user ID');
      return;
    }
    try {
      await roleMutation.mutateAsync({ userId: selectedUserId.trim(), role });
      toast.success(`Role updated to ${role}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  return (
    <SectionCard title="User role management" icon="shield-checkmark-outline">
      {isLoading ? (
        <LoadingState label="Loading users…" />
      ) : unavailable ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="User list unavailable"
          message="The user-list endpoint is not enabled on this server. You can still update a role by entering a user ID manually below."
        />
      ) : users.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="No users found"
          message="No users are available to manage."
        />
      ) : (
        <>
          <Text style={[styles.selectUserLabel, { color: colors.textSecondary }]}>
            Select a user
          </Text>
          <View style={styles.userList}>
            {users.map((user) => {
              const active = user._id === selectedUserId;
              return (
                <Pressable
                  key={user._id}
                  onPress={() => {
                    setSelectedUserId(user._id);
                    if (user.role) setRole(user.role);
                  }}
                  style={[
                    styles.userRow,
                    {
                      backgroundColor: active ? colors.brandSoft : colors.surface,
                      borderColor: active ? colors.brand : colors.border,
                    },
                  ]}
                >
                  <View style={styles.userRowText}>
                    <Text style={[styles.userName, { color: colors.textPrimary }]}>
                      {user.name ?? 'Unnamed user'}
                    </Text>
                    {user.email ? (
                      <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user.email}</Text>
                    ) : null}
                  </View>
                  {user.role ? (
                    <Text style={[styles.userRole, { color: colors.brand }]}>{user.role}</Text>
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </>
      )}

      <Text style={[styles.divider, { color: colors.textSecondary }]}>
        {unavailable ? 'Manual role update' : '…or enter a user ID directly'}
      </Text>

      <TextField
        label="User ID"
        placeholder={unavailable ? 'Paste a user ID' : 'Paste a user ID (optional)'}
        value={selectedUserId}
        onChangeText={setSelectedUserId}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Select label="New role" value={role} options={ROLE_OPTIONS} onChange={(v) => setRole(v as Role)} />

      <Button
        title="Update role"
        icon="shield-checkmark"
        onPress={applyRole}
        loading={roleMutation.isPending}
        fullWidth
        style={styles.roleSubmit}
      />
    </SectionCard>
  );
}

export default function AdminScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  if (!user || user.role !== 'admin') {
    return <Redirect href="/" />;
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  return (
    <Screen scroll onRefresh={handleRefresh}>
      <AppHeader title="Admin" subtitle="Management console" />
      <View style={styles.content}>
        <StudentsSection />
        <TeachersSection />
        <ExpensesSection />
        <RolesSection />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 32,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionCard: {
    gap: 14,
  },
  addButton: {
    marginBottom: 2,
  },
  studentList: {
    gap: 10,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    gap: 4,
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  fundActions: {
    flexDirection: 'row',
    gap: 12,
  },
  fundButton: {
    flex: 1,
  },
  selectUserLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  userList: {
    gap: 8,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  userRowText: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 13,
  },
  userRole: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  divider: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  roleSubmit: {
    marginTop: 2,
  },
});
