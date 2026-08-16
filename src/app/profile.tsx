import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ProfileApiUnavailableError, getErrorMessage } from '@/api/errors';
import { AppHeader } from '@/components/AppHeader';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { DonationSheet } from '@/components/DonationSheet';
import { RequireAuth } from '@/components/RequireAuth';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/context/ToastProvider';
import { useDonationTotals } from '@/hooks/useDonationTotals';
import {
  getLocalProfile,
  saveLocalProfile,
  updateProfileName,
  uploadProfilePhoto,
} from '@/services/profileService';
import { useTheme } from '@/theme/ThemeProvider';
import { DonationCategory, DonationRecord } from '@/types/models';
import { formatCurrency, formatDate } from '@/utils/format';

const CATEGORY_META: Record<DonationCategory, { label: string; icon: keyof typeof Ionicons.glyphMap }> = {
  zakat: { label: 'Zakat', icon: 'water-outline' },
  sadaqah: { label: 'Sadaqah', icon: 'heart-outline' },
};

function DonationRecordsSheet({
  visible,
  category,
  records,
  onClose,
}: {
  visible: boolean;
  category: DonationCategory | null;
  records: DonationRecord[];
  onClose: () => void;
}) {
  const { colors } = useTheme();
  const meta = category ? CATEGORY_META[category] : CATEGORY_META.zakat;
  const total = records.reduce((sum, record) => sum + Number(record.amount ?? 0), 0);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <Pressable style={styles.sheetBackdropPressable} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderLeft}>
              <View style={[styles.sheetIconWrap, { backgroundColor: colors.accentSoft }]}>
                <Ionicons name={meta.icon} size={18} color={colors.accent} />
              </View>
              <View>
                <Text style={[styles.sheetTitle, { color: colors.textPrimary }]}>{meta.label} donations</Text>
                <Text style={[styles.sheetSubtitle, { color: colors.textSecondary }]}>{records.length} record{records.length === 1 ? '' : 's'}</Text>
              </View>
            </View>
            <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Close">
              <Text style={[styles.sheetClose, { color: colors.textSecondary }]}>✕</Text>
            </Pressable>
          </View>

          {records.length > 0 ? (
            <ScrollView style={styles.sheetList} showsVerticalScrollIndicator={false}>
              {records.map((record, index) => (
                <View
                  key={record._id ?? record.id ?? `${category}-${index}`}
                  style={[styles.recordRow, { backgroundColor: colors.background, borderColor: colors.border }]}
                >
                  <View style={styles.recordBody}>
                    <Text style={[styles.recordDescription, { color: colors.textPrimary }]} numberOfLines={2}>
                      {record.description?.trim() || 'Donation'}
                    </Text>
                    <Text style={[styles.recordDate, { color: colors.textSecondary }]}>
                      {formatDate(record.createdAt)}
                    </Text>
                  </View>
                  <Text style={[styles.recordAmount, { color: colors.accent }]}>
                    {formatCurrency(Number(record.amount ?? 0))}
                  </Text>
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.sheetEmpty}>
              <Text style={[styles.sheetEmptyText, { color: colors.textSecondary }]}>
                No {meta.label.toLowerCase()} records yet.
              </Text>
            </View>
          )}

          <View style={[styles.sheetTotal, { borderColor: colors.border }]}>
            <Text style={[styles.sheetTotalLabel, { color: colors.textSecondary }]}>Total {meta.label}</Text>
            <Text style={[styles.sheetTotalValue, { color: colors.accent }]}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function ProfileScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name ?? '');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DonationCategory | null>(null);
  const [donationOpen, setDonationOpen] = useState(false);

  const contribution = useDonationTotals();

  const selectedRecords =
    (contribution.data?.records ?? []).filter(
      (record) => record.category?.toLowerCase() === selectedCategory
    ) ?? [];

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

  const contributionLoading = contribution.isLoading && !contribution.data;
  const contributionYear = contribution.data?.year ?? new Date().getFullYear();

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

          <Button
            title="Donate"
            icon="gift"
            variant="gold"
            onPress={() => setDonationOpen(true)}
            fullWidth
          />

          <Card style={[styles.contributionCard, { backgroundColor: colors.accentSoft, borderColor: colors.accent }]}>
            <View style={styles.contributionHeader}>
              <Ionicons name="ribbon-outline" size={22} color={colors.accent} />
              <Text style={[styles.contributionLabel, { color: colors.textSecondary }]}>
                Your contribution in {contributionYear}
              </Text>
            </View>

            <Text style={[styles.contributionValue, { color: colors.accent }]}>
              {contributionLoading ? '…' : formatCurrency(contribution.data?.total ?? 0)}
            </Text>

            <View style={styles.categoryRows}>
              {(Object.keys(CATEGORY_META) as DonationCategory[]).map((category) => {
                const meta = CATEGORY_META[category];
                const amount = contributionLoading ? null : Number(contribution.data?.[category] ?? 0);
                return (
                  <Pressable
                    key={category}
                    onPress={() => setSelectedCategory(category)}
                    style={({ pressed }) => [
                      styles.categoryRow,
                      { backgroundColor: colors.surfaceElevated, borderColor: colors.border },
                      pressed && styles.categoryRowPressed,
                    ]}
                    accessibilityRole="button"
                    accessibilityLabel={`View ${meta.label} donations`}
                  >
                    <View style={[styles.categoryIconWrap, { backgroundColor: colors.accentSoft }]}>
                      <Ionicons name={meta.icon} size={16} color={colors.accent} />
                    </View>
                    <Text style={[styles.categoryLabel, { color: colors.textPrimary }]}>{meta.label}</Text>
                    <Text style={[styles.categoryAmount, { color: colors.accent }]}>
                      {amount === null ? '…' : formatCurrency(amount)}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </Pressable>
                );
              })}
            </View>

            {contribution.isError ? (
              <Pressable onPress={() => contribution.refetch()} hitSlop={8}>
                <Text style={[styles.contributionError, { color: colors.danger }]}>
                  {'Couldn\u2019t load contributions \u2014 tap to retry'}
                </Text>
              </Pressable>
            ) : null}
          </Card>

          <Button
            title="Open settings"
            icon="settings-outline"
            variant="outline"
            onPress={() => router.push('/settings')}
            fullWidth
          />
        </View>

        <DonationRecordsSheet
          visible={selectedCategory !== null}
          category={selectedCategory}
          records={selectedRecords}
          onClose={() => setSelectedCategory(null)}
        />

        <DonationSheet visible={donationOpen} onClose={() => setDonationOpen(false)} />
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
    gap: 12,
  },
  contributionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contributionLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  contributionValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  categoryRows: {
    gap: 8,
    marginTop: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  categoryRowPressed: {
    opacity: 0.7,
  },
  categoryIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  categoryAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  contributionError: {
    fontSize: 12,
    fontWeight: '600',
  },
  sheetBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetBackdropPressable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    paddingBottom: 36,
    gap: 14,
    maxHeight: '70%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sheetIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sheetSubtitle: {
    fontSize: 12,
  },
  sheetClose: {
    fontSize: 18,
    fontWeight: '700',
  },
  sheetList: {
    maxHeight: 320,
    gap: 8,
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    marginBottom: 8,
  },
  recordBody: {
    flex: 1,
    gap: 2,
  },
  recordDescription: {
    fontSize: 14,
    fontWeight: '600',
  },
  recordDate: {
    fontSize: 12,
  },
  recordAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  sheetEmpty: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  sheetEmptyText: {
    fontSize: 14,
  },
  sheetTotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  sheetTotalLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  sheetTotalValue: {
    fontSize: 18,
    fontWeight: '800',
  },
});
