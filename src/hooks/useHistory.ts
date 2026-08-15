import { useQuery } from '@tanstack/react-query';

import { getHistory } from '@/services/historyService';

export interface HistoryFilters {
  page?: number;
  limit?: number;
  enabled?: boolean;
}

export function useHistory({ page = 1, limit = 50, enabled = true }: HistoryFilters = {}) {
  return useQuery({
    queryKey: ['history', { page, limit }],
    queryFn: () => getHistory({ page, limit }),
    enabled,
    placeholderData: (previous) => previous,
  });
}
