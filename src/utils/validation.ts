import { z } from 'zod';

import { CLASS_OPTIONS, TEACHER_SUBJECTS } from '@/types/models';

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
