import { useMemo } from 'react';

import { useHistory } from '@/hooks/useHistory';
import { AuthUser } from '@/types/models';

/**
 * Sums the current user's ADD_FUND history records.
 *
 * Assumption: history records carry an `amount` and identify the actor via
 * `userName` / `email`. The sum is computed from the records currently loaded
 * (first page of history).
 */
export function useContribution(user: AuthUser | null) {
  const history = useHistory({ page: 1, limit: 100, enabled: !!user });

  return useMemo(() => {
    const records = history.data?.records ?? [];
    const email = user?.email?.toLowerCase();
    const name = user?.name?.toLowerCase();
    let total = 0;
    let count = 0;
    for (const record of records) {
      if (record.action !== 'ADD_FUND') continue;
      const actorEmail = record.email?.toLowerCase();
      const actorName = record.userName?.toLowerCase();
      const matches =
        (email && actorEmail && actorEmail === email) ||
        (name && actorName && actorName === name) ||
        (!email && !name);
      if (matches && typeof record.amount === 'number') {
        total += record.amount;
        count += 1;
      }
    }
    return { total, count, loaded: records.length > 0 || history.isSuccess };
  }, [history.data, user, history.isSuccess]);
}
