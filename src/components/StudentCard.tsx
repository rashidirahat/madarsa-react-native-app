import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { useTheme } from '@/theme/ThemeProvider';
import { Student } from '@/types/models';
import { displayGender, displayStudentType } from '@/utils/format';

interface StudentCardProps {
  student: Student;
  onPress?: () => void;
  right?: ReactNode;
}

export function StudentCard({ student, onPress, right }: StudentCardProps) {
  const { colors } = useTheme();

  const content = (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <Avatar name={student.name} size={44} />
      <View style={styles.body}>
        <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
          {student.name}
        </Text>
        <Text style={[styles.studentId, { color: colors.textSecondary }]}>
          StudentID: {student.studentId}
        </Text>
        <View style={styles.badges}>
          {student.gender ? <Badge label={displayGender(student.gender)} tone="neutral" /> : null}
          {student.className ? <Badge label={student.className} tone="brand" /> : null}
          <Badge
            label={displayStudentType(student.studentType)}
            tone={student.studentType === 'hostel' ? 'accent' : 'neutral'}
          />
        </View>
      </View>
      {right ?? (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      )}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
      accessibilityLabel={`${student.name}, ${displayStudentType(student.studentType)} student`}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 12,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  studentId: {
    fontSize: 13,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
});
