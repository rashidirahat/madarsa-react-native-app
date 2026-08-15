import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getErrorMessage } from '@/api/errors';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextField } from '@/components/form/FormTextField';
import { LoadingState } from '@/components/LoadingState';
import { RequireAuth } from '@/components/RequireAuth';
import { Screen } from '@/components/Screen';
import { useToast } from '@/context/ToastProvider';
import { useAuth } from '@/context/AuthProvider';
import { useStudent, useStudentMutations } from '@/hooks/useStudent';
import { useTheme } from '@/theme/ThemeProvider';
import { CLASS_OPTIONS, GENDERS, STUDENT_TYPES, StudentInput } from '@/types/models';
import { studentSchema, StudentFormValues } from '@/utils/validation';

const EMPTY: StudentFormValues = {
  name: '',
  age: '',
  className: 'Qaida',
  studentType: 'day',
  gender: 'male',
  guardianName: '',
  address: '',
  phone: '',
};

export default function ManageStudentScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const isEditing = !!id;

  const studentQuery = useStudent(isEditing ? id : undefined);
  const { create, update } = useStudentMutations();
  const { control, handleSubmit, reset, formState } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    const data = studentQuery.data;
    if (data) {
      reset({
        name: data.name,
        age: String(data.age ?? ''),
        className: data.className as StudentFormValues['className'],
        studentType: data.studentType,
        gender: (data.gender as StudentFormValues['gender']) ?? 'male',
        guardianName: data.guardianName,
        address: data.address,
        phone: data.phone,
      });
    }
  }, [studentQuery.data, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const input: StudentInput = {
      name: values.name,
      age: Number(values.age),
      className: values.className,
      studentType: values.studentType,
      gender: values.gender,
      guardianName: values.guardianName,
      address: values.address,
      phone: values.phone,
    };
    try {
      if (isEditing && id) {
        await update.mutateAsync({ id, input });
      } else {
        await create.mutateAsync(input);
      }
      toast.success(isEditing ? 'Student updated' : 'Student created');
      router.back();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  if (!isAdmin) {
    return <Redirect href="/" />;
  }

  if (isEditing && studentQuery.isLoading) {
    return (
      <RequireAuth>
        <Screen>
          <LoadingState label="Loading student…" />
        </Screen>
      </RequireAuth>
    );
  }

  return (
    <RequireAuth>
      <Screen padded={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex}
        >
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Pressable onPress={() => router.back()} hitSlop={8} accessibilityLabel="Close">
                <Ionicons name="close" size={26} color={colors.textPrimary} />
              </Pressable>
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                {isEditing ? 'Edit student' : 'Add student'}
              </Text>
            </View>
            <Button
              title={formState.isSubmitting ? 'Saving…' : 'Save'}
              onPress={onSubmit}
              loading={formState.isSubmitting}
              disabled={update.isPending || create.isPending}
            />
          </View>

          <ScrollView
            contentContainerStyle={styles.form}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Card style={styles.card} elevated>
              <FormTextField control={control} name="name" label="Full name" placeholder="Student name" autoCapitalize="words" />
              <FormTextField control={control} name="age" label="Age" placeholder="e.g. 12" keyboardType="number-pad" />
              <FormSelect
                control={control}
                name="className"
                label="Class"
                options={CLASS_OPTIONS.map((c) => ({ label: c, value: c }))}
              />
              <FormSelect
                control={control}
                name="studentType"
                label="Student type"
                options={STUDENT_TYPES.map((t) => ({ label: t.label, value: t.value }))}
              />
              <FormSelect
                control={control}
                name="gender"
                label="Gender"
                options={GENDERS.map((g) => ({ label: g.label, value: g.value }))}
              />
            </Card>

            <Card style={styles.card} elevated>
              <FormTextField control={control} name="guardianName" label="Guardian name" placeholder="Guardian / parent" autoCapitalize="words" />
              <FormTextField control={control} name="address" label="Address" placeholder="Address" multiline numberOfLines={2} style={styles.multiline} />
              <FormTextField control={control} name="phone" label="Phone" placeholder="Phone number" keyboardType="phone-pad" />
            </Card>

            <Button
              title={isEditing ? 'Save changes' : 'Create student'}
              onPress={onSubmit}
              loading={formState.isSubmitting}
              fullWidth
              style={styles.submit}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </Screen>
    </RequireAuth>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  form: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 14,
  },
  card: {
    gap: 14,
  },
  multiline: {
    minHeight: 56,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  submit: {
    marginTop: 6,
  },
});
