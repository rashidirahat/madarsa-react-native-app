import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  addFunds,
  getExpenses,
  spendFunds,
} from '@/services/expenseService';
import { FundTransactionInput } from '@/types/models';

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: getExpenses,
  });
}

export function useFundMutations() {
  const queryClient = useQueryClient();

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['expenses'] }),
      queryClient.invalidateQueries({ queryKey: ['history'] }),
    ]);

  const add = useMutation({
    mutationFn: (input: FundTransactionInput) => addFunds(input),
    onSuccess: refresh,
  });

  const spend = useMutation({
    mutationFn: (input: FundTransactionInput) => spendFunds(input),
    onSuccess: refresh,
  });

  return { add, spend };
}
