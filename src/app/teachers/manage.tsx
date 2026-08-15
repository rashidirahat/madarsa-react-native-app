import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
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
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { FormDateField } from '@/components/form/FormDateField';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextField } from '@/components/form/FormTextField';
import { LoadingState } from '@/components/LoadingState';
import { RequireAuth } from '@/components/RequireAuth';
import { Screen } from '@/components/Screen';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/context/ToastProvider';
import { useTeacher, useTeacherMutations } from '@/hooks/useTeacher';
import { useTheme } from '@/theme/ThemeProvider';
import {
  TEACHER_GENDERS,
  TEACHER_SUBJECTS,
  TEACHER_SUBJECT_OPTIONS,
  TeacherInput,
} from '@/types/models';
import { teacherSchema, TeacherFormValues } from '@/utils/validation';

const EMPTY: TeacherFormValues = {
  name: '',
  address: '',
  qualification: '',
  specialization: 'Urdu',
  teachingExperience: '',
  gender: 'male',
  joiningDate: '',
  subjects: [{ subject: 'Urdu', className: '' }],
};

export default function ManageTeacherScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const isEditing = !!id;
  const [confirmRemove, setConfirmRemove] = useState(false);

  const teacherQuery = useTeacher(isEditing ? id : undefined);
  const { create, update } = useTeacherMutations();
  const { control, handleSubmit, reset, formState } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: EMPTY,
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'subjects' });

  useEffect(() => {
    const data = teacherQuery.data;
    if (data) {
      const isTeacherSubject = (
        v: string
      ): v is TeacherFormValues['subjects'][number]['subject'] =>
        (TEACHER_SUBJECTS as readonly string[]).includes(v);
      reset({
        name: data.name,
        address: data.address,
        qualification: data.qualification,
        specialization: isTeacherSubject(data.specialization) ? data.specialization : 'Urdu',
        teachingExperience: String(data.teachingExperience ?? ''),
        gender: data.gender === 'female' || data.gender === 'other' ? data.gender : 'male',
        joiningDate: data.joiningDate ?? '',
        subjects: (
          Array.isArray(data.subjects) && data.subjects.length > 0
            ? data.subjects
            : [{ subject: 'Urdu', className: '' }]
        ).map((s) => ({
          subject: isTeacherSubject(s.subject) ? s.subject : 'Urdu',
          className: s.className,
        })),
      });
    }
  }, [teacherQuery.data, reset]);

  const handleRemove = (index: number) => {
    if (fields.length <= 1) {
      setConfirmRemove(true);
    } else {
      remove(index);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    const input: TeacherInput = {
      name: values.name,
      address: values.address,
      qualification: values.qualification,
      specialization: values.specialization,
      teachingExperience: Number(values.teachingExperience),
      gender: values.gender,
      status: isEditing && teacherQuery.data ? teacherQuery.data.status : 'active',
      joiningDate: values.joiningDate || undefined,
      subjects: values.subjects,
    };
    try {
      if (isEditing && id) {
        await update.mutateAsync({ id, input });
      } else {
        await create.mutateAsync(input);
      }
      toast.success(isEditing ? 'Teacher updated' : 'Teacher created');
      router.back();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  if (!isAdmin) {
    return <Redirect href="/" />;
  }

  if (isEditing && teacherQuery.isLoading) {
    return (
      <RequireAuth>
        <Screen>
          <LoadingState label="Loading teacher…" />
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
                {isEditing ? 'Edit teacher' : 'Add teacher'}
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
              <FormTextField control={control} name="name" label="Full name" placeholder="Teacher name" autoCapitalize="words" />
              <FormTextField control={control} name="qualification" label="Qualification" placeholder="e.g. Hafiz" autoCapitalize="words" />
              <FormSelect
                control={control}
                name="specialization"
                label="Specialization"
                options={TEACHER_SUBJECT_OPTIONS}
              />
              <FormTextField control={control} name="teachingExperience" label="Teaching experience (years)" placeholder="e.g. 8" keyboardType="number-pad" />
              <FormSelect
                control={control}
                name="gender"
                label="Gender"
                options={TEACHER_GENDERS.map((g) => ({ label: g.label, value: g.value }))}
              />
              <FormDateField
                control={control}
                name="joiningDate"
                label="Joining date"
                placeholder="Select joining date"
                maximumDate={new Date()}
              />
            </Card>

            <Card style={styles.card} elevated>
              <FormTextField control={control} name="address" label="Address" placeholder="Address" multiline numberOfLines={2} style={styles.multiline} />
            </Card>

            <Card style={styles.card} elevated>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                Subjects &amp; classes
              </Text>
              {fields.map((field, index) => (
                <View key={field.id} style={styles.subjectRow}>
                  <View style={styles.subjectFields}>
                    <FormSelect
                      control={control}
                      name={`subjects.${index}.subject` as const}
                      label="Subject"
                      options={TEACHER_SUBJECT_OPTIONS}
                    />
                    <FormTextField
                      control={control}
                      name={`subjects.${index}.className` as const}
                      label="Class name"
                      placeholder="e.g. 12-B"
                      autoCapitalize="characters"
                    />
                  </View>
                  <Pressable
                    onPress={() => handleRemove(index)}
                    hitSlop={8}
                    accessibilityLabel={`Remove subject ${index + 1}`}
                    style={styles.removeButton}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                </View>
              ))}
              <Button
                title="Add subject"
                icon="add"
                variant="outline"
                onPress={() => append({ subject: 'Urdu', className: '' })}
              />
            </Card>

            <Button
              title={isEditing ? 'Save changes' : 'Create teacher'}
              onPress={onSubmit}
              loading={formState.isSubmitting}
              fullWidth
              style={styles.submit}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </Screen>

      <ConfirmDialog
        visible={confirmRemove}
        title="Keep at least one subject"
        message="A teacher must have at least one subject and class assignment, so the last one cannot be removed."
        confirmLabel="Got it"
        onConfirm={() => setConfirmRemove(false)}
        onCancel={() => setConfirmRemove(false)}
      />
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  subjectFields: {
    flex: 1,
    gap: 14,
  },
  removeButton: {
    marginTop: 24,
    padding: 6,
  },
  submit: {
    marginTop: 6,
  },
});
