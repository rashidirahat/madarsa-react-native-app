import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createDonation, getDonationTotals } from '@/services/donationService';
import { DonationInput } from '@/types/models';

export interface DonationTotalsFilters {
  enabled?: boolean;
}

export function useDonationTotals({ enabled = true }: DonationTotalsFilters = {}) {
  return useQuery({
    queryKey: ['donation-totals'],
    queryFn: getDonationTotals,
    enabled,
  });
}

export function useCreateDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DonationInput) => createDonation(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donation-totals'] });
    },
  });
}
