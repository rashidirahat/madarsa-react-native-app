import { apiFetch } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { unwrapData } from '@/api/response';
import { DonationInput, DonationRecord, DonationTotals } from '@/types/models';

function asNumber(value: unknown): number {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : 0;
}

function parseRecords(value: unknown): DonationRecord[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is DonationRecord =>
      !!item && typeof item === 'object' && 'amount' in item
  );
}

export async function getDonationTotals(): Promise<DonationTotals> {
  const raw = await apiFetch(ENDPOINTS.donations.totals);
  const data = unwrapData<Partial<DonationTotals> | null>(raw);
  const source = data && typeof data === 'object' ? data : {};
  const totals: DonationTotals = {
    year: typeof source.year === 'number' ? source.year : undefined,
    zakat: asNumber(source.zakat),
    sadaqah: asNumber(source.sadaqah),
    total: asNumber(source.total),
    records: parseRecords(source.records),
  };
  if (!totals.total) {
    totals.total = totals.zakat + totals.sadaqah;
  }
  return totals;
}

export async function createDonation(input: DonationInput): Promise<DonationRecord | undefined> {
  const raw = await apiFetch(ENDPOINTS.donations.create, {
    method: 'POST',
    body: {
      amount: input.amount,
      category: input.category,
      year: input.year,
      description: input.description,
    },
  });
  const data = unwrapData<unknown>(raw);
  if (data && typeof data === 'object' && 'amount' in data) {
    return data as DonationRecord;
  }
  return undefined;
}
