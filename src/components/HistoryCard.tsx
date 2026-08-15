import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { HistoryAction, HistoryRecord } from '@/types/models';
import {
  displayAmountForRecord,
  getChangedFields,
  isPositiveAction,
  recordActor,
  recordTime,
} from '@/utils/format';

type Tone = 'success' | 'danger' | 'warning' | 'neutral';

function actionMeta(action: HistoryAction): { label: string; icon: keyof typeof Ionicons.glyphMap; tone: Tone } {
  switch (action) {
    case 'ADD_FUND':
      return { label: 'Funds added by', icon: 'add-circle', tone: 'success' };
    case 'SPEND_FUND':
      return { label: 'Funds spent by', icon: 'remove-circle', tone: 'danger' };
    case 'CREATE':
      return { label: 'Created by', icon: 'sparkles', tone: 'success' };
    case 'UPDATE':
      return { label: 'Updated by', icon: 'create', tone: 'warning' };
    case 'DELETE':
      return { label: 'Deleted by', icon: 'trash', tone: 'danger' };
    default: {
      const readable = action
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      return { label: readable, icon: 'pulse', tone: 'neutral' };
    }
  }
}

function toneColors(tone: Tone, colors: ReturnType<typeof useTheme>['colors']) {
  switch (tone) {
    case 'success':
      return { bar: colors.success, text: colors.success, bg: colors.successSoft };
    case 'danger':
      return { bar: colors.danger, text: colors.danger, bg: colors.dangerSoft };
    case 'warning':
      return { bar: colors.accent, text: colors.accent, bg: colors.accentSoft };
    default:
      return { bar: colors.textSecondary, text: colors.textSecondary, bg: colors.surfaceElevated };
  }
}

function ChangeRow({ field, before, after }: { field: string; before: unknown; after: unknown }) {
  const { colors } = useTheme();
  const display = (value: unknown) => (value === undefined || value === null || value === '' ? '—' : String(value));
  return (
    <View style={styles.changeRow}>
      <Text style={[styles.changeField, { color: colors.textSecondary }]}>{field}</Text>
      <Text style={[styles.changeValue, { color: colors.danger }]} numberOfLines={1}>
        {display(before)}
      </Text>
      <Ionicons name="arrow-forward" size={12} color={colors.textSecondary} />
      <Text style={[styles.changeValue, { color: colors.success }]} numberOfLines={1}>
        {display(after)}
      </Text>
    </View>
  );
}

export function HistoryCard({ record }: { record: HistoryRecord }) {
  const { colors } = useTheme();
  const meta = actionMeta(record.action);
  const tc = toneColors(meta.tone, colors);
  const actor = recordActor(record);
  const amount = displayAmountForRecord(record);
  const changedFields = getChangedFields(record);
  const target = record.entityName ?? record.targetName ?? record.target;

  // console.log('HistoryCard record:', amount);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.bar, { backgroundColor: tc.bar }]} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <View style={[styles.iconWrap, { backgroundColor: tc.bg }]}>
            <Ionicons name={meta.icon} size={16} color={tc.text} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.action, { color: tc.text }]}>{meta.label} - {actor}</Text>
          </View>
          {amount ? (
            <Text
              style={[
                styles.amount,
                {
                  color: isPositiveAction(record.action) ? colors.success : colors.danger,
                  backgroundColor: isPositiveAction(record.action) ? colors.successSoft : colors.dangerSoft,
                },
              ]}
            >
              {isPositiveAction(record.action) ? '+' : '−'}
              {amount}
            </Text>
          ) : null}
        </View>

        {target ? (
          <Text style={[styles.target, { color: colors.textPrimary }]} numberOfLines={2}>
            {target}
          </Text>
        ) : null}

        {record.description ? (
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={3}>
            {record.description}
          </Text>
        ) : null}

        {changedFields.length > 0 ? (
          <View style={[styles.changes, { backgroundColor: colors.background }]}>
            <Text style={[styles.changesTitle, { color: colors.textSecondary }]}>
              Before → After
            </Text>
            {changedFields.map((change) => (
              <ChangeRow key={change.field} {...change} />
            ))}
          </View>
        ) : null}

        <Text style={[styles.time, { color: colors.textSecondary }]}>{recordTime(record)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  bar: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  action: {
    fontSize: 15,
    fontWeight: '800',
  },
  actor: {
    fontSize: 12,
  },
  amount: {
    fontSize: 14,
    fontWeight: '800',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  target: {
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
  changes: {
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  changesTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  changeField: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 64,
  },
  changeValue: {
    fontSize: 12,
    flexShrink: 1,
  },
  time: {
    fontSize: 11,
    marginTop: 2,
  },
});
