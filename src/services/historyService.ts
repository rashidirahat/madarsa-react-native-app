import { apiFetch } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { parseHistoryPage } from '@/api/response';
import { HistoryPage } from '@/types/models';

export interface HistoryQuery {
  page?: number;
  limit?: number;
}

export async function getHistory(params: HistoryQuery = {}): Promise<HistoryPage> {
  const raw = await apiFetch(ENDPOINTS.history.list, {
    query: { page: params.page, limit: params.limit },
  });
  return parseHistoryPage(raw);
}
