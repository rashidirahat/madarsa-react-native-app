import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { useTheme } from '@/theme/ThemeProvider';
import { StudyProgressRecord, StudyProgressStatus } from '@/types/models';
import { capitalize } from '@/utils/format';

interface ProgressItemProps {
  progress: StudyProgressRecord;
  onEdit?: () => void;
}

function statusLabel(status: StudyProgressStatus): string {
  switch (status) {
    case 'not_started':
      return 'Not started';
    case 'in_progress':
      return 'In progress';
    case 'completed':
      return 'Completed';
    default:
      return capitalize(status);
  }
}

function statusTone(status: StudyProgressStatus): 'neutral' | 'accent' | 'success' {
  switch (status) {
    case 'completed':
      return 'success';
    case 'in_progress':
      return 'accent';
    default:
      return 'neutral';
  }
}

export function ProgressItem({ progress, onEdit }: ProgressItemProps) {
  const { colors } = useTheme();
  const editable = !!onEdit;
  return (
    <View style={[styles.record, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={styles.recordHeader}>
        <View style={styles.recordTitleWrap}>
          <Text style={[styles.recordTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {progress.subject} · {progress.topic}
          </Text>
          <Text style={[styles.recordMeta, { color: colors.textSecondary }]}>
            {progress.progressPercentage}% complete
          </Text>
        </View>
        {editable ? (
          <Pressable
            hitSlop={6}
            onPress={onEdit}
            accessibilityLabel={`Edit study progress for ${progress.topic}`}
            style={[styles.recordAction, { backgroundColor: colors.brandSoft }]}
          >
            <Ionicons name="create-outline" size={16} color={colors.brand} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.recordLine}>
        <Badge label={statusLabel(progress.status)} tone={statusTone(progress.status)} />
      </View>
      {progress.notes ? (
        <Text style={[styles.recordNotes, { color: colors.textSecondary }]} numberOfLines={3}>
          {progress.notes}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  record: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 8,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recordTitleWrap: {
    flex: 1,
    gap: 2,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  recordMeta: {
    fontSize: 12,
  },
  recordAction: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  recordNotes: {
    fontSize: 13,
    lineHeight: 18,
  },
});
