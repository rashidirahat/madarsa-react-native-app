interface ApiErrorOptions {
  status?: number;
  code?: string;
  data?: unknown;
}

export class ApiError extends Error {
  status?: number;
  code?: string;
  data?: unknown;

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code;
    this.data = options.data;
  }
}

export class NetworkError extends Error {
  cause?: unknown;

  constructor(message = 'Unable to reach the server. Check your connection and try again.', cause?: unknown) {
    super(message);
    this.name = 'NetworkError';
    this.cause = cause;
  }
}

export class SessionExpiredError extends Error {
  constructor(message = 'Your session has expired. Please sign in again.') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}

export class UserListUnavailableError extends Error {
  constructor() {
    super('The user list endpoint is not configured on this server.');
    this.name = 'UserListUnavailableError';
  }
}

export class ProfileApiUnavailableError extends Error {
  constructor() {
    super('The profile API endpoint is not configured on this server.');
    this.name = 'ProfileApiUnavailableError';
  }
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Something went wrong. Please try again.';
}

export function extractServerMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const obj = payload as Record<string, unknown>;
  if (typeof obj.message === 'string' && obj.message.trim()) {
    return obj.message;
  }
  if (typeof obj.error === 'string' && obj.error.trim()) {
    return obj.error;
  }
  if (obj.error && typeof obj.error === 'object') {
    const errObj = obj.error as Record<string, unknown>;
    if (typeof errObj.message === 'string' && errObj.message.trim()) {
      return errObj.message;
    }
  }
  return null;
}
