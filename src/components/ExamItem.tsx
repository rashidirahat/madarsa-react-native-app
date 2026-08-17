import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { useTheme } from '@/theme/ThemeProvider';
import { ExamRecord } from '@/types/models';
import { formatDate } from '@/utils/format';

interface ExamItemProps {
  exam: ExamRecord;
  onEdit?: () => void;
}

export function ExamItem({ exam, onEdit }: ExamItemProps) {
  const { colors } = useTheme();
  const editable = !!onEdit;
  return (
    <View style={[styles.record, { borderColor: colors.border, backgroundColor: colors.surface }]}>
      <View style={styles.recordHeader}>
        <View style={styles.recordTitleWrap}>
          <Text style={[styles.recordTitle, { color: colors.textPrimary }]} numberOfLines={1}>
            {exam.examName} · {exam.subject}
          </Text>
          <Text style={[styles.recordMeta, { color: colors.textSecondary }]}>
            {formatDate(exam.examDate)}
          </Text>
        </View>
        {editable ? (
          <Pressable
            hitSlop={6}
            onPress={onEdit}
            accessibilityLabel={`Edit exam ${exam.examName}`}
            style={[styles.recordAction, { backgroundColor: colors.brandSoft }]}
          >
            <Ionicons name="create-outline" size={16} color={colors.brand} />
          </Pressable>
        ) : null}
      </View>
      <View style={styles.recordLine}>
        <Text style={[styles.recordMarks, { color: colors.textPrimary }]}>
          {exam.obtainedMarks}/{exam.totalMarks}
        </Text>
        {exam.grade ? <Badge label={`Grade ${exam.grade}`} tone="accent" /> : null}
      </View>
      {exam.remarks ? (
        <Text style={[styles.recordNotes, { color: colors.textSecondary }]} numberOfLines={3}>
          {exam.remarks}
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
  recordMarks: {
    fontSize: 14,
    fontWeight: '700',
  },
  recordNotes: {
    fontSize: 13,
    lineHeight: 18,
  },
});
