import { Ionicons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

export interface TextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
}

export function TextField({
  label,
  error,
  hint,
  leftIcon,
  style,
  placeholderTextColor,
  ...inputProps
}: TextFieldProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {label ? (
        <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>
      ) : null}
      <View
        style={[
          styles.inputWrap,
          {
            backgroundColor: colors.input,
            borderColor: error ? colors.danger : colors.border,
          },
        ]}
      >
        {leftIcon ? (
          <Ionicons name={leftIcon} size={18} color={colors.textSecondary} style={styles.icon} />
        ) : null}
        <TextInput
          placeholderTextColor={placeholderTextColor ?? colors.placeholder}
          {...inputProps}
          style={[styles.input, { color: colors.textPrimary }, style]}
        />
      </View>
      {error ? (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : hint ? (
        <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  error: {
    fontSize: 12,
    fontWeight: '500',
  },
  hint: {
    fontSize: 12,
  },
});
