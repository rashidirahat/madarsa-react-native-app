import { apiFetch } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import { unwrapData } from '@/api/response';
import { ExpenseBalance, FundTransactionInput } from '@/types/models';

export async function getExpenses(): Promise<ExpenseBalance> {
  const raw = await apiFetch(ENDPOINTS.expenses.get);
  const data = unwrapData<Partial<ExpenseBalance> | number | null>(raw);
  if (typeof data === 'number') {
    return { currentAmount: data };
  }
  if (data && typeof data === 'object') {
    return { currentAmount: Number(data.currentAmount ?? 0) };
  }
  return { currentAmount: 0 };
}

export async function addFunds(input: FundTransactionInput): Promise<ExpenseBalance> {
  const raw = await apiFetch(ENDPOINTS.expenses.add, {
    method: 'POST',
    body: input,
  });
  return parseBalanceResponse(raw);
}

export async function spendFunds(input: FundTransactionInput): Promise<ExpenseBalance> {
  const raw = await apiFetch(ENDPOINTS.expenses.spend, {
    method: 'POST',
    body: input,
  });
  return parseBalanceResponse(raw);
}

function parseBalanceResponse(raw: unknown): ExpenseBalance {
  const data = unwrapData<Partial<ExpenseBalance> | null>(raw);
  if (data && typeof data === 'object') {
    return { currentAmount: Number(data.currentAmount ?? 0) };
  }
  return { currentAmount: 0 };
}
