import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type BadgeTone = 'brand' | 'accent' | 'danger' | 'success' | 'warning' | 'neutral';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

function toneColors(tone: BadgeTone, colors: ReturnType<typeof useTheme>['colors']) {
  switch (tone) {
    case 'brand':
      return { bg: colors.brandSoft, fg: colors.brand };
    case 'accent':
      return { bg: colors.accentSoft, fg: colors.accent };
    case 'danger':
      return { bg: colors.dangerSoft, fg: colors.danger };
    case 'success':
      return { bg: colors.successSoft, fg: colors.success };
    case 'warning':
      return { bg: colors.warningSoft, fg: colors.warning };
    default:
      return { bg: colors.surfaceElevated, fg: colors.textSecondary };
  }
}

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const { colors } = useTheme();
  const tc = toneColors(tone, colors);
  return (
    <View style={[styles.badge, { backgroundColor: tc.bg }]}>
      <Text style={[styles.text, { color: tc.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
