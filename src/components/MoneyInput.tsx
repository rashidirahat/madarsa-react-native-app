import { TextField, TextFieldProps } from '@/components/TextField';

export interface MoneyInputProps extends Omit<TextFieldProps, 'value' | 'onChangeText'> {
  value: string;
  onChangeText: (text: string) => void;
}

/** Sanitizes input to a non-negative decimal with at most 2 fraction digits. */
export function sanitizeAmount(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  const intPart = parts[0];
  const fracPart = parts[1];
  if (fracPart !== undefined) {
    return `${intPart}.${fracPart.slice(0, 2)}`;
  }
  return intPart;
}

export function parseAmount(value: string): number {
  const number = Number.parseFloat(value);
  return Number.isFinite(number) ? number : 0;
}

export function MoneyInput({ value, onChangeText, ...props }: MoneyInputProps) {
  return (
    <TextField
      value={value}
      onChangeText={(text) => onChangeText(sanitizeAmount(text))}
      leftIcon="cash-outline"
      keyboardType="decimal-pad"
      placeholder="0.00"
      {...props}
    />
  );
}
