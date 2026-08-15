import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { FormTextField } from '@/components/form/FormTextField';
import { Screen } from '@/components/Screen';
import { getErrorMessage } from '@/api/errors';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/context/ToastProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { loginSchema, LoginValues } from '@/utils/validation';

export default function LoginScreen() {
  const { colors } = useTheme();
  const { signIn } = useAuth();
  const toast = useToast();

  const { control, handleSubmit, formState } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn(values);
      toast.success('Welcome back');
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
            <Ionicons name="school" size={40} color={colors.brand} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Madarsa Manager</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign in to manage students, expenses and history.
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
            <FormTextField
              control={control}
              name="password"
              label="Password"
              placeholder="Your password"
              secureTextEntry
              leftIcon="lock-closed-outline"
            />
            <Button
              title="Sign in"
              onPress={onSubmit}
              loading={formState.isSubmitting}
              fullWidth
              style={styles.submit}
            />
          </Card>

          <Link href="/forgot-password" style={styles.forgotLink}>
            <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>
              Forgot your password?
            </Text>
          </Link>

          <View style={styles.footer}>
            <Text style={{ color: colors.textSecondary }}>New here? </Text>
            <Link href="/signup">
              <Text style={[styles.link, { color: colors.brand }]}>Create an account</Text>
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
  forgotLink: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 28,
  },
  link: {
    fontWeight: '700',
  },
});
