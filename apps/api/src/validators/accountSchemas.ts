import { z } from 'zod';

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .max(200)
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

export const RequestPasswordResetSchema = z.object({
  email: z.string().email().max(200).transform((s) => s.toLowerCase().trim()),
});

export const ConfirmPasswordResetSchema = z.object({
  token: z.string().min(1).max(500),
  newPassword: z
    .string()
    .min(10)
    .max(200)
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
});

export const RequestAccountDeletionSchema = z.object({
  reason: z.string().max(500).optional().default(''),
});
