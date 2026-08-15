import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { FormMoneyInput } from '@/components/form/FormMoneyInput';
import { FormTextField } from '@/components/form/FormTextField';
import { useFundMutations } from '@/hooks/useExpenses';
import { useToast } from '@/context/ToastProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { getErrorMessage } from '@/api/errors';
import { fundSchema, FundFormValues } from '@/utils/validation';

export type FundMode = 'add' | 'spend';

interface FundSheetProps {
  visible: boolean;
  mode: FundMode;
  onClose: () => void;
}

export function FundSheet({ visible, mode, onClose }: FundSheetProps) {
  const { colors } = useTheme();
  const toast = useToast();
  const { add, spend } = useFundMutations();
  const isAdd = mode === 'add';

  const { control, handleSubmit, reset, formState } = useForm<FundFormValues>({
    resolver: zodResolver(fundSchema),
    defaultValues: { amount: '', description: '' },
  });

  useEffect(() => {
    if (visible) {
      reset({ amount: '', description: '' });
    }
  }, [visible, reset]);

  const mutation = isAdd ? add : spend;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        amount: Number(values.amount),
        description: values.description,
      });
      toast.success(isAdd ? 'Funds added successfully' : 'Expense recorded successfully');
      onClose();
    } catch (error) {
      toast.error(getErrorMessage(error));
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
            <Text style={[styles.title, { color: colors.textPrimary }]}>
              {isAdd ? 'Add funds' : 'Spend funds'}
            </Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Close">
              <Text style={[styles.close, { color: colors.textSecondary }]}>✕</Text>
            </Pressable>
          </View>

          <View style={[styles.modeHint, { backgroundColor: isAdd ? colors.brandSoft : colors.dangerSoft }]}>
            <Text style={{ color: isAdd ? colors.brand : colors.danger, fontWeight: '700' }}>
              {isAdd ? 'Money coming in' : 'Money going out'}
            </Text>
          </View>

          <FormMoneyInput control={control} name="amount" label="Amount" placeholder="e.g. 500" />
          <FormTextField
            control={control}
            name="description"
            label="Description"
            placeholder="What is this for?"
            multiline
            numberOfLines={3}
            style={styles.multiline}
          />

          <Button
            title={isAdd ? 'Add funds' : 'Spend funds'}
            icon={isAdd ? 'add' : 'remove'}
            variant={isAdd ? 'primary' : 'danger'}
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
  modeHint: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
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
