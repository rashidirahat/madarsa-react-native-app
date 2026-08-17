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
import { FormDateField } from '@/components/form/FormDateField';
import { FormTextField } from '@/components/form/FormTextField';
import { LoadingState } from '@/components/LoadingState';
import { RequireAuth } from '@/components/RequireAuth';
import { Screen } from '@/components/Screen';
import { useToast } from '@/context/ToastProvider';
import {
  mergeExamRecords,
  useAssignedStudent,
  useExamMutations,
  useStudentExams,
} from '@/hooks/useTeacherAssignment';
import { useAuth } from '@/context/AuthProvider';
import { useTheme } from '@/theme/ThemeProvider';
import { ExamInput } from '@/types/models';
import { examSchema, ExamFormValues } from '@/utils/validation';

const EMPTY: ExamFormValues = {
  examName: '',
  subject: '',
  examDate: '',
  totalMarks: '',
  obtainedMarks: '',
  grade: '',
  remarks: '',
};

export default function ManageExamScreen() {
  const { id, studentId, examId } = useLocalSearchParams<{
    id: string;
    studentId: string;
    examId?: string;
  }>();
  const router = useRouter();
  const { colors } = useTheme();
  const toast = useToast();
  const { isAdmin } = useAuth();
  const isEditing = !!examId;

  const { data: student, isLoading: studentLoading } = useAssignedStudent(id, studentId);
  const localExams = useStudentExams(id, studentId);
  const { create, update } = useExamMutations(id, studentId);

  const exams = useMemo(
    () => mergeExamRecords(student?.exams, localExams.data),
    [student?.exams, localExams.data]
  );

  const exam = isEditing
    ? exams.find((e) => (e._id ?? e.examId ?? e.id) === examId)
    : undefined;

  const { control, handleSubmit, reset, formState } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!exam) return;
    reset({
      examName: exam.examName ?? '',
      subject: exam.subject ?? '',
      examDate: exam.examDate ?? '',
      totalMarks: String(exam.totalMarks ?? ''),
      obtainedMarks: String(exam.obtainedMarks ?? ''),
      grade: exam.grade ?? '',
      remarks: exam.remarks ?? '',
    });
  }, [exam, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const input: ExamInput = {
      examName: values.examName,
      subject: values.subject,
      examDate: values.examDate,
      totalMarks: Number(values.totalMarks),
      obtainedMarks: Number(values.obtainedMarks),
      grade: values.grade || undefined,
      remarks: values.remarks || undefined,
    };
    try {
      if (isEditing && examId) {
        await update.mutateAsync({ examId, input });
      } else {
        await create.mutateAsync(input);
      }
      toast.success(isEditing ? 'Exam updated' : 'Exam added');
      router.back();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  if (!isAdmin) {
    return <Redirect href="/" />;
  }

  if (isEditing && !exam && !studentLoading && !localExams.isLoading) {
    return (
      <RequireAuth>
        <Screen>
          <EmptyState
            icon="document-text-outline"
            title="Exam not found"
            message="This exam could not be located. It may have been created in a previous session."
            actionLabel="Go back"
            onAction={() => router.back()}
          />
        </Screen>
      </RequireAuth>
    );
  }

  if (isEditing && !exam) {
    return (
      <RequireAuth>
        <Screen>
          <LoadingState label="Loading exam…" />
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
                {isEditing ? 'Edit exam' : 'Add exam'}
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
                name="examName"
                label="Exam name"
                placeholder="e.g. Midterm"
                autoCapitalize="words"
              />
              <FormTextField
                control={control}
                name="subject"
                label="Subject"
                placeholder="e.g. Mathematics"
                autoCapitalize="words"
              />
              <FormDateField
                control={control}
                name="examDate"
                label="Exam date"
                placeholder="Select exam date"
              />
              <View style={styles.marksRow}>
                <View style={styles.marksField}>
                  <FormTextField
                    control={control}
                    name="totalMarks"
                    label="Total marks"
                    placeholder="e.g. 100"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.marksField}>
                  <FormTextField
                    control={control}
                    name="obtainedMarks"
                    label="Obtained marks"
                    placeholder="e.g. 87"
                    keyboardType="number-pad"
                  />
                </View>
              </View>
              <FormTextField
                control={control}
                name="grade"
                label="Grade"
                placeholder="e.g. A"
                autoCapitalize="characters"
              />
              <FormTextField
                control={control}
                name="remarks"
                label="Remarks"
                placeholder="Any remarks"
                multiline
                numberOfLines={3}
                style={styles.multiline}
              />
            </Card>

            <Button
              title={isEditing ? 'Save changes' : 'Add exam'}
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
  marksRow: {
    flexDirection: 'row',
    gap: 12,
  },
  marksField: {
    flex: 1,
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
