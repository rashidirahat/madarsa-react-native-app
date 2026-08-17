import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ReactNode, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Avatar } from '@/components/Avatar';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { StatCard } from '@/components/StatCard';
import { StudentCard } from '@/components/StudentCard';
import { TeacherAssignmentsFooter } from '@/components/TeacherAssignmentsFooter';
import { TeacherCard } from '@/components/TeacherCard';
import { useAuth } from '@/context/AuthProvider';
import { useAllStudentPerformance } from '@/hooks/useAllStudentPerformance';
import { useAllTeacherAssignments } from '@/hooks/useAllTeacherAssignments';
import { useStudents } from '@/hooks/useStudents';
import { useTeachers } from '@/hooks/useTeachers';
import { useTheme } from '@/theme/ThemeProvider';
import { Student } from '@/types/models';
import { getErrorMessage } from '@/api/errors';

export default function HomeScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [search, setSearch] = useState('');

  const query = useStudents({ search });
  const { data: students, all, isLoading, isError, error, refetch, isRefetching } = query;

  const performance = useAllStudentPerformance();
  const assignments = useAllTeacherAssignments();

  const teachersQuery = useTeachers();
  const {
    data: teachers,
    all: allTeachers,
    isLoading: teachersLoading,
    isError: teachersError,
    error: teachersError_,
    refetch: refetchTeachers,
    isRefetching: teachersRefetching,
  } = teachersQuery;

  const stats = useMemo(() => {
    const day = all.filter((s) => s.studentType === 'day').length;
    const hostel = all.filter((s) => s.studentType === 'hostel').length;
    return { total: all.length, day, hostel };
  }, [all]);

  return (
    <Screen
      scroll
      refreshing={isRefetching || performance.isRefetching || assignments.isRefetching || teachersRefetching}
      onRefresh={() => Promise.all([refetch(), performance.refetch(), assignments.refetch(), refetchTeachers()])}
    >
      <AppHeader
        title="Madarsa Manager"
        subtitle={user?.name ? `Salaam, ${user.name}` : undefined}
        right={
          <Pressable onPress={() => router.push('/profile')} hitSlop={8} accessibilityLabel="Open profile">
            <Avatar name={user?.name} size={38} />
          </Pressable>
        }
      />

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Overview</Text>
        <View style={styles.statsRow}>
          <StatCard
            label="Total students"
            value={String(stats.total)}
            icon="people-outline"
            variant="brand"
          />
          <StatCard
            label="Day students"
            value={String(stats.day)}
            icon="sunny-outline"
            variant="accent"
            onPress={() => router.push({ pathname: '/students', params: { type: 'day' } })}
          />
          <StatCard
            label="Hostel students"
            value={String(stats.hostel)}
            icon="bed-outline"
            variant="surface"
            onPress={() => router.push({ pathname: '/students', params: { type: 'hostel' } })}
          />
          <StatCard
            label="Total teachers"
            value={String(allTeachers.length)}
            icon="school-outline"
            variant="accent"
            onPress={() => router.push('/teachers')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Students</Text>
        <SearchBar
          placeholder="Search by name, ID, class or guardian"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <LoadingState />
      ) : isError ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : students.length === 0 ? (
        <EmptyState
          icon={search ? 'search-outline' : 'people-outline'}
          title={search ? 'No matching students' : 'No students yet'}
          message={search ? 'Try a different search term.' : 'Students added here will show up on the Home tab.'}
        />
      ) : (
        <View style={styles.list}>
          {students.map((student) => (
            <StudentCard
              key={student._id}
              student={student}
              onPress={() =>
                router.push({ pathname: '/students/[id]', params: { id: student._id } })
              }
              summary={<StudentPerformanceSummary detail={performance.studentsById[student._id]} />}
            />
          ))}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Teachers</Text>
          <Pressable
            onPress={() => router.push('/teachers')}
            accessibilityRole="button"
            accessibilityLabel="View all teachers"
            hitSlop={8}
          >
            <Text style={[styles.viewAll, { color: colors.brand }]}>View all</Text>
          </Pressable>
        </View>

        {teachersLoading ? (
          <LoadingState label="Loading teachers…" />
        ) : teachersError ? (
          <ErrorState message={getErrorMessage(teachersError_)} onRetry={() => refetchTeachers()} />
        ) : allTeachers.length === 0 ? (
          <EmptyState
            icon="school-outline"
            title="No teachers yet"
            message="Teachers added here will show up on the Home tab."
          />
        ) : (
          <View style={styles.list}>
            {teachers.slice(0, 5).map((teacher) => (
              <TeacherCard
                key={teacher._id}
                teacher={teacher}
                onPress={() =>
                  router.push({ pathname: '/teachers/[id]', params: { id: teacher._id } })
                }
                footer={
                  <TeacherAssignmentsFooter
                    teacherId={teacher._id}
                    students={assignments.byTeacherId[teacher._id] ?? []}
                  />
                }
              />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

function StudentPerformanceSummary({ detail }: { detail?: Student }) {
  const { colors } = useTheme();
  const exams = detail?.exams ?? [];
  const progress = detail?.studyProgress ?? [];
  const parts: ReactNode[] = [];

  if (exams.length > 0) {
    parts.push(
      <View key="exams" style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Ionicons name="document-text-outline" size={13} color={colors.textSecondary} />
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>
          {`${exams.length} exam${exams.length === 1 ? '' : 's'}`}
          {typeof detail?.overallExamAverage === 'number'
            ? ` · ${detail.overallExamAverage}% avg`
            : ''}
        </Text>
      </View>
    );
  }

  if (progress.length > 0) {
    parts.push(
      <View key="progress" style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
        <Ionicons name="analytics-outline" size={13} color={colors.textSecondary} />
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>
          {typeof detail?.studyProgressSummary?.averageProgressPercentage === 'number'
            ? `${detail.studyProgressSummary.averageProgressPercentage}% progress`
            : `${progress.length} tracked`}
        </Text>
      </View>
    );
  }

  if (parts.length === 0) {
    return (
      <Text style={{ fontSize: 13, color: colors.textSecondary, fontStyle: 'italic' }}>
        No exams or progress yet
      </Text>
    );
  }

  return <>{parts}</>;
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAll: {
    fontSize: 14,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  list: {
    gap: 10,
  },
});
