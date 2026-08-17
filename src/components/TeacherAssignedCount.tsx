import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAssignedStudents } from '@/hooks/useTeacherAssignment';
import { useTheme } from '@/theme/ThemeProvider';

interface TeacherAssignedCountProps {
  teacherId: string;
  onPress: () => void;
}

export function TeacherAssignedCount({ teacherId, onPress }: TeacherAssignedCountProps) {
  const { colors } = useTheme();
  const { data, isLoading } = useAssignedStudents(teacherId);
  const count = data?.length ?? 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${count} student${count === 1 ? '' : 's'} assigned. View assigned students`}
      style={({ pressed }) => [
        styles.chip,
        { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
    >
      <Ionicons name="people-outline" size={15} color={colors.brand} />
      <Text style={[styles.label, { color: colors.textPrimary }]}>
        {isLoading ? '…' : count}
      </Text>
      <Text style={[styles.hint, { color: colors.textSecondary }]}>assigned</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  hint: {
    fontSize: 13,
    fontWeight: '500',
  },
});
