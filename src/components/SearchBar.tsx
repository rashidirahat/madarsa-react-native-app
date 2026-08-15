import { TextField, TextFieldProps } from '@/components/TextField';

export function SearchBar(props: TextFieldProps) {
  return <TextField leftIcon="search" autoCapitalize="none" autoCorrect={false} {...props} />;
}
