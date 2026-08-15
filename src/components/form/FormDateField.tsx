import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { DateField, DateFieldProps } from '@/components/DateField';

interface FormDateFieldProps<T extends FieldValues>
  extends Omit<DateFieldProps, 'value' | 'onChange'> {
  control: Control<T>;
  name: Path<T>;
}

export function FormDateField<T extends FieldValues>({
  control,
  name,
  ...dateFieldProps
}: FormDateFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <DateField
          value={field.value}
          onChange={field.onChange}
          error={fieldState.error?.message}
          {...dateFieldProps}
        />
      )}
    />
  );
}
