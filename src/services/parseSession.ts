import { AuthSession, AuthUser, Role } from '@/types/models';

/**
 * Centralized parsing of the authentication API responses.
 *
 * The exact response shapes from the backend were not specified, so all
 * parsing lives here. To adapt to the real backend, adjust the helpers in
 * this file — nothing else in the app needs to change.
 */

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function asRole(value: unknown): Role | undefined {
  if (typeof value !== 'string') return undefined;
  const normalized = value.toLowerCase();
  if (normalized === 'admin' || normalized === 'user' || normalized === 'teacher') {
    return normalized;
  }
  return undefined;
}

function parseUser(raw: unknown): AuthUser {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  const user: AuthUser = {};
  if (obj._id) user.id = asString(obj._id);
  if (obj.id) user.id = asString(obj.id);
  if (obj.name) user.name = asString(obj.name);
  if (obj.email) user.email = asString(obj.email);
  if (obj.role) user.role = asRole(obj.role);
  return user;
}

function unwrapTopLevel(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {};
  const obj = raw as Record<string, unknown>;
  // { success, message, data: {...} }
  if (obj.data && typeof obj.data === 'object') {
    return obj.data as Record<string, unknown>;
  }
  // { tokens: {...}, user: {...} }
  if (obj.tokens && typeof obj.tokens === 'object' && obj.user) {
    return { ...(obj.tokens as Record<string, unknown>), user: obj.user };
  }
  return obj;
}

function extractTokens(raw: Record<string, unknown>): { accessToken?: string; refreshToken?: string } {
  const accessToken =
    asString(raw.accessToken) ??
    asString(raw.access_token) ??
    asString(raw.token) ??
    (raw.tokens && typeof raw.tokens === 'object'
      ? asString((raw.tokens as Record<string, unknown>).accessToken) ??
        asString((raw.tokens as Record<string, unknown>).access_token)
      : undefined);
  const refreshToken =
    asString(raw.refreshToken) ??
    asString(raw.refresh_token) ??
    (raw.tokens && typeof raw.tokens === 'object'
      ? asString((raw.tokens as Record<string, unknown>).refreshToken) ??
        asString((raw.tokens as Record<string, unknown>).refresh_token)
      : undefined);
  return { accessToken, refreshToken };
}

function extractUser(raw: Record<string, unknown>): AuthUser | undefined {
  if (raw.user) return parseUser(raw.user);
  if (raw.data && typeof raw.data === 'object') return parseUser(raw.data);
  const candidate: Record<string, unknown> = {};
  if (raw.name) candidate.name = raw.name;
  if (raw.email) candidate.email = raw.email;
  if (raw.role) candidate.role = raw.role;
  if (Object.keys(candidate).length > 0) return parseUser(candidate);
  return undefined;
}

/** Parses a login/signup response into a typed session. */
export function parseAuthSession(raw: unknown): AuthSession {
  const obj = unwrapTopLevel(raw);
  const { accessToken, refreshToken } = extractTokens(obj);
  const user = extractUser(obj) ?? {};

  if (!accessToken) {
    throw new Error(
      'The authentication response did not include an access token. Update parseAuthSession in src/services/parseSession.ts to match the API response shape.'
    );
  }

  return {
    accessToken,
    refreshToken: refreshToken ?? '',
    user,
  };
}

/** Parses a refresh-token response. Returns just the new access token. */
export function parseRefreshResponse(raw: unknown): { accessToken: string; refreshToken?: string } {
  const obj = unwrapTopLevel(raw);
  const { accessToken, refreshToken } = extractTokens(obj);
  if (!accessToken) {
    throw new Error(
      'The refresh-token response did not include an access token. Update parseRefreshResponse in src/services/parseSession.ts to match the API response shape.'
    );
  }
  return { accessToken, refreshToken };
}
