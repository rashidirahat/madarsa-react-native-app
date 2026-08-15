import { Control, Controller, FieldValues, Path } from 'react-hook-form';

import { TextField, TextFieldProps } from '@/components/TextField';

interface FormTextFieldProps<T extends FieldValues> extends Omit<TextFieldProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
}

export function FormTextField<T extends FieldValues>({ control, name, ...textFieldProps }: FormTextFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
          {...textFieldProps}
        />
      )}
    />
  );
}
