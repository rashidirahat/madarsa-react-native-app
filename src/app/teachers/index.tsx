import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { RequireAuth } from '@/components/RequireAuth';
import { Screen } from '@/components/Screen';
import { SearchBar } from '@/components/SearchBar';
import { TeacherCard } from '@/components/TeacherCard';
import { useTeachers } from '@/hooks/useTeachers';
import { useTheme } from '@/theme/ThemeProvider';

export default function TeachersListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, error, refetch, isRefetching } = useTeachers({ search });

  return (
    <RequireAuth>
      <Screen scroll padded={false} refreshing={isRefetching} onRefresh={() => refetch()}>
        <AppHeader title="All teachers" showBack />
        <View style={styles.content}>
          <SearchBar
            placeholder="Search teachers"
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
              icon="school-outline"
              title={search ? 'No matching teachers' : 'No teachers yet'}
              message={
                search ? 'Try a different search term.' : 'Teachers added here will appear on the Home tab.'
              }
            />
          ) : (
            <View style={styles.list}>
              <Text style={[styles.count, { color: colors.textSecondary }]}>
                {data.length} teacher{data.length === 1 ? '' : 's'}
              </Text>
              {data.map((teacher) => (
                <TeacherCard
                  key={teacher._id}
                  teacher={teacher}
                  defaultExpanded={false}
                  onPress={() =>
                    router.push({ pathname: '/teachers/[id]', params: { id: teacher._id } })
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
