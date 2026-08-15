import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { FormTextField } from '@/components/form/FormTextField';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/context/ToastProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { forgotPasswordSchema, ForgotPasswordValues } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
  const { forgotPassword } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const { control, handleSubmit, formState } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await forgotPassword(values.email);
      toast.success('If that account exists, a reset link has been sent.');
      router.replace('/login');
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.content}>
          <View style={[styles.logoWrap, { backgroundColor: colors.brandSoft }]}>
            <Ionicons name="key" size={40} color={colors.brand} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Reset password</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your account email and we will send you a reset link.
          </Text>

          <Card style={styles.formCard} elevated>
            <FormTextField
              control={control}
              name="email"
              label="Email"
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail-outline"
            />
            <Button
              title="Send reset link"
              onPress={onSubmit}
              loading={formState.isSubmitting}
              fullWidth
              style={styles.submit}
            />
          </Card>

          <View style={styles.footer}>
            <Text style={{ color: colors.textSecondary }}>Remembered it? </Text>
            <Link href="/login">
              <Text style={[styles.link, { color: colors.brand }]}>Back to sign in</Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  formCard: {
    width: '100%',
    gap: 14,
  },
  submit: {
    marginTop: 6,
  },
  footer: {
    flexDirection: 'row',
    marginTop: 28,
  },
  link: {
    fontWeight: '700',
  },
});
