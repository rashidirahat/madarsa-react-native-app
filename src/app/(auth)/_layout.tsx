import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/context/AuthProvider';
import { LoadingState } from '@/components/LoadingState';

export default function AuthLayout() {
  const { status } = useAuth();

  if (status === 'loading') {
    return <LoadingState label="Restoring session…" />;
  }

  if (status === 'signedIn') {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
