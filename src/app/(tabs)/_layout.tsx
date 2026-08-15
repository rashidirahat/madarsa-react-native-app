import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import { ColorValue } from 'react-native';

import { LoadingState } from '@/components/LoadingState';
import { useAuth } from '@/context/AuthProvider';
import { useTheme } from '@/theme/ThemeProvider';

function tabIcon(outline: keyof typeof Ionicons.glyphMap, filled: keyof typeof Ionicons.glyphMap) {
  const TabIcon = ({ focused, color, size }: { focused: boolean; color: ColorValue; size: number }) => (
    <Ionicons name={focused ? filled : outline} size={size} color={color as string} />
  );
  TabIcon.displayName = `TabIcon_${outline}`;
  return TabIcon;
}

export default function TabsLayout() {
  const { status, isAdmin } = useAuth();
  const { colors } = useTheme();

  if (status === 'loading') {
    return <LoadingState label="Restoring session…" />;
  }

  if (status !== 'signedIn') {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: tabIcon('home-outline', 'home'),
        }}
      />
      <Tabs.Protected guard={isAdmin}>
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            tabBarIcon: tabIcon('shield-checkmark-outline', 'shield-checkmark'),
          }}
        />
      </Tabs.Protected>
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: tabIcon('time-outline', 'time'),
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: 'Expenses',
          tabBarIcon: tabIcon('wallet-outline', 'wallet'),
        }}
      />
    </Tabs>
  );
}
