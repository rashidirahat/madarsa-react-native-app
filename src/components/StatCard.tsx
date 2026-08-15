import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type StatVariant = 'brand' | 'accent' | 'surface';

interface StatCardProps {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  variant?: StatVariant;
  onPress?: () => void;
  hint?: string;
}

function variantColors(variant: StatVariant) {
  const palette = {
    brand: { icon: '#0B6623', iconDark: '#128C38', bg: '#E6F0E8', bgDark: '#163726' },
    accent: { icon: '#B8860B', iconDark: '#FFD700', bg: '#F7EFD9', bgDark: '#3A3220' },
    surface: { icon: '#5A6B5D', iconDark: '#8FA395', bg: '#EDF1EE', bgDark: '#1E3326' },
  };
  return palette[variant];
}

export function StatCard({ label, value, icon, variant = 'surface', onPress, hint }: StatCardProps) {
  const { colors, isDark } = useTheme();
  const vc = variantColors(variant);
  const accentText = variant === 'brand' ? colors.brand : variant === 'accent' ? colors.accent : colors.textPrimary;
  const iconBg = isDark ? vc.bgDark : vc.bg;
  const iconColor = isDark ? vc.iconDark : vc.icon;

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
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={22} color={iconColor} />
      </View>
      <View style={styles.body}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.value, { color: accentText }]}>{value}</Text>
      </View>
      {onPress ? (
        <View style={[styles.chevron, { backgroundColor: iconBg }]}>
          <Ionicons name="chevron-forward" size={18} color={iconColor} />
        </View>
      ) : null}
    </View>
  );

  if (!onPress) {
    return <View style={styles.wrapper}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrapper, pressed && { opacity: 0.75, transform: [{ scale: 0.99 }] }]}
      accessibilityRole="button"
      accessibilityLabel={hint ? `${label}, ${value}. ${hint}` : `${label}, ${value}`}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    minWidth: 150,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
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
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  chevron: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
