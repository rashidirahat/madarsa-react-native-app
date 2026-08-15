import { StyleSheet, Text, Pressable } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeToggleProps {
  mode: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

const OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

export function ThemeToggle({ mode, onChange }: ThemeToggleProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      accessibilityRole="tablist"
    >
      {OPTIONS.map((option) => {
        const active = option.value === mode;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={[
              styles.option,
              active ? { backgroundColor: colors.brand } : { backgroundColor: 'transparent' },
            ]}
          >
            <Text
              style={[styles.label, { color: active ? colors.onBrand : colors.textSecondary }]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
});
