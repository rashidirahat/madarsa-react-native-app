import { API_BASE_URL, ENDPOINTS } from './endpoints';
import { ApiError, NetworkError, extractServerMessage } from './errors';
import { parseRefreshResponse } from '@/services/parseSession';
import { clearTokens, getAccessToken, getRefreshToken, setAccessToken, setTokens } from '@/stores/tokenStore';

export interface ApiClientOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  auth?: boolean;
  headers?: Record<string, string>;
}

type SessionExpiredHandler = () => void;

let sessionExpiredHandler: SessionExpiredHandler | null = null;

/**
 * Register a callback that fires when the session can no longer be refreshed.
 * The AuthProvider registers this to clear state and route back to login.
 * Returns an unsubscribe function.
 */
export function onSessionExpired(handler: SessionExpiredHandler): () => void {
  sessionExpiredHandler = handler;
  return () => {
    if (sessionExpiredHandler === handler) {
      sessionExpiredHandler = null;
    }
  };
}

function notifySessionExpired(): void {
  sessionExpiredHandler?.();
}

function buildUrl(path: string, query?: ApiClientOptions['query']): string {
  const base = `${API_BASE_URL}${path}`;
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

async function doFetch(
  url: string,
  options: ApiClientOptions,
  accessToken: string | null
): Promise<Response> {
  const { method = 'GET', body, headers: extraHeaders = {}, auth = true } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  if (auth && accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const requestInit: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    requestInit.body = JSON.stringify(body);
  }

  let response: Response;
  try {
    response = await fetch(url, requestInit);
  } catch (error) {
    throw new NetworkError(undefined, error);
  }
  return response;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (response.ok) {
    if (response.status === 204) {
      return undefined as T;
    }
    return json as T;
  }

  const message = extractServerMessage(json) ?? `Request failed with status ${response.status}`;
  throw new ApiError(message, {
    status: response.status,
    data: json,
  });
}

let refreshPromise: Promise<boolean> | null = null;

/**
 * Attempts to refresh the access token. Single-flight: concurrent callers share
 * one refresh request. Returns true when a new token was stored.
 */
async function tryRefreshSession(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        return false;
      }

      const url = `${API_BASE_URL}${ENDPOINTS.auth.refreshToken}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        await clearTokens();
        return false;
      }

      const json = await response.json();
      const { accessToken, refreshToken: nextRefreshToken } = parseRefreshResponse(json);

      if (nextRefreshToken) {
        await setTokens(accessToken, nextRefreshToken);
      } else {
        await setAccessToken(accessToken);
      }
      return true;
    } catch {
      await clearTokens().catch(() => undefined);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Typed API client.
 * - Attaches `Authorization: Bearer <accessToken>` and `Content-Type: application/json`.
 * - On a 401 it attempts one refresh-token round trip and retries the request.
 * - On refresh failure it clears the session and notifies the app to return to login.
 */
export async function apiFetch<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  const { method = 'GET', body, query, auth = true } = options;
  const url = buildUrl(path, query);

  const accessToken = auth ? await getAccessToken() : null;
  let response = await doFetch(url, { method, body, query, auth }, accessToken);

  if (response.status === 401 && auth) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      const newToken = await getAccessToken();
      response = await doFetch(url, { method, body, query, auth }, newToken);
    } else {
      await clearTokens().catch(() => undefined);
      notifySessionExpired();
      throw new ApiError('Your session has expired. Please sign in again.', { status: 401 });
    }
  }

  return parseResponse<T>(response);
}
