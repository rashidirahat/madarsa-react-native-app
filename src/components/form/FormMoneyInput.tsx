import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { MoneyInput, MoneyInputProps } from '@/components/MoneyInput';

interface FormMoneyInputProps<T extends FieldValues> extends Omit<MoneyInputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
}

export function FormMoneyInput<T extends FieldValues>({ control, name, ...moneyInputProps }: FormMoneyInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <MoneyInput
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
          {...moneyInputProps}
        />
      )}
    />
  );
}
