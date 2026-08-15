import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { StudentCard } from '@/components/StudentCard';
import { getErrorMessage } from '@/api/errors';
import { useStudents } from '@/hooks/useStudents';
import { RequireAuth } from '@/components/RequireAuth';
import { useTheme } from '@/theme/ThemeProvider';
import { StudentType } from '@/types/models';
import { displayStudentType } from '@/utils/format';

export default function StudentsListScreen() {
  const { type } = useLocalSearchParams<{ type?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');

  const studentType: StudentType | undefined =
    type === 'day' || type === 'hostel' ? type : undefined;

  const { data, isLoading, isError, error, refetch, isRefetching } = useStudents({
    type: studentType ?? 'all',
    search,
  });

  const title = studentType ? `${displayStudentType(studentType)} students` : 'All students';

  return (
    <RequireAuth>
      <Screen scroll padded={false} refreshing={isRefetching} onRefresh={() => refetch()}>
        <AppHeader title={title} showBack />
        <View style={styles.content}>
          <SearchBar
            placeholder="Search students"
            value={search}
            onChangeText={setSearch}
            style={styles.search}
          />

          {isLoading ? (
            <LoadingState />
          ) : isError ? (
            <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
          ) : data.length === 0 ? (
            <EmptyState
              icon={search ? 'search-outline' : 'people-outline'}
              title={search ? 'No matching students' : 'No students here yet'}
              message={search ? 'Try a different search term.' : 'Students will appear in this list.'}
            />
          ) : (
            <View style={styles.list}>
              <Text style={[styles.count, { color: colors.textSecondary }]}>
                {data.length} student{data.length === 1 ? '' : 's'}
              </Text>
              {data.map((student) => (
                <StudentCard
                  key={student._id}
                  student={student}
                  onPress={() =>
                    router.push({ pathname: '/students/[id]', params: { id: student._id } })
                  }
                />
              ))}
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
  search: {
    marginBottom: 4,
  },
  count: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    gap: 10,
  },
});
