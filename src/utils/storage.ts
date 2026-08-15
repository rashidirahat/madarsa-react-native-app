import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = '@madarsa';

export const STORAGE_KEYS = {
  user: `${PREFIX}/user`,
  profile: `${PREFIX}/profile`,
  theme: `${PREFIX}/theme-mode`,
} as const;

export type StoredKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

export async function getStoredJson<T>(key: StoredKey): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setStoredJson(key: StoredKey, value: unknown): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeStoredJson(key: StoredKey): Promise<void> {
  await AsyncStorage.removeItem(key);
}
