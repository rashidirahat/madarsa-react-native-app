import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { Card } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { RequireAuth } from '@/components/RequireAuth';
import { Screen } from '@/components/Screen';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useAuth } from '@/context/AuthProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { ThemeMode } from '@/theme/types';

function SettingRow({
  icon,
  title,
  subtitle,
  onPress,
  danger = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
      accessibilityRole="button"
    >
      <View style={[styles.rowIcon, { backgroundColor: danger ? colors.dangerSoft : colors.brandSoft }]}>
        <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.brand} />
      </View>
      <View style={styles.rowBody}>
        <Text style={[styles.rowTitle, { color: danger ? colors.danger : colors.textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { mode, setMode } = useTheme();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const onLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      // The (auth) layout redirects to login automatically.
    } finally {
      setLoggingOut(false);
      setConfirmLogout(false);
    }
  };

  return (
    <RequireAuth>
      <Screen scroll>
        <AppHeader title="Settings" showBack />

        <View style={styles.content}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Appearance</Text>
          <Card style={styles.card} elevated>
            <View style={styles.appearanceHeader}>
              <View>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Theme</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                  Choose how Madarsa Manager looks.
                </Text>
              </View>
            </View>
            <ThemeToggle mode={mode as ThemeMode} onChange={setMode} />
          </Card>

          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Account</Text>
          <Card style={styles.card} elevated>
            <SettingRow
              icon="person-outline"
              title="Edit profile"
              subtitle={user?.email ?? undefined}
              onPress={() => router.push('/profile')}
            />
            <SettingRow
              icon="log-out-outline"
              title="Log out"
              subtitle="Sign out of this device"
              danger
              onPress={() => setConfirmLogout(true)}
            />
          </Card>

          <Text style={[styles.version, { color: colors.textSecondary }]}>
            Madarsa Manager · v1.0.0
          </Text>
        </View>
      </Screen>

      <ConfirmDialog
        visible={confirmLogout}
        title="Log out?"
        message="You will need to sign in again to manage the Madarsa."
        confirmLabel="Log out"
        loading={loggingOut}
        onConfirm={onLogout}
        onCancel={() => setConfirmLogout(false)}
      />
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingBottom: 32,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 6,
  },
  card: {
    gap: 4,
    padding: 8,
  },
  appearanceHeader: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 12,
  },
});
