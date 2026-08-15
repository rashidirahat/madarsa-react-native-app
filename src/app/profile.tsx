import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ProfileApiUnavailableError, getErrorMessage } from '@/api/errors';
import { AppHeader } from '@/components/AppHeader';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { RequireAuth } from '@/components/RequireAuth';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/context/ToastProvider';
import { useContribution } from '@/hooks/useContribution';
import {
  getLocalProfile,
  saveLocalProfile,
  updateProfileName,
  uploadProfilePhoto,
} from '@/services/profileService';
import { useTheme } from '@/theme/ThemeProvider';
import { formatCurrency } from '@/utils/format';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const contribution = useContribution(user);

  useEffect(() => {
    getLocalProfile()
      .then((profile) => {
        if (profile?.photoUri) setPhotoUri(profile.photoUri);
        if (profile?.name) setName(profile.name);
      })
      .catch(() => undefined);
  }, []);

  const pickPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (!result.canceled && result.assets[0]?.uri) {
        setPhotoUri(result.assets[0].uri);
        await saveLocalProfile({ name, photoUri: result.assets[0].uri });
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const onSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    setSaving(true);
    try {
      await saveLocalProfile({ name: trimmed, photoUri });
      await updateUser({ name: trimmed });

      let serverSaved = true;
      try {
        await updateProfileName({ name: trimmed });
      } catch (error) {
        serverSaved = !(error instanceof ProfileApiUnavailableError);
      }

      if (photoUri) {
        try {
          await uploadProfilePhoto(photoUri);
        } catch (error) {
          if (error instanceof ProfileApiUnavailableError) {
            serverSaved = false;
          }
        }
      }

      toast.success(serverSaved ? 'Profile updated' : 'Saved on this device');
      if (!serverSaved) {
        toast.info('Profile API is not configured on the server — changes are stored locally.');
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <RequireAuth>
      <Screen scroll>
        <AppHeader title="Profile" showBack />

        <View style={styles.content}>
          <View style={styles.avatarWrap}>
            <Avatar name={name || user?.name} uri={photoUri} size={96} />
            <Pressable
              onPress={pickPhoto}
              hitSlop={8}
              style={[styles.cameraButton, { backgroundColor: colors.brand, borderColor: colors.background }]}
              accessibilityLabel="Change profile photo"
            >
              <Ionicons name="camera" size={18} color={colors.onBrand} />
            </Pressable>
          </View>

          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email ?? 'No email on file'}</Text>

          <Card style={styles.card} elevated>
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Edit profile</Text>
            <TextField label="Name" value={name} onChangeText={setName} placeholder="Your name" autoCapitalize="words" />
            <Button
              title="Save changes"
              onPress={onSave}
              loading={saving}
              fullWidth
              style={styles.saveButton}
            />
          </Card>

          <Card style={[styles.contributionCard, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}>
            <Ionicons name="ribbon-outline" size={22} color={colors.accent} />
            <View style={styles.contributionBody}>
              <Text style={[styles.contributionLabel, { color: colors.textSecondary }]}>
                Your contribution
              </Text>
              <Text style={[styles.contributionValue, { color: colors.accent }]}>
                {contribution.loaded ? formatCurrency(contribution.total) : '…'}
              </Text>
              <Text style={[styles.contributionHint, { color: colors.textSecondary }]}>
                Sum of your ADD_FUND records{contribution.count > 0 ? ` (${contribution.count} donation${contribution.count === 1 ? '' : 's'})` : ''}
              </Text>
            </View>
          </Card>

          <Button
            title="Open settings"
            icon="settings-outline"
            variant="outline"
            onPress={() => router.push('/settings')}
            fullWidth
          />
        </View>
      </Screen>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 24,
    paddingBottom: 32,
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  email: {
    fontSize: 14,
    marginTop: 8,
  },
  card: {
    width: '100%',
    gap: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  saveButton: {
    marginTop: 4,
  },
  contributionCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contributionBody: {
    flex: 1,
  },
  contributionLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  contributionValue: {
    fontSize: 24,
    fontWeight: '800',
  },
  contributionHint: {
    fontSize: 12,
  },
});
