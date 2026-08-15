import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { HistoryCard } from '@/components/HistoryCard';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { useHistory } from '@/hooks/useHistory';
import { useTheme } from '@/theme/ThemeProvider';
import { HistoryRecord } from '@/types/models';

const PAGE_SIZE = 50;

export default function HistoryScreen() {
  const { colors } = useTheme();
  const [page, setPage] = useState(1);
  const [records, setRecords] = useState<HistoryRecord[]>([]);

  const { data, isLoading, isError, error, refetch, isRefetching, isSuccess, isFetching } = useHistory({
    page,
    limit: PAGE_SIZE,
  });

  useEffect(() => {
    const next = data?.records;
    if (!next) return;
    requestAnimationFrame(() => {
      setRecords((prev) => {
        if (page === 1) return next;
        const seen = new Set(prev.map((r) => r._id ?? r.id ?? JSON.stringify(r)));
        const fresh = next.filter((r) => !seen.has(r._id ?? r.id ?? JSON.stringify(r)));
        return [...prev, ...fresh];
      });
    });
  }, [data, page]);

  const hasMore = data?.hasMore ?? false;

  const onRefresh = () => {
    setPage(1);
    refetch();
  };

  const loadMore = () => {
    setPage((p) => p + 1);
  };

  return (
    <Screen scroll refreshing={isRefetching} onRefresh={onRefresh}>
      <AppHeader title="History" subtitle="All activity in one place" />

      {isLoading && records.length === 0 ? (
        <LoadingState />
      ) : isError && records.length === 0 ? (
        <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
      ) : records.length === 0 && isSuccess ? (
        <EmptyState
          icon="time-outline"
          title="No activity yet"
          message="Changes to students and expenses will appear here as a timeline."
        />
      ) : (
        <View style={styles.list}>
          {records.map((record, index) => (
            <HistoryCard key={record._id ?? record.id ?? `${record.action}-${index}`} record={record} />
          ))}
          {hasMore ? (
            <Button
              title="Load more"
              variant="outline"
              onPress={loadMore}
              loading={isFetching}
              style={styles.loadMore}
            />
          ) : (
            <Text style={[styles.end, { color: colors.textSecondary }]}>You&apos;re all caught up</Text>
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 16,
    paddingBottom: 32,
    gap: 12,
  },
  loadMore: {
    marginTop: 8,
  },
  end: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 12,
  },
});
