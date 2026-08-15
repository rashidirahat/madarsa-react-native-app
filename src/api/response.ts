import { PageData } from '@/types/api';
import { HistoryPage, HistoryRecord } from '@/types/models';

/**
 * API responses are commonly wrapped as `{ success: true, data: ... }`.
 * Some endpoints return the payload directly. This helper normalizes both.
 */
export function unwrapData<T>(json: unknown): T {
  if (json && typeof json === 'object' && 'data' in json) {
    return (json as { data: T }).data;
  }
  return json as T;
}

export function parsePage<T>(json: unknown): { records: T[]; page?: number; pages?: number; limit?: number; total?: number } {
  const data = unwrapData<PageData<T> | T[]>(json);
  if (Array.isArray(data)) {
    return { records: data };
  }
  const records = Array.isArray(data?.records) ? data.records : Array.isArray(data?.items) ? data.items : [];
  return {
    records,
    page: data?.page,
    pages: data?.pages,
    limit: data?.limit,
    total: data?.total,
  };
}

export function parseHistoryPage(json: unknown): HistoryPage {
  const { records, page, pages, limit, total } = parsePage<HistoryRecord>(json);
  return {
    records,
    page,
    pages,
    limit,
    total,
    hasMore: typeof pages === 'number' ? (page ?? 1) < pages : false,
  };
}
