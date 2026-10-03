import { z } from 'zod';

export const ApplySchema = z.object({
  motivation: z
    .string()
    .min(40, 'Please write at least 40 characters explaining why you want to be a Creator.')
    .max(2000)
    .trim(),
  experience: z.string().max(1000).trim().optional().default(''),
  portfolioUrl: z
    .string()
    .max(500)
    .trim()
    .optional()
    .default('')
    .refine(
      (v) => v === '' || /^https?:\/\/.+/.test(v),
      'Portfolio URL must start with http:// or https://'
    ),
});

export const ReviewSchema = z.object({
  decision: z.enum(['approved', 'denied']),
  note: z.string().max(1000).trim().optional().default(''),
});

export const ListApplicationsQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'denied', 'withdrawn']).optional(),
});

export type ApplyInput = z.infer<typeof ApplySchema>;
export type ReviewInput = z.infer<typeof ReviewSchema>;
