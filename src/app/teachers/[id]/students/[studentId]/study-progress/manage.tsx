import { zodResolver } from '@hookform/resolvers/zod';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
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
import { EmptyState } from '@/components/EmptyState';
import { FormSelect } from '@/components/form/FormSelect';
import { FormTextField } from '@/components/form/FormTextField';
import { LoadingState } from '@/components/LoadingState';
import { RequireAuth } from '@/components/RequireAuth';
import { Screen } from '@/components/Screen';
import { useToast } from '@/context/ToastProvider';
import {
  mergeStudyProgressRecords,
  useAssignedStudent,
  useStudentStudyProgress,
  useStudyProgressMutations,
} from '@/hooks/useTeacherAssignment';
import { useAuth } from '@/context/AuthProvider';
import { useTheme } from '@/theme/ThemeProvider';
import {
  STUDY_PROGRESS_STATUS_OPTIONS,
  StudyProgressInput,
} from '@/types/models';
import { studyProgressSchema, StudyProgressFormValues } from '@/utils/validation';

const EMPTY: StudyProgressFormValues = {
  subject: '',
  topic: '',
  status: 'not_started',
  progressPercentage: '',
  notes: '',
};

export default function ManageStudyProgressScreen() {
  const { id, studentId, studyProgressId } = useLocalSearchParams<{
    id: string;
    studentId: string;
    studyProgressId?: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const isEditing = !!studyProgressId;

  const { data: student, isLoading: studentLoading } = useAssignedStudent(id, studentId);
  const localProgress = useStudentStudyProgress(id, studentId);
  const { create, update } = useStudyProgressMutations(id, studentId);

  const progress = useMemo(
    () => mergeStudyProgressRecords(student?.studyProgress, localProgress.data),
    [student?.studyProgress, localProgress.data]
  );

  const record = isEditing
    ? progress.find((p) => (p._id ?? p.studyProgressId ?? p.id) === studyProgressId)
    : undefined;

  const { control, handleSubmit, reset, formState } = useForm<StudyProgressFormValues>({
    resolver: zodResolver(studyProgressSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!record) return;
    reset({
      subject: record.subject ?? '',
      topic: record.topic ?? '',
      status: record.status ?? 'not_started',
      progressPercentage: String(record.progressPercentage ?? ''),
      notes: record.notes ?? '',
    });
  }, [record, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const input: StudyProgressInput = {
      subject: values.subject,
      topic: values.topic,
      status: values.status,
      progressPercentage: Number(values.progressPercentage),
      notes: values.notes || undefined,
    };
    try {
      if (isEditing && studyProgressId) {
        await update.mutateAsync({ studyProgressId, input });
      } else {
        await create.mutateAsync(input);
      }
      toast.success(isEditing ? 'Study progress updated' : 'Study progress added');
      router.back();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  if (!isAdmin) {
    return <Redirect href="/" />;
  }

  if (isEditing && !record && !studentLoading && !localProgress.isLoading) {
    return (
      <RequireAuth>
        <Screen>
          <EmptyState
            icon="analytics-outline"
            title="Study progress not found"
            message="This study progress entry could not be located. It may have been created in a previous session."
            actionLabel="Go back"
            onAction={() => router.back()}
          />
        </Screen>
      </RequireAuth>
    );
  }

  if (isEditing && !record) {
    return (
      <RequireAuth>
        <Screen>
          <LoadingState label="Loading study progress…" />
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
                {isEditing ? 'Edit study progress' : 'Add study progress'}
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
              <FormTextField
                control={control}
                name="subject"
                label="Subject"
                placeholder="e.g. Mathematics"
                autoCapitalize="words"
              />
              <FormTextField
                control={control}
                name="topic"
                label="Topic"
                placeholder="e.g. Algebra"
                autoCapitalize="words"
              />
              <FormSelect
                control={control}
                name="status"
                label="Status"
                options={STUDY_PROGRESS_STATUS_OPTIONS}
              />
              <FormTextField
                control={control}
                name="progressPercentage"
                label="Progress (%)"
                placeholder="0 – 100"
                keyboardType="number-pad"
              />
              <FormTextField
                control={control}
                name="notes"
                label="Notes"
                placeholder="Optional notes"
                multiline
                numberOfLines={3}
                style={styles.multiline}
              />
            </Card>

            <Button
              title={isEditing ? 'Save changes' : 'Add study progress'}
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
    minHeight: 64,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  submit: {
    marginTop: 6,
  },
});
