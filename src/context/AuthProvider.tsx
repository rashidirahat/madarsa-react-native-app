import { QueryClient } from '@tanstack/react-query';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { onSessionExpired } from '@/api/client';
import { getErrorMessage } from '@/api/errors';
import {
  login as loginRequest,
  logout as logoutRequest,
  persistUser,
  signup as signupRequest,
  forgotPassword as forgotPasswordRequest,
} from '@/services/authService';
import { clearStoredUser, clearTokens, getStoredUser, hasStoredSession } from '@/stores/tokenStore';
import { AuthUser, Role } from '@/types/models';

export interface SignInInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

type AuthStatus = 'loading' | 'signedIn' | 'signedOut';

interface AuthContextValue {
  status: AuthStatus;
  user: AuthUser | null;
  isAdmin: boolean;
  isAuthenticated: boolean;
  signIn: (input: SignInInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<'signed-in' | 'registered'>;
  forgotPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (patch: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  queryClient,
}: {
  children: ReactNode;
  queryClient: QueryClient;
}) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [hasSession, storedUser] = await Promise.all([hasStoredSession(), getStoredUser()]);
        if (cancelled) return;
        if (hasSession) {
          setUser(storedUser);
          setStatus('signedIn');
        } else {
          setStatus('signedOut');
        }
      } catch {
        if (!cancelled) setStatus('signedOut');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const unsubscribe = onSessionExpired(() => {
      setUser(null);
      setStatus('signedOut');
      queryClient.clear();
    });
    return unsubscribe;
  }, [queryClient]);

  const signIn = useCallback(async (input: SignInInput) => {
    const session = await loginRequest(input);
    setUser(session.user);
    setStatus('signedIn');
    queryClient.clear();
  }, [queryClient]);

  const signUp = useCallback(
    async (input: SignUpInput): Promise<'signed-in' | 'registered'> => {
      const session = await signupRequest(input);
      if (session) {
        setUser(session.user);
        setStatus('signedIn');
        queryClient.clear();
        return 'signed-in';
      }
      return 'registered';
    },
    [queryClient]
  );

  const forgotPassword = useCallback(async (email: string) => {
    try {
      await forgotPasswordRequest(email);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  }, []);

  const signOut = useCallback(async () => {
    await logoutRequest();
    setUser(null);
    setStatus('signedOut');
    queryClient.clear();
  }, [queryClient]);

  const updateUser = useCallback(
    async (patch: Partial<AuthUser>) => {
      const next = { ...(user ?? {}), ...patch } as AuthUser;
      setUser(next);
      await persistUser(next).catch(() => undefined);
    },
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      isAdmin: (user?.role as Role | undefined) === 'admin',
      isAuthenticated: status === 'signedIn',
      signIn,
      signUp,
      forgotPassword,
      signOut,
      updateUser,
    }),
    [status, user, signIn, signUp, forgotPassword, signOut, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}

export async function forceClearSession(): Promise<void> {
  await Promise.all([clearTokens(), clearStoredUser()]);
}
