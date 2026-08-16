import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormMoneyInput } from '@/components/form/FormMoneyInput';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextField } from '@/components/form/FormTextField';
import { useToast } from '@/context/ToastProvider';
import { useCreateDonation } from '@/hooks/useDonationTotals';
import { useTheme } from '@/theme/ThemeProvider';
import { DonationCategory } from '@/types/models';
import { donationSchema, DonationFormValues } from '@/utils/validation';

interface DonationSheetProps {
  visible: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  { label: 'Sadaqah', value: 'sadaqah' },
  { label: 'Zakat', value: 'zakat' },
];

function currentYear(): string {
  return String(new Date().getFullYear());
}

export function DonationSheet({ visible, onClose }: DonationSheetProps) {
  const { colors } = useTheme();
  const toast = useToast();
  const createDonation = useCreateDonation();

  const { control, handleSubmit, reset, formState } = useForm<DonationFormValues>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      amount: '',
      category: 'sadaqah',
      year: currentYear(),
      description: '',
    },
  });

  useEffect(() => {
    if (visible) {
      reset({ amount: '', category: 'sadaqah', year: currentYear(), description: '' });
    }
  }, [visible, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createDonation.mutateAsync({
        amount: Number(values.amount),
        category: values.category as DonationCategory,
        year: values.year,
        description: values.description,
      });
      toast.success('Donation recorded successfully');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not record your donation');
    }
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <Pressable style={styles.backdropPressable} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Make a donation</Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Close">
              <Text style={[styles.close, { color: colors.textSecondary }]}>✕</Text>
            </Pressable>
          </View>

          <FormMoneyInput control={control} name="amount" label="Amount" placeholder="e.g. 500" />

          <View style={styles.row}>
            <View style={styles.rowItem}>
              <FormSelect
                control={control}
                name="category"
                label="Category"
                options={CATEGORY_OPTIONS}
                placeholder="Select a category"
              />
            </View>
            <View style={styles.rowItem}>
              <FormTextField
                control={control}
                name="year"
                label="Year"
                placeholder="2026"
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          </View>

          <FormTextField
            control={control}
            name="description"
            label="Description"
            placeholder="What is this donation for?"
            multiline
            numberOfLines={3}
            style={styles.multiline}
          />

          <Button
            title="Donate"
            icon="gift"
            variant="gold"
            onPress={onSubmit}
            loading={formState.isSubmitting}
            fullWidth
            style={styles.submit}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdropPressable: {
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  close: {
    fontSize: 18,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  multiline: {
    minHeight: 64,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  submit: {
    marginTop: 4,
  },
});
