import { Image, StyleSheet, Text, View } from 'react-native';

import { initials } from '@/utils/format';
import { useTheme } from '@/theme/ThemeProvider';

interface AvatarProps {
  name?: string | null;
  uri?: string | null;
  size?: number;
}

export function Avatar({ name, uri, size = 48 }: AvatarProps) {
  const { colors } = useTheme();
  const radius = size / 2;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: radius, backgroundColor: colors.surface }}
        accessibilityLabel={`${name ?? 'Profile'} photo`}
      />
    );
  }

  return (
    <View
      style={[
        styles.fallback,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: colors.brandSoft,
        },
      ]}
    >
      <Text style={[styles.text, { color: colors.brand, fontSize: size * 0.4 }]}>
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '800',
  },
});
