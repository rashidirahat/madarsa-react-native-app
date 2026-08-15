import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { Select, SelectProps } from '@/components/Select';

interface FormSelectProps<T extends FieldValues> extends Omit<SelectProps, 'value' | 'onChange'> {
  control: Control<T>;
  name: Path<T>;
}

export function FormSelect<T extends FieldValues>({ control, name, ...selectProps }: FormSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Select
          value={field.value}
          onChange={field.onChange}
          error={fieldState.error?.message}
          {...selectProps}
        />
      )}
    />
  );
}
