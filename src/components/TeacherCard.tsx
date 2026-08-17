import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/Badge';
import { useTheme } from '@/theme/ThemeProvider';
import { Teacher } from '@/types/models';
import { displayTeacherStatus } from '@/utils/format';

interface TeacherCardProps {
  teacher: Teacher;
  onPress?: () => void;
  right?: ReactNode;
  footer?: ReactNode;
  defaultExpanded?: boolean;
}

export function TeacherCard({ teacher, onPress, right, footer, defaultExpanded = false }: TeacherCardProps) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const subjects = teacher.subjects ?? [];
  const subjectCount = subjects.length;
  const experience = typeof teacher.teachingExperience === 'number' ? teacher.teachingExperience : 0;

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
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [pressed && { opacity: 0.8 }]}
        accessibilityRole="button"
        accessibilityLabel={`${teacher.name}, ${displayTeacherStatus(teacher.status)} teacher`}
      >
        <View style={styles.topRow}>
          <View style={[styles.iconWrap, { backgroundColor: colors.accentSoft }]}>
            <Ionicons name="school-outline" size={22} color={colors.accent} />
          </View>
          <View style={styles.body}>
            <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
              {teacher.name}
            </Text>
            <Text style={[styles.teacherId, { color: colors.textSecondary }]}>
              TeacherID: {teacher.teacherId}
            </Text>
          </View>
          {right ?? <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />}
        </View>

        <View style={styles.badges}>
          {teacher.specialization ? <Badge label={teacher.specialization} tone="accent" /> : null}
          <Badge
            label={displayTeacherStatus(teacher.status)}
            tone={teacher.status === 'active' ? 'success' : 'neutral'}
          />
        </View>

        <View style={styles.details}>
          <View style={styles.detailLine}>
            <Ionicons name="ribbon-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
              {teacher.qualification || '—'}
              {experience > 0 ? ` · ${experience} yr${experience === 1 ? '' : 's'} experience` : ''}
            </Text>
          </View>
          <View style={styles.detailLine}>
            <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
              {teacher.address || '—'}
            </Text>
          </View>
        </View>
      </Pressable>

      <Pressable
        onPress={() => setExpanded((v) => !v)}
        style={({ pressed }) => [
          styles.subjectsToggle,
          { borderTopColor: colors.border },
          pressed && { opacity: 0.7 },
        ]}
        accessibilityRole="button"
        accessibilityLabel={`${subjectCount} subjects assigned, ${expanded ? 'collapse' : 'expand'}`}
      >
        <Text style={[styles.subjectsToggleText, { color: colors.textSecondary }]}>
          {subjectCount} subject{subjectCount === 1 ? '' : 's'} &amp; classes
        </Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.textSecondary} />
      </Pressable>

      {expanded ? (
        <View style={styles.subjects}>
          {subjectCount === 0 ? (
            <Text style={[styles.noSubjects, { color: colors.textSecondary }]}>
              No subjects assigned.
            </Text>
          ) : (
            subjects.map((s, index) => (
              <View
                key={`${s.subject}-${index}`}
                style={[
                  styles.subjectChip,
                  { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.subjectName, { color: colors.brand }]} numberOfLines={1}>
                  {s.subject}
                </Text>
                <Text style={[styles.className, { color: colors.textSecondary }]} numberOfLines={1}>
                  {s.className}
                </Text>
              </View>
            ))
          )}
        </View>
      ) : null}

      {footer ? (
        <View style={[styles.footer, { borderTopColor: colors.border }]}>{footer}</View>
      ) : null}
    </View>
  );

  return content;
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  teacherId: {
    fontSize: 13,
  },
  badges: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  details: {
    gap: 6,
  },
  detailLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
  },
  subjectsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  subjectsToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  subjects: {
    gap: 8,
  },
  noSubjects: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
    gap: 10,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subjectName: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
  className: {
    fontSize: 13,
    flexShrink: 1,
  },
});
