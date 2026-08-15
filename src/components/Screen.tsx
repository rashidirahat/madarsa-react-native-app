import { ReactNode } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  contentContainerStyle?: StyleProp<ViewStyle>;
}

export function Screen({
  children,
  scroll = false,
  refreshing,
  onRefresh,
  padded = true,
  style,
  contentContainerStyle,
}: ScreenProps) {
  const { colors } = useTheme();

  const containerStyle = [
    styles.container,
    { backgroundColor: colors.background },
    padded && styles.padded,
    style,
  ];

  if (!scroll) {
    return <SafeAreaView style={containerStyle}>{children}</SafeAreaView>;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[padded && styles.padded, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={!!refreshing}
              onRefresh={onRefresh}
              tintColor={colors.brand}
              colors={[colors.brand]}
            />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  scroll: {
    flex: 1,
  },
});
