import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'gold' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
  testID?: string;
  accessibilityLabel?: string;
}

function resolveColors(variant: ButtonVariant, colors: ReturnType<typeof useTheme>['colors']) {
  switch (variant) {
    case 'primary':
      return { bg: colors.brand, fg: colors.onBrand };
    case 'secondary':
      return { bg: colors.brandSoft, fg: colors.brand };
    case 'danger':
      return { bg: colors.danger, fg: '#FFFFFF' };
    case 'gold':
      return { bg: colors.accent, fg: colors.onAccent };
    case 'ghost':
      return { bg: 'transparent', fg: colors.brand };
    case 'outline':
      return { bg: 'transparent', fg: colors.brand, border: colors.brand };
  }
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  style,
  fullWidth = false,
  testID,
  accessibilityLabel,
}: ButtonProps) {
  const { colors } = useTheme();
  const palette = resolveColors(variant, colors);

  const sizeStyle = {
    sm: styles.sm,
    md: styles.md,
    lg: styles.lg,
  }[size];

  const isDisabled = disabled || loading;

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={({ pressed }) => [
        styles.base,
        sizeStyle,
        { backgroundColor: palette.bg, opacity: isDisabled ? 0.55 : pressed ? 0.85 : 1 },
        palette.border ? { borderWidth: 1.5, borderColor: palette.border } : null,
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.fg} />
      ) : (
        <>
          {icon && iconPosition === 'left' ? (
            <Ionicons name={icon} size={18} color={palette.fg} />
          ) : null}
          <Text style={[styles.label, { color: palette.fg }]}>{title}</Text>
          {icon && iconPosition === 'right' ? (
            <Ionicons name={icon} size={18} color={palette.fg} />
          ) : null}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
  },
  sm: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  md: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  lg: {
    paddingVertical: 15,
    paddingHorizontal: 24,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
});
