import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { FundSheet } from '@/components/FundSheet';
import { HistoryCard } from '@/components/HistoryCard';
import { LoadingState } from '@/components/LoadingState';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthProvider';
import { useExpenses } from '@/hooks/useExpenses';
import { useHistory } from '@/hooks/useHistory';
import { useTheme } from '@/theme/ThemeProvider';
import { formatCurrency } from '@/utils/format';

function BalanceHero({ balance, loading }: { balance: number; loading: boolean }) {
  const { colors } = useTheme();
  return (
    <Card style={[styles.heroCard, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]} elevated>
      <Ionicons name="wallet" size={24} color={colors.accent} />
      <Text style={[styles.heroLabel, { color: colors.textSecondary }]}>Available balance</Text>
      <Text style={[styles.heroValue, { color: colors.accent }]}>
        {loading ? '…' : formatCurrency(balance)}
      </Text>
    </Card>
  );
}

export default function ExpensesScreen() {
  const { colors } = useTheme();
  const { isAdmin } = useAuth();
  const [sheet, setSheet] = useState<'add' | 'spend' | null>(null);

  const expenses = useExpenses();
  const history = useHistory({ page: 1, limit: 100 });

  const fundRecords = useMemo(
    () => (history.data?.records ?? []).filter((r) => r.action === 'ADD_FUND' || r.action === 'SPEND_FUND'),
    [history.data]
  );

  const totals = useMemo(() => {
    let added = 0;
    let spent = 0;
    for (const record of fundRecords) {
      const amount = typeof record.after?.amount === 'number' ? record.after?.amount : 0;
      if (record.action === 'ADD_FUND') added += amount;
      else if (record.action === 'SPEND_FUND') spent += amount;
    }
    return { added, spent };
  }, [fundRecords]);

  const onRefresh = () => {
    expenses.refetch();
    history.refetch();
  };

  const balance = expenses.data?.currentAmount ?? 0;

  return (
    <Screen scroll refreshing={expenses.isRefetching || history.isRefetching} onRefresh={onRefresh}>
      <AppHeader title="Expenses" subtitle={isAdmin ? 'Manage funds and view history' : 'Balances and history'} />

      <View style={styles.content}>
        <BalanceHero balance={balance} loading={expenses.isLoading} />

        {expenses.isError ? (
          <ErrorState message={getErrorMessage(expenses.error)} onRetry={() => expenses.refetch()} />
        ) : null}

        {isAdmin ? (
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
        ) : null}

        <View style={styles.totalsRow}>
          <View style={[styles.totalBox, { backgroundColor: colors.successSoft }]}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total added</Text>
            <Text style={[styles.totalValue, { color: colors.success }]}>
              {formatCurrency(totals.added)}
            </Text>
          </View>
          <View style={[styles.totalBox, { backgroundColor: colors.dangerSoft }]}>
            <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total spent</Text>
            <Text style={[styles.totalValue, { color: colors.danger }]}>
              {formatCurrency(totals.spent)}
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Recent fund activity</Text>

        {history.isLoading && fundRecords.length === 0 ? (
          <LoadingState label="Loading history…" />
        ) : history.isError && fundRecords.length === 0 ? (
          <ErrorState message={getErrorMessage(history.error)} onRetry={() => history.refetch()} />
        ) : fundRecords.length === 0 ? (
          <EmptyState
            icon="receipt-outline"
            title="No fund activity yet"
            message="Add or spend funds to see them listed here."
          />
        ) : (
          <View style={styles.list}>
            {fundRecords.map((record, index) => (
              <HistoryCard key={record._id ?? record.id ?? `${record.action}-${index}`} record={record} />
            ))}
          </View>
        )}
      </View>

      <FundSheet
        visible={sheet === 'add' || sheet === 'spend'}
        mode={sheet === 'add' ? 'add' : 'spend'}
        onClose={() => setSheet(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 32,
    gap: 14,
  },
  heroCard: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 28,
  },
  heroLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  heroValue: {
    fontSize: 38,
    fontWeight: '800',
  },
  fundActions: {
    flexDirection: 'row',
    gap: 12,
  },
  fundButton: {
    flex: 1,
  },
  totalsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  totalBox: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    gap: 2,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 6,
  },
  list: {
    gap: 12,
  },
});
