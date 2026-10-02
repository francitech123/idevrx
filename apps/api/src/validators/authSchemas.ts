import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email().max(200).transform((s) => s.toLowerCase().trim()),
  username: z
    .string()
    .min(3)
    .max(32)
    .regex(/^[a-z0-9_]+$/i, 'Username can only contain letters, numbers, and underscores')
    .transform((s) => s.toLowerCase().trim()),
  displayName: z.string().min(1).max(64).trim(),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .max(200)
    .regex(/[a-z]/, 'Password must contain a lowercase letter')
    .regex(/[A-Z]/, 'Password must contain an uppercase letter')
    .regex(/[0-9]/, 'Password must contain a number'),
});

export const LoginSchema = z.object({
  email: z.string().email().transform((s) => s.toLowerCase().trim()),
  password: z.string().min(1).max(200),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
