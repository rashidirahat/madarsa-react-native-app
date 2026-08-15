import { apiFetch } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { ApiError, getErrorMessage } from '@/api/errors';
import { parseAuthSession } from '@/services/parseSession';
import {
  clearStoredUser,
  clearTokens,
  setStoredUser,
  setTokens,
} from '@/stores/tokenStore';
import { AuthSession, AuthUser } from '@/types/models';

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

async function authenticate(promise: Promise<unknown>): Promise<AuthSession> {
  const raw = await promise;
  const session = parseAuthSession(raw);
  await setTokens(session.accessToken, session.refreshToken);
  await setStoredUser(session.user);
  return session;
}

export async function login(input: LoginInput): Promise<AuthSession> {
  try {
    return await authenticate(
      apiFetch(ENDPOINTS.auth.login, {
        method: 'POST',
        body: { email: input.email, password: input.password },
        auth: false,
      })
    );
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error(getErrorMessage(error));
  }
}

export async function signup(input: SignupInput): Promise<AuthSession | null> {
  try {
    const raw = await apiFetch(ENDPOINTS.auth.signup, {
      method: 'POST',
      body: { name: input.name, email: input.email, password: input.password },
      auth: false,
    });
    // Some backends return a session on signup; others return only a success flag.
    try {
      return await authenticate(Promise.resolve(raw));
    } catch {
      return null;
    }
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error(getErrorMessage(error));
  }
}

export async function forgotPassword(email: string): Promise<void> {
  try {
    await apiFetch(ENDPOINTS.auth.forgotPassword, {
      method: 'POST',
      body: { email },
      auth: false,
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error(getErrorMessage(error));
  }
}

export async function logout(): Promise<void> {
  try {
    await apiFetch(ENDPOINTS.auth.logout, { method: 'POST' });
  } catch {
    // Local cleanup always proceeds even if the remote logout fails.
  } finally {
    await Promise.all([clearTokens(), clearStoredUser()]);
  }
}

export async function persistUser(user: AuthUser): Promise<void> {
  await setStoredUser(user);
}
