import { Redirect } from 'expo-router';
import { ReactNode } from 'react';

import { useAuth } from '@/context/AuthProvider';
import { LoadingState } from '@/components/LoadingState';

/**
 * Guards non-tab screens (profile, settings, students) against a missing
 * session. The (tabs) layout already guards the main area; this covers routes
 * pushed on top of it, e.g. after a session expires while on /profile.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === 'signedIn') return <>{children}</>;
  if (status === 'loading') return <LoadingState label="Restoring session…" />;
  return <Redirect href="/login" />;
}
