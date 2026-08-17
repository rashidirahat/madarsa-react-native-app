import { z } from 'zod';

import {
  CLASS_OPTIONS,
  STUDY_PROGRESS_STATUSES,
  TEACHER_SUBJECTS,
} from '@/types/models';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name is too long'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password is too long'),
});

export type SignupValues = z.infer<typeof signupSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
});

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const studentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name is too long'),
  age: z
    .string()
    .min(1, 'Age is required')
    .regex(/^\d{1,3}$/, 'Age must be a whole number')
    .refine((value) => {
      const age = Number(value);
      return age >= 3 && age <= 100;
    }, 'Age must be between 3 and 100'),
  className: z.enum(CLASS_OPTIONS, { message: 'Select a class' }),
  studentType: z.enum(['day', 'hostel'], { message: 'Select a student type' }),
  gender: z.enum(['male', 'female'], { message: 'Select a gender' }),
  guardianName: z.string().min(1, 'Guardian name is required').max(120, 'Guardian name is too long'),
  address: z.string().min(1, 'Address is required').max(200, 'Address is too long'),
  phone: z
    .string()
    .min(1, 'Phone is required')
    .regex(/^[0-9+\-\s()]{7,15}$/, 'Enter a valid phone number'),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

export const fundSchema = z
  .object({
    amount: z
      .string()
      .min(1, 'Amount is required')
      .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount (e.g. 500 or 250.50)'),
    description: z.string().min(1, 'Description is required').max(200, 'Description is too long'),
  })
  .superRefine((data, ctx) => {
    const amount = Number(data.amount);
    if (amount <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['amount'],
        message: 'Amount must be greater than zero',
      });
    }
    if (amount > 100_000_000) {
      ctx.addIssue({
        code: 'custom',
        path: ['amount'],
        message: 'Amount is too large',
      });
    }
  });

export type FundFormValues = z.infer<typeof fundSchema>;

export const donationSchema = z
  .object({
    amount: z
      .string()
      .min(1, 'Amount is required')
      .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid amount (e.g. 500 or 250.50)'),
    category: z.enum(['zakat', 'sadaqah'], { message: 'Select a category' }),
    year: z
      .string()
      .min(1, 'Year is required')
      .regex(/^\d{4}$/, 'Enter a valid year (e.g. 2026)')
      .refine((value) => {
        const year = Number(value);
        return year >= 1900 && year <= 2100;
      }, 'Enter a year between 1900 and 2100'),
    description: z.string().min(1, 'Description is required').max(200, 'Description is too long'),
  })
  .superRefine((data, ctx) => {
    const amount = Number(data.amount);
    if (amount <= 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['amount'],
        message: 'Amount must be greater than zero',
      });
    }
    if (amount > 100_000_000) {
      ctx.addIssue({
        code: 'custom',
        path: ['amount'],
        message: 'Amount is too large',
      });
    }
  });

export type DonationFormValues = z.infer<typeof donationSchema>;

export const teacherSubjectSchema = z.object({
  subject: z.enum(TEACHER_SUBJECTS, { message: 'Select a subject' }),
  className: z.string().min(1, 'Class name is required').max(60, 'Class name is too long'),
});

export const teacherSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120, 'Name is too long'),
  address: z.string().min(1, 'Address is required').max(200, 'Address is too long'),
  qualification: z
    .string()
    .min(1, 'Qualification is required')
    .max(120, 'Qualification is too long'),
  specialization: z.enum(TEACHER_SUBJECTS, { message: 'Select a specialization' }),
  teachingExperience: z
    .string()
    .min(1, 'Teaching experience is required')
    .regex(/^\d{1,3}$/, 'Experience must be a whole number')
    .refine((value) => Number(value) > 0, 'Experience must be greater than zero'),
  gender: z.enum(['male', 'female', 'other'], { message: 'Select a gender' }),
  joiningDate: z
    .string()
    .regex(/^(?:\d{4}-\d{2}-\d{2})?$/, 'Enter a valid date (e.g. 2026-08-15)')
    .optional(),
  subjects: z.array(teacherSubjectSchema).min(1, 'Add at least one subject'),
});

export type TeacherFormValues = z.infer<typeof teacherSchema>;

export const examSchema = z
  .object({
    examName: z.string().min(1, 'Exam name is required').max(100, 'Exam name is too long'),
    subject: z.string().min(1, 'Subject is required').max(80, 'Subject is too long'),
    examDate: z
      .string()
      .min(1, 'Exam date is required')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date (e.g. 2025-03-15)'),
    totalMarks: z
      .string()
      .min(1, 'Total marks is required')
      .regex(/^\d{1,6}$/, 'Marks must be a whole number')
      .refine((value) => Number(value) > 0, 'Total marks must be greater than zero'),
    obtainedMarks: z
      .string()
      .min(1, 'Obtained marks is required')
      .regex(/^\d{1,6}$/, 'Marks must be a whole number'),
    grade: z
      .string()
      .max(10, 'Grade is too long')
      .optional()
      .or(z.literal('')),
    remarks: z
      .string()
      .max(300, 'Remarks are too long')
      .optional()
      .or(z.literal('')),
  })
  .superRefine((data, ctx) => {
    const total = Number(data.totalMarks);
    const obtained = Number(data.obtainedMarks);
    if (Number.isFinite(total) && Number.isFinite(obtained) && obtained > total) {
      ctx.addIssue({
        code: 'custom',
        path: ['obtainedMarks'],
        message: 'Obtained marks cannot exceed total marks',
      });
    }
  });

export type ExamFormValues = z.infer<typeof examSchema>;

export const studyProgressSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(80, 'Subject is too long'),
  topic: z.string().min(1, 'Topic is required').max(120, 'Topic is too long'),
  status: z.enum(STUDY_PROGRESS_STATUSES, { message: 'Select a status' }),
  progressPercentage: z
    .string()
    .min(1, 'Progress is required')
    .regex(/^\d{1,3}$/, 'Progress must be a whole number')
    .refine((value) => {
      const progress = Number(value);
      return progress >= 0 && progress <= 100;
    }, 'Progress must be between 0 and 100'),
  notes: z
    .string()
    .max(500, 'Notes are too long')
    .optional()
    .or(z.literal('')),
});

export type StudyProgressFormValues = z.infer<typeof studyProgressSchema>;
