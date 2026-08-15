import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.brand} />
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  label: {
    fontSize: 14,
  },
});
