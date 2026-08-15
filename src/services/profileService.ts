import { getStoredJson, removeStoredJson, setStoredJson, STORAGE_KEYS } from '@/utils/storage';
import { Profile } from '@/types/models';
import { ProfileApiUnavailableError } from '@/api/errors';

/**
 * Profile service — intentionally isolated placeholder.
 *
 * The API does not document a profile update/upload endpoint, so the profile
 * screen persists photo and name locally via the storage helpers below.
 * To wire a real backend later, implement `updateProfileName` and
 * `uploadProfilePhoto` here (and set PROFILE_API_SUPPORTED = true); the UI
 * already calls them and falls back gracefully.
 */
export const PROFILE_API_SUPPORTED = false;

const PROFILE_KEY = STORAGE_KEYS.profile;

export async function getLocalProfile(): Promise<Profile | null> {
  return getStoredJson<Profile>(PROFILE_KEY);
}

export async function saveLocalProfile(profile: Profile): Promise<Profile> {
  await setStoredJson(PROFILE_KEY, profile);
  return profile;
}

export async function clearLocalProfile(): Promise<void> {
  await removeStoredJson(PROFILE_KEY);
}

export async function updateProfileName(input: { name: string }): Promise<Profile> {
  void input;
  throw new ProfileApiUnavailableError();
}

export async function uploadProfilePhoto(_uri: string): Promise<{ photoUrl?: string }> {
  throw new ProfileApiUnavailableError();
}
