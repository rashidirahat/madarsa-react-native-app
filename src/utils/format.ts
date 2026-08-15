import { HistoryRecord } from '@/types/models';

export function formatCurrency(amount: number): string {
  const value = Number.isFinite(amount) ? amount : 0;
  const formatted = value.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  return `₹${formatted}`;
}

export function formatDate(input?: string | number | Date | null): string {
  if (!input) return '';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(input?: string | number | Date | null): string {
  if (!input) return '';
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function initials(name?: string | null): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function capitalize(value?: string | null): string {
  if (!value) return '';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function displayStudentType(value?: string | null): string {
  if (!value) return '—';
  return value === 'day' ? 'Day' : value === 'hostel' ? 'Hostel' : capitalize(value);
}

export function displayGender(value?: string | null): string {
  if (!value) return '—';
  return value === 'male' ? 'Male' : value === 'female' ? 'Female' : capitalize(value);
}

export function displayTeacherStatus(value?: string | null): string {
  if (!value) return '—';
  return value === 'active' ? 'Active' : value === 'inactive' ? 'Inactive' : capitalize(value);
}

export function displayRole(value?: string | null): string {
  if (!value) return '—';
  return capitalize(value);
}

export function isFundAction(action: string): boolean {
  return action === 'ADD_FUND' || action === 'SPEND_FUND';
}

export function isPositiveAction(action: string): boolean {
  return action === 'ADD_FUND' || action === 'CREATE';
}

export function displayAmountForRecord(record: HistoryRecord): string | null {
  // console.log('displayAmountForRecord record:', record.action, record.after?.amount);
  const amount = record.after?.amount;
  if (typeof amount !== 'number' || !Number.isFinite(amount)) return null;
  return formatCurrency(Math.abs(amount));
}

export function recordActor(record: HistoryRecord): string | null {
  const name = record.userName;
  const email = record.email;
  const role = record.role;
  if (!name && !email) return null;
  const parts: string[] = [];
  if (name) parts.push(name);
  if (role) parts.push(`(${displayRole(role)})`);
  if (email) parts.push(email);
  return parts.join(' ');
}

export function recordTime(record: HistoryRecord): string {
  return formatDateTime(record.createdAt ?? record.date ?? record.timestamp);
}

export function getChangedFields(
  record: HistoryRecord
): { field: string; before: unknown; after: unknown }[] {
  if (record.changes && typeof record.changes === 'object') {
    return Object.entries(record.changes).map(([field, change]) => {
      const c = (change ?? {}) as { before?: unknown; after?: unknown };
      return { field, before: c.before, after: c.after };
    });
  }

  if (record.before && record.after) {
    const keys = new Set([...Object.keys(record.before), ...Object.keys(record.after)]);
    const changed: { field: string; before: unknown; after: unknown }[] = [];
    for (const key of keys) {
      const before = record.before[key];
      const after = record.after[key];
      if (JSON.stringify(before) !== JSON.stringify(after)) {
        changed.push({ field: key, before, after });
      }
    }
    return changed;
  }

  return [];
}
