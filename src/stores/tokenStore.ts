import * as SecureStore from 'expo-secure-store';

import { AuthUser } from '@/types/models';
import { getStoredJson, removeStoredJson, setStoredJson, STORAGE_KEYS } from '@/utils/storage';

const ACCESS_KEY = 'madarsa_access_token';
const REFRESH_KEY = 'madarsa_refresh_token';

const isWeb = typeof window !== 'undefined' && !!window.localStorage;

async function secureGet(key: string): Promise<string | null> {
  if (isWeb) {
    return window.localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function secureSet(key: string, value: string): Promise<void> {
  if (isWeb) {
    window.localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function secureRemove(key: string): Promise<void> {
  if (isWeb) {
    window.localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function getAccessToken(): Promise<string | null> {
  return secureGet(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return secureGet(REFRESH_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string): Promise<void> {
  await Promise.all([secureSet(ACCESS_KEY, accessToken), secureSet(REFRESH_KEY, refreshToken)]);
}

export async function setAccessToken(accessToken: string): Promise<void> {
  await secureSet(ACCESS_KEY, accessToken);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([secureRemove(ACCESS_KEY), secureRemove(REFRESH_KEY)]);
}

export async function hasStoredSession(): Promise<boolean> {
  return (await getAccessToken()) !== null;
}

/**
 * The logged-in user profile (including role) is cached locally so that role
 * gating survives app restarts even though no `/auth/me` endpoint was provided.
 * Credentials themselves never live here — only the token store above.
 */
export async function getStoredUser(): Promise<AuthUser | null> {
  return getStoredJson<AuthUser>(STORAGE_KEYS.user);
}

export async function setStoredUser(user: AuthUser): Promise<void> {
  await setStoredJson(STORAGE_KEYS.user, user);
}

export async function clearStoredUser(): Promise<void> {
  await removeStoredJson(STORAGE_KEYS.user);
}
